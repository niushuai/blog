---
layout: post
title: Redis设计与实现（三）、Redis数据类型
categories: redis
tag: redis
---

##前言

这一章主要是讲redis内部的数据结构是如何实现的，可以说是redis的根基，前面2章介绍了redis的内部数据结构：

* 简单动态字符串sds
* 双端链表
* 字典
* 跳跃表

redis的内存映射数据结构：

* 整数集合
* 压缩列表ziplist

而这一章，就是具体将这些数据结构是如何在redis中工作的。

##1. 总观redis内部实现

一张图说明问题的本质：

![redis内部数据架构](http://redisbook.readthedocs.org/en/latest/_images/graphviz-243b3a1747269b8e966a9bdd9db2129d983f2b23.svg)

之后，我们再根据这张图来说明redis中的数据架构为什么是酱紫滴。前面我们已经说过，redis中有5种数据结构，而它们的底层实现都不是唯一的，所以怎样选择对应的底层数据支撑呢？这就需要“多态”的思想，但是因为redis是C开发的。所以通过结构体来模仿对象的“多态”（当然，本质来说这是为了让自己能更好的理解）。

为了完成这个任务，redis是这样设计的：

* redisObject对象
* 基于redisObject对象的类型检查
* 基于redisObject对象的显式多态函数
* 对redisObject进行分配、共享和销毁的机制

下面看下redisObject的定义：

```
/*
 * Redis 对象
 */
typedef struct redisObject {

    // 类型
    unsigned type:4;

    // 对齐位
    unsigned notused:2;

    // 编码方式
    unsigned encoding:4;

    // LRU 时间（相对于 server.lruclock）
    unsigned lru:22;

    // 引用计数
    int refcount;

    // 指向对象的值
    void *ptr;

} robj;
```

其中type、encoding、ptr是最重要的3个属性：

* type：redisObject的类型，字符串、列表、集合、有序集、哈希表
* encoding：底层实现结构，字符串、整数、跳跃表、压缩列表等
* ptr：实际指向保存值的数据结构

举个例子就是：

> 如果一个 redisObject 的 type 属性为 REDIS_LIST ， encoding 属性为 REDIS_ENCODING_LINKEDLIST ，那么这个对象就是一个 Redis 列表，它的值保存在一个双端链表内，而 ptr 指针就指向这个双端链表；
<br>
> 如果一个 redisObject 的 type 属性为 REDIS_HASH ， encoding 属性为 REDIS_ENCODING_ZIPMAP ，那么这个对象就是一个 Redis 哈希表，它的值保存在一个 zipmap 里，而 ptr 指针就指向这个 zipmap ；诸如此类。

所以，当执行一个操作时，redis是这么干的：

1. 根据key，查看数据库中是否存在对应的redisObject，没有就返回null
2. 查看redisObject的type是否和要执行的操作相符
3. 根据redisObject的encoding属性选择对应的数据结构
4. 返回处理结果

然后reids还搞了一个内存共享，这个挺赞的：

> 对于一些操作来说，返回值就那几个。对于整数来说，存入的数据也通常不会太大，所以redis通过**预分配一些常见的值对象，并在多个数据结构之间（很不幸，你得时指针才能指到这里）共享这些对象，避免了重复分配，节约内存。同时也节省了CPU时间

如图所示：

![共享对象](http://redisbook.readthedocs.org/en/latest/_images/graphviz-10fd6efbb50d4f8410ec42a39fa72d7247f90b4d.svg)

三个列表的值分别为：

* 列表 A ： [20130101, 300, 10086] 
* 列表 B ： [81, 12345678910, 999] 
* 列表 C ： [100, 0, -25, 123]

最后一个：redis对对象的管理是通过最原始的引用计数方法。
