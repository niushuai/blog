---
layout: post
title: [Java编程思想] - 第十二章、通过异常处理错误
categories: Java编程思想
tags: Java编程思想
---

###本章主题

这一章是讲异常的，因为在平常项目中，绝大多数异常都是eclipse自动添加的，而自己没有注意过这方面的东西。所以，对异常的理解很浅，目前来说就是能告诉我关于“程序为什么崩溃（异常类型）？在哪里崩溃的（打印的堆栈信息）？”而现在看到这里，就要弄清楚异常的工作原理，这样在以后自定义异常会更加有效。

1. 异常有何必要？

在C语言中，是通过返回值来判断程序的运行情况的。在C++和Java中定义了Exception类。假如有一个扫描文件的程序，当指定的文件没有被创建，那么肯定无法读入，同时，这个文件对象也无法关闭，随后可能造成内存占用过大或运算数据异常等问题，定位起来很繁琐；但如果在找不到文件的时候抛出一个FileNotFoundException异常，我们会很清晰的知道错误在哪里。而且我们可以告诉程序在无法找到文件的时候，你就去执行关闭操作。有了异常使定位问题更快速，而且更加健壮。

###1. 错误输出

在程序中普遍使用了```e.printStackTrace();```，意思是打印异常的堆栈。这个函数的另一个意思是**将打印的错误堆栈信息发送给标准错误流(System.err)而不是标准输出流(System.out)中。**这样定义，可以将正常输出和错误分开处理。

###2. 异常初始化

有两种，可以带上参数。在打印堆栈信息时，在抛出的异常后面添加一些说明？

###3. 自动抛出

有个细节以前没注意。在写代码时，一些会抛出异常的方法你必须显式的放在try...catch...中，但是对于空指针或者数组越界，你不用放在try...catch...中，一样会抛出异常。这是为什么呢？
> 原来它们属于**运行时异常**，会自动被Java虚拟机抛出，所以不必在异常说明中把它们列出来。这些异常都是从**RuntimeException类**继承而来的，所以既体现了继承的有点，使用起来也很方便。

下面我们可以写个小程序玩一下：

```
package Chapter12;

public class NeverCaught {
	static void f() {
		throw new RuntimeException("from f()");
	}
	static void g() {
		f();
	}
	public static void main(String[] args) {
		g();
	}
}
/** output
Exception in thread "main" java.lang.RuntimeException: from f()
	at Chapter12.NeverCaught.f(NeverCaught.java:5)
	at Chapter12.NeverCaught.g(NeverCaught.java:8)
	at Chapter12.NeverCaught.main(NeverCaught.java:11)

*/
```

我们发现，它是在**main函数中被捕获的（in thread main）**，说明f()扔了没人管，于是到达g()，g()也不管，于是到达main()，main一看，我去，我也不会处理这玩意啊。于是到达Java虚拟机，Java虚拟机一看是RuntimeException，果断处理之。

再看这个例子：

```
package Chapter12;

import java.io.IOException;

public class NeverCaught {
	static void f() {
		try {
			throw new IOException("from f()");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	static void g() {
		f();
	}
	public static void main(String[] args) {
		g();
	}
}
/** output:
java.io.IOException: from f()
	at Chapter12.NeverCaught.f(NeverCaught.java:8)
	at Chapter12.NeverCaught.g(NeverCaught.java:14)
	at Chapter12.NeverCaught.main(NeverCaught.java:17)

*/
```

而这里的异常是**从f()函数抛出**的。而且在f()中，必须显式的将抛出声明语句放在try...catch...中或者是显式声明抛出异常。


###4. finally的使用

try...catch...机制已经算是比较完整了，但是有时候也会有点麻烦。因为Java没有西沟函数，而有的资源必须回收/释放，我们知道Java有GC机制，但是前面也说到，GC机制只是保证**内存**，对于内存以外的资源不会管。比如文件操作、网络IO资源等。在没有finally的情况下也可以解决，就是在try中是正常关闭，在catch是出现问题也要关闭，一份代码用了2次。另外还有一种情况，如果有return语句在清理工作的代码前面，try和catch都是无力回天。看下面的例子：

```
package Chapter12;

class NSException extends Exception {

}

public class CatchWithoutFinally {

	public static boolean open(String name) throws NSException {
		if (name.equals("C++")) {
			throw new NSException();
		}
		return true;
	}

	public static void gun() {
		String[] strings = { "Java", "C++", "C", "C#" };
		for (int i = 0; i <= 3; ++i) {
			try {
				boolean flag = open(strings[i]);
				if (flag == false) {
					return;
				}
				System.out.println("file :" + strings[i] + " close");
			} catch (NSException e) {
				e.printStackTrace();
			}
		}
	}

	public static void main(String[] args) {
		gun();
	}
}
/** output:
file :Java close
Chapter12.NSException
        at Chapter12.CatchWithoutFinally.open(CatchWithoutFinally.java:11)
	at Chapter12.CatchWithoutFinally.gun(CatchWithoutFinally.java:20)
	at Chapter12.CatchWithoutFinally.main(CatchWithoutFinally.java:32)
file :C close
file :C# close
*/
```

然后再看下用了finally之后的情况：

```
package Chapter12;

class NSException extends Exception {

}

public class CatchWithoutFinally {

	public static boolean open(String name) throws NSException {
		if (name.equals("C++")) {
			throw new NSException();
		}
		return true;
	}

	public static void gun() {
		String[] strings = { "Java", "C++", "C", "C#" };
		for (int i = 0; i <= 3; ++i) {
			try {
				boolean flag = open(strings[i]);
				if (flag == false) {
					return;
				}
			} catch (NSException e) {
				e.printStackTrace();
			} finally {
				System.out.println("file :" + strings[i] + " close");
			}
		}
	}

	public static void main(String[] args) {
		gun();
	}
}
/** output:
file :Java close
Chapter12.NSException
	at Chapter12.CatchWithoutFinally.open(CatchWithoutFinally.java:11)
	at Chapter12.CatchWithoutFinally.gun(CatchWithoutFinally.java:20)
	at Chapter12.CatchWithoutFinally.main(CatchWithoutFinally.java:33)
file :C++ close
file :C close
file :C# close
*/
```

从上面2个例子可以清晰的看到，第一种情况下C++没有被关闭，而第二种情况，无论你在try...catch...中干了什么，我finally都能完成最后的清理工作。