---
layout: post
title: Hash Collision 攻击
categories: 计算机知识
tag: Hash
---

###前言

前几天看 HashMap 源码的时候，在网上搜了一阵子相关资料。遇到一个和 HashMap 相关的问题。因为前阵子爆出了各种数据库被黑的安全事件，同样 HashMap 也存在相同的漏洞。**有恶意的人会通过这个安全弱点会让你的服务器运行巨慢无比**。这个攻击的原理非常简单：

> 利用了各语言的Hash算法的“非随机性”可以制造出N多的value不一样，但是key一样数据，然后让你的Hash表成为一张单向链表，而导致你的整个网站或是程序的运行性能以级数下降（可以很轻松的让你的CPU升到100%）

目前这个问题出现于很多语言开发的服务上，而 Perl 在很久前修复了这个安全漏洞。

###一、攻击原理

上面其实已经提到了这篇文章的重点，这里详细说明一下。我们以 Java 为例，平时我们在程序中可能会频繁使用到这样一段代码：

{% highlight java linenos %}
	public void solve(HttpServletRequest request, HttpServletResponse response)
			throws IOException {

		//get parameter
		String user = request.getParameter("user");
		String passwd = request.getParameter("passwd");
		
		//do something

		//response
	}
{% endhighlight java %}

这是怎么实现的呢？

其实，**request 中的 Parameter 就是用 HashMap 存储的啊**。所以，我可以给你后台提交一个有100K 字段的表单，这些字段名都被我精心地设计过，他们全是 Hash Collision ，于是你的 Web Server 处理这个表单的时候，就会建造这个 HashMap，于是在每插入一个表单字段的时候，都会先遍历一遍你所有已插入的字段看看有没有重复的 key，因为全是 Hash Collision，所以 HashMap 就退化成大链表，如果我请求的规模特别特别大，你的服务器 CPU 一下就100%了（因为这是 O(N^2)复杂度啊！！！）。你如果觉得这100K 没什么压力，那么我就`while(true)`发很多请求，那么服务器分分钟就跪了。。。。

###二、怎样攻击呢？

我们可以在 stackoverflow 上看到这个讨论：[Application vulnerability due to Non Random Hash Functions](http://stackoverflow.com/questions/8669946/application-vulnerability-due-to-non-random-hash-functions)

简单总结一下这个帖子的内容，造福那些像我一样不想看英文的渣渣。。。。。

我们还是以 Java 为例，Java HashMap 源码中就有 Hash()的计算方法：

{% highlight java linenos %}
    /**
     * Retrieve object hash code and applies a supplemental hash function to the
     * result hash, which defends against poor quality hash functions.  This is
     * critical because HashMap uses power-of-two length hash tables, that
     * otherwise encounter collisions for hashCodes that do not differ
     * in lower bits. Note: Null keys always map to hash 0, thus index 0.
     */
    final int hash(Object k) {
        int h = hashSeed;
        if (0 != h && k instanceof String) {
            return sun.misc.Hashing.stringHash32((String) k);
        }

        h ^= k.hashCode();

        // This function ensures that hashCodes that differ only by
        // constant multiples at each bit position have a bounded
        // number of collisions (approximately 8 at default load factor).
        h ^= (h >>> 20) ^ (h >>> 12);
        return h ^ (h >>> 7) ^ (h >>> 4);
    }
{% endhighlight java %}

如果想进行这个攻击，就要保证这个语言使用的 Hash 算法是“非随机的”，所谓“非随机的” Hash 算法，就是可以“猜出来”。比如下面这个例子：

1. Aa 和 BB 这两个字符串的 hashcode是一样的，所以它们就是 Collision，然后它们就可以当成种子了
2. 我们可以通过这两个种子生成更多的拥有同一个 hashcode 的字符串。如：”AaAa”, “AaBB”, “BBAa”, “BBBB”。这是第一次迭代。其实就是一个排列组合，写个程序就搞定了
3. 然后，我们可以用这4个长度的字符串，构造8个长度的字符串，如下所示：
	> "AaAaAaAa", "AaAaBBBB", "AaAaAaBB", "AaAaBBAa", 	
	> "BBBBAaAa", "BBBBBBBB", "BBBBAaBB", "BBBBBBAa", 	
	> "AaBBAaAa", "AaBBBBBB", "AaBBAaBB", "AaBBBBAa", 	
	> "BBAaAaAa", "BBAaBBBB", "BBAaAaBB", "BBAaBBAa",	
4. 同理，我们还可以生成16个长度的，以及256个长度的字符串，总之，很容易生成任意长度的这样的值

在攻击时，我只需要把这些数据做成一个 HTTP POST 表单，然后写一个无限循环的程序，不停地提交这个表单。当然，如果更不要脸的话，可以把这个表单做成一个跨站脚本，找一些网站的漏洞放上去，于是就能过用户的力量帮你从不同的IP来攻击某服务器。

###三、怎么修复这个漏洞？

要防守 HashMap Collision，可以使用下面的方法：

* 把 Hash 算法改了
* 限制 POST 的长度
* 使用防火墙检测异常的请求

总之，要想彻底解决某个问题，必须深入到问题的核心。很显然，在编程领域就是看源码，然后做足各种安全保护，这样才能知己知彼，百战百胜。






