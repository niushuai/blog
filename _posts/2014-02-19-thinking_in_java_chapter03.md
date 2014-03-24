---
layout: post
title: Java编程思想 - 第三章、操作符
categories: Java编程思想
tags: Java编程思想
---

###本章主题：
> JAVA中的数据都是通过使用操作符来操作的。作者建议熟悉C/C++语法的人，可以快速浏览本章和下一章，看到这句话顿时爽歪歪了，吼吼~

###1. JAVA引用的一个坑

    Integer n1 = new Integer(47);
    Integer n2 = new Integer(47);
    System.out.println(n1 == n2);
    System.out.println(n1 != n2);

如果是一个C/C++程序员，毫不犹豫就会得出答案为：```true false```。但是在JAVA中，"=="比较的只是n1和n2这两个引用，而它们指向了不同的对象，所以它们是不相等的。正确答案应该是```false true```。那么，如果我想比较n1和n2指向的对象是否相等呢？答案是使用equals()，比如n1.equals(n2)即可。而这个equals()也不简单，下面来谈谈。

###2. 相等问题之——equals()和hashCode()

在JAVA使用中，经常会碰到需要判断引用/对象是否相等的情况。但因为JAVA本身的语言特性，这点特别容易产生bug，所以应该彻底搞清楚才行。

首先判断相等有两种：

1. 引用相等
2. 对象相等

举个例子：

    class A {
        String name;
    }

    public class B {
        public static void main(String[] args) {
            A a = new A();
            A b = new A();
            System.out.println(a == b);            //引用相等
            System.out.println(a.equals(b));       //对象相等
        }
    }

* 引用相等：a和b都是引用，但因为new了2个对象，a和b指向的不是同一个对象，所以这里的结果是```false```。
* 对象相等：因为A是自定义类型，而且没有重载equals()，将使用Object类的equasl()，实际上调用的还是"=="，也就是判断引用相等。所以结果也是```false```。

如果想要获得对象相等，先得知道Object类定义的hashCode()和equals()：

1. hashCode()的默认行为是对堆上的对象产生一个hash值(一般是根据内存地址计算得到的)。如果你没有重载过hashCode()，不同对象拥有不同的内存，两个对象肯定不可能相等。
2. equals()的默认行为是执行"=="的比较。也就是上面说的，比较的是是否指向的都是堆上同一个对象。如果没有重载equals()，默认行为中的两个对象的两个引用肯定不会相同，所以equals()肯定是false。

对于这点，JAVA的文档里说的很清楚：

* If two objects are equal according to the equals(Object) method, then calling the hashCode method on each of the two objects must produce the same integer result.
* It is not required that if two objects are unequal according to the equals(java.lang.Object) method, then calling the hashCode method on each of the two objects must produce distinct integer results.

翻译一下就是：

* 如果两个对象使用equals()相等，那么hashCode()也必须相等
* 如果两个对象的hashCode()相等，这两个对象不一定相等（因为hash会产生碰撞）

当然了，关于这个问题还是多写代码实践一下，给两个比较好的参考：

* [Java中hashcode()和equals()的联系](http://octsky.com/tech/2013/11/29/equals-hashcode-contract-java/)
* [
Java 中正确使用 hashCode 和 equals 方法](http://www.oschina.net/question/82993_75533)

###3. JAVA不必小心把"=="写成"="了

在JAVA中，“与”、“或”、“非”操作只可以应用在**布尔值**上面。与C/C++不同的是，不可将一个非布尔值当做布尔值在逻辑表达式中使用。比如:

    int i = 5;
    while(i) {
        //do something
    }
	
这样是错误的。因为i是一个整型，而不是一个布尔类型。（在C/C++可以这样使用，因为C/C++会进行隐式类型转换）

另外一点，在C/C++中有时如果一不小心，我们可能写出这样的代码：

    while(x = y){
    //do something
    }
	
由于进行的是赋值操作，而且C/C++会进行隐式类型转换，所以循环会执行。但是对于JAVA而言，不会把非布尔类型转化为布尔类型，在编译的时候就会报错，所以不会出现这样的问题。

因此，在JAVA中，一般不会出现这样的错误（除非x和y都是布尔类型的）。如果知道这点的话，在JAVA程序中就不用反人类的写出```while( "hello" == string)```这样的代码了。