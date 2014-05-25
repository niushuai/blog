---
layout: post
title: Spring AOP技术底层实现-动态代理
categories: Java
tag: dynamic_proxy
---

在 JDK 1.3之后提供了动态代理技术，允许在运行期间创建接口的代理实例。而Spring的AOP（Aspect-Oriented-Programming）就使用了动态代理最为它的底层实现。今天就来简单讨论一下动态代理的原理。

##1. 一个问题

现在有这样一个场景：

> 最近项目进行了一次大的改动，在测试时候发现一次请求的响应时间由原来的25ms延长到50ms，于是我们需要确定到底是哪个模块运行的时间最长，便于我们优化。

为了说明动态代理技术，我们把这个问题再简化一下：

> 已知这次改动主要是对```com.sina```这个package下面的代码进行了更新，而这个package的核心是一个Work接口和实现类。代码结构如下：

```
com.sina
        -work
            -impl
        -service
        -monitor[测试使用，非线上]
```

其中核心部分是work，service是work的包装类，用于外部调用。monitor是我们这次试验创建的package。下面是work的代码（一个接口和一个具体的实现）：

```
package com.sina.work.impl;

import com.sina.work.Work;

public class WorkImpl implements Work {

	@Override
	public void search(String str) {
		System.out.println("searching the " + str + "...");
		try {
			/**
			 * 模拟search过程，实现不知道运行时间
			 */
			Thread.sleep(40);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void result() {
		try {
			/**
			 * 模拟结果组装，实际不知道运行时间
			 */
			Thread.sleep(20);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("ok!");
	}
}
```

背景已经介绍完了，现在要解决的问题也清晰了：

> 我们需要记录每个方法的执行时间

##2. 解决方案

1. 改代码：只要在search()和result()的开头和结尾加上时间戳，一运行就可以知道了。是的，这是最简单的一种，但是也是最不规范的一种
2. 组合：我们可以在work和service中间加一个代理，让代理调用work的方法时再前后加上时间戳。然后service调用这个代理
3. 继承：我们再写一个类继承WorkImpl，@Override的时候在super.search()前后加上时间戳，然后调用继承后的类
4. 动态代理：使用Spring提供的AOP

下面分别评述一下解决方案：

1. 对于第一种，坏处就不说了，但在部分已知情况下，改动量最小，可以用。绝大多数情况不适用。
2. 对于2、3来说，如果代码规模比较大，比如几十、上百个类，那么分分钟累死的节奏
3. 使用Spring的动态代理，就配置一下就好，如果不用，注释掉。方便省事。所以还是配置级的灵活性最强

##3. 动态代理

现在开始算是正文部分，我们来详解介绍一下AOP的底层实现——动态代理。

要实现动态代理，需要用到java.lang.reflect包下面的Proxy和InvocationHandler：

* InvocationHandler是一个接口，用于定义横切逻辑。它可以将业务逻辑和横切逻辑编织在一起
* Proxy：使用静态方法newProxyInstance产生一个代理对象

下面是自己实现的WorkMonitor，它的作用是在某个函数的开头和结尾加上时间戳，并打印函数执行的时间（这就是传说中的横切逻辑）：

```
package com.sina.monitor;

public class WorkMonitor {
	
	private static long time;
	
	public static void begin() {
		System.out.println("Work startup...");
		time = System.currentTimeMillis();
	}
	public static void end() {
		long endTime = System.currentTimeMillis();
		System.out.println("Work done!");
		System.out.println("Work cost Time: " + (endTime - time) + "ms");
	}
}
```

现在，业务逻辑有了，横切逻辑也有了。下面通过实现InvocationHandler来将它们编织在一起：

```
package com.sina.monitor;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class WorkMonitorHandler implements InvocationHandler {

	/**
	 * 要代理的业务类
	 */
	private Object target;

	public WorkMonitorHandler(Object target) {
		this.target = target;
	}

	@Override
	public Object invoke(Object proxy, Method method, Object[] args)
			throws Throwable {

		Object object;

		/**
		 * 我们只对search方法进行横切逻辑编织，result不加载横切逻辑
		 */
		if (method.getName().equals("search")) {
			System.out.println("Proxy is: " + target.getClass() + ", method is: " + method);
			WorkMonitor.begin();
			/**
			 * 采用反射机制调用业务类的对应方法，注意使用的是target而不是proxy
			 */
			object = method.invoke(target, args);
			WorkMonitor.end();
		} else {
			object = method.invoke(target, args);
		}

		return object;
	}

}
```

从代码我们可以看出，InvocationHandler接口的invoke函数将业务逻辑和横切逻辑巧妙的编织在一起，实在是优美。不用我们再去每个业务类代理里到处写横切逻辑了。

本来在使用反射机制要使用的是invoke函数提供的proxy，但是因为我们的目的是将业务逻辑和横切逻辑编织在一起，而业务逻辑所在的类是通过外部传入的。另外我们可以看出来，本质上proxy和WorkMonitorHandler要编织的类是同一个。这里通过在构造函数中传入，在invoke使用的方式。

下面我们展示不使用动态代理和使用动态代理的方式：

```
package com.sina.service;

import java.lang.reflect.Proxy;

import com.sina.monitor.WorkMonitorHandler;
import com.sina.work.Work;
import com.sina.work.impl.WorkImpl;

public class WorkService {
	public static void main(String[] args) {
		Work work = new WorkImpl();
		work.search("proxy");
		work.result();

		System.out.println("\nnew monitor:\n");
        
    //业务逻辑类
		Work work2 = new WorkImpl();
		//将业务逻辑类和横切逻辑类编织
		WorkMonitorHandler workMonitorHandler = new WorkMonitorHandler(work2);
		//产生代理
		Work workMonitor = (Work) Proxy.newProxyInstance(work2.getClass()
				.getClassLoader(), work2.getClass().getInterfaces(),
				workMonitorHandler);
		workMonitor.search("proxy");
		workMonitor.result();
	}
}
/**output:
searching the proxy...
ok!

new monitor:

Proxy is: class com.sina.work.impl.WorkImpl, method is: public abstract void com.sina.work.Work.search(java.lang.String)
Work startup...
searching the proxy...
Work done!
Work cost Time: 41ms
ok!
*/
```

从结果来看，第一个过程是searching the proxy...和ok。他们没有使用横切逻辑。

下面new monitor是使用横切逻辑的输出结果。因为我们只对search采用了横切逻辑，所以result的执行只有ok。

##4. 原理

上面介绍了动态代理的使用，那么，动态代理是如何实现的呢？首先我们打印一下workMonitor是不是WorkImpl，打印结果是Proxy4。其实，整个过程还是挺清晰的：

1. 首先我们使用Proxy的静态方法newProxyInstance方法，其中有3个参数：
	* classLoader：这个参数的意义很明确，因为代理中必定带有一个被代理对象，如果classLoader不一致的话，代理对象和被代理对象就会被隔离，导致无法访问，自然无法实现代理的功能
	* interfaces：被代理对象可能实现了多个接口，那么，我们代理的时候就要明确指定被代理对象实现的是哪个接口，这样 JDK 才能得到接口的对应方法
	* InvocationHandler：这个是关键，其实代理对象调用的函数是传入这个处理器中进行具体的代理动作
2. 然后返回一个Object被转型为对应的接口
3. 调用WorkMonitor.search("proxy");当调用的时候，最核心的是回到了InvocationHandler中的invoke函数中，传入的参数是(代理对象,方法，参数），然后采用反射机制调用被代理对象的具体函数。**注意：传入invoke的是Proxy.newProxyInstance产生的代理对象，而不是被代理对象**

整个具体的实现可以参考 JDK 的源代码，这里只是一个逻辑结构，可能细节会有一点出入。
