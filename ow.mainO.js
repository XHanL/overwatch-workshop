const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

const MODEL = require('./ow.model.js')
const REPORT = require('./ow.report.js')

module.exports = {
    activate
}

const BLOCKS = require('./model/block/ow.block.js')

const RULES = {
    ACTION: require('./model/rule/ow.action.js'),
    CONDITION: require('./model/rule/ow.condition.js'),
    EVENT_PLAYER: require('./model/rule/ow.event_player.js'),
    EVENT_TEAM: require('./model/rule/ow.event_team.js'),
    EVENT: require('./model/rule/ow.event.js')
}

const CONSTS = {
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

const SYMBOL = require('./model/ow.symbol.js')

const TEMPLATE = require('./model/ow.template.js')

const PINYIN = require('./ow.pinyin.js')

let blur = false

const FORMAT = {
    BLOCK: new Set(),
    MAIN: new Set(),
    LOBBY: new Set(),
    LOBBY_OPTION: new Set(),
    MODE: new Set(),
    MODE_DETAIL: new Set(),
    MODE_OPTION: new Set(),
    HERO: new Set(),
    HERO_DETAIL: new Set(),
    HERO_OPTION: new Set(),
    EXTENSION: new Set(),
    VARIABLE: new Set(),
    EVENT: new Set(),
    CONDITION: new Set(),
    ACTION: new Set()
}

function initFORMAT() {
    //缩进块
    FORMAT.BLOCK.add("启用地图")
    FORMAT.BLOCK.add("禁用地图")
    FORMAT.BLOCK.add("启用英雄")
    FORMAT.BLOCK.add("禁用英雄")
    for (i in BLOCKS.块) {
        FORMAT.BLOCK.add(i)
    }
    for (i in BLOCKS.块.设置) {
        FORMAT.BLOCK.add(i)
    }
    for (i in BLOCKS.块.设置.模式) {
        FORMAT.BLOCK.add(i)
    }
    for (i in BLOCKS.块.设置.英雄) {
        FORMAT.BLOCK.add(i)
    }
    for (i in CONSTS.HERO) {
        FORMAT.BLOCK.add(i)
    }
    for (i in BLOCKS.块.规则) {
        FORMAT.BLOCK.add(i)
    }

    //主程序
    for (i in BLOCKS.块.设置.主程序) {
        FORMAT.MAIN.add(i)
    }

    //大厅
    for (i in BLOCKS.块.设置.大厅) {
        FORMAT.LOBBY.add(i)
        //大厅选项
        if (Array.isArray(BLOCKS.块.设置.大厅[i])) {
            for (j in BLOCKS.块.设置.大厅[i]) {
                FORMAT.LOBBY_OPTION.add(BLOCKS.块.设置.大厅[i][j])
            }
        }
    }

    //模式
    for (i in BLOCKS.块.设置.模式) {
        FORMAT.MODE.add(i)
        //模式细节
        for (j in BLOCKS.块.设置.模式[i]) {
            FORMAT.MODE_DETAIL.add(j)
            //模式选项
            if (Array.isArray(BLOCKS.块.设置.模式[i][j])) {
                for (k in BLOCKS.块.设置.模式[i][j]) {
                    FORMAT.MODE_OPTION.add(BLOCKS.块.设置.模式[i][j][k])
                }
            }
        }

    }

    //英雄
    for (i in BLOCKS.块.设置.英雄) {
        FORMAT.HERO.add(i)
    }
    //英雄细节
    for (i in BLOCKS.块.设置.英雄.综合) {
        FORMAT.HERO_DETAIL.add(i)
        //英雄选项
        if (Array.isArray(BLOCKS.块.设置.英雄.综合[i])) {
            for (j in BLOCKS.块.设置.英雄.综合[i]) {
                FORMAT.HERO_OPTION.add(BLOCKS.块.设置.英雄.综合[i][j])
            }
        } else if (typeof BLOCKS.块.设置.英雄.综合[i] === 'object') {
            for (j in BLOCKS.块.设置.英雄.综合[i]) {
                FORMAT.HERO_DETAIL.add(j)
                //英雄选项
                if (Array.isArray(BLOCKS.块.设置.英雄.综合[i][j])) {
                    for (k in BLOCKS.块.设置.英雄.综合[i][j]) {
                        FORMAT.HERO_OPTION.add(BLOCKS.块.设置.英雄.综合[i][j][k])
                    }
                }
            }
        }
    }

    //扩展
    for (i in BLOCKS.块.设置.扩展) {
        FORMAT.EXTENSION.add(BLOCKS.块.设置.扩展[i])
    }

    //变量
    for (i in BLOCKS.块.变量) {
        FORMAT.VARIABLE.add(i)
    }

    //事件
    for (i in RULES.EVENT) {
        FORMAT.EVENT.add(i)
    }
    for (i in RULES.EVENT_TEAM) {
        FORMAT.EVENT.add(i)
    }
    for (i in RULES.EVENT_PLAYER) {
        FORMAT.EVENT.add(i)
    }

    //条件,动作
    FORMAT.CONDITION.add("全局")
    FORMAT.ACTION.add("全局")
    for (i in RULES.ACTION) {
        FORMAT.ACTION.add(i)
    }
    for (i in RULES.CONDITION) {
        FORMAT.CONDITION.add(i)
        FORMAT.ACTION.add(i)
    }
    for (i in CONSTS) {
        if (i == "STRING") {
            continue
        }
        for (j in CONSTS[i]) {
            FORMAT.CONDITION.add(j)
            FORMAT.ACTION.add(j)
        }
    }
}

const TOKEN = {
    ALL: new Set(),
    ACTION: new Set(),
    CONDITION: new Set(),
    CONSTANT: new Set(),
    EVENT: new Set(),
    SETTING: new Set()
}

function initTOKEN() {
    //TOKEN[1,16]

    //块
    function getBlock(o) {
        for (let i of Object.getOwnPropertyNames(o)) {
            TOKEN.ALL.add(i)
            if (typeof o[i] === 'object') {
                if (Array.isArray(o[i])) {
                    o[i].forEach(e => { TOKEN.ALL.add(e) })
                } else {
                    getBlock(o[i])
                }
            }
        }
    }

    //块
    getBlock(BLOCKS.块)

    //禁用
    TOKEN.ALL.add("禁用")

    //设置
    TOKEN.SETTING.add("启用地图")
    TOKEN.SETTING.add("禁用地图")
    TOKEN.SETTING.add("启用英雄")
    TOKEN.SETTING.add("禁用英雄")
    for (i in BLOCKS.块) {
        TOKEN.SETTING.add(i)
    }
    for (i in BLOCKS.块.设置) {
        TOKEN.SETTING.add(i)
    }
    for (i in BLOCKS.块.设置.模式) {
        TOKEN.SETTING.add(i)
    }
    for (i in BLOCKS.块.设置.英雄) {
        TOKEN.SETTING.add(i)
    }
    for (i in CONSTS.HERO) {
        TOKEN.SETTING.add(i)
    }
    for (i in BLOCKS.块.规则) {
        TOKEN.SETTING.add(i)
    }

    //主程序
    for (i in BLOCKS.块.设置.主程序) {
        TOKEN.SETTING.add(i)
    }

    //大厅
    for (i in BLOCKS.块.设置.大厅) {
        TOKEN.SETTING.add(i)
        //大厅选项
        if (Array.isArray(BLOCKS.块.设置.大厅[i])) {
            for (j in BLOCKS.块.设置.大厅[i]) {
                TOKEN.SETTING.add(BLOCKS.块.设置.大厅[i][j])
            }
        }
    }

    for (i in BLOCKS.块.设置.模式) {
        TOKEN.SETTING.add(i)
        for (j in BLOCKS.块.设置.模式[i]) {
            TOKEN.SETTING.add(j)
            if (Array.isArray(BLOCKS.块.设置.模式[i][j])) {
                for (k in BLOCKS.块.设置.模式[i][j]) {
                    TOKEN.SETTING.add(BLOCKS.块.设置.模式[i][j][k])
                }
            }
        }
    }
    for (i in BLOCKS.块.设置.英雄) {
        TOKEN.SETTING.add(i)
    }
    for (i in BLOCKS.块.设置.英雄.综合) {
        TOKEN.SETTING.add(i)
        if (Array.isArray(BLOCKS.块.设置.英雄.综合[i])) {
            for (j in BLOCKS.块.设置.英雄.综合[i]) {
                TOKEN.SETTING.add(BLOCKS.块.设置.英雄.综合[i][j])
            }
        } else if (typeof BLOCKS.块.设置.英雄.综合[i] === 'object') {
            for (j in BLOCKS.块.设置.英雄.综合[i]) {
                TOKEN.SETTING.add(j)
                if (Array.isArray(BLOCKS.块.设置.英雄.综合[i][j])) {
                    for (k in BLOCKS.块.设置.英雄.综合[i][j]) {
                        TOKEN.SETTING.add(BLOCKS.块.设置.英雄.综合[i][j][k])
                    }
                }
            }
        }
    }
    for (i in BLOCKS.块.设置.扩展) {
        TOKEN.SETTING.add(BLOCKS.块.设置.扩展[i])
    }

    //事件
    for (i in MODEL.RULES.EVENT) {
        TOKEN.EVENT.add(i)
        TOKEN.ALL.add(i)
    }
    for (i in MODEL.RULES.EVENT_TEAM) {
        TOKEN.EVENT.add(i)
        TOKEN.ALL.add(i)
    }
    for (i in MODEL.RULES.EVENT_PLAYER) {
        TOKEN.EVENT.add(i)
        TOKEN.ALL.add(i)
    }

    //条件
    for (i in MODEL.RULES.CONDITION) {
        TOKEN.CONDITION.add(i)
        TOKEN.ALL.add(i)
    }

    //动作
    for (i in MODEL.RULES.ACTION) {
        TOKEN.ACTION.add(i)
        TOKEN.ALL.add(i)
    }

    //常量
    for (i in MODEL.CONSTS) {
        if (i == "STRING") {
            continue
        }
        for (j in MODEL.CONSTS[i]) {
            TOKEN.CONSTANT.add(j)
            TOKEN.ALL.add(j)
        }
    }
}

function sortAndFilterChineseKeyword() {
    const str = "1|2|3".split("|")
    const set = new Set(str)
    let arr = Array.from(set).sort((b, a) => a.localeCompare(b, "zh-Hans-CN"))
    console.log(arr)
}

function setTheme() {
    const availableThemes = ['OW Dark', 'OW Crystal Dark', 'OW Light (实验性)', 'OW Crystal Light (实验性)']
    const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme')
    const currentEnter = vscode.workspace.getConfiguration('workbench').get('colorTheme')
    autoInsertOnEnter', false
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'ow') {
        if (!availableThemes.includes(currentTheme)) {
            vscode.window.showQuickPick(availableThemes, {
                placeHolder: `为OW选择一个语法高亮主题`
            }).then((selectedTheme) => {
                if (selectedTheme) {
                    vscode.workspace.getConfiguration('workbench').update('colorTheme', selectedTheme)
                }
            })
        }
    }
}

function activate(context) {

    //初始化
    try {
        //sortAndFilterChineseKeyword()
        initTOKEN()
        //console.log(TOKEN)
        initFORMAT()
        //console.log(FORMAT)
        MODEL.initModelDarkHover(context)
        MODEL.initModelLightHover(context)
    } catch (error) {
        console.log(error)
    }

    //配置
    const CONFIG = vscode.workspace.getConfiguration()
    CONFIG.update('editor.suggest.snippetsPreventQuickSuggestions', false)

    //主题设置引导
    setTheme()

    //状态
    vscode.window.setStatusBarMessage("✧ Overwatch Workshop 语言支持")
    vscode.window.setStatusBarMessage("✦ Overwatch Workshop 已启动", 1000)

    context.subscriptions.push(
        //手册
        vscode.window.registerWebviewViewProvider('ow.view.manual', {
            resolveWebviewView(webviewView) {
                try {
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
                        <title>参考手册</title>
                        </head>
                        <body>
                        <i><h3>参考手册</h3></i>
                        <button style="width: 150px; height: auto;" onclick="navigate('StringTable')">字符串选项</button>
                        <br>
                        <br>
                        <button style="width: 150px; height: auto;" onclick="navigate('ColorTable')">颜色选项</button>
                        <br>
                        <br>
                        <button style="width: 150px; height: auto;" onclick="navigate('IconTable')">图标选项</button>
                        <br>
                        <br>
                        <button style="width: 150px; height: auto;" onclick="navigate('HeroIconTable')">英雄图标选项</button>
                        <br>
                        <br>
                        <button style="width: 150px; height: auto;" onclick="navigate('AbilityIconTable')">技能图标选项</button>
                        <br>
                        <br>
                        </body>
                        </html>`
                    }

                    function getStringTableHtml() {
                        const strings = Object.getOwnPropertyNames(CONSTS.STRING).map((v, i) => {
                            if (i % 3 === 0) {
                                return `</tr><tr><td style="text-align: center;">${v}</td>`;
                            } else {
                                return `<td style="text-align: center;">${v}</td>`;
                            }
                        }).join("");
                        return `<!DOCTYPE html>
                        <html>
                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>字符串选项</title>
                        </head>
                        <body>
                        <br>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>字符串选项</h3></i>
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
                        <title>颜色选项</title>
                        </head>
                        <body>
                        <br>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>颜色选项</h3></i>
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
                                const icons = Object.getOwnPropertyNames(CONSTS.ICON)
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
                        <i><h3>图标选项</h3></i>

                        ${tableHtml}
                        </body>

                        </html>`
                    }

                    function getHeroIconTableHtml() {
                        return `<!DOCTYPE html>
                        <html>

                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>英雄图标选项</title>
                        </head>

                        <body>
                        <br>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>英雄图标选项</h3></i>


                        <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', `${themeUri}tank.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;重装</h4>
                        <table style="min-width: 300px; max-width: 400px;">
                        <tr>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', 'icon.png'))}" width="50" height="50"><br>末日铁拳<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', 'icon.png'))}" width="50" height="50"><br>D.Va<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', 'icon.png'))}" width="50" height="50"><br>破坏球<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', 'icon.png'))}" width="50" height="50"><br>渣客女王<br></td>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', 'icon.png'))}" width="50" height="50"><br>奥丽莎<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', 'icon.png'))}" width="50" height="50"><br>莱因哈特<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', 'icon.png'))}" width="50" height="50"><br>路霸<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', 'icon.png'))}" width="50" height="50"><br>西格玛<br></td>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', 'icon.png'))}" width="50" height="50"><br>温斯顿<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', 'icon.png'))}" width="50" height="50"><br>查莉娅<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', 'icon.png'))}" width="50" height="50"><br>拉玛刹<br></td>
                        </tr>
                        </table>

                        <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', `${themeUri}damage.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;输出</h4>
                        <table style="min-width: 300px; max-width: 400px;">
                        <tr>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', 'icon.png'))}" width="50" height="50"><br>艾什<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', 'icon.png'))}" width="50" height="50"><br>堡垒<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', 'icon.png'))}" width="50" height="50"><br>回声<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', 'icon.png'))}" width="50" height="50"><br>源氏<br></td>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', 'icon.png'))}" width="50" height="50"><br>半藏<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', 'icon.png'))}" width="50" height="50"><br>狂鼠<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', 'icon.png'))}" width="50" height="50"><br>卡西迪<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', 'icon.png'))}" width="50" height="50"><br>美<br></td>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', 'icon.png'))}" width="50" height="50"><br>法老之鹰<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', 'icon.png'))}" width="50" height="50"><br>死神<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', 'icon.png'))}" width="50" height="50"><br>索杰恩<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', 'icon.png'))}" width="50" height="50"><br>士兵：76<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', 'icon.png'))}" width="50" height="50"><br>黑影<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', 'icon.png'))}" width="50" height="50"><br>秩序之光<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', 'icon.png'))}" width="50" height="50"><br>托比昂<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', 'icon.png'))}" width="50" height="50"><br>猎空<br></td>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', 'icon.png'))}" width="50" height="50"><br>黑百合<br></td>
                        </tr>
                        </table>

                        <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', `${themeUri}support.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;支援</h4>
                        <table style="min-width: 300px; max-width: 400px;">
                        <tr>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', 'icon.png'))}" width="50" height="50"><br>安娜<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', 'icon.png'))}" width="50" height="50"><br>巴蒂斯特<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', 'icon.png'))}" width="50" height="50"><br>布丽吉塔<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', 'icon.png'))}" width="50" height="50"><br>雾子<br></td>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', 'icon.png'))}" width="50" height="50"><br>卢西奥<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', 'icon.png'))}" width="50" height="50"><br>天使<br></td>
                        </tr>
                        <tr>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', 'icon.png'))}" width="50" height="50"><br>莫伊拉<br></td>
                        <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', 'icon.png'))}" width="50" height="50"><br>禅雅塔<br></td>
                        <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', 'icon.png'))}" width="50" height="50"><br>生命之梭<br></td>
                        </tr>
                        </table>

                        </body>
                        </html>`
                    }

                    function getAbilityIconTableHtml() {
                        return `<!DOCTYPE html>
                        <html>
                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>技能图标选项</title>
                        </head>
                        <body>
                        <br>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>技能图标选项</h3></i>


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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', 'icon.png'))}" width="auto" height="50"><br>末日铁拳<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', 'icon.png'))}" width="auto" height="50"><br>D.Va<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', 'icon.png'))}" width="auto" height="50"><br>破坏球<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', 'icon.png'))}" width="auto" height="50"><br>渣客女王<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', 'icon.png'))}" width="auto" height="50"><br>奥丽莎<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', 'icon.png'))}" width="auto" height="50"><br>莱因哈特<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', 'icon.png'))}" width="auto" height="50"><br>路霸<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', 'icon.png'))}" width="auto" height="50"><br>西格玛<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', 'icon.png'))}" width="auto" height="50"><br>温斯顿<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', 'icon.png'))}" width="auto" height="50"><br>查莉娅<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', 'icon.png'))}" width="auto" height="50"><br>拉玛刹<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', 'icon.png'))}" width="auto" height="50"><br>艾什<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', 'icon.png'))}" width="auto" height="50"><br>堡垒<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', 'icon.png'))}" width="auto" height="50"><br>回声<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', 'icon.png'))}" width="auto" height="50"><br>源氏<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', 'icon.png'))}" width="auto" height="50"><br>半藏<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', 'icon.png'))}" width="auto" height="50"><br>狂鼠<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', 'icon.png'))}" width="auto" height="50"><br>卡西迪<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', 'icon.png'))}" width="auto" height="50"><br>美<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', 'icon.png'))}" width="auto" height="50"><br>法老之鹰<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', 'icon.png'))}" width="auto" height="50"><br>死神<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', 'icon.png'))}" width="auto" height="50"><br>索杰恩<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', 'icon.png'))}" width="auto" height="50"><br>士兵：76<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', 'icon.png'))}" width="auto" height="50"><br>黑影<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', 'icon.png'))}" width="auto" height="50"><br>秩序之光<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', 'icon.png'))}" width="auto" height="50"><br>托比昂<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', 'icon.png'))}" width="auto" height="50"><br>猎空<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', 'icon.png'))}" width="auto" height="50"><br>黑百合<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', 'icon.png'))}" width="auto" height="50"><br>安娜<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', 'icon.png'))}" width="auto" height="50"><br>巴蒂斯特<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', 'icon.png'))}" width="auto" height="50"><br>布丽吉塔<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', 'icon.png'))}" width="auto" height="50"><br>雾子<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', 'icon.png'))}" width="auto" height="50"><br>卢西奥<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', 'icon.png'))}" width="auto" height="50"><br>天使<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', 'icon.png'))}" width="auto" height="50"><br>莫伊拉<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', 'icon.png'))}" width="auto" height="50"><br>禅雅塔<br></td>
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
                        <td style="text-align: center;"><img style="border-radius: 50%" src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lifeweaver', 'icon.png'))}" width="auto" height="50"><br>生命之梭<br></td>
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

                    function getMapHtml() {
                        return `<!DOCTYPE html>
                        <html>
                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>条件列表</title>
                        </head>
                        <body>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>条件列表</h3></i>
                        </body>
                        </html>`
                    }

                    function getEventHtml() {
                        return `<!DOCTYPE html>
                        <html>
                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>条件列表</title>
                        </head>
                        <body>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>条件列表</h3></i>
                        </body>
                        </html>`
                    }

                    function getConditionHtml() {
                        return `<!DOCTYPE html>
                        <html>
                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>条件列表</title>
                        </head>
                        <body>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>条件列表</h3></i>
                        </body>
                        </html>`
                    }

                    function getActionHtml() {
                        return `<!DOCTYPE html>
                        <html>
                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>动作列表</title>
                        </head>
                        <body>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>动作列表</h3></i>
                        </body>
                        </html>`
                    }

                    function getConstHtml() {
                        return `<!DOCTYPE html>
                        <html>
                        <head>
                        <link href="${styleUri}" rel="stylesheet">
                        <script src="${scriptUri}"></script>
                        <title>常量列表</title>
                        </head>
                        <body>
                        <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                        <i><h3>常量列表</h3></i>
                        </body>
                        </html>`
                    }

                    webviewView.webview.options = {
                        enableScripts: true,
                        localResourceRoots: [extensionUri]
                    }

                    webviewView.webview.html = getHomeHtml()

                    webviewView.webview.onDidReceiveMessage(message => {
                        switch (message) {
                            case 'Home':
                                webviewView.webview.html = getHomeHtml()
                                return
                            case 'StringTable':
                                webviewView.webview.html = getStringTableHtml()
                                return
                            case 'ColorTable':
                                webviewView.webview.html = getColorTableHtml()
                                return
                            case 'IconTable':
                                webviewView.webview.html = getIconTableHtml()
                                return
                            case 'HeroIconTable':
                                webviewView.webview.html = getHeroIconTableHtml()
                                return
                            case 'AbilityIconTable':
                                webviewView.webview.html = getAbilityIconTableHtml()
                                return
                            default:
                                console.log('Unknown command: ' + message.command)
                                return
                        }
                    })

                } catch (error) {
                    console.log(error);
                }
            }
        }),
        //主动建议
        vscode.commands.registerCommand('ow.command.suggest', () => {
            vscode.commands.executeCommand('editor.action.triggerSuggest')
            vscode.commands.executeCommand('editor.action.triggerParameterHints')
            vscode.window.setStatusBarMessage(`✦ 已建议`, 1000)
        }),
        //回车接受
        vscode.commands.registerCommand('ow.key.enter', () => {
            vscode.commands.executeCommand('focusAndAcceptSuggestion')
        }),
        //退格建议
        vscode.commands.registerCommand('ow.key.backspace', () => {
            vscode.commands.executeCommand('deleteLeft').then(() => {
                const document = vscode.window.activeTextEditor.document
                const position = vscode.window.activeTextEditor.selection.active
                const text = document.getText()
                const offset = document.offsetAt(position) - 1
                for (let i = offset; i >= 0; i--) {
                    if (text[i].match(/\s/)) {
                        continue
                    }
                    if (text[i] != "(" && text[i] != ",") {
                        return
                    } else {
                        vscode.commands.executeCommand('editor.action.triggerSuggest')
                        vscode.commands.executeCommand('editor.action.triggerParameterHints')
                        return
                    }
                }
            })
        }),
        //换行
        vscode.commands.registerCommand('ow.command.line', () => {
            vscode.commands.executeCommand('editor.action.toggleWordWrap')
            vscode.window.setStatusBarMessage("✦ 已切换", 1000)
        }),
        //整理
        vscode.commands.registerCommand('ow.command.format', () => {
            vscode.commands.executeCommand('editor.action.formatDocument')
            vscode.window.setStatusBarMessage("✦ 已整理", 1000)
        }),
        //撤销
        vscode.commands.registerCommand('ow.command.undo', () => {
            vscode.commands.executeCommand('undo')
            vscode.window.setStatusBarMessage("✦ 已撤销", 1000)
        }),
        //恢复
        vscode.commands.registerCommand('ow.command.redo', () => {
            vscode.commands.executeCommand('redo')
            vscode.window.setStatusBarMessage("✦ 已恢复", 1000)
        }),
        //换行
        vscode.commands.registerCommand('ow.command.line', () => {
            vscode.commands.executeCommand('editor.action.toggleWordWrap')
            vscode.window.setStatusBarMessage("✦ 已切换", 1000)
        }),
        //复制
        vscode.commands.registerCommand('ow.command.copy', () => {
            let activeEditor = vscode.window.activeTextEditor
            if (activeEditor) {
                let document = activeEditor.document
                let text = document.getText()
                text = text.replace(/设置不可见\((.*), 无\);/g, "设置不可见\($1, 全部禁用\);")
                text = text.replace(/追踪全局变量频率\((.*), (.*), (.*), 无\);/g, "追踪全局变量频率($1, $2, $3, 全部禁用);")
                text = text.replace(/追踪玩家变量频率\((.*), (.*), (.*), (.*), 无\);/g, "追踪玩家变量频率($1, $2, $3, $4, 全部禁用);")
                text = text.replace(/持续追踪全局变量\((.*), (.*), (.*), 无\);/g, "持续追踪全局变量($1, $2, $3, 全部禁用);")
                text = text.replace(/持续追踪玩家变量\((.*), (.*), (.*), (.*), 无\);/g, "持续追踪玩家变量($1, $2, $3, $4, 全部禁用);")
                vscode.env.clipboard.writeText(text)
                vscode.window.setStatusBarMessage("✦ 已复制 · 导入到剪切板", 1000)
            }
        }),
        //粘贴
        vscode.commands.registerCommand('ow.command.paste', () => {
            let activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                vscode.env.clipboard.readText().then(text => {
                    text = text.replace(/设置不可见\((.*), 无\);/g, "设置不可见\($1, 全部禁用\);")
                    text = text.replace(/追踪全局变量频率\((.*), (.*), (.*), 无\);/g, "追踪全局变量频率($1, $2, $3, 全部禁用);")
                    text = text.replace(/追踪玩家变量频率\((.*), (.*), (.*), (.*), 无\);/g, "追踪玩家变量频率($1, $2, $3, $4, 全部禁用);")
                    text = text.replace(/持续追踪全局变量\((.*), (.*), (.*), 无\);/g, "持续追踪全局变量($1, $2, $3, 全部禁用);")
                    text = text.replace(/持续追踪玩家变量\((.*), (.*), (.*), (.*), 无\);/g, "持续追踪玩家变量($1, $2, $3, $4, 全部禁用);")
                    let edit = new vscode.WorkspaceEdit()
                    let wholeDocumentRange = activeEditor.document.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE))
                    edit.replace(activeEditor.document.uri, wholeDocumentRange, text)
                    vscode.workspace.applyEdit(edit)
                    vscode.window.setStatusBarMessage("✦ 已粘贴 · 导入到编辑器", 1000)
                })
            }
        }),
        //混淆
        vscode.commands.registerCommand('ow.command.blur', () => {
            blur = !blur
            vscode.window.setStatusBarMessage(`✦ 混淆 · ${blur ? "开启" : "关闭"}`, 1000)
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
        //大纲
        context.subscriptions.push(
            vscode.languages.registerDocumentSymbolProvider("ow", {
                provideDocumentSymbols(document) {
                    return getSymbols(document)
                }
            })
        )
    )

    function getStringRange(document) {
        const text = document.getText()
        const length = text.length
        let ranges = new Set()
        let string = false
        for (let i = 0; i < length; i++) {
            switch (text[i]) {
                //忽略字符串转义
                case "\\":
                    if (string) {
                        i++
                    }
                    break

                //获取字符串状态
                case "\"":
                    string = !string
                    break

                default:
                    if (string) {
                        ranges.add(i)
                    }
            }
        }
        return ranges
    }

    function getEventSymbolInfo(document, start) {
        const text = document.getText()
        const length = text.length
        for (let i = start; i < length; i++) {
            const char = text[i]
            if (char.match(/[事件\}\{\r\s\n]/)) {
                continue
            }
            return document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
        }
    }

    function getSymbolInfo(document, end) {
        const text = document.getText()
        for (let i = end; i >= 0; i--) {
            const char = text[i]
            if (char.match(/[\}\{\r\s\n]/)) {
                continue
            }
            let title = document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
            switch (title) {
                case "设置":
                case "主程序":
                case "大厅":
                case "模式":
                case "英雄":
                case "扩展":
                    return [title, "", vscode.SymbolKind.Property]
                case "变量":
                    return [title, "", vscode.SymbolKind.Variable]
                case "子程序":
                    return [title, "", vscode.SymbolKind.Function]
                case "事件":
                    return [title, getEventSymbolInfo(document, i), vscode.SymbolKind.Event]
                case "条件":
                    return [title, "", vscode.SymbolKind.Boolean]
                case "动作":
                    return [title, "", vscode.SymbolKind.Method]
                default:
                    if (match = title.match(/规则\("(.*)"\)/)) {
                        return ["规则", match[1], vscode.SymbolKind.Module]
                    } else {
                        return [title, "", vscode.SymbolKind.Module]
                    }
            }
        }
    }

    function getSymbol(document, start, end) {
        let children = []
        const text = document.getText()
        const ranges = getStringRange(document)
        for (let i = start; i < end; i++) {

            //跳过字符串
            if (ranges.has(i)) {
                continue
            }

            if (text[i] == "{") {
                if (i != start) {
                    let child = getSymbol(document, i, end)
                    i = document.offsetAt(child.range.end)
                    children.push(child)
                }
            } else if (text[i] == "}") {
                //构造符号
                let info = getSymbolInfo(document, start)
                let symbol = new vscode.DocumentSymbol(
                    info[0] ? info[0] : "?",
                    info[1],
                    info[2],
                    new vscode.Range(document.positionAt(start + 1), document.positionAt(i)),
                    new vscode.Range(document.positionAt(start + 1), document.positionAt(i))
                )
                symbol.children = children
                return symbol
            }
        }
    }

    function getSymbols(document) {
        const text = document.getText()
        const length = text.length
        let nest = 0
        let symbols = []
        //console.time()
        for (let i = 0; i < length; i++) {
            const char = text[i]
            if (char == "{") {
                let symbol = getSymbol(document, i, length)
                i = document.offsetAt(symbol.range.end)
                symbols.push(symbol)
            }
        }
        //console.timeEnd()
        //console.log(symbols)
        return symbols
    }

    //悬停
    context.subscriptions.push(
        vscode.languages.registerHoverProvider("ow", {
            provideHover(document, position) {

                //获取悬停词
                const ranges = getStringRange(document)
                const offset = document.offsetAt(position)

                //跳过字符串
                if (ranges.has(offset)) {
                    //构造Markdown
                    let info = new vscode.MarkdownString()
                    info.appendMarkdown(`\`字符串\``)
                    info.appendMarkdown(`\n\n一个平平无奇的字符串。`)
                    return new vscode.Hover(info)
                }

                let text = document.getText(document.getWordRangeAtPosition(position))
                //console.log(text);

                const theme = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Dark ? "暗色" : "亮色"
                const block = getBlock(document, offset)
                //console.log(block);

                if (block[0] == "事件") {
                    if (block[1] == 0) {
                        return new vscode.Hover(MODEL.RULES.EVENT[text][theme])
                    } else if (block[1] == 1) {
                        return new vscode.Hover(MODEL.RULES.EVENT_TEAM[text][theme])
                    } else if (block[1] == 2) {
                        return new vscode.Hover(MODEL.RULES.EVENT_PLAYER[text][theme])
                    }
                } else if (block[0] == "条件") {
                    const funct = getFunctName(document, document.offsetAt(document.getWordRangeAtPosition(position).start) - 1)
                    if (text == "队伍1" || text == "队伍2") {
                        if (funct == "队伍") {
                            return new vscode.Hover(MODEL.CONSTS.TEAM[text][theme])
                        } else if (funct == "颜色") {
                            return new vscode.Hover(MODEL.CONSTS.COLOR[text][theme])
                        } else {
                            return new vscode.Hover(MODEL.RULES.CONDITION[text][theme])
                        }
                    }
                    if (MODEL.RULES.CONDITION.hasOwnProperty(text)) {
                        return new vscode.Hover(MODEL.RULES.CONDITION[text][theme])
                    }
                    for (i in MODEL.CONSTS) {
                        for (j in MODEL.CONSTS[i]) {
                            if (text == j) {
                                return new vscode.Hover(MODEL.CONSTS[i][text][theme])
                            }
                        }
                    }
                } else if (block[0] == "动作") {
                    const funct = getFunctName(document, document.offsetAt(document.getWordRangeAtPosition(position).start) - 1)
                    if (text == "队伍1" || text == "队伍2") {
                        if (funct == "队伍") {
                            return new vscode.Hover(MODEL.CONSTS.TEAM[text][theme])
                        } else if (funct == "颜色") {
                            return new vscode.Hover(MODEL.CONSTS.COLOR[text][theme])
                        } else {
                            return new vscode.Hover(MODEL.RULES.CONDITION[text][theme])
                        }
                    }
                    if (MODEL.RULES.CONDITION.hasOwnProperty(text)) {
                        return new vscode.Hover(MODEL.RULES.CONDITION[text][theme])
                    }
                    if (MODEL.RULES.ACTION.hasOwnProperty(text)) {
                        return new vscode.Hover(MODEL.RULES.ACTION[text][theme])
                    }
                    for (i in MODEL.CONSTS) {
                        for (j in MODEL.CONSTS[i]) {
                            if (text == j) {
                                return new vscode.Hover(MODEL.CONSTS[i][text][theme])
                            }
                        }
                    }
                } else {
                    /*
                    if (match = text.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/)) {
                        let hover = new vscode.MarkdownString()
                        hover.isTrusted = true
                        hover.supportHtml = true
                        hover.supportThemeIcons = true
                        hover.baseUri = vscode.Uri.file(path.join(context.extensionPath, '', path.sep))
                        hover.appendMarkdown(`***<span>${match[1]}</span>***\n\n\`变量\` \`子程序\`\n\n一个预定义的名称。`)
                        return new vscode.Hover(hover)
                    }
                    */
                }
            }
        })
    )

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

    function getTypedItems(type) {
        const theme = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Dark
        const themeUri = theme ? '' : 'gray/'
        let items = []
        for (i in type) {
            let item = new vscode.CompletionItem(i)

            if (type == TEMPLATE) {
                item.kind = vscode.CompletionItemKind.Module
            } else if (type == RULES.EVENT) {
                item.kind = vscode.CompletionItemKind.Event
            } else if (type == RULES.EVENT_TEAM) {
                item.kind = vscode.CompletionItemKind.Event
            } else if (type == RULES.EVENT_PLAYER) {
                item.kind = vscode.CompletionItemKind.Event
            } else if (type == RULES.CONDITION) {
                item.kind = vscode.CompletionItemKind.Class
                item.command = {
                    command: 'editor.action.triggerParameterHints',
                    title: 'triggerParameterHints',
                    arguments: []
                }
            } else if (type == RULES.ACTION) {
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
            if (type == RULES.EVENT || type == RULES.EVENT_PLAYER || type == RULES.EVENT_TEAM || type == RULES.ACTION) {
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
                case RULES.EVENT_PLAYER:
                    if (!RULES.EVENT_PLAYER[i].hasOwnProperty("路径")) {
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

    function getCompletionName(document, offset) {
        const text = document.getText()
        for (let i = offset; i >= 0; i--) {
            const char = text[i]
            if (char.match(/[\{\}\(\)\r\s\n]/)) {
                continue
            }
            return document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
        }
    }

    function getFunctName(document, offset) {
        const text = document.getText()
        for (let i = offset; i >= 0; i--) {
            const char = text[i]
            if (char.match(/[\s\()]/)) {
                continue
            }
            return document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
        }
    }

    function getBlock(document, offset) {
        const text = document.getText()
        let param = 0
        const ranges = getStringRange(document)
        for (let i = offset; i >= 0; i--) {
            if (ranges.has(i)) {
                continue
            }
            if (text[i] == ";") {
                param++
            } else if (text[i] == "{") {
                return [getCompletionName(document, i), param]
            } else if (text[i] == "}") {
                return ["模板", -1]
            }

        }
    }

    function isVariableType(document, offset) {
        const text = document.getText()
        const ranges = getStringRange(document)
        for (let i = offset; i >= 0; i--) {
            if (ranges.has(i)) {
                continue
            } else if (text[i].match(/[\s]/)) {
                continue
            }
            return text[i] == "."
        }
    }

    function getVariableKind(document, offset) {
        const text = document.getText()
        const ranges = getStringRange(document)
        for (let i = offset; i >= 0; i--) {
            if (ranges.has(i)) {
                continue
            } else if (text[i].match(/[\s\.]/)) {
                continue
            }
            return document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
        }
    }

    function getFunction(document, offset) {
        let nest = 0
        let param = 0
        const text = document.getText()
        const ranges = getStringRange(document)
        for (let i = offset; i >= 0; i--) {

            if (ranges.has(i)) {
                continue
            }

            switch (text[i]) {
                //检测参数位置
                case ",":
                    if (nest == 0) {
                        param++
                    }
                    break

                //检测函数位置
                case ")":
                case "]":
                    nest++
                    break
                case "(":
                case "[":
                    nest--
                    if (nest < 0) {
                        return [getCompletionName(document, i), param]
                    }
                    break

                //检测块位置
                case ";":
                case "{":
                    return ["", -1]
            }
        }
    }

    function getConstType(type) {
        switch (type) {
            case "视线障碍选项":
                return CONSTS.BARRIERS
            case "按钮选项":
                return CONSTS.BUTTON
            case "地图截取选项":
                return CONSTS.CLIPPING
            case "颜色选项":
                return CONSTS.COLOR
            case "交流选项":
                return CONSTS.COMMUNICATION
            case "英雄数据选项":
                return CONSTS.DATA_HERO
            case "玩家数据选项":
                return CONSTS.DATA_PLAYER
            case "光束效果选项":
                return CONSTS.EFFECT_LIGHT
            case "播放效果选项":
                return CONSTS.EFFECT_PLAY
            case "效果选项":
                return CONSTS.EFFECT
            case "开始规则选项":
                return CONSTS.EXECUTE
            case "生命种类选项":
                return CONSTS.HEALTH
            case "英雄选项":
                return CONSTS.HERO
            case "HUD坐标选项":
                return CONSTS.HUD_LOCATION
            case "图标选项":
                return CONSTS.ICON
            case "视线检测选项":
                return CONSTS.LOS
            case "地图选项":
                return CONSTS.MAP
            case "模式选项":
                return CONSTS.MODE
            case "相反运动选项":
                return CONSTS.MOTION
            case "变量操作选项":
                return CONSTS.OPERATION
            case "轮廓选项":
                return CONSTS.OUTLINES
            case "弹道爆炸声音选项":
                return CONSTS.PROJECTILE_EXPLOSION_SOUND
            case "弹道爆炸效果选项":
                return CONSTS.PROJECTILE_EXPLOSION
            case "弹道生命效果选项":
                return CONSTS.PROJECTILE_HEALTH
            case "弹道选项":
                return CONSTS.PROJECTILE
            case "加速刷新选项":
                return CONSTS.REFRESH_ACCELERATE
            case "助攻刷新选项":
                return CONSTS.REFRESH_ASSIST
            case "持续追踪刷新选项":
                return CONSTS.REFRESH_CHASE
            case "追踪频率刷新选项":
                return CONSTS.REFRESH_CHASE_RATE
            case "伤害调整刷新选项":
                return CONSTS.REFRESH_DAMAGE
            case "效果刷新选项":
                return CONSTS.REFRESH_EFFECT
            case "朝向刷新选项":
                return CONSTS.REFRESH_FACING
            case "友善刷新选项":
                return CONSTS.REFRESH_FRIENDLY
            case "治疗调整刷新选项":
                return CONSTS.REFRESH_HEALING
            case "HUD进度条刷新选项":
                return CONSTS.REFRESH_HUD_BAR
            case "HUD文本刷新选项":
                return CONSTS.REFRESH_HUD_TEXT
            case "图标刷新选项":
                return CONSTS.REFRESH_ICON
            case "地图进度条刷新选项":
                return CONSTS.REFRESH_MAP_BAR
            case "地图文本刷新选项":
                return CONSTS.REFRESH_MAP_TEXT
            case "阈值刷新选项":
                return CONSTS.REFRESH_THROTTLE
            case "坐标相对选项":
                return CONSTS.RELATIVE
            case "取整方式选项":
                return CONSTS.ROUND
            case "玩家状态选项":
                return CONSTS.STATUS
            case "字符串选项":
                return CONSTS.STRING
            case "队伍选项":
                return CONSTS.TEAM
            case "阈值行为选项":
                return CONSTS.THROTTLE
            case "矢量转换选项":
                return CONSTS.TRANSFORMATION
            case "玩家可见选项":
                return CONSTS.VISIBILITY_PLAYER
            case "观战可见选项":
                return CONSTS.VISIBILITY_SPECTATOR
            case "等待行为选项":
                return CONSTS.WAIT
            default:
                return ""
        }
    }

    function getVariableIndex(document, offset, ranges) {
        const text = document.getText()
        for (let i = offset; i >= 0; i--) {

            //跳过字符串
            if (ranges.has(i)) {
                continue
            }

            //跳过无效字符
            if (text[i].match(/[\:\r\s\n]/)) {
                continue
            }

            return document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
        }
    }

    function getVariableName(document, offset, ranges) {
        let text = document.getText()
        let length = text.length
        for (let i = offset; i < length; i++) {

            //跳过字符串
            if (ranges.has(i)) {
                continue
            }

            //跳过无效字符
            if (text[i].match(/[\:\r\s\n]/)) {
                continue
            }

            return document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
        }
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

    //补全
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider("ow", {
            provideCompletionItems(document, position, token, context) {
                const text = document.getText()
                const offset = document.offsetAt(position) - 1

                if (context.triggerCharacter == " ") {
                    for (let i = offset; i >= 0; i--) {
                        if (text[i].match(/\s/)) {
                            continue
                        }
                        if (text[i] != "(" && text[i] != ",") {
                            //console.log("space exit");
                            return
                        } else {
                            break
                        }
                    }
                }

                const block = getBlock(document, offset)
                switch (block[0]) {
                    case "事件":
                        switch (block[1]) {
                            case 0:
                                return getTypedItems(RULES.EVENT)
                            case 1:
                                return getTypedItems(RULES.EVENT_TEAM)
                            case 2:
                                return getTypedItems(RULES.EVENT_PLAYER)
                        }
                    case "条件":
                        if (isVariableType(document, document.offsetAt(position) - 1)) {
                            let variablesItems = getVariableItems(document)
                            if (getVariableKind(document, document.offsetAt(position) - 1) == "全局") {
                                return variablesItems[0]
                            } else {
                                return variablesItems[1]
                            }
                        }
                        var funct = getFunction(document, offset)
                        if (funct[0] == "数组") {
                            return getTypedItems(RULES.CONDITION)
                        } else if (funct[1] == -1) {
                            return getTypedItems(RULES.CONDITION)
                        } else {
                            for (i in RULES.CONDITION) {
                                if (i == funct[0]) {
                                    let n = 0
                                    if (funct[1] >= Object.keys(RULES.CONDITION[i].参数).length) {
                                        let item = new vscode.CompletionItem("无建议")
                                        item.insertText = ""
                                        return [item]
                                    }
                                    for (j in RULES.CONDITION[i].参数) {
                                        if (n == funct[1]) {
                                            let type = RULES.CONDITION[i].参数[j].类型
                                            if (type == "条件") {
                                                return getTypedItems(RULES.CONDITION)
                                            } else {
                                                return getTypedItems(getConstType(type))
                                            }
                                        }
                                        n++
                                    }
                                }
                            }
                        }

                    case "动作":
                        if (isVariableType(document, document.offsetAt(position) - 1)) {
                            let variablesItems = getVariableItems(document)
                            if (getVariableKind(document, document.offsetAt(position) - 1) == "全局") {
                                return variablesItems[0]
                            } else {
                                return variablesItems[1]
                            }
                        }
                        var funct = getFunction(document, offset)
                        if (funct[0] == "数组") {
                            return getTypedItems(RULES.CONDITION)
                        } else if (funct[1] == -1) {
                            return (getTypedItems(RULES.CONDITION).concat(getTypedItems(RULES.ACTION)))
                        } else {
                            for (i in RULES.ACTION) {
                                if (i == funct[0]) {
                                    if (funct[1] >= Object.keys(RULES.ACTION[i].参数).length) {
                                        let item = new vscode.CompletionItem("无建议")
                                        item.insertText = ""
                                        return [item]
                                    }
                                    let n = 0
                                    for (j in RULES.ACTION[i].参数) {
                                        if (n == funct[1]) {
                                            let type = RULES.ACTION[i].参数[j].类型
                                            if (type == "子程序") {
                                                return getSubroutineItems(document)
                                            } else if (type == "变量") {
                                                if (funct[0] == "For 全局变量" || funct[0] == "修改全局变量" || funct[0] == "设置全局变量" || funct[0] == "在索引处修改全局变量" || funct[0] == "在索引处设置全局变量" || funct[0] == "持续追踪全局变量" || funct[0] == "追踪全局变量频率" || funct[0] == "停止追踪全局变量") {
                                                    return getVariableItems(document)[0]
                                                } else {
                                                    return getVariableItems(document)[1]
                                                }
                                            } else if (type == "条件") {
                                                return getTypedItems(RULES.CONDITION)
                                            } else {
                                                return getTypedItems(getConstType(type))
                                            }
                                        }
                                        n++
                                    }
                                }
                            }
                            for (i in RULES.CONDITION) {
                                if (i == funct[0]) {
                                    if (funct[1] >= Object.keys(RULES.CONDITION[i].参数).length) {
                                        let item = new vscode.CompletionItem("无建议")
                                        item.insertText = ""
                                        return [item]
                                    }
                                    let n = 0
                                    for (j in RULES.CONDITION[i].参数) {
                                        if (n == funct[1]) {
                                            let type = RULES.CONDITION[i].参数[j].类型
                                            if (type == "条件") {
                                                return getTypedItems(RULES.CONDITION)
                                            } else {
                                                return getTypedItems(getConstType(type))
                                            }
                                        }
                                        n++
                                    }
                                }
                            }
                        }
                    case "模板":
                        return getTypedItems(TEMPLATE)
                }
                let item = new vscode.CompletionItem("无建议")
                item.insertText = ""
                return [item]
            }
        }, '(', ',', '.', ' ')
    )

    /*
        vscode.workspace.onDidChangeTextDocument(event => {
    vscode.commands.executeCommand('editor.action.triggerSuggest');
});
    */

    //参数
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider("ow", {
            provideSignatureHelp(document, position, token, context) {
                const offset = document.offsetAt(position) - 1
                const block = getBlock(document, offset)
                if (block[0] == "条件" || block[0] == "动作") {
                    let funct = getFunction(document, offset)
                    for (i in RULES.ACTION) {
                        if (i == funct[0]) {
                            const signHelp = new vscode.SignatureHelp()
                            const signInfo = new vscode.SignatureInformation()
                            let name = i
                            let n = 0
                            if (RULES.ACTION[i].hasOwnProperty("参数")) {
                                name += "("
                                for (j in RULES.ACTION[i].参数) {
                                    let param = new vscode.ParameterInformation()
                                    param.label = [name.length, name.length + j.length]
                                    //构造Markdown
                                    let info = new vscode.MarkdownString()
                                    info.isTrusted = true
                                    info.supportHtml = true
                                    info.supportThemeIcons = true
                                    info.appendMarkdown(`***<span style="color:#0ac;">⬘</span>&nbsp;参数&nbsp;:&nbsp;${j}***\n\n`)
                                    info.appendMarkdown(`\`${funct[1]}\` \`${RULES.ACTION[i].参数[j].类型}\`&nbsp;\n\n`)
                                    info.appendMarkdown(`${RULES.ACTION[i].参数[j].提示}&nbsp;\n\n`)
                                    param.documentation = info
                                    signInfo.parameters.push(param)
                                    name += j + ", "
                                }
                                name = name.slice(0, name.length - 2) + ")"
                            }
                            signInfo.label = name

                            let info = new vscode.MarkdownString()
                            info.isTrusted = true
                            info.supportHtml = true
                            info.supportThemeIcons = true
                            info.appendMarkdown(`\n\n***<span style="color:#c0c;">⬘</span>&nbsp;方法&nbsp;:&nbsp;${i}***\n\n`)
                            //标签
                            for (j in RULES.ACTION[i].标签) {
                                info.appendMarkdown(`\`${RULES.ACTION[i].标签[j]}\`&nbsp;`)
                            }
                            //提示
                            info.appendMarkdown(`\n\n${RULES.ACTION[i].提示}`)

                            signInfo.documentation = info
                            signHelp.signatures = [signInfo]
                            signInfo.activeParameter = funct[1]
                            return signHelp
                        }
                    }
                    for (i in RULES.CONDITION) {
                        if (i == funct[0]) {
                            const signHelp = new vscode.SignatureHelp()
                            const signInfo = new vscode.SignatureInformation()
                            let name = i
                            if (RULES.CONDITION[i].hasOwnProperty("参数")) {
                                name += "("
                                for (j in RULES.CONDITION[i].参数) {
                                    let param = new vscode.ParameterInformation()
                                    param.label = [name.length, name.length + j.length]

                                    //构造Markdown
                                    let info = new vscode.MarkdownString()
                                    info.isTrusted = true
                                    info.supportHtml = true
                                    info.supportThemeIcons = true
                                    info.appendMarkdown(`***<span style="color:#0ac;">⬘</span>&nbsp;参数&nbsp;:&nbsp;${j}***\n\n`)
                                    info.appendMarkdown(`\`${funct[1]}\` \`${RULES.CONDITION[i].参数[j].类型}\`&nbsp;\n\n`)
                                    info.appendMarkdown(`${RULES.CONDITION[i].参数[j].提示}&nbsp;\n\n`)
                                    param.documentation = info
                                    signInfo.parameters.push(param)
                                    name += j + ", "
                                }
                                name = name.slice(0, name.length - 2) + ")"
                            }
                            signInfo.label = name

                            let info = new vscode.MarkdownString()
                            info.isTrusted = true
                            info.supportHtml = true
                            info.supportThemeIcons = true
                            info.appendMarkdown(`\n\n***<span style="color:#c0c;">⬘</span>&nbsp;方法&nbsp;:&nbsp;${i}***\n\n`)
                            //标签
                            for (j in RULES.CONDITION[i].标签) {
                                info.appendMarkdown(`\`${RULES.CONDITION[i].标签[j]}\`&nbsp;`)
                            }
                            //提示
                            info.appendMarkdown(`\n\n${RULES.CONDITION[i].提示}`)

                            signInfo.documentation = info
                            signHelp.signatures = [signInfo]
                            signInfo.activeParameter = funct[1]
                            return signHelp
                        }
                    }
                }
            }
        }, '(', ',', ' ')
    )

    function getDefinitionName(document, strings, offset) {
        const text = document.getText()
        for (let i = offset; i >= 0; i--) {
            //跳过字符串
            if (strings.has(i)) {
                continue
            }
            //跳过无效字符
            if (text[i].match(/[\(\.\r\s\n]/)) {
                continue
            }

            return document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
        }
    }

    function getDefinitionPosition(document, strings, name, type) {
        const text = document.getText()
        const length = text.length
        let inblock = false

        if (type == "子程序") {
            for (let i = 0; i < length; i++) {
                //跳过字符串
                if (strings.has(i)) {
                    continue
                }
                if (text[i] == "{") {
                    let word = getBlock(document, i)
                    if (word[0] == "子程序") {
                        inblock = true
                    }
                } else if (inblock) {
                    if (text[i] == "}") {
                        return
                    } else if (text[i] == ":") {
                        let index = getVariableIndex(document, i, strings)
                        if (index.match(/\b(-?\d+)(.\d+|\d+)?\b/)) {
                            if (name == getVariableName(document, i, strings)) {
                                return document.positionAt(i + 1)
                            }
                        }
                    }
                }
            }
            return
        }

        for (let i = 0; i < length; i++) {
            //跳过字符串
            if (strings.has(i)) {
                continue
            }
            if (text[i] == "{") {
                let word = getBlock(document, i)
                if (word[0] == "变量") {
                    inblock = true
                }
            } else if (inblock) {
                if (text[i] == "}") {
                    return
                } else if (text[i] == ":") {
                    let index = getVariableIndex(document, i, strings)
                    if (index.match(/(全局|玩家)/)) {
                        kind = index
                    }
                    if (kind == type) {
                        if (index.match(/\b(-?\d+)(.\d+|\d+)?\b/)) {
                            if (name == getVariableName(document, i, strings)) {
                                return document.positionAt(i + 1)
                            }
                        }
                    }
                }
            }
        }
    }

    function getVariablesType(document, strings, offset) {
        const text = document.getText()
        for (let i = offset; i >= 0; i--) {
            //跳过字符串
            if (strings.has(i)) {
                continue
            }
            if (text[i] == ".") {
                if (getDefinitionName(document, strings, i) == "全局") {
                    return "全局"
                } else {
                    return "玩家"
                }
            } else if (text[i] == "(") {
                if (getDefinitionName(document, strings, i).match(/(For 全局变量|设置全局变量|修改全局变量|在索引处设置全局变量|在索引处修改全局变量|持续追踪全局变量|追踪全局变量频率|停止追踪全局变量)/)) {
                    return "全局"
                } else if (getDefinitionName(document, strings, i).match(/(For 玩家变量|设置玩家变量|修改玩家变量|在索引处设置玩家变量|在索引处修改玩家变量|持续追踪玩家变量|追踪玩家变量频率|停止追踪玩家变量)/)) {
                    return "玩家"
                } else if (getDefinitionName(document, strings, i).match(/(调用子程序|开始规则)/)) {
                    return "子程序"
                }
            } else if (text[i] == ";") {
                if (getDefinitionName(document, strings, i).match(/子程序/)) {
                    return "子程序"
                }
            } else if (text[i] == ":") {
                return
            }
        }
    }

    //定义跳转
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider("ow", {
            provideDefinition(document, position) {

                //获取悬停词
                const strings = getStringRange(document)
                const offset = document.offsetAt(position)

                //跳过字符串
                if (strings.has(offset)) {
                    return
                }

                let name = document.getText(document.getWordRangeAtPosition(position))
                let type = getVariablesType(document, strings, offset)
                let pos = getDefinitionPosition(document, strings, name, type)
                return new vscode.Location(document.uri, pos)
            }
        })
    )

    //折叠范围
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider("ow", {
            provideFoldingRanges(document) {
                try {
                    const text = document.getText()
                    const length = text.length

                    let i = 0
                    let lineEnd = 0
                    let isString = false
                    let isLineComment = false
                    let isPhaseComment = false

                    let foldingRanges = []

                    let braces = []
                    let brackets = []
                    let parentheses = []

                    let flows = []

                    function peek(n) {
                        if (i < length - n) {
                            return text[i + n]
                        }
                    }

                    function skip(n) {
                        i += n
                    }

                    function matchControlFlowSStart() {
                        if (text.slice(i, i + 8) == "For 全局变量") {
                            return "For 全局变量"
                        }
                        if (text.slice(i, i + 8) == "For 玩家变量") {
                            return "For 玩家变量"
                        }
                        if (text.slice(i, i + 5) == "While") {
                            return "While"
                        }
                        if (text.slice(i, i + 2) == "If") {
                            return "If"
                        }
                        return undefined
                    }

                    function matchControlFlowMiddle() {
                        if (text.slice(i, i + 7) == "Else If") {
                            return "Else If"
                        }
                        if (text.slice(i, i + 4) == "Else") {
                            return "Else"
                        }
                        return undefined
                    }

                    function matchControlFlowEnd() {
                        if (text.slice(i, i + 3) == "End") {
                            return "End"
                        }
                        return undefined
                    }

                    while (i < length) {
                        if (isLineComment) {
                            //行注
                            if (i == lineEnd) {
                                skip(1)
                                isLineComment = false
                            } else {
                                skip(1)
                            }
                        } else if (isPhaseComment) {
                            //段注
                            if (peek(0) == "*" && peek(1) == "/") {
                                skip(2)
                                isPhaseComment = false
                            } else {
                                skip(1)
                            }
                        } else if (isString) {
                            //字符串
                            if (peek(0) == "\"") {
                                skip(1)
                                isString = false
                            } else if (peek(0) == "\\") {
                                skip(2)
                            } else {
                                skip(1)
                            }
                        } else if (peek(0) == "/" && peek(1) == "/") {
                            //行注开始
                            skip(2)
                            const line = document.lineAt(document.positionAt(i).line);
                            const text = line.text;
                            const index = text.search(/$/)
                            lineEnd = document.offsetAt(new vscode.Position(document.positionAt(i).line, index))
                            isLineComment = true
                        } else if (peek(0) == "/" && peek(1) == "*") {
                            //段注开始
                            skip(2)
                            isPhaseComment = true
                        } else if (peek(0) == "\"") {
                            //字符串开始
                            skip(1)
                            isString = true
                        } else if (peek(0) == "{") {
                            braces.push(i)
                            skip(1)
                        } else if (peek(0) == "}") {
                            foldingRanges.push(new vscode.FoldingRange(document.positionAt(braces.pop()).line - 1, document.positionAt(i).line))
                            skip(1)
                        } else if (peek(0) == "[") {
                            brackets.push(i)
                            skip(1)
                        } else if (peek(0) == "]") {
                            foldingRanges.push(new vscode.FoldingRange(document.positionAt(brackets.pop()).line - 1, document.positionAt(i).line))
                            skip(1)
                        } else if (peek(0) == "(") {
                            parentheses.push(i)
                            skip(1)
                        } else if (peek(0) == ")") {
                            foldingRanges.push(new vscode.FoldingRange(document.positionAt(parentheses.pop()).line - 1, document.positionAt(i).line))
                            skip(1)
                        } else if (match = matchControlFlowSStart()) {
                            flows.push(i)
                            skip(match.length)
                        } else if (match = matchControlFlowMiddle()) {
                            foldingRanges.push(new vscode.FoldingRange(document.positionAt(flows.pop()).line, document.positionAt(i).line - 1))
                            flows.push(i)
                            skip(match.length)
                        } else if (match = matchControlFlowEnd()) {
                            foldingRanges.push(new vscode.FoldingRange(document.positionAt(flows.pop()).line, document.positionAt(i).line - 1))
                            skip(match.length)
                        } else {
                            skip(1)
                        }
                    }
                    //console.log(foldingRanges)
                    return foldingRanges
                } catch (error) {
                    console.log(error)
                }
            }
        })
    )

    //文档格式化
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider("ow", {
            provideDocumentFormattingEdits(document, options, token) {
                try {

                    const tokens = getTokens(document)
                    if (!tokens) {
                        return
                    }
                    const length = tokens.length
                    //console.log(tokens)

                    let i = 0
                    let tab = 0
                    let text = ""
                    let blocks = []

                    function getBlock() {
                        return blocks[blocks.length - 1]
                    }

                    function addTab() {
                        for (let j = 0; j < tab; j++) {
                            text += "\t"
                        }
                    }

                    function addLine() {
                        text += "\n"
                    }

                    function addSpace() {
                        text += " "
                    }

                    function addToken() {
                        text += peek(0)
                        i++
                    }

                    function peek(n) {
                        return tokens[i + n]
                    }

                    function isString(t) {
                        return t.startsWith("\"")
                    }

                    function isComment(t) {
                        return t.startsWith("//") || t.startsWith("/*")
                    }

                    function isNumber(t) {
                        return t.match(/\b(-?\d+)(.\d+|\d+)?\b/)
                    }

                    function isVariable(t) {
                        return t.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/)
                    }

                    function formatSetting() {
                        blocks.push(peek(0))
                        addToken()
                        addLine()
                        addTab()
                        addToken()
                        tab++
                        if (peek(0) == "}") {
                            tab--
                        }
                        addLine()
                        addTab()
                        while (i < length) {
                            if (peek(0) == "禁用") {
                                addToken()
                                addSpace()
                            } else if (FORMAT.BLOCK.has(peek(0)) && peek(1) == "{") {
                                blocks.push(peek(0))
                                addToken()
                                addLine()
                                addTab()
                                addToken()
                                tab++
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (FORMAT.BLOCK.has(peek(0))) {
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (peek(0) == "}") {
                                blocks.pop()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                } else {
                                    addLine()
                                }
                                addLine()
                                addTab()
                                if (blocks.length == 0) {
                                    return
                                }
                            } else if (getBlock() == "主程序" && FORMAT.MAIN.has(peek(0)) && peek(1) == ":" && isString(peek(2))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (getBlock() == "大厅" && FORMAT.LOBBY.has(peek(0)) && peek(1) == ":" && (FORMAT.LOBBY_OPTION.has(peek(2)) || isNumber(peek(2)))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if ((getBlock() == "启用地图" || getBlock() == "禁用地图") && CONSTS.MAP.hasOwnProperty(peek(0))) {
                                addToken()
                                if (isNumber(peek(0))) {
                                    addSpace()
                                    addToken()
                                }
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (CONSTS.MODE.hasOwnProperty(getBlock()) && FORMAT.MODE_DETAIL.has(peek(0)) && peek(1) == ":" && isNumber(peek(2)) && peek(3) == "%") {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (CONSTS.MODE.hasOwnProperty(getBlock()) && FORMAT.MODE_DETAIL.has(peek(0)) && peek(1) == ":" && (isNumber(peek(2)) || FORMAT.MODE_OPTION.has(peek(2)))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (blocks.includes("模式") && getBlock() == "综合" && FORMAT.MODE_DETAIL.has(peek(0)) && peek(1) == ":" && isNumber(peek(2)) && peek(3) == "%") {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (blocks.includes("模式") && getBlock() == "综合" && FORMAT.MODE_DETAIL.has(peek(0)) && peek(1) == ":" && (isNumber(peek(2)) || FORMAT.MODE_OPTION.has(peek(2)))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if ((getBlock() == "启用英雄" || getBlock() == "禁用英雄") && CONSTS.HERO.hasOwnProperty(peek(0))) {
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (CONSTS.HERO.hasOwnProperty(getBlock()) && FORMAT.HERO_DETAIL.has(peek(0)) && peek(1) == ":" && isNumber(peek(2)) && peek(3) == "%") {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (CONSTS.HERO.hasOwnProperty(getBlock()) && FORMAT.HERO_DETAIL.has(peek(0)) && peek(1) == ":" && (isNumber(peek(2)) || FORMAT.HERO_OPTION.has(peek(2)))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (blocks.includes("英雄") && (getBlock() == "综合" || getBlock() == "队伍1" || getBlock() == "队伍2" || getBlock() == "团队混战") && FORMAT.HERO_DETAIL.has(peek(0)) && peek(1) == ":" && isNumber(peek(2)) && peek(3) == "%") {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (blocks.includes("英雄") && getBlock() == "综合" && FORMAT.HERO_DETAIL.has(peek(0)) && peek(1) == ":" && (isNumber(peek(2)) || FORMAT.HERO_OPTION.has(peek(2)))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (getBlock() == "扩展" && FORMAT.EXTENSION.has(peek(0))) {
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (isComment(peek(0))) {
                                //注释
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else {
                                console.log("ERROR formatSetting(): " + peek(0));
                                formatError()
                                return
                            }
                        }
                    }

                    function formatVariable() {
                        blocks.push(peek(0))
                        addToken()
                        addLine()
                        addTab()
                        addToken()
                        tab++
                        if (peek(0) == "}") {
                            tab--
                        }
                        addLine()
                        addTab()
                        while (i < length) {
                            if ((peek(0) == "全局" || peek(0) == "玩家") && peek(1) == ":") {
                                blocks.push(peek(0))
                                addToken()
                                addToken()
                                tab++
                                if (peek(0) == "全局" || peek(0) == "玩家") {
                                    tab--
                                } else if (peek(0) == "}") {
                                    tab -= 2
                                }
                                addLine()
                                addTab()
                            } else if (isNumber(peek(0)) && peek(1) == ":" && isVariable(peek(2))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "全局" || peek(0) == "玩家") {
                                    tab--
                                } else if (peek(0) == "}") {
                                    if (getBlock == "变量") {
                                        tab--
                                    } else {
                                        tab -= 2
                                    }
                                }
                                addLine()
                                addTab()
                            } else if (isComment(peek(0))) {
                                //注释
                                addToken()
                                if (peek(0) == "全局" || peek(0) == "玩家") {
                                    tab--
                                } else if (peek(0) == "}") {
                                    if (getBlock == "变量") {
                                        tab--
                                    } else {
                                        tab -= 2
                                    }
                                }
                                addLine()
                                addTab()
                            } else if (peek(0) == "}") {
                                blocks.length = 0
                                addToken()
                                addLine()
                                addLine()
                                addTab()
                                return
                            } else {
                                console.log("ERROR formatVariable(): " + peek(0));
                                formatError()
                                return
                            }
                        }
                    }

                    function formatSubroutine() {
                        blocks.push(peek(0))
                        addToken()
                        addLine()
                        addTab()
                        addToken()
                        tab++
                        if (peek(0) == "}") {
                            tab--
                        }
                        addLine()
                        addTab()
                        while (i < length) {
                            if (isNumber(peek(0)) && peek(1) == ":" && isVariable(peek(2))) {
                                addToken()
                                addToken()
                                addSpace()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (isComment(peek(0))) {
                                //注释
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (peek(0) == "}") {
                                blocks.pop()
                                addToken()
                                addLine()
                                addLine()
                                addTab()
                                if (blocks.length == 0) {
                                    return
                                }
                            } else {
                                console.log("ERROR formatSubroutine(): " + peek(0));
                                formatError()
                                return
                            }
                        }
                    }

                    function formatRule() {
                        blocks.push(peek(0))
                        addToken()
                        addToken()
                        addToken()
                        addToken()
                        addLine()
                        addTab()
                        addToken()
                        tab++
                        if (peek(0) == "}") {
                            tab--
                        }
                        addLine()
                        addTab()
                        while (i < length) {
                            if (peek(0) == "禁用") {
                                addToken()
                                addSpace()
                            } else if ((peek(0) == "事件" || peek(0) == "条件" || peek(0) == "动作") && peek(1) == "{") {
                                blocks.push(peek(0))
                                addToken()
                                addLine()
                                addTab()
                                addToken()
                                tab++
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (peek(0) == ";") {
                                addToken()
                                if (peek(0) == "}" || peek(0) == "Else" || peek(0) == "Else If" || peek(0) == "End") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (peek(0) == "}") {
                                blocks.pop()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                } else {
                                    addLine()
                                }
                                addLine()
                                addTab()
                                if (blocks.length == 0) {
                                    return
                                }
                            } else if (peek(0) == ",") {
                                addToken()
                                addSpace()
                            } else if (peek(0) == "?") {
                                addSpace()
                                addToken()
                                addSpace()
                            } else if (peek(0) == ":") {
                                addSpace()
                                addToken()
                                addSpace()
                            } else if (peek(0) == "+" || peek(0) == "-" || peek(0) == "*" || peek(0) == "/" || peek(0) == "^" || peek(0) == "%" || peek(0) == "<" || peek(0) == ">" || peek(0) == "!" || peek(0) == "=") {
                                //运算符号
                                addSpace()
                                addToken()
                                if (peek(0) == "=") {
                                    addToken()
                                }
                                addSpace()
                            } else if ((peek(0) == "&" && peek(1) == "&") || (peek(0) == "|" && peek(1) == "|")) {
                                //console.log(peek(0) + peek(1));
                                addSpace()
                                addToken()
                                addToken()
                                addSpace()
                            } else if (peek(0) == "(" || peek(0) == ")" || peek(0) == "[" || peek(0) == "]" || peek(0) == ".") {
                                addToken()
                            } else if (isComment(peek(0))) {
                                //注释
                                addToken()
                                if (peek(0) == "}" || peek(0) == "Else" || peek(0) == "Else If" || peek(0) == "End") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (isString(peek(0))) {
                                //字符串
                                addToken()
                                if (peek(0) == "," || peek(0) == ")") {

                                } else if (peek(0) == "}" || peek(0) == "Else" || peek(0) == "Else If" || peek(0) == "End") {
                                    tab--
                                } else {
                                    addLine()
                                    addTab()
                                }
                            } else if (getBlock() == "事件" && FORMAT.EVENT.has(peek(0))) {
                                addToken()
                            } else if (getBlock() == "条件" && FORMAT.CONDITION.has(peek(0))) {
                                addToken()
                            } else if (getBlock() == "动作" && FORMAT.ACTION.has(peek(0))) {
                                if (peek(0) == "For 全局变量" || peek(0) == "For 玩家变量" || peek(0) == "While" || peek(0) == "If" || peek(0) == "Else" || peek(0) == "Else If") {
                                    tab++
                                }
                                addToken()
                            } else if (isNumber(peek(0))) {
                                addToken()
                            } else if (isVariable(peek(0))) {
                                addToken()
                            } else {
                                formatError()
                                return
                            }
                        }
                    }

                    function formatCondition() {
                        blocks.push(peek(0))
                        addToken()
                        addLine()
                        addTab()
                        addToken()
                        tab++
                        if (peek(0) == "}") {
                            tab--
                        }
                        addLine()
                        addTab()
                        while (i < length) {
                            if (peek(0) == "禁用") {
                                addToken()
                                addSpace()
                            } else if (peek(0) == ";") {
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (peek(0) == "}") {
                                blocks.pop()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                } else {
                                    addLine()
                                }
                                addLine()
                                addTab()
                                if (blocks.length == 0) {
                                    return
                                }
                            } else if (peek(0) == ",") {
                                addToken()
                                addSpace()
                            } else if (peek(0) == "?") {
                                addSpace()
                                addToken()
                                addSpace()
                            } else if (peek(0) == ":") {
                                addSpace()
                                addToken()
                                addSpace()
                            } else if (peek(0) == "+" || peek(0) == "-" || peek(0) == "*" || peek(0) == "/" || peek(0) == "^" || peek(0) == "%" || peek(0) == "<" || peek(0) == ">" || peek(0) == "!" || peek(0) == "=") {
                                //运算符号
                                addSpace()
                                addToken()
                                if (peek(0) == "=") {
                                    addToken()
                                }
                                addSpace()
                            } else if ((peek(0) == "&" && peek(1) == "&") || (peek(0) == "|" && peek(1) == "|")) {
                                //console.log(peek(0) + peek(1));
                                addSpace()
                                addToken()
                                addToken()
                                addSpace()
                            } else if (peek(0) == "(" || peek(0) == ")" || peek(0) == "[" || peek(0) == "]" || peek(0) == ".") {
                                addToken()
                            } else if (isComment(peek(0))) {
                                //注释
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (isString(peek(0))) {
                                //字符串
                                addToken()
                                if (peek(0) == "," || peek(0) == ")") {

                                } else if (peek(0) == "}") {
                                    tab--
                                } else {
                                    addLine()
                                    addTab()
                                }
                            } else if (FORMAT.CONDITION.has(peek(0))) {
                                addToken()
                            } else if (isNumber(peek(0))) {
                                addToken()
                            } else if (isVariable(peek(0))) {
                                addToken()
                            } else {
                                console.log("ERROR formatCondition(): " + peek(-1) + peek(0) + peek(1));
                                formatError()
                                return
                            }
                        }
                    }

                    function formatAction() {
                        blocks.push(peek(0))
                        addToken()
                        addLine()
                        addTab()
                        addToken()
                        tab++
                        if (peek(0) == "}") {
                            tab--
                        }
                        addLine()
                        addTab()
                        while (i < length) {
                            if (peek(0) == "禁用") {
                                addToken()
                                addSpace()
                            } else if (peek(0) == ";") {
                                addToken()
                                if (peek(0) == "}" || peek(0) == "Else" || peek(0) == "Else If" || peek(0) == "End") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (peek(0) == "}") {
                                blocks.pop()
                                addToken()
                                if (peek(0) == "}") {
                                    tab--
                                } else {
                                    addLine()
                                }
                                addLine()
                                addTab()
                                if (blocks.length == 0) {
                                    return
                                }
                            } else if (peek(0) == ",") {
                                addToken()
                                addSpace()
                            } else if (peek(0) == "?") {
                                addSpace()
                                addToken()
                                addSpace()
                            } else if (peek(0) == ":") {
                                addSpace()
                                addToken()
                                addSpace()
                            } else if (peek(0) == "+" || peek(0) == "-" || peek(0) == "*" || peek(0) == "/" || peek(0) == "^" || peek(0) == "%" || peek(0) == "<" || peek(0) == ">" || peek(0) == "!" || peek(0) == "=") {
                                //运算符号
                                addSpace()
                                addToken()
                                if (peek(0) == "=") {
                                    addToken()
                                }
                                addSpace()
                            } else if ((peek(0) == "&" && peek(1) == "&") || (peek(0) == "|" && peek(1) == "|")) {
                                //console.log(peek(0) + peek(1));
                                addSpace()
                                addToken()
                                addToken()
                                addSpace()
                            } else if (peek(0) == "(" || peek(0) == ")" || peek(0) == "[" || peek(0) == "]" || peek(0) == ".") {
                                addToken()
                            } else if (isComment(peek(0))) {
                                //注释
                                addToken()
                                if (peek(0) == "}" || peek(0) == "Else" || peek(0) == "Else If" || peek(0) == "End") {
                                    tab--
                                }
                                addLine()
                                addTab()
                            } else if (isString(peek(0))) {
                                //字符串
                                addToken()
                                if (peek(0) == "," || peek(0) == ")") {

                                } else if (peek(0) == "}" || peek(0) == "Else" || peek(0) == "Else If" || peek(0) == "End") {
                                    tab--
                                } else {
                                    addLine()
                                    addTab()
                                }
                            } else if (FORMAT.ACTION.has(peek(0))) {
                                if (peek(0) == "For 全局变量" || peek(0) == "For 玩家变量" || peek(0) == "While" || peek(0) == "If" || peek(0) == "Else" || peek(0) == "Else If") {
                                    tab++
                                }
                                addToken()
                            } else if (isNumber(peek(0))) {
                                addToken()
                            } else if (isVariable(peek(0))) {
                                addToken()
                            } else {
                                formatError()
                                return
                            }
                        }
                    }

                    function formatError() {
                        REPORT.generateError(`错误报告`, `第${i}个 TOKEN 未定义。⬗ ${tokens[i]}`, [
                            `Format`,
                            `Parser`,
                            `第${i}个 TOKEN 未定义。`,
                            tokens[i]
                        ], {
                            "已处理TOKEN": tokens.slice(0, i).join("\n\t"),
                            "未处理TOKEN": tokens.slice(i).join("\n\t")
                        })
                    }

                    while (i < length) {
                        if (peek(0) == "禁用") {
                            addToken()
                            addSpace()
                        } else if (peek(0) == "规则" && peek(1) == "(" && isString(peek(2)) && peek(3) == ")" && peek(4) == "{") {
                            formatRule()
                        } else if (peek(0) == "条件" && peek(1) == "{") {
                            formatCondition()
                        } else if (peek(0) == "动作" && peek(1) == "{") {
                            formatAction()
                        } else if (peek(0) == "子程序" && peek(1) == "{") {
                            formatSubroutine()
                        } else if (peek(0) == "变量" && peek(1) == "{") {
                            formatVariable()
                        } else if (peek(0) == "设置" && peek(1) == "{") {
                            formatSetting()
                        } else if (isComment(peek(0))) {
                            //注释
                            addToken()
                            if (peek(0) == "}") {
                                tab--
                            }
                            addLine()
                            addTab()
                        } else {
                            formatError()
                            return
                        }
                    }
                    let range = new vscode.Range(0, 0, document.lineCount, 0)
                    let edit = new vscode.TextEdit(range, text)
                    return [edit]
                } catch (error) {
                    console.log(error)
                }
            }
        })
    )

    function getTokens(document) {
        let i = 0
        let tokens = []
        let buffer = ""
        let lineEnd = 0
        let isString = false
        let isLineComment = false
        let isPhaseComment = false
        const text = document.getText()
        const length = text.length

        function skip(n) {
            i += n
        }

        function take(n) {
            let len = Math.min(i + n, length)
            for (let j = i; j < len; j++) {
                buffer += text[j]
                skip(1)
            }
        }

        function peek(n) {
            if (i < length - n) {
                return text[i + n]
            }
        }

        function push() {
            if (buffer.length > 0) {
                tokens.push(buffer)
                buffer = ""
            }
        }

        function matchToken(type, min, max) {
            for (let j = max; j >= min; j--) {
                let keyword = text.slice(i, i + j)
                if (type.has(keyword)) {
                    return keyword
                }
            }
        }

        while (i < length) {
            if (isLineComment) {
                //行注
                if (i == lineEnd) {
                    take(1)
                    push()
                    isLineComment = false
                } else {
                    take(1)
                }
            } else if (isPhaseComment) {
                //段注
                if (peek(0) == "*" && peek(1) == "/") {
                    take(2)
                    push()
                    isPhaseComment = false
                } else {
                    take(1)
                }
            } else if (isString) {
                //字符串
                if (peek(0) == "\"") {
                    take(1)
                    push()
                    isString = false
                } else if (peek(0) == "\\") {
                    take(2)
                } else {
                    take(1)
                }
            } else if (peek(0).match(/\s/)) {
                //跳过空白
                skip(1)
            } else if (peek(0) == "/" && peek(1) == "/") {
                //行注开始
                take(2)
                const line = document.lineAt(document.positionAt(i).line);
                const text = line.text;
                const index = text.search(/\S\s*$/);
                if (index !== -1) {
                    lineEnd = document.offsetAt(new vscode.Position(document.positionAt(i).line, index))
                    isLineComment = true
                }
            } else if (peek(0) == "/" && peek(1) == "*") {
                //段注开始
                take(2)
                isPhaseComment = true
            } else if (peek(0) == "\"") {
                //字符串开始
                take(1)
                isString = true
            } else if (match = matchToken(TOKEN.ALL, 1, 16)) {
                //保留词
                take(match.length)
                push()
            } else if (match = text.slice(i).match(/^([a-zA-Z_][a-zA-Z0-9_]*).*/)) {
                //命名
                take(match[1].length)
                push()
            } else if (match = text.slice(i).match(/^((-?\d+)(.\d+|\d+)?).*/)) {
                //数字
                take(match[1].length)
                push()
            } else if (peek(0) == "{" || peek(0) == "}" || peek(0) == "(" || peek(0) == ")" || peek(0) == "[" || peek(0) == "]" || peek(0) == ":" || peek(0) == ";" || peek(0) == "," || peek(0) == "." || peek(0) == "+" || peek(0) == "-" || peek(0) == "*" || peek(0) == "/" || peek(0) == "^" || peek(0) == "%" || peek(0) == "<" || peek(0) == ">" || peek(0) == "!" || peek(0) == "?" || peek(0) == "=" || peek(0) == "|" || peek(0) == "&") {
                //符号
                take(1)
                push()
            } else {
                //未定义
                let position = document.positionAt(i)
                REPORT.generateError(`错误报告`, `第${position.line + 1}行, 第${position.character}字符处未定义。⬗ ${document.getText(document.getWordRangeAtPosition(document.positionAt(i)))}`, [
                    `Format`,
                    `Lexer`,
                    `Token`,
                    `第${position.line}行, 第${position.character}字符处未定义。`,
                    document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
                ], {
                    "已收集TOKEN": tokens.join("\n\t"),
                    "已处理片段": text.slice(0, i),
                    "未处理片段": text.slice(i)
                })
                return
            }
        }
        return tokens
    }

    //观察设置
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('启用语法分析（实验性）')) {
            vscode.commands.executeCommand('workbench.action.restartExtensionHost')
        }
    })

    //语法高亮
    const tokenTypes = ['comment', 'string', 'number', 'variable', `symbol`, `action`, 'condition', `constant`, 'event', 'other']
    const legend = new vscode.SemanticTokensLegend(tokenTypes)
    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider("ow", {
            provideDocumentSemanticTokens(document, token) {
                if (!vscode.workspace.getConfiguration().get('启用语法分析（实验性）')) {
                    return new vscode.SemanticTokensBuilder().build()
                }

                let i = 0
                let lineEnd = 0
                let isString = false
                let isLineComment = false
                let isPhaseComment = false
                let buffer = ""
                let blocks = []
                let functs = []
                let tokens = []

                const builder = new vscode.SemanticTokensBuilder()
                const text = document.getText()
                const length = text.length
                const type = {
                    comment: 0,
                    string: 1,
                    number: 2,
                    variable: 3,
                    symbol: 4,
                    action: 5,
                    condition: 6,
                    constant: 7,
                    event: 8,
                    other: 9
                }

                function skip(n) {
                    i += n
                }

                function take(n) {
                    let len = Math.min(i + n, length)
                    for (let j = i; j < len; j++) {
                        buffer += text[j]
                        skip(1)
                    }
                }

                function peek(n) {
                    if (i < length - n) {
                        return text[i + n]
                    }
                }

                function push(type) {
                    if (buffer.length > 0) {
                        let position = document.positionAt(i - buffer.length)
                        //console.log(buffer, position.line, position.character, buffer.length, type)
                        builder.push(position.line, position.character, buffer.length, type)
                        tokens.push(buffer)
                        buffer = ""
                    }
                }

                function matchToken(type, min, max) {
                    for (let j = max; j >= min; j--) {
                        let keyword = text.slice(i, i + j)
                        if (type.has(keyword)) {
                            return keyword
                        }
                    }
                }

                function getBlock() {
                    return blocks[blocks.length - 1]
                }

                function getFunct() {
                    return functs[functs.length - 1]
                }

                function isConstant(funct) {
                    if (MODEL.RULES.ACTION.hasOwnProperty(funct.name) && MODEL.RULES.ACTION[funct.name].hasOwnProperty("参数")) {
                        let n = 0
                        for (p in MODEL.RULES.ACTION[funct.name].参数) {
                            if (n++ == funct.param) {
                                return MODEL.RULES.ACTION[funct.name].参数[p].类型 != "条件"
                            }
                        }
                    } else if (MODEL.RULES.CONDITION.hasOwnProperty(funct.name) && MODEL.RULES.CONDITION[funct.name].hasOwnProperty("参数")) {
                        let n = 0
                        for (p in MODEL.RULES.CONDITION[funct.name].参数) {
                            if (n++ == funct.param) {
                                return MODEL.RULES.CONDITION[funct.name].参数[p].类型 != "条件"
                            }
                        }
                    } else {
                        return false
                    }
                }

                function getReport() {
                    //未定义
                    let position = document.positionAt(i)
                    let word = document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
                    if (word.length > 20) {
                        word = word.slice(0, 15) + "..."
                    }
                    REPORT.generateError(`错误报告`, `第${position.line}行, 第${position.character}字符处未定义。⬗ ${tokens[tokens.length - 1]} ... ${word}`, [
                        `Highlight`,
                        `Lexer`,
                        `Token`,
                        `第${position.line}行, 第${position.character}字符处未定义。`,
                        tokens[tokens.length - 1],
                        word
                    ], {
                        "已收集TOKEN": tokens.join("\n\t"),
                        "已处理片段": text.slice(0, i),
                        "未处理片段": text.slice(i)
                    })
                    return
                }

                try {
                    while (i < length) {
                        if (isLineComment) {
                            //行注
                            if (i == lineEnd) {
                                take(1)
                                push(type.comment)
                                isLineComment = false
                            } else {
                                take(1)
                            }
                        } else if (isPhaseComment) {
                            //段注
                            if (peek(0) == "*" && peek(1) == "/") {
                                take(2)
                                push(type.comment)
                                isPhaseComment = false
                            } else {
                                take(1)
                            }
                        } else if (isString) {
                            //字符串
                            if (peek(0) == "\"") {
                                take(1)
                                push(type.string)
                                isString = false
                            } else if (peek(0) == "\\") {
                                take(2)
                            } else {
                                take(1)
                            }
                        } else if (peek(0).match(/\s/)) {
                            //跳过空白
                            skip(1)
                        } else if (peek(0) == "/" && peek(1) == "/") {
                            //行注开始
                            take(2)
                            const line = document.lineAt(document.positionAt(i).line);
                            const text = line.text;
                            const index = text.search(/\$/);
                            if (index !== -1) {
                                lineEnd = document.offsetAt(new vscode.Position(document.positionAt(i).line, index))
                                isLineComment = true
                            }
                        } else if (peek(0) == "/" && peek(1) == "*") {
                            //段注开始
                            take(2)
                            isPhaseComment = true
                        } else if (peek(0) == "\"") {
                            //字符串开始
                            take(1)
                            isString = true
                        } else if (peek(0) == "{") {
                            //块头
                            if (tokens[tokens.length - 1] == "设置" || tokens[tokens.length - 1] == "变量" || tokens[tokens.length - 1] == "子程序" || tokens[tokens.length - 1] == "事件" || tokens[tokens.length - 1] == "条件" || tokens[tokens.length - 1] == "动作") {
                                blocks.push(tokens[tokens.length - 1])
                            } else if (tokens[tokens.length - 4] == "规则") {
                                blocks.push(tokens[tokens.length - 4])
                            } else {
                                blocks.push(blocks[blocks.length - 1])
                            }
                            //console.log(blocks)
                            take(1)
                            push(type.other)
                        } else if (peek(0) == "}") {
                            //块尾
                            blocks.pop()
                            take(1)
                            push(type.other)
                        } else if (peek(0) == "(") {
                            //函头
                            if (TOKEN.ACTION.has(tokens[tokens.length - 1]) || TOKEN.CONDITION.has(tokens[tokens.length - 1]) || tokens[tokens.length - 1] == "规则") {
                                functs.push({
                                    name: tokens[tokens.length - 1],
                                    param: 0
                                })
                            } else {
                                functs.push({
                                    name: "表达式",
                                    param: 0
                                })
                            }
                            take(1)
                            push(type.other)
                        } else if (peek(0) == ",") {
                            if (functs.length > 0) {
                                functs[functs.length - 1].param++
                            } else {
                                //函数参数错误
                                //getReport()
                                let position = document.positionAt(i)
                                let word = document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
                                if (word.length > 20) {
                                    word = word.slice(0, 15) + "..."
                                }
                                vscode.window.setStatusBarMessage(`✦ 着色错误 ▹ 第${position.line + 1}行, 第${position.character}字符处未定义：${word}`)
                                return builder.build()
                            }
                            take(1)
                            push(type.other)
                        } else if (peek(0) == ")") {
                            //函尾
                            functs.pop()
                            take(1)
                            push(type.other)
                        } else if (peek(0) == "禁" && peek(1) == "用" && peek(2).match(/\s/)) {
                            //禁用
                            take(2)
                            push(type.other)
                        } else if (!getBlock() && ((peek(0) == "设" && peek(1) == "置") || (peek(0) == "变" && peek(1) == "量") || (peek(0) == "规" && peek(1) == "则"))) {
                            //块
                            take(2)
                            push(type.other)
                        } else if (!getBlock() && (peek(0) == "子" && peek(1) == "程" && peek(2) == "序")) {
                            //块
                            take(3)
                            push(type.other)
                        } else if (getBlock() == "变量" && ((peek(0) == "全" && peek(1) == "局") || (peek(0) == "玩" && peek(1) == "家"))) {
                            //设置
                            take(2)
                            push(type.other)
                        } else if (getBlock() == "规则" && ((peek(0) == "事" && peek(1) == "件") || (peek(0) == "条" && peek(1) == "件") || (peek(0) == "动" && peek(1) == "作"))) {
                            //设置
                            take(2)
                            push(type.other)
                        } else if (getBlock() == "设置" && (match = matchToken(TOKEN.SETTING, 1, 16))) {
                            //设置
                            take(match.length)
                            push(type.other)
                        } else if (getBlock() == "事件" && (match = matchToken(TOKEN.EVENT, 1, 16))) {
                            //事件
                            take(match.length)
                            push(type.event)
                        } else if (getBlock() == "动作" && (match = matchToken(TOKEN.ACTION, 1, 16))) {
                            //动作
                            take(match.length)
                            push(type.action)
                        } else if ((getBlock() == "条件" || getBlock() == "动作") && functs.length > 0 && isConstant(getFunct()) && (match = matchToken(TOKEN.CONSTANT, 1, 16))) {
                            //常量
                            take(match.length)
                            push(type.constant)
                        } else if ((getBlock() == "条件" || getBlock() == "动作") && (match = matchToken(TOKEN.CONDITION, 1, 16))) {
                            //条件
                            take(match.length)
                            push(type.condition)
                        } else if (match = text.slice(i).match(/^([a-zA-Z_][a-zA-Z0-9_]*).*/)) {
                            //命名
                            take(match[1].length)
                            push(type.variable)
                        } else if (match = text.slice(i).match(/^((-?\d+)(.\d+|\d+)?).*/)) {
                            //数字
                            take(match[1].length)
                            push(type.number)
                        } else if (((peek(0) == "+" || peek(0) == "-" || peek(0) == "*" || peek(0) == "/" || peek(0) == "^" || peek(0) == "%" || peek(0) == "<" || peek(0) == ">" || peek(0) == "!" || peek(0) == "=") && peek(1) == "=") || (peek(0) == "|" && peek(1) == "|") || (peek(0) == "&" && peek(1) == "&")) {
                            //符号
                            take(2)
                            push(type.symbol)
                        } else if (peek(0) == ":" || peek(0) == ";" || peek(0) == "," || peek(0) == "." || peek(0) == "+" || peek(0) == "-" || peek(0) == "*" || peek(0) == "/" || peek(0) == "^" || peek(0) == "%" || peek(0) == "<" || peek(0) == ">" || peek(0) == "!" || peek(0) == "?" || peek(0) == "=" || peek(0) == "|" || peek(0) == "&") {
                            //符号
                            take(1)
                            push(type.symbol)
                        } else if (peek(0) == "[" || peek(0) == "]") {
                            //括号
                            take(1)
                            push(type.other)
                        } else {
                            //getReport()
                            let position = document.positionAt(i)
                            let word = document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
                            if (word.length > 20) {
                                word = word.slice(0, 15) + "..."
                            }
                            vscode.window.setStatusBarMessage(`✦ 着色错误 ▹ 第${position.line + 1}行, 第${position.character}字符处未定义：${word}`)
                            return builder.build()
                        }
                    }
                    //console.log(builder.build())
                    vscode.window.setStatusBarMessage("✧ Overwatch Workshop 语言支持")
                    return builder.build()
                } catch (error) {
                    console.log(error);
                }
            }
        }, legend)
    )

    /*
    //重命名 ?
    context.subscriptions.push(
        vscode.languages.registerRenameProvider("ow", {
            prepareRename(document, position, token) {
                //return document.getWordRangeAtPosition(position)
            },
            provideRenameEdits(document, position, newName, token) {
                //let edit = new vscode.WorkspaceEdit()
                //let range = document.getWordRangeAtPosition(position)
                //edit.replace(document.uri, range, newName)
                //return edit
            }
        })
    )

    //代码操作 (小灯泡) ?
    vscode.languages.registerCodeActionsProvider("ow", {
        provideCodeActions(document, range, context, token) {
            vscode.commands.executeCommand("vscode.executeCompletionItemProvider", document.uri, position)
            let action = new vscode.CodeAction("Help", vscode.CodeActionKind.Empty)
            action.command = {
                command: "vscode.executeCompletionItemProvider",
                title: "补全",
                tooltip: "在光标处激活补全列表。"
            };

            return [action]
        }
    })

    //调用层次结构
    vscode.languages.registerCallHierarchyProvider("ow", {

    })



    //代码镜头
    vscode.languages.registerCodeLensProvider("ow", {

    })

    //实现
    vscode.languages.registerImplementationProvider("ow", {

    })

    //镶嵌提示
    vscode.languages.registerInlayHintsProvider("ow", {

    })

    //内联代码补全
    vscode.languages.registerInlineCompletionItemProvider("ow", {
        provideInlineCompletionItems(document, position, context, token) {

        }
    })

    //内联值
    vscode.languages.registerInlineValuesProvider("ow", {

    })

    //已链接的编辑范围
    vscode.languages.registerLinkedEditingRangeProvider("ow", {

    })

    //类型格式化编辑
    vscode.languages.registerOnTypeFormattingEditProvider("ow", {

    })

    //引用
    vscode.languages.registerReferenceProvider("ow", {

    })

    //选择范围
    vscode.languages.registerSelectionRangeProvider("ow", {

    })

    //类型定义
    vscode.languages.registerTypeDefinitionProvider("ow", {
        provideTypeDefinition(document, position, token) {
        }
    })

    //类型层次结构
    vscode.languages.registerTypeHierarchyProvider("ow", {

    })

    //工作区
    vscode.languages.registerWorkspaceSymbolProvider("ow", {

    })

    //声明
    vscode.languages.registerDeclarationProvider("ow", {
        provideDeclaration(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const text = document.getText(range);
        }
    })

    //文档拖拽编辑
    vscode.languages.registerDocumentDropEditProvider("ow", {

    })

    //文档链接
    vscode.languages.registerDocumentLinkProvider("ow", {

    })

    //文档范围格式化
    vscode.languages.registerDocumentRangeFormattingEditProvider("ow", {
        provideDocumentRangeFormattingEdits() {

        }
    })

    //文档范围语义标记
    vscode.languages.registerDocumentRangeSemanticTokensProvider("ow", {
        provideDocumentRangeSemanticTokens() {

        }
    })

    //可评估表达式
    vscode.languages.registerEvaluatableExpressionProvider("ow", {
        provideEvaluatableExpression() {

        }
    })


}

function getCompletionItems() {
    for (i in RULE.CONDITION) {
        let item = new vscode.CompletionItem()
        item.label = i

        //名称
        item.documentation = new vscode.MarkdownString(`**${i}**`)
        item.documentation.isTrusted = true
        item.documentation.supportHtml = true
        item.insertText = new vscode.SnippetString(`${i}`)

        //参数
        if (RULE.CONDITION[i].hasOwnProperty("参数")) {
            item.documentation.appendMarkdown(` **(** `)
            item.insertText.appendText(`(`)
            let n = 0
            for (j in RULE.CONDITION[i].参数) {
                item.documentation.appendMarkdown(`\`${RULE.CONDITION[i].参数[j].默认}\``)
                item.insertText.appendPlaceholder(`${RULE.CONDITION[i].参数[j].默认}`)
                n++
                if (n < Object.keys(RULE.CONDITION[i].参数).length) {
                    item.documentation.appendMarkdown(`**,** `)
                    item.insertText.appendText(`, `)
                }
            }
            item.documentation.appendMarkdown(` **)**`)
            item.insertText.appendText(`)`)
        }

        //标签
        if (RULE.CONDITION[i].标签[0] == "事件" || RULE.CONDITION[i].标签[0] == "行动") {
            item.documentation.appendMarkdown(` **;**`)
            item.insertText.appendText(`;`)
        }
        item.documentation.appendMarkdown(`\n\n`)
        for (j in RULE.CONDITION[i].标签) {
            item.documentation.appendMarkdown(`\`\`${RULE.CONDITION[i].标签[j]}\`\` `)
        }

        //提示
        item.documentation.appendMarkdown(`\n\n${RULE.CONDITION[i].提示}`)

        //返回
        if (RULE.CONDITION[i].hasOwnProperty("返回")) {
            item.documentation.appendMarkdown(`\n\n***<span style="color:#c50;">⬘</span> 返回***\n\n`)
            for (j in RULE.CONDITION[i].返回) {
                item.documentation.appendMarkdown(`\`${RULE.CONDITION[i].返回[j]}\` `)
            }
        }

        //参数
        if (RULE.CONDITION[i].hasOwnProperty("参数")) {
            item.documentation.appendMarkdown(`\n\n***<span style="color:#0ac;">⬘</span> 参数***\n\n`)
            let n = 0
            for (j in RULE.CONDITION[i].参数) {
                item.documentation.appendMarkdown(`\`${n}\` \`${j}\` - ${RULE.CONDITION[i].参数[j].提示}\n\n`)
                n++
            }
        }

        switch (RULE.CONDITION[i].标签[0]) {
            case "事件":
                item.kind = vscode.CompletionItemKind.Event
                completionEvents.push(item)
                break

            case "条件":
                item.kind = vscode.CompletionItemKind.Function
                completionConditions.push(item)
                break

            case "行动":
                item.kind = vscode.CompletionItemKind.Method
                completionActions.push(item)
                break

            case "字符":
                item.kind = vscode.CompletionItemKind.Text
                completionStrings.push(item)
                break

            case "比较":
                item.kind = vscode.CompletionItemKind.Operator
                break

            case "颜色":
                item.kind = vscode.CompletionItemKind.Color
                completionColors.push(item)
                break

            case "英雄":
                item.kind = vscode.CompletionItemKind.Constant
                completionHeroes.push(item)
                break

            case "地图":
                item.kind = vscode.CompletionItemKind.Constant
                completionMaps.push(item)
                break

            case "变量":
                item.kind = vscode.CompletionItemKind.Variable
                break

            default:
                item.kind = vscode.CompletionItemKind.Constant
                break
        }
        completionItems.push(item)
    }
    */
}