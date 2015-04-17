---
layout: post
title: Java编程思想 - 第二十一章、并发（三）
categories: Java
tags: Java编程思想
---

###21.4 如何优雅的关闭任务？

在任务运行中，不可避免会出现各种情况。那么，对应于任务的关闭，一般有两种方式：

1. 任务正常运行，正常关闭
2. 出现紧急情况，需要终止当前任务

这两种涵盖了所有的情况，正常关闭很简单，它完全是由程序员自己的代码逻辑控制；但是突然中断就比较麻烦，非常容易出错。所以本小节的重点会放在对第二种情况的讨论上，而第二种情况也可以概括一下要点：

1. 线程都有哪些状态呢？
	* 新建
	* 就绪
	* 阻塞
	* 死亡
2. 将任务从阻塞状态叫醒：中断机制
3. 先来说 IO 阻塞吧
4. 再来说 synchronized 锁阻塞吧
5. 检查中断

下面我们就来学习一下吧：）

###一、任务正常运行，正常关闭

我们先来看一个书中的例子：

> 现在有一个公园，它有5个入口。我现在需要统计一段时间内进入公园的人流量。如果是“单线程”做法，我关闭其他4个门，只允许从1个门进入，这个是最简单的但是也是最不人性化的。升级版本是“多线程”，我在每个门做人流统计，然后最后将所有人数加和即可。

下面用程序来模拟这个例子：

{% highlight java linenos %}
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

//所有入口的总人数
class Count {
	//count 会并发访问，所以 get/set 需要 synchronized 锁起来
	private int count = 0;
	private Random rand = new Random(47);

	//如果去掉 synchronized 那么其中的 temp 和 Thread.yield()会
	//大大增加 increment 失败的几率（也就是并发修改）
	public synchronized int increment() {
		int temp = count;
		if (rand.nextBoolean()) {
			Thread.yield();
		}
		return (count = ++temp);
	}

	public synchronized int value() {
		return count;
	}
}

//每个入口通过 number 各自统计通过当前门的人数
class Entrance implements Runnable {

	private static Count count = new Count();
	private static List<Entrance> entrances = new ArrayList<Entrance>();
	private int number = 0;
	private final int id;
	private static volatile boolean canceled = false;

	public static void cancel() {
		canceled = true;
	}

	public Entrance(int id) {
		this.id = id;
		entrances.add(this);
	}

	// run()的任务就是递增入口人数和总人数，验证 count 的总数是正确的。然后休眠100ms
	@Override
	public void run() {
		while (!canceled) {
			synchronized (this) {
				++number;
			}
			System.out.println(this + " Total: " + count.increment());
			try {
				TimeUnit.MILLISECONDS.sleep(100);
			} catch (InterruptedException e) {
				System.out.println("sleep interrupted");
			}
		}
		System.out.println("stopping " + this);
	}

	public synchronized int getValue() {
		return number;
	}

	public String toString() {
		return "Entrace " + id + ": " + getValue();
	}

	public static int getTotalCount() {
		return count.value();
	}

	public static int sumEntrances() {
		int sum = 0;
		for (Entrance entrance : entrances) {
			sum += entrance.getValue();
		}
		return sum;
	}
}

// 5个门，运行3s 后通过 exec.shutdown()发送 interrupt()中断
public class OrnametalGarden {
	public static void main(String[] args) throws InterruptedException {
		ExecutorService exec = Executors.newCachedThreadPool();
		for (int i = 0; i < 5; i++) {
			exec.execute(new Entrance(i));
		}
		TimeUnit.SECONDS.sleep(3);
		Entrance.cancel();
		exec.shutdown();
		//等待超时时间250ms 后返回 boolean 是否任务终结
		if (!exec.awaitTermination(250, TimeUnit.MILLISECONDS)) {
			System.out.println("some tasks were not terminated");
		}
		System.out.println("Total: " + Entrance.getTotalCount());
		System.out.println("Sum of Entrances: " + Entrance.sumEntrances());
	}
}
{% endhighlight java %}

例子很简单，我们用一个 Count 来统计最终所有入口的总人数。每个 Entrance 代表一个入口，通过 number 来统计当前入口的人流量。然后我们运行3s 钟之后将整个程序结束，使用的是 volatile 的 canceled 标志。这种方法很正常，在 run()中，累加了 number 和 count，然后休眠100ms 后回到 while()条件中检测 canceled 标志。但是，有的时候，我们需要更紧急的终止任务。


###二、出现紧急情况，需要终止当前任务

下面我们就来重点balabala 阻塞和中断机制吧。

####1. 线程都有哪些状态呢？

在刚才那个问题中，如果线程调用了 sleep()，那么它就处于阻塞状态。线程一共有如下几种状态：

* 新建：当线程被创建时，它只会短暂的处于这种状态。此时它分配了必须的系统资源，并执行了初始化。此刻线程已经有资格获取 CPU 时间了。之后就靠调度器来调度
* 就绪：调度器分配时间片了就可以运行，不分配时间片就**等待(不是阻塞！)**。
* 阻塞：线程能够运行，但是缺少某个条件。当线程处于阻塞状态，**调度器将忽略该线程，不会分配时间片，直到线程重新进入就绪状态**
* 死亡：处于死亡状态的线程是不能再被调度的，并且再也不会得到时间片

那么，通常情况下，线程都会经历新建 - 就绪 - 运行 - 结束的过程，如果有依赖或者外在因素，可能会经历新建 - loop(就绪 - 运行 - 阻塞) - 结束的过程。那么，值得思考的只有一个点：什么情况下线程才会进入阻塞状态呢？

* 调用了 sleep()方法使任务进入休眠状态
* 调用了 wait()使线程挂起，直到线程得到了 notify()或者 notifyAll()消息（或者在 Java SE5中的 java.lang.util.concurrent 类库中等价的 signal()或 signalAll()消息），线程才会进入就绪状态
* 任务等待某个输入/输出
* 任务视图在某个对象上调用其他同步控制方法，但是对象锁不可用，因为另一个任务已经获取了这个锁

好了，通过上面的讲解。我们知道，有时希望能中终止处于阻塞状态的任务。什么意思呢？比如公园统计人流量的例子中，run()不是休眠100ms，而是100分钟，但是我现在想立即终止所有的统计任务。这怎么办？因为对处于阻塞状态的任务，你**不能等待其到达代码中可以检查其状态值的某一点，进而决定让它主动终止，那么唯一的做法就是强制这个任务跳出阻塞状态。**

####2. 将任务从阻塞状态叫醒：中断机制

这个概念大家都非常理解，同时对它的棘手性也都感同身受：

> 早上10点上班，我8点就醒了，一看时间还早，就赖了一会床，8点半起来了，简单洗漱后享用了一顿美味的早餐。9点20出门上班，到公司9点50。啊，惬意的早餐。第二天早上，正在睡梦中的我被闹钟吵醒，拿起闹钟一看，卧槽！！！！9点半了！！！！！火速起床，脸也不洗了，饭也不吃了，提起裤子就跑。到公司门口才发现，工卡没带！！！oh，糟糕的一天啊~~

很形象的例子，其实中断机制也同样麻烦。因为在 Runnable.run()方法的中间打断它，可能需要清理资源（工卡）。因为这一点，Java 的中断机制更像是抛出了异常，因此在 Java 线程中的这种类型的异常中断中用到了异常（这会滑向对异常的不恰当使用，因为这意味着你需要用异常来控制正常的代码逻辑）。为了在阻塞中终止任务，返回一个良好的状态，就必须仔细考虑 catch 子句以正确的清理所有事物。

那么，用代码来完成就用到了 Thread 类的 interrupt 相关函数：

* interrupted()
* interrupt()
* isInterrupted()

我们注意到，新的 concurrent 类库似乎在避免对 Thread 对象的直接操作，转而尽量通过 Executor 来执行所有操作。但是，本质来说，只是 concurrent 的 Executor 帮我们调用了这3个函数，所以还是要学习一下，直接去看文档即可。我简单总结一下这3个方法吧【自己看完文档、总结后再来看我的总结，不然直接看我的总结你还是立马就忘】：

* interrupt()——中断一个线程。如果当前线程处于阻塞中（比如调用了 wait()、sleep()、join()等）那么线程中断状态会被清除，并且抛出一个`InterruptedException`。对于可中断的 I/O 操作也会清除中断状态，抛出一个 ClosedByInterruptedException（还记得前面说过，I/O 是不能中断的吗？注意这里针对的是可中断的 I/O 操作，所以就是后来又提到的 NIO，NIO 可以被中断）。这个是为了替换 Thread.stop()，虽然 stop 已经废弃，但是我们也应该了解 stop 被废弃是因为它中断线程太暴力，like a assault rifle（像一把来福枪的袭击）.这就会导致非原子操作会被直接干掉，很容易出问题。
* interrupted()——是一个 static 方法。（被吐槽无数次了，因为命名不规范，导致有很多人用错。）检查线程的中断状态(Thread.status)，但是**会清除线程的中断状态**，如果你连续调用2次，就会返回 false（当然，是在第一次和第二次之间没有新的 interrupt 的情况下）
* isInterrupted()——仅仅检查线程的中断状态，不会清除线程的中断状态
* 在文档中有个 `alive`的词让我很困惑：A thread interruption ignored because a thread was not alive at the time of the interrupt will be reflected by this method returning false.在 stackoverflow 上找到了答案：[When is a Java thread alive?](http://stackoverflow.com/questions/17293304/when-is-a-java-thread-alive)。意思是线程正在运行 run()方法 is still ongoing.

那么，我们再来看 Executor 是如何帮助我们的：

* 调用 shutdownNow()将发送一个 interrupt()调用给它启动的所有线程
* 如果只想中断特定的任务，就要使用 submit()方法而不是 execute()来启动任务，前面说过 Runnable 的 run 是 void 的，而 Callable 的 run 会返回一个 Future<?>。也就是说通过 submit（）调用会持有任务的上下文。因为这里仅仅是为了调用 cancel()而不会调用 get()，所以可以用来中断任务。做法就是讲 true 传递给 cancel()

下面我们就通过使用 ExecutorService 来试试中断是如何工作的：

{% highlight java linenos %}
package concurrency;

import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

// Sleep()阻塞
class SleepBlocked implements Runnable {
	@Override
	public void run() {
		try {
			TimeUnit.SECONDS.sleep(100);
		} catch(InterruptedException e) {
			System.out.println("InterruptedException!");
		}
		System.out.println("Exiting SleepBlocked.run()\n");
	}
}

// IO阻塞
class IOBlocked implements Runnable {
	private InputStream in;
	public IOBlocked(InputStream in) {
		this.in = in;
	}
	@Override
	public void run() {
		try {
			System.out.println("Waiting for read():");
			in.read();
		} catch(IOException e) {
			if(Thread.currentThread().isInterrupted()) {
				System.out.println("Interrupted from blocked I/O");
			} else {
				throw new RuntimeException(e);
			}
		}
		System.out.println("Exiting IOBlocked.run()\n");
	}
}

// 同步锁阻塞
class SynchronizedBlocked implements Runnable {
	public synchronized void f() {
		while(true) {
			Thread.yield();
		}
	}
	
	//启动的时候，new 一个线程去抢占锁。
	public SynchronizedBlocked() {
		new Thread() {
			public void run() {
				f();
			}
		}.start();
	}
	@Override
	public void run() {
		System.out.println("Trying to call f()");
		f();
		System.out.println("Exiting SynchronizedBlocked.run()\n");
	}
}

public class Interrupting {
	private static ExecutorService exec = Executors.newCachedThreadPool();
	
	//送出中断
	static void test(Runnable r) throws InterruptedException {
		Future<?> f = exec.submit(r);
		TimeUnit.MILLISECONDS.sleep(100);
		System.out.println("Interrupting " + r.getClass().getName());
		f.cancel(true);
		System.out.println("Interrupt sent to " + r.getClass().getName());
	}
	
	//分别对三中阻塞送出一记漂亮的中断
	public static void main(String[] args) throws InterruptedException {
		test(new SleepBlocked());
		test(new IOBlocked(System.in));
		test(new SynchronizedBlocked());
		TimeUnit.SECONDS.sleep(3);
		System.out.println("Abortin with System.exit(0)");
		System.exit(0);
	}
}/*output:
Interrupting concurrency.SleepBlocked
Interrupt sent to concurrency.SleepBlocked
InterruptedException!
Exiting SleepBlocked.run()

Waiting for read():
Interrupting concurrency.IOBlocked
Interrupt sent to concurrency.IOBlocked
Trying to call f()
Interrupting concurrency.SynchronizedBlocked
Interrupt sent to concurrency.SynchronizedBlocked
Abortin with System.exit(0)
*/
{% endhighlight java %}

从结果我们可以看到，sleep 是可以被中断的，但是 IO 和 Synchronized 却不能被中断。所以结论是：

* 能够中断对 sleep()的调用（或者任何要求抛出 InterruptedException 的调用）
* 不能中断正在试图获取 Synchronized 锁的线程
* 不能中断正在试图执行 I/O 操作的线程

####3. 先来说 IO 阻塞吧

后两点都比较让人不爽，特别是 I/O，本来硬盘 IO 就慢的要死，阻塞时候还不能中断。这意味着 I/O 具有锁住多线程程序的可能。如果你的程序需要 Low latency，就要特别小心 IO 操作。但幸运的是，各种 NIO（new IO）库提供了更人性化的 IO 中断。被阻塞的 NIO 通道会自动地响应中断，比如：


{% highlight java linenos %}
package concurrency;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousCloseException;
import java.nio.channels.ClosedByInterruptException;
import java.nio.channels.SocketChannel;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

class NIOBlocked implements Runnable {
	private final SocketChannel sc;

	public NIOBlocked(SocketChannel sc) {
		this.sc = sc;
	}

	@Override
	public void run() {
		try {
			System.out.println("Waiting for read() in " + this);
			sc.read(ByteBuffer.allocate(1));
		} catch (ClosedByInterruptException e) {
			System.out.println("ClosedByInterruptException");
		} catch (AsynchronousCloseException e) {
			System.out.println("AsynchronousCloseException");
		} catch (IOException e) {
			System.out.println("IOException");
		}
		System.out.println("Exiting NIOBloked.run() " + this);
	}
}

public class NIOinterruption {
	public static void main(String[] args) throws IOException, InterruptedException {
		ExecutorService exec = Executors.newCachedThreadPool();
		//启动一个 Server
		ServerSocket server = new ServerSocket(8080);
		InetSocketAddress isa = new InetSocketAddress("localhost", 8080);
		SocketChannel sc1 = SocketChannel.open(isa);
		SocketChannel sc2 = SocketChannel.open(isa);
		Future<?> f = exec.submit(new NIOBlocked(sc1));
		exec.execute(new NIOBlocked(sc2));
		exec.shutdown();
		TimeUnit.SECONDS.sleep(1);
		f.cancel(true);
		TimeUnit.SECONDS.sleep(1);
		sc2.close();
	}
}/*output:
Waiting for read() in concurrency.NIOBlocked@352fd300
Waiting for read() in concurrency.NIOBlocked@60fe2295
ClosedByInterruptException
Exiting NIOBloked.run() concurrency.NIOBlocked@352fd300
AsynchronousCloseException
Exiting NIOBloked.run() concurrency.NIOBlocked@60fe2295
*/
{% endhighlight java %}

我们可以看到，IO 阻塞竟然被关闭了！NIO 好屌……

####4. 再来说 synchronized 锁阻塞吧

首先我们知道，如果获取了对象锁，那么就可以无限次的进入这个对象的其他 synchronized 方法，因为锁不是 boolean 而是整型的（前面说过了呦）。所以无论在任何时刻，只要任务以不可中断的方式被阻塞，那么都有潜在的会锁住程序的可能。但是，幸运的是，Java SE5的 concurrent 类库中添加了一个特性，即在 ReentrantLock上阻塞的任务具备可以被中断的能力，这与在 synchronized 方法或临界区上阻塞的任务完全不同：

{% highlight java linenos %}
package concurrency;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

class BlockedMutex {
	//使用的是重入锁，前面可是说过哦。可以尝试获取锁(时间也可设置)
	private Lock lock = new ReentrantLock();
	public BlockedMutex() {
		lock.lock();
	}
	
	// 但是调用 lock.lockInterruptilby()就可以被中断，抛出 InterruptedException
	// 前面说过，凡是抛出 InterruptedException 的都可以从阻塞状态中断
	public void f() {
		try {
			lock.lockInterruptibly();
			System.out.println("lock acquired in f()");
		} catch(InterruptedException e) {
			System.out.println("Interrupted from lock acquisition in f()");
		}
	}
}

//首先new BlockedMutex()的时候就锁住了 blocked。而且永远不释放，那么 f()就会一直阻塞
class Blocked2 implements Runnable {
	BlockedMutex blocked = new BlockedMutex();
	public void run() {
		System.out.println("Waiting for f() in BlockedMutex()");
		blocked.f();
		System.out.println("Broken out of blocked call");
	}
}

public class Interrupting2 {
	public static void main(String[] args) throws InterruptedException {
		Thread t = new Thread(new Blocked2());
		t.start();
		TimeUnit.SECONDS.sleep(1);
		System.out.println("Issuing t.interrupt()");
		t.interrupt();
	}
}/*output:
Waiting for f() in BlockedMutex()
Issuing t.interrupt()
Interrupted from lock acquisition in f()
Broken out of blocked call
*/
{% endhighlight java %}

上面关于 IO 和 Synchronized 的例子只是最最简单的使用，其实这里我们只需要知道 IO 和 Synchronized 阻塞状态不可中断，但是通过使用新的技术，如 NIO 和 concurrent 提供的 ReentrantLock 就可以解决这个问题。所以，以后遇到阻塞和中断的问题，就可以知道大概的解决思路啦。

####5. 检查中断

这一小节看了3、4遍才算豁然开朗，真的是书读百遍，其义自现啊。下面就是书中很经典的例子：

{% highlight java linenos %}
package concurrency;

import java.util.concurrent.TimeUnit;

class NeedsCleanup {
	private final int id;

	public NeedsCleanup(int ident) {
		id = ident;
		System.out.println("NeedsCleanup " + id);
	}

	public void cleanup() {
		System.out.println("Cleaning up " + id);
	}
}

// 模拟一个计算密集型的任务
class Blocked3 implements Runnable {
	private volatile double d = 0.0;

	public void run() {
		try {
			while (!Thread.interrupted()) {
				// Point1 在需要清理的资源后，需要立即跟上 try-catch-finally
				NeedsCleanup n1 = new NeedsCleanup(1);
				try {
					System.out.println("Sleeping");
					TimeUnit.SECONDS.sleep(1);

					// Point2 同上
					NeedsCleanup n2 = new NeedsCleanup(2);
					try {
						System.out.println("Calculating");
						for (int i = 1; i < 2500000; i++) {
							d = d + (Math.PI + Math.E) / d;
						}
						System.out.println("Finished time-consuming operation");
					} finally {
						n2.cleanup();
					}
				} finally {
					n1.cleanup();
				}
			}
			System.out.println("Exiting via while() test");
		} catch (InterruptedException e) {
			System.out.println("Exiting via InterruptedException");
		}
	}
}

// 通过传入不同的时间，来让 interrupt 发生在 Point1和 Point2的前后
// 当在 P1和 P2之间传入中断，会在 while 循环结束后达到 while 条件退出
// 当在 P1前面调用，会在视图调用阻塞(sleep()操作)或者在阻塞中(正在 sleep())通过 InterruptedException 退出阻塞
// 那么，紧接着 n1和n2的 try-catch-finally 就会正确的清理资源
public class IntererptingIdiom {
	public static void main(String[] args) throws NumberFormatException,
			InterruptedException {
		if (args.length != 1) {
			System.out.println("Usage: java InterruptingIdiom delay-in-mS");
			System.exit(1);
		}
		Thread t = new Thread(new Blocked3());
		t.start();
		TimeUnit.MILLISECONDS.sleep(new Integer(args[0]));
		t.interrupt();
	}
}
{% endhighlight java %}

这个例子设计很简单，一个是阻塞的sleep()操作，一个是非阻塞的运算操作。我们在两个阶段中传入中断状态时，sleep()会通过 InterruptedException 从阻塞中中断，而运算操作只能在 while()条件检测中断后才能中断。NeedCleanup 类强调在由异常离开循环时，正确清理资源的必要性。

这个程序需要传入一个时间，然后在run()的不同运行点传入中断。多次试验后可以看到：

* 如果 interrupt(）在 P2后面调用，那么首先循环肯定要运行完，然后所有的本地对象将被销毁，最后循环会经由 while语句的顶部退出；
* 如果 interrupt()在 P1和 P2之间调用（while 之后，但是在阻塞操作 sleep()之前或者其过程中）被调用，那么这个任务就会在第一次视图调用阻塞操作之前，经由 InterruptedException退出。这种情况下，唯一创建出来的 n1会被紧跟其后的 try-catch-finally及时清理

根据上面的思路，我们可以得出一个结论：

> 被设计用来响应 interrput()的类必须建立一种策略，来确保它将保持一致的状态。这通常意味着所有需要清理的对象创建操作的后面，都必须紧跟 try-catch-finally子句，从而使得无论 run()循环如何退出，清理都会发生。【然后作者吐槽，要是 Java 有析构函数就好了。。。。析构操作直接在类中写，不用和业务代码耦合了】