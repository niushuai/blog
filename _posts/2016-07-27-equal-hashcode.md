---
layout: post
title: equals()和 hashCode()的坑
categories: Java
tags: equal+hashcode
---

### 前言

今天写代码踩了一个老坑，时间长又忘了= =那就详细总结下，留着备忘。这篇文章会分成两个部分：

1. 对hashCode()和equals()的讨论。
2. 如何正确、高效的使用。 

### equals()和 hashCode()

hashCode()和equals()定义在Object类中，这个类是所有java类的基类，所以所有的java类都继承这两个方法。其实官方文档已经详细的说明它们之间的关系了：

> When inserting an object into a hastable you use a key. The hash code of this key is calculated, and used to determine where to store the object internally. When you need to lookup an object in a hashtable you also use a key. The hash code of this key is calculated and used to determine where to search for the object.
> 
> The hash code only points to a certain "area" (or list, bucket etc) internally. Since different key objects could potentially have the same hash code, the hash code itself is no guarantee that the right key is found. The hashtable then iterates this area (all keys with the same hash code) and uses the key's equals() method to find the right key. Once the right key is found, the object stored for that key is returned.
> 
> So, as you can see, a combination of the hashCode() and equals() methods are used when storing and when looking up objects in a hashtable.
> 
> **If equal, then same hash codes too. Same hash codes no guarantee of being equal.**


hashCode()方法被用来获取给定对象的唯一整数。这个整数被用来确定对象被存储在HashTable类似的结构中的位置。默认的，Object类的hashCode()方法返回这个对象存储的内存地址的编号；而 equals()直接看文档，写的无比清楚。包括重载时候需要满足的5个条件等等。

如果平时的使用涉及到两个自定义类的相等判断，就涉及这两个函数了。我们举个例子，假如现在有一个学生类，学生信息有学号、姓名、性别吧。

{% highlight java linenos %}
public class Student {
private Integer id;
private String name;
private String sex;

// getter & setter
}
{% endhighlight java %}

现在要比较两个学生是不是相等（也就是说，俩学生是不是同一个人）

{% highlight java linenos %}
public class EqualTest {
public static void main(String… args) {
Student student1 = new Student();
Student student2 = new Student();

student1.setId(16);
student2.setId(16);

System.out.println(student1.equals(student2));
}
}
{% endhighlight java %}

显然上面会输出 false。但实际上我们是希望返回 true 的，那就得重写 equals()方法：

{% highlight java linenos %}
public boolean equals(Object o) {
    if(o == null) {
        return false;
    }
    if (o == this) {
       return true;
    }
    if (getClass() != o.getClass()) {
        return false;
    }
    Student student = (Student)o;
        
return this.getId() == student.getId();
}
{% endhighlight java %}

然后我们重新运行上面的 EqualTest 就能输出 true 了，大功告成！！！但是，，，，真的万事大吉了吗？非也非也。。。当然，光看这个程序是看不出问题的，我们来看下面这个例子：

{% highlight java linenos %}
import java.util.HashSet;
import java.util.Set;
 
public class EqualsTest {
    public static void main(String… args) {
        Student student1 = new Student();
        Student student2 = new Student();
 
        student1.setId(16);
        student2.setId(16);
 
        //print 'true'
        System.out.println(student1.equals(student2));
 
        Set\<Student\> students = new HashSet\<Student\>();
        students.add(student1);
        students.add(student2);

        //print two students…
        System.out.println(students);
}
}
{% endhighlight java %}

一运行……擦，竟然输出了2个学生。。但其实他们学号相同，应该是一个啊，Set中也没有重复元素，那怎么输出了2个？原因上面的文档已经很清楚了：**equal相等时，hashcode一定相等；hashcode相等时，equal不一定相等。**所以，按照 javadoc 里说的那样：

> Note that it is generally necessary to override the hashCode method whenever this method is overridden, so as to maintain the general contract for the hashCode method, which states that equal objects must have equal hash codes.

我们来重载一下 hashCode 方法

{% highlight java linenos %}
@Override
 public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = PRIME * result + getId();
    return result;
 }
{% endhighlight java %}

然后重新运行一下会发现结果终于正确了

### 如何正确高效使用

上面我们是自己实现了 equals()和 hashCode()方法，总结一下，实现方式大概有这么几种：

1. 如果程序性能要求比较高，可以自己实现 hash 算法，然后重写 hashCode()和 equals()。
2. 如果有 IDE 的话，可以通过 IDE 自动生成，比如 Eclipse 中可以根据属性来选择决定 equals()和 hashCode()的实现。
3. 使用一些第三方实现，比如 Apache Commons Lang提供的 EqualsBuilder 和 HashCodeBuilder，具体请查阅文档。

然后需要说明的是，尽量使用**相同的属性**去实现 equals()和 hashCode()，比如我的例子里都是使用学号（id）。

