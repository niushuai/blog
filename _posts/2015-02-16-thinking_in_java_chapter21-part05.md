---
layout: post
title: Java编程思想 - 第二十一章、死锁（五）
categories: Java
tags: Java编程思想
---

###21.5 线程死锁

关于死锁的问题，是非常麻烦的。对一般程序而言，如果马上出问题，你就可以立即跟踪下去。但是线程死锁不会马上出问题，看起来工作良好的程序却具有潜在的死锁风险。因此，在编写并发程序的时候，进行仔细的程序设计以防止死锁是关键部分。

先解释一下线程死锁吧：

> 某个任务在等待另一个任务，而后者又等待别的任务，这样一直下去，直到这条链条上的任务又在等待第一个任务释放锁。这得到了一个任务之间相互等待的连续循环，没有哪个线程能继续运行，这就被称为线程死锁。

####1. 哲学家进餐

哲学家进餐是一个典型的线程死锁例子，我就不多描述场景了，直接上程序模拟(省略了一些 import 语句，请自行添加)：

{% highlight java linenos %}
class Chopstick {
    private boolean taken = false;
    
    public synchronized void take() throws InterruptedException {
        while(taken) {
            wait();
        }
        
        taken = true;
    }
    
    public synchronized void drop() {
        taken = false;
        notifyAll();
    }
}

/**
 * 每个哲学家都是一个 Runnable 任务
 */
class Philosopher implements Runnable {

    private Chopstick left;
    private Chopstick right;
    private final int id;
    private final int ponderFctor;
    private Random rand = new Random(47);

    public Philosopher(Chopstick left, Chopstick right, int id, int ponder) {
        this.left = left;
        this.right = right;
        this.id = id;
        this.ponderFctor = ponder;
    }

    // 思考的时间
    private void pause() throws InterruptedException {
        //不思考
        if (ponderFctor == 0) {
            return;
        }
        TimeUnit.MILLISECONDS.sleep(rand.nextInt(ponderFctor * 250));
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                // 思考
                System.out.print(this + " thinking...");
                pause();
                
                // 饿了
                System.out.println(this + " grabbing right");
                right.take();
                System.out.println(this + " garbbing left");
                left.take();
                System.out.println(this + " eating...");
                pause();
                
                //吃完了
                right.drop();
                left.drop();

            }
        } catch (InterruptedException e) {
            System.out.println(this + " exiting via interrupt");
        }
    }

    @Override
    public String toString() {
        return "Philosopher " + id + "号";
    }
}

/**
 * Args: 0 5 timeout
 * 
 *  0:是思考时间的因子
 *  5:筷子数目
 *  timeout:停止时间
 */
public class DeadlockingDiningPhilosophers {
    public static void main(String[] args) throws Exception {
        int ponder = 5;
        if (args.length > 0) {
            ponder = Integer.parseInt(args[0]);
        }
        int size = 5;
        if (args.length > 1) {
            size = Integer.parseInt(args[1]);
        }

        ExecutorService exec = Executors.newCachedThreadPool();
        Chopstick[] chopsticks = new Chopstick[size];
        for (int i = 0; i < size; i++) {
            chopsticks[i] = new Chopstick();
        }
        for (int i = 0; i < size; i++) {
            exec.execute(new Philosopher(chopsticks[i], chopsticks[(i + 1) % size], i, ponder));
        }
        if (args.length == 3 && args[2].equals("timeout")) {
            TimeUnit.SECONDS.sleep(5);
        } else {
            System.out.println("Press 'Enter' to quit");
            System.in.read();
        }
        exec.shutdownNow();
    }
}

{% endhighlight java %}

这个程序不指定参数的话，就是0 5，然后按 Enter 停止；如果指定0 5 timeout，就在5s 后自动停止。不过悲催的是，我运行了几十次，一共就产生了1次死锁。。。其中有次运行了3个小时也没死锁 T_T 可见死锁问题的隐蔽性啊。

那么，死锁问题是不可能避免的吗？Nope.其实线程死锁必须**同时满足以下四个条件（一定是同时）**：

* 互斥条件。各个任务使用的资源至少有一个是不同共享的，属于临界资源。比如上面的筷子
* 至少有一个任务必须占有资源的同时想获取另外一个或可用或被其他任务占用的资源
* 资源不能被抢占。意思是大家都平等，不能强行抢夺别人的资源
* 必须有循环等待。就像开头描述的那样，大家要形成一个闭环

因为发生死锁要同时满足四个条件，那么解除死锁只需要破坏其中的一个即可。一般情况下，最容易防止死锁的方法是**破坏第四个条件**。

比如上面的哲学家就餐问题，第四个条件是因为哲学家都先拿右边，然后拿左边。因为是圆桌，所以最后一个哲学家和第一个哲学家就会抢占它们中间的筷子形成闭环。解决方法很简单：如果最后一个哲学家被初始化为先拿左边的筷子，然后再拿右边的筷子，那么这个哲学家将永远不会阻止他右边的哲学家拿起筷子。

####2. 本节习题

这个小节有一个习题，说的是把筷子集中放到一个容器中，每个哲学家要就餐的话，就取出两根筷子，用完就放进去。这样能防止死锁吗？

关于死锁的问题，一定要往四个条件上靠拢。所以，我们看看他能破坏哪个条件，如果破坏了任意一个，就一定能解决死锁。那我们逐一分析：

* 互斥条件：满足。两根筷子要么在容器中，要么在哲学家手中。不能共享
* 占着一个，想要另外一个：Bingo！因为我只要拿到筷子，就一定是两根，而且不会再去拿容器中的筷子。所以这个条件不满足
* 资源不能被抢占：满足。
* 循环等待：没有循环等待，因为两根筷子捆绑一会，只有一种情况，拿或者没拿。不会产生循环

综上，从第二条我们就知道，这种方法不会产生死锁。官方答案是这样的：

> We use ChopstickQueue to create the ChopstickBin, so it gains all of LinkedBlockingQueue’s control logic. Instead of picking up the left and right chopsticks, philosophers take them from a common bin, an activity we suspend when too few chopsticks remain. The results are the same, with the flaw that an equal number of chopsticks and philosophers can quickly deadlock, but a single extra chopstick prevents this.

很悲催，我们想错了。那么错在哪里了？

> 其实是理解错题意了。囧 rz。人家没说一次拿两根，而是拿完一根再拿一根。。。。。。。那么，5个哲学家、5根筷子，启动时，所有哲学家都饿了，同时去拿1根。。。然后就悲剧了。。。同时4条件也满足了。所以，如果是拿两根筷子作为一个原子操作，就不会产生死锁了。

####3. 拓展阅读

以前写过一个 HashMap 死锁的问题，就是因为多线程并发造成的。觉得还是趁机再巩固一下的好：）

* [HashMap 死锁分析](../hashmap-infinite-loop)
