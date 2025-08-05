module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3002,
    host: process.env.HOST || 'localhost'
  },
  
  // 环境配置
  env: process.env.NODE_ENV || 'development',
  
  // 文件上传配置
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  
  // 分页配置
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 100
  },
  
  // 缓存配置
  cache: {
    ttl: 300, // 5分钟
    checkPeriod: 600 // 10分钟
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    path: process.env.LOG_PATH || './logs'
  }
} 