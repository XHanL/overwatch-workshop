const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

module.exports = {
    activate
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

function activate(context) {
    try {
        context.subscriptions.push(
            //高亮
            vscode.languages.registerDocumentSemanticTokensProvider("ow", {
                provideDocumentSemanticTokens(document, token) {
                    return generateSemanticTokens(document)
                }
            }, new vscode.SemanticTokensLegend(['comment', 'string', 'number', 'variable', `symbol`, `action`, 'condition', `constant`, 'event', 'other'])),
    
            //折叠
            vscode.languages.registerFoldingRangeProvider("ow", {
                provideFoldingRanges(document) {
    
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
    
            //大纲
            context.subscriptions.push(
                vscode.languages.registerDocumentSymbolProvider("ow", {
                    provideDocumentSymbols(document) {
                        
                    }
                })
            ),
    
            //悬停
            vscode.languages.registerHoverProvider("ow", {
                provideHover(document, position) {
                    //获取悬停词
                    let text = document.getText(document.getWordRangeAtPosition(position))
                    return new vscode.Hover(text)
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
                        const strings = Object.getOwnPropertyNames(CONSTS.STRING).map((v, i) => {
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
    } catch (error) {
        console.log(error)
    }
}

function generateSemanticTokens(document) {
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
            let position = document.positionAt(i)
            let word = document.getText(document.getWordRangeAtPosition(document.positionAt(i)))
            if (word.length > 20) {
                word = word.slice(0, 15) + "..."
            }
            vscode.window.setStatusBarMessage(`✦ 着色错误 ▹ 第${position.line + 1}行, 第${position.character}字符处未定义：${word}`)
            console.log(builder.build())
            return builder.build()
        }
        vscode.window.setStatusBarMessage("✧ Overwatch Workshop 语言支持")
        console.log(builder.build())
        return builder.build()
    }
}