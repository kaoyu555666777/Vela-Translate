// 百度翻译 API 封装：@system.fetch，GET + MD5 签名
// sign = MD5(appid + q + salt + key)，q 为原始文本（不做 URL 编码再签名）
import fetch from "@system.fetch"
import { loadCredentials } from "./credentials.js"

// 凭据不进源码：由手机插件经 Interconnect 推送，存在手表本地 storage 里，
// 翻译时从 storage 读（见 ./credentials.js）
const URL = "https://fanyi-api.baidu.com/api/trans/vip/translate"

// ---- MD5（UTF-8 安全，含代理对处理）----
function utf8Encode(str) {
  str = str.replace(/\r\n/g, "\n")
  let out = ""
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (c < 128) {
      out += String.fromCharCode(c)
    } else if (c < 2048) {
      out += String.fromCharCode((c >> 6) | 192)
      out += String.fromCharCode((c & 63) | 128)
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      const c2 = str.charCodeAt(++i)
      const cp = ((c - 0xd800) << 10) + (c2 - 0xdc00) + 0x10000
      out += String.fromCharCode((cp >> 18) | 240)
      out += String.fromCharCode(((cp >> 12) & 63) | 128)
      out += String.fromCharCode(((cp >> 6) & 63) | 128)
      out += String.fromCharCode((cp & 63) | 128)
    } else {
      out += String.fromCharCode((c >> 12) | 224)
      out += String.fromCharCode(((c >> 6) & 63) | 128)
      out += String.fromCharCode((c & 63) | 128)
    }
  }
  return out
}

function rotateLeft(n, s) {
  return (n << s) | (n >>> (32 - s))
}

function addUnsigned(a, b) {
  const a4 = a & 0x40000000
  const b4 = b & 0x40000000
  const a8 = a & 0x80000000
  const b8 = b & 0x80000000
  const r = (a & 0x3fffffff) + (b & 0x3fffffff)
  if (a4 & b4) return r ^ 0x80000000 ^ a8 ^ b8
  if (a4 | b4) {
    if (r & 0x40000000) return r ^ 0xc0000000 ^ a8 ^ b8
    return r ^ 0x40000000 ^ a8 ^ b8
  }
  return r ^ a8 ^ b8
}

function f(x, y, z) {
  return (x & y) | (~x & z)
}
function g(x, y, z) {
  return (x & z) | (y & ~z)
}
function h(x, y, z) {
  return x ^ y ^ z
}
function i(x, y, z) {
  return y ^ (x | ~z)
}

function ff(a, b, c, d, x, s, ac) {
  a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac))
  return addUnsigned(rotateLeft(a, s), b)
}
function gg(a, b, c, d, x, s, ac) {
  a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac))
  return addUnsigned(rotateLeft(a, s), b)
}
function hh(a, b, c, d, x, s, ac) {
  a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac))
  return addUnsigned(rotateLeft(a, s), b)
}
function ii(a, b, c, d, x, s, ac) {
  a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac))
  return addUnsigned(rotateLeft(a, s), b)
}

function md5(str) {
  const s = utf8Encode(str)
  const len = s.length
  const words = []
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3)
  }
  words[len >> 2] |= 0x80 << ((len % 4) << 3)
  words[(((len + 8) >> 6) << 4) + 14] = len << 3

  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  for (let k = 0; k < words.length; k += 16) {
    const aa = a
    const bb = b
    const cc = c
    const dd = d
    a = ff(a, b, c, d, words[k + 0], 7, 0xd76aa478)
    d = ff(d, a, b, c, words[k + 1], 12, 0xe8c7b756)
    c = ff(c, d, a, b, words[k + 2], 17, 0x242070db)
    b = ff(b, c, d, a, words[k + 3], 22, 0xc1bdceee)
    a = ff(a, b, c, d, words[k + 4], 7, 0xf57c0faf)
    d = ff(d, a, b, c, words[k + 5], 12, 0x4787c62a)
    c = ff(c, d, a, b, words[k + 6], 17, 0xa8304613)
    b = ff(b, c, d, a, words[k + 7], 22, 0xfd469501)
    a = ff(a, b, c, d, words[k + 8], 7, 0x698098d8)
    d = ff(d, a, b, c, words[k + 9], 12, 0x8b44f7af)
    c = ff(c, d, a, b, words[k + 10], 17, 0xffff5bb1)
    b = ff(b, c, d, a, words[k + 11], 22, 0x895cd7be)
    a = ff(a, b, c, d, words[k + 12], 7, 0x6b901122)
    d = ff(d, a, b, c, words[k + 13], 12, 0xfd987193)
    c = ff(c, d, a, b, words[k + 14], 17, 0xa679438e)
    b = ff(b, c, d, a, words[k + 15], 22, 0x49b40821)
    a = gg(a, b, c, d, words[k + 1], 5, 0xf61e2562)
    d = gg(d, a, b, c, words[k + 6], 9, 0xc040b340)
    c = gg(c, d, a, b, words[k + 11], 14, 0x265e5a51)
    b = gg(b, c, d, a, words[k + 0], 20, 0xe9b6c7aa)
    a = gg(a, b, c, d, words[k + 5], 5, 0xd62f105d)
    d = gg(d, a, b, c, words[k + 10], 9, 0x02441453)
    c = gg(c, d, a, b, words[k + 15], 14, 0xd8a1e681)
    b = gg(b, c, d, a, words[k + 4], 20, 0xe7d3fbc8)
    a = gg(a, b, c, d, words[k + 9], 5, 0x21e1cde6)
    d = gg(d, a, b, c, words[k + 14], 9, 0xc33707d6)
    c = gg(c, d, a, b, words[k + 3], 14, 0xf4d50d87)
    b = gg(b, c, d, a, words[k + 8], 20, 0x455a14ed)
    a = gg(a, b, c, d, words[k + 13], 5, 0xa9e3e905)
    d = gg(d, a, b, c, words[k + 2], 9, 0xfcefa3f8)
    c = gg(c, d, a, b, words[k + 7], 14, 0x676f02d9)
    b = gg(b, c, d, a, words[k + 12], 20, 0x8d2a4c8a)
    a = hh(a, b, c, d, words[k + 5], 4, 0xfffa3942)
    d = hh(d, a, b, c, words[k + 8], 11, 0x8771f681)
    c = hh(c, d, a, b, words[k + 11], 16, 0x6d9d6122)
    b = hh(b, c, d, a, words[k + 14], 23, 0xfde5380c)
    a = hh(a, b, c, d, words[k + 1], 4, 0xa4beea44)
    d = hh(d, a, b, c, words[k + 4], 11, 0x4bdecfa9)
    c = hh(c, d, a, b, words[k + 7], 16, 0xf6bb4b60)
    b = hh(b, c, d, a, words[k + 10], 23, 0xbebfbc70)
    a = hh(a, b, c, d, words[k + 13], 4, 0x289b7ec6)
    d = hh(d, a, b, c, words[k + 0], 11, 0xeaa127fa)
    c = hh(c, d, a, b, words[k + 3], 16, 0xd4ef3085)
    b = hh(b, c, d, a, words[k + 6], 23, 0x04881d05)
    a = hh(a, b, c, d, words[k + 9], 4, 0xd9d4d039)
    d = hh(d, a, b, c, words[k + 12], 11, 0xe6db99e5)
    c = hh(c, d, a, b, words[k + 15], 16, 0x1fa27cf8)
    b = hh(b, c, d, a, words[k + 2], 23, 0xc4ac5665)
    a = ii(a, b, c, d, words[k + 0], 6, 0xf4292244)
    d = ii(d, a, b, c, words[k + 7], 10, 0x432aff97)
    c = ii(c, d, a, b, words[k + 14], 15, 0xab9423a7)
    b = ii(b, c, d, a, words[k + 5], 21, 0xfc93a039)
    a = ii(a, b, c, d, words[k + 12], 6, 0x655b59c3)
    d = ii(d, a, b, c, words[k + 3], 10, 0x8f0ccc92)
    c = ii(c, d, a, b, words[k + 10], 15, 0xffeff47d)
    b = ii(b, c, d, a, words[k + 1], 21, 0x85845dd1)
    a = ii(a, b, c, d, words[k + 8], 6, 0x6fa87e4f)
    d = ii(d, a, b, c, words[k + 15], 10, 0xfe2ce6e0)
    c = ii(c, d, a, b, words[k + 6], 15, 0xa3014314)
    b = ii(b, c, d, a, words[k + 13], 21, 0x4e0811a1)
    a = ii(a, b, c, d, words[k + 4], 6, 0xf7537e82)
    d = ii(d, a, b, c, words[k + 11], 10, 0xbd3af235)
    c = ii(c, d, a, b, words[k + 2], 15, 0x2ad7d2bb)
    b = ii(b, c, d, a, words[k + 9], 21, 0xeb86d391)
    a = addUnsigned(a, aa)
    b = addUnsigned(b, bb)
    c = addUnsigned(c, cc)
    d = addUnsigned(d, dd)
  }

  function wordToHex(n) {
    let s = ""
    for (let i = 0; i < 4; i++) {
      const v = (n >> (i * 8 + 4)) & 0x0f
      const w = (n >> (i * 8)) & 0x0f
      s += "0123456789abcdef".charAt(v) + "0123456789abcdef".charAt(w)
    }
    return s
  }
  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)
}

// ---- 百度错误码 → 中文提示 ----
function baiduErr(code) {
  const map = {
    52001: "请求超时，请重试",
    52002: "翻译服务异常，请重试",
    52003: "账号未授权",
    54000: "请求参数缺失",
    54001: "签名错误",
    54003: "请求太频繁，稍后再试",
    54004: "账户余额不足",
    54005: "请求太频繁，稍后再试",
    58000: "IP 未在白名单",
    58001: "该语言方向不支持",
    58002: "服务已关闭",
    90107: "账号认证未通过"
  }
  return map[code] || "翻译失败（错误码 " + code + "）"
}

function safeParse(s) {
  try {
    return JSON.parse(s)
  } catch (e) {
    return null
  }
}

// 翻译。opts: {q, from, to}，返回 {from, to, text}
// 凭据每次翻译时从 storage 读（插件推送写入后立即生效）
export function translate(opts) {
  return new Promise(function (resolve, reject) {
    loadCredentials(function (appid, key) {
      if (!appid || !key) {
        reject(new Error("未填入百度翻译 APPID 和密钥"))
        return
      }
      const q = opts.q
      const salt = String(Math.floor(Math.random() * 32768) + 32768)
      const sign = md5(appid + q + salt + key)
      const url =
        URL +
        "?q=" + encodeURIComponent(q) +
        "&from=" + opts.from +
        "&to=" + opts.to +
        "&appid=" + appid +
        "&salt=" + salt +
        "&sign=" + sign
    fetch.fetch({
      url: url,
      method: "GET",
      responseType: "json",
      success: function (res) {
        const data = typeof res.data === "string" ? safeParse(res.data) : res.data
        if (res.code >= 200 && res.code < 300 && data) {
          if (data.trans_result && data.trans_result.length) {
            const parts = []
            for (let i = 0; i < data.trans_result.length; i++) {
              parts.push(data.trans_result[i].dst)
            }
            resolve({ from: data.from, to: data.to, text: parts.join("\n") })
          } else if (data.error_code) {
            reject(new Error(baiduErr(data.error_code)))
          } else {
            reject(new Error("返回数据异常"))
          }
        } else if (data && data.error_code) {
          reject(new Error(baiduErr(data.error_code)))
        } else {
          reject(new Error("HTTP " + res.code))
        }
      },
      fail: function () {
        reject(new Error("网络未连接"))
      }
    })
    })
  })
}
