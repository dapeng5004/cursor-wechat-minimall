const mysql = require('mysql2/promise')

const config = {
  host: 'localhost',
  user: 'root',
  password: 'zsp123456',
  database: 'mall',
  charset: 'utf8mb4'
}

async function addMissingOrderGoods() {
  let connection
  
  try {
    connection = await mysql.createConnection(config)
    
    console.log('正在为缺失商品数据的订单添加商品数据...')
    
    // 获取所有商品
    const [goods] = await connection.execute('SELECT id, name, price FROM goods WHERE status = 1')
    console.log(`找到 ${goods.length} 个商品`)
    
    // 获取没有商品数据的订单
    const [ordersWithoutGoods] = await connection.execute(`
      SELECT o.id, o.order_no, o.total_amount
      FROM orders o
      LEFT JOIN order_goods og ON o.id = og.order_id
      WHERE og.order_id IS NULL
      ORDER BY o.id
    `)
    
    console.log(`找到 ${ordersWithoutGoods.length} 个没有商品数据的订单`)
    
    if (ordersWithoutGoods.length === 0) {
      console.log('所有订单都有商品数据，无需添加')
      return
    }
    
    // 为每个订单添加商品数据
    for (let i = 0; i < ordersWithoutGoods.length; i++) {
      const order = ordersWithoutGoods[i]
      const goodsIndex = i % goods.length
      const selectedGoods = goods[goodsIndex]
      
      // 计算商品数量和价格
      const quantity = Math.floor(Math.random() * 3) + 1 // 1-3个
      const price = Math.floor(selectedGoods.price * (0.8 + Math.random() * 0.4)) // 价格浮动
      const subtotal = price * quantity
      
      console.log(`为订单 ${order.order_no} 添加商品: ${selectedGoods.name} x ${quantity} = ¥${subtotal}`)
      
      // 插入订单商品数据
      await connection.execute(
        'INSERT INTO order_goods (order_id, goods_id, goods_name, goods_image, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          order.id,
          selectedGoods.id,
          selectedGoods.name,
          `/uploads/goods/${selectedGoods.id}.jpg`,
          price,
          quantity,
          subtotal
        ]
      )
    }
    
    console.log('✅ 所有缺失的订单商品数据添加完成！')
    
    // 验证结果
    const [totalOrderGoods] = await connection.execute('SELECT COUNT(*) as total FROM order_goods')
    console.log(`订单商品总数: ${totalOrderGoods[0].total}`)
    
  } catch (error) {
    console.error('❌ 添加订单商品数据失败:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

addMissingOrderGoods() 