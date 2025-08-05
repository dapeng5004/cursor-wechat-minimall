module.exports = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'zsp123456',
    database: process.env.DB_NAME || 'mall',
    charset: 'utf8mb4',
    timezone: '+08:00',
  },
  fileUpload: {
    type: 'local',
    path: process.env.UPLOAD_PATH || './uploads'
  },
  logLevel: 'debug',
  apiBaseUrl: 'http://localhost:3002',
  debug: true
}