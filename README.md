# Vela Translate

小米手表 / 手环上的翻译应用，用百度翻译 API。已适配三种屏幕形态，见 [v1.1.0 发布](https://github.com/kaoyu555666777/Vela-Translate/releases/tag/v1.1.0)（三个安装包在同一个 Release 里）：

| 版本 | 机型 | 屏幕 | 分支 |
| --- | --- | --- | --- |
| 1.1.0-round | Watch S3 / S4、Watch S5 41mm（466×466）、Watch S5 46mm（480×480） | 圆屏 | round-466-480 |
| 1.1.0-rect | Redmi Watch 5 / 6 | 方屏 432×514 | rect-432x514 |
| 1.1.0-band | 手环 9（192×490）、手环 10（212×520） | 窄屏 | band-192-212 |

注意：S5、Redmi Watch、手环版本均未经真机验证；Redmi Watch 和手环没有官方第三方应用安装渠道。小米 Watch 5 是 Wear OS 手表，不能运行 Vela 应用。

## 功能

- 源语言：自动检测 / 英语 / 中文 / 日语，点按循环
- 目标语言：简体中文 / 繁体中文 / 英语 / 日语 / 韩语 / 法语 / 德语 / 俄语，点按循环，可互换（互换目标语言限英 / 中 / 日）
- 键盘：中文 + 英文 + 日语，26 键全键盘与九键 T9 可切换（设置页切换，重启后保留；手环版只用九键）
- 输入上限 200 字
- 设置 / 关于 / 编译信息 / 开放源代码许可页面

## 构建

需要小米 AIoT-IDE 自带的 aiot-toolkit（node_modules 已随项目提供）：

```sh
npm run build    # 调试版
npm run release  # 发布版（JSC + 自签证书侧载）
```

三个分支各在自己的工作区构建，包名同为 `com.kaoyu666.translate`，请勿在同一台设备上混装。

## 凭据

翻译需要百度翻译 API 的 APPID 和密钥。源码和安装包里不放任何凭据（1.0.5 起已清理）：
凭据由手机端 AstroBox 插件「Vela Translate 凭据发送」经 Interconnect 发到手表，
手表存入 storage（`baiduAppid`/`baiduKey`），翻译时每次从 storage 读。设置页的令牌行
只显示已设置/未设置，不显示密钥；5 秒内点两次可清除。
