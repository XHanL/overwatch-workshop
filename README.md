# <img src="images/extension/icon.png" width="50" height="50" align=center /> **Overwatch®** Workshop

## **守望先锋 ®** 工坊语言支持

<br/>

# **_快速入门_**

- 新建一个文本文件并将后缀改为 `.ow`。

- 从工坊复制完整代码到该文件内。

<br>
<details>
  <summary>复制样例代码</summary>
  <br>

    规则("你好，世界！")
    {
        事件
        {
            持续 - 全局;
        }

        条件
        {
            按钮被按下(主机玩家, 按钮(互动)) == 真;
        }

        动作
        {
            小字体信息(主机玩家, 自定义字符串("HELLO WORLD!"));
        }
    }

</details>
<br/>

# **_主要特性_**

_比内置编辑器更好用。_

- ### **代码大纲**

  在资源管理器的大纲视图提供详细大纲。具备跟踪光标和跳转能力。

  <details>
      <summary>演示</summary>
      <img src="images/extension/gif/outlines.gif" align=center />
  </details>
  <br/>

- ### **代码折叠**

  代码折叠能力，包括代码块和流程控制。

  <details>
      <summary>演示</summary>
      <img src="images/extension/gif/fold.gif" align=center />
  </details>
  <br/>

- ### **悬停提示**

  将光标放置在关键词之上可获得详细提示。

  <details>
      <summary>演示</summary>
      <img src="images/extension/gif/hover.gif" align=center />
  </details>
  <br/>

- ### **调色盘**

  针对自定义颜色的预览和调制能力。

  <details>
      <summary>演示</summary>
      <img src="images/extension/gif/color.gif" align=center />
  </details>
  <br/>

- ### **补全建议**

  汉字或拼音输入展开建议列表，可使用建议按钮强制触发。

  <details>
      <summary>演示</summary>
      <img src="images/extension/gif/suggestion.gif" align=center />
  </details>
  <br/>

- ### **参数提示**

  填充参数时会指示参数位和参数详情。

  <details>
      <summary>演示</summary>
      <img src="images/extension/gif/sign.gif" align=center />
  </details>
  <br/>

- ### **参考手册**

  侧边栏增加可收纳的参考手册视图。

  <details>
      <summary>演示</summary>
      <img src="images/extension/gif/manual.gif" align=center />
  </details>
  <br/>

- ### **语法高亮**

  代码的精准上色能力。

  <br/>

* ### **禁用开关**

  自动在每条规则前生成一个可点击的禁用切换开关。

  <br/>

# **_快捷功能_**

_功能位于标签栏右侧以及右键菜单中。_

- ### **功能介绍**

  | 功能           | 描述                                    |
  | :------------- | :-------------------------------------- |
  | **提供建议**   | 主动触发光标处的补全建议。              |
  | **自动换行**   | 切换自动换行行为。                      |
  | **修复后导出** | 导入到剪切板，同时修复已知的工坊错误。❶ |
  | **导入并修复** | 导入到编辑器，同时修复已知的工坊错误。❶ |

- ### **❶ 已知的工坊错误**

     <details>
         <summary>错误详情</summary>
         <br/>

  _~~设置不可见(事件玩家, 无);~~_

         设置不可见(事件玩家, 全部禁用);

  _~~追踪全局变量频率(A, 0, 1, 无);~~_

         追踪全局变量频率(A, 0, 1, 全部禁用);

  _~~追踪玩家变量频率(事件玩家, A, 0, 1, 无);~~_

         追踪玩家变量频率(事件玩家, A, 0, 1, 全部禁用);

  _~~持续追踪全局变量( A, 0, 1, 无);~~_

         持续追踪全局变量(A, 0, 1, 全部禁用);

  _~~持续追踪玩家变量(事件玩家, A, 0, 1, 无);~~_

         持续追踪玩家变量(事件玩家, A, 0, 1, 全部禁用);

     </details>
    <br/>

# **_联络方式_**

**如果你发现任何错误或有任何建议，可通过以下方式与开发人员取得联络。**
|平台|描述|代码|链接|
|:--|:--|:--|:--|
|**QQ**|官方群|590621556|https://jq.qq.com/?_wv=1027&k=DTAuEetN|
|**KOOK**|官方频道|85357302|https://www.kookapp.cn/app/invite/XAD8eG|
|**DISCORD**|官方频道|NUm5HmZH69|https://discord.gg/NUm5HmZH69|
|~~**战网**~~|ID|你的对手#51441||
|**BATTLE**|ID|LXH#11992||

<br/>

# **_鸣谢_**

**整理语法数据和编写 [LSP](https://microsoft.github.io/language-server-protocol/) 是两个繁杂的过程，感谢以下大佬的资源和慷慨帮助。**

| 大佬             | 贡献              | 链接                                   |
| :--------------- | :---------------- | :------------------------------------- |
| **掌上天空**     | _授权 + 开源仓库_ | https://github.com/SkyinHand/owatch    |
| **CoolP**        | _开源仓库_        | https://github.com/qaz075115961/owl-CN |
| **Zezombye**     | _设置选项数据_    | https://workshop.codes/workshop-ui     |
| **春雨实验室**   | _英雄图标和数据_  | https://overlab.cn                     |
| **EbanCycle**    | _开发成员_        |
| **老王不在橱柜** | _荣誉成员_        |
| **踏足**         | _荣誉成员_        |

<br/>

# **_仓库_**

**如果遇到显示问题，请尝试其它站点。**

| 平台       | 链接                                           |
| :--------- | :--------------------------------------------- |
| **GitHub** | https://github.com/XHanL/overwatch-workshop    |
| **Gitee**  | https://gitee.com/EbanCycle/overwatch-workshop |

<br/>

# **_友情链接_**

**插件的支持人员与合作伙伴们！**

| 平台 | 描述               | 代码      |
| :--- | :----------------- | :-------- |
| QQ   | 守望工坊修仙养老群 | 863964203 |
| QQ   | 死亡之牢交流群     | 832284401 |
| QQ   | 工坊模式发布群     | 694392121 |

<br/>
