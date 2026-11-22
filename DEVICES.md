# Vela Translate — 圆屏分支（round-466-480）支持机型

> 本分支产出是“布局已适配、构建已通过的 rpk”，上表安装未经验证。

## 覆盖机型

| 机型 | 屏幕 | 形状 | 状态 |
| --- | --- | --- | --- |
| Xiaomi Watch S3 | 466×466 | 圆屏 | 已有适配（主线 1.0.11 同款几何），本分支未改 |
| Xiaomi Watch S4 | 466×466 | 圆屏 | 同上 |
| Xiaomi Watch S5 41mm | 466×466 | 圆屏 | 同 466 几何，未单独改 |
| Xiaomi Watch S5 46mm | 480×480（1.48" 圆屏） | 圆屏 | 本分支新增适配 |

说明：Watch S5 46mm 的分辨率多方比对为 480×480，个别来源写 466。本分支用 `@media (min-width: 475) and (max-width: 485) and (shape: circle)` 的宽度区间覆盖 480，同时不命中 466，两者互不干扰。即使某台 S5 46mm 实际报 466，也会落到原有的 466 几何上，不会错乱。

## 本分支改了什么（相对主线 1.0.11，code 12）

版本：`versionName 1.1.0-round`，`versionCode 13`。

- `src/common/app.css`：新增 480 圆屏覆盖块（`@media (device-type: watch) and (min-width: 475) and (max-width: 485) and (shape: circle)`）：
  - `.rightButton` 的 `left`：302 → 316（480 − 92 − 72，右侧顶栏按钮）。
  - `.bottom.leftButton` / `.bottom.rightButton` 的 `left`：197 → 204（480 中心 240 减半个 72px 按钮 36，底部居中按钮）。
  - 466 的现有值全部未动。
- `src/pages/index/index.ux`：style 区新增同样的 480 媒体查询覆盖块：
  - 编辑态顶栏按钮 `.edit-top-left` 的 `left`：118 → 125；`.edit-top-right`：288 → 295（480 中心 240；466 下为 118 / 288，中心 233，不动）。
- 未改动：
  - `src/components/InputMethod/InputMethod.ux` 已有的 `@media (min-width: 460) and (max-width: 470) and (shape: circle)` 0.97 缩放只命中 466，480 不命中——键盘按 480 坐标系设计，在 480 屏上正好原尺寸使用，留着别动。
  - `manifest.json` 已是 `designWidth: device-width`，无需改。
  - 百度翻译 APPID / 密钥不在代码和包里：`src/common/baidu.js` 的凭据只从 storage 读取（无凭据时翻译失败并提示“未填入百度翻译 APPID 和密钥”），凭据由手机端 AstroBox 插件推送。

## 引擎铁律（本分支遵守）

- 绝对定位 `right` 不生效，右侧位置一律换算成 `left`。
- 布局显隐用 `if`；覆盖层按钮常驻 DOM + `show` 显隐，且放模板最后（最上层绘制）。
- 键盘子树首次弹出才创建；低内存优先，用原生 UI。

## 已知限制

- 本分支的 480 几何是按 480×480 圆屏的内切几何换算的，未在 Watch S5 46mm 真机上验证过：顶栏按钮、底部居中按钮、编辑态顶栏按钮的位置需上表确认，必要时按真机照片再调。
- 输入法键盘在 480 屏上不缩放（沿用 480 坐标系原尺寸），键盘与屏幕边缘的贴合程度需真机确认。
- 页面其余宽度（如语言行、输入框的 76% 宽）是按比例排版的，480 下自动放大，未逐项核对。
- 本分支 rpk 用本地自签名证书签名，仅供侧载测试，不是应用商店发布签名。

## 不支持

- **Xiaomi Watch 5 是 Wear OS 手表（骁龙 W5+，Wear OS 4），跑不了 Vela 快应用，不在本分支范围。** 本分支只覆盖上面列出的 Vela 系统圆屏手表。
