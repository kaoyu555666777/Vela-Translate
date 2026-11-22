// 构建前生成 src/common/buildinfo.js：构建工具版本、编译时间、Node.js 版本、编译平台、系统架构。
// 由 npm run build / npm run release 自动调用；直接用 aiot 构建时请先手动跑一次本脚本。
const fs = require('fs')
const os = require('os')
const path = require('path')

const toolPkg = require('../node_modules/aiot-toolkit/package.json')

function pad(n) {
  return String(n).padStart(2, '0')
}

const now = new Date()
const buildTime =
  now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
  ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds())

const platformMap = { linux: 'Linux', darwin: 'macOS', win32: 'Windows' }

const info = {
  tool: 'aiot-toolkit ' + toolPkg.version,
  buildTime: buildTime,
  node: process.version,
  platform: platformMap[os.platform()] || os.platform(),
  arch: os.arch()
}

const out = 'export const BUILD_INFO = ' + JSON.stringify(info, null, 2) + '\n'
fs.writeFileSync(path.join(__dirname, '..', 'src', 'common', 'buildinfo.js'), out)
console.log('buildinfo generated:', JSON.stringify(info))
