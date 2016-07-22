---
layout: post
title: Git 多帐号登录
categories: 计算机知识
tags: git
---

### 一、背景

我们需要区分git和github。简单来说:

* git是一个软件
* github是一个代码托管网站。

具体区别不是本文重点，自己google即可。在我们使用git时，多半使用git shell来进行日常的操作。额，反正在图形界面上还是不太习惯吧。。下面就说以下折腾了我2天才解决的git多帐号登录问题。

首先，我们我们应该知道的最重要一点是：你在git shell下面想怎样登录github：

* HTTPS read-only and read/write - https:// : https：// clone对所有的URL都是有效的，不管是公共的还是私人的repo。它们更加聪明，因为它们能根据你的权限来决定你是否拥有这个repo的操作权。尤其是对于那些限制ssh keys登录的用户来说，https可以在防火墙和代理下使用。但是当你在push或者pull的时候，需要频繁的输入密码。这点当然可以避免，下面的教程会指导我们的。
* SSH read/write - git@github.com : 这是一种通过SSH和github交互的方式。如果你想使用这种方式，你必须要在本机生成密钥，然后把公钥放到github账户中才行。

所以，教程在这里：

* [HTTPS教程](https://help.github.com/articles/set-up-git#password-caching)
* [SSH教程](https://help.github.com/articles/set-up-git#password-caching)

上面只是一些基础教程，但是我强烈建议，如果真的决定使用git，一定要好好看一下官方的文档和issue，这里。如果当初先仔细看文档的话，我估计也不会无故浪费2天的时间了。。不过也算对git帐号这点有了一定的认识，以后估计不会再踩这个坑了吧。。。。

### 二、问题

我当时一共申请了2个github账户，这里暂且用A/B代替。然后我用了https方式clone了一个git项目。我记得当时co的时候用到了github帐号和密码（其实就是注册github的邮箱和密码），然后一切进行的都很顺利。但是当我切换到另一个帐号后，噩梦出现了。。。。我不知道怎么切换帐号。在网上搜了N久N久都没有这个问题（也是这个问题比较奇葩，很少人才会用N个github帐号来回切换吧- -）。之后我也看了好几遍官网的issue，但是最重要的那一篇没有看到，就是git有哪两种方式登录github（https和ssh）。

所以问题总结一下就是：当你用A账户在git登录github后，咋样才能切换到B？当然了，如果你不切换，你用B帐号co一个项目修改up时候肯定出错，因为你用A帐号往B的项目里push，肯定是不行的嘛。

#### 1. SSH解决
本文的问题是通过SSH的方法解决的。一切步骤总结以下就是酱紫滴：

在github申请了A/B账户，用的邮箱分别是C/D。
在~/.ssh目录下，创建A/B目录，分别使用SSH教程对C/D邮箱生成对应的ssh-keys
分别在github的A/B帐号里add对应的ssh-keys
在~/.ssh创建config文件。配置对应的Host对应不同的IdentityFile。下面是例子：

{% highlight bash linenos %}
#A帐号，使用C邮箱
Host A
Hostname github.com
User git
IdentityFile ~/.ssh/A/id_rsa
#B帐号，使用D邮箱
Host B
Hostname github.com
User git
IdentityFile ~/.ssh/B/id_rsa
{% endhighlight bash %}

在没个git目录里，设置局部的user.name和user.email，因为全局的设置是对应于一个帐号的嘛。比如A帐号co的项目里大概是这样：

{% highlight bash linenos %}
git config user.name "A"
git config user.email "C"
{% endhighlight bash %}

设置对应的remote端，可以使用git remote -v 查看自己push操作推送的地址。默认的origin默认是第一个帐号登录使用的远端地址，所以你用B账户push的时候是肯定不能用这个origin。当然，在单用户情况下想必是极好的。多用户？so easy，用2个远端alias就可以了。比如我起名origin_a 对应A账户push的地址，origin_b对应B账户push的地址

{% highlight bash linenos %}
git remote add origin_a git@github.com:A/project.git
git remtoe add origin_b git@github.com:B/project.git
{% endhighlight bash %}

push的时候，push到对应的alias就可以啦~~

* A项目中：git push origin_a master
* B项目中git push origin_b master

#### 2. Https解决

暂时没找到，比较蛋疼。。。因为一般情况下我还是觉得https比较通用。。。我再看看文档再来试试吧。。。

### 三、相关资源

如果感觉SSH生成key那块不清楚，可以去看看以下资料：

* [数字签名](http://www.ruanyifeng.com/blog/2011/08/what_is_a_digital_signature.html)
* [SSH原理与应用1](http://www.ruanyifeng.com/blog/2011/12/ssh_remote_login.html)
* [SSH原理与应用2](http://www.ruanyifeng.com/blog/2011/12/ssh_port_forwarding.html)
