const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
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

// 模拟管理员登录
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body
  
  if (username === 'admin' && password === 'admin') {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        userInfo: {
          id: 1,
          username: 'admin',
          nickname: '系统管理员',
          role: 'super',
          avatar: null
        }
      }
    })
  } else {
    res.status(401).json({
      code: 401,
      message: '用户名或密码错误',
      data: null
    })
  }
})

// 模拟轮播图数据
app.get('/api/admin/banner/list', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          title: '新品上市',
          image: '/uploads/banner/banner1.jpg',
          link: '/pages/goods/list?category=1',
          sort: 1,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 2,
          title: '限时特惠',
          image: '/uploads/banner/banner2.jpg',
          link: '/pages/goods/list?category=2',
          sort: 2,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 3,
          title: '品牌推荐',
          image: '/uploads/banner/banner3.jpg',
          link: '/pages/goods/list?category=3',
          sort: 3,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        }
      ],
      total: 3
    }
  })
})

// 模拟分类数据
app.get('/api/admin/category/list', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          name: '电子产品',
          image: '/uploads/category/electronics.jpg',
          sort: 1,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 2,
          name: '服装配饰',
          image: '/uploads/category/clothing.jpg',
          sort: 2,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 3,
          name: '家居用品',
          image: '/uploads/category/home.jpg',
          sort: 3,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 4,
          name: '美妆护肤',
          image: '/uploads/category/beauty.jpg',
          sort: 4,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 5,
          name: '运动户外',
          image: '/uploads/category/sports.jpg',
          sort: 5,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 6,
          name: '数码配件',
          image: '/uploads/category/digital.jpg',
          sort: 6,
          status: 1,
          created_at: '2024-01-01 00:00:00'
        }
      ],
      total: 6
    }
  })
})

// 模拟商品数据
app.get('/api/admin/goods/list', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          image: '/uploads/goods/iphone15.jpg',
          price: 7999.00,
          original_price: 8999.00,
          stock: 50,
          category_id: 1,
          category_name: '电子产品',
          sales: 100,
          status: 1,
          is_recommend: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 2,
          name: '华为Mate 60',
          image: '/uploads/goods/mate60.jpg',
          price: 6999.00,
          original_price: 7999.00,
          stock: 30,
          category_id: 1,
          category_name: '电子产品',
          sales: 80,
          status: 1,
          is_recommend: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 3,
          name: '小米14',
          image: '/uploads/goods/mi14.jpg',
          price: 4999.00,
          original_price: 5999.00,
          stock: 100,
          category_id: 1,
          category_name: '电子产品',
          sales: 150,
          status: 1,
          is_recommend: 0,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 4,
          name: 'Nike运动鞋',
          image: '/uploads/goods/nike.jpg',
          price: 599.00,
          original_price: 699.00,
          stock: 200,
          category_id: 5,
          category_name: '运动户外',
          sales: 300,
          status: 1,
          is_recommend: 1,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 5,
          name: 'Adidas运动服',
          image: '/uploads/goods/adidas.jpg',
          price: 299.00,
          original_price: 399.00,
          stock: 150,
          category_id: 5,
          category_name: '运动户外',
          sales: 200,
          status: 1,
          is_recommend: 0,
          created_at: '2024-01-01 00:00:00'
        },
        {
          id: 6,
          name: 'SK-II神仙水',
          image: '/uploads/goods/sk2.jpg',
          price: 1599.00,
          original_price: 1799.00,
          stock: 80,
          category_id: 4,
          category_name: '美妆护肤',
          sales: 120,
          status: 1,
          is_recommend: 1,
          created_at: '2024-01-01 00:00:00'
        }
      ],
      total: 6
    }
  })
})

// 模拟订单数据
app.get('/api/admin/order/list', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          order_no: 'ORD20240101001',
          user_id: 1,
          user_nickname: '用户001',
          total_amount: 7999.00,
          status: 1,
          status_text: '已支付',
          payment_method: '微信支付',
          payment_time: '2024-01-01 10:00:00',
          created_at: '2024-01-01 09:30:00'
        },
        {
          id: 2,
          order_no: 'ORD20240101002',
          user_id: 2,
          user_nickname: '用户002',
          total_amount: 1599.00,
          status: 2,
          status_text: '已发货',
          payment_method: '微信支付',
          payment_time: '2024-01-01 11:00:00',
          ship_time: '2024-01-01 14:00:00',
          created_at: '2024-01-01 10:30:00'
        },
        {
          id: 3,
          order_no: 'ORD20240101003',
          user_id: 3,
          user_nickname: '用户003',
          total_amount: 599.00,
          status: 3,
          status_text: '已完成',
          payment_method: '微信支付',
          payment_time: '2024-01-01 12:00:00',
          ship_time: '2024-01-01 15:00:00',
          complete_time: '2024-01-03 10:00:00',
          created_at: '2024-01-01 11:30:00'
        }
      ],
      total: 3
    }
  })
})

// 获取管理员信息
app.get('/admin/info', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      id: 1,
      username: 'admin',
      nickname: '系统管理员',
      role: 'super',
      avatar: null,
      roles: ['super']
    }
  })
})

// 模拟统计数据
app.get('/api/admin/stats/overview', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      today_sales: 12580.50,
      today_orders: 156,
      today_users: 23,
      total_goods: 156,
      total_orders: 1234,
      total_users: 567,
      total_sales: 123456.78
    }
  })
})

// 文件上传模拟
app.post('/api/admin/upload/file', (req, res) => {
  // 模拟文件上传成功
  const fileName = `mock_${Date.now()}.jpg`
  res.json({
    code: 200,
    message: '上传成功',
    data: {
      url: `/uploads/${fileName}`,
      filename: fileName
    }
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`)
  console.log('API测试地址:')
  console.log(`- 测试连接: http://localhost:${PORT}/api/test`)
  console.log(`- 管理员登录: POST http://localhost:${PORT}/api/admin/login`)
  console.log(`- 轮播图列表: GET http://localhost:${PORT}/api/admin/banner/list`)
  console.log(`- 分类列表: GET http://localhost:${PORT}/api/admin/category/list`)
  console.log(`- 商品列表: GET http://localhost:${PORT}/api/admin/goods/list`)
  console.log(`- 订单列表: GET http://localhost:${PORT}/api/admin/order/list`)
  console.log(`- 统计数据: GET http://localhost:${PORT}/api/admin/stats/overview`)
}) 