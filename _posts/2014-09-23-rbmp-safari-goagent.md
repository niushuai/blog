---
layout: post
title: Safari 切换 goagent
categories: 知识
tags: 翻墙
---

最近 RMBP 死机过一次，通过网页和售后沟通了一下，ta 建议卸载第三方风扇应用，照办之后发现键盘总是热乎乎的。。。因为 Macbook 对风扇不敏感，而我使用的 chrome 又比较吃内存和 CPU，然后就悲剧了。。。

虽然 safari 还凑合，但是因为插件少，有时候需要 google 的时候，翻墙又不像 chrome 一条龙那么方便，只需要使用 goagent + switchysharp 即可完成自动切换，而给 safari 设置代理之后，妈蛋全部流量都走代理，墙内的东西还跑国外旅游一圈才能传回来，简直不能忍，所以 safari 我一直没用过。

现在为了温度，我 google 了一下，发现 safari 的插件太少，不能完成自动代理的功能，没办法，只好按照网上建议写了个 AppleScript 完成自动切换，不用的时候傻瓜式关闭。。。。希望赶紧出个好插件啊！！！！

使用方法很简单：

1. 打开 AppleScript 编辑器
2. 把代码弄进去
3. **把代码中的星号改为自己的用户名和密码**
4. 保存为**应用程序**，起个名
5. 把 app 拖到 dock 里面
6. 双击之。翻墙是 ON，走国内就 OFF

下面是脚本的代码：

```
tell application "Finder"
set dialog to display dialog "GoAgent switch. Please select:" buttons {"ON", "OFF", "Cancel"} default button "ON" with title "GoAgent"
set interface to button returned of dialog
end tell

if interface is "Cancel" then
return
end if

if interface is "ON" then
tell application "Terminal"
do script "python goagent/local/proxy.py"
end tell

do shell script "networksetup -setwebproxy Wi-Fi 127.0.0.1 8087" user name "***" password "***" with administrator privileges
do shell script "networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 8087" user name "***" password "***" with administrator privileges
do shell script "networksetup -setwebproxystate Wi-Fi on" user name "***" password "***" with administrator privileges
do shell script "networksetup -setsecurewebproxystate Wi-Fi on" user name "***" password "***" with administrator privileges
end if
if interface is "OFF" then
tell application "Terminal"
do script "killall Terminal"
end tell
do shell script "networksetup -setwebproxystate Wi-Fi off" user name "***" password "***" with administrator privileges
do shell script "networksetup -setsecurewebproxystate Wi-Fi off" user name "***" password "***" with administrator privileges
end if
```