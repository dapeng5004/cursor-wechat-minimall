const fs = require('fs')
const path = require('path')

// 模拟数据库初始化
function mockDatabaseInit() {
  console.log('=== 模拟数据库初始化 ===')
  console.log('注意：这是一个模拟脚本，用于演示数据库结构')
  console.log('实际使用时需要配置真实的MySQL数据库')
  console.log('')
  
  // 创建uploads目录
  const uploadsDir = path.join(__dirname, '../uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log('✓ 创建uploads目录')
  }
  
  // 创建子目录
  const subDirs = ['banner', 'category', 'goods', 'avatar']
  subDirs.forEach(dir => {
    const fullPath = path.join(uploadsDir, dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`✓ 创建uploads/${dir}目录`)
    }
  })
  
  // 创建示例图片文件
  const sampleFiles = [
    'uploads/banner/banner1.jpg',
    'uploads/banner/banner2.jpg', 
    'uploads/banner/banner3.jpg',
    'uploads/category/electronics.jpg',
    'uploads/category/clothing.jpg',
    'uploads/category/home.jpg',
    'uploads/category/beauty.jpg',
    'uploads/category/sports.jpg',
    'uploads/category/digital.jpg',
    'uploads/goods/iphone15.jpg',
    'uploads/goods/mate60.jpg',
    'uploads/goods/mi14.jpg',
    'uploads/goods/nike.jpg',
    'uploads/goods/adidas.jpg',
    'uploads/goods/sk2.jpg'
  ]
  
  sampleFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file)
    if (!fs.existsSync(filePath)) {
      // 创建一个空的图片文件（实际项目中应该是真实的图片）
      fs.writeFileSync(filePath, '')
      console.log(`✓ 创建示例文件: ${file}`)
    }
  })
  
  console.log('')
  console.log('=== 数据库表结构说明 ===')
  console.log('1. users - 用户表')
  console.log('2. categories - 商品分类表')
  console.log('3. goods - 商品表')
  console.log('4. cart - 购物车表')
  console.log('5. addresses - 收货地址表')
  console.log('6. orders - 订单表')
  console.log('7. order_goods - 订单商品表')
  console.log('8. banners - 轮播图表')
  console.log('9. admins - 管理员表')
  console.log('10. configs - 系统配置表')
  console.log('')
  
  console.log('=== 默认管理员账号 ===')
  console.log('用户名: admin')
  console.log('密码: admin')
  console.log('')
  
  console.log('=== 下一步操作 ===')
  console.log('1. 安装并配置MySQL数据库')
  console.log('2. 修改server/.env文件中的数据库连接信息')
  console.log('3. 运行 node scripts/init-db-simple.js 初始化数据库')
  console.log('4. 启动后端服务: npm run dev')
  console.log('5. 启动前端服务: cd ../mall-admin && npm run dev')
  console.log('')
  
  console.log('模拟数据库初始化完成！')
}

// 执行模拟初始化
mockDatabaseInit() 