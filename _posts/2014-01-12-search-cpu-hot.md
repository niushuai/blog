---
layout: post
title: 寻找最耗 Cpu 的 Java 程序
categories: Java
tags: jstack
---

周五时候，线上的机台机器突然CPU负载暴增，一度冲到了97%。于是组里开始排查，然后学到了如何快速定位最耗CPU的JAVA程序，在这里总结一下。


#### 基本原理：

> 使用top命令查看最耗cpu的进程和线程（子进程）。使用jstack把java线程堆栈给dump下来。然后，在堆栈信息中查找出对应的代码块。

* 第一步：使用top命令找出最耗CPU的进程号(top按P)
* 第二步：使用jstack dump对应PID的堆栈信息保存备查(就是使用jdk自带的工具)，格式为：xx/xx/jdk/bin/jstack PID > cpu.log
* 第三步：找出该JAVA进程中最耗CPU的线程号，使用top命令：top -p PID -H
* 第四步：我们看见的PID是十进制的，但是在cpu.log中，进程是十六进制的，所以转换一下。比如`printf "%x\n" 1234`
* 第五步：找到线程信息，进行定位

在cpu.log中寻找转换后的线程号对应的堆栈信息，就可以得到最耗CPU的程序信息了。
