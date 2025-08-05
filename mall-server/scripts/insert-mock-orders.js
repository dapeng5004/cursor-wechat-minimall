const mysql = require('mysql2/promise')
require('dotenv').config()

async function insertMockOrders() {
  let connection
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mall',
      charset: 'utf8mb4'
    })

    console.log('数据库连接成功')

    // 1. 检查现有商品数据
    const [goods] = await connection.execute('SELECT id, name FROM goods ORDER BY id')
    console.log('现有商品数据:', goods)

    if (goods.length === 0) {
      console.log('没有找到商品数据，请先添加商品')
      return
    }

    // 2. 插入模拟用户数据
    const users = [
      [1, 'wx_openid_001', '张三', '/uploads/avatar/user1.jpg', '13800138001', 1, 1],
      [2, 'wx_openid_002', '李四', '/uploads/avatar/user2.jpg', '13800138002', 2, 1],
      [3, 'wx_openid_003', '王五', '/uploads/avatar/user3.jpg', '13800138003', 1, 1],
      [4, 'wx_openid_004', '赵六', '/uploads/avatar/user4.jpg', '13800138004', 2, 1],
      [5, 'wx_openid_005', '钱七', '/uploads/avatar/user5.jpg', '13800138005', 1, 1]
    ]

    for (const user of users) {
      await connection.execute(
        'INSERT IGNORE INTO users (id, openid, nickname, avatar, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        user
      )
    }
    console.log('用户数据插入完成')

    // 3. 插入模拟收货地址数据
    const addresses = [
      [1, 1, '张三', '13800138001', '北京市', '北京市', '朝阳区', '三里屯SOHO 1号楼 1001室', 1],
      [2, 1, '张三', '13800138001', '上海市', '上海市', '浦东新区', '陆家嘴金融中心 2号楼 2002室', 0],
      [3, 2, '李四', '13800138002', '广州市', '广州市', '天河区', '珠江新城 3号楼 3003室', 1],
      [4, 3, '王五', '13800138003', '深圳市', '深圳市', '南山区', '科技园 4号楼 4004室', 1],
      [5, 4, '赵六', '13800138004', '杭州市', '杭州市', '西湖区', '西溪湿地 5号楼 5005室', 1],
      [6, 5, '钱七', '13800138005', '成都市', '成都市', '锦江区', '春熙路 6号楼 6006室', 1]
    ]

    for (const address of addresses) {
      await connection.execute(
        'INSERT IGNORE INTO addresses (id, user_id, name, phone, province, city, district, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        address
      )
    }
    console.log('地址数据插入完成')

    // 4. 插入模拟订单数据
    const orders = [
      ['ORD202412200011', 1, 1, 1599.00, 0, null, null, null, null, '请尽快发货', '2024-12-20 10:00:00'],
      ['ORD202412200012', 2, 3, 299.00, 0, null, null, null, null, '无特殊要求', '2024-12-20 10:30:00'],
      ['ORD202412200013', 3, 4, 899.00, 1, '微信支付', '2024-12-20 11:00:00', null, null, '包装精美一些', '2024-12-20 10:45:00'],
      ['ORD202412200014', 4, 5, 1299.00, 1, '支付宝', '2024-12-20 11:15:00', null, null, '送货上门', '2024-12-20 11:00:00'],
      ['ORD202412200015', 5, 6, 599.00, 2, '微信支付', '2024-12-20 11:30:00', '2024-12-20 14:00:00', null, '轻拿轻放', '2024-12-20 11:15:00'],
      ['ORD202412200016', 1, 2, 799.00, 2, '支付宝', '2024-12-20 11:45:00', '2024-12-20 14:30:00', null, '周末送货', '2024-12-20 11:30:00'],
      ['ORD202412200017', 2, 3, 399.00, 3, '微信支付', '2024-12-20 12:00:00', '2024-12-20 15:00:00', '2024-12-20 16:00:00', '商品质量很好', '2024-12-20 11:45:00'],
      ['ORD202412200018', 3, 4, 699.00, 3, '支付宝', '2024-12-20 12:15:00', '2024-12-20 15:30:00', '2024-12-20 16:30:00', '服务态度不错', '2024-12-20 12:00:00'],
      ['ORD202412200019', 4, 5, 999.00, 4, null, null, null, null, '客户取消', '2024-12-20 12:30:00'],
      ['ORD202412200020', 5, 6, 499.00, 4, null, null, null, null, '价格太贵', '2024-12-20 12:45:00']
    ]

    for (const order of orders) {
      await connection.execute(
        'INSERT INTO orders (order_no, user_id, address_id, total_amount, status, payment_method, payment_time, ship_time, complete_time, remark, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        order
      )
    }
    console.log('订单数据插入完成')

    // 5. 插入模拟订单商品数据（使用实际存在的商品ID）
    const orderGoods = []
    
    // 为每个订单分配商品，循环使用现有商品
    for (let i = 1; i <= 10; i++) {
      const goodsIndex = (i - 1) % goods.length
      const selectedGoods = goods[goodsIndex]
      
      orderGoods.push([
        i, // order_id
        selectedGoods.id, // goods_id
        selectedGoods.name, // goods_name
        `/uploads/goods/${selectedGoods.id}.jpg`, // goods_image
        Math.floor(Math.random() * 1000) + 100, // price (100-1100)
        1, // quantity
        Math.floor(Math.random() * 1000) + 100 // subtotal (100-1100)
      ])
    }

    for (const orderGood of orderGoods) {
      await connection.execute(
        'INSERT INTO order_goods (order_id, goods_id, goods_name, goods_image, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        orderGood
      )
    }
    console.log('订单商品数据插入完成')

    // 6. 更新商品销量
    await connection.execute(`
      UPDATE goods SET sales = (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM order_goods og 
        JOIN orders o ON og.order_id = o.id 
        WHERE og.goods_id = goods.id AND o.status IN (1, 2, 3)
      )
    `)
    console.log('商品销量更新完成')

    // 7. 查询插入结果
    const [orderCount] = await connection.execute('SELECT COUNT(*) as count FROM orders')
    const [orderGoodsCount] = await connection.execute('SELECT COUNT(*) as count FROM order_goods')

    console.log('\n=== 插入结果统计 ===')
    console.log(`订单总数: ${orderCount[0].count}`)
    console.log(`订单商品总数: ${orderGoodsCount[0].count}`)

    // 8. 显示订单状态分布
    const [statusStats] = await connection.execute(`
      SELECT 
        status,
        CASE status
          WHEN 0 THEN '待支付'
          WHEN 1 THEN '已支付'
          WHEN 2 THEN '已发货'
          WHEN 3 THEN '已完成'
          WHEN 4 THEN '已取消'
        END as status_name,
        COUNT(*) as count
      FROM orders 
      GROUP BY status
      ORDER BY status
    `)

    console.log('\n=== 订单状态分布 ===')
    statusStats.forEach(stat => {
      console.log(`${stat.status_name}: ${stat.count}个`)
    })

    console.log('\n模拟订单数据插入完成！')

  } catch (error) {
    console.error('插入模拟订单数据失败:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 执行脚本
insertMockOrders() 