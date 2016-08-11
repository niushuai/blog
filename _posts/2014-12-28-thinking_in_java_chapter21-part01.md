---
layout: post
title: Java编程思想 - 第二十一章、并发（一）
categories: Java
tags: Java编程思想
---

### 21.1小节：为什么要学习并发？

总结起来就是两点：

* 速度
* 设计可管理性

速度非常容易理解，我举个例子就可以说明问题：

> 现在你是《仙剑奇侠传》的主程，用户打开游戏时，需要渲染一副非常美丽的场景：花、草、鸟、光、天空、人物等等，这些物体在程序中都是独立的数据结构（本质就是不同的像素点集合）。你需要按照一定的顺序将它们渲染出来（比如先渲染人物、然后是大地、然后是花花草草、然后是天空、然后是光线等等）。你会如何初始化？

如果让一个初学者回答，他可能会按照物体在游戏中的重要程度渲染，而这个想法就是**顺序编程**的思维。那么，问题来了：挖掘机技术……噗，跑偏了：）假如每个物体的渲染速度都为10ms，刚才那些元素总和为1000个。那么，等用户可以看到完整的效果就需要10s，10s是什么概念？想想你平时打开网页，如果超过5s还没有内容，你是不是就等不及然后关闭了？所以10s简直就是不可理喻。

**而这就是并发要解决的第一个问题：速度，或者称为性能**

现在一个高手来了，它先在线下（离线）将这1000个元素按照重要程度排序，然后“同时”去完成 N（假如为10）个元素的渲染。那么，看到完整的效果就需要1s。为什么可以这样做呢？因为现在机器无论是 Server 端还是 Client 端，都会有2-8核的处理器，只要我们充分压榨，就能让程序跑的更快。**当然，这个例子仅仅是为了说明问题，而且它有个重要特征就是每个元素都是独立的。如果它们之间有关联，情况就会更复杂，后面我们再讨论。**

速度问题说过了，但如果在单处理器上，顺序编程和并发编程孰优孰劣？如果有一定的计算机知识，可能会认为是顺序编程，因为并发编程存在一个“上下文切换”的问题，这里的性能损耗可能会很大。但使这个问题不同的是**阻塞**，如果程序中的某个任务因为该程序控制范围之外的某个条件（通常是 I/O）而导致不能继续运行，那么我们就说这个线程阻塞了。**事实上，从性能的角度看，如果没有任务会阻塞，那么在单处理机器上使用并发就没有任何意义。**

这里说的是理想情况，各个任务相互独立，但如果任务之间存在通信、依赖，那情况将会变得无比复杂。这时候呢，出现了函数型语言，其中每个函数调用都不会产生任何副作用（并因此而不能干涉其他函数），可以当成独立的任务来驱动，也就是说，它们并发的时候就是完全独立无影响的。这就达到了最理想的状态，比如 Erlang，Haskell，它们包含针对任务之间彼此通信的安全机制。如果你的程序需要大量使用并发，那就可以考虑使用这些并发语言来开发【听说渣打用的是 Haskell，淘宝的余锋精通 Erlang】。

然后再说下设计可管理性。那么，什么是设计可管理性呢？仔细看了21.1.2小节，但是讲的比较晦涩，我尝试着说下自己的看法吧。

设计可管理性就是改进代码设计。比如广泛使用的push系统，一个 server，多个 client。如果你不使用并发，先给 client1发送消息，然后 client2……直至clientN。 这样效率就非常低，因为你需要自己指定 client 的顺序是从1到 N。但实际上client 是完全相同的，不需要区分对待（决定发送顺序）；如果使用并发，就可以拿到所有的 client 不做区分的跑在所有线程上，这就极大的改善了代码结构。如果你还需要线程协作（比如 wait（）和 notify()），一定会理解的更加深刻。

### 21.2小节：并发的最基本使用

上面解答了并发的好处，那么接下来就要讲讲如何使用并发。而第21.2小节其实就是讲解线程的基本使用。show time...

#### 1. 定义任务

线程是用来干活的，那么你需要跟线程说“线程，你把这些活做完。”描述线程需要做什么活儿的过程，就是定义任务。**这可以由实现 Runnable 或者 Callable 接口的 run()方法**来实现。

这里有必要先说明一下**任务和线程的概念**：

**任务和线程是各自独立的。**我们实现了 Runnable 接口的 run（）方法，这只是定义任务，和线程没有任何关系。**要实现线程行为，必须显式地将一个任务附着到线程上。**具体的区别请学习21.2.10小节，P669页。下面是我对21.2.10小节的总结：

> 任务就是描述这个工作怎样做才能完成，而线程相当于一个工人，它只负责执行交给他的任务。从宏观上看，任务是我们占主导的，而线程则是一个黑盒，我们只能把任务提交，至于他怎么干活我们是不知道的，因为这是 Java 帮助我们在硬件上实现的。**所以，在描述如何执行工作时，我们使用术语——任务；在引用到驱动任务的具体机制时，才使用术语——线程。**在99.9%的情况下，我们根本就不需要提到线程，因为 Executor 就可以帮我们管理一切线程工作，我们只需要关注如何描述任务即可。

下面是例子：

{% highlight java linenos %}
public class LiftOff implements Runnable { // 实现 Runnable 接口
  
  protected int countDown = 10; //Default
  private static int taskCount = 0;
  private final int id = taskCount++;

  public LiftOff() {}

  public LiftOff(int countDown) {
this.countDown = countDown;
  }

  public String status() {
return "#Thread id: " + id + ", time: " + (countDown \> 0 ? countDown : "Liftoff!");
  }
  
  @Override
  public void run() { // 定义需要做的任务
while(countDown-- \> 0) {
System.out.println(status());
Thread.yield();
}
  }
}
{% endhighlight java %}

Tips：

> `Thread.yield()`需要解释一下，它是对**线程调度器**（Java 线程机制的一部分，可以将 CPU 从一个线程转移到另一个线程）的一种建议，它在声明：”我已经执行完生命周期中最重要的部分了，此刻可以切换给别的任务，让它们执行吧。”**这仅仅是一种建议，线程调度器不一定会执行（还记得吗，finalize() 方法也不保证一定执行，原因忘了的可以再去翻翻）**
> 
> 因为 Java 的线程机制底层实现是基于 C 语言的低级 p 线程方式（pthread 和 fork），所以最好去学习一下 pthread 的相关知识。

#### 2. Thread 类

将 Runnable 定义的任务依附到线程的一般做法是把它提交给一个 Thread 构造器。下面是例子：

{% highlight java linenos %}
public class BasicThreads {
  public static void main(String[] args) {
Thread thread = new Thread(new LiftOff());
thread.start();
System.out.println("Waiting for LiftOff");
  }
}
{% endhighlight java %}

Thread 构造器只需要一个 Runnable 对象。调用 start()方法为该线程执行必需的初始化操作，然后调用 Runnable 接口的 run()方法，以便在这个新线程中启动该任务。注意执行结果，在 start()方法执行时，虽然调用了 run()方法，但是 start()迅速返回了（先输出了 Waiting for LiftOff），这是因为：main()方法本身就是一个线程，LiftOff.run()是系统新建的另外一个线程，所以两个线程是同时执行的，互不影响。

#### 3. 使用 Executor 管理 Thread

java.util.concurrent 中的执行器（Executor）将为你管理 Thread 对象，从而简化了并发编程。什么意思呢？

> 本来任务需要提交给 Thread 才能执行，但是任务比较多的情况下，就需要对每个任务 new 一个 Thread 去执行，Thread 很多的话不容易进行统一的管理。比如有100个 thread，我就需要手动 new 100个 Thread，太不优雅。基于这种情况，Java 提供了 concurrent 包中的 Executor。它其实就是任务和运行线程的客户端的一个中介。因为它管理了 Thread 对象，所以即使有多个任务，都可以统一由 Executor 来管理相应的 Thread 对象。**非常常见的情况是，单个的 Executor 被用来创建和管理系统中所有的任务。**

下面举个例子来说明吧。在完全使用 Thread 的时候：

{% highlight java linenos %}
public class MoreBasicThreads {
public static void main(String[] args) {
for(int i = 0; i \< 5; i++) {
new Thread(new LiftOff()).start();
}
System.out.println("Waiting for LiftOff");
}
}
{% endhighlight java %}

如果现在出现意外状况，需要把线程全部关闭。那么你必须对5个 Thread 对象进行操作。推而广之，越多的任务会带来更高的后续代价。但是我们尝试用 Executor 来完成同样的工作：

{% highlight java linenos %}
public class CachedThreadPool {
public static void main(String[] args) {
ExecutorService exec = Executors.newCachedThreadPool();
for(int i = 0; i \< 5; i++) {
exec.execute(new LiftOff());
}
exec.shutdown();
}
}
{% endhighlight java %}

我们可以看到，我们拿到一个 ExecutorService 来管理所有的 Thread 对象，在执行完所有的任务后，只需要调用一个 shutdown()即可关闭所有管理的 Thread 对象，非常优雅。

总结一下，Executor 管理的 Thread 中，常见的类型有：

* CachedThreadPool：创建与所需数量相同的线程，然后在它回收旧线程时停止创建新线程，做到线程复用
* FixedThreadPool：固定数量的线程池，创建时需要一定时间去初始化。后续不需要付出创建线程的代价
* SingleThreadPool：FixedThreadPool 的特例，就是数量为1的 FixedThreadPoll，但是也有特殊之处（它提供了一种重要的并发保证，其他线程不会被并发调用，这会改变任务的加锁需求）

#### 4. 任务有返回值？Callable 接口来帮忙！

从标题我们就掌握了这一个小节，因为 Runnable 需要重写的 run()方法返回值是 void，所以有返回值的情况，使用 Callable 接口的 call()即可。有2点需要注意：

* call()返回值的类型参数是泛型
* 使用 ExecutorService 管理的话，需要通过 submit()方法调用（而run()是使用execute()方法）

一个例子：

{% highlight java linenos %}
import java.util.ArrayList;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

class TaskWithResult implements Callable\<String\> {

  private int id;

  public TaskWithResult(int id) {
  this.id = id;
  }

  @Override
  public String call() {
  return "result of TaskWithResult: " + id;
  }
}

public class CallableDemo {
  public static void main(String[] args) {
ExecutorService exec = Executors.newCachedThreadPool();
ArrayList\<Future\<String\>\> result = new ArrayList\<Future\<String\>\>();
for (int i = 0; i \< 10; i++) {
result.add(exec.submit(new TaskWithResult(i)));
}

for(Future\<String\> fs : result) {
try {
System.out.println(fs.get());
} catch (InterruptedException | ExecutionException e) {
// TODO Auto-generated catch block
e.printStackTrace();
} finally {
exec.shutdown();
}
}
  }
}/\*output:
result of TaskWithResult: 0
result of TaskWithResult: 1
result of TaskWithResult: 2
result of TaskWithResult: 3
result of TaskWithResult: 4
result of TaskWithResult: 5
result of TaskWithResult: 6
result of TaskWithResult: 7
result of TaskWithResult: 8
result of TaskWithResult: 9
\*/
{% endhighlight java %}

这段代码非常好懂，但是可能多了个 Future 对象，我来解释一下。

> ExecutorService.submit()方法会返回 Future 对象，它用 Callable 返回结果的特定类型进行了参数化。可以用 isDone()来查询 Future 是否完成——当任务完成时，它具有一个结果，可以调用 get()方法来获取该结果;如果不使用 isDone()而是直接用 get()去拿结果，那么**在结果没有返回的这段时间内，get()将阻塞，直至结果返回**。通常情况下，可以使用 isDone()或者具有超时时间的 get()来查询该任务是否完成，谨慎使用会造成阻塞的 get()哦\~

#### 5. 线程干活累了，想睡会

这个直接上例子：

{% highlight java linenos %}
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class SleepingTask extends LiftOff {
  @Override
  public void run() {
  try {
while(countDown-- \> 0) {
  System.out.println(status());
  // Old-style:
  // Thread.sleep(100);
  // Java SE5/6-style:
  TimeUnit.MILLISECONDS.sleep(100);
}
  } catch(InterruptedException e) {
System.err.println("Interrupted");
  }
  }
  
  public static void main(String[] args) {
  ExecutorService exec = Executors.newCachedThreadPool();
  for(int i = 0; i \< 5; i++) {
exec.execute(new SleepingTask());
  }
  System.out.println("Waiting For LiftOff");
  exec.shutdown();
  }
}
{% endhighlight java %}

这里需要注意的有两点：

* 对 sleep()的调用可能抛出 InterruptedException 异常（很容易想象，你在睡觉的时候也会被闹钟打断。这里是调用 Thread.interrupt()），并且你可以看到，它在 run()中被捕获。**因为异常不能跨线程传播，所以这里抛出的异常是不能被 main 线程捕获的。线程之间只共享指定的临界资源，像异常处理都是线程私有的，所以你必须在本地处理所有在任务内部产生的异常，谨记。**
* sleep() VS TimeUnit.MILLISECONDS.sleep()。具体可以参照文档，但是更推荐直接看源码。源码其实也非常简单，但是为什么这样做？值得我们去思考，尤其推荐结合枚举那一章来学习 TimeUnit 源码，味道极佳：）

#### 6. 让步

前面有个地方提到了`Thread.yield()`，这里具体说明一下这个方法的使用场景和需要注意的地方。

> 如果知道已经完成了在 run()方法的循环中的一次迭代过程中所需的工作，就可以给线程调度机制一个暗示：我的工作已经差不多了，可以让别的线程使用 CPU 了。这个暗示将通过调用 yield()方法来作出（不过这只是一个提示，没有任何机制保证它将会被采纳）。当调用 yield()时，其实是在建议线程调度器去调度具有相同优先级的其他线程工作。
> 
> **但是大体上，对于任何重要的控制或在调整应用时，都不能依赖 yield()。实际上，yied()经常被误用。所以使用的时候一定要非常谨慎！**

#### 7. 后台线程

这个作者在总结中明确指出“后台线程几乎不是一种好的思想，非后台的 Executor 通常是一种更好的方式，因为 Executor 控制的所有任务可以同时被管理”。顾名思义，后台线程就是在后台运行的。类似 shell 的 `&`，更严谨的定义是这样的：

> 后台线程是指在程序运行的时候在后台提供一种通用服务的线程，**并且这种线程并不属于程序中不可或缺的部分（意思是非必要，比如在项目中定时打印线程池的使用状况）**。因此，当所有的非后台线程结束时，程序也就终止了，同时会杀死进程中的所有后台线程。所以，**只要有任何非后台线程还在运行，程序就不会终止。main()就是一个非后台线程。**

设置后台线程有一个注意点：必须在 start()之前设定。下面是一个例子：

{% highlight java linenos %}
import java.util.concurrent.TimeUnit;

public class SimpleDaemons implements Runnable {
  @Override
  public void run() {
  try {
while (true) {
  TimeUnit.MILLISECONDS.sleep(100);
  System.out.println(Thread.currentThread() + " " + this);
}
  } catch (InterruptedException e) {
System.out.println("sleep() interrupted");
e.printStackTrace();
  }
  }
  
  public static void main(String[] args) throws InterruptedException {
  for(int i = 0; i \< 10; i++) {
Thread daemon = new Thread(new SimpleDaemons());
daemon.setDaemon(true); // Must call before start();
daemon.start();
  }
  System.out.println("All daemons started");
  TimeUnit.MILLISECONDS.sleep(275); //不断调整这个时间，就能理解上面那段话了。
  }
}
{% endhighlight java %}

#### 8. 加入一个线程

这个小节看的很恶心，主要是翻译的太晦涩了。其实可以简单的认为，join()就是 C 语言中的宏替换。

现在有2个线程 A 和 B，现在想在执行 B 的过程中调用 A 的逻辑，那么就可以在 B 中调用 A.join()，那么在 B 中就会等待 A 执行完毕才继续运行。下面是例子：

{% highlight java linenos %}
class Sleeper extends Thread {
  private int duration;
  public Sleeper(String name, int sleepTime) {
  super(name);
  duration = sleepTime;
  start();
  }
  
  public void run() {
  try {
sleep(duration);
  } catch(InterruptedException e) {
System.out.println(getName() + " was interrupted. " + "isInterrupted(): " + isInterrupted());
return ;
  }
  System.out.println(getName() + " has awakened");
  }
}

class Joiner extends Thread {
  private Sleeper sleeper;
  public Joiner(String name, Sleeper sleeper) {
  super(name);
  this.sleeper = sleeper;
  start();
  }
  
  public void run() {
  try {
sleeper.join();
  } catch(InterruptedException e) {
System.out.println("Interrpted");
  }
  System.out.println(getName() + " join completed");
  }
}

public class Joining {
  public static void main(String[] args) {
  Sleeper sleepy = new Sleeper("Sleepy", 1500);
  Sleeper grumpy = new Sleeper("grumpy", 1500);
  
  Joiner dopey = new Joiner("Dopey", sleepy);
  Joiner doc = new Joiner("Doc", grumpy);
  
  grumpy.interrupt();
  }
}/\*output:
grumpy was interrupted. isInterrupted(): false
Doc join completed
Sleepy has awakened
Dopey join completed
\*/
{% endhighlight java %}

认真看下，其实就是这个意思。我是按宏替换来理解的，把 join()的那个线程的代码给替换进来。。。。

Tips:

* 代码中有一个需要注意的是interrput()的调用结果：`isInterrupted(): false`，明明这个线程被我们 interrupt()了呀，为什么状态是 false？原来是因为当调用 interrupt()的时候，将给这个线程设定一个标志，表明该线程已经被中断。然而，**异常被捕获的时候将清理这个标志**，所以在 catch 子句中，这个标志被识别为 false。

#### 9. 呀，抛出异常肿么办？

先来个小测试，看看下面的代码输出如何？

{% highlight java linenos %}
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ExceptionThread implements Runnable {
  @Override
  public void run() {
  throw new RuntimeException();
  }

  public static void main(String[] args) {
  try {
ExecutorService exec = Executors.newCachedThreadPool();
exec.execute(new ExceptionThread());
  } catch (Exception e) {
System.out.println("catch run() exception...");
  }
  }
}
{% endhighlight java %}

想好的话，实际运行一下这个程序。答案竟然是没有捕获到，直接抛到 console 中！！！为什么呢？

> 前面我们说过，线程之间是无法传播异常（上面线程干活累了，想睡会小节中提到过），所以抛出的异常直接抛给 JVM 并打印到 console 中。当然，在 Java SE5以后，可以用 Executor 来解决这个问题。如下所示：

{% highlight java linenos %}
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

class ExceptionThread2 implements Runnable {
  @Override
  public void run() {
  Thread t = Thread.currentThread();
  System.out.println("run() by " + t);
  System.out.println("eh = " + t.getUncaughtExceptionHandler());
  throw new RuntimeException();
  }
}

class MyUncaughtExceptionHandler implements Thread.UncaughtExceptionHandler {
  @Override
  public void uncaughtException(Thread t, Throwable e) {
  System.out.println("caught " + e);
  }
}

class HandlerThreadFactory implements ThreadFactory {
  @Override
  public Thread newThread(Runnable r) {
  System.out.println(this + " creating new Thread");
  Thread t = new Thread(r);
  System.out.println("created " + t);
  t.setUncaughtExceptionHandler(new MyUncaughtExceptionHandler());
  System.out.println("eh = " + t.getUncaughtExceptionHandler());
  return t;
  }
}

public class CaptureUncaughtException {
  public static void main(String[] args) {
  ExecutorService exec = Executors.newCachedThreadPool(new HandlerThreadFactory());
  exec.execute(new ExceptionThread2());
  }
}/\*output:
concurrency.HandlerThreadFactory@5c647e05 creating new Thread
created Thread[Thread-0,5,main]
eh = concurrency.MyUncaughtExceptionHandler@33909752
run() by Thread[Thread-0,5,main]
eh = concurrency.MyUncaughtExceptionHandler@33909752
concurrency.HandlerThreadFactory@5c647e05 creating new Thread
created Thread[Thread-1,5,main]
eh = concurrency.MyUncaughtExceptionHandler@359d9ad4
caught java.lang.RuntimeException
\*/
{% endhighlight java %}

在实际使用时，可以按照具体情况重写 uncaughtException()来逐个处理不同的异常，如果在代码中都只使用相同的异常处理器，就可以设置 Thread 的静态域：

{% highlight java linenos %}
public class SettingDefaultHandler {
  public static void main(String[] args) {
  Thread.setDefaultUncaughtExceptionHandler(new MyUncaughtExceptionHandler());
  ExecutorService exec = Executors.newCachedThreadPool();
  exec.execute(new ExceptionThread());
  }
}
{% endhighlight java %}

这个处理器只在**不存在线程专有的未捕获异常处理器的情况下才会被调用。**具体的步骤是：

1. 系统会检查线程专有版本
2. 如果没有发现，则检查线程组是否有其专有的 uncaughtException()方法（Java SE5以后完全可以认为没有线程组的概念，因为被 Executor 完全取代），
3. 如果也没有，再调用 defaultUncaughtExceptionHandler。