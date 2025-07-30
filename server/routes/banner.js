const express = require('express')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
const auth = require('../middleware/auth')

const router = express.Router()

// 获取轮播图列表
router.get('/list', async (req, res) => {
  console.log('收到banner列表请求:', req.query)
  
  try {
    const { page = 1, pageSize = 10, title = '', status = '' } = req.query
    
    let sql = 'SELECT * FROM banners WHERE 1=1'
    const params = []
    
    if (title) {
      sql += ' AND title LIKE ?'
      params.push(`%${title}%`)
    }
    
    if (status !== '') {
      sql += ' AND status = ?'
      params.push(parseInt(status))
    }
    
    sql += ' ORDER BY sort ASC, id DESC'
    
    // 添加分页
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    sql += ` LIMIT ${parseInt(pageSize)} OFFSET ${offset}`
    
    console.log('执行SQL:', sql, '参数:', params)
    
    const [rows] = await pool.execute(sql, params)
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM banners WHERE 1=1'
    const countParams = []
    
    if (title) {
      countSql += ' AND title LIKE ?'
      countParams.push(`%${title}%`)
    }
    
    if (status !== '') {
      countSql += ' AND status = ?'
      countParams.push(parseInt(status))
    }
    
    const [countResult] = await pool.execute(countSql, countParams)
    const total = countResult[0].total

    console.log('查询结果:', { rows: rows.length, total })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取轮播图列表错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取轮播图列表失败',
      error: error.message
    })
  }
})

// 获取轮播图详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const [rows] = await pool.execute(
      'SELECT * FROM banners WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '轮播图不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: rows[0]
    })
  } catch (error) {
    console.error('获取轮播图详情错误:', error)
    res.status(500).json({
      code: 500,
      message: '获取轮播图详情失败'
    })
  }
})

// 新增轮播图
router.post('/add', auth, [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('image').notEmpty().withMessage('图片不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { title, image, link = '', sort = 0, status = 1 } = req.body

    const [result] = await pool.execute(
      'INSERT INTO banners (title, image, link, sort, status) VALUES (?, ?, ?, ?, ?)',
      [title, image, link, sort, status]
    )

    res.json({
      code: 200,
      message: '新增成功',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('新增轮播图错误:', error)
    res.status(500).json({
      code: 500,
      message: '新增轮播图失败'
    })
  }
})

// 更新轮播图
router.put('/update', auth, [
  body('id').notEmpty().withMessage('ID不能为空'),
  body('title').notEmpty().withMessage('标题不能为空'),
  body('image').notEmpty().withMessage('图片不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { id, title, image, link = '', sort = 0, status = 1 } = req.body

    await pool.execute(
      'UPDATE banners SET title = ?, image = ?, link = ?, sort = ?, status = ? WHERE id = ?',
      [title, image, link, sort, status, id]
    )

    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新轮播图错误:', error)
    res.status(500).json({
      code: 500,
      message: '更新轮播图失败'
    })
  }
})

// 删除轮播图
router.delete('/delete', auth, [
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

    await pool.execute('DELETE FROM banners WHERE id = ?', [id])

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除轮播图错误:', error)
    res.status(500).json({
      code: 500,
      message: '删除轮播图失败'
    })
  }
})

// 更新轮播图状态
router.put('/status', auth, [
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

    await pool.execute('UPDATE banners SET status = ? WHERE id = ?', [status, id])

    res.json({
      code: 200,
      message: '状态更新成功'
    })
  } catch (error) {
    console.error('更新轮播图状态错误:', error)
    res.status(500).json({
      code: 500,
      message: '更新状态失败'
    })
  }
})

module.exports = router 