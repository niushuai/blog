---
layout: post
title: sockaddr 和 sockaddr_in 的区别
categories: linux
tags: socket
---

`struct sockaddr`和`struct sockaddr_in`这两个结构体是用来处理网络通信的地址。**在各种系统调用或者函数中，只要和网络地址打交道，就得用到这两个结构体。**

网络中的地址主要包含3方面的属性：

1. IP 地址
2. PORT 端口
3. 使用的协议 IPV4 IPV6

相应的，头文件有如下定义：

{% highlight c linenos %}
include <netinet/in.h>

struct sockaddr {
    unsigned short    sa_family;    // 2 bytes address family, AF_xxx
    char              sa_data[14];     // 14 bytes of protocol address
};

// IPv4 AF_INET sockets:

struct sockaddr_in {
    short            sin_family;       // 2 bytes e.g. AF_INET, AF_INET6
    unsigned short   sin_port;    // 2 bytes e.g. htons(3490)
    struct in_addr   sin_addr;     // 4 bytes see struct in_addr, below
    char             sin_zero[8];     // 8 bytes zero this if you want to
};

struct in_addr {
    unsigned long s_addr;          // 4 bytes load with inet_pton()
};
{% endhighlight c %}

注释中标明了属性的含义及其字节大小。**这两个结构体一样大，都是16个字节**，而且都有family属性，不同的是：

> `sockaddr`用其余14个字节来表示sa_data，而`sockaddr_in`把14个字节拆分成sin_port, sin_addr和sin_zero。
分别表示端口、ip地址、sin_zero用来填充字节使sockaddr_in和sockaddr保持一样大小。
 
 
sockaddr和sockaddr_in包含的数据都是一样的，但他们在使用上有区别：

* 程序员不应操作`sockaddr`，**`sockaddr`是给操作系统使用的**
* 程序员应使用`sockaddr_in`来表示地址，**`sockaddr_in`区分了地址和端口，使用更方便**
 
 
一般的用法为：

1. 程序员把类型、ip地址、端口填充`sockaddr_in`结构体
2. 强制类型转换成`sockaddr`
3. 作为参数传递给系统调用函数

网络编程中一段典型的代码为：

{% highlight c linenos %}
int sockfd;
struct sockaddr_in servaddr;

sockfd = Socket(AF_INET, SOCK_STREAM, 0);

/* 填充struct sockaddr_in */
bzero(&servaddr, sizeof(servaddr));
servaddr.sin_family = AF_INET;
servaddr.sin_port = htons(SERV_PORT);
inet_pton(AF_INET, "127.0.0.1", &servaddr.sin_addr);

/* 强制转换成struct sockaddr */
connect(sockfd, (struct sockaddr *) &servaddr, sizeof(servaddr));
 
{% endhighlight c %}