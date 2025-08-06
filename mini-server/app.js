const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
const dotenv = require('dotenv')
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })
const config = require('./config')

// 导入中间件
const { errorHandler } = require('./src/middleware/errorHandler')

// 导入路由
const userRoutes = require('./src/routes/api/userRoutes')
const goodsRoutes = require('./src/routes/api/goodsRoutes')
const categoryRoutes = require('./src/routes/api/categoryRoutes')
const bannerRoutes = require('./src/routes/api/bannerRoutes')
const cartRoutes = require('./src/routes/api/cartRoutes')
const addressRoutes = require('./src/routes/api/addressRoutes')
const orderRoutes = require('./src/routes/api/orderRoutes')
const adminRoutes = require('./src/routes/admin/adminRoutes')

const app = express()

// 安全中间件
app.use(helmet())

// CORS配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}))

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP 15分钟内最多1000个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  }
})
app.use(limiter)

// 静态文件限制
const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    code: 429,
    message: '静态文件请求过于频繁，请稍后再试'
  }
})

// 日志中间件
app.use(morgan(config.logLevel || 'combined'))

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }))

// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务
app.use('/uploads', staticLimiter, express.static(path.join(__dirname, config.uploadPath || 'uploads')))

// API路由
app.use('/api/user', userRoutes)
app.use('/api/goods', goodsRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/banner', bannerRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/address', addressRoutes)
app.use('/api/order', orderRoutes)

// 管理后台路由
app.use('/admin', adminRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务正常',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '商城小程序后端API服务',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

// 错误处理中间件
app.use(errorHandler)

const PORT = config.port || process.env.PORT || 3002
// 启动服务器
app.listen(PORT, () => {
  // console.log(`服务器运行在端口 ${PORT}`)
  // console.log(`环境: ${process.env.NODE_ENV || 'development'}`)
  console.log('=================================');
  console.log(`运行环境: ${process.env.NODE_ENV || 'development'}`)
  // console.log(`运行环境: ${process.env.NODE_ENV}`);
  console.log(`服务端口: ${PORT}`);
  console.log('数据库配置:');
  console.log(`  - 数据库名: ${config.database.database}`);
  console.log(`  - 主机: ${config.database.host}`);
  console.log(`  - 端口: ${config.database.port}`);
  console.log(`  - 用户名: ${config.database.user}`);
  // console.log(`文件存储: ${config.upload.provider}`);
  console.log('=================================');
})


module.exports = app 