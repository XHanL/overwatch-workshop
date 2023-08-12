const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const MODEL = require("./ow.model.js");

//主函数
function activate(context) {
  //初始化模型
  MODEL.buildHovers(context);
  //MODEL.initModelLightHover(context)
  //MODEL.initModelDarkCompletion(context)
  //MODEL.initModelLightCompletion(context)

  //注册能力
  context.subscriptions.push(
    //建议
    vscode.commands.registerCommand("ow.command.suggest", () => {
      vscode.commands.executeCommand("editor.action.triggerSuggest");
      //vscode.commands.executeCommand('editor.action.triggerParameterHints')
    }),

    //折叠
    vscode.languages.registerFoldingRangeProvider("ow", {
      provideFoldingRanges(document) {
        let foldingRanges = [];
        let braces = [];
        let controls = [];
        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const text = line.text.trim();
          if (text === "") {
            continue;
          } else if (text.startsWith("{")) {
            braces.push(line.lineNumber - 1);
          } else if (text.endsWith("}")) {
            foldingRanges.push(
              new vscode.FoldingRange(braces.pop(), line.lineNumber)
            );
          } else if (text.match(/^(For 全局变量|For 玩家变量|While|If)/)) {
            controls.push(line.lineNumber);
          } else if (text.match(/^(Else If|Else)/)) {
            foldingRanges.push(
              new vscode.FoldingRange(controls.pop(), line.lineNumber - 1)
            );
            controls.push(line.lineNumber);
          } else if (text.match(/^End/)) {
            foldingRanges.push(
              new vscode.FoldingRange(controls.pop(), line.lineNumber - 1)
            );
          }
        }
        return foldingRanges;
      },
    }),

    //大纲
    vscode.languages.registerDocumentSymbolProvider("ow", {
      provideDocumentSymbols(document) {
        let documentSymbols = [];

        let i = 0;
        while (i < document.lineCount) {
          const line = document.lineAt(i);
          const lineText = line.text.trim();
          if (lineText.startsWith("{")) {
            documentSymbols.push(getDocumentSymbol());
          }
          i++;
        }

        function getDocumentSymbol() {
          let symbol = undefined;
          while (i < document.lineCount) {
            const line = document.lineAt(i);
            const lineText = line.text.trim();
            if (lineText.startsWith("{")) {
              const prevLine = document.lineAt(i - 1);
              const prevLineText = prevLine.text.trim();
              if (symbol === undefined) {
                if (prevLineText === "动作") {
                  symbol = [
                    prevLineText,
                    "",
                    vscode.SymbolKind.Method,
                    prevLine.range.start,
                  ];
                } else if (prevLineText === "事件") {
                  const nextLine = document.lineAt(i + 1);
                  const nextLineText = nextLine.text.trim().replace(";", "");
                  symbol = [
                    prevLineText,
                    nextLineText,
                    vscode.SymbolKind.Event,
                    prevLine.range.start,
                  ];
                } else if (prevLineText === "条件") {
                  symbol = [
                    prevLineText,
                    "",
                    vscode.SymbolKind.Boolean,
                    prevLine.range.start,
                  ];
                } else if (prevLineText === "变量") {
                  symbol = [
                    prevLineText,
                    "",
                    vscode.SymbolKind.Variable,
                    prevLine.range.start,
                  ];
                } else if (prevLineText === "子程序") {
                  symbol = [
                    prevLineText,
                    "",
                    vscode.SymbolKind.Function,
                    prevLine.range.start,
                  ];
                } else if (
                  (match = prevLineText.match(/^(禁用)?\s*规则\s*\("(.*)"\)$/))
                ) {
                  if (match[1] === "禁用") {
                    symbol = [
                      "规则",
                      `${match[2]} [禁用]`,
                      vscode.SymbolKind.Module,
                      prevLine.range.start,
                      [],
                    ];
                  } else {
                    symbol = [
                      "规则",
                      match[2],
                      vscode.SymbolKind.Module,
                      prevLine.range.start,
                      [],
                    ];
                  }
                } else {
                  symbol = [
                    prevLineText,
                    "",
                    vscode.SymbolKind.Property,
                    prevLine.range.start,
                    [],
                  ];
                }
              } else {
                symbol[4].push(getDocumentSymbol());
              }
            } else if (lineText.endsWith("}")) {
              const documentSymbol = new vscode.DocumentSymbol(
                symbol[0],
                symbol[1],
                symbol[2],
                new vscode.Range(symbol[3], line.range.end),
                new vscode.Range(symbol[3], line.range.end)
              );
              documentSymbol.children = symbol[4];
              return documentSymbol;
            }
            i++;
          }
        }
        return documentSymbols;
      },
    }),

    //取色
    vscode.languages.registerColorProvider("ow", {
      provideDocumentColors(document) {
        let colors = [];
        const pattern =
          /自定义颜色\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          while ((match = pattern.exec(line.text))) {
            colors.push(
              new vscode.ColorInformation(
                new vscode.Range(
                  i,
                  match.index,
                  i,
                  match.index + match[0].length
                ),
                new vscode.Color(
                  match[1] / 255,
                  match[2] / 255,
                  match[3] / 255,
                  match[4] / 255
                )
              )
            );
          }
        }
        return colors;
      },
      provideColorPresentations(color) {
        const newColor =
          "自定义颜色(" +
          Math.floor(color.red * 255) +
          ", " +
          Math.floor(color.green * 255) +
          ", " +
          Math.floor(color.blue * 255) +
          ", " +
          Math.floor(color.alpha * 255) +
          ")";
        return [new vscode.ColorPresentation(newColor)];
      },
    }),

    //悬停
    vscode.languages.registerHoverProvider("ow", {
      provideHover(document, position) {
        const hoverRange = document.getWordRangeAtPosition(position);
        if (!hoverRange) {
          return;
        }
        const hoverText = document.getText(hoverRange);
        console.log(hoverText);
        let rightBracesCount = 0;
        for (let i = position.line; i >= 0; i--) {
          const line = document.lineAt(i);
          const lineText = line.text.trim();
          if (lineText.startsWith("{")) {
            if (rightBracesCount > 0) {
              rightBracesCount--;
            } else {
              const prevLine = document.lineAt(i - 1);
              const prevLineText = prevLine.text.trim();
              const theme =
                vscode.window.activeColorTheme.kind ===
                vscode.ColorThemeKind.Dark
                  ? "暗色"
                  : "亮色";
              if (prevLineText === "事件") {
                if (MODEL.规则.事件.选项.hasOwnProperty(hoverText)) {
                  return MODEL.规则.事件.选项[hoverText][`${theme}悬停`];
                }
                if (MODEL.规则.事件.队伍.hasOwnProperty(hoverText)) {
                  return MODEL.规则.事件.队伍[hoverText][`${theme}悬停`];
                }
                if (MODEL.规则.事件.玩家.hasOwnProperty(hoverText)) {
                  return MODEL.规则.事件.玩家[hoverText][`${theme}悬停`];
                }
                if ((match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/))) {
                  return getCustomNameHover();
                }
              } else if (prevLineText === "条件") {
                if (MODEL.规则.条件.hasOwnProperty(hoverText)) {
                  return MODEL.规则.条件[hoverText][`${theme}悬停`];
                }
                for (i in MODEL.常量) {
                  if (MODEL.常量[i].hasOwnProperty(hoverText)) {
                    return MODEL.常量[i][hoverText][`${theme}悬停`];
                  }
                }
                if ((match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/))) {
                  return getCustomNameHover();
                }
              } else if (prevLineText === "动作") {
                if (MODEL.规则.动作.hasOwnProperty(hoverText)) {
                  return MODEL.规则.动作[hoverText][`${theme}悬停`];
                }
                if (MODEL.规则.条件.hasOwnProperty(hoverText)) {
                  return MODEL.规则.条件[hoverText][`${theme}悬停`];
                }
                for (i in MODEL.常量) {
                  if (MODEL.常量[i].hasOwnProperty(hoverText)) {
                    return MODEL.常量[i][hoverText][`${theme}悬停`];
                  }
                }
                if ((match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/))) {
                  return getCustomNameHover();
                }
              } else {
                return;
              }
            }
          } else if (lineText.endsWith("}")) {
            rightBracesCount++;
          }
        }

        function getCustomNameHover() {
          const customs = getCustoms(document);
          let prefix =
            document.offsetAt(document.getWordRangeAtPosition(position).start) -
            1;
          let prefixText = document.getText()[prefix];
          if (prefixText === ".") {
            prefixText = document.getText(
              document.getWordRangeAtPosition(document.positionAt(prefix - 1))
            );
            if (prefixText === "全局") {
              for (i in customs.全局变量) {
                if (hoverText === customs.全局变量[i]) {
                  return MODEL.buildHover(context, hoverText, ["全局变量", i]);
                }
              }
            } else {
              for (i in customs.玩家变量) {
                if (hoverText === customs.玩家变量[i]) {
                  return MODEL.buildHover(context, hoverText, ["玩家变量", i]);
                }
              }
            }
          } else {
            for (i in customs.子程序) {
              if (hoverText === customs.子程序[i]) {
                return MODEL.buildHover(context, hoverText, ["子程序", i]);
              }
            }
          }
        }
      },
    }),

    //补全
    vscode.languages.registerCompletionItemProvider(
      "ow",
      {
        provideCompletionItems(document, position, context) {
          const completionText = document.getText(
            document.getWordRangeAtPosition(position)
          );
          let rightBracesCount = 0;
          let semicolonCount = 0;
          for (let i = position.line; i >= 0; i--) {
            const line = document.lineAt(i);
            const lineText = line.text.trim();
            if (lineText.startsWith("{")) {
              if (rightBracesCount > 0) {
                rightBracesCount--;
              } else {
                const prevLine = document.lineAt(i - 1);
                const prevLineText = prevLine.text.trim();
                const theme =
                  vscode.window.activeColorTheme.kind ===
                  vscode.ColorThemeKind.Dark
                    ? "暗色"
                    : "亮色";
                if (prevLineText === "事件") {
                  const nextLine = document.lineAt(i + 1);
                  const nextLineText = nextLine.text.trim();
                  if (nextLineText === "子程序;") {
                    if (semicolonCount === 0) {
                      return MODEL.规则.事件.选项[`${theme}补全`];
                    } else {
                      let completionItems = [];
                      const customs = getCustoms(document);
                      for (const i in customs.子程序) {
                        const item = new vscode.CompletionItem(
                          i.padStart(3, "0") + ": " + customs.子程序[i],
                          vscode.CompletionItemKind.Variable
                        );
                        item.documentation = new vscode.MarkdownString();
                        item.documentation.appendMarkdown(
                          `***${customs.子程序[i]}***\n\n\`子程序\`&nbsp;\`${i}\` `
                        );
                        item.filterText = (
                          i.padStart(3, "0") + customs.子程序[i]
                        )
                          .split("")
                          .join(" ");
                        item.insertText = customs.子程序[i];
                        completionItems.push(item);
                      }
                      return completionItems;
                    }
                  } else {
                    if (semicolonCount === 0) {
                      return MODEL.规则.事件.选项[`${theme}补全`];
                    } else if (semicolonCount === 1) {
                      return MODEL.规则.事件.队伍[`${theme}补全`];
                    } else if (semicolonCount === 2) {
                      return MODEL.规则.事件.玩家[`${theme}补全`];
                    }
                  }
                } else if (prevLineText === "条件") {
                  getPrefix();
                } else if (prevLineText === "动作") {
                  // 匹配 ACTION;
                  // 匹配 ACTION(0, 0);

                  // 匹配 COND
                  // 匹配 COND(0, 0)

                  // 匹配 全局.A / 事件玩家.B;

                  // 匹配

                  if (
                    (wordRange = document.getWordRangeAtPosition(
                      position,
                      /([^\s{;]*)\s*=\s*(.*)\s*;/g
                    ))
                  ) {
                    console.log(document.getText(wordRange));
                  } else if (
                    (wordRange = document.getWordRangeAtPosition(
                      position,
                      /([^\s{;]*)\s*(?:\((?:(.*)(?:,\s*)?)*\))?\s*;/g
                    ))
                  ) {
                    console.log(document.getText(wordRange));
                  }
                  //变量
                }
              }
            } else if (lineText.endsWith("}")) {
              rightBracesCount++;
            } else if (lineText.endsWith(";")) {
              semicolonCount++;
            }
          }

          let item = new vscode.CompletionItem("无建议");
          item.insertText = "";
          return [item];
        },
      },
      "(",
      ",",
      ".",
      " "
    ),

    //参数
    vscode.languages.registerSignatureHelpProvider(
      "ow",
      {
        provideSignatureHelp(document, position, token, context) {},
      },
      "(",
      ",",
      " "
    ),

    //手册
    vscode.window.registerWebviewViewProvider("ow.view.manual", {
      resolveWebviewView(webviewView) {
        const theme =
          vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        const extensionUri = vscode.Uri.file(
          path.join(context.extensionPath, "", path.sep)
        );
        const themeUri = theme ? "" : "gray/";
        const styleUri = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(
            extensionUri,
            "views",
            theme ? `dark.css` : `light.css`
          )
        );
        const scriptUri = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(extensionUri, "views", "script.js")
        );

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
                    </html>`;
        }

        function getStringTableHtml() {
          const strings = Object.getOwnPropertyNames(MODEL.常量.字符串)
            .map((v, i) => {
              if (i % 3 === 0) {
                return `</tr><tr><td style="text-align: center;">${v}</td>`;
              } else {
                return `<td style="text-align: center;">${v}</td>`;
              }
            })
            .join("");
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
                    </html>`;
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
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "white.png"
                      )
                    )}" width="35" height="auto"><br>白色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "yellow.png"
                      )
                    )}" width="35" height="auto"><br>黄色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "green.png"
                      )
                    )}" width="35" height="auto"><br>绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "violet.png"
                      )
                    )}" width="35" height="auto"><br>紫色<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "red.png"
                      )
                    )}" width="35" height="auto"><br>红色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "blue.png"
                      )
                    )}" width="35" height="auto"><br>蓝色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "aqua.png"
                      )
                    )}" width="35" height="auto"><br>水绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "orange.png"
                      )
                    )}" width="35" height="auto"><br>橙色<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "sky_blue.png"
                      )
                    )}" width="35" height="auto"><br>天蓝色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "turquoise.png"
                      )
                    )}" width="35" height="auto"><br>青绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "lime_green.png"
                      )
                    )}" width="35" height="auto"><br>灰绿色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "purple.png"
                      )
                    )}" width="35" height="auto"><br>亮紫色<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "black.png"
                      )
                    )}" width="35" height="auto"><br>黑色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "rose.png"
                      )
                    )}" width="35" height="auto"><br>玫红<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "gray.png"
                      )
                    )}" width="35" height="auto"><br>灰色<br></td>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "team1.png"
                      )
                    )}" width="35" height="auto"><br>队伍1<br></td>
                    </tr>
                    <tr>
                    <td style="text-align: center; font-weight: 500;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "color",
                        "team2.png"
                      )
                    )}" width="35" height="auto"><br>队伍2<br></td>
                    </tr>
                    </table>
                    </body>
                    </html>`;
        }

        function getIconTableHtml() {
          const numCols = 4;
          const numRows = Math.ceil(36 / numCols);
          const tableRows = Array(numRows)
            .fill()
            .map((_, rowIndex) => {
              const startImageIndex = rowIndex * numCols + 1;
              const endImageIndex = Math.min(startImageIndex + numCols - 1, 36);
              const imageCells = Array(endImageIndex - startImageIndex + 1)
                .fill()
                .map((_, colIndex) => {
                  const imageNumber = startImageIndex + colIndex;
                  const imageSrc = webviewView.webview.asWebviewUri(
                    vscode.Uri.joinPath(
                      extensionUri,
                      "images",
                      "ow",
                      "icon",
                      `${themeUri}${imageNumber}.png`
                    )
                  );
                  const icons = Object.getOwnPropertyNames(MODEL.常量.图标);
                  return `<td style="text-align: center; font-weight: 500;"><img src="${imageSrc}" width="30" height="30"><br>${
                    icons[imageNumber - 1]
                  }</td>`;
                })
                .join("");
              return `<tr>${imageCells}</tr>`;
            });
          const tableHtml = `<table style="min-width: 300px; max-width: 400px;">${tableRows.join(
            ""
          )}</table>`;
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
                    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        `${themeUri}tank.png`
                      )
                    )}" width="auto" height="30" style="vertical-align: middle;">&nbsp;重装</h4>
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
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "doomfist",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>末日铁拳<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "doomfist",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "doomfist",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "doomfist",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "doomfist",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "doomfist",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "dva",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>D.Va<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "dva",
                        "weapon1.png"
                      )
                    )}" width="60" height="auto"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "dva",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "dva",
                        `${themeUri}ultimate1.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "dva",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "dva",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "wrecking-ball",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>破坏球<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "wrecking-ball",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "wrecking-ball",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "wrecking-ball",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "wrecking-ball",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "wrecking-ball",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "wrecking-ball",
                        `${themeUri}crouch.png`
                      )
                    )}" width="30" height="30"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "junker-queen",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>渣客女王<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "junker-queen",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "junker-queen",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "junker-queen",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "junker-queen",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "junker-queen",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "orisa",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>奥丽莎<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "orisa",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "orisa",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "orisa",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "orisa",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "orisa",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "reinhardt",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>莱因哈特<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "reinhardt",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "reinhardt",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "reinhardt",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "reinhardt",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "reinhardt",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "roadhog",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>路霸<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "roadhog",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "roadhog",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "roadhog",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "roadhog",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "roadhog",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "sigma",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>西格玛<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "sigma",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "sigma",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "sigma",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "sigma",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "sigma",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "winston",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>温斯顿<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "winston",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "winston",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "winston",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "winston",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "winston",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "zarya",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>查莉娅<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "zarya",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "zarya",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "zarya",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "zarya",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "zarya",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "ramattra",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>拉玛刹<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "ramattra",
                        "weapon1.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "ramattra",
                        `${themeUri}secondaryfire1.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "ramattra",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "ramattra",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "tank",
                        "ramattra",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        `${themeUri}damage.png`
                      )
                    )}" width="auto" height="30" style="vertical-align: middle;">&nbsp;输出</h4>
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
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "ashe",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>艾什<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "ashe",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "ashe",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "ashe",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "ashe",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "bastion",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>堡垒<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "bastion",
                        "weapon1.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "bastion",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "bastion",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "bastion",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "echo",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>回声<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "echo",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "echo",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "echo",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "echo",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "echo",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "echo",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "genji",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>源氏<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "genji",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "genji",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "genji",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "genji",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "genji",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "genji",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "hanzo",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>半藏<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "hanzo",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "hanzo",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "hanzo",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "hanzo",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "hanzo",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "junkrat",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>狂鼠<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "junkrat",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "junkrat",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "junkrat",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "junkrat",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "cassidy",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>卡西迪<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "cassidy",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "cassidy",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "cassidy",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "cassidy",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "cassidy",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "mei",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>美<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "mei",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "mei",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "mei",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "mei",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "mei",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "pharah",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>法老之鹰<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "pharah",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "pharah",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "pharah",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "pharah",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "pharah",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "reaper",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>死神<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "reaper",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "reaper",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "reaper",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "reaper",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sojourn",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>索杰恩<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sojourn",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sojourn",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sojourn",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sojourn",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sojourn",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "soldier-76",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>士兵：76<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "soldier-76",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "soldier-76",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "soldier-76",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "soldier-76",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "soldier-76",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sombra",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>黑影<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sombra",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sombra",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sombra",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sombra",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "sombra",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "symmetra",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>秩序之光<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "symmetra",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "symmetra",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "symmetra",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "symmetra",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "symmetra",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "torbjorn",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>托比昂<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "torbjorn",
                        "weapon1.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "torbjorn",
                        `weapon1.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "torbjorn",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "torbjorn",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "torbjorn",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "tracer",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>猎空<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "tracer",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "tracer",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "tracer",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "tracer",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "widowmaker",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>黑百合<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "widowmaker",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "widowmaker",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "widowmaker",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "damage",
                        "widowmaker",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    <h4 style="display: flex; align-items: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        `${themeUri}support.png`
                      )
                    )}" width="auto" height="30" style="vertical-align: middle;">&nbsp;支援</h4>
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
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "ana",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>安娜<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "ana",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "ana",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "ana",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "ana",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "baptiste",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>巴蒂斯特<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "baptiste",
                        "weapon1.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "baptiste",
                        `weapon2.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "baptiste",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "baptiste",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "baptiste",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "baptiste",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "brigitte",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>布丽吉塔<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "brigitte",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "brigitte",
                        `${themeUri}secondaryfire1.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "brigitte",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "brigitte",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "brigitte",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "kiriko",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>雾子<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "kiriko",
                        "weapon1.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "kiriko",
                        `weapon2.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "kiriko",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "kiriko",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "kiriko",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "kiriko",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lucio",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>卢西奥<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lucio",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lucio",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lucio",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lucio",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lucio",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lucio",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "mercy",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>天使<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "mercy",
                        "weapon1.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "mercy",
                        `weapon1.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "mercy",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "mercy",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "mercy",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "mercy",
                        `${themeUri}passive.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "moira",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>莫伊拉<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "moira",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "moira",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "moira",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "moira",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "moira",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "zenyatta",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>禅雅塔<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "zenyatta",
                        "weapon.png"
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "zenyatta",
                        `weapon.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "zenyatta",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "zenyatta",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "zenyatta",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lifeweaver",
                        "icon.png"
                      )
                    )}" width="auto" height="50"><br>生命之梭<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lifeweaver",
                        "weapon1.png"
                      )
                    )}" width="60" height="auto"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lifeweaver",
                        `${themeUri}secondaryfire.png`
                      )
                    )}" width="auto" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lifeweaver",
                        `${themeUri}ultimate.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lifeweaver",
                        `${themeUri}ability1.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "support",
                        "lifeweaver",
                        `${themeUri}ability2.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        `${themeUri}melee.png`
                      )
                    )}" width="30" height="30"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    </body>

                    </html>`;
        }

        webviewView.webview.html = getHomeHtml();
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [extensionUri],
        };
        webviewView.webview.onDidReceiveMessage((message) => {
          switch (message) {
            case "Home":
              webviewView.webview.html = getHomeHtml();
              return;
            case "String":
              webviewView.webview.html = getStringTableHtml();
              return;
            case "Color":
              webviewView.webview.html = getColorTableHtml();
              return;
            case "Icon":
              webviewView.webview.html = getIconTableHtml();
              return;
            default:
              console.log("Unknown command: " + message.command);
              return;
          }
        });
      },
    })
  );
}

//扩展，全局变量，玩家变量，和子程序列表
function getCustoms(document) {
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
}

function getPrefix() {
  try {
    let type = 0;
    let rightBracesCount = 0;
    let rightBracketsCount = 0;
    let rightParenthesesCount = 0;
    let commasCount = 0;
    for (let i = document.offsetAt(position) - 1; i >= 0; i--) {
      let wordRange = document.getWordRangeAtPosition(
        document.positionAt(i),
        type > 0 ? undefined : /{|}|\[\(|\)|;|,/
      );
      if (!wordRange) {
        continue;
      }
      const word = document.getText(wordRange);
      if (type == 1) {
        console.log(`单个条件/动作 ${word} 参数索引 ${commasCount}`);
        return;
      }
      console.log(`${word}`);
      if (word == "{") {
        if (rightParenthesesCount > 0) {
          rightParenthesesCount--;
        } else {
          console.log(`条件/动作列表`);
          return;
        }
      } else if (word == "}") {
        rightBracesCount++;
      } else if (word == "(") {
        if (rightParenthesesCount > 0) {
          rightParenthesesCount--;
        } else {
          // 参数列表 等待扫描函数名
          type = 1;
        }
      } else if (word == ")") {
        rightParenthesesCount++;
      } else if (word == ";") {
        // 条件/动作列表 直接返回
        console.log(`条件/动作列表`);
        return;
      } else if (word == "[") {
        // 条件列表 直接返回
        console.log(`条件列表`);
        return;
      } else if (word == ",") {
        if (rightParenthesesCount == 0) {
          commasCount++;
        }
      }
      i = document.offsetAt(wordRange.start);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  activate,
};

//工具：正则排序
function sortAndFilterChineseKeyword(s) {
  const str = s.split("|");
  const set = new Set(str);
  let arr = Array.from(set).sort((b, a) => a.localeCompare(b, "zh-Hans-CN"));
  console.log(arr.join("|"));
}

//工具：正则字符串
function getModelString() {
  let str = "";
  for (i in MODEL.规则.动作) {
    str += "|" + i;
  }
  sortAndFilterChineseKeyword(str.slice(1));
}

//工具：对象转数组
function convertObjectToArray() {
  try {
    const input = MODEL.规则.条件;

    const transformedOutput = {};

    for (const key in input) {
      const item = input[key];
      if ("参数" in item) {
        transformedOutput[key] = {
          ...item,
          参数: Object.entries(item["参数"]).map(([参数Key, 参数Object]) => ({
            ...参数Object,
            标签: 参数Key,
          })),
        };
      } else {
        transformedOutput[key] = item;
      }
    }

    const outputString = JSON.stringify(transformedOutput, null, 2);

    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}
