const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const MODEL = require("./ow.model.js");
const UTIL = require("./ow.utiliy.js");

function activate(context) {
  //初始化路径
  const PATH = context.extensionPath;

  //初始化模型
  MODEL.buildStaticModels(PATH);

  //初始化能力
  context.subscriptions.push(
    //新建文件能力
    vscode.commands.registerCommand("ow.command.newFile", () => {
      try {
        vscode.window
          .showSaveDialog({
            filters: {
              "ow Files": ["ow"],
            },
          })
          .then((fileUri) => {
            if (fileUri) {
              const filePath = fileUri.fsPath;
              fs.writeFile(filePath, MODEL.示例, "utf-8", () => {
                const document = vscode.workspace.openTextDocument(filePath);
                vscode.window.showTextDocument(document);
              });
            }
          });
      } catch (error) {
        console.log("错误：ow.command.newFile 新建文件能力" + error);
      }
    }),

    //主动建议能力
    vscode.commands.registerCommand("ow.command.suggest", () => {
      try {
        vscode.commands.executeCommand("editor.action.triggerSuggest");
        vscode.commands.executeCommand("editor.action.triggerParameterHints");
      } catch (error) {
        console.log("错误：ow.command.suggest 主动建议能力" + error);
      }
    }),

    //自动换行能力
    vscode.commands.registerCommand("ow.command.line", () => {
      try {
        vscode.commands.executeCommand("editor.action.toggleWordWrap");
      } catch (error) {
        console.log("错误：ow.command.line 自动换行能力" + error);
      }
    }),

    //导出修复能力
    vscode.commands.registerCommand("ow.command.copy", () => {
      try {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          const document = activeEditor.document;
          let text = document.getText();
          text = text.replace(
            /设置不可见\((.*), 无\);/g,
            "设置不可见($1, 全部禁用);"
          );
          text = text.replace(
            /追踪全局变量频率\((.*), (.*), (.*), 无\);/g,
            "追踪全局变量频率($1, $2, $3, 全部禁用);"
          );
          text = text.replace(
            /追踪玩家变量频率\((.*), (.*), (.*), (.*), 无\);/g,
            "追踪玩家变量频率($1, $2, $3, $4, 全部禁用);"
          );
          text = text.replace(
            /持续追踪全局变量\((.*), (.*), (.*), 无\);/g,
            "持续追踪全局变量($1, $2, $3, 全部禁用);"
          );
          text = text.replace(
            /持续追踪玩家变量\((.*), (.*), (.*), (.*), 无\);/g,
            "持续追踪玩家变量($1, $2, $3, $4, 全部禁用);"
          );
          vscode.env.clipboard.writeText(text);
          vscode.window.showInformationMessage(
            `${path.basename(document.fileName)} 已导出到剪切板`
          );
        }
      } catch (error) {
        console.log("错误：ow.command.copy 导出修复能力" + error);
      }
    }),

    //修复导入能力
    vscode.commands.registerCommand("ow.command.paste", () => {
      try {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          vscode.env.clipboard.readText().then((text) => {
            text = text.replace(
              /设置不可见\((.*), 无\);/g,
              "设置不可见($1, 全部禁用);"
            );
            text = text.replace(
              /追踪全局变量频率\((.*), (.*), (.*), 无\);/g,
              "追踪全局变量频率($1, $2, $3, 全部禁用);"
            );
            text = text.replace(
              /追踪玩家变量频率\((.*), (.*), (.*), (.*), 无\);/g,
              "追踪玩家变量频率($1, $2, $3, $4, 全部禁用);"
            );
            text = text.replace(
              /持续追踪全局变量\((.*), (.*), (.*), 无\);/g,
              "持续追踪全局变量($1, $2, $3, 全部禁用);"
            );
            text = text.replace(
              /持续追踪玩家变量\((.*), (.*), (.*), (.*), 无\);/g,
              "持续追踪玩家变量($1, $2, $3, $4, 全部禁用);"
            );
            const edit = new vscode.WorkspaceEdit();
            const wholeDocumentRange = activeEditor.document.validateRange(
              new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
            );
            edit.replace(activeEditor.document.uri, wholeDocumentRange, text);
            vscode.workspace.applyEdit(edit);
            vscode.window.showInformationMessage(
              `${path.basename(activeEditor.document.fileName)} 已导入并修复`
            );
          });
        }
      } catch (error) {
        console.log("错误：ow.command.paste 修复导入能力" + error);
      }
    }),

    //代码混淆能力
    vscode.commands.registerCommand("ow.command.obfuscate", () => {
      try {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          const document = activeEditor.document;
          const dynamicList = UTIL.getDynamicList(document);
          const obfuscatedNames = UTIL.getObfuscatedNames(128);
          let text = document.getText();

          //混淆字符串
          const pattern = /自定义字符串\s*\(\s*"((?:[^"\\]|\\.)+)"/g;
          let match;
          while ((match = pattern.exec(text))) {
            const fullMatch = match[0];
            const quotedContent = match[1];
            const obfuscatedContent = quotedContent.replace(
              /\{[0-2]\}|\\[ntr]|./g,
              (char) => {
                if (char.length > 1) {
                  return char;
                }
                return String.fromCodePoint(char.charCodeAt(0) + 0xe0000);
              }
            );

            text = text.replace(
              fullMatch,
              `自定义字符串("${obfuscatedContent}"`
            );
          }

          //修复工坊问题
          text = text.replace(
            /设置不可见\((.*), 无\);/g,
            "设置不可见($1, 全部禁用);"
          );
          text = text.replace(
            /追踪全局变量频率\((.*), (.*), (.*), 无\);/g,
            "追踪全局变量频率($1, $2, $3, 全部禁用);"
          );
          text = text.replace(
            /追踪玩家变量频率\((.*), (.*), (.*), (.*), 无\);/g,
            "追踪玩家变量频率($1, $2, $3, $4, 全部禁用);"
          );
          text = text.replace(
            /持续追踪全局变量\((.*), (.*), (.*), 无\);/g,
            "持续追踪全局变量($1, $2, $3, 全部禁用);"
          );
          text = text.replace(
            /持续追踪玩家变量\((.*), (.*), (.*), (.*), 无\);/g,
            "持续追踪玩家变量($1, $2, $3, $4, 全部禁用);"
          );

          //移除注释
          text = text.replace(
            /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|^\s*"[^"]*"\s*)/gm,
            ""
          );

          //移除查看器
          text = text.replace(/(禁用查看器录制|启用查看器录制)\s*;/g, "");

          //移除空白行
          text = text.replace(/^\s*[\r\n]/gm, "");

          //移除缩进
          text = text.replace(/^\s+|\s+$/gm, "");

          //获取混淆名称
          let obfuscatedList = { 子程序: [], 全局变量: [], 玩家变量: [] };
          for (const i in dynamicList.子程序) {
            obfuscatedList.子程序[i] = obfuscatedNames[i];
          }
          for (const i in dynamicList.全局变量) {
            obfuscatedList.全局变量[i] = obfuscatedNames[i];
          }
          for (const i in dynamicList.玩家变量) {
            obfuscatedList.玩家变量[i] = obfuscatedNames[i];
          }

          //混淆子程序名称
          for (const i in dynamicList.子程序) {
            //事件
            text = text.replace(
              RegExp(`\\b${dynamicList.子程序[i]}\\b\\s*;`, "g"),
              `${obfuscatedList.子程序[i]};`
            );
            //开始规则
            text = text.replace(
              RegExp(
                `开始规则\\s*\\(\\s*\\b${dynamicList.子程序[i]}\\b\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `开始规则(${obfuscatedList.子程序[i]}, $1);`
            );
            //调用子程序
            text = text.replace(
              RegExp(
                `调用子程序\\s*\\(\\s*\\b${dynamicList.子程序[i]}\\b\\s*\\)\\s*;`,
                "g"
              ),
              `调用子程序(${obfuscatedList.子程序[i]});`
            );
          }

          //混淆子程序列表
          if (obfuscatedList.子程序.length > 0) {
            let replaceText = `子程序\n{\n`;
            for (const i in obfuscatedList.子程序) {
              replaceText += `${i}: ${obfuscatedList.子程序[i]}\n`;
            }
            replaceText += `}`;
            text = text.replace(/子程序\s*{\s*(.*?)\s*}/s, replaceText);
          }

          //混淆全局变量名称
          for (const i in dynamicList.全局变量) {
            //前缀为 "全局."
            text = text.replace(
              RegExp(`全局\\s*\\.\\s*\\b${dynamicList.全局变量[i]}\\b`, "g"),
              `全局.${obfuscatedList.全局变量[i]}`
            );
            //For 全局变量
            text = text.replace(
              RegExp(
                `For 全局变量\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `For 全局变量(${obfuscatedList.全局变量[i]}, $1, $2, $3);`
            );
            //设置全局变量
            text = text.replace(
              RegExp(
                `设置全局变量\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `设置全局变量(${obfuscatedList.全局变量[i]}, $1);`
            );
            //修改全局变量
            text = text.replace(
              RegExp(
                `修改全局变量\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `修改全局变量(${obfuscatedList.全局变量[i]}, $1, $2);`
            );
            //在索引处设置全局变量
            text = text.replace(
              RegExp(
                `在索引处设置全局变量\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `在索引处设置全局变量(${obfuscatedList.全局变量[i]}, $1, $2);`
            );
            //在索引处修改全局变量
            text = text.replace(
              RegExp(
                `在索引处修改全局变量\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `在索引处修改全局变量(${obfuscatedList.全局变量[i]}, $1, $2, $3);`
            );
            //持续追踪全局变量
            text = text.replace(
              RegExp(
                `持续追踪全局变量\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `持续追踪全局变量(${obfuscatedList.全局变量[i]}, $1, $2, $3);`
            );
            //追踪全局变量频率
            text = text.replace(
              RegExp(
                `追踪全局变量频率\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `追踪全局变量频率(${obfuscatedList.全局变量[i]}, $1, $2, $3);`
            );
            //停止追踪全局变量
            text = text.replace(
              RegExp(
                `停止追踪全局变量\\s*\\(\\s*\\b${dynamicList.全局变量[i]}\\b\\s*\\)\\s*;`,
                "g"
              ),
              `停止追踪全局变量(${obfuscatedList.全局变量[i]});`
            );
          }

          //混淆全局变量列表
          if (obfuscatedList.全局变量.length > 0) {
            replaceText = `全局:\n`;
            for (const i in obfuscatedList.全局变量) {
              replaceText += `${i}: ${obfuscatedList.全局变量[i]}\n`;
            }
            let s2 = text.match(/全局\s*:\s*(.*?)\s*(玩家\s*:|})/s)[2];
            text = text.replace(
              /全局\s*:\s*(.*?)\s*(玩家\s*:|})/s,
              `${replaceText}${s2}`
            );
          }

          //混淆玩家变量名称
          for (const i in dynamicList.玩家变量) {
            //前缀为 "."
            text = text.replace(
              RegExp(`\\.\\s*\\b${dynamicList.玩家变量[i]}\\b`, "g"),
              `.${obfuscatedList.玩家变量[i]}`
            );
            //For 玩家变量
            text = text.replace(
              RegExp(
                `For 玩家变量\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `For 玩家变量($1, ${obfuscatedList.玩家变量[i]}, $2, $3, $4);`
            );
            //设置玩家变量
            text = text.replace(
              RegExp(
                `设置玩家变量\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `设置玩家变量($1, ${obfuscatedList.玩家变量[i]}, $2);`
            );
            //修改玩家变量
            text = text.replace(
              RegExp(
                `修改玩家变量\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `修改玩家变量($1, ${obfuscatedList.玩家变量[i]}, $2, $3);`
            );
            //在索引处设置玩家变量
            text = text.replace(
              RegExp(
                `在索引处设置玩家变量\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `在索引处设置玩家变量($1, ${obfuscatedList.玩家变量[i]}, $2, $3);`
            );
            //在索引处修改玩家变量
            text = text.replace(
              RegExp(
                `在索引处修改玩家变量\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `在索引处修改玩家变量($1, ${obfuscatedList.玩家变量[i]}, $2, $3, $4);`
            );
            //持续追踪玩家变量
            text = text.replace(
              RegExp(
                `持续追踪玩家变量\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `持续追踪玩家变量($1, ${obfuscatedList.玩家变量[i]}, $2, $3, $4);`
            );
            //追踪玩家变量频率
            text = text.replace(
              RegExp(
                `追踪玩家变量频率\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*,\\s*(.*)\\s*\\)\\s*;`,
                "g"
              ),
              `追踪玩家变量频率($1, ${obfuscatedList.玩家变量[i]}, $2, $3, $4);`
            );
            //停止追踪玩家变量
            text = text.replace(
              RegExp(
                `停止追踪玩家变量\\s*\\(\\s*(.*)\\s*,\\s*\\b${dynamicList.玩家变量[i]}\\b\\s*\\)\\s*;`,
                "g"
              ),
              `停止追踪玩家变量($1, ${obfuscatedList.玩家变量[i]});`
            );
          }

          //混淆玩家变量列表
          if (obfuscatedList.玩家变量.length > 0) {
            replaceText = `玩家:\n`;
            for (const i in obfuscatedList.玩家变量) {
              replaceText += `${i}: ${obfuscatedList.玩家变量[i]}\n`;
            }
            let s2 = text.match(/玩家\s*:\s*(.*?)\s*(全局\s*:|})/s)[2];
            text = text.replace(
              /玩家\s*:\s*(.*?)\s*(全局\s*:|})/s,
              `${replaceText}${s2}`
            );
          }

          //混淆规则名称
          text = text.replace(
            /规则\s*\(\s*".*"\s*\)/g,
            () =>
              `规则("${
                obfuscatedNames[
                  Math.floor(Math.random() * obfuscatedNames.length)
                ]
              }")`
          );

          //填充空白规则
          const rules = text
            .replace(/(禁用\s*)?规则\s*\(\s*"/g, `✂\n规则("`)
            .split("✂");
          let newRules = [
            rules[0],
            `
规则("代码受到保护，请尊重作者的劳动成果｜守望先锋® 工坊语言支持")
{
事件
{
持续 - 全局;
}
动作
{
禁用查看器录制;
}
}`,
          ];
          for (let i = 1; i < rules.length; i++) {
            newRules.push(rules[i]);
            for (
              let j = 0;
              j < UTIL.getRandomInt(2000 / rules.length, 2500 / rules.length);
              j++
            ) {
              newRules.push(`
规则("${`\n${
                obfuscatedNames[
                  Math.floor(Math.random() * obfuscatedNames.length)
                ]
              }`.repeat(UTIL.getRandomInt(5, 8))}")
{
事件
{
持续 - 全局;
}
}`);
            }
          }

          vscode.env.clipboard.writeText(newRules.join(""));
          vscode.window.showInformationMessage(
            `${path.basename(document.fileName)}（混淆）已导出到剪切板`
          );
        }
      } catch (error) {
        console.log("错误：ow.command.obfuscate 代码混淆能力" + error);
      }
    }),

    //代码大纲能力
    vscode.languages.registerDocumentSymbolProvider("ow", {
      provideDocumentSymbols(document) {
        try {
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
                    (match = prevLineText.match(
                      /^(禁用\s*)?规则\s*\(\s*"(.*)"\s*\)$/
                    ))
                  ) {
                    if (match[1] === undefined) {
                      symbol = [
                        "规则",
                        `${match[2]}`,
                        vscode.SymbolKind.Module,
                        prevLine.range.start,
                        [],
                      ];
                    } else {
                      symbol = [
                        "规则",
                        `⟁ ${match[2]}`,
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
        } catch (error) {
          console.log("错误：provideDocumentSymbols 代码大纲能力" + error);
        }
      },
    }),

    //调色盘能力
    vscode.languages.registerColorProvider("ow", {
      provideDocumentColors(document) {
        try {
          const text = document.getText();
          const pattern =
            /自定义颜色\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
          let colors = [];
          while ((match = pattern.exec(text))) {
            colors.push(
              new vscode.ColorInformation(
                new vscode.Range(
                  document.positionAt(match.index),
                  document.positionAt(match.index + match[0].length)
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
          return colors;
        } catch (error) {
          console.log("错误：provideDocumentColors 调色盘能力" + error);
        }
      },
      provideColorPresentations(color) {
        try {
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
        } catch (error) {
          console.log("错误：provideColorPresentations 调色盘能力" + error);
        }
      },
    }),

    //悬停提示能力
    vscode.languages.registerHoverProvider("ow", {
      provideHover(document, position) {
        try {
          const hoverRange = document.getWordRangeAtPosition(position);
          if (!hoverRange) {
            return;
          }
          const hoverText = document.getText(hoverRange);
          const scope = UTIL.getScope(document, position);
          if (scope.name === "扩展") {
            if (MODEL.扩展.hasOwnProperty(hoverText)) {
              return MODEL.buildHover(
                PATH,
                hoverText,
                MODEL.扩展[hoverText].标签,
                MODEL.扩展[hoverText].提示
              );
            }
          } else if (scope.name === "事件") {
            const event = MODEL.规则.事件;
            if (event.选项.hasOwnProperty(hoverText)) {
              return event.选项[hoverText].悬停;
            }
            if (event.队伍.hasOwnProperty(hoverText)) {
              return event.队伍[hoverText].悬停;
            }
            if (event.玩家.hasOwnProperty(hoverText)) {
              return event.玩家[hoverText].悬停;
            }
            for (i of MODEL.常量.英雄) {
              if (i.名称 == hoverText) {
                const theme =
                  vscode.window.activeColorTheme.kind ===
                  vscode.ColorThemeKind.Dark
                    ? "深色"
                    : "浅色";
                return i.悬停[theme];
              }
            }
            return matchDynamicHover();
          } else if (scope.name === "条件") {
            if (MODEL.规则.条件.hasOwnProperty(hoverText)) {
              return MODEL.规则.条件[hoverText].悬停;
            }
            for (i in MODEL.常量) {
              for (j in MODEL.常量[i]) {
                if (MODEL.常量[i][j].名称 == hoverText) {
                  if (MODEL.常量[i][j].悬停.hasOwnProperty("深色")) {
                    //双色主题图标
                    const theme =
                      vscode.window.activeColorTheme.kind ===
                      vscode.ColorThemeKind.Dark
                        ? "深色"
                        : "浅色";
                    return MODEL.常量[i][j].悬停[theme];
                  } else {
                    //通用主题图标
                    return MODEL.常量[i][j].悬停;
                  }
                }
              }
            }
            return matchDynamicHover();
          } else if (scope.name === "动作") {
            if (MODEL.规则.动作.hasOwnProperty(hoverText)) {
              return MODEL.规则.动作[hoverText].悬停;
            }
            if (MODEL.规则.条件.hasOwnProperty(hoverText)) {
              return MODEL.规则.条件[hoverText].悬停;
            }
            for (i in MODEL.常量) {
              for (j in MODEL.常量[i]) {
                if (MODEL.常量[i][j].名称 == hoverText) {
                  try {
                    console.log(MODEL.常量[i][j].悬停);
                    if (MODEL.常量[i][j].悬停.hasOwnProperty("深色")) {
                      //双色主题图标
                      const theme =
                        vscode.window.activeColorTheme.kind ===
                        vscode.ColorThemeKind.Dark
                          ? "深色"
                          : "浅色";
                      console.log(theme);
                      return MODEL.常量[i][j].悬停[theme];
                    } else {
                      //通用主题图标
                      return MODEL.常量[i][j].悬停;
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              }
            }
            return matchDynamicHover();
          }

          //匹配动态悬停
          function matchDynamicHover() {
            if ((match = hoverText.match(/\b[_a-zA-Z][_a-zA-Z0-9]*\b/))) {
              const range = UTIL.getPrevValidWordRange(document, position);
              const text = document.getText(range);
              return buildDynamicHover(UTIL.getDynamicType(text));
            }
          }

          //构建动态悬停
          function buildDynamicHover(type) {
            const dynamicList = UTIL.getDynamicList(document);
            if (type == "全局变量") {
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
            } else if (type == "玩家变量") {
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
            } else if (type == "子程序") {
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
            }
          }
        } catch (error) {
          console.log("错误：provideHover 悬停提示能力" + error);
        }
      },
    }),

    //补全建议能力
    vscode.languages.registerCompletionItemProvider(
      "ow",
      {
        provideCompletionItems(document, position, token, context) {
          try {
            const scope = UTIL.getScope(document, position);
            if (scope.name === "全局") {
              return getGlobalCompletions();
            } else if (scope.name === "扩展") {
              return getExtensionCompletions();
            } else if (scope.name.startsWith("规则")) {
              return getRuleCompletions();
            } else if (scope.name === "事件") {
              return getEventCompletions(scope.index, scope.first);
            } else if (scope.name === "条件") {
              return getConditionCompletions();
            } else if (scope.name === "动作") {
              return getActionCompletions();
            }

            //获取全局补全
            function getGlobalCompletions() {
              let completionItems = [];
              for (const i in MODEL.模版.全局) {
                completionItems.push(
                  MODEL.buildCompletion(
                    PATH,
                    i,
                    vscode.CompletionItemKind.Module,
                    MODEL.模版.全局[i].标签,
                    MODEL.模版.全局[i].提示,
                    undefined,
                    new vscode.SnippetString(`${MODEL.模版.全局[i].格式}`)
                  )
                );
              }
              return completionItems;
            }

            //获取扩展补全
            function getExtensionCompletions() {
              let completionItems = [];
              for (const i in MODEL.扩展) {
                completionItems.push(
                  MODEL.buildCompletion(
                    PATH,
                    i,
                    vscode.CompletionItemKind.Property,
                    MODEL.扩展[i].标签,
                    MODEL.扩展[i].提示
                  )
                );
              }
              return completionItems;
            }

            //获取规则补全
            function getRuleCompletions() {
              let completionItems = [];
              for (const i in MODEL.模版.规则) {
                completionItems.push(
                  MODEL.buildCompletion(
                    PATH,
                    i,
                    vscode.CompletionItemKind.Module,
                    MODEL.模版.规则[i].标签,
                    MODEL.模版.规则[i].提示,
                    undefined,
                    new vscode.SnippetString(`${MODEL.模版.规则[i].格式}`)
                  )
                );
              }
              return completionItems;
            }

            //获取事件补全
            function getEventCompletions(index, first) {
              if (index === 0) {
                return buildStaticCompletions(MODEL.规则.事件.选项);
              } else if (index === 1) {
                if (first.startsWith("持续 - 全局")) {
                  return;
                } else if (first.startsWith("子程序")) {
                  return buildDynamicCompletions("子程序");
                }
                return buildStaticCompletions(MODEL.规则.事件.队伍);
              } else if (index === 2) {
                if (first.startsWith("持续 - 全局")) {
                  return;
                } else if (first.startsWith("子程序")) {
                  return;
                }
                return buildStaticCompletions(MODEL.规则.事件.玩家).concat(
                  buildStaticCompletions(MODEL.常量.英雄)
                );
              }
            }

            //获取条件补全
            function getConditionCompletions() {
              const entry = UTIL.getEntry(document, position, scope);
              if (!entry) {
                return;
              }
              if (entry instanceof Object) {
                if (entry.name == "数组") {
                  if (
                    context.triggerCharacter == "(" ||
                    context.triggerCharacter == ","
                  ) {
                    return;
                  }
                  return buildStaticCompletions(MODEL.规则.条件);
                } else if (MODEL.规则.条件.hasOwnProperty(entry.name)) {
                  if (MODEL.规则.条件[entry.name].hasOwnProperty("参数")) {
                    const param = MODEL.规则.条件[entry.name].参数[entry.index];
                    if (param.类型 == "条件") {
                      if (
                        context.triggerCharacter == "(" ||
                        context.triggerCharacter == ","
                      ) {
                        return;
                      }
                      return buildStaticCompletions(MODEL.规则.条件);
                    } else if (param.hasOwnProperty("选项")) {
                      return buildStaticCompletions(param.选项);
                    }
                  }
                }
              } else if (entry == "条件") {
                return buildStaticCompletions(MODEL.规则.条件);
              } else if (entry.match(/^全局变量|玩家变量|子程序$/)) {
                return buildDynamicCompletions(entry);
              }
            }

            //获取动作补全
            function getActionCompletions() {
              try {
                const entry = UTIL.getEntry(document, position, scope);
                if (!entry) {
                  return;
                }
                if (entry instanceof Object) {
                  if (entry.name == "数组") {
                    if (
                      context.triggerCharacter == "(" ||
                      context.triggerCharacter == ","
                    ) {
                      return;
                    }
                    return buildStaticCompletions(MODEL.规则.条件);
                  } else if (MODEL.规则.动作.hasOwnProperty(entry.name)) {
                    if (MODEL.规则.动作[entry.name].hasOwnProperty("参数")) {
                      const param =
                        MODEL.规则.动作[entry.name].参数[entry.index];
                      if (param.类型 == "条件") {
                        if (
                          context.triggerCharacter == "(" ||
                          context.triggerCharacter == ","
                        ) {
                          return;
                        }
                        return buildStaticCompletions(MODEL.规则.条件);
                      } else if (param.hasOwnProperty("选项")) {
                        return buildStaticCompletions(param.选项);
                      } else if (
                        param.类型.match(/^全局变量|玩家变量|子程序$/)
                      ) {
                        return buildDynamicCompletions(param.类型);
                      }
                    }
                  } else if (MODEL.规则.条件.hasOwnProperty(entry.name)) {
                    if (MODEL.规则.条件[entry.name].hasOwnProperty("参数")) {
                      const param =
                        MODEL.规则.条件[entry.name].参数[entry.index];
                      if (param.类型 == "条件") {
                        if (
                          context.triggerCharacter == "(" ||
                          context.triggerCharacter == ","
                        ) {
                          return;
                        }
                        return buildStaticCompletions(MODEL.规则.条件);
                      } else if (param.hasOwnProperty("选项")) {
                        return buildStaticCompletions(param.选项);
                      }
                    }
                  }
                } else if (entry == "动作") {
                  return buildStaticCompletions(MODEL.规则.动作).concat(
                    buildStaticCompletions(MODEL.规则.条件)
                  );
                } else if (entry == "条件") {
                  return buildStaticCompletions(MODEL.规则.条件);
                } else if (entry.match(/^全局变量|玩家变量|子程序$/)) {
                  return buildDynamicCompletions(entry);
                }
              } catch (error) {
                console.log(error);
              }
            }

            //构建静态补全列表：条件/动作/常量
            function buildStaticCompletions(object) {
              const theme =
                vscode.window.activeColorTheme.kind ===
                vscode.ColorThemeKind.Dark
                  ? "深色"
                  : "浅色";
              let completions = [];
              for (const p in object) {
                if (object[p].补全.hasOwnProperty("深色")) {
                  //双色主题图标
                  completions.push(object[p].补全[theme]);
                } else {
                  //通用主题图标
                  completions.push(object[p].补全);
                }
              }
              return completions;
            }

            //构建动态补全列表：全局变量/玩家变量/子程序
            function buildDynamicCompletions(type) {
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
                    dynamicList.全局变量[i],
                    i.padStart(3, "0")
                  );
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
                    dynamicList.玩家变量[i],
                    i.padStart(3, "0")
                  );
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
                    dynamicList.子程序[i],
                    i.padStart(3, "0")
                  );
                  completionItems.push(item);
                }
              }
              return completionItems;
            }
          } catch (error) {
            console.log("错误：provideCompletionItems 补全建议能力" + error);
          }
        },
      },
      "(",
      ",",
      "."
    ),

    //补全占位符监视
    vscode.workspace.onDidChangeTextDocument((event) => {
      try {
        const changes = event.contentChanges;
        for (const change of changes) {
          if (
            (change.text === "" && change.rangeLength > 0) ||
            change.text == " "
          ) {
            const scope = UTIL.getScope(event.document, change.range.start);
            if (scope.name == "条件" || scope.name == "动作") {
              const entry = UTIL.getEntry(
                event.document,
                change.range.start,
                scope
              );
              if (!entry) {
                return;
              }
              if (entry instanceof Object) {
                if (MODEL.规则.动作.hasOwnProperty(entry.name)) {
                  const param = MODEL.规则.动作[entry.name].参数[entry.index];
                  if (param.hasOwnProperty("选项")) {
                    vscode.commands.executeCommand("ow.command.suggest");
                  } else if (param.类型.match(/^全局变量|玩家变量|子程序$/)) {
                    vscode.commands.executeCommand("ow.command.suggest");
                  }
                } else if (MODEL.规则.条件.hasOwnProperty(entry.name)) {
                  const param = MODEL.规则.条件[entry.name].参数[entry.index];
                  if (param.hasOwnProperty("选项")) {
                    vscode.commands.executeCommand("ow.command.suggest");
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log("错误：onDidChangeTextDocument 补全占位符监视" + error);
      }
    }),

    //参数提示能力
    vscode.languages.registerSignatureHelpProvider(
      "ow",
      {
        provideSignatureHelp(document, position, token, context) {
          try {
            const scope = UTIL.getScope(document, position);
            if (scope.name === "条件") {
              return getConditionSignature();
            } else if (scope.name === "动作") {
              return getActionSignature();
            }

            //获取条件参数签名
            function getConditionSignature() {
              const entry = UTIL.getEntry(document, position, scope);
              if (!entry) {
                return;
              }
              if (entry instanceof Object) {
                if (entry.name == "数组") {
                  return;
                } else if (MODEL.规则.条件.hasOwnProperty(entry.name)) {
                  if (MODEL.规则.条件[entry.name].hasOwnProperty("参数")) {
                    return buildSignatureHelp(
                      entry.name,
                      MODEL.规则.条件[entry.name],
                      entry.index
                    );
                  }
                }
              }
            }

            //获取动作参数签名
            function getActionSignature() {
              const entry = UTIL.getEntry(document, position, scope);
              if (!entry) {
                return;
              }
              if (entry instanceof Object) {
                if (entry.name == "数组") {
                  return;
                } else if (MODEL.规则.动作.hasOwnProperty(entry.name)) {
                  if (MODEL.规则.动作[entry.name].hasOwnProperty("参数")) {
                    return buildSignatureHelp(
                      entry.name,
                      MODEL.规则.动作[entry.name],
                      entry.index
                    );
                  }
                } else if (MODEL.规则.条件.hasOwnProperty(entry.name)) {
                  if (MODEL.规则.条件[entry.name].hasOwnProperty("参数")) {
                    return buildSignatureHelp(
                      entry.name,
                      MODEL.规则.条件[entry.name],
                      entry.index
                    );
                  }
                }
              }
            }

            //构建参数签名
            function buildSignatureHelp(name, object, index) {
              const signatureHelp = new vscode.SignatureHelp();
              const signatureInfo = new vscode.SignatureInformation();
              let label = name + "(";
              const params = object.参数;
              for (i in params) {
                const param = params[i].签名;
                param.label = [
                  label.length,
                  label.length + params[i].名称.length,
                ];
                signatureInfo.parameters.push(param);
                label += params[i].名称;
                if (i < params.length - 1) {
                  label += ", ";
                }
              }
              signatureInfo.label = label + ")";
              signatureInfo.documentation = new vscode.MarkdownString();
              signatureInfo.documentation.isTrusted = true;
              signatureInfo.documentation.supportHtml = true;
              signatureInfo.documentation.supportThemeIcons = true;
              signatureInfo.documentation.appendMarkdown(
                `\n\n***<span style="color:#c0c;">⬘</span>&nbsp;方法&nbsp;:&nbsp;${name}***\n\n`
              );
              for (i in object.标签) {
                signatureInfo.documentation.appendMarkdown(
                  `\`${object.标签[i]}\`&nbsp;`
                );
              }
              signatureInfo.documentation.appendMarkdown(`\n\n${object.提示}`);
              signatureInfo.activeParameter = index;
              signatureHelp.signatures = [signatureInfo];
              return signatureHelp;
            }
          } catch (error) {
            console.log("错误：provideSignatureHelp 参数提示能力" + error);
          }
        },
      },
      "(",
      ",",
      " "
    ),

    //语法高亮能力：仅纠正Textmate冲突项
    vscode.languages.registerDocumentSemanticTokensProvider(
      "ow",
      {
        provideDocumentSemanticTokens(document) {
          const builder = new vscode.SemanticTokensBuilder();
          try {
            let pos = new vscode.Position(0, 0);
            while (document.validatePosition(pos)) {
              const range = document.getWordRangeAtPosition(pos);
              if (range) {
                const word = document.getText(range);
                if (
                  (match = word.match(
                    /^(字符串|正在防守|颜色|添加至数组|受治疗者，治疗者及治疗百分比|生命值|上|下|方向，速率，及最大速度)$/
                  ))
                ) {
                  const scope = UTIL.getScope(document, pos);
                  const entry = UTIL.getEntry(document, pos, scope);
                  if (entry instanceof Object) {
                    if (MODEL.规则.动作.hasOwnProperty(entry.name)) {
                      const param =
                        MODEL.规则.动作[entry.name].参数[entry.index];
                      if (param && param.hasOwnProperty("选项")) {
                        builder.push(
                          range.start.line,
                          range.start.character,
                          word.length,
                          0
                        );
                      }
                    } else if (MODEL.规则.条件.hasOwnProperty(entry.name)) {
                      const param =
                        MODEL.规则.条件[entry.name].参数[entry.index];
                      if (param && param.hasOwnProperty("选项")) {
                        builder.push(
                          range.start.line,
                          range.start.character,
                          word.length,
                          0
                        );
                      }
                    }
                  }
                }
                pos = UTIL.getNextValidPosition(document, range.end);
                if (!pos) {
                  break;
                }
                continue;
              }
              pos = UTIL.getNextValidPosition(document, pos);
              if (!pos) {
                break;
              }
            }
          } catch (error) {
            console.log(
              "错误：provideDocumentSemanticTokens 语法高亮能力" + error
            );
          } finally {
            return builder.build();
          }
        },
      },
      new vscode.SemanticTokensLegend([`constants`])
    ),

    //代码整理能力
    vscode.languages.registerDocumentFormattingEditProvider("ow", {
      provideDocumentFormattingEdits(document, options) {
        try {
          const text = document.getText();
          const indentations = {};
          const pattern =
            /"(?:[^"\\]|\\.)*"|\{|\}|\[|\]|\(|\)|全局:|玩家:|For 全局变量|For 玩家变量|While|If|Else If|Else|End/g;
          let isVariable = false;
          let level = 0;
          let ignore = 0;
          let match;
          while ((match = pattern.exec(text))) {
            switch (match[0]) {
              case "[":
              case "(":
                indentations[document.positionAt(match.index).line + 1] =
                  --ignore;
                break;

              case "]":
              case ")":
                indentations[document.positionAt(match.index).line + 1] =
                  ++ignore == 0 ? level : ignore;
                break;

              case "{":
              case "For 全局变量":
              case "For 玩家变量":
              case "While":
              case "If":
                indentations[document.positionAt(match.index).line + 1] =
                  ++level;
                break;

              case "}":
              case "End":
                if (isVariable) {
                  --level;
                  isVariable = false;
                }
                indentations[document.positionAt(match.index).line] = --level;
                break;

              case "Else If":
              case "Else":
                indentations[document.positionAt(match.index).line] = --level;
                indentations[document.positionAt(match.index).line + 1] =
                  ++level;
                break;

              case "全局:":
              case "玩家:":
                if (isVariable) {
                  indentations[document.positionAt(match.index).line] = --level;
                }
                indentations[document.positionAt(match.index).line + 1] =
                  ++level;
                isVariable = true;
                break;
            }
          }

          let formatLines = [];
          let indentation = 0;
          for (let i = 0; i < document.lineCount; i++) {
            if (indentations.hasOwnProperty(i)) {
              indentation = indentations[i];
            }
            if (indentation < 0) {
              continue;
            }

            const line = document.lineAt(i);
            const trimText = line.text.trim();
            if (trimText === "") {
              continue;
            }

            formatLines.push(
              new vscode.TextEdit(
                line.range,
                (options.insertSpaces
                  ? " ".repeat(indentation * options.tabSize)
                  : "\t".repeat(indentation)) + trimText
              )
            );
          }

          return formatLines;
        } catch (error) {
          console.log(error);
        }
      },
    }),

    //切换开关能力
    vscode.languages.registerCodeLensProvider("ow", {
      async provideCodeLenses(document) {
        try {
          const codeLens = [];
          const text = document.getText();
          const pattern = /(禁用\s*)?规则\s*\(\s*"/g;
          let match;
          const processMatchesAsync = async () => {
            while ((match = pattern.exec(text))) {
              const matchText = match[0];
              const startPos = document.positionAt(match.index);
              const endPos = document.positionAt(
                match.index + matchText.length
              );
              const range = new vscode.Range(startPos, endPos);
              const toggleCommand = {
                title: `切换开关`,
                command: "ow.toggle.disableRule",
                arguments: [{ document, range }],
              };
              const newCodeLens = new vscode.CodeLens(range, toggleCommand);
              codeLens.push(newCodeLens);
              //引入一个小延迟，将控制权交还给事件循环
              await new Promise((resolve) => setTimeout(resolve, 0.016));
            }
          };
          await processMatchesAsync();
          return codeLens;
        } catch (error) {
          console.log("错误：provideCodeLenses 切换开关能力" + error);
        }
      },
    }),

    //切换开关行为
    vscode.commands.registerCommand("ow.toggle.disableRule", (args) => {
      try {
        const { document, range } = args;
        let text = document.getText(range);
        if (text.startsWith("禁用")) {
          text = text.replace(/禁用\s*/, "");
        } else {
          text = `禁用 ${text}`;
        }
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, range, text);
        vscode.workspace.applyEdit(edit);
      } catch (error) {
        console.log("错误：ow.toggle.disableRule 切换开关行为" + error);
      }
    }),

    //面板手册能力
    vscode.window.registerWebviewViewProvider("ow.view.manual", {
      resolveWebviewView(webviewView) {
        try {
          const extensionUri = vscode.Uri.file(path.join(PATH, "", path.sep));
          const styleUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, "views", "view.css")
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
                    <title>参考手册</title>
                    </head>
                    <body>
                    <i><h3>参考手册</h3></i>
                    <button style="width: 150px; height: auto;" onclick="navigate('Mode')">模式</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('Map')">地图</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('String')">字符串</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('Color')">颜色</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('Icon')">图标</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('Effect')">效果</button>
                    <br>
                    <br>
                    <button style="width: 150px; height: auto;" onclick="navigate('Projectile')">弹道</button>
                    <br>
                    <br>
                    </body>
                    </html>`;
          }

          function getModeTableHtml() {
            const mode = MODEL.常量.模式
              .map((element, index) => {
                if (index % 2 === 0) {
                  return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
                } else {
                  return `<td style="text-align: center;">${element.名称}</td>`;
                }
              })
              .join("");
            return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>模式</title>
                    </head>
                    <body>
                    <br>
                    <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                    <i><h3>模式</h3></i>
                    <table style="min-width: 300px; max-width: 400px;">
                    <tr>
                    ${mode}
                    </tr>
                    </table>
                    </body>
                    </html>`;
          }

          function getMapTableHtml() {
            const maps = MODEL.常量.地图
              .map((element, index) => {
                if (index % 2 === 0) {
                  return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
                } else {
                  return `<td style="text-align: center;">${element.名称}</td>`;
                }
              })
              .join("");
            return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>地图</title>
                    </head>
                    <body>
                    <br>
                    <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                    <i><h3>地图</h3></i>
                    <table style="min-width: 300px; max-width: 500px;">
                    <tr>
                    ${maps}
                    </tr>
                    </table>
                    </body>
                    </html>`;
          }

          function getStringTableHtml() {
            const strings = MODEL.常量.字符串
              .map((element, index) => {
                if (index % 2 === 0) {
                  return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
                } else {
                  return `<td style="text-align: center;">${element.名称}</td>`;
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
                const endImageIndex = Math.min(
                  startImageIndex + numCols - 1,
                  36
                );
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
                        `${imageNumber}.png`
                      )
                    );
                    const icons = MODEL.常量.图标.map(
                      (element) => element.名称
                    );
                    return `<td style="text-align:center; font-weight: 500;">
                    <img src="${imageSrc}" class="icon">

                    <br>${icons[imageNumber - 1]}</td>`;
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
                    <h4 style="display: flex; align-items: center;">
                    <div class="iconBox">
                      <img src="${webviewView.webview.asWebviewUri(
                        vscode.Uri.joinPath(
                          extensionUri,
                          "images",
                          "ow",
                          "hero",
                          "type",
                          "tank.png"
                        )
                      )}" class="icon">
                    </div>
                    &nbsp;重装</h4>
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
                        "avatar",
                        "tank_doomfist_avatar.png"
                      )
                    )}" height="48"><br>末日铁拳<br></td>
                    <td style="text-align: center;">
                      <img src="${webviewView.webview.asWebviewUri(
                        vscode.Uri.joinPath(
                          extensionUri,
                          "images",
                          "ow",
                          "hero",
                          "ability",
                          "tank_doomfist_weapon.png"
                        )
                      )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_doomfist_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_doomfist_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_doomfist_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_doomfist_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_dva_avatar.png"
                      )
                    )}" height="48"><br>D.Va<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_dva_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_dva_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_dva_ultimate1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_dva_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_dva_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_wrecking-ball_avatar.png"
                      )
                    )}" height="48"><br>破坏球<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_wrecking-ball_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_wrecking-ball_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_wrecking-ball_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_wrecking-ball_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_wrecking-ball_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_wrecking-ball_crouch.png"
                      )
                    )}" class="icon"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "tank_junker-queen_avatar.png"
                      )
                    )}" height="48"><br>渣客女王<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_junker-queen_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_junker-queen_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_junker-queen_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_junker-queen_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_junker-queen_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_orisa_avatar.png"
                      )
                    )}" height="48"><br>奥丽莎<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_orisa_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_orisa_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_orisa_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_orisa_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_orisa_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_reinhardt_avatar.png"
                      )
                    )}" height="48"><br>莱因哈特<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_reinhardt_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_reinhardt_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_reinhardt_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_reinhardt_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_reinhardt_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_roadhog_avatar.png"
                      )
                    )}" height="48"><br>路霸<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_roadhog_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_roadhog_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_roadhog_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_roadhog_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_roadhog_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_sigma_avatar.png"
                      )
                    )}" height="48"><br>西格玛<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_sigma_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_sigma_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_sigma_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_sigma_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_sigma_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_winston_avatar.png"
                      )
                    )}" height="48"><br>温斯顿<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_winston_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_winston_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_winston_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_winston_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_winston_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_zarya_avatar.png"
                      )
                    )}" height="48"><br>查莉娅<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_zarya_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_zarya_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_zarya_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_zarya_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_zarya_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "tank_ramattra_avatar.png"
                      )
                    )}" height="48"><br>拉玛刹<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_ramattra_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_ramattra_secondaryfire1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_ramattra_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_ramattra_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "tank_ramattra_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    <h4 style="display: flex; align-items: center;"><div class="iconBox">
                      <img src="${webviewView.webview.asWebviewUri(
                        vscode.Uri.joinPath(
                          extensionUri,
                          "images",
                          "ow",
                          "hero",
                          "type",
                          "damage.png"
                        )
                      )}" class="icon">
                    </div>
                    &nbsp;输出</h4>
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
                        "avatar",
                        "damage_ashe_avatar.png"
                      )
                    )}" height="48"><br>艾什<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_ashe_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_ashe_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_ashe_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_ashe_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_ashe_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_bastion_avatar.png"
                      )
                    )}" height="48"><br>堡垒<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_bastion_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_bastion_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_bastion_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_bastion_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_echo_avatar.png"
                      )
                    )}" height="48"><br>回声<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_echo_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_echo_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_echo_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_echo_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_echo_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_echo_passive.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "damage_genji_avatar.png"
                      )
                    )}" height="48"><br>源氏<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_genji_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_genji_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_genji_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_genji_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_genji_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_genji_passive.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "damage_hanzo_avatar.png"
                      )
                    )}" height="48"><br>半藏<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_hanzo_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_hanzo_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_hanzo_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_hanzo_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_hanzo_passive.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "damage_junkrat_avatar.png"
                      )
                    )}" height="48"><br>狂鼠<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_junkrat_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_junkrat_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_junkrat_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_junkrat_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_cassidy_avatar.png"
                      )
                    )}" height="48"><br>卡西迪<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_cassidy_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_cassidy_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_cassidy_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_cassidy_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_cassidy_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_mei_avatar.png"
                      )
                    )}" height="48"><br>美<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_mei_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_mei_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_mei_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_mei_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_mei_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_pharah_avatar.png"
                      )
                    )}" height="48"><br>法老之鹰<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_pharah_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_pharah_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_pharah_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_pharah_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "passive.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "damage_reaper_avatar.png"
                      )
                    )}" height="48"><br>死神<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_reaper_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_reaper_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_reaper_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_reaper_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_sojourn_avatar.png"
                      )
                    )}" height="48"><br>索杰恩<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sojourn_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sojourn_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sojourn_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sojourn_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sojourn_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_soldier-76_avatar.png"
                      )
                    )}" height="48"><br>士兵：76<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_soldier-76_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_soldier-76_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_soldier-76_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_soldier-76_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_soldier-76_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_sombra_avatar.png"
                      )
                    )}" height="48"><br>黑影<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sombra_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sombra_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sombra_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sombra_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_sombra_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_symmetra_avatar.png"
                      )
                    )}" height="48"><br>秩序之光<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_symmetra_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_symmetra_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_symmetra_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_symmetra_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_symmetra_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_torbjorn_avatar.png"
                      )
                    )}" height="48"><br>托比昂<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_torbjorn_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_torbjorn_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_torbjorn_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_torbjorn_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_torbjorn_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_tracer_avatar.png"
                      )
                    )}" height="48"><br>猎空<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_tracer_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_tracer_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_tracer_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_tracer_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "damage_widowmaker_avatar.png"
                      )
                    )}" height="48"><br>黑百合<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_widowmaker_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_widowmaker_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_widowmaker_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_widowmaker_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "damage_widowmaker_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    <h4 style="display: flex; align-items: center;"><div class="iconBox">
                      <img src="${webviewView.webview.asWebviewUri(
                        vscode.Uri.joinPath(
                          extensionUri,
                          "images",
                          "ow",
                          "hero",
                          "type",
                          "support.png"
                        )
                      )}" class="icon">
                    </div>
                    &nbsp;支援</h4>
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
                        "avatar",
                        "support_ana_avatar.png"
                      )
                    )}" height="48"><br>安娜<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_ana_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_ana_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_ana_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_ana_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_ana_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "support_baptiste_avatar.png"
                      )
                    )}" height="48"><br>巴蒂斯特<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_baptiste_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_baptiste_weapon2.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_baptiste_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_baptiste_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_baptiste_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_baptiste_passive.png"
                      )
                    )}" class="icon"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "support_brigitte_avatar.png"
                      )
                    )}" height="48"><br>布丽吉塔<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_brigitte_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_brigitte_secondaryfire1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_brigitte_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_brigitte_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_brigitte_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "support_kiriko_avatar.png"
                      )
                    )}" height="48"><br>雾子<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_kiriko_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_kiriko_weapon2.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_kiriko_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_kiriko_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_kiriko_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_kiriko_passive.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "support_lucio_avatar.png"
                      )
                    )}" height="48"><br>卢西奥<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lucio_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lucio_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lucio_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lucio_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lucio_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "passive.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "support_mercy_avatar.png"
                      )
                    )}" height="48"><br>天使<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_mercy_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_mercy_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_mercy_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_mercy_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_mercy_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_mercy_passive.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    </tr>

                    <tr>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "avatar",
                        "support_moira_avatar.png"
                      )
                    )}" height="48"><br>莫伊拉<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_moira_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_moira_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_moira_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_moira_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_moira_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "support_zenyatta_avatar.png"
                      )
                    )}" height="48"><br>禅雅塔<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_zenyatta_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_zenyatta_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_zenyatta_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_zenyatta_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_zenyatta_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "support_lifeweaver_avatar.png"
                      )
                    )}" height="48"><br>生命之梭<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lifeweaver_weapon1.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lifeweaver_secondaryfire.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lifeweaver_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lifeweaver_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_lifeweaver_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
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
                        "avatar",
                        "support_illari_avatar.png"
                      )
                    )}" height="48"><br>伊拉锐<br></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_illari_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_illari_weapon.png"
                      )
                    )}" height="32"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_illari_ultimate.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_illari_ability1.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "support_illari_ability2.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"><img src="${webviewView.webview.asWebviewUri(
                      vscode.Uri.joinPath(
                        extensionUri,
                        "images",
                        "ow",
                        "hero",
                        "ability",
                        "melee.png"
                      )
                    )}" class="icon"></td>
                    <td style="text-align: center;"></td>
                    <td style="text-align: center;"></td>
                    </tr>
                    </tbody>
                    </table>

                    </body>

                    </html>`;
          }

          function getProjectileTableHtml() {
            const projectile = MODEL.常量.弹道
              .map((element, index) => {
                return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
              })
              .join("");
            const projectileExplosion = MODEL.常量.弹道爆炸效果
              .map((element, index) => {
                return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
              })
              .join("");
            const projectileExplosionSound = MODEL.常量.弹道爆炸声音
              .map((element, index) => {
                return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
              })
              .join("");
            return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>弹道</title>
                    </head>
                    <body>
                    <br>
                    <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>
                    <i><h3>弹道</h3></i>
                    <table style="min-width: 300px; max-width: 525px;">
                    <tr>
                    ${projectile}
                    </tr>
                    </table>

                    <i><h3>弹道爆炸效果</h3></i>
                    <table style="min-width: 300px; max-width: 525px;">
                    <tr>
                    ${projectileExplosion}
                    </tr>
                    </table>

                    <i><h3>弹道爆炸声音</h3></i>
                    <table style="min-width: 300px; max-width: 525px;">
                    <tr>
                    ${projectileExplosionSound}
                    </tr>
                    </table>
                    </body>
                    </html>`;
          }

          function getEffectTableHtml() {
            const effects = MODEL.常量.效果
              .map((element, index) => {
                return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
              })
              .join("");
            const playerEffects = MODEL.常量.播放效果
              .map((element, index) => {
                return `</tr><tr><td style="text-align: center;">${element.名称}</td>`;
              })
              .join("");
            return `<!DOCTYPE html>
                    <html>
                    <head>
                    <link href="${styleUri}" rel="stylesheet">
                    <script src="${scriptUri}"></script>
                    <title>效果</title>
                    </head>
                    <body>
                    <br>
                    <button style="width: auto; height: 25px;" onclick="navigate('Home')">返回</button>

                    <i><h3>效果</h3></i>
                    <table style="min-width: 300px; max-width: 525px;">
                    <tr>
                    ${effects}
                    </tr>
                    </table>

                    <i><h3>播放效果</h3></i>
                    <table style="min-width: 300px; max-width: 525px;">
                    <tr>
                    ${playerEffects}
                    </tr>
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
              case "Mode":
                webviewView.webview.html = getModeTableHtml();
                return;
              case "Map":
                webviewView.webview.html = getMapTableHtml();
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
              case "Projectile":
                webviewView.webview.html = getProjectileTableHtml();
                return;
              case "Effect":
                webviewView.webview.html = getEffectTableHtml();
                return;
              default:
                console.log("Unknown command: " + message.command);
                return;
            }
          });
        } catch (error) {
          console.log("错误：resolveWebviewView 面板手册能力" + error);
        }
      },
    })
  );
}

module.exports = {
  activate,
};
