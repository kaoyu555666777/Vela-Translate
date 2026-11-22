// 百度翻译凭据：只存手表本地 @system.storage，不进源码、不进安装包。
// 由手机插件经 Interconnect 推送写入；翻译时读取。
import storage from "@system.storage"

let cacheAppid = ""
let cacheKey = ""
let loaded = false

function sget(key) {
  return new Promise(function (resolve) {
    storage.get({
      key: key,
      success: function (v) { resolve(v || "") },
      fail: function () { resolve("") },
      complete: function () {}
    })
  })
}

function sset(key, value) {
  return new Promise(function (resolve) {
    storage.set({
      key: key,
      value: value,
      success: function () { resolve() },
      fail: function () { resolve() },
      complete: function () {}
    })
  })
}

// 读凭据（首次读 storage，之后读缓存；插件推送写入时会同步更新缓存）
export function loadCredentials(callback) {
  if (loaded) {
    if (callback) callback(cacheAppid, cacheKey)
    return
  }
  sget("baiduAppid").then(function (a) {
    return sget("baiduKey").then(function (k) {
      cacheAppid = a
      cacheKey = k
      loaded = true
      if (callback) callback(cacheAppid, cacheKey)
    })
  })
}

// 写凭据（缓存同步先行，storage 异步跟进）
export function saveCredentials(appid, key, callback) {
  cacheAppid = appid
  cacheKey = key
  loaded = true
  sset("baiduAppid", appid).then(function () {
    return sset("baiduKey", key)
  }).then(function () {
    if (callback) callback()
  })
}

export function clearCredentials(callback) {
  saveCredentials("", "", callback)
}
