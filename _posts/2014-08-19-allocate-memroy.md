---
layout: post
title: C 内存分配函数
categories: redis
tags: 内存分配
---

###内存分配

在看 redis 源码的内存分配时，发现 C 语言的内配函数都有点分不清了。。于是上网搜点资料复习一下吧。。。

内存区域可以分为栈，堆，静态存储区和常量存储区。C 标准函数库提供了许多函数来实现对堆上内存管理，其中包括：

* malloc函数：malloc函数可以从堆上获得指定字节的内存空间（必须初始化）
* free函数：释放内存，防止内存泄露
* calloc函数：与 malloc类似，但不需要初始化
* realloc函数：重新分配内存

使用这些函数需要包含头文件stdlib.h。下面逐个说明。

####1. malloc函数

malloc函数可以从堆上获得指定字节的内存空间，其函数原型如下：

`void * malloc(int n)`

其中，形参n为要求分配的字节数。如果函数执行成功，malloc返回获得内存空间的首地址；如果函数执行失败，那么返回值为NULL。由于malloc函数值的类型为void型指针，因此，可以将其值类型转换后赋给任意类型指针，这样就可以通过操作该类型指针来操作从堆上获得的内存空间。

> 需要注意的是,malloc函数分配得到的内存空间是未初始化的。因此，一般在使用该内存空间时，要调用另一个函数memset来将其初始化为全0。memset函数的声明如下：
>
> `void * memset (void * p,int c,int n)`
>
> 该函数可以将指定的内存空间按字节单位置为指定的字符c。其中，p为要清零的内存空间的首地址，c为要设定的值，n为被操作的内存空间的字节长度。如果要用memset清0，变量c实参要为0。malloc函数和memset函数的操作语句一般如下：

{% highlight c linenos %}
int * p=NULL;
p=(int *)malloc(sizeof(int));
if(p==NULL)
    printf("Can't get memory!\n");
memset(p,0,siezeof(int));
{%endhighlight c %}

Tips:

> **通过malloc函数得到的堆内存必须使用memset函数来初始化**

{% highlight c linenos %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {

     int * p=NULL;
     p=(int *)malloc(sizeof(int));
     if(NULL==p){
         printf("Can't get memory!\n");
         return -1;
     }

     printf("%d\n",*p);           //输出分配的空间上的值
     memset(p,0,sizeof(int));     //将p指向的空间清0
     printf("%d\n",*p);           //输出调用memset函数后的结果

     *p=2;
     printf("%d\n",*p);
     return 0;
}
/*output:
0
0
2
*/
{%endhighlight c %}

####2. free函数

从堆上获得的内存空间在程序结束以后，系统不会将其自动释放，需要程序员来自己管理。一个程序结束时，必须保证所有从堆上获得的内存空间已被安全释放，否则，会导致内存泄露。例如上面的demo就会发生内存泄露。

free函数可以实现释放内存的功能。其函数声明为：

`void free (void * p)`

由于形参为void指针，free函数可以接受任意类型的指针实参。但是，free函数只是释放指针指向的内容，而该指针仍然指向原来指向的地方，此时，指针为野指针，如果此时操作该指针会导致不可预期的错误。安全做法是：在使用free函数释放指针指向的空间之后，将指针的值置为NULL。因此，对于上面的demo，需要在return语句前加入以下两行语句：

{% highlight c linenos %}
free(p);
p=NULL;
{%endhighlight c %}

Tips:

> **使用malloc函数分配的堆空间在程序结束之前必须释放**

####3. calloc函数

calloc函数的功能与malloc函数的功能相似，都是从堆分配内存。其函数声明如下：

`void *calloc(int n,int size)`

函数返回值为void型指针。如果执行成功，函数从堆上获得size X n的字节空间，并返回该空间的首地址。如果执行失败，函数返回NULL。该函数与malloc函数的一个显著不同时是，**calloc函数得到的内存空间是经过初始化的，其内容全为0。**calloc函数适合为数组申请空间，可以将size设置为数组元素的空间长度，将n设置为数组的容量。

{% highlight c linenos %}
#include <stdio.h>
#include <stdlib.h>
#define SIZE 5

int main() {
     int * p=NULL;
     int i=0;
     //为p从堆上分配SIZE个int型空间
     p=(int *)calloc(SIZE,sizeof(int));
    if(NULL==p){
         printf("Error in calloc.\n");
         return -1;
     }

     //为p指向的SIZE个int型空间赋值
     for(i=0;i<SIZE;i++)
         p[i]=i;
     //输出各个空间的值
     for(i=0;i<SIZE;i++)
         printf("p[%d]=%d\n",i,p[i]);
     free(p);
     p=NULL;
     return 0;
}
/*output:
p[0]=0
p[1]=1
p[2]=2
p[3]=3
p[4]=4
*/
{%endhighlight c %}

Tips：

> **calloc函数的分配的内存也需要自行释放**

####4. realloc函数

realloc函数的功能比malloc函数和calloc函数的功能更为丰富，可以实现内存分配和内存释放的功能，其函数声明如下：

`void * realloc(void * p,int n)`

其中，指针p必须为指向堆内存空间的指针，即由malloc函数、calloc函数或realloc函数分配空间的指针。realloc函数将指针p指向的内存块的大小改变为n字节。如果n小于或等于p之前指向的空间大小，那么。保持原有状态不变。如果n大于原来p之前指向的空间大小，那么，系统将重新为p从堆上分配一块大小为n的内存空间，同时，将原来指向空间的内容依次复制到新的内存空间上，p之前指向的空间被释放。relloc函数分配的空间也是未初始化的。

注意：**使用malloc函数，calloc函数和realloc函数分配的内存空间都要使用free函数或指针参数为NULL的realloc函数来释放。**

{% highlight c linenos %}
#include <stdio.h>
#include <stdlib.h>

int main() {
     int * p=NULL;
     p=(int *)malloc(sizeof(int));
     *p=3;
     printf("p=%p\n",p);
     printf("*p=%d\n",*p);
     p=(int *)realloc(p,sizeof(int));
     printf("p=%p\n",p);
     printf("*p=%d\n",*p);
 
     p=(int *)realloc(p,3*sizeof(int));
     printf("p=%p\n",p);
     printf("*p=%d",*p);
    //释放p指向的空间
     realloc(p,0);
     p=NULL;
 
     return 0;
}
/*output:
p=0x7fcd80403970
*p=3
p=0x7fcd80403970
*p=3
p=0x7fcd80403970
*p=3
*/
{%endhighlight c %}

Tips：

> **如果要使用realloc函数分配的内存，必须使用memset函数对其内存初始化**
