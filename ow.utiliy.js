const vscode = require("vscode");

//获取动态类型
function getDynamicType(text) {
  if (
    (match = text.match(
      /全局|For 全局变量|设置全局变量|修改全局变量|在索引处设置全局变量|在索引处修改全局变量|持续追踪全局变量|追踪全局变量频率|停止追踪全局变量/
    ))
  ) {
    return "全局变量";
  } else if ((match = text.match(/子程序|调用子程序|开始规则/))) {
    return "子程序";
  } else {
    return "玩家变量";
  }
}

//获取动态列表：[0]扩展，[1]全局变量，[2]玩家变量，[3]子程序
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
function getPrevValidWordRange(document, position, pattern, includingSelf) {
  let pos = position;
  let range = document.getWordRangeAtPosition(pos, pattern);
  if (!includingSelf) {
    pos = getPrevValidPosition(document, range ? range.start : pos);
    if (!pos) {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  }
  while (!range) {
    pos = getPrevValidPosition(document, range ? range.start : pos);
    if (!pos) {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  }
  return range;
}

//获取后一个合法单词范围
function getNextValidWordRange(document, position, pattern, includingSelf) {
  let pos = position;
  let range = document.getWordRangeAtPosition(pos, pattern);
  if (!includingSelf) {
    pos = getNextValidPosition(document, range ? range.end : pos);
    if (!pos) {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  }
  while (!range) {
    pos = getNextValidPosition(document, range ? range.end : pos);
    if (!pos) {
      return undefined;
    }
    range = document.getWordRangeAtPosition(pos, pattern);
  }
  return range;
}

//获取当前作用域
function getScope(document, position) {
  let rightBracesCount = 0;
  let semicolonCount = 0;
  const text = document.getText();
  const offset = document.offsetAt(position);
  for (let i = offset; i >= 0; i--) {
    const symbol = text[i];
    if (symbol == "{") {
      if (rightBracesCount > 0) {
        rightBracesCount--;
      } else {
        const pos = document.positionAt(i);
        const prevRange = getPrevValidWordRange(document, pos);
        const prevText = document.getText(prevRange);
        const nextRange = getNextValidWordRange(document, pos);
        const nextText = document.getText(nextRange);
        return {
          name: prevText,
          first: nextText,
          index: semicolonCount,
        };
      }
    } else if (symbol == "}") {
      if (rightBracesCount == 1) {
        return {
          name: "全局"
        };
      } else {
        rightBracesCount++;
      }
    } else if (symbol == ";") {
      semicolonCount++;
    }
  }
  console.log(`警告：getScope 性能问题`);
}

function getEntry(document, position, scope) {
  const text = document.getText();
  const offset = document.offsetAt(position);
  let commasCount = 0;
  let rightParenthesesCount = 0;
  for (let i = offset; i >= 0; i--) {
    const symbol = text[i];
    if (symbol == ".") {
      const pos = document.positionAt(i);
      const range = getPrevValidWordRange(document, pos);
      const text = document.getText(range);
      return getDynamicType(text);
    } else if (symbol == "{" || symbol == "[" || symbol == ";") {
      return scope.name;
    } else if (symbol == "[") {
      return "条件";
    } else if (symbol == "(") {
      if (rightParenthesesCount < 0) {
        return "条件";
      } else if (rightParenthesesCount == 0) {
        const pos = document.positionAt(i);
        const range = getPrevValidWordRange(document, pos, undefined, true);
        const text = document.getText(range);
        return {
          name: text,
          index: commasCount,
        };
      } else {
        rightParenthesesCount--;
      }
    } else if (symbol == ")") {
      if (i != offset) {
        rightParenthesesCount++;
      }
    } else if (symbol == ",") {
      if (i != offset && rightParenthesesCount == 0) {
        commasCount++;
      }
    }
  }
  console.log(`警告：getEntry 性能问题`);
}

module.exports = {
  getDynamicType,
  getDynamicList,
  getPrevValidPosition,
  getNextValidPosition,
  getPrevValidWordRange,
  getNextValidWordRange,
  getScope,
  getEntry,
};