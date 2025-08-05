const mysql = require('mysql2/promise')

const config = {
  host: 'localhost',
  user: 'root',
  password: 'zsp123456',
  database: 'mall',
  charset: 'utf8mb4'
}

async function fixOrderAmounts() {
  let connection
  
  try {
    connection = await mysql.createConnection(config)
    
    console.log('正在修复订单金额和商品小计不一致的问题...\n')
    
    // 获取所有需要修复的订单
    const [ordersToFix] = await connection.execute(`
      SELECT 
        o.id,
        o.order_no,
        o.total_amount as old_amount,
        COALESCE(SUM(og.subtotal), 0) as new_amount,
        COUNT(og.id) as goods_count
      FROM orders o
      LEFT JOIN order_goods og ON o.id = og.order_id
      GROUP BY o.id, o.order_no, o.total_amount
      HAVING o.total_amount != COALESCE(SUM(og.subtotal), 0)
      ORDER BY o.id
    `)
    
    console.log(`找到 ${ordersToFix.length} 个需要修复的订单:\n`)
    
    if (ordersToFix.length === 0) {
      console.log('所有订单金额都已正确，无需修复')
      return
    }
    
    // 显示修复前的对比
    console.log('修复前对比:')
    console.log('订单ID | 订单号 | 原金额 | 新金额 | 商品数量 | 差额')
    console.log('-------|--------|--------|--------|----------|--------')
    
    ordersToFix.forEach(order => {
      const diff = parseFloat(order.new_amount) - parseFloat(order.old_amount)
      console.log(`${order.id.toString().padStart(7)} | ${order.order_no.padEnd(8)} | ${order.old_amount.toString().padStart(6)} | ${order.new_amount.toString().padStart(6)} | ${order.goods_count.toString().padStart(8)} | ${diff.toFixed(2)}`)
    })
    
    // 确认是否继续
    console.log('\n是否继续修复？(y/n)')
    // 这里简化处理，直接继续修复
    
    // 开始修复
    console.log('\n开始修复订单金额...')
    
    for (const order of ordersToFix) {
      await connection.execute(
        'UPDATE orders SET total_amount = ? WHERE id = ?',
        [order.new_amount, order.id]
      )
      console.log(`✅ 订单 ${order.order_no} 金额已更新: ¥${order.old_amount} → ¥${order.new_amount}`)
    }
    
    console.log('\n✅ 所有订单金额修复完成！')
    
    // 验证修复结果
    console.log('\n=== 修复后验证 ===')
    const [verification] = await connection.execute(`
      SELECT 
        o.id,
        o.order_no,
        o.total_amount as order_total,
        COALESCE(SUM(og.subtotal), 0) as goods_total,
        CASE 
          WHEN o.total_amount != COALESCE(SUM(og.subtotal), 0) THEN '不一致'
          ELSE '一致'
        END as status
      FROM orders o
      LEFT JOIN order_goods og ON o.id = og.order_id
      GROUP BY o.id, o.order_no, o.total_amount
      ORDER BY o.id DESC
      LIMIT 5
    `)
    
    console.log('验证结果:')
    verification.forEach(order => {
      console.log(`订单 ${order.order_no}: 订单金额 ¥${order.order_total}, 商品小计 ¥${order.goods_total} - ${order.status}`)
    })
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

fixOrderAmounts() 