---
layout: post
title: 理解 ThreadLocal
categories: Java
tags: Java编程思想
---

###前言

看到《Java 编程思想》的21.3小节，只用了一个小节介绍 ThreadLocal 的使用，但是不是很懂，于是找了点资料学习一下，下面是这篇文章的主线：

1. 什么是 ThreadLocal，为什么要提出这个概念？——共享资源的访问问题
	* synchronized——串行访问
	* volatile——主内存刷新，不存在线程副本
	* ThreadLocal——线程空间内的全局变量
2. 文档 & 源码分析
3. 探究一下为什么这么设计？
4. 实际中如何正确使用？
5. 有什么缺点？有危险吗？

下面就来分析分析吧，gogogo~~

####一、什么是 ThreadLocal，为什么要提出这个概念？

多线程问题最让人抓狂的就是对共享资源的并发访问。目前为止，我见到的对共享资源的使用方法有：

* synchronized——串行访问
* volatile——主内存刷新，不存在线程副本
* ThreadLocal——线程空间内的全局变量

synchronized 很简单，就是每个对象访问共享资源时，会检查对象头中的锁状态，然后进行串行访问共享资源；volatile 也很简单，它在使用中保证对变量的访问均在主内存进行，不存在对象副本，所以每个线程要使用的时候，都必须强制从主内存刷新，但是如果操作不具有原子性，也会导致共享资源的污染，所以 volatile 的使用场景要非常小心，在《深入理解 Java 虚拟机》中有详细的分析，这里就不细谈了；然后 ThreadLocal，其实 ThreadLocal 跟共享资源没关系，因为都是线程内部的，所以根本不存在共享这一说法，那它是干嘛的？下面会详细说明。

####二、文档 & 源码分析

`public class ThreadLocal<T> extends Object`

> This class provides thread-local variables. These variables differ from their normal counterparts in that each thread that accesses one (via its get or set method) has its own, independently initialized copy of the variable. **ThreadLocal instances are typically private static fields in classes that wish to associate state with a thread (e.g., a user ID or Transaction ID)【注：一般为 private static 修饰，比如一个 userid 或者事务 id】**.
>  
> Each thread holds an implicit reference to its copy of a thread-local variable as long as the thread is alive and the ThreadLocal instance is accessible; after a thread goes away, all of its copies of thread-local instances are subject to garbage collection (unless other references to these copies exist).

文档说的很简单，其实源码也很简单的，核心部分就是 ThreadLocalMap。然后对这个 Map 的 init，get，set 操作。我们抓住关键部分看一下：

首先是 set()方法：

{% highlight java linenos %}
    //set 方法
    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
    }

    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }

    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }

    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
{% endhighlight java %}

在这个方法内部我们看到，首先通过 getMap(Thread t)方法获取和当前线程相关的 ThreadLocalMap，然后将变量的值设置到 ThreadLocalMap 对象中，当然如果获取到的ThreadLocalMap对象为空，就通过createMap方法创建。而 getMap()也很简单，就是获取和设置 Thread 类中的 threadLocals 变量，而这个变量的类型就是 ThreadLocalMap，这样进一步验证了上文中的观点：每个线程都有自己独立的 ThreadLocalMap 对象。

打开java.lang.Thread类的源代码，我们能得到更直观的证明：

{% highlight java linenos %}
    /* ThreadLocal values pertaining to this thread. This map is maintained
     * by the ThreadLocal class. */
    ThreadLocal.ThreadLocalMap threadLocals = null;
{% endhighlight java %}

然后再看一下ThreadLocal类中的get()方法：

{% highlight java linenos %}
    //get 方法
	public T get() {
        Thread t = Thread.currentThread(); //原来 Thread 中有 ThreadLocalMap 属性
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T)e.value;
                return result;
            }
        }
        return setInitialValue();
    }
    
    private T setInitialValue() {
        T value = initialValue();
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
        return value;
    }
{% endhighlight java %}

这两个方法的代码告诉我们，在获取和当前线程绑定的值时，ThreadLocalMap 对象是以 this 指向的 ThreadLocal 对象为键进行查找的，这当然和前面set()方法的代码是呼应的。

####三、探究一下为什么这么设计？

ThreadLocal ，从名字就可以翻译为线程的本地存储。这是一种对共享资源安全使用的方法，但是和 synchronized 有区别，它为每个线程都分配一个变量的内存空间，根除了线程对共享变量的竞争。但是因为每个线程，所以这个变量在不同线程之间是“透明的”、“无法感知的”，这就意味着各个线程的这个变量不能有联系，它只和当前的线程相关联。

用一个例子来说明吧：

{% highlight java linenos %}
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

class Task implements Runnable {
	@Override
	public void run() {
		while (!Thread.currentThread().isInterrupted()) {
			ThreadLocalTest.increment();
			System.out.println(this);
		}
	}

	public String toString() {
		return "thread is: " + Thread.currentThread() + ", value is: " + ThreadLocalTest.get();
	}
}

public class ThreadLocalTest {
	private static ThreadLocal<Integer> value = new ThreadLocal<Integer>() {
		private Random random = new Random(47);

		protected synchronized Integer initialValue() {
			return random.nextInt(10000);
		}
	};

	public static void increment() {
		value.set(value.get() + 1);
	}

	public static int get() {
		return value.get();
	}

	public static void main(String[] args) throws InterruptedException {
		ExecutorService exec = Executors.newCachedThreadPool();
		for (int i = 0; i < 3; i++) {
			exec.execute(new Task());
		}
		TimeUnit.SECONDS.sleep(3);
		exec.shutdownNow();
	}
}
{% endhighlight java %}

输出我就不贴了，运行一下就会发现。每个线程都会维护一个 value，而且相互不会影响。

但是仔细观察这个程序也许会发现一个问题：

> 为什么 ThreadLocal 是 static 的？既然是跟线程有关的，那么为啥要声明为静态变量？静态的意思是所有对象公用一个，而 ThreadLocal 刚刚才说是线程本地，每个线程各自都有单独的一份。这是为什么呢?

首先自然是文档，然后源码，然后去 stackoverflow 搜索，比如[Why should Java ThreadLocal variables be static](http://stackoverflow.com/questions/2784009/why-should-java-threadlocal-variables-be-static)。我个人试着总结一下吧。

> 首先，TLS 的概念来源于 C 语言，详细的可以参考这篇文章——[漫谈兼容内核](http://www.longene.org/techdoc/0328131001224576926.html)。其实多线程的提出，最需要解决的是可视性问题，也就是前面提到的对共享资源的正确使用。对于有些共享资源，我希望所有线程可见，于是我在进程级别声明即可（也就是常见的全局变量），这样所有线程都可以任意访问，这时为了防止污染，就需要加锁进行串行访问；对于有些资源，我仅仅希望在本线程可见，不能让其他线程污染，这样很容易想到在线程内部声明局部变量，但是这么做有个头疼的问题是局部变量有作用域，如果我的线程需要横跨多个函数，那么我需要一层一层传递。举个极端的例子，如果有个线程 A 吧，A 启动时会调用 a()，然后 a()中调b(),b()中调 c(),……共有100层方法调用，且只有第1层和第100层用到了一个想在线程内部使用的局部变量，那么我就需要在100层函数的每一层都传递这个变量。这样做显然是下下之选，因为不仅容易出错，而且维护起来也非常容易让人困惑（我靠，这个函数传入的这个参数压根没用到，估计谁忘了吧，好，我来删了。然后……）。为了解决这种问题 TLS 应运而生。本质来说，TLS 可以理解为线程上下文变量。举个最简单的例子，假设我的程序会连续启动10个线程去读取10个文件的内容，线程代码是完全一样的。那么，我就可以使用 TLS 来记录线程上下文中的文件句柄（我在一个数组中定义了10个文件的句柄，然后用循环让一个线程领取一个句柄）。此时，我使用一致的文件操作代码，却能保证不管在任何线程中操作的文件句柄都是和该线程唯一绑定且其他线程不可见的。

	
简单来说，TLS 的作用可以归纳为两点：

* 存储线程上下文相关的信息，使得在一致的代码中，自动访问差异性的线程绑定的上下文相关信息(多态，有木有！)
* 解决了在全局（线程内部）使用“局部变量”的参数传递问题（其实也是得益于第一条）

其实基于 C 语言，TLS 还可以理解的更简单：

1. 全局对象——全局变量的作用域和生命周期都是全局的，这里的全局是指进程级别。也就是说，如果你将其设置为全局变量，就意味着你希望在多线程环境中仍然能并发访问。但有时候不希望多线程同时访问，因为可能会造成变量污染，于是引入了线程互斥访问，互斥的作用就是保证多线程串行访问共享资源。
2. 局部变量——如果设计的时候希望将某个变量设计为线程级别的，那典型做法是将其设计为函数的局部变量。可是，我如果又希望在线程执行时，这个线程用到的任意函数里面都可以访问到它。为了满足这个需求，又可能会想到用全局变量，但是，它又会使得这种访问域上升到进程级别。其实，我只是想在线程局部环境中，全局访问该变量而已。此时 TLS 应运而生，做到了这种**在线程局部环境（或者称呼为线程执行环境，线程上下文）下可以全局访问该变量的效果**。


####四、实际中如何正确使用？

在一个支持单进程，多线程的轻量级移动平台中，假设我实现了一个 APP Framework，每一个 APP 都单独运行在一个独立的线程中，APP 运行时关联了很多信息，比如打开的文件、引用的组件、启动的 Timer 等。我希望框架能实现自动垃圾回收，就是当应用退出时，即使该 APP 没有主动释放打开的文件句柄，没有主动 cancel Timer，没有主动释放组件的引用，框架也可以自动完成这些收尾工作，否则，必定会造成内存耗尽（内存泄露）。 

假设 APP 退出时调用了框架的 ExitApp API，该 API 允许 APP 调用后关闭自己，也允许关闭别的 APP。 那么，假设该 API 触发了 APP 的退出，最终调用到框架的 App_CleanUp() 函数，那么 App_CleanUp() 函数除了完成 APP 本身实例的释放外，肯定也要将那些文件句柄啊、Timer 啊、组件等资源释放掉。怎么来做呢？如果理解了上面的 ThreadLocal 的概念， 很明显这里可以使用 TLS。具体方法如下：

1. 在 Framework 的 API 中，当 APP 的线程启动时，new 一个 AppContext 的对象，然后将对象的指针以 TLS 的方式存储起来。而这个 AppContext 内部包含了文件句柄，timer引用，组件引用等等。
2. 后续任何框架的文件操作/Timer操作/组件使用，都可以取当前线程的 TLS，然后拿出 AppContext，将更新的文件句柄、Timer、组件使用等更新在 AppContext 对象内部。
3. 应用退出时获取 TLS，拿到 AppContext，取出 AppContext 中的文件句柄，组件引用，Timer引用等完成清理工作。

####五、有什么缺点？有危险吗？

听说有内存泄露，但是感觉不会。因为 ThreadLocal 是和 Thread 绑定的，线程死亡的时候，作为线程的属性，是肯定会被清理的啊。怎么会造成内存泄露呢？（因为 ThreadLocal 是线程内部的嘛）看了一些资料是这样说的：

* [ThreadLocal & Memory Leak](http://stackoverflow.com/questions/17968803/threadlocal-memory-leak)
* [反驳:Threadlocal存在内存泄露](http://my.oschina.net/xpbug/blog/113444)
* [ThreadLocal内存泄露分析](http://liuinsect.iteye.com/blog/1827012)

有的说有泄露，有的说没泄露。。。。嗯，其实没有仔细看。等我仔细研究过再来总结。

---------------------先挖个坑--------------------