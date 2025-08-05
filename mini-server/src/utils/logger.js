const winston = require('winston')
const path = require('path')
const appConfig = require('../config/app')

// 创建日志目录
const logDir = path.join(__dirname, '../../logs')

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 创建logger实例
const logger = winston.createLogger({
  level: appConfig.log.level,
  format: logFormat,
  transports: [
    // 错误日志
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // 访问日志
    new winston.transports.File({
      filename: path.join(logDir, 'access.log')
    }),
    // 应用日志
    new winston.transports.File({
      filename: path.join(logDir, 'app.log')
    })
  ]
})

// 开发环境下同时输出到控制台
if (appConfig.env === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// 日志方法
const log = {
  info: (message, meta = {}) => {
    logger.info(message, meta)
  },
  
  error: (message, meta = {}) => {
    logger.error(message, meta)
  },
  
  warn: (message, meta = {}) => {
    logger.warn(message, meta)
  },
  
  debug: (message, meta = {}) => {
    logger.debug(message, meta)
  }
}

module.exports = log 