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

> 对于一些操作来说，返回值就那几个。对于整数来说，存入的数据也通常不会太大，所以redis通过**预分配一些常见的值对象，并在多个数据结构之间（很不幸，你得时指针才能指到这里）共享这些对象，避免了重复分配，节约内存。同时也节省了CPU时间**

如图所示：

![共享对象](http://redisbook.readthedocs.org/en/latest/_images/graphviz-10fd6efbb50d4f8410ec42a39fa72d7247f90b4d.svg)

三个列表的值分别为：

* 列表 A ： [20130101, 300, 10086] 
* 列表 B ： [81, 12345678910, 999] 
* 列表 C ： [100, 0, -25, 123]

最后一个：redis对对象的管理是通过最原始的引用计数方法。

##2. 字符串

字符串是redis使用最多的数据结构，除了本身作为SET/GET的操作对象外，**数据库中的所有key，以及执行命令时提供的参数，都是用字符串作为载体的。**

在上面的图中，我们可以看见，字符串的底层可以有两种实现：

1. REDIS_ENCODING_INT使用long类型保存long的值
2. REDIS_ENCODING_ROW使用sdshdr保存sds、long long、double、long double等

说白了就是除了long是通过第一种存储以外，其他类型都是通过第二种存储滴。

然后新创建的字符串，都会默认使用第二种编码，在将字符串作为键或者值保存进数据库时，程序会尝试转为第一种（为了节省空间）

##3. 哈希表

哈希表，嗯，其实我更愿意叫做Map。它的底层实现也有两种：

* REDIS_ENCODING_ZIPLIST
* REDIS_ENCODING_HT(字典)

当创建新的哈希表时，默认是使用压缩列表作为底层数据结构的，因为省内存呀。只有当触发了阈值才会转为字典：

* 哈希表中某个键或者值的长度大于server.hash_max_ziplist_value（默认为64）
* 压缩列表中的节点数量大于server.hash_max_ziplist_entries(默认为512)

##4. 列表

列表嘛，其实就是队列。它的底层实现也有2种：

* REDIS_ENCODING_ZIPLIST
* REDIS_ENCODING_LINKEDLIST

当创建新的列表时，默认是使用压缩列表作为底层数据结构的，还是因为省内存- -。同样有一个触发阈值：

* 试图往列表中插入一个**字符串值**，长度大于server..list_max_ziplist_value(默认是64)
* ziplist包含的节点超过server.list_max_ziplist_entries(默认值为512)

### 阻塞命令

对于列表，基本的操作就不介绍了，因为列表本身的操作和底层实现基本一致，所以我们可以简单的认为它具有双端队列的操作即可。重点讨论一下列表的阻塞命令比较好玩。

当我们执行```BLPOP/BRPOP/BRPOPLPUSH```的时候，都可能造成客户端的阻塞，它们被称为**列表的阻塞原语**，当然阻塞原语并不是一定会造成客户端阻塞：

* 只有当这些命令作用于空列表，才会造成客户端阻塞
* 如果被处理的列表不为空，它们就执行无阻塞版本的LPOP/RPOP/RPOPLPUSH

上面两条的意思很简单，因为```POP```命令是删除一个节点，那么当没有节点的时候，客户端会阻塞直到一个元素添加进来，然后再执行```POP```命令，那么，对客户端的阻塞过程是这样的：

1. 将客户端的连接状态更改为“正在阻塞”，并记录这个客户端是被那些键阻塞（可以有多个），以及阻塞的最长时间
2. 将客户端的信息加入到字典server.db[i].blocking_keys中，i就是客户端使用的数据库编号
3. 继续保持客户端和服务器端的连接，但是不发送任何信息，造成客户端阻塞

响应的，解铃须有系铃人：

1. 被动脱离：有其他客户端为造成阻塞的键加入了元素
2. 主动脱离：超过阻塞的最长时间
3. 强制脱离：关闭客户端或者服务器

上面的过程说的很简单，但是在redis内部要执行的操作可以很多的，我们用一段伪代码来演示一下被动脱离的过程：

```
def handleClientsBlockedOnLists():

# 执行直到 ready_keys 为空
while server.ready_keys != NULL: 
    # 弹出链表中的第一个 readyList
    rl = server.ready_keys.pop_first_node() 
    # 遍历所有因为这个键而被阻塞的客户端
    for client in all_client_blocking_by_key(rl.key, rl.db):
    
        # 只要还有客户端被这个键阻塞,就一直从键中弹出元素
        # 如果被阻塞客户端执行的是 BLPOP ,那么对键执行 LPOP
        # 如果执行的是 BRPOP ,那么对键执行 RPOP
        element = rl.key.pop_element()
        if element == NULL:
            # 键为空,跳出 for 循环
            # 余下的未解除阻塞的客户端只能等待下次新元素的进入了 
            break
        else:
            # 清除客户端的阻塞信息
            server.blocking_keys.remove_blocking_info(client) 
            # 将元素返回给客户端,脱离阻塞状态
            client.reply_list_item(element)
```

至于主动脱离，更简单了，通过redis的cron job来检查时间，对于过期的blocking客户端，直接释放即可。伪代码如下：

```
def server_cron_job():

    # cron_job其他操作 ...
    
    # 遍历所有已连接客户端
    for client in server.all_connected_client:
    
        # 如果客户端状态为“正在阻塞”,并且最大阻塞时限已到达        
        if client.state == BLOCKING and \
        client.max_blocking_timestamp < current_timestamp(): 
        
        # 那么给客户端发送空回复, 脱离阻塞状态
        client.send_empty_reply()
        
        # 并清除客户端在服务器上的阻塞信息
        server.blocking_keys.remove_blocking_info(client)         
        
    # cron_job其他操作 ...
```

##5. 集合

这个就是set，底层实现有2种：

* REDIS_ENCODING_INTSET
* REDIS_ENCODING_HT(字典)

对于集合来说，和前面的2种不同点在于，集合的编码是**决定于第一个添加进集合的元素**：

1. 如果第一个添加进集合的元素是long long类型的，那么编码就使用第一种
2. 否则使用第二种

同样，切换也需要达到一个阈值：

* intset保存的整数值个数超过server.set_max_intset_entries(默认值为512)
* 从第二个元素开始，如果插入的元素类型不是long long的，就要转化成第二种

然后对于集合，有3个操作的算法很好玩，但是因为没用到过，就暂时列一下：

* 求交集
* 求并集
* 求差集

##6. 有序集

终于看到最后一个数据结构了，虽然只有5个- -。。。。首先从命令上就可以区分这几种了：

* GET/SET是字符串
* H开头的是哈希表
* L开头的是列表
* S开头的是集合
* Z开头的是有序集

继续说有序集，这个东西我还真的没用过。。。其他最起码都了解过，这个算是第一次接触。现在看来，它也算一个sort过的map，sort的依据就是score，对score排序后得到的集合。

首先还是底层实现，有2种：

* REDIS_ENCODING_ZIPLIST
* REDIS_ENCODING_SKIPLIST

这个竟然用到了跳跃表，不用这个的话，跳跃表好像都快被我忘了呢。。对于编码的选择，和集合类似，也是决定于第一个添加进有序集的元素：

* 如果满足：1.服务器属性server.zset_max_ziplist_entries值大于0（默认为128）2.元素的member长度小于服务器属性server.zset_max_ziplist_value(默认为64)，就以第一种作为底层数据结构
* 否则使用第二种

对于编码的转换阈值是这样的：

* ziplist保存的元素数量超过服务器属性server.zset_max_ziplist_entries的值（默认为128）
* ziplist的元素长度大于服务器属性server.zset_max_ziplist_value(默认为64)

那我们知道，如果有序集是用ziplist实现的，而ziplist终对于member和score是按次序存储的，如member1,score1,member2,score2...这样的。那么，检索时候就蛋疼了，肯定是O(N)复杂度，既然这样，效率一下子就没有了。庆幸的是，转换成跳跃表之后，redis搞的很高明：

> 它用一个字典和一个跳跃表同时来存储有序集的元素，而且因为member和score是在内存区域其字典有指针，就可以共享一块内存，不用每个元素复制两份。

**通过使用字典结构,并将 member 作为键,score 作为值,有序集可以在 O(1) 复杂度内**: 

* 检查给定member是否存在于有序集(被很多底层函数使用)
* 取出 member 对应的 score 值(实现 ZSCORE 命令)

**通过使用跳跃表**,可以让有序集支持以下两种操作:

* 在 O(logN) 期望时间、O(N) 最坏时间内根据 score 对 member 进行定位(被很多底层函数使用)
* 范围性查找和处理操作,这是(高效地)实现 ZRANGE 、ZRANK 和 ZINTERSTORE等命令的关键

通过同时使用字典和跳跃表,有序集可以高效地实现按成员查找和按顺序查找两种操作。所以，对于有序集来说，redis的思路确实是很流弊的。

##7. 总结

上面几个小节讲述了redis的数据结构的底层实现，但是没有涉及到具体的命令，如果调研后发现redis的某种数据结构满足需求，就可以对症下药，去查看redis对应的API即可。
