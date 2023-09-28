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
  for (i in MODEL.规则.条件) {
    str += "|" + i;
  }
  for (i in MODEL.规则.动作) {
    str += "|" + i;
  }
  sortAndFilterChineseKeyword(str.slice(1));
}

//调试工具：对象属性数组化
function convertObjectToArray() {
  try {
    const inputObject = MODEL.规则.条件;

    const outputArray = [];

    // Sort the property names
    const sortedPropNames = Object.keys(inputObject).sort((b, a) =>
      a.localeCompare(b, "zh-Hans-CN")
    );

    for (const propName of sortedPropNames) {
      const prop = inputObject[propName];

      const outputItem = {
        match: propName,
      };

      if (prop.hasOwnProperty("参数")) {
        outputItem.patterns = prop["参数"].map((param) => {
          return {
            include: `#${param["类型"]}`,
          };
        });
      }

      outputArray.push(outputItem);
    }

    const outputString = JSON.stringify(outputArray, null, 2);

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
        .join(" ");

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
