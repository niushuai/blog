---
layout: post
title: JAVA序列化的坑
categories: Java
tags: 序列化
---

最近项目的一个地方需要修改，背景大概是这样的：

* 数据在hadoop中存储，格式为JSON
* 离线程序A将JSON解析为C类
* 将C类序列化后以Ojbect存入redis（redis存储格式二进制）
* 线上程序B从redis拿出Object，解序列化后类型转换为C，然后使用

但是我这边搞定后，另外一个同事负责的B程序却不能正常工作。于是一起找原因，通过log信息，定位到原来是B程序解析Object时候抛出了ClassNotFoundException。因为A程序和B程序使用了完全相同的C类，所以一定不是因为结构不一致造成的。。当时由于比较晚就回家了。。。回去之后重新翻了一下《head first java》关于序列化这一章，算是知道原因了。

JVM处理序列化的第一保障是：前后统一。所以，序列化时候要有一个seriaVersionId。关于这个seriaVersionId，在stackoverflow上有一个很好的解释：

> The serialization runtime associates with each serializable class a version number, called a serialVersionUID, which is used during deserialization to verify that the sender and receiver of a serialized object have loaded classes for that object that are compatible with respect to serialization. If the receiver has loaded a class for the object that has a different serialVersionUID than that of the corresponding sender's class, then deserialization will result in an InvalidClassException. A serializable class can declare its own serialVersionUID explicitly by declaring a field named "serialVersionUID" that must be static, final, and of type long:
> 
> ANY-ACCESS-MODIFIER static final long serialVersionUID = 42L;
> 
> If a serializable class does not explicitly declare a serialVersionUID, then the serialization runtime will calculate a default serialVersionUID value for that class based on various aspects of the class, as described in the Java(TM) Object Serialization Specification. However, it is strongly recommended that all serializable classes explicitly declare serialVersionUID values, since the default serialVersionUID computation is highly sensitive to class details that may vary depending on compiler implementations, and can thus result in unexpected InvalidClassExceptions during deserialization. Therefore, to guarantee a consistent serialVersionUID value across different java compiler implementations, a serializable class must declare an explicit serialVersionUID value. It is also strongly advised that explicit serialVersionUID declarations use the private modifier where possible, since such declarations apply only to the immediately declaring class--serialVersionUID fields are not useful as inherited members.

看完我们就知道SeriaVersionId是怎么回事了。说白了就是保证序列化前和序列化后结构相同。

但是比较蛋疼的一点竟然是：序列化时候的C类和解序列化的C类必须具有完全相同的目录结构。也就是说，A程序的C类在com.hello.src.a目录下，那么B程序的C类在com.world.src.b就是不行的。B程序也必须是com.hello.src.a目录才行。。。。这点我是百般不能理解，虽然问了组里一个很有经验的人，他说必须这样。但是我觉得这明显是不可能的。因为2个毫不相干的程序难道必须有相同的目录结构才能序列化/解序列化吗？

然后在stackoverflow上问了一下，一个repu很高的人告诉我这是一个rule. Observe it. 看来，这确实是一个规定，不能随便修改。

所以，这次的坑要记住：

* 序列化前后不仅要保持seriaVersionId相同，而且要保证这个类在不同的项目中保持相同的路径。
* 对于不需要序列化的属性（比如网络IO中，状态是运行时才有用的），那么可以使用transient修饰。这个不具体说了，有需求的自行google