// 键盘类型持久化：@system.storage，字符串存储（部分 Vela 版本对非字符串值读写不可靠）。
// 读：启动/进页时调 loadKbType，回调拿值；写：切换时调 saveKbType（缓存同步先行，storage 异步跟进）。
import storage from "@system.storage"

let cached = "QWERTY"
let loaded = false

export function loadKbType(callback) {
  if (loaded) {
    if (callback) callback(cached)
    return
  }
  storage.get({
    key: "kbType",
    success: function (v) {
      if (v === "T9" || v === "QWERTY") cached = v
      loaded = true
      if (callback) callback(cached)
    },
    fail: function () {
      loaded = true
      if (callback) callback(cached)
    },
    complete: function () {}
  })
}

export function saveKbType(value) {
  cached = value
  loaded = true
  storage.set({
    key: "kbType",
    value: value,
    success: function () {},
    fail: function () {},
    complete: function () {}
  })
}

// 同步读当前键盘类型（内存缓存；启动时 loadKbType、切换时 saveKbType 都会更新它）。
// 打开键盘时用它同步取值，不等 storage 回调——1.0.12 曾在 openKb 里等回调并重建组件，
// 结果键盘打不开（重建不可靠），已回退为同步打开。
export function getKbTypeSync() {
  return cached
}
