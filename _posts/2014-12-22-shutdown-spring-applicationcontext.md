---
layout: post
title:  如何关闭 Spring 的 ApplicationContext
categories: Java
tags: Spring
---

最近在升级项目中的一些组件，但是遇到了一个问题。大概是这样的：

> 原来这些代码是以 class 文件部署到机器上的，是单独的 class 文件。我升级之后需要用到一些 IOC 和 AOP，就引入了 Spring 。但是在运行时很诡异的发现程序运行 Main 方法之后就 hang 了，没有关闭。

我当时的解决方法是强制调用了 `System.exit(0);`来关闭。但是写完后感觉应该有更好的方式来解决这个问题。就 google 了一下，在 stackoverflow 看到了这个问题的解答，其实是 Spring 文档中已经说明的。我贴一下备忘吧。

stackoverflow 链接：[How to close a spring ApplicationContext?](http://stackoverflow.com/questions/14423980/how-to-close-a-spring-applicationcontext)

Spring 文档关闭这点的说明：[Shutting down the Spring IoC container gracefully in non-web applications](http://static.springsource.org/spring/docs/3.0.x/spring-framework-reference/html/beans.html#beans-factory-shutdown)

> This section applies only to **non-web applications**. Spring's web-based ApplicationContext implementations already have code in place to shut down the Spring IoC container gracefully when the relevant web application is shut down.

If you are using Spring's IoC container in a non-web application environment; for example, in a rich client desktop environment; you register a shutdown hook with the JVM. Doing so ensures a graceful shutdown and calls the relevant destroy methods on your singleton beans so that all resources are released. Of course, you must still configure and implement these destroy callbacks correctly.

To register a shutdown hook, you call the `registerShutdownHook()` method that is declared on the `AbstractApplicationContext` class:

{% highlight java linenos %}
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public final class Boot {

  public static void main(final String[] args) throws Exception {
      AbstractApplicationContext ctx
          = new ClassPathXmlApplicationContext(new String []{"beans.xml"});

      // add a shutdown hook for the above context... 
      ctx.registerShutdownHook();

      // app runs here...

      // main method exits, hook is called prior to the app shutting down...
  }
}
{% endhighlight java %}
