const vscode = require("vscode");

const entryPattern =
  /Z方向分量|Y方向分量|X方向分量|While|If-Then-Else|If|For 玩家变量|For 全局变量|End|Else If|Else|作为进攻队伍|左|最近的可行走位置|最后一击数|最后创建的实体|最后创建的生命池|最后|最大生命值|最大弹药量|总计消耗时间|自定义字符串|自定义颜色|字符串字符索引|字符串中字符|字符串长度|字符串替换|字符串分割|字符串包含|字符串|追踪玩家变量频率|追踪全局变量频率|助攻数量|主机玩家|逐帧更新|重置玩家英雄可选状态|重新开始比赛|重生点|终极技能充能百分比|中止|中断|治疗者|治疗调整数量|治疗|指定方向速度|正在装填|正在站立|正在与人交流|正在移动|正在跳跃|正在使用主要武器|正在使用终极技能|正在使用语音交流|正在使用英雄|正在使用喷漆交流|正在使用技能 2|正在使用技能 1|正在使用辅助武器|正在使用表情交流|正在设置|正在人格复制|正在空中|正在近战攻击|正在交流|正在集结英雄|正在复制的英雄|正在防守|正在蹲下|正在等待玩家|真|占领要点模式正在得分的队伍|占领要点模式占领点解锁|占领要点模式得分百分比|在重生室中|在索引处修改玩家变量|在索引处修改全局变量|在索引处设置玩家变量|在索引处设置全局变量|在视野内|在视线内|在墙上|在目标点上|在夺旗模式中开始绝杀局|在地面上|运载目标位置|运载目标进度百分比|阈值|预加载英雄|与此角度的相对方向|与此方向的水平角度|与此方向的垂直角度|右|游戏正在进行中|游戏模式|映射的数组|英雄图标字符串|英雄数量|英雄|隐藏游戏模式HUD|隐藏游戏模式地图UI|隐藏英雄HUD|隐藏姓名板|隐藏信息|隐藏消灭提示|隐藏计分板|以角度为单位的反正弦值|以角度为单位的反正切值|以角度为单位的反余弦值|以弧度为单位的反正弦值|以弧度为单位的反正切值|以弧度为单位的反余弦值|已重生|已排序的数组|已过滤的数组|移除玩家的所有生命值|移除玩家的生命池|移除玩家|移除所有机器人|移除机器人|眼睛位置|颜色|循环|选择英雄的玩家|宣告玩家胜利|宣告回合胜利|宣告队伍胜利|宣布回合为平局|宣布比赛为平局|修改玩家分数|修改玩家变量|修改全局变量|修改队伍分数|携带旗帜的玩家|小字体信息|消灭数|消除HUD文本|消除效果|消除图标|消除所有HUD文本|消除所有效果|消除所有图标|消除所有进度条HUD文本|消除所有进度条地图文本|消除所有地图文本|消除进度条HUD文本|消除进度条地图文本|消除地图文本|向量|相距距离|显示游戏模式HUD|显示游戏模式地图UI|显示英雄HUD|显示姓名板|显示信息|显示消灭提示|显示计分板|下|武器|文本数量|为玩家添加生命池|玩家英雄数据|玩家数量|玩家数据|团队得分|图标字符串|头像火力全开|停止追踪玩家变量|停止追踪全局变量|停止转换阈值|停止助攻|停止治疗调整|停止修改英雄语音|停止限制阈值|停止为机器人强制设置名称|停止所有助攻|停止所有治疗调整|停止所有伤害调整|停止所有持续治疗|停止所有持续伤害|停止伤害调整|停止强制重生室|停止强制玩家选择英雄|停止强制设置玩家位置|停止强制设置玩家轮廓|停止镜头|停止加速|停止定向阈值|停止调整障碍大小|停止调整玩家大小|停止持续治疗|停止持续伤害|停止朝向|停止按下按钮|跳过|添加至数组|所在队伍|所有重装英雄|所有支援英雄|所有玩家|所有死亡玩家|所有输出英雄|所有目标点外玩家|所有目标点内玩家|所有队伍|所有存活玩家|所用英雄|所选位置|随机整数|随机数组|随机实数|速率|速度|死亡玩家数量|死亡数|死亡|水平速度|水平方向夹角|水平朝向角度|数组中的值|数组值的索引|数组随机取值|数组分割|数组包含|数组|数量|输入绑定字符串|受治疗者|首个|是否有人携带旗帜|是否是机器人|视角中的玩家|事件治疗|事件为急救包|事件为环境事件|事件玩家|事件伤害|事件技能|事件方向|事件暴击|矢量间夹角|矢量积|矢量|实体数量|实体存在|施加推力|生命值|生成机器人|射线命中位置|射线命中玩家|射线命中法线|设置最大生命值|设置最大复生时间|设置最大弹药|设置状态|设置主要攻击模式启用|设置终极技能充能|设置造成治疗|设置造成伤害|设置造成的击退|设置引力|设置移动速度|设置武器|设置玩家生命值|设置玩家可选的英雄|设置玩家分数|设置玩家变量|设置跳跃垂直速度|设置受到治疗|设置受到伤害|设置受到的击退|设置全局变量|设置启用装填|设置启用终极技能|设置启用跳跃|设置启用近战攻击|设置启用技能 2|设置启用技能 1|设置启用蹲下|设置目标点描述|设置瞄准速度|设置慢动作|设置技能资源|设置技能冷却|设置技能充能|设置辅助攻击模式启用|设置队伍分数|设置地形消灭者玩家|设置弹药|设置弹道引力|设置弹道速度|设置朝向|设置不可见|设置比赛时间|上一个助攻ID|上一个治疗调整ID|上一个文本ID|上一个伤害调整ID|上一个持续治疗效果ID|上一个持续伤害效果ID|上|伤害调整数量|伤害|如条件为“真”则中止|如条件为“真”则循环|如条件为“假”则中止|如条件为“假”则循环|全局|全部英雄|取整|取消主要动作|取消与玩家的移动碰撞|取消与环境的移动碰撞|清除状态|前往集结英雄|前|启用语音聊天|启用文字聊天|启用死亡回放时目标的HUD|启用查看器录制|旗帜位置|旗帜是否在基地中|平方根|目标位置|目标是否完成|目标点占领百分比|目标点上玩家数量|面朝方向|类型的最大生命值|类型的生命值|栏位数量|栏位|空数组|空|可用英雄|可用按钮|开始转换阈值|开始助攻|开始治疗调整|开始游戏模式|开始修改英雄语音|开始限制阈值|开始为机器人强制设置名称|开始伤害调整|开始强制重生室|开始强制玩家选择英雄|开始强制设置玩家位置|开始强制设置玩家轮廓|开始镜头|开始加速|开始规则|开始定向阈值|开始调整障碍大小|开始调整玩家大小|开始持续治疗|开始持续伤害|开始朝向|开始按下按钮|开启与玩家的移动碰撞|开启与环境的移动碰撞|开启游戏预设音乐模式|开启游戏预设完成条件|开启游戏预设通告模式|开启游戏预设计分模式|开启游戏预设复生模式|绝对值|距离最远的玩家|距离最近的玩家|距离准星最近的玩家|具有状态|禁用语音聊天|禁用文字聊天|禁用死亡回放时目标的HUD|禁用查看器录制|禁用按钮|解除绑定|截取字符串|较小|较大|角度的正弦值|角度的正切值|角度的余弦值|角度差|交流|假|继续|技能资源|技能图标字符串|技能冷却时间|技能充能|记入查看器|击杀|弧度的正弦值|弧度的正切值|弧度的余弦值|后|归一化|关闭游戏预设音乐模式|关闭游戏预设完成条件|关闭游戏预设通告模式|关闭游戏预设计分模式|关闭游戏预设复生模式|攻击方|根据条件中止|根据条件循环|根据条件跳过|高度|复生|复活|幅值|服务器负载平均值|服务器负载峰值|服务器负载|分数|方向|范围内玩家|返回大厅|对象索引|对所有玩家启用死亡回放|对所有玩家禁用死亡回放|对任意为“真”|对全部为“真”|对方队伍|队伍2|队伍1|调整玩家队伍|调用子程序|等待直到|等待|地图矢量|地图工坊设置组合|地图工坊设置整数|地图工坊设置英雄|地图工坊设置实数|地图工坊设置开关|地图|当前游戏模式|当前数组元素|当前数组索引|当前地图|弹药|单次赋值|大字体信息|存活玩家数量|存活|从数组中移除|此栏位的玩家|垂直速度|垂直方向夹角|垂直朝向角度|创建HUD文本|创建追踪弹道|创建效果|创建图标|创建进度条HUD文本|创建进度条地图文本|创建光束效果|创建地图文本|创建弹道效果|创建弹道|传送|处于回合之间|处于非初始状态|持续追踪玩家变量|持续追踪全局变量|持续治疗数量|持续伤害数量|播放效果|标准化生命值|标量积|比赛时间暂停|比赛时间继续|比赛时间|比赛结束|比赛回合|比较|本地玩家|本地矢量|被攻击方|绑定玩家|按下按键|按钮被按下|按钮/;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//获取动态类型
function getDynamicType(text) {
  try {
    if (
      (match = text.match(
        /^全局|For 全局变量|设置全局变量|修改全局变量|在索引处设置全局变量|在索引处修改全局变量|持续追踪全局变量|追踪全局变量频率|停止追踪全局变量$/
      ))
    ) {
      return "全局变量";
    } else if ((match = text.match(/^子程序|调用子程序|开始规则$/))) {
      return "子程序";
    } else {
      return "玩家变量";
    }
  } catch (error) {
    console.log(`错误：getDynamicType 获取动态类型` + error);
    return undefined;
  }
}

//获取动态列表：[0]扩展，[1]全局变量，[2]玩家变量，[3]子程序
function getDynamicList(document) {
  try {
    let type = 0;
    let extensions = [];
    let globalVariables = {};
    let playerVariables = {};
    let subroutines = {};
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text.trim();
      if (text.startsWith("{")) {
        const prevLine = document.lineAt(i - 1);
        const prevLineText = prevLine.text.trim();
        if (prevLineText === "扩展") {
          type = 1;
        } else if (prevLineText === "变量") {
          type = 2;
        } else if (prevLineText === "子程序") {
          type = 3;
        } else if (
          (match = prevLineText.match(/^(禁用)?\s*规则\s*\("(.*)"\)$/))
        ) {
          break;
        }
      } else if (
        type === 1 &&
        (match = text.match(
          /^光束效果|光束声音|增益状态效果|减益状态效果|增益效果和减益效果声音|能量爆炸效果|运动爆炸效果|爆炸声音|播放更多效果|生成更多机器人|弹道$/
        ))
      ) {
        extensions.push(match[0]);
      } else if (type === 2 && (match = text.match(/^全局\s*:$/))) {
        type = 4;
      } else if (
        (type === 2 || type === 4) &&
        (match = text.match(/^玩家\s*:$/))
      ) {
        type = 5;
      } else if (
        type === 4 &&
        (match = text.match(
          /^((?:[0-9]{1,2}|1[01][0-9]|12[0-7]))\s*:\s*\b([_a-zA-Z][_a-zA-Z0-9]*)\b/
        ))
      ) {
        globalVariables[match[1]] = match[2];
      } else if (
        type === 5 &&
        (match = text.match(
          /^((?:[0-9]{1,2}|1[01][0-9]|12[0-7]))\s*:\s*\b([_a-zA-Z][_a-zA-Z0-9]*)\b/
        ))
      ) {
        playerVariables[match[1]] = match[2];
      } else if (
        type === 3 &&
        (match = text.match(
          /^((?:[0-9]{1,2}|1[01][0-9]|12[0-7]))\s*:\s*\b([_a-zA-Z][_a-zA-Z0-9]*)\b/
        ))
      ) {
        subroutines[match[1]] = match[2];
      }
    }
    return {
      扩展: extensions,
      全局变量: globalVariables,
      玩家变量: playerVariables,
      子程序: subroutines,
    };
  } catch (error) {
    console.log(`错误：getDynamicList 获取动态列表` + error);
    return undefined;
  }
}

//获取前一个合法位置
function getPrevValidPosition(document, pos) {
  try {
    if (!document.validatePosition(pos)) {
      console.log(`pos无效：getPrevValidPosition 获取前一个合法位置`);
      return undefined;
    }
    if (pos.character > 0) {
      return pos.translate(0, -1);
    } else if (pos.line > 0) {
      return document.lineAt(pos.line - 1).range.end;
    } else {
      console.log(`越位警告：getPrevValidPosition 获取前一个合法位置`);
      return undefined;
    }
  } catch (error) {
    console.log(`错误：getPrevValidPosition 获取前一个合法位置` + error);
    return undefined;
  }
}

//获取后一个合法位置
function getNextValidPosition(document, pos) {
  try {
    if (!document.validatePosition(pos)) {
      console.log(`pos无效：getNextValidPosition 获取后一个合法位置`);
      return undefined;
    }
    if (pos.character < document.lineAt(pos.line).range.end.character) {
      return pos.translate(0, 1);
    } else if (pos.line < document.lineCount - 1) {
      return document.lineAt(pos.line + 1).range.start;
    } else {
      console.log(`越位警告：getNextValidPosition 获取后一个合法位置`);
      return undefined;
    }
  } catch (error) {
    console.log(`错误：getNextValidPosition 获取后一个合法位置` + error);
    return undefined;
  }
}

//获取前一个合法单词范围
function getPrevValidWordRange(document, position, pattern, includingSelf) {
  try {
    if (!document.validatePosition(position)) {
      console.log(`position无效：getPrevValidWordRange 获取前一个合法单词范围`);
      return undefined;
    }
    let pos = position;
    let range = document.getWordRangeAtPosition(pos, pattern);
    if (!includingSelf) {
      pos = getPrevValidPosition(document, range ? range.start : pos);
      if (!pos) {
        return undefined;
      }
      range = document.getWordRangeAtPosition(pos, pattern);
    }
    while (!range) {
      pos = getPrevValidPosition(document, range ? range.start : pos);
      if (!pos) {
        return undefined;
      }
      range = document.getWordRangeAtPosition(pos, pattern);
    }
    return range;
  } catch (error) {
    console.log(`错误：getPrevValidWordRange 获取前一个合法单词范围` + error);
    return undefined;
  }
}

//获取后一个合法单词范围
function getNextValidWordRange(document, position, pattern, includingSelf) {
  try {
    if (!document.validatePosition(position)) {
      console.log(`position无效：getNextValidWordRange 获取后一个合法单词范围`);
      return undefined;
    }
    let pos = position;
    let range = document.getWordRangeAtPosition(pos, pattern);
    if (!includingSelf) {
      pos = getNextValidPosition(document, range ? range.end : pos);
      if (!pos) {
        return undefined;
      }
      range = document.getWordRangeAtPosition(pos, pattern);
    }
    while (!range) {
      pos = getNextValidPosition(document, range ? range.end : pos);
      if (!pos) {
        return undefined;
      }
      range = document.getWordRangeAtPosition(pos, pattern);
    }
    return range;
  } catch (error) {
    console.log(`错误：getNextValidWordRange 获取后一个合法单词范围` + error);
    return undefined;
  }
}

//获取当前作用域
function getScope(document, position) {
  try {
    let rightBracesCount = 0;
    let semicolonCount = 0;
    for (let i = position.line; i >= 0; i--) {
      //当前行
      const line = document.lineAt(i);
      const lineRange = line.range;
      const lineText = document.getText(lineRange).trim();
      //跳过当前行
      if (lineText == "" || lineText.startsWith("//")) {
        continue;
      }
      //识别符号
      if (lineText.startsWith("{")) {
        if (rightBracesCount > 0) {
          rightBracesCount--;
        } else {
          const symbolRange = getNextValidWordRange(
            document,
            lineRange.start,
            /\{/,
            true
          );
          const prevRange = getPrevValidWordRange(document, symbolRange.start);
          const prevText = document.getText(prevRange);
          const nextRange = getNextValidWordRange(document, symbolRange.end);
          const nextText = document.getText(nextRange);
          return {
            name: prevText,
            first: nextText,
            index: semicolonCount,
          };
        }
      } else if (lineText.endsWith("}")) {
        if (rightBracesCount == 1) {
          return {
            name: "全局",
          };
        } else {
          rightBracesCount++;
        }
      } else if (lineText.endsWith(";")) {
        semicolonCount++;
      }
    }
    console.log(`性能警告：getScope 获取当前作用域`);
    return {
      name: "全局",
    };
  } catch (error) {
    console.log(`错误：getScope 获取当前作用域` + error);
    return undefined;
  }
}

//获取当前条目
function getEntry(document, position, scope) {
  try {
    let rightParenthesesCount = 0;
    let commasCount = 0;
    let isString = false;
    for (let i = position.line; i >= 0; i--) {
      //当前行
      const line = document.lineAt(i);
      const lineRange = line.range;
      const lineText = document.getText(lineRange).trim();

      //跳过当前行
      if (lineText == "" || lineText.startsWith("//")) {
        continue;
      }

      //扫描当前行
      const lastCharacter =
        i == position.line ? position.character : line.range.end.character;

      for (let j = lastCharacter; j >= 0; j--) {
        const charStart = new vscode.Position(i, j);
        const charEnd = charStart.translate(0, 1);
        const charRange = new vscode.Range(charStart, charEnd);
        const charText = document.getText(charRange);

        if (charText == '"') {
          if (j > 0) {
            const prevRange = new vscode.Range(
              charEnd.translate(0, -2),
              charEnd.translate(0, -1)
            );
            const prevText = document.getText(prevRange);
            if (prevText == "\\") {
              continue;
            }
          }
          isString = !isString;
        }

        if (isString || charText == " ") {
          continue;
        }

        if ((match = charText.match(/[\{\;]/))) {
          return scope.name;
        } else if (charText == "(") {
          if (rightParenthesesCount < 0) {
            return "条件";
          } else if (rightParenthesesCount == 0) {
            //决定条目
            const range = document.getWordRangeAtPosition(
              charStart,
              entryPattern
            );
            if (range) {
              const name = document.getText(range);
              if (name !== "") {
                return {
                  name: name,
                  index: commasCount,
                };
              }
            }
            return "条件";
          } else {
            rightParenthesesCount--;
          }
        } else if (charText == ")" && charStart.isBefore(position)) {
          rightParenthesesCount++;
        } else if (
          charText == "," &&
          rightParenthesesCount == 0 &&
          charStart.isBefore(position)
        ) {
          commasCount++;
        } else if (charText == "." && commasCount == 0) {
          //决定变量
          const range = getPrevValidWordRange(
            document,
            charStart,
            undefined,
            true
          );
          const name = document.getText(range);
          console.log(name);
          if (name === "" || name.match(/^-?\d+$/)) {
            return;
          }
          return getDynamicType(name);
        } else if (
          (match = charText.match(/[\[\+\-\*\/\^\%\<\>\=\!\?\|\&\:]/)) &&
          commasCount == 0
        ) {
          const prevCharText = document.getText(
            new vscode.Range(
              charStart.translate(0, -1),
              charEnd.translate(0, -1)
            )
          );

          if (charText === "/" && j > 0) {
            //跳过注释
            if (prevCharText === "/") {
              j -= 1;
              continue;
            } else if (prevCharText === "*") {
              const commentRange = getPrevValidWordRange(
                document,
                charStart,
                /\/\*/
              );
              i = commentRange.start.line;
              j = commentRange.start.character;
              continue;
            } else {
              return "条件";
            }
          } else if (prevCharText == ".") {
            //跳过变量
            continue;
          } else {
            return "条件";
          }
        }
      }
    }
    console.log(`性能警告：getEntry 获取当前条目`);
  } catch (error) {
    console.log(`错误：getEntry 获取当前条目` + error);
    return undefined;
  }
}

//获取混淆名称
function getObfuscatedNames(length) {
  let array = Array(4096)
    .fill()
    .map((e, i) => i)
    .map((x) =>
      x.toString(2).padStart(12, "0").replace(/0/g, "l").replace(/1/g, "I")
    );

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array.slice(0, length);
}

module.exports = {
  getRandomInt,
  getDynamicType,
  getDynamicList,
  getPrevValidPosition,
  getNextValidPosition,
  getPrevValidWordRange,
  getNextValidWordRange,
  getScope,
  getEntry,
  getObfuscatedNames,
};
