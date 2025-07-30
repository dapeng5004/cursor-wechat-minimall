const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

const app = express()

// 安全中间件
app.use(helmet())

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
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

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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