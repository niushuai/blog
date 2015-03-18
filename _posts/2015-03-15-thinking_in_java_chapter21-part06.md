---
layout: post
title: Java编程思想 - 第二十一章、并发（六）
categories: Java
tags: Java编程思想
---

###21.7 新类库中的构件

Java SE5的 **`java.util.concurrent`** 包中引入了大量设计用来解决并发问题的新类。学习这些“工具类”就可以专注于自己想要实现的功能而不是线程的同步、死锁等一堆令人头疼的细节。这一小节内容非常多，建议的学习方法是：

1. 首先看目录，了解这一小节主要讲的是哪几种构件
2. 通过构件的名字猜猜它们想实现的功能，然后通过查询文档总结一下每个构件的特点，适用的场景
3. 尝试着去寻找项目中涉及到的点，然后具体学习这个构件的知识，之后用新构件重新实现这一块作为巩固

嗯，上面总结了一下学习这个小节的步骤（其实是因为太多了。。。。。我不想全看 T_T），那么我们就把目录摘出来看看吧。

###一、前言

下面是21.7小节的目录：

* 21.7 新类库中的构件
    * 21.7.1 CountDownLatch
    * 21.7.2 CyclicBarrier
    * 21.7.3 DelayQueue
    * 21.7.4 PriorityBlockingQueue
    * 21.7.5 使用 ScheduledExecutor 的温室控制器
    * 21.7.6 Semaphore
    * 21.7.7 Exchanger

嗯，发现一共是7个构件，现在从**文档**出发，逐个浏览一下（Mac 下有 Dash 这样的神器真是幸福啊，hiahiahiahia~）

* CountDownLatch：名字直译为——倒计时锁。官方文档的描述是 A synchronization aid that allows one or more threads to wait until a set of operations being performed in other threads completes.[一个线程同步辅助工具，可以让一个或多个线程等待直到其它线程的任务全部完成才会被唤醒。]
* CyclicBarrier：和上面那个功能相似，只是上面的倒计时数值不能被重置，只能递减到0停止；而 CyclicBarrier 可以在倒计时数减为0之后重用（还是原来的值）
* DelayQueue：无界的 BlockingQueue（前面生产者-消费者讲过哦），用于放置实现了 Delayed interface 的对象，其中的对象只能在到期时才能在队列中取走。**这种队列是有序的，即队头对象的延期到期的时间最长。**
* PriorityBlockingQueue：优先队列的 BlockingQueue，具有可阻塞的读取操作。其实就是 BlockingQueue 的优先队列实现
* 使用 ScheduledExecutor 的温室控制器：
* Semaphore：正常的锁（concurrent.Lock 或者 synchronized）在任何时刻都只能允许一个任务访问资源，而 **Semaphore （计数信号量）允许 N 个任务同时访问这个资源。**（是不是有池子的感觉嘞？？）
* Exchanger：两个任务之间交换对象的栅栏。意思是各自拥有对象，离开栅栏时，就拥有对方持有的对象了。典型就是一个任务生产对象，一个任务消费对象。（值得思考，为啥要交换？我直接用一个容器或者 BlockingQueue 完全可以解耦啊，这个到底用在哪里？）

###二、代码来了

下面给每个构件都写个小例子，然后总结一下它们产生的原因和最佳使用场景。go go go!!

####1. CountDownLatch

文档也太详细了吧：

> A synchronization aid that allows one or more threads to wait until a set of operations being performed in other threads completes.
> 
> A CountDownLatch is initialized with a given count. The `await` methods block until the current count reaches zero due to invocations of the `countDown()` method, after which all waiting threads are released and any subsequent invocations of `await` return immediately. **This is a one-shot phenomenon -- the count cannot be reset. If you need a version that resets the count, consider using a CyclicBarrier【和 CyclicBarrier 的区别】**.
> 
> A CountDownLatch is a versatile(多功能的) synchronization tool and can be used for a number of purposes. A CountDownLatch initialized with a count of one serves as a simple on/off latch, or gate: all threads invoking `await` wait at the gate until it is opened by a thread invoking `countDown()`. A CountDownLatch initialized to N can be used to make one thread wait until N threads have completed some action, or some action has been completed N times.【这里是使用场景：count=1为开关；count=N 重复 N 次】
> 
> A useful property of a CountDownLatch is that it doesn't require that threads calling countDown wait for the count to reach zero before proceeding, it simply prevents any thread from proceeding past an `await` until all threads could pass.

同时文档提供了演示代码：

{% highlight java linenos %}
Here is a pair of classes in which a group of worker threads use two countdown latches:

1. The first is a start signal that prevents any worker from proceeding until the driver is ready for them to proceed;
2. The second is a completion signal that allows the driver to wait until all workers have completed.
 
class Driver { // ...
   void main() throws InterruptedException {
     CountDownLatch startSignal = new CountDownLatch(1);
     CountDownLatch doneSignal = new CountDownLatch(N);

     for (int i = 0; i < N; ++i) // create and start threads
       new Thread(new Worker(startSignal, doneSignal)).start();

     doSomethingElse();            // don't let run yet
     startSignal.countDown();      // let all threads proceed
     doSomethingElse();
     doneSignal.await();           // wait for all to finish
   }
 }

 class Worker implements Runnable {
   private final CountDownLatch startSignal;
   private final CountDownLatch doneSignal;
   Worker(CountDownLatch startSignal, CountDownLatch doneSignal) {
      this.startSignal = startSignal;
      this.doneSignal = doneSignal;
   }
   public void run() {
      try {
        startSignal.await();
        doWork();
        doneSignal.countDown();
      } catch (InterruptedException ex) {} // return;
   }

   void doWork() { ... }
 }
{% endhighlight java %}

文档已经够清晰了，这里就不多废话了。

####2. CyclicBarrier

直译为循环栅栏，通过它可以让一组线程全部到达某个状态后再同时执行。循环的意思是当所有等待线程都被释放（也就是继续执行）以后，CyclicBarrier 可以被重用。

这个的文档也非常详细：

> A synchronization aid that allows a set of threads to all wait for each other to reach a common barrier point[各个线程互相等待，CountDownLatch 是一个等待其他多个线程]. CyclicBarriers are useful in programs involving a fixed sized party of threads that must occasionally wait for each other[使用场景：固定数目的线程互相等待]. The barrier is called cyclic because it can be re-used after the waiting threads are released[为什么叫做循环是因为释放后可以重用].
> 
> A CyclicBarrier supports an optional Runnable command that is run once per barrier point, after the last thread in the party arrives, but before any threads are released[一个可选的参数是 Runnable，在所有线程到达 Barrier 后，但是在释放（让他们继续运行）之前。]. This barrier action is useful for updating shared-state before any of the parties continue[为什么要有这个 Runnable ？可以在所有线程继续运行前更新共享状态等].
> 
> If the barrier action does not rely on the parties being suspended when it is executed, then any of the threads in the party could execute that action when it is released. To facilitate this, each invocation of await() returns the arrival index of that thread at the barrier. You can then choose which thread should execute the barrier action, for example:

		if (barrier.await() == 0) { 
			// log the completion of this iteration
		}
	

> The CyclicBarrier uses an all-or-none breakage model for failed synchronization attempts: If a thread leaves a barrier point prematurely(提前) because of interruption, failure, or timeout, all other threads waiting at that barrier point will also leave abnormally via BrokenBarrierException (or InterruptedException if they too were interrupted at about the same time).[要么全体成功，要么全体失败。和 Future 类似]
> 
> Memory consistency effects: Actions in a thread prior to calling await() happen-before actions that are part of the barrier action, which in turn happen-before actions following a successful return from the corresponding await() in other threads.

下面是文档中的演示代码：

{% highlight java linenos %}
Sample usage: Here is an example of using a barrier in a parallel decomposition（分解） design:

Here, each worker thread processes a row of the matrix then waits at the barrier until all rows have been processed. When all rows are processed the supplied Runnable barrier action is executed and merges the rows. If the merger determines that a solution has been found then done() will return true and each worker will terminate【为什么要用 while 啊，难道不是 barrier 调用 await 阻塞了吗。。】.

 class Solver {
   final int N;
   final float[][] data;
   final CyclicBarrier barrier;

   class Worker implements Runnable {
     int myRow;
     Worker(int row) { myRow = row; }
     public void run() {
       while (!done()) {
         processRow(myRow);

         try {
           barrier.await();
         } catch (InterruptedException ex) {
           return;
         } catch (BrokenBarrierException ex) {
           return;
         }
       }
     }
   }

   public Solver(float[][] matrix) {
     data = matrix;
     N = matrix.length;
     barrier = new CyclicBarrier(N,
                                 new Runnable() {
                                   public void run() {
                                     mergeRows(...);
                                   }
                                 });
     for (int i = 0; i < N; ++i)
       new Thread(new Worker(i)).start();

     waitUntilDone();
   }
 }
{% endhighlight java %}

个人感觉这个例子不太明显，可能是因为是伪代码的缘故吧？还是可运行的程序更直观。。。

举一个例子，现在有一个比赛：每组 5 个人，要把 A 处的球运输到10米外的 B 处，每个人可以拿2个。等10个球全部被运输到 B 处后，就可以举手示意任务完成。下面是这个例子的代码：

{% highlight java linenos %}
package concurrency;

import java.util.Random;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

class Player implements Runnable {

    private CyclicBarrier cyclicBarrier;
    private Random rand = new Random(47);

    public Player(CyclicBarrier cyclicBarrier) {
        this.cyclicBarrier = cyclicBarrier;
    }

    @Override
    public void run() {
        try {
            // 运输2个球
            TimeUnit.SECONDS.sleep(rand.nextInt(5));

            // 等待其他队友完成
            System.out.println(Thread.currentThread() + " 完成任务！等待队友 ing...");
            cyclicBarrier.await();
        } catch (BrokenBarrierException e) {
            System.out.println("BrokenBarrierException " + e);
        } catch (InterruptedException e) {
            System.out.println("InterruptedException " + e);
        }
    }
}

public class CyclicBarrierGame {
    public static void main(String[] args) {
        //定义 CyclicBarrier
        CyclicBarrier cyclicBarrier = new CyclicBarrier(5, new Runnable() {
            @Override
            public void run() {
                //全部完成
                System.out.println("\n全部完成！ 举手报告 ing...\n");
                System.out.println("谁来执行 Barrier 的 Runnable？(猜测是最后一个) : " + Thread.currentThread());
            }
        });
        
        ExecutorService exec = Executors.newCachedThreadPool();
        for(int i = 0; i < 5; i++) {
            exec.execute(new Player(cyclicBarrier));
        }

        /* 下面是为了验证 CyclicBarrier 能够重用
         try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        
        for(int i = 0; i < 5; i++) {
            exec.execute(new Player(cyclicBarrier));
        }
        */
        
        exec.shutdown();
    }
}/*output:
Thread[pool-1-thread-3,5,main] 完成任务！等待队友 ing...
Thread[pool-1-thread-2,5,main] 完成任务！等待队友 ing...
Thread[pool-1-thread-5,5,main] 完成任务！等待队友 ing...
Thread[pool-1-thread-1,5,main] 完成任务！等待队友 ing...
Thread[pool-1-thread-4,5,main] 完成任务！等待队友 ing...

全部完成！ 举手报告 ing...

谁来执行 Barrier 的 Runnable？(猜测是最后一个) : Thread[pool-1-thread-4,5,main]
*/
{% endhighlight java %}

####3. 

{% highlight java linenos %}
package concurrency;

import java.util.Random;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Delayed;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * 考试状态，只有老师能调用 beginExam。
 * 学生在答卷之前，必须调用 waitForExam，也就是老师说考试开始之后才能答题
 */
class Flag {
    private boolean flag = false;

    public synchronized void beginExam() throws InterruptedException {
        System.out.println("考试开始...");
        flag = true;
        notifyAll();
    }

    public synchronized void waitForExam() throws InterruptedException {
        while (!flag) {
            wait();
        }
    }
}

/**
 * 答题时间由随机数生成，控制在 30-180ms 以内。但是考试时间为120，未完成答题的另作处理
 */
class Student implements Runnable, Delayed {
    private String name;
    // 该考生的答题时间
    private Random rand = new Random(47);
    private CountDownLatch countDownLatch;
    private Flag flag;

    public Student(Flag flag, CountDownLatch countDownLatch, String name) {
        this.name = name;
        this.flag = flag;
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        try {
            flag.waitForExam();
            TimeUnit.MILLISECONDS.sleep(30 + rand.nextInt(150));
            System.out.println(name + " 交卷...");
            countDownLatch.countDown();
        } catch (InterruptedException e) {
            System.out.println(name + " 答题中断...");
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public int compareTo(Delayed delayed) {
        // TODO Auto-generated method stub
        return 0;
    }

    @Override
    public long getDelay(TimeUnit timeUnit) {
        // TODO Auto-generated method stub
        return 0;
    }
}

class Teacher implements Runnable {
    private CountDownLatch countDownLatch;
    private Flag flag;

    public Teacher(Flag flag, CountDownLatch countDownLatch) {
        this.flag = flag;
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        try {
            flag.beginExam();
            countDownLatch.await();
            
            System.out.println("考试结束！");
        } catch (InterruptedException e) {
            System.out.println("考试中断！" + e);
        }
    }
}

public class Exam {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService exec = Executors.newCachedThreadPool();
        CountDownLatch countDownLatch = new CountDownLatch(5);
        
        System.out.println("学生进场...");
        Flag flag = new Flag();
        for (int i = 0; i < 5; i++) {
            exec.execute(new Student(flag, countDownLatch, "student:" + i));
        }
        //学生入场后，等待老师进场
        TimeUnit.SECONDS.sleep(5);
        
        System.out.println("老师进场...");
        exec.execute(new Teacher(flag, countDownLatch));

        exec.shutdown();
    }
}

{% endhighlight java %}

{% highlight java linenos %}
{% endhighlight java %}










