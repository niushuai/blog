---
layout: post
title: Java编程思想 - 第十五章、泛型(二)
categories: Java
tags: Java编程思想
---

####1. 擦除的补偿

上篇文章讲了擦除的原因是为了兼容性，同时也学习了神奇的“边界动作”：传递进来的值进行额外的编译期检查，插入对传递出去的值的转型(checkcast)。

这个小节主要讲解的是：

如果使用泛型的过程中，类型信息被擦除了，但是我需要类型信息做一些事情。这可以实现吗？答案是可以的，**引入类型标签来对擦除进行补偿**。但是这算曲线救国的一种，实现方式不用想都会很“丑陋”。那么，什么是类型标签呢？其实就是显式传入`XX.class`，然后用这个 class 进行实例化(xx.class.newInstance())，相当于泛型还是完全没用= =

比如这个代码，类型信息被擦除了：

{% highlight java linenos %}
// 无法编译，因为 T 的类型被擦除了。
class Erased<T> {
    public static void f(Object obj) {
        // if(obj instanceof T) {} instanceof 是前面学过的 RTTI（运行时类型识别）,因为 T 在运行时已经被擦除，所以错误
        // T var = new T(); // 类型被擦除，无法用 new 实例化
        // T[] array = new T[SIZE]; //不能创建泛型数组
        // T[] array = (T)new Object[SIZE]; //这样可以，但是运行时 T 还是被擦除
    }
}

// 下面通过引入类型标签来完成

class Building {}
class House extends Building {}

// 显式把 class 传入，其实和擦除也没有关系，知道类型了肯定可以创建相应的实例啊...
public class _16_Erased<T> {

	// 其实这就是类型标签，显示传入 T 类型的 class 对象，让内部可知
    private Class<T> type;

    // 构造函数显示传入 T
    public _16_Erased(Class<T> type) {
        this.type = type;
    }

    public boolean f(Object obj) {
    	// 我知道了 T 的类型
        return type.isInstance(obj);
    }

    public static void main(String[] args) {
    	// 传入类型标签为 Building.class
        _16_Erased<Building> ctt1 = new _16_Erased<Building>(Building.class);
        // 下面2个都是 Building 的实例，所以都是 true
        System.out.println(ctt1.f(new Building()));
        System.out.println(ctt1.f(new House()));

        System.out.println("============");

        _16_Erased<House> ctt2 = new _16_Erased<House>(House.class);
        // Building 不是 House 的实例，所以是 false
        System.out.println(ctt2.f(new Building()));
        System.out.println(ctt2.f(new House()));
    }
}/*output:
true
true
false
true
*/
{% endhighlight java %}

而补偿方法呢，就是使用类型标签作为辅助。代码是下面这种样子：

{% highlight java linenos %}
package Chapter15;

class ClassAsFactory<T> {
    T x;

    public ClassAsFactory(Class<T> kind) {
        try {
        	// 使用类型标签进行辅助创建实例
            x = kind.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

class Employee {}

// 第一个没问题，因为有默认的构造函数；Integer 没有默认构造函数，所以在运行时会报错
public class _17_InstantiateGenericType {
    public static void main(String[] args) {
        ClassAsFactory<Employee> fe = new ClassAsFactory<Employee>(Employee.class);
        System.out.println("ClassAsFactory<Employee> succeed");

        ClassAsFactory<Integer> fi = new ClassAsFactory<Integer>(Integer.class);
        System.out.println("ClassAsFactory<Integer> failed");
    }
}
{% endhighlight java %}

从运行结果我们可以看出，编译是没有问题的，但是在运行时会因 `ClassAsFactory<Integer>` 失败，因为 Integer 没有任何默认构造函数。而且这个错误在编译期是无法捕获的，所以 Sun 的工程师觉得这样不容易发现错误，建议使用显式的工厂，并限制其类型，使得只能接受实现了这个工厂的类：

{% highlight java linenos %}
// 显示工厂
interface FactoryI<T> {
    T create();
}

// 实现工厂方法
class IntegerFactory implements FactoryI<Integer> {

    @Override
    public Integer create() {
        return new Integer(0);
    }
}

// 实现工厂方法
class Widget {
    public static class Factory implements FactoryI<Widget> {

        @Override
        public Widget create() {
            return new Widget();
        }
    }
}

class Foo2<T> {
    private T x;

    // 我只接受工厂，具体的 create()你们自己确保实现。F extends FactoryI<T>会实现编译时检查，
    // F 必须是 FactoryI<T>接口的实现
    public <F extends FactoryI<T>> Foo2(F factory) {
        x = factory.create();
    }
}

public class _18_FactoryConstraint {
    public static void main(String[] args) {
        new Foo2<Integer>(new IntegerFactory());
        new Foo2<Widget>(new Widget.Factory());
    }
}
{% endhighlight java %}

这本质上还是使用 Class<T>的一种变体，只是加上一层工厂方法，保证在编译期（`F extends FactoryI<T>`）进行类型检查。

####2. 泛型数组

这个小节可以借助1.5版本的 ArrayList 进行说明（作者在这里披露了一段黑历史：Neal Gafter 在他的博客中说，自己重写 Java 类库时十分懒散，所以设计的很烂，在不破坏现有接口的情况下，他将无法修改某些 Java 类库的代码。所以结论是**Java 类库中的源码中出现的个别惯用法，并不能表示这就是正确的，尽信书则不如无书是也**）。因为 ArrayList 是通过数组实现的，而 ArrayList 又支持泛型，所以用它来讲解泛型数组最合适不过了。但是在这里不想引用ArrayList 中大量的代码，而是通过一个精简版的 ArrayList 来说明问题，我们主要通过

* 使用 T 类型
* 使用 Object 类型
* 使用类型标签

三种方式来说明泛型数组该如何使用以及最佳编程实践：）

在最上面的代码(Erase.java)中，我们看到，`T[] array = new T[SIZE];`会编译错误，一般的解决方案是在任何想要创建泛型数组的地方使用 ArrayList：

{% highlight java linenos %}
public class _19_ListOfGenerics<T> {
    private List<T> array = new ArrayList<T>();

    public void add(T item) {
        array.add(item);
    }

    public T get(int index) {
        return array.get(index);
    }
}
{% endhighlight java %}

这里可以获得数组的行为（ArrayList本质就是实现 List 接口，底层使用数组保存所有元素），以及由泛型提供的编译期的类型安全。但是有时候，你还是希望能够创建自己的泛型类型的数组，比如：

{% highlight java linenos %}
public class _20_ArrayOfGeneric {
    static final int SIZE = 100;
    // gia 在创建的时候就确定了类型是 Integer
    static Generic<Integer>[] gia;

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        // 编译错误，ClassCastException
        // gia = (Generic<Integer>[]) new Object[SIZE];
        gia = (Generic<Integer>[]) new Generic[SIZE];
        System.out.println(gia.getClass().getSimpleName());
        gia[0] = new Generic<Integer>();

        // 下面2个在编译期就提示错误
        // gia[1] = new Object();
        // gia[2] = new Generic<Double>();
    }
}
{% endhighlight java %}

说实话，这段代码我并没有看懂。。。为啥用 new Object[SIZE]就编译错误，而用 new Generic[SIZE]就没问题呢？**我个人理解是，gia 在创建的时候已经确定类型为`Generic<Integer>`，你用 `new Object[]` 转型是既不知道 Generic，也不知道 T，而 `new Generic[]` 则只是没有 T 的信息。**额，还是晕了 T_T

书里说的是：

> 成功创建泛型数组的唯一方式就是创建一个被擦除类型的新数组，然后对其转型。

下面将通过三个代码来演示，注意：3个代码需要放在一起比较哦。先使用 T 类型进行演示：

{% highlight java linenos %}
public class _21_GenericArray<T> {
    // 因为不能使用 T[] array = new T[size]，所以用 Object 来创建
    private T[] array;

    public _21_GenericArray(int size) {
        array = (T[]) new Object[size];
    }

    public void put(int index, T item) {
        array[index] = item;
    }

    public T get(int index) {
        return array[index];
    }

    public T[] rep() {
        return array;
    }

    public static void main(String[] args) {
        _21_GenericArray<Integer> gai = new _21_GenericArray<Integer>(10);

        // 会有一个类型转换异常,因为运行时 gai 已经是 Object[]了，不能转成 Integer
        // Integer[] ia = gai.rep();

        Object[] ia = gai.rep();
    }
}
{% endhighlight java %}

下面使用 Object 类型进行演示：

{% highlight java linenos %}
/**
 * 这个的改进之处是在里面使用的就是 Object[]，而不是在创建时就立即将其转型为 T[],<br>
 * 立即转型存在的问题是：编译期该数组的实际类型将丢失，编译器可能会错过某些潜在的错误检查<br>
 * 所以正确是在集合内部使用 Object[]，当你使用数组元素时，才将其转型。
 * <p>
 * 书上的解释是：在内部将 Array 当做 Object[]而不是 T[]的优势是，我们不太可能忘记这个数组<br>
 * 的运行时类型，从而意外地引入缺陷（尽管大多数也可能是所有这类缺陷都可以在运行时快速探测到。
 * <p>
 * 我想说，这翻译的是个鬼！！！！！！！！！
 *
 */
public class _22_GenericArray2<T> {
    private Object[] array;

    public _22_GenericArray2(int size) {
        array = new Object[size];
    }

    public void put(int index, T item) {
        array[index] = item;
    }

    public T get(int index) {
        return (T) array[index];
    }

    public T[] rep() {
        return (T[]) array;
    }

    public static void main(String[] args) {
        _22_GenericArray2<Integer> gai = new _22_GenericArray2<Integer>(10);

        for (int i = 0; i < 10; i++) {
            gai.put(i, i);
        }

        for (int i = 0; i < 10; i++) {
            System.out.print(gai.get(i) + " ");
        }
        System.out.println();

        // 这里还是会抛出转型异常，gai被擦除后是无论如何都转不成 Integer[]的
        try {
            Integer[] ia = gai.rep();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
{% endhighlight java %}

下面使用类型标签进行演示：

{% highlight java linenos %}
public class _23_GenericArrayWithTypeToken<T> {
    private T[] array;

    @SuppressWarnings("unchecked")
    public _23_GenericArrayWithTypeToken(Class<T> type, int size) {
        array = (T[]) Array.newInstance(type, size);
    }

    public void put(int index, T item) {
        array[index] = item;
    }

    public T get(int index) {
        return array[index];
    }

    public T[] rep() {
        return array;
    }

    public static void main(String[] args) {
        _23_GenericArrayWithTypeToken<Integer> gai = new _23_GenericArrayWithTypeToken<Integer>(Integer.class, 10);
        // 使用类型标签以后终于可以了，看到这个才是王道。泛型完全不行啊，太垃圾了！！！！
        Integer[] ia = gai.rep();
    }
}
{% endhighlight java %}

如果运行3个程序，会发现前面2个使用泛型的功能是无法完成的，只有通过类型标签才能实现我们想要的功能，不禁让我产生了泛型这么弱的错觉（其实说不定和其他语言比起来就是弱爆了？）。。第三个程序中，类型标签 Class<T>被传递到构造器中，以便从擦除中恢复，使得我们可以创建需要的实际类型的数组，尽管从转型中产生的警告必须用@SuppressWarnings 压制住。