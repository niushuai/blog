---
layout: post
title: 《鸟哥的 Linux 私房菜》
categories: Linux
tags: 鸟哥的Linux私房菜
---

##前言

下面是我在学习《鸟哥的 Linux 私房菜》过程中整理的学习笔记。但是其中有几章感觉平时没用到过，就偷懒跳过了，如果以后发现有学习的价值，就再来补上吧：）

下面是每章的目录，可以快速跳转哦~~~

<ul>
	<li><a href="#mark_h_1">第一章：linux是什么</a></li>
	<li><a href="#mark_h_2">第二章：linux如何学习</a></li>
	<li><a href="#mark_h_3">第三章：主机规划和磁盘分区</a></li>
	<li><a href="#mark_h_4">第四章：安装linux与多重引导小技巧</a></li>
	<li><a href="#mark_h_5">第五章：首次登录与在线求助man page</a></li>
	<li><a href="#mark_h_6">第六章：linux的文件权限与目录配置</a></li>
	<li><a href="#mark_h_7">第七章：linux文件与目录管理</a></li>
	<li><a href="#mark_h_8">第八章：linux磁盘与文件系统管理</a></li>
	<li><a href="#mark_h_9">第九章：文件与文件系统的压缩与打包</a></li>
	<li><a href="#mark_h_10">第十章：vim程序编辑器</a></li>
	<li><a href="#mark_h_11">第十一章：认识与学习bash</a></li>
	<li><a href="#mark_h_12">第十二章：正则表达式与文件格式化处理</a></li>
	<li><a href="#mark_h_13">第十三章：学习shell script</a></li>
	<li><a href="#mark_h_14">第十四章：linux账号管理</a></li>
	<li><a href="#mark_h_17">第十七章：程序管理与SELinux初探</a></li>
	<li><a href="#mark_h_22">第二十二章：软件安装：源码与tarball</a></li>
	<li><a href="#mark_h_23">第二十三章：软件安装：RPM/SRPM/YUM功能</a></li>
</ul>

下面我们就开始学习，gogogo！！！

--- 


<h1 id="mark_h_1">第一章：Linux是什么</h1>
<p><strong>1.Linux的由来</strong></p>

<p>Linux是什么？Linux是一个操作系统，它是计算机硬件上的第一层“外衣”，完成了对计算机硬件资源的抽象和控制功能。</p>

<p>确切的说，当时linus写出来的kernel仅仅是“驱动386上所有的硬件”而已 => 就是“让386的计算机硬件运行，并且等待用户输入指令来操纵硬件”。什么意思呢？我大概总结了一下：
<ol>
	<li>首先，通过各种线路将计算机的硬件组装成一个完整的个体</li>
	<li>然后通过操作系统完成2个任务：
	<ul>
	    <li>kernel完成对硬件的操纵</li>
	    <li>提供API，使应用程序可以通过这些API编写与硬件交互的软件</li>
	</ul>
	</li>
	<li>IT码农通过操作系统的系统调用API写出各种用户友好的软件</li>
	<li>小白用户使用电脑玩游戏、发邮件等等</li>
</ol>
</p>
<p> 操作系统由多种基础程序构成。它们使计算机可以与用户进行交流并接受指令，读取数据或将其写入硬盘、磁带或打印机，控制内存的使用，以及运行其它软件。操作系统最重要的组成部分是内核。在 GNU/Linux 系统中，Linux 就是内核组件。而该系统的其余部分主要是由 GNU 工程编写和提供的程序组成。因为单独的 Linux 内核并不能成为一个可以正常工作的操作系统，所以我们更倾向使用 “GNU/Linux” 一词来表达人们通常所说的 “Linux”。</p>

<p><strong>2.Linux的历史</strong></p>

<p>这个也算是学习一个东西的前提吧，俗话说“时势造英雄”，那么，Linux就是当时环境的一个产物。</p>

<p>反正就是为了实现一个大型主机可以同时供几百台终端同时使用的系统，很多牛逼机构如贝尔实验室、MIT（麻省理工学院）、GE（通用电器）打算把这个系统搞出来。但是由于技术、资金等问题，贝尔实验室还是退出了研究。</p>

<p>贝尔实验室的Ken Thompson从这个计划中得到了一点灵感，传说他比较喜欢一个“太空旅游”游戏，想移植到某个平台上，所以他琢磨着自己写一个系统玩玩，本来就是随便想想（工作忙，还得顾着一大家子），但恰逢妻子儿女去探亲，Ken Thompson有了一个月的空闲时间，于是经过4个星期的奋斗，他以汇编语言完成了内核程序、内核工具程序、文件系统的编写。</p>

<p>Unix有两大理念：</p>

<ul>
	<li>所有的程序和系统配置均是文件</li>
	<li>写程序的唯一目的就是有效的完成任务</li>
</ul>

<p>后来的事大家都知道了，因为这个系统太好使了，很多人都抢着用，于是Ken Thompson和同事把原来的汇编语言版本修改为自己写的C版本，于是：<strong>Unix</strong>和<strong>C语言</strong>两个无敌的东西就这样诞生了。</p>

<p>后来贝尔实验室和加州伯克利大学合作，伯克利大学的实验室将这个内核修改为适应自己机器的样子，同时增加了一些工具软件和编译程序，起名为BSD。随着发展，Bill Joy修改的BSD日渐完善，就成为一个独立的发行版。</p>

<p>但是问题出现了，因为UNIX具有高度可移植性和强大的性能，很多商业公司都开发了针对本公司机器的UNIX版本。因为没有统一的标准，所以，不同公司的UNIX版本无法再其他公司的机器上运行。所以才有了后面的故事。</p>

<p><strong>然后，高潮部分来了——GNU计划</strong></p>

<p>随着UNIX版本之间的排他性越来越强，统一的标准与共享就成为了一个大趋势。因为stallman在实验室使用的操作系统是Lisp，但这个是MIT的专利软件，无法共享，所以你做出什么修改，别人是不知道的。后来他接触到UNIX，发现虽然UNIX依旧是专利软件，但是它在理论和实践上都通用，所以他开始使用UNIX系统。同时，把自己编写的Lisp系统运行的程序移植到UNIX系统中，同时<strong>将移植到UNIX的程序源码公布。</strong>那么什么是GNU？GNU其实是GNU's not Unix的缩写，意思就是GNU不是Unix，那GNU是什么呢？GNU其实就是GNU's not Unix嘛！……其实你写过程序就知道，这是一个递归：）GNU的目的是创建一个自由、开放的UNIX操作系统（Free UNIX）。
当然，这个人同时也是一个技术大牛。他的作品你绝对知道：</p>

<ul>
	<li>Emacs</li>
	<li>GNU C（传说中的GCC）</li>
	<li>GNU C library（C函数库）</li>
	<li>bash shell</li>
</ul>

<p>光是这几个就足以光照千古了吧？</p>

<p>之后，Linus（Linux创始人）在BBS上宣称他用gcc和bash写了一个小小的核心文件，可以在Intel的386机器上运行，很多人都非常感兴趣。<strong>于是Linux传奇就这样拉开了帷幕</strong>。</p>

<p><strong>3.Linux的快速发展</strong></p>

<p>由于Linux是GNU计划的一个产物，所以符合自由软件的定义，由于全世界范围内的工程师纷纷加入Linux的开发和优化，Linux以火箭般的速度向前迈进，短短20年就已经相当成熟了。</p>

<p><strong>4.Linux的核心版本</strong></p>

<p>在Linux下的终端中输入uname -r就会出现当前所用Linux的核心版本。大致格式如下：</p>

<p>2.6.30-92.e15</p>

<p>主版本.次版本.释出版本-修改版本</p>

<p>含义如下：</p>

<ul>
	<li>主、次版本为奇数：发展中版本如2.5.XX，这种版本用于测试与发展新功能，只有一些工程师才会使用。他们在这个版本中测试加入的功能是否存在bug，然后测试通过以后加入稳定版本中。</li>
	<li>主、次版本为偶数：稳定版本如2.6.XX，这种版本主要是为普通用户提供的，系统具有良好的稳定性，不会出现漏洞，原因很简单：普通用户出现漏洞不像工程师那样有技术解决：）</li>
</ul>

<p><strong>5.Linux的distribution</strong></p>

<p>为了使用方便，很多商业公司将一整套的Linux组件组装起来，并加入本公司的特色产品，让用户可以傻瓜式安装。这个【Kernel+softwares+tools】的综合体就是Linux的distribution。常见的就是ubuntu，centos，fedora，redhat之类的。</p>

<p><strong>6.Linux和windows的差别在哪里？</strong></p>

<p>非计算机科班出身的人可能接触到Linux的不多，因为Linux推崇的工作方式是命令行操作，而windows主推的却是“即点即得”的图形化操作。正是由于这个差别，导致了很多争议。在我看来，2个系统都是划时代的杰作，只是因为工作人群的不同而选择了不同的方向而已。如果你让一个娱乐发烧友用Linux，他估计要砸机器了：），同理，你让一个大型主机用windows的图形界面，估计启动一次就得个把月了。所以，选择哪个系统不是绝对的，它们都是工具，我们人类应该占据主导权。是我们选择工具，不是工具选择我们。</p>

<p><strong>7.自由软件</strong></p>

<p>这个自由不是免费的意思，举一个简单的例子：你可以呼吸自由的空气，但是你不同畅饮免费的啤酒。
工程师费尽心机开发一个好用的软件是要花费很大的人力、物力、财力的，相对于windows动辄上千的费用，自由软件仅仅收取合适的价钱作为回报应该受到大家的认可哦：）</p>
</hr>

<h1 id="mark_h_2">第二章：linux如何学习</h1>
<p>很简单，抛弃windows，使用linux3个月以上。</p>
</hr>

<h1 id="mark_h_3">第三章：主机规划和磁盘分区</h1>
<p>这一章主要问题有以下几个：</p>

<ol>
	<li>磁盘组成</li>
	<li>第一扇区和磁盘分区表</li>
	<li>开机流程和主引导分区</li>
	<li>linux目录树、挂载</li>
</ol>

<h4>1、磁盘组成</h4>

<p>一个磁盘最重要的概念就是扇区和柱面。</p>

<ul>
	<li>扇区：512bytes(1bytes=8bit)，固定大小</li>
	<li>柱面：所有盘片上面的同一磁道组成</li>
</ul>

<p>我们知道，第一个扇区是磁盘的灵魂，如果一个磁盘的第一扇区挂了，那么，这个磁盘就算是报废了。</p>

<h4>2、第一扇区【重点】</h4>

<ul>
	<li>MBR(master boot record）：引导加载程序（446bytes）</li>
	<li>分区表（partition table）：（64bytes）</li>
	<li>2bytes的起始、终止位</li>
</ul>

<p>因为分区表分为四组记录区，每组记录了该区段的开始、截止柱面。所以，linux中只能有四个（主分区+扩展分区），同时，扩展分区最多只能有1个。</p>

<h4>磁盘分区表</h4>

<p>由一扇区的划分我们知道，磁盘分区表只有64bytes的大小。所以，最能只能支持4个分区。有：</p>

<ul>
	<li>主分区</li>
	<li>扩展分区</li>
	<li>逻辑分区</li>
</ul>

<p>主分区+扩展分区 &lt; =4，逻辑分区就是从扩展分区中划分的更小单元。</p>

<blockquote>
	<p>其实所谓的分区，就是针对第一扇区的64bytes的分区表进行设置而已。分区的最小单位为柱面。</p>
</blockquote>

<p>当然，如果你能思考一下为什么计算机需要分区就能更好的理解磁盘分区表的意义了。</p>

<h4>开机流程</h4>

<p>MBR和主引导扇区</p>

<ul>
	<li>主引导扇区是硬盘0号柱面，0号磁头的第一个扇区，大小为512字节。（注：硬盘可以用柱面、磁头和扇区定位）</li>
	<li>MBR，占用主引导扇区的前446字节，紧随其后的64字节是分区表DPT，最后还剩两个字节则恒为55AA，表示结束符号。（下图，演示了它们的位置关系）</li>
</ul>

<p>然后，具体说一说MBR和分区表。</p>

<ul>
	<li>MBR，全称为Master Boot Record，即硬盘的主引导分区块。MBR，共446字节，一般在操作系统安装时写入，但它并不属于操作系统。MBR就是内含引导加载程序，用于检测磁盘的分区合法性和加载操作系统，它的重要作用就是识别活动分区，并引导操作系统。</li>
	<li>分区表DPT，共64字节，记录了硬盘有多少分区以及分区的各种属性。由于一个分区的信息要占用16字节，所以分区表只能定义4个分区，这就是为什么我们说硬盘一般最多只能分为4个主分区（这里说“一般”是对基本磁盘而言，而对于动态磁盘则无此限制，但大部分都在使用基本磁盘，可以暂不考虑 ）。</li>
</ul>

<p>计算机启动需要注意的地方</p>

<ul>
	<li>计算机开机后BIOS加电自检，一切正常后，找到第一个启动设备（一般就是硬盘），然后从这个启动设备的主引导扇区读取MBR。MBR根据内含的引导加载程序识别活动分区，引导操作系统。</li>
	<li>mbr是硬盘的一个引导区，而grub是一个引导程序。在mbr中有一段空间需要编写引导程序，grub只是引导程序的一种。如果grub够小的话，直接写在mbr中，就可以引导操作系统了；如果grub太大，在只能写一部分在mbr了。如果装windows则硬盘中的grub程序就不能运行了，因为微软不愿兼容其它操作系统程序，所以如果先安装linux后安装windows，windows就会把MBR给覆盖掉。。。</li>
</ul>

<p>具体的开机启动流程</p>
<ol>
	<li>BIOS：开机主动执行的韧体（写入到硬件上的一个软件程序），寻找MBR</li>
	<li>MBR:找到引导加载程序boot loader</li>
	<li>boot loader:加载内核文件</li>
	<li>内核文件：开始使用操作系统的功能</li>
</ol>

<p>这里还有一个多重引导的概念，就是每个分区都有一个boot sector（引导扇区），里面可以有引导加载程序（前面讲过安装在MBR中）。这样，我们就可以通过boot loader提供的三个功能：
1. 提供菜单：用户可以选择不同的开机选项，是多重引导的重要功能。
2. 载入内核文件：这个是最基本的功能。
3. 转交其他loader：将引导加载功能转交给其他loader负责。</p>

<p>完成多重引导的功能了。具体可以看P73页的例子。大概意思就是MBR存放整个硬盘的所有boot sector，需要加载某个内核文件就让MBR去加载对应分区的boot sector完成加载内核文件。</p>

<h4>linux目录树</h4>

<p>这个没什么说的，就是linux独有的文件系统结构。熟悉就好了。重点在于挂载的概念。官方解释是：</p>

<blockquote>
	<p>挂载就是利用一个目录当成进入点，将磁盘分区的数据放置在该目录下。也就是说，进入该目录就可以读取该分区的数据的意思。</p>
</blockquote>

<p>我的理解就是：</p>

<blockquote>
	<p>硬盘分区是死的，linux的文件系统是目录树。如果你想使用linux，就要把硬盘的文件系统弄成目录树的格式才行。所以，我们把硬盘各个分区挂载到linux目录树对应的目录上，这样，我们使用目录本质上就是使用对应硬盘分区的空间了。</p>
</blockquote>
</hr>

<h1 id="mark_h_4">第四章：安装linux与多重引导小技巧</h1>
<p>这一章主要有2个问题：</p>

<ol>
	<li>实际安装linux时，应该怎样设置目录的挂载</li>
	<li>多重引导注意事项</li>
</ol>

<h4>各目录的挂载</h4>

<p>首先，现在多使用linux的ext3文件系统，比ext2文件系统增加了日志记录，这样当系统出现问题时，我们可以通过日志文件快速定位错误。</p>

<ul>
	<li>/:整个linux的根目录</li>
	<li>/boot:独立分区，务必让该分区在整块硬盘的最前面地方</li>
	<li>swap:经典的“虚拟内存”例子，内存较大时不需要，但一般设置为物理内存的1.5-2倍</li>
</ul>

<p>对于swap内存交换空间而言，它的功能为：</p>

<blockquote>
	<p>当有数据被存在物理内存里面，但是这些数据又不是常被CPU所取用时，那么这些不常被使用的程序就会被丢到硬盘的swap交换空间当中，而将速度较快的物理内存空间释放给真正需要的程序使用。所以，如果你的系统不是很忙，而内存又很大，自然不需要swap</p>
</blockquote>

<h4>多重引导</h4>

<p>这个分很多种情况，但是需要记住的一点是：</p>

<blockquote>
	<p>如果你需要装windows和linux，那么要先装windows，后装linux。因为，如果先装linux，再装windows时，windows会将MBR覆盖，这样就找不到linux了。而linux因为gurb可以读取linux根目录的/boot的开机菜单，就可以实现多重引导。</p>
</blockquote>

</hr>

<h1 id="mark_h_5">第五章：首次登录与在线求助man page</h1>
<p>这一章主要有3个问题：</p>

<ol>
	<li>X window与命令行模式</li>
	<li>如何查询一个命令/服务的使用[man重要]</li>
	<li>linux的关机和运行等级</li>
</ol>

<h4>X Window与命令行模式的切换</h4>

<p>在linux中，有X Window的窗口管理员环境，那么在这里面也有纯文本界面的环境。通常我们也称命令行模式为终端界面（terminal或console）。linux默认情况下会提供6个terminal来让用户登录，切换的方式为ctrl+alt+[f1-f6]的组合按钮。</p>

<ul>
	<li>ctrl+alt+[f1-f6]：文字界面登录tty1-tty6终端</li>
	<li>ctrl+alt+f7:图形界面桌面</li>
</ul>

<p>linux默认是以图形界面登录的，如果你想使用文字界面登录，那么编辑/etc/inittab就可以了。然后当你想再登录图形界面，输入startx就OK了。</p>

<h4>新命令/服务如何使用？</h4>

<ul>
	<li>man</li>
	<li>info</li>
	<li>/etc/share/doc</li>
	<li>google</li>
</ul>

<p>简单总结一下就是：</p>

<ul>
	<li>有任何你不知道的命令或文件格式，都可以使用man和info来查询</li>
	<li>如果你想要架设一些其他的服务，或想要利用一整套软件来达成某项功能时，到/usr/share/doc看看有没有改服务的说明文档（一般为设计文档，很正规的）</li>
</ul>

<p><strong>1. man的使用</strong></p>

<p>使用linux过程中，很重要的一一步就是学会使用man命令，可以说：man就是linux下各种命令的详细文档，那么，简单说一下man如何使用吧。</p>

<p>请你在ternimal中输入man date</p>

<p>然后最前面会出现一个DATA(1)的字样，里面有4个常用的数字我们需要知道：</p>

<ul>
	<li>1：用户在shell环境中可以操作的命令或可执行文件</li>
	<li>3：一些常用的函数与函数库，大部分为C的函数库</li>
	<li>5：配置文件或某些文件的格式</li>
	<li>8：系统管理员可用的管理命令</li>
</ul>

<p>另外有一点，我们如何找到man page读取的数据呢？（绝大多数都是本地的，所以肯定是从某个神秘的地方读取出来的数据，而且有格式）</p>

<blockquote>
	<p>一般放置在/usr/share/man这个目录下。</p>
</blockquote>

<p>同时我们要知道MANPATH这个系统变量，因为当我们自己写了一个脚本具有某些功能，我们写成了man文件，当别人安装后，如果MANPATH没有收录你脚本的安装后man文件所在的位置，那么man你的脚本就没有man page了。所以我们可以修改<strong>/etc/man.config（其他版本可能是/etc/man.conf或/etc/manpath.conf）</strong>即可。</p>

<p><strong>2. info的使用</strong></p>

<p>基本上，info与man的用途其实差不多，都是用来查询命令的用法或者是文件的格式。但是与man page一下子输出一堆信息不同的是，info page则是将文件数据拆成一个一个的段落，每个段落用自己的页面来撰写，并且在各个页面中还有类似网页的“超链接”来跳转到个不同的页面中，每个独立的页面也被称为一个节点（node)。所以，你可以将info page想成是命令行模式的网页显示数据。</p>

<p><strong>3. doc文档</strong></p>

<p>在学习某个服务时，我们可以看看/etc/share/doc下面有没有相关文档参考。这个和以上两个命令有类似的功能。都是查看某个命令的详细使用说明。</p>

<h4>linux的关机</h4>

<p>我们知道windows是单用户的操作系统，而linux则是多用户的操作系统。所以，我们在关机时，最好查看一下当前系统的状态，如：</p>

<ul>
	<li>who：目前谁在线</li>
	<li>netstat -a:查看网络的联机状态</li>
	<li>ps aux：查看当前所有用户的进程</li>
</ul>

<p>然后，接下来就是关机、重启命令了。有如下几个：</p>

<ul>
	<li>shutdown</li>
	<li>reboot</li>
	<li>halt</li>
	<li>poweroff</li>
</ul>

<p>具体使用man一下就OK了。</p>

<h4>linux的运行等级</h4>

<p>系统运作的模式，分为命令行界面(run level 3)及图形界面模式(run level 5)。其实，linux一共有7种执行等级。常用的有4个：</p>

<ul>
	<li>run level 0:关机</li>
	<li>run level 3:命令行模式</li>
	<li>run　level 5：图形界面模式</li>
	<li>run　level 6:重启</li>
</ul>

<p>那么，如何切换模式呢？我们需要用到init这个命令。比如要关机：init 0就可以了。</p>

</hr>
<h1 id="mark_h_6">第六章：linux的文件权限与目录配置</h1>
<p>linux最牛逼的地方就在于多用户、多任务环境。那么，当许多人是用同一个环境时，极可能出现多个人同时编辑一个文件的情况，为了避免影响，linux提出了文件权限的概念。</p>

<p>这一章主要讲述下面几个问题：</p>

<ol>
	<li>用户/用户组/其他人</li>
	<li>10个权限与如何增删查改【重点】</li>
	<li>权限对于文件/目录的作用</li>
	<li>文件种类</li>
	<li>linux目录结构【重点】</li>
</ol>

<h4>1、用户/用户组/其他人</h4>

<ul>
	<li>这个其实很简单，用户是一个人，可以是你，可以是别人</li>
	<li>用户组就类似一个团队，需要多人参与开发</li>
	<li>其他人就像非本团队的人，不会参与本团队的开发工作</li>
</ul>

<p>Notice：</p>

<blockquote>
	<p>其中，其他人有一个“god”，就是root。它具有所有权限，但是需要谨慎使用。</p>
</blockquote>

<p>linux用户/用户组信息的记录</p>

<blockquote>
	<p>默认情况下所有的系统上的账号与一般身份用户，还有那个root的相关信息，都是记录在/etc/passwd这个文件内。至于个人的密码则是记录在/etc/shadow这个文件下。此外，linux的所有组名都记录在/etc/group内。这3个文件可以说是linux系统里面账号、密码、用户组信息的集中地。不要随便删除这3个文件哦。</p>
</blockquote>

<h4>2、10个权限与如何增删查改</h4>

<p>首先在shell中敲一个ls -al，然后发现一行内容大概有9列内容，我们现在只关注第一列：</p>

<blockquote>
	<p>x xxx xxx xxx</p>
</blockquote>

<p>其中第一个为文件类型，第二个就是用户权限，第三个是本用户组的权限，第四个是非本用户组的权限。</p>

<ul>
	<li>r：数值为4，可读</li>
	<li>w：数值为2，可写</li>
	<li>x：数值为1，可执行</li>
	<li>-：数值为0，没有权限（可以在r,w,x任意位置）</li>
</ul>

<p>如何增删查改权限呢？</p>

<ul>
	<li>chmod：这个命令可以完成绝大多数的任务，有一个-R选项，迭代的意思。</li>
	<li>chown：改变所有者</li>
	<li>chgrp：改变用户组</li>
	<li>ls：查看文件属性</li>
</ul>

<p>其中，chmod算是最全能的。因为：</p>

<blockquote>
	<p>chmod [ugoa] [+-=] [rwx] [文件或目录]</p>
</blockquote>

<p>意思很简单,u是所有者，g是用户组，o是其他人，a是3个合起来；+加权限，-减权限，=赋值权限。</p>

<h4>3、权限对于文件/目录的作用</h4>

<p>这点算是非常容易忽略的一个问题。我刚学的时候就踩了这个大坑。。。。。。下面总结一下：</p>

<ul>
	<li>权限对文件的作用
	<ul>
	    <li>r：可读取此文件的内容</li>
	    <li>w：可以编辑、新增或者修改该文件的内容</li>
	    <li>x：具有可以被系统执行的权限</li>
	</ul></li>
	<li>权限对目录的作用
	<ul>
	    <li>r：读取目录结构的权限</li>
	    <li>w：更改该目录结构的权限。意思就是可以在该目录下新建文件或目录；删除该目录下的文件或目录；将该目录下的文件或目录重命名；转移该目录内的文件或目录；</li>
	    <li>x：进入该目录成为工作目录的权限</li>
	</ul></li>
</ul>

<p>可能你还是不太了解，简单的说：文件的权限是针对<strong>文件的内容</strong>；目录的权限是针对<strong>目录下的文件名</strong>。</p>

<p>举个例子：</p>

<blockquote>
	<p>假设我的账号是niushuai，用户组为guest。我的主文件夹下有个a文件，我对主文件夹目录具有rwx权限。而a的属性为-rwx------ root root。那么，我是其他人，权限为---，不能读、写、执行该文件的内容（文件对应内容），但是我有~的rwx，所以，我可以删除a，重命名a（目录对应文件名）。</p>
</blockquote>

<h4>4、文件种类</h4>

<ul>
	<li>-：普通文件</li>
	<li>d：目录</li>
	<li>l：连接文件</li>
	<li>b/c：设备文件，b为块设备（如硬盘），c为字符设备（如键盘）</li>
	<li>s：socket</li>
	<li>p：管道文件</li>
</ul>

<p>还有一点就是linux文件长度的限制</p>

<ul>
	<li>linux使用的ext3文件系统，对单一文件或目录的最大容许文件名为255个字符</li>
	<li>包含完整路径名称及目录的完整文件名为4096个字符</li>
</ul>

<h4>5、linux目录结构【重点】</h4>

<p>linux采用的是FHS（Filesystem Hierachy Standard）文件结构。具体可以参考官方文档。下面我就说说几个比较重要的目录及简单介绍。</p>

<p>与Windows将硬盘看做“C盘”、“D盘”几个独立的分区不同，Linux将整个文件系统看做一棵树，这棵树的树根叫做根文件系统，用<b>/</b>表示。各个分区通过“挂载”（Mount）以文件夹的形式访问。
</p>

<p>Linux的目录结构确实比较复杂，但设置合理、层次鲜明。以FHS 2.3为例进行介绍。</p>

<h2>目录</h2>

<ol>
	<li>根文件系统</li>
	<li>/usr目录结构</li>
	<li>/var目录结构</li>
</ol>

<h3>根文件系统</h3>

<dl><dt>/bin</dt><dd>这一目录中存放了供所有用户使用的完成基本维护任务的命令。其中bin是binary的缩写，表示二进制文件，通常为可执行文件。一些常用的系统命令，如cp、ls等保存在该目录中。
	</dd><dt>/boot</dt><dd>这里存放的是启动Linux时使用的一些核心文件。如操作系统内核、引导程序Grub等。
	</dd><dt>/dev</dt><dd>在此目录中包含所有的系统设备文件。从此目录可以访问各种系统设备。如CD-ROM，磁盘驱动器，调制解调器和内存等。在该目录中还包含有各种实用功能，如用于创建设备文件的MAKEDEV。
	</dd><dt>/etc</dt><dd>该目录中包含系统和应用软件的配置文件。
	</dd><dt>/etc/passwd</dt><dd>该目录中包含了系统中的用户描述信息，每行记录一个用户的信息。
</dd></dl>

<dl><dt>/home</dt><dd>存储普通用户的个人文件。每个用户的主目录均在<i>/home</i>下以自己的用户名命名。
</dd></dl>

<dl><dt>/lib</dt><dd>这个目录里存放着系统最基本的共享链接库和内核模块。共享链接库在功能上类似于Windows里的.dll文件。
	</dd><dt>/lib64</dt><dd>64位系统有这个文件夹，64位程序的库。
</dd></dl>

<dl><dt>/lost+found</dt><dd>这并不是Linux目录结构的组成部分，而是ext3文件系统用于保存丢失文件的地方。不恰当的关机操作和磁盘错误均会导致文件丢失，这意味着这些被标注为“在使用”，但却并未列于磁盘上的数据结构上。正常情况下，引导进程会运行fsck程序，该程序能发现这些文件。除了“/”分区上的这个目录外，在每个分区上均有一个lost+found目录。
</dd></dl>

<dl><dt>/media</dt><dd>可移动设备的挂载点，当前的操作系统通常会把U盘等设备自动挂载到该文件夹下。
	</dd><dt>/mnt</dt><dd>临时用于挂载文件系统的地方。一般情况下这个目录是空的，而在我们将要挂载分区时在这个目录下建立目录，再将我们将要访问的设备挂载在这个目录上，这样我们就可访问文件了。（注意在GNOME中，只有挂载到<i>/media</i>的文件夹才会显示在“计算机”中，挂载到<i>/mnt</i>不会做为特殊设备显示）
</dd></dl>

<dl><dt>/opt</dt><dd>多数第三方软件默认安装到此位置，如Adobe Reader、google-earth等。并不是每个系统都会创建这个目录。
</dd></dl>

<dl><dt>/proc</dt><dd>它是存在于内存中的虚拟文件系统。里面保存了内核和进程的状态信息。多为文本文件，可以直接查看。如<i>/proc/cpuinfo</i>保存了有关CPU的信息。
</dd></dl>

<dl><dt>/root</dt><dd>这是根用户的主目录。与保留给个人用户的<i>/home</i>下的目录很相似，该目录中还包含仅与根用户有关的条目。
</dd></dl>

<dl><dt>/sbin</dt><dd>供超级用户使用的可执行文件，里面多是系统管理命令，如fsck, reboot, shutdown, ifconfig等。
</dd></dl>

<dl><dt>/tmp</dt><dd>该目录用以保存临时文件。该目录具有Sticky特殊权限，所有用户都可以在这个目录中创建、编辑文件。但只有文件拥有者才能删除文件。为了加快临时文件的访问速度，有的实现把<i>/tmp</i>放在内存中。
</dd></dl>

<dl><dt>/usr</dt><dd>静态的用户级应用程序等，见下。
</dd></dl>

<dl><dt>/var</dt><dd>动态的程序数据等，见下文。
</dd></dl>

<h3>/usr目录结构</h3>

<p><i>/usr</i>通常是一个庞大的文件夹，其下的目录结构与根目录相似，但根目录中的文件多是系统级的文件，而<i>/usr</i>中是用户级的文件，一般与具体的系统无关。
</p>

<p><b>提示：</b></font></p>

<blockquote>
<p>usr最早是user的缩写，<i>/usr</i>的作用与现在的<i>/home</i>相同。而目前其通常被认为是 User System Resources 的缩写，其中通常是用户级的软件等，与存放系统级文件的根目录形成对比。</p>
</blockquote>

<p>应注意，程序的配置文件、动态的数据文件等都不会存放到<i>/usr</i>，所以除了安装、卸载软件外，一般无需修改<i>/usr</i>中的内容。说在系统正常运行时，<i>/usr</i>甚至可以被只读挂载。由于这一特性，<i>/usr</i>常被划分在单独的分区，甚至有时多台计算机可以共享一个<i>/usr</i>。
</p>

<dl><dt>/usr/bin</dt><dd>多数日常应用程序存放的位置。如果<i>/usr</i>被放在单独的分区中，Linux的单用户模式不能访问<i>/usr/bin</i>，所以对系统至关重要的程序不应放在此文件夹中。
</dd></dl>

<dl><dt>/usr/include</dt><dd>存放C/C++头文件的目录
</dd></dl>

<dl><dt>/usr/lib</dt><dd>系统的库文件
</dd></dl>

<dl><dt>/usr/local</dt><dd>新装的系统中这个文件夹是空的，可以用于存放个人安装的软件。安装了本地软件的<i>/usr/local</i>里的目录结构与<i>/usr</i>相似
</dd></dl>

<dl><dt>/usr/sbin</dt><dd>在单用户模式中不用的系统管理程序，如apache2等。
</dd></dl>

<dl><dt>/usr/share</dt><dd>与架构无关的数据。多数软件安装在此。
</dd></dl>

<dl><dt>/usr/X11R6</dt><dd>该目录用于保存运行X-Window所需的所有文件。该目录中还包含用于运行GUI要的配置文件和二进制文件。
</dd><dt>/usr/src</dt><dd>源代码
</dd></dl>

<h3>/var目录结构</h3>

<p><i>/var</i>中包括了一些数据文件，如系统日志等。<i>/var</i>的存放使得<i>/usr</i>被只读挂载成为可能。
</p>

<dl>
<dt>/var/cache</dt><dd>应用程序的缓存文件
</dd><dt>/var/lib</dt><dd>应用程序的信息、数据。如数据库的数据等都存放在此文件夹。
</dd><dt>/var/local</dt><dd><i>/usr/local</i>中程序的信息、数据
</dd><dt>/var/lock</dt><dd> 锁文件
</dd><dt>/var/log</dt><dd> 日志文件
</dd><dt>/var/opt</dt><dd> <i>/opt</i>中程序的信息、数据
</dd><dt>/var/run</dt><dd>正在执行着的程序的信息，如PID文件应存放于此
</dd><dt>/var/spool</dt><dd>存放程序的假脱机数据（即spool data）
</dd><dt>/var/tmp</dt><dd>临时文件</dd>
</dl>

</hr>
<h1 id="mark_h_7">第七章：linux文件与目录管理</h1>
<p>这一章主要讲文件与目录管理，重点有几个：</p>

<ol>
<li>cp命令</li>
<li>软连接和硬连接</li>
<li>linux文件的三个时间</li>
<li>文件与目录默认属性</li>
<li>文件与目录的隐藏属性</li>
<li>文件特殊权限</li>
<li>命令与脚本的查询【重要】</li>
<li>权限与命令间的关系</li>
</ol>

<h4>1、cp命令</h4>

<p>在windows下，因为是单用户系统，所以复制文件没有一点问题。但是linux是多用户系统，况且还有权限的设置，所以在多人用同一个文件时，权限设置问题就会比较棘手。先了解一下cp的几个常用选项：</p>

<ul>
<li>cp -a:相当于cp -dpr三个选项的合集</li>
<li>cp -d:如果源文件为连接文件的属性，则复制连接文件属性而不是文件本身</li>
<li>cp -i:若目标文件存在，则询问是否覆盖</li>
<li>cp -p:复制文件的属性，而非使用默认属性（默认所有者变为命令执行者）</li>
<li>cp -r:递归，用于目录的复制</li>
</ul>

<p>Notice：</p>

<blockquote>
<p>一般来说，如果需要复制别人的数据【前提是你<strong>必须拥有r权限</strong>（想想为什么？->如果没有r权限，你复制过来默认所有者就是命令执行者本身(你)，你就可以查看此文件了）】所以，在默认条件下，cp的源文件和目的文件的权限是不同的，目的文件的所有者通常会是<strong>命令操作者本身</strong>。</p>

<p>由于这个特性，当我们进行备份时，某些需要特别注意的特殊权限文件（s和t属性），例如/etc/shadow中的s特殊属性，或者一些配置文件，就不能用cp来复制，必须加上-a或者-p选项。另外，你想把数据复制给其他的用户，也需要考虑权限问题。要不然别人虽然拥有文件，但却不能进行任何操作。</p>

<p>还有一点需要注意：由于普通用户不能随便改变文件的所有者和用户组，因此虽然能够使用-a选项复制某文件的相关权限，但是与所有者和用户组相关的，普通用户无法进行的操作，即使加上-a也无法完整复制。比如root建了一个文件，非用户组权限为r，如果你使用-a能复制过来，并且变成所有者，那就违背了root建立文件的权限设置，就出bug了。</p>
</blockquote>

<h4>2、软连接和硬连接</h4>
<p>参考第八章inode的讲解->[理解inode](http://www.ruanyifeng.com/blog/2011/12/inode.html)</p>
<h4>3、linux文件的三个时间</h4>

<ul>
<li>ctime：status time，当<strong>文件的属性改变</strong>时，ctime会更新</li>
<li>atime：access time，文件的内容被取用时（比如用cat读），atime会更新</li>
<li>mtime：modify time，文件的内容数据被修改时，mtime会更新</li>
</ul>

<p>touch可以修改这三个time，而且还可以创建新文件。</p>

<h4>4、文件与目录默认属性</h4>

<p>这点在安全方面比较重要。一般情况下：</p>

<ul>
<li>root：umask为002</li>
<li>普通用户：umask为022</li>
</ul>

<p>然后，</p>

<ul>
<li>创建一个新目录时，默认权限为777</li>
<li>创建一个新文件时，默认权限为666</li>
</ul>

<p>所以，在普通用户情况下【root和普通用户umask不同，注意！】</p>

<ul>
<li>创建一个新目录时，最终权限为drwxrwxrwx减去本用户组的w和非本用户组的w，所以为drwxr-xr-x</li>
<li>创建一个新文件时，最终权限为-rw-rw-rw-减去本用户组的w和非本用户组的w，所以为-rw-r--r--</li>
</ul>

<p>在root情况下</p>

<ul>
<li>创建一个新目录时，最终权限为drwxrwxrwx减去非本用户组的w,所以为drwxrwxr-x</li>
<li>创建一个新文件时，最终权限为-rw-rw-rw-减去非本用户组的w，所以为-rw-rw-r--</li>
</ul>

<p>Notice:</p>

<blockquote>
<p>不能使用文件默认属性666与目录默认属性777来与umask进行相减的运算，比如umask为3的时候，创建一个新文件默认权限为666，相减则为663，即是-rw-rw--wx，而原来文件就已经去除x的默认属性了，怎么可能会再出来呢？所以，不能这样计算。</p>
</blockquote>

<h4>5、文件与目录的隐藏属性</h4>

<p>如果你细心点，会发现umask为4个数字，而后三个分别对应所有者、用户组、非本用户组。那么，第一个就是文件/目录的隐藏属性的设置了。</p>

<blockquote>
<p>隐藏属性对系统有很大的帮助，尤其是在系统安全上面，很关键。不过要先强调的是，下面的chattr命令<strong>只能用在ext2/ext3文件系统</strong>，其他的文件系统部支持。</p>
</blockquote>

<p>命令的用法为：</p>

<blockquote>
<p>chattr [+-=] [ai] 文件/目录</p>
</blockquote>

<ul>
<li>a:文件只能增加数据，不能删除也不能修改数据，只有root能设置这个属性</li>
<li>i:设置后，文件不能删除、改名，设置连接也不能写入或添加数据，root才能设置</li>
</ul>

<p>这点我想比较重要的就是用在log文件或者数据库文件，比如一个公司的财务报表文件，a就很合适；而i应该多用于系统的重要配置文件上，修改了系统可能就挂了。</p>

<h4>6、文件特殊权限</h4>

<p>在命令行输入下面命令：</p>

<blockquote>
<p>ls -ld /tmp; ls -l /usr/bin/passwd</p>
</blockquote>

<p>输出为：</p>

<ul>
<li>drwxrwxrwt  5 root root 4096 Jul 20 10:00 /tmp</li>
<li>-r-s--x--x  1 root root 18840 Mar  7 18:06 /usr/bin/passwd</li>
</ul>

<p>不是只有rwx吗？那个s和t是什么东东？对于s和t，我们分别说明。</p>

<p>s：</p>

<blockquote>
<p>niushuai需要修改密码，我使用passwd 123命令，我们用type passwd发现passwd是/usr/bin下的一个二进制文件（可执行），所有者为root，对/etc/shadow进行操作。但是/etc/shadow对非本用户组是---权限.那么，niushuai怎么修改/etc/shadow文件呢？（/etc/shadow记录所有用户的密码）。这就是s的用途。当文件的所有者(/etc/shadow为root)x权限位置为s时，就能使命令使用者（niushuai）暂时获得此<strong>二进制文件</strong>的创建者身份（root），就可作为root对/etc/shadow进行修改了。【不可用于目录，因为目录不会执行吧。。。】</p>

<p>进一步而言，如果s的权限是在用户组，那么就是Set GID，简称为SGID。SGID可以用在两个方面。</p>

<ul>
	<li>文件：如果SGID设置在二进制文件上，则不论用户是谁，在执行该程序的时候，它的有效用户组（effective group）将会变成该程序的用户组所有者（group id）。</li>
	<li>目录：如果SGID是设置在A目录上，则在该A目录内所建立的文件或目录的用户组，将会是此A目录的用户组。</li>
</ul>

<p>一般来说，SGID多用在特定的多人团队的项目开发上，在系统中用得较少。</p>
</blockquote>

<p>t：</p>

<blockquote>
<p>举个例子吧，一个目录，有这么一个权限:drwxrw-rw-,那么，当我是这个用户组的成员，你也是。
那就会出现这种情况，你嫉妒我，把我建立的目录啊，文件啊。都给我删了，或者重命名。这就会有很大的问题。为了限制这种情况的发生，有一种特殊的文件权限叫Sticky Bit 。它的作用是，当一个目录有Sticky Bit权限时，则<strong>只有root和自己</strong>能有权限对自己设的目录进行<strong>删除或更改</strong>。别人，哪怕是同组的人都不行。但是别人可以看到。。</p>
</blockquote>

<p>那么这几个权限要怎么设置呢？</p>

<blockquote>
<p>就是4个数字的权限设定就OK了。。也就是说chmod的时候为4个数字，例如：chmod 4755 filename。这个第一个数字就是表示设置的特殊权限。</p>
</blockquote>

<p>对应如下：</p>

<p>4为SUID，2为SGID，1为Sticky Bit</p>

<p>但是要注意这样一种情况，会出现大写的S和T。那就是当自己还没有可执行权限的时候，却设置了SUID，
那么大S和大T表示就是空。也就是说其实我都不能执行，别人还想有执行的权限？别逗了。</p>

<h4>7、命令与脚本的查询【重要】</h4>

<p>这一块结合正则表达式有一定的难度，所以要多练习才能掌握吧。常用4个：</p>

<ul>
<li>which：脚本文件名的查询，寻找“执行文件”（仅在<strong>$PATH</strong>中查找！）</li>
<li>whereis：文件名查找</li>
<li>locate：文件名查找，和whereis一样，查找来源为/var/lib/mlocate/数据库</li>
<li>find：硬盘查找，强大但是速度慢(没有数据库，即查即遍历)</li>
</ul>

<h4>8、权限与命令间的关系</h4>

<p>只要把前面的权限问题理解透了，就会非常容易。简单列举一下：</p>

<ul>
<li>让用户能进入某个目录成为工作目录基本权限为x，没有r的话不能查阅文件名</li>
<li>让用户在某个目录读取一个文件的基本权限为：目录x，文件r</li>
<li>让用户修改一个文件的基本权限为：目录x，文件rw(不能少r，不能读出来内容怎么修改呢？)</li>
<li>让一个用户可以创建一个文件的基本权限为：目录xw</li>
<li>让一个用户进入某目录病执行该目录下的某个命令基本权限为：目录x，文件x</li>
</ul>

<h4>知识点</h4>

<ol>
<li>一般建议在写shell script或者config文件时，最好使用绝对路径。因为linux是多用户系统，一旦别人放到别的路径下，相对路径就会失效。</li>
<li>每个用户都有PATH变量，一般来说，root和普通用户的差别就是/sbin路径的不同。但是通过绝对路径，普通用户也可以使用/sbin下的命令，比如ifconfig eth0这个命令普通用户无法使用，但是我们可以用/sbin/ifconfig eth0来使用</li>
<li>文件查看，多用cat，more，less，tail。在查看系统日志记录时，常用tail -f log.file命令。</li>
<li>type作用是指出一个命令是bash内部命令，还是bash外的命令，如果是外部命令，还会指出其可执行文件所在路径。而如果想知道某个文件的基本数据是输入ASCII或者是data文件，或者是binary，有没有使用到动态函数库，就可以用file查看。</li>
<li><strong>执行updatedb会根据/etc/updatedb.conf的设置去查找系统硬盘内的文件名，并更新/var/lib/mlocate内的数据库文件，供whereis和locate使用。</strong></li>
</ol>

</hr>
<h1 id="mark_h_8">第八章：linux磁盘与文件系统管理</h1>
<p>这一章主要有3个内容：</p>

<ol>
<li>硬盘的物理构造</li>
<li>linux的文件系统</li>
<li>硬盘的基本命令</li>
</ol>

<h4>1、硬盘的物理构造</h4>

<p>对一块硬盘来说，主要由圆形的盘片、机械手臂与刺头、主轴马达几部分组成。而它们的功能都在于读取硬盘上的数据，所以，一个硬盘最重要的是CHS：</p>

<ul>
<li>Cylinder（柱面）</li>
<li>Head（磁头）</li>
<li>Sector（扇区）</li>
</ul>

<p>首先有几个概念需要搞清楚：</p>

<ul>
<li>扇区：最小的物理存储单位，大小为512bytes（字节，非bit位。1byte=8bits），<strong>扇区指的是一条线</strong>，而<strong>不是</strong>一个扇形区域。所以，把扇区组成一个圆，就是柱面了。</li>
<li>磁道：盘片表面上以盘片中心为圆心，不同半径的同心圆称为磁道</li>
<li>柱面：硬盘通常由重叠的一组盘片构成，每个盘面都被划分为数目相等的磁道，并从外缘的“0”开始编号，具有相同编号的磁道形成一个圆柱，称之为磁盘的柱面。</li>
</ul>

<p>然后，我们可以知道：</p>

<ul>
<li>硬盘的磁道数=柱面数</li>
<li>每个盘面都需要一个刺头读取数据，所以盘面数=磁头数</li>
<li>硬盘的容量=扇区数目x扇区大小（512bytes）x柱面数x磁头数</li>
</ul>

<h4>2、linux的文件系统</h4>

<p>首先介绍一下linux中的基本单位：</p>

<ul>
<li>super block：记录此文件系统的整体信息，包括inode/block的总量、使用量、剩余量，以及文件系统的格式与相关信息等。</li>
<li>inode：记录文件的属性，一个文件占用一个inode，同时记录此文件的数据所在的block号码</li>
<li>block：实际记录文件的内容，若文件太大时，会占用多个block</li>
</ul>

<p>关于inode有一篇好文章：<a href="http://www.ruanyifeng.com/blog/2011/12/inode.html">理解inode</a></p>

<p>下图就是ext2文件系统的示意图：</p>

<p><img src="http://www.thinkingbar.com:2222/CMD_FILE_MANAGER/domains/thinkingbar.com/public_html/book/image/ext2_filesystem.jpg" alt="alt text" /></p>

<p>我们可以看到一个block group含有6大部分：</p>

<ul>
<li>data block：存放文件内容，大小为1KB,2KB,4KB,格式化文件系统就确定了</li>
<li>inode table：主要记录文件的属性以及该文件实际数据存在的block号码</li>
<li>super block：记录整个文件系统相关信息的地方</li>
<li>file system description：描述每个block group内superblock的开始与结束的block号码，以及说明每个区段(super block,bitmap,inodebitmap,data block)分别介于哪一个block号码之间。</li>
<li>block bitmap：0/1表示block使用情况</li>
<li>inode bitmap：0/1表示inode使用情况</li>
</ul>

<p>其中，inode固定大小为128bytes。但是由于文件的属性很多，而且要记录文件内容的block号码，如果文件非常大的情况下，block多，inode就记录不下了（一个文件只能对应一个inode），所以，就出现了下面这幅图的架构：</p>

<p><img src="http://www.thinkingbar.com:2222/CMD_FILE_MANAGER/domains/thinkingbar.com/public_html/book/image/inode.jpg" alt="alt text" /></p>

<p>如上所示，分为12个直接指向，1个间接指向，1个双间接指向，1个三间接指向。然后直接+间接+双间接+三间接=容纳的最大文件大小</p>

<p>比如block为1KB，那么</p>

<ul>
<li>直接指向为12 x 1K = 12K</li>
<li>间接，1KB（借用一个block的大小） / 4bytes(一个block号码记录) = 256,256 x 1K = 256K</li>
<li>双间接，256 x 256 x 1K = 256平方K</li>
<li>三间接，256 x 256 x 256 x 1K = 256立方K</li>
</ul>

<p>总共为12 + 256 + 256x256 + 256x256x256 = 16GB</p>

<h4>3、硬盘的基本命令</h4>

<ul>
<li>df：列出文件系统的整体磁盘使用量</li>
<li>du：评估文件系统的磁盘使用量（常用于评估目录所占容量）</li>
<li>fdisk：硬盘分区</li>
<li>mkfs：格式化</li>
<li>mount：挂载</li>
</ul>

<h4>知识点</h4>

<ol>
<li>所谓的碎片整理就是文件写入的block太过于离散，此时文件读取的性能将会变得很差。这个时候可以通过将同一个文件所属的block汇合在一起，这样数据的读取会比较容易。FAT的文件系统需要经常碎片整理一下，但是ext2相对来说就好了很多，基本不需要。</li>
<li>linux既有inode，也有block；U盘多使用FAT文件系统，只有block，没有inode。所以，不能像inode一样一下子把所有属于该文件内容的block读出来，而链表一样读取内容，所以速度较慢。</li>
<li>当我们在linux下的ext2文件系统新建一个目录时，ext2会分配一个inode与至少一块block给该目录。其中，inode记录该目录的相关权限和属性，并可记录分配到的那块block号码；而block则记录在这个目录下的<strong>文件名</strong>与该文件名占用的<strong>inode号码数据</strong>。</li>
<li>当我们在linux下的ext2文件系统新建一个文件时，ext2会分配一个inode与相应大小的block给该文件。</li>
<li><strong>经过3和4的说明，应该清楚的知道inode本身并不记录文件名，文件名的记录是在目录的block中。所以，可以联想到前面章节中关于文件/目录权限问题</strong></li>
<li>ext3采用日志系统（Journaling file system）来意外情况的变动，这样如果意外发生后，就不用遍历全盘，而是遍历日志文件，将改变未成功的文件处理一下就好了。</li>
</ol>

</hr>
<h1 id="mark_h_9">第九章：文件与文件系统的压缩与打包</h1>
<p>这一章主要讲的就是文件的压缩和解压缩,在Linux中，这个非常实用。所以需要掌握：</p>

<ol>
<li>为什么压缩</li>
<li>常用压缩/解压缩命令</li>
<li>tarfile和tarball</li>
<li>管道应用的小技巧</li>
<li>完整备份工具dump</li>
<li>其他常见的压缩与备份工具</li>
</ol>

<h4>1、为什么压缩</h4>

<p>文件传输过程中文件小,就传送的快；反之亦然。我们知道,计算机存储的都是bit信息,比如3的存储就是00000011,前面的6个0如果能实用某种压缩算法进行压缩，可能就会使信息变小，传输的速度就会提升。在文件比较大的情况下,效果就会非常明显。</p>

<h4>2、常用压缩/解压缩命令</h4>

<ol>
<li><p>gzip -cdtv</p>

<ul>
	<li>c:将压缩的数据输出到屏幕上pipe</li>
	<li>d:解压缩</li>
	<li>t:检查是否出现错误</li>
	<li>v:压缩比</li>
</ul></li>
<li><p>bzip2 -cdkzv（相同同上）</p>

<ul>
	<li>k:不删除原始文件</li>
	<li>z:压缩的参数</li>
</ul></li>
<li><p>tar -ctxjzvfCpP(注意tar是打包命令,不是压缩命令)</p>

<ul>
	<li><strong>c:新建打包</strong></li>
	<li><strong>t:查看包内文件名</strong></li>
	<li><strong>x:解包</strong></li>
	<li>j:bzip2压缩</li>
	<li>z:gzip压缩</li>
	<li>v:数据显示在屏幕上</li>
	<li><strong>f:打包后名字（最后一个参数 尽量单独写）</strong></li>
	<li><strong>C:打包自定义路径</strong></li>
	<li>p:打包全部属性和权限</li>
	<li>P:保留绝对路径。这个需要解释一下,一般为了安全考虑,都会删除根目录/,防止解压缩根据绝对路径直接把现在的文件覆盖。</li>
</ul></li>
</ol>

<p>所以，最最常用的3个命令为：</p>

<ul>
<li>压　缩：tar -jcv -f filename.tar.bz2 要被压缩的文件或目录名称</li>
<li>查　询：tar -jtv -f filename.tar.bz2</li>
<li>解压缩：tar -jxv -f filename.tar.bz2 -C 欲解压缩的目录</li>
</ul>

<p>Notice:</p>

<blockquote>
<p>先使用tar -jcv -f /root/etc.tar.bz2 /etc，把/etc的东西复制到/root/etc.tar.bz2压缩包中。当使用tar -jtv -f /root/etc.tar.bz2时，我们发现会出现这样的信息：</p>
</blockquote>

<pre><code>-rw-r--r-- root/root  1016 2008-05-25 14:06:20 etc/dbus-1/session.conf
-rw-r--r-- root/root   153 2007-01-07 19:20:54 etc/esd.conf
-rw-r--r-- root/root   255 2007-01-06 21:13:33 etc/crontab
</code></pre>

<blockquote>
<p>可以发现一个很奇怪的地方：那就是每个文件名都没了根目录。为什么呢？<strong>主要是为了安全</strong>，我们使用tar备份的数据可能会需要解压缩回来使用，在tar所记录的文件名（就是刚才使用tar -jtv -f所查看的文件名）那就是解压缩后的实际文件名。如果去掉了根目录，假设你备份数据在/tmp目录下解开，那么解压缩的文件名就会变成/tmp/etc/xxx。但如果没有去掉<strong>根目录(/)</strong>，解压缩后的文件名就会是绝对路径，即压缩后的数据一定会被放置到/etc/xxx去。如此一来，你的原本在/etc下面的数据就会被备份数据所覆盖过去了。</p>
</blockquote>

<p>同时，tar还有两个常用的功能：</p>

<ul>
<li><p>有时候我们不需要解压缩.tar.gz中的全部内容，我们仅仅需要其中的一个文件。那么，我们可以这样做：</p>

<blockquote>
	<p>tar -jxv -f a.tar.bz2 待解包文件(一般去掉根目录，原因如上Noitce所示)</p>
</blockquote></li>
<li><p>而有时候我们打包备份某个文件夹，但是不想打包其中部分文件（比如cache信息），那么就可以使用--exclude:</p>

<blockquote>
	<p>tar -jcv -f a.tar.bz2 --exclude=/etc/cache /etc</p>
</blockquote></li>
</ul>

<h4>3、tarfile和tarball</h4>

<p>然后说了两个常用名词,tarfile和tarball。</p>

<ul>
<li>tarfile：只打包没压缩的文件</li>
<li>tarball：打包并且压缩的文件</li>
</ul>

<h4>4、 管道应用的小技巧</h4>

<p>管道中使用如下命令就可以直接传输tarball，而不用创建新tarball文件。就少了一个删除操作。更为方便。</p>

<blockquote>
<p>tar -cvf - /etc | tar -xvf - (其中的-表示标准输入和标准输出)</p>
</blockquote>

<h4>5、完整备份工具dump</h4>

<p>dump工具有两个用途：</p>

<ol>
<li>dump多用于备份文件系统，一共有9个等级</li>
<li>dump也可以用于备份目录，不过会有一些限制</li>
</ol>

<p>要找出 dump 的内容就使用 restore -t 来查阅即可。比如：</p>

<blockquote>
<p>restore -t -f /root/boot.dump</p>
</blockquote>

<h4>6、其他常见的压缩与备份工具</h4>

<p>我们知道tar为常见的文件/目录解压缩命令，但是如果我想对整个系统备份的话，就有点小材大用了。这时候我们可以使用dd命令： </p>

<blockquote>
<p>dd 可以读取磁碟装置的内容(几乎是直接读取磁区"sector")，然后将整个装置备份成一个文件。所以，可以使用tar备份重要数据，而用dd备份整个文件系统或者硬盘。</p>
</blockquote>

</hr>

<h1 id="mark_h_10">第十章：vim程序编辑器</h1>
<p>vim编辑器之所以强大，就在于它的<strong>可定制性</strong>。要熟练使用vim方法很简单：坚持使用。一个迅速提升vim能力的捷径：不断优化操作。一个5步能完成的任务如果你能通过一个命令完成，那么这个过程你会学到很多。这也是《卓有成效的程序员》中提到的加速法则。</p>

<hr />

<p>根据我的经验，学习vim可以这样：</p>

<p>第一阶段：</p>

<ul>
<li>搞清楚插入、命令、可视模式</li>
<li>学会基础的增删查改</li>
<li>学会光标定位</li>
<li>学会快速跳转</li>
</ul>

<p>第二阶段：</p>

<ul>
<li>学习vim的寄存器</li>
<li>看看.vimrc的配置</li>
<li>自定义一些配置</li>
<li>研究高手的配置</li>
<li>装一些插件</li>
</ul>

<p>第三阶段：</p>

<ul>
<li>学习一点键盘映射</li>
<li>不断优化操作</li>
<li>学习vim的超能力</li>
</ul>

<p>另外，推荐cool shell翻译的<a href="http://coolshell.cn/articles/5426.html">简明vim练级攻略</a>,当时我就是看这个入门的。</p>
</hr>

<h1 id="mark_h_11">第十一章：认识与学习bash</h1>
<h4>1.什么是bash呢？</h4>

<p>首先，<strong>bash是一个shell</strong>，shell就是外壳的意思。</p>

<p>我们知道，计算机是由硬件组成的，然后由操作系统这个系统软件进行第一层封装，但是操作系统的指令全是二进制，所以违背了简单可依赖的原则。而shell和其他应用程序就是第二层封装，这次封装后，用户可以通过简单明了的命令来控制硬件，实现了简单的原则。</p>

<h4>2.shell有哪几种？</h4>

<p>shell其实分为很多类，不多大多数使用的都是bash这个GNU最重要的标准shell，如果想看看自己操作系统可以使用哪些shell，可以cat /etc/shells，就会知道啦。</p>

<h4>3.怎么使用bash？</h4>

<p>bash内置了很多命令，还包括其他env中的命令，所以，使用bash要注意的就是环境+命令。</p>

<p>如果我们想要知道一个命令是alias、builtin，或者是file就可以使用type命令，<strong>注意：</strong>type主要在找出“执行文件“而不是一般的文件名。所以，这个type也可以用来作为类似which命令的用途了。</p>

<h4>4.shell的变量功能</h4>

<p>以我的理解，和#define的功能类似，就是把一大串东西用一个东西标识，清楚明了，易于管理。</p>

<p>如果我们想要设置一个变量，必须遵守下列规则：（敢不敢别这么多？？）</p>

<ol>
<li>等号两边不能有空格</li>
<li>变量名称只能是英文字母或者数字<strong>没有下划线</strong>， 开头字符不能是数字</li>
<li>变量内容有空格符号可使用单引号或者双引号括起来</li>
<li>双引号解析变量，单引号不解析变量</li>
<li>可以使用转义字符\</li>
<li>可以使用``【不推荐，容易写错且不好检查出来】或者$( command )【推荐】执行命令，如：version=$( uname -r )</li>
<li>该变量需要在子shell中使用，可以使用export导入到环境变量</li>
<li>系统变量均为大写，自己设置的变量尽量设置为小写（习惯，非规定）</li>
<li>取消变量用unset命令</li>
</ol>

<h4>5.set、env、export、declare是干嘛的？</h4>

<p>刚学这点的时候，总是搞不明白这几个的区别，现在总算明白了。</p>

<ul>
<li>env是环境变量</li>
<li>set是当前shell可用变量</li>
<li>export是一个把set变量导入到env变量的工具</li>
<li>declare将环境变量转成自定义变量</li>
</ul>

<p>那为什么要引入这几个东西呢？</p>

<blockquote>
<p>之所以设计这三个命令是因为bash可以有子bash，子shell会继承父shell的环境变量，但是却不会继承父shell的自定义变量，如果想在子shell中使用父shell的自定义变量，就可以在父shell中export该变量，使之进入env中，子shell就可以继承使用了。同理，declare完成相反的功能哦。</p>
</blockquote>

<h4>6.环境变量的语系</h4>

<p>这点单独说是因为：乱码是程序员的噩梦。虽然能解决，但是往往耽误很长时间。如果把基础东西掌握，解决起来应该很迅速。</p>

<p>其实LANG或者是LC_ALL变量是整体语系的环境，事实上，如果其他的语系变量都未设置，且你有设置LANG或者LC_ALL时，则其他的语系变量就会呗这两个变量所替代。所以，LANG是最主要的设置变量。</p>

<ul>
<li>一般用户的语系设置文件是在/usr/lib/locale/这个目录中。</li>
<li>整个系统默认的语系定义在/etc/sysconfig/i18n</li>
</ul>

<h4>7.变量内容的删除、替代和替换</h4>

<p>这个感觉应用还蛮多的。也很简单：</p>

<p>假设系统变量PATH的值为/usr/kerberos/sbin:/usr/kerberos/bin:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin</p>

<p>1).删除操作</p>

<ul>
<li><p>假如我不喜欢kerberos，所以要将前两个目录删除掉，命令为：</p>

<p>PATH=${PATH#/*bin:}    ---->#代表从前删除匹配内容最短的那一个</p></li>
<li><p>假如我要删除前面的目录，仅剩下最后一个目录，命令为：</p>

<p>PATH=${PATH##/*:}    ---->##代表从前删除匹配内容最长的那一个</p></li>
<li><p>同理，%和%%代表从后先前删除，就不举例子了。</p></li>
</ul>

<p>2).替换操作</p>

<ul>
<li><p>将PATH的第一个sbin替换成大写的SBIN，命令为：</p>

<p>PATH=${PATH/sbin/SBIN}    ---->/src/des，表示将最前面src的内容替换成des</p></li>
<li><p>将PATH的所有sbin都替换成大写的SBIN，命令为：</p>

<p>PATH=${PATH//sbin/SBIN}    ---->//src/des，表示将全部src的内容替换成des</p></li>
</ul>

<p>3).变量的测试</p>

<ul>
<li><p>测试变量是否存在，不存在则设置为root</p>

<p>name=${name-root}</p></li>
<li><p>如果变量存在但是被设置为空，则也要设置为root</p>

<p>name=${name-:root}</p></li>
</ul>

<h4>8.一个命令是怎样被执行的？</h4>

<p>基本上，命令运行的顺序可以这样看：</p>

<ol>
<li>以相对/绝对路径来执行命令</li>
<li>alias</li>
<li>builtin</li>
<li>$PATH</li>
</ol>

<p>以上四步，按照顺序，第一个找到的就会被执行。</p>

<h4>9.bash的登录与欢迎信息</h4>

<p>如果你想要你的bash命令提示符有点特色的话，可以修改/etc/issue文件就行了。当然，这个是本地的机器，如果我么使用的是远程登录程序，那么，我们可以修改/etc/issue.net就行了。/etc/motd就是让用户登录后取得一些信息。【一般用于服务器重启或维护】</p>

<h4>10.bash的环境配置【重要】</h4>

<p>上面我说过，如果要使用bash，就需要注意环境+变量。那么，我们可以猜到当我们打开一个bash的时候，我们就使用了bash的默认环境。如果我们想修改bash的默认设置可以吗？当然，下面我们就来讨论一下bash的环境配置问题。</p>

<ol>
<li><p>首先shell分为login和nonlogin两种，login shell就是取得bash时需要完整的登陆流程，举例来说，你由tty1-6登录，需要输入帐号密码，那么这时取得的shell就是login shell；如果你在ubuntu下打开一个终端，并不需要输入帐号密码就可以执行命令了，这种不需要登录的shell就被成为nonlogin shell了。</p></li>
<li><p>login shell和nonlogin shell之所以要严格区分，是因为linux会分别读取不同的配置文件。先说说login shell吧。</p>

<ul>
	<li>login shell：
	<ul>
	    <li>/etc/profile:这是<strong>系统能够整体的设置</strong>，最好不要修改~</li>
	    <li>~/.bash_profile或~/.bash_login或~/.profile：属于<strong>用户个人设置</strong>，你要改自己的数据，就写到这里面</li>
	</ul></li>
	<li>nonlogin shell：
	<ul>
	    <li>~/.bashrc</li>
	</ul></li>
</ul></li>
</ol>

<p>下面我们来说一下login shell和nonlogin shell的配置过程吧。</p>

<p>1).login shell</p>

<p>读入/etc/profile后，这个配置文件会根据用户的标识符（UID）来决定很多重要的变量数据，这也是每个用户登录取得bash时<strong>一定</strong>会读取的配置文件【相当重要，轻易不要修改，影响所有用户】</p>

<p>另外/etc/profile还会去调用外部的设置数据。包括/etc/inputrc,/etc/profile.d/*.sh其实这是个目录内的众多文件。只要在/etc/profile.d目录、后缀为.sh，用户有r的权限，就可以被/etc/profile调用。【如果你需要帮所有用户设置一些共享的命令别名时，就可以在这个目录下创建】，/etc/sysconfig/i18n。</p>

<p>bash在读完了整体环境设置的/etc/profile后，接下来会读取用户的个人配置文件。且这三个按顺序执行找到一个能被执行的，后面就不执行了。我们看一下~/.bash_profile的内容会发现这个文件的功能为：</p>

<ul>
<li>设置PATH变量【累加/etc/profile中的PATH】，并且使用export命令将PATH变成环境变量供子shell使用。PATH=$PATH:$HOME/bin，意思就是如果用户把可执行shell命令放到~/bin下就会被shell读取，可以直接执行。【本质就是加入用户/bin下的自定义命令】</li>
<li>如果~/.bashrc存在就读入这个文件。然后发现~/.bashrc其实又调用了/etc/bashrc,原理和nonlogin shell一样，在下面详讲</li>
</ul>

<p>2).nonlogin shell</p>

<p>承接上文所示，~/.bashrc会读取/etc/bashrc，这个文件的作用如下：</p>

<ul>
<li>依据不同的UID规定umask的值【创建文件的权限】</li>
<li>依据不同的UID规定提示符【PS1变量】</li>
<li>调用/etc/profile.d/*.sh的设置</li>
</ul>

<p>总结一下，bash的环境主要分为login shell和nonlogin shell，然后就是读取不同的配置文件、根据用户UID来修改一些变量使不同的用户能使用自己权限范围内的命令。</p>

<p>当然，事实上还有一些其他相关的配置文件。比如/etc/man.config规定了使用man的时候man page的路径到哪里去寻找。</p>

<blockquote>
<p>比如你是以tarball安装你的数据，那么这个东西的man page可能在/usr/local/softpackage/man里面，如果你不手动把它的路径添加到/etc/man.config，你使用man的时候就会找不到man page说明文件了。【其实就是MANPATH变量的设置】</p>
</blockquote>

<p>还有~/.bash_history,~/.bash_logout相当于析构函数了。bash退出时做的清理工作。</p>

<h4>11.source或者.命令：读入环境配置文件</h4>

<p>由于/etc/profile和~/.bash_profile都是login shell读取的配置文件，如果修改后，通常需要注销重新登录才能生效。但是我们使用source或者.命令就不需要注销重新登录啦。</p>

<p>source或.都可以将配置文件的内容读进<strong>目前的shell环境</strong>中。【用法一般为：如果你正在处理服务器和客户端程序，两者拥有不同的配置文件，那么，即使我们需要不断切换C/S，也不需要麻烦的注销重新登录，让source发挥它的用途就能搞定。】</p>

<h4>12.bash里面默认的组合键【6个太常用了】</h4>

<ul>
<li>ctrl+c 终止目前的命令</li>
<li>ctrl+d 输入结束eof</li>
<li>ctrl+m 就是enter【不常用- -】</li>
<li>ctrl+s 暂停屏幕输出</li>
<li>ctrl+q 恢复屏幕输出</li>
<li>ctrl+u 提示符下，删除整行命令</li>
<li>ctrl+z 暂停目前的命令</li>
</ul>

<h4>13.常用的通配符和特殊符号</h4>

<ul>
<li>*代表0到无穷多个任意字符</li>
<li>？代表一定有一个字符</li>
<li>[]一定有一个在中括号中的字符</li>
<li>[-]连续的意思[1-9]意思就是[123456789]</li>
<li>[^]，原向选择[^abc]代表一定有一个字符，只要是非abc就接受</li>
</ul>

<h4>14.数据流重定向</h4>

<p>standard output与standard error output简单的说，stdout指的是所回传的正确的信息，而stderr输出可理解为命令执行失败后，所回传的错误信息。</p>

<p>几个特殊字符如下所示：</p>

<ul>
<li>stdin：代码为0，使用&lt;或&lt;&lt;</li>
<li>stdout:代码为1，使用>或>></li>
<li>stderr:代码为2，使用2>或2>></li>
</ul>

<p>几个简单的例子：</p>

<ul>
<li>ls -a /home > logfile</li>
<li>ls -a /home >> logfile</li>
<li>find /home -name .bashrc > list_rigth 2> list_error</li>
<li>find /home -name .bashrc 2> /dev/null</li>
<li>find /home -name .bashrc > list 2>&amp;1 #正确、错误写到同一个文件</li>
<li>cat > logfile</li>
<li>cat > logfile &lt; ~/.bashrc</li>
<li>cat > logfile >> "eof"</li>
</ul>

<p>至于为什么数据流重定向很重要，简单说几点：</p>

<ul>
<li>屏幕输出的信息很重要，需要保存下来。比如LOG信息</li>
<li>后台执行中的程序，不希望它干扰正常的输出结果</li>
<li>一些系统的例行命令的执行结果，希望保存下来</li>
<li>一些执行命令的可能已知错误时，用2>/dev/null丢弃</li>
<li>错误信息和正确信息要分别输出时</li>
</ul>

<h4>15.管道命令</h4>

<p>首先我们必须要记住：在每个管道后面接的<strong>第一个数据必须是命令</strong>，而且<strong>这个命令必须要能够接收stdinput的数据</strong>才行，这样的命令才可以是“管道命令”，例如less，more，head，tail等都是可以接收stdinput的管道命令。至于例如ls，cp，mv等就不是管道命令了——因为ls，cp，mv并不会接收来自stdinput的数据。所以，总结起来就是亮点：</p>

<ol>
<li>管道命令仅会处理stdout,对于stderr会予以忽略。</li>
<li>管道命令必须要能够接收来自前一个命令的数据成为stdinput继续处理才行。</li>
</ol>

<p>选取命令：</p>

<ul>
<li>cut -d "-" -f 1,3 #以-分隔，取1，3段数据</li>
<li>export | cut -c 12- #取第12个字符到最后的数据</li>
<li>grep -acinv 'find_str' filename</li>
</ul>

<p>还有一个叫做双向重定向：tee命令</p>

<ul>
<li>last | tee last.bak | more #一路流到last.bak，另一路流到more中</li>
<li>last | tee -a last.bak | more #一路流到last.bak(append累加)，另一路流到more中</li>
</ul>

<p>又有了一个很常用的命令：xargs</p>

<p>这个命令就是在产生某个命令的参数的意思。</p>

<p>xargs可以读入stdin的数据，并且以<strong>空格符或者换行符</strong>进行分辨，将stdinput的数据分隔成arguments。所以，xx | xargs ls -l这样的命令用的最多。因为很多命令其实并不支持管道命令，因此我们可以通过xargs来提供该命令引用stdinput只用。比如：</p>

<ul>
<li>find /sbin -perm +7000 | xargs ls -l</li>
</ul>

<p>在管道中，一个常用的符号是 - </p>

<ul>
<li>tar -cvf - /home | tar -xvf -</li>
</ul>

<p>上面这个例子将/home下的文件打包，但是没有打包成一个文件，而是放到stdout（-）中，然后在当前目录下用 - 来代表 | 传输过来的tar包，直接解包就行，省去了建立文件、删除文件的过程，提高了效率。</p>

<h1 id="mark_h_12">第十二章：正则表达式与文件格式化处理</h1>
<h4>1.什么是正则表达式</h4>

<p>官方定义是酱紫滴：</p>

<blockquote>
<p>正则表达式就是处理字符串的方法，它是以行为单位来进行字符串的处理行为，正则表达式通过一些特殊符号的辅助，可以让用户轻易达到查找、删除、替换某特定字符串的处理程序。</p>
</blockquote>

<h4>2.什么情况下用正则表达式</h4>

<p>起初有一点很是困惑，为什么linux提供了通配符、特殊符号、正则表达式这几种方法来匹配呢？看完这一点介绍后明白了</p>

<ul>
<li>正则表达式必须要工具程序支持才能使用，比如vim,grep,awk,sed等</li>
<li>如果某些命令（cp，ls）不支持正则表达式，那么我们就只能使用bash自身的通配符。因为通配符代表的是bash接口的功能，而RE是字符串处理的表示方式</li>
<li>特殊符号是bash环境自带的某些具有特殊含义的符号（如#代表注释，\代表转义）</li>
</ul>

<h4>3.正则表达式的分类</h4>

<p>正则表达式分为：</p>

<ul>
<li>基础正则表达式</li>
<li>扩展正则表达式</li>
</ul>

<p>两者的区别就是一个是处理一组，一个是处理多组，我们先把基础的搞定后再学习更复杂的扩展正则表达式吧。</p>

<h4><strong>4.注意</strong></h4>

<p>在使用正则表达式之前，我们需要特别留意一下系统的语系，因为不同的语系编码顺序不同，比如：</p>

<ul>
<li>LANG=C时：0 1 2 3 4 …… A B C D …… Z a b c d …… z</li>
<li>LANG=zh_CN时：0 1 2 3 4 …… a A b B c C d D …… z Z</li>
</ul>

<p>所以，如果我们在选取[A-Z]时，会发现LANG=C仅找到大写字符（因为是连续的），而如果是LANG=zh_CN，连同小写的b-z也会被选取出来。</p>

<h4>5.正则表达式利器grep</h4>

<p>grep -acinv -An -Bn --color=auto 'to_find_str' filename</p>

<ul>
<li>a：将binary文件转换为text文件后匹配</li>
<li>c：count匹配的结果总数</li>
<li>i：忽略to_find_str大小写</li>
<li>n：显示匹配字符串所在的行号</li>
<li>v：反向选择</li>
<li>A：after多少行也显示</li>
<li>B：before多少行也显示</li>
</ul>

<h4>6.基础正则表达式使用</h4>

<ul>
<li>[:lower:]是特殊符号，如果要使用的话，命令为： grep -n '[[:lower:]]' filename #查找含小写的字符串</li>
<li>^有两种用法
<ul>
	<li>[^]: 在[]中代表非，[^abc]代表不能为a/b/c中的一个</li>
	<li>^[]:在[]外代表开头，^[abc]代表以a/b/c开头的一个</li>
</ul></li>
<li>^[abc]代表以a/b/c中的一个开头，[abc]$代表以a/b/c中的一个结尾</li>
<li>如果字符串含有小数点（.）查找时候需要用\.，因为.在正则表达式代表任意一个字符</li>
<li>在正则表达式中很重要的两个符号为：.和*
<ul>
	<li>.（小数点）：代表一定有一个任意字符</li>
	<li>*（星号）：代表重复前一个0到无穷多次，为<strong>组合形态</strong></li>
</ul></li>
<li>在限定连续RE字符范围{}用法中，因为{和}在shell中是有特殊意义的，因此，我们必须用转义字符来使用{和}</li>
<li>同理，!也是shell的一个特殊字符，所以如果要在RE中使用，需要用转义字符!</li>
<li>在使用[a-b]是时候，一定要确定bash中的LANG的语系 </li>
</ul>

<h4>7.自我感觉grep和cut在查找方面已经非常厉害了。在有了RE后，又出现两员猛将：sed和awk</h4>

<p>首先我们要知道，cut是处理一行中的某一段，grep是处理某一行；
而sed和awk也是同样的道理->awk倾向于将一行分成数个”字段“来处理，而sed常常作用于一整行的处理；</p>

<ul>
<li>cut----awk</li>
<li>grep---sed</li>
</ul>

<p>1)sed -nefri [n1[,n2]] function
* n:安静模式
* e：直接在命令行模式上进行sed的动作编辑
* f：直接打开一个用sed写好的操作集合文件
* r：扩展正则表达式语法
* i：直接修改读取的文件内容，而不是由屏幕输出【dangerous】</p>

<p>在使用中，如果要使用sed在第2行后面新添加2行文字，那么我们就要使用：
nl /etc/passed | sed '2a Drink tea or .....\</p>

<blockquote>
<p>drink beer or.....\
drink coffee?'</p>
</blockquote>

<p>这个一定要和命令行模式下的\区别开，因为命令行模式下的\代表的是<strong>一行未完成</strong>，而在sed的''里面的\则代表<strong>行的分隔符</strong>。</p>

<p>还有一点就是如果sed后面如果要接两个或两个以上的动作时，每个动作前面得加-e才行，比如：
* cat /etc/passwd | sed -e '4d' -e '6c no six line' > passwd.new</p>

<p>2)awk '条件类型1{动作1} 条件类型2{动作2} ……' filename </p>

<p>awk中有3个默认变量
* NF($0):每一行拥有的字段总数
* NR:目前awk所处理的是第几行的数据
FS:目前的分隔字符，默认是空格键</p>

<p>如下为一个例子：
* cat /etc/passwd | awk '{FS=":"} $3 &lt; 10 {print $1 "\t" $3}' #读出/etc/passwd文件，分隔符为":"，然后取出第三列小于10的所有行的第一列和第三列</p>

<p>但是执行后发现第一行并没有处理，因为awk在执行{FS=":"}之前，还是以空格符作为默认的分隔符，如果想要解决这个问题，我们就得使用BEGIN这个关键字，如下：
* cat /etc/passwd | awk 'BEGIN {FS=":"} $3 &lt; 10 {print $1 "\t" $3}'</p>

<p>另外awk支持在命令执行{}中使用多条语句（跟扩展正则表达式中的|相似），比如下面这个工资条统计的命令：</p>

<ul>
<li>cat pay.txt | > awk ' NR==1{printf "%10s %10s %10s %10s %10s\n", $1, $2, $3, $4, "Total"}
NR>=2{total=$2+$3+$4;
printf "%10s %10d %10d %10d %10.2f\n", $1, $2, $3, $4, total}'</li>
</ul>

<p>说明一点：awk中定义的变量不需要使用$符号，比如第二句中的total，就直接用total输出了。同时，在{}中的动作，如果有需要多个命令辅助时，可利用分号间隔，或者直接以enter按键来隔开每个命令，例如上面的total=$2+$3+$4后面既可以用；也可以直接回车即可。</p>

<h4>8.扩展正则表达式</h4>

<p>这个比正则表达式还酷，因为.....连续操作啊啊。因为grep默认支持基础而不支持扩展的，所以如果要使用的话用：grep -E，不会推荐使用egrep就OK啦。</p>

<ul>
<li>+：一个及以上前一个RE字符 #egrep -n 'go+d' re.txt</li>
<li>？：0个或1个前一个RE字符 #egrep -n 'go?d' re.txt</li>
<li>| ：or #egrep -n 'god|good|dog' re.txt</li>
<li>()："组“字符串 #egrep -n 'g(la|oo)d' re.txt</li>
<li>()+：多个重复组的判别 #egrep -n 'g(xyz)+d' re.txt</li>
</ul>

<h4>9.diff命令</h4>

<p>1).diff也算是一个常用的命令吧，比如以前写程序对拍的时候，就很管用。</p>

<p>diff -bBi from des
* b:忽略一行当中仅有多个空白的区别（比如"about me"和"about   me"其实是相同的）
* B:忽略空白行的区别
* i：忽略大小写的区别</p>

<p>另外diff比较牛逼的一个地方在于，它可以比较不同目录下名字相同的文件，比如dir1和dir2下面都有一个a文件，那么diff dir1 dir2它就会自动找出两个a文件的差异，如果存在多个文件我就不太清楚了，不过稍微试一下就能知道。</p>

<p>2).还有一个比较命令是cmp，不过diff是以“行”为单位比较，而cmp是以”字节“为单位比较，这点需要搞清楚。另外，cmp的一个独到之处是它可以对比二进制文件，这个有点印象就可以了。 
3).和diff经常配合使用的就是patch命令——补丁专用。就是说我们用diff比较2个文件的不同后，将结果搞成一个补丁，这样我们就可以用patch来将旧的那个升级到新版本，当然patch也提供了回滚操作。这和svn的工作原理很类似，有时候需要一个作为备份，一个作为开发的时候，就可以这么应用了。</p>

<p>总结一下，本章学到的东西主要是：</p>

<ul>
<li>正则表达式和通配符的区别</li>
<li>基础正则表达式</li>
<li>扩展正则表达式</li>
<li>grep -acvni -An -Bn --color=auto 'to_find_str' filename</li>
<li>sed -nefri 动作</li>
<li>awk '条件类型1{动作1}条件类型2{动作2}……' filename</li>
<li>其他几个命令，printf/diff/cmp/patch</li>
</ul>


<h2 id="mark_h_13"> 第十三章：学习shell script</h2>
<p>这一章主要讲述的就是shell script（程序化脚本）了。在写脚本之前，一定要注意的就是环境的配置，比如PATH和LANG就是很关键的2个变量。</p>

<blockquote>
<p>其实，shell script是利用shell的功能所写的一个“程序”，这个程序是使用纯文本文件，将一些shell的语法与命令（含外部命令）写在里面，搭配正则表达式/管道命令/数据流重定向等功能，以达到我们所想要的目的。类似windows的批处理吧。</p>
</blockquote>

<p>有三种方式来执行script程序，分别为：</p>

<ul>
<li>source script</li>
<li>sh script</li>
<li>./script</li>
</ul>

<p>现在分别来说明一下区别：</p>

<blockquote>
<p>source或者.是在当前shell中执行script程序，而其他两种都是在子shell中运行script程序的。所以，在script中定义的变量，如果不使用source执行，俺么在当前shell中就无法使用。（我们可以分别使用$$来打印当前shell的PID，这样一目了然）</p>
</blockquote>

<h4>2. test命令</h4>

<p>test是一个很有用的命令，比如我要知道系统中是否存在一个文件叫做a.txt，如果以前，我肯定先find一下，这样就浪费了大量时间。而现在我只要一个命令就可以搞定了。</p>

<blockquote>
<p>test a.txt &amp;&amp; echo "exist" || echo "not exist"</p>
</blockquote>

<p>Notice：</p>

<blockquote>
<p>有一点需要注意的就是linux下的&amp;&amp;和||，和C语言中的用法相同，但是实现方式不同。C中a &amp;&amp; b，意思是当a为0,那么b就不执行了；在linux下，a == 0 代表这个命令执行成功，所以会执行b。同理，||在C中前一个为0才执行，在linux下前面为1才执行。</p>

<p>shell中的判断语句是放在[]中的，和C的()不一样。这点需要特别记住，刚写这个的时候没注意，看了十几分钟才发现这里不同- -而且，更蛋疼的是linux的空格问题，这点一直比较变态，有的必须加空格，有的可加可不加，有的不能加。在[]用法中，因为[]也用在正则表达式等其他地方，所以这里<strong>必须加空格</strong>，格式像这样：[ "$a" == "$b" ]。</p>
</blockquote>

<p>所以，[]的用法总结一下就是：</p>

<ul>
<li>在中括号 [] 内的每个组件都需要有空白键来分隔</li>
<li>在中括号内的变量，最好都以双引号括号起来</li>
<li>在中括号内的常数，最好都以单或双引号括号起来</li>
</ul>

<p>Notice:</p>

<blockquote>
<p>可能大家对后两点有点困惑，这样不是很麻烦吗？考虑这样一种情况：name="hello baby",如果你使用[ &amp;name == "hello" ],就会变成[hello world == "hello"],这样显然多了一个参数hello。。。所以，变量最好都加上双引号或者但引号防止这些情况的发生。</p>
</blockquote>

<h4>3. shell script的默认变量</h4>

<p>在前面我们提到过，很多命令都有默认变量，比如cut分段后都有一个标志，同样，shell script也有所谓的默认变量，其实就相当于c语言中的argc和argv的功能，传送参数给shell script。格式如下：</p>

<p>/path/to/scriptname  opt1  opt2  opt3  opt4 <br />
$0             $1    $2    $3    $4</p>

<p>上面这些是基本的默认参数，还有一些也会经常用到：</p>

<ul>
<li>$# ：代表后接的参数『个数』，以上表为例这里显示为『 4 』；</li>
<li>$@ ：代表『 "$1" "$2" "$3" "$4" 』之意，每个变量是独立的(用双引号括起来)；</li>
<li>$* ：代表『 "$1c$2c$3c$4" 』，其中 c 为分隔字节，默认为空白键， 所以本例中代表『 "$1 $2 $3 $4" 』之意。</li>
</ul>

<p>一定记住啊，[]中是没有>或者&lt;这样的判断符号的，判断小于$a -lt $b（less than）。。。然后这些都可以查到的。<strong>再次强调，[]里面一定要有空格</strong></p>

<h4>4. 脚本的基本语法</h4>

<ul>
<li>if [ "$a" != "$b" ]; then</li>
<li>case：这个比较常用，很多系统script都是这样start,restart,stop</li>
<li>利用function功能：function也有内置变量。函数名称代表$0,后续接的参数为$1,$2....但是这里比较容易搞错,所以要和script的内置变量分清楚。</li>
<li>循环：无非就是while/until/for，这个看几个例子就搞定了</li>
</ul>

<h4>5. shell script的追踪与调试</h4>

<p>因为shell script是纯文本的命令，所以出现错误不好看出来。比如我刚学这点的时候经常会写错一些地方然后找了半天才找到。现在，我们可以通过bash的相关参数就可以对script进行判断了。</p>

<blockquote>
<p>sh -nvx script.sh</p>
</blockquote>

<ul>
<li>n：不执行script，仅查询语法错误</li>
<li>v：执行script前，先将script内容输出到屏幕上</li>
<li>x：将使用到的script内容显示到屏幕上，这是非常有用的参数</li>
</ul>

<h2 id="mark_h_14"> 第十四章：linux账号管理</h2>
<p>这一章主要讲的就是linux下对于<strong>用户</strong>、<strong>用户组</strong>的相关增删查改的基本设置命令，以前对这点的各种权限呀、默认属性都不是太清楚，看完这章总算搞明白了。其实说白了就是对下面4个文件的操作：</p>

<ul>
<li>/etc/passed</li>
<li>/etc/shadow</li>
<li>/etc/group</li>
<li>/etc/gshadow</li>
</ul>

<p>下面就详细说一下这一章的知识点。</p>

<h4>1、用户标识符：UID和GID</h4>

<p>当我们启动linux需要登录时，我们会输入账号和密码，但是你知道你从输入密码到登录过程中，系统究竟执行了哪些操作吗？</p>

<blockquote>
<p>虽然输入了账号，但是linux主机并不认识你的主机，它仅仅对ID（一串数字）感冒。而账号是为了用户记忆方便，就跟IP和域名一个道理。</p>
</blockquote>

<p>我们知道，文件都有所有者和用户组，其实本质就是UID和GID在起作用。linux就是根据UID和GID来辨别的。</p>

<h4>2、登录全过程解析</h4>

<ol>
<li>用户输入账号后，系统到/etc/passwd查找是否有输入的账号，没有则跳出；有的号会将该用户的UID和GID读出来，同时也会读出对应的主文件夹和shell设置</li>
<li>用户输入密码后，系统到/etc/shadow核实密码是否正确</li>
<li>全部匹配后，加载用户信息，包括读取各个变量，配置shell等</li>
</ol>

<h4>3、四个重要文件</h4>

<h5>/etc/passwd文件结构</h5>

<p>每一行代表一个账号，有几行就代表系统有几个账号。不过很多账号是系统正常运行所必须的，是系统账号，例如bin，daemon，adm，nobody等。除了root和系统账号，其他的就是用户自己的账号了。每一行有7个字段：</p>

<blockquote>
<p>账号名称：密码：UID：GID：用户信息说明：主文件夹：Shell</p>
</blockquote>

<p>其中密码原来是放在/etc/passwd中，后来出于安全考虑，把账号和密码分离，放入了/etc/shadow中，所以第二列以一个X显示。UID这个记住0是root，1-499是系统账号，500-65535是用户自己分配的账号。</p>

<h5>/etc/shadow文件结构</h5>

<p>/etc/shadow的也是一行作为一个记录，一共有9个字段：</p>

<blockquote>
<p>账号名称：密码：最近更改密码日期：密码不可改动最少天数：密码重设天数：重设前提示天数：...</p>
</blockquote>

<p>其实有用的就是第一个和第二个而已....其他就是为了安全，记录你上次改密码时间，提醒你啥时候需要重新设置一下密码的。需要的时候查一下就可以了。</p>

<blockquote>
<p>如果一般用户密码忘了，用root登录，passwd user改一下就OK了；如果是root密码忘了，可以重启进入用户维护模式，系统会主动给予root权限的bash接口，然后同样适用passed修改即可。</p>
</blockquote>

<h5>/etc/group文件结构</h5>

<p>在/etc/passwd的第四列就是GID，那GID对应的用户组在哪里呢？就是这个/etc/group了。同样一行一个用户组，一共4个字段：</p>

<blockquote>
<p>用户组名称：用户组密码：GID：用户组成员</p>
</blockquote>

<p>这里密码跟/etc/passwd一样，放到了/etc/gshadow中，该字段为x。但是考虑一个问题：因为linux是多用户、多任务系统，一个用户可以加入多个用户组，就好像一个学生可以加入学校的多个社团一样，那么，在操作中，是使用哪个用户组呢？</p>

<blockquote>
<p>这里有“有效用户组”和“初始用户组”两个概念。一般在创建一个账号时，默认创建一个与账号名相同的用户组，这就是“初始用户组”。当用户加入加入多个用户组后，如果分不清了，可以使用touch创建一个文件立马就可以知道当前的“有效用户组”。想要改变“有效用户组”也很简单，groups命令第一个就是“有效用户组”，修改用newgrp groupname即可。当然，这个groupname必须是该账号已经加入的用户组。</p>
</blockquote>

<p>对于newgrp这个命令，可以更改目前用户的有效用户组，而且是以<strong>另一个shell</strong>来提供这个功能的，其实就是子shell的意思。可以用echo $$来分辨。</p>

<h5>/etc/gshadow文件结构</h5>

<p>文件结构和/etc/group差不多，4个字段，一行代表一个记录：</p>

<blockquote>
<p>用户组名：密码：用户组管理员账号：用户组成员</p>
</blockquote>

<p>如果第二列是"!"就说明该用户不是管理员的意思。用户管理员应该很容易理解，就是控制该用户组成员的增删查改。</p>

<h4>4、账号管理</h4>

<p>对账号的管理无非也是增删查改而已，所以命令也很简单：</p>

<h5>useradd</h5>

<blockquote>
<p>useradd username</p>
</blockquote>

<p>然后系统会做下面几个操作：</p>

<ul>
<li>/etc/passwd增加一行记录，还包括主文件夹创建</li>
<li>/etc/shadow增加对应记录，但是密码未设置</li>
<li>/etc/group 增加一个与账号名相同的用户组名记录</li>
<li>/etc/gshadow 设置相关组信息</li>
<li>/home件一个与账号名相同的主文件夹，权限为700</li>
</ul>

<p>可以想一下，你仅仅是使用了一个useradd username命令，怎么执行这么多操作呢？而且由上面4个重要文件的结构我们知道，需要填写很多字段的，这些都是怎么完成的？</p>

<blockquote>
<p>系统主要通过2个文件和一个目录来执行这些操作：</p>

<ul>
	<li>/etc/default/useradd</li>
	<li>/etc/login.defs</li>
	<li>/etc/skel/*</li>
</ul>
</blockquote>

<p>其中规定了使用useradd时的所有默认值，最好玩的是最后一个，它对定制系统很有用：</p>

<blockquote>
<p>/etc/skel/*是用户主文件夹参考基准目录，意思就是username的主文件夹就是参考这个/etc/skel为基准生成的。如果系统需要配置一些公共的变量，可以编辑/etc/skel/.bashrc，然后生成username时，就会生成已定制的.bashrc，省去了建一个用户让用户设置一次的麻烦。确实很有用。</p>
</blockquote>

<p>因为没有设置密码，所以需要passwd来设置一下密码（这点要回忆一下s特殊属性的用法，因为passwd是root才能执行的二进制脚本）。注意格式为passwd user，如果使用passwd就是修改当前用户的密码了（useradd命令root才能执行）！</p>

<p>Notice：</p>

<blockquote>
<p>因为系统账号主要是用来进行运行系统所需服务的权限设置，所以系统账号默认都不会主动创建主文件夹的。</p>
</blockquote>

<h5>修改账户信息</h5>

<ul>
<li>chage</li>
<li>usermod（常用）</li>
</ul>

<p>这些命令只需要知道就行，等到用的时候man一下就OK了。</p>

<h5>删除用户</h5>

<ul>
<li>deluser</li>
</ul>

<p>这个就不多说了，其实就是把useradd username创建的东西一一删除干净，特别注意不要随便删除系统账号，要不然你可能会发现系统无法正常工作了。</p>

<h4>5、用户功能</h4>

<p>不论是useradd、usermod，还是userdel，都是root才能执行的命令，那我们一般用户能够执行什么命令呢？现在就简单说几个能用到的命令，用的时候再man</p>

<ul>
<li>finger：查询用户的信息</li>
<li>chfn（change finger）：修改用户信息</li>
<li>chsh：修改使用的bash</li>
<li>id：列出某人或自己相关的UID/GID等信息</li>
</ul>

<h4>6、用户组管理</h4>

<p>这个和用户管理是一样的，就是把命令由userxxx改成了groupxxx，其他的没变化。有一点需要注意的就是你要删除一个用户组的时候必须保证没有组成员了，要不然无法删除。</p>

<h4>7、ACL机制</h4>

<p>简单介绍一下ACL是什么东西：</p>

<blockquote>
<p>用户权限管理始终是 Unix 系统管理中最重要的环节。大家对 Linux/Unix 的 UGO 权限管理方式一定不陌生，还有最常用的 chmod 命令。为了实现一些比较复杂的权限管理，往往不得不创建很多的组，并加以详细的记录和区分（很多时候就是管理员的噩梦）。可以针对某一个用户对某一文件指定一个权限，恐怕管理员都期待的功能。比如对某一个特定的文件，用户A可以读取，用户B所在的组可以修改，惟独用户B不可以……。于是就有了IEEE POSIX 1003.1e这个ACL的标准。<strong>所谓ACL，就是Access Control List，一个文件/目录的访问控制列表，可以针对任意指定的用户/组分配RWX权限。</strong>现在主流的商业Unix系统都支持ACL。FreeBSD也提供了对ACL的支持。Linux在这个方面也不会落后，从2.6版内核开始支持ACL。</p>
</blockquote>

<h4>8、用户身份切换</h4>

<p>这点以前也没有完全搞清楚，因为su可以切换到root sudo -i也可以切换到root，su -也可以切换到root。到底有什么区别呢？看完这部分就明白了。</p>

<p>重要的知识有3点：</p>

<ul>
<li>su</li>
<li>sudo</li>
<li>/etc/sudoers</li>
</ul>

<h5>su</h5>

<p>su是最常用的切换用户的命令，switch user的意思。</p>

<blockquote>
<p>如果要完整切换到另一个用户，就使用su - username,重点是“-”，其实是”-l“的意思。就是以login模式切换到另一个用户，而su username仅仅是切换到另一用户，环境还是原来用户的环境。比如你使用useradd，一般做法是退出当前用户，登录root。但是更快捷的是使用su临时切换到root，执行命令后退出，还可以还原到当前环境。</p>
</blockquote>

<p>比如这种情况：</p>

<blockquote>
<p>su命令就是切换用户的工具，怎么理解呢？比如我们以普通用户beinan登录的，但要添加用户任务，执行useradd ，beinan用户没有这个权限，而这个权限恰恰由root所拥有。解决办法无法有两个，一是退出beinan用户，重新以root用户登录，但这种办法并不是最好的；二是我们没有必要退出beinan用户，可以用su来切换到root下进行添加用户的工作，等任务完成后再退出root。我们可以看到当然通过su 切换是一种比较好的办法； </p>
</blockquote>

<p>总结一下就是：</p>

<ul>
<li>需要临时用到root，就用su</li>
<li>需要用root工作，就用su -</li>
</ul>

<p>对普通用户也是一样的道理：</p>

<ul>
<li>需要临时用一下其他用户，就用su otheruser</li>
<li>需要用其他用户工作，就用su - otheruser</li>
</ul>

<p>本质：</p>

<ul>
<li>su: su non-login</li>
<li>su -:su login</li>
</ul>

<h5>sudo</h5>

<p>上面的su命令是切换用户，所以需要用到root的密码，但是如果大家都知道root的密码那系统就不安全了。为了解决这个问题，又出现了sudo命令，sudo命令是输入自己的密码，可以暂时执行root的命令，但是如果都能执行sudo操作，那还是比较危险。这时，我们可以用root账户将某些用户添加到<strong>/etc/sudoers</strong>文件中，这些用户能执行sudo操作，不在这个文件的用户无法执行sudo操作。</p>

<p>而如果想增删查改能执行sudo的用户，可以让root用户通过<strong>visudo</strong>，不是<strong>vi[space]sudo</strong>这个命令来进行对应的操作。</p>


<h2 id="mark_h_17">第十七章：程序管理与SELinux初探</h2>
<p>这一章主要讲：</p>

<ul>
<li>程序和进程的区别</li>
<li>进程的增删查改</li>
</ul>

<h4>1. 程序和进程</h4>

<ul>
<li>程序：通常为二进制程序，存放在磁盘等设备中，以物理文件形式存在（静态）</li>
<li>进程：程序被触发后，将程序调入内存，给予一个PID，进程是一个运行中的程序（动态）</li>
</ul>

<h4>2. 父进程和子进程</h4>

<p>系统先以fork创建一个和父进程几乎一样的中间暂存进程，区别就是多了一个父进程PID以及有自己的PID（一个进程对应一个PID）。然后中间暂存进程以exec方式加载要执行的程序，新进程就是子进程了。</p>

<h4>3. daemon</h4>

<p>有些系统进程启动后在后台当中一直持续不断运行，就是常驻内存的进程。因为这些进程都是负责一些系统所提供的功能服务用户，因此这些常驻内存的进程被成为服务（daemon）</p>

<h4>4. 工作管理</h4>

<ul>
<li>&amp;：把工作放到后台进行</li>
<li>fg：把后台的工作拉到前台</li>
<li>bg：把后台暂停的工作变为运行</li>
<li>jobs：查看后台的工作</li>
<li>kill/killall：关闭进程/工作</li>
<li>ctrl+c:关闭当前进程/工作</li>
<li>ctrl+z：扔到后台，状态为暂停（&amp;是运行）</li>
</ul>

<p>需要说明的几点吧：</p>

<ul>
<li>执行jobs命令后，“+”代表最近放入后台的工作，”-“代表第二个</li>
<li>kill【后面默认接PID，若要关闭工作就要接%】
<ul><li>-1:重新读取配置</li>
	<li>-9:强制关闭进程【通常为出异常的进程】</li>
	<li>-15:正常关闭进程【执行正常的关闭流程】</li></ul></li>
</ul>

<p>对于-9和-15稍微解释一下，比如你用vim正在编辑一个文件，则会产生一个.swp文件，功能类似记录意外的意思。如果你使用-9那么，这个.swp就不会被删除；如果你使用-15，那么.swp就会被正常删除（因为正常情况关闭vim，.swp是自动删除的）。</p>

<h4>5. 脱机工作</h4>

<ul>
<li>工作管理中的”后台“指的是在终端机模式下可以避免ctrl+c的摧残，并不是放到系统后台的意思。所以，工作管理的后台依旧与终端机有关。</li>
</ul>

<p>考虑这样一种情况：</p>

<blockquote>
<p>你正在用a帐号执行某个操作，但是在某个操作需要用到帐号b，所以你把工作扔到后台执行之后注销登陆到b，那a帐号后台执行的程序会是什么情况？</p>
</blockquote>

<p>答案是：你的程序挂掉了，被系统给中断了- -如果你遇到这样的需求，有两种方法可以解决：</p>

<ul>
<li>at：将工作放置到<strong>系统后台</strong>中</li>
<li>nohup：脱机或注销系统后，还能让工作继续运行
<ul><li>nohup [命令或参数]:终端机前台</li>
	<li>nohup [命令或参数] &amp;:终端机后台</li></ul></li>
</ul>

<h4>6. 进程管理</h4>

<p>说白了，还是进程的增删查改等基本操作。</p>

<h5>查看进程</h5>

<ul>
<li>ps：常用ps -l（查看自己的进程），ps aux（查看系统所有的进程）</li>
<li>top：动态查询进程的变化（和tail -f, wtach -d同效）多用top -d 2(默认为5妙）</li>
<li>pstree：进程树（多用于查看进程结构，如查找父进程）</li>
</ul>

<p>有几个知识点说明一下：</p>

<ul>
<li>对于僵尸进程，用top查看zombie是否为0,不为0就用PS查看，在CMD属性那一栏后面有<defunct>就是僵尸进程了，然后结合pstree处理</li>
<li>在系统很慢的情况下，用top查看以CPU使用资源排序后的结果，就可以关闭一些进程，使系统提速</li>
</ul>

<h5>管理进程</h5>

<p>其实是借助<strong>kill</strong>命令和<strong>几个信号</strong>来实现的，现在列举一下常用到的信号：</p>

<ul>
<li>1:重新读取配置，类似重启</li>
<li>2:ctrl+c</li>
<li>17:ctrl+z</li>
<li>9:强制终端进程</li>
<li>15:正常关闭进程</li>
</ul>

<p>一个很经典的例子就是重启syslog服务，下面是命令：</p>

<blockquote>
<p>kill -1 $(ps aux |grep 'syslog' | grep -v 'grep' | awk 'print $2')</p>
</blockquote>

<p>kill是针对单个进程的，所以多配合ps,pstree使用；而killall是针对一个服务的多个程序，因此多用于对一个服务的操作。</p>

<p>下面还有几个命令，用于系统资源的查看</p>

<ul>
<li>free：查看内存使用情况</li>
<li>uname：查看系统与内核相关信息</li>
<li>uptime：查看系统启动时间与工作负载</li>
<li>netstat：跟踪网络，这个命令非常常用，比如netstat -lnp | grep :22，查询ssh端口</li>
<li>dmesg：分析内核产生的信息</li>
</ul>

<h4>7. 特殊文件与程序</h4>

<p>前面讲过s/t的特殊权限，但是却没有深究系统到底是如何处理这些操作的，这一节看过了才算弄明白了。</p>

<blockquote>
<p>整个SUID的权限会生效是由于具有该权限的程序被触发，从而成为一个进程。所以，执行者可以具有程序所有者的权限就是在该程序变成进程的那个时候。比如：普通用户使用passwd命令的时候具有了root的权限，这是因为：你在出发passwd这个程序后，这个程序成为一个进程，取得一个新的进程和PID，该PID产生时通过SUID来给予该PID特殊的权限设置【可结合pstree演示】</p>
</blockquote>


<h2 id="mark_h_22">第二十二章：软件安装：源码与tarball</h2>
<p>这一章主要讲关于源码相关的知识：</p>

<ul>
<li>源码安装</li>
<li>函数库相关</li>
</ul>

<h4>1. 一个完整的软件历程</h4>

<ul>
<li>源码：由用户以高级语言编写，用户可识别，机器无法识别的代码</li>
<li>编译：经过编译程序编译后，生成机器能识别的代码</li>
<li>可执行文件：二进制，机器能识别，可执行的文件</li>
</ul>

<h4>2. 安装/升级软件</h4>

<p>在使用ubuntu时，安装软件只需要一个命令：</p>

<blockquote>
<p>sudo apt-get install apache</p>
</blockquote>

<p>因为linux distribution厂商针对自己的版本对开发的源码编译，然后把二进制可执行文件放入”软件商店“的地方，用户通过命令就可以获取这个软件，升级也是同理。</p>

<h4>3. 源码安装</h4>

<ul>
<li>首先，检测是否有安装的前提：
<ul><li>gcc或cc等C语言编译程序</li>
	<li>make及autoconfig等软件</li>
	<li>必须的lib及include文件</li></ul></li>
<li>然后，是具体的安装过程
<ul><li>去的源代码文件，解压到/usr/local/src下</li>
	<li>仔细阅读INSTALL和README文件</li>
	<li>安装基础依赖文件</li>
	<li>以自动检测程序（configure或config）检测系统环境，建立makefile文件</li>
	<li>用make工具编译源文件</li>
	<li>make install安装软件</li></ul></li>
</ul>

<p>下面简略提一下大部分的tarball软件安装命令执行方式：</p>

<ul>
<li>./configure：建立makefile文件</li>
<li>make clean：清除上次编译过的目标文件（*.o）</li>
<li>make：编译</li>
<li>make install：安装</li>
</ul>

<h4>4. tarball软件安装注意事项</h4>

<ul>
<li>原本的linux distribution发布安装的软件大多在/usr里面；用户自己安装的在/usr/local下面</li>
<li>源码放入/usr/local/src下面</li>
<li>安装默认为/usr/local，但是安装后，发现一个软件的文件集中分配到/usr/local/etc,/usr/local/bin,/usr/local/lib,/usr/local/man，这样当你需要找一个软件的对应文件就会比较困难，所以建议安装时执行一个单独的目录，比如将这个软件所有文件装入/usr/local/apache/文件夹下，这样就比较方便了。但是有一点需要特别注意：/usr/local/bin在PATH中，但是/usr/local/apache/bin却不再PATH中，同理，man也不再MANPATH的路径中，所以需要<strong>手动添加</strong>！</li>
</ul>

<h4>5. 利用patch更新源码</h4>

<p>patch的基本语法如下：</p>

<blockquote>
<p>patch -p数字 &lt; patch_file</p>
</blockquote>

<p>其中-p数字解释一下。如果你的patch_file第一行为：</p>

<blockquote>
<p><em>*</em>/home/guest/example/expatch.old</p>
</blockquote>

<ul>
<li>执行patch -p0 &lt; patch_file 更新文件为/home/guest/example/expatch.old </li>
<li>执行patch -p1 &lt; patch_file 更新文件为/guest/example/expatch.old</li>
<li>执行patch -p2 &lt; patch_file 更新文件为/example/expatch.old</li>
<li>执行patch -p3 &lt; patch_file 更新文件为/expatch.old</li>
</ul>

<p>那个数字代表拿掉几个/的意思，等你更新过patch后，只是更新了源码，还需编译make，安装make install才能正常使用。另外，patch一般不跳级，两个版本之间有patch文件才能打补丁</p>

<h4>6. 动态库和静态库</h4>

<p>静态函数库</p>

<ul>
<li>扩展名：libxxx.a</li>
<li>编译行为：全部整合到可执行程序中，所以编译后文件较大</li>
<li>独立执行状态：能独立执行，因为包含了全部函数库</li>
<li>升级难易度：难，需全部重新编译</li>
</ul>

<p>动态函数库</p>

<ul>
<li>扩展名：libxxx.so</li>
<li>编译行为：只有一个指针指向动态库位置，需要函数才读取，编译后文件较小</li>
<li>独立执行状态：不能独立执行，因为只有一个指针</li>
<li>升级难易度：简单，改变指针</li>
</ul>

<p>linux destribution倾向使用动态库，因为静态库升级需要整个重新编译，代价太大，而动态库改变指针指向就OK了。</p>

<h4>7. ldconfig和/etc/ld.so.conf</h4>

<p>我们知道，内存访问速度远快于硬盘，如果想使用动态库更速度，可以通过ldconfig和/etc/ld.so.conf将动态库加入内存当中（缓存，cache）</p>

<ul>
<li>/etc/ld.so.conf写入想加入告诉缓存当中的动态库所在的<strong>目录</strong>，注意不是<strong>文件</strong>。</li>
<li>ldconfig命令将/etc/ld.so.conf读入高速缓存</li>
<li>记录在/etc/ld.so.cache（应该是系统自动搞定）</li>
</ul>

<h4>8. ldd命令（常用）</h4>

<p>如何判断一个可执行二进制文件有那些动态库文件呢？ldd命令轻松搞定。</p>

<h2 id="mark_h_23">第二十三章：软件安装：RPM/SRPM/YUM功能</h2>
<p>这一章主要讲述linux的软件管理器</p>

<ul>
<li>RPM（Red Hat Package Manager）：这个机制最早是由Red Hat公司开发，因为很好用，很多distributions就使用这个机制来作为软件安装的管理方式，包括Fedora，CentOS，SuSE等。</li>
<li>DPKG：这个机制最早是由Debian Linux社区开发，通过dpkg的机制，Debian提供的软件就能够简单安装起来，同时还能提供安装后的软件信息，实在非常不错。只要派生于Debian的其他linux distribution大多使用dpkg这个机制来管理软件，包括B2D，Ubuntu等。</li>
</ul>

<blockquote>
<p>distribution代表      软件管理机制     使用命令          在线升级机制（命令）</p>

<p>Red Hat/Fedora        RPM              rpm,rpmbuild      YUM（yum）</p>

<p>Debian/Ubuntu         DPKG             dpkg              APT（apt-get）</p>
</blockquote>

<h4>1. PRM</h4>

<p>RPM是以一种数据库记录的方式来将你所需要的软件安装到你的里奴性系统的一套管理机制。RPM最大的特点就是将你要安装的软件<strong>先编译过</strong>，并且打包成为PRM机制的安装包。</p>

<p>优点如下：</p>

<ul>
<li>由于已经编译完成并且打包完毕，所以软件传输与安装上很方便（不需要再重新编译）</li>
<li>由于软件的信息都已经记录在linux主机的数据库上，很方便查询，升级和反安装</li>
</ul>

<p>但是也因为这样，该软件文件几乎只能安装在原本默认的硬件与操作系统版本中。所以，通常不同的distribution所发布的RPM文件并不能用在其他的distribution上。所以，该机制的缺点如下：</p>

<ul>
<li>软件安装的环境必须与打包时的环境需求一致或相当</li>
<li>需要满足软件的依赖属性需求</li>
<li>反安装时需要特别小心，最底层的软件不可先删除，否则可能造成整个系统的问题</li>
</ul>

<h4>2. SRPM</h4>

<p>为了解决RPM机制的缺点，提出了SRPM机制。顾名思义，它是source RPM的意思，也就是说这个RPM文件里面含有源代码。特别的是，这个<strong>SRPM</strong>所提供的软件内容并没有经过编译，它提供的是源代码。通常，SRPM的扩展名以<em>*</em>.src.rpm命名。</p>

<p>所以，拿到一个SRPM包后：</p>

<ul>
<li>先将该软件以RPM管理的方式编译，此时SRPM会被编译成为RPM文件</li>
<li>然后将编译完成的RPM文件安装到linux系统当中</li>
</ul>

<p>这样一来，当你不想在RPM默认的环境中安装时，就可以通过SRPM提供的参数设置文件进行相应的设置。然后重新编译生成适合我们linux环境的RPM文件。</p>

<h4>3. i386,i586,i686,noarch,x86_64</h4>

<p>这个是硬件平台的意思，那么，这些硬件平台跟软件安装很关系吗？下面就来说说。</p>

<p>一般新的CPU都符合向下兼容，但是反过来不行。比如32位的软件就无法安装在64位的系统上。一般来说，还是根据硬件来搭配相应的RPM文件，毕竟该软件才有针对你的CPU硬件平台进行过参数优化的编译。</p>

<h4>4. rpm的使用</h4>

<h5>rpm安装</h5>

<blockquote>
<p>rpm -ivh xx.rpm</p>
</blockquote>

<h5>rpm升级</h5>

<blockquote>
<p>rpm -Fvh xx.rpm(如果xx软件安装则更新，没安装的话不更新)</p>

<p>rpm -Uvh xx.rpm（如果xx软件安装则更新，没安装的话直接安装）</p>
</blockquote>

<h5>rpm查询（查询/var/lib/rpm目录下的数据库文件）</h5>

<blockquote>
<p>rpm -q xx</p>

<p>rpm -qc httpd(查询软件的设置文件放在哪里)</p>

<p>rpm -qf /etc/crontab（查询该文件属于哪一个已安装的软件）</p>
</blockquote>

<h5>rpm验证</h5>

<p>使用/var/lib/rpm下面的数据库内容来比较目前linux系统的环境下的所有软件文件，就是了解这一阵子哪个文件被改动了</p>

<blockquote>
<p>rpm -Va（列出目前系统上面所有可能被改动过的文件）</p>

<p>rpm -V httpd（验证httpd这个软件是否被改动过）</p>
</blockquote>

<h5>rpm卸载</h5>

<p>卸载就是将软件解除安装，要注意的是，**解安装的过程一定要由最上层往下解除，以rp-pppoe为例，这一个软件主要是依据ppp这个软件来安装的，所以当你要卸载ppp的时候，就必须要先解除rp-pppoe才行！否则就会发生结构上的问题，比如你要拆5楼（ppp），肯定要先拆6楼（rp-pppoe）了，否则直接拆，6楼就悬空了- -</p>

<blockquote>
<p>rpm -e httpd</p>
</blockquote>

<p>由于RPM文件经常会安装/删除/升级等，某些操作或许可能会导致RPM数据库/var/lib/rpm内的文件损坏。果真如此的话，那你该如何是好？别担心，可以使用--rebuilddb这个参数来重建一下数据库。做法如下：</p>

<blockquote>
<p>rpm --rebuilddb</p>
</blockquote>

<p>记得以前的whereis和locate用到的updatedb吗？：）</p>

<h4>5. YUM在线升级机制</h4>

<p>其实用过linux之后发现yum和apt大同小异，比如install，update，remove都类似，这里没什么说的。值得说明的是如何选择软件源：</p>

<blockquote>
<p>比如你在北京，但是CentOS的镜像站点却选择到了台湾或者日本，那速度将是非常让人捉急的- -这时候，手动修改一下啊yum的设置文档就可以解决。具体方法google一下就明白了，很简单。所以，当你觉得你安装/更新软件非常慢的时候，就可以考虑使用这个方法。</p>
</blockquote>

<p>然后yum还可以安装大型项目。比如，主机只有GNOME这个窗口管理器，那我如果想要安装KDE，就可以通过yum的软件组功能：</p>

<blockquote>
<p>yum groupinstall xxx</p>
</blockquote>
