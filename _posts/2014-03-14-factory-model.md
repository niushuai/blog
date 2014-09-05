---
layout: post
title: 工厂设计模式初探
categories: Java
tags: 工厂模式
---

在《Thinking In Java》的第十章讲到了内部类，涉及到了设计模式中的工厂模式，稀里糊涂的。于是就按照书上的例子写了个 demo 试试水。


我们假设背景是这么设计的：

* 有Apple和Lenovo两个公司
* 分别生产Macbook和Thinkapd笔记本，而笔记本功能相同。可以有个接口ComputerModel
* 有一个商店卖这两个公司的笔记本，它只关心两件事：什么公司、什么产品，于是有一个公共的接口public ComputerModel sell(ComputerCompany company)。顾客告诉我想买哪个公司的产品，我给你一个它们公司的笔记本

第一种情况就是实现这个逻辑：

{% highlight java linenos %}
package Chapter10;

interface ComputerModel {
	void startup();
	void play();
}

class MacBook implements ComputerModel {
	public void startup() {
		System.out.println("MacBook startup!");
	}
	public void play() {
		System.out.println("MacBook play!");
	}
}

class ThinkPad implements ComputerModel {
	public void startup() {
		System.out.println("ThinkPad startup!");
	}
	public void play() {
		System.out.println("ThinkPad play!");
	}
}

interface ComputerCompany {
	ComputerModel produce();
}

class Apple implements ComputerCompany {
	public ComputerModel produce() {
		return new MacBook();
	}
}

class Lenovo implements ComputerCompany {
	public ComputerModel produce() {
		return new ThinkPad();
	}
}

class ComputerStore {
	public static ComputerModel sell(ComputerCompany company) {
		return company.produce();
	}
}

public class VersionOne {
	public static void main(String[] args) {
		ComputerModel computer = ComputerStore.sell(new Apple());
		computer.startup();
		computer.play();

		System.out.println();

		ComputerModel computer2 = ComputerStore.sell(new Lenovo());
		computer2.startup();
		computer2.play();
	}
}
{% endhighlight java %}

我们看上面的例子会发现，笔记本和公司应该是一个有机的整体，不能分离。但是上面代码中Apple和Macbook是分离的，Lenovo和ThinkPad也是分离的。然后用面向对象的方法来思考：需要向上转型吗？因为Macbook是一个产品，Apple是一个公司，所以不能使用继承。那组合呢？Apple有一个Macbook？也不合适吧。代理也不合适。那么，按照工厂模式的逻辑，用内部类来搞一下：

{% highlight java linenos %}
package Chapter10;

interface ComputerModel {
	void startup();

	void play();
}

interface ComputerCompany {
	ComputerModel produce();
}

class Apple implements ComputerCompany {
	class MacBook implements ComputerModel {
		public void startup() {
			System.out.println("MacBook startup!");
		}

		public void play() {
			System.out.println("MacBook play!");
		}
	}

	public ComputerModel produce() {
		return new MacBook();
	}
}

class Lenovo implements ComputerCompany {
	class ThinkPad implements ComputerModel {
		public void startup() {
			System.out.println("ThinkPad startup!");
		}

		public void play() {
			System.out.println("ThinkPad play!");
		}
	}

	public ComputerModel produce() {
		return new ThinkPad();
	}
}

class ComputerStore {
	public static ComputerModel sell(ComputerCompany company) {
		return company.produce();
	}
}

public class VersionTwo {
	public static void main(String[] args) {
		ComputerModel computer = ComputerStore.sell(new Apple());
		computer.startup();
		computer.play();
		System.out.println();
		ComputerModel computer2 = ComputerStore.sell(new Lenovo());
		computer2.startup();
		computer2.play();
	}
}
{% endhighlight java %}

上面是内部类的简单使用。满足了所有逻辑，也很有效。但有些时候匿名内部类能更好的完成逻辑，比如我不想在函数中创建一个临时引用仅仅用于返回new的内部类，那么匿名内部类会是一个好选择。但是呢，现在对于内部类的理解还是太浅，所以对经验神马的还是等等再说吧。。。下面是匿名内部类的简单使用。

{% highlight java linenos %}
package Chapter10;

interface ComputerModel {
	void startup();

	void play();
}

interface ComputerCompany {
	ComputerModel produce();
}

class Apple implements ComputerCompany {
	public ComputerModel produce() {
		return new ComputerModel() {
			public void startup() {
				System.out.println("MacBook startup!");
			}

			public void play() {
				System.out.println("MacBook play!");
			}
		};
	}
}

class Lenovo implements ComputerCompany {
	public ComputerModel produce() {
		return new ComputerModel() {
			public void startup() {
				System.out.println("ThinkPad startup!");
			}

			public void play() {
				System.out.println("ThinkPad play!");
			}
		};
	}
}

class ComputerStore {
	public static ComputerModel sell(ComputerCompany company) {
		return company.produce();
	}
}

public class VersionThree {
	public static void main(String[] args) {
		ComputerModel computer = ComputerStore.sell(new Apple());
		computer.startup();
		computer.play();
		System.out.println();
		ComputerModel computer2 = ComputerStore.sell(new Lenovo());
		computer2.startup();
		computer2.play();
	}
}
{% endhighlight java %}
