---
layout: post
title: EnumSet 源码剖析
categories: Java
tags: EnumSet
---

### long long ago...

在很久以前，盘古开天辟地，女娲补天……咳咳，跑题了= =现在 PM大大提出了一个这样的需求:

> 一条高速公路全长 N 公里，每隔一段距离 M 有一个路灯，那么总的路灯数量就是 N / M * 2(路的两边都有)。既然是灯，只有两种状态：开/关。鉴于节能环保精神，有一个自动检测公路车流量的系统，如果某个路段车流量较少，这段路灯就可以关闭了。如果车流量增加，路灯就要全部打开。总的来说就是，要把某个路灯进行开关操作。

既然路灯状态只有两种，很自然想到 Boolean 类型。那么对于路灯，我们可以用数组来表示：

{% highlight java linenos %}
public class LightControl {
    // 默认全部关闭
    private Boolean[] lightStatus;

    LightControl(int size) {
        lightStatus = new Boolean[size]();
    }

    public boolean checkSetUp(int index) {
        return lightStatus[index] == true;
    }

    public boolean checkSetDown(int index) {
        return lightStatus[index] == false;
    }
}
{% endhighlight java %}

这样系统运行了一段时间发现，随着道路增多，路灯数量急剧上升。系统性能越来越差，所以需要优化系统。既然路灯数目太多，lightStatus 数组占用的内存将会非常大。那么，如何减少内存的使用呢？很简单，每一个路灯其实用一个比特即可表示。那么，我们可以使用 int 或者 long 来表示32个路灯或者64个路灯的状态，这样内存一下子就减少到原来的十分之一。那么，程序可能变成这样：

{% highlight java linenos %}
public class LightControl {
    // 默认全部关闭
    private int[] lightStatus;

    LightControl(int size) {
        lightStatus = new int[size]();
    }

    public int checkSetUp(int index) {
        // 通过位运算定位 index 路灯在数组哪个元素的哪个比特位,然后对这个比特位进行或运算判断
    }

    public int checkSetDown(int index) {
        // 通过位运算定位 index 路灯在数组哪个元素的哪个比特位,然后对这个比特位进行与运算判断
    }
}
{% endhighlight java %}

这样程序性能应该会有明显的提升。但是缺点也显而易见：

1. 可读性变得很差，因为位运算是很晦涩难懂的
2. 修改代码非常容易出错
3. 每个比特无法透漏该比特位代表的含义

### EnumSet 从天而降

Java SE5引入了 EnumSet，是**为了通过 enum 创建一种替代品，以替代传统的基于 int 的“位标志”。**

这种标志可以用来表示某种“开/关"信息，不过，使用这种标志，我们最终操作的只是一些 bit，而不是这些 bit 想要表达的概念，因此很容易写出令人难以理解的代码。既然想替代，肯定不能在关键点上无所作为。EnumSet 的设计充分考虑到了速度因素，因为它必须与非常高效的 bit 标志相竞争（其操作与 HashSet 相比，非常地快）。其内部实现也非常巧妙，这个我们一会再说。总之，使用 EnumSet 的优点是：

> 它在说明一个二进制位是否存在时，具有更好的表达能力，并且无需担心性能。

那首先呢，先上个demo。演示一下如何使用 EnumSet：

{% highlight java linenos %}
import static Chapter19.AlarmPoints.*;

import java.util.EnumSet;

// 大楼中放置警报传感器的位置
enum AlarmPoints {
    STAIR1, STAIR2, LOBBY, OFFICE1, OFFICE2, OFFICE3, OFFICE4, BATHROOM, UTILITY, KITCHEN;
}

public class _25_EnumSets {
    public static void main(String[] args) {
        EnumSet<AlarmPoints> points = EnumSet.noneOf(AlarmPoints.class); // Empty set

        points.add(BATHROOM);
        System.out.println(points);

        points.addAll(EnumSet.of(STAIR1, STAIR2, KITCHEN));
        System.out.println(points);

        points = EnumSet.allOf(AlarmPoints.class);
        System.out.println(points);

        points.removeAll(EnumSet.of(STAIR1, STAIR2, KITCHEN));
        System.out.println(points);

        // 将[OFFICE1.ordinal()到 OFFICE2.ordinal()]删除, range 是闭区间
        points.removeAll(EnumSet.range(OFFICE1, OFFICE2));
        System.out.println(points);

        // 取complementOf()中参数 EnumSet 的补集
        points = EnumSet.complementOf(points);
        System.out.println(points);

    }
}
{% endhighlight java %}

你会发现，EnumSet 真的很棒啊，因为它既实现了功能，又提供了和 bit 操作一样的性能，同时还屏蔽了位操作带来的晦涩难懂的代码。而且提供的功能很多，非常方便。那么，它是怎么实现的呢？下面就来揭开它的面纱。

### EnumSet 源码赏析

看 EnumSet 的源码总共加起来有1个半小时的样子，其实代码量很少。。但是写的很精彩，也学习/复习了不少的知识，收获还是挺大的，先罗列一下学到的东西：

1. 原码、反码、补码的用法，以及三者存在的必要（思考：为啥计算机内部不直接用原码，而又提出了反码，补码？）
2. Java 位移操作符。左移"<<"，有符号右移">>"，无符号右移">>>"（思考：有符号右移和无符号右移有什么区别？为啥没有无符号左移？）
3. `RegularEnumSet.add()和RegularEnumSet.remove()`实现（思考：将二进制某位置1后，如何判断操作是否成功？）
4. `RegularEnumSet.size()`算法（思考：如何求一个二进制数中1的个数）
5. `RegularEnumSet.addAll()`算法
6. `Long.rotateLeft()和 Long.rotateRight()`实现（思考：如何将一个二进制位循环左移 or 右移？）
7. `RegularEnumSet.next()`实现（思考：如何求出二进制数最后一个不为0数的位置？） 
8. `Long.numberOfTrailingZeros()`实现（思考：如何求出二进制数最右边连续0的个数？）

嗯，上面我把时间也给出了：1个半小时。感觉还是自己琢磨理解的更深，所以强烈建议自己搞定上面的问题后再看我的分析（其实搞定了也就完全不用看了= =）。。。

#### 整体概览

再次重复一下 EnumSet 的着力点：

> 为了通过 enum 创建一种替代品，以替代传统的基于 int 的“位标志”。

既然 EnumSet 是 Enum + Set的综合体，那么基本的操作有：添加元素、删除元素、取得 Set 的大小、遍历 Set。而这些全部都是由位运算实现的。所以要想彻底搞懂，必须先把位运算的相关知识都弄清楚。。。我就是因为很久没玩过位操作，所以还得当场复习，⊙﹏⊙b汗...

嗯，首先来说。EnumSet 的定义为：`public abstract class EnumSet<E extends Enum<E>> extends AbstractSet<E>
    implements Cloneable, java.io.Serializable`，可以看出 EnumSet 只是一个抽象类，它的实现有两个：

* RegularEnumSet：当 set 元素小于等于64个时
* JumboEnumSet：当 set 元素大于64个时

咦，这个64是什么鬼？哦，原来是 EnumSet 内部用的 Long 来进行位操作，RegularEnumSet应用于一个 Long 元素的 set，很显然 JumboEnumSet 是应用于一个 Long[]元素的 set 喽。整体而言 位移操作都是一样的，只不过 JumboEnumSet 是数组类型的位移操作。这里我们主要学习一下位移操作即可，所以后面的代码都是**取自 RegularEnumSet。**

#### 1. 原码、反码、补码

不重复造轮子了，google 了一篇”不错“的文章：[原码, 反码, 补码 详解](http://www.cnblogs.com/zhangziqiu/archive/2011/03/30/computercode.html)。之所以加引号，是因为评论里有几个说楼主的理解大部分都是错的= =（38楼评论）额，附上38楼提供的 wiki：[Signed number representations](https://en.wikipedia.org/wiki/Signed_number_representations)

#### 2. Java 位移操作符

[Oracle官方文档](http://docs.oracle.com/javase/specs/jls/se7/html/jls-15.html#jls-15.19)

#### 3. 增删操作

看过位移操作后，再看 RegularEnumSet 的增删函数就非常简单了，比较有意思的是这个类判断元素是否添加/删除成功的方法是这么实现的：

{% highlight java linenos %}
public boolean add(E e) {
        typeCheck(e);

        long oldElements = elements;
        elements |= (1L << ((Enum<?>)e).ordinal());
        return elements != oldElements;
}
{% endhighlight java %}

同样，remove()函数中，它是这么实现的：

{% highlight java linenos %}
public boolean remove(Object e) {
        if (e == null)
            return false;
        Class<?> eClass = e.getClass();
        if (eClass != elementType && eClass.getSuperclass() != elementType)
            return false;

        long oldElements = elements;
        elements &= ~(1L << ((Enum<?>)e).ordinal());
        return elements != oldElements;
}
{% endhighlight java %}

判断元素有没有添加/删除成功，并不是去判断对应比特位上的数是0还是1，而是看添加/删除后elements数值有没有变化，这种方法在有大量添加/删除操作的场景中能发挥一定的作用，以后可以借鉴。

#### 4. EnumSet.size()

怎么感觉像看算法题呢。。。这个说白了就是求 Long 的二进制中1的个数。编程之美里面有：[二进制中1的个数](http://www.newsjz.com/wxqgr/xxas/UploadFiles_3822/201107/2011072622450875.pdf)

但这里使用的不是编程之美的方法，而是使用了另外一种归并思路的算法:

{% highlight java linenos %}
public static int bitCount(long i) {
        // HD, Figure 5-14
        i = i - ((i >>> 1) & 0x5555555555555555L);
        i = (i & 0x3333333333333333L) + ((i >>> 2) & 0x3333333333333333L);
        i = (i + (i >>> 4)) & 0x0f0f0f0f0f0f0f0fL;
        i = i + (i >>> 8);
        i = i + (i >>> 16);
        i = i + (i >>> 32);
        return (int)i & 0x7f;
}
{% endhighlight java %}

具体的算法可以 google 一下，很多解释的。基本思想是把二进制中相邻位相加，然后以2位为单位再合并，再4位合并……直到把所有位都合并了。

#### 5. addAll()

如果调用 `EnumSet.allOf()`，那么在枚举类元素小于64时会调用RegularEnumSet中的addAll()函数，addAll()函数的实现只有一行：

{% highlight java linenos %}
/**
 * 【在 RegularEnumSet 中定义】Bit vector representation of this set.  The 2^k bit indicates the
 * presence of universe[k] in this set.
 */
private long elements = 0L;

/**
 * 【在 EnumSet 中定义】All of the values comprising T.  (Cached for performance.)
 */
final Enum<?>[] universe;

void addAll() {
        if (universe.length != 0)
            elements = -1L >>> -universe.length;
}
{% endhighlight java %}

其中有两个属性，elements就是 RegularEnumSet中存储元素位的信息，而具体的enum 实例是存放在 universe。使用中，操作都针对 elements，需要 enum 实例的时候，通过 elements 获得下标，然后访问 universe 取值即可。当然，怕有人没仔细看无符号右移的文档，我这里略微提下吧。移位操作符左边如果是int类型，则操作符右边的数只有低5位有效（右边的数会首先与0x1f做AND运算），如果操作符左边是long类型，右边的数就只取低6位为有效位。（你问为什么？一个 int 最高只有32位，你移动38位是什么鬼？long 同理）

现在，如果 universe 有元素的情况，就需要更新 elements 的比特位，比如 universe 中有6个元素，那么需要右移0x3a,也就是58位。推广开来，如果 universe 有 N 个元素，那么就将-1L 右移64-N 位，结果正好是低 N 位全是1，高位全是0.

知道了这个技巧，我们就延伸一下，看看 Long 是如何运用这个 trick 的。

#### 6. rotateLeft()/rotateRight()

在 Long 中有两个方法使用了同样的技巧：

{% highlight java linenos %}
public static long rotateLeft(long i, int distance) {
    return (i << distance) | (i >>> -distance);
}
public static long rotateRight(long i, int distance) {
    return (i >>> distance) | (i << -distance);
}
{% endhighlight java %}

很巧妙吧，将 i 左移 distance 位后和 i 右移64-distance 位的结果进行或运算。巧妙的完成了循环移动！额，怕有人看不明白（估计没人比我还笨，嗯，一定是这样 T_T），举个例子好了：

> 假如 i 只有8比特，1010 0000，那么循环左移2位的结果就是 10 0000 10.明白了吧！！！擦，要是我自己想。。。肯定写不出来这么简洁优雅的代码。。。

#### 7. next()

对于 next 而言，首先我们需要拿到 elements 中迭代器当前元素的下一个非0比特位，又因为使用 Long 类型从低到高存储枚举是否在 set 中，**同时EnumSet 的 enum 实例顺序必须和枚举类声明顺序一致，**所以必须从低位到高位遍历elements 的比特位。也就是说要找到二进制数**最右边的1的比特位**，那下一次要找的就是二进制数中倒数第二个为1的比特位。这么一想，还是挺麻烦的。。。。看了下实现，服！

{% highlight java linenos %}
public E next() {
    if (unseen == 0)
        throw new NoSuchElementException();
    lastReturned = unseen & -unseen; // unseen & -unseen 可获得二进制最右边非0位的十进制表示
    unseen -= lastReturned; // 减去就代表访问过了，原值用 lastReturned 维护
    return (E) universe[Long.numberOfTrailingZeros(lastReturned)]; // Long那个方法返回二进制数最右边连续多少位为0，本质就是计算下标
}
{% endhighlight java %}

这里面对 elements 的遍历和代码组织都是非常清晰的（一个函数只完成一个功能，短小精悍）：

1. 首先要找到下一个在 set 中的 enum 实例。elements 代表枚举的状态，0代表不在 set 中，1代表在 set 中。显然我们遍历的是为1的状态
2. unseen & -unseen 可获得二进制最右边第一个非0比特位的十进制表示
3. 用 lastReturned 维护，因为整个遍历的索引都靠 unseen维护，它是变化的
4. lastReturned 维护以后，unseend 就可以减去lastReturned，表示已经访问过 lastReturned 代表的那个元素
5. lastReturned 代表的是elements 最右边1的比特位的十进制数，我们看它左边有几个0就代表它在第几位。比如1000，左边3个0，就代表它的下标是3（uniserse 数组从0开始哦）
6. 从 universe 中取出 enum 实例即可

感觉设计的真是好。。看来以后要多看 jdk 的源码，比如集合类、concurrent 包下面的。。。。