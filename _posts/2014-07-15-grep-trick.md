---
layout: post
title: grep 的一个小 trick
categories: linux
tags: grep
---

使用grep在ps aux的输出结果中查找进程的时候经常会把grep进程本身也找出来。有时候挺让我恶心的，因为我一般是配合xargs把这个进程给kill了。比如查找mysqld进程：

{% highlight bash linenos %}
/Users/niushuai/work/Java_WorkSpace/engine_perform  >ps aux | grep 'mysqld'
niushuai        21474   0.0  0.0  3080628    536   ??  SN   日10上午  0:16.92 mysqld
niushuai        26185   0.0  0.0  2432784    608 s002  S+   7:18下午  0:00.00 grep --color=auto mysqld
{% endhighlight bash %}

一个常见的防止grep进程出现的方法就是在后面再加一个`grep -v grep`：

{% highlight bash linenos %}
/Users/niushuai/work/Java_WorkSpace/engine_perform  >ps aux | grep 'mysqld' | grep -v 'grep'
niushuai        21474   0.0  0.0  3080628    536   ??  SN   日10上午   0:16.92 mysqld
{% endhighlight bash %}

然后在网上发现一个小trick：

{% highlight bash linenos %}
/Users/niushuai/work/Java_WorkSpace/engine_perform  >ps aux | grep '[m]ysqld'
niushuai        21474   0.0  0.0  3080628    536   ??  SN   日10上午   0:16.92 mysqld
{% endhighlight bash %}

仔细一想还挺有趣的：

> []是正则表达式的元字符，所以`grep '[m]ysqld'`的时候，查找的是mysqld。但是本身作为一个进程的时候，它自身的[]是不能被grep出来的。所以这个trick管用。但是更简单的方法就是去~/.bashrc中设置一下alias即可。我只是设置了查找变量自动高亮，再加一个grep -v 'grep'就OK了。

