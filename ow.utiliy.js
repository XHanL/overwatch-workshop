const vscode = require("vscode");

//获取扩展，全局变量，玩家变量，和子程序
function getDynamicList(document) {
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

//获取合法前缀范围
function getPrefixRange(document, position, pattern) {
  let pos = position;
  let range = document.getWordRangeAtPosition(pos);
  while (!range) {
    if (pos.character > 0) {
      pos = pos.translate(0, -1);
    } else if (pos.line > 0) {
      pos = document.lineAt(pos.line - 1).range.end;
    } else {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  }
  return range;
}

//获取合法上一个词范围
function getPrevWordRange(document, position, pattern) {
  let pos = position;
  let range = document.getWordRangeAtPosition(pos);
  if (range) {
    pos = range.start;
    if (pos.character > 0) {
      pos = pos.translate(0, -1);
    } else if (pos.line > 0) {
      pos = document.lineAt(pos.line - 1).range.end;
    } else {
      return undefined
    }
    range = document.getWordRangeAtPosition(pos);
  }
  while (!range) {
    if (pos.character > 0) {
      pos = pos.translate(0, -1);
    } else if (pos.line > 0) {
      pos = document.lineAt(pos.line - 1).range.end;
    } else {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  }
  return range;
}

module.exports = {
  getDynamicList,
  getPrefixPatternRange: getPrevWordRange,
};
