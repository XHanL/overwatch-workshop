const vscode = require("vscode");

//获取动态列表：扩展，全局变量，玩家变量，子程序
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

//获取前一个合法位置
function getPrevValidPosition(document, pos) {
  if (pos.character > 0) {
    return pos.translate(0, -1);
  } else if (pos.line > 0) {
    return document.lineAt(pos.line - 1).range.end;
  } else {
    console.log(`警告：已是最前的 Valid Position`);
    return undefined;
  }
}

//获取后一个合法位置
function getNextValidPosition(document, pos) {
  if (pos.character < document.lineAt(pos.line).range.end.character) {
    return pos.translate(0, 1);
  } else if (pos.line < document.lineCount) {
    return document.lineAt(pos.line + 1).range.start;
  } else {
    console.log(`警告：已是最后的 Valid Position`);
    return undefined;
  }
}

//获取前一个合法单词范围
function getPrevValidWordRange(document, position, pattern) {
  let pos = position;
  let range = document.getWordRangeAtPosition(pos, pattern);
  do {
    pos = getPrevValidPosition(document, range ? range.start : pos);
    if (!pos) {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  } while (!range);
  return range;
}

//获取后一个合法单词范围
function getNextValidWordRange(document, position, pattern) {
  let pos = position;
  let range = document.getWordRangeAtPosition(pos, pattern);
  do {
    pos = getNextValidPosition(document, range ? range.end : pos);
    if (!pos) {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  } while (!range);
  return range;
}

module.exports = {
  getDynamicList,
  getPrevValidPosition,
  getNextValidPosition,
  getPrevValidWordRange,
  getNextValidWordRange,
};
