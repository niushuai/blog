---
layout: post
title: Vim 乱码原因及解决方法
categories: linux
tags: vim
---

乱码问题始终是程序员的噩梦，在使用VIM过程中，其实也遇到了很多次。每次都是谷歌一下，然后把别人解决方案中的设置粘贴到.vimrc[linux]或者_vimrc[windows]中，重新打开文件就会好了。但是，一直没有去研究一下VIM乱码的原因是什么。

然后今天在windows下使用GVIM打开一个文件时又悲剧了。感觉太操蛋了，于是花了1个小时研究了一下VIM乱码原因，然后发现：so easy。以后再遇到乱码，应该分分钟就可以秒杀了。

###一、编码方式

想解决编码问题，首先要搞清楚为什么有这么多编码方式。如果全世界都使用唯一的编码方式，不管什么东西都遵守这个规定。那么，乱码问题肯定不会出现。从这个问题出发其实还能发掘更多的疑问，比如为啥视频格式有那么多啊，音频格式有那么多啊，就连电子书的格式也分为epub/modi/txt/pdf等等。所以，这些个问题都给小白用户造成了极大的干扰。

既然是研究编码，其他问题就暂时不谈。不过，道理都一样。因为有不同的需求，所以就会出现多样化。美国只有26个英文字母，加上其他一堆符号神马的。人家一个ASCII码表就可以全部搞定。但是中文光汉字就接近10万个（当然，常用的大概有6000左右），所以，统一的编码基本上是行不通的，其他国家也有大有小。那么，有这么多的编码方式就不奇怪了。

所以，了解常用的编码方式还是必须的。[这篇文章](../encoding-introduction)会解决这个问题：）

###二、计算机编码

一般出现编码问题，第一步是先查看一下当前操作系统的编码是哪一种。

*   windows：开始-控制面板-时钟、语言和区域-区域和语言-管理-更改系统区域设置
*   windows：在cmd输入chcp
*   windows：在cmd输入systeminfo
*   linux：locale

一般情况下，都是这样的结果：

*   windows：简体中文，也就是gb2312或者gb18030
*   windows：输出936就是简体中文
*   windows：zh-ch，也相当于zh_CN，简体中文
*   linux：en_US.UTF-8，也就是utf8

然后我们就知道了，windows下的默认编码为gb2312，而在linux是utf8。所以，当我们在这两个系统查看文件时，文件的编码方式必须和系统编码一致，不然就会出现乱码。

###三、VIM编码

VIM关于编码的设置有4个：

*   encoding：VIM内部编码
*   fillencoding：文件本身的编码(用于告知VIM文件的编码)
*   fillencodings：VIM可处理的文件编码列表
*   termencoding：VIM用于显示的编码

VIM help中的详细描述：

####1. encoding：

> _Sets the character encoding used inside Vim.  It applies to text in the buffers, registers, Strings in expressions, text stored in the viminfo file, etc. ** It sets the kind of characters which Vim can work with**._ <span style="color: #ff0000;">Normally 'encoding' will be equal to your current locale.  This will be the default if Vim recognizes your environment settings.  If 'encoding' is not set to the current locale, 'termencoding' must be set to convert typed and displayed text.

####2. fillencoding：

> Sets the character encoding for the file of this buffer. When 'fileencoding' is different from 'encoding', conversion will be done when reading and writing the file. When 'fileencoding' is empty, the same value as 'encoding' will be used (no conversion when reading or writing a file). When reading a file 'fileencoding' will be set from 'fileencodings'

####3. fillencodings：

> This is a list of character encodings considered when starting to edit an existing file.  When a file is read, Vim tries to use the first mentioned character encoding.  If an error is detected, the next one in the list is tried.  When an encoding is found that works, 'fileencoding' is set to it.  If all fail, 'fileencoding' is set to an empty string, which means the value of 'encoding' is used.

####4. termencoding：

> Encoding used for the terminal.  <span style="color: #ff0000;">This specifies what character encoding the keyboard produces and the display will understand</span>.  For the GUI it only applies to the keyboard ('encoding' is used for the display). When empty, the same encoding is used as for the 'encoding' option. This is the normal value.

从官方描述，我们很容易知道它们各自的作用。我自己的理解是这样的：

####1. encoding：

> VIM内部工作使用的编码，不管文件本身的编码是什么，在VIM中全都转换为encoding来处理。

####2. fillencodings：

> VIM可以处理的文件编码列表，在这个列表中，VIM会按照对应的编码处理；不在这个列表中，就按照encoding编码来处理。比如，fillencodings只有gbk，那么，所有编码方式的文件都会被当成gbk来处理，很容易就出现乱码。<span style="color: #ff0000;">因此，我们在设置fillencodings的时候，一定要把要求严格的、当文件不是这个编码的时候更容易出现解码失败的编码方式放在前面，把宽松的编码方式放在后面。</span>

####3. fillencoding：

> 结合fillencodings使用。当VIM处理文件，会<span style="color: #ff0000;">依次</span>读取fillencodings列表，如果命中，就设置fillencoding为这种格式，并以这种编码来处理文件；如果没有命中，就按照encoding来处理文件

####4. termencoding：

> termencoding是 Vim 用于屏幕显示的编码，在显示的时候，Vim 会把内部编码(encoding)转换为屏幕编码(termencoding)后，再用于输出。内部编码中含有无法转换为屏幕编码的字符时，该字符会变成问号，但不会影响对它的编辑操作。如果termencoding没有设置，则直接使用<span style="font-family: Monaco, Consolas, 'Andale Mono', 'DejaVu Sans Mono', monospace; font-size: small;"><span style="line-height: 19px;">encoding，</span></span>不进行转换。比如：当你在 Windows 下通过 telnet 登录 Linux 工作站时，由于 Windows 的 telnet 是 GBK 编码的，而 Linux 下使用 UTF-8 编码，你在 telnet 下的 Vim 中就会乱码。此时有两种消除乱码的方式：一是把 Vim 的encoding改为gbk，另一种方法是保持encoding为utf8，把termencoding改为gbk，让 Vim 在显示的时候转码。显然，使用前一种方法时，如果遇到编辑的文件中含有 GBK 无法表示的字符时，这些字符就会丢失。但如果使用后一种方法，虽然由于终端所限，这些字符无法显示，但在编辑过程中这些字符是不会丢失的。

所以，我举一个例子来解释一下整个VIM的编码工作流程：

1.  你在linux下有一个big5编码的文件，你的操作系统使用的是utf8编码。当你用VIM打开这个文件时：
2.  VIM查看encoding，如果没有设置，就使用locale的utf8作为内部编码，如果设置为big5，就使用big5作为内部编码
3.  VIM读入文件时，从fillencodings依次查看是否有big5，如果有就设置fillencoding为big5，如果没有，就设置为空
4.  用户从终端输入hello，VIM查看termencoding，比如设置为gb2312，那么hello就从gb2312转为encoding格式的hello
5.  VIM处理完毕，退出时，将文件的内容从encoding转为fillencoding

只要上面的东西都清楚，VIM工作的原理是很容易弄明白的。

###四、VIM乱码解决方案

其实通过上面的讲解，我们已经知道乱码的病根了。大多数情况都是因为termencoding的问题。因为locale和encoding基本都是相等的（大多数情况哦）。所以处理起来也就是分分钟秒杀的事。整体3大步：

1.  操作系统的编码locale
2.  VIM内部编码encoding
3.  termencoding

操作系统是美国人，VIM是中国人，termencoding是翻译。美国人说了一句话，翻译把英语转换成汉语，中国人才知道美国人想干什么。所以，最最简单的方法就是将三者设置为相同的编码：

> `locale = encoding = termencoding`

只要你把这3个编码的格式都统一，保证手到乱码除 :-)
