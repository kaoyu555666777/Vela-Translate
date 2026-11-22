// 手机插件经 Interconnect 推送凭据的接收端。
// 官方示例：import interconnect from "@system.interconnect"，
// conn = interconnect.instance()，conn.onmessage 收 {data: string}。
// 消息格式：{"type":"baidu-credentials","appid":"...","key":"..."}
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
    if (!appid || !key) {
      sendAck(false, "凭据为空")
      return
    }
    saveCredentials(appid, key, function () {
      prompt.showToast({ message: "已收到百度翻译凭据" })
      sendAck(true)
    })
  }
  conn.onopen = function () {}
  conn.onclose = function () {}
  conn.onerror = function () {}
}

function sendAck(ok, error) {
  if (!conn) return
  const payload = { type: "credentials-ack", ok: ok }
  if (!ok && error) payload.error = error
  const data = JSON.stringify(payload)
  // 回执曾经发丢过（插件侧 15 秒等不到）：连接没就绪或发送失败就隔 1 秒重试，最多 3 次
  let tries = 0
  function attempt() {
    tries++
    try {
      if (conn.getReadyState) {
        const st = conn.getReadyState()
        if (st !== 1) {
          console.log("ack not ready, state", st, "try", tries)
          if (tries < 3) setTimeout(attempt, 1000)
          return
        }
      }
    } catch (e) {}
    try {
      conn.send({
        data: data,
        success: function () { console.log("ack sent") },
        fail: function () {
          console.log("ack send failed, try", tries)
          if (tries < 3) setTimeout(attempt, 1000)
        }
      })
    } catch (e) {
      console.log("ack send throw", e)
      if (tries < 3) setTimeout(attempt, 1000)
    }
  }
  attempt()
}
