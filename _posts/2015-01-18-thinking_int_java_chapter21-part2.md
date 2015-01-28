---
layout: post
title: Java编程思想 - 第二十一章、并发
categories: Java
tags: Java编程思想
---

###21.3小节：共享资源如何处理呢？

这一小节其实也是基础知识，核心是处理**临界资源**，方法就是加锁。下面我们就简单说说。

####1. 一个使用临界资源的例子

现在有这样一个例子，简单的生产者——消费者模型，生产者生产数字，消费者检查数字（多个消费者），如何某个消费者发现数字不是偶数，那么全部消费者就停工。

看一下生产者的代码：

{% highlight java linenos %}
public abstract class IntGenerator {
	private volatile boolean canceled = false;

	public abstract int next();

	// Allow this to be canceled;
	public void cancel() {
		canceled = true;
	}

	public boolean isCanceled() {
		return canceled;
	}
}
{% endhighlight java %}

我们定义一个通用的生产者模型，后续可以有具体的实现。下面是一个实现：

{% highlight java linenos %}
public class EvenGenerator extends IntGenerator {
	
	private int currentEvenValue = 0;

	@Override
	public int next() {
		++currentEvenValue; //Danger point here!
		++currentEvenValue;
		return currentEvenValue;
	}
	
	public static void main(String[] args) {
		EvenChecker.test(new EvenGenerator());
	}

}
{% endhighlight java %}

其中的 EvenChecker 就是消费者了，下面是消费者的代码：

{% highlight java linenos %}
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class EvenChecker implements Runnable {
	private IntGenerator generator;
	private final int id;
	public EvenChecker(IntGenerator g, int ident) {
		generator = g;
		this.id = ident;
	}
	
	@Override
	public void run() {
		while(!generator.isCanceled()) {
			int val = generator.next();
			if(val % 2 != 0) {
				System.out.println(val + " not even!");
				generator.cancel(); // Cancels all EvenCheckers
			}
		}
	}
	
	public static void test(IntGenerator gp, int count) {
		System.out.println("Press Control-C to exit!");
		ExecutorService exec = Executors.newCachedThreadPool();
		for(int i = 0; i < count; i++) {
			exec.execute(new EvenChecker(gp, i));
		}
		exec.shutdown();
	}
	
	public static void test(IntGenerator gp) {
		test(gp, 10);
	}
}
{% endhighlight java %}

先整体看看代码，非常简单。一个生产者去生产数字（两次自加操作），N 个消费者（默认是10）去消费数字，发现非偶数就全部停工（通过 volatile 关键字）。

这个程序很快就会失败，因为 Java 的自加操作不是原子性的，所以如果一个线程在两次自加操作中间调用了 next()，那么就会产生非偶数了。那么，解决方案就是加锁。**基本上所有的并发模式在解决线程冲突问题的时候，都是采用序列化访问共享资源的方案。这意味着在给定时刻只允许一个任务访问共享资源。**通常这是通过在代码前面加上一条锁语句来实现的，这种机制就是所谓的*互斥量(mutex)*。

####2. 如何改进上面的例子？也就是如何使用锁机制？

首先定义一下临界资源和临界区：

* 临界资源：共享资源一般是以对象形式存在的内存片段，也可以是文件、输入/输出端口，或者是打印机之类的东西
* 临界区：有时，你只是希望**防止多个线程同时访问方法内部的内部代码而不是整个方法**，通过这种方式分离出来的代码段被称为临界区(critical section)，它也使用 synchronized 关键字建立。这里，synchronized 被用来指定**某个对象，此对象的锁被用来对花括号内的代码进行同步控制**。

方法有两个：

1. 使用 synchronized 关键字
2. 使用 Lock 类

这里提供了2个方法，那么我们就要给自己留一个疑问：

> 为什么提供两种？什么情况下使用第一种，什么情况下使用第二种？

#####1）synchronized 的使用

要控制对共享资源的访问，得包装成一个对象。然后把所有要访问这个资源的方法标记为 synchronized。一般做法是使用 private 修饰这个临界资源的对象。注意，**在使用并发时，将域设置为 private 是非常重要的，否则，synchronized 关键字就不能防止其他任务直接访问域，这样会产生冲突。**基本的使用原则是：

> 如果你正在写一个变量，它可能接下来将被另一个线程读取，或者正在读取一个上一次已经被另一个线程写过的变量，那么你必须使用同步，并且，读写线程都必须用相同的监视器锁同步。总之，每个访问临界资源的方法都必须被同步，否则它们就不会正确工作。

比如用 synchronized 改进上面的例子：

{% highlight java linenos %}
public class EvenGenerator extends IntGenerator {
	
	private int currentEvenValue = 0;

	@Override
	public synchronized int next() {
		++currentEvenValue; //Danger point here!
		++currentEvenValue;
		return currentEvenValue;
	}
	
	public static void main(String[] args) {
		EvenChecker.test(new EvenGenerator());
	}

}
{% endhighlight java %}

用法说完了，也需要大概了解一下 synchronized 的工作原理（更具体的实现可以参考《深入理解 Java 虚拟机》）：

1. synchronized 相当于一个标志，每个对象都有对象头，对象头中含有锁信息（也称为监视器）。每次使用某个对象的时候，会去检查是否被 synchronized 修饰，如果修饰了，就去看看当前的对象是否获取了锁，如果没有，就阻塞；如果获取了，就可以进行对应的逻辑。等执行完之后，就释放当前对象使用的锁。
2. 还有一个比较好玩的是对象头中的锁不是 boolean 类型的，意思就是锁可以计数（应该是整型）。一个获取当前对象的锁的方法，可以调用另一个 synchronized 的方法，这时锁计数就是2，以此类推。当锁的计数变为0时候，就该释放锁了。
3. 还有一点是，**针对每个类，也有一个锁（作为类的 Class 对象的一部分），所以 synchronized static 方法可以在类的范围内防止对 static 数据的并发访问。**

#####2) Lock 的使用

Java SE5的 java.util.concurrent 类库还包含有定义在 java.util.concurrent.locks 中的显式的互斥机制。Lock 对象必须显式的创建、锁定和释放。因此，它与 synchronized 提供的锁机制相比，代码缺少优雅性。但是对于有些场景，使用 Lock 会更加灵活。

使用 Lock 来改进上面的例子：

{% highlight java linenos %}
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class MutexEvenGenerator extends IntGenerator {
	private int currentValue = 0;
	private Lock lock = new ReentrantLock();
	
	public int next() {
		lock.lock();
		try {
			++currentValue;
			Thread.yield();
			++currentValue;
			return currentValue;
		} finally {
			lock.unlock();
		}
	}
	
	public static void main(String[] args) {
		EvenChecker.test(new MutexEvenGenerator());
	}
}
{% endhighlight java %}

Notice:

> return 语句必须在 try 子句中出现，以确保 unlock()不会过早发生，从而将数据暴露给第二个任务。


#####3） 总结一下吧：）

大体上，使用 synchronized 关键字时，需要写的代码量更少，并且用户错误出现的可能性也会降低，因此通常只有在解决特殊问题时，才使用显式的 Lock 对象。例如，用 synchronized 关键字不能尝试着获取锁且最终获取锁会失败，或者尝试着获取锁一段时间，然后放弃它，要实现这些，你必须使用 concurrent 类库：

{% highlight java linenos %}
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public class AttemptLocking {
	private ReentrantLock lock = new ReentrantLock();

	// 直接去获取锁，然后输出状态。
	public void untimed() {
		boolean captured = lock.tryLock();
		try {
			System.out.println("tryLock(): " + captured);
		} finally {
			if (captured) {
				lock.unlock();
			}
		}
	}

	//尝试获取2s，如果失败就返回。
	public void timed() {
		boolean captured = false;
		try {
			captured = lock.tryLock(2, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}

		try {
			System.out.println("tryLock(2, TimeUnit.SECONDS): " + captured);
		} finally {
			if (captured) {
				lock.unlock();
			}
		}
	}

	public static void main(String[] args) throws InterruptedException {
		final AttemptLocking al = new AttemptLocking();
		al.untimed();
		al.timed();

		new Thread() {
			{
				setDaemon(true);
			}

			public void run() {
				al.lock.lock();
				System.out.println("acquired");
			}
		}.start();
		TimeUnit.MILLISECONDS.sleep(1000);
		al.untimed();
		al.timed();
	}

}/*output:
tryLock(): true
tryLock(2, TimeUnit.SECONDS): true
acquired
tryLock(): false
tryLock(2, TimeUnit.SECONDS): false
*/
{% endhighlight java %}


结果很明显，没有被锁定的时候。tryLock1和2都可以获取锁，但是后面我们用一个后台线程去占有锁，这时如果使用 synchronized 就会一直阻塞，但是这里使用 Lock 的话，就可以尝试获取 N 秒，如果不能获取我就干别的事情。所以可以想到这个功能可以使用的场景：

{% highlight java linenos %}
while(true) {
	1. 首先使用boolean captured = lock.tryLock()，如果是 true 的话就走正常的逻辑
	2. 如果 false 的话，使用captured = lock.tryLock(2, TimeUnit.SECONDS)尝试获取锁，如果2秒内不断轮询并且获得了锁，就走正常的逻辑
	3. 如果超过2s还是不能获取，我就干点其他的事情。
} 
{% endhighlight java %}

显式的 Lock 对象在加锁和释放锁方面，相对于内建的 synchronized 锁来说，还赋予了你更细粒度的控制力。这对于实现专有同步结构是很有用的，例如用于遍历链接列表中的节点的节节传递的加锁机制（也称为锁耦合），这种遍历代码必须在释放当前节点的锁之前捕获下一个节点的锁。如果使用 synchronized 是做不到的。

####3. 原子性

这一节比较浅，大致的知识点如下所示，想要深入了解还是去看《深入理解 Java 虚拟机》，很好很强大：

* long 和 double 是2字节的，所以很多操作不具有原子性，会产生字撕裂
* volatile 的使用以及2种使用场景
* volatile 没有使用副本，而是直接作用于主内存。每个使用的线程都必须先从主内存刷新，所以不存在可视性问题
* Java SE5引入了 AtomicInteger、AtomicLong、AtomicReference 等原子类(应该强调的是，**Atomic 类被设计用来构建 java.util.concurrent 中的类，因此只有在特殊情况下才在自己的代码中使用它们，即便使用了也不能认为万无一失。通常依赖于锁会更安全**)。它们提供下面形式的跟新操作：
	> `boolean compareAndSet(expectedValue, updateValue);`

####4. 临界区

上面说过临界区的概念，简单举个例子：

{% highlight java linenos %}
synchronized(syncObject) {
	//This code can be accessd
	//by only one task at a time
}
{% endhighlight java %}

这也被称为*同步控制块*，在进入这段代码前，必须获得 syncObject 对象的锁，如果其他线程已经得到这个锁，那么就得等到锁释放以后，才能进入临界区。那么，问题来了：

> 为什么不是对整个方法进行同步，而是选择部分代码呢？这样有什么好处呢？

其实答案很简单，大概想一下就知道了。如果对方法使用 synchronized，那么这个对象只能被一个线程独占，而且这个方法可能只有1/10涉及到并发问题，在执行其他9/10的时候完全没有危险，但是其他线程就是没法并发执行，极大的限制了程序的性能。为了解决这点问题，就有了临界区。我们通过一个程序来看看临界区的优势：

{% highlight java linenos %}
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 定义一个坐标，重点在于 x 和 y 都有自加1操作.如果 x != y，会抛出一个自定义的运行时异常
 * @author niushuai
 *
 */
class Pair {
	private int x, y;

	public Pair(int x, int y) {
		this.x = x;
		this.y = y;
	}

	public Pair() {
		this(0, 0);
	}

	public int getX() {
		return x;
	}

	public int getY() {
		return y;
	}

	public void incrementX() {
		x++;
	}

	public void incrementY() {
		y++;
	}

	public String toString() {
		return "x: " + x + ", y: " + y;
	}

	/**
	 * 如果 x != y 则抛出异常
	 * @author niushuai
	 *
	 */
	public class PairValuesNotEqualException extends RuntimeException {
		/**
		 * 
		 */
		private static final long serialVersionUID = -7103813289682393079L;

		public PairValuesNotEqualException() {
			super("Pair values not equal: " + Pair.this);
		}
	}

	public void checkState() {
		if (x != y) {
			System.err.println("x != y");
			throw new PairValuesNotEqualException();
		}
	}
}

/**
 * 对 Pair 进行管理的模板方法，如何对非线程安全的 Pair 进行自增？
 * 是同步整个方法？还是同步临界区？——子类实现
 */
abstract class PairManager {
	//check x != y 的次数
	AtomicInteger checkCounter = new AtomicInteger(0);
	protected Pair p = new Pair();
	//synchronizedList 为线程安全，无论在同步块内还是同步块外都是线程安全的
	private List<Pair> storage = Collections
			.synchronizedList(new ArrayList<Pair>());

	public synchronized Pair getPair() {
		return new Pair(p.getX(), p.getY());
	}

	protected void store(Pair p) {
		storage.add(p);
		try {
			TimeUnit.MILLISECONDS.sleep(50);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	// 如何增长？synchronized 修饰方法 还是 synchronized 修饰临界区？
	public abstract void increment();
}

/**
 * synchronized 修饰整个方法
 * @author niushuai
 *
 */
class PairManager1 extends PairManager {
	public synchronized void increment() {
		p.incrementX();
		p.incrementY();
		store(getPair());
	}
}

/**
 * synchronized 修饰临界区
 * @author niushuai
 *
 */
class PairManager2 extends PairManager {
	public void increment() {
		Pair temp;
		synchronized (this) {
			p.incrementX();
			p.incrementY();
			temp = getPair();
		}
		store(temp);
	}
}

/** 
 * 任务类1，可以使用不同的 PairManager 对 Pair 进行自增操作
 * @author niushuai
 *
 */
class PairManipulator implements Runnable {
	private PairManager pm;

	public PairManipulator(PairManager pm) {
		this.pm = pm;
	}

	@Override
	public void run() {
		while (true) {
			pm.increment();
		}
	}

	public String toString() {
		return "Pair: " + pm.getPair() + " checkCounter = "
				+ pm.checkCounter.get();
	}
}

/** 
 * 任务类2，不断的去检测 Pair 中的 x == y 状态
 * @author niushuai
 *
 */
class PairChecker implements Runnable {
	private PairManager pm;

	public PairChecker(PairManager pm) {
		this.pm = pm;
	}

	@Override
	public void run() {
		while (true) {
			pm.checkCounter.incrementAndGet();
			pm.getPair().checkState();
		}
	}
}

public class CriticalSection {
	static void testApproaches(PairManager pman1, PairManager pman2) {
		ExecutorService exec = Executors.newCachedThreadPool();
		PairManipulator pm1 = new PairManipulator(pman1);
		PairManipulator pm2 = new PairManipulator(pman2);
		PairChecker pcheck1 = new PairChecker(pman1);
		PairChecker pcheck2 = new PairChecker(pman2);

		exec.execute(pm1);
		exec.execute(pm2);
		exec.execute(pcheck1);
		exec.execute(pcheck2);
		try {
			TimeUnit.MILLISECONDS.sleep(500);
		} catch (InterruptedException e) {
			System.out.println("Sleep interrupted");
		}
		System.out.println("pm1: " + pm1 + "\npm2: " + pm2);
		System.exit(0);
	}

	public static void main(String[] args) {
		PairManager pman1 = new PairManager1();
		PairManager pman2 = new PairManager2();

		testApproaches(pman1, pman2);
	}
}/*output:
pm1: Pair: x: 165, y: 165 checkCounter = 6
pm2: Pair: x: 166, y: 166 checkCounter = 370681186
*/
{% endhighlight java %}

这段代码略长一点点，但是很简单。总结来说就是两个线程跑自增操作，区别是一个用的同步整个方法，一个是同步临界区，然后又又两个线程去检查x 和 y 是否相等。那么，区别在哪里呢？

> 区别在于速度。如果同步整个方法，那么一个线程在该方法内部就独占这个方法的资源，无论这个方法中是否有线程安全的部分，而且实际上，非线程安全的代码往往远小于线程安全的代码。这样的话，这个线程在运行线程安全的代码时，其他代码也无法进入这个方法；而锁临界区就比较好一点（不是数量级的差别！），因为我只在非线程安全的地方加锁，那么在这个方法的其他地方就会有多个线程并发执行，这里的优点很容易想象，我就不多啰嗦了。

####5. 更进一步

上面把同步基本说完了，但是还有一个比较好玩的是：可以在其他对象上同步。什么意思呢？

> synchronized 块必须给定一个在其上进行同步的对象，并且最合理的方式是，使用其方法正在被调用的对象：`synchronized(this)`，这也是上面 PairManager2的做法，在这种方式中，如果获得了 synchronized 块上的锁，那么该对象其他的 synchronized 方法和临界区就不能被调用了。因此，如果在 this 上同步，临界区的效果就会直接缩小在同步的范围内部。而有时，**必须在另一个对象上同步，**但是这样做的话，就必须确保所有相关的任务都是在同一个对象上同步。下面有一个小例子：

{% highlight java linenos %}
class DualSynch {
	private Object syncObject = new Object();
	public synchronized void f() {
		for(int i = 0; i < 5; i++) {
			System.out.println("f()");
			Thread.yield();
		}
	}
	
	public void g() {
		synchronized(syncObject) {
			for(int i = 0; i < 5; i++) {
				System.out.println("g()");
				Thread.yield();
			}
		}
	}
}

public class SyncObject {
	public static void main(String[] args) {
		final DualSynch ds = new DualSynch();
		new Thread() {
			public void run() {
				ds.f();
			}
		}.start();
		ds.g();
	}
}/*output:
f()
g()
f()
f()
g()
f()
g()
f()
g()
g()
*/
{% endhighlight java %}

这个例子中，通过 Thread 创建了一个线程，这个线程会持续输出5次 f()才会停止，因为它是方法级别的，就是 this 级别的。那么其他 synchronized 方法或者 synchronized(this)临界区都无法同时运行。但是上面输出是同时的。因为我们用了另一个对象锁进行同步。这样就达到了同时运行的目的。但是也有一点需要注意：

> 所有和某个对象锁有关的任务，都必须使用同一个对象锁。不要两个和 A 锁有关的任务，一个使用 A 加锁，一个使用 B 加锁，那么肯定会出问题。

####6. 线程本地存储

虽然在《Java 编程思想》中仅仅占用了1页的篇幅，但是感觉很有用处。果然挖出了不少东西，于是单独写一篇文章分析 ThreadLocal 吧，详情请见[理解 ThreadLocal](../threadlocal)











