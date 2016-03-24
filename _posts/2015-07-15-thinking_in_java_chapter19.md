---
layout: post
title: Java编程思想 - 第十九章、枚举
categories: Java
tags: Java编程思想
---

### 本章概览

这章的知识点非常简单，就是枚举特性的使用。如果仔细看一下，可能一下午就能过一遍。所以本章的总结会很简单，重点放在枚举的常用方法和应用场景。嗯，如果真的想了解一下枚举的方方面面，真的一下午就够了的！！！

### 一、蛮荒时代

在 Java1.5之前是没有`enum`关键词的，所以遇到下面的需求，你会怎么办？

> 在项目内部需要统一状态码，比如 `status=0`表示成功，`status=1`代表计算中，`status=2`代表超时，`status=3`代表失败……，一共有10个内部状态码。为了清晰的表达请求返回的状态，所有人都必须遵守这个约定。

如果是我，我已经想过好了。他们既然是项目公用且不会变化，那么铁定要定义成 public static final 的啊，于是就有了下面的类。

{% highlight java linenos %}
public class ResponseStatusNum {
	public static final int OK = 0;
	public static final int CALCULATING = 1;
	public static final int TIMEOUT = 2;
	public static final int ERROR = 3;
	// 其他7个类型的状态码
}
{% endhighlight java %}

那么，别人使用的时候，就可以这样：
{% highlight java linenos %}
public OuterResponse handleResponse(InnerResponse innerResponse) {
	if(innerResponse.getStatus() == ResponseStatusNum.ERROR) {
		outerResponse.setResponseData = null;
	} else {
		// fill outerResponse...
	}
	return outerResponse;
}
{% endhighlight java %}


如果程序不大，或者对一组常量没有复杂的使用，这种用法完全满足需求，且清晰明了。但现在如果又有了一个需求：

> 我现在对外提供了一个 API，大概长这样：`public handleResponse(Object responseStatusNum, Response response)`，这个 API 的含义是外部调用这个 API 处理一下 response，但是需要告诉 API response 的状态，比如成功了我再进一步加工，如果正在计算或者失败，我就没必要处理了，直接抛弃。

那么，这个 API 的实现可能是这样：

{% highlight java linenos %}
public handleResponse(Object responseStatusNum, Response response) {
	if(!(responseStatusNum instanceof Integer)) {
		LOGGER.error("responseStatusNum type is error!");
		return ;
	}
	Integer status = (Integer)responseStatusNum;
	switch(status) {
		case ResponseStatusNum.OK:
			// do sth
			break;
		case  ResponseStatusNum.CALCULATING:
			// do sth
			break;
		case ResponseStatusNum.TIMEOUT:
			//do sth
			break;
		// other 
		default:
			LOGGER.error("responseStatusNum don't exist!");
			break;
	}
}
{% endhighlight java %}

这么一看，其实也还算可以。但是如果 responseStatusNum 变成 String 的话，就不能用 switch 了，然后就是一堆 `if...else`的判断。

我们仔细观察上面的程序，可能会找出两个明显的缺点：

1. responseStatusNum 可能会被误用，比如我传成任意类型（当然，你也可以指定 int，只是这样以后变更 responseStatusNum 类型，你需要把所有地方都改一遍），API 都会傻傻接受
2. 程序不够清晰，就比如responseStatusNum是 String 的话，一堆 `if...else`看着也是很头疼的

那么，怎么能更优雅的完成上面的功能呢？下面就进入本章的主题——枚举。

### 二、上帝说——要有光

我们使用枚举来完成上面的 API：

{% highlight java linenos %}
public enum ResponseStatusNum {
	OK, CALCULATING, TIMEOUT, ERROR;
}

public handleResponse(ResponseStatusNum responseStatusNum, Response response) {
	switch(responseStatusNum) {
		default:
		case ResponseStatusNum.OK:
			// do sth
			break;
		case  ResponseStatusNum.CALCULATING:
			// do sth
			break;
		case ResponseStatusNum.TIMEOUT:
			//do sth
			break;
		// other situation
	}
}
{% endhighlight java %}

用了 Enum 之后，发现整个程序变得简洁、清晰，针对上述两个问题：

1. ResponseStatusNum 不会被误用，只能传入枚举类型的状态码，如果传入非 enum 实例，编译器直接提示编译错误，第一时间扼制错误的发生，所以在 API 中不用判断状态码的类型是不是非法的
2. 程序主体非常清晰，就是根据状态码进行分发，而且因为进行编译检查，所以不会出现状态码不存在的情况

也许上面的例子能让你感觉枚举的好处，下面再放一个福利：

> 你现在在一个餐厅工作，老板让你弄一个点餐软件。那么，点餐软件的基础就是菜单，如何设计菜单使之更合理呢？首先，菜品有菜系之分，每个菜品又必须有诱人的介绍。一种实现方法是这样的：

{% highlight java linenos %}
public class Recipe {
	public static final Map<String, Map<String, String>> recipe = 
		new HashMap<String, Map<String, String>>();
	static {
		recipe.put("川菜", new HashMap<String, String>());
		recipe.put("粤菜", new HashMap<String, String>());
		recipe.put("东北菜", new HashMap<String, String>());

		init();
	}

	private static void init() {
		if(recipe.contains("川菜")) {
			Map<String, String> description = recipe.get("川菜");
			description.put("宫保鸡丁", "这道菜 balabala");
			description.put("鱼香肉丝", "这道菜 balabala");
		}

		if(recipe.contains("粤菜")) {
			Map<String, String> description = recipe.get("川菜");
			description.put("肠粉", "这道菜 balabala");
			description.put("叉烧包", "这道菜 balabala");
		}

		if(recipe.contains("东北菜")) {
			Map<String, String> description = recipe.get("川菜");
			description.put("猪肉炖粉条", "这道菜 balabala");
			description.put("翠花上酸菜", "这道菜 balabala");
		}

	}
}
{% endhighlight java %}

如果你看到别人给你的接口是这样，是不是感觉很头晕啊。。。。那如果是下面这样呢？

{% highlight java linenos %}
/**
 * 我们去饭店吃饭，都会有菜单，并且按照一定规则分类（比如热菜、凉菜、主食、饮料等)<br>
 * 那么，我们在程序中如何录入菜单呢？<br>
 * 如果可能，我希望是枚举嵌套枚举，但是不能实现...sigh
 * 
 * 因为枚举没法嵌套，这里使用接口将枚举按组罗列，整体还是很清晰的
 */
interface Recipe {
    enum Chinese implements Recipe {
        宫保鸡丁 {
            public String show() {
                return "招牌菜——宫保鸡丁，采用108道工序，宫廷秘方连续烹煮18个小时而成，具有滋阴补阳的功效...";
            }
        },
        鱼香肉丝("酸甜可口"), 酸辣土豆丝("我的最爱");

        private String des;

        // 转为招牌菜提供的招牌菜详细介绍构造函数
        private Chinese() {

        }

        // 为普通菜品提供的简介构造函数
        private Chinese(String des) {
            this.des = des;
        }

        @Override
        public String show() {
            return des;
        }
    }

    enum American implements Recipe {
        hotdog, hamburger, icecream;

        @Override
        public String show() {
            return "";
        }
    }

    enum Japanese implements Recipe {
        生鱼片, 寿司;

        @Override
        public String show() {
            return "";
        }
    }

    abstract String show();
}

public class _08_Food {
    public static void main(String[] args) {
        System.out.println("服务员：先森，你需要点什么？");

        List<Recipe> recipe = new ArrayList<Recipe>();
        System.out.println("客人：给我介绍个招牌菜");
        System.out.println("服务员：" + Chinese.宫保鸡丁.show());
        System.out.println("客人：好，来一个");
        recipe.add(Chinese.宫保鸡丁);
        System.out.println("客人：这个咋样？");
        System.out.println("服务员：" + Chinese.鱼香肉丝.show());
        System.out.println("客人：哦，我不喜欢甜的");
        recipe.add(American.hotdog);
        recipe.add(Japanese.寿司);

        System.out.println("你点的餐有：" + recipe);
    }
}/*output:
服务员：先森，你需要点什么？
客人：给我介绍个招牌菜
服务员：招牌菜——宫保鸡丁，采用108道工序，宫廷秘方连续烹煮18个小时而成，具有滋阴补阳的功效...
客人：好，来一个
客人：这个咋样？
服务员：酸甜可口
客人：哦，我不喜欢甜的
你点的餐有：[宫保鸡丁, hotdog, 寿司]
*/
{% endhighlight java %}

### 枚举的特性

上面两个小节大致介绍了枚举的好处，总的看来，枚举还是能提高代码的质量的，所以下面我们就再看看它的几个特性吧：）

#### 1. 枚举最最基本的使用

{% highlight java linenos %}
/**
 * 1. ordinal()返回每个enum实例在声明时的次序，从0开始。<br>
 * 2. 可以使用==比较enum实例，因为每个enum实例都继承自Enum类，会提供equals()和hashCode()方法<br>
 * 3. Enum类实现了Comparable和Serialiazble接口<br>
 * 4. 调用getDeclaringClass()就能知道enum实例所属的enum类<br>
 */
enum Shrubbery {
    GROUND, CRAWLING, HANGING
}

public class _01_EnumClass {
    public static void main(String[] args) {
        // 可以使用 values()方法遍历枚举，顺序为 enum 实例声明的顺序
        for (Shrubbery s : Shrubbery.values()) {
            System.out.println(s + " 在枚举类中次序： " + s.ordinal());

            // Enum 类实现了 Comparable 和 Serializable 接口
            System.out.println(s.compareTo(Shrubbery.CRAWLING));
            System.out.println(s == Shrubbery.CRAWLING);

            // 获取某个 enum 实例所在的枚举类
            System.out.println(s.getDeclaringClass());

            // 获取enum 实例名称，和 toString()效果相同,下面两个注释语句都调用 toString()
            System.out.println(s.name());
            // System.out.println(s.toString());
            // System.out.println(s);
            System.out.println("===============");
        }

        // valueOf()是 Enum 的静态方法，根据枚举类和名称寻找 enum 实例，不存在就抛出 IllegalArgumentException
        for (String s : "HANGING CRAWLING GROUND".split(" ")) {
            Shrubbery shrub = Enum.valueOf(Shrubbery.class, s);
            System.out.println(shrub);
        }
    }
}/*output:
GROUND 在枚举类中次序： 0
-1
false
class Chapter19.Shrubbery
GROUND
===============
CRAWLING 在枚举类中次序： 1
0
true
class Chapter19.Shrubbery
CRAWLING
===============
HANGING 在枚举类中次序： 2
1
false
class Chapter19.Shrubbery
HANGING
===============
HANGING
CRAWLING
GROUND
*/
{% endhighlight java %}

#### 2. enum 实例自解释

一般来说，我们希望每个 enum 实例能够返回对自身的描述，就像前面小节那个宫保鸡丁、鱼香肉丝那样，对自己有个介绍。而不仅仅返回一个"宫保鸡丁"的 enum 实例名字。很幸运，这个功能的实现非常简单，我们可以提供一个构造器，专门负责处理这个额外的信息，然后添加一个方法，返回这个描述信息：

{% highlight java linenos %}
/**
 * 如果想在枚举类中自己定义方法时:<br>
 * 
 * 1. 必须先定义 enum 实例(否则编译错误),然后再是其他属性和方法<br>
 * 2. enum 序列最后一个元素后要添加分号<br>
 * 3. 构造器必须是 package 或者 private，因为 enum 实例会被翻译成 static final 的属性<br>
 * 如果是 public 的话，意味着 enum 实例还能改变，这不科学.如果改成 public，编译器会报错。<br>
 * 一旦 enum 的定义结束，编译器就不允许我们再使用其构造器来创建任何实例了
 */
public enum _02_OzWitch {
    WEST("this is west"), NORTH("this is north"), EAST("this is east"), SOUTH("this is south");

    private String description;

    private _02_OzWitch(String description) {
        this.description = description;
    }

    public String getDescrption() {
        return description;
    }

    public static void main(String[] args) {
        for (_02_OzWitch witch : _02_OzWitch.values()) {
            System.out.println(witch + ": " + witch.ordinal() + " " + witch.getDescrption());
        }
    }
}/*output:
WEST: 0 this is west
NORTH: 1 this is north
EAST: 2 this is east
SOUTH: 3 this is south
*/
{% endhighlight java %}

#### 3. switch 天然属性

在 switch 中使用 enum 是非常方便的。一般来说，switch 中只能使用整数值，而 enum 实例天生就有整数值的次序，并且可以用过 ordinal()方法取得次序。那么，对于 switch 而言：

1. 可以使用 byte/char/short/int/enum 这几种，因为前面几个可以安全向上转型为 int
2. 不能使用 long/double之类的，因为向下转型是不安全的，当然，更高版本的 jdk 已经支持 String 了，这个很赞！

#### 4. values()的神秘之处

前面我们使用了 values()方法遍历 enum 实例，我们知道，enum 类都继承自 Enum 类（记得 java 是单继承吧，所以枚举类只能实现接口了），但是看 Enum 源码会发现，就没有 values()这个方法，奇了怪了，我们明明可以用啊。。。难道存在某种“隐藏的”方法？我们用反射搞个程序来看看其中的变化吧：

{% highlight java linenos %}
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.Set;
import java.util.TreeSet;

enum Explore {
    HERE, THERE
}

/**
 * 运行程序后，发现增加了values()方法。这是编译器添加的static方法。一共添加了2个：
 * <p>
 * 
 * 1. values()<br>
 * 2. 重载版本的valueOf()
 * <p>
 * 
 * 如果使用<code>javap</code>看下编译后生成的HERE和THERE类，会发现他们是static final Explore HERE,所以枚举类不能被继承。
 */
public class _05_Reflection {
    /**
     * 打印一个类的接口，父类，方法。
     * 
     * @param enumClass
     * @return
     */
    public static Set<String> analyze(Class<?> enumClass) {
        System.out.println("Analyzing " + enumClass + " ...");
        System.out.println("实现的接口: ");
        for (Type t : enumClass.getGenericInterfaces()) {
            System.out.println(t);
        }
        System.out.println("父类: " + enumClass.getSuperclass());
        System.out.println("方法列表: ");
        Set<String> methods = new TreeSet<String>();
        for (Method m : enumClass.getMethods()) {
            methods.add(m.getName());
        }
        System.out.println(methods);
        return methods;
    }

    public static void main(String[] args) {
        Set<String> exploreMethods = analyze(Explore.class);
        System.out.println("============");
        Set<String> enumMethods = analyze(Enum.class);
        System.out.println("============");

        System.out
                .println("Explore是否含有Enum的全部方法？Explore.containsAll(Enum)? " + exploreMethods.containsAll(enumMethods));

        System.out.println("============");
        System.out.println("Explore去掉Enum的全部方法。Explore.removeAll(Enum): ");
        exploreMethods.removeAll(enumMethods);
        System.out.println("去掉后剩下的方法： " + exploreMethods);
    }
}/*output:
Analyzing class Chapter19.Explore ...
实现的接口: 
父类: class java.lang.Enum
方法列表: 
[compareTo, equals, getClass, getDeclaringClass, hashCode, name, notify, notifyAll, ordinal, toString, valueOf, values, wait]
============
Analyzing class java.lang.Enum ...
实现的接口: 
java.lang.Comparable<E>
interface java.io.Serializable
父类: class java.lang.Object
方法列表: 
[compareTo, equals, getClass, getDeclaringClass, hashCode, name, notify, notifyAll, ordinal, toString, valueOf, wait]
============
Explore是否含有Enum的全部方法？Explore.containsAll(Enum)? true
============
Explore去掉Enum的全部方法。Explore.removeAll(Enum): 
去掉后剩下的方法： [values]
*/
{% endhighlight java %}

编译后的 Explore:

{% highlight java linenos %}
final class Explore extends java.lang.Enum {
	public static final Explore HERE;
	public static final Explore THERE;
	public static final Explore[] values();
	public static Explore valueOF(java.lang.String);
	static {}
}
{% endhighlight java %}

答案是：

> values()是由编译器添加的 static 方法，同时也添加了一个重载版本的 valueOf()方法，why？简单啦，Enum 的 valueOf()需要提供枚举类和名称，但是我作为一个枚举类，使用 valueOf()的时候，肯定知道自身属于哪个枚举类，所以只需要提供名字即可。

那么，既然 values()方法是由编译器提供的，如果你将 enum 实例向上转型为 Enum，那么 values()就无法使用了。但是天无绝人之路，在 Class 中有一个`getEnumConstants()`方法来取得所有 enum 实例。当然，如果不是枚举类调用这个方法，会返回 null 导致 NPE 的:

{% highlight java linenos %}
enum Search {
    HITHER, YON
}

/**
 * values()是编译器加上的 static 方法，而 Enum 类是木有的。所以<code>e.values()</code>编译错误
 * 
 * 但是 Class 类有一个getEnumConstants()方法可以获取枚举类的所有实例。<br>
 * 因为这个方法在 Class 类中，所以全部类都可以使用， 只是非枚举类使用时会返回一个 NULL
 */
public class _06_UpcastEnum {
    public static void main(String[] args) {
        Search[] values = Search.values();
        Enum e = Search.HITHER; // Upcast
        // e.values();
        for (Enum en : Search.class.getEnumConstants()) {
            System.out.println(en);
        }

        System.out.println(Integer.class.getEnumConstants() == null);
        // 因为返回的是 null，所以就是空指针异常了
        for (Object en : Integer.class.getEnumConstants()) {
            System.out.println(en);
        }
    }
}/*output:
HITHER
YON
true
Exception in thread "main" java.lang.NullPointerException
    at Chapter19._06_UpcastEnum.main(_06_UpcastEnum.java:24)
*/
{% endhighlight java %}

#### 5. 使用接口组织枚举

前面我们菜谱 Recipe 的程序是使用 interface 组织的，因为**枚举不支持嵌套...sigh**。所以，我们当时只能这么搞：

{% highlight java linenos %}
interface Recipe {
    enum Chinese implements Recipe {
        宫保鸡丁 {
            public String show() {
                return "招牌菜——宫保鸡丁，采用108道工序，宫廷秘方连续烹煮18个小时而成，具有滋阴补阳的功效...";
            }
        },
        鱼香肉丝("酸甜可口"), 酸辣土豆丝("我的最爱");

        private String des;

        // 转为招牌菜提供的招牌菜详细介绍构造函数
        private Chinese() {

        }

        // 为普通菜品提供的简介构造函数
        private Chinese(String des) {
            this.des = des;
        }

        @Override
        public String show() {
            return des;
        }
    }

    enum American implements Recipe {
        hotdog, hamburger, icecream;

        @Override
        public String show() {
            return "";
        }
    }

    enum Japanese implements Recipe {
        生鱼片, 寿司;

        @Override
        public String show() {
            return "";
        }
    }

    abstract String show();
}
{% endhighlight java %}

#### 6. EnumSet 和 EnumMap 的使用

对于 EnumSet，感觉很有意思，会写一个源码分析：[EnumSet 源码剖析](../EnumSet-source)，对于 EnumMap，它要求**map 中的 key 必须来自一个 enum。**和 EnumSet 一样，enum 实例定义时的顺序决定了其在 EnumMap 中的顺序，不是enum 实例的 hashcode（HashMap 的默认排序是根据 key 的 hashcode 升序）这点需要记住。。

{% highlight java linenos %}
import java.util.EnumMap;
import java.util.Map;

interface Command {
    void action();
}

enum AlartPoints {
    KITCHEN, BEDROOM, BATHROOM;
}

/**
 * 注意：<br>
 * 1. EnumSet和EnumMap一样，它们中存放的元素不管以怎样的顺序add进去，<br>
 * 遍历的时候都是按照定义的次序展现(下面会先输出KITCHEN)。 <br>
 * 2. 如果EnumMap中没有某个enum实例，get的时候会得到一个NPE
 */
public class _11_EnumMaps {
    public static void main(String[] args) {
        EnumMap<AlartPoints, Command> em = new EnumMap<AlartPoints, Command>(AlartPoints.class);

        em.put(AlartPoints.BEDROOM, new Command() {
            @Override
            public void action() {
                System.out.println("bedroom is fire");
            }
        });

        em.put(AlartPoints.KITCHEN, new Command() {
            @Override
            public void action() {
                System.out.println("kitchen is fire");
            }
        });

        // em.put(AlartPoints.KITCHEN, new Command() {
        // @Override
        // public void action() {
        // System.out.println("bathroom is fire");
        // }
        // });

        for (Map.Entry<AlartPoints, Command> e : em.entrySet()) {
            System.out.print(e.getKey() + ": ");
            e.getValue().action();
        }
        em.get(AlartPoints.BATHROOM).action();
    }
}
{% endhighlight java %}

#### 7. 常量相关的方法

Java 的 enum 有一个非常有趣的特性，允许为 enum 实例编写方法，这样就能使enum 表现不同的行为，要实现常量相关的方法，需要为 enum 定义一个或多个abstract 方法，然后为每个 enum 实例实现该抽象方法。这个用法还是很实用的，超像多态有木有？

{% highlight java linenos %}
public enum _12_ConstantSpecificMethod {

    FORMAT1 {
        @Override
        void different() {
            System.out.println("format1");
        }
    },
    FORMAT2 {
        @Override
        void different() {
            System.out.println("format2");
        }
    };

    abstract void different();

    public static void main(String[] args) {
        for (_12_ConstantSpecificMethod csm : values()) {
            csm.different();
        }
    }
}
{% endhighlight java %}

通过相应的 enum 实例，我们可以调用其上的方法。这通常也称为**表驱动的代码**。在面向对象的程序设计中，不同的行为与不同的类关联。而通过常量相关的方法，每个 enum 实例可以具有自己独特的行为，这说明啥？说明每个 enum 实例好像一个独特的类啊。在上面的例子中，enum 实例似乎被当成了超类 _12_ConstantSpecificMethod 来使用，在调用 different()体现出多态的行为。但是，**我们并不能真的将 enum 实例作为一个类型来使用：**

{% highlight java linenos %}
enum LikeClasses {
    SING {
        void behaviour() {
            System.out.println("I'm singing.");
        }
    },

    RUN {
        void behaviour() {
            System.out.println("I'm running.");
        }
    },

    PLAY {
        void behaviour() {
            System.out.println("I'm playing.");
        }
    };

    abstract void behaviour();
}

/**
 * 
 * 悲剧，下面这句无法编译通过。说明enum实例不能当做class类型啊！！ <br>
 * 因为SING/RUN/PLAY编译后都是static final实例。就比如f2的例子一样
 * 
 * @author niushuai02
 * 
 */
public class _13_NotClasses {

    // void f1(LikeClasses.RUN a) {}

    void f1(LikeClasses a) {
    }

    public static final String HELLO = "hello";

    // void f2(HELLO) {}
}
{% endhighlight java %}

#### 8. 高级主题——多路分发

这一小节看了，代码也敲了，但是不太了解使用场景。google 了一下也没找到有价值的资料。在知乎上私信了 R 大，希望能收到个回信吧。。。