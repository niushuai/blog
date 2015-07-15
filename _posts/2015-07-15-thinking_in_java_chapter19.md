---
layout: post
title: Java编程思想 - 第十九章、枚举
categories: Java
tags: Java编程思想
---

###本章概览

这章的知识点非常简单，就是枚举特性的使用。如果仔细看一下，可能一下午就能过一遍。所以本章的总结会很简单，重点放在枚举的常用方法和应用场景。

###一、蛮荒时代

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

###二、上帝说——要有光

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