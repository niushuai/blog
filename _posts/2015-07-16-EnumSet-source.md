---
layout: post
title: EnumSet 源码剖析
categories: Java
tags: EnumSet
---

###long long ago...

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

###EnumSet 从天而降

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

###EnumSet 源码赏析

擦，明天再赏。。。有点困了→_→