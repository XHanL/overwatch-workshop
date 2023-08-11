const vscode = require('vscode')
const path = require('path')

let RULES = {
    ACTION: require('./model/rule/ow.action.js'),
    CONDITION: require('./model/rule/ow.condition.js'),
    EVENT_PLAYER: require('./model/rule/ow.event_player.js'),
    EVENT_TEAM: require('./model/rule/ow.event_team.js'),
    EVENT: require('./model/rule/ow.event.js')
}

let CONSTS = {
    BARRIERS: require('./model/const/ow.barriers.js'),
    BUTTON: require('./model/const/ow.button.js'),
    CLIPPING: require('./model/const/ow.clipping.js'),
    COLOR: require('./model/const/ow.color.js'),
    COMMUNICATION: require('./model/const/ow.communication.js'),
    DATA_HERO: require('./model/const/ow.data_hero.js'),
    DATA_PLAYER: require('./model/const/ow.data_player.js'),
    EFFECT_LIGHT: require('./model/const/ow.effect_light.js'),
    EFFECT_PLAY: require('./model/const/ow.effect_play.js'),
    EFFECT: require('./model/const/ow.effect.js'),
    EXECUTE: require('./model/const/ow.execute.js'),
    HEALTH: require('./model/const/ow.health.js'),
    HERO: require('./model/const/ow.hero.js'),
    HUD_LOCATION: require('./model/const/ow.hud_location.js'),
    ICON: require('./model/const/ow.icon.js'),
    LOS: require('./model/const/ow.los.js'),
    MAP: require('./model/const/ow.map.js'),
    MODE: require('./model/const/ow.mode.js'),
    MOTION: require('./model/const/ow.motion.js'),
    OPERATION: require('./model/const/ow.operation.js'),
    OUTLINES: require('./model/const/ow.outlines.js'),
    PROJECTILE_EXPLOSION_SOUND: require('./model/const/ow.projectile_explosion_sound.js'),
    PROJECTILE_EXPLOSION: require('./model/const/ow.projectile_explosion.js'),
    PROJECTILE_HEALTH: require('./model/const/ow.projectile_health.js'),
    PROJECTILE: require('./model/const/ow.projectile.js'),
    REFRESH_ACCELERATE: require('./model/const/ow.refresh_accelerate.js'),
    REFRESH_ASSIST: require('./model/const/ow.refresh_assist.js'),
    REFRESH_CHASE_RATE: require('./model/const/ow.refresh_chase_rate.js'),
    REFRESH_CHASE: require('./model/const/ow.refresh_chase.js'),
    REFRESH_DAMAGE: require('./model/const/ow.refresh_damage.js'),
    REFRESH_EFFECT: require('./model/const/ow.refresh_effect.js'),
    REFRESH_FACING: require('./model/const/ow.refresh_facing.js'),
    REFRESH_FRIENDLY: require('./model/const/ow.refresh_friendly.js'),
    REFRESH_HEALING: require('./model/const/ow.refresh_healing.js'),
    REFRESH_HUD_BAR: require('./model/const/ow.refresh_hud_bar.js'),
    REFRESH_HUD_TEXT: require('./model/const/ow.refresh_hud_text.js'),
    REFRESH_ICON: require('./model/const/ow.refresh_icon.js'),
    REFRESH_MAP_BAR: require('./model/const/ow.refresh_map_bar.js'),
    REFRESH_MAP_TEXT: require('./model/const/ow.refresh_map_text.js'),
    REFRESH_THROTTLE: require('./model/const/ow.refresh_throttle.js'),
    RELATIVE: require('./model/const/ow.relative.js'),
    ROUND: require('./model/const/ow.round.js'),
    STATUS: require('./model/const/ow.status.js'),
    STRING: require('./model/const/ow.string.js'),
    TEAM: require('./model/const/ow.team.js'),
    THROTTLE: require('./model/const/ow.throttle.js'),
    TRANSFORMATION: require('./model/const/ow.transformation.js'),
    VISIBILITY_PLAYER: require('./model/const/ow.visibility_player.js'),
    VISIBILITY_SPECTATOR: require('./model/const/ow.visibility_spectator.js'),
    WAIT: require('./model/const/ow.wait.js')
}

function initModelDarkHover(context) {
    for (i in CONSTS) {
        if (i == "STRING") {
            continue
        }
        for (j in CONSTS[i]) {
            let info = new vscode.MarkdownString()
            info.isTrusted = true
            info.supportHtml = true
            info.supportThemeIcons = true
            info.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
            //标题
            info.appendMarkdown(`**<span>${j}</span>**\n\n`)
            //标签
            for (k in CONSTS[i][j].标签) {
                info.appendMarkdown(`\`${CONSTS[i][j].标签[k]}\`&nbsp;`)
            }
            //详情
            if (i == "BUTTON") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="images/ow/input/${CONSTS[i][j].图标}.png" width=25 height=25/>|&nbsp;&nbsp;|${CONSTS.BUTTON[j].提示}|\n\n`
                )
            } else if (i == "COLOR") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="images/ow/color/${CONSTS[i][j].图标}.png" width=25 height=25/>|&nbsp;&nbsp;|${CONSTS.COLOR[j].提示}|\n\n`
                )
            } else if (i == "ICON") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="images/ow/icon/${CONSTS[i][j].图标}.png" width=30 height=30/>|&nbsp;&nbsp;|${CONSTS.ICON[j].提示}|\n\n`
                )
            } else if (i == "HERO") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="${CONSTS[i][j].路径}${CONSTS[i][j].图标}.png" width=50 height=50/>|&nbsp;&nbsp;|${CONSTS[i][j].提示}|\n\n`
                )
                for (k in CONSTS[i][j].生命) {
                    switch (k) {
                        case "自由":
                            info.appendMarkdown(`***自由***&nbsp;&nbsp;\`${CONSTS[i][j].生命[k]}\`&nbsp;&nbsp;`)
                            break;

                        case "职责":
                            info.appendMarkdown(`***职责***&nbsp;&nbsp;\`${CONSTS[i][j].生命[k]}\`&nbsp;&nbsp;`)
                            break;

                        case "护甲":
                            info.appendMarkdown(`***护甲***&nbsp;&nbsp;<span style="color:#C50;">\`${CONSTS[i][j].生命[k]}\`</span>&nbsp;&nbsp;`)
                            break;

                        case "护盾":
                            info.appendMarkdown(`***护盾***&nbsp;&nbsp;<span style="color:#0AC;">\`${CONSTS[i][j].生命[k]}\`</span>`)
                            break;
                    }
                }
                info.appendMarkdown(`\n\n`)
                for (k in CONSTS[i][j].技能) {
                    info.appendMarkdown(`
||||
|:-:|-:|:-|
|<img src="${CONSTS[i][j].路径}${CONSTS[i][j].技能[k].图标}.png" width=auto height=25/>&nbsp;&nbsp;|***${k}***&nbsp;&nbsp;|`
                    )
                    for (l in CONSTS[i][j].技能[k].绑定) {
                        info.appendMarkdown(`\`${CONSTS[i][j].技能[k].绑定[l]}\`&nbsp;`)
                    }
                    info.appendMarkdown(`|\n\n`)
                }
            } else {
                info.appendMarkdown(`\n\n${CONSTS[i][j].提示}`)
            }
            CONSTS[i][j]["暗色悬停"] = new vscode.Hover(info)
        }
    }
    for (i in RULES) {
        for (j in RULES[i]) {
            let info = new vscode.MarkdownString()
            info.isTrusted = true
            info.supportHtml = true
            info.supportThemeIcons = true
            info.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
            info.appendMarkdown(`**<span>${j}</span>**\n\n`)

            //标签
            for (k in RULES[i][j].标签) {
                info.appendMarkdown(`\`${RULES[i][j].标签[k]}\`&nbsp;`)
            }
            //提示
            info.appendMarkdown(`\n\n${RULES[i][j].提示}`)
            //返回
            if (RULES[i][j].hasOwnProperty("返回")) {
                info.appendMarkdown(`\n\n---\n\n***<span style="color:#c50;">⬘</span>&nbsp;返回***\n\n`)
                for (k in RULES[i][j].返回) {
                    info.appendMarkdown(`\`${RULES[i][j].返回[k]}\` `)
                }
            }
            //参数
            if (RULES[i][j].hasOwnProperty("参数")) {
                info.appendMarkdown(`\n\n---\n\n***<span style="color:#0ac;">⬘</span>&nbsp;参数***\n\n`)
                let n = 0
                for (k in RULES[i][j].参数) {
                    info.appendMarkdown(`\`${n}\`&nbsp;\`${k}\`&nbsp;-&nbsp;${RULES[i][j].参数[k].提示}\n\n`)
                    n++
                }
            }
            //参数
            if (RULES[i][j].hasOwnProperty("路径")) {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="${CONSTS.HERO[j].路径}${CONSTS.HERO[j].图标}.png" width=50 height=50/>|&nbsp;&nbsp;|${CONSTS.HERO[j].提示}|
\n\n`
                )
                for (k in CONSTS.HERO[j].生命) {
                    switch (k) {
                        case "自由":
                            info.appendMarkdown(`***自由***&nbsp;&nbsp;\`${CONSTS.HERO[j].生命[k]}\`&nbsp;&nbsp;`)
                            break;
                        case "职责":
                            info.appendMarkdown(`***职责***&nbsp;&nbsp;\`${CONSTS.HERO[j].生命[k]}\`&nbsp;&nbsp;`)
                            break;
                        case "护甲":
                            info.appendMarkdown(`***护甲***&nbsp;&nbsp;<span style="color:#C50;">\`${CONSTS.HERO[j].生命[k]}\`</span>&nbsp;&nbsp;`)
                            break;
                        case "护盾":
                            info.appendMarkdown(`***护盾***&nbsp;&nbsp;<span style="color:#0AC;">\`${CONSTS.HERO[j].生命[k]}\`</span>`)
                            break;
                    }
                }
                info.appendMarkdown(`\n\n`)
                for (k in CONSTS.HERO[j].技能) {
                    info.appendMarkdown(`
---
||||
|:-:|-:|:-|
|<img src="${CONSTS.HERO[j].路径}${CONSTS.HERO[j].技能[k].图标}.png" width=auto height=25/>&nbsp;&nbsp;|***${k}***&nbsp;&nbsp;|`
                    )
                    for (l in CONSTS.HERO[j].技能[k].绑定) {
                        info.appendMarkdown(`\`${CONSTS.HERO[j].技能[k].绑定[l]}\`&nbsp;`)
                    }
                    info.appendMarkdown(`|\n\n---`)
                }
            }
            RULES[i][j]["暗色悬停"] = new vscode.Hover(info)
        }
    }
}

function initModelLightHover(context) {
    for (i in CONSTS) {
        if (i == "STRING") {
            continue
        }
        for (j in CONSTS[i]) {
            let info = new vscode.MarkdownString()
            info.isTrusted = true
            info.supportHtml = true
            info.supportThemeIcons = true
            info.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
            //标题
            info.appendMarkdown(`**<span>${j}</span>**\n\n`)
            //标签
            for (k in CONSTS[i][j].标签) {
                info.appendMarkdown(`\`${CONSTS[i][j].标签[k]}\`&nbsp;`)
            }
            //详情
            if (i == "BUTTON") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="images/ow/input/gray/${CONSTS[i][j].图标}.png" width=25 height=25/>|&nbsp;&nbsp;|${CONSTS.BUTTON[j].提示}|\n\n`
                )
            } else if (i == "COLOR") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="images/ow/color/${CONSTS[i][j].图标}.png" width=25 height=25/>|&nbsp;&nbsp;|${CONSTS.COLOR[j].提示}|\n\n`
                )
            } else if (i == "ICON") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="images/ow/icon/gray/${CONSTS[i][j].图标}.png" width=30 height=30/>|&nbsp;&nbsp;|${CONSTS.ICON[j].提示}|\n\n`
                )
            } else if (i == "HERO") {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="${CONSTS[i][j].路径}${CONSTS[i][j].图标}.png" width=50 height=50/>|&nbsp;&nbsp;|${CONSTS[i][j].提示}|\n\n`
                )
                for (k in CONSTS[i][j].生命) {
                    switch (k) {
                        case "自由":
                            info.appendMarkdown(`***自由***&nbsp;&nbsp;\`${CONSTS[i][j].生命[k]}\`&nbsp;&nbsp;`)
                            break;

                        case "职责":
                            info.appendMarkdown(`***职责***&nbsp;&nbsp;\`${CONSTS[i][j].生命[k]}\`&nbsp;&nbsp;`)
                            break;

                        case "护甲":
                            info.appendMarkdown(`***护甲***&nbsp;&nbsp;<span style="color:#C50;">\`${CONSTS[i][j].生命[k]}\`</span>&nbsp;&nbsp;`)
                            break;

                        case "护盾":
                            info.appendMarkdown(`***护盾***&nbsp;&nbsp;<span style="color:#0AC;">\`${CONSTS[i][j].生命[k]}\`</span>`)
                            break;
                    }
                }
                info.appendMarkdown(`\n\n`)
                for (k in CONSTS[i][j].技能) {
                    info.appendMarkdown(`
||||
|:-:|-:|:-|
|<img src="${CONSTS[i][j].路径}${CONSTS[i][j].技能[k].图标.match(/weapon.*/) ? "" : "gray/"}${CONSTS[i][j].技能[k].图标}.png" width=auto height=25/>&nbsp;&nbsp;|***${k}***&nbsp;&nbsp;|`
                    )
                    for (l in CONSTS[i][j].技能[k].绑定) {
                        info.appendMarkdown(`\`${CONSTS[i][j].技能[k].绑定[l]}\`&nbsp;`)
                    }
                    info.appendMarkdown(`|\n\n`)
                }
            } else {
                info.appendMarkdown(`\n\n${CONSTS[i][j].提示}`)
            }
            CONSTS[i][j]["亮色悬停"] = new vscode.Hover(info)
        }
    }
    for (i in RULES) {
        for (j in RULES[i]) {
            let info = new vscode.MarkdownString()
            info.isTrusted = true
            info.supportHtml = true
            info.supportThemeIcons = true
            info.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
            info.appendMarkdown(`**<span>${j}</span>**\n\n`)

            //标签
            for (k in RULES[i][j].标签) {
                info.appendMarkdown(`\`${RULES[i][j].标签[k]}\`&nbsp;`)
            }
            //提示
            info.appendMarkdown(`\n\n${RULES[i][j].提示}`)
            //返回
            if (RULES[i][j].hasOwnProperty("返回")) {
                info.appendMarkdown(`\n\n---\n\n***<span style="color:#c50;">⬘</span>&nbsp;返回***\n\n`)
                for (k in RULES[i][j].返回) {
                    info.appendMarkdown(`\`${RULES[i][j].返回[k]}\` `)
                }
            }
            //参数
            if (RULES[i][j].hasOwnProperty("参数")) {
                info.appendMarkdown(`\n\n---\n\n***<span style="color:#0ac;">⬘</span>&nbsp;参数***\n\n`)
                let n = 0
                for (k in RULES[i][j].参数) {
                    info.appendMarkdown(`\`${n}\`&nbsp;\`${k}\`&nbsp;-&nbsp;${RULES[i][j].参数[k].提示}\n\n`)
                    n++
                }
            }
            //参数
            if (RULES[i][j].hasOwnProperty("路径")) {
                info.appendMarkdown(`\n\n
||||
|:--|:--|:--|
|<img src="${CONSTS.HERO[j].路径}${CONSTS.HERO[j].图标}.png" width=50 height=50/>|&nbsp;&nbsp;|${CONSTS.HERO[j].提示}|
\n\n`
                )
                for (k in CONSTS.HERO[j].生命) {
                    switch (k) {
                        case "自由":
                            info.appendMarkdown(`***自由***&nbsp;&nbsp;\`${CONSTS.HERO[j].生命[k]}\`&nbsp;&nbsp;`)
                            break;
                        case "职责":
                            info.appendMarkdown(`***职责***&nbsp;&nbsp;\`${CONSTS.HERO[j].生命[k]}\`&nbsp;&nbsp;`)
                            break;
                        case "护甲":
                            info.appendMarkdown(`***护甲***&nbsp;&nbsp;<span style="color:#C50;">\`${CONSTS.HERO[j].生命[k]}\`</span>&nbsp;&nbsp;`)
                            break;
                        case "护盾":
                            info.appendMarkdown(`***护盾***&nbsp;&nbsp;<span style="color:#0AC;">\`${CONSTS.HERO[j].生命[k]}\`</span>`)
                            break;
                    }
                }
                info.appendMarkdown(`\n\n`)
                for (k in CONSTS.HERO[j].技能) {
                    info.appendMarkdown(`
---
||||
|:-:|-:|:-|
|<img src="${CONSTS.HERO[j].路径}${CONSTS.HERO[j].技能[k].图标.match(/weapon.*/) ? "" : "gray/"}${CONSTS.HERO[j].技能[k].图标}.png" width=auto height=25/>&nbsp;&nbsp;|***${k}***&nbsp;&nbsp;|`
                    )
                    for (l in CONSTS.HERO[j].技能[k].绑定) {
                        info.appendMarkdown(`\`${CONSTS.HERO[j].技能[k].绑定[l]}\`&nbsp;`)
                    }
                    info.appendMarkdown(`|\n\n---`)
                }
            }
            RULES[i][j]["亮色悬停"] = new vscode.Hover(info)
        }
    }
}

function initModelDarkCompletion(context) {
    for (i in CONSTS) {
        if (i == "STRING") {
            continue
        }
        for (j in CONSTS[i]) {


            CONSTS[i][j]["暗色补全"] = info
        }
    }
    for (i in RULES) {
        for (j in RULES[i]) {


            RULES[i][j]["暗色补全"] = info
        }
    }
}

function initModelLightCompletion(context) {
    for (i in CONSTS) {
        if (i == "STRING") {
            continue
        }
        for (j in CONSTS[i]) {



            CONSTS[i][j]["亮色补全"] = info
        }
    }
    for (i in RULES) {
        for (j in RULES[i]) {


            RULES[i][j]["亮色补全"] = info
        }
    }
}

module.exports = {
    RULES,
    CONSTS,
    initModelDarkHover,
    initModelLightHover,
    initModelDarkCompletion,
    initModelLightCompletion
}

function getTypedItems(type) {
    const theme = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Dark
    const themeUri = theme ? '' : 'gray/'
    let items = []
    for (i in type) {
        let item = new vscode.CompletionItem(i)
        if (type == TEMPLATE) {
            item.kind = vscode.CompletionItemKind.Module
        } else if (type == MODEL.RULES.EVENT) {
            item.kind = vscode.CompletionItemKind.Event
        } else if (type == MODEL.RULES.EVENT_TEAM) {
            item.kind = vscode.CompletionItemKind.Event
        } else if (type == MODEL.RULES.EVENT_PLAYER) {
            item.kind = vscode.CompletionItemKind.Event
        } else if (type == MODEL.RULES.CONDITION) {
            item.kind = vscode.CompletionItemKind.Class
            item.command = {
                command: 'editor.action.triggerParameterHints',
                title: 'triggerParameterHints',
                arguments: []
            }
        } else if (type == MODEL.RULES.ACTION) {
            item.kind = vscode.CompletionItemKind.Method
            item.command = {
                command: 'editor.action.triggerParameterHints',
                title: 'triggerParameterHints',
                arguments: []
            }
        } else if (CONSTS.hasOwnProperty(type)) {
            item.kind = vscode.CompletionItemKind.Constant
        }

        //名称
        item.documentation = new vscode.MarkdownString(`**${i}**`)
        item.documentation.isTrusted = true
        item.documentation.supportHtml = true
        item.documentation.supportThemeIcons = true
        item.documentation.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
        item.filterText = (i + getPinyin(i)).split("").join(" ")
        //console.log(item.filterText)

        if (type[i].hasOwnProperty("顺序")) {
            item.sortText = type[i].顺序
        }

        if (type[i].hasOwnProperty("格式")) {
            item.insertText = new vscode.SnippetString(`${type[i].格式}`)
        } else {
            item.insertText = new vscode.SnippetString(`${i}`)
        }

        //参数
        if (type[i].hasOwnProperty("参数")) {
            item.documentation.appendMarkdown(`&nbsp;**(**&nbsp;`)
            item.insertText.appendText(`(`)
            let n = 0
            for (j in type[i].参数) {
                item.documentation.appendMarkdown(`\`${type[i].参数[j].默认}\``)
                if (type[i].参数[j].类型 == "字符串选项") {
                    item.insertText.appendText(`"`)
                    item.insertText.appendPlaceholder(`${type[i].参数[j].默认}`)
                    item.insertText.appendText(`"`)
                } else {
                    item.insertText.appendPlaceholder(`${type[i].参数[j].默认}`)
                }

                n++
                if (n < Object.keys(type[i].参数).length) {
                    item.documentation.appendMarkdown(`**,**&nbsp;`)
                    item.insertText.appendText(`, `)
                }
            }
            item.documentation.appendMarkdown(` **)**`)
            item.insertText.appendText(`)`)
        }

        //标签
        if (type == MODEL.RULES.EVENT || type == MODEL.RULES.EVENT_PLAYER || type == MODEL.RULES.EVENT_TEAM || type == MODEL.RULES.ACTION) {
            item.documentation.appendMarkdown(`&nbsp;**;**`)
            item.insertText.appendText(`;`)
        }
        item.documentation.appendMarkdown(`\n\n`)
        for (j in type[i].标签) {
            item.documentation.appendMarkdown(`\`\`${type[i].标签[j]}\`\`&nbsp;`)
        }

        switch (type) {
            case CONSTS.BUTTON:
                item.documentation.appendMarkdown(
                    `\n\n
||||
|:--|:--|:--|
|<img src="images/ow/input/${themeUri}${CONSTS.BUTTON[i].图标}.png" width=25 height=25/>|&nbsp;&nbsp;|${CONSTS.BUTTON[i].提示}|
\n\n`
                )
                break;
            case CONSTS.COLOR:
                item.documentation.appendMarkdown(
                    `\n\n
||||
|:--|:--|:--|
|<img src="images/ow/color/${CONSTS.COLOR[i].图标}.png" width=25 height=25/>|&nbsp;&nbsp;|${CONSTS.COLOR[i].提示}|
\n\n`
                )
                break;
            case CONSTS.ICON:
                item.documentation.appendMarkdown(
                    `\n\n
||||
|:--|:--|:--|
|<img src="images/ow/icon/${themeUri}${CONSTS.ICON[i].图标}.png" width=30 height=30/>|&nbsp;&nbsp;|${CONSTS.ICON[i].提示}|
\n\n`
                )
                break;
            case MODEL.RULES.EVENT_PLAYER:
                if (!MODEL.RULES.EVENT_PLAYER[i].hasOwnProperty("路径")) {
                    break
                }
            case CONSTS.HERO:

                item.documentation.appendMarkdown(
                    `\n\n
||||
|:--|:--|:--|
|<img src="${CONSTS.HERO[i].路径}${CONSTS.HERO[i].图标}.png" width=50 height=50/>|&nbsp;&nbsp;|${CONSTS.HERO[i].提示}|
\n\n`
                )
                for (k in CONSTS.HERO[i].生命) {
                    switch (k) {
                        case "自由":
                            item.documentation.appendMarkdown(`***自由***&nbsp;&nbsp;\`${CONSTS.HERO[i].生命[k]}\`&nbsp;&nbsp;`)
                            break;

                        case "职责":
                            item.documentation.appendMarkdown(`***职责***&nbsp;&nbsp;\`${CONSTS.HERO[i].生命[k]}\`&nbsp;&nbsp;`)
                            break;

                        case "护甲":
                            item.documentation.appendMarkdown(`***护甲***&nbsp;&nbsp;<span style="color:#C50;">\`${CONSTS.HERO[i].生命[k]}\`</span>&nbsp;&nbsp;`)
                            break;

                        case "护盾":
                            item.documentation.appendMarkdown(`***护盾***&nbsp;&nbsp;<span style="color:#0AC;">\`${CONSTS.HERO[i].生命[k]}\`</span>`)
                            break;
                    }
                }
                item.documentation.appendMarkdown(`\n\n`)

                for (k in CONSTS.HERO[i].技能) {
                    item.documentation.appendMarkdown(
                        `
||||
|:-:|-:|:-|
|<img src="${CONSTS.HERO[i].路径}${vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Dark ? "" : CONSTS.HERO[i].技能[k].图标.match(/weapon.*/) ? "" : "gray/"}${CONSTS.HERO[i].技能[k].图标}.png" width=auto height=25/>&nbsp;&nbsp;|***${k}***&nbsp;&nbsp;|`
                    )
                    for (l in CONSTS.HERO[i].技能[k].绑定) {
                        item.documentation.appendMarkdown(`\`${CONSTS.HERO[i].技能[k].绑定[l]}\`&nbsp;`)
                    }
                    item.documentation.appendMarkdown(`|\n\n`)
                    //item.documentation.appendMarkdown(`|\n\n${CONST[i][j].技能[k].hasOwnProperty("提示") ? `*${CONST[i][j].技能[k].提示}*` : ``}\n\n---`)
                }
                break;

            default:
                //提示
                item.documentation.appendMarkdown(`\n\n${type[i].提示}`)

                //返回
                if (type[i].hasOwnProperty("返回")) {
                    item.documentation.appendMarkdown(`\n\n***<span style="color:#c50;">⬘</span>&nbsp;返回***\n\n`)
                    for (j in type[i].返回) {
                        item.documentation.appendMarkdown(`\`${type[i].返回[j]}\` `)
                    }
                }

                //参数
                if (type[i].hasOwnProperty("参数")) {
                    item.documentation.appendMarkdown(`\n\n***<span style="color:#0ac;">⬘</span>&nbsp;参数***\n\n`)
                    let n = 0
                    for (j in type[i].参数) {
                        item.documentation.appendMarkdown(`\`${n}\` \`${j}\` - ${type[i].参数[j].提示}\n\n`)
                        n++
                    }
                }

                //格式
                if (type[i].hasOwnProperty("格式")) {
                    item.documentation.appendCodeblock(type[i].格式, "ow")
                }
                break;
        }
        items.push(item)
    }
    return items
}

function getVariableItems() {
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

function getSubroutineItems() {
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

function getPinyin(text) {
    let pinyin = ""
    for (let i = 0; i < text.length; i++) {
        if (PINYIN.hasOwnProperty(text[i])) {
            for (let j = 0; j < PINYIN[text[i]].length; j++) {
                pinyin += PINYIN[text[i]][j]
            }
        } else if (/[a-zA-Z]/.test(text[i])) {
            pinyin += text[i]
        }
    }
    //console.log(pinyin)
    return pinyin
}