---
layout: post
title: 解决 github 加载过慢
categories: 计算机知识
tags: github
---

昨天去github下载一个vim插件，结果发现页面加载速度过慢，而且页面样式都是错乱的，图片也都加载失败。于是用chrome自带的开发工具看了一下network，发现有2条css和2个js 404了，估计又是github的DNS被功夫网污染了。

去网上搜了一下，发现和我猜的差不多。因为github把CDN切换到某个ISP（比如fastly.net），但是url中的某些字符是GFW的敏感字，所以就中招了。解决方法超简单：

1. 在某个页面按下F12开发者工具，进入github网站
2. 点击Console，找到加载过慢的CDN（假如是github.global.ssl.fastly.net）
3. 通过`http://www.ipaddress.com`中的iplookup找到这个CDN的IP
4. 修改hosts：添加一条记录`xx.xx.xx.xx  github.global.ssl.fastly.net`
5. 然后就会发现github基本是秒开了，而且加载都正常。

同理可应用在stackoverflow/wikipedia等网站。
