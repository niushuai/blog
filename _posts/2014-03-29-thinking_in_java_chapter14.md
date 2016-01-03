---
layout: post
title: Java编程思想 - 第十四章、类型信息
categories: Java
tags: Java编程思想
---

###本章主题

本章将讨论Java是**如何让我们在运行时识别对象和类的信息**的。那么，为什么需要对对象的类型进行识别呢？我们举一个非常常见的例子：

{% highlight java linenos %}
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
			//注意这里，放入List的时候进行了什么操作？
			List<Shape> shapes = Arrays.asList(new Circle(), new Square(), new Triangle());
					for(Shape shape : shapes) {
						//拿出来的时候又进行了什么操作？
						shape.draw();
					}
		}
}
/** output:
Circle.draw()
Square.draw()
Trangle.draw()
*/
{% endhighlight java %}

在这个例子中，shapes的List中存放的是Shape类型，这样当用Circle、Square、Triangle初始化时会进行向上转型，同时他们也丢失了各自的具体类型。对于List而言，它仅仅是Shape类型。而当从List取出元素时，**List（实际上它把所有对象都当作Object持有）会自动将结果转型回Shape。这就是RTTI最基本的使用。因为在Java中，所有的类型转换都是在运行时进行正确性检查的。**但同时，RTTI类型转换的并不彻底，Object被转型为Shape，而不是转型为原来的Circle、Square、Triangle。这是因为目前只知道List中存放的是Shape类型。

* 在编译时，将由容器和Java泛型来确保正确性
* 在运行时，由类型转换操作来确保

接下来就是多态的事情（本质就是JVM的invokevirtual字节码），Shape对象实际执行什么样的代码，是由引用指向的具体对象决定的。通常我们这样做是“面向接口编程”的做法，这样代码更容易扩展。

但是现在又又了另一个需求：我需要对Shape的子类进行旋转，但是我们知道Circle旋转是没有意义的，所以要跳过Circle。这怎样实现的？下面我们就来说说类型信息的实现：

1. RTTI：也就是Run Time Type Identify机制，运行时类型识别（编译时）
2. 反射：它允许我们在运行时发现和使用类的信息（运行时）

下面我们就来学习一下RTTI和反射吧：）

什么，你想问他们之间的区别？很简单，去stackoverflow一搜就知道了，但是最好是看过书之后自己总结。

###一、RTTI核心——Class对象

####1. 什么是Class对象？

这是本章的重点，也是Java的一个难点。

要理解RTTI在Java中的工作原理，首先必须知道类型信息在运行时是如何表示的。这项工作是由称为**Class对象**的特殊对象来完成的，它包含了与类有关的信息。**事实上，Class对象就是用来创建类的所有的“常规对象”的。**Java使用Class对象来执行RTTI，即使你正在执行的是类型转型这样的操作。Class类还拥有大量的使用RTTI的其它方式。

结合《深入理解Java虚拟机》，class对象现在应该很清楚了。说白了，class对象中是常规对象的模板，它里面肯定有一个指向方法区的指针，而方法区存放着这个类的相关信息（比如父类是谁，是不是接口，静态变量有哪些等等）。然后通过AClass.getClass()就可以得到这个Class对象（所有对象应该仅保留一份）。所以，**Java使用Class对象来执行RTTI**。

总结一下，获得一个类的Class对象有两种方法：

1. 如果没有一个该类对象的引用，就使用Class.forName()
2. 如果存在一个该类的对象，就是用AClass.getClass()
3. 如果存在一个该类的对象，也可以使用AClass.class(类字面值常量，编译时检查，log4j就用到了)

有一个很有趣的现象，当使用.class来创建对Class对象的引用时，不会自动地初始化该Class对象。而Class.forClass("xx")则会立即初始化该Class对象。举一个例子吧：

{% highlight java linenos %}
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
		//staticFinal因为是编译期确定，如果只访问这个，也不会触发类的初始化。可以注释下面那个运行期确定的变量，则不会初始化
		System.out.println(Initable.staticFinal);
		//下面调用非编译期确定的static数据，Initable才被初始化
		System.out.println(Initable.staticFinal2);
		
		//调用Initable2的static数据，被加载并且初始化
		System.out.println(Initable2.staticNonFinal);
		try {
			//forName立即加载，不管使用不使用
			Class initable3 = Class.forName("Chapter14.Initable3");
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("After creating Initable3 ref");
		System.out.println(Initable3.staticNonFinal);
	}
}/*output:
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
{% endhighlight java %}

####2. 泛化的Class引用

因为每个类都是Class类的对象，所以一个class引用可以随便指向所有类的class对象，这就很容易犯错。比如下面的例子：

{% highlight java linenos %}
public class GenericReference {
	public static void main(String[] args) {
		Class intClass = int.class;
		Class<Integer> genericClass = Integer.class;
		
		intClass = double.class;
		//下面代码将编译出错
		//genericClass = double.class;
	}
}
{% endhighlight java %}

我们看到，intClass被指向了Double的Class，而且没有报错。但是如果使用泛型，指定Class引用的类型，就可以保证在编译时发现问题。但是如果指定具体类型的话，就违反了“面向接口编程”的初衷，所以这里可以采用Java的通配符“?”，比如`class<?> intClass = int.class;intClass = double.class;`。

Tips：

> 如果在使用非具体class的场景中，尽量使用`class<?> classRef `,而不是`class classRef `,因为前者可以明确指出我使用的就是非具体类型的Class引用。

嗯，如果`class <?> classRef`范围太大，`class<Integer> intClass`又过于具体，那么可以考虑使用`class<? extends Number> numberClassRef `这样的用法，大家看一眼应该就懂了，类似的还有`class<? super Number> numberSuperClassRef `。

###三、类型转换前先做检查

讲到这里，我们已知的RTTI的形式有以下几种：

1. 传统的类型转换：用Circle、Triangle、Square装入ArrayList<Shape>时，3个形状向上转型为Shape；取出时，List会自动将Object转换为Shape
2. Class对象：通过查询Class对象，我们可以知道很多额外的信息（比如类的名字、完整的包名、超类、是否为接口等等）
	* 在C++中，经典的类型转换并不适用RTTI，它只是简单的告诉编译器你把转型后的类型当做一个新的类型，使用的时候再检查用法对不对。而在Java中，会使用RTTI检查类型转换操作，被称为”类型安全的向下转型“。为什么只是向下转型呢？因为向上转型必定是安全的，但是向下转型时我不知道你是否转对了，比如Circle肯定是一个Shape，但是Shape则不一定是Circle，也可能是Triangle。所以，**不适用显式的类型转换，编译器是不允许你进行向下转型的**
3. instanceof：这个好像见过，比如在第一部分提出的那个问题，我们就可以使用`(if shape instanceof Circle)`来判断是否为Circle。

Tips：

> instanceof是静态关键字，我们也可以动态的使用Clss类中的isInstance()方法——比如`if(someClassRef.getClass().isInstance(Number))`

有一个问题，既然Class对象和instanceof都可以判断类型信息，那么它们之间是神马关系呢？原来在查询类型信息时，以instanceof的形式（即以instanceof的形式或者isInstance()的形式，它们产生相同的结果）与直接比较Class对象有一个很重要的区别。我们用代码来说明问题：

{% highlight java linenos %}
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
{% endhighlight java %}

从结果我们可以看出，在相同的类中，instanceof和isInstance的结果是一样的，equals和==的结果也是一样的。但是他们的用法却不同：

1. instanceof和isInstance保持了**类型的概念**，它指的是“你是这个类或者这个类的派生类吗？”
2. 用==或者equals比较实际的Class对象（本质上equals调用的还是==），没有考虑继承的概念，因为Class对象对于不同的类都是唯一的（应该是每个类保持一个Class对象）。所以它**或者是这个确切的Class对象，或者不是。没有继承和其它情况的概念**

###四、反射

先思考一个问题，为什么在已经有了RTTI的基础上，又引出了反射呢？

> 我们知道，如果不知道某个对象的确切类型，使用RTTI的三种方式可以告诉你。但是，这有个前提：**这个类型在编译时必须已知，这样RTTI才能通过JVM加载的Class对象获得这个类对象的类型信息**。也就是说，在编译时，编译器必须知道所有要使用RTTI来处理的类。但是，因为Java具有动态加载的特性，我们可以从网络上下载一些字节码加载进JVM代表一个类，那么这时候就没有经过编译，RTTI就没有用武之处了。而这就是反射出现的理由。

所以，RTTI和反射的真正区别是：

> 当通过反射与一个未知类型的对象打交道时，JVM只是简单地检查这个对象，看它属于哪个特定的类（就像RTTI一样）。在用它做其他事情之前必须先加载那个类的Class对象。因此，那个类的.class文件对于JVM来说必须是可获取的：要么在本地机器上，要么可以通过网络获得。**所以RTTI和反射之间的真正的区别只在于，对RTTI来说，编译器在编译时打开和检查的.class文件。（换句话说，我们可以用“普通”方式调用对象的所有方法。）而对于反射机制来说，.class文件在编译时是不可获取的，所以是在运行时打开和检查.class文件**。

下面就是反射的一个典型用法：

{% highlight java linenos %}
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
			System.out.println("No such class: " + e);
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
{% endhighlight java %}

我们可以发现，这个程序是用来识别以参数传入的类的信息的，所以说这个程序必定在编译时无法知道这个参数，故而RTTI无法起作用，这时候就是靠反射来完成对信息的识别的。所以通过反射，我们可以在程序运行时得到类的相关信息。

而到这里，反射就搞定了，其实就是补充RTTI不能在运行时得到类的信息，就这样。

###五、动态代理

这个小节讲的是**动态代理**，那么我们首先要了解，什么是代理，为什么又要有动态代理呢？

> 代理是什么东西其实很简单。就拿简单的翻墙来说，我们在国内无法访问Twitter，但是在国外可以，假如google架设了一台服务器可以访问Twitter，我们访问google，告诉它我想要访问Twitter，然后google去Twitter访问后把响应数据传输给用户。这样google就相当于代理。其实在实际的使用中，我们是无法感受到代理的存在的，我们直接访问的是Twitter，但实际上我们是通过代理来和Twitter交互的。另一个更通俗的例子：春节期间各个公司都比较忙，而你回家又需要火车票，你就会给代售点打电话说我要买火车票，之后你去取就可以了。但是代售点是不卖火车票的，它相当于火车站的代理。而本来应该是我跟火车站打交道，有了代理之后，代理帮我处理了很多事情，我只需要简单的和代理打交道就好了。

那么，Java的动态代理比普通的代理有什么更厉害的地方吗？

> 因为它可以动态地创建代理并动态地处理对所代理方法的调用。在动态代理上所做的所有操作都会被重定向到单一的调用处理器上，它的工作是揭示调用的类型并确定相应的对策。我知道这段话非常晦涩，那我先弄个简单的例子，然后再解释它们之间的区别。

首先是普通的代理：

{% highlight java linenos %}
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

//注意这里，代理实现了Interface接口，对每个代理方法都需要处理，如果这个类有20个方法，就必须重写20次
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
{% endhighlight java %}

然后我们使用Java给我们提供的动态代理：

{% highlight java linenos %}
package Chapter14;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

//这里，我们不需要任何被代理对象的信息，耦合性完全为0.而且方法有一个统一的处理器，你有200个方法，我也只有1个处理方法
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
{% endhighlight java %}

也许你会想，如果都用同一个逻辑，那假如我需要代理的某个/某些方法的代理逻辑和其他不同呢？那我们再来看一下这种情况可以怎么处理：

{% highlight java linenos %}
package Chapter14;

import java.lang.reflect.*;

class MethodSelector implements InvocationHandler {
	private Object proxied;
	MethodSelector(Object proxied) {
		this.proxied = proxied;
	}

	//我们可以在这里动态提取方法的信息进而做出相应的逻辑，因为动态代理是用反射实现的，所以完全可以在运行时完成这类需求
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
{% endhighlight java %}

上面三个例子其实都比较简单，我们来解释一下：

1. 第一个使用的是普通代理，需要注意的是它实现了被代理接口，内部需要装载一个实际代理类，对每个方法进行重写，这样在大项目中是无法应用的
2. 第二个使用了Java动态代理，我们发现用一个统一的调度处理器就可以把所有请求转发到这个调度器（InvocationHandler)上，然后在进行相应的逻辑处理
3. 第三个也使用了Java动态代理，区别是我们对Methods进行了过滤（对，就是使用简单的String默认实现的Compareble接口）


通过上面的3个小例子，**我们发现普通代理中，首先需要实现被代理的那个接口，然后和每个方法的耦合度太高，比如我更改了接口，那么代理类也必须修改。但是在动态代理中，因为分离了代理类和被代理接口，所以无论被代理接口如何变化，代理类的逻辑都可以不变。而也因为java使用反射实现了动态代理，所以在运行时也可以完成代理工作。而代理显然是静态的，和.class文件相关的，运行时就无法完成代理的任务**。

Tips:

> Proxy.newProxyInstance()返回一个Object对象，我们将它转换为最终要代理的接口。而其中的三个参数很关键，因为是动态代理，所以编译的时候我们是无法知道代理的具体目标，所以需要一个类加载器，当需要这个类的时候我们必须使用相同的加载器加载被代理对象。而第二个是确定这个代理要实现哪些接口，第三个就是统一的调度器。我猜了一下流程就是JVM发现这是一个Proxy代理，想创建一个被代理接口的新代理。而这个被代理接口是第二个参数指定的那些接口，于是我使用第一个参数提供的类加载器来加载被代理的接口，接着当调用这个代理的时候，就会调用InvocationHandler中的invoke()方法，invoke()方法的三个参数分别为生成的最终代理对象、要调用的方法、这个方法中的参数。

###六、反射可以穿透所有代码

通过这一小节，知道了反射的厉害之处：

> 没看到这一节的时候，认为package/protected/private都必然是外部类或者非继承类无法访问的。但是使用反射，一切都变成了浮云。不管我身在哪里，我都能调用一个任何类的任何方法，无论权限是神马。即使你不发布源码，而是编译后的代码。我照样可以使用随jdk发布的javap反编译器突破这一限制。上次使用javap是对String、StringBuffer、StringBuilder的分析。你只需要运行```javap -private C```,就会列出C类的所有函数成员，不论C中某个函数权限是神马。因此，任何人都可以获取你最私有的方法的名字和签名，然后调用它们。还有一种是私有内部类，哎，反射分分钟还是搞定了这玩意= =！等等，你说还有匿名内部类？不好意思，反射照样无压力碾压，是不是淡淡的忧桑？没错，使用反射技术能实现许多牛逼的东西，而这就需要自己去探索怎样发挥它的优势了。
