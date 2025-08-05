const { executeQuery, executeTransaction } = require('../utils/database')

// 订单模型
class OrderModel {
  // 获取用户订单列表
  static async getUserOrders(userId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize
    
    // 获取总数
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [userId]
    )
    const total = countResult[0].total
    
    // 获取订单列表
    const orders = await executeQuery(
      `SELECT o.*, 
              GROUP_CONCAT(oi.goods_name) as goods_names,
              GROUP_CONCAT(oi.quantity) as quantities
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    )
    
    return {
      list: orders,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    }
  }

  // 根据 ID 获取订单详情
  static async findById(id) {
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    )
    
    if (orders.length === 0) {
      return null
    }
    
    const order = orders[0]
    
    // 获取订单商品
    const orderItems = await executeQuery(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    )
    
    // 获取收货地址
    const address = await executeQuery(
      'SELECT * FROM addresses WHERE id = ?',
      [order.address_id]
    )
    
    return {
      ...order,
      items: orderItems,
      address: address[0] || null
    }
  }

  // 根据订单号获取订单
  static async findByOrderNo(orderNo) {
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE order_no = ?',
      [orderNo]
    )
    return orders[0] || null
  }

  // 创建订单
  static async create(userId, orderData) {
    const { 
      address_id, 
      items, 
      total_amount, 
      remark = '',
      payment_method = 'wechat'
    } = orderData
    
    // 生成订单号
    const orderNo = this.generateOrderNo()
    
    const queries = []
    
    // 创建订单
    queries.push({
      sql: `INSERT INTO orders (user_id, order_no, address_id, total_amount, remark, payment_method, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [userId, orderNo, address_id, total_amount, remark, payment_method, 'pending']
    })
    
    // 创建订单商品
    for (const item of items) {
      queries.push({
        sql: 'INSERT INTO order_items (order_id, goods_id, goods_name, goods_price, quantity, total_price) VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, ?)',
        params: [item.goods_id, item.goods_name, item.goods_price, item.quantity, item.total_price]
      })
      
      // 更新商品库存和销量
      queries.push({
        sql: 'UPDATE goods SET stock = stock - ?, sales = sales + ? WHERE id = ?',
        params: [item.quantity, item.quantity, item.goods_id]
      })
    }
    
    const results = await executeTransaction(queries)
    const orderId = results[0].insertId
    
    return this.findById(orderId)
  }

  // 更新订单状态
  static async updateStatus(id, status, remark = '') {
    const updateFields = ['status = ?', 'updated_at = NOW()']
    const params = [status]
    
    if (remark) {
      updateFields.push('remark = ?')
      params.push(remark)
    }
    
    params.push(id)
    
    await executeQuery(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
    
    return this.findById(id)
  }

  // 取消订单
  static async cancel(id, userId) {
    const order = await this.findById(id)
    
    if (!order) {
      throw new Error('订单不存在')
    }
    
    if (order.user_id !== userId) {
      throw new Error('无权操作此订单')
    }
    
    if (order.status !== 'pending') {
      throw new Error('订单状态不允许取消')
    }
    
    const queries = []
    
    // 更新订单状态
    queries.push({
      sql: 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      params: ['cancelled', id]
    })
    
    // 恢复商品库存
    for (const item of order.items) {
      queries.push({
        sql: 'UPDATE goods SET stock = stock + ?, sales = sales - ? WHERE id = ?',
        params: [item.quantity, item.quantity, item.goods_id]
      })
    }
    
    await executeTransaction(queries)
    
    return this.findById(id)
  }

  // 确认收货
  static async confirmReceived(id, userId) {
    const order = await this.findById(id)
    
    if (!order) {
      throw new Error('订单不存在')
    }
    
    if (order.user_id !== userId) {
      throw new Error('无权操作此订单')
    }
    
    if (order.status !== 'shipped') {
      throw new Error('订单状态不允许确认收货')
    }
    
    await executeQuery(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['completed', id]
    )
    
    return this.findById(id)
  }

  // 获取订单统计信息
  static async getOrderStats(userId) {
    const stats = await executeQuery(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(total_amount) as total_amount
       FROM orders 
       WHERE user_id = ?`,
      [userId]
    )
    return stats[0]
  }

  // 生成订单号
  static generateOrderNo() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `${year}${month}${day}${hours}${minutes}${seconds}${random}`
  }

  // 获取订单状态文本
  static getStatusText(status) {
    const statusMap = {
      'pending': '待付款',
      'paid': '已付款',
      'shipped': '已发货',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知状态'
  }

  // 检查订单是否可以操作
  static canOperate(order, operation) {
    const operationMap = {
      'cancel': ['pending'],
      'confirm': ['shipped'],
      'pay': ['pending']
    }
    
    const allowedStatuses = operationMap[operation] || []
    return allowedStatuses.includes(order.status)
  }
}

module.exports = OrderModel
