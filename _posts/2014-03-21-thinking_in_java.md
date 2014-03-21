---
layout: post
title: Java编程思想
categories: JAVA
tags: Java
---
#JAVA编程思想

##第一章：对象导论

### 本章主题
背景性和补充性的材料，帮助读者扎实地了解OOP思想。但是凭现在的功力，看不太懂。所以打算等把基础东西过一遍之后再来填坑。

##第二章：一切都是对象

### 本章主题
我们从第二章的名字就能先得到结论：**JAVA中一切都是对象**。那么，我们就应该能知道这一章应该就是讲关于对象的知识。在看书过程中应该始终围绕**对象**这个关键词。

###1. 用引用操作对象

每种编程语言都有操纵内存数据的方式，那么程序员需要考虑怎样使用这些内存中的数据。比如是直接操纵数据单位，还是通过特殊语法间接使用这个数据单位。在C/C++中，程序员通过指针来间接使用数据单位。但是在JAVA中这一切得到了简化。**一切都被视为对象，因此可采用单一固定的语法。操纵的标识符实际上是一个对象的引用。就像遥控器和电视机的关系**

###2. 数据单位存在哪里？
然后就是上一章提到令人头疼的内存分配问题了。在JAVA主要有5类：

1. 寄存器：CPU中，最快的存储区。但是空间太少（程序员无法操控）
2. 堆栈：通用RAM（随机访问存储器），对象的引用存储在这里，通过堆栈指针来开辟/释放内存。**[特殊情况是8种基本类型]**
3. 堆：通用内存池（也位于RAM区），存放所有**JAVA对象**
4. 常量存储：存放在程序代码内部，或者可以选择ROM（只读存储器）。这一般是编译器的职责，在编译过程中可能会将使用该常量的地方进行替换
5. 非RAM存储：数据存活在程序之外，它可以在程序运行中存在，也可以在程序终止时存在，不受程序的限制。
	* 流对象：字节流在机器之间传输
	* 持久化对象：持久化对象保存在磁盘上
	
但是也有例外，就是**基本类型**。在JAVA中，new出来的对象会存放在堆中。但是对于特别小的、简单的变量，往往效率很低。所以JAVA规定：
> 对于8种基本类型，是通过创建一个并非是引用的“自动”变量。这个变量的值直接存储“值”，放在堆栈中。

###3. 移植性的原因：一致性
**JAVA会固定每种基本类型所占存储空间的大小**。它们的大小并不像大多数语言那样随机器硬件架构的变化而变化。这种所占存储空间大小的不变性是JAVA程序比大多数其它语言编写的程序更具有移植性的原因之一。比如C/C++中，int的大小可能会是2字节或者是4字节，这就给平台移植带来了一定的麻烦。下面是JAVA的基本数据类型：

| 基本类型 | 大小(字节) | 包装器类型 |
| -: | -: | -: |
| boolean | - | Boolean |
| char | 2|Character|
|byte|1|Byte|
|short|2|Short|
|int|4|Integer|
|long|8|Long|
|float|4|Float|
|double|8|Double|

下面是一些tips：

* 在C/C++中，有unsigned类型，但是JAVA中没有。**所有数值类型都有正负号，所以不要去寻找无符号的数值类型**
* boolean仅仅定义了true和false，所以boolean类型所占存储空间的大小不确定。

###4. JAVA数组安全

对于数组而言一般有两大问题：

1. 未初始化就使用
2. 数组越界

在C/C++中，使用未初始化的数组元素或者数组越界是不会报错的，所以程序会出现莫名其妙的错误，不容易定位错误的地方。而JAVA的主要目标之一就是安全性，所以JAVA对于这两点有相应的处理方法：

1. JAVA确保数组会被初始化后才能使用。如果是基本类型，直接用默认值初始化；如果是引用类型，就用null来初始化。如果不把引用指向对象，JAVA一看引用是null，就会抛出NullOfPointerException。
2. JAVA对数组采用了**少量的内存开销和运行时下标检查**作为代价，我估摸就是对每个数组记录一下长度length，如果你使用的下标为index，JAVA会判断index是否小于length，如果小于，正常使用；反之抛出ArrayOutOfBoundsException。

###5. GC机制

C++饱受诟病的一点就是内存泄露，因为C++对于效率的追求较高，所以将内存处理也交付程序眼自己处理。而对于内存操作不当，很容易就造成内存泄露问题。但JAVA解决了这个问题（当然，带来的影响就是JAVA程序性能会下降）。它采用一个垃圾回收器，用来监视用new创建的所有对象，并辨别那些不会再被引用的对象（就是引用个数为0），之后会释放它们占有的内存供其它新的对象使用。

###6. 注释和嵌入式文档

对于很多公司来说，开发工作都是很紧的，这带来的问题就是程序没有详细的设计文档，别人无法从整体上把握程序。而JAVA运用javadoc工具，将程序和文档“链接”起来：程序员写特殊的注释语法，然后JAVA提取整理，输出一个html页面，可以用浏览器查看。

所有的javadoc命令都只能在```/**```注释中出现，和通常一样，注释结束于```*/```。使用javadoc的方式主要有两种：
    
1. 嵌入html（很少用...）
2. 使用独立文档标签（是一些以```@```字符开头的命令，且要置于注释行的最前面）

对应于类、域、方法，注释方法如下所示：

    /** A class comment */
    public class HelloWorld {

        /** A field comment */
        public int number;

        /** A method comment */
        public void function() {
        }
    }

但是对于private和包内可访问成员，javadoc会忽略。因为只有public和protected的成员才能在文件之外被使用，这是客户端程序员所期望的。

一些常用的@命令有：

    @see：引用其他类
    @version：版本说明信息
    @author：作者
    @param：方法的参数列表标识符描述
    @return：函数返回值描述
    @throws：抛出异常描述
    @Deprecated：废弃的方法

举一个例子吧：

    import java.util.*;
    
    /**
    * @author niushuai
    * @version 1.0
    */

    public class HelloWorld {
        /** Entry point to class & application
        * @param args array of string arguments
        * @throws exceptions No exceptions thrown
        */

        public static void mian(String[] args) {
            System.out.println("Hello world!");
        }
    }


###7. 编码风格

在“Java编程语言编码约定”中，代码风格是这样规定的：

* 类名中所有单词首字母大写
* 几乎其他所有内容——方法、字段（成员变量）以及对象引用名称等，普遍采用首字母小写，后面单词首字母大写
* static final修饰的变量全部大写，单词之间用下划线分隔
* 括号在参数列表行内
* 最大行宽80字符
* 缩进（tab）2个字符

##第三章：操作符

###本章主题：
> JAVA中的数据都是通过使用操作符来操作的。作者建议熟悉C/C++语法的人，可以快速浏览本章和下一章，看到这句话顿时爽歪歪了，吼吼~

###1. JAVA引用的一个坑

    Integer n1 = new Integer(47);
    Integer n2 = new Integer(47);
    System.out.println(n1 == n2);
    System.out.println(n1 != n2);

如果是一个C/C++程序员，毫不犹豫就会得出答案为：```true false```。但是在JAVA中，"=="比较的只是n1和n2这两个引用，而它们指向了不同的对象，所以它们是不相等的。正确答案应该是```false true```。那么，如果我想比较n1和n2指向的对象是否相等呢？答案是使用equals()，比如n1.equals(n2)即可。而这个equals()也不简单，下面来谈谈。

###2. 相等问题之——equals()和hashCode()

在JAVA使用中，经常会碰到需要判断引用/对象是否相等的情况。但因为JAVA本身的语言特性，这点特别容易产生bug，所以应该彻底搞清楚才行。

首先判断相等有两种：

1. 引用相等
2. 对象相等

举个例子：

    class A {
        String name;
    }

    public class B {
        public static void main(String[] args) {
            A a = new A();
            A b = new A();
            System.out.println(a == b);            //引用相等
            System.out.println(a.equals(b));       //对象相等
        }
    }

* 引用相等：a和b都是引用，但因为new了2个对象，a和b指向的不是同一个对象，所以这里的结果是```false```。
* 对象相等：因为A是自定义类型，而且没有重载equals()，将使用Object类的equasl()，实际上调用的还是"=="，也就是判断引用相等。所以结果也是```false```。

如果想要获得对象相等，先得知道Object类定义的hashCode()和equals()：

1. hashCode()的默认行为是对堆上的对象产生一个hash值(一般是根据内存地址计算得到的)。如果你没有重载过hashCode()，不同对象拥有不同的内存，两个对象肯定不可能相等。
2. equals()的默认行为是执行"=="的比较。也就是上面说的，比较的是是否指向的都是堆上同一个对象。如果没有重载equals()，默认行为中的两个对象的两个引用肯定不会相同，所以equals()肯定是false。

对于这点，JAVA的文档里说的很清楚：

* If two objects are equal according to the equals(Object) method, then calling the hashCode method on each of the two objects must produce the same integer result.
* It is not required that if two objects are unequal according to the equals(java.lang.Object) method, then calling the hashCode method on each of the two objects must produce distinct integer results.

翻译一下就是：

* 如果两个对象使用equals()相等，那么hashCode()也必须相等
* 如果两个对象的hashCode()相等，这两个对象不一定相等（因为hash会产生碰撞）

当然了，关于这个问题还是多写代码实践一下，给两个比较好的参考：

* [Java中hashcode()和equals()的联系](http://octsky.com/tech/2013/11/29/equals-hashcode-contract-java/)
* [
Java 中正确使用 hashCode 和 equals 方法](http://www.oschina.net/question/82993_75533)

###3. JAVA不必小心把"=="写成"="了

在JAVA中，“与”、“或”、“非”操作只可以应用在**布尔值**上面。与C/C++不同的是，不可将一个非布尔值当做布尔值在逻辑表达式中使用。比如:

    int i = 5;
    while(i) {
        //do something
    }
	
这样是错误的。因为i是一个整型，而不是一个布尔类型。（在C/C++可以这样使用，因为C/C++会进行隐式类型转换）

另外一点，在C/C++中有时如果一不小心，我们可能写出这样的代码：

    while(x = y){
    //do something
    }
	
由于进行的是赋值操作，而且C/C++会进行隐式类型转换，所以循环会执行。但是对于JAVA而言，不会把非布尔类型转化为布尔类型，在编译的时候就会报错，所以不会出现这样的问题。

因此，在JAVA中，一般不会出现这样的错误（除非x和y都是布尔类型的）。如果知道这点的话，在JAVA程序中就不用反人类的写出```while( "hello" == string)```这样的代码了。

##第四章：控制执行流程

###本章主题：

应该就是一些流程控制语法，看来又要狂奔几十页的节奏？！= =才10页。。。

###1. 逗号表达式

在JAVA中唯一用到**逗号操作符**的地方就是for循环的控制表达式了，注意：在参数列表中使用的逗号是**逗号分隔符**。for循环可以这样：
    
    for(int i = 1, j = i + 10; i < 5; ++i)

###2. goto有害论和标签
 
Dijkstra曾经专门说过goto有害。其实，编程语言早就有goto了，它源于汇编语言：若条件A成立，则跳到这里；否则跳到那里。虽然goto仍然是JAVA的一个保留字，但是在语言中并没有使用它，相当于JAVA没有goto。额，JAVA竟然“别出心裁”的创造出了标签这玩意儿：
> 标签是后面跟有冒号的标识符，比如```label1:```
	
在JAVA中，标签起作用的唯一地方刚好是在迭代语句前面。“刚好之前”的意思表明，在标签和迭代之间置入任何语句都不行。而在迭代之前设置标签的唯一理由是：我们希望在其中嵌套另一个迭代或者一个开关。因为break和continue通常只是中断当前循环，但若随同标签一起使用，它们就会中断循环，直接到达标签所在的地方（和goto的作用有区别吗？？？？？？真心理解不动啊= =!）

```
public class LabelFor {
	public static void main(String[] args) {
		int i = 0;
		outer: for (; true;) {
			inner: for (; i < 10; i++) {
				System.out.println("i = " + i);
				if (i == 2) {
					System.out.println("continue");
					continue;
				}
				if (i == 3) {
					System.out.println("break");
					i++;
					break;
				}
				if (i == 7) {
					System.out.println("continue outer");
					i++;
					continue outer;
				}
				if (i == 8) {
					System.out.println("break outer");
					break outer;
				}
				for (int k = 0; k < 5; ++k) {
					if (k == 3) {
						System.out.println("continue inner");
						continue inner;
					}
				}
			}
		}
		System.out.println("finish");
	}
}

/** 输出：
i = 0
continue inner
i = 1
continue inner
i = 2
continue
i = 3
break
i = 4
continue inner
i = 5
continue inner
i = 6
continue inner
i = 7
continue outer
i = 8
break outer
finish
*/
```

规则总结了一下就是这样：
	
1. 一般的continue会退回最内层循环的开头，并继续执行
2. 带标签的continue会到达标签的位置，并重新进入紧接在那个标签后面的循环
3. 一般的break会中断并跳出标签所指的循环
4. 带标签的break会中断并跳出标签所指的循环，跳过这个标签后的整个循环
	
法则就是：
> 使用标签的唯一理由就是因为有循环嵌套存在，而且像从多层循环中break或者continue（就是跳过>=2层循环使用break和continue）

##第五章：初始化与清理

###本章主题：

程序很多情况下，不安全原因无非两个：初始化和清理。C++提出了构造函数和析构函数。为了提高效率，这两项工作均由程序员完成；而JAVA仅提供了构造函数供程序员使用，对于清理工作，JAVA自带垃圾回收器。虽然安全性有了保证，但是也牺牲了一定的效率。

所以，本章的主题就是初始化和清理。

###1. this关键字

假如A类有一个fun(int i)函数，现在A类创建了2个对象，2个引用指向了这两个新对象，2个引用为a和b。那么a和b调用fun(int i)的时候，fun(int i)怎么区分哪个是a哪个是b呢？其实这个工作是通过this实现的。编译器在编译的时候，会把```a.fun(1)```和```b.fun(2)```转化成```A.fun(a, 1)```和```A.fun(b, 2)```的。当然，这是编译器在幕后做的，我们使用的时候不能写成这种形式。

###2. 构造函数中调用构造函数

在构造函数中调用其他构造函数时，有两个规定：

1. this调用其他构造函数必须是当前构造函数的第一个语句。然后就很清楚了，前面不能有任何其他语句(所以不能有2个及以上个this调用。因为this调用必须是第一个语句，所以第二个this调用前面也有一个语句（不管是什么语句，只要有，就出错）。
2. 只能在构造函数中才能通过this调用构造函数，在非构造函数中不能通过this调用构造函数。

###3. 对static的一点讨论

3. 对于static来说，其实有一些争议。因为我们知道static是类的属性，与对象无关。但是JAVA标榜自己是完全面向对象的程序语言。类与类之间的沟通完全是通过对象的消息进行通信的。但是static却和对象没有关系，所以违背了JAVA的面向对象的说法。但是，我们知道事情都有两面性，在适当的时候能运用static还是非常有必要的，只是如果你程序中大量出现static的时候，就应该重新考虑一下设计的是否合理了。

###4. JAVA垃圾回收

首先大概了解一下JAVA垃圾回收机制的几种工作方式：[JAVA垃圾回收机制](http://www.thinkingbar.com/2013/11/java%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6%E6%9C%BA%E5%88%B6/)

**时刻牢记：使用垃圾回收器的唯一原因是为了回收程序不再使用的内存。**所以对于与垃圾回收有关的任何行为来说（尤其是finalize()方法），它们也必须**同内存及其回收有关**。意思就是说，如果你的程序中有一个地方跟内存无关，那么垃圾回收器就不会管。比如JAVA中调用的C/C++程序，而C/C++程序申请/释放内存的话与JAVA无关，那么JAVA垃圾回收器就不会对这个内存起作用。而finalize()就是为解决这个问题提出的，先看以下三点：

1. 对象可能不被垃圾回收
2. 垃圾回收并不等于“析构“
3. 垃圾回收只与内存有关
	
JAVA引入finalize()的原因是因为在分配内存时可能采用了类型C语言中的语法，而非JAVA中的通常做法。这种情况多发生在使用"本地方法"的情况下，本地方法是一种在JAVA中调用非JAVA代码的方式。本地方法目前只支持C/C++，但是在C/C++中又可以调用其他语言，所以从本质上来说，JAVA程序中可能出现所有编程语言。当然，每种编程语言有自己不同的内存分配策略，因为这与JAVA无关，所以JAVA的垃圾回收机制就不会作用于这些内存，当然需要程序员自己处理了。比如C代码中通过malloc()分配存储空间，除非调用了free()来释放这些存储空间，否则存储空间是不会释放的，这样就会造成内存泄露。当然，free()是C中的函数，必须在finalize()中用本地方法（这里是C方法）来调用它。

###5. 初始化

```
package Chapter05;

class InitTest {
	public static int number = 2014;
	public int i;
	public int j = 3;
	
	InitTest(int i) {
		this.i = i;
		j = 10;
	}
	
	public void print() {
		System.out.println(number);
		System.out.println(i);
		System.out.println(j);
	}
}

public class InitOrder {
	public static void main(String[] args) {
		InitTest initTest = new InitTest(20);
		initTest.print();
	}
}
```

1. 当首次创建类型为InitTest的对象时（构造函数其实是static方法），或者InitTest类的静态方法/静态属性首次被访问的时候，JAVA解释器必须查找类路径，定位InitTest.class文件
2. 然后载入InitTest.class（将创建一个class对象），有关静态初始化的所有动作都会执行，因此静态初始化只在class对象**首次加载**的时候进行一次。
3. 当用new InitTest()创建对象，在堆上为InitTest对象分配足够的存储空间
4. 这块存储空间会被清零，自动将InitTest对象中的所有基本类型数据设置成默认值（对数字来说就是0，对布尔类型和字符型也相同），而引用则被设置为null
5. 执行所有出现于数据定义处的初始化动作（就是7中的第三条）
6. 执行构造函数。

所以上面的例子工作流程是这样的：

1. 当在InitOrder中调用了public static void main(String[] args)就触发了InitTest的静态main方法，然后JAVA解释器通过CLASSPATH查找类路径，定位InitTest.class
2. 载入InitTest.class，将number初始化为2014
3. 在堆上为InitTest分配存储空间
4. 数据域清空，i和j都会被置0（引用会被置null）
5. j在定义初始化了，所以j被重置为3
6. 执行构造函数，i被重置为20，j被重置为10
	
有两点需要注意的是：

* 对于static域，可以在定义的地方初始化，也可以在构造函数初始化。所以不能认为构造函数只是初始化非static域。而且对于static域，可以将static变量统一赋值。类似这样：

```
static int i, j;
static {
     i = 1;
    j = 2;
}
```

对于普通变量也可以使用类似的方法，只要在"{"前面去掉static就可以了。这种语法对于支持“匿名内部类”的初始化是必须的，但是它也使得你可以保证无论调用了哪个显式构造函数，某些操作都会发生。

* 对于局部变量，你不初始化，编译时候肯定出错。因为局部变量说明程序员在这里用到才设置的，所以要提醒你。比如在C++中定义这样的

```
{
    int i;
    i++;
    cout<<i<<endl;
}
```

你运行的时候都不会出错，但是这个i到底是多少就不知道了。所以排查起来非常晦涩；而在JAVA中，你编译的时候就会出错（对于Eclipse来说，你写完这句话就会出现错误提示，提示你本地变量没有初始化），所以JAVA这点：**编译器可以为它赋值，但是未初始化的局部变量更可能是程序员的疏忽，采用默认值反而会掩盖错误。因此强制程序员提供一个初始值，往往能够找出程序的缺陷。**
	
###6. 创建数组的一个坑
	
* 如果是基本类型，你创建之后就可以使用了。默认初始化为0
* 如果是对象，那么你创建的只是一个**引用数组**，数组中的元素都是引用，但是没有指向具体的对象。所以你使用之前必须让它们指向对象

###7. 参数维护

JAVA初始化数组有几个点和C++不一样，看head first java里没讲到这两个点：
```

Integer[] a = new Integer[20];
for(int i = 0; i < 20; ++i) {
    a[i] = new Integer(i);
}

Integer[] b = { 
    new Integer(1),
    new Integer(2),
    3,				//autoboxing
    };
Integer[] c = new Integer[]{
    new Integer(1),
    new Integer(2),
    3,              //autoboxing
    };
```

1. 发现3后面都有一个逗号，这一特性使得维护长列表变得更容易一些
2. 使用第一种时候有些限制，因为他只能用于数组被定义的地方；但是第二种和第三种可以用在很多地方，比如：fun1(String[] strings)调用```fun1(new String[]{ "one", "two", "three"});```    

###8. 可变形参

JAVA在SE 5提出了可变形参的概念，然后就再也不用显式地编写数组语法了，当你指定参数时，编译器实际上会为你去填充数组。但是我没觉得这玩意有什么大的用处啊？string []和string ...不都是实现相同的功能吗？不都是string个数不确定的意思吗？然后到JAVA论坛得到了满意的答复：
> **数组的功能是可变参数功能的子集，凡是用数组做形参的地方都可以用可变参数替换。可变参数的功能比数组更为强大，除了能够接收数组类型的实参外，还能够接收个数不限的单个实参。**写成“String... args”这样子，实际上是提醒编译器将接收到的若干单个实参整理成数组传给args，args归根结底接收到的还是数组。当然，你若直接给args传一个数组也没有错，这样反而省的编译器去整理了。

所以说，对于可能出现多个甚至1个参数的情况下，我们只能使用可变形参，因为[]无法接受1个String引用。而且需要注意的一点是：**可变形参必须是参数列表的最后一个，要不然会出现傻傻分不清楚的问题，大家懂的**

###9. 对于super和this的理解

super和this本来是没有联系的，因为super是调用父类的函数，而this是调用本类的函数。但它们都算是一种代码复用吧？所以就放在一起说一下：

* super：是因为子类需要在父类基础上再增加一些东西，比如起床函数，基类完成穿衣服、洗脸刷牙2个步骤，而由于子类是个近视，所以需要完成的有穿衣服、洗脸刷牙、戴眼镜三个，而前两个基类已经完成，你就可以调用super()，然后加入戴眼镜逻辑即可。
* super：和继承中的构造函数也有关系，当基类自定义了无参/有参构造函数后，子类必须显示定义构造函数，并使用super来初始化基类。
* this：this是用在本类中的，它的作用就是让一个构造函数来调用其他重载的构造函数，比如穿衣服初始化，一个构造函数是穿一个背心就搞定，另一个构造函数是穿一个厚外套，那么，在天气热的时候调用第一个构造函数；在天气冷的时候，我们在厚外套这个构造函数中先调用穿背心，然后再穿厚外套，就不用重复造“穿背心”这个轮子了。

##第六章：访问权限控制

###本章主题：

本章重点是类的public、protected、private、package的访问权限。

###1. 杂碎的知识点

1. CLASSPATH变量就是让编译器找到**.class文件和jar包**用的。对于.class文件，你指定目录就可以了(一般为bin目录)；而对于jar包，因为是独一无二的，所以我们必须指定完整的路径，比如/data0/lib/rt.jar。
2. 指定CLASSPATH之后，当编译器遇到库的import之后，就开始在CLASSPATH所指定的目录中查找，然后从.class文件中找出对应名称的类。之后就可以正常使用了。
3. JAVA的默认包也具有包访问权限。也就是说，如果你在一个项目中，没有为某N个编译单元指定包结构，那么它们就处于默认包下面，这样等同于具有共同的包结构，所以它们可以互相调用。
4. 首先JAVA没有C那样方便的条件编译功能，以前在C中，我们可以在代码中使用条件编译，最方便之处就是可以一个标记完成运行/调试，-DFLAG即可。而JAVA去掉此功能的原因是这样的：
	> C在绝大多数情况下是使用此功能来解决跨平台问题的，即程序代码的不同部分是根据不同的平台来编译的。由于JAVA自身可以自动跨越不同的平台，因此这个功能对JAVA而言是没有必要的。
5. 看head first java竟然没注意import static这个用法，说白了，静态import就是少打几个字，但是会让程序的可读性降低。比如一个add()方法，你都不知道调用的是哪个包里面的方法。

###2. JAVA权限访问

主要有4个权限修饰，范围从大到小排序后：

1. public：import之后包内包外可以使用
2. protected：继承访问权限，只有子类可以访问。**同时，protected也提供包访问权限**
3. 包访问权限：（类前面没有权限修饰符）一个包的代码可以访问本包内所有代码，但是本包对外界成员是透明的、不可见的
4. private：除本类外包内包外均无法访问

控制对成员的访问权限有两个原因：
	
1. 为了使用户不要碰触那些他们不该碰触的地方，这些部分对于类内部的操作是有必要的，但是它并不属于客户端程序员所需接口的一部分
2. 为了重构。只要当前版本提供的公共接口没有改变，就不会因为底层数据/方法（设为private）的改变受到影响。然后我们开发完成新的功能后只需要添加新的接口，就不会影响原有代码，在以后版本使用中使用新的接口就可以了。

当然，上面的访问权限主要是针对类的数据成员的，而对于类来说，一般只有两种：public和包访问权限。因为private将使得除本类以外的其它类都无法访问该类；而protected则是该类的子类和包内能够访问，没有对外接口，也不合适。

##第七章：复用类

###本章主题

既然是讨论代码的复用，那么肯定涉及到了组合和继承的概念，另外代理也是一种常用的代码复用手段。

1. has a：组合
2. is a：继承
3. 中庸之道：代理

然后就是如何使用这三个法则选择对应的解决方案。对于更复杂的要求（比如实现C++的多继承问题），接口就会出来打酱油了- -

###1. 组合、继承、代理

理清这三者之间的关系是我们做出设计的第一步。在《JAVA编程思想》中，作者建议慎重使用继承，当我们确定要不要使用继承时，有一个很清晰的方法：
> 需要向上转型吗？

在上面我们说过，组合是解决has a问题，继承是解决is a问题，而这里之所以要说向上转型，其实是为后面的多态做铺垫。这样，我们就可以完成**面向接口**编程的壮举。你只需要定义一个基类，就可以通过调用相同的方法传递不同的消息给不同的对象，极大的简化了程序的复杂度，完成了代码的复用。就像马士兵的“Sping教程”里的例子，运用MVC模型，一个数据库接口，可以操纵mysql，可以操纵oricle，可以操作xx数据库。

tips：

* 为了继承，一般的规则是**将所有的数据成员都设置为private，而将所有的方法都设置为public**。这样，当不同的包下的类继承该类时，就可以获得该类所有的方法，和包内、包外没有区别。如果不加修饰符，就是限制包内访问，那么包外继承的时候，只能获得public修饰的方法，这样内外的方法不一致，就会出现问题了。当然，特殊情况需要特殊考虑。

###2. final用法

根据上下文环境，JAVA的关键字final的含义存在着细微的区别，但通常它指的是“这是无法改变的”。不能做改变可能处于两种理由：设计和效率。由于这两个原因想差很远，所以可能会被误用。这里简单总结一下它们应用的场景。具体的，JAVA中的final有三种使用场景，分别为数据、方法和类：

* final数据：
    1. 一个永不改变的**编译时常量**： 因为编译期常量可以带入用到它所在的表达式，就可以免去运行时的工作。由于编译的时候是无法初始化自定义类的，所以**必须为8种基本类型，而且在定义的时候初始化**。对于引用来说，用final修饰就表示这个引用（数组也是一种引用）只能指向这个对象，不能指向别的对象（但对象本身可以改变，只是引用不可改变）
    2. 一个运行时被初始化的变量，而你不希望它被改变，比如**空白final的使用**：可以通过在定义处或者在构造函数中初始化，而在构造函数中初始化可以使不同对象的对象拥有不同的值（比如身份证号，唯一且不能改变）。这样就保证final数据在使用前被初始化且无法改变的特征。
* final方法使用的原因有2：
    1. 把方法锁定，防止任何继承的子类修改它的含义（比如查看某一重要数据的方法，任何方法无法改变）
    2. 效率：早期JAVA会将final方法转为内嵌调用。类似C++的内敛函数（inline），但随着JAVA性能的提升，这个做法基本废除了
* final类：表明了你不打算继承该类，而且也不允许别人这样做。你对该类的设计并不需要改变，或者是处于安全的考虑，你不希望它有子类。

tips：

* 类中所有的private方法都隐式指定为final的，因为无法取用private方法，所以无法覆盖它。就好像构造函数是隐式指定为static类似。
* 在JAVA中，如果基类有一个方法是private的，那么，在子类中可以使用完全相同的函数（包括所有东西）。因为基类的private方法子类是看不到的，所以你定义一个完全相同的函数子类也会认为是新函数，当然不会有问题。但是如果你使用@Override注解，就明确告诉编译器这个方法是覆盖基类的方法，但因为子类“看不到”基类的这个private方法，@Override注解就会报错，说你必须覆盖一个基类存在的方法。

###3. 重载、覆盖、隐藏

这个在《高质量C/C++编程指南》中详细讲了，但是好像和JAVA有一定的出入。保险起见，还是先把C++和JAVA的都搞清楚吧，防止混淆。

* [高质量C/C++编程指南](http://man.chinaunix.net/develop/c&c++/c/c.htm)
* JAVA没有所谓的名称屏蔽（隐藏），就是如果JAVA的基类拥有某个已被多次重载的方法名称，那么在子类中重新定义该方法名称并不会隐藏在基类中的任何版本。

###4. 初始化

在第五章讲到了初始化，但是因为没有涉及到继承，所以还不算完整。这里就详细说一下在有继承的情况下是如何完成初始化的。

1. 在执行xx.main的时候，因为main是static方法，就触发了该类的初始化。于是加载器开始启动并在CLASSPATH中找到xx.class，如果xx继承自aa，那么编译器注意到xx有一个基类aa（通过extends得到），就开始加载基类，不管你是否打算产生一个该基类的对象。如果该基类继承自其它类，就会以此类推。
2. 根基类中的static初始化会被执行，然后是第二个基类……
3. 在堆上生成对象
4. 基本数据置0，引用置null
5. 定义处的域初始化
6. 从根基类的构造器开始执行，一直到底

##第八章：多态

###本章主题

在OOP中，多态是继抽象和继承之后的第三种基本特征。其实多态的概念也算是很熟悉了，它的目的在于消除类型之间的**耦合关系**。C++是通过virtual关键字实现的多态，在JAVA中多态也能完成同样的任务。所以，本章的重点就是掌握JAVA的多态(也称为动态绑定)用法。

###1. 向上转型

在前面简单说过向上转型的问题，从根本上来说，**动态绑定**是多态的核心。而实现动态绑定就需要借助向上转型的力量。定义一个基类的接口，然后由出现类继承这个接口以后实现各自的功能。这样，当我们定义一个基类对象时，我们可以根据需要用继承自该类的任何子类来初始化它（也就是向上转型），因为基类定义了相同的接口，而实现是在**子类**中，子类可以有不同的实现，那么我们通过这一个基类的接口就可以实现不同的功能，从而实现多态。

###2. 动态绑定

从上面我们知道，向上转型是多态的核心。而理解向上转型我们就必须弄懂JAVA的动态绑定。那么，什么是静态绑定，什么是动态绑定呢？

* 静态绑定：在执行前（由编译器和连接程序实现）就可以明确确定调用哪个函数，典型的例子就是C函数，因为C程序不允许重载，所以你使用```fun(30)```，编译器就确定你使用的是fun()是哪个。又比如static和final，因为都是不变的，所以就是静态绑定
* 动态绑定：顾名思义，和静态绑定不同，动态绑定必须在运行时才能确定是哪一个方法被调用。比如```fun(30)```因为可以定义多个fun()，比如fun(int), fun(Long), fun(char)……，所以只有在运行的时候才能确定要调用哪一个具体的函数。在JAVA中，**除了static方法和final方法(private方法属于final方法)之外，其它所有的方法都是动态绑定**

举一个非常简单的例子来说明静态绑定和动态绑定：

```
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
```

```
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
```

上面例子很明显，在静态绑定中，编译器能准确知道fun()就是唯一的fun(int)，而在动态绑定中，编译器根本无法知道RandomNow.shuffle()返回的A具体是B、C、D中的哪一个。而这恰恰就是动态绑定完成的任务：在运行时确定。

###3. 多态的缺陷一：“覆盖”私有方法

```
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
```

我们想输出的是```Public fun()```，但因为private的fun对于Derived是不可见的，所以Derived中的fun是一个全新的方法，不是覆盖。所以对于子类没有覆盖基类的情况，肯定是调用基类的fun

###4. 多态的缺陷二：域与静态方法

```
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
```

我们看到，为Super.field和Sub.field分配了不同的存储空间。这样，Sub相当于拥有了2个field域。但是在引用Sub中的field所产生的默认域并非Super版本的field域。因此，如果想要得到Super.field，必须显式指定Super.field。

结论就是：
> JAVA中，只有普通的方法调用是多态的。然后在对待域的问题上，这个访问将在**编译期**进行解析，因此不是多态的。同理，静态方法是与类绑定的，跟对象无关。所以，静态方法也不具有多态性。

解决方法：
> 既然多态的缺陷只要在于private方法、域、静态方法，那么我们就记住对于private方法子类是完全看不见的；对于域来说，基类要设置为private，修改/访问通过get/set方法，而且避免基类、子类使用相同的域名称；对于静态方法，因为是类属性，所以不会因为不同对象消息的改变而改变。

1. **在JAVA中，除了static方法和final方法（private方法属于final方法）之外，其他所有的方法都是后期绑定。这意味着通常情况下，我们不必判断是否应该进行后期绑定——它会自动发生。**
2. 那么，我们现在就可以探讨一下使用final修饰一个方法的原因了。就是防止别人覆盖该方法。但更重3要的一点是：**这样做可以有效的关闭动态绑定**，或者告诉编译器这个方法不需要进行动态绑定。这样，编译器就可以为final方法生成更有效的代码。**然而，大多数情况下，这样做对程序的整体性能不会有什么改观，所以使用final的目的是考虑是否能被覆盖，而不是效率，谨记**。

###5. 初始化总结

这个在第五章、第七章已经出现了，但是有了多态之后，又特么的出现了。于是，怒总结之。

1. 调用xx.main的时候，因为main是static，编译器通过CLASSPATH找到xx.class文件
2. 加载xx.class的时候，发现它是extends yy，那么就同样通过CLASSPATH找到yy.class，依此类推，找到根基类
3. 对静态域/静态方法初始化
4. 在堆上分配内存，并直接通过二进制清零，引用置null
5. 对定义时初始化的非静态域进行再初始化
6. 数据域全部搞定之后，执行构造函数体（**这时候执行构造函数的原因是：构造函数具有一项特殊的任务：检查对象是否被正确构造。所以，必须对象已然存在在堆上才能检查，再进行下一步的初始化操作**）

###6. 继承与清理

既然构造都说了半天，清理工作也是必须明白的。

其实如果有特殊情况需要清理，那么一定要注意*动态绑定**的副作用，它调用的是导出类的清理函数，如果基类也需要清理，就必须显式的使用super.清理函数来完成。同时，销毁的顺序应该和构造的顺序相反。

###7. 一个多态引起的隐患

我们知道，用导出类初始化基类，调用一个导出类覆盖过基类的函数是正常的。但如果发生在**构造函数**中，就会出现问题。下面有个例子：

```
package Chapter08;

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
RoundGlyph.RoundGlyph, radius = 5

*/
```

1. 在其他任何事物发生之前，将分配给对象的存储空间初始化成二进制的零
2. 调用基类的构造器，但因为基类都没有构造成功，导出类更不可能构造成功了，所以radius的值为0

教训就是：

> 用尽可能简单的方式使对象进入正常状态；如果可以的话，尽量避免调用其他方法。在构造器内唯一能够安全调用的就是基类中的final方法了（private同属于final），这些方法不能被覆盖，所以就不会出现上面的问题了。

###8. 向下转型

向上转型是没有危险的，因为从大到小；但是向下转型，可能会出问题。比如几何图形到底是圆还是方。在C++中，我们必须执行一个特殊的操作来获得安全的向下转型。但是在JAVA语言中，所有转型都会得到检查！所以即使我们只是进行一次普通的加括弧形式的类型转换，在进入运行期时仍会对其进行检查，以便保证它的确是我们希望的那种类型。

```
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
```

##第九章、接口

###本章主题

这一章讲接口。那么，既然JAVA是面向对象，有了类和对象。为什么还要有接口呢？答案是**为了更好的复用**。所以衍生出了抽象类、接口等概念。这一章可能不太容易理解清楚，所以放慢一点。

###1. 抽象类和接口

在博客中有一篇文章:[JAVA抽象类和接口](http://www.thinkingbar.com/2013/08/19/java%E6%8A%BD%E8%B1%A1%E7%B1%BB%E5%92%8C%E6%8E%A5%E5%8F%A3/)

###2. 完全解耦

这个算是设计模式方面的东西吧，还不算理解。但是稍微知道一点就是在代码设计中，尽量避免高耦合的情况出现。如前面项目中出现的问题就是由于高耦合引起的：

> 业务A需要业务B处理，而且是完成之后才能继续干活。那么，在压力比较大的情况下，B处理不过来的时候，就会挂掉，或者处理时间过长。那么就会引起A无缘无故等待过长时间，这样A等待的时间长，干活的时间少。时间长也会挂掉。这样，由于高耦合性，B挂掉也会连累A。后来，通过一个缓冲层将A/B解耦合，那么，无论A/B谁挂掉，都不会影响对方的工作。

所以，完全解耦是高效率代码的一个基本准则。举个简单的例子：

> 有一个类A，含有静态方法a(B b)，如果B是一个class，那么传入A.a()中的只能是B或者B的子类。但如果C类和B具有相同的公共接口，那它还是无法传入A.a()中。这就给代码复用带来了一点麻烦。而如果我们将A.a()中传入的参数变为interface,那么，B、C实现这个接口以后，都可以传入，就完成了代码的复用。具体例子可参考《Thinking In Java》P174-P178的代码。

###3. 多重继承

这个算是这章的重点，也是Java的重点。在C++中，一个类通过继承多个基类完成多重继承，而Java由于只允许单继承，所以要实现多重继承就要借助其它方法——接口+类（类或者抽象类）+内部类，一般情况下是单继承一个类，然后通过实现接口（本类或者内部类）来完成多重继承的任务。

这里比较困难的就是：extends只有一个，我该extends谁？剩下的implements到底是本类执行还是内部类执行？总的来说就是2个选择：

1. extends谁
2. implements interface由本类做还是内部类做？

这其实是一个好设计的基础，按我的理解，extends因为只有一个，所以要专注最重要的特性，同时，在将复用的时候说过，判断继承的原则就是是否需要向上转型。我们认真思考一下就知道了，这个子类一定算是父类公开接口的某一个实现（一般情况下是多个子类实现父类的接口，然后完成动态绑定的任务）。那么，extends的就是最重要的特性。

而对于implements，能用本类的情况就不要用内部类，因为内部类一般情况是想实现“内部”的功能，想对使用者透明（就比如没个容器自己实现一个private的迭代器）。另外一点，内部类的本质是为了使多重继承更加完整。所以下一章会努力找到“什么时候使用内部类”的答案。

##第十章、内部类

这一章讲述的是内部类，以前觉得这东西随便一节介绍介绍就好，但我估计是没认识到内部类的好处。因为《Head First Java》和《Thinking In Java》都把内部类作为单独的一章来讲。所以看完这一章再回来总结一下：

1. **为什么要存在内部类**
2. **什么情况下该使用内部类**

填坑ing...在10.8节中道出了内部类的本质作用【解答上章最后的问题】：
> **完善JAVA多重继承**。内部类通过继承多个**非接口（类或者抽象类）**，使多重继承的方案更加完整可行。因为是单继承，不可能有多个extends。而非接口只能通过extends实现，所以自然而然就是内部类的活了。

我们知道，C++中有多重继承的概念，但随之而来的就是菱形继承的噩梦。JAVA设计者避免了这个做法，但多重继承也是一个使用频繁的功能，于是JAVA运用单继承+接口+内部类的方向完成了相同的功能。虽然稍微麻烦点，但是也一定程度避免了C++的问题。算是有得也有失吧。

然后这一章看的不细致，因为里面很大一部分是有点偏的知识，我打算先把精华看一下，等我下遍复习的时候从整体上来把握细节。额，现在看的确实有点晕乎了- -!~

###1. 什么是内部类

顾名思义，内部类就是在类内部定义的类，但是它有一个天然的属性特别重要：
> 当生成一个内部类的对象时，此对象与生成它的外部对象之间就有了联系，所以它能访问其外部类的所有成员，而不需要任何特殊条件。

我们一想，这敢情好啊。内部类和外部类之间完全没有隔阂，数据通信无障碍（private都不是个事）。但它是怎么实现的呢？
> 当某个外部类的对象创建了一个内部类对象时，此内部类对象必定会秘密地捕获一个指向那个外部类的引用。然后，在你访问外部类的成员时，就是用那个引用来访问外部类的成员。而且，这都是编译器帮我们搞定的。

###2. 匿名内部类

多线程时候用到过，Runnable相当于一个任务，Thread相当于一个工人。那么我们把这个任务给工人后，告诉它start()就可以执行了。这时候，交付任务就是通过匿名内部类实现的，举个例子：

```
public void testNoNameInnerClass() {
	    executor.execute(
	        new Runnable() {
	    	    public void run() {
	    		    //do something
	    	    }
	        }
	    );
	}
```

###3. 工厂设计模式

写了一篇文章，还是写点代码能清楚点。[工厂模式](http://www.thinkingbar.com/2014/03/14/%E5%B7%A5%E5%8E%82%E6%A8%A1%E5%BC%8F/)

###4. 嵌套类

如果不想让内部类和外部类有联系，我们可以将内部类定义为static，而这就是嵌套类。其实也很容易理解，不带static的话，内部类对象会隐式的保存一个外部类的引用，指向创建它的外部类；而声明为static之后，因为它是外部类的属性，就没有隐式的引用。所以你创建内部类的时候就不需要外部类的羁绊了。

##第十一章、持有对象

###目录结构

* 11.1 泛型和类型安全的容器
* 11.2 基本概念
* 11.3 添加一组元素
* 11.4 容器的打印
* 11.5 List
* 11.6 迭代器
    * 11.6.1 ListIterator
* 11.7 LinkedList
* 11.8 Stack
* 11.9 Set
* 11.10 Map
* 11.11 Queue
    * 11.11.1 PriorityQueue
* 11.12 Collection和Iterator
* 11.13 Foreach与迭代器
    * 11.13.1 适配器方法惯用法
* 11.14 总结

###本章主题

其实从目录结构我们就知道，这一章是讲JAVA的数据结构的。在日常使用中，这些容器类的使用非常频繁，但是能站在一定高度上认知它们的原理，就会理解的更深。回忆了一下，目前使用最频繁的有HashMap、ArrayList、Queue、Set。

本质来说有两大类：

1. Collection：容器的基本单位就是一个对象 元素，就是加上一些限制（比如Queue是FIFO，Stack是FILO等等）。所以很常用的一点就是，所有单元素容器都implements Collection接口
2. Map：容器的基本单位是一对对象，一般代表一种映射关系

###1. 一个tips

在平常代码中，不能因为接口而使用接口。虽然面向接口编程有一定的好处，但是接口无法调用实现类新增的方法。就好像```List<Apple> appleList = new ArrayList<Apple>();```，虽然我们以后重构可以马上改为```List<Apple> appleList = new LinkedList<Apple>();```，但是LinkedList在List基础上添加了方法，而这是List引用无法调用的。所以，不同的场景下有不同的用法。

###2. 关于容器中添加一组元素

这个也算是常见操作，比如我定义一个数组发现不够用了，于是我新建一个大的，把原来的元素添加进去。但添加元素也有一定的讲究，比如Arrays.asList。这个方法的限制在于**它对所产生的List的类型做出了最理想的假设，而并没有注意程序员赋予它什么样的类型**，而这就会出现问题：

```
package Chapter11;

import java.util.*;

class Snow{}
class Powder extends Snow{}
class Light extends Snow{}
class Heavy extends Snow{}
class Crusty extends Snow{}
class Slush extends Snow{}

public class AsListInference {
	public static void main(String[] args) {
		//在这里，Arrays.asList返回一个List。但是这个List中的元素不是我们想要的Snow，而是
		//最后一个元素的类型。也就是说返回的是一个List<Powder>类型
		List<Snow> snow1 = Arrays.asList(new Crusty(), new Slush(), new Powder());
		
		//不能编译的代码
		List<Snow> snow2 = Arrays.asList(new Light(), new Heavy());
		
		//Collections.addAll()不会报错
		List<Snow> snow3 = new ArrayList<Snow>();
		Collections.addAll(snow3, new Light(), new Heavy());
		
		//如何解决不能编译的问题
		List<Snow> snow4 = Arrays.<Snow>asList(new Light(), new Heavy());
		
	}
}
```

很囧的是，书上的例子和我的结果不对。。我估计是jdk的版本不一致吧，记得有次switch()参数问题就是因为我使用的是jdk1.7才添加的，而线上环境使用的是jdk1.6。
###3. List

**List承诺可以将元素维护在特定的序列中。**List是一个接口，它implements了Collection接口，并且在它的基础上添加了大量的方法。使得**可以在List的中间插入和移除元素。有两种类型的List：

1. ArrayList：长于随机访问元素，劣于在中间插入/删除较慢
2. LinkedList：长于通过较低的代价在List中间插入/删除，并提供了更多的特性集。劣于在随机访问速度较慢

下面是对ArrayList的简单使用：

```
package Chapter11;

import java.util.*;

public class Exercise05 {
	static Random random = new Random(47);

	public static void main(String[] args) {

		List<Integer> ints = new ArrayList<Integer>(Arrays.asList(1, 2, 3, 4, 5, 6, 7));
		System.out.println("1:" + ints);

		Integer integer = new Integer(10);
		// 自动扩充容量至8
		ints.add(integer);
		System.out.println("2:" + ints);
		System.out.println("3:" + ints.contains(integer));

		ints.remove(integer);
		Integer integer2 = ints.get(2);
		System.out.println("4:" + integer2 + " " + ints.indexOf(integer2));
		
		Integer integer3 = new Integer(20);
		System.out.println("5:" + ints.indexOf(integer3));
		System.out.println("6:" + ints.remove(integer3));
		
		System.out.println("7:" + ints.remove(integer2));
		System.out.println("8:" + ints);
		
		ints.add(3, new Integer(16));
		System.out.println("9:" + ints);
		
		List<Integer> sub = ints.subList(1, 4);
		System.out.println("subList: " + sub);
		System.out.println("10:" + ints.containsAll(sub));
		
		Collections.sort(sub);
		System.out.println("Sorted subList: " + sub);
		
		//跟顺序无关，只要元素全部包括就行
		System.out.println("11:" + ints.containsAll(sub));
		
		//将sub数组中元素进行随机排列
		Collections.shuffle(sub, random);
		System.out.println("Shuffled subList: " + sub);
		System.out.println("12" + ints.containsAll(sub));
		
		List<Integer> copy = new ArrayList<Integer>(ints);
		System.out.println("copy: " + copy);
		sub = Arrays.asList(ints.get(1), ints.get(4));
		System.out.println("sub: " + sub);
		//retainAll就是把sub中不含有的元素从copy中全部删除
		copy.retainAll(sub);
		System.out.println("13:" + copy);
		
		copy = new ArrayList<Integer>(ints);
		copy.remove(2);
		System.out.println("14:" + copy);
		//removeAll就是把sub中含有的元素从copy中全部删除。和retainAll的作用正好相反
		copy.removeAll(sub);
		System.out.println("15:" + copy);
		
		copy.set(1, new Integer(22));
		System.out.println("16:" + copy);
		
		//从中间插入一个List。这个操作对于ArrayList来说效率很低
		copy.addAll(2, sub);
		System.out.println("17:" + copy);
		
		System.out.println("18:" + ints.isEmpty());
		ints.clear();
		System.out.println("19:" + ints);
		System.out.println("20:" + ints.isEmpty());
		
		ints.addAll(Arrays.asList(33, 44, 55, 66));
		System.out.println("21:" + ints);

		//默认转换为Object数组
		Object[] o = ints.toArray();
		System.out.println("22:" + o[3]);
		
		//转换为指定大小的数据，但如果ints为4个元素，你指定的数组<4，那么toArray会
		//创建一个具有合适尺寸（4）的数组
		Integer[] in = ints.toArray(new Integer[5]);
		System.out.println("23:" + in[3]);
		
	}
}
```

###4. 迭代器

这个也算是非常常用的东西。以前在学内部类的时候碰到一个类似的例子。就是迭代器是一个接口，没个容器在自己的内部实现一个private或者匿名的implements 迭代器接口内部类。这样客户端程序员就只能使用一种方法遍历容器，且不能改变。既保证了通用，也保证了安全。所以，**迭代器是一种设计模式**。

记住Java中，Iterator只能单向移动，而且只能用来：

1. 使用方法iterator()要求容器返回一个Iterator。Iterator将准备返回容器的第一个元素
2. 使用next()获得序列中的下一个元素
3. 使用hasNext()检查序列中是否还有元素
4. 使用remove()将迭代器新近返回的元素删除

一个简单的例子：

```
package Chapter11;

/**
 *  @author niushuai
 *  
 *   容器的iterator()要求容器返回一个Iterator。Iterator将准备好返回容器的第一个元素
 *   所以在最后一个for循环前要重新定位it的位置，因为第一次while迭代后it已经指向了最后
 *   一个元素了
 */

import java.util.*;

public class SimpleIteration {
	public static void main(String[] args) {
		List<Integer> ints = new ArrayList<Integer>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));
		Iterator<Integer> it = ints.iterator();
		
		while(it.hasNext()) {
			Integer i = it.next();
			System.out.print(i + " ");
		}
		System.out.println();
		
		for(Integer i : ints) {
			System.out.print(i + " ");
		}
		System.out.println();
		
		it = ints.iterator();
		for(int i = 0; i < 6; i++) {
			it.next();
			it.remove();
		}
		System.out.println(ints);
	}
}
```

如果我们认真思考会发现，```Iterator<Integer> it = ints.iterator();```将准备返回第一个元素。而在while循环中，it.next()获得序列的下一个元素，也就是第二个元素。那第一个元素去哪里了？？？带着这个疑问，google了一下：
> 迭代器只是一个位置，它指向的是元素的首地址。初始化的时候，它指向的是容器第一个元素的起始地址，hasNext先判断这个位置后面是否有元素，有的话，调用next()。而next()方法**用于将游标移至下一个元素的是起始地址，它返回的是所越过的哪个元素的引用**。意思就是它从第一个元素的起始地址移动到第二个元素的起始地址，越过的是第一个元素。所以返回的就是第一个元素的引用。

我是从这篇文章弄懂的：[遍历聚合对象中的元素——迭代器模式（五）](blog.csdn.net/lovelion/article/details/9992799)

###5. Set

Set不保存重复的元素，它的最重要用途是**查询归属性，即某个元素是否存在**。所以，在需要多查询的情况下，set绝对是最佳选择（Collection是遍历好吗？O(n)和O(1)完全没法比嘛）。

常用的Set有：

1. HashSet：通过散列函数
2. TreeSet：通过红黑树，排序嗖嗖的
3. LinkedHashSet：使用了链表来维护元素的插入顺序

知道这些之后，我们就可以选择使用哪种Set了吧：普通使用HashSet即可；结果排序就用TreeSet；既需要查询、又需要保持插入顺序就用LinkedHashSet。

###6. Map

这玩意在我们项目中用的是最多的了，几乎所有重要的数据都是存在HashMap中了，速度快是第一要求。虽然Map的用法极其简单，但前不久刚因为HashMap的非线程安全被坑了一次，所以还是好好看一下什么地方容易出错。

额，原来不光有containsKey()，还有containsValue()用法。

```
package Chapter11;

import java.util.*;
import java.util.Map.Entry;

public class Exercise17 {
	public static void main(String[] args) {
		HashMap<String, Gerbil> gerbilMap = new HashMap<String, Gerbil>();
		gerbilMap.put("first", new Gerbil(1));
		gerbilMap.put("second", new Gerbil(2));
		gerbilMap.put("third", new Gerbil(3));
		gerbilMap.put("fourth", new Gerbil(4));
		
		Iterator<Entry<String, Gerbil>> it = gerbilMap.entrySet().iterator();
		while(it.hasNext()) {
			Entry<String, Gerbil> entry = it.next();
			System.out.println(entry.getKey());
			entry.getValue().hop();
		}
	}
}
```

1. 首先没想到的是import。我上来先```import java.util.*;```我以为util下面所有的包的所有类都已经import了，但是Entry报错！必须再引进```import java.util.Map.Entry;```，我表示很费解。
2. 知道了原来经常使用的Entry原来就是Pair呀（C++）。以前用到时候老忘，现在一下子明白了：
    > Map可以返回它的键的Set，它的值的Collection，或者它的键值对的Set。所以，keySet()方法产生了所有键组成的Set，而EntrySet()方法产生了所有键值对组成的Set。所以在foreach中用来遍历Map


###7. Queue

这个以前在写算法题的时候经常用，但都是自己实现的（用一个数组和一个”指针”就可以维护了）。现在想象，Queue在项目中用到最多的地方是**多线程的任务交接**。
```
package Chapter11;

/**
 * @author niushuai
 * 
 * 这个例子是一个简单C/S通信。C写入命令后送到Queue中，S收到命令后执行
 * 
 * 需要注意的有几点：
 * 1. 使用的Queue必须使用插入有序的容器来初始化，用ArrayList无法保证插入顺序，所以不行；而LinkedList能保持
 * 	  输入有序，所以可以。
 * 2. 使用Queue的话，会消除C/S之间的耦合性。C只管写，不需要等待S的处理。S只管执行，完成后发送给C一个消息即可
 * 3. 使用Queue能保证输入/输出交接的是完整性,而main相当于一个Controller来负责C/S之间的通信
 */

import java.util.*;

class Command {
	private final String str;

	Command(String cmd) {
		str = cmd;
	}
	public void print() {
		System.out.println(str);
	}
}

class TempQueue {
	public static void temp(Queue<Command> queue) {
		queue.offer(new Command("cd /usr/home/niushuai"));
		queue.offer(new Command("ls"));
		queue.offer(new Command("cp *.java /usr/home/other/"));
	}
}

class Server {
	public static void exec(Queue<Command> queue) {
		while(queue.peek() != null) {
			queue.remove().print();
		}
		System.out.println("ok!");
	}
}

public class UsingCommand {
	public static void main(String[] args) {
		Queue<Command> queue = new LinkedList<Command>();
		
		//客户端产生命令
		TempQueue.temp(queue);
		
		//服务器端执行命令
		Server.exec(queue);
	}
}
```

###8. PriorityQueue

优先队列的话，以前在算法用到的也挺多。比如用优先队列优化的Dijkstra算法。现在Java在5.0之后直接提供了。于是照着例子使用了一下：

```
package Chapter11;

import java.util.*;

public class PriorityQueueDemo {
	public static void printQueue(Queue queue) {
		while(queue.peek() != null) {
			System.out.print(queue.remove() + " ");
		}
		System.out.println();
	}
	
	public static void main(String[] args) {
		PriorityQueue<Integer> priorityQueue = new PriorityQueue<Integer>();
		Random random = new Random(47);
		for(int i = 0; i < 10; ++i) {
			priorityQueue.offer(random.nextInt(i + 10));
		}
		printQueue(priorityQueue);
		
		List<Integer> ints = Arrays.asList(25, 22, 20, 18, 14, 9, 3, 1, 1, 2, 3, 9, 14, 18, 21, 23, 25);
		priorityQueue = new PriorityQueue<Integer>(ints);
		printQueue(priorityQueue);
		
		priorityQueue = new PriorityQueue<Integer>(ints.size(), Collections.reverseOrder());
		priorityQueue.addAll(ints);
		printQueue(priorityQueue);
		
		//教育可以远离困惑。。。。。。英语烂成渣！
		String fact = "EDUCATION SHOULD ESCHEW OBFUSCATION";
		
		List<String> strings = Arrays.asList(fact.split(" "));
		PriorityQueue<String> stringPQ = new PriorityQueue<String>(strings);
		printQueue(stringPQ);
		
		//按照指定容量添加元素，优先级按照Comparator实现的顺序。如果继续add，还会按照
		//指定的Comparator顺序添加元素
		stringPQ = new PriorityQueue<String>(strings.size(), Collections.reverseOrder());
		stringPQ.addAll(strings);
		printQueue(stringPQ);
		stringPQ.addAll(strings);
		stringPQ.add("NIUSHUAI");
		printQueue(stringPQ);
		
		//空格拥有最高优先级，有木有！
		Set<Character> charSet = new HashSet<Character>();
		for(char c : fact.toCharArray()) {
			charSet.add(c);
		}
		PriorityQueue<Character> characterPQ = new PriorityQueue<Character>(charSet);
		printQueue(characterPQ);
		
	}
}
```

因为默认的String、Integer、Character都默认实现了Comparator接口。如果你自己也想按照某种排序方法来存放进队列，那么就要自己实现这个接口。也没啥难的。如果你不实现的话，你就只能往优先队列中插入一个元素（因为不需要比较），但是插入第二个的时候肯定就会抛出异常，因为编译器不知道怎么判断元素之间的优先级。

###9. Collection和Iterator

在C++中，容器没有公共的基类；而在Java中，Collection是描述所有序列容器的共性的根接口，因为它要表示其它若干个接口的共性而产生的接口。这样，C++就通过迭代器来表征容器的共性（如果你和我用相同的迭代器，咱俩就是好基友，比如    ```vector<Int>::iterator it```和```vector<bool>::iterator it```就具有共性```vector<T>::iterator```），但是在Java中，因为没有多重继承，所以是通过内部类来完成迭代器的。

考虑一下，如果我们自定义一个序列，其中的元素也是自定义的，比如```List<Apple>```，那么我们怎样遍历它呢？

1. Collection：使用foreach
2. Iterator：实现iterator()，用迭代器

那么，取决于哪种实现就看你的需求，假如你实现一个不是Collection的外部类时，去实现Collection接口就会很冗余，而实现一个Iteator就会很简单高效。总结一下就是：
> Collection含有13个抽象方法，如果你的类需要使用Collection序列存放，而你implements Collection，那么你必须实现所有的方法（不管你会不会用到）。当然，AbstractCollection是一个实现了Collection的抽线类，它帮你实现了大部分的方法，你只需要覆盖size()和iteraot()就可以了。你可以继承AbstractCollection，但是如果你的类继承了别的类，就无法继承AbstractColletion。那么必须手动完成所有Collection的方法。在这时候，继承并创建迭代器就会变得非常简单友好了。大概看了下ArrayList的源代码，发现它也是通过一个private的类实现了Iterator<E>来完成ArrayList的迭代器遍历。

通过实现Collection接口来实现（借助一下AbstractCollection的默认实现）

```
package Chapter11;

import java.util.*;

public class CollectionSequence extends AbstractCollection<Integer> {
	private Integer[] ints = new Integer[]{1, 2, 3, 4, 5};
	public int size() {
		return ints.length;
	}
	//匿名内部类用法
	public Iterator<Integer> iterator() {
		return new Iterator<Integer>() {
			private int index = 0;
			public boolean hasNext() {
				return index < ints.length;
			}
			public Integer next() {
				return ints[index++];
			}
			public void remove() {
				throw new UnsupportedOperationException();
			}
		};
	}
	
	public static void display(Iterator<Integer> it) {
		while(it.hasNext()) {
			Integer i = it.next();
			System.out.print(i + " ");
		}
		System.out.println();
	}
	
	public static void display(Collection<Integer> c) {
		for(Integer i : c) {
			System.out.print(i + " ");
		}
		System.out.println();
	}
	
	public static void main(String[] args) {
		CollectionSequence c = new CollectionSequence();
		display(c);
		display(c.iterator());
	}
}

```

然后看看仅仅使用内部类迭代器版本：

```
package Chapter11;

import java.util.*;

class IntSequence {
	protected Integer[] ints = new Integer[]{1, 2, 3, 4, 5};
}

public class NonCollectionSequence extends IntSequence {
	
	private class MyIterator implements Iterator<Integer> {

		private int index = 0;
		@Override
		public boolean hasNext() {
			return index < ints.length;
		}

		@Override
		public Integer next() {
			return ints[index++];
		}

		@Override
		public void remove() {
			throw new UnsupportedOperationException();
		}
		
	}
	
	public static void display(Iterator<Integer> it) {
		while(it.hasNext()) {
			Integer i = it.next();
			System.out.print(i + " ");
		}
		System.out.println();
	}
	
	public Iterator<Integer> iterator() {
		return new MyIterator();
	}
	
	public static void main(String[] args) {
		NonCollectionSequence nc = new NonCollectionSequence();
		display(nc.iterator());
	}
}
```

其实上个例子是很简单，逻辑性强。但我们也可以使用匿名内部类来搞定，这样更紧凑一些。

```
package Chapter11;

import java.util.*;

class IntSequence {
	protected Integer[] ints = new Integer[]{1, 2, 3, 4, 5};
}

public class NonCollectionSequence extends IntSequence {
	
	private class MyIterator implements Iterator<Integer> {

		private int index = 0;
		@Override
		public boolean hasNext() {
			return index < ints.length;
		}

		@Override
		public Integer next() {
			return ints[index++];
		}

		@Override
		public void remove() {
			throw new UnsupportedOperationException();
		}
		
	}
	
	//匿名内部类使结构更加紧凑
	public Iterator<Integer> iterator() {
		return new Iterator<Integer>() {
			private int index = 0;
			public boolean hasNext() {
				return index < ints.length;
			}
			public Integer next() {
				return ints[index++];
			}
			public void remove() {
				throw new UnsupportedOperationException();
			}
		};
	}
	
	public static void display(Iterator<Integer> it) {
		while(it.hasNext()) {
			Integer i = it.next();
			System.out.print(i + " ");
		}
		System.out.println();
	}
	
	public static void main(String[] args) {
		NonCollectionSequence nc = new NonCollectionSequence();
		display(nc.iterator());
	}
}
```

这样，我们不需要创建一个临时引用，直接返回一个结果的引用。会减少一次垃圾回收。同时，目的性更明确。我们仅仅需要返回一个迭代器即可。


###10. Foreach和迭代器

如果你想给自己的类实现foreach方法，就需要实现Iterable<E>接口。我简单写了一个例子：

```
package Chapter11;

import java.util.*;

class Huhu {
}

class HelloWorld implements Iterable<Huhu> {
	private Huhu[] huhus = {
			new Huhu(),
			new Huhu(),
			new Huhu(),
			new Huhu()
	};
	
	public Iterator<Huhu> iterator() {
		return new Iterator<Huhu>() {
			private int index = 0;

			public boolean hasNext() {
				return index < huhus.length;
			}

			public Huhu next() {
				return huhus[index++];
			}

			public void remove() {
				throw new UnsupportedOperationException();
			}
		};
	}
}

public class TestForeach {
	public static void main(String[] args) {
		for(Huhu s : new HelloWorld()) {
			System.out.print("hi ");
		}
	}
}
```












##第十三章、字符串

在Web应用中，字符串算是使用率最高的结构了。我们查看JDK文档会发现，**String对象是不变的**，String类中每一个看起来会修改String对象的方法，实际上都是创建了一个全新的String对象，以包含修改后的字符串内容。而最初的String对象则丝毫未动。

在字符串领域有3个大头：

1. String
2. StringBuffer
3. StringBuilder

具体参考原来的一篇博文：[Java字符串之String、StringBuffer、StringBuilder](http://www.thinkingbar.com/2014/02/12/java%E5%AD%97%E7%AC%A6%E4%B8%B2%E4%B9%8Bstring%E3%80%81stringbuffer%E3%80%81stringbuilder/)


