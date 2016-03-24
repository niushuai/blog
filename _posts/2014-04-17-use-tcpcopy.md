---
layout: post
title: TCPCopy 使用简介
categories: 计算机知识
tags: TCPCopy
---

### 一、应用背景

主要用于系统的稳定性测试。它可以复制线上服务器的请求，通过修改TCP/IP数据包信息，进而发送到测试服务器，为测试服务器创造一个真实的测试环境。

### 二、组成部分

* TCPCopy Server：部署在测试服务器，用于接收复制的线上请求
* TCPCopy Client：部署在线上服务器，用于捕获线上请求，通过修改TCP/IP数据包，发送到TCPCopy Server进行稳定性测试

### 三、下载及安装

* 下载地址：[TCPCopy](https://github.com/wangbin579/tcpcopy/releases/tag/0.9.0)
* 文档地址：[TCPCopy_Manual.pdf](https://raw.github.com/wangbin579/auxiliary/master/docs/TCPCopy_Manual.pdf)

解压后，进入TCPCopy根目录：

{% highlight bash linenos %}
./configure
make
make install
{% endhighlight bash %}

这里使用的是默认安装，可以到/usr/local/bin下面查看是否生成tcpcopy和intercept。如果想安装到个人目录，configure 时候指定 prefix 即可, 比如`./configure --prefix=/usr/home/niushuai/`，就安装到我的主目录了。

### 四、使用

测试服务器（TCPCopy Server）：

{% highlight bash linenos %}
sudo su - 
modprobe ip_queue
iptables -I OUTPUT -p tcp --sport <测试项目端口> -j QUEUE
/usr/local/bin/intercept -d
{% endhighlight bash %}

线上服务器（TCPCopy Client）：

{% highlight bash linenos %}
sudo su - 
/usr/local/bin/tcpcopy -x <线上项目端口>-<测试服务器IP>:<测试项目端口> -d
{% endhighlight bash %}

### 五、例子

* 测试服务器IP和端口：10.0.0.1 9080
* 线上服务器IP和端口：20.0.0.1 8080

测试服务器（TCPCopy Server）:

{% highlight bash linenos %}
sudo su - 
modprobe ip_queue
iptables -I OUTPUT -p tcp --sport 9080 -j QUEUE
/usr/local/bin/intercept -d
{% endhighlight bash %}

线上服务器（TCPCopy Client）:

{% highlight bash linenos %}
sudo su - 
/usr/local/bin/tcpcopy -x 8080-10.0.0.1:9080 -d
{% endhighlight bash %}

### 六、正式使用

可以简单写个脚本，比如我这个：

{% highlight bash linenos %}
{% endhighlight bash %}
