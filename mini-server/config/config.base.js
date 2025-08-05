module.exports = {
  port: process.env.PORT || 3002,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024,
  logLevel: process.env.LOG_LEVEL || 'debug',
  logFile: process.env.LOG_FILE || './logs/app.log',
  // 其他通用配置
}