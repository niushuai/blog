---
layout: post
title: Java编程思想 - 第八章、多态
categories: Java
tags: Java编程思想
---

###本章主题

在OOP中，多态是继抽象和继承之后的第三种基本特征。其实多态的概念也算是很熟悉了，它的目的在于消除类型之间的**耦合关系**。C++是通过virtual关键字实现的多态，在JAVA中多态也能完成同样的任务。所以，本章的重点就是掌握JAVA的多态(也称为动态绑定)用法。

###1. 向上转型

在前面简单说过向上转型的问题，从根本上来说，**动态绑定**是多态的核心。而实现动态绑定就需要借助向上转型的力量。定义一个基类的接口，然后由出现类继承这个接口以后实现各自的功能。这样，当我们定义一个基类对象时，我们可以根据需要用继承自该类的任何子类来初始化它（也就是向上转型），因为基类定义了相同的接口，而实现是在**子类**中，子类可以有不同的实现，那么我们通过这一个基类的接口就可以实现不同的功能，从而实现多态。

###2. 动态绑定

从上面我们知道，向上转型是多态的核心。而理解向上转型我们就必须弄懂JAVA的动态绑定。那么，什么是静态绑定，什么是动态绑定呢？

* 静态绑定：在执行前（由编译器和连接程序实现）就可以明确确定调用哪个函数，典型的例子就是C函数，因为C程序不允许重载，所以你使用```fun(30)```，编译器就确定你使用的是fun()是哪个。又比如static和final，因为都是不变的，所以就是静态绑定
* 动态绑定：顾名思义，和静态绑定不同，动态绑定必须在运行时才能确定是哪一个方法被调用。比如```fun(30)```因为可以定义多个fun()，比如fun(int), fun(Long), fun(char)……，所以只有在运行的时候才能确定要调用哪一个具体的函数。在JAVA中，**除了static方法和final方法(private方法属于final方法)之外，其它所有的方法都是动态绑定**

举一个非常简单的例子来说明静态绑定和动态绑定：

{% highlight cpp linenos %}
//静态绑定
#include<stdio.h>

int fun(int n) {
	return n * 2;
}

int main(void) {
	int i = 3;
	fun(i);
	return 0;
}
{% endhighlight cpp %}

{% highlight java linenos %}
//动态绑定
package Chapter08;

import java.util.Random;

class A {}
class B extends A {}
class C extends A {}
class D extends A {}

class RandomNow {
	private Random random = new Random(100000);
	public A shuffle() {
		switch(random.nextInt(10)) {
		case 0:
		case 1:
		case 2:
		case 3:
			return new B();
		case 4:
		case 5:
		case 6:
			return new C();
		case 7:
		case 8:
		case 9:
			return new D();
		default:
			return null;
		}
	}
}

public class RandomMe {
	public static void main(String[] args) {
		RandomNow randomNow = new RandomNow();
		A[] a = new A[10];
		for(int i = 0; i < a.length; ++i) {
			a[i] = randomNow.shuffle();
		}
		for(int i = 0; i < a.length; ++i) {
			System.out.println(i + " " + a[i].getClass());
		}
	}
}
{% endhighlight java %}

上面例子很明显，在静态绑定中，编译器能准确知道fun()就是唯一的fun(int)，而在动态绑定中，编译器根本无法知道RandomNow.shuffle()返回的A具体是B、C、D中的哪一个。而这恰恰就是动态绑定完成的任务：在运行时确定。

###3. 多态的缺陷一：“覆盖”私有方法

{% highlight java linenos %}
public class PrivateOverride {
	private void fun() {
		System.out.println("Private fun()");
	}
	public static void main(String[] args) {
		PrivateOverride privateOverride = new Derived();
		privateOverride.fun();
	}
}

class Derived extends PrivateOverride {
	public void fun() {
		System.out.println("Public fun()");
	}
}
/** output:
Private fun()
*/
{% endhighlight java %}

我们想输出的是```Public fun()```，但因为private的fun对于Derived是不可见的，所以Derived中的fun是一个全新的方法，不是覆盖。所以对于子类没有覆盖基类的情况，肯定是调用基类的fun

###4. 多态的缺陷二：域与静态方法

{% highlight java linenos %}
package Chapter08;

class Super2 {
    //1. 一般情况下，父类的域都设置为private
    //2. 不会对基类中的域和子类中的域起相同的名字，容易混淆
	public int field = 0;

	public int getField() {
		return field;
	}
}

class Sub2 extends Super2 {
	public int field = 1;

	public int getField() {
		return field;
	}

	public int getSuperField() {
		return super.field;
	}
}

public class FieldAccess {
	public static void main(String[] args) {
		Super2 super2 = new Sub2();
		System.out.println("super2.field = " + super2.field
				+ ", super2.getField() = " + super2.getField());
		Sub2 sub = new Sub2();
		System.out.println("sub.field = " + sub.field + ", sub.getField() = "
				+ sub.getField() + ", sub.getSuperField() = "
				+ sub.getSuperField());

	}
}
/** output:
super2.field = 0, super2.getField() = 1
sub.field = 1, sub.getField() = 1, sub.getSuperField() = 0
*/
{% endhighlight java %}

我们看到，为Super.field和Sub.field分配了不同的存储空间。这样，Sub相当于拥有了2个field域。但是在引用Sub中的field所产生的默认域并非Super版本的field域。因此，如果想要得到Super.field，必须显式指定Super.field。

结论就是：
> JAVA中，只有普通的方法调用是多态的。然后在对待域的问题上，这个访问将在**编译期**进行解析，因此不是多态的。同理，静态方法是与类绑定的，跟对象无关。所以，静态方法也不具有多态性。

解决方法：
> 既然多态的缺陷只要在于private方法、域、静态方法，那么我们就记住对于private方法子类是完全看不见的；对于域来说，基类要设置为private，修改/访问通过get/set方法，而且避免基类、子类使用相同的域名称；对于静态方法，因为是类属性，所以不会因为不同对象消息的改变而改变。

1. **在JAVA中，除了static方法和final方法（private方法属于final方法）之外，其他所有的方法都是后期绑定。这意味着通常情况下，我们不必判断是否应该进行后期绑定——它会自动发生。**
2. 那么，我们现在就可以探讨一下使用final修饰一个方法的原因了。就是防止别人覆盖该方法。但更重要的一点是：**这样做可以有效的关闭动态绑定**，或者告诉编译器这个方法不需要进行动态绑定。这样，编译器就可以为final方法生成更有效的代码。**然而，大多数情况下，这样做对程序的整体性能不会有什么改观，所以使用final的目的是考虑是否能被覆盖，而不是效率，谨记**。

###5. 初始化总结

这个在第五章、第七章已经出现了，但是有了多态之后，又特么的出现了。于是，怒总结之。

1. 调用xx.main的时候，因为main是static，Java解释器通过类加载器在CLASSPATH找到xx.class文件
2. 加载xx.class的时候，发现它是extends yy，那么就同样通过CLASSPATH找到yy.class，依此类推，找到根基类
3. 对静态域/静态方法初始化。如果没有创建对象的操作，则初始化结束
4. 如果使用new在堆上创建对象。那么在堆上分配内存，并直接通过二进制清零，引用置null
5. 对定义时初始化的非静态域进行再初始化
6. 数据域全部搞定之后，执行构造函数体（这时候执行构造函数是因为构造函数具有一项特殊的任务：**检查对象是否被正确构造**。所以，只有当基类对象已经存在在堆上，再进行下一步的初始化操作）

###6. 继承与清理

既然构造都说了半天，清理工作也是必须明白的。

其实如果有特殊情况需要清理，那么一定要注意**动态绑定**的副作用，它调用的是导出类的清理函数，如果基类也需要清理，就必须显式的使用`super.清理函数`来完成。同时，销毁的顺序应该和构造的顺序相反。

###7. 一个多态引起的隐患

我们知道，用导出类初始化基类，调用一个导出类覆盖过基类的函数是正常的。但如果发生在**构造函数**中，就会出现问题。下面有个例子：

{% highlight java linenos %}
package Chapter_03;

class Glyph {
    void draw() {
        System.out.println("Glyph draw()");
    }
    Glyph() {
        System.out.println("Glyph before draw()");
        draw();
        System.out.println("Glyph after draw()");
    }
}

class RoundGlyph extends Glyph {
    private int radius = 1;
    RoundGlyph(int i) {
    	System.out.println("Defined.RoundGlyph, radius = " + radius);
        radius = i;
        System.out.println("RoundGlyph.RoundGlyph, radius = " + radius);
    }
    void draw() {
        System.out.println("RoundGlyph.draw(), radius = " + radius);
    }
}

public class PolymorphismConstructors {
    public static void main(String[] args) {
        new RoundGlyph(5);
    }
}
/** output:
Glyph before draw()
RoundGlyph.draw(), radius = 0
Glyph after draw()
Defined.RoundGlyph, radius = 1
RoundGlyph.RoundGlyph, radius = 5
*/
{% endhighlight java %}

如果第五章、第七章、第八章的初始化全部掌握的话，这个例子就完全无压力了。我来解释一下：

1. PolymorphismConstructors的main方法被调用，所以首先加载PolymorphismConstructors类。但没有任何域，只需要加载进内存即可（不需要在堆上分配存储空间，因为没有new关键字）
2. 执行`new RoundGlyph(5)`
3. Java解释器用类加载器在CLASSPATH中找到RoundGlyph.class，进行加载
4. 发现RoundGlyph是extends自Glyph，用类加载器在CLASSPATH中找到Glyph.class，进行加载
5. 发现Glyph为根基类，开始执行静态域的初始化：无。于是转到RoundGlyph执行静态域的初始化：无
6. 因为对RoundGlyph执行了new，于是先在堆上为Glyph分配足够的内存并清0，然后给RoundGlyph分配足够的内存并清0（因为大小肯定要包括Glyph的大小嘛，如果反过来的话，RoundGlyph压根不知道Glyph的大小，可能就分配的少或者多）
7. 执行Glyph域定义处的初始化：无。调用构造函数，调用draw（）因为多态，调用的是RoundGlyph的radius，所以是0
8. 执行RoundGlyph域定义处的初始化：将radious初始化为1。调用构造函数，将radius重新置为5

教训就是：

> 用尽可能简单的方式使对象进入正常状态；如果可以的话，尽量避免调用其他方法。在构造器内唯一能够安全调用的就是基类中的final方法了（private同属于final），这些方法不能被覆盖，所以就不会出现上面的问题了。

###8. 向下转型

向上转型是没有危险的，因为从大到小；但是向下转型，可能会出问题。比如几何图形到底是圆还是方。在C++中，我们必须执行一个特殊的操作来获得安全的向下转型。但是在JAVA语言中，所有转型都会得到检查！所以即使我们只是进行一次普通的加括弧形式的类型转换，在进入运行期时仍会对其进行检查，以便保证它的确是我们希望的那种类型。

{% highlight java linenos %}
package Chapter08;

/**
 * 
 * @author niushuai
 * 
 *         运行程序会在第36号报错：ClassCastException。因为x[1]的类型是MoreUseful，向上转型后再向下转型是没有错误的
 *         ；但是X[0]是Useful类型， 向下转型为MoreUseful肯定是错误的。所以会运行报错
 */

class Useful {
	public void f() {

	}

	public void g() {

	}
}

class MoreUseful extends Useful {
	public void f() {
	}

	public void g() {
	}

	public void u() {
	}

	public void v() {
	}

	public void w() {
	}
}

public class RTTI {
	public static void main(String[] args) {
		Useful[] x = { new Useful(), new MoreUseful() };
		x[0].f();
		x[1].g();
		((MoreUseful) x[1]).u(); // downcast/RTTI
		((MoreUseful) x[0]).u(); // throw Exception
	}
}
{% endhighlight java %}

