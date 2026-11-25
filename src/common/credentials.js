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
      success: function () { resolve(true) },
      fail: function () { resolve(false) },
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

// 写凭据：写 storage 成功后，再从 storage 读回校验，
// 只有写进去且读得回来才算成功、才更新缓存并回调 ok=true。
// 之前 sset 成功失败都 resolve，"已收到"的提示可能是假的——写失败了也照样弹，
// 设置页自然还是未设置。失败时不更新缓存，回调 ok=false。
export function saveCredentials(appid, key, callback) {
  sset("baiduAppid", appid).then(function (ok1) {
    return sset("baiduKey", key).then(function (ok2) {
      return ok1 && ok2
    })
  }).then(function (ok) {
    if (!ok) {
      if (callback) callback(false)
      return
    }
    return sget("baiduAppid").then(function (a) {
      return sget("baiduKey").then(function (k) {
        if (a === appid && k === key) {
          cacheAppid = appid
          cacheKey = key
          loaded = true
          if (callback) callback(true)
        } else {
          if (callback) callback(false)
        }
      })
    })
  })
}

export function clearCredentials(callback) {
  saveCredentials("", "", callback)
}
