---
layout: post
title: run() 和 start() 的区别
categories: Java
tags: Thread
---

在看《TIJ》线程这一章时，遇到一个问题，简单描述一下：

> Runnable 是一个定义任务的接口，Thread 是一个执行任务的类。那么调用 run()和 start()都能执行，那这两者有什么区别呢？

下面是结合书上和网上的资料找到的答案。

首先，线程的出现是为了更好的利用 CPU。这点是线程出发的根本。

---

通过调用 Thread 类的 start() 方法是用来启动一个新线程，这个线程启动后处于**就绪状态**，并没有运行。然后通过该 Thread 对象调用方法 run()来完成其任务，这里方法 run()称为线程体，它包含了这个线程要执行的任务，run()方法运行结束，这个线程就处于终止状态，CPU 通过调度算法运行其它线程的任务。 

而如果直接用 run()方法，这只是**调用一个普通方法**而已，程序中依然只有主线程(一般为 main)--这**一个**线程，其程序执行顺序还是顺序执行，这样就没有达到用线程完成并发的目的。 

下面是我自己想的一个验证例子，想法很简单，每个任务（包含Runnable 任务和 main-thread 任务）都做两件事，一件是重要的，一件是不重要的。重要的事情一般都做的特别快，所以是几百毫秒；而对于不重要的事，大家都会拖延，所以我假设为秒级别的。

Tips：

> `Thread.yield()`方法是对*线程调度器*的一种建议，它表明：当前 Java 线程已经执行完生命周期中最重要的部分了，此刻可以切换给其他线程执行重要或者紧急的任务。当然，这仅仅是一种建议，就跟 finalize()方法不一定会执行一样。CPU 如果比较空闲，就不会切换，因为上下文切换也会有一定的代价；反之，如果 CPU 比较繁忙，且有重要或紧急的任务，切换上下文的代价远小于执行任务带来的性能提升，那么 CPU 就会听取 yield 的建议。所以，记住：**对于任何重要的控制或在调整应用时，都不能依赖于 `Thread.yeild()`**

下面就 show code 吧:

{% highlight java linenos %}
package Chapter21;

import java.util.concurrent.TimeUnit;

class TestRunnalbe implements Runnable {
	@Override
	public void run() {
		System.out.println("runnable do important thing(200ms)...");
		try {
			TimeUnit.MILLISECONDS.sleep(200);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("runnable important thing done...");
		
		System.out.println("runnable do useless thing(3s)...");
		Thread.yield();
		try {
			TimeUnit.MILLISECONDS.sleep(3000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("runnable useless thing done...");
	}
}

class TestStart implements Runnable {
	@Override
	public void run() {
		System.out.println("start do important thing(200ms)...");
		try {
			TimeUnit.MILLISECONDS.sleep(200);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("start important thing done...");
		
		System.out.println("start do useless thing(2s)...");
		Thread.yield();
		try {
			TimeUnit.MILLISECONDS.sleep(2000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("start useless thing done...");
	}
}

/**
 * 
 * @author niushuai
 * 里面一个是只用到 Runnable，一个是用 Thread 驱动的 Runnable
 * 我们看输出就可以明白大概了。
 */
public class TestRunAndStart {
	public static void main(String[] args) {
		TestRunnalbe testRunnalbe = new TestRunnalbe();
		
		
		testRunnalbe.run();
		System.out.println("main do important thing(400ms)...");
		try {
			TimeUnit.MILLISECONDS.sleep(400);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("main important thing done...");
		
		System.out.println("main do useless thing(4s)...");
		Thread.yield();
		try {
			TimeUnit.MILLISECONDS.sleep(4000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("main useless thing done...");
		
		System.out.println("\n");
		
		Thread thread = new Thread(new TestStart());
		thread.start();
		System.out.println("main do important thing(300ms)...");
		try {
			TimeUnit.MILLISECONDS.sleep(300);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("main important thing done...");
		
		System.out.println("main do useless thing(3s)...");
		Thread.yield();
		try {
			TimeUnit.MILLISECONDS.sleep(3000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("main useless thing done...");
	}
}/*output:
runnable do important thing(200ms)...
runnable important thing done...
runnable do useless thing(3s)...
runnable useless thing done...
main do important thing(400ms)...
main important thing done...
main do useless thing(4s)...
main useless thing done...


main do important thing(300ms)...
start do important thing(200ms)...
start important thing done...
start do useless thing(2s)...
main important thing done...
main do useless thing(3s)...
start useless thing done...
main useless thing done...
*/
{% endhighlight java %}

从输出可以明显看出：

* 执行 testRunnable.run() 方法和 main-thread()完全就是一个线程，那就是 main 线程。所以整个流程是顺序执行的
* 用 Thread 驱动的 testStart 就不一样了，它启动了一个新的线程，我们可以看到，main 执行了重要的事情后，start 也执行了重要的事情，这就保证了优先级。然后两者的重要事情做完之后再完成不重要的事情，这样就提高了系统的整体效率。

其实根据这个例子，我们可以改变 important thing 的时间，来看看时间片轮转策略是否会跟我们预想的一致。这个跟环境、平台都有关系，有兴趣的可以自己做做实验。这样应该能对多线程如何分配时间有个大概的了解吧。