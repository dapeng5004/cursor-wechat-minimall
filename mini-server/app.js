const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
const dotenv = require('dotenv')
const https = require('https')
const fs = require('fs')
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })
const config = require('./config')
const log = require('./src/utils/logger')

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

// API日志中间件
app.use('/api', async (req, res, next) => {
  const start = Date.now();
  // 保存原始send方法
  const oldSend = res.send;
  let responseBody;
  res.send = function (body) {
    responseBody = body;
    return oldSend.call(this, body);
  };
  res.on('finish', () => {
    // 打印接口日志
    const logStr = [
      '\n---------------------------------------------------------',
      `接口名: ${req.method} ${req.originalUrl}`,
      `接口地址: ${req.protocol}://${req.get('host')}${req.originalUrl}`,
      '请求头:',
      JSON.stringify(req.headers, null, 2),
      '请求参数:',
      JSON.stringify(req.method === 'GET' ? req.query : req.body, null, 2),
      '返回结果:',
      typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody, null, 2),
      '---------------------------------------------------------\n'
    ].join('\n');
    log.info(logStr);
  });
  next();
});

// API路由
app.use('/api/user', userRoutes)
app.use('/api/goods', goodsRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/banner', bannerRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/address', addressRoutes)
app.use('/api/order', orderRoutes)
app.get('/api/base64img', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) {
    return res.status(400).json({ code: 400, message: '缺少图片路径参数' });
  }
  // 只允许访问uploads目录下的图片
  const cleanPath = relPath.replace(/^\/+/, '').replace(/^uploads\//, '');
  const absPath = path.join(__dirname, 'uploads', cleanPath);
  console.log('base64img debug:', { relPath, cleanPath, absPath });
  if (!absPath.startsWith(path.join(__dirname, 'uploads'))) {
    return res.status(403).json({ code: 403, message: '非法路径' });
  }
  
  // 检查文件是否存在
  if (!fs.existsSync(absPath)) {
    console.log('base64img error: 文件不存在', absPath);
    return res.status(404).json({ code: 404, message: '图片不存在' });
  }
  
  // 判断图片类型
  let mime = 'image/jpeg';
  if (absPath.endsWith('.png')) mime = 'image/png';
  if (absPath.endsWith('.gif')) mime = 'image/gif';
  if (absPath.endsWith('.svg')) mime = 'image/svg+xml';
  if (absPath.endsWith('.webp')) mime = 'image/webp';
  if (absPath.endsWith('.jpeg')) mime = 'image/jpeg';
  
  // 设置响应头
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存1年
  
  // 直接返回图片文件
  const stream = fs.createReadStream(absPath);
  stream.pipe(res);
  
  stream.on('error', (err) => {
    console.log('base64img error:', err);
    res.status(500).json({ code: 500, message: '图片读取失败' });
  });
});

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

// 开发环境使用HTTP，生产环境使用HTTPS
if (process.env.NODE_ENV === 'production') {
  // 生产环境使用HTTPS
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log('=================================');
    console.log(`运行环境: ${process.env.NODE_ENV || 'development'}`)
    console.log(`HTTPS服务端口: ${PORT}`);
    console.log(`访问地址: https://localhost:${PORT}`);
    console.log('数据库配置:');
    console.log(`  - 数据库名: ${config.database.database}`);
    console.log(`  - 主机: ${config.database.host}`);
    console.log(`  - 端口: ${config.database.port}`);
    console.log(`  - 用户名: ${config.database.user}`);
    console.log('=================================');
  });
} else {
  // 开发环境使用HTTP
  app.listen(PORT, () => {
    console.log('=================================');
    console.log(`运行环境: ${process.env.NODE_ENV || 'development'}`)
    console.log(`HTTP服务端口: ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log('数据库配置:');
    console.log(`  - 数据库名: ${config.database.database}`);
    console.log(`  - 主机: ${config.database.host}`);
    console.log(`  - 端口: ${config.database.port}`);
    console.log(`  - 用户名: ${config.database.user}`);
    console.log('=================================');
  });
}

module.exports = app 