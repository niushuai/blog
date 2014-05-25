---
layout: post
title: Java编程思想 - 第十四章、类型信息
categories: Java
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

Tips:

有一个很有趣的现象，当使用.class来创建对Class对象的引用时，不会自动地初始化该Class对象。而Class.forClass("xx")则会立即初始化该Class对象。

###3. 类字面常量

当写完一个类，并编译之后（在Eclipse中是自动编译的，你可以使用navigator视图在bin下面查看生成对应的xx.class），会产生对应的class文件。而调用xx.class有两种方法：

1. ```Class.forName("xx");```
2. ```xx.class```

这就是下面的讲到的类字面常量。


无数次碰到**类字面常量**，无数次擦肩而过。一直不知道这个到底是啥玩意，只是大概记得是类的反射东东，原来是**类字面常量：用于生成对Class对象的引用，它替代了Class.forName("xx")这样的用法，因为它在编译的时候会受到检查（不用放在try...catch中），所以简单、安全、高效。**

然后有一个标准字段TYPE，TYPE字段是一个引用，它指向对应的基本数据类型的Class对象，比如boolean.class等价于boolean.TYPE。

这个例子太经典了，必须仔细研究啊(和上面的Tips结合起来看)

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

###4. 类型转换前先做检查

到这里，RTTI的形式已经有了这几种：

1. 传统的类型转换：用Circle、Triangle、Square装入ArrayList<Shape>时，3个形状向上转型为Shape；取出时，List会自动将Object转换为Shape。然后调用方法时，会实现多态功能。
2. Class对象：通过查询Class对象，我们可以知道很多额外的信息（比如类的名字、完整的包名、超类、是否为接口等等）
3. instanceof：这个好像见过，比如在第一部分提出的那个问题，我们就可以使用```(if shape instanceof Circle)```来判断是否为Circle。

###5. instanceof与Class的等价性

在查询类型信息时，以instanceof的形式（即以instanceof的形式或者isInstance()的形式，它们产生相同的结果）与直接比较Class对象有一个很重要的区别。Don not BB, show me the Code:

```
package Chapter14;

class Base {}
class Derived extends Base {}

public class FamilyVsExactType {
	static void test(Object x) {
		System.out.println("Testing x of type " + x.getClass());
		System.out.println("x instanceof Base " + (x instanceof Base));
		System.out.println("x instanceof Derived " + (x instanceof Derived));
		System.out.println("Base.isInstance(x) " + Base.class.isInstance(x));
		System.out.println("Derived.isInstance(x) " + Derived.class.isInstance(x));
		System.out.println("x.getClass() == Base.class " + (x.getClass() == Base.class));
		System.out.println("x.getClass() == Derived.class " + (x.getClass() == Derived.class));
		System.out.println("x.getClass().equals(Base.class) " + (x.getClass().equals(Base.class)));
		System.out.println("x.getClass().equals(Derived.calss) " + (x.getClass().equals(Derived.class)));
	}
	public static void main(String[] args) {
		test(new Base());
		System.out.println();
		test(new Derived());
	}
}
/** output:
Testing x of type class Chapter14.Base
x instanceof Base true
x instanceof Derived false
Base.isInstance(x) true
Derived.isInstance(x) false
x.getClass() == Base.class true
x.getClass() == Derived.class false
x.getClass().equals(Base.class) true
x.getClass().equals(Derived.calss) false

Testing x of type class Chapter14.Derived
x instanceof Base true
x instanceof Derived true
Base.isInstance(x) true
Derived.isInstance(x) true
x.getClass() == Base.class false
x.getClass() == Derived.class true
x.getClass().equals(Base.class) false
x.getClass().equals(Derived.calss) true
*/
```

从结果我们可以看出，在相同的类中，instanceof和isInstance的结果是完全相同的。但是Base和Derived的结果却不同：

1. instanceof和isInstance保持了**类型的概念**，它指的是“你是这个类吗？或者你是这个类的派生类吗？”
2. 用==或者equals比较实际的Class对象，就没有考虑继承的概念，因为Class对于不同的类都是唯一的（这个从编译后生成的Class对象就可以知道）。所以它**或者是这个确切的Class对象，或者不是，没有继承和其它情况**

###6. 反射

终于到反射了！好激动，一定要把反射搞清楚，然后就可以把热加载技术搞定了。。。。。目标就是搞定Spring的热加载，让ABTest可以热加载！

咳咳，书上说“重要的是，要认识到反射机制并没有什么神奇之处。”那就简单总结一下书上的原因：

> 当通过反射与一个未知类型的对象打交道时，JVM只是简单地检查这个对象，看它属于哪个特定的类（就像RTTI一样）。在用它做其他事情之前必须先加载那个类的Class对象。因此，那个类的.class文件对于JVM来说必须是可获取的：要么在本地机器上，要么可以通过网络获得。所以RTTI和反射之间的真正的区别只在于，对RTTI来说，编译器在编译时打开和检查的.class文件。（换句话说，我们可以用“普通”方式调用对象的所有方法。）而对于反射机制来说，.class文件在编译时是不可获取的，所以是在运行时打开和检查.class文件。

###7. 反射提供方法查找基类的方法列表

Do not BB, show me the CODE:

```
package Chapter14;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.regex.Pattern;

public class ShowMethods {
	private static String usage = "usage:\n" +
			"ShowMethods qualified.class.name\n" +
			"To show all methods in class or:\n" +
			"ShowMethods qualified.class.name word\n" +
			"To search for methods involving 'word'";
	private static Pattern p = Pattern.compile("\\w+\\.");
	public static void main(String[] args) {
		if(args.length < 1) {
			System.out.println(usage);
			System.exit(0);
		}
		int lines = 0;
		try {
			Class<?> c = Class.forName(args[0]);
			Method[] methods = c.getMethods();
			Constructor[] ctors = c.getConstructors();
			if(args.length == 1) {
				for(Method method : methods) {
					System.out.println(p.matcher(method.toString()).replaceAll(""));
					System.out.println("#" + method.toString());
				}
				for(Constructor ctor : ctors) {
					System.out.println(p.matcher(ctor.toString()).replaceAll(""));
				}
			} else {
				for(Method method : methods) {
					if(method.toString().indexOf(args[1]) != -1) {
						System.out.println(p.matcher(method.toString()).replaceAll(""));
						lines++;
					}
				}
				for(Constructor ctor : ctors) {
					if(ctor.toString().indexOf(args[1]) != -1) {
						System.out.println(p.matcher(ctor.toString()).replaceAll(""));
						lines++;
					}
				}
			}
		} catch(ClassNotFoundException e) {
#			System.out.println("No such class: " + e);
		}
	}
}
/** output:
public static void main(String[])
#public static void Chapter14.ShowMethods.main(java.lang.String[])
public final void wait(long,int) throws InterruptedException
#public final void java.lang.Object.wait(long,int) throws java.lang.InterruptedException
public final native void wait(long) throws InterruptedException
#public final native void java.lang.Object.wait(long) throws java.lang.InterruptedException
public final void wait() throws InterruptedException
#public final void java.lang.Object.wait() throws java.lang.InterruptedException
public boolean equals(Object)
#public boolean java.lang.Object.equals(java.lang.Object)
public String toString()
#public java.lang.String java.lang.Object.toString()
public native int hashCode()
#public native int java.lang.Object.hashCode()
public final native Class getClass()
#public final native java.lang.Class java.lang.Object.getClass()
public final native void notify()
#public final native void java.lang.Object.notify()
public final native void notifyAll()
#public final native void java.lang.Object.notifyAll()
public ShowMethods()
*/
```

额，才一天没看，上面这个例子我都忘了咋编译了呢！编译请使用```javac Chapter14/ShowMethods.java```, 运行使用```java Chapter14.ShowMethods 完整包名的类```。比如这个程序的运行是这样的：```java Chapter14.ShowMethods Chapter14.ShowMethods```

然后我们就可以清楚的看见每个方法的名称和构造函数了。。。

###8. 动态代理

看到这个名字就觉得很牛逼的样子，然后实际看了，确实很牛逼。。代理是什么东西其实很简单，就拿简单的翻墙来说，我们在国内无法访问Twitter，但是在国外可以，假如google架设了一台服务器可以访问Twitter，我们访问google，告诉它我想要访问Twitter，然后google去Twitter访问后把响应数据传输给用户。这样google就相当于代理。其实在实际的使用中，我们是无法感受到代理的存在的，我们直接访问的是Twitter，但实际上我们是通过代理来和Twitter交互的。

那么，Java的动态比普通的代理更进一步：
> 因为它可以动态地创建代理并动态地处理对所代理方法的调用。在动态代理上所做的所有操作都会被重定向到单一的调用处理器上，它的工作是揭示调用的类型并确定相应的对策。下面就用一个实际的例子来说明为什么要代理，它的好处是什么？

一个简单的代理CODE:

```
package Chapter14;

interface Interface {
	void doSomething();
	void somethingElse(String arg);
}

class RealObject implements Interface {
	public void doSomething() {
		System.out.println("doSomething");
	}
	public void somethingElse(String arg) {
		System.out.println("somethingElse " + arg);
	}
}

class SimpleProxy implements Interface {
	private Interface proxy;
	public SimpleProxy(Interface realInterface) {
		proxy = realInterface;
	}
	public void doSomething() {
		System.out.println("SimpleProxy doSomething");
		proxy.doSomething();
	}
	public void somethingElse(String arg) {
		System.out.println("SimpleProxy somethingElse");
		proxy.somethingElse(arg);
	}
}

public class SimpleProxyDemo {
	public static void consumer(Interface iface) {
		iface.doSomething();
		iface.somethingElse("bonobo");
	}
	public static void main(String[] args) {
		consumer(new RealObject());
		consumer(new SimpleProxy(new RealObject()));
	}
}
/** output:
*/
doSomething
somethingElse bonobo
SimpleProxy doSomething
doSomething
SimpleProxy somethingElse
somethingElse bonobo
```

然后我们使用Java给我们提供的动态代理：

```
package Chapter14;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

class DynamicProxyHandler implements InvocationHandler {
	private Object proxied;
	public DynamicProxyHandler(Object proxied) {
		this.proxied = proxied;
	}
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable{
		System.out.println("*** proxy: " + proxy.getClass() + ", method: " + method + ", args: " + args);
		if(args != null) {
			for(Object arg : args) {
				System.out.println(" " + arg);
			}
		}
		return method.invoke(proxied, args);
	}
}

public class SimpleDynamicProxy {
	public static void consumer(Interface iface) {
		iface.doSomething();
		iface.somethingElse("bonobo");
	}
	public static void main(String[] args) {
		RealObject real = new RealObject();
		consumer(real);
		
		Interface proxy = (Interface)Proxy.newProxyInstance(
				Interface.class.getClassLoader(), 
				new Class[]{ Interface.class }, 
				new DynamicProxyHandler(real)
		);
		consumer(proxy);
	}
}
/** output: 
doSomething
somethingElse bonobo
*** proxy: class Chapter14.$Proxy0, method: public abstract void Chapter14.Interface.doSomething(), args: null
doSomething
*** proxy: class Chapter14.$Proxy0, method: public abstract void Chapter14.Interface.somethingElse(java.lang.String), args: [Ljava.lang.Object;@6150818a
 bonobo
somethingElse bonobo
*/
```

然后我们再来看一下如何过滤某些方法的调用：

```
package Chapter14;

import java.lang.reflect.*;

class MethodSelector implements InvocationHandler {
	private Object proxied;
	MethodSelector(Object proxied) {
		this.proxied = proxied;
	}
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable{
		if(method.getName().equals("interesting")) {
			System.out.println("Proxy detected the interesting method");
		}
		return method.invoke(proxied, args);
	}
}

interface SomeMethods {
	void boring1();
	void boring2();
	void interesting(String arg);
	void boring3();
}

class Implementation implements SomeMethods {
	public void boring1() {
		System.out.println("boring1");
	}
	public void boring2() {
		System.out.println("boring2");
	}
	public void interesting(String arg) {
		System.out.println("interesting " + arg);
	}
	public void boring3() {
		System.out.println("boring3");
	}
}

public class SelectingMethods {
	public static void main(String[] args) {
		SomeMethods proxy = (SomeMethods)Proxy.newProxyInstance(
					SomeMethods.class.getClassLoader(),
					new Class[] { SomeMethods.class },
					new MethodSelector(new Implementation())
				);
		proxy.boring1();
		proxy.boring2();
		proxy.interesting("bonobo");
		proxy.boring3();
	}
}
/** output:
boring1
boring2
Proxy detected the interesting method
interesting bonobo
boring3
*/
```

上面三个例子其实都比较简单，我们来大概说一下用法：

1. 第一个就是使用SimpleProxy，它内部有一个目标对象，通过它来间接使用Interface
2. 第二个使用了Java自带的Proxy.newProxyInstance()函数，它的三个参数为：类加载器、希望该代理实现的接口列表、实现InvocationHandler接口的类（调用Method.invoke()）
3. 和第二个一样，只是我们对Methods进行了过滤（对，就是使用简单的String默认实现的Compareble接口）

然后使用Java的invoke()函数也需要搞清楚它是怎样工作的：
> Proxy.newProxyInstance()返回一个Object对象，我们将它转换为最终要代理的接口。而其中的三个参数很关键，因为是动态代理，所以编译的时候我们是无法知道代理的具体目标，所以需要一个类加载器，当需要这个类的时候我们可以使用这个加载器加载被代理对象。而第二个是这个代理要实现的接口，第三个就是InvocationHandler接口的实现。我猜了一下流程就是JVM发现这是一个Proxy代理，想创建一个新代理。而这个新代理是第二个参数，于是我使用第一个参数提供的类加载器来加载被代理的接口，接着当调用这个代理的时候，就会调用InvocationHandler中的invoke()，invoke的三个参数分别为被代理对象、方法调用、参数，所以调用invoke就会通过Method.invoke函数来调用被代理接口的对应函数，并提供对应的参数。

###9.接口与类型信息

通过这一小节，知道了一点就是：
> 反射太牛了，没看到这点的时候，package/protected/private都必然是外部类或者非继承类无法访问的。但是通过反射，一切都变成了浮云。不管我身在哪里，我都能调用一个类的全部函数，无论权限是神马。即使你不发布源码，而是编译后的代码。很不幸，因为只需要运行javap，一个随着JDK发布的反编译器即可突破这一限制。上次使用javap是对String、StringBuffer、StringBuilder的分析。你只需要运行```javap -private C```,就会列出C类的所有函数成员，不论权限是神马。因此，任何人都可以获取你最私有的方法的名字和签名，然后调用它们。还有一种是私有内部类，哎，反射分分钟还是搞定了这玩意= =！等等，你说还有匿名内部类？不好意思，反射照样无压力碾压，是不是淡淡的忧桑？没错，使用反射技术能实现许多牛逼的东西。比如Spring的热加载技术。看完这一章之后，目标就是把我们现在项目中的某些配置文件改为热加载，要不然每次改配置后都需要全部机器重启，太累鸟。。。。
