---
layout: post
title: Java编程思想 - 第二十一章、并发（八）
categories: Java
tags: Java编程思想
---

###21.9 性能调优

这个小节主要讲的是优化，但是高德纳不是说过嘛——Premature optimization is the root of all evil.所以等到真正发现有问题再仔细研究，现在看看估计就忘了。所以我先大概了解一下关于锁的问题，其他等遇到具体场景再说：）

####1. 免锁容器

书中上来就先道出了免锁容器背后的通用策略：

> 对容器的修改可以与读操作同时发生，只要读取者只能看到完成修改的结果即可。**修改是在容器数据结构的某个部分的一个单独的副本（比如 ConcurrentHashMap 分段锁表，那么就是一段的副本，有时是整个数据结构的副本）上执行的**，并且这个副本在修改过程中是**不可视**的（不然读成脏数据了）。只有当修改完成时，被修改的结构才会自动地与主数据结构进行交换，之后读取者就可以看到这个修改了。

然后作者写了一个测试框架，旨在比较加锁容器和免锁容器在性能上的差异。很明显，免锁容器去掉了获取、销毁锁的开销，肯定会有性能的提升....

如果有兴趣，建议搜索一下 ConcurrentHashMap 相关的文章，知道它为什么能用于并发场景（因为有 N 个Segement 重入锁，每个 Segement 锁管理一个 HashEntry 数组），实现的效率如何（分段锁表而非锁整表），有什么弱点（弱一致性）？网上有很多分析源码的文章，大概了解一下原理也不是什么难事。

####2. 乐观加锁

这一点主要讲了乐观锁和悲观锁，但是讲的太少，去网上搜索了一下，效果也不是很好，都是抄的。。。。。我只能大概说下他们的基本意思，具体的话等去问问同事。来源：[乐观锁与悲观锁的区别](http://www.cnblogs.com/Bob-FD/p/3352216.html)

先说明为什么需要锁呢？在多用户环境中，在同一时间可能会有多个用户更新相同的记录，这会产生冲突。这就是著名的并发性问题。典型的冲突有：

* 丢失更新：一个事务的更新覆盖了其它事务的更新结果，就是所谓的更新丢失。例如：用户A把值从6改为2，用户B把值从2改为6，则用户A丢失了他的更新。
* 脏读：当一个事务读取其它完成一半事务的记录时，就会发生脏读取。例如：用户A,B看到的值都是6，用户B把值改为2，用户A读到的值仍为6。

为了解决这些并发带来的问题。 我们需要引入并发控制机制。

最常用的处理多用户并发访问的方法是加锁。当一个用户锁住数据库中的某个对象时，其他用户就不能再访问该对象。加锁对并发访问的影响体现在锁的粒度上。比如，放在一个表上的锁限制对整个表的并发访问；放在数据页上的锁限制了对整个数据页的访问；放在行上的锁只限制对该行的并发访问。可见行锁粒度最小，并发访问最好，页锁粒度最大，表锁介于2者之间。

* 悲观锁：假定会发生并发冲突，屏蔽一切可能违反数据完整性的操作。[1]      悲观锁假定其他用户企图访问或者改变你正在访问、更改的对象的概率是很高的，因此在悲观锁的环境中，在你开始改变此对象之前就将该对象锁住，并且直到你提交了所作的更改之后才释放锁。悲观的缺陷是不论是页锁还是行锁，加锁的时间可能会很长，这样可能会长时间的限制其他用户的访问，也就是说悲观锁的并发访问性不好。
* 乐观锁：假设不会发生并发冲突，只在提交操作时检查是否违反数据完整性。[1] 乐观锁不能解决脏读的问题。    乐观锁则认为其他用户企图改变你正在更改的对象的概率是很小的，因此乐观锁直到你准备提交所作的更改时才将对象锁住，当你读取以及改变该对象时并不加锁。可见乐观锁加锁的时间要比悲观锁短，乐观锁可以用较大的锁粒度获得较好的并发访问性能。但是如果第二个用户恰好在第一个用户提交更改之前读取了该对象，那么当他完成了自己的更改进行提交时，数据库就会发现该对象已经变化了，这样，第二个用户不得不重新读取该对象并作出更改。这说明在乐观锁环境中，会增加并发用户读取对象的次数。

下面通过一个小例子来说明 AtomicInteger 的乐观锁使用：

{% highlight java linenos %}
package concurrency;

import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

// 模拟遗传算法
public class FastSimulation {
	// 有10万个基因
    static final int N_ELEMENTS = 100000;
    // 每个基因长度为30
    static final int N_GENES = 30;
    //一共进化50次
    static final int N_EVOLVERS = 50;
    static final AtomicInteger[][] GRID = new AtomicInteger[N_ELEMENTS][N_GENES];

    static Random rand = new Random(47);

    static class Evolver implements Runnable {
        public void run() {
            while (!Thread.interrupted()) {
                int element = rand.nextInt(N_ELEMENTS);
                for (int i = 0; i < N_GENES; i++) {
                    int previous = element - 1;
                    if (previous < 0) {
                        previous = N_ELEMENTS - 1;
                    }
                    int next = element + 1;
                    if (next >= N_ELEMENTS) {
                        next = 0;
                    }

                    int oldValue = GRID[element][i].get();
                    // 前后三值取平均值
                    int newValue = oldValue + GRID[previous][i].get() + GRID[next][i].get();
                    newValue /= 3;

                    // 如果 GRID[element][i]的值已经发生变化（不和 oldValue 相同）， 就返回 false 失败，进行
                    // 对应的失败操作，这里只是打印一下。
                    if (!GRID[element][i].compareAndSet(oldValue, newValue)) {
                        System.out.println("Old value changed from " + oldValue + " to " + GRID[element][i]);
                    }
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        ExecutorService exec = Executors.newCachedThreadPool();
        for (int i = 0; i < N_ELEMENTS; i++)
            for (int j = 0; j < N_GENES; j++)
                GRID[i][j] = new AtomicInteger(rand.nextInt(1000));

        // 进化50次
        for (int i = 0; i < N_EVOLVERS; i++)
            exec.execute(new Evolver());

        TimeUnit.SECONDS.sleep(5);
        exec.shutdownNow();
    }
}
{% endhighlight java %}


####3. ReadWriteLock

####4. 