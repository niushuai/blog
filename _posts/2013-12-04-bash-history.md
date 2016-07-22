---
layout: post
title: Bash 环境初探
categories: linux
tags: Bash
---

在日常使用linux的时候，我们常常通过两种方式来使用shell：

*   login shell
*   nonlogin shell

以前看《鸟哥的linux私房菜》对这点有了一个大致的认识，知道这两种方式读取的配置不一样，系统通过UID来给相应的账户对应的权限。但是系统究竟怎样做的还不是太清楚。学而不思则罔，因为没有彻底弄清楚bash环境的如何工作的，所以最近遇到了几个跟bash环境相关的问题无法解决。于是查了资料，在这里总结一下：）

首先我们科普一下什么叫login shell，什么叫nonlogin shell。从字面意思很好理解：

*   login shell：login的意思就是是否登陆。如果你使用shell前，输入了账户名和密码，那么这就是login shell
*   nonlogin shell：如果你在系统中不通过账户名和密码直接使用shell，比如在ubuntu中使用ctrl+alt+t，或者是在login shell中执行bash，同样也没有输入账户名和密码（bash的子进程），这些不通过账户名、密码登陆的shell就叫做nonlogin shell

一般情况下，如果是个人电脑，应该会使用X Window（图形化界面）登陆，所以通过X Window登陆linux后，如果以X的图形界面启动终端shell，那么这个终端没有输入账户名和密码，就是nonlogin shell；如果是服务器，使用SSH登陆，必须通过账户名和密码登陆后才能使用，这种情况就是login shell。

总结一下就是：

> 凡是用账户名、密码登陆的就是login shell；不通过账户名、密码登陆的就是nonlogin shell。
下面我们详细说一下bash环境是如何加载的。

### 一、login shell

对login shell来说，它只会读2个文件：

*   系统级别：/etc/profile
*   个人级别：~/.bash_profile或者~/.bash_login或者~/.profile

第二个的意思是3个文件依次查找，找到就不读后面的。比如3个文件都有，先找~/.bash_profile，系统发现有，就读取这个文件，后面2个就不读取了；如果没有~/.bash_profile，但是有~/.bash_login，那么就读取~/.bash_login，不读取~/.profile；如果前两个都没有，才会读取~/.profile。

#### 1./etc/profile

那么，/etc/profile究竟做了什么事情呢？我们先把/etc/profile拿出来看一下

{% highlight bash linenos %}
# /etc/profile

# System wide environment and startup programs, for login setup
# Functions and aliases go in /etc/bashrc

pathmunge () {
	if ! echo $PATH | /bin/egrep -q "(^|:)$1($|:)" ; then
	   if [ "$2" = "after" ] ; then
	      PATH=$PATH:$1
	   else
	      PATH=$1:$PATH
	   fi
	fi
}

# ksh workaround
if [ -z "$EUID" -a -x /usr/bin/id ]; then
	EUID=`id -u`
	UID=`id -ru`
fi

# Path manipulation
	pathmunge /sbin
	pathmunge /usr/sbin
	pathmunge /usr/local/sbin

# No core files by default
ulimit -S -c 0 > /dev/null 2>&1

if [ -x /usr/bin/id ]; then
	USER="`id -un`"
	LOGNAME=$USER
	MAIL="/var/spool/mail/$USER"
fi

HOSTNAME=`/bin/hostname`
HISTSIZE=1000

if [ -z "$INPUTRC" -a ! -f "$HOME/.inputrc" ]; then
    INPUTRC=/etc/inputrc
fi

export PATH USER LOGNAME MAIL HOSTNAME HISTSIZE INPUTRC

for i in /etc/profile.d/*.sh ; do
    if [ -r "$i" ]; then
        if [ "$PS1" ]; then
            . $i
        else
            . $i >/dev/null 2>&1
        fi
    fi
done

unset i
unset pathmunge
alias ls='ls --color=auto'
export HADOOP_HOME=/data0/hadoop/hadoop-0.20.2
export PATH=$HADOOP_HOME/bin:$PATH
export JAVA_HOME=/data0/jdk/jdk1.6.0_33
export PATH=$PATH:$JAVA_HOME/bin
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar

export ANT_HOME=/data0/ant1.8.2
export PATH=$PATH:$ANT_HOME/bin
export PATH=$PATH:/sbin
export LD_LIBRARY_PATH=/usr/lib:/usr/local/lib

{% endhighlight bash %}

从上面脚本我们知道：

1.  pathmunge就是一个扩展PATH的函数，会决定/sbin、/usr/sbin、/usr/local/sbin是否加入PATH，同时根据是否传入after决定放在PATH前面还是后面
2.  $EUID为空 &amp;&amp; /usr/bin/id具有可执行权限，就设置EUID和UID([ID标识)](http://zh.wikipedia.org/wiki/%E7%94%A8%E6%88%B7ID)
3.  ulimit设置不产生core文件（大小限制为0，就是不产生）
4.  将set中的用户专有变量导入env中（子shell可继承）

因为/etc/profile对所有登陆用户生效，所以如果想帮所有登陆用户设置整体bash环境，那么就可以在这里修改。比如上面的HADOOP_HOME/JAVA_HOME/ANT_HOME，因为所有登陆用户都需要，所以就在/etc/profile中设置，当用户登陆后会自动加载的。

#### 2.~/.bash_profile

二话不说，先看看这个文件是干嘛滴

{% highlight bash linenos %}
# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi

# User specific environment and startup programs

PATH=$PATH:$HOME/bin

export PATH
unset USERNAME
{% endhighlight bash %}

从代码我们知道，~/.bash_profile主要干了2件事：

1.  查看~/.bashrc是否存在，存在的话加载~/.bashrc。
2.  补充PATH，加入登陆用户的个人主文件夹到PATH
3.  取消USERNAME变量

然后，继续追击~/.bashrc文件（rc的意思是Run-ControlFiles，这个定义是在UNIX编程艺术中提出的）：

{% highlight bash linenos %}
# .bashrc

# User specific aliases and functions

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Source global definitions
if [ -f /etc/bashrc ]; then
    . /etc/bashrc
fi
{% endhighlight bash %}

我们发现，~/.bashrc主要做了2件事：

1.  设置用户自定义变量别名
2.  加载/etc/bashrc

这里告诉我们，如果想要设置用户自己的命令别名，就可以修改~/.bashrc来完成。接下来继续刨根问底/etc/bashrc文件：

{% highlight bash linenos %}
# /etc/bashrc

# System wide functions and aliases
# Environment stuff goes in /etc/profile

# By default, we want this to get set.
# Even for non-interactive, non-login shells.
if [ $UID -gt 99 ] && [ "`id -gn`" = "`id -un`" ]; then
	umask 002
else
	umask 022
fi

# are we an interactive shell?
if [ "$PS1" ]; then
    case $TERM in
	xterm*)
		if [ -e /etc/sysconfig/bash-prompt-xterm ]; then
			PROMPT_COMMAND=/etc/sysconfig/bash-prompt-xterm
		else
	    	PROMPT_COMMAND='echo -ne "\033]0;${USER}@${HOSTNAME%%.*}:${PWD/#$HOME/~}"; echo -ne "\007"'
		fi
		;;
	screen)
		if [ -e /etc/sysconfig/bash-prompt-screen ]; then
			PROMPT_COMMAND=/etc/sysconfig/bash-prompt-screen
		else
		PROMPT_COMMAND='echo -ne "\033_${USER}@${HOSTNAME%%.*}:${PWD/#$HOME/~}"; echo -ne "\033\\"'
		fi
		;;
	*)
		[ -e /etc/sysconfig/bash-prompt-default ] && PROMPT_COMMAND=/etc/sysconfig/bash-prompt-default
	    ;;
    esac
    # Turn on checkwinsize
    shopt -s checkwinsize
    [ "$PS1" = "\\s-\\v\\\$ " ] && PS1="[\u@\h \W]\\$ "
fi

if ! shopt -q login_shell ; then # We're not a login shell
	# Need to redefine pathmunge, it get's undefined at the end of /etc/profile
    pathmunge () {
		if ! echo $PATH | /bin/egrep -q "(^|:)$1($|:)" ; then
			if [ "$2" = "after" ] ; then
				PATH=$PATH:$1
			else
				PATH=$1:$PATH
			fi
		fi
	}

	# Only display echos from profile.d scripts if we are no login shell
    # and interactive - otherwise just process them to set envvars
    for i in /etc/profile.d/*.sh; do
        if [ -r "$i" ]; then
            if [ "$PS1" ]; then
                . $i
            else
                . $i >/dev/null 2>&1
            fi
        fi
    done

	unset i
	unset pathmunge
fi
# vim:ts=4:sw=4
{% endhighlight bash %}

到这里总算是刨到”祖坟“了，没错。login shell环境加载的最后一站就是/etc/bashrc。那么，我们看看它究竟干了什么事情：

1.  依据UID规定umask的值
2.  依据UID规定提示符（PS1变量）
3.  调用/etc/profile.d/*.sh的设置

那么，总结一下login shell本质上做了两件事：

1.  加载登陆用户的专有变量，比如登陆用户的主文件夹、MAIL等等
2.  根据UID区分不同用户，根据对应权限加载其他bash环境配置

### 二、nonlogin shell

对于nonlogin shell，读取的只有一个文件：

*   .bashrc

其实，我们从上面login shell的加载过程就应该能猜出来的。因为从.bash_profile出来的时候系统的一些配置（如$PATH）、登陆用户的个人变量（如$MAIL、$USERNAME）都已经设置过了。那么接下来就是根据用户UID来进行加载的（我们必须清楚：nonlogin shell虽然没有登陆，但是它是有UID信息的）。所以，.bashrc直接到达/etc/bashrc进行加载umask、PS1等等。

### 三、为什么要区分login shell 和nonlogin shell？

这个问题必须从用户说起，我们知道，linux是多用户、多任务系统，所以不想windows那样直接是管理员。我们各个用户之间的使用是独立的，但有些东西是共有的（比如我想更新一下索引数据库updatedb），这个东西是root管理的，我们这些苦逼的普通用户是无法更新的。于是我们可以su（switch user）到root后更新（前提是你有root密码）。

### 1.su、su -、sudo的区分

*   su：nonlogin shell，不完全切换到root
*   su -：login shell，完全切换到root
*   sudo：不使用root登陆执行root命令，决定于/etc/sudoers

就想上面说的，有时候我们需要切换到root来执行一些命令。如果你手头的工作干到一半，需要暂时用到root执行一个命令后才能继续干活，而且用root的时候需要使用当前环境设置的变量等等，那就使用su；如果你把手头的工作做完了，需要完全切换到root干别的事情，就使用su -。举个例子：

你在当前bash中定义$WORK=/usr/home/niushuai/code，并且export WORK了。这个$WORK就是env变量了。这时，你使用su暂时切换到root，bash环境还是原用户的，所以$WORK变量还是/usr/home/niushuai/code；如果你使用su -完全切换到root，那么bash环境会重新按照login shell重新加载，$WORK是不会存在的（我指root没有刻意设置过$WORK）。

至于原因，从上文可以轻松知道：

*   su：nonlogin shell，读取~/.bashrc，读取/etc/bashrc，这是系统设置刷新，个人设置还是原来的用户设置
*   su -：login shell，读取/etc/profile、~/.bash_profile、~/.bashrc、/etc/bashrc，从个人到系统都完全是root的

但是问题是，如果用户都知道root的密码，那么很容易出现误操作。所以，为了安全起见，我给可以使用root命令的用户建立一个白名单-&gt; /etc/sudoers，这样，每当一个用户需要用到root权限时，系统管理员登陆root账号，通过visudo命令在/etc/sudoers中添加该用户为白名单，就解决了普通用户使用root和系统安全的问题。

#### 2. login shell和nonlogin shell

其实，通过su和su -的例子，我们就应该明白为啥有这两种shell模式的原因了。因为某些场景下，比如一个团队合作，有A/B两个账户，A工作需要用到B提供的数据，但是B的数据放在B才能进入的目录中，而A完整这个任务需要使用A环境的变量才能完成，那么我可以使用nonlogin shell使用B账户，这样就有了A环境+B账户的数据；而如果A活干完了，要开始干B的活了，而B活需要用到很多B账户的环境变量，那么我就用login shell登陆B。

当然，上面的例子很不合理，只是说明问题用的。因为一个团队开发，是可以建立在一个group中，而group的目录也有特殊权限来实现目录的共享/独立，这个想了解的可以学习一下特殊权限，这里就不延伸了：）
