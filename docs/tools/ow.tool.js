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
    let obj = MODEL.常量;

    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item) => {
          if (item.名称) {
            item.拼音 = require("pinyin-pro")
              .pinyin(item.名称, {
                toneType: "none",
                type: "array",
              })
              .join(" ");
          }
        });
      } else if (typeof obj[key] === "object") {
        addPinyin(obj[key]);
      }
    }

    const outputString = JSON.stringify(obj, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}

function buildPinYinPropertyToObjectElement() {
  try {
    let obj = MODEL.常量;

    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item) => {
          if (item.名称) {
            item.拼音 = require("pinyin-pro")
              .pinyin(item.名称, {
                toneType: "none",
                type: "array",
              })
              .join(" ");
          }
        });
      } else if (typeof obj[key] === "object") {
        addPinyin(obj[key]);
      }
    }

    const outputString = JSON.stringify(obj, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}

function buildPinYinToSubSubObject() {
  try {
    let obj = MODEL.规则.事件;

    for (const key in obj) {
      if (typeof obj[key] === "object") {
        for (const subKey in obj[key]) {
          if (typeof obj[key][subKey] === "object") {
            // Assuming you have a getPinyin function to get the 拼音
            obj[key][subKey].拼音 = require("pinyin-pro")
              .pinyin(subKey, {
                toneType: "none",
                type: "array",
              })
              .join(" ");
          }
        }
      }
    }

    const outputString = JSON.stringify(obj, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}

function buildPinYinToSubObject() {
  try {
    //先换成字符串防止属性展开
    //选项: 常量\.(.*), | 选项: "常量.$1",

    //完成后替换回来
    //选项: "常量\.(.*)", | 选项: 常量.$1,

    let obj = MODEL.规则.条件;

    for (const key in obj) {
      obj[key].拼音 = require("pinyin-pro")
        .pinyin(key, {
          toneType: "none",
          type: "array",
        })
        .join(" ");
    }

    const outputString = JSON.stringify(MODEL.规则.条件, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}

function buildPinYinToSubObject() {
  try {
    //先换成字符串防止属性展开
    //选项: 常量\.(.*), | 选项: "常量.$1",

    //完成后替换回来
    //选项: "常量\.(.*)", | 选项: 常量.$1,

    let sampleObject = MODEL.规则.动作;

    function replaceProperty(obj, propName, replacement) {
      if (typeof obj === "object") {
        if (obj.hasOwnProperty(propName)) {
          obj[propName] = obj[propName]
            .split(" ")
            .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
            .join(" ");
        }
        for (var key in obj) {
          if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
            replaceProperty(obj[key], propName, replacement);
          }
        }
      }
    }

    replaceProperty(sampleObject, "拼音", sampleObject["拼音"]);

    const outputString = JSON.stringify(MODEL.规则.动作, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}

function buildPinYinToSubObject() {
  try {
    //先换成字符串防止属性展开
    //选项: 常量\.(.*), | 选项: "常量.$1",

    //完成后替换回来
    //选项: "常量\.(.*)", | 选项: 常量.$1,

    let obj = MODEL.常量;

    for (const key in obj) {
      for (const subKey in obj[key]) {
        for (const subsubKey in obj[key][subKey]) {
          if (subsubKey == "拼音") {
            console.log(obj[key][subKey][subsubKey]);
            obj[key][subKey][subsubKey] = obj[key][subKey][subsubKey]
              .split(" ")
              .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
              .join(" ");
          }
        }
      }
    }

    const outputString = JSON.stringify(MODEL.常量, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}

function buildPinYinToSubObject() {
  try {
    //先换成字符串防止属性展开
    //选项: 常量\.(.*), | 选项: "常量.$1",

    //完成后替换回来
    //选项: "常量\.(.*)", | 选项: 常量.$1,

    let obj = MODEL.扩展;

    for (const key in obj) {
      obj[key].拼音 = require("pinyin-pro")
        .pinyin(key, {
          toneType: "none",
          type: "array",
        })
        .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
        .join(" ");
    }

    const outputString = JSON.stringify(MODEL.扩展, null, 2);
    fs.writeFileSync(
      "/Users/x/Desktop/overwatch-workshop/overwatch-workshop/output.txt",
      outputString,
      "utf-8"
    );
  } catch (error) {
    console.log(error);
  }
}
