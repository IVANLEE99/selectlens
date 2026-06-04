# SelectLens

一个最小可用的 Chrome 插件 MVP：在网页中选中文本后，点击插件图标即可自动识别并解析：

- Base64 文本
- 10 位 Unix 时间戳（秒）
- 13 位 Unix 时间戳（毫秒）

并支持一键复制解析结果。

See [CHANGELOG.md](CHANGELOG.md) for notable changes. Future user-visible changes should be added to the changelog as part of the same update.

## 功能

### 1. Base64 自动识别与解码
- 选中合法 Base64 文本
- 打开插件弹窗
- 显示解码后的 UTF-8 文本
- 支持复制完整结果

### 2. 时间戳自动识别
- 选中 10 位数字：按秒级时间戳解析
- 选中 13 位数字：按毫秒级时间戳解析
- 展示本地时间与 ISO 时间
- 支持复制完整结果

### 3. 空状态与失败提示
- 没有选中文本时提示用户先选择内容
- 选中内容不符合规则时，明确提示暂不支持
- 在 Chrome 内置页等受限页面上，提示当前页面不支持

## 目录结构

- `manifest.json`：Chrome Extension Manifest V3 配置
- `content.js`：读取页面选区并做解析
- `popup.html`：插件弹窗结构
- `popup.css`：弹窗样式
- `popup.js`：请求解析结果并处理复制

## 本地加载方式

1. 打开 Chrome
2. 进入 `chrome://extensions/`
3. 打开右上角“开发者模式”
4. 点击“加载已解压的扩展程序”
5. 选择当前目录：`selectlens/`

## 使用方式

1. 打开任意普通网页
2. 选中一段 Base64 或 10/13 位时间戳
3. 点击浏览器工具栏中的插件图标
4. 查看解析结果
5. 点击“复制结果”按钮

## Release

SelectLens 使用轻量手动发布流程，不引入额外发版自动化。

### Versioning
- 使用 SemVer：`x.y.z`
- `manifest.json` 中的 `version` 是插件发布版本的唯一事实来源
- Patch：bug 修复和小型非破坏性更新
- Minor：新增用户可见功能
- Major：不兼容变更或显著行为调整

### Coordination rules
- 没有对应 changelog 条目，不应只改版本号
- 没有对应 tag，不应视为正式 release
- `manifest.json` 版本、`CHANGELOG.md` 版本标题、git tag 必须一致

### Release checklist
1. 确认当前改动已完成并准备发布
2. 更新 `manifest.json` 的 `version`
3. 将 `CHANGELOG.md` 中的 `Unreleased` 内容整理进对应版本标题，例如 `## v0.1.1 - 2026-06-04`
4. 重新创建新的 `Unreleased` 小节，作为下一轮迭代入口
5. 在 Chrome 中以 unpacked extension 方式做一次 smoke test
6. 提交 release commit，例如 `release(selectlens): v0.1.1`
7. 创建 annotated tag，例如 `selectlens-v0.1.1`
8. push commit 和 tag

### Smoke test
- 确认扩展可以被 Chrome 正常加载
- 确认 manifest 无报错
- 确认核心能力仍然可用
- Base64 解析正常
- 10/13 位时间戳解析正常
- 复制功能正常

## Chrome Web Store 文案

### 标题
SelectLens

### 短描述
Select any text to instantly decode Base64, format timestamps, and copy results.

### 简介
SelectLens helps you inspect selected text on any webpage. Instantly decode Base64, convert 10-digit or 13-digit Unix timestamps into readable time, and copy results with one click. Built for developers, testers, and anyone who works with encoded or time-based data online.

## 权限说明

- `activeTab`：读取当前活动标签页并向内容脚本发消息
- `tabs`：查询当前活动标签页 ID，用于 popup 和页面之间通信

## 已知限制

- 当前版本采用“选中后点击 popup 查看结果”的交互，不是页面内悬浮卡片
- 仅支持标准 Base64，未专门适配 URL-safe Base64
- Base64 解码结果要求可被解析为 UTF-8 文本，二进制内容不会展示
- 在 `chrome://` 等受限页面中无法读取选区

## 后续可扩展方向

- 右键菜单触发
- 页面内悬浮卡片
- URL-safe Base64 支持
- JWT / URL Decode / JSON Format 等更多调试工具
