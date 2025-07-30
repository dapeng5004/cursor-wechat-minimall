const express = require('express')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
const auth = require('../middleware/auth')

const router = express.Router()

// 获取订单列表
router.get('/order/list', async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      order_no = '', 
      status = '', 
      start_date = '', 
      end_date = '' 
    } = req.query
    const offset = (page - 1) * pageSize

    let sql = `
      SELECT o.*, u.nickname as user_nickname,
             a.name as address_name, a.phone as address_phone,
             CONCAT(a.province, ' ', a.city, ' ', a.district, ' ', a.detail) as address_detail
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE 1=1
    `
    let countSql = 'SELECT COUNT(*) as total FROM orders o WHERE 1=1'
    let params = []
    let countParams = []

    if (order_no) {
      sql += ' AND o.order_no LIKE ?'
      countSql += ' AND o.order_no LIKE ?'
      params.push(`%${order_no}%`)
      countParams.push(`%${order_no}%`)
    }

    if (status !== '') {
      sql += ' AND o.status = ?'
      countSql += ' AND o.status = ?'
      params.push(status)
      countParams.push(status)
    }

    if (start_date) {
      sql += ' AND DATE(o.created_at) >= ?'
      countSql += ' AND DATE(o.created_at) >= ?'
      params.push(start_date)
      countParams.push(start_date)
    }

    if (end_date) {
      sql += ' AND DATE(o.created_at) <= ?'
      countSql += ' AND DATE(o.created_at) <= ?'
      params.push(end_date)
      countParams.push(end_date)
    }

    sql += ` ORDER BY o.id DESC LIMIT ${parseInt(pageSize)} OFFSET ${offset}`

    const [rows] = await pool.execute(sql, params)
    const [countRows] = await pool.execute(countSql, countParams)

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: countRows[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取订单列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败'
    })
  }
})

// 获取订单详情
router.get('/order/detail/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 获取订单基本信息
    const [orderRows] = await pool.execute(
      `SELECT o.*, u.nickname as user_nickname,
              a.name as address_name, a.phone as address_phone,
              a.province as address_province, a.city as address_city,
              a.district as address_district, a.detail as address_detail
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.id = ?`,
      [id]
    )

    if (orderRows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      })
    }

    // 获取订单商品
    const [goodsRows] = await pool.execute(
      'SELECT * FROM order_goods WHERE order_id = ?',
      [id]
    )

    const orderDetail = {
      ...orderRows[0],
      goods: goodsRows
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: orderDetail
    })
  } catch (error) {
    console.error('获取订单详情错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取订单详情失败'
    })
  }
})

// 订单发货
router.post('/order/ship', auth, [
  body('order_id').notEmpty().withMessage('订单ID不能为空'),
  body('logistics_company').notEmpty().withMessage('物流公司不能为空'),
  body('logistics_no').notEmpty().withMessage('物流单号不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { order_id, logistics_company, logistics_no, remark = '' } = req.body

    // 更新订单状态和物流信息
    await pool.execute(
      `UPDATE orders SET status = 2, ship_time = NOW() WHERE id = ?`,
      [order_id]
    )

    // 这里可以添加物流信息表来存储物流详情
    // 暂时在订单表中添加物流信息字段

    res.json({
      code: 200,
      message: '发货成功'
    })
  } catch (error) {
    console.error('订单发货错误:', error)
    res.status(500).json({
      code: 500,
      message: '发货失败'
    })
  }
})

// 修改订单状态
router.post('/order/status', auth, [
  body('id').notEmpty().withMessage('订单ID不能为空'),
  body('status').isIn([0, 1, 2, 3, 4]).withMessage('状态值无效')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { id, status } = req.body

    let updateSql = 'UPDATE orders SET status = ?'
    let params = [status]

    // 根据状态设置相应的时间字段
    if (status === 1) {
      updateSql += ', payment_time = NOW()'
    } else if (status === 2) {
      updateSql += ', ship_time = NOW()'
    } else if (status === 3) {
      updateSql += ', complete_time = NOW()'
    }

    updateSql += ' WHERE id = ?'
    params.push(id)

    await pool.execute(updateSql, params)

    res.json({
      code: 200,
      message: '状态更新成功'
    })
  } catch (error) {
    console.error('修改订单状态错误:', error)
    res.status(500).json({
      code: 500,
      message: '修改状态失败'
    })
  }
})

module.exports = router