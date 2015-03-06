---
layout: post
title: 不用请鸡翅的 outlook 技巧
categories:  计算机知识
tags: outlook
---

我厂有个规定，凡是邮件没有主题就要轻吃鸡翅。。。。然后几年前某次厂长给全体 staff 发邮件就给忘了，于是损失了10+万买鸡翅，简直是普大喜奔。。。不过对于我等屌丝，一次绝逼就倾家荡产了，于是用 google 搜到一个技巧，保证在有生之年不用请鸡翅了^_^

---

下面是具体的步骤：

1. 打开Outlook，按ALT+F11进入VBA集成开发环境
2. 在左上角的工程资源管理器中依次展开Project1/Microsoft Office Outlook 对象/ThisOutlookSession，双击ThisOutlookSession，打开代码输入界面，
3. 贴入下面提供的代码
4. 保存，退出VBA编辑
5. 点击outlook-》工具-》宏-》安全性，请选中单选框：为所有宏提供警告
6. 重启outlook，在弹出的安全声明对话框里，选择“启用宏”

代码如下：

{% highlight bash linenos %}
Private Sub Application_ItemSend(ByVal Item As Object, Cancel As Boolean)

  Dim lngres As Long

  '检查邮件是否添加附件
  If InStr(1, Item.Body, "附件") <> 0 Then
  If Item.Attachments.Count = 0 Then
  Application.Explorers(1).Activate
  lngres = MsgBox("同学,你在邮件正文中提到附件,但是没有插入附件！" & Chr(10) & "仍然发送？", vbYesNo + vbDefaultButton2 + vbQuestion, "提示")

  If lngres = vbNo Then
  Cancel = True
  Item.Display
  Exit Sub
  End If
  End If
  End If

  '检查是否写主题
  If Item.Subject = "" Then
  Application.Explorers(1).Activate
  lngres = MsgBox("同学,你的邮件还没有写上主题！" & Chr(10) & "仍然发送？", vbYesNo + vbDefaultButton2 + vbQuestion, "提示")
  If lngres = vbNo Then
  Cancel = True
  Item.Display
  Exit Sub
  End If
  End If
  End Sub

{% endhighlight bash %}
