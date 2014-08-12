---
layout: post
title: coolshell谜题通关
categories: 吐槽
tags: coolshell
---

###一、前言

周末在微博上看到 coolshell 博主陈皓搞了一个编程小游戏，就是过关的那种。感觉很有趣，就打开看了看。然后有空没空搞了3天才算搞定，感觉眼界开阔了一些，但是对每一关涉及到的知识都太肤浅，这里先记录一下通关过程，至于涉及到的知识会在最近学习一下：）

首先，游戏地址送出：[coolshell 大闯关](http://fun.coolshell.cn)，游戏规则很简单。每一关都需要得到一个结果，填进 url 即可进入下一关。下面是通关攻略（强烈建议自己先试试，每一关如果20分钟都没思路就可以看看攻略了）

###二、通关过程

####0. first.html

这一关由两部分组成：

1. 一段乱七八糟的符号
2. 一个提示语：My brain has been fucked

当我打开这个页面的时候，感觉这啥玩意啊。难道是正则表达式提取？于是看了看+号，依次是1个，2个，3个……然后又找了各种规律找不到，很是郁闷。于是就去干别的了。等我无聊的时候打开了这个页面的源代码，灵光一现发现上面不是纯文本，而是一段 code，那提示语应该跟 code 相关吧？于是就在网上开始搜，百度必应不出意料的呵呵呵（原谅我一直黑，但这是事实啊。。），于是用 google 开始搜，(⊙o⊙)…然后发现 fuck 被 google 过滤了，和简单，把安全过滤去掉就好了（中文版 google 是不能去掉安全过滤的，你懂的。所以切换到中文繁体，然后在右下方的设置里面去掉安全过滤之后拉到最下面保存即可）。然后看了几个网页，进了英文版的 wikipedia，然后答案就很明显了。原来有门编程语言叫做 brainfuck。之后就很 easy 了，可以看看这是静态还是动态的，静态的就找个编译器和解释器，动态的直接在网上找个解释器就好。我随手搜了个在线运行的网站，把代码贴进去。执行结果是`welcome`，于是下一关就被打开了。

总结一下：

* [brainfuck wiki](http://en.wikipedia.org/wiki/Brainfuck)
* 找一个在线执行 brainfuck 代码的网站，比如这个[brainfuck](http://ideone.com/)
* 贴进去点击 Run，看输出就哦了

####1. welcome.html

这关很简单的其实，根据等比数列，可以首先得到一个数字：18 * 108=1944。然后试一下，发现这个1944对了。但是还有其他答案，应该是在那句话里。这次聪明了直接 google，然后直接知道是42。然后发现也对了，但是没有进入下一关。从 X * Y 那个来看，难道是求一下乘积？尝试着 1944 * 42 = 81648。然后就过关了= =

总结一下：

* 生命、宇宙以及任何事情的终极答案——42，为什么？你丫不会 google 啊

####2. 81648.html

一个硕大的键盘，鼠标滑过图片发现可以点击。然后会进入一个 wiki，大概看看介绍，这个布局是为了提高打字速度设计的，跟目前的布局也是一一对应的，然后自己人肉翻译一下即可，得到下面的代码：

{% highlight c linenos %}
main() { printf(&unix["\021%six\012\0"],(unix)["have"]+"fun"-0x60);}
{% endhighlight c %}

发现原来是一段 C 代码，用 gcc 编译执行后，输出 unix，得解。

总结一下：

* 为打字出现的Dvorak Simplified Keyboard和目前使用的QWERTY键盘布局
* 那段代码很有厉害，可自行 google 一下

####3. unix.html

出来一个二维码，用微信扫一下发现是一个字典。结合二维码下面那一段话，就非常简单了。写段程序翻译一下即可。随手写了一个：

{% highlight c linenos %}
#include<stdio.h>
#include<ctype.h>
#include<string.h>
#include<stdlib.h>

#define N 1000
char a[] = "abcdefghijklmnopqrstuvwxyz";
char b[] = "pvwdgazxubqfsnrhocitlkeymj";
char ci[N];

char find(char c) {
  int i;
  for(i = 0; i < 26; i++) {
    if(c == b[i]) {
      break;
    }
  }
  return a[i];
}

int main() {
  char *str = "Wxgcg txgcg ui p ixgff, txgcg ui p epm. I gyhgwt mrl lig txg ixgff wrsspnd tr irfkg txui hcrvfgs, nre, hfgpig tcm liunz txg crt13 ra \"ixgff\" tr gntgc ngyt fgkgf.";

  int len = strlen(str);
  for(int i = 0; i < len; ++i) {
    char c = str[i];
    if(isalpha(c) && islower(c)) {
      ci[i] = find(c);
    } else {
      ci[i] = c;
    }
  }

  printf("%s\n", ci);
  return 0;
}/*output:
Where there is a shell, there is a way. I expect you use the shell command to solve this problem, now, please try using the rot13 of "shell" to enter next level.
*/
{% endhighlight c %}

发现输出需要用到 rot13，这是啥？！google 一下就知道了，原来就是一个简单的加密工具，因为英文字母有26个，13对，所以正好可以一一对应。然后 google 一下使用方法就可以了，或者懒得直接找一个在线 rot13转换的工具，输入 shell 后得到结果：furyy

总结一下：

* 学习一下 rot13这种加密方式：[rot-13 wiki](http://zh.wikipedia.org/wiki/ROT13)

####4. furyy.html

因为以前在玩正则表达式的游戏时遇到个这个模式，瞬间就知道这个是考察正则的了。根据那个单词，知道是回文字符串。根据图示知道需要找出能匹配左边8个单词的模式，然后提示语说在源码中有东西。打开源代码拉到最下面有一大段文本，保存到一个文件中。

这时候思路已经很明显了，用找出来的模式去匹配这段文本。那么，首先就需要找出这个模式，如果以前学过正则表达式的话，应该是很 easy 的。如果不太会，在下面总结的时候我会推荐一个讲解正则表达式很好的地方，配套有一个练习的地方（额，难度略高）。

找出来这个模式也很简单，人肉看下就是：

* 第一个字符是大写或者数字
* 第二个字符是大写或者数字
* 第三个字符是小写
* 第二个字符
* 第一个字符

所以，考察的就是最简单的正则表达式，其中回文也可以用正则中的`()`来匹配。这样答案就出来了：

> `([A-Z])([0-9])[a-z]\2\1|([0-9])([A-Z])[a-z]\4\3`

然后有输入了，有处理过程了，执行一下即可得到输出：

> `egrep -o '([A-Z])([0-9])[a-z]\2\1|([0-9])([A-Z])[a-z]\4\3' palindrome`

然后就可以得到答案：

```
E1v1E
4FaF4
9XrX9
O3i3O
0MaM0
4GbG4
M5l5M
0WeW0
Y0s0Y
```

这几个都是回文串，我们根据 cat 是最中间小写字母的原则拿出来，得到答案：variables

总结一下：

* [正则表达式学习](http://deerchao.net/tutorials/regex/regex.htm)
* [正则表达式游戏](http://regex.alf.nu)

####5. variables.html

妈蛋这个页面让我困了大半天，不知道想表达什么意思。我以为是那个数字有特殊的含义，google 了半天找到看起来靠谱的英文。好像是美国哪个州的 zipcode 啥的，填进去各种404，让我很是崩溃。。。 最后也没搞定，是看了网上已经出来的攻略才知道。。（这次写攻略才发现那句提示有点作用，让你 keep try...）

原来需要拿那个数字替换 url 中的2014，于是我就替换了，大概替换了10多次，还是需要替换。。估计要写个程序的样子，于是用 shell 写了个 while 循环，里面就是一个简单的 curl 命令，最后得到了答案：tree

总结一下：

* 善于观察，这道题如果仔细看说不定会找到思路，，，，不过嘛，，，，，，，，，，遇到我这种智商的就，，，，，，，不说了，擦泪去

####6. tree.html

这道题就简单了，就是一个树。扫了一眼就知道题意是由中序和后序还原树，然后求得最深路径。于是写了一段代码，特么由于好久没碰指针，各种凌乱，吭哧吭哧花了将近1个小时才搞定，，，真是弱爆了。。。。

{% highlight c linenos %}
#include<iostream>
#include<ctype.h>
#include<stdio.h>
#include<string.h>
using namespace std;

struct Node
{
  char value;
  Node *left;
  Node *right;
};

string t_in, t_post;
char in[100], post[100];
char deep[100], final[100];
int maxlen;

void init() {
  int p = 0;
  for(int i = 0; i < t_in.length(); i++) {
    if(isalnum(t_in[i]))
      in[p++] = t_in[i];
  }

  p = 0;
  for(int i = 0; i < t_post.length(); i++) {
    if(isalnum(t_post[i]))
      post[p++] = t_post[i];
  }
}

Node* build(char *in, char *post, int len) {
  if(len == 0)
    return NULL;

  Node *cur = new Node;
  cur->value = post[len - 1];
  int lenp = strchr(in, cur->value) - in;
  cur->left = build(in, post, lenp);
  cur->right = build(in + lenp + 1, post + lenp, len - 1 - lenp);

  return cur;
}

void pre_order(Node *root) {
  if(root == NULL) {
    return ;
  }

  cout<<root->value;
  pre_order(root->left);
  pre_order(root->right);
}

void find(Node *root, int depth) {
  if(root == NULL) {
    if(depth - 1 > maxlen) {
      maxlen = depth - 1;
      memcpy(final, deep, sizeof(deep));
    }
    return ;
  }

  deep[depth] = root->value;
  find(root->left, depth + 1);
  find(root->right, depth + 1);
}

int main(void) {
  Node *root = new Node;
  t_in = "T, b, H, V, h, 3, o, g, P, W, F, L, u, A, f, G, r, m, 1, x, J, 7, w, e, 0, i, Q, Y, n, Z, 8, K, v, q, k, 9, y, 5, C, N, B, D, 2, 4, U, l, c, p, I, E, M, a, j, 6, S, R, O, X, s, d, z, t";
  t_post = "T, V, H, o, 3, h, P, g, b, F, f, A, u, m, r, 7, J, x, e, w, 1, Y, Q, i, 0, Z, n, G, L, K, y, 9, k, q, v, N, D, B, C, 5, 4, c, l, U, 2, 8, E, I, R, S, 6, j, d, s, X, O, a, M, p, W, t, z";
  init();
  cout<<in<<endl;
  cout<<post<<endl;
  root = build(in , post, strlen(in));
  pre_order(root);
  cout<<endl;
  maxlen = 0;
  find(root, 0);
  cout<<final<<endl;
  return 0;
}/*output:
TbHVh3ogPWFLuAfGrm1xJ7we0iQYnZ8Kvqk9y5CNBD24UlcpIEMaj6SROXsdzt
TVHo3hPgbFfAumr7Jxew1YQi0ZnGLKy9kqvNDBC54clU28EIRS6jdsXOaMpWtz
zWbTghHV3oPp8LFGuAfn01rmwxJ7eiQYZ25vKqk9yCBNDU4lcMIEaOj6SRXsdt
zWp8LGn01wxJ7
*/
{% endhighlight c %}

然后使用上面给的 openssl 命令进行解密即可：

> `echo "U2FsdGVkX1+gxunKbemS2193vhGGQ1Y8pc5gPegMAcg=" | openssl enc -aes-128-cbc -a -d -pass pass:zWp8LGn01wxJ7`

得到答案：nqueens

总结一下：

* 二叉树遍历，又中序、后序还原树结构，或者由其中2种序列还原树结构
* openssl 是神马东西？怎么使用？

####7. nqueens.html

这个一看就是9皇后问题，以前写过八皇后。这里是要输出所有的9皇后序列，然后要满足那个等式。于是写了一个八皇后输出所有的序列：

{% highlight c linenos %}
#include<iostream>
#include<cstring>
#include<cstdio>
using namespace std;

const int N = 10;
bool visit[N][N];
int total, sum;

bool is_put(int x, int y)					  //当前行、列
{
	for(int i = 1; i < x; ++i)
	{
		if(visit[i][y])						  //行
			return false;
		for(int j = 1; j <= 9; ++j)
		{
			if(visit[i][j] && j - i == y - x) //主对角线
				return false;
			if(visit[i][j] && j + i == y + x) //副对角线
				return false;
		}
	}

	return true;
}

void print() {
	for(int j = 9; j >= 1; j--)
		for(int i = 1; i <= 9; i++)
			if(visit[i][j])
				cout<<i;
	cout<<endl;
}

void DFS(int n)
{
	if(n > 9)
		return ;

	for(int i = 1; i <= 9; ++i)
	{
		visit[n][i] = true;
		if(is_put(n, i)) //当前能放
		{
			if(n == 9) {
				sum++;
				print();
			}
				
			DFS(n + 1);
		}

		visit[n][i] = false;
	}
}



int main()
{
	memset(visit, false, sizeof(visit));
	sum = 0;
	DFS(1);
	cout<<sum<<endl;
	return 0;
}
{% endhighlight c %}

这个程序会输出所有9皇后的序列 。一共352个。然后代入那个公式，因为我的 mac 上没有 sha1这个命令，然后我一 google 发现 python 有个现成的库，巨简单。。。于是就写了 python 程序，搞定之。


{% highlight python linenos %}
#!/bin/python

import hashlib

passwd="zWp8LGn01wxJ7"

array=(748396251, 753968241, 538479261, 649582731, 579382461, 849362751, 853972461, 473862951, 536972481, 579428631, 793528641, 463928571, 473825961, 368529741, 379425861, 475296831, 695283741, 758293641, 835296471, 738246951, 368249751, 592473861, 742963581, 642793581, 642839751, 625793841, 629538471, 526938471, 594682713, 683792514, 539682417, 384792516, 394852617, 963728514, 793824615, 493627518, 463925817, 738629514, 538629714, 539428617, 538429617, 369724815, 685297413, 964285713, 794258613, 468257913, 758296314, 369257418, 582736914, 942736815, 382497516, 625794813, 529637418, 428397516, 257936418, 269358417, 285396417, 295384716, 584973162, 849357162, 853697142, 953847162, 536974182, 374859162, 847926135, 946827135, 973825164, 538629147, 536928147, 386925147, 396824175, 974286135, 479258136, 936275184, 639258174, 637285149, 637249185, 637248159, 358296174, 396257148, 358297146, 359247186, 394286175, 374296158, 374295186, 852974136, 642859137, 942586137, 582963147, 592683147, 642853197, 372859164, 372864159, 526974138, 524973168, 528379164, 528374196, 429368157, 257948136, 258693174, 258693147, 249753168, 296358147, 296374185, 248396157, 579481362, 586931742, 946831752, 479631852, 473691852, 386491572, 849731625, 863971425, 473861925, 463971825, 536971428, 369581427, 369741825, 968241753, 468251973, 475291683, 479261358, 468271359, 475291386, 738251946, 736251948, 935281746, 936271485, 369281475, 572681493, 572481963, 742951863, 572481396, 742861359, 742591386, 742581369, 582931746, 582731946, 572631849, 362951847, 392581746, 372481596, 925741863, 829631475, 926831475, 296471358, 279631485, 286931475, 249731685, 869314752, 736814952, 936418572, 695813724, 495813627, 796318524, 468317529, 495316827, 736815924, 635819724, 835916427, 635819427, 368519724, 396417528, 697418253, 958417263, 964718253, 469318257, 495317286, 485317269, 485316297, 639714258, 635814279, 639418257, 637419258, 369714258, 359417268, 862714953, 852417963, 852914736, 752814936, 972418536, 852417936, 792613584, 962713584, 682713594, 752813964, 352817469, 362714859, 352814796, 825714693, 427915863, 724918536, 724619538, 427918536, 429518637, 728613594, 925713864, 425813697, 726318594, 427318596, 275814639, 259418637, 257413968, 586137942, 574139682, 584136972, 853174692, 574138629, 574136928, 368147529, 695184273, 647185293, 748159263, 948136275, 649137285, 647139285, 963185247, 683195247, 953168247, 693184275, 368159247, 369184275, 394186275, 574182963, 584172639, 647182539, 849152637, 649152837, 683192574, 953172864, 853162974, 386192574, 379152864, 357142869, 528147963, 724185963, 824179635, 528179364, 529168374, 524179368, 526137948, 275194683, 258196374, 258136974, 257138649, 247139685, 263184975, 751693842, 581473692, 741853692, 861357942, 741396852, 471396852, 631849752, 751863924, 691473825, 461973825, 861379425, 831479625, 951468273, 461958273, 791358246, 741386295, 741369285, 731685249, 731958246, 631479258, 681592473, 851692473, 571682493, 681742953, 641792853, 841752693, 471692853, 951842736, 581942736, 941582736, 471852936, 481572639, 631852974, 531682479, 571428693, 741529683, 741829635, 741926835, 461528379, 531728649, 531629748, 261958473, 281479635, 261748359, 241796358, 261753948, 261379485, 617483592, 714693582, 714853962, 814639752, 615793824, 814736925, 318497526, 615794283, 518637249, 419637285, 814752963, 413692857, 319752864, 316852497, 317582469, 314792586, 518427963, 716924835, 716824935, 417926835, 415926837, 718529364, 815726394, 516428397, 415827369, 716258493, 615297483, 714286935, 415297386, 317286495, 174839625, 174835926, 148397526, 157938246, 185397246, 185369247, 168374295, 157942863, 159642837, 174692538, 146392857, 147382596, 138692574, 168524973, 147925863, 169528374, 175829364, 146825397, 136824975, 184279635, 159268374, 164279358, 157263948, 164283975, 137285946, 162974835, 142869357, 152693847)


for code in array:
  if(hashlib.sha1(passwd + str(code) + "\n").hexdigest() == "e48d316ed573d3273931e19f9ac9f9e6039a4242"):
    print code
{% endhighlight python %}

原谅我这么搓比的方法吧，，，，因为我用 C 跑出来的解，不想用 python 再写一遍，就用 vim 的宏录制搞了一份放到 python 的tuple 里面，正好也不用变，所以就放到 tuple 了。hiahiahia~~~

然后程序的结果就出来了：953172864

总结一下：

* N 皇后问题，8皇后一共92个解，如果不算旋转，一共12个独立解。而9皇后有352个解
* 学会使用 sha1，虽然我图省事用了 python。妈蛋看了别人攻略，全程 python，代码比我短一大截啊！！！妈妈我也要用 python

####8. 953172864.html

这道题算是比较简单了，说白了就是24进制。如果想省事可以用 google 计算器，反正最大的就是26^8，应该可以搞定。具体就是直接在搜索框里面输入对应的计算公式，最后结果就出来了。。。真是嗨到爆，涨姿势了。。。。但是我当时不知道啊！摔！！！正好 java 有大数类，就搞了一下，松松的无压力。

{% highlight java linenos %}
import java.math.BigInteger;

public class BigNumber {
	public static void main(String[] args) {
		BigInteger bigInteger = BigInteger.ZERO;
		bigInteger = bigInteger.add(BigInteger.valueOf(3*26*26*26*26).multiply(BigInteger.valueOf(26*26*26*26)));
		bigInteger = bigInteger.add(BigInteger.valueOf(15*26*26*26).multiply(BigInteger.valueOf(26*26*26*26)));
		bigInteger = bigInteger.add(BigInteger.valueOf(15*26*26).multiply(BigInteger.valueOf(26*26*26*26)));
		bigInteger = bigInteger.add(BigInteger.valueOf(12*26*26).multiply(BigInteger.valueOf(26*26*26)));
		bigInteger = bigInteger.add(BigInteger.valueOf(19*26*26).multiply(BigInteger.valueOf(26*26)));
		bigInteger = bigInteger.add(BigInteger.valueOf(8*26).multiply(BigInteger.valueOf(26*26)));
		bigInteger = bigInteger.add(BigInteger.valueOf(5*26*26));
		bigInteger = bigInteger.add(BigInteger.valueOf(12*26));
		bigInteger = bigInteger.add(BigInteger.valueOf(12));
		
		System.out.println(bigInteger);
		
		BigInteger bigInteger2 = BigInteger.ZERO;
		bigInteger2 = bigInteger2.add(BigInteger.valueOf(19*26*26).multiply(BigInteger.valueOf(26*26)));
		bigInteger2 = bigInteger2.add(BigInteger.valueOf(8*26*26).multiply(BigInteger.valueOf(26)));
		bigInteger2 = bigInteger2.add(BigInteger.valueOf(5*26*26));
		bigInteger2 = bigInteger2.add(BigInteger.valueOf(12*26));
		bigInteger2 = bigInteger2.add(BigInteger.valueOf(12));
		
		System.out.println(bigInteger2);
		
		System.out.println(bigInteger.divide(bigInteger2));
		
	}
}/*output:
751743486376
8826856
85165
*/
{% endhighlight java %}

刚开始比较傻逼，直接在 valueOf 里面搞一大串，然后结果竟然是负数，我纳闷了一阵吐血的发现：尼玛 valueOf 里面还是 Integer 类型啊，真是傻逼到家了。。。。。然后分开了就对了。。。。。。。。。这智商，哎。。。

得到85165之后，用24除就可以得到答案了：DUYO

总结一下：

* Java 大数类的应用
* google 好强啊！！！！有时间了解了解 google 搜索框还能干啥~

####9. DOYO.html

打开一看，尼玛一头猪。。。还以为要讽刺我呢~~~然后这次聪明点了，先拿鼠标去晃，hiahiahiahia，果然有东西。于是乐呵呵的准备 google。然后发现妈蛋又被 GFW 艹了。。。于是小心翼翼的打开 bing,输入关键字 pigpen freemason，出来了几个看着还靠点谱的网页。在第一个点进去就明白了。。。。[bing 终于良心了一次](http://www.civilwarsignals.org/cipher/pigpencipher.html)。然后就知道其实是根据字母和边框组成了加密方式。。。。稍微一翻译就得到了结果是 HELLO WORLD。。很是意外啊，有木有！！！！于是又贱兮兮的去用百度，妈蛋第一个竟然是 wikipedia ！！！我吓得不轻啊，baidu 和 bing 这俩极品竟然也能返回一次正确结果啊。。。。然后重启 goagent 后用 google，果然第一位直接就是 wikipedia 了，意料之中，低调低调。

于是答案就是：HELLO WORLD，但是很悲剧的输入后发现又404了。。魂淡。。难道还要进行什么转换？？但是也没说明了，又尝试看了网页的源代码，发现了这样一句话：

> Combine these two words with using lowercase

然后我又看了原网页，用鼠标滑过那个加密信息，直接也显示了那句话。。（我这是多2B 啊。。。。。。）

所以最终的答案就是：helloworld

然后意外的发现——竟然通关了！！！可惜我搞定的时候已经过了3天了，Top100已经满了，，，而且我还看过一次别人的攻略。。。囧。。

总结一下：

* 学习一下[朱高密码](http://en.wikipedia.org/wiki/Pigpen_cipher)

###三、通关感受

总之，玩了这个游戏吧，感觉知识面还是太窄，而且很多东西都是知道个皮毛。比如 openssl，前阵子爆出来的 heartbeat 漏洞闹出了那么大的动静，但是也仅仅只是知道有 bug，具体是什么也没有追究过。也没有具体了解过 openssl 的原理。。不过还好知道点基础的，比如 openssl 是工作在传输层和应用层之间，将应用层的数据进行加密后才传给传输层，使用最广泛的就是 https。嗯，最近抽空把这个相关的东西看看吧。。。。

另外基本功还是得加强，一个二叉树，一个 N 皇后都半天搞不定了，好弱。。。。

虽然通关了，但是想最后一关的标题一样，仅仅是 helloworld。那么第一步就是把涉及到的知识都学一下吧，fighting~~
