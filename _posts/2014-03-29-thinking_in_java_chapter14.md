---
layout: post
title: Java编程思想 - 第十四章、类型信息
categories: Java编程思想
tags: Java编程思想
---

###本章主题

本章将讨论Java是如何让我们在运行时识别对象和类的信息的。主要有两种方式：

1. RTTI：也就是Run Time Type Identify机制，运行时类型识别
2. 反射：它允许我们在运行时发现和使用类的信息

###1. RTTI是什么？

一个很经典的例子就是关于接口的使用，我们知道在使用接口时是通过操作接口而不是对应的具体实现。下面是例子：

```
package Chapter14;

import java.util.*;

abstract class Shape {
		void draw() {
					System.out.println(this + ".draw()");
						}
			abstract public String toString();
}

class Circle extends Shape {
		public String toString() {
					return "Circle";
						}
}

class Triangle extends Shape {
		public String toString() {
					return "Trangle";
						}
}

class Square extends Shape {
		public String toString() {
					return "Square";
						}
}

public class Shapes {
		public static void main(String[] args) {
					List<Shape> shapes = Arrays.asList(new Circle(), new Square(), new Triangle());
							for(Shape shape : shapes) {
											shape.draw();
													}
								}
}
/** output:
Circle.draw()
Square.draw()
Trangle.draw()
*/
```

在这个例子中，shapes的List中存放的是Shape类型，这样当用Circle、Square、Triangle初始化时会进行向上转型，同时丢失了各自的具体类型。所以，对于List而言，它们仅仅是Shape类型。而当从List取出元素时，**List这种容器实际上它把所有的事物都当作Object持有——会自动将结果转型回Shape。这就是RTTI最基本的使用。因为在Java中，所有的类型转换都是在运行时进行正确性检查的。**

但是问题随之而来，现在有这样一个需求：我需要对Shape的子类进行旋转，但是我们知道Circle旋转是没有意义的，所以要跳过Circle。这怎样实现的？下面我们就来说说。

###2. Class对象

这是本章的重点，也是Java的一个难点。要理解RTTI在Java中的工作原理，首先必须知道类型信息在运行时是如何表示的。这项工作是由称为**Class对象**的特殊对象来完成的，它包含了与类有关的信息。**事实上，Class对象就是用来创建类的所有的“常规对象”的。**

Java使用Class对象来执行RTTI，即使你正在执行的是类型转型这样的操作。Class类还拥有大量的使用RTTI的其它方式。

那么，在Java创建对象时是如何工作的？我们在前面的章节中多次讲到初始化问题，比如：

* [初始化问题1]()
* [初始化问题2]()

对于Class对象来说是这样的：

> 当类第一次被使用时，类加载器首先检查这个类的Class对象是否已经被加载。如果尚未加载，默认的类加载器就会根据类名查找.class文件。而且在这个字节码被加载时，它们会接受验证，确保没有受到破坏，并且不包含不良代码。一旦这个类的Class对象被载入内存，它就会被用来创建这个类的所有对象（可以说Class对象是这个类所有对象的模板）。

###3. 类字面常量

当写完一个类，并编译之后（在Eclipse中是自动编译的，你可以使用navigator视图在bin下面查看生成对应的xx.class），会产生对应的class文件。而调用xx.class有两种方法：

1. ```Class.forName("xx");```
2. ```xx.class```

这就是下面的讲到的类字面常量。


无数次碰到**类字面常量**，无数次擦肩而过。一直不知道这个到底是啥玩意，只是大概记得是类的反射东东，原来是**类字面常量：用于生成对Class对象的引用，它替代了Class.forName("xx")这样的用法，因为它在编译的时候会受到检查（不用放在try...catch中），所以简单、安全、高效。**

然后有一个标准字段TYPE，TYPE字段是一个引用，它指向对应的基本数据类型的Class对象，比如boolean.class等价于boolean.TYPE。

这个例子太经典了，必须仔细研究啊

```
package Chapter14;

import java.util.*;

/**
 * 
 * @author niushuai
 *
 * 这段程序说明的东西太多了。。。。。每个输出的顺序都是理解这个问题的的关键：
 * 
 * 1. 动态加载
 * 2. Lazy机制（还记得线段树的Lazy操作吗- -）
 * 3. 初始化和加载的关系
 * 4. static final数据是编译时候确定的，所以不需要初始化就可以使用。所以Initable.staticFinal在没有初始化的情况下就可以访问
 * 5. static final修饰的还可能在运行时才能确定 Initable.staticFinal2为例子
 * 6. static 非final的比如Initable.staticNoNFinal是先进行初始化才输出的
 */

class Initable {
	static final int staticFinal = 47;
	static final int staticFinal2 = ClassInitialization.rand.nextInt(1000);
	static {
		System.out.println("Initializing Initable");
	}
}

class Initable2 {
	static int staticNonFinal = 147;
	static {
		System.out.println("Initializing Initable2");
	}
}

class Initable3 {
	static int staticNonFinal = 74;
	static {
		System.out.println("Initializing Initable3");
	}
}

public class ClassInitialization {
	public static Random rand = new Random(47);
	public static void main(String[] args) {
		//发现没有初始化，因为没有用到！
		Class initable = Initable.class;
		System.out.println("After creating Initable ref");
		//下面调用static数据，Initable才被初始化
		System.out.println(Initable.staticFinal);
		System.out.println(Initable.staticFinal2);
		
		//调用Initable2的static数据，被加载并且初始化
		System.out.println(Initable2.staticNonFinal);
		try {
			//forName立即加载，不管使用不使用
			Class initable3 = Class.forName("Initable3");
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("After creating Initable3 ref");
		System.out.println(Initable3.staticNonFinal);
	}
}
/* output:
After creating Initable ref
47
Initializing Initable
258
Initializing Initable2
147
Initializing Initable3
After creating Initable3 ref
74
*/
```

###3. 
