# SelectLens

一个最小可用的 Chrome 插件 MVP：在网页中选中文本后，自动识别并解析：

- Base64 文本
- 10 位 Unix 时间戳（秒）
- 13 位 Unix 时间戳（毫秒）

解析结果会以页面内悬浮卡片展示，并支持一键复制。

See [CHANGELOG.md](CHANGELOG.md) for notable changes. Future user-visible changes should be added to the changelog as part of the same update.

## 功能

### 1. Base64 自动识别与解码
- 选中合法 Base64 文本
- 页面内自动显示 SelectLens 悬浮卡片
- 显示解码后的 UTF-8 文本
- 支持复制完整结果

### 2. 时间戳自动识别
- 选中 10 位数字：按秒级时间戳解析
- 选中 13 位数字：按毫秒级时间戳解析
- 展示本地时间与 ISO 时间
- 支持复制完整结果

### 3. 轻量悬浮卡片
- 只在识别到 Base64 或 10/13 位时间戳时显示
- 使用 Shadow DOM 隔离样式，避免影响网页本身
- 支持关闭按钮、Esc、点击外部、滚动或窗口变化时隐藏

## 目录结构

- `manifest.json`：Chrome Extension Manifest V3 配置
- `content.js`：读取页面选区、执行解析，并渲染页面内悬浮卡片
- `popup.html` / `popup.css` / `popup.js`：旧版 popup 交互文件，当前 manifest 不再引用，保留作短期参考
- `assets/icons/`：扩展图标资源
- `docs/`：上架清单、隐私政策、截图素材和演示页

## 本地加载方式

1. 打开 Chrome
2. 进入 `chrome://extensions/`
3. 打开右上角“开发者模式”
4. 点击“加载已解压的扩展程序”
5. 选择当前目录：`selectlens/`

## 使用方式

1. 打开任意普通网页
2. 选中一段 Base64 或 10/13 位时间戳
3. 查看页面内自动出现的 SelectLens 悬浮卡片
4. 点击“复制结果”按钮复制解析结果
5. 可通过关闭按钮、Esc、点击外部、滚动页面或清空选区隐藏卡片

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
3. 将 `CHANGELOG.md` 中的 `Unreleased` 内容整理进对应版本标题，例如 `## v0.1.1 - 2026-06-05`
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
- 悬浮卡片可正常显示与关闭

## Chrome Web Store 文案

### 标题
SelectLens

### 短描述
Select any text to instantly decode Base64, format timestamps, and copy results.

### 简介
SelectLens helps you inspect selected text directly on webpages. Instantly decode Base64, convert 10-digit or 13-digit Unix timestamps into readable time, and copy results with one click. Built for developers, testers, and anyone who works with encoded or time-based data online.

## 权限说明

SelectLens 当前不请求额外 Chrome 扩展权限。扩展通过 content script 在普通网页中检测用户主动选中的文本，并在本地渲染解析结果。

## 已知限制

- 仅支持标准 Base64，未专门适配 URL-safe Base64
- Base64 解码结果要求可被解析为 UTF-8 文本，二进制内容不会展示
- 在 `chrome://` 等受限页面中无法读取选区
- input / textarea 内的悬浮卡片位置使用输入框级别的简化定位

## 后续可扩展方向

- 右键菜单触发
- URL-safe Base64 支持
- JWT / URL Decode / JSON Format 等更多调试工具
- 悬浮卡片位置和动效进一步优化
