---
layout: post
title: Java右移操作
categiroes: Java
tags: 移位
---

今天看HashMap源码的时候，发现了这样一段代码：

{% highlight java linenos %}
/**
     * Retrieve object hash code and applies a supplemental hash function to the
     * result hash, which defends against poor quality hash functions.  This is
     * critical because HashMap uses power-of-two length hash tables, that
     * otherwise encounter collisions for hashCodes that do not differ
     * in lower bits. Note: Null keys always map to hash 0, thus index 0.
     */
    final int hash(Object k) {
        int h = hashSeed;
        if (0 != h && k instanceof String) {
            return sun.misc.Hashing.stringHash32((String) k);
        }

        h ^= k.hashCode();

        // This function ensures that hashCodes that differ only by
        // constant multiples at each bit position have a bounded
        // number of collisions (approximately 8 at default load factor).
        h ^= (h >>> 20) ^ (h >>> 12);
        return h ^ (h >>> 7) ^ (h >>> 4);
    }
{% endhighlight java %}

咱们先不谈这段代码什么意思（其实就是用给定的key寻找HashMap底层数据结构hashtable的索引），其中出现了`>>>`操作符，以前没有见过。

然后google又间歇性抽风，就用百度和必应凑合搜了一下，结果意料之中的呵呵呵。于是果断重启goagent，上google。第一条就是stackoverflow的解答，后面几条还有官方文档解释，我贴下官方解释：

> The signed left shift operator "<<" shifts a bit pattern to the left, and the signed right shift operator ">>" shifts a bit pattern to the right. The bit pattern is given by the left-hand operand, and the number of positions to shift by the right-hand operand. **The unsigned right shift operator ">>>" shifts a zero into the leftmost position, while the leftmost position after ">>" depends on sign extension.**

总结一下就是：

> java一共有三个移位操作符，`<<`，`>>`，`>>>`。我们发现左移操作没有`<<<`，而右移有两个是为了考虑signed类型。我们都知道，数字在计算机中是用二进制存储的，正数不用说就是原码，负数就是先求反码，然后求补码。而Java**没有unsigned类型**，所以最高位是用来表示正负的，0是正数，1是负数。

那么我们用一个程序来说明为啥要存在两种右移吧。

{% highlight java linenos %}
public class TestOperator {
        public static void main(String[] args) {
                System.out.println(Integer.toBinaryString(-2));
                System.out.println(Integer.toBinaryString(-2 >>> 1));
                System.out.println(Integer.toBinaryString(-2 >> 1));
        }
}/*output:
11111111111111111111111111111110
1111111111111111111111111111111
11111111111111111111111111111111
*/
{% endhighlight java %}

我们从结果可以看出来，最后的二进制不一样。说明执行这两个操作是不同的。仔细观察会发现，`>>>`在最左边添加了一个0，而`>>`在最左边加了一个1。且看：

> `>>` is arithmetic shift right, `>>>` is logical shift right.
>
> In an arithmetic shift, the sign bit is extended to preserved the signedness of the number.
>
> For example, -2 in 8 bits would be 11111110 (because the most significant bit has negative weight). Shifting it right one bit using arithmetic shift would give you 11111111, or -1. Logical right shift, however, does not care that the value could possibly represent a number; it simply moves everything to the right and fills in from the left with 0s. Shifting our -2 right one bit using logical shift would give 01111111.

上面解释已经够清楚了，`>>`是算术位移，会根据最前面的符号拓展进行添加（符号位是神马，我就添加神马）；`>>>`是逻辑位移，我不管你是啥，我就在最左边加0。

但是我们还得思考一个问题：Java为啥要“多此一举”呢？C++既然区分signed和unsigned，那么又为什么没有这个操作吗？

哎，这个还得我去问问别人。我自己是没搞定啊。
