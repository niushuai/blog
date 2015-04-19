---
layout: post
title: Java编程思想 - 第二十一章、并发（七）
categories: Java
tags: Java编程思想
---

###21.8 仿真

这个小节是综合运用前面7个小节的知识来完成一个小的需求。虽然很简单，但是也有地方值得自己学习，所以我直接上代码了。


####1. 银行出纳问题

模拟一个银行，有顾客会来银行办理业务，而处理业务的是出纳员，出纳员很多，又需要管理人员。所以抽象了三个 Entity，分别是顾客，出纳员，出纳员经理。抓住这三个核心 Entity 就可以理解其他了，嗯，代码我已经注释的非常清楚了。。。

{% highlight java linenos %}
package concurrency.bidsimulation;

import java.util.LinkedList;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Random;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

// 去银行办事的顾客
class Customer {
    private final int serviceTime;

    public Customer(int serviceTime) {
        this.serviceTime = serviceTime;
    }

    public int getServiceTime() {
        return serviceTime;
    }

    @Override
    public String toString() {
        return "顾客办理业务需要时间：" + serviceTime;
    }
}

// 每个柜台都会排队，这个就模拟用户排队
class CustomerLine extends ArrayBlockingQueue<Customer> {
    /**
     * 
     */
    private static final long serialVersionUID = 7788436315954397218L;

    public CustomerLine(int maxSize) {
        super(maxSize);
    }

    public String toString() {
        if (this.size() == 0) {
            return "[柜台目前无人办理业务，空闲中...]";
        }
        StringBuilder sb = new StringBuilder();
        for (Customer customer : this) {
            sb.append(customer);
        }
        return sb.toString();
    }
}

/**
 * 模拟来银行办理业务的顾客:<br>
 * 
 * 1. 它们来的时间完全随机<br>
 * 2. 顾客会随机选择要排队的柜台（一般都是选择人少的...)<br>
 * 3. 办理业务的时间也是随机
 * 
 */
class CustomerGenerator implements Runnable {
    private CustomerLine customerLine;
    private static Random random = new Random(47);

    public CustomerGenerator(CustomerLine customerLine) {
        this.customerLine = customerLine;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                // 某位顾客来银行办理业务
                TimeUnit.MILLISECONDS.sleep(random.nextInt(300));
                // 在哪个柜台？用多少时间？
                customerLine.add(new Customer(random.nextInt(1000)));
            }
        } catch (InterruptedException e) {
            System.out.println("门坏了，，，，顾客没法来了= =" + e);
        }
        System.out.println("下班，顾客不能再来办理业务了。");
    }
}

/**
 * 出纳员
 * 
 */
class Teller implements Runnable, Comparable<Teller> {
    private static int counter = 0;
    // 出纳员编号通过 counter 来获得，所以 counter 是隐藏的
    private final int id = counter++;
    // 负责的顾客队伍（也就是服务的柜台）
    private CustomerLine customerLine;
    // 记录出纳员服务的顾客数，和后面经理分配活儿有关
    private int customerServed = 0;
    // 出纳员服务柜台的状态。如果出纳员有事，就设置为 false，代表当前柜台不能服务
    private boolean isServingCustomerLine = true;

    public Teller(CustomerLine customerLine) {
        this.customerLine = customerLine;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                // 这个是阻塞的哦
                Customer customer = customerLine.take();
                TimeUnit.MILLISECONDS.sleep(customer.getServiceTime());
                // TODO 这个有疑问，为啥要加同步控制块，没有临界资源啊
                synchronized (this) {
                    customerServed++;
                    while (isServingCustomerLine == false) {
                        wait();
                    }

                }
            }
        } catch (InterruptedException e) {
            System.out.println("出纳员：" + this + "有事情了...");
        }
        System.out.println("出纳员要下班啦~~~");
    }

    // 出纳员有事情，自己或者有其他紧急任务
    public synchronized void doSomethingElse() {
        customerServed = 0;
        isServingCustomerLine = false;
    }

    // 出纳员处理任务完毕，回到工作岗位
    public synchronized void comebackWorking() {
        if (isServingCustomerLine == false) {
            System.out.println("该柜台继续提供服务" + this);
            isServingCustomerLine = true;
            notifyAll(); // 和 wait()遥相呼应
        }
    }

    @Override
    public String toString() {
        return "出纳员" + id + " ";
    }

    // 经理需要用优先队列安排工作，所以服务人数少的人优先干活（以服务人数不按工作量，呵呵呵）
    public synchronized int compareTo(Teller teller) {
        return this.customerServed - teller.customerServed;
    }
}

// 虽然实现了 Runnable，但是其实只有一个经理。实现是为了让 ExecutorService 统一管理
class TellerManager implements Runnable {

    // 管理所有的出纳员
    private ExecutorService exec;
    // 同时管理所有的柜台
    private CustomerLine customerLine;
    // 按照服务顾客数目排序，少的分配活儿
    private PriorityQueue<Teller> workingTellers = new PriorityQueue<Teller>();
    // 分配去干其他事情的出纳员
    private Queue<Teller> tellersDoingOtherThings = new LinkedList<Teller>();
    // 调整算法因子
    private int adjustmentPeriod;

    public TellerManager(ExecutorService exec, CustomerLine customerLine, int adjustmentPeriod) {
        this.exec = exec;
        this.customerLine = customerLine;
        this.adjustmentPeriod = adjustmentPeriod;

        // 经理下面最起码带个人呢。。。
        Teller teller = new Teller(customerLine);
        exec.execute(teller);
        workingTellers.add(teller);
    }

    public void adjustTellerNumber() {
        // 队伍很长啊
        if (customerLine.size() / workingTellers.size() > 2) {
            if (tellersDoingOtherThings.size() > 0) {
                Teller teller = tellersDoingOtherThings.remove();
                teller.comebackWorking();
                workingTellers.add(teller);
                return;
            }
            // 人不够了，hr 赶紧去招人啊...
            Teller teller = new Teller(customerLine);
            exec.execute(teller);
            workingTellers.add(teller);
            return;
        }

        // 队伍很短啊,不能让出纳员闲着...（老板都是这想法吧= =）
        if (workingTellers.size() > 1 && customerLine.size() / workingTellers.size() < 2) {
            reassignOneTeller();
        }
        // 队伍压根没人,留一个看门即可,不能让出纳员闲着...
        if (customerLine.size() == 0) {
            while (workingTellers.size() > 1) {
                reassignOneTeller();
            }
        }
    }

    private void reassignOneTeller() {
        Teller teller = workingTellers.poll();
        teller.doSomethingElse();
        tellersDoingOtherThings.offer(teller);
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                TimeUnit.MILLISECONDS.sleep(adjustmentPeriod);
                adjustTellerNumber();
                System.out.print("目前出纳员情况：[");
                for (Teller teller : workingTellers) {
                    System.out.print(teller);
                }
                System.out.println("]");
            }
        } catch (InterruptedException e) {
            System.out.println("经理工作被打断");
        }
        System.out.println("经理下班了...");
    }

    @Override
    public String toString() {
        return "我是出纳员的经理...";
    }
}

public class BidSimulation {
    static final int MAX_SIZE = 50;
    static final int ADJUSTMENT_PERIOD = 1000;

    public static void main(String[] args) throws Exception {
        ExecutorService exec = Executors.newCachedThreadPool();
        CustomerLine customerLine = new CustomerLine(MAX_SIZE);
        exec.execute(new CustomerGenerator(customerLine));
        exec.execute(new TellerManager(exec, customerLine, ADJUSTMENT_PERIOD));
        if (args.length > 0) {
            TimeUnit.MILLISECONDS.sleep(new Integer(args[0]));
        } else {
            System.out.println("Press 'Enter' to quit.");
            System.in.read();
        }
        exec.shutdownNow();
    }
}
{% endhighlight java %}

####2. 饭店仿真

这个等上面那个例子遇到的问题解决后再来更。。。。