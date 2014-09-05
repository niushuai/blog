---
layout: post
title: mysql数据库导入导出
categories: 知识
tags: mysql导入导出
---

###导出数据库

> `mysqldump -u用户名 -p密码 数据库名 --skip-lock-tables -hIP地址 -P端口 > 数据库名_bak.sql`

root登陆:

> `mysql -uroot -p密码 -hIP地址 -P端口`

建立数据库:

> `mysql> CREATE DATABASE 数据库名;`

###导入sql脚本

{% highlight bash linenos %}
use 数据库名;
source 数据库名_bak.sql;
grant all privileges on 数据库名.* to 用户名@IP地址 identified by '密码'; //给其他用户授权
flush privileges;
{% endhighlight bash %}