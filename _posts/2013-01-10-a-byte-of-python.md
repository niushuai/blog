---
layout: post
title: 《A byte of Python》
categories: python
tags: python
---

### 前言

下面是看书过程中记录的一些python知识点，其中很大一部分是与C++不同的地方。因为习惯了C++，所以难免容易形成思维定势，于是把一些容易混淆的地方记下来，方便以后复习吧

### 学习笔记

1. python第一行通常是这样写的：`#!/usr/bin/python`，其中的#!告诉你的linux/unix系统当你执行你的程序时，它应该运行哪个解释器。
2. 如果运气够好，你的linux/unix系统中就是没有安装python，那么，第1条中的代码就失效了，这时 ，我们可以这样解决： 
    > `#!/usr/bin/env python`，env程序会反过来寻找会运行程序的 > python解释器。当然，如果你了解linux的话，可以搞一下PATH变量。 
3. help()括号中的东西分两种：函数、操作符，记住操作符需要用单引号括起来，比如：
    > `help (‘return’)`
4. python中有三种类型的数——整数、浮点数、复数
5. python默认的字符串编码方式为unicode 
6. python的单引号和双引号使用方法完全相同。而python独有的三引号可以表示一个多行的字符串（so cool），而且三引号当中可以嵌套单引号和双引号，不过要适可而止，防止自己被套晕- - 
7. 下面两个语句是不同的，可以运行一下看看：`print(‘hello\tworld!’)`、 `print(r’hello\tworld!’)`（r或R都行），其中r的意思是raw，生的，未处理的，从名字就知道python想干什么了。
8. 反码就是原码除符号位以外，其他位取反；正数的补码和原码相同，负数的补码是先求反码，然后加 一。由补码求原码可以对补码再求补码。 
9. python在if，elif，else这个选择模块中没有引入switch，这点我们应该思考一下它的原因。等我们学习了dict之后就知道了。 
10. while有else语句 
11. for的语法是：`for i in range(1, 5):`，range函数左闭右开。同样，for也有else语句。 
12. 非局部语句的含义很巧妙：由于在python中，任何事物都是可执行的代码，你可以在任何地方定义 函数。所以，非局部作用域在你**定义函数内的函数时**会看到。例子很经典： 
    
    ```
    def func_outer():
        x = 2
        print('x is', x)

        def func_inner():
            nonlocal x
            x = 5

        func_inner()
        print('changed local x to', x)
    func_outer()
    ```
13. 和c++一样，默认形参只可能是后面的参数，不可能是前面的，因为编译器对参数都是从左到右一一 对应的，C专家编程说这点是编译器的贪心原则，和a+++b一样，先执行尽可能多的操作符++，然后再执 行+运算。 
14. python独有的关键参数很好用，我们使用c++只能根据参数的定义顺序来进行参数传递，而python则可以使用名字（关键字）来给函数指定实参。这样做有2个优势： 
    * 不必担心参数的顺序，使用函数变得更加简单
    * 假设其他参数都有默认值，我们可以只给我们想要的那些参数赋值。 
15. python可以接受无限参数这个想法太cool了。比如： > `def total(initial = 5, _numbers, *_keywords):` 
16. 不是太明白python提出的keyword-only的作用。在stackoverflow上搜了搜:
    > a positional argument is a name that is not followed by an equal sign(=) and default value. > > a keyword-only argument is followed by an equal sign and an expression that gives its default value. 
17. docstrings的惯例是一个多行字符串，它的首行以大写字母开始，句号结尾。第二行是空行，从第 三行开始是详细的描述。输出docstrings请使用**doc**(双下划线)。
18. 导入一个模块相对来说是一个比较费时的事情，所以python做了一些优化，一种方法是创建按字节 编译的文件，这些文件以.pyc作为扩展名。我们第一次引入该模块时，python就利用py_compile将 module生成对应的.pyc文件，下次加载的时候就从.pyc加载，速度提高了很多。而且.pyc是与平台无关 的，你懂的。如果我们自己写了一个test.py文件，我们可以这样编译： > `import py_compile` > > `py_compile(r’DIR/target.py’)` 
19. 在python shell中输入`import this`就可以得到 the zon of python，python之禅，可以参考元创在豆瓣的翻译，帅呆了。 
20. python四大数据结构：list，tuple，dictionary，set。
21. python3和python2的print竟然都不一样，《a byte of python》书上的例子在python2.7版本中竟然都不能运行。。。。汗死了。最后在程序上引入了`from **future** import print_function`才能用print(item, end = ’ ‘)这个用法。 
22. python的元组含有0个或1个项目时，一个空的元组为：`myempty=()`，含有单个元素的元组就不那么简单了。如果含有一个元素，必须为：`onetuple = (1, )`，如果写为 `onetuple = (1)`，python就无法分辨到底是元组还是一个带圆括号的对象了。
23. python的list，tuple，dict都是序列，序列的定义不重要，重要的是序列是检索成员检验和索引操作符，索引操作符让我们可以直接从序列中抓取一个特定项目。 
24. python提出的切片操作挺炫的。最起码免去了for循环这一行吧。不过这肯定不是切片提出的本质， 等以后慢慢感悟。
25. 如果索引号是负数，代表从序列尾开始匹配。如果是切片操作符的话，必须在方括号中含有冒号， 左边代表起点，右边代表终点，第三个选择是附加的，代表步数。对了，切片操作符还是左闭右开的。 
26. python的深复制是通过切片操作来完成的，而C++是通过复制构造函数完成的。如果采用b = a这样 的形式，相当于C++的引用，只是指向了同一个对象，没有拷贝。 
27. python在文件操作中，有一个readline操作，我们读取一行时，python会读入’\n’，当我们print这一行时，就会产生2个换行（因为print默认输出换行），所以我们可以使用print(line,end = ”)这样就OK了。 
28. 如果在你读一个文件时，你如何保证当异常发生后文件被关闭？这就是python引入finally的原因。 只要和try对应起来，那么，程序总会执行finally语句，这样就能强制完成扫尾工作。 
29. 在C++中要返回一组数据可以使用结构体，而在python中则被元组代替，这样一来，很多东西都变得 非常简洁：典型的例子就是交换2个数。一行就可以搞定了。a, b = b, a。。。。 
30. python的timeit模块可以测试语句执行的时间，在我们测试性能的时候就可以用上了。比如我们测 试pythonic的swap方法和C++式的swap方法，就可以这样：

    ```
    from timeit import Timer
    Timer('t = a; a = b; b = t;', 'a = 1; b = 2;').timeit()
    Timer('a, b = b, a', 'a = 1; b = 2;').timeit()
    ```
31. python中的函数挺奇葩的。比如：

    ```
    def f(x):
        return x ** 2
    ```
意思是返回x的平方，如果把最后那个2改为3，就是返回x的三次方，以此类推。。这个**很好用哈。