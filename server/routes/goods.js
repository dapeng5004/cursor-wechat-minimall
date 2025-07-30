const express = require('express')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
const auth = require('../middleware/auth')

const router = express.Router()

// 获取商品列表
router.get('/goods/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', category_id = '' } = req.query
    const offset = (page - 1) * pageSize

    let sql = `
      SELECT g.*, c.name as category_name 
      FROM goods g 
      LEFT JOIN categories c ON g.category_id = c.id 
      WHERE 1=1
    `
    let countSql = 'SELECT COUNT(*) as total FROM goods g WHERE 1=1'
    let params = []
    let countParams = []

    if (keyword) {
      sql += ' AND g.name LIKE ?'
      countSql += ' AND g.name LIKE ?'
      params.push(`%${keyword}%`)
      countParams.push(`%${keyword}%`)
    }

    if (category_id) {
      sql += ' AND g.category_id = ?'
      countSql += ' AND g.category_id = ?'
      params.push(category_id)
      countParams.push(category_id)
    }

    sql += ` ORDER BY g.id DESC LIMIT ${parseInt(pageSize)} OFFSET ${offset}`

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
    console.error('获取商品列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败'
    })
  }
})

// 获取商品详情
router.get('/goods/detail/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [rows] = await pool.execute(
      'SELECT g.*, c.name as category_name FROM goods g LEFT JOIN categories c ON g.category_id = c.id WHERE g.id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: rows[0]
    })
  } catch (error) {
    console.error('获取商品详情错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败'
    })
  }
})

// 新增商品
router.post('/goods/add', auth, [
  body('name').notEmpty().withMessage('商品名称不能为空'),
  body('price').isFloat({ min: 0 }).withMessage('价格无效'),
  body('category_id').isInt({ min: 1 }).withMessage('分类无效'),
  body('image').notEmpty().withMessage('商品主图不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const {
      name, image, images, price, original_price, stock, category_id,
      description, detail, is_recommend = 0, status = 1
    } = req.body

    const [result] = await pool.execute(
      `INSERT INTO goods (name, image, images, price, original_price, stock, category_id, 
        description, detail, is_recommend, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, image, images, price, original_price, stock, category_id,
       description, detail, is_recommend, status]
    )

    res.json({
      code: 200,
      message: '新增成功',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('新增商品错误:', error)
    res.status(500).json({
      code: 500,
      message: '新增商品失败'
    })
  }
})

// 编辑商品
router.post('/goods/update', auth, [
  body('id').notEmpty().withMessage('ID不能为空'),
  body('name').notEmpty().withMessage('商品名称不能为空'),
  body('price').isFloat({ min: 0 }).withMessage('价格无效'),
  body('category_id').isInt({ min: 1 }).withMessage('分类无效'),
  body('image').notEmpty().withMessage('商品主图不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const {
      id, name, image, images, price, original_price, stock, category_id,
      description, detail, is_recommend, status
    } = req.body

    await pool.execute(
      `UPDATE goods SET name = ?, image = ?, images = ?, price = ?, original_price = ?, 
       stock = ?, category_id = ?, description = ?, detail = ?, is_recommend = ?, status = ? 
       WHERE id = ?`,
      [name, image, images, price, original_price, stock, category_id,
       description, detail, is_recommend, status, id]
    )

    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('编辑商品错误:', error)
    res.status(500).json({
      code: 500,
      message: '编辑商品失败'
    })
  }
})

// 删除商品
router.post('/goods/delete', auth, [
  body('id').notEmpty().withMessage('ID不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { id } = req.body

    await pool.execute('DELETE FROM goods WHERE id = ?', [id])

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除商品错误:', error)
    res.status(500).json({
      code: 500,
      message: '删除商品失败'
    })
  }
})

// 商品上下架
router.post('/goods/status', auth, [
  body('id').notEmpty().withMessage('ID不能为空'),
  body('status').isIn([0, 1]).withMessage('状态值无效')
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

    await pool.execute('UPDATE goods SET status = ? WHERE id = ?', [status, id])

    res.json({
      code: 200,
      message: '状态更新成功'
    })
  } catch (error) {
    console.error('修改商品状态错误:', error)
    res.status(500).json({
      code: 500,
      message: '修改状态失败'
    })
  }
})

// 批量上下架
router.post('/goods/batch-status', auth, [
  body('ids').isArray().withMessage('商品ID列表无效'),
  body('status').isIn([0, 1]).withMessage('状态值无效')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { ids, status } = req.body

    const placeholders = ids.map(() => '?').join(',')
    await pool.execute(
      `UPDATE goods SET status = ? WHERE id IN (${placeholders})`,
      [status, ...ids]
    )

    res.json({
      code: 200,
      message: '批量操作成功'
    })
  } catch (error) {
    console.error('批量修改商品状态错误:', error)
    res.status(500).json({
      code: 500,
      message: '批量操作失败'
    })
  }
})

module.exports = router 