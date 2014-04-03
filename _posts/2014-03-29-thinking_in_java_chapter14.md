---
layout: post
title: Java编程思想 - 第十四章、类型信息
categories: Java编程思想
tags: Java编程思想
---

###2. 类字面常量

当写完一个类，并编译之后（在Eclipse中是自动编译的，你可以使用navigator视图在bin下面查看生成对应的xx.class），会产生对应的class文件。而调用xx.class有两种方法：

1. ```Class.forName("xx");```
2. ```xx.class```

这就是下面的讲到的类字面常量。


无数次碰到**类字面常量**，无数次擦肩而过。一直不知道这个到底是啥玩意，只是大概记得是类的反射东东，原来是**类字面常量：用于生成对Class对象的引用，它替代了Class.forName("xx")这样的用法，因为它在编译的时候会收到检查（不用放在try...catch中），所以简单、安全、高效。**

然后有一个变准字段TYPE，TYPE字段是一个引用，它指向对应的基本数据类型的Class对象，比如boolean.class等价于boolean.TYPE。

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
