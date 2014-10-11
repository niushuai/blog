---
layout: post
title: Java 路径的一个坑
categories: Java
tags: 文件路径
---

一直以来，项目中的程序配置都不算特别复杂，所以一般在类中使用final搞成全局不可变变量就可以搞定。但是看了一些开源项目后，发现配置文件是一种高效安全而且方便管理的项目组成部分。昨天在代码中使用配置的时候，就出现了一个 IO 错误，搞了好大一会儿才算解决。于是想结合自己这次的教训和网上的资料来总结一下，以后出错了能有个大致方向。

---

先说下昨天的问题，我在项目根目录下新建了一个config.properties文件，然后在程序中是这样用的：

{% highlight java linenos %}
Configuration configuration = new PropertiesConfiguration(config);
{% endhighlight java %}

但是很不幸的是，一直报错说 main 线程发生了 java.lang.NoClassDefFoundError。然后随手百度查了半天也没法解决，无奈去 stackoverflow 上找了一下，很快，发现回答有人说是缺少包造成的。于是下载了一个collection和common-logging包就解决了。之所以出现这个问题是因为我们的程序中没有使用collection或者common-logging包的内容，但是我们使用的PropertiesConfiguration应该是使用了上述2个包，所以当PropertiesConfiguration用到2个包的时候发现classpath里面没有，于是就抛出了异常。

刚开始的时候，我在项目根目录下建了一个config.properties配置文件，但是我在项目第N层中要使用这个文件，那么，是不是应该这么写呢？

{% highlight java linenos %}
File file = new File("config.properties");
{% endhighlight java %}

确实，在我实验的第一次就成功了。但是我考虑如果要考虑程序的鲁棒性（从刘汝佳白书学到的词= =），文件读取最好使用绝对路径。相对路径神马的最容易出错了。

> 上面文件读取之所以正确是因为默认从项目的根目录开始搜索，而我的config.properties恰好建立在项目根目录，所以读取正确。

如果我放在com包下面呢？就应该写成是:

{% highlight java linenos %}
File file = new File("com/config.properties");
{% endhighlight java %}

> 注意的是：com前面千万不能加上一个/，如果这样，JVM首先在根目录(假设为D:/java)找D:/java//，也就是空文件夹（想象一下，你能建立一个没有任何字符的文件夹吗？），不存在后就把/com/config.properties当成一个绝对路径去找，这样当然找不到。于是JVM会贴心的给你扔回来一个IO错误的板砖。

总结一下：

* 在项目中使用相对路径是不靠谱的，一般情况下脱离了IDE，配置基本都会读取失败（因为部分工作是IDE来做的）。**在项目中使用绝对路径是靠谱的**，读取文件最好都使用绝对路径，推荐使用 getResource 和 getResourceAsStream。

给个不错的链接：[关于ClassLoader中getResource与getResourceAsStream的疑问](http://www.oschina.net/question/129471_34225)