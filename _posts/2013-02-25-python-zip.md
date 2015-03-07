---
layout: post
title: python备份工具
categories: python
tags: python
---

《A Byte of Python》中第十一章讲解如何写一个简单的python备份工具。一共4个版本，然后又在最后提出了使用zipfile模块。趁着周末，看了一下zipfile的文档。下面是代码和一些笔记：

{% highlight python linenos %}
#!/usr/bin/python
#filename:zip_func.py

from __future__ import print_function
import os
import sys
import zipfile
import time

def zipit(src, des):
    filelist = []

    if os.path.isfile(src):
        filelist.append(src)
    else:
        for root, dirs, files in os.walk(src):
            for name in files:
                filelist.append(os.path.join(root, name))

    zf = zipfile.ZipFile(des, "w", zipfile.zlib.DEFLATED)
    for tar in filelist:
        arcname = tar[len(src) + 1:]
        zf.write(tar, arcname)

    zf.close()

def unzipit(src, des):
    if not os.path.exists(des):
        os.mkdir(des, 0777)

    zf = zipfile.ZipFile(src)
    for name in zf.namelist():
        name = name.replace('\\', '/')

    if name.endswith('/'):
        os.mkdir(os.path.join(des, name))
    else:
        ext_filename = os.path.join(des, name)
        ext_dir = os.path.dirname(ext_filename)
        if not os.path.exists(ext_dir):
            os.mkdir(ext_dir, 0777)

    outfile = open(ext_filename, "wb")
    outfile.write(zf.read(name))
    outfile.close()

if __name__ == '__main__':
    zipit(r'F:\src', r'F:\backup.zip')
    unzipit(r'F:\backup.zip', r'F:\des')
{% endhighlight python %}

因为很多函数都没怎么用过，都是临时查的 API。所以备忘一下：

* os.walk()返回一个三元组，分别为pwd，目录list，文件list
* zipfile.ZipFile()三个参数，分别为zip放置目录，模式，压缩格式
* zipfile.write()2个参数，第一个是要压缩的文件，第二个是压缩后的文件名（可自定义文件名）
* zipfile.close()必须在使用zipfile对象后调用close()方法
* os.path.*是路径方法的集合
* open()，可以简单搜索一下python的文件操作就可以了
* zipfile.read()，读取zip压缩包中的文件，文件列表可通过zipfile.namelist()获得
* if __name__ == '__main__'的含义就是模块调用与被调用的区别