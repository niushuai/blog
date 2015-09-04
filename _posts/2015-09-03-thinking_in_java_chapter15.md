---
layout: post
title: Java编程思想 - 第十五章、泛型(一)
categories: Java
tags: Java编程思想
---

###本章主题

泛型大家都用过，也尝过甜头。但是是否思考过为什么要有泛型，以及在什么情况下需要使用泛型呢？不说开源项目了，就 Java 本身的代码（java.lang下面的），就大量使用了泛型。学习完本章，希望自己能对泛型有一个清晰的认识，能明白为何使用泛型、怎样正确的使用泛型。

####0. 泛型简介 & 与 C++比较

首先来说，泛型实现了**参数化类型**的概念，使代码可以应用于多种类型。泛型的主要目的之一就是用来指定容器要持有什么类型的对象，而且由**编译器**来保证类型的正确性。泛型在多个编程语言均有涉及，它最初的设计目的是希望类与方法能够具备最广泛的表达能力。那么，如何做到这点呢？正是通过解耦类或方法与所使用的类型之间的约束。

当然，作者也明确指出，和其他语言（比如 C++）对比，使用 Java 泛型机制无法做到的事情，其他语言中的参数化类型机制却能够做到。即使 Java 能做到的，其他语言也能用更优雅的方式实现。那么，学习完 Java 的泛型后，我们可以尝试着去和其他语言对比，看看 Java 在泛型上的不足，以后遇到不必须用 Java 实现的需求，就可以更高效的达到目的。

因为 Java 的设计者曾经说过：设计 Java 的灵感主要来自 C++。所以我们就拿 Java 和 C++做一下对比吧：

* 首先，了解 C++模板的某些方面，有助于理解泛型的基础。**最终的目的是帮助我们理解 Java 泛型的边界在哪里。理解了边界所在才能成为程序高手，因为只有知道了某个技术不能做什么，才能更好的做到所能做的**
* 第二点，在 Java 社区中，人们普遍对 C++模板有一种误解（what？），会在理解泛型的意图时产生偏差

####1. 简单泛型

这个就是最最基本的泛型使用，完全没有难度。所以我就放一个 demo 例子吧：

{% highlight java linenos %}
package Chapter15;

/**
 * 节点元素 + 下一个节点
 * 
 * @author niushuai
 *
 * @param <T>
 */
class Node<T> {
    T item;
    Node<T> next;

    Node() {
        item = null;
        next = null;
    }

    Node(T item, Node<T> next) {
        this.item = item;
        this.next = next;
    }

    boolean end() {
        return item == null && next == null;
    }
}

/**
 * 既然是栈，主要就是入栈和出栈了
 * 
 * @author niushuai
 *
 * @param <T>
 */
public class _01_LinkedStack<T> {
    // 栈底哨兵
    private Node<T> top = new Node<T>();

    public void push(T item) {
        top = new Node<T>(item, top);
    }

    public T pop() {
        T result = top.item;
        if (!top.end()) {
            top = top.next;
        }

        return result;
    }

    public static void main(String[] args) {
        _01_LinkedStack<String> lss = new _01_LinkedStack<String>();
        for (String s : "Phasers on stun!".split(" ")) {
            lss.push(s);
        }

        String s;
        while ((s = lss.pop()) != null) {
            System.out.println(s);
        }
    }
}
{% endhightlight java %}

####2. 泛型接口

这个也算是简单泛型了，就是对接口使用泛型。我也写了个 demo：

{% highlight java linenos %}
import java.util.Iterator;

public class _05_IterableFibonacci extends _04_Fibonacci implements Iterable<Integer> {
    private int n;

    // 要遍历count 次
    public _05_IterableFibonacci(int count) {
        n = count;
    }

    @Override
    public Iterator<Integer> iterator() {

        return new Iterator<Integer>() {
            @Override
            public boolean hasNext() {
                return n > 0;
            }

            @Override
            public Integer next() {
                n--;
                return _05_IterableFibonacci.this.next();
            }
        };
    }

    public static void main(String[] args) {
        for (int i : new _05_IterableFibonacci(18)) {
            System.out.println(i + " ");
        }
    }
}
{% endhightlight java %}

####3. 泛型方法

首先需要知道的是，可以在类中包含参数化方法，而这个方法所在的类可以是泛型类，也可以不是泛型类。也就是说，是否拥有泛型方法，与其所在的类是否是泛型没有关系。泛型方法使得该方法能够独立于类而产生变化。一个基本原则是：

> 无论何时，只要你能做到，你就应该尽量使用泛型方法。也就是说，如果使用泛型方法可以取代将整个类泛型化，那么就应该只使用泛型方法，因为它可以使事情更清楚明白。另外，对于一个 static 的方法而言，无法访问泛型类的类型参数，所以，如果 static 方法需要使用泛型能力，就必须使其成为泛型方法。

仔细一想，泛型方法其实用的还是蛮多的。比如经常使用 Guava 的工具类：

{% highlight java linenos %}
// 以前初始化
Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();
// 使用 Guava 后
Map<String, List<Integer>> map = Maps.newHashMap();
{% endhightlight java %}

其实我们去看一下Guava 的代码就知道怎么做的了：

{% highlight java linenos %}
public static <K, V> HashMap<K, V> newHashMap() {
    return new HashMap<K, V>();
}
{% endhightlight java %}

这里需要注意一点：**类型推断只对赋值操作有效，其他时候并不起作用。**如果你将一个泛型方法调用的结果作为参数，传递给另一个方法，这时编译器并不会执行类型推导。因为编译器认为：调用泛型方法后，其返回值被赋给一个 Object 类型的变量。这时候解决方法是使用显式的类型说明：

> 在泛型方法中，可以显式指明类型，不过这种语法很少用到（只有在编写非赋值语句时，才需要显式指明类型）。要显式指明类型，必须在点操作符和方法名之间插入泛型类型。如果是在定义该方法的类的内部，必须在点操作符之前使用 this 关键字，如果是使用 static 方法，必须在点操作符之前加上类名。

写了一个 demo 试验：

{% highlight java linenos %}
import java.util.HashMap;
import java.util.Map;

public class _08_ExplicitTypeSpecification {

    // 这里是静态方法的 new
    static class StaticNew {
        public static <K, V> Map<K, V> map() {
            return new HashMap<K, V>();
        }
    }

    // 普通实例化的 new
    class InstanceNew {
        public <K, V> Map<K, V> map() {
            return new HashMap<K, V>();
        }
    }

    // 类内部的 new
    public <K, V> Map<K, V> map() {
        return new HashMap<K, V>();
    }

    static void test1(Map<Integer, String> map) {

    }

    public void main() {
        // compile error, StaticNew.map() return Map<Object, Object>, but test1 requried Map<Integer, String>
        test1(StaticNew.map());
        // compile ok. 等价于Map<Integer, String> map = StaticNew.<Integer, String>map();
        test1(StaticNew.<Integer, String> map());

        // compile error, InstanceNew.map() return Map<Object, Object>, but test1 requried Map<Integer, String>
        test1(new InstanceNew().map());
        // compile ok. 等价于Map<Integer, String> map2 = new InstanceNew().<Integer, String>map();
        test1(new InstanceNew().<Integer, String> map());

        // compile error, this.map() return Map<Object, Object>, but test1 requried Map<Integer, String>
        test1(this.map());
        // compile ok. 等价于Map<Integer, String> map = this.<Integer, String>map();
        test1(this.<Integer, String> map());
    }
}
{% endhightlight java %}

####4. 擦除的神秘之处

当开始深入研究泛型时，会发现泛型中有大量的东西初看起来是没有意义的。其中擦除减少了泛型的泛化性，**泛型之所以不是那么“好用”，原因就是擦除。但是，擦除作为泛型实现中的一种折中，所以必须要有所取舍。这种折中会使我们使用泛型的时候很不爽，但是我们能做的就是习惯并了解它为什么是这样。当你在不限制使用 Java 的时候，你就可以用其他语言更优雅的实现你的需求：）**

例如，尽管可以声明 ArrayList.class，但是不能声明 ArrayList<Integer>.claxs，比如下面的例子：

{% highlight java linenos %}
import java.util.ArrayList;

public class _09_ErasedTypeEquivalence {
    public static void main(String[] args) {
        Class c1 = new ArrayList<Integer>().getClass();
        Class c2 = new ArrayList<String>().getClass();

        System.out.println(c1 == c2);

        // true
    }
}
{% endhightlight java %}

什么，Integer 和 String 的 List 竟然是相同的？？反正刚开始我觉得肯定是不同的啊，因为```c2.add(new Integer(3))```肯定会报错啊。别急，更崩溃的例子在下面：

{% highlight java linenos %}
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Test1 {

}

class Test2 {

}

class Test3<Q> {

}

class Test4<POSITION, MOMENT> {

}

public class _10_LostInformation {
    public static void main(String[] args) {
        List<Test1> list = new ArrayList<Test1>();
        Map<Test1, Test2> map = new HashMap<Test1, Test2>();
        Test3<Test2> tt = new Test3<Test2>();
        Test4<Long, Double> t4 = new Test4<Long, Double>();

        System.out.println(Arrays.toString(list.getClass().getTypeParameters()));
        System.out.println(Arrays.toString(map.getClass().getTypeParameters()));
        System.out.println(Arrays.toString(tt.getClass().getTypeParameters()));
        System.out.println(Arrays.toString(t4.getClass().getTypeParameters()));
    }
}/*output:
[E]
[K, V]
[Q]
[POSITION, MOMENT]
*/
{% endhightlight java %}

看到输出了没，其中的 E/K/V/Q/POSITION/MOMENT 都是一个类型参数占位符而已。虽然`Class.getTypeParameters()`的文档说“返回一个 TypeVariable 对象数组，表示有泛型声明所声明的类型参数……“，好像暗示我们能获得参数类型的信息。但是，正如你从输出中看到的，你能够发现的只是用作参数占位符的标识符，没有其他有用的信息。所以，事实是：**在泛型代码内部，无法获得任何有关泛型参数类型的信息。**

> 我们可以显式看到类型参数标识符和泛型类型边界（上界下界）信息，但是编译器看不见，所以也就不能创建某个特定实例的实际的类型参数。**Java 泛型是使用擦除来实现的**，这意味着当你在使用泛型时，任何具体的信息都被擦除了，你唯一知道的就是你在使用一个对象。因此`List<String>`和`List<Integer>`在运行时事实上都是相同的类型`List`。理解擦除以及应该如何处理它，是学习 Java 泛型面临的最大障碍。

首先我们来看看 C++的方式，毕竟 Java 是受 C++的启发：

{% highlight cpp linenos %}
#include<iostream>
using namespace std;

template<class T> class Manipulator {
  T obj;
  public:
    Manipulator(T x) {
      obj = x;
    }
    void manipulate() {
      obj.f();
    }
};

class HasF {
  public:
    void f() {
      cout<<"HasF:f()"<<endl;
    }
};

int main(void) {
  HasF hf;
  Manipulator<HasF> manipulator(hf);
  manipulator.manipulate();
}/*output:
HasF:f()
*/
{% endhightlight cpp %}

然后我们把这段代码翻译成 Java：

{% highlight java linenos %}
/**
 * 因为擦除效应，Java 编译器无法将manipulate()在 obj 上调用f()这个需求映射到 HasF 有f()这一事实上
 * 
 * 解决办法是协助泛型类，给定泛型类的边界，这样编译器才不会完全不知所措。
 * 
 * @author niushuai
 *
 * @param <T>
 */

class HasF {
    public void f() {
        System.out.println("HasF:f()");
    }
}

class Manipulator<T> {
    private T obj;

    public Manipulator(T x) {
        obj = x;
    }

    public void manipulate() {
        // 找到 f()这个方法
        // obj.f();
    }
}

// 指定了擦除边界，编译器最后知道的就是，这个没有泛型，就是 HasF
class ManipulatorNew<T extends HasF> {
    private T obj;

    public ManipulatorNew(T x) {
        obj = x;
    }

    public void manipulate() {
        obj.f();
    }
}

public class _11_Manipulation<T> {
    public static void main(String[] args) {
        HasF hf = new HasF();
        Manipulator<HasF> manipulator = new Manipulator<HasF>(hf);
        manipulator.manipulate();
    }
}
{% endhightlight java %}

很悲伤的发现，Manipulator<T>是无法通过编译的，因为编译器不知道 f()是什么鬼，它不会在编译期知道实例化参数中只要有 f()就可以了。而第二个版本因为指定了边界，编译器傻乎乎的将 T extends HasF替换为 HasF，而 HasF 本来就有 f()，所以才能调用`obj.f()`。但是这样的话，泛型没有贡献任何好处，我们自己就可以手工执行擦除，创建出没有泛型的类：

{% highlight java linenos %}
class Manipulator3 {
	private HasF obj;
	public Manipulator3(HasF x) {
		obj = x;
	}
	publc void manipulate() {
		obj.f();
	}
}
{% endhightlight java %}

这么一看，程序因为少了泛型反而简单了不少。那么，这里又扯出另一个问题：什么时候使用泛型更加合适呢？

> 只有当你希望使用的类型参数比某个具体类型（以及它的子类型）更加泛化时——也就是说，当你希望代码能够跨越多个类工作时，使用泛型才有所帮助。因此，类型参数和它们在有用的泛型代码中的应用，通常比简单的类替换要更加复杂。但是，不能因此否认`<T extends HasF>`一定是不合理的。比如当返回值是 T 的时候，泛型就非常方便：

{% highlight java linenos %}
class ReturnGenericType<T extends HasF> {
	private T obj;
	public ReturnGenericType(T x) {
		obj = x;
	}
	public T get() {
		return obj;
	}
}
{% endhightlight java %}

这时候你要是想手工擦除，就得每个具体类型都写一遍，这样就得不偿失了。

####5. 擦除由来 & 问题

没想到 Java 设计擦除的原因是保持兼容性。官方说法是：

> 假设某个应用程序具有两个类库 X/Y，并且 Y 还要使用类库 Z。随着 Java SE5的出现，这个应用程序和这些类库的创建者最终可能希望迁移到泛型上。但是，迁移是个大工程，不能为了迁移而迁移。所以，为了实现迁移兼容性，**每个类库和应用程序都必须与其他所有的部分是否使用了泛型无关**。这样，它们不能拥有探测其他类库是否使用了泛型的能信。因此，某个特定的类库使用了泛型这样的证据必须被“擦除”。试想，如果没有某种类型的迁移途径，所有已经构建了很长时间的类库就需要与希望迁移到 Java 泛型的开发者们说再见了。正因为类库对于编程语言极其重要，所以这不是一种可以接受的代价。**擦除是否是最佳的或者唯一的迁移途径，还需要时间来检验。**

请记住：**无论何时，当你在编写泛型代码时，必须时刻提醒自己，你只是看起来好像拥有有关参数的类型信息而已。**，比如下面的代码：

{% highlight java linenos %}
class Foo<T> {
	T var;
}

Foo<Cat> f = new Foo<Cat>();
{% endhightlight java %}

//那么，看起来当你创建 Foo 的实例时，class Foo 中的代码应该知道现在工作于 Cat 之上，而泛型语法也仿佛强烈暗示：在整个类中的各个地方，类型 T 都在被替换。但是事实并非如此，无论何时，当你在编写这个类的代码时，必须提醒自己：“不，它仅仅是一个 Object。”

####6. 边界处的动作

这是什么意思呢？核心一句话：

> 边界就是发生动作的地方：对传递进来的值进行额外的编译期检查，并插入对传递出去的值的转型。

光说不好理解，我们从例子出来来讲解：

{% highlight java linenos %}
import java.util.ArrayList;
import java.util.List;

/**
 * create 竟然没有任何警告，虽然我们知道 {@code new ArrayList<T>}的{@code <T>}被擦除了
 * <p>
 * 
 * 在 运行时，这个类的内部没有任何{@code <T>},但是也不能变为{@code new ArrayList()}，编译器会用的啊！！！<br>
 * 编译器在编译期确保放置到 result 的对象具有 T 类型，所以即使擦除在方法或类内部有关实际类型的信息，<br>
 * 编译器在编译期也能确保在方法或类中使用的类型的内部一致性。
 * <p>
 * 
 * 那么，在运行时没有了类型信息，就需要确定边界：即对象进入和离开方法的地点。这些正是编译器在编译期提前做好的<br>
 * 编译器会在编译期执行类型检查并插入转型代码的地点。
 */
public class _14_FilledListMaker<T> {
    List<T> create(T t, int n) {
        List<T> result = new ArrayList<T>(n);
        for (int i = 0; i < n; i++) {
            result.add(t);
        }
        return result;
    }

    public static void main(String[] args) {
        _14_FilledListMaker<String> stringMaker = new _14_FilledListMaker<String>();
        List<String> stringList = stringMaker.create("Hello", 9);

        System.out.println(stringList);
    }
}
{% endhightlight java %}

下面我们就通过编译代码来看看，编译器在编译期是怎么处理类型参数的（不用细看，下面接着看将_12_SimpleHolder泛型化后的结果）：

{% highlight java linenos %}
public class _12_SimpleHolder {
    private Object obj;

    public void set(Object obj) {
        this.obj = obj;
    }

    public Object get() {
        return obj;
    }

    public static void main(String[] args) {
        _12_SimpleHolder holder = new _12_SimpleHolder();
        holder.set("item");
        String s = (String) holder.get();
    }
}

// 使用 javap -c _12_SimpleHolder.class 得到反编译后的代码：
public class Chapter15._12_SimpleHolder {
  public Chapter15._12_SimpleHolder();
    Code:
       0: aload_0
       1: invokespecial #10                 // Method java/lang/Object."<init>":()V
       4: return

  public void set(java.lang.Object);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #18                 // Field obj:Ljava/lang/Object;
       5: return

  public java.lang.Object get();
    Code:
       0: aload_0
       1: getfield      #18                 // Field obj:Ljava/lang/Object;
       4: areturn

  public static void main(java.lang.String[]);
    Code:
       0: new           #1                  // class Chapter15/_12_SimpleHolder
       3: dup
       4: invokespecial #24                 // Method "<init>":()V
       7: astore_1
       8: aload_1
       9: ldc           #25                 // String item
      11: invokevirtual #27                 // Method set:(Ljava/lang/Object;)V
      14: aload_1
      15: invokevirtual #29                 // Method get:()Ljava/lang/Object;
      18: checkcast     #31                 // class java/lang/String
      21: astore_2
      22: return
}
{% endhightlight java %}

下面是泛型化后的_12_SimpleHolder：

{% highlight java linenos %}
public class _15_GenericHolder<T> {
    private T obj;

    public void set(T obj) {
        this.obj = obj;
    }

    public T get() {
        return obj;
    }

    public static void main(String[] args) {
        _15_GenericHolder<String> holder = new _15_GenericHolder<String>();
        holder.set("Item");
        // 这里没有转型了，但是我们知道传递给 set()的值在编译期还是会接受检查
        String s = holder.get();
    }
}

// 反编译：
public class Chapter15._15_GenericHolder<T> {
  public Chapter15._15_GenericHolder();
    Code:
       0: aload_0
       1: invokespecial #12                 // Method java/lang/Object."<init>":()V
       4: return

  public void set(T);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #23                 // Field obj:Ljava/lang/Object;
       5: return

  public T get();
    Code:
       0: aload_0
       1: getfield      #23                 // Field obj:Ljava/lang/Object;
       4: areturn

  public static void main(java.lang.String[]);
    Code:
       0: new           #1                  // class Chapter15/_15_GenericHolder
       3: dup
       4: invokespecial #30                 // Method "<init>":()V
       7: astore_1
       8: aload_1
       9: ldc           #31                 // String Item
      11: invokevirtual #33                 // Method set:(Ljava/lang/Object;)V
      14: aload_1
      15: invokevirtual #35                 // Method get:()Ljava/lang/Object;
      18: checkcast     #37                 // class java/lang/String
      21: astore_2
      22: return
}
{% endhightlight java %}

有没有泛型，产生的字节码竟然是**相同的**。对进入 set()的类型进行检查是不需要的，因为这将由编译器执行。而对从 get()返回的值进行转型仍旧是需要的，但这将由编译器来自动完成。**由于所产生的 get()和 set()字节码相同，所以在泛型中的所有动作都发生在边界处——对传递进来的值进行额外的编译期检查，并插入对传递出去的值的转型。这有助于澄清对擦除的混淆，“边界就是发生动作的地方。”**