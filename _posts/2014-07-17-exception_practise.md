---
layout: post
title: Java 异常实例演示
categories: Java
tags: Java
---

这篇文章是对《Java 编程思想》第十二章的补充，主要有两个小例子：

1. 一个改错例子
2. InputFile工具类

### 一、改错例子

找出下面程序的所有错误（一股浓浓的考试味道。。。。）

{% highlight java linenos %}
OutputStreamWriter out = ... 
java.sql.Connection conn = ... 
try {
	Statement stat = conn.createStatement(); 
	ResultSet rs = stat.executeQuery(
	"select uid, name from user"); 
	while (rs.next()) 
	{ 
		out.println("ID：" + rs.getString("uid") + 
		"，姓名：" + rs.getString("name")); 
	}
	conn.close();
	out.close(); 
} 
catch(Exception ex)
{
	ex.printStackTrace();
}
 {% endhighlight java %}

 然后数数自己找出来几个。为了有点效果，我决定把答案放在最下面吧。

### 二、InputFile工具类

其实这个例子是书中的，P272页。叫做——构造器

{% highlight java linenos %}
package Chapter12;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;


public class ReadFile {
	
	private BufferedReader bufferedReader;
	
	public ReadFile(String fileName) throws Exception {
		try {
			bufferedReader = new BufferedReader(new FileReader(fileName));
		} catch (FileNotFoundException e) {
			System.out.println("cound't open: " + fileName);
			e.printStackTrace();
			throw e;
		} catch (Exception e) {
			//other Exception, must close the file
			try {
				bufferedReader.close();
			} catch (IOException e2) {
				System.out.println("in.close() unsuccessful!");
			}
			throw e;
		} finally {
			//Don't close it here!!!!!
		}
	}
	
	public String getLine() {
		String line = null;
		try {
			line = bufferedReader.readLine();
		} catch (IOException e) {
			throw new RuntimeException("readLine failed");
		}
		return line;
	}
	
	public void dispose() {
		try {
			bufferedReader.close();
			System.out.println("dispose() successful");
		} catch (IOException e) {
			throw new RuntimeException("in.close() unsuccessful!");
		}
	}
	
}
{% endhighlight java %}

别的我不多说了，自己结合书把代码看懂。(次奥，这也行？！你是有多懒啊！！！)


### 一、改错例子

承接上文，转启下文。

这段代码有6个地方不合适，其实不能算错，因为程序还是能运行滴。但是漏洞太多，下面我们来一一点评：

{% highlight java linenos %}
OutputStreamWriter out = ... 
java.sql.Connection conn = ... 
try {// ⑸ 
	Statement stat = conn.createStatement(); 
	ResultSet rs = stat.executeQuery(
	"select uid, name from user"); 
	while (rs.next()) 
	{ 
		out.println("ID：" + rs.getString("uid") + // ⑹ 
		"，姓名：" + rs.getString("name")); 
	}
	conn.close();// ⑶ 
	out.close(); 
} 
catch(Exception ex)// ⑵ 
{
	ex.printStackTrace();//⑴，⑷ 
}
{% endhighlight java %}

#### 反例之一：丢弃异常 (代码：15行-18行) 

这段代码捕获了异常却不作任何处理，可以算得上Java编程中的杀手。从问题出现的频繁程度和祸害程度来看，它也许可以和C/C++程序的一个恶名远播的问题相提并论??不检查缓冲区是否已满。如果你看到了这种丢弃（而不是抛出）异常的情况，可以百分之九十九地肯定代码存在问题（在极少数情况下，这段代码有存在的理由，但最好加上完整的注释，以免引起别人误解）。 

这段代码的错误在于，异常（几乎）总是意味着某些事情不对劲了，或者说至少发生了某些不寻常的事情，我们不应该对程序发出的求救信号保持沉默和无动于衷。调用一下printStackTrace算不上“处理异常”。不错，调用printStackTrace对调试程序有帮助，但程序调试阶段结束之后，printStackTrace就不应再在异常处理模块中担负主要责任了。 

丢弃异常的情形非常普遍。打开JDK的ThreadDeath类的文档，可以看到下面这段说明：“特别地，虽然出现ThreadDeath是一种‘正常的情形’，但ThreadDeath类是Error而不是Exception的子类，因为许多应用会捕获所有的Exception然后丢弃它不再理睬。”这段话的意思是，虽然ThreadDeath代表的是一种普通的问题，但鉴于许多应用会试图捕获所有异常然后不予以适当的处理，所以JDK把ThreadDeath定义成了Error的子类，因为Error类代表的是一般的应用不应该去捕获的严重问题。可见，丢弃异常这一坏习惯是如此常见，它甚至已经影响到了Java本身的设计。 

那么，应该怎样改正呢？主要有四个选择： 

1. 处理异常。针对该异常采取一些行动，例如修正问题、提醒某个人或进行其他一些处理，要根据具体的情形确定应该采取的动作。再次说明，调用printStackTrace算不上已经“处理好了异常”。 
2. 重新抛出异常。处理异常的代码在分析异常之后，认为自己不能处理它，重新抛出异常也不失为一种选择。 
3. 把该异常转换成另一种异常。大多数情况下，这是指把一个低级的异常转换成应用级的异常（其含义更容易被用户了解的异常）。 
4. 不要捕获异常。 

我们可以得出结论：

> 既然捕获了异常，就要对它进行适当的处理。不要捕获异常之后又把它丢弃，不予理睬。 

#### 反例之二：不指定具体的异常(代码：15行)

许多时候人们会被这样一种“美妙的”想法吸引：用一个catch语句捕获所有的异常。最常见的情形就是使用catch(Exception ex)语句。但实际上，在绝大多数情况下，这种做法不值得提倡。为什么呢？ 

要理解其原因，我们必须回顾一下catch语句的用途。catch语句表示我们预期会出现某种异常，而且希望能够处理该异常。异常类的作用就是告诉Java编译器我们想要处理的是哪一种异常。由于绝大多数异常都直接或间接从java.lang.Exception派生，catch(Exception ex)就相当于说我们想要处理几乎所有的异常。 

再来看看前面的代码例子。我们真正想要捕获的异常是什么呢？最明显的一个是SQLException，这是JDBC操作中常见的异常。另一个可能的异常是IOException，因为它要操作OutputStreamWriter。显然，在同一个catch块中处理这两种截然不同的异常是不合适的。如果用两个catch块分别捕获SQLException和IOException就要好多了。这就是说，catch语句应当尽量指定具体的异常类型，而不应该指定涵盖范围太广的Exception类。 

另一方面，除了这两个特定的异常，还有其他许多异常也可能出现。例如，如果由于某种原因，executeQuery返回了null，该怎么办？答案是让它们继续抛出，即不必捕获也不必处理。实际上，我们不能也不应该去捕获可能出现的所有异常，程序的其他地方还有捕获异常的机会??直至最后由JVM处理。 

我们可以得出结论：

> 在catch语句中尽可能指定具体的异常类型，必要时使用多个catch。不要试图处理所有可能出现的异常。 

#### 反例之三：占用资源不释放(代码：3行-14行) 

异常改变了程序正常的执行流程。这个道理虽然简单，却常常被人们忽视。如果程序用到了文件、Socket、JDBC连接之类的资源，即使遇到了异常，也要正确释放占用的资源。为此，Java提供了一个简化这类操作的关键词finally。 

finally是样好东西：不管是否出现了异常，Finally保证在try/catch/finally块结束之前，执行清理任务的代码总是有机会执行。遗憾的是有些人却不习惯使用finally。

当然，编写finally块应当多加小心，特别是要注意在finally块之内抛出的异常??这是执行清理任务的最后机会，尽量不要再有难以处理的错误。 

　我们可以得出结论：

> 保证所有资源都被正确释放。充分运用finally关键词。

#### 反例之四：不说明异常的详细信息(代码：3行-18行) 

仔细观察这段代码：如果循环内部出现了异常，会发生什么事情？我们可以得到足够的信息判断循环内部出错的原因吗？不能。我们只能知道当前正在处理的类发生了某种错误，但却不能获得任何信息判断导致当前错误的原因。 

printStackTrace的堆栈跟踪功能显示出程序运行到当前类的执行流程，但只提供了一些最基本的信息，未能说明实际导致错误的原因，同时也不易解读。 

因此，在出现异常时，最好能够提供一些文字信息，例如当前正在执行的类、方法和其他状态信息，包括以一种更适合阅读的方式整理和组织printStackTrace提供的信息。 

我们可以得出结论：

> 在异常处理模块中提供适量的错误原因信息，组织错误信息使其易于理解和阅读。 

#### 反例之五：过于庞大的try块(代码：3行-14行)

经常可以看到有人把大量的代码放入单个try块，实际上这不是好习惯。这种现象之所以常见，原因就在于有些人图省事，不愿花时间分析一大块代码中哪几行代码会抛出异常、异常的具体类型是什么。把大量的语句装入单个巨大的try块就象是出门旅游时把所有日常用品塞入一个大箱子，虽然东西是带上了，但要找出来可不容易。 

一些新手常常把大量的代码放入单个try块，然后再在catch语句中声明Exception，而不是分离各个可能出现异常的段落并分别捕获其异常。这种做法为分析程序抛出异常的原因带来了困难，因为一大段代码中有太多的地方可能抛出Exception。 

我们可以得出结论：

> 尽量减小try块的体积。 

#### 反例之六：输出数据不完整(代码：7行-11行) 

不完整的数据是Java程序的隐形杀手。仔细观察这段代码，考虑一下如果循环的中间抛出了异常，会发生什么事情。循环的执行当然是要被打断的，其次，catch块会执行??就这些，再也没有其他动作了。已经输出的数据怎么办？使用这些数据的人或设备将收到一份不完整的（因而也是错误的）数据，却得不到任何有关这份数据是否完整的提示。对于有些系统来说，数据不完整可能比系统停止运行带来更大的损失。 

较为理想的处置办法是向输出设备写一些信息，声明数据的不完整性；另一种可能有效的办法是，先缓冲要输出的数据，准备好全部数据之后再一次性输出。 

我们可以得出结论：

> 全面考虑可能出现的异常以及这些异常对执行流程的影响。 

---

经过上面的讨论，我们可以将代码修正了：

{% highlight java linenos %}
OutputStreamWriter out = ... 
java.sql.Connection conn = ... 
try {
	Statement stat = conn.createStatement(); 
	ResultSet rs = stat.executeQuery("select uid, name from user"); 
	while (rs.next()) { 
		out.println("ID：" + rs.getString("uid") + "，姓名: " + rs.getString("name")); 
	} 
} catch(SQLException sqlex) { 
	out.println("警告：数据不完整"); 
	throw new ApplicationException("读取数据时出现SQL错误", sqlex); 
} catch(IOException ioex) { 
	throw new ApplicationException("写入数据时出现IO错误", ioex); 
} finally { 
	if (conn != null) { 
		try { 
			conn.close(); 
		} catch(SQLException sqlex2){ 
			System.err(this.getClass().getName() + ".mymethod - 不能关闭数据库连接: " + sqlex2.toString()); 
		} 
	} 

	if (out != null) { 
		try { 
			out.close(); 
		} catch(IOException ioex2) { 
			System.err(this.getClass().getName() + ".mymethod - 不能关闭输出文件" + ioex2.toString()); 
		} 
	} 
}
{% endhighlight java %}

本文的结论不是放之四海皆准的教条，有时常识和经验才是最好的老师。如果你对自己的做法没有百分之百的信心，务必加上详细、全面的注释。另一方面，不要笑话这些错误，不妨问问你自己是否真地彻底摆脱了这些坏习惯。即使最有经验的程序员偶尔也会误入歧途，原因很简单，因为它们确确实实带来了“方便”。所有这些反例都可以看作Java编程世界的恶魔，它们美丽动人，无孔不入，时刻诱惑着你。也许有人会认为这些都属于鸡皮蒜毛的小事，不足挂齿，但请记住：勿以恶小而为之，勿以善小而不为。
