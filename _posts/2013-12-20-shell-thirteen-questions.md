---
layout: post
title: 《shell 十三问》
categories: Linux
tags: shell十三问
---

<p>这是一个只有50页的小册子，在ChinaUnix论坛上看见的。它的作者网中人是鸟哥学习linux时的领路人，所以就打算认真学习一下，做个笔记：）看完之后收获很大，绝对的短小精悍~</p>

<hr />

<h4>1.为何叫shell？</h4>

<p>我们知道，计算机本质上来说是一个硬件，如果在硬件层面上操纵，将是非常专业的。后来推出了“操作系统”的概念，操作系统提供一个interface供普通用户和硬件打交道，这就是所谓的shell。</p>

<p>从技术角度来说，shell是使用者与系统的一个交互界面，主要让使用者通过命令行（command line）来使用硬件完成特定的功能。因此，shell最简单的定义就是<strong>命令解释器</strong>：</p>

<ul>
<li>将使用者的命令翻译给操作系统</li>
<li>操作系统将执行任务的结果翻译后返回给使用者</li>
</ul>

<p>比如，linux中可以看下/etc/shells查看本kernel可以使用的shell。当然，大部分linux系统都默认使用bash，因为它是自由软件，而且功能强大。</p>

<h4>2.shell prompt与carriage return（CR）的关系</h4>

<p>这个就是你当你登陆一个shell时会出现的东西，最左边就是shell prompt。shell prompt最后一个字符如果是$就是普通用户，如果是#就是root。之后不断闪烁的光标成为游标（coursor）。</p>

<p>所谓的命令行就是<strong>在shell prompt和CR字符之间的字符（注意：不是Enter键）</strong>，command line的一般形式为：</p>

<blockquote>
  <p>command_name option argument</p>
</blockquote>

<p>shell的核心功能就是：</p>

<blockquote>
  <p>根据IFS(Internal Field Seperator)将command line所输入的文字给拆解为字段（field），然后先处理特殊字符(meta),最后重组整个command line后执行。</p>
</blockquote>

<p>IFS是shell预设使用的字段分隔符，一般由：空格、tab、enter</p>

<h4>3.别人echo、你也echo，试问echo知多少？</h4>

<ul>
<li>echo是非常常用的命令，尤其对于环境变量的设置时。</li>
<li>当使用echo时，它会默认送出一个换行符，如果不想这样，可以使用echo -n。</li>
</ul>

<h4>4.双引号和单引号差在哪？</h4>

<p>首先我们需要知道，command line中的每一个character，都是如下两种之一：</p>

<ul>
<li>literal：普通纯文字，对shell来说没有特殊功能</li>
<li>meta：对shell来说，具有特定功能的特殊保留字符</li>
</ul>

<p>其中，literal没什么好说的，比如abc，1234这些都是literal，但是meta却让我们很头疼。在前面3条中，我们就使用到了IFS（3个中最常用空格）和CR（结束一个command line）两种meta。下面简单总结一下常见的meta：</p>

<ul>
<li>=：设置变量</li>
<li>$：作为一个变量</li>
<li>&lt;：重定向输入</li>
<li>>：重定向输出</li>
<li>|：管道命令</li>
<li>&amp;：后台运行</li>
<li>()：将括号内的命令置于nested subshell执行，或用于运算或者命令替换</li>
<li>{}：变量替换</li>
<li>;：结束一个命令后忽略返回值，直接执行;后面的命令</li>
<li>&amp;&amp;和||：逻辑运算符</li>
<li>!：执行history中的命令，这是一个小技巧</li>
</ul>

<p>上面是常见的meta，如果我们不想使用它们的默认功能，就需要使用quoting处理。在bash中，常用的quoting有3种：</p>

<ol>
<li>hard quote（'）：单引号，关闭所有的meta</li>
<li>soft quote（"）：双引号，大部分meta会关闭，少部分保留（比如$），但是保留的清单不是很清楚 - -</li>
<li>escape()：反转字符，紧跟在escape后的单一meta会关闭</li>
</ol>

<p>一个很经典的例子：</p>

<blockquote>
  <p>$ A=B\ C</p>
  
  <p>$ echo '"$A"'</p>
  
  <p>"$A"</p>
  
  <p>$ echo "'$A'"</p>
  
  <p>'B C'</p>
</blockquote>

<p>在使用中碰到的一些困惑终于在这里面看到了（不得不说，台湾人的治学态度也非常踏实，以后要学习了）。比如在awk或者sed中的命令参数调用之前设定的一些变量时，常常会出现很多问题。要解决这些问题，关键点是：</p>

<ul>
<li>区分shell meta和command meta</li>
</ul>

<p>这里用了awk的例子：awk '{pring $0}' 1.txt，如上所示，‘{’、‘ ’、‘}’都是shell meta，如果不用hard quote关闭，awk肯定无法正常工作，关闭后shell meta就会成为awk的meta，供awk工作所用。这就是问题的关键，以后碰到类似的问题就知道怎么办了。</p>

<h4>5.export是做神马的？</h4>

<p>第四条注重的是command line中的变量，这条我们学习一下bash变量的东东。所谓变量嘛，就是用一个特定的名称来存取一段可以变化的值。当然，变量的设置也是很严肃的（表笑！）：</p>

<ul>
<li>等号左右两边不能使用间隔符号（IFS），也应该避免使用shell的保留字符（meta character）</li>
<li>变量名称不能使用$符号</li>
<li>变量名称的第一个字符不能是数字</li>
<li>变量名称长度不能超过256字符</li>
<li>变量名称大小写敏感</li>
</ul>

<p>变量的扩充也是经常用到的（经典的PATH），若A=B:C:D，那你使用A=$A:E，则A会变成B:C:D:E，但是这不是标准的用法，严谨且不会出错的方法是：A=${A}:E。因为当A=BCD，你使用A=$AE，A不会扩充E，而是会继承$AE的值,就会发生错误。所以，要使用A=${A}E。</p>

<p>上面介绍了变量的基础知识，下面来讨论一下export神器吧：）</p>

<p>严格来说，我们在当前shell中所定义的变量，均属于“本地变量”，只有经过export命令的输出功能后，才能成为环境变量。当然，反过程就用unset取消。</p>

<ul>
<li>需要特别说明的一点是：unset A后，A就完全消失了（就像你从来没有创建过一样），而A= ，这只是把A设为null，而null和unset后是完全不一样的。这点谨记！</li>
</ul>

<h4>6.exec和source差在哪？</h4>

<p>记得刚学脚本时候曾经为了省事，把一个cd /a/b/c/d/e这样的东西放到a.sh中，然后sh a.sh后，发现目录并没有发生变化。但是使用source a.sh就变了，很是惊奇。现在明白了。我解释一下：</p>

<ol>
<li>所谓的shell script，本质就是command line的组合，就是把一条一条的command line放在一起，同时加上一些条件判断，让shell完成任务时更加聪明。而shell script执行时，不是在自身执行的，而是fork一个sub shell，然后在sub shell中执行后再返回到parent shell（即当前shell）。所以，上面那个例子就很好解释了。当前shell先产生一个sub shell，sub shell进入了/a/b/c/d/e目录后执行完毕返回，但是回到parent shell后，parent shell并没有受到任何影响。</li>
<li>然后再通俗说一下环境变量和本地变量。其实很简单，环境变量就是parent shell可以继承给sub shell的变量，而本地变量就是parent shell独有的，不会继承给sub shell的变量。</li>
<li>source就是让script在当前shell内执行，而不是产生一个sub shell来执行。所以，就可以完成我们想实现的功能了。</li>
<li>exec也是让shell script在同一个进程上运行，但是原来那个进程会被结束（意思就是原来进程虽然没有执行完毕，一旦进入exec的那个进程，原来进程就结束了，随着exec进程结束，这个shell script就正常结束）</li>
</ol>

<h4>7.()和{}差在哪？</h4>

<ul>
<li>()：将command group（很多命令的集合）置于sub shell中执行，也成为nested sub-shell</li>
<li>{}：将command group放在当前shell中进行，也称为non-named command group</li>
</ul>

<p>所以我们可以知道：若你所做的修改是暂时的，且不想影响原有或者以后的设定，那就使用nested sub shell，反之就使用non-named command group</p>

<h4>8.$(())与$()与${}差在哪？</h4>

<ul>
<li>${}是变量替换/增/删用的。</li>
<li>$()和``是用来先执行里面的命令的，推荐$()</li>
<li>$(())是进行<strong>整数运算</strong>的</li>
</ul>

<p>下面说下最常用的变量处理${}的常用用法吧：</p>

<p>file=/dir1/dir2/dir3/my.file.txt</p>

<p>我们可以用 ${ } 分别替换获得不同的值：</p>

<ul>
<li>${file#*/}：拿掉第一条 / 及其左边的字符串：dir1/dir2/dir3/my.file.txt</li>
<li>${file##*/}：拿掉最后一条 / 及其左边的字符串：my.file.txt</li>
<li>${file#*.}：拿掉第一个 .  及其左边的字符串：file.txt</li>
<li>${file##*.}：拿掉最后一个 .  及其左边的字符串：txt</li>
<li>${file%/*}：拿掉最后条 / 及其右边的字符串：/dir1/dir2/dir3</li>
<li>${file%%/*}：拿掉第一条 / 及其右边的字符串：(空值)</li>
<li>${file%.*}：拿掉最后一个 .  及其右边的字符串：/dir1/dir2/dir3/my.file</li>
<li>${file%%.*}：拿掉第一个 .  及其右边的字符串：/dir1/dir2/dir3/my</li>
<li>${file:0:5}：提取最左边的 5 个字节：/dir1</li>
<li>${file:5:5}：提取第 5 个字节右边的连续 5 个字节：/dir2</li>
<li>${file/dir/path}：将第一个 dir 提换为 path：/path1/dir2/dir3/my.file.txt</li>
<li>${file//dir/path}：将全部 dir 提换为 path：/path1/path2/path3/my.file.txt </li>
<li>${file-my.file.txt} ：假如 $file 没有设定，则使用 my.file.txt 作传回值。(空值及非空值时不作处理) </li>
<li>${file:-my.file.txt} ：假如 $file 没有设定或为空值，则使用 my.file.txt 作传回值。 (非空值时不作处理)</li>
<li>${file+my.file.txt} ：假如 $file 设为空值或非空值，均使用 my.file.txt 作传回值。(没设定时不作处理)</li>
<li>${file:+my.file.txt} ：若 $file 为非空值，则使用 my.file.txt 作传回值。 (没设定及空值时不作处理)</li>
<li>${file=my.file.txt} ：若 $file 没设定，则使用 my.file.txt 作传回值，同时将 $file 赋值为 my.file.txt 。 (空值及非空值时不作处理)</li>
<li>${file:=my.file.txt} ：若 $file 没设定或为空值，则使用 my.file.txt 作传回值，同时将 $file 赋值为 my.file.txt 。 (非空值时不作处理)</li>
<li>${file?my.file.txt} ：若 $file 没设定，则将 my.file.txt 输出至 STDERR。 (空值及非空值时不作处理)</li>
<li>${file:?my.file.txt} ：若 $file 没设定或为空值，则将 my.file.txt 输出至 STDERR。 (非空值时不作处理)</li>
<li>${#file} 可得到 27 ，因为 /dir1/dir2/dir3/my.file.txt 刚好是 27 个字节...</li>
</ul>

<p>记忆的方法为：</p>

<ul>
<li>#是去掉左边(在鉴盘上 # 在 $ 之左边)</li>
<li>%是去掉右边(在鉴盘上 % 在 $ 之右边)</li>
<li>单一符号是最小匹配﹔两个符号是最大匹配。</li>
</ul>

<p>tips:
以上的理解在于, 你一定要分清楚 unset 与 null 及 non-null 这三种赋值状态。一般而言, : 与 null 有关, 若不带 : 的话, null 不受影响, 若带 : 则连 null 也受影响。</p>

<h4>9.$@与$*差在哪？</h4>

<p>前面很多都是知道的，但是有一点需要注意：</p>

<ul>
<li>在command line输入的参数，$0是shell script的名字，后面以IFS分隔，当然要注意是否有soft quoting</li>
<li>在shell scripte中的function中，$0是shell script的名字，而不是函数名字，其他如上</li>
<li>$#：读入的参数个数（两个都能用）</li>
</ul>

<p>精确来说，$@和$*都表示全部参数，只有在soft quote中才有差别。举个例子：</p>

<blockquote>
  <p>如果在command line输入my.sh p1 "p2 p3" p4</p>
</blockquote>

<p>那么，</p>

<ul>
<li>$@：会得到"p1" "p2 p3" "p4"这三个不同的字段</li>
<li>$*：会得到"p1 p2 p3 p4"这一整串单一的词段</li>
</ul>

<h4>10.&amp;&amp; 与 || 差在哪？</h4>

<p>分为shell script和function的返回值，0代表真（运行正常结束），其他非0值（异常）</p>

<p>在shell脚本中常用到对变量的检测，这时可以使用test或者[ xxx ]，一般情况推荐使用后者，但是一定要注意[]的内部要有空格。但是稍微了解下test，它支持三种测试对象：</p>

<ul>
<li>string：字符串，也就是纯文字</li>
<li>integer：整数（不含负数和小数点）</li>
<li>file：文件</li>
</ul>

<p>然后&amp;&amp;和||都是经典的逻辑运算符，这里只需要记住shell脚本正常返回0，异常返回1就可以了。</p>

<h4>11.>与&lt;差在哪？</h4>

<p>这个就是最最常见的文件读入/输出了，主要看的就是没关注的方面。</p>

<ul>
<li>&lt;&lt;：这个是读到&lt;&lt;后的字符停止的意思，类似EOF的功能，代替了ctrl+d的功能，不过我是没用过。。。</li>
<li>原来>和&lt;前都应该有对应的数字，0是输入，1是输出，2是错误输出，但是因为0和1都是默认的，所以省略了，而一般2是不怎么用的。最常见的应该就是2>&amp;1了吧？</li>
<li>然后文中提到了写入顺序的问题，比如> out 2> out，处理方法是傻瓜式从头开始覆盖。解决方法如上，把2的东西并入1中，2>&amp;1，一般不用1>&amp;2。</li>
<li>set -o noclobber将不能覆盖已经存在的文件，取消这个限制就是set +o noclobber</li>
<li>如果上一条无法满足你的需求，你既要不取消又要临时写，那么可以使用">|"符号(连续的，不是管道命令)，前提是set -o noclobber,然后是echo "new" >| 1.txt</li>
<li>cat &lt; file > file后，file会变成空的。因为在IO Redirection中，stdout与stderr的管道会先准备好，才会从stdin读进资料。所以>file会先file清空，所以读入空文件肯定输出也是空了。</li>
<li>文中对于pipe line的描述特别舒服，pipe就像水管流水一样，一根对应一根，上一根的stdout流入下一根作为stdin，而stderr就像漏水的地方，如果你不导入到错误文件后，它肯定要回显到屏幕。</li>
</ul>

<p>然后又碰到一个问题：在cm1 | cm2 | cm3中，你需要把cm2的结果存起来，你可能会用：cm1 | cm2 > file | cm3,但是你会发现cm3的stdin是空的，因为你把cm2的水管接到了file这个水池。如果你用这个：cm1 | cm2 > file; cm3 &lt; file;但是<strong>file I/O会变双倍，在command的执行过程中，file I/O是最常见的性能杀手，凡是有经验的shell操纵者，都会尽量降低file I/O的使用频率。解决方法是使用tee：</strong>tee在不影响原本I/O的情况下，将stdout复制一份到指定的文件中。所以命令是cm1 | cm2 | tee file | cm3.OK完美解决！（如果想要追加，使用-a即可~）</p>

<h4>12.你要if还是case呢？</h4>

<p>这个是最常用的if和case用法，已经会了~</p>

<h4>13.for what？while与until差在哪？</h4>

<p>在shell中，常见的loop有三种：</p>

<ul>
<li>for：若没有in指定变量值清单，就会从$@或者$*中继承</li>
<li>while</li>
<li>until</li>
</ul>

<p>然后是几个小知识点，以前没有注意到，正好趁机会整理一下：</p>

<ul>
<li>在loop中":"代表的是null语句，但是它送回的是true（0）。所以当你没事干的时候，就可以用上:了</li>
<li>lt是小于，le小于等于，gt大于，ge大于等于</li>
<li>break是结束循环，return是结束函数，exit是结束脚本，continue是重新开始循环</li>
</ul>

<h4>14.[^]和[!]差在哪？（不是只有十三问吗！！）</h4>

<p>原来是讲特殊字符和RE的。这点其实到现在还是没完全搞懂。。。</p>

<ul>
<li>特殊字符属于command line的处理工序，作用于argument里的path之上。没错，它不用再command_name，也不用于option上。</li>
<li>RE表达式里的字符也是分为meta和literal两种的。而RE的meta和shell meta会有冲突，解决方法就是使用quoting了！你懂的。</li>
<li>特殊字符用于argument的path之上，但是RE只用于“字符串”处理的程序中，这与路径名称没有一点关系，RE所处理的字符串通常是指<strong>纯文档或透过stdin读进的内容</strong></li>
</ul>
