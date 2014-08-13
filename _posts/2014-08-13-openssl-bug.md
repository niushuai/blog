---
layout: post
title: OpenSSL HeartBleed Bug 分析
categories: 知识
tags: OpenSSL
---

###一、前言

![img](../image/heartbleed.png)

前阵子爆出的 OpenSSL HeartBleed Bug 可谓是业界的一颗大炸弹，看了新闻才知道全球大概2/3的网站都被波及到，因为 Apache 和 Nginx 使用了 OpenSSL。

最先发现这个 Bug 的是 Google 的安全团队，那么在 Bug 发布之前应该就已经修复了，但是其他网站都有这样的漏洞，所以在公布 Bug 的当天，无数的网站遭受了这样的攻击。因为这个漏洞工具非常容易制作，所以各大网站都提醒用户尽快更改账户密码和敏感信息。

然后最近在玩 coolshell 提供的游戏时，有一关就是和这个有关。但是发现对这个东西只是知道个名字，凑凑热闹而已。于是最近就了解了一下这个 Bug，下面我们就来看看。

###二、HeartBeat 介绍

当使用基于openssl通信的双方建立安全连接后，客户端需要不断的发送心跳信息到服务器，以确保服务器是可用的。

基本的流程是：

1. 客户端发送一段固定长度的字符串到服务器
2. 服务器接收后，返回该固定长度的字符串
3. 客户端收到这个字符串就会认为和服务器保持连接，服务器有心跳没有宕机

比如客户端发送"xiaoniu"字符串到服务器，服务器接受后，原样返回"xiaoniu"字符串，这样客户端就会认为openssl服务器是可用的。

###三、HeartBleed Bug 严重吗？

这是 OpenSSL 2012年发布稳定版以后的一个 bug，非常严重：

The Heartbleed bug is a particularly nasty bug. It allows an attacker to read up to **64KB** of memory, and the security researchers have said:

> Without using any privileged information or credentials we were able steal from ourselves the secret keys used for our X.509 certificates, user names and passwords, instant messages, emails and business critical documents and communication.

从上面我们可以看到，**它可以读取64KB 的内存信息，而且在没有任何特权资格的情况下，可以窃取密钥和其它各类信息。**很严重吗？你偷了我换一个不就得了？？？错了，我们知道密钥是非常重要的东西，如果黑客盗取了一个网站的密钥，并自己伪造一个数字证书，那么挂一个钓鱼网站欺骗小白用户就相当容易了，即使浏览器有警告，普通用户肯定也不知所云并且很大几率点击继续访问。

我们的私人信息都比较简短，比如内存中有这样一段信息：

> `"name":"6225 7583 9547 8430","passwd":"123456"`

我们数一数有占多少内存呢？大概50个字节，那么1KB 中就可以存储20个。64KB 可以存储1280个用户的信息。即使去除掉内存对齐、基本类型数据最小4字节等因素，也大概能得到上百个用户的信息了。

注意：这只是一次访问！！！我可以写个 `while()`，那基本就等同于托库了。而且目前网银之类均使用这个加密库传输数据，所以危害性多大就不用我多说了。

那么，是神马原因造成这个 Bug 呢？且看下面分析。

###四、 Bug 分析

这个 Bug 的引入在ssl/d1_both.c中：

{% highlight c linenos %}
//心跳数据包定义
typedef struct ssl3_record_st
{
    int type;               /* type of record */
    unsigned int length;    /* How many bytes available */
    unsigned int off;       /* read/write offset into 'buf' */
    unsigned char *data;    /* pointer to the record data */
    unsigned char *input;   /* where the decode bytes are */
    unsigned char *comp;    /* only used with decompression - malloc()ed */
    unsigned long epoch;    /* epoch number, needed by DTLS1 */
    unsigned char seq_num[8]; /* sequence number, needed by DTLS1 */
} SSL3_RECORD;

int dtls1_process_heartbeat(SSL *s)
{
    unsigned char *p = &s->s3->rrec.data[0], *pl; //p 指向另一端发来的心跳数据包
    unsigned short hbtype;
    unsigned int payload;
    unsigned int padding = 16; /* Use minimum padding */
    
    ......

    hbtype = *p++; //心跳数据包的type 字段，第0个字节，表示心跳包的类型
    n2s(p, payload); //接下来2个字节表示心跳数据包长度。n2s 是个宏，把这2个字节取出后赋值给 payload
    pl = p; //此时p指向第3个字节——也就是对端提供的心跳包(没有检查实际长度！！！！！)

    ......

    unsigned char *buffer, *bp;
    int r;
    //根据 payload（就是心跳数据包的长度） 分配内存，额外的3字节用于存放类型和长度
    buffer = OPENSSL_malloc(1 + 2 + payload + padding); 
    bp = buffer;

    ......
    
    *bp++ = TLS1_HB_RESPONSE;
    s2n(payload, bp); //填充长度
    memcpy(bp, pl, payload); //填充回应包的载荷【Bug 在这里】
}
{% endhighlight c %}

Bug 就是最后那个 memcpy 语句：

> **如果对端发来的心跳包有猫腻——包长度跟实际数据包的长度不匹配，那么在发送回应包的时候，那句 memcpy 语句就会把心跳包之后的内存区块也一起 copy 进去，然后发给对端。内存信息就泄露了。**

用通俗的话来解释一下：

假如客户端发送的心跳数据包的 data 数据为"0 0 7 niushuai"，那么服务器端解析可以得到 type=0, payload=07, pl='niushuai'，申请(1+2+7=10)大小的内存，然后再将 type, payload, pl 写到新申请的内存中。

如果大家都按照这个规定办事，那么上述流程不会出现任何问题。可是世界上总是存在着黑客 or "黑客"，他们总是不按规矩办事。比如客户端发送的字符串“niushuai”明明只有7个，而我非得把 payload 设置为1000，如果服务器不做任何检查，直接申请(1+2+1000)大小内存，这已经够傻逼了！！！但是，更过分的是还把"niushuai********" 包括的1003个内存的内容拷贝到新申请的内存处，并发回给客户端。

这样就获得了服务器上很多非常敏感的信息，这些信息可能包括网站的密钥或者其他隐私信息。

具体的 malloc 可以先摘抄一段参考文章的话：

> There are two ways memory is dynamically allocated with malloc (at least on Linux): using sbrk(2) and using mmap(2). If the memory is allocated with sbrk, then it uses the old heap-grows-up rules and limits what can be found with this, although multiple requests (especially simultaneously) could still find some fun stuff1.
> 
> The allocations for bp don't matter at all, actually. The allocation for pl, however, matters a great deal. It's almost certainly allocated with sbrk because of the mmap threshold in malloc. However, interesting stuff (like documents or user info), is very likely to be allocated with mmap and might be reachable from pl. Multiple simultaneous requests will also make some interesting data available.

Tips：

> 其实获取密码也不是那么容易，相对来说运气成分也要算进去。但是错就错在 length 的长度可以达到64KB，这就非常容易“幸运”的获取服务器隐私信息。我们知道部分内存回收算法是标记-清除，那么就会产生很多碎片。假如我的完整心跳包是“0 11111111 11111111 null”，那么操作系统经过分析只有“0 11111111 11111111 ”，那么长度仅仅是3，很容易找到一个碎片，**而碎片后面就可能是敏感信息**。同时，我在心跳包中声明 payload 为64KB，heartbeat 程序就将3字节后面的所有64KB 内容拷贝到需要返回给客户端的地址上。。。。然后悲剧就发生了。。。

###五、Bug 的修复

我们之前介绍的示例代码和 OpenSSL 的代码的 data 数据格式有一点差别就是 OpenSSL 的 data 进行了16字节的数据对齐，其他格式一致。示例代码是为了让大家更好的理解原理，所以很多细节的东西就没有添加，避免由于复杂度过高而不易理解。

接下来我们来看一下 OpenSSL 添加的两个最重要的判断条件：

{% highlight c linenos %}
  if (1 + 2 + 16 > s->s3->rrec.length)
              return 0; /* silently discard */
{% endhighlight c %}

这个判断的目的是为了避免 data 的 length 为0（这是最黑的。。。。）这一特殊情况的处理；

{% highlight c linenos %}
if (1 + 2 + payload + 16 > s->s3->rrec.length)
              return 0; /* silently discard per RFC 6520 sec. 4 */
{% endhighlight c %}

从这个判断条件我们可以看出，对 payload 的大小做了检查，如果超出了 length 就表示可能是恶意攻击，直接返回0。


###六、总结

安全重于泰山。

---

参考文章：

* [Diagnosis of the OpenSSL Heartbleed Bug](http://blog.existentialize.com/diagnosis-of-the-openssl-heartbleed-bug.html)
* [对 OpenSSL 高危漏洞 Heartbleed 的感慨、分析和建议](http://program-think.blogspot.com/2014/04/openssl-heartbleed.html)
