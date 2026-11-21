# 翻译（Vela-Translate）

小米手表（Watch S3/S4 圆屏 466×466）上的翻译应用，用百度翻译 API。

## 功能

- 源语言：自动检测 / 英语 / 中文，点按循环
- 目标语言：简体中文 / 繁体中文 / 英语 / 日语 / 韩语 / 法语 / 德语 / 俄语，点按循环，可互换
- 中文 + 英文 26 键全键盘（已移除 T9）
- 输入上限 200 字

## 构建

需要小米 AIoT-IDE 自带的 aiot-toolkit（node_modules 已随项目提供）：

```sh
npm run build    # 调试版
npm run release  # 发布版（JSC + 自签证书侧载）
```

## 凭据

翻译需要百度翻译 API 的 APPID 和密钥，填在 `src/common/baidu.js` 的 `APPID` 和 `KEY` 里。
密钥嵌在安装包里即可被提取，rpk 别外发；仓库里不放任何凭据。
