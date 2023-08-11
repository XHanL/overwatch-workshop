const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

const MODEL = require('./ow.model.js')

module.exports = {
    activate
}

function sortAndFilterChineseKeyword(s) {
    const str = s.split("|")
    const set = new Set(str)
    let arr = Array.from(set).sort((b, a) => a.localeCompare(b, "zh-Hans-CN"))
    console.log(arr.join('|'))
}

function getModelString() {
    let str = ""
    for (i in MODEL.RULES.ACTION) {
        str += "|" + i
    }
    sortAndFilterChineseKeyword(str.slice(1))
}
function activate(context) {
    //初始化
    MODEL.initModelDarkHover(context)
    MODEL.initModelLightHover(context)
    context.subscriptions.push(
        //折叠
        vscode.languages.registerFoldingRangeProvider("ow", {
            provideFoldingRanges(document) {
                let foldingRanges = []
                let braces = []
                let controls = []
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i)
                    const text = line.text.trim()
                    if (text === "") {
                        continue
                    } else if (text.startsWith("{")) {
                        braces.push(line.lineNumber - 1)
                    } else if (text.startsWith("}")) {
                        foldingRanges.push(new vscode.FoldingRange(braces.pop(), line.lineNumber))
                    } else if (text.match(/^(For 全局变量|For 玩家变量|While|If)/)) {
                        controls.push(line.lineNumber)
                    } else if (text.match(/^(Else If|Else)/)) {
                        foldingRanges.push(new vscode.FoldingRange(controls.pop(), line.lineNumber - 1))
                        controls.push(line.lineNumber)
                    } else if (text.match(/^End/)) {
                        foldingRanges.push(new vscode.FoldingRange(controls.pop(), line.lineNumber - 1))
                    }
                }
                return foldingRanges
            }
        }),

        //大纲
        vscode.languages.registerDocumentSymbolProvider("ow", {
            provideDocumentSymbols(document) {
                let documentSymbols = []

                let i = 0
                while (i < document.lineCount) {
                    const line = document.lineAt(i)
                    const lineText = line.text.trim()
                    if (lineText.startsWith("{")) {
                        documentSymbols.push(getDocumentSymbol())
                    }
                    i++
                }

                function getDocumentSymbol() {
                    let symbol = undefined
                    while (i < document.lineCount) {
                        const line = document.lineAt(i)
                        const lineText = line.text.trim()
                        if (lineText.startsWith("{")) {
                            const prevLine = document.lineAt(i - 1)
                            const prevLineText = prevLine.text.trim()
                            if (symbol === undefined) {
                                if (prevLineText == "动作") {
                                    symbol = [prevLineText, "", vscode.SymbolKind.Method, prevLine.range.start]
                                } else if (prevLineText == "事件") {
                                    const nextLine = document.lineAt(i + 1)
                                    const nextLineText = nextLine.text.trim().replace(";", "")
                                    symbol = [prevLineText, nextLineText, vscode.SymbolKind.Event, prevLine.range.start]
                                } else if (prevLineText == "条件") {
                                    symbol = [prevLineText, "", vscode.SymbolKind.Boolean, prevLine.range.start]
                                } else if (prevLineText == "变量") {
                                    symbol = [prevLineText, "", vscode.SymbolKind.Variable, prevLine.range.start]
                                } else if (prevLineText == "子程序") {
                                    symbol = [prevLineText, "", vscode.SymbolKind.Function, prevLine.range.start]
                                } else if (match = prevLineText.match(/^(禁用)?\s*规则\s*\("(.*)"\)$/)) {
                                    if (match[1] == "禁用") {
                                        symbol = ["规则", `${match[2]} [禁用]`, vscode.SymbolKind.Module, prevLine.range.start, []]
                                    } else {
                                        symbol = ["规则", match[2], vscode.SymbolKind.Module, prevLine.range.start, []]
                                    }
                                } else {
                                    symbol = [prevLineText, "", vscode.SymbolKind.Property, prevLine.range.start, []]
                                }
                            } else {
                                symbol[4].push(getDocumentSymbol())
                            }
                        } else if (lineText.endsWith("}")) {
                            const documentSymbol = new vscode.DocumentSymbol(symbol[0], symbol[1], symbol[2], new vscode.Range(symbol[3], line.range.end), new vscode.Range(symbol[3], line.range.end))
                            documentSymbol.children = symbol[4]
                            return documentSymbol
                        }
                        i++
                    }
                }
                return documentSymbols
            }
        }),

        //取色
        vscode.languages.registerColorProvider("ow", {
            provideDocumentColors(document) {
                let colors = []
                const pattern = /自定义颜色\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g
                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i)
                    while ((match = pattern.exec(line.text))) {
                        colors.push(
                            new vscode.ColorInformation(
                                new vscode.Range(i, match.index, i, match.index + match[0].length),
                                new vscode.Color(match[1] / 255, match[2] / 255, match[3] / 255, match[4] / 255)
                            )
                        )
                    }
                }
                return colors
            },
            provideColorPresentations(color) {
                const newColor =
                    "自定义颜色(" + Math.floor(color.red * 255) +
                    ", " + Math.floor(color.green * 255) +
                    ", " + Math.floor(color.blue * 255) +
                    ", " + Math.floor(color.alpha * 255) + ")"
                return [new vscode.ColorPresentation(newColor)]
            }
        }),

        //悬停
        vscode.languages.registerHoverProvider("ow", {
            provideHover(document, position) {
                const hoverText = document.getText(document.getWordRangeAtPosition(position))
                let rightBracesCount = 0
                for (let i = position.line; i >= 0; i--) {
                    const line = document.lineAt(i)
                    const lineText = line.text.trim()
                    if (lineText.startsWith("{")) {
                        if (rightBracesCount > 0) {
                            rightBracesCount--
                        } else {
                            const prevLine = document.lineAt(i - 1)
                            const prevLineText = prevLine.text.trim()
                            const theme = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Dark ? "暗色" : "亮色"
                            if (prevLineText == "事件") {
                                if (match = hoverText.match(/持续 - 全局|持续 - 每名玩家|玩家造成伤害|玩家造成最后一击|玩家造成治疗|玩家造成击退|玩家阵亡|玩家参与消灭|玩家加入比赛|玩家离开比赛|玩家受到治疗|玩家受到击退|玩家受到伤害|子程序/)) {
                                    return new vscode.Hover(MODEL.RULES.EVENT[hoverText][theme])
                                } else if (match = hoverText.match(/队伍1|队伍2|双方/)) {
                                    return new vscode.Hover(MODEL.RULES.EVENT_TEAM[hoverText][theme])
                                } else if (match = hoverText.match(/栏位 0|栏位 1|栏位 2|栏位 3|栏位 4|栏位 5|栏位 6|栏位 7|栏位 8|栏位 9|栏位 10|栏位 11|全部|安娜|艾什|巴蒂斯特|堡垒|布丽吉塔|末日铁拳|D.Va|回声|源氏|破坏球|半藏|渣客女王|狂鼠|雾子|卢西奥|卡西迪|美|天使|莫伊拉|奥丽莎|法老之鹰|死神|莱因哈特|路霸|西格玛|索杰恩|士兵：76|黑影|秩序之光|托比昂|猎空|黑百合|温斯顿|查莉娅|禅雅塔|拉玛刹|生命之梭/)) {
                                    return new vscode.Hover(MODEL.RULES.EVENT_PLAYER[hoverText][theme])
                                }
                            } else if (prevLineText == "条件") {
                                if (match = hoverText.match(/对任意为“真”|对全部为“真”|Z方向分量|Y方向分量|X方向分量|作为进攻队伍|左|最近的可行走位置|最后一击数|最后创建的实体|最后创建的生命池|最后|最大生命值|最大弹药量|总计消耗时间|自定义字符串|自定义颜色|字符串字符索引|字符串中字符|字符串长度|字符串替换|字符串分割|字符串包含|字符串|助攻数量|主机玩家|逐帧更新|重生点|终极技能充能百分比|治疗者|治疗调整数量|指定方向速度|正在装填|正在站立|正在与人交流|正在移动|正在跳跃|正在使用主要武器|正在使用终极技能|正在使用语音交流|正在使用英雄|正在使用喷漆交流|正在使用技能 2|正在使用技能 1|正在使用辅助武器|正在使用表情交流|正在设置|正在人格复制|正在空中|正在近战攻击|正在交流|正在集结英雄|正在复制的英雄|正在防守|正在蹲下|正在等待玩家|真|占领要点模式正在得分的队伍|占领要点模式占领点解锁|占领要点模式得分百分比|在重生室中|在视野内|在视线内|在墙上|在目标点上|在夺旗模式中开始绝杀局|在地面上|运载目标位置|运载目标进度百分比|阈值|与此角度的相对方向|与此方向的水平角度|与此方向的垂直角度|与|余数|右|游戏正在进行中|游戏模式|映射的数组|英雄图标字符串|英雄数量|英雄|以角度为单位的反正弦值|以角度为单位的反正切值|以角度为单位的反余弦值|以弧度为单位的反正弦值|以弧度为单位的反正切值|以弧度为单位的反余弦值|已重生|已排序的数组|已过滤的数组|眼睛位置|颜色|选择英雄的玩家|携带旗帜的玩家|消灭数|向量|相距距离|下|武器|文本数量|玩家英雄数据|玩家数量|玩家数据|玩家变量|团队得分|图标字符串|头像火力全开|添加至数组|所在队伍|所有重装英雄|所有支援英雄|所有玩家|所有死亡玩家|所有输出英雄|所有目标点外玩家|所有目标点内玩家|所有存活玩家|所用英雄|所选位置|随机整数|随机数组|随机实数|速率|速度|死亡玩家数量|死亡数|死亡|水平速度|水平方向夹角|水平朝向角度|数组中的值|数组值的索引|数组随机取值|数组分割|数组包含|数组|数字|数量|输入绑定字符串|受治疗者|首个|是否有人携带旗帜|是否是机器人|视角中的玩家|事件治疗|事件为急救包|事件为环境事件|事件玩家|事件伤害|事件技能|事件方向|事件暴击|矢量间夹角|矢量积|矢量|实体数量|实体存在|生命值|射线命中位置|射线命中玩家|射线命中法线|上一个助攻ID|上一个治疗调整ID|上一个文本ID|上一个伤害调整ID|上一个持续治疗效果ID|上一个持续伤害效果ID|上|伤害调整数量|全局变量|全部英雄|取整|前|旗帜位置|旗帜是否在基地中|平方根|目标位置|目标是否完成|目标点占领百分比|目标点上玩家数量|面朝方向|类型的最大生命值|类型的生命值|栏位数量|栏位|空数组|空|可用英雄|绝对值|距离最远的玩家|距离最近的玩家|距离准星最近的玩家|具有状态|截取字符串|较小|较大|角度的正弦值|角度的正切值|角度的余弦值|角度差|减|假|加|技能资源|技能图标字符串|技能冷却时间|技能充能|或|弧度的正弦值|弧度的正切值|弧度的余弦值|后|归一化|攻击方|高度|幅值|服务器负载平均值|服务器负载峰值|服务器负载|分数|非|方向|范围内玩家|对象索引|对方队伍|队伍|地图矢量|地图工坊设置组合|地图工坊设置整数|地图工坊设置英雄|地图工坊设置实数|地图工坊设置开关|地图|当前游戏模式|当前数组元素|当前数组索引|当前地图|弹药|单次赋值|存活玩家数量|存活|从数组中移除|此栏位的玩家|垂直速度|垂直方向夹角|垂直朝向角度|处于回合之间|处于非初始状态|除|持续治疗数量|持续伤害数量|乘方|乘|标准化生命值|标量积|比赛时间|比赛结束|比赛回合|比较|本地玩家|本地矢量|被攻击方|按钮被按下|按钮/)) {
                                    return new vscode.Hover(MODEL.RULES.CONDITION[hoverText][theme])
                                } else if (match = hoverText.match(/X|D.Va自毁爆炸效果|D.Va自毁爆炸声音|D.Va微型飞弹爆炸效果|D.Va微型飞弹爆炸声音|D.Va|做好准备|左边|最小|最佳瞬间消灭|最后一击|最大|阻挡伤害量|总是|自我治疗量|字符串和颜色|字符串|紫色|状态爆炸声音|装填|抓钩光束|助攻者和目标|主要攻击模式|重新开始规则|终极技能状态|终极技能|终点及持续时间|中城|智械切割者光束声音|智械切割者光束|秩序之光|治疗目标效果|治疗目标激活效果|治疗量|治疗|至最近|至玩家|至地图|值和颜色|值|正在进攻|正在赶来|正在防守|正面状态施加声音|阵亡|遮蔽|爪兰蒂斯|占领要点|渣客镇|渣客女王|再见|运载目标|云|晕眩|源氏“镖”|源氏|圆圈|语音（左）|语音（右）|语音（下）|语音（上）|余数|诱饵声音|右边|有益选择效果|有益光束|有益光环声音|有益光环|有益爆炸|有害选择效果|有害光束|有害光环|有害爆炸|友善，位置，方向和大小|友善|勇夺锦旗|伊利奥斯深井|伊利奥斯废墟|伊利奥斯灯塔|伊利奥斯|眼睛|颜色|烟雾声音|训练靶场|雪域狩猎|雪球死斗|雪球攻势|旋转并转换|旋转|需要治疗|需要帮助|星形|星际守望：银河救兵|信标声音|新皇后街|协助进攻|协助防守|消灭|香巴里寺院|相移|下|细环|西格玛超能之球|西格玛|雾子|武器命中率|无视条件|无法杀死|无动作|无敌|无|沃斯卡娅工业区|我上了|我跟着你|问候|问号|温斯顿原始暴怒效果|温斯顿原始暴怒声音|温斯顿特斯拉炮声音|温斯顿特斯拉炮目标效果|温斯顿特斯拉炮目标声音|温斯顿特斯拉炮光束|温斯顿喷射背包着陆效果|温斯顿喷射背包着陆声音|温斯顿|位置和值|位置和颜色|位置和半径|位置，值和颜色|位置，方向和大小|位置，半径和颜色|位置|万圣节吉拉德堡|万圣节好莱坞|万圣节艾兴瓦尔德|托比昂热力过载效果|托比昂热力过载声音|托比昂炮台视线光束|托比昂|推进|团队死斗|突击模式|停止|铁坂|跳跃|添加至现有阈值|添加至数组|天使|天蓝色|替换现有阈值|索杰恩|所有造成伤害量|所有屏障阻挡视线|速率及最终值|死神|死斗|瞬间消灭|水绿色|双方|受治疗者和治疗者|受治疗者，治疗者及治疗百分比|受伤害者和伤害者|受伤害者，伤害者及伤害百分比|受到治疗量|收到|士兵：76|始终可见|始终不可见|使用终极技能|拾取音效|圣诞节生态监测站：南极洲|圣诞节尼泊尔村庄|圣诞节花村|圣诞节黑森林|圣诞节国王大道|圣诞节暴雪世界|生态监测站：南极洲|生命值|生命之梭|射击未命中|射击命中|射击次数|上|赏金猎手|伤害|融冰决斗|全部禁用|全部|取消相反运动XYZ|取消相反运动|球体|球弹道|球|青绿色|前进|旗帜|破坏球|屏障不会阻挡视线|喷漆左|喷漆右|喷漆下|喷漆上|佩特拉|排序规则和字符串|排序规则和颜色|排序规则，字符串和颜色|排序|帕拉伊苏|努巴尼|尼泊尔圣坛|尼泊尔圣所|尼泊尔村庄|尼泊尔|能量声音|难过|墓园|目标攻防消灭|默认可见度|默认|莫伊拉治疗生化之球|莫伊拉消散重现效果|莫伊拉消散重现声音|莫伊拉消散消失效果|莫伊拉消散消失声音|莫伊拉生化之球治疗声音|莫伊拉生化之球治疗光束|莫伊拉生化之球伤害声音|莫伊拉生化之球伤害光束|莫伊拉生化之触连接声音|莫伊拉生化之触连接光束|莫伊拉伤害生化之球|莫伊拉聚合射线声音|莫伊拉聚合射线光束|莫伊拉|末日铁拳|美冰锥|美冰冻效果|美冰冻声音|美|梅花|玫红|满月|马莱温多|螺旋|绿洲城中心|绿洲城花园|绿洲城大学|绿洲城|绿色|路霸的小鱿抓抓乐|路霸|卢西奥音障施放效果|卢西奥音障施放声音|卢西奥音障保护效果|卢西奥音障保护声音|卢西奥音速扩音器|卢西奥|猎空|亮紫色|里阿尔托|漓江塔夜市|漓江塔庭院|漓江塔控制中心|漓江塔|蓝色|莱因哈特烈焰打击目标击中效果|莱因哈特烈焰打击目标击中声音|莱因哈特烈焰打击|莱因哈特|拉玛刹吞噬漩涡能量球|拉玛刹|垃圾箱|狂鼠|宽环|骷髅|可见性和排序|可见性，排序规则和字符串|可见和字符串|可见和值|可见和颜色|可见和位置|可见，字符串和颜色|可见，值和颜色|可见，友善，位置，方向和大小|可见，友善|可见，位置和字符串|可见，位置和值|可见，位置和颜色|可见，位置和半径|可见，位置，字符串和颜色|可见，位置，值和颜色|可见，位置，半径和颜色|可见，排序规则和颜色|可见，排序规则，字符串和颜色|可见|开镜射击|开镜命中率|开镜命中|开镜暴击消灭|开镜暴击率|开镜暴击|卡西迪闪光弹击晕效果|卡西迪闪光弹爆炸效果|卡西迪闪光弹爆炸声音|卡西迪|决斗先锋|剧毒2|剧毒|拒绝|警告|近身攻击|箭头：向左|箭头：向右|箭头：向下|箭头：向上|箭矢|减|监测站：直布罗陀|加号|加|继续攻击|技能2|技能1|集合|吉拉德堡|机动推进|击晕|击倒|获得终极技能|火焰|火花声音|火花|回收|回声|灰色|灰绿色|黄色|皇家赛道|环状爆炸声音|环状爆炸|环|花村|护甲|护盾|互动|红桃|红色|黑影|黑桃|黑森林|黑色|黑百合|合并相反运动|好莱坞|好的|哈瓦那|国王大道|光柱|光晕|关闭|怪鼠复仇|攻击护送|攻防作战|根据值从数组中移除|根据索引从数组中移除|根据表面截取|高兴|感谢|感叹号|负面状态施加声音|负面光环音效|辅助攻击模式|釜山|辐射|方向及角速率|方向和幅度|方向，速率，及最大速度|方块|法老之鹰|多拉多|蹲下|对英雄造成伤害量|对屏障造成伤害量|对号|队伍2|队伍1|斗兽场|定身|顶部|点燃|敌人来袭|敌人|敌方屏障阻挡视线|地形阵亡|地形消灭|地图工坊室内|地图工坊绿幕|地图工坊空地（夜间）|地图工坊空地|地图工坊岛屿（夜间）|地图工坊岛屿|倒计时|当为“真”时重新开始|当为“假”时中止|单独消灭|春节漓江塔夜市|春节漓江塔庭院|春节漓江塔控制中心|春节漓江塔|春节釜山寺院|春节釜山城区|除|橙色|乘方|乘|城堡|承受伤害量|沉睡|撤退|禅雅塔乱目标效果|禅雅塔乱目标声音|禅雅塔|查莉娅重力喷涌|查莉娅粒子炮爆炸效果|查莉娅粒子炮爆炸声音|查莉娅粒子炮|查莉娅粒子光束|查莉娅|布丽吉塔流星飞锤范围治疗效果|布丽吉塔流星飞锤范围治疗声音|布丽吉塔连枷链光束|布丽吉塔恢复包击中效果|布丽吉塔恢复包击中声音|布丽吉塔恢复包护甲效果|布丽吉塔恢复包护甲声音|布丽吉塔|不用谢|不要截取|不行|冰冻|表情（左）|表情（右）|表情（下）|表情（上）|表面及全部屏障|表面及敌方屏障|表面|被入侵|爆炸声音|暴雪世界|暴击命中率|暴击|抱歉|堡垒|半藏音初始脉冲效果|半藏音初始脉冲声音|半藏|白色|巴黎|巴蒂斯特维生力场保护效果|巴蒂斯特维生力场保护声音|巴蒂斯特生化榴弹枪爆炸效果|巴蒂斯特生化榴弹枪爆炸声音|巴蒂斯特生化榴弹枪|巴蒂斯特|奥丽莎站住别动内爆效果|奥丽莎站住别动内爆声音|奥丽莎站住别动连线声音|奥丽莎站住别动连线光束|奥丽莎强化声音|奥丽莎强化光束|奥丽莎聚变驱动器|奥丽莎|安娜生物手雷增疗效果|安娜生物手雷增疗声音|安娜生物手雷禁疗效果|安娜生物手雷禁疗声音|安娜生物手雷爆炸效果|安娜生物手雷爆炸声音|安娜纳米激素强化效果|安娜纳米激素强化声音|安娜麻醉镖效果|安娜麻醉镖声音|安娜|艾兴瓦尔德|艾什延时雷管燃烧粒子效果|艾什延时雷管燃烧材料效果|艾什延时雷管爆炸效果|艾什延时雷管爆炸声音|艾什|埃斯佩兰萨|阿育陀耶|阿努比斯神殿|66号公路|“秩序之光”哨戒炮光束|“秩序之光”光子发射器声音|“秩序之光”光子发射器光束|“秩序之光”光子发射器|“秩序之光”传送面板重现效果|“秩序之光”传送面板重现声音|“西格玛”质量吸附击中效果|“西格玛”质量吸附击中声音|“西格玛”引力乱流目标效果|“西格玛”引力乱流目标声音|“西格玛”超能之球内爆效果|“西格玛”超能之球内爆声音|“天使”治疗光束声音|“天使”治疗光束|“天使”天使冲击枪|“天使”伤害强化效果|“天使”伤害强化声音|“天使”强化光束声音|“天使”强化光束|“死神”幽灵形态效果|“死神”幽灵形态声音|“士兵：76”疾跑效果|“士兵：76”疾跑开始声音|“破坏球”重力坠击击中效果|“破坏球”重力坠击击中声音|“破坏球”重力坠击火焰效果|“破坏球”重力坠击火焰声音|“破坏球”感应护盾目标效果|“破坏球”感应护盾目标声音|“破坏球”地雷禁区爆炸效果|“破坏球”地雷禁区爆炸声音|“末日铁拳”上勾重拳跳跃效果|“末日铁拳”上勾重拳跳跃声音|“末日铁拳”上勾重拳击中效果|“末日铁拳”上勾重拳击中声音|“末日铁拳”毁天灭地击中效果|“末日铁拳”毁天灭地击中声音|“路霸”爆裂枪废铁球|“路霸”爆裂枪|“猎空”闪回重现声音|“猎空”闪回消失效果|“猎空”闪回消失声音|“猎空“闪回重现效果|“狂鼠”震荡地雷爆炸效果|“狂鼠”震荡地雷爆炸声音|“狂鼠”炸弹轮胎爆炸效果|“狂鼠”炸弹轮胎爆炸声音|“狂鼠”陷阱链声音|“狂鼠”陷阱链光束|“狂鼠”榴弹发射器爆炸效果|“狂鼠”榴弹发射器爆炸声音|“回声”黏性炸弹爆炸效果|“回声”黏性炸弹爆炸声音|“回声”黏性炸弹|“回声”聚焦光线光束声音|“回声”聚焦光线光束|“回声”复制效果|“回声”复制声音|“黑影”位移传动重现效果|“黑影”位移传动重现声音|“黑影”位移传动消失效果|“黑影”位移传动消失声音|“黑影”位移传动声音|“黑影”位移传动材料效果|“黑影”黑客入侵完成循环效果|“黑影”黑客入侵完成声音|“黑影”黑客入侵完成开始效果|“黑影”黑客入侵进行声音|“黑影”电磁脉冲爆炸效果|“黑影”电磁脉冲爆炸声音|“黑影”标志效果|“黑影”标志声音|“黑百合”剧毒诡雷目标效果|“黑百合”剧毒诡雷爆炸声音|“黑百合“剧毒诡雷目标声音|“黑百合“剧毒诡雷爆炸效果|“法老之鹰”震荡冲击效果|“法老之鹰”震荡冲击声音|“法老之鹰”火箭发射器爆炸效果|“法老之鹰”火箭发射器爆炸声音|“法老之鹰”火箭弹幕爆炸效果|“法老之鹰”火箭弹幕爆炸声音|“法老之鹰”火箭|“地平线”月球基地|“堡垒”A-36战术榴弹|“堡垒”坦克炮爆炸效果|“堡垒”坦克炮爆炸声音/)) {
                                    getConstHover()
                                } else if (match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/)) {
                                    getCustomNameHover()
                                }
                            } else if (prevLineText == "动作") {
                                if (match = hoverText.match(/While|If|For 玩家变量|For 全局变量|End|Else If|Else|追踪玩家变量频率|追踪全局变量频率|重置玩家英雄可选状态|重新开始比赛|中止|中断|治疗|在索引处修改玩家变量|在索引处修改全局变量|在索引处设置玩家变量|在索引处设置全局变量|预加载英雄|隐藏游戏模式HUD|隐藏游戏模式地图UI|隐藏英雄HUD|隐藏姓名板|隐藏信息|隐藏消灭提示|隐藏计分板|移除玩家的所有生命值|移除玩家的生命池|移除玩家|移除所有机器人|移除机器人|循环|宣告玩家胜利|宣告回合胜利|宣告队伍胜利|宣布回合为平局|宣布比赛为平局|修改玩家分数|修改玩家变量|修改全局变量|修改队伍分数|小字体信息|消除HUD文本|消除效果|消除图标|消除所有HUD文本|消除所有效果|消除所有图标|消除所有进度条HUD文本|消除所有进度条地图文本|消除所有地图文本|消除进度条HUD文本|消除进度条地图文本|消除地图文本|显示游戏模式HUD|显示游戏模式地图UI|显示英雄HUD|显示姓名板|显示信息|显示消灭提示|显示计分板|为玩家添加生命池|停止追踪玩家变量|停止追踪全局变量|停止转换阈值|停止助攻|停止治疗调整|停止修改英雄语音|停止限制阈值|停止为机器人强制设置名称|停止所有助攻|停止所有治疗调整|停止所有伤害调整|停止所有持续治疗|停止所有持续伤害|停止伤害调整|停止强制重生室|停止强制玩家选择英雄|停止强制设置玩家位置|停止强制设置玩家轮廓|停止镜头|停止加速|停止定向阈值|停止调整障碍大小|停止调整玩家大小|停止持续治疗|停止持续伤害|停止朝向|停止按下按钮|跳过|施加推力|生成机器人|设置最大生命值|设置最大复生时间|设置最大弹药|设置状态|设置主要攻击模式启用|设置终极技能充能|设置造成治疗|设置造成伤害|设置造成的击退|设置引力|设置移动速度|设置武器|设置玩家生命值|设置玩家可选的英雄|设置玩家分数|设置玩家变量|设置跳跃垂直速度|设置受到治疗|设置受到伤害|设置受到的击退|设置全局变量|设置启用装填|设置启用终极技能|设置启用跳跃|设置启用近战攻击|设置启用技能 2|设置启用技能 1|设置启用蹲下|设置目标点描述|设置瞄准速度|设置慢动作|设置技能资源|设置技能冷却|设置技能充能|设置辅助攻击模式启用|设置队伍分数|设置地形消灭者玩家|设置弹药|设置弹道引力|设置弹道速度|设置朝向|设置不可见|设置比赛时间|伤害|如条件为“真”则中止|如条件为“真”则循环|如条件为“假”则中止|如条件为“假”则循环|取消主要动作|取消与玩家的移动碰撞|取消与环境的移动碰撞|清除状态|前往集结英雄|启用语音聊天|启用文字聊天|启用死亡回放时目标的HUD|启用查看器录制|可用按钮|开始转换阈值|开始助攻|开始治疗调整|开始游戏模式|开始修改英雄语音|开始限制阈值|开始为机器人强制设置名称|开始伤害调整|开始强制重生室|开始强制玩家选择英雄|开始强制设置玩家位置|开始强制设置玩家轮廓|开始镜头|开始加速|开始规则|开始定向阈值|开始调整障碍大小|开始调整玩家大小|开始持续治疗|开始持续伤害|开始朝向|开始按下按钮|开启与玩家的移动碰撞|开启与环境的移动碰撞|开启游戏预设音乐模式|开启游戏预设完成条件|开启游戏预设通告模式|开启游戏预设计分模式|开启游戏预设复生模式|禁用语音聊天|禁用文字聊天|禁用死亡回放时目标的HUD|禁用查看器录制|禁用按钮|解除绑定|交流|继续|记入查看器|击杀|关闭游戏预设音乐模式|关闭游戏预设完成条件|关闭游戏预设通告模式|关闭游戏预设计分模式|关闭游戏预设复生模式|根据条件中止|根据条件循环|根据条件跳过|复生|复活|返回大厅|对所有玩家启用死亡回放|对所有玩家禁用死亡回放|调整玩家队伍|调用子程序|等待直到|等待|大字体信息|创建HUD文本|创建追踪弹道|创建效果|创建图标|创建进度条HUD文本|创建进度条地图文本|创建光束效果|创建地图文本|创建弹道效果|创建弹道|传送|持续追踪玩家变量|持续追踪全局变量|播放效果|比赛时间暂停|比赛时间继续|绑定玩家|按下按键/)) {
                                    return new vscode.Hover(MODEL.RULES.ACTION[hoverText][theme])
                                } else if (match = hoverText.match(/对任意为“真”|对全部为“真”|Z方向分量|Y方向分量|X方向分量|作为进攻队伍|左|最近的可行走位置|最后一击数|最后创建的实体|最后创建的生命池|最后|最大生命值|最大弹药量|总计消耗时间|自定义字符串|自定义颜色|字符串字符索引|字符串中字符|字符串长度|字符串替换|字符串分割|字符串包含|字符串|助攻数量|主机玩家|逐帧更新|重生点|终极技能充能百分比|治疗者|治疗调整数量|指定方向速度|正在装填|正在站立|正在与人交流|正在移动|正在跳跃|正在使用主要武器|正在使用终极技能|正在使用语音交流|正在使用英雄|正在使用喷漆交流|正在使用技能 2|正在使用技能 1|正在使用辅助武器|正在使用表情交流|正在设置|正在人格复制|正在空中|正在近战攻击|正在交流|正在集结英雄|正在复制的英雄|正在防守|正在蹲下|正在等待玩家|真|占领要点模式正在得分的队伍|占领要点模式占领点解锁|占领要点模式得分百分比|在重生室中|在视野内|在视线内|在墙上|在目标点上|在夺旗模式中开始绝杀局|在地面上|运载目标位置|运载目标进度百分比|阈值|与此角度的相对方向|与此方向的水平角度|与此方向的垂直角度|与|余数|右|游戏正在进行中|游戏模式|映射的数组|英雄图标字符串|英雄数量|英雄|以角度为单位的反正弦值|以角度为单位的反正切值|以角度为单位的反余弦值|以弧度为单位的反正弦值|以弧度为单位的反正切值|以弧度为单位的反余弦值|已重生|已排序的数组|已过滤的数组|眼睛位置|颜色|选择英雄的玩家|携带旗帜的玩家|消灭数|向量|相距距离|下|武器|文本数量|玩家英雄数据|玩家数量|玩家数据|玩家变量|团队得分|图标字符串|头像火力全开|添加至数组|所在队伍|所有重装英雄|所有支援英雄|所有玩家|所有死亡玩家|所有输出英雄|所有目标点外玩家|所有目标点内玩家|所有存活玩家|所用英雄|所选位置|随机整数|随机数组|随机实数|速率|速度|死亡玩家数量|死亡数|死亡|水平速度|水平方向夹角|水平朝向角度|数组中的值|数组值的索引|数组随机取值|数组分割|数组包含|数组|数字|数量|输入绑定字符串|受治疗者|首个|是否有人携带旗帜|是否是机器人|视角中的玩家|事件治疗|事件为急救包|事件为环境事件|事件玩家|事件伤害|事件技能|事件方向|事件暴击|矢量间夹角|矢量积|矢量|实体数量|实体存在|生命值|射线命中位置|射线命中玩家|射线命中法线|上一个助攻ID|上一个治疗调整ID|上一个文本ID|上一个伤害调整ID|上一个持续治疗效果ID|上一个持续伤害效果ID|上|伤害调整数量|全局变量|全部英雄|取整|前|旗帜位置|旗帜是否在基地中|平方根|目标位置|目标是否完成|目标点占领百分比|目标点上玩家数量|面朝方向|类型的最大生命值|类型的生命值|栏位数量|栏位|空数组|空|可用英雄|绝对值|距离最远的玩家|距离最近的玩家|距离准星最近的玩家|具有状态|截取字符串|较小|较大|角度的正弦值|角度的正切值|角度的余弦值|角度差|减|假|加|技能资源|技能图标字符串|技能冷却时间|技能充能|或|弧度的正弦值|弧度的正切值|弧度的余弦值|后|归一化|攻击方|高度|幅值|服务器负载平均值|服务器负载峰值|服务器负载|分数|非|方向|范围内玩家|对象索引|对方队伍|队伍|地图矢量|地图工坊设置组合|地图工坊设置整数|地图工坊设置英雄|地图工坊设置实数|地图工坊设置开关|地图|当前游戏模式|当前数组元素|当前数组索引|当前地图|弹药|单次赋值|存活玩家数量|存活|从数组中移除|此栏位的玩家|垂直速度|垂直方向夹角|垂直朝向角度|处于回合之间|处于非初始状态|除|持续治疗数量|持续伤害数量|乘方|乘|标准化生命值|标量积|比赛时间|比赛结束|比赛回合|比较|本地玩家|本地矢量|被攻击方|按钮被按下|按钮/)) {
                                    return new vscode.Hover(MODEL.RULES.CONDITION[hoverText][theme])
                                } else if (match = hoverText.match(/X|D.Va自毁爆炸效果|D.Va自毁爆炸声音|D.Va微型飞弹爆炸效果|D.Va微型飞弹爆炸声音|D.Va|做好准备|左边|最小|最佳瞬间消灭|最后一击|最大|阻挡伤害量|总是|自我治疗量|字符串和颜色|字符串|紫色|状态爆炸声音|装填|抓钩光束|助攻者和目标|主要攻击模式|重新开始规则|终极技能状态|终极技能|终点及持续时间|中城|智械切割者光束声音|智械切割者光束|秩序之光|治疗目标效果|治疗目标激活效果|治疗量|治疗|至最近|至玩家|至地图|值和颜色|值|正在进攻|正在赶来|正在防守|正面状态施加声音|阵亡|遮蔽|爪兰蒂斯|占领要点|渣客镇|渣客女王|再见|运载目标|云|晕眩|源氏“镖”|源氏|圆圈|语音（左）|语音（右）|语音（下）|语音（上）|余数|诱饵声音|右边|有益选择效果|有益光束|有益光环声音|有益光环|有益爆炸|有害选择效果|有害光束|有害光环|有害爆炸|友善，位置，方向和大小|友善|勇夺锦旗|伊利奥斯深井|伊利奥斯废墟|伊利奥斯灯塔|伊利奥斯|眼睛|颜色|烟雾声音|训练靶场|雪域狩猎|雪球死斗|雪球攻势|旋转并转换|旋转|需要治疗|需要帮助|星形|星际守望：银河救兵|信标声音|新皇后街|协助进攻|协助防守|消灭|香巴里寺院|相移|下|细环|西格玛超能之球|西格玛|雾子|武器命中率|无视条件|无法杀死|无动作|无敌|无|沃斯卡娅工业区|我上了|我跟着你|问候|问号|温斯顿原始暴怒效果|温斯顿原始暴怒声音|温斯顿特斯拉炮声音|温斯顿特斯拉炮目标效果|温斯顿特斯拉炮目标声音|温斯顿特斯拉炮光束|温斯顿喷射背包着陆效果|温斯顿喷射背包着陆声音|温斯顿|位置和值|位置和颜色|位置和半径|位置，值和颜色|位置，方向和大小|位置，半径和颜色|位置|万圣节吉拉德堡|万圣节好莱坞|万圣节艾兴瓦尔德|托比昂热力过载效果|托比昂热力过载声音|托比昂炮台视线光束|托比昂|推进|团队死斗|突击模式|停止|铁坂|跳跃|添加至现有阈值|添加至数组|天使|天蓝色|替换现有阈值|索杰恩|所有造成伤害量|所有屏障阻挡视线|速率及最终值|死神|死斗|瞬间消灭|水绿色|双方|受治疗者和治疗者|受治疗者，治疗者及治疗百分比|受伤害者和伤害者|受伤害者，伤害者及伤害百分比|受到治疗量|收到|士兵：76|始终可见|始终不可见|使用终极技能|拾取音效|圣诞节生态监测站：南极洲|圣诞节尼泊尔村庄|圣诞节花村|圣诞节黑森林|圣诞节国王大道|圣诞节暴雪世界|生态监测站：南极洲|生命值|生命之梭|射击未命中|射击命中|射击次数|上|赏金猎手|伤害|融冰决斗|全部禁用|全部|取消相反运动XYZ|取消相反运动|球体|球弹道|球|青绿色|前进|旗帜|破坏球|屏障不会阻挡视线|喷漆左|喷漆右|喷漆下|喷漆上|佩特拉|排序规则和字符串|排序规则和颜色|排序规则，字符串和颜色|排序|帕拉伊苏|努巴尼|尼泊尔圣坛|尼泊尔圣所|尼泊尔村庄|尼泊尔|能量声音|难过|墓园|目标攻防消灭|默认可见度|默认|莫伊拉治疗生化之球|莫伊拉消散重现效果|莫伊拉消散重现声音|莫伊拉消散消失效果|莫伊拉消散消失声音|莫伊拉生化之球治疗声音|莫伊拉生化之球治疗光束|莫伊拉生化之球伤害声音|莫伊拉生化之球伤害光束|莫伊拉生化之触连接声音|莫伊拉生化之触连接光束|莫伊拉伤害生化之球|莫伊拉聚合射线声音|莫伊拉聚合射线光束|莫伊拉|末日铁拳|美冰锥|美冰冻效果|美冰冻声音|美|梅花|玫红|满月|马莱温多|螺旋|绿洲城中心|绿洲城花园|绿洲城大学|绿洲城|绿色|路霸的小鱿抓抓乐|路霸|卢西奥音障施放效果|卢西奥音障施放声音|卢西奥音障保护效果|卢西奥音障保护声音|卢西奥音速扩音器|卢西奥|猎空|亮紫色|里阿尔托|漓江塔夜市|漓江塔庭院|漓江塔控制中心|漓江塔|蓝色|莱因哈特烈焰打击目标击中效果|莱因哈特烈焰打击目标击中声音|莱因哈特烈焰打击|莱因哈特|拉玛刹吞噬漩涡能量球|拉玛刹|垃圾箱|狂鼠|宽环|骷髅|可见性和排序|可见性，排序规则和字符串|可见和字符串|可见和值|可见和颜色|可见和位置|可见，字符串和颜色|可见，值和颜色|可见，友善，位置，方向和大小|可见，友善|可见，位置和字符串|可见，位置和值|可见，位置和颜色|可见，位置和半径|可见，位置，字符串和颜色|可见，位置，值和颜色|可见，位置，半径和颜色|可见，排序规则和颜色|可见，排序规则，字符串和颜色|可见|开镜射击|开镜命中率|开镜命中|开镜暴击消灭|开镜暴击率|开镜暴击|卡西迪闪光弹击晕效果|卡西迪闪光弹爆炸效果|卡西迪闪光弹爆炸声音|卡西迪|决斗先锋|剧毒2|剧毒|拒绝|警告|近身攻击|箭头：向左|箭头：向右|箭头：向下|箭头：向上|箭矢|减|监测站：直布罗陀|加号|加|继续攻击|技能2|技能1|集合|吉拉德堡|机动推进|击晕|击倒|获得终极技能|火焰|火花声音|火花|回收|回声|灰色|灰绿色|黄色|皇家赛道|环状爆炸声音|环状爆炸|环|花村|护甲|护盾|互动|红桃|红色|黑影|黑桃|黑森林|黑色|黑百合|合并相反运动|好莱坞|好的|哈瓦那|国王大道|光柱|光晕|关闭|怪鼠复仇|攻击护送|攻防作战|根据值从数组中移除|根据索引从数组中移除|根据表面截取|高兴|感谢|感叹号|负面状态施加声音|负面光环音效|辅助攻击模式|釜山|辐射|方向及角速率|方向和幅度|方向，速率，及最大速度|方块|法老之鹰|多拉多|蹲下|对英雄造成伤害量|对屏障造成伤害量|对号|队伍2|队伍1|斗兽场|定身|顶部|点燃|敌人来袭|敌人|敌方屏障阻挡视线|地形阵亡|地形消灭|地图工坊室内|地图工坊绿幕|地图工坊空地（夜间）|地图工坊空地|地图工坊岛屿（夜间）|地图工坊岛屿|倒计时|当为“真”时重新开始|当为“假”时中止|单独消灭|春节漓江塔夜市|春节漓江塔庭院|春节漓江塔控制中心|春节漓江塔|春节釜山寺院|春节釜山城区|除|橙色|乘方|乘|城堡|承受伤害量|沉睡|撤退|禅雅塔乱目标效果|禅雅塔乱目标声音|禅雅塔|查莉娅重力喷涌|查莉娅粒子炮爆炸效果|查莉娅粒子炮爆炸声音|查莉娅粒子炮|查莉娅粒子光束|查莉娅|布丽吉塔流星飞锤范围治疗效果|布丽吉塔流星飞锤范围治疗声音|布丽吉塔连枷链光束|布丽吉塔恢复包击中效果|布丽吉塔恢复包击中声音|布丽吉塔恢复包护甲效果|布丽吉塔恢复包护甲声音|布丽吉塔|不用谢|不要截取|不行|冰冻|表情（左）|表情（右）|表情（下）|表情（上）|表面及全部屏障|表面及敌方屏障|表面|被入侵|爆炸声音|暴雪世界|暴击命中率|暴击|抱歉|堡垒|半藏音初始脉冲效果|半藏音初始脉冲声音|半藏|白色|巴黎|巴蒂斯特维生力场保护效果|巴蒂斯特维生力场保护声音|巴蒂斯特生化榴弹枪爆炸效果|巴蒂斯特生化榴弹枪爆炸声音|巴蒂斯特生化榴弹枪|巴蒂斯特|奥丽莎站住别动内爆效果|奥丽莎站住别动内爆声音|奥丽莎站住别动连线声音|奥丽莎站住别动连线光束|奥丽莎强化声音|奥丽莎强化光束|奥丽莎聚变驱动器|奥丽莎|安娜生物手雷增疗效果|安娜生物手雷增疗声音|安娜生物手雷禁疗效果|安娜生物手雷禁疗声音|安娜生物手雷爆炸效果|安娜生物手雷爆炸声音|安娜纳米激素强化效果|安娜纳米激素强化声音|安娜麻醉镖效果|安娜麻醉镖声音|安娜|艾兴瓦尔德|艾什延时雷管燃烧粒子效果|艾什延时雷管燃烧材料效果|艾什延时雷管爆炸效果|艾什延时雷管爆炸声音|艾什|埃斯佩兰萨|阿育陀耶|阿努比斯神殿|66号公路|“秩序之光”哨戒炮光束|“秩序之光”光子发射器声音|“秩序之光”光子发射器光束|“秩序之光”光子发射器|“秩序之光”传送面板重现效果|“秩序之光”传送面板重现声音|“西格玛”质量吸附击中效果|“西格玛”质量吸附击中声音|“西格玛”引力乱流目标效果|“西格玛”引力乱流目标声音|“西格玛”超能之球内爆效果|“西格玛”超能之球内爆声音|“天使”治疗光束声音|“天使”治疗光束|“天使”天使冲击枪|“天使”伤害强化效果|“天使”伤害强化声音|“天使”强化光束声音|“天使”强化光束|“死神”幽灵形态效果|“死神”幽灵形态声音|“士兵：76”疾跑效果|“士兵：76”疾跑开始声音|“破坏球”重力坠击击中效果|“破坏球”重力坠击击中声音|“破坏球”重力坠击火焰效果|“破坏球”重力坠击火焰声音|“破坏球”感应护盾目标效果|“破坏球”感应护盾目标声音|“破坏球”地雷禁区爆炸效果|“破坏球”地雷禁区爆炸声音|“末日铁拳”上勾重拳跳跃效果|“末日铁拳”上勾重拳跳跃声音|“末日铁拳”上勾重拳击中效果|“末日铁拳”上勾重拳击中声音|“末日铁拳”毁天灭地击中效果|“末日铁拳”毁天灭地击中声音|“路霸”爆裂枪废铁球|“路霸”爆裂枪|“猎空”闪回重现声音|“猎空”闪回消失效果|“猎空”闪回消失声音|“猎空“闪回重现效果|“狂鼠”震荡地雷爆炸效果|“狂鼠”震荡地雷爆炸声音|“狂鼠”炸弹轮胎爆炸效果|“狂鼠”炸弹轮胎爆炸声音|“狂鼠”陷阱链声音|“狂鼠”陷阱链光束|“狂鼠”榴弹发射器爆炸效果|“狂鼠”榴弹发射器爆炸声音|“回声”黏性炸弹爆炸效果|“回声”黏性炸弹爆炸声音|“回声”黏性炸弹|“回声”聚焦光线光束声音|“回声”聚焦光线光束|“回声”复制效果|“回声”复制声音|“黑影”位移传动重现效果|“黑影”位移传动重现声音|“黑影”位移传动消失效果|“黑影”位移传动消失声音|“黑影”位移传动声音|“黑影”位移传动材料效果|“黑影”黑客入侵完成循环效果|“黑影”黑客入侵完成声音|“黑影”黑客入侵完成开始效果|“黑影”黑客入侵进行声音|“黑影”电磁脉冲爆炸效果|“黑影”电磁脉冲爆炸声音|“黑影”标志效果|“黑影”标志声音|“黑百合”剧毒诡雷目标效果|“黑百合”剧毒诡雷爆炸声音|“黑百合“剧毒诡雷目标声音|“黑百合“剧毒诡雷爆炸效果|“法老之鹰”震荡冲击效果|“法老之鹰”震荡冲击声音|“法老之鹰”火箭发射器爆炸效果|“法老之鹰”火箭发射器爆炸声音|“法老之鹰”火箭弹幕爆炸效果|“法老之鹰”火箭弹幕爆炸声音|“法老之鹰”火箭|“地平线”月球基地|“堡垒”A-36战术榴弹|“堡垒”坦克炮爆炸效果|“堡垒”坦克炮爆炸声音/)) {
                                    getConstHover()
                                } else if (match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/)) {
                                    getCustomNameHover()
                                }
                            } else {
                                return
                            }
                        }
                    } else if (lineText.startsWith("}")) {
                        rightBracesCount++
                    }
                }

                function getConstHover() {
                    for (i in MODEL.CONSTS) {
                        for (j in MODEL.CONSTS[i]) {
                            if (match == j) {
                                return new vscode.Hover(MODEL.CONSTS[i][hoverText][theme])
                            }
                        }
                    }
                }

                function getCustomNameHover() {
                    const customNames = getCustomNames(document)
                    let prefix = document.offsetAt(document.getWordRangeAtPosition(position).start) - 1
                    let prefixText = document.getText()[prefix]
                    if (prefixText == ".") {
                        prefixText = document.getText(document.getWordRangeAtPosition(document.positionAt(prefix - 1)))
                        if (prefixText == "全局") {
                            for (i in customNames.全局变量) {
                                if (hoverText == customNames.全局变量[i]) {
                                    let str = new vscode.MarkdownString()
                                    str.isTrusted = true
                                    str.supportHtml = true
                                    str.supportThemeIcons = true
                                    str.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
                                    str.appendMarkdown(`***<span>${hoverText}</span>***\n\n\`全局变量\` \`${i}\``)
                                    return new vscode.Hover(str)
                                }
                            }
                        } else {
                            for (i in customNames.玩家变量) {
                                if (hoverText == customNames.玩家变量[i]) {
                                    let str = new vscode.MarkdownString()
                                    str.isTrusted = true
                                    str.supportHtml = true
                                    str.supportThemeIcons = true
                                    str.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
                                    str.appendMarkdown(`***<span>${hoverText}</span>***\n\n\`玩家变量\` \`${i}\``)
                                    return new vscode.Hover(str)
                                }
                            }
                        }
                    } else {
                        for (i in customNames.子程序) {
                            if (hoverText == customNames.子程序[i]) {
                                let str = new vscode.MarkdownString()
                                str.isTrusted = true
                                str.supportHtml = true
                                str.supportThemeIcons = true
                                str.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
                                str.appendMarkdown(`***<span>${hoverText}</span>***\n\n\`子程序\` \`${i}\``)
                                return new vscode.Hover(str)
                            }
                        }
                    }
                }
            }
        }),

        //补全
        vscode.languages.registerCompletionItemProvider("ow", {
            provideCompletionItems(document, position, token, context) {
                let item = new vscode.CompletionItem("无建议")
                item.insertText = ""
                return [item]
            }
        }, '(', ',', '.', ' '),

        //参数
        vscode.languages.registerSignatureHelpProvider("ow", {
            provideSignatureHelp(document, position, token, context) {

            }
        }, '(', ',', ' '),

        //手册
        vscode.window.registerWebviewViewProvider('ow.view.manual', {
            resolveWebviewView(webviewView) {
                const theme = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Dark
                const extensionUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
                const themeUri = theme ? '' : 'gray/'
                const styleUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'views', theme ? `dark.css` : `light.css`))
                const scriptUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'views', 'script.js'))

                function getHomeHtml() {
                    return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>参考</title>
                    </head>
                    <body>
                    <i><h3>参考</h3></i>
                    <button style="width: 150px; height: auto;" onclick="navigate('String')">字符串</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('Color')">颜色</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('Icon')">图标</button>
                    <br>
                    <br>
                    </body>
                    </html>`
                }

                function getStringTableHtml() {
                    const strings = Object.getOwnPropertyNames(MODEL.CONSTS.STRING).map((v, i) => {
                        if (i % 3 === 0) {
                            return `</tr><tr><td style="text-align: center;">${v}</td>`
                        } else {
                            return `<td style="text-align: center;">${v}</td>`
                        }
                    }).join("")
                    return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>字符串</title>
                    </head>
                    <body>
                    <br>
                    <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                    <i><h3>字符串</h3></i>
                    <table style="min-width: 300px; max-width: 400px;">
                    <tr>
                    ${strings}
                    </tr>
                    </table>
                    </body>
                    </html>`
                }

                function getColorTableHtml() {
                    return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>颜色</title>
                    </head>
                    <body>
                    <br>
                    <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                    <i><h3>颜色</h3></i>
                    <table style="min-width: 300px; max-width: 400px;">
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'white.png'))}" width="35" height="auto"><br>白色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'yellow.png'))}" width="35" height="auto"><br>黄色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'green.png'))}" width="35" height="auto"><br>绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'violet.png'))}" width="35" height="auto"><br>紫色<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'red.png'))}" width="35" height="auto"><br>红色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'blue.png'))}" width="35" height="auto"><br>蓝色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'aqua.png'))}" width="35" height="auto"><br>水绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'orange.png'))}" width="35" height="auto"><br>橙色<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'sky_blue.png'))}" width="35" height="auto"><br>天蓝色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'turquoise.png'))}" width="35" height="auto"><br>青绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'lime_green.png'))}" width="35" height="auto"><br>灰绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'purple.png'))}" width="35" height="auto"><br>亮紫色<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'black.png'))}" width="35" height="auto"><br>黑色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'rose.png'))}" width="35" height="auto"><br>玫红<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'gray.png'))}" width="35" height="auto"><br>灰色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'team1.png'))}" width="35" height="auto"><br>队伍1<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'color', 'team2.png'))}" width="35" height="auto"><br>队伍2<br></td>
                    </tr>
                    </table>
                    </body>
                    </html>`
                }

                function getIconTableHtml() {
                    const numCols = 4
                    const numRows = Math.ceil(36 / numCols)
                    const tableRows = Array(numRows).fill().map((_, rowIndex) => {
                        const startImageIndex = rowIndex * numCols + 1
                        const endImageIndex = Math.min(startImageIndex + numCols - 1, 36)
                        const imageCells = Array(endImageIndex - startImageIndex + 1).fill().map((_, colIndex) => {
                            const imageNumber = startImageIndex + colIndex
                            const imageSrc = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'icon', `${themeUri}${imageNumber}.png`))
                            const icons = Object.getOwnPropertyNames(MODEL.CONSTS.ICON)
                            return `<td style="text-align: center; font-weight: 500;"><img src="${imageSrc}" width="30" height="30"><br>${icons[imageNumber - 1]}</td>`
                        }).join("")
                        return `<tr>${imageCells}</tr>`
                    })
                    const tableHtml = `<table style="min-width: 300px; max-width: 400px;">${tableRows.join("")}</table>`
                    return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>图标选项</title>
                    </head>

                    <body>

                    <br>
                    <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>

                    <i><h3>图标</h3></i>
                    ${tableHtml}

                    <i><h3>英雄/技能图标</h3></i>
                    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', `${themeUri}tank.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;重装</h4>
                    <table style="min-width: 700px; max-width: 800px;">
                    <thead>
                    <td style="text-align: center; font-weight: 600;">英雄</td>
                    <td style="text-align: center; font-weight: 600;">主要攻击模式</td>
                    <td style="text-align: center; font-weight: 600;">辅助攻击模式</td>
                    <td style="text-align: center; font-weight: 600;">终极技能</td>
                    <td style="text-align: center; font-weight: 600;">技能1</td>
                    <td style="text-align: center; font-weight: 600;">技能2</td>
                    <td style="text-align: center; font-weight: 600;">近身攻击</td>
                    <td style="text-align: center; font-weight: 600;">跳跃</td>
                    <td style="text-align: center; font-weight: 600;">蹲下</td>
                    </thead>
                    <tbody>
                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', 'icon.png'))}" width="auto" height="50"><br>末日铁拳<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', 'icon.png'))}" width="auto" height="50"><br>D.Va<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', 'weapon1.png'))}" width="60" height="auto"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', `${themeUri}ultimate1.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', 'icon.png'))}" width="auto" height="50"><br>破坏球<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', `${themeUri}crouch.png`))}" width="30" height="30"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', 'icon.png'))}" width="auto" height="50"><br>渣客女王<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', 'icon.png'))}" width="auto" height="50"><br>奥丽莎<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', 'icon.png'))}" width="auto" height="50"><br>莱因哈特<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', 'icon.png'))}" width="auto" height="50"><br>路霸<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', 'icon.png'))}" width="auto" height="50"><br>西格玛<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', 'icon.png'))}" width="auto" height="50"><br>温斯顿<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', 'icon.png'))}" width="auto" height="50"><br>查莉娅<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', 'icon.png'))}" width="auto" height="50"><br>拉玛刹<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', 'weapon1.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', `${themeUri}secondaryfire1.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', `${themeUri}damage.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;输出</h4>
                    <table style="min-width: 700px; max-width: 800px;">
                    <thead>
                    <td style="text-align: center; font-weight: 600;">英雄</td>
                    <td style="text-align: center; font-weight: 600;">主要攻击模式</td>
                    <td style="text-align: center; font-weight: 600;">辅助攻击模式</td>
                    <td style="text-align: center; font-weight: 600;">终极技能</td>
                    <td style="text-align: center; font-weight: 600;">技能1</td>
                    <td style="text-align: center; font-weight: 600;">技能2</td>
                    <td style="text-align: center; font-weight: 600;">近身攻击</td>
                    <td style="text-align: center; font-weight: 600;">跳跃</td>
                    <td style="text-align: center; font-weight: 600;">蹲下</td>
                    </thead>
                    <tbody>
                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', 'icon.png'))}" width="auto" height="50"><br>艾什<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', 'icon.png'))}" width="auto" height="50"><br>堡垒<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', 'weapon1.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', 'icon.png'))}" width="auto" height="50"><br>回声<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', 'icon.png'))}" width="auto" height="50"><br>源氏<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', 'icon.png'))}" width="auto" height="50"><br>半藏<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', 'icon.png'))}" width="auto" height="50"><br>狂鼠<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', 'icon.png'))}" width="auto" height="50"><br>卡西迪<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', 'icon.png'))}" width="auto" height="50"><br>美<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', 'icon.png'))}" width="auto" height="50"><br>法老之鹰<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', 'icon.png'))}" width="auto" height="50"><br>死神<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', 'icon.png'))}" width="auto" height="50"><br>索杰恩<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', 'icon.png'))}" width="auto" height="50"><br>士兵：76<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', 'icon.png'))}" width="auto" height="50"><br>黑影<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', 'icon.png'))}" width="auto" height="50"><br>秩序之光<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', 'icon.png'))}" width="auto" height="50"><br>托比昂<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', 'weapon1.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', `weapon1.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', 'icon.png'))}" width="auto" height="50"><br>猎空<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', 'icon.png'))}" width="auto" height="50"><br>黑百合<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', `${themeUri}support.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;支援</h4>
                    <table style="min-width: 700px; max-width: 800px;">
                    <thead>
                    <td style="text-align: center; font-weight: 600;">英雄</td>
                    <td style="text-align: center; font-weight: 600;">主要攻击模式</td>
                    <td style="text-align: center; font-weight: 600;">辅助攻击模式</td>
                    <td style="text-align: center; font-weight: 600;">终极技能</td>
                    <td style="text-align: center; font-weight: 600;">技能1</td>
                    <td style="text-align: center; font-weight: 600;">技能2</td>
                    <td style="text-align: center; font-weight: 600;">近身攻击</td>
                    <td style="text-align: center; font-weight: 600;">跳跃</td>
                    <td style="text-align: center; font-weight: 600;">蹲下</td>
                    </thead>
                    <tbody>
                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', 'icon.png'))}" width="auto" height="50"><br>安娜<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', 'icon.png'))}" width="auto" height="50"><br>巴蒂斯特<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', 'weapon1.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', `weapon2.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', 'icon.png'))}" width="auto" height="50"><br>布丽吉塔<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', `${themeUri}secondaryfire1.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', 'icon.png'))}" width="auto" height="50"><br>雾子<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', 'weapon1.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', `weapon2.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', 'icon.png'))}" width="auto" height="50"><br>卢西奥<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', 'icon.png'))}" width="auto" height="50"><br>天使<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', 'weapon1.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', `weapon1.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', `${themeUri}passive.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', 'icon.png'))}" width="auto" height="50"><br>莫伊拉<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', 'icon.png'))}" width="auto" height="50"><br>禅雅塔<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', 'weapon.png'))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', `weapon.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', 'icon.png'))}" width="auto" height="50"><br>生命之梭<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', 'weapon1.png'))}" width="60" height="auto"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', `${themeUri}secondaryfire.png`))}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', `${themeUri}ultimate.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', `${themeUri}ability1.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', `${themeUri}ability2.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', `${themeUri}melee.png`))}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    </body>

                    </html>`
                }

                webviewView.webview.html = getHomeHtml()
                webviewView.webview.options = {
                    enableScripts: true,
                    localResourceRoots: [extensionUri]
                }
                webviewView.webview.onDidReceiveMessage(message => {
                    switch (message) {
                        case 'Home':
                            webviewView.webview.html = getHomeHtml()
                            return
                        case 'String':
                            webviewView.webview.html = getStringTableHtml()
                            return
                        case 'Color':
                            webviewView.webview.html = getColorTableHtml()
                            return
                        case 'Icon':
                            webviewView.webview.html = getIconTableHtml()
                            return
                        default:
                            console.log('Unknown command: ' + message.command)
                            return
                    }
                })
            }
        })
    )
}

function getVariableItems(document) {
    const text = document.getText()
    const length = text.length
    const ranges = getStringRange(document)
    let globalItems = []
    let playerItems = []

    let inblock = false
    let kind = ""
    for (let i = 0; i < length; i++) {
        //跳过字符串
        if (ranges.has(i)) {
            continue
        }
        if (text[i] == "{") {
            let word = getBlock(document, i)
            if (word[0] == "变量") {
                inblock = true
            }
        } else if (inblock) {
            if (text[i] == "}") {
                break
            } else if (text[i] == ":") {
                let index = getVariableIndex(document, i, ranges)
                if (index.match(/(全局|玩家)/)) {
                    kind = index
                } else if (index.match(/\b(-?\d+)(.\d+|\d+)?\b/)) {
                    let name = getVariableName(document, i, ranges)
                    let item = new vscode.CompletionItem(index.padStart(3, '0') + ": " + name, vscode.CompletionItemKind.Variable)
                    item.kind = vscode.CompletionItemKind.Variable
                    item.documentation = new vscode.MarkdownString()
                    item.documentation.isTrusted = true
                    item.documentation.supportHtml = true
                    item.documentation.supportThemeIcons = true
                    item.documentation.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
                    item.documentation.appendMarkdown(`***${name}***\n\n\`${kind}变量\`&nbsp;\`${index}\`\n\n一个已声明的${kind}变量。`)
                    item.insertText = name
                    item.filterText = (index.padStart(3, '0') + name).split("").join(" ")
                    if (kind == "全局") {
                        globalItems.push(item)
                    } else {
                        playerItems.push(item)
                    }
                }
            }
        }
    }
    if (globalItems.length == 0) {
        let item = new vscode.CompletionItem("没有已注册的变量")
        item.insertText = ""
        globalItems.push(item)
    }
    if (playerItems.length == 0) {
        let item = new vscode.CompletionItem("没有已注册的变量")
        item.insertText = ""
        playerItems.push(item)
    }
    return [globalItems, playerItems]
}

function getSubroutineItems(document) {
    const text = document.getText()
    const length = text.length
    const ranges = getStringRange(document)
    let items = []
    let inblock = false
    for (let i = 0; i < length; i++) {
        //跳过字符串
        if (ranges.has(i)) {
            continue
        }
        if (text[i] == "{") {
            let word = getBlock(document, i)
            if (word[0] == "子程序") {
                inblock = true
            }
        } else if (inblock) {
            if (text[i] == "}") {
                break
            } else if (text[i] == ":") {
                let index = getVariableIndex(document, i, ranges)
                if (index.match(/\b(-?\d+)(.\d+|\d+)?\b/)) {
                    let name = getVariableName(document, i, ranges)
                    let item = new vscode.CompletionItem(index.padStart(3, '0') + ": " + name, vscode.CompletionItemKind.Function)
                    item.kind = vscode.CompletionItemKind.Function
                    item.documentation = new vscode.MarkdownString()
                    item.documentation.isTrusted = true
                    item.documentation.supportHtml = true
                    item.documentation.supportThemeIcons = true
                    item.documentation.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
                    item.documentation.appendMarkdown(`***${name}***\n\n\`${index}\`&nbsp;\`子程序\`\n\n一个已声明的子程序。`)
                    item.insertText = name
                    item.filterText = name.split("").join(" ")
                    //console.log(item.filterText)
                    item.sortText = index.padStart(3, '0')
                    items.push(item)
                }
            }
        }
    }
    if (items.length == 0) {
        let item = new vscode.CompletionItem("没有已注册的子程序")
        item.insertText = ""
        items.push(item)
    }
    return items
}

function getCustomNames(document) {
    let type = 0
    let globalVariables = {}
    let playerVariables = {}
    let subroutines = {}
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i)
        const text = line.text.trim()
        if (text.startsWith("{")) {
            const prevLine = document.lineAt(i - 1)
            const prevLineText = prevLine.text.trim()
            if (prevLineText == "变量") {
                type = 1
            } else if (prevLineText == "子程序") {
                type = 4
            } else if (match = prevLineText.match(/^(禁用)?\s*规则\s*\("(.*)"\)$/)) {
                return {
                    "全局变量": globalVariables,
                    "玩家变量": playerVariables,
                    "子程序": subroutines
                }
            }
        } else if (type == 1 && (match = text.match(/^全局\s*:$/))) {
            type = 2
        } else if ((type == 1 || type == 2) && (match = text.match(/^玩家\s*:$/))) {
            type = 3
        } else if (type == 2 && (match = text.match(/((?:[0-9]{1,2}|1[01][0-9]|12[0-7]))\s*:\s*\b([_a-zA-Z][_a-zA-Z0-9]*)\b/))) {
            globalVariables[match[1]] = match[2]
        } else if (type == 3 && (match = text.match(/((?:[0-9]{1,2}|1[01][0-9]|12[0-7]))\s*:\s*\b([_a-zA-Z][_a-zA-Z0-9]*)\b/))) {
            playerVariables[match[1]] = match[2]
        } else if (type == 4 && (match = text.match(/((?:[0-9]{1,2}|1[01][0-9]|12[0-7]))\s*:\s*\b([_a-zA-Z][_a-zA-Z0-9]*)\b/))) {
            subroutines[match[1]] = match[2]
        }
    }
}
