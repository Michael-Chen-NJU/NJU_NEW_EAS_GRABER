# 南京大学新版教务系统抢课程序

## 使用方式

该js脚本只建议在选课开始阶段（整点开放瞬间）使用，有限时间内登录信息会失效

1. 首先，登录新版抢课系统，选择轮次，进入课程列表界面
2. \*若选课不止一个轮次，需要手动修改选课轮次，这时需要调用相关函数，获取选课轮次并修改相关变量，手动构造选课列表
3. 在浏览器(chrome，edge，firefox)中，按F12打开开发者工具，打开控制台(console)，将js代码全部复制进控制台，回车
4. 调用grab_favorite(time_gap/\*时间间隔，以微秒为单位\*/)，即可抢课

## 更新说明

2025-9-16 版本修复：
1. 现在所有选课请求都会经过AES加密处理，符合新版教务系统安全要求
2. 修复了选课轮次默认选择问题（现在默认选择第二个轮次）
3. 请求数据现在包含时间戳防止重复提交

## 加密说明

系统使用以下加密方式：
- 算法: AES/ECB/PKCS7Padding
- 密钥: 从window.avy获取
- 数据格式: JSON字符串 + "?timestrap=" + 时间戳

如果遇到加密错误，请检查：
1. 确保已加载CryptoJS库
2. 确认window.avy变量存在
3. 时间戳格式是否正确

## 手动构造选课列表（针对需要抢的专业课）

有些课程在“容量满/未开选”时也能点到“志愿”接口。可通过抓包获得加密参数并还原出关键字段，加入脚本的 `manual_course_list`，与收藏列表一起循环抢。

### 步骤一：手动点击目标课程，抓取最近一次 volunteer.do 请求

- 打开 F12 → Network，筛选 `volunteer.do`
- 在该请求的 Form Data 或 Payload 中找到 `addParam`（看起来是很长的 Base64）

示例：
addParam: Rh/BfmEHRdiA3gS4...（省略）


### 步骤二：在控制台解密 addParam，提取课程关键字段

先确保页面存在 CryptoJS 与 `window.avy`（通常系统已加载）。将上一步获得的addParam密文复制到todo处，也即const cipher = "";处。
在 Console 复制并运行decyptParam.js
在控制台输出中，定位：
```
teachingClassId（示例："2025202610300162001"）
courseKind（示例："1"）
teachingClassType（示例："ZY"）
electiveBatchCode（通常也会出现，建议一并记录）
```
### 步骤三：将字段填入脚本的手动列表
在主脚本顶部的 manual_course_list 中加入对象，字段名务必与脚本一致：

```javascript

let manual_course_list = [
  // 示例：专业课
  {
    teachingClassID: "2025202610300162001",
    courseKind: "1",
    teachingClassType: "ZY",
    // electiveBatchCode 可留空走全局，也可指定覆盖
    // electiveBatchCode: "0ebaaeb42d154d3fa132bbf6df0b02c8"
  },

  // 你可以继续追加更多课程
  // { teachingClassID: "...", courseKind: "12", teachingClassType: "KZY" },
];
```

#### 注意：

- 属性名在脚本中使用的是 teachingClassID（大写 ID），和接口里的 teachingClassId 大小写不同，请勿写错。
- 如你为某条手动课程提供了 electiveBatchCode 字段，抢课时会优先使用该值；否则回退到全局默认轮次。

### 课程类型配置参考
在调用 grab 时，三个关键字段对应不同大类：

```javascript
专业课：courseKind: "1", teachingClassType: "ZY"
跨专业：courseKind: "12", teachingClassType: "KZY"
体育：courseKind: "2", teachingClassType: "TY"
公选：courseKind: "6", teachingClassType: "GG01"
通识：courseKind: "7", teachingClassType: "GG02"
阅读：courseKind: "8", teachingClassType: "YD"
```
请以系统实际返回为准。如遇不一致，以抓包解密结果优先。

### 常用指令与流程
打印并核对轮次与收藏列表
```javascript
get_electiveBatchCode();   // 控制台打印各轮次 name 与 code（脚本默认取第二个）
print_favorite();          // 打印收藏课程条目（包含 teachingClassID 等）
```
开始循环抢课（合并收藏 + 手动列表）
```javascript
grab_favorite(800); // 每 800ms 执行一轮
```
仅用当前列表执行一轮（不循环）
```javascript
get_electiveBatchCode();
get_favorite_and_grab((list) => grab_from_list(list));
```
临时清状态（遇到“请按顺序选课”时）
```javascript
status_clear(global_studentCode);
```

### 风控与故障排查
- 报错“参数异常/加密错误”

    -  检查 window.avy 是否存在。

    - 确认明文被附加了 ?timestrap=...。

    - 检查是否重复对字符串做了 JSON.stringify（应只做一次）。

- 报错“请按顺序选课”

在每次抢课前已调用 status_clear，若仍出现，适当增大 time_gap，或先按顺序补齐前置课程。

- 报错“限流/频繁”

增大 time_gap，混入随机抖动（例如 time_gap + Math.random()*200）。

- 一直无响应
检查登录态 sessionStorage.token 是否过期，建议刷新页面重新登录。

检查 electiveBatchCode 是否匹配当前页面轮次。

## 免责声明
脚本仅供学习与技术研究，请遵循学校选课规定，合理设置请求频率。
因使用不当造成的一切后果由使用者自行承担。