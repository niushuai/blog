---
layout: post
title: Java编程思想 - 第二十一章、新类库中的构件（六）
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

嗯，发现一共是7个构件，现在从**文档**出发，逐个概览一下（Mac 下有 Dash 这样的神器真是幸福啊，hiahiahiahia~）

* CountDownLatch：名字直译为——倒计时锁。官方文档的描述是 A synchronization aid that allows one or more threads to wait until a set of operations being performed in other threads completes.[一个线程同步辅助工具，可以让一个或多个线程等待直到其它线程的任务全部完成才会被唤醒。]
* CyclicBarrier：和上面那个功能相似，只是上面的倒计时数值不能被重置，只能递减到0停止；而 CyclicBarrier 可以在倒计时数值不为0的时候重置为新的值
* DelayQueue：无界的 BlockingQueue（前面生产者-消费者讲过哦），用于放置实现了 Delayed interface 的对象，其中的对象只能在到期时才能在队列中取走。**这种队列是有序的，即队头对象的延期到期的时间最长。**
* PriorityBlockingQueue：优先队列的 BlockingQueue，具有可阻塞的读取操作。其实就是 BlockingQueue 的优先队列实现
* 使用 ScheduledExecutor 的温室控制器：
* Semaphore：正常的锁（concurrent.Lock 或者 synchronized）在任何时刻都只能允许一个任务访问资源，而 **Semaphore （计数信号量）允许 N 个任务同时访问这个资源。**（是不是有池子的感觉嘞？？）
* Exchanger：两个任务之间交换对象的栅栏。意思是各自拥有对象，离开栅栏时，就拥有对方持有的对象了。典型就是一个任务生产对象，一个任务消费对象。（值得思考，为啥要交换？我直接用一个容器或者 BlockingQueue 完全可以解耦啊，这个到底用在哪里？）

###二、代码来了

下面给每个构件都写个小例子，然后总结一下它们产生的原因和最佳使用场景。go go go!!

####1. CountDownLatch

其实看文档已经足够了。。。。所以先来看一下文档：

> A synchronization aid that allows one or more threads to wait until a set of operations being performed in other threads completes.
> 
> A CountDownLatch is initialized with a given count. The `await` methods block until the current count reaches zero due to invocations of the `countDown()` method, after which all waiting threads are released and any subsequent invocations of `await` return immediately. **This is a one-shot phenomenon -- the count cannot be reset. If you need a version that resets the count, consider using a CyclicBarrier【和 CyclicBarrier 的区别】**.
> 
> A CountDownLatch is a versatile(多功能的) synchronization tool and can be used for a number of purposes. A CountDownLatch initialized with a count of one serves as a simple on/off latch, or gate: all threads invoking `await` wait at the gate until it is opened by a thread invoking `countDown()`. A CountDownLatch initialized to N can be used to make one thread wait until N threads have completed some action, or some action has been completed N times.【这里是使用场景：count=1为开关；count=N 重复 N 次】
> 
> A useful property of a CountDownLatch is that it doesn't require that threads calling countDown wait for the count to reach zero before proceeding, it simply prevents any thread from proceeding past an `await` until all threads could pass.

























