const { executeQuery, executeTransaction } = require('../utils/database')
const { unifiedOrder } = require('../utils/payment')
const log = require('../utils/logger')

// 创建订单
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id
    const { address_id, goods_list, remark = '' } = req.body
    
    if (!address_id || !goods_list || goods_list.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择收货地址和商品'
      })
    }
    
    // 验证地址是否存在
    const address = await executeQuery(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [address_id, userId]
    )
    
    if (address.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '收货地址不存在'
      })
    }
    
    // 验证商品并计算总金额
    let totalAmount = 0
    const orderGoods = []
    
    for (const item of goods_list) {
      const goods = await executeQuery(
        'SELECT * FROM goods WHERE id = ? AND status = 1',
        [item.goods_id]
      )
      
      if (goods.length === 0) {
        return res.status(404).json({
          code: 404,
          message: `商品ID ${item.goods_id} 不存在或已下架`
        })
      }
      
      if (goods[0].stock < item.quantity) {
        return res.status(400).json({
          code: 400,
          message: `商品 ${goods[0].name} 库存不足`
        })
      }
      
      const subtotal = goods[0].price * item.quantity
      totalAmount += subtotal
      
      orderGoods.push({
        goods_id: item.goods_id,
        goods_name: goods[0].name,
        goods_image: goods[0].image,
        price: goods[0].price,
        quantity: item.quantity,
        subtotal
      })
    }
    
    // 生成订单号
    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    
    // 创建订单和订单商品（使用事务）
    const queries = [
      {
        sql: 'INSERT INTO orders (order_no, user_id, address_id, total_amount, status, remark) VALUES (?, ?, ?, ?, ?, ?)',
        params: [orderNo, userId, address_id, totalAmount, 0, remark]
      }
    ]
    
    const results = await executeTransaction(queries)
    const orderId = results[0].insertId
    
    // 插入订单商品
    for (const item of orderGoods) {
      await executeQuery(
        'INSERT INTO order_goods (order_id, goods_id, goods_name, goods_image, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.goods_id, item.goods_name, item.goods_image, item.price, item.quantity, item.subtotal]
      )
      
      // 减少库存
      await executeQuery(
        'UPDATE goods SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.goods_id]
      )
    }
    
    log.info('创建订单成功', { userId, orderId, orderNo, totalAmount })
    
    res.json({
      code: 200,
      message: '创建订单成功',
      data: {
        order_id: orderId,
        order_no: orderNo,
        total_amount: totalAmount
      }
    })
  } catch (error) {
    log.error('创建订单失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '创建订单失败'
    })
  }
}

// 获取订单列表
const getOrderList = async (req, res) => {
  try {
    const userId = req.user.id
    const { 
      page = 1, 
      pageSize = 10, 
      status 
    } = req.query
    
    let sql = `SELECT o.*, a.name as address_name, a.phone as address_phone,
                       CONCAT(a.province, ' ', a.city, ' ', a.district, ' ', a.detail) as address_detail
                FROM orders o
                LEFT JOIN addresses a ON o.address_id = a.id
                WHERE o.user_id = ?`
    let params = [userId]
    
    if (status !== undefined && status !== '') {
      sql += ' AND o.status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY o.created_at DESC'
    
    const result = await executeQuery(
      sql + ` LIMIT ${(page - 1) * pageSize}, ${pageSize}`,
      params
    )
    
    // 获取总数
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await executeQuery(countSql, params)
    const total = countResult[0].total
    
    log.info('获取订单列表成功', { userId, page, pageSize, total })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: result,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    log.error('获取订单列表失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败'
    })
  }
}

// 获取订单详情
const getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // 获取订单基本信息
    const orders = await executeQuery(
      `SELECT o.*, a.name as address_name, a.phone as address_phone,
              CONCAT(a.province, ' ', a.city, ' ', a.district, ' ', a.detail) as address_detail
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.id = ? AND o.user_id = ?`,
      [id, userId]
    )
    
    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      })
    }
    
    // 获取订单商品
    const orderGoods = await executeQuery(
      'SELECT * FROM order_goods WHERE order_id = ?',
      [id]
    )
    
    log.info('获取订单详情成功', { userId, orderId: id })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        order: orders[0],
        goods: orderGoods
      }
    })
  } catch (error) {
    log.error('获取订单详情失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取订单详情失败'
    })
  }
}

// 发起支付
const payOrder = async (req, res) => {
  try {
    const userId = req.user.id
    const { order_id } = req.body
    
    // 验证订单
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 0',
      [order_id, userId]
    )
    
    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在或状态不正确'
      })
    }
    
    const order = orders[0]
    
    // 调用微信支付
    const payResult = await unifiedOrder({
      orderNo: order.order_no,
      totalFee: order.total_amount,
      body: '商城商品',
      openid: req.user.openid
    })
    
    if (payResult.return_code === 'SUCCESS' && payResult.result_code === 'SUCCESS') {
      log.info('发起支付成功', { userId, orderId: order_id, orderNo: order.order_no })
      
      res.json({
        code: 200,
        message: '发起支付成功',
        data: {
          timeStamp: payResult.timeStamp,
          nonceStr: payResult.nonce_str,
          package: payResult.prepay_id,
          signType: 'MD5',
          paySign: payResult.paySign
        }
      })
    } else {
      log.error('发起支付失败', { payResult })
      res.status(400).json({
        code: 400,
        message: '发起支付失败：' + (payResult.err_code_des || payResult.return_msg)
      })
    }
  } catch (error) {
    log.error('发起支付失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '发起支付失败'
    })
  }
}

// 确认收货
const confirmOrder = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // 验证订单
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 2',
      [id, userId]
    )
    
    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在或状态不正确'
      })
    }
    
    // 更新订单状态为已完成
    await executeQuery(
      'UPDATE orders SET status = 3, complete_time = NOW() WHERE id = ?',
      [id]
    )
    
    log.info('确认收货成功', { userId, orderId: id })
    
    res.json({
      code: 200,
      message: '确认收货成功'
    })
  } catch (error) {
    log.error('确认收货失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '确认收货失败'
    })
  }
}

// 取消订单
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // 验证订单
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 0',
      [id, userId]
    )
    
    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在或状态不正确'
      })
    }
    
    // 更新订单状态为已取消
    await executeQuery(
      'UPDATE orders SET status = 4 WHERE id = ?',
      [id]
    )
    
    // 恢复库存
    const orderGoods = await executeQuery(
      'SELECT * FROM order_goods WHERE order_id = ?',
      [id]
    )
    
    for (const item of orderGoods) {
      await executeQuery(
        'UPDATE goods SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.goods_id]
      )
    }
    
    log.info('取消订单成功', { userId, orderId: id })
    
    res.json({
      code: 200,
      message: '取消订单成功'
    })
  } catch (error) {
    log.error('取消订单失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '取消订单失败'
    })
  }
}

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  payOrder,
  confirmOrder,
  cancelOrder
}
