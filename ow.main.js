const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

//静态数据模型
const MODEL = require("./ow.model.js");

//辅助函数集合
const UTIL = require("./ow.utiliy.js");

//主函数
function activate(context) {
  //初始化路径
  const PATH = context.extensionPath;

  //初始化模型
  MODEL.buildStaticModels(PATH);

  //初始化能力
  context.subscriptions.push(
    //主动建议能力
    vscode.commands.registerCommand("ow.command.suggest", () => {
      vscode.commands.executeCommand("editor.action.triggerSuggest");
      vscode.commands.executeCommand("editor.action.triggerParameterHints");
    }),

    //折叠能力
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

    //大纲能力
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
                  let nextLineText = nextLine.text.trim();
                  if ((match = nextLineText.match(/^([^;]*);.*$/))) {
                    nextLineText = match[1];
                  }
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

    //取色能力
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

    //悬停能力
    vscode.languages.registerHoverProvider("ow", {
      provideHover(document, position) {
        const hoverRange = document.getWordRangeAtPosition(position);
        if (!hoverRange) {
          return;
        }
        const hoverText = document.getText(hoverRange);
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
                  ? 0
                  : 1;
              if (prevLineText === "事件") {
                if (MODEL.规则.事件.选项.hasOwnProperty(hoverText)) {
                  return MODEL.规则.事件.选项[hoverText].悬停;
                }
                if (MODEL.规则.事件.队伍.hasOwnProperty(hoverText)) {
                  return MODEL.规则.事件.队伍[hoverText].悬停;
                }
                if (MODEL.规则.事件.玩家.hasOwnProperty(hoverText)) {
                  if (Array.isArray(MODEL.规则.事件.玩家[hoverText].悬停)) {
                    return MODEL.规则.事件.玩家[hoverText].悬停[theme];
                  }
                  return MODEL.规则.事件.玩家[hoverText].悬停;
                }
                if ((match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/))) {
                  return getDynamicHover();
                }
              } else if (prevLineText === "条件") {
                if (MODEL.规则.条件.hasOwnProperty(hoverText)) {
                  return MODEL.规则.条件[hoverText].悬停;
                }
                for (i in MODEL.常量) {
                  if (MODEL.常量[i].hasOwnProperty(hoverText)) {
                    if (Array.isArray(MODEL.常量[i][hoverText].悬停)) {
                      return MODEL.常量[i][hoverText].悬停[theme];
                    }
                    return MODEL.常量[i][hoverText].悬停;
                  }
                }
                if ((match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/))) {
                  return getDynamicHover();
                }
              } else if (prevLineText === "动作") {
                if (MODEL.规则.动作.hasOwnProperty(hoverText)) {
                  return MODEL.规则.动作[hoverText].悬停;
                }
                if (MODEL.规则.条件.hasOwnProperty(hoverText)) {
                  return MODEL.规则.条件[hoverText].悬停;
                }
                for (i in MODEL.常量) {
                  if (MODEL.常量[i].hasOwnProperty(hoverText)) {
                    if (Array.isArray(MODEL.常量[i][hoverText].悬停)) {
                      return MODEL.常量[i][hoverText].悬停[theme];
                    }
                    return MODEL.常量[i][hoverText].悬停;
                  }
                }
                if ((match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/))) {
                  return getDynamicHover();
                }
              } else {
                return;
              }
            }
          } else if (lineText.endsWith("}")) {
            rightBracesCount++;
          }
        }

        function getDynamicHover() {
          //(全局|For 全局变量|设置全局变量|修改全局变量|在索引处设置全局变量|在索引处修改全局变量|持续追踪全局变量|追踪全局变量频率|停止追踪全局变量)/;
          //(子程序|调用子程序|开始规则)/;
          //(For 玩家变量|设置玩家变量|修改玩家变量|在索引处设置玩家变量|在索引处修改玩家变量|持续追踪玩家变量|追踪玩家变量频率|停止追踪玩家变量)/;
          const dynamicList = UTIL.getDynamicList(document);
          const range = UTIL.getPrevValidWordRange(document, position);
          const text = document.getText(range);
          if (
            (match = text.match(
              /全局|For 全局变量|设置全局变量|修改全局变量|在索引处设置全局变量|在索引处修改全局变量|持续追踪全局变量|追踪全局变量频率|停止追踪全局变量/
            ))
          ) {
            for (i in dynamicList.全局变量) {
              if (hoverText === dynamicList.全局变量[i]) {
                return MODEL.buildHover(
                  PATH,
                  hoverText,
                  ["全局变量", i],
                  `一个已定义的全局变量。`
                );
              }
            }
          } else if ((match = text.match(/子程序|调用子程序|开始规则/))) {
            for (i in dynamicList.子程序) {
              if (hoverText === dynamicList.子程序[i]) {
                return MODEL.buildHover(
                  PATH,
                  hoverText,
                  ["子程序", i],
                  `一个已定义的子程序。`
                );
              }
            }
          } else {
            for (i in dynamicList.玩家变量) {
              if (hoverText === dynamicList.玩家变量[i]) {
                return MODEL.buildHover(
                  PATH,
                  hoverText,
                  ["玩家变量", i],
                  `一个已定义的玩家变量。`
                );
              }
            }
          }
        }
      },
    }),

    //补全能力
    vscode.languages.registerCompletionItemProvider(
      "ow",
      {
        provideCompletionItems(document, position, token, context) {
          try {
            //作用范围
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
                  if (prevLineText === "事件") {
                    if (semicolonCount === 0) {
                      return getStaticCompletions(MODEL.规则.事件.选项);
                    } else if (semicolonCount === 1) {
                      const nextLine = document.lineAt(i + 1);
                      const nextLineText = nextLine.text.trim();
                      if (nextLineText.startsWith("子程序")) {
                        return getDynamicCompletions();
                      } else {
                        return getStaticCompletions(MODEL.规则.事件.队伍);
                      }
                    } else if (semicolonCount === 2) {
                      return getStaticCompletions(MODEL.规则.事件.玩家);
                    }
                  } else if (prevLineText === "条件") {
                    let commasCount = 0;
                    let rightParenthesesCount = 0;
                    let pos = position;
                    while (pos.line > 0 || pos.character > 0) {
                      const range = UTIL.getPrevValidWordRange(
                        document,
                        pos,
                        /[\{\}\[\]\(\)\;\,\.]/
                      );
                      const symbol = document.getText(range);
                      console.log(symbol);
                      if (symbol == "{" || symbol == "[" || symbol == ";") {
                        return getStaticCompletions(MODEL.规则.条件);
                      } else if (symbol == "(") {
                        return new vscode.CompletionItem("参数");
                      } else if (symbol == ")") {
                        rightParenthesesCount++;
                      } else if (symbol == ",") {
                        if (rightParenthesesCount == 0) {
                          commasCount++;
                        }
                      } else if (symbol == ".") {
                        return new vscode.CompletionItem("变量");
                      }
                      pos = UTIL.getPrevValidPosition(
                        document,
                        range ? range.start : pos
                      );
                    }

                    return getStaticCompletions(MODEL.规则.条件);
                  } else if (prevLineText === "动作") {
                    // 设置玩家变量 => (条件 = 条件);
                    return getStaticCompletions(MODEL.规则.动作);
                  }
                }
              } else if (lineText.endsWith("}")) {
                rightBracesCount++;
              } else if (lineText.endsWith(";")) {
                semicolonCount++;
              }
            }

            //调试：无建议
            let item = new vscode.CompletionItem("无建议");
            item.insertText = "";
            return [item];

            //获取动态补全列表：全局变量，玩家变量，子程序
            function getDynamicCompletions(type, range) {
              const dynamicList = UTIL.getDynamicList(document);
              let completionItems = [];
              if (type == "全局变量") {
                for (const i in dynamicList.全局变量) {
                  let item = MODEL.buildCompletion(
                    PATH,
                    i.padStart(3, "0") + ": " + dynamicList.全局变量[i],
                    vscode.CompletionItemKind.Function,
                    ["全局变量", i],
                    `一个已定义的全局变量。`,
                    (i.padStart(3, "0") + dynamicList.全局变量[i])
                      .split("")
                      .join(" "),
                    `${dynamicList.全局变量[i]};`
                  );
                  item.range = range;
                  completionItems.push(item);
                }
              } else if (type == "玩家变量") {
                for (const i in dynamicList.玩家变量) {
                  let item = MODEL.buildCompletion(
                    PATH,
                    i.padStart(3, "0") + ": " + dynamicList.玩家变量[i],
                    vscode.CompletionItemKind.Function,
                    ["玩家变量", i],
                    `一个已定义的玩家变量。`,
                    (i.padStart(3, "0") + dynamicList.玩家变量[i])
                      .split("")
                      .join(" "),
                    `${dynamicList.玩家变量[i]};`
                  );
                  item.range = range;
                  completionItems.push(item);
                }
              } else if (type == "子程序") {
                for (const i in dynamicList.子程序) {
                  let item = MODEL.buildCompletion(
                    PATH,
                    i.padStart(3, "0") + ": " + dynamicList.子程序[i],
                    vscode.CompletionItemKind.Function,
                    ["子程序", i],
                    `一个已定义的子程序。`,
                    (i.padStart(3, "0") + dynamicList.子程序[i])
                      .split("")
                      .join(" "),
                    `${dynamicList.子程序[i]};`
                  );
                  item.range = range;
                  completionItems.push(item);
                }
              }
              return completionItems;
            }

            //获取静态补全列表：条件，动作，常量
            function getStaticCompletions(object, range) {
              let completions = [];
              for (const p in object) {
                if (Array.isArray(object[p].补全)) {
                  const theme =
                    vscode.window.activeColorTheme.kind ===
                    vscode.ColorThemeKind.Dark
                      ? 0
                      : 1;
                  object[p].补全[theme].range = range;
                  completions.push(object[p].补全[theme]);
                } else {
                  object[p].补全.range = range;
                  completions.push(object[p].补全);
                }
              }
              return completions;
            }
          } catch (error) {
            console.log(error);
          }
        },
      },
      "(",
      ",",
      ".",
      " "
    ),

    //参数提示能力
    vscode.languages.registerSignatureHelpProvider(
      "ow",
      {
        provideSignatureHelp(document, position, token, context) {},
      },
      "(",
      ",",
      " "
    ),

    //手册面板能力
    vscode.window.registerWebviewViewProvider("ow.view.manual", {
      resolveWebviewView(webviewView) {
        const theme =
          vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        const extensionUri = vscode.Uri.file(path.join(PATH, "", path.sep));
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

//调试工具：正则排序
function sortAndFilterChineseKeyword(s) {
  const str = s.split("|");
  const set = new Set(str);
  let arr = Array.from(set).sort((b, a) => a.localeCompare(b, "zh-Hans-CN"));
  console.log(arr.join("|"));
}

//调试工具：正则字符串
function getModelString() {
  let str = "";
  for (i in MODEL.规则.动作) {
    str += "|" + i;
  }
  sortAndFilterChineseKeyword(str.slice(1));
}

//调试工具：对象转数组
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

//调试工具：多音字数组 (npm install pinyinlite)
function buildPinYinArray() {
  try {
    const pinyinlite = require("pinyinlite");

    const chineseDict = MODEL.拼音;

    const sortedKeys = Object.keys(chineseDict).sort((a, b) => {
      return a.localeCompare(b, "zh-CN"); // Sort Chinese characters
    });

    const pinyinDict = {};

    for (const char of sortedKeys) {
      const pinyinArray = pinyinlite(char, { noTone: true });

      let pinyinString = pinyinArray.join(",");
      pinyinString = pinyinString
        .split(",")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");

      pinyinDict[char] = pinyinString;
    }

    const outputString = JSON.stringify(pinyinDict, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}
