---
layout: post
title: BeautifulSoup简介及安装
categories: python
tags: python
---

###一.Beautiful Soup简介

Beautiful Soup是python的一个库，最主要的功能是从网页抓取数据(on quick-turnaround screen scraping projects)。

官方描述的3个主要特征为：

* Beautiful Soup provides a few simple methods and Pythonic idioms for navigating, searching, and modifying a parse tree: a toolkit for dissecting a document and extracting what you need. It doesn't take much code to write an application.
* Beautiful Soup automatically converts incoming documents to Unicode and outgoing documents to UTF-8. You don't have to think about encodings, unless the document doesn't specifyan encoding and Beautiful Soup can't autodetect one. Then you just have to specify the original encoding.
* Beautiful Soup sits on top of popular Python parsers like lxml and html5lib, allowing you to try out different parsing strategies or trade speed for flexibility.


翻译过来就是：

* Beautiful Soup提供一些简单的、python式的函数用来处理导航、搜索、修改分析树等功能。它是一个工具箱，通过解析文档为用户提供需要抓取的数据，因为简单，所以不需要多少代码就可以写出一个完整的应用程序。
* Beautiful Soup自动将输入文档转换为Unicode编码，输出文档转换为utf-8编码。你不需要考虑编码方式，除非文档没有指定一个编码方式，这时，Beautiful Soup就不能自动识别编码方式了。然后，你仅仅需要说明一下原始编码方式就可以了。
* Beautiful Soup已成为和lxml、html6lib一样出色的python解释器，为用户灵活地提供不同的解析策略或强劲的速度。

###二.Beautiful Soup安装

先给出地址，但是请先看一下Notice之后再安装。

* BeautifulSoup库下载地址
* BeautifulSoup库中文文档

Notice:

> 这里需要特别说明几点，因为装这个库我花费一早上和一中午的时间。原因很简单：网上的教程都是很久以前的，python更新后已经不适用了。(python2和python3有很大区别！)

* 预热：上面给出的下载地址中，BeautifulSoup有两种版本：BeautifulSoup4.1.3和BeautifulSoup3.2.1。这里我们最好下载第二个版本，因为第一个对python3支持不好，所以可能引起很多的问题（好吧，我在这上边耗费了一上午的时间才算搞好~）
* 对于第一个版本，官方已经将BeautifulSoup改名为bs4了。所以不能再使用这样的语句：from BeautifulSoup import BeautifulSoup，而应该是:from bs4 import BeautifulSoup【坑爹啊！】
* 对于第二个版本则可以正常使用from BeautifulSoup import BeautifulSoup或import BeautifulSoup
* 安装：下载BeautifulSoup库后解压，在安装目录下可以看到一个setup.py文件。我刚开始下载后以为双击就可以运行了，但是双击后没有任何反应，去网上搜了一下，说bs4对python3版本支持不好，而我的就是python3，所以以为是版本问题，就卸载重装了一下python3，结果还是不行。后来在网上看到一篇原创的BeautifulSoup安装文章，作者说自己当时安装BeautifulSoup也遇到了setup.py不会用的经历，后来经人点拨才知道需要输入命令才可以运行。。。
* linux:打开终端后输入命令——python setup.py install
* windows:需要先配置环境变量，然后进入下载的bs4库目录后——python setup.py install
* 验证：当然，我们在安装好之后需要检查一下是安装成功：import BeautifulSoup，如果没有出错提示，就说明安装成功了！

###三.BeautifulSoup总结

综上所述，我们最好使用python2.x+BeautifulSoup3.X版本。虽然不是最新版，但是使用起来非常稳定，并且各种库也都支持。