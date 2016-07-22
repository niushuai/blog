---
layout: post
title: Redis设计与实现（五）、内部运作机制
categories: redis
tag: redis
---

## 前言

这一章是讲redis内部运作机制的，所以算是redis的核心。在这一章中，将会学习到redis是如何设计成为一个非常好用的nosql数据库的。下面我们将要讨论这些话题：

* redis是如何表示一个数据库的？它的操作是如何进行的？
* redis的持久化是怎样触发的？持久化有什么作用（memcache就没有）
* redis如何处理用户的输入？又试如何将运行结果返回给用户呢？
* redis启动的时候，都需要做什么初始化工作？传入服务器的命令又是以什么方法执行的？

带着这几个问题，我们就来学习一下redis的内部运作机制，当然，我们重点是学习它为什么要这样设计，这样设计为什么是最优的？有没有可以改进的地方呢？对细节不必太追究，先从整体上理解redis的框架是如何搭配的，然后对哪个模块感兴趣再去看看源码，好像2.6版本的代码量在5W行左右吧。

## 1. 数据库

嗯，好像一直用的都是默认的数据库。废话不说，直接上一个数据库结构：

```
typedef struct redisDb {
	//数据库编号
	int id;

	//保存数据库所有键值对数据，也成为键空间（key space）
	dict *dict;

	//保存着键的过期信息
	dict *expires;

	//实现列表阻塞原语，如BLPOP
	dict *blocking_keys;
	dict *ready_keys;

	//用于实现WATCH命令
	dict *watched_keys
}
```

主要来介绍3个属性：

* id：数据库编号，但是不是```select NUM```这个里面的，id这个属性是为redis内部提供的，比如AOF程序需要知道当前在哪个数据库中操作的，如果没有id来标识，就只能通过指针来遍历地址相等，效率比较低
* dict：因为redis本身就是一个键值对数据库，所以这个dict存放的就是整个数据库的键值对。键是一个string，值可以是redis五种数据结构的任意一种。**因为数据库本身是一个字典，所以对数据库的操作，基本都是对字典的操作**
* 键的过期时间：因为有些数据是临时的，或者不需要长期保存，就可以给它设置一个过期时间（当然，key不会同时存在在key space和expire的字典中，两者会公用一个内存块）

这其中比较好的一个是redis对于过期键的处理，我当时看到这里想，可以弄一个定时器，定期来检查expire字典中的key是否到了过期时间，但是这个定时器的时间间隔不好控制，长了的话已经过期的键还可以访问；短了的话，又注定会影像系统的性能。

* 定时删除：定时器方法，和我想法一致
* 懒惰删除：这个类似线段树的lazy操作，很巧妙（总算数据结构没白学啊。。。）
* 定期删除：上面2个都有短板，这个是结合两者的一个折中策略。它会定时删除过期key，但是会控制时间和频率，同时也会减少懒惰删除带来的内存膨胀

lazy机制：

> 当你不用这个键的时候，我才懒得删除。当你访问redis的某个key时，我就检查一下这个key是否存在在expire中，如果存在就看是否过期，过期则删除（优化是标记一下，直接返回空，然后定时任务再慢慢删除这个）；反之再去redis的dict中取值。但是缺点也有，如果用于不访问，内存就一直占用。加入我给100万个key设置了5s的过期时间，但是我很少访问，那么内存到最后就会爆掉。

所以，redis综合考虑后采用了懒惰删除和定期删除，这两个策略相互配合，可以很好的完成CPU和内存的平衡。

## 2. RDB

因为当前项目用到了这个，必须要好好看看啊。战略上藐视一下，就是redis数据库从内存持久化到文件的意思。redis一共有两种持久化操作：

* RDB
* AOF

逐个来说，先搞定RDB。

对于RDB机制来说，在保存RDB文件期间，主进程会被阻塞，直到保存成功为止。但是这也分两种实现：

* SAVE：直接调用rdbSave，阻塞redis主进程，直到保存完成，这完成过程中，不接受客户端的请求
* BGSAVE：fork一个子进程，子进程负责调用rdbSave，并在保存完成知乎向主进程发送信号，通知保存已经完成。因为是fork的子进程，所以主进程还是可以正常工作，接受客户端的请求

整个流程可以用伪代码表示：

```
def SAVE():

    rdbSave()


def BGSAVE():

    pid = fork()

    if pid == 0:

        # 子进程保存 RDB
        rdbSave()

    elif pid > 0:

        # 父进程继续处理请求，并等待子进程的完成信号
        handle_request()

    else:

        # pid == -1
        # 处理 fork 错误
        handle_fork_error()
```

当然，写入之后就是load了。当redis服务重启，就会将存在的dump.rdb文件重新载入到内存中，用于数据恢复，那么redis是怎么做的呢？

额，这一节重点是RDB文件的结构，如果有兴趣，可以自己去看下dump.rdb文件，然后对照一下很容易就明白了。

## 3. AOF

AOF是append only file的缩写，意思是追加到唯一的文件，从上面对RDB的介绍我们知道，RDB的写入是触发式的，等待多少秒或者多少次写入才会持久化到文件中，但是AOF是实时的，**它会记录你的每一个命令**。

同步到AOF文件的整个过程可以分为三个阶段：

* 命令传播：redis将执行的命令、参数、参数个数都发送给AOF程序
* 缓存追加：AOF程序将收到的数据整理成网络协议的格式，然后追加到AOF的内存缓存中
* 文件写入和保存：AOF缓存中的内容被写入到AOF文件的尾巴，如果设定的AOF保存条件被满足，fsync或者或者fdatasync函数会被调用，将写入的内容真正保存到磁盘中

对于第三点我们需要说明一下，在前面我们说到，RDB是触发式的，AOF是实时的。这里怎么又说也是满足条件了呢？原来redis对于这个条件，有以下的方式：

* AOF_FSYNC_NO：不保存。这时候，调用flushAppendOnlyFile函数的时候WRITE都会执行（写入AOF程序的缓存），但SAVE会(写入磁盘)跳过，只有当满足：redis被关闭、AOF功能被关闭、系统要刷新缓存（空间不足等），才会进行SAVE操作。这种方式相当于迫不得已才会进行SAVE，但是很不幸，**这三种操作都会引起redis主进程的阻塞**
* AOF_FSYNC_EVERYSEC：每一秒保存一次。因为SAVE是后台子线程调用的，所有主线程不会阻塞。
* AOF_FSYNC_ALWAYS：每执行一个命令保存一次。这个很好理解，但是因为SAVE是redis主进程执行的，所以在SAVE时候主进程阻塞，不再接受客户端的请求

补充：对于第二种的流程可能比较麻烦，用一个图来说明：

![flushAppendOnlyFile的选择 ](http://redisbook.readthedocs.org/en/latest/_images/graphviz-1b226a6d0f09ed1b61a30d899372834634b96504.svg)

如果仔细看上面的条件，会发现一会SAVE是子线程执行的，一会是主进程执行的，那么怎样从根本上区分呢？

> 我个人猜测是区分操作的频率，第一种情况是服务都关闭了，主进程肯定会做好善后工作，发现AOF开启了但是没有写入磁盘，于是自己麻溜就做了；第二种情况，因为每秒都需要做，主进程不可能用一个定时器去写入磁盘，这时候用一个子线程就可以圆满完成；第三种情况，因为一个命令基本都是特别小的，所以执行一次操作估计非常非常快，所以主进程再调用子线程造成的上下文切换都显得有点得不偿失了，于是主进程自己搞定。【待验证】

对于上面三种方式来说，最好的应该是第二种，因为阻塞操作会让 Redis 主进程无法持续处理请求，所以一般说来，阻塞操作执行得越少、完成得越快，Redis 的性能就越好。

* 模式 1 的保存操作只会在AOF 关闭或 Redis 关闭时执行， 或者由操作系统触发， 在一般情况下， 这种模式只需要为写入阻塞， 因此它的写入性能要比后面两种模式要高， 当然， 这种性能的提高是以降低安全性为代价的： 在这种模式下， 如果运行的中途发生停机， 那么丢失数据的数量由操作系统的缓存冲洗策略决定。
* 模式 2 在性能方面要优于模式 3 ， 并且在通常情况下， 这种模式最多丢失不多于 2 秒的数据， 所以它的安全性要高于模式 1 ， 这是一种兼顾性能和安全性的保存方案。
* 模式 3 的安全性是最高的， 但性能也是最差的， 因为服务器必须阻塞直到命令信息被写入并保存到磁盘之后， 才能继续处理请求。

### AOF文件的还原

对于AOF文件的还原就特别简单了，因为AOF是按照AOF协议保存的redis操作命令，所以redis会伪造一个客户端，把AOF保存的命令重新执行一遍，执行之后就会得到一个完成的数据库，伪代码如下：

```
def READ_AND_LOAD_AOF():

    # 打开并读取 AOF 文件
    file = open(aof_file_name)
    while file.is_not_reach_eof():

        # 读入一条协议文本格式的 Redis 命令
        cmd_in_text = file.read_next_command_in_protocol_format()

        # 根据文本命令，查找命令函数，并创建参数和参数个数等对象
        cmd, argv, argc = text_to_command(cmd_in_text)

        # 执行命令
        execRedisCommand(cmd, argv, argc)

    # 关闭文件
    file.close()
```

### AOF重写

上面提到，AOF可以对redis的每个操作都记录，但这带来一个问题，当redis的操作越来越多之后，AOF文件会变得很大。而且，里面很大一部分都是无用的操作，你如我对一个整型+1，然后-1，然后再加1，然后再-1（比如这是一个互斥锁的开关），那么，过一段时间后，可能+1、-1操作就执行了几万次，这时候，如果能对AOF重写，把无效的命令清除，AOF会明显瘦身，这样既可以减少AOF的体积，在恢复的时候，也能用最短的指令和最少的时间来恢复整个数据库，迫于这个构想，redis提供了对AOF的重写。

所谓的重写呢，其实说的不够明确。因为**redis所针对的重写实际上指数据库中键的当前值。AOF 重写是一个有歧义的名字，实际的重写工作是针对数据库的当前值来进行的，程序既不读写、也不使用原有的 AOF 文件**。比如现在有一个列表，push了1、2、3、4，然后删除4、删除1、加入1，这样列表最后的元素是1、2、3，如果不进行缩减，AOF会记录4次redis操作，但是AOF重写它看的是列表最后的值：1、2、3，于是它会用一条rpush 1 2 3来完成，这样由4条变为1条命令，恢复到最近的状态的代价就变为最小。

整个重写过程的伪代码如下：

```
def AOF_REWRITE(tmp_tile_name):

  f = create(tmp_tile_name)

  # 遍历所有数据库
  for db in redisServer.db:

    # 如果数据库为空，那么跳过这个数据库
    if db.is_empty(): continue

    # 写入 SELECT 命令，用于切换数据库
    f.write_command("SELECT " + db.number)

    # 遍历所有键
    for key in db:

      # 如果键带有过期时间，并且已经过期，那么跳过这个键
      if key.have_expire_time() and key.is_expired(): continue

      if key.type == String:

        # 用 SET key value 命令来保存字符串键

        value = get_value_from_string(key)

        f.write_command("SET " + key + value)

      elif key.type == List:

        # 用 RPUSH key item1 item2 ... itemN 命令来保存列表键

        item1, item2, ..., itemN = get_item_from_list(key)

        f.write_command("RPUSH " + key + item1 + item2 + ... + itemN)

      elif key.type == Set:

        # 用 SADD key member1 member2 ... memberN 命令来保存集合键

        member1, member2, ..., memberN = get_member_from_set(key)

        f.write_command("SADD " + key + member1 + member2 + ... + memberN)

      elif key.type == Hash:

        # 用 HMSET key field1 value1 field2 value2 ... fieldN valueN 命令来保存哈希键

        field1, value1, field2, value2, ..., fieldN, valueN =\
        get_field_and_value_from_hash(key)

        f.write_command("HMSET " + key + field1 + value1 + field2 + value2 +\
                        ... + fieldN + valueN)

      elif key.type == SortedSet:

        # 用 ZADD key score1 member1 score2 member2 ... scoreN memberN
        # 命令来保存有序集键

        score1, member1, score2, member2, ..., scoreN, memberN = \
        get_score_and_member_from_sorted_set(key)

        f.write_command("ZADD " + key + score1 + member1 + score2 + member2 +\
                        ... + scoreN + memberN)

      else:

        raise_type_error()

      # 如果键带有过期时间，那么用 EXPIREAT key time 命令来保存键的过期时间
      if key.have_expire_time():
        f.write_command("EXPIREAT " + key + key.expire_time_in_unix_timestamp())

    # 关闭文件
    f.close()
```

### AOF重写的一个问题：如何实现重写？

是使用后台线程还是使用子进程（redis是单进程的），这个问题值得讨论下。额，对进程线程只是概念级的，等看完之后得拿redis的进程、线程机制开刀好好学一下。

redis肯定是以效率为先，所以不希望AOF重写造成客户端无法请求，所以redis采用了AOF重写子进程执行，这样的好处有：

1. 子进程对AOF重写时，主进程可以继续执行客户端的请求
2. 子进程带有主进程的数据副本，使用子进程而不是线程，可以在避免锁的情况下，保证数据的安全性

当然，有有点肯定有缺点：

* 因为子进程在进行AOF重写时，主进程没有阻塞，所以肯定继续处理命令，而这时候的命令会对现在的数据修改，这些修改也是需要写入AOF文件的。这样重写的AOF和实际AOF会出现数据不一致。

为了解决这个问题，**redis增加了一个AOF重写缓存（在内存中）**，这个缓存在fort出子进程之后开始启用，redis主进程在接到新的写命令之后，除了会将这个写命令的协议内容追加到AOF文件之外，还会同时追加到这个缓存中。这样，当子进程完成AOF重写之后，它会给主进程发送一个信号，主进程接收信号后，会将AOF重写缓存中的内容全部写入新AOF文件中，然后对新AOF改名，覆盖老的AOF文件。

在整个AOF重写过程中，只有最后的写入缓存和改名操作会造成主进程的阻塞（要是不阻塞，客户端请求到达又会造成数据不一致），所以，整个过程将AOF重写对性能的消耗降到了最低。

### AOF触发条件

最后说一下AOF是如何触发的，当然，如果手动触发，是通过```BGREWRITEAOF```执行的。如果要用redis的自动触发，就要涉及下面3个变量（AOF的功能要开启哦 ```appendonlyfile yes```）：

* 记录当前AOF文件大小的变量aof_current_size
* 记录最后一次AOF重写之后，AOF文件大小的变量aof_rewrite_base_size
* 增长百分比变量aof_rewrite_perc

每当serverCron函数（redis的crontab）执行时，会检查以下条件是否全部满足，如果是的话，就会触发自动的AOF重写：

1. 没有 BGSAVE 命令在执行
2. 没有 BGREWRITEAOF 在执行
3. 当前AOF文件大小 > server.aof_rewrite_min_size(默认为1MB)
4. 当前AOF文件大小和最后一次AOF重写后的大小之间的比率大于等于指定的增长百分比(默认为1倍，100%)

默认情况下，增长百分比为100%。也就是说，如果前面三个条件已经满足，并且当前AOF文件大小比最后一次AOF重写的大小大一倍就会触发自动AOF重写。
