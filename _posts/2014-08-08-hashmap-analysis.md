---
layout: post
title: HashMap 源码剖析
categories: Java
tags: HashMap
---

在 Java 集合类中，使用最多的容器类恐怕就是 HashMap 和 ArrayList 了，所以打算看一下它们的源码，理解一下设计思想。下面我们从 HashMap 开始说起。首先我们看下源码的版本：

{% highlight bash linenos %}
java version "1.7.0_45"
Java(TM) SE Runtime Environment (build 1.7.0_45-b18)
Java HotSpot(TM) 64-Bit Server VM (build 24.45-b08, mixed mode)
{% endhighlight bash %}

接下来直接开始上代码了。

###一、HashMap 的实现原理

我们先从整体上把握一下 HashMap 的设计，其实也很简单，就是哈希表的使用，我们直接上图说明会更好。

![img](../image/hashtable.png)

这个图就是 HashMap 的核心，如果把这张图看懂了，其实 HashMap 已经理解了一大半。如果学过数据结构，这玩意就没啥说的了。简单总结一下：

> HashMap 使用哈希表作为底层数据结构，而哈希表的实现是结合**数组和链表**。我们知道数组的优点是分配连续内存，寻址迅速；而链表对于插入删除特别高效，所以综合使用数组和链表，就能进行互补。我们在插入删除的时候，首先根据 key 的 hash 值进行数组定位，每个数组都挂着一个链表，代表相同的 key 的元素，如果 hash 函数设计得当，基本不会出现链表过长的问题，这样就可以做到 O(1)插入、查询，所以极其高效。

###二、文档

第二步就是去看下文档，看看能不能捞到有效的信息。这里我直接 copy 一下官方文档吧。

> **Hash table based implementation of the Map interface（说明实现原理）**. This implementation provides all of the optional map operations, and permits null values and the null key. (**The HashMap class is roughly equivalent to Hashtable, except that it is unsynchronized and permits nulls.)（一句话说明 HashMap 和 HashTable 的区别）** This class makes no guarantees as to the order of the map（这个在讲到 transfer 的 时候就知道原因了）; in particular, it does not guarantee that the order will remain constant over time.
>
> This implementation provides constant-time performance for the basic operations (get and put)（get 和 set 都是常熟复杂度，是哈希表以空间换时间的代价）, assuming the hash function disperses the elements properly among the buckets. Iteration over collection views requires time proportional to the "capacity" of the HashMap instance (the number of buckets) plus its size (the number of key-value mappings). Thus, it's very important not to set the initial capacity too high (or the load factor too low) if iteration performance is important（遍历操作跟数组长度和链表长度有关，所以在遍历操作要求性能高的情况下，就不要将初始容量设置的过高或者装载因子设置的太低。为什么？看下面这段）.
> 
> **An instance of HashMap has two parameters that affect its performance: initial capacity and load factor. The capacity is the number of buckets in the hash table, and the initial capacity is simply the capacity at the time the hash table is created. The load factor is a measure of how full the hash table is allowed to get before its capacity is automatically increased. When the number of entries in the hash table exceeds the product of the load factor and the current capacity, the hash table is rehashed (that is, internal data structures are rebuilt) so that the hash table has approximately twice the number of buckets**（超过装载因子和容量的乘积就要进行 rehash 了，rehash 后容量近似是原来的2倍）.
>
> As a general rule, the default load factor (.75) offers a good tradeoff between time and space costs. Higher values decrease the space overhead but increase the lookup cost (reflected in most of the operations of the HashMap class, including get and put). The expected number of entries in the map and its load factor should be taken into account when setting its initial capacity(放入 map 的元素个数和装载因子在初始化的时候要考虑一下，因为 rehash 涉及到 copy 转移，会影响性能), so as to minimize the number of rehash operations. If the initial capacity is greater than the maximum number of entries divided by the load factor, no rehash operations will ever occur.
>
> If many mappings are to be stored in a HashMap instance, creating it with a sufficiently large capacity will allow the mappings to be stored more efficiently than letting it perform automatic rehashing as needed to grow the table. Note that using many keys with the same hashCode() is a sure way to slow down performance of any hash table. To ameliorate impact, when keys are Comparable, this class may use comparison order among keys to help break ties.
>
> **Note that this implementation is not synchronized**(HashMap 不是线程安全的，这点极其重要。我打算再写篇文章分析一下). If multiple threads access a hash map concurrently, and at least one of the threads modifies the map structurally, it must be synchronized externally. (A structural modification is any operation that adds or deletes one or more mappings; merely changing the value associated with a key that an instance already contains is not a structural modification.) （这里说明了什么情况需要加锁）This is typically accomplished by synchronizing on some object that naturally encapsulates the map. If no such object exists, the map should be "wrapped" using the Collections.synchronizedMap method. This is best done at creation time, to prevent accidental unsynchronized access to the map:
> 
>   `Map m = Collections.synchronizedMap(new HashMap(...));`
>
> The iterators returned by all of this class's "collection view methods" are fail-fast: if the map is structurally modified at any time after the iterator is created, in any way except through the iterator's own remove method, the iterator will throw a ConcurrentModificationException. Thus, in the face of concurrent modification, the iterator fails quickly and cleanly, rather than risking arbitrary, non-deterministic behavior at an undetermined time in the future.(讲的是 fail-fast 机制，当迭代过程中哈希表被增或者删，不包括改，就会抛出异常，而不会推迟到程序出问题)
>
> Note that the fail-fast behavior of an iterator cannot be guaranteed as it is, generally speaking, impossible to make any hard guarantees in the presence of unsynchronized concurrent modification. Fail-fast iterators throw ConcurrentModificationException on a best-effort basis. Therefore, it would be wrong to write a program that depended on this exception for its correctness: **the fail-fast behavior of iterators should be used only to detect bugs**.（程序不应该依赖 fail-fast 机制，使用 fail-fast 的唯一用处就是检测 bug）
>
> This class is a member of the Java Collections Framework.

上面就是 HashMap 的文档，重要的地方我用黑体字注明并进行了简短的说明。下面就从代码开始剖析了。

###三、源码剖析

####1. 类的声明

首先我们看这个类都继承、实现了哪些东西：

{% highlight java linenos %}
public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, Cloneable, Serializable
{% endhighlight java %}

我们可以看到它实现了 Map 接口，继承了 AbstactMap 类。同时也实现了 Cloneable 和序列化接口。我们知道 HashMap 本质就是 Map 接口的实现，为什么又继承了 AbstactMap 呢？因为大部分的 AbstractXX 都是实现了一部分的 XX 接口，只留下一部分重要的方法让我们实现。所以当个人需要实现 Map，但是又不想实现全部方法，就可以去继承 AbstractMap 类了。

####2. 类的成员属性

还是直接先上源码：

{% highlight java linenos %}
	/**
     * 默认 HashMap 容量为16。必须是2的幂
     */
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;

    /**
     * 最大容量
     */
    static final int MAXIMUM_CAPACITY = 1 << 30;

    /**
     * 默认装载因子，当前元素个数/总容量超过这个值就会进行 rehash
     */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /**
     * 在 table 没有扩张之前，就用这个初始化
     */
    static final Entry<?,?>[] EMPTY_TABLE = {};

    /**
     * HashMap 中的关键地方就是这个 table 了。容量必须是2的幂
     */
    transient Entry<K,V>[] table = (Entry<K,V>[]) EMPTY_TABLE;

    /**
     * 键值对的个数
     */
    transient int size;

    /**
     达到这个阈值就要进行 rehash 了，默认初始化的阈值是16 * 0.75 = 12
    int threshold;

    /**
     * 实际装载因子，如果没有指定，就使用默认装载因子0.75
     *
     * @serial
     */
    final float loadFactor;

    /**
     * HashMap 结构改变的次数，用于 fail-fast 机制
     */
    transient int modCount;

    /**
     * 默认的 threshold
     */
    static final int ALTERNATIVE_HASHING_THRESHOLD_DEFAULT = Integer.MAX_VALUE;

    /**
     * 虚拟机各自实现中，也会有对应的 threshold 设置
     */
    private static class Holder {

        /**
         * Table capacity above which to switch to use alternative hashing.
         */
        static final int ALTERNATIVE_HASHING_THRESHOLD;

        static {
            String altThreshold = java.security.AccessController.doPrivileged(
                new sun.security.action.GetPropertyAction(
                    "jdk.map.althashing.threshold")); //读取 Sun 定义的 threshold 的值

            int threshold;
            try {
                threshold = (null != altThreshold) //修改了threshold 的值
                        ? Integer.parseInt(altThreshold)
                        : ALTERNATIVE_HASHING_THRESHOLD_DEFAULT;

                // disable alternative hashing if -1
                if (threshold == -1) {
                    threshold = Integer.MAX_VALUE;
                }

                if (threshold < 0) {
                    throw new IllegalArgumentException("value must be positive integer.");
                }
            } catch(IllegalArgumentException failed) {
                throw new Error("Illegal value for 'jdk.map.althashing.threshold'", failed);
            }

            ALTERNATIVE_HASHING_THRESHOLD = threshold;
        }
    }

    /**
     * hash 种子
     */
    transient int hashSeed = 0;
{% endhighlight java %}

从源码中我们可以看到，HashMap 的关键之处就在于数组和链表，table 是一个 Entry 数组，每一个数组元素保存一个 Entry 节点，而 Entry 节点内部又连接着同样 key 的下一个 Entry 节点，就构成了链表。**而如果有了科学的 hashSeed 保证碰撞的几率非常小，就可以近似的认为只有数组，没有链表，那么查找 key 的时候就是 O（1）复杂度了**。下面我们来看一下 Entry 的源码：

{% highlight java linenos %}
//实现了 Map 的 Entry 接口，有没有想到 C++中的 Pair 类型？是的，它就是一个 key-value 的最小单位
static class Entry<K,V> implements Map.Entry<K,V> {
        final K key;
        V value;
        Entry<K,V> next; //链表就靠他了
        int hash;

        /**
         * Creates new entry.
         */
        Entry(int h, K k, V v, Entry<K,V> n) {
            value = v;
            next = n;
            key = k;
            hash = h;
        }

        public final K getKey() {
            return key;
        }

        public final V getValue() {
            return value;
        }

        public final V setValue(V newValue) {
            V oldValue = value;
            value = newValue;
            return oldValue;
        }

        public final boolean equals(Object o) {
            if (!(o instanceof Map.Entry))
                return false;
            Map.Entry e = (Map.Entry)o;
            Object k1 = getKey();
            Object k2 = e.getKey();
            if (k1 == k2 || (k1 != null && k1.equals(k2))) {
                Object v1 = getValue();
                Object v2 = e.getValue();
                if (v1 == v2 || (v1 != null && v1.equals(v2)))
                    return true;
            }
            return false;
        }

        public final int hashCode() { //key 和 value 的 hashcode，然后再求异或
            return Objects.hashCode(getKey()) ^ Objects.hashCode(getValue());
        }

        public final String toString() {
            return getKey() + "=" + getValue();
        }

        /**
         * This method is invoked whenever the value in an entry is
         * overwritten by an invocation of put(k,v) for a key k that's already
         * in the HashMap.
         */
        void recordAccess(HashMap<K,V> m) {
        }

        /**
         * This method is invoked whenever the entry is
         * removed from the table.
         */
        void recordRemoval(HashMap<K,V> m) {
        }
    }
{% endhighlight java %}

####3. 构造函数

既然看完了 HashMap 的构造，下面我们就来看看如何初始化一个 HashMap，也就是构造函数。一共有4种：

{% highlight java linenos %}
	//1. 指定初始化容量和装载因子
	public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);

        this.loadFactor = loadFactor;
        threshold = initialCapacity;
        init(); //init()是一个空方法，在以后版本会添加具体实现
    }

    //2. 只指定初始化容量，装载因子使用默认值
    public HashMap(int initialCapacity) {
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }

    //3. 初始化容量和装载因子使用默认值（16和0.75）
    public HashMap() {
        this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR);
    }

    //4. 用一个 Map 来初始化，会先判断容量是否需要扩张，然后把元素复制一遍
    public HashMap(Map<? extends K, ? extends V> m) {
        this(Math.max((int) (m.size() / DEFAULT_LOAD_FACTOR) + 1,
                      DEFAULT_INITIAL_CAPACITY), DEFAULT_LOAD_FACTOR);
        inflateTable(threshold);

        putAllForCreate(m);
    }
{% endhighlight java %}

上面就是4种构造方法，一般情况下用的最多的是第一种和第四种。第一种没什么说的，我们先看下第四种的扩张函数`inflateTable(threshold)`:

{% highlight java linenos %}
	/**
	* 1. 找到最小的大于等于容量的2的倍数
	* 2. 确定 threshold，容量*装载因子，如果大于最大容量1<<30，就选择+1作为阈值
	* 3. 初始化底层的 table 索引数组
	* 4. 选择最合适的 hash 种子，使碰撞的几率最低
	*/
	private void inflateTable(int toSize) {
        // Find a power of 2 >= toSize
        int capacity = roundUpToPowerOf2(toSize);

        threshold = (int) Math.min(capacity * loadFactor, MAXIMUM_CAPACITY + 1);
        table = new Entry[capacity];
        initHashSeedAsNeeded(capacity); 
    }
{% endhighlight java %}

####4. put()方法——核心之一

在使用 HashMap 时，最常用的肯定就是 get/set 操作了。当然，要先说 put，因为选择如何放入，才能决定 get 怎样进行。下面是 put()方法的源码：

{% highlight java linenos %}
	/**
     * 1. 初始化的时候 table 是一个空数组，于是要根据 threshold 进行初始化。结合上面的`inflateTable()`源码，
     * 	  我们知道默认情况下容量是16（threshold 是12）
     * 2. key 为 null 的时候，也可以进行 put 操作。而 HashTable 是不能处理 key/value 为 null 的情况
     * 3. 计算 hash 值
     * 4. i 就是在 table 中找到对应的位置，本质就是 HashMap 的索引了
     * 5. 在链表中插入元素
     */
	public V put(K key, V value) {
        if (table == EMPTY_TABLE) {
            inflateTable(threshold);
        }
        if (key == null)
            return putForNullKey(value);
        int hash = hash(key);
        int i = indexFor(hash, table.length);
        for (Entry<K,V> e = table[i]; e != null; e = e.next) {
            Object k;
            if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
                V oldValue = e.value;
                e.value = value;
                e.recordAccess(this);
                return oldValue;
            }
        }

        modCount++;
        addEntry(hash, key, value, i);
        return null;
    }
{% endhighlight java %}

可以看到，`put()`的返回值是 V，就是当key 存在的时候，put 会返回 oldValue。而 `put()`涉及到的函数主要有：

* `putForNullKey()`
* `hash()`
* `indexFor()`
* `addEntry()`

下面我们先看一下 putForNullKey() 函数的源码，很简单的。因为 null 也可以作为 key 的。**一个特别的地方在于 null 的 key 是占据 table 的第一个位置。所以直接在 table[0]的链表中进行操作。**

{% highlight java linenos %}
    private V putForNullKey(V value) {
        for (Entry<K,V> e = table[0]; e != null; e = e.next) {
            if (e.key == null) {
                V oldValue = e.value;
                e.value = value;
                e.recordAccess(this);
                return oldValue;
            }
        }
        modCount++;
        addEntry(0, null, value, 0);
        return null;
    }
{% endhighlight java %}

然后是 `hash()`的源码，首先 h 是 hash 种子，根据这个值得到 key 在 table 中的索引位置（hash 种子要尽可能保证不出现碰撞）。其中涉及到了 unsigned right shift 技巧，可以参考我前面写过的文章：[Java右移操作](http://github.thinkingbar.com/right-shift/)

{% highlight java linenos %}
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

####5. get()方法——核心之二













{% highlight java linenos %}
{% endhighlight java %}









