---
layout: post
title: 遇到的一个 python问题
categories: python
tags: python
---

1.在敲《A byte of python》的代码时，有一个问题，下面是代码：

{% highlight python linenos %}
#!/usr/bin/python
#filename:continue.py

while True:
    s = input('enter something:')

    if s == 'quit':
        break
    if len(s) &lt; 3:
        print('too small')
        continue
    print('the lenght is :{0}'.format(len(s)))
{% endhighlight python %}

当我输入为：abcdef，提示说输入错误。

这是input和raw_input的区别。首先我们来认识一下input和raw_input的定义：

* The raw_input([prompt]) function reads one line from standard input and returns it as a string (removing the trailing newline)
* The input([prompt]) function is equivalent to raw_input, except that it assumes the input is a valid Python expression and returns the evaluated result to you
 

虽然无法输入abcdef，但是输入"abcdef"的时候，程序又会正常运行。网上说在python2.7以后取消了raw_input，所有的输入都用input。