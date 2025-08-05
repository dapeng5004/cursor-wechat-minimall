const baseConfig = require('./config.base')
const env = process.env.NODE_ENV || 'development'
let envConfig = {}
try {
  envConfig = require(`./config.${env}`)
} catch (e) {
  console.warn(`[配置] 未找到环境专用配置文件: config.${env}.js，使用基础配置`)
}
module.exports = { ...baseConfig, ...envConfig }