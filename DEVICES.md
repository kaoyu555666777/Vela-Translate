# Vela Translate — 方屏分支（rect-432x514）

> 本分支产出是“布局已适配、构建已通过的 rpk”，上表安装未经验证。
>
> 另请注意：Redmi Watch 5 / 6 官方没有第三方应用支持（多方评测列为明确限制），
> 即使布局与构建都没有问题，也不保证能在表上安装或运行。

## 覆盖机型与屏幕参数

| 机型 | 屏幕 | 分辨率 | 形状 |
| --- | --- | --- | --- |
| Redmi Watch 5 | 2.07" AMOLED | 432×514 | 方屏 rect |
| Redmi Watch 6 | 2.07" AMOLED | 432×514 | 方屏 rect |

- 两台是同一块屏，同一套布局同时覆盖。
- 本分支从主仓库 main `b640d74`（1.0.11，code 12）分出，版本改为 **1.1.0-rect（code 13）**，
  包名不变：`com.kaoyu666.translate`。
- 390×450 的 Redmi Watch 6 Active 是另一块屏，不在本分支范围。

## 改了什么（相对 1.0.11）

- **主页顶部**（`src/pages/index/index.ux`，方屏覆盖块）：
  方屏顶边没有弧形，时钟/标题上移（time top 20→8，title top 48→36），
  `.padding` 由 92px 改为 **76px**（标题下沿约 68px，留 8px 间隙）。
  只动方屏，圆屏 92px 不变。
- **编辑态按钮**（同上）：按 432 中心 216 对称换算，
  left 由 118/288 改为 **101/271**；top 由 40 改为 24
  （按钮下沿 84，与 76px 处的输入行重叠 8px，与圆屏一致）。
  右侧位置用 left，不用 right（引擎下绝对定位 right 不生效）。
- **输入法键盘缩放**（`src/components/InputMethod/InputMethod.ux`）：
  新增 `@media (min-width: 425) and (max-width: 440) and (shape: rect)` 覆盖块，
  `#full-keyboard` 与 `#t9-keyboard` 统一缩放 **0.9**（480×0.9=432），
  `transform-origin: 0 321px` 锚定左下角，仿照圆屏 0.97 缩放的写法。
- **各子页面已检查，无需改**（settings / about / buildinfo / licenses）：
  行宽均为 76%（432 下 328px，内容放得下），字号 20/26px 不用动；
  各页顶部空位是 `spacer-large` 140px、底部 `.padding` 92px 是底 spacer，
  不是主页那种顶部垫高，故不动。
- **凭据**：`src/common/baidu.js` 里无 APPID/KEY（从手表 storage 读，空则报错），
  本分支未加入任何凭据，包里也没有凭据。

## 已知限制 / 未验证

- 上表安装未经验证：无 Redmi Watch 5/6 真机，未在表上跑过。
- Redmi Watch 5/6 官方没有第三方应用支持（多方评测列为明确限制）；
  本分支只解决“布局尺寸”，不解决“能不能装、装上能不能跑 Vela 快应用”。
- 方屏 0.9 键盘缩放块针对的是 480 坐标系的 `#full-keyboard` / `#t9-keyboard`
  （圆屏分支的键盘）；方屏设备实际走 InputMethod 里 `screentype==='rect'` 的
  100% 宽 flex 键盘分支（自适应宽度，无需缩放），0.9 块只在圆屏分支被实例化时才生效。
  两套键盘在 432 宽下的实际显示都未经真机验证。
- `.padding` 76px、按钮 top 24 等数值是按 32px 标题字高估算的，未经真机确认；
  如上表后发现标题与首行重叠或按钮压住输入行，需按真机照片再调。
- 子页面顶部 `spacer-large` 140px 在 514 高下方屏上偏大（内容可滚动，无功能影响），
  本分支未动，如需收紧可后续再改。
- 发布包用本地自签名证书签名，仅供侧载测试，不是商店发布签名。

## 不支持

- **Xiaomi Watch 5**：Wear OS 手表（骁龙 W5+，Wear OS 4），跑不了 Vela 快应用，
  不在本分支范围。
- Redmi Watch 6 Active（390×450）：另一块屏，不在本分支范围。
- 圆屏 Xiaomi Watch S3/S4：走主分支，不走本分支。
