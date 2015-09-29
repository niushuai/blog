---
layout: post
title: Java编程思想 - 第十五章、泛型(三)
categories: Java
tags: Java编程思想
---

####1. 边界

前面我们知道，擦除让我们在运行时只知道 Object，那么用泛型参数调用的方法只能是 Object 中的方法。但是，如果要能将这个参数限制为某个类型的子集，就可以用这些类型子集来调用方法。这也是本小节要讲的`extends/super`的使用。

首先我们来用一个前阵子碰到的问题作为引子：

{% highlight java linenos %}
public class Person { ... }
 
public class Students extends Person { ... }

public class Test {
	public static void main(String[] args) {
		List<Person> personList;
		List<Student> studentList;
		Person[] personArray;
		Student[] studentArray;

		// 判断下面4个赋值表达式是否正确
		studentList = personList;
		personList = studentList;
		studentArray = personArray;
		personArray = studentArray;
	}
}
{% endhighlight java %}

写下你的答案，并思考自己是否能想清楚每个表达式正确/错误的原因。如果你能做到，恭喜你对边界还是有一定了解的。



{% highlight java linenos %}

{% endhighlight java %}












{% highlight java linenos %}

{% endhighlight java %}

{% highlight java linenos %}

{% endhighlight java %}

{% highlight java linenos %}

{% endhighlight java %}

{% highlight java linenos %}

{% endhighlight java %}













