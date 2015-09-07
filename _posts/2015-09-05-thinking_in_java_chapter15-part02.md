---
layout: post
title: Java编程思想 - 第十五章、泛型(二)
categories: Java
tags: Java编程思想
---

####1. 擦除的补偿

上篇文章讲了擦除的原因是为了兼容性，同时也学习了神奇的“边界动作”：传递进来的值进行额外的编译期检查，插入对传递出去的值的转型(checkcast)。

这个小节主要讲解的是：

如果使用泛型的过程中，类型信息被擦除了，但是我需要类型信息做一些事情。这可以实现吗？答案是可以的，**引入类型标签来对擦除进行补偿**。但是这算曲线救国的一种，实现方式不用想都会很“丑陋”。那么，什么是类型标签呢？其实就是显式传入 XX.class，里面初始化的时候用这个 class 进行初始化，相当于泛型还是完全没有鸟用= =

比如这个代码，类型信息被擦除了：

{% highlight java linenos %}
// 无法编译，因为 T 的类型被擦除了。
class Erased<T> {
    public static void f(Object obj) {
        // if(obj instanceof T) {
        //
        // }
        //
        // T var = new T();
        //
        // T[] array = new T[SIZE]; //不能创建泛型数组
        // T[] array = (T)new Object[SIZE]; //这样可以，但是运行时还是被擦除 T
    }
}

class Building {

}

class House extends Building {

}

// 显式把 class 传入，其实和擦除也没有关系，知道类型了肯定可以创建相应的实例啊
public class _16_Erased<T> {

	// 其实这就是类型标签，显示传入 T 类型的 class 对象，让内部可知
    private Class<T> type;

    public _16_Erased(Class<T> type) {
        this.type = type;
    }

    public boolean f(Object obj) {
    	// 我知道了 T 的类型
        return type.isInstance(obj);
    }

    public static void main(String[] args) {
        _16_Erased<Building> ctt1 = new _16_Erased<Building>(Building.class);
        System.out.println(ctt1.f(new Building()));
        System.out.println(ctt1.f(new House()));

        System.out.println("============");

        _16_Erased<House> ctt2 = new _16_Erased<House>(House.class);
        System.out.println(ctt2.f(new Building()));
        System.out.println(ctt2.f(new House()));
    }
}
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

class Employee {

}

// 第一个没问题，因为有默认的构造函数，但是 Integer 没有默认构造函数，所以在运行时会报错
public class _17_InstantiateGenericType {
    public static void main(String[] args) {
        ClassAsFactory<Employee> fe = new ClassAsFactory<Employee>(Employee.class);
        System.out.println("ClassAsFactory<Employee> succeed");

        ClassAsFactory<Integer> fi = new ClassAsFactory<Integer>(Integer.class);
        System.out.println("ClassAsFactory<Integer> failed");
    }
}
{% endhighlight java %}

我们看到，编译是没有问题的，但是在运行时会因 `ClassAsFactory<Integer> 失败，因为 Integer 没有任何默认构造函数。而且在这个错误在编译期是无法捕获的，所以 Sun 的工程师觉得这样不容易发现错误，建议使用显式的工厂，并将限制其类型，使得只能接受实现了这个工厂的类：

{% highlight java linenos %}
interface FactoryI<T> {
    T create();
}

class Foo2<T> {
    private T x;

    // 我只接受工厂，具体的 create()你们自己确保实现
    public <F extends FactoryI<T>> Foo2(F factory) {
        x = factory.create();
    }
}

class IntegerFactory implements FactoryI<Integer> {

    @Override
    public Integer create() {
        return new Integer(0);
    }
}

class Widget {
    public static class Factory implements FactoryI<Widget> {

        @Override
        public Widget create() {
            return new Widget();
        }
    }
}

public class _18_FactoryConstraint {
    public static void main(String[] args) {
        new Foo2<Integer>(new IntegerFactory());
        new Foo2<Widget>(new Widget.Factory());
    }
}
{% endhighlight java %}

这本质上还是使用 Class<T>的一种变体，只是加上一层工厂方法，保证在编译期进行类型检查。

####1. 














{% highlight java linenos %}

{% endhighlight java %}

{% highlight java linenos %}

{% endhighlight java %}

{% highlight java linenos %}

{% endhighlight java %}

{% highlight java linenos %}

{% endhighlight java %}