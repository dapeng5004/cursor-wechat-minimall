const express = require('express')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
const auth = require('../middleware/auth')

const router = express.Router()

// 获取商品列表
router.get('/goods/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name = '', category_id = '', status = '' } = req.query
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

    if (name && name.trim() !== '') {
      sql += ' AND g.name LIKE ?'
      countSql += ' AND g.name LIKE ?'
      params.push(`%${name.trim()}%`)
      countParams.push(`%${name.trim()}%`)
    }

    if (category_id && category_id !== '' && category_id !== 'null') {
      sql += ' AND g.category_id = ?'
      countSql += ' AND g.category_id = ?'
      params.push(category_id)
      countParams.push(category_id)
    }

    if (status !== '' && status !== 'null' && status !== null) {
      sql += ' AND g.status = ?'
      countSql += ' AND g.status = ?'
      params.push(status)
      countParams.push(status)
    }

    sql += ` ORDER BY g.id DESC LIMIT ${parseInt(pageSize)} OFFSET ${offset}`

    console.log('执行SQL:', sql)
    console.log('SQL参数:', params)

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
  body('category_id').custom((value) => {
    const num = parseInt(value)
    if (isNaN(num) || num < 1) {
      throw new Error('分类无效')
    }
    return true
  }).withMessage('分类无效'),
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

    // 确保所有参数都有有效值，避免undefined
    const categoryId = parseInt(category_id) || 1
    const goodsImages = images || null
    const goodsPrice = parseFloat(price) || 0
    const goodsOriginalPrice = parseFloat(original_price) || 0
    const goodsStock = parseInt(stock) || 0
    const goodsDescription = description || ''
    const goodsDetail = detail || ''
    const goodsIsRecommend = Number(is_recommend)
    const goodsStatus = Number(status)

    const [result] = await pool.execute(
      `INSERT INTO goods (name, image, images, price, original_price, stock, category_id, 
        description, detail, is_recommend, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, image, goodsImages, goodsPrice, goodsOriginalPrice, goodsStock, categoryId,
       goodsDescription, goodsDetail, goodsIsRecommend, goodsStatus]
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
  body('category_id').custom((value) => {
    const num = parseInt(value)
    if (isNaN(num) || num < 1) {
      throw new Error('分类无效')
    }
    return true
  }).withMessage('分类无效'),
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

    console.log('=== 后端API调试 ===')
    console.log('接收到的状态值:', {
      status,
      is_recommend,
      status_type: typeof status,
      is_recommend_type: typeof is_recommend
    })

    // 确保所有参数都有有效值，避免undefined
    const categoryId = parseInt(category_id) || 1
    const goodsImages = images || null
    const goodsPrice = parseFloat(price) || 0
    const goodsOriginalPrice = parseFloat(original_price) || 0
    const goodsStock = parseInt(stock) || 0
    const goodsDescription = description || ''
    const goodsDetail = detail || ''
    const goodsIsRecommend = Number(is_recommend)
    const goodsStatus = Number(status)

    console.log('处理后的状态值:', {
      goodsStatus,
      goodsIsRecommend,
      goodsStatus_type: typeof goodsStatus,
      goodsIsRecommend_type: typeof goodsIsRecommend
    })

    await pool.execute(
      `UPDATE goods SET name = ?, image = ?, images = ?, price = ?, original_price = ?, 
       stock = ?, category_id = ?, description = ?, detail = ?, is_recommend = ?, status = ? 
       WHERE id = ?`,
      [name, image, goodsImages, goodsPrice, goodsOriginalPrice, goodsStock, categoryId,
       goodsDescription, goodsDetail, goodsIsRecommend, goodsStatus, id]
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
    console.error('更新商品状态错误:', error)
    res.status(500).json({
      code: 500,
      message: '更新商品状态失败'
    })
  }
})

// 商品推荐状态更新
router.post('/goods/recommend', auth, [
  body('id').notEmpty().withMessage('ID不能为空'),
  body('is_recommend').isIn([0, 1]).withMessage('推荐状态值无效')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { id, is_recommend } = req.body

    await pool.execute('UPDATE goods SET is_recommend = ? WHERE id = ?', [is_recommend, id])

    res.json({
      code: 200,
      message: '推荐状态更新成功'
    })
  } catch (error) {
    console.error('更新商品推荐状态错误:', error)
    res.status(500).json({
      code: 500,
      message: '更新商品推荐状态失败'
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