# I01 Agent 工具决策反馈问卷

这是一个基于 `I01_问卷_中文版.md` 制作的静态问卷网站，适合部署到 GitHub Pages。它包含：

- S0 筛选逻辑
- S1 关键事件锚定
- S2/S3 条件分支
- S2 原因量表随机排序
- 必答题校验
- 浏览器草稿保存
- 可配置提交端点
- 未配置端点时的 JSON 下载

## 本地预览

直接打开 `index.html` 即可预览。也可以用任意静态服务器：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 配置数据收集

GitHub Pages 只能托管静态页面，不能直接接收表单提交。要收集回答，请在 `config.js` 中配置 `submitEndpoint`。

推荐的轻量方案是 Google Apps Script + Google Sheets：

1. 新建一个 Google Sheet。
2. 打开 Extensions -> Apps Script。
3. 粘贴下面的脚本，把 `SHEET_NAME` 按需改掉。
4. Deploy -> New deployment -> Web app。
5. Execute as 选择自己，Who has access 选择 Anyone。
6. 复制 Web app URL，填入 `config.js` 的 `submitEndpoint`。

```js
const SHEET_NAME = "responses";

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["submittedAt", "studyId", "screenedOut", "answersJson"]);
  }

  sheet.appendRow([
    payload.submittedAt,
    payload.studyId,
    payload.answers.screenedOut || "",
    JSON.stringify(payload.answers)
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

`config.js` 示例：

```js
window.SURVEY_CONFIG = {
  studyId: "I01-agent-build-vs-adopt",
  submitEndpoint: "https://script.google.com/macros/s/你的部署ID/exec",
  submitMethod: "POST",
  submitHeaders: {
    "Content-Type": "text/plain;charset=utf-8"
  }
};
```

## GitHub Pages 部署

仓库推到 GitHub 后，进入 Settings -> Pages：

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

保存后，GitHub 会给出公开访问链接。

## 研究注意

正式发放前建议先用 5-8 人预测试，检查：

- S1 是否能稳定唤起一次具体事件
- S2 的原因项是否能区分
- 分支路径是否符合预期
- 总耗时是否控制在 6-8 分钟
