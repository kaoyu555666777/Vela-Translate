// 手机插件经 Interconnect 推送凭据的接收端。
// 官方示例：import interconnect from "@system.interconnect"，
// conn = interconnect.instance()，conn.onmessage 收 {data: string}。
// 消息格式：{"type":"baidu-credentials","appid":"...","key":"..."}
// 收到后存 storage，翻译时从 storage 读。不回发回执。
import interconnect from "@system.interconnect"
import prompt from "@system.prompt"
import { saveCredentials } from "./credentials.js"

let conn = null
let started = false

export function setupInterconnect() {
  if (started) return
  started = true
  try {
    conn = interconnect.instance()
  } catch (e) {
    console.log("interconnect init fail", e)
    return
  }
  conn.onmessage = function (data) {
    const raw = (data && data.data) || ""
    let msg = null
    try {
      msg = JSON.parse(raw)
    } catch (e) {
      return
    }
    if (!msg || msg.type !== "baidu-credentials") return
    const appid = String(msg.appid || "").trim()
    const key = String(msg.key || "").trim()
    if (!appid || !key) return
    saveCredentials(appid, key, function () {
      prompt.showToast({ message: "已收到百度翻译凭据" })
    })
  }
  conn.onopen = function () {}
  conn.onclose = function () {}
  conn.onerror = function () {}
}
