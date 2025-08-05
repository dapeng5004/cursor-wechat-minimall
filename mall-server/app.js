const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

const app = express()

// 安全中间件
app.use(helmet())

// 限流中间件 - 提高限制阈值
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 提高限制：每个IP 15分钟内最多1000个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// 静态文件专用限流 - 更宽松的限制
const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 2000, // 静态文件：每个IP 15分钟内最多2000个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use(limiter)

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// 解析JSON和URL编码
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务 - 使用专门的限流配置
app.use('/uploads', staticLimiter, (req, res, next) => {
  // 添加CORS头
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
}, express.static(path.join(__dirname, 'uploads')))

// 临时测试路由 - 图片上传（不要求认证）
app.post('/test-upload', (req, res) => {
  res.json({
    code: 200,
    message: '测试路由正常',
    data: {
      timestamp: new Date().toISOString()
    }
  })
})

// 简化的upload测试路由
const multer = require('multer')
const fs = require('fs')

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const upload = multer({ storage: storage })

app.post('/test-upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      })
    }

    const fileUrl = `/uploads/${req.file.filename}`
    
    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    })
  } catch (error) {
    console.error('上传错误:', error)
    res.status(500).json({
      code: 500,
      message: '上传失败：' + error.message
    })
  }
})

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({
    code: 200,
    message: '服务器运行正常',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  })
})

// Banner测试路由
app.get('/admin/banner/test', (req, res) => {
  res.json({
    code: 200,
    message: 'Banner路由测试成功',
    data: {
      timestamp: new Date().toISOString()
    }
  })
})

// Banner列表测试路由（不依赖数据库）
app.get('/admin/banner/list-test', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          title: '测试轮播图1',
          image: 'https://via.placeholder.com/800x400',
          link: 'https://example.com',
          sort: 1,
          status: 1,
          created_at: new Date().toISOString()
        }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    }
  })
})

// 路由
console.log('开始注册路由...')

try {
  console.log('注册admin路由...')
  app.use('/admin', require('./routes/admin'))
  console.log('admin路由注册成功')
} catch (error) {
  console.error('admin路由注册失败:', error)
}

try {
  console.log('注册banner路由...')
  const bannerRouter = require('./routes/banner')
  console.log('banner路由加载成功，路由数量:', bannerRouter.stack.length)
  app.use('/admin', bannerRouter)
  console.log('banner路由注册成功')
} catch (error) {
  console.error('banner路由注册失败:', error)
}

try {
  console.log('注册category路由...')
  app.use('/admin', require('./routes/category'))
  console.log('category路由注册成功')
} catch (error) {
  console.error('category路由注册失败:', error)
}

try {
  console.log('注册goods路由...')
  app.use('/admin', require('./routes/goods'))
  console.log('goods路由注册成功')
} catch (error) {
  console.error('goods路由注册失败:', error)
}

try {
  console.log('注册order路由...')
  app.use('/admin', require('./routes/order'))
  console.log('order路由注册成功')
} catch (error) {
  console.error('order路由注册失败:', error)
}

try {
  console.log('注册stats路由...')
  app.use('/admin', require('./routes/stats'))
  console.log('stats路由注册成功')
} catch (error) {
  console.error('stats路由注册失败:', error)
}

try {
  console.log('注册upload路由...')
  app.use('/admin', require('./routes/upload'))
  console.log('upload路由注册成功')
} catch (error) {
  console.error('upload路由注册失败:', error)
}

console.log('路由注册完成')

// 打印所有注册的路由用于调试
console.log('已注册的路由:')
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`)
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${middleware.regexp.source}${handler.route.path}`)
      }
    })
  }
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
}) 