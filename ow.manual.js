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
        if (i % 4 === 0) {
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
    <table style="min-width: 500px;">
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
    <table style="min-width: 300px;">
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
            return `<td style="text-align: center;"><br><img src="${imageSrc}" width="35" height="auto"><br><br>${icons[imageNumber - 1]}</td>`
        }).join("")
        return `<tr>${imageCells}</tr>`
    })
    const tableHtml = `<table style="min-width: 400px;">${tableRows.join("")}</table>`
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
    <table style="min-width: 350px;">
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'doomfist', 'icon.png'))}" width="50" height="50"><br>末日铁拳<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'dva', 'icon.png'))}" width="50" height="50"><br>D.Va<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'wrecking-ball', 'icon.png'))}" width="50" height="50"><br>破坏球<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'junker-queen', 'icon.png'))}" width="50" height="50"><br>渣客女王<br></td>
    </tr>
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'orisa', 'icon.png'))}" width="50" height="50"><br>奥丽莎<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'reinhardt', 'icon.png'))}" width="50" height="50"><br>莱因哈特<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'roadhog', 'icon.png'))}" width="50" height="50"><br>路霸<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'sigma', 'icon.png'))}" width="50" height="50"><br>西格玛<br></td>
    </tr>
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'winston', 'icon.png'))}" width="50" height="50"><br>温斯顿<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'zarya', 'icon.png'))}" width="50" height="50"><br>查莉娅<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'tank', 'ramattra', 'icon.png'))}" width="50" height="50"><br>拉玛刹<br></td>
    </tr>
    </table>
    
    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', `${themeUri}damage.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;输出</h4>
    <table style="min-width: 350px;">
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'ashe', 'icon.png'))}" width="50" height="50"><br>艾什<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'bastion', 'icon.png'))}" width="50" height="50"><br>堡垒<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'echo', 'icon.png'))}" width="50" height="50"><br>回声<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'genji', 'icon.png'))}" width="50" height="50"><br>源氏<br></td>
    </tr>
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'hanzo', 'icon.png'))}" width="50" height="50"><br>半藏<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'junkrat', 'icon.png'))}" width="50" height="50"><br>狂鼠<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'cassidy', 'icon.png'))}" width="50" height="50"><br>卡西迪<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'mei', 'icon.png'))}" width="50" height="50"><br>美<br></td>
    </tr>
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'pharah', 'icon.png'))}" width="50" height="50"><br>法老之鹰<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'reaper', 'icon.png'))}" width="50" height="50"><br>死神<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sojourn', 'icon.png'))}" width="50" height="50"><br>索杰恩<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'soldier-76', 'icon.png'))}" width="50" height="50"><br>士兵：76<br></td>
    </tr>
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'sombra', 'icon.png'))}" width="50" height="50"><br>黑影<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'symmetra', 'icon.png'))}" width="50" height="50"><br>秩序之光<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'torbjorn', 'icon.png'))}" width="50" height="50"><br>托比昂<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'tracer', 'icon.png'))}" width="50" height="50"><br>猎空<br></td>
    </tr>
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'damage', 'widowmaker', 'icon.png'))}" width="50" height="50"><br>黑百合<br></td>
    </tr>
    </table>
    
    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', `${themeUri}support.png`))}" width="auto" height="30" style="vertical-align: middle;">&nbsp;支援</h4>
    <table style="min-width: 350px;">
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'ana', 'icon.png'))}" width="50" height="50"><br>安娜<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'baptiste', 'icon.png'))}" width="50" height="50"><br>巴蒂斯特<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'brigitte', 'icon.png'))}" width="50" height="50"><br>布丽吉塔<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'kiriko', 'icon.png'))}" width="50" height="50"><br>雾子<br></td>
    </tr>
    <tr>
    <td style="text-align: center"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'lucio', 'icon.png'))}" width="50" height="50"><br>卢西奥<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'mercy', 'icon.png'))}" width="50" height="50"><br>天使<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'moira', 'icon.png'))}" width="50" height="50"><br>莫伊拉<br></td>
    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'images', 'ow', 'hero', 'support', 'zenyatta', 'icon.png'))}" width="50" height="50"><br>禅雅塔<br></td>
    </tr>
    <tr>
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
    <table style="min-width: 800px;">
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
    <table style="min-width: 800px;">
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
    <table style="min-width: 800px;">
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