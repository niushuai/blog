---
layout: post
title: Java编程思想 - 第二十一章、并发（四）
categories: Java
tags: Java编程思想
---

### 21.5 多个线程之间如何协作？

前面对线程进行了讨论，但是比较简单，要么是每个线程独享自己线程内部的资源，要么是用锁机制串行访问共享资源。而本小节做了一点点升级：使用共享资源不再是盲目的阻塞了，而是使用新的握手机制，其实握手类似事件驱动。不过我对事件驱动也只是了解个皮毛，知道大概的 select/kqueue/epoll 原理，具体的还请自行 man 或者 google。我简单举个例子吧：

* 首先要理解阻塞：阻塞是什么呢？假如现在有个快递（共享资源），但是你不知道什么时候能送到自己手里，而且你没有别的事可以干（或者说接下来的事要等快递来了才能做）。那么你可以去睡觉了，因为你知道快递把货送来时一定会给你打个电话（假定一定能叫醒你）
* 然后是非阻塞忙轮询：如果用忙轮询的方法，那么你需要知道快递员的手机号，然后不停地给他打电话：“你到了没？”

这样一看，我们在前面学习的就是阻塞（synchronized 锁）或者非阻塞忙轮询（使用 while(资源不可用) {sleep...}）。这样做不仅效率低，还会大大降低效率，因为对于线程来说，不仅需要保存线程上下文，还要频繁的切换用户态和内核态。而这里解决方法就类似 epoll 那样的回调。

> 线程协作简单来说就是对共享资源的使用还是阻塞，但是一旦共享资源释放，会主动给阻塞线程发送信号。这样就不用傻傻等待或者不停轮询了。而协作的关键就是**如何传递这个信号**，在 Java 中我们可以使用 Object 中的 wait()和 notify()/notifyAll()函数，也可以使用 concurrent 类库中提供的 await()和 signal()/signalAll()函数。

下面我们就来具体学习线程协作的相关知识。如果先大致浏览这一小节的话，会发生节奏非常紧凑：

1. 第一小节首先介绍线程协作，以及相关的3个函数： wait()、notify()、notifyAll()，然后用一个凃蜡、喷漆程序演示如何进行线程协作（重点是明白线程为什么可以协作呢？因为 wait()不会一直占有锁，在挂起期间会允许进入其他 synchronized 方法改变条件，从而 notify()后再醒来继续工作）
2. notify()和 notifyAll()的区别（个人感觉这一节讲的很迷糊，可以自己去 stackoverflow 或者其他地方查资料）
3. 用厨师做菜、服务员上菜演示生产者消费者模型，其实还包括一个用 Lock 和 Condition 实现的凃蜡、喷漆程序，可以和第一小节再对比一下
4. 使用同步队列的方式改变第三小节的生产者消费者模型，用一个队列解耦生产者和消费者
5. 使用管道来进行输入/输出，本质上是生产者消费者模型的变体，**不过它是存在于引入 BlockingQueue 之前的 Java 版本，所以能用 BlockingQueue 的地方就可以忘掉管道了**

大概了解本节内容之后，就可以进行有的放矢的学习了：）

#### 1. wait()和 notifyAll()的使用

话说被书上这个例子坑的很惨，这个例子前前后后看过10遍左右吧，每次看到这都要纠结很久。这次也是弄了好久才算没那么迷糊。。。。。。（智商急需充值啊。。。）嗯，我先来描述这个“简单”的程序吧：

> 现在有一辆车，需要对它进行凃蜡和抛光操作。因为存在先后顺序，所以必须先凃蜡，然后在抛光。

场景说完了，show code:

{% highlight java linenos %}
package concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

class Car {
	/**
	 * true： 凃蜡<br>
	 * false：抛光
	 */
	private boolean waxOn = false;

	// 完成凃蜡，可以进行抛光了
	public synchronized void waxed() {
		waxOn = true;
		notifyAll();
	}

	// 完成抛光，可以进行下一层凃蜡了
	public synchronized void buffed() {
		waxOn = false;
		notifyAll();
	}

	// 这里为什么要用 while()不断监测？为什么不用 if()？
	public synchronized void waitForWaxing() throws InterruptedException {
		while (waxOn == false) {
			wait();
		}
	}

	public synchronized void waitForBuffing() throws InterruptedException {
		while (waxOn == true) {
			wait();
		}
	}
}

// 凃蜡任务。因为凃蜡肯定先发生，所以步骤为凃蜡-等待抛光-凃蜡
class WaxOn implements Runnable {
	private Car car;
	public WaxOn(Car c) {
		this.car = c;
	}
	public void run() {
		try {
			while(!Thread.interrupted()) {
				System.out.println("开始凃蜡...");
				TimeUnit.MILLISECONDS.sleep(200);
				car.waxed();
				car.waitForBuffing();
			}
 		} catch(InterruptedException e) {
 			System.out.println("Exit via interrupt");
 		}
		System.out.println("结束凃蜡任务");
	}
}

// 抛光任务。先行任务为凃蜡，所以步骤为等待凃蜡-抛光-等待凃蜡
class WaxOff implements Runnable {
	private Car car;
	public WaxOff(Car car) {
		this.car = car;
	}
	public void run() {
		try {
			while(!Thread.interrupted()) {
				car.waitForWaxing();
				System.out.println("开始抛光...");
				TimeUnit.MICROSECONDS.sleep(200);
				car.buffed();
			}
		} catch(InterruptedException e) {
			System.out.println("Exit via interupt");
		}
		System.out.println("结束抛光任务");
	}
}

/*
 * 特意先开始抛光任务，再开始凃蜡任务
 */
public class WaxOMatic {
	public static void main(String[] args) throws InterruptedException {
		Car car = new Car();
		ExecutorService exec = Executors.newCachedThreadPool();
		exec.execute(new WaxOff(car));
		exec.execute(new WaxOn(car));
		TimeUnit.SECONDS.sleep(5);
		exec.shutdownNow();
	}
}
{% endhighlight java %}

整个程序的逻辑很简单，但是一定要理解 boolean 类型的 waxOn 变量所代表的含义。其实我到现在也没明白。。。。。。。。不过不影响看懂整个程序的逻辑：

1. 首先定义一个车，waxed()代表凃蜡完成，buffed()代表抛光完成。waitForWaxing()等待凃蜡，如果 waxOn = false 就说明还在抛光；waitForBuffing()等待抛光，如果 waxOn = true 就说明还在凃蜡。（但是waxOn 究竟代表完成，还是进行中呢？如果代表完成，那么 waitForWaxing()的 waxOn = false 就代表抛光完成，可以进行凃蜡了。明明可以工作了好吗！！！竟然是 wait()。正好和我理解的相反；如果理解成进行中，那么 waxed()中又立即调用了 notifyAll()，明显是完成了凃蜡的意思。）
2. WaxOn 就是凃蜡了，因为这个肯定是起始动作。所以 run()中先进行凃蜡，然后等待抛光
3. WaxOff 就是抛光了，因为它肯定在凃蜡操作后执行，所以 run()中先等凃蜡完成后才能进行抛光操作，抛光完成后就再等待下一次凃蜡完成。
4. main()为了突出这个逻辑，特意先调用了抛光过程，这个希望你能注意到（感觉作者对每个例子都好用心的T_T）

一定要多看看其中是如何使用 wait()和 nofityAll()，如果能提出问题就更好了。一个非常值得思考的问题是：为什么 wait()要使用 while()去监测，既然 notifyAll()发送了资源可用的信号，那么 wait()收到这个消息，用 if()就足够了呀。这是为什么呢？原因如下：

* 可能有多个任务出于相同的原因在等待同一个锁，而第一个唤醒任务可能会改变这种状况（即使你没有这么做，有人也会通过继承你的类去这么做）。如果属于这种情况，那么**这个任务应该被再次挂起，直至其感兴趣的条件发生变化**
* 在这里任务从其 wait()中被唤醒的时刻，有可能会有某个其他的任务已经做出了改变，从而使得这个任务在此时不能执行，或者执行其操作已经显得无关紧要。此时，应该通过再次调用 wait()来将其重新挂起。
* 也有可能某些任务出于不用的原因在等待你的对象上的锁（在这种情况下必须使用 notifyAll())。在这种情况下，你需要检查是否已经由正确的原因唤醒，如果不是，就再次调用 wait()。

因此，总结一下上面的要点：

> **其本质就是要检查所感兴趣的特定条件，并在条件不满足的情况下返回到 wait()中。惯用的方法就是使用 while 来编写 wait()的代码。**而且 wait()有两种使用，一种是指定到期时间，一种是无限等待。一般情况下我们都会使用无限等待，因为条件很多情况下是无法得知改变的大概时间的。

然后还有一个有趣的问题：wait()/notify()/notifyAll()既然都是关于线程协作方面的，为什么它们是在基类 Object 中实现而不是 Thread 中实现呢？

> 尽管乍一想有点奇怪，但是我们来分析一下。锁存在于**所有对象的对象头**中，所以任何同步控制的地方都用到了锁，而用到锁的地方当然也可以进行线程协作。如果把这3个方法实现在 Thread 中，那么使用线程协作的范围就会缩小到继承了 Thread 或者实现了 Runnable 接口的类的对象中，而不是所有对象。实际上，也**只能在同步控制块中调用 wait()、notify()、notifyAll()，因为它们都和锁关联，而 sleep()因为不用操作锁，所以可以在非同步控制方法中调用**，如果在非同步控制方法中调用了这3个方法，程序能够通过编译，不过在运行的时候，将得到 IllegalMonitorStateException 异常，并伴随着一些含糊的信息，比如“当前线程不是拥有者”。消息的意思是，调用 wait()、notify()、notifyAll()的任务在调用这些方法前必须“拥有”（获取）对象的锁。

#### 2. 虽然使用了 notifyAll(),但是信号一定能被 wait()收到吗？——错失的信号

当线程使用 wait()/notify()或者 wait()/notifyAll()时，均可能发生错失信号的问题。想想这是什么原因呢？比如下面这段代码你能看出问题吗？


{% highlight java linenos %}
T1:
	synchronized(sharedMonitor) {
		<setup condition for T2>
		shareMonitor.notify();
	}

T2:
	while(someCondition) {
		//Point 1
		synchronized(sharedMonitor) {
			sharedMonitor.wait();
		}
	}	
{% endhighlight java %}

两个线程 T1和 T2的协作正确吗？如果不正确，会发生什么问题呢？

> 其实代码中已经有了提示，在 Point 1处可能会发生错误。假如 T2执行到 Point 1的时候，说明someCondition 为 true，而这时线程调度器将时间片分给 T1，T1检查 sharedMonitor 对象锁没有占用，就拿到锁进入到同步控制块中，改变T2 线程的 while 条件，然后发送一个信号。但是因为 T2已经执行过 someCondition 的判断，所以就错失了 notify（）的通知，在同步控制块中 wait（）导致死锁（一直等待）。

那么，解决办法是防止在 someCondition 上产生变量竞争条件。不竞争不就是串行的意思嘛，所以 T2的代码将 while()放在同步控制块中即可：

{% highlight java linenos %}
	synchronized(sharedMonitor) {
		while(someCondition) {
			sharedMonitor.wait();
		}
	}	
{% endhighlight java %}


#### 3. notify() VS notifyAll()

如果仔细观察上面的程序，会发现我们一会用 notifyAll()一会用 notify(),那么它们各自的使用场景是什么？

其实从名字可以猜个大概，notify()是对于单个线程来说的，notifyAll()是对于所有线程而言的。举个例子，现在大家都在教室自习，有个家长来找自己的孩子，那么 notify()就是去那个家长的孩子座位上单独告诉他，notifyAll()就是在班里大吼一声某某的家长在外面，让所有学生都知道，然后某某出去，其他孩子继续干自己的事情。

实际上，notify()和 notifyAll()的区别还是非常值得研究的，stackoverflow 上也有这个问题的讨论：[Java: notify() vs. notifyAll() all over again](http://stackoverflow.com/questions/37026/java-notify-vs-notifyall-all-over-again#)

#### 4. 生产者与消费者

{% highlight java linenos %}
package concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

class Meal {
    private final int orderNum;

    public Meal(int orderNum) {
        this.orderNum = orderNum;
    }

    public String toString() {
        return "Meal " + orderNum;
    }
}

class Waiter implements Runnable {

    private Restaurant restaurant;

    public Waiter(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                synchronized (this) {
                    while (restaurant.meal == null) {
                        wait();
                    }
                }
                System.out.println("Waiter got " + restaurant.meal);
                // 为什么要选择 chef 作为同步控制块的锁呢？
                // 废话，想通知 chef，肯定要调用 chef.notifyAll()。因为 notifyAll()必须在
                // 同步控制块中调用，而且释放的是 chef 的锁，肯定需要先获取 chef 的锁了。。。
                synchronized (restaurant.chef) {
                    restaurant.meal = null;
                    restaurant.chef.notifyAll(); // 准备下一道菜
                }
            }
        } catch (InterruptedException e) {
            System.out.println("Waiter interrupted");
        }
    }
}

class Chef implements Runnable {

    private Restaurant restaurant;
    private int count = 0;

    public Chef(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                synchronized (this) {
                    while (restaurant.meal != null) {
                        wait();
                    }
                }

                if (++count == 11) {
                    System.out.println("菜上齐了");
                    //这块只是向 chef 和 waiter 发送一个 interrupt 信号
                    //但是因为 synchronized 和 IO 是不能被中断的，所以这里会通过可中断的
                    //sleep()抛出 InterruptedException。
                    //而 waiter 只能通过 while(Thread.interrupted())抛出的 InterruptedException返回
                    
                    //而且我们会发现，多做了一个菜！本来做了10个就够了。11个本意想关闭程序，但是因为
                    //synchronized 无法中断，只好又做了一个菜（厨师也饿了）。但是因为服务员在 wait()，可以被中断
                    //所以做好的菜没有被服务员上去。。。。
                    restaurant.exec.shutdownNow();
                }

                System.out.print("做菜ing...");
                synchronized (restaurant.waiter) {
                    restaurant.meal = new Meal(count);
                    restaurant.waiter.notifyAll();
                }

                TimeUnit.MILLISECONDS.sleep(100);
            }
        } catch (InterruptedException e) {
            System.out.println("chef interrupted");
        }
    }
}

public class Restaurant {
    Meal meal;
    ExecutorService exec = Executors.newCachedThreadPool();
    Waiter waiter = new Waiter(this);
    Chef chef = new Chef(this);

    public Restaurant() {
        exec.execute(chef);
        exec.execute(waiter);
    }

    public static void main(String[] args) {
        new Restaurant();
    }
}/*output:
做菜ing...Waiter got Meal 1
做菜ing...Waiter got Meal 2
做菜ing...Waiter got Meal 3
做菜ing...Waiter got Meal 4
做菜ing...Waiter got Meal 5
做菜ing...Waiter got Meal 6
做菜ing...Waiter got Meal 7
做菜ing...Waiter got Meal 8
做菜ing...Waiter got Meal 9
做菜ing...Waiter got Meal 10
菜上齐了
Waiter interrupted
做菜ing...chef interrupted
*/
{% endhighlight java %}

这个程序的输出会发现，最后一道菜已经做了，但是没有上。写完迷糊了好久才想起来，synchronized 不可被中断，但是 wait()可以被中断啊（同时中断状态被清除，抛出一个 InterruptedException）！！！！

#### 5. 生产者-消费者与队列

上面是生产者消费者模型的最基本实现——厨师做完一道菜后通知服务员取菜，服务员取菜之后通知厨师做菜。这样的做法太低效，因为每次交互都需要握手。在更高效的程序中，可以使用**同步队列**来解决任务协作问题，**同步队列在任何时刻都只允许一个任务插入或移除元素**。在 java.util.concurrent.BlockingQueue 接口中提供了这种队列，这个接口有大量的标准实现。通常可以使用 LinkedBlockingQueue，它是一个无界队列，还可以使用 ArrayBlockingQueue，它又固定的大小，因此可以在它被阻塞之前向其中放置有限数量的元素。

并且，使用同步队列可以简化上面繁琐的握手方式。如果消费者任务试图从队列中获取元素，而该队列为空，那么这些队列还可以挂起消费者任务，当有更多的元素可用时，又会恢复消费者任务。阻塞队列可以解决非常大量的问题，而方式与 wait()和 notifyAll()相比，则简单可靠的多。

下面我们写一个简单的程序说明一下 BlockingQueue 的使用方法，以及它带来的便利。

{% highlight java linenos %}
package concurrency;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.SynchronousQueue;

class LiftOffRunner implements Runnable {
    private BlockingQueue<LiftOff> rockets;

    public LiftOffRunner(BlockingQueue<LiftOff> rockets) {
        this.rockets = rockets;
    }

    //生产者
    public void add(LiftOff lo) {
        try {
            rockets.put(lo);
        } catch(InterruptedException e) {
            System.out.println("Interrupted during put()");
        }
    }
    
    //消费者——注意后面的程序先启动了消费者。
    public void run() {
        try {
            while(!Thread.interrupted()) {
                LiftOff rocket = rockets.take();
                rocket.run();
            }
        } catch(InterruptedException e) {
            System.out.println("waking from take()");
        }
        System.out.println("Exiting LiftOffRunner");
    }
}

public class TestBlockingQueues {
    /**
     * 其实getkey()仅仅是为了隔开 BlockingQueue 的不同实现类。
     */
    static void getkey() {
        try {
            new BufferedReader(new InputStreamReader(System.in)).readLine();
        } catch(IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    static void getkey(String message) {
        System.out.println(message);
        getkey();
    }
    
    /**
     * 每次测试一种 BlockingQueue 的实现。其中先调用t.start()是为了启动消费者。
     * 因为没有启动生产者，所以 BlockingQueue 会自动挂起。然后使用 for 循环生产 rockets 的元素。
     * 
     * 所以不仅实例了 BlockingQueue 作为一个 Queue 的使用，也演示了当生产者或者消费者阻塞时，BlockingQueue
     * 会自动帮我们处理，使我们可以专注于业务逻辑。
     */
    static void test(String msg, BlockingQueue<LiftOff> queue) {
        System.out.println(msg);
        LiftOffRunner runner = new LiftOffRunner(queue);
        Thread t = new Thread(runner);
        t.start();
        for(int i = 0; i < 5; i++) {
            runner.add(new LiftOff(5));
        }
        getkey("Press 'Enter' (" + msg + ")");
        t.interrupt();
        System.out.println("Finished " + msg + " test");
    }
    
    public static void main(String[] args) {
        test("LinkedBlockingQueue", new LinkedBlockingDeque<LiftOff>());
        test("ArrayBlockingQueue", new ArrayBlockingQueue<LiftOff>(3));
        test("SynchronousQueue", new SynchronousQueue<LiftOff>());
    }
}
{% endhighlight java %}

程序的输出需要 System.in，所以自己去运行。运行之后，你的任务是再写一个程序。将厨师、服务员的例子改写成使用 BlockingQueue 的。我也来一发：

{% highlight java linenos %}
package concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;


/**
 * 这个例子的一个收获是：
 * 
 * 想要抛出异常必须得有载体。比如：
 * 
 * while(!Thread.interrupted()) {
 * }
 * 
 * 是不会抛出异常的。
 * 
 * 只有当里面有 sleep()/wait()/join()在运行（让线程处于阻塞状态），然后才能从阻塞状态退出，
 * 并抛出一个 InterruptedException。
 * 
 */

class NewMeal {
    private final int orderNum;

    public NewMeal(int orderNum) {
        this.orderNum = orderNum;
    }

    public String toString() {
        return "Meal " + orderNum;
    }
}

class NewWaiter implements Runnable {
    private RestaurantWithBlockingQueue restaurant;

    public NewWaiter(RestaurantWithBlockingQueue restaurant) {
        this.restaurant = restaurant;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                while (!restaurant.meal.isEmpty()) {
                    NewMeal meal = restaurant.meal.take();
                    System.out.println("Waiter got " + meal);
                }
            }
        } catch (InterruptedException e) {
            System.out.println("Interrupted waiter");
        }
    }
}

class NewChef implements Runnable {
    private RestaurantWithBlockingQueue restaurant;

    public NewChef(RestaurantWithBlockingQueue restaurant) {
        this.restaurant = restaurant;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                for (int i = 1; i <= 11; i++) {

                    if (i == 11) {
                        restaurant.exec.shutdownNow();
                        continue;
                    }

                    System.out.println("做菜...");
                    restaurant.meal.add(new NewMeal(i));
                    TimeUnit.MILLISECONDS.sleep(100);
                }
            }
        } catch (InterruptedException e) {
            System.out.println("Interrupted chef");
        }
    }
}

public class RestaurantWithBlockingQueue {
    LinkedBlockingQueue<NewMeal> meal = new LinkedBlockingQueue<NewMeal>();
    ExecutorService exec = Executors.newCachedThreadPool();
    NewWaiter waiter = new NewWaiter(this);
    NewChef chef = new NewChef(this);

    public RestaurantWithBlockingQueue() {
        exec.execute(waiter);
        exec.execute(chef);

    }

    public static void main(String[] args) {
//        while(!Thread.interrupted()) {
//            System.out.println("ehl");
//        }
        new RestaurantWithBlockingQueue();
    }
}/*output:
做菜...
Waiter got Meal 1
做菜...
Waiter got Meal 2
做菜...
Waiter got Meal 3
做菜...
Waiter got Meal 4
做菜...
Waiter got Meal 5
做菜...
Waiter got Meal 6
做菜...
Waiter got Meal 7
做菜...
Waiter got Meal 8
做菜...
Waiter got Meal 9
做菜...
Waiter got Meal 10
*/
{% endhighlight java %}

通过这个程序得出的结论是：

* 如果线程没有被阻塞，调用 interrupt()将不起作用；若线程处于阻塞状态，就将得到异常（该线程必须事先预备好处理此状况），接着退出阻塞状态。 
* 线程 A 在执行 sleep(),wait(),join()时,线程 B 调用 A 的 interrupt 方法,A会 catch 一个 InterruptedException异常.但这其实是在 sleep,wait,join 这些方法内部不断检查中断状态的值后抛出的 InterruptedException。 
* 如果线程 A 正在执行一些指定的操作时，如赋值、for、while等,线程本身是不会去检查中断状态标志的,所以线程 A 自身不会抛出 InterruptedException 而是一直执行自己的操作。
* 当线程 A 终于执行到 wait(),sleep(),join()时,这些方法本身会抛出 InterruptedException
* 若没有调用 sleep(),wait(),join()这些方法,或是没有在线程里自己检查中断状态并抛出 InterruptedException 的话,那么上游是无法感知这个异常的（还记得异常不能跨线程传递吗？） 

然后书上还有一个使用 BlockingQueue 的例子，非常简单。本质来说，BlockingQueue 可以当成是一个任务队列，它会自动的搞定同步操作，所以在处理生产者消费者模型时，可以作为首选。当然，使用具体哪种 BlockingQueue 就需要自己选择了。

{% highlight java linenos %}
package concurrency;

import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

class Toast {
    public enum Status {
        DRY, BUTTERED, JAMMED
    };

    private Status status = Status.DRY;
    private final int id;

    public Toast(int id) {
        this.id = id;
    }

    public void butter() {
        status = Status.BUTTERED;
    }

    public void jam() {
        status = Status.JAMMED;
    }

    public Status getStatus() {
        return status;
    }

    public int getId() {
        return id;
    }

    public String toString() {
        return "Toast " + id + ": " + status;
    }

}

/**
 * ToastQueue 充当别名的作用。就好像 typedef
 *
 */
class ToastQueue extends LinkedBlockingQueue<Toast> {
    
}

//制造吐司
class Toaster implements Runnable {
    
    private ToastQueue toastQueue;
    private int count = 0;
    private Random rand = new Random(47);
    public Toaster(ToastQueue toastQueue) {
        this.toastQueue = toastQueue;
    }
    
    @Override
    public void run() {
        try {
            while(!Thread.interrupted()) {
                TimeUnit.MILLISECONDS.sleep(100 + rand.nextInt(500));
                Toast toast = new Toast(count++);
                System.out.println(toast);
                toastQueue.add(toast);
            }
        } catch(InterruptedException e) {
            System.out.println("制造吐司 is interrupted!");
        }
        System.out.println("Toaster off");
    }
}

//抹黄油
class Butterer implements Runnable {
    
    private ToastQueue dryQueue, butteredQueue;
    public Butterer(ToastQueue dryQueue, ToastQueue butteredQueue) {
        this.dryQueue = dryQueue;
        this.butteredQueue = butteredQueue;
    }
    
    @Override
    public void run() {
        try {
            while(!Thread.interrupted()) {
                Toast toast = dryQueue.take();
                toast.butter();
                System.out.println(toast);
                butteredQueue.put(toast);
            }
        } catch(InterruptedException e) {
            System.out.println("抹黄油 is interrupted!");
        }
        System.out.println("Butterer off");
    }
}

//抹果酱
class Jammer implements Runnable {
    
    private ToastQueue butteredQueue, finishedQueue;
    public Jammer(ToastQueue butteredQueue, ToastQueue finishedQueue) {
        this.butteredQueue = butteredQueue;
        this.finishedQueue = finishedQueue;
    }
    
    @Override
    public void run() {
        try {
            while(!Thread.interrupted()) {
                Toast toast = butteredQueue.take();
                toast.jam();
                System.out.println(toast);
                finishedQueue.put(toast);
            }
        } catch(InterruptedException e) {
            System.out.println("抹果酱 is interrupted!");
        }
        System.out.println("Jammer off");
    }
}

//吃吃吃
class Eater implements Runnable {
    
    private ToastQueue finishedQueue;
    private int count = 0;
    public Eater(ToastQueue finishedQueue) {
        this.finishedQueue = finishedQueue;
    }
    
    @Override
    public void run() {
        try {
            while(!Thread.interrupted()) {
                Toast toast = finishedQueue.take();
                //检查吐司是否按照 order 送来，而且所有都是经过黄油、果酱加工
                if(toast.getId() != count++ || toast.getStatus() != Toast.Status.JAMMED) {
                    System.err.println("Error: " + toast);
                    System.exit(1);
                } else {
                    System.out.println("真好吃啊！！！");
                }
                
            }
        } catch(InterruptedException e) {
            System.out.println("吃吃吃 is interrupted!");
        }
        System.out.println("Eater off");
    }
}

public class ToastMatic {
    public static void main(String[] args) throws Exception {
        ToastQueue dryQueue = new ToastQueue(),
                butteredQueue = new ToastQueue(),
                finishedQueue = new ToastQueue();
        ExecutorService exec = Executors.newCachedThreadPool();
        exec.execute(new Toaster(dryQueue));
        exec.execute(new Butterer(dryQueue, butteredQueue));
        exec.execute(new Jammer(butteredQueue, finishedQueue));
        exec.execute(new Eater(finishedQueue));
        
        TimeUnit.SECONDS.sleep(5);
        exec.shutdownNow();
    }
}
{% endhighlight java %}

这个程序虽然简单，但是有几个亮点值得关注：

* Toast 是一个使用 enum 的优秀示例
* 程序中没有显式的 Lock 或者 synchronized 关键字，就显得很简洁。同步全部由同步队列隐式管理了——每个 Toast 在任何时刻都只由一个任务在操作。
* 因为队列自动进行阻塞、挂起、恢复，就使得程非常简洁，而且省略了 wait()/notifyAll()在类与类之间的耦合，因为每个类都只和它自己的 BlockingQueue 进行通信

#### 6. 任务间使用管道进行输入/输出

首先需要声明：

> 这个模型可以看成是生产者-消费者问题的变体，这里的管道就是一个封装好的解决方案。管道基本上是一个阻塞队列，**存在于多个引入 BlockingQueue 之前的 Java 版本中**。意思很明显，有了 BlockingQueue 之后还是用 BlockingQueue 吧。目测公司的 jdk 都是1.6+吧，所以这个小节基本就是有个印象就好，重点还是掌握 BlockingQueue。

下面这个程序虽然简单，但是最好自己多调试。看看 PipedReader 和 PipedWriter 能不能中断，是 IOException 还是 InterruptedException（其实是java.io.InterruptedIOException）。

{% highlight java linenos %}
package concurrency;

import java.io.IOException;
import java.io.PipedReader;
import java.io.PipedWriter;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * PipedWriter.write()和 PipedReader.read() 都可以中断，这是和普通 IO 之间最重要的区别了。
 */
class Sender implements Runnable {
    private Random rand = new Random(47);
    private PipedWriter out = new PipedWriter();

    public PipedWriter getPipedWriter() {
        return out;
    }

    @Override
    public void run() {
        try {
            //while (true) {
                for(Integer i = 0; i < 10000000; i++) {
                    out.write(i);
                    //TimeUnit.MILLISECONDS.sleep(rand.nextInt(500));
                }
            //}
        } catch (IOException e) {
            System.out.println(e + " Sender write exception");
        }
//        } catch (InterruptedException e) {
//            System.out.println(e + " Sender sleep interrupted");
//        }
    }
}

class Receiver implements Runnable {
    private PipedReader in;

    //必须和一个 PipedWriter 相关联
    public Receiver(Sender sender) throws IOException {
        in = new PipedReader(sender.getPipedWriter());
    }

    @Override
    public void run() {
        try {
            while (true) {
                //调用 P ipedReader.read()，如果管道没有数据会自动阻塞
                System.out.print("Read: " + (char) in.read() + ", ");
            }
        } catch (IOException e) {
            System.out.println(e + " Receiver read exception");
        }
    }
}

public class PipedIO {
    public static void main(String[] args) throws Exception {
        Sender sender = new Sender();
        Receiver receiver = new Receiver(sender);
        ExecutorService exec = Executors.newCachedThreadPool();
        exec.execute(sender);
        exec.execute(receiver);

        TimeUnit.SECONDS.sleep(1);
        exec.shutdownNow();
    }
}
{% endhighlight java %}

开头就说了，现在 PipedWriter 和 PipedReader 已经被 BlockingQueue 取代，所以了解即可。记住一点，PipedWriter 和 PipedReader 是可以被中断的。