---
layout: post
title: Java编程思想 - 第二十一章、并发（七）
categories: Java
tags: Java编程思想
---

### 21.8 仿真

这个小节是综合运用前面7个小节的知识来完成一个小的需求。虽然很简单，但是也有地方值得自己学习，所以我直接上代码了。


#### 1. 银行出纳问题

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
    // 该顾客办理业务需要的时间
    private final int serviceTime;

    public Customer(int serviceTime) {
        this.serviceTime = serviceTime;
    }

    public int getServiceTime() {
        return serviceTime;
    }

    @Override
    public String toString() {
        return "[" + serviceTime + "] ";
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
                customerLine.put(new Customer(random.nextInt(1000)));
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
            System.out.println(this + "被打断，有其他事情需要处理...");
        }
        System.out.println("出纳员下班了...");
    }

    // 出纳员有事情，自己或者有其他紧急任务
    public synchronized void doSomethingElse() {
        customerServed = 0;
        isServingCustomerLine = false;
    }

    // 出纳员处理任务完毕，回到工作岗位
    public synchronized void comebackWorking() {
        if (isServingCustomerLine == false) {
            System.out.println(this + "负责的柜台继续提供服务...");
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

        // 经理下面最起码带个人不是。。。
        Teller teller = new Teller(customerLine);
        exec.execute(teller);
        workingTellers.add(teller);
    }

    // 经理会根据自己的经验安排工作
    public void adjustTellerNumber() {
        // 如果队伍很长（顾客数目是出纳员数目的2倍多）
        if (customerLine.size() / workingTellers.size() > 2) {
            // 如果有在做其他事情的出纳员，要事优先原则
            if (tellersDoingOtherThings.size() > 0) {
                Teller teller = tellersDoingOtherThings.remove();
                teller.comebackWorking();
                workingTellers.add(teller);
                return;
            }
            // 人确实不够了，通知 hr 赶紧去招人...
            Teller teller = new Teller(customerLine);
            exec.execute(teller);
            workingTellers.add(teller);
            return;
        }

        // 队伍很短,不能让出纳员闲着...（老板都是这想法吧= =）
        if (workingTellers.size() > 1 && customerLine.size() / workingTellers.size() < 2) {
            reassignOneTeller();
        }
        // 队伍压根没人,留一个出纳员工作即可,其他都去干别的活儿，不能让出纳员闲着...
        if (customerLine.size() == 0) {
            while (workingTellers.size() > 1) {
                reassignOneTeller();
            }
        }
    }

    // 分配出纳员去干别的活儿
    private void reassignOneTeller() {
        Teller teller = workingTellers.poll();
        // poll() 在队列为空的时候返回 null，不用判断 teller为 null 是因为上面肯定留了一个出纳员在 woerkingTellers
        teller.doSomethingElse();
        tellersDoingOtherThings.offer(teller);
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                TimeUnit.MILLISECONDS.sleep(adjustmentPeriod);
                adjustTellerNumber();
                System.out.print("{排队中的顾客：" + customerLine + "}----");
                System.out.print("{目前工作中的出纳员：[");
                for (Teller teller : workingTellers) {
                    System.out.print(teller);
                }
                System.out.println("]}");
            }
        } catch (InterruptedException e) {
            System.out.println("经理工作被打断");
        }
        System.out.println("经理下班了...");
    }

    @Override
    public String toString() {
        return "我是所有出纳员的经理...";
    }
}

public class BankTellerSimulation {
    static final int MAX_SIZE = 50;
    static final int ADJUSTMENT_PERIOD = 1000;

    public static void main(String[] args) throws Exception {
        ExecutorService exec = Executors.newCachedThreadPool();
        CustomerLine customerLine = new CustomerLine(MAX_SIZE);
        exec.execute(new CustomerGenerator(customerLine));
        exec.execute(new TellerManager(exec, customerLine, ADJUSTMENT_PERIOD));
        // 结束模拟：带结束时间或者按下 Enter
        if (args.length > 0) {
            TimeUnit.SECONDS.sleep(new Integer(args[0]));
        } else {
            System.out.println("Press 'Enter' to quit.");
            System.in.read();
        }
        exec.shutdownNow();
    }
}
{% endhighlight java %}

#### 2. 饭店仿真

这个例子感觉不咋地，就跳过去了= =

#### 3. 分发问题

{% highlight java linenos %}
package concurrency;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 * 第一步：Chassis 创建一个 new MyCar，然后装底盘<br>
 * 第二步：Assembler 装配，从 RobotPool 中取得机器人资源，组装引擎、动力系统、轮胎<br>
 * 第三步：组装完成后会有一个记录系统，并将完成的车辆放入 finishingQueue<br>
 */
class MyCar {
    private final int id;
    private boolean engine;
    private boolean driveTrain;
    private boolean wheels;

    public MyCar(int id) {
        this.id = id;
    }

    public MyCar() {
        id = -1;
    }

    public synchronized int getId() {
        return id;
    }

    public synchronized void addEngine() {
        engine = true;
    }

    public synchronized void addDriveTrain() {
        driveTrain = true;
    }

    public synchronized void addWheels() {
        wheels = true;
    }

    public synchronized String toString() {
        return "Car " + id + " [" + " engine: " + engine + " driveTrain: " + driveTrain + " wheels: " + wheels + " ]";
    }
}

// 模拟工厂的流水线
class CarQueue extends LinkedBlockingQueue<MyCar> {
    private static final long serialVersionUID = -8022590210916666885L;
}

// 底盘环节
class ChassisBuilder implements Runnable {
    // 底盘的 carQueue 是一辆车的第一个入口
    private CarQueue carQueue;
    private int counter = 0;

    public ChassisBuilder(CarQueue carQueue) {
        this.carQueue = carQueue;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                // 创建新车 & 安装底盘
                MyCar myCar = new MyCar(counter++);
                TimeUnit.MILLISECONDS.sleep(500);
                System.out.println(myCar + "底盘已经搞定，其余部件开始装配：");
                carQueue.put(myCar);
            }
        } catch (InterruptedException e) {
            System.out.println("底盘制造被终止！");
        }
        System.out.println("底盘装配线关闭...");
    }
}

// 组装引擎、动力系统、轮胎环节
class Assembler implements Runnable {
    // 底盘之后的第二道工序
    private CarQueue chassisQueue;
    private CarQueue finishingQueue;
    private MyCar myCar;
    // 不用 CountDownLatch 是因为要复用
    private CyclicBarrier cyclicBarrier = new CyclicBarrier(4);
    private RobotPool robotPool;

    public Assembler(CarQueue chassisQueue, CarQueue finishingQueue, RobotPool robotPool) {
        this.chassisQueue = chassisQueue;
        this.finishingQueue = finishingQueue;
        this.robotPool = robotPool;
    }

    public MyCar car() {
        return myCar;
    }

    public CyclicBarrier barrier() {
        return cyclicBarrier;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                // 阻塞直到底盘装配线传来待组装的车
                myCar = chassisQueue.take();

                // 使用机器人装配
                robotPool.consume(EngineRobot.class, this);
                robotPool.consume(DriveTrainRobot.class, this);
                robotPool.consume(WheelRobot.class, this);

                // 第四个 barrier，表示车组装完成
                cyclicBarrier.await();
                finishingQueue.put(myCar);
            }
        } catch (InterruptedException e) {
            System.out.println("装配引擎、动力系统、轮胎被终止！");
        } catch (BrokenBarrierException e) {
            throw new RuntimeException(e);
        }

        System.out.println("组装装配线关闭...");
    }
}

// 通报系统
class Reporter implements Runnable {
    private CarQueue finishingQueue;

    public Reporter(CarQueue finishingQueue) {
        this.finishingQueue = finishingQueue;
    }

    @Override
    public void run() {
        try {
            while (!Thread.interrupted()) {
                System.out.println(finishingQueue.take());
            }
        } catch (InterruptedException e) {
            System.out.println("通报系统被终止！");
        }
        System.out.println("通报系统关闭...");
    }
}

// 抽象组装过程中的三个机器人
abstract class Robot implements Runnable {
    private RobotPool robotPool;
    protected Assembler assembler;
    private boolean isWorking = false;

    public Robot(RobotPool robotPool) {
        this.robotPool = robotPool;
    }

    public Robot assignAssembler(Assembler assembler) {
        this.assembler = assembler;
        return this;
    }

    // 开始干活
    public synchronized void engage() {
        isWorking = true;
        notifyAll();
    }

    abstract protected void performService();

    @Override
    public void run() {
        try {
            // wait until needed
            powerDown();
            while (!Thread.interrupted()) {
                performService();
                assembler.barrier().await();
                // 已经做完了
                powerDown();
            }
        } catch (InterruptedException e) {
            System.out.println("机器人自动装配被终止！");
        } catch (BrokenBarrierException e) {
            throw new RuntimeException(e);
        }
        System.out.println(this + "关闭...");
    }

    // 消除状态，停止工作。直到有可用的机器人
    private synchronized void powerDown() throws InterruptedException {
        isWorking = false;
        assembler = null;
        robotPool.releaser(this);
        while (isWorking == false) {
            wait();
        }
    }

    @Override
    public String toString() {
        return getClass().getName();
    }
}

// 安装引擎机器人
class EngineRobot extends Robot {
    public EngineRobot(RobotPool robotPool) {
        super(robotPool);
    }

    @Override
    protected void performService() {
        System.out.println(this + " 安装引擎...");
        assembler.car().addEngine();
    }
}

// 安装动力系统机器人
class DriveTrainRobot extends Robot {
    public DriveTrainRobot(RobotPool robotPool) {
        super(robotPool);
    }

    @Override
    protected void performService() {
        System.out.println(this + " 安装动力系统...");
        assembler.car().addDriveTrain();
    }
}

// 安装轮胎机器人
class WheelRobot extends Robot {
    public WheelRobot(RobotPool robotPool) {
        super(robotPool);
    }

    @Override
    protected void performService() {
        System.out.println(this + " 安装轮胎...");
        assembler.car().addWheels();
    }
}

// 机器人池
class RobotPool {
    private Set<Robot> pool = new HashSet<Robot>();

    // 使用完毕的机器人重新放入资源池，然后通知等待该机器人的任务
    public synchronized void produce(Robot robot) {
        pool.add(robot);
        notifyAll();
    }

    // 机器人消费者
    public synchronized void consume(Class<? extends Robot> robotType, Assembler assembler) throws InterruptedException {
        for (Robot robot : pool) {
            if (robot.getClass().equals(robotType)) {
                pool.remove(robot);
                robot.assignAssembler(assembler);
                robot.engage();
                return;
            }
        }
        wait();
        consume(robotType, assembler);
    }

    // 释放资源，本质就是重新加入到机器人池
    public synchronized void releaser(Robot robot) {
        produce(robot);
    }
}

public class CarBuilder {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService exec = Executors.newCachedThreadPool();

        // 初始化机器人池，每个类型只有一个机器人，所以是临界资源
        RobotPool robotPool = new RobotPool();
        exec.execute(new EngineRobot(robotPool));
        exec.execute(new DriveTrainRobot(robotPool));
        exec.execute(new WheelRobot(robotPool));

        /**
         * 生产线正式启动。<br>
         * 故意把底盘装配（第一个环节）放在最后一个启动，反正 Assembler 会自动阻塞
         */
        CarQueue chassisQueue = new CarQueue();
        CarQueue finishingQueue = new CarQueue();
        exec.execute(new Assembler(chassisQueue, finishingQueue, robotPool));
        exec.execute(new Reporter(finishingQueue));
        exec.execute(new ChassisBuilder(chassisQueue));

        // 模拟程序在7秒后自动结束
        TimeUnit.SECONDS.sleep(7);
        exec.shutdownNow();
    }
}
{% endhighlight java %}