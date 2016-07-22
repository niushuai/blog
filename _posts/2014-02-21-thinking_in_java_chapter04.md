---
layout: post
title: Java编程思想 - 第四章、控制执行流程
categories: Java
tags: Java编程思想
---

### 本章主题：

应该就是一些流程控制语法，看来又要狂奔几十页的节奏？！好吧，一共10页。

本章学到的一个亮点是标签，虽然和goto有类似的作用。但是在多层嵌套时使用，确实是一个很好的方法。

### 1. 逗号表达式

在JAVA中唯一用到**逗号操作符**的地方就是for循环的控制表达式了，注意：在参数列表中使用的逗号是**逗号分隔符**。for循环可以这样：
    
    for(int i = 1, j = i + 10; i < 5; ++i)

### 2. goto有害论和标签
 
Dijkstra曾经专门说过goto有害。其实，编程语言早就有goto了，它源于汇编语言：若条件A成立，则跳到这里；否则跳到那里。虽然goto仍然是JAVA的一个保留字，但是在语言中并没有使用它，相当于JAVA没有goto。但是，JAVA竟然“别出心裁”的创造出了**标签**这玩意儿：

> 标签是后面跟有冒号的标识符，比如```label1:```
	
在JAVA中，标签起作用的唯一地方刚好是在迭代语句前面。“刚好之前”的意思表明，在标签和迭代之间置入任何语句都不行。而在迭代之前设置标签的唯一理由是：我们希望在其中嵌套另一个迭代或者一个开关。因为break和continue通常只是中断当前循环，但若随同标签一起使用，它们就会中断循环，直接到达标签所在的地方（和goto的作用有区别吗？？？？？？真心理解不动啊= =!）

{% highlight java linenos %}
public class LabelFor {
	public static void main(String[] args) {
		int i = 0;
		outer:
		for (; true;) {
			inner:
			for (; i < 10; i++) {
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
}/*output:
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
{% endhighlight java linenos %}

规则总结了一下就是这样：
	
1. 一般的continue会退回最内层循环的开头，并继续执行
2. 带标签的continue会到达标签的位置，并重新进入紧接在那个标签后面的循环
3. 一般的break会中断并跳出当前循环
4. 带标签的break会中断并跳出标签所指的循环，也就是跳过这个标签后的整个循环
	
法则就是：

> 使用标签的唯一理由就是因为有循环嵌套存在，而且像从多层循环中break或者continue（就是跳过>=2层循环使用break和continue）
