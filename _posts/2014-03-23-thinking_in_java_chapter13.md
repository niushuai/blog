---
layout: post
title: Java编程思想 - 第十三章、字符串
categories: Java编程思想
tags: Java编程思想
---

###本章主题

在Web应用中，字符串算是使用率最高的结构了。我们查看JDK文档会发现，**String对象是不变的**，String类中每一个看起来会修改String对象的方法，实际上都是创建了一个全新的String对象，以包含修改后的字符串内容。而最初的String对象则丝毫未动。

在字符串领域有3个大头：

1. String
2. StringBuffer
3. StringBuilder

具体参考原来的一篇博文：[Java字符串之String、StringBuffer、StringBuilder](http://www.thinkingbar.com/2014/02/12/java%E5%AD%97%E7%AC%A6%E4%B8%B2%E4%B9%8Bstring%E3%80%81stringbuffer%E3%80%81stringbuilder/)

###1. String对象不可变

这点在实际应用中特别重要：**String对象不可变**，查看JDK文档会发现，String类中每一个改变String对象的操作，实际上都是创建了一个全新的String对象，以包含修改后的字符串内容。而最初的String对象则丝毫不动。举个例子一看便知：

```
package Chapter13;

public class Immutable {
	public static void main(String[] args) {
		String s = "aaa";
		String b = s.toUpperCase();
		System.out.println(s);
		System.out.println(b);
	}
}
/** output:
aaa
AAA
*/
```

我们以为的是调用s.toUpperCase()之后，b引用指向修改后的s本身。那么，s和b都指向了AAA。但事实是又创建了一个新的String对象来存放修改后的s

学会一招怎么分析，就是通过```javap -c 类名```的方法，可以查看Java编译器产生的中间码，上面的例子中产生的中间码为：

```
   Code:
       0: ldc           #2                  // String mango
       2: astore_1
       3: new           #3                  // class java/lang/StringBuilder
       6: dup
       7: invokespecial #4                  // Method java/lang/StringBuilder."<init>":()V
      10: ldc           #5                  // String abc
      12: invokevirtual #6                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      15: aload_1
      16: invokevirtual #6                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      19: ldc           #7                  // String def
      21: invokevirtual #6                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      24: bipush        47
      26: invokevirtual #8                  // Method java/lang/StringBuilder.append:(I)Ljava/lang/StringBuilder;
      29: invokevirtual #9                  // Method java/lang/StringBuilder.toString:()Ljava/lang/String;
      32: astore_2
      33: getstatic     #10                 // Field java/lang/System.out:Ljava/io/PrintStream;
      36: aload_2
      37: invokevirtual #11                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      40: return
}
```

可以很清晰的看到，new了一个StringBuilder，调用了4次append，最后调用toString存储到astore_2中。

还有一个经典的例子必须说明一下：

```
package Chapter13;

public class WitherStringBuilder {
	public String implicit(String[] fields) {
		String result = "";
		for(int i = 0; i < fields.length; i++) {
			result += fields[i];
		}
		return result;
	}
	public String explicit(String[] fields) {
		StringBuilder result = new StringBuilder();
		for(int i = 0; i < fields.length; i++) {
			result.append(fields[i]);
		}
		return result.toString();
	}
}
```

里面是生成2种字符串的方法，一般项目中都会使用前一种。但如果我们用反编译的方法查看它们各自的中间码，就会发现问题：

implicit的反编译结果：

```
0: ldc           #16                 // String
       2: astore_2
       3: iconst_0
       4: istore_3
       5: goto          32
       8: new           #18                 // class java/lang/StringBuilder
      11: dup
      12: aload_2
      13: invokestatic  #20                 // Method java/lang/String.valueOf:(Ljava/lang/Object;)Ljava/lang/String;
      16: invokespecial #26                 // Method java/lang/StringBuilder."<init>":(Ljava/lang/String;)V
      19: aload_1
      20: iload_3
      21: aaload
      22: invokevirtual #29                 // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      25: invokevirtual #33                 // Method java/lang/StringBuilder.toString:()Ljava/lang/String;
      28: astore_2
      29: iinc          3, 1
      32: iload_3
      33: aload_1
      34: arraylength
      35: if_icmplt     8
      38: aload_2
      39: areturn
```

explicit的反编译结果：

```
 Code:
       0: new           #18                 // class java/lang/StringBuilder
       3: dup
       4: invokespecial #45                 // Method java/lang/StringBuilder."<init>":()V
       7: astore_2
       8: iconst_0
       9: istore_3
      10: goto          24
      13: aload_2
      14: aload_1
      15: iload_3
      16: aaload
      17: invokevirtual #29                 // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      20: pop
      21: iinc          3, 1
      24: iload_3
      25: aload_1
      26: arraylength
      27: if_icmplt     13
      30: aload_2
      31: invokevirtual #33                 // Method java/lang/StringBuilder.toString:()Ljava/lang/String;
      34: areturn
```

对比两个反编译结果，就会发现问题了。在implicit中，8-35行是一个循环，**在循环的每一次生成一个StringBuilder进行操作**，而在explicit中，**只生成一个StringBuilder**。而且如果你知道最终生成的字符串大概长度，你**可以在定义的时候给StringBuilder预先声明大小，这样又可以避免多次重新分配缓冲**。

所以，总结一下就是：
> 当你为一个类编写字符串拼接或者是实现toString()方法时，需要先考虑拼接操作是否简单，如果足够简单，你就可以信赖编译器会为你构造最高效的字符串结果。而如果字符串拼接比较麻烦，比如带有for循环或者迭代之类的，就要考虑创建一个StringBuilder来完成拼接，这样，自始至终只有一个StringBuilder对象，而不是编译器那样创建多个。如果这你都确定不了，还有一个方法就是用```javap -c 类(编译后的class文件)看看生成的中间码过程，根据这个分析是百分百靠谱的。

tips:

不要出现```StringBuilder.append(a + ":" + c);```这样的代码，因为这样会让编译器在括号内重新生成一个StringBuilder对象来进行拼接。要确定一个append()中只含有一个字符串。
