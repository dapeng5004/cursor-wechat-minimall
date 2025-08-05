const express = require('express')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
const auth = require('../middleware/auth')

const router = express.Router()

// 获取分类列表
router.get('/category/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query
    const offset = (page - 1) * pageSize

    let sql = 'SELECT * FROM categories WHERE 1=1'
    let countSql = 'SELECT COUNT(*) as total FROM categories WHERE 1=1'
    let params = []
    let countParams = []

    if (keyword) {
      sql += ' AND name LIKE ?'
      countSql += ' AND name LIKE ?'
      params.push(`%${keyword}%`)
      countParams.push(`%${keyword}%`)
    }

    sql += ` ORDER BY id ASC LIMIT ${parseInt(pageSize)} OFFSET ${offset}`

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
    console.error('获取分类列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取分类列表失败'
    })
  }
})

// 新增分类
router.post('/category/add', auth, [
  body('name').notEmpty().withMessage('分类名称不能为空'),
  body('image').notEmpty().withMessage('分类图片不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { name, image, sort = 0, status = 1 } = req.body

    const [result] = await pool.execute(
      'INSERT INTO categories (name, image, sort, status) VALUES (?, ?, ?, ?)',
      [name, image, sort, status]
    )

    res.json({
      code: 200,
      message: '新增成功',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('新增分类错误:', error)
    res.status(500).json({
      code: 500,
      message: '新增分类失败'
    })
  }
})

// 编辑分类
router.post('/category/update', auth, [
  body('id').notEmpty().withMessage('ID不能为空'),
  body('name').notEmpty().withMessage('分类名称不能为空'),
  body('image').notEmpty().withMessage('分类图片不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { id, name, image, sort, status } = req.body

    await pool.execute(
      'UPDATE categories SET name = ?, image = ?, sort = ?, status = ? WHERE id = ?',
      [name, image, sort, status, id]
    )

    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('编辑分类错误:', error)
    res.status(500).json({
      code: 500,
      message: '编辑分类失败'
    })
  }
})

// 删除分类
router.post('/category/delete', auth, [
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

    // 检查是否有商品使用此分类
    const [goodsRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM goods WHERE category_id = ?',
      [id]
    )

    if (goodsRows[0].count > 0) {
      return res.status(400).json({
        code: 400,
        message: '该分类下还有商品，无法删除'
      })
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id])

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除分类错误:', error)
    res.status(500).json({
      code: 500,
      message: '删除分类失败'
    })
  }
})

// 修改分类状态
router.post('/category/status', auth, [
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

    await pool.execute('UPDATE categories SET status = ? WHERE id = ?', [status, id])

    res.json({
      code: 200,
      message: '状态更新成功'
    })
  } catch (error) {
    console.error('修改分类状态错误:', error)
    res.status(500).json({
      code: 500,
      message: '修改状态失败'
    })
  }
})

// 修改分类排序
router.post('/category/sort', auth, [
  body('id').notEmpty().withMessage('ID不能为空'),
  body('sort').isInt({ min: 0 }).withMessage('排序值无效')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { id, sort } = req.body

    await pool.execute('UPDATE categories SET sort = ? WHERE id = ?', [sort, id])

    res.json({
      code: 200,
      message: '排序更新成功'
    })
  } catch (error) {
    console.error('修改分类排序错误:', error)
    res.status(500).json({
      code: 500,
      message: '修改排序失败'
    })
  }
})

module.exports = router 