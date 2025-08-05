const log = require('../utils/logger')

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  log.error('服务器错误', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  // 根据错误类型返回不同的响应
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: err.errors
    })
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: '身份认证失败'
    })
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      code: 403,
      message: '权限不足'
    })
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      code: 404,
      message: '资源不存在'
    })
  }
  
  // 默认错误响应
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message
  })
}

// 自定义错误类
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

class UnauthorizedError extends Error {
  constructor(message = '身份认证失败') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

class ForbiddenError extends Error {
  constructor(message = '权限不足') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

class NotFoundError extends Error {
  constructor(message = '资源不存在') {
    super(message)
    this.name = 'NotFoundError'
  }
}

module.exports = {
  errorHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
} 