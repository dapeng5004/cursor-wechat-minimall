module.exports = {
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    timezone: '+08:00',
  },
  fileUpload: {
    type: 'cloud',
    provider: 'aliyun-oss',
    bucket: process.env.OSS_BUCKET || 'your-bucket'
  },
  logLevel: 'debug',
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.yourdomain.com',
  debug: false
}