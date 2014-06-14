---
layout: post
title: Java编程思想 - 第九章、接口
categories: Java
tags: Java编程思想
---

###本章主题

这一章讲接口。这里的接口不是指Java的interface语法，而是指一种抽象出来的编程思想。正如在前面几章中看到的那样——面向基类编程。我们定义一个通用的协议，它的实现类把协议中规定的功能完成，调用的时候利用多态的动态绑定，就可以发送同样的消息完成不同的功能。而这种思想在Java中通过两种方式实现：

1. 抽象类
2. 接口

有了这两个东西，就可以完成一些复杂的需求。JAVA号称万物皆对象，有了类和对象为什么还要有接口呢？答案是：

> **为了更好的复用代码**

前面讲过了抽象、继承、多态，但我们知道,Java是**单继承**，比如一个A类想同时继承B类和C类是无法完成的。而在很多情况下，多继承是必不可少的。Java是参考C++开发出来的编程语言，那么这一点为什么没有按照C++的方式来做呢？

> 作者在书中写到，C++的多继承容易产生逻辑混乱的代码。尤其是遇到菱形继承，一个类可能有多个父类，而多个父类又可以有多个父类，以此类推下去。整个继承机构将会变得非常复杂。这时候利用多态就非常容易出错。所以Java为了避免这种情况，就用了单继承+接口的形式替代多继承的功能。

这一章可能不太容易理解清楚，所以需要仔细理解，代码一定要动手。昨天看到linux的一句名言：Talk is cheap, show me the code.然后他不接受bug报告，只接受patch。嗯，谨记代码要动脑想，然后写出来。

###1. 抽象类和接口

以前在博客中写过一篇文章说明抽象类和接口的关系:

* [JAVA抽象类和接口](http://www.thinkingbar.com/2013/08/19/java%E6%8A%BD%E8%B1%A1%E7%B1%BB%E5%92%8C%E6%8E%A5%E5%8F%A3/)

接口本质上来说是抽象类的一个特例，因为它的所有方法都是abstract修饰的。这点很重要，因为要实现接口，你必须覆盖所有的方法，这时候权限修饰符就必须有public。我们分析一下其它修饰符：

* protected：继承权限+包访问权限，接口是实现，不是继承。在多继承情况下，这种方法不能被重写。故pass
* package：不在一个包下，权限被限制了。故pass
* private：永远不可被重写，故无任何类能实现。故pass

得出的结论就是：

> **当要实现一个接口时，在接口中被定义的方法必须被定义为public。但是如果你尝试的话，发现不加修饰符（也就是package）不会报错！这是因为interface中的方法必须是public，你加不加编译器都会把它们当成public处理。所以，你可以在另外一个包中实现重写，然后就理解了。**


###2. 完全解耦

这个算是设计模式方面的东西吧，还不算理解。但是知道一点就是在代码设计中，尽量避免高耦合的情况出现。如前面项目中出现的问题就是由于高耦合引起的：

> 业务A需要业务B处理，而且是完成之后才能继续干活。那么，在压力比较大的情况下，B处理不过来的时候，就会挂掉，或者处理时间过长。那么就会引起A无缘无故等待过长时间，这样A等待的时间长，干活的时间少。时间长也会挂掉。这样，由于高耦合性，B挂掉也会连累A。后来，通过一个缓冲层将A/B解耦合，那么，无论A/B谁挂掉，都不会影响对方的工作。

所以，完全解耦是高效率代码的一个基本准则。举个简单的例子：

> 有一个类A，含有静态方法a(B b)，如果B是一个class，那么传入A.a()中的只能是B或者B的子类。现在有一个C类，含有和B类相同的接口，那它还是无法传入A.a()中。这就给代码复用带来了一点麻烦。而如果我们将A.a()中传入的参数变为interface,那么，B、C实现这个接口以后，都可以传入，就完成了代码的复用。具体例子可参考《Thinking In Java》P174-P178的代码。Talk is cheap，show me the code。

{% highlight java linenos %}
class Processor {
	public String name() {
		return getClass().getSimpleName();
	}
	
	Object process(Object input) {
		return input;
	}
}

class Upcase extends Processor {
	@Override
	String process(Object input) { //协变类型，原来是Object。这里是导出类
		return ((String)input).toUpperCase();
	}
}

class Downcase extends Processor {
	@Override
	String process(Object input) {
		return ((String)input).toLowerCase();
	}
}

public class Apply {
	public static void process(Processor p, Object o) {
		System.out.println("Using Processor: " + p.name());
		System.out.println(p.process(o));
	}
	
	public static String s = "how do you do?";
	public static void main(String[] args) {
		process(new Upcase(), s);
		process(new Downcase(), s);
	}
}/*output:
Using Processor: Upcase
HOW DO YOU DO?
Using Processor: Downcase
how do you do?
*/
{% endhighlight java %}

这里面的Processor是一个类，下面是具体实现。最后在Apply使用。

{% highlight java linenos %}
public class Waveform {
	
	private static long counter;
	private final long id = counter++;
	
	@Override
	public String toString() {
		return "Waveform " + id;
	}
}

public class Filter {
	public String name() {
		return getClass().getSimpleName();
	}
	
	public Waveform process(Waveform input) {
		return input;
	}
}

public class LowPass extends Filter {
	double cutoff;
	public LowPass(double cutoff) {
		this.cutoff = cutoff;
	}
	
	@Override
	public Waveform process(Waveform input) {
		return input;
	}
}

public class HighPass extends Filter {
	double cutoff;
	public HighPass(double cutoff) {
		this.cutoff = cutoff;
	}
	
	@Override
	public Waveform process(Waveform input) {
		return input;
	}
}
{% endhighlight java %}

这里面定义一个Filter，它的返回值是Waveform。两个实现类是LowPass和HighPass。我们发现Filter和Processor的接口完全相同。但是Apply只认Processor和它的子类。而Filter又不是Processor的子类——因为Filter类的创建者压根不知道你想把它当成Processor使用。所以你不能将Filter用于Apply.process()方法。

> 这里主要是因为Apply.Process()方法和Processor类之间的耦合过紧，已经超出了所需要的程度，这就使得应该复用Apply.process()的代码时，复用却被禁止了。但是，**如果Processor是一个接口，那么这些限制就会变得松动，使得你可以复用Apply.process()。下面是code：

{% highlight java linenos %}
public interface Processor { //虽然没有修饰符，但是方法都是public呦
	String name();
	Object process(Object input);
}

public class Apply {
	public static void process(Processor p, Object o) {
		System.out.println("Using Processor: " + p.name());
		System.out.println(p.process(o));
	}
}
{% endhighlight java %}

我们将Proceesor定义为接口，Apply的方法其实没有变。

{% highlight java linenos %}
public abstract class StringProcessor implements Processor {
	@Override
	public String name() {
		return getClass().getSimpleName();
	}
	
	public abstract String process(Object input);
	
	public static String s = "how do you do?";
	
	public static void main(String[] args) {
		Apply.process(new Upcase(), s);
		Apply.process(new Downcase(), s);
	}
}

public class Upcase extends StringProcessor {

	@Override
	public String process(Object input) {
		return ((String)input).toUpperCase();
	}

}

public class Downcase extends StringProcessor {

	@Override
	public String process(Object input) {
		return ((String)input).toLowerCase();
	}

}/*output:
Using Processor: Upcase
HOW DO YOU DO?
Using Processor: Downcase
how do you do?
*/
{% endhighlight java %}

这时候，关于StringProcessor的处理已经完成了，下面是Filter相关的处理。对于Filter来说，我们是发现了Filter。而不是创造了Filter，所以你无法修改Filter，但是你又想复用它。这时候可以使用**适配器设计模式**，适配器中的代码将接受你所拥有的接口，并产生你所需要的接口，就像下面你这样：

{% highlight java linenos %}
import Chapter_09.filters.Filter;
import Chapter_09.filters.Waveform;


public class FilterProxy implements Processor {
	
	Filter filter;
	
	public FilterProxy(Filter filter) {
		this.filter = filter;
	}

	@Override
	public String name() {
		return filter.name();
	}

	@Override
	public Waveform process(Object input) {
		return filter.process((Waveform)input);
	}

}
{% endhighlight java %}

从上面的适配器中我们可以发现也用到了代理哦：）适配器接受你所拥有的Filter接口，生成能用于Processor接口的对象。将接口从具体实现中解耦使得接口可以应用于多种不同的具体实现，因此代码更具有可复用性。

{% highlight java linenos %}
import Chapter_09.filters.HighPass;
import Chapter_09.filters.LowPass;
import Chapter_09.filters.Waveform;

public class FilterProcessor {
	public static void main(String[] args) {
		Waveform w = new Waveform();
		
		Apply.process(new FilterProxy(new LowPass(1.0)), w);
		Apply.process(new FilterProxy(new HighPass(1.0)), w);
	}
}/*output:
Using Processor: LowPass
Waveform 0
Using Processor: HighPass
Waveform 0
*/
{% endhighlight java %}

上面的例子如果认真琢磨的话，其实一点不复杂。然后自己思考了一下，用实际的例子可能更好理解（但是损失了一点准确性= =）：

> 有一个剥皮器类A，有3个子类分别为：苹果剥皮器、香蕉剥皮器、橘子剥皮器。有一个面向用户的使用类：Apply1.eat(剥皮器A，水果)，你指定剥皮器和水果，我吐给你用的剥皮器和剥好皮的水果。======还有一个类似的剥皮器类B，它的2个子类为：土豆剥皮器、茄子剥皮器。有一个面向用户的使用类：Apply2.eat(剥皮器B，蔬菜)，你指定剥皮器和蔬菜，我吐给你用的剥皮器和剥好皮的蔬菜。

我们会发现，剥皮器A/B具有完全相同的作用。都是接收一个东西，剥好皮吐出来。所以Apply1/Apply2完全可以合并（表考虑卫生好不好！），但是蛋疼的是Apply1/Apply2指定的参数都是基类A/B，传入的参数只能是它们自身和它们的子类。这就没有完成代码复用的功能。解决方法当然有了：

> 将A/B抽象出来一个通用的接口I，然后A/B实现它。又因为A/B原来可以在类中干一些事情（接口和抽象类的一个区别是抽象类可以有方法的实现，所以当子类的某个行为完全一致就可以使用抽象类定义好，子类不覆盖，就保持了一致），所以将A/B定义为抽象类。然后各自的子类继承A/B即可。至于Apply类，eat方法变为Apply.eat(剥皮器接口I，Object)，然后传入水果或者蔬菜。变成Object只需要在A/B中向下转型。至此，大功告成。

###3. 多重继承

这个算是这章的重点，也是Java的重点。在C++中，一个类通过继承多个基类完成多重继承，而Java由于只允许单继承，所以要实现多重继承就要借助接口+类（或者抽象类）+内部类，一般情况下是单继承一个类，然后通过实现接口（本类或者内部类）来完成多重继承的任务。

这里比较困难的就是：extends只有一个，我该extends谁？剩下的implements到底是本类执行还是内部类执行？总的来说有2个问题需要解决：

1. extends谁
2. implements interface由本类做还是内部类做？

解决方法是酱紫：

1. 这其实是一个好设计的基础，按我的理解，extends因为只有一个，所以要专注最重要的特性。同时，在学复用的时候说过，判断继承的原则就是**是否需要向上转型**。我们认真思考一下就知道了，这个子类一定算是父类公开接口的某一个实现（一般情况下是多个子类实现父类的接口）。那么，extends的就是最重要的特性。
2. 而对于implements，能用本类的情况就不要用内部类，因为内部类一般情况是想实现“内部”的功能，想对使用者透明（就比如每个容器自己实现一个private的迭代器）。另外一点，内部类的本质是为了使多重继承更加完整。所以下一章会努力找到“什么时候使用内部类”的答案。


###4. 适配接口

接口最吸引人的特性就是允许同一个接口具有多个不同的具体实现。一般情况下接口的常见用法就是*策略设计模式*，此时你编写一个执行某些操作的方法，而该方法将接受一个同样是你指定的接口。你主要就是要声明：“你可以用任何你想要的对象来调用我的方法，只要你的对象遵循我的接口。”这就使得方法更加灵活，通用，更具可复用性。

> 比如Java SE5的Scanner类，它的构造器接受的是一个Readable接口。你会发现Readable没有用作Java标准类库中其他任何方法的参数，它是专门为Scanner创建的（好流弊呀），以使得Scanner不必将其参数限制为某个特定类。通过这种方式，Scanner可以用作更多的类型。如果你创建了一个新的类，并且想让Scanner作用于它，就应该实现Readable接口。Talk is cheap, show me the code.

{% highlight java linenos %}
import java.io.IOException;
import java.nio.CharBuffer;
import java.util.Random;
import java.util.Scanner;

public class RandomWords implements Readable {

	private int count;

	public RandomWords(int count) {
		this.count = count;
	}

	private static Random random = new Random(47);
	private static final char[] capitals = "ABCDEFTHIGKLMNOPQRSTUVWXYZ".toCharArray();
	private static final char[] lowers = "abcdefghijklmnopqrstuvwxyz".toCharArray();
	private static final char[] vowerls = "aeiou".toCharArray();

	@Override
	public int read(CharBuffer cb) throws IOException {
		if (count-- == 0) {
			return -1;
		}
		cb.append(capitals[random.nextInt(capitals.length)]);

		for (int i = 0; i < 4; i++) {
			cb.append(vowerls[random.nextInt(vowerls.length)]);
			cb.append(lowers[random.nextInt(lowers.length)]);
		}
		cb.append(" ");
		return 10;
	}

	public static void main(String[] args) {
		@SuppressWarnings("resource")
		Scanner scanner = new Scanner(new RandomWords(10));
		while (scanner.hasNext()) {
			System.out.println(scanner.next());
		}
	}
}/*output:
Yazeruyac
Fowenucor
Toeazimom
Raeuuacio
Nuoadesiw
Hageaikux
Ruqicibui
Numasetih
Kuuuuozog
Waqizeyoy
*/
{% endhighlight java %}

那，如果你有一个未实现Readable的类，就可以使用适配器+代理的方式将它们搞定。

###5. 接口中的域

有个很值得思考的小问题：为什么接口中的域默认是public static final修饰的呢？

> * 首先接口是一种高度抽象的"模版"，,而接口中的属性也就是’模版’的成员，就应当是所有实现"模版"的实现类的共有特性，所以它是public static的,是所有实现类共有的。假如可以是非static的话，因一个类可以继承多个接口，出现重名的变量，如何区分呢？
 
 > * 其次,接口中如果定义非final变量的话，而方法又都是abstract的，这就自相矛盾了：有可变成员变量，但对应的方法却无法操作这些变量。虽然可以直接修改这些静态成员变量的值，但所有implements该类对应的值都被修改了，这好像是抽象类的行为。又因为接口是一种更高层面的抽象，是一种规范、功能定义的声明，所有可变的东西都应该归属到实现类中，这样接口才能起到标准化、规范化的作用。所以接口中的属性必然是final的。
 
 > * 最后，接口只是对事物的属性和行为更高层次的抽象。对修改关闭，对扩展（不同的implements）开放，接口是对开闭原则（Open-Closed Principle ）的一种体现。

 **但这只是Java SE5之前的用法，目前已经被更为通用的enum代替。所以真用要用到常量集的情况，优先考虑用枚举。**


###6. 接口与工厂

这个因为看过好几遍，终于有点感觉了。

所谓工厂模式，就是指**生成遵循某个接口的对象工作由工厂来做**。有一个A接口，两个实现类：A1,A2。我们使用的时候用的是`A a = new 工厂1();`然后工厂1就会吐给我们一个A1;用的是`A a = new 工厂2();`就会吐给我们一个A2。理论上，我们的代码将完全与接口的实现分离，这就使得我们可以透明的将某个实现替换为另一个实现（换个工厂就OK了）。下面就是例子：

{% highlight java linenos %}
/**
 * 
 * @author niushuai
 * 
 *         使用了工厂模式，我们现在有一个产品的模具，可以生产2种型号，分配给两家工厂生产。
 *         现在我想要实现的功能是：我指定一家工厂，你就自动给我出产品。 所以在工厂和产品之 
 *         间加了一层GetProduct接口，这样消费者只要指定工厂就可以了。
 * 
 */

interface ProductModel {
	void fun1();
	void fun2();
}

class Product1 implements ProductModel {
	public void fun1() {
		System.out.println("Product1 fun1()");
	}

	public void fun2() {
		System.out.println("Product1 fun2()");
	}
}

class Product2 implements ProductModel {
	public void fun1() {
		System.out.println("Product2 fun1()");
	}

	public void fun2() {
		System.out.println("Product2 fun2()");
	}
}

interface GetProduct {
	public ProductModel getProduct();
}

class Factory1 implements GetProduct {
	public ProductModel getProduct() {
		return new Product1();
	}
}

class Factory2 implements GetProduct {
	public ProductModel getProduct() {
		return new Product2();
	}
}

public class Factories {

	public static void customer(GetProduct getProduct) {
		ProductModel productModel = getProduct.getProduct();
		productModel.fun1();
		productModel.fun2();
	}

	public static void main(String[] args) {
		customer(new Factory1());
		customer(new Factory2());
	}
}/*output:
Product1 fun1()
Product1 fun2()
Product2 fun1()
Product2 fun2()
*/
{% endhighlight java %}
