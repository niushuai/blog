---
layout: post
title: 查看 Java 对象大小
categories: Java
tags: Java
---

###一、需求

 以前写C/C++的时候需要手工分配、回收内存，所以对平台相关的变量大小都得心里有谱。但是用了Java以后，依托Java强大的内存管理机制，对对象大小的概念就淡化了。只知道基本类型和引用各自的大小，而不知道对象内存大小由什么决定。最近碰到点内存问题，就有了这个需求。

假如我们有一个类叫做TestClassSize，我们想了解一下TestClassSize的大小。**工具就是javamexer.jar包提供的功能**。

1. 下载[classmexer.jar包](http://www.javamex.com/classmexer/)，假如将jar包放在/a/b/c/下
2. 编译TestClassSize代码：`javac -cp /a/b/c/classmexer.jar TestClassSize.java`
3. 运行：`java -javaagent:/a/b/c/classmexer.jar -cp /a/b/c/classmexer.jar TestClassSize`

###二、代码

一共有3个测试代码，第一个如下：

{% highlight java linenos %}
import com.javamex.classmexer.MemoryUtil;

public class TestClassSize {
	long a;
	static int b;
	int c;
	
	public static void main(String[] args) {
		System.out.println("Object size: " + MemoryUtil.memoryUsageOf(new TestClassSize()));
	}
}
/*output:
Object size: 24
*/
{% endhighlight java %}

然后我们增加一个属性`List<String> haha;`

{% highlight java linenos %}
import com.javamex.classmexer.MemoryUtil;

public class TestClassSize {
	long a;
	static int b;
	int c;
	List<String> haha;
	
	public static void main(String[] args) {
		System.out.println("Object size: " + MemoryUtil.memoryUsageOf(new TestClassSize()));
	}
}
/*output:
Object size: 32
*/
{% endhighlight java %}

然后我们再增加一个属性`List<String> aaa;`

{% highlight java linenos %}
import com.javamex.classmexer.MemoryUtil;

public class TestClassSize {
	long a;
	static int b;
	int c;
	List<String> haha;
	List<String> aaa;
	
	public static void main(String[] args) {
		System.out.println("Object size: " + MemoryUtil.memoryUsageOf(new TestClassSize()));
	}
}
/*output:
Object size: 32
*/
{% endhighlight java %}

上面3个代码的结果我们已经知道了，下面我们来讲一下原理。

###三、原理

每个对象的物理存储可以分为两部分:

* Object Header
* 该对象的所欲对象属性值

这两部分具体指什么呢？

1. Object Header，简称header：Hotspot VM限定每个对象header是2个word，word是JVM内部的存储最小单位，当前Hotspot定义的word大小是4字节，所以header共是8个字节。Header中应当包含着本对象的hashCode，对象锁及与GC相关的生存周期信息等。
2. 该对象的所有对象属性值(不包括static属性，static存储在方法区哦)：对象属性分为两部分，基本类型属性与对象引用。
	1. 基本类型对象属性就是那8种，大小我们应该都知道。而每个引用是**规定占用一个word，也就是4个字节**。像上面第二个类中新增加一个对象引用cache，那么这个引用属性就只占用4个字节
	2. 对象引用也有两种：普通对象与数组。数组也是正常对象，只不过，它除了header外还有4个字节表示当前数组的长度是多少，那么我们也可以认为数组对象的header长度就是12个字节了。 



那么，跟上上述分析过程，我们就可以得到上面3个程序的运行结果：

* 第一个程序的大小是header 8字节，long 8字节，2个int 8字节，一共24字节
* 第二个程序24字节基础上加上一个引用4字节，是28字节
* 第三个程序28字节基础上加上一个引用4字节，是32字节

但第二个程序好像不对劲，竟然输出了32字节。这是为什么呢？**因为还有内存对齐的功劳。**

####内存对齐

**JVM为了malloc与gc方便，指定分配的每个对象都需要是8字节的整数倍**，更详细的可以参考以前写过的一篇文章：[内存对齐原理](http://github.thinkingbar.com/alignment/)
