const express = require('express')
const pool = require('../config/database')

const router = express.Router()

// 获取销售统计
router.get('/stats/sales', async (req, res) => {
  try {
    const { type = 'today' } = req.query

    let dateCondition = ''
    if (type === 'today') {
      dateCondition = 'WHERE DATE(created_at) = CURDATE()'
    } else if (type === 'week') {
      dateCondition = 'WHERE YEARWEEK(created_at) = YEARWEEK(NOW())'
    } else if (type === 'month') {
      dateCondition = 'WHERE YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())'
    }

    // 今日销售额
    const [salesRows] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as sales FROM orders ${dateCondition} AND status IN (1,2,3)`
    )

    // 今日订单数
    const [ordersRows] = await pool.execute(
      `SELECT COUNT(*) as orders FROM orders ${dateCondition}`
    )

    // 新增用户数
    const [usersRows] = await pool.execute(
      `SELECT COUNT(*) as users FROM users ${dateCondition}`
    )

    // 计算增长率（简化处理，实际应该与昨日数据比较）
    const sales = salesRows[0].sales
    const orders = ordersRows[0].orders
    const users = usersRows[0].users

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        sales: parseFloat(sales),
        salesGrowth: 12.5, // 模拟数据
        orders: orders,
        ordersGrowth: 8.3, // 模拟数据
        users: users,
        usersGrowth: 15.2, // 模拟数据
        conversion: 12.5, // 模拟数据
        conversionGrowth: 2.1 // 模拟数据
      }
    })
  } catch (error) {
    console.error('获取销售统计错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取销售统计失败'
    })
  }
})

// 获取销售趋势
router.get('/stats/sales-trend', async (req, res) => {
  try {
    const { days = 7 } = req.query

    const [rows] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as sales,
        COUNT(*) as orders
       FROM orders 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         AND status IN (1,2,3)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [parseInt(days)]
    )

    const dates = []
    const sales = []
    const orders = []

    rows.forEach(row => {
      dates.push(row.date)
      sales.push(parseFloat(row.sales) || 0)
      orders.push(row.orders || 0)
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        dates,
        sales,
        orders
      }
    })
  } catch (error) {
    console.error('获取销售趋势错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取销售趋势失败'
    })
  }
})

// 获取热销商品
router.get('/stats/hot-goods', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const [rows] = await pool.execute(
      `SELECT g.id, g.name, g.image, g.price, g.sales,
              SUM(og.quantity) as total_sales,
              SUM(og.subtotal) as total_amount
       FROM goods g
       LEFT JOIN order_goods og ON g.id = og.goods_id
       LEFT JOIN orders o ON og.order_id = o.id
       WHERE o.status IN (1,2,3)
       GROUP BY g.id
       ORDER BY total_sales DESC
       LIMIT ?`,
      [parseInt(limit)]
    )

    res.json({
      code: 200,
      message: '获取成功',
      data: rows
    })
  } catch (error) {
    console.error('获取热销商品错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取热销商品失败'
    })
  }
})

// 获取订单统计
router.get('/stats/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as cancelled
       FROM orders`
    )

    res.json({
      code: 200,
      message: '获取成功',
      data: rows[0]
    })
  } catch (error) {
    console.error('获取订单统计错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取订单统计失败'
    })
  }
})

// 获取转化率统计
router.get('/stats/conversion', async (req, res) => {
  try {
    // 总用户数
    const [userRows] = await pool.execute('SELECT COUNT(*) as total FROM users')
    
    // 下单用户数
    const [orderUserRows] = await pool.execute(
      'SELECT COUNT(DISTINCT user_id) as order_users FROM orders'
    )

    const totalUsers = userRows[0].total
    const orderUsers = orderUserRows[0].order_users
    const conversionRate = totalUsers > 0 ? (orderUsers / totalUsers * 100).toFixed(2) : 0

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalUsers,
        orderUsers,
        conversionRate: parseFloat(conversionRate)
      }
    })
  } catch (error) {
    console.error('获取转化率统计错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取转化率统计失败'
    })
  }
})

module.exports = router 