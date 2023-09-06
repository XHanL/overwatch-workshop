# <img src="images/extension/icon.png" width="50" height="50" align=center /> **Overwatch®** Workshop

### **守望先锋 ®** 工坊语言支持

<br>

## **_⬘ 快速入门_**

**首先**，新建一份后缀改为 `.ow` 的文本文件。

**然后**，从工坊复制`完整代码`，或复制以下`样例代码`，粘贴到该文件中。

> <details>
>     <summary>样例代码</summary>
>
>     规则("你好")
>     {
>         事件
>         {
>             持续 - 全局;
>         }
>
>         条件
>         {
>             按钮被按下(主机玩家, 按钮(互动)) == 真;
>         }
>
>         动作
>         {
>             小字体信息(主机玩家, 自定义字符串("你好"));
>         }
>     }
>
> </details>

<br>

## **_⬘ 主要特性_**

**以下 `演示` 由 `Github` 托管，请确保网络具备严谨的科学性。**

### **代码大纲**

在资源管理器的大纲视图提供详细大纲。具备跟踪光标和跳转能力。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/outlines.gif" align=center />
>  </details>

### **代码折叠**

代码折叠能力，包括代码块和流程控制。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/fold.gif" align=center />
>  </details>

### **悬停提示**

将光标放置在关键词之上可获得详细提示。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/hover.gif" align=center />
>  </details>

### **调色盘**

针对自定义颜色的预览和调制能力。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/color.gif" align=center />
>  </details>

### **补全建议**

汉字或拼音输入展开建议列表，可使用建议按钮强制触发。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/suggestion.gif" align=center />
>  </details>

### **参数提示**

填充参数时会指示参数位和参数详情。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/sign.gif" align=center />
>  </details>

### **参考手册**

侧边栏增加可收纳的参考手册视图。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/manual.gif" align=center />
>  </details>

### **语法高亮**

代码的精准上色能力。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/highlight.png" align=center />
>  </details>

### **规则开关**

自动在每条规则前生成一个可点击的禁用切换开关。

>  <details>
>      <summary>演示</summary>
>      <img src="showcases/switch.gif" align=center />
>  </details>

<br>

## **_⬘ 快捷功能_**

**_功能位于标签栏右侧以及右键菜单中。_**

| 功能           | 描述                                    |
| :------------- | :-------------------------------------- |
| **提供建议**   | 主动触发光标处的补全建议。              |
| **自动换行**   | 切换自动换行行为。                      |
| **修复后导出** | 导入到剪切板，同时修复已知的工坊错误。❶ |
| **导入并修复** | 导入到编辑器，同时修复已知的工坊错误。❶ |

<br>

**❶ 已知的工坊错误**

_~~设置不可见(事件玩家, 无);~~_

`→ 设置不可见(事件玩家, 全部禁用);`

_~~追踪全局变量频率(A, 0, 1, 无);~~_

`→ 追踪全局变量频率(A, 0, 1, 全部禁用);`

_~~追踪玩家变量频率(事件玩家, A, 0, 1, 无);~~_

`→ 追踪玩家变量频率(事件玩家, A, 0, 1, 全部禁用);`

_~~持续追踪全局变量( A, 0, 1, 无);~~_

`→ 持续追踪全局变量(A, 0, 1, 全部禁用);`

_~~持续追踪玩家变量(事件玩家, A, 0, 1, 无);~~_

`→ 持续追踪玩家变量(事件玩家, A, 0, 1, 全部禁用);`

<br>

## **_⬘ 联络团队_**

**_如果你发现任何错误或有任何建议，可通过以下方式与开发人员取得联络。_**
|平台|描述|代码|链接|
|:--|:--|:--|:--|
|**QQ**|官方群|590621556|https://jq.qq.com/?_wv=1027&k=DTAuEetN|
|~~**战网**~~|ID|你的对手#51441||
|**BATTLE**|ID|LXH#11992||

<br>

## **_⬘ 友情链接_**

**_项目的支持人员与合作伙伴们！_**

| 平台 | 描述               | 代码      |
| :--- | :----------------- | :-------- |
| QQ   | 守望工坊修仙养老群 | 863964203 |
| QQ   | 死亡之牢交流群     | 832284401 |
| QQ   | 工坊模式发布群     | 694392121 |

<br>

## **_⬘ 鸣谢_**

**_整理语法数据和编写 [LSP](https://microsoft.github.io/language-server-protocol/) 是两个繁杂的过程，感谢以下大佬的资源和慷慨帮助。_**

| 大佬             | 贡献              | 链接                                   |
| :--------------- | :---------------- | :------------------------------------- |
| **掌上天空**     | _授权 + 开源仓库_ | https://github.com/SkyinHand/owatch    |
| **CoolP**        | _开源仓库_        | https://github.com/qaz075115961/owl-CN |
| **春雨实验室**   | _英雄图标和数据_  | https://overlab.cn                     |
| **Zezombye**     | _设置选项数据_    | https://workshop.codes/workshop-ui     |
| **EbanCycle**    | _开发成员_        |
| **踏足**         | _开发成员_        |
| **老王不在橱柜** | _荣誉成员_        |

<br>

## **_⬘ 仓库_**

**_如果喜欢这个项目，请为项目加一颗星，以及进行项目贡献！_**

| 平台       | 链接                                          |
| :--------- | :-------------------------------------------- |
| **GitHub** | *https://github.com/XHanL/overwatch-workshop* |

<br>

## **_⬘ 等待贡献_**

| 任务               | 细节                                 |
| :----------------- | :----------------------------------- |
| **手册数据 - PNG** | _手册中所有模式，所有地图的预览图片_ |
| **手册数据 - GIF** | _手册中所有弹道，所有效果的循环预览_ |
