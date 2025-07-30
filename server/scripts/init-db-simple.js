const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const path = require('path')

async function initDatabase() {
  try {
    // 连接数据库（不指定数据库名）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    })

    console.log('正在创建数据库...')
    
    // 创建数据库
    await connection.execute('CREATE DATABASE IF NOT EXISTS `mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    console.log('数据库 mall 创建成功')
    
    // 使用数据库
    await connection.execute('USE `mall`')
    console.log('切换到数据库 mall')
    
    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
        \`openid\` varchar(100) NOT NULL COMMENT '微信openid',
        \`nickname\` varchar(50) DEFAULT NULL COMMENT '用户昵称',
        \`avatar\` varchar(255) DEFAULT NULL COMMENT '用户头像',
        \`phone\` varchar(20) DEFAULT NULL COMMENT '手机号码',
        \`gender\` tinyint(1) DEFAULT 0 COMMENT '性别：0未知，1男，2女',
        \`status\` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_openid\` (\`openid\`),
        KEY \`idx_phone\` (\`phone\`),
        KEY \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
    `)
    console.log('用户表创建成功')
    
    // 创建商品分类表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
        \`name\` varchar(50) NOT NULL COMMENT '分类名称',
        \`image\` varchar(255) DEFAULT NULL COMMENT '分类图片',
        \`sort\` int(11) DEFAULT 0 COMMENT '排序（数字越小越靠前）',
        \`status\` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        KEY \`idx_sort\` (\`sort\`),
        KEY \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表'
    `)
    console.log('商品分类表创建成功')
    
    // 创建商品表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`goods\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
        \`name\` varchar(100) NOT NULL COMMENT '商品名称',
        \`image\` varchar(255) DEFAULT NULL COMMENT '商品主图',
        \`images\` text DEFAULT NULL COMMENT '商品图片列表（JSON格式）',
        \`price\` decimal(10,2) NOT NULL COMMENT '商品价格',
        \`original_price\` decimal(10,2) DEFAULT NULL COMMENT '原价',
        \`stock\` int(11) DEFAULT 0 COMMENT '库存数量',
        \`category_id\` int(11) NOT NULL COMMENT '分类ID',
        \`description\` text DEFAULT NULL COMMENT '商品描述',
        \`detail\` longtext DEFAULT NULL COMMENT '商品详情（富文本）',
        \`sales\` int(11) DEFAULT 0 COMMENT '销量',
        \`status\` tinyint(1) DEFAULT 1 COMMENT '状态：0下架，1上架',
        \`is_recommend\` tinyint(1) DEFAULT 0 COMMENT '是否推荐：0否，1是',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        KEY \`idx_category_id\` (\`category_id\`),
        KEY \`idx_status\` (\`status\`),
        KEY \`idx_is_recommend\` (\`is_recommend\`),
        KEY \`idx_price\` (\`price\`),
        FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表'
    `)
    console.log('商品表创建成功')
    
    // 创建购物车表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`cart\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
        \`user_id\` int(11) NOT NULL COMMENT '用户ID',
        \`goods_id\` int(11) NOT NULL COMMENT '商品ID',
        \`quantity\` int(11) NOT NULL DEFAULT 1 COMMENT '商品数量',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_user_goods\` (\`user_id\`, \`goods_id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_goods_id\` (\`goods_id\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`goods_id\`) REFERENCES \`goods\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表'
    `)
    console.log('购物车表创建成功')
    
    // 创建收货地址表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`addresses\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '地址ID',
        \`user_id\` int(11) NOT NULL COMMENT '用户ID',
        \`name\` varchar(50) NOT NULL COMMENT '收货人姓名',
        \`phone\` varchar(20) NOT NULL COMMENT '联系电话',
        \`province\` varchar(50) NOT NULL COMMENT '省份',
        \`city\` varchar(50) NOT NULL COMMENT '城市',
        \`district\` varchar(50) NOT NULL COMMENT '区县',
        \`detail\` varchar(255) NOT NULL COMMENT '详细地址',
        \`is_default\` tinyint(1) DEFAULT 0 COMMENT '是否默认地址：0否，1是',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_is_default\` (\`is_default\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表'
    `)
    console.log('收货地址表创建成功')
    
    // 创建订单表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
        \`order_no\` varchar(50) NOT NULL COMMENT '订单号',
        \`user_id\` int(11) NOT NULL COMMENT '用户ID',
        \`address_id\` int(11) NOT NULL COMMENT '收货地址ID',
        \`total_amount\` decimal(10,2) NOT NULL COMMENT '订单总金额',
        \`status\` tinyint(1) DEFAULT 0 COMMENT '订单状态：0待支付，1已支付，2已发货，3已完成，4已取消',
        \`payment_method\` varchar(20) DEFAULT NULL COMMENT '支付方式',
        \`payment_time\` timestamp NULL DEFAULT NULL COMMENT '支付时间',
        \`ship_time\` timestamp NULL DEFAULT NULL COMMENT '发货时间',
        \`complete_time\` timestamp NULL DEFAULT NULL COMMENT '完成时间',
        \`remark\` varchar(255) DEFAULT NULL COMMENT '订单备注',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_order_no\` (\`order_no\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_status\` (\`status\`),
        KEY \`idx_created_at\` (\`created_at\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`address_id\`) REFERENCES \`addresses\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表'
    `)
    console.log('订单表创建成功')
    
    // 创建订单商品表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`order_goods\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单商品ID',
        \`order_id\` int(11) NOT NULL COMMENT '订单ID',
        \`goods_id\` int(11) NOT NULL COMMENT '商品ID',
        \`goods_name\` varchar(100) NOT NULL COMMENT '商品名称',
        \`goods_image\` varchar(255) DEFAULT NULL COMMENT '商品图片',
        \`price\` decimal(10,2) NOT NULL COMMENT '商品单价',
        \`quantity\` int(11) NOT NULL COMMENT '购买数量',
        \`subtotal\` decimal(10,2) NOT NULL COMMENT '小计金额',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        PRIMARY KEY (\`id\`),
        KEY \`idx_order_id\` (\`order_id\`),
        KEY \`idx_goods_id\` (\`goods_id\`),
        FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`goods_id\`) REFERENCES \`goods\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表'
    `)
    console.log('订单商品表创建成功')
    
    // 创建轮播图表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`banners\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
        \`title\` varchar(100) DEFAULT NULL COMMENT '轮播图标题',
        \`image\` varchar(255) NOT NULL COMMENT '轮播图片',
        \`link\` varchar(255) DEFAULT NULL COMMENT '跳转链接',
        \`sort\` int(11) DEFAULT 0 COMMENT '排序（数字越小越靠前）',
        \`status\` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        KEY \`idx_sort\` (\`sort\`),
        KEY \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表'
    `)
    console.log('轮播图表创建成功')
    
    // 创建管理员表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
        \`username\` varchar(50) NOT NULL COMMENT '用户名',
        \`password\` varchar(255) NOT NULL COMMENT '密码（bcrypt加密）',
        \`nickname\` varchar(50) DEFAULT NULL COMMENT '昵称',
        \`avatar\` varchar(255) DEFAULT NULL COMMENT '头像',
        \`role\` varchar(20) DEFAULT 'admin' COMMENT '角色：admin管理员，super超级管理员',
        \`status\` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
        \`last_login_time\` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
        \`last_login_ip\` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_username\` (\`username\`),
        KEY \`idx_status\` (\`status\`),
        KEY \`idx_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表'
    `)
    console.log('管理员表创建成功')
    
    // 创建系统配置表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`configs\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
        \`key\` varchar(100) NOT NULL COMMENT '配置键',
        \`value\` text DEFAULT NULL COMMENT '配置值',
        \`description\` varchar(255) DEFAULT NULL COMMENT '配置描述',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_key\` (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表'
    `)
    console.log('系统配置表创建成功')
    
    // 插入初始数据
    console.log('正在插入初始数据...')
    
    // 检查是否已有管理员账号
    const [admins] = await connection.execute('SELECT COUNT(*) as count FROM admins')
    if (admins[0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10)
      await connection.execute(
        'INSERT INTO admins (username, password, nickname, role, status) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, '系统管理员', 'super', 1]
      )
      console.log('默认管理员账号创建完成！')
      console.log('用户名: admin')
      console.log('密码: admin')
    } else {
      console.log('管理员账号已存在，跳过创建')
    }
    
    // 检查是否已有分类数据
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories')
    if (categories[0].count === 0) {
      await connection.execute(`
        INSERT INTO categories (name, image, sort, status) VALUES
        ('电子产品', '/uploads/category/electronics.jpg', 1, 1),
        ('服装配饰', '/uploads/category/clothing.jpg', 2, 1),
        ('家居用品', '/uploads/category/home.jpg', 3, 1),
        ('美妆护肤', '/uploads/category/beauty.jpg', 4, 1),
        ('运动户外', '/uploads/category/sports.jpg', 5, 1),
        ('数码配件', '/uploads/category/digital.jpg', 6, 1)
      `)
      console.log('商品分类数据插入完成')
    } else {
      console.log('商品分类数据已存在，跳过插入')
    }
    
    // 检查是否已有轮播图数据
    const [banners] = await connection.execute('SELECT COUNT(*) as count FROM banners')
    if (banners[0].count === 0) {
      await connection.execute(`
        INSERT INTO banners (title, image, link, sort, status) VALUES
        ('新品上市', '/uploads/banner/banner1.jpg', '/pages/goods/list?category=1', 1, 1),
        ('限时特惠', '/uploads/banner/banner2.jpg', '/pages/goods/list?category=2', 2, 1),
        ('品牌推荐', '/uploads/banner/banner3.jpg', '/pages/goods/list?category=3', 3, 1)
      `)
      console.log('轮播图数据插入完成')
    } else {
      console.log('轮播图数据已存在，跳过插入')
    }
    
    // 检查是否已有商品数据
    const [goods] = await connection.execute('SELECT COUNT(*) as count FROM goods')
    if (goods[0].count === 0) {
      await connection.execute(`
        INSERT INTO goods (name, image, price, stock, category_id, description, sales, status, is_recommend) VALUES
        ('iPhone 15 Pro', '/uploads/goods/iphone15.jpg', 7999.00, 50, 1, '最新款iPhone，性能强劲', 100, 1, 1),
        ('华为Mate 60', '/uploads/goods/mate60.jpg', 6999.00, 30, 1, '华为旗舰手机', 80, 1, 1),
        ('小米14', '/uploads/goods/mi14.jpg', 4999.00, 100, 1, '小米年度旗舰', 150, 1, 0),
        ('Nike运动鞋', '/uploads/goods/nike.jpg', 599.00, 200, 5, '舒适透气运动鞋', 300, 1, 1),
        ('Adidas运动服', '/uploads/goods/adidas.jpg', 299.00, 150, 5, '专业运动服装', 200, 1, 0),
        ('SK-II神仙水', '/uploads/goods/sk2.jpg', 1599.00, 80, 4, '明星护肤产品', 120, 1, 1)
      `)
      console.log('商品数据插入完成')
    } else {
      console.log('商品数据已存在，跳过插入')
    }
    
    // 检查是否已有系统配置数据
    const [configs] = await connection.execute('SELECT COUNT(*) as count FROM configs')
    if (configs[0].count === 0) {
      await connection.execute(`
        INSERT INTO configs (key, value, description) VALUES
        ('site_name', '商城小程序', '网站名称'),
        ('site_description', '专业的微信小程序商城', '网站描述'),
        ('contact_phone', '400-123-4567', '客服电话'),
        ('contact_email', 'service@mall.com', '客服邮箱')
      `)
      console.log('系统配置数据插入完成')
    } else {
      console.log('系统配置数据已存在，跳过插入')
    }
    
    console.log('数据库初始化完成！')
    await connection.end()
    
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  }
}

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') })

// 执行初始化
initDatabase() 