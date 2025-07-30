const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
const auth = require('../middleware/auth')

const router = express.Router()

// 管理员登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      })
    }

    const { username, password } = req.body

    // 查询管理员
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE username = ? AND status = 1',
      [username]
    )

    if (rows.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名或密码错误'
      })
    }

    const admin = rows[0]

    // 验证密码
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: '用户名或密码错误'
      })
    }

    // 更新最后登录时间
    await pool.execute(
      'UPDATE admins SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?',
      [req.ip, admin.id]
    )

    // 生成JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          avatar: admin.avatar,
          role: admin.role
        }
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({
      code: 500,
      message: '登录失败'
    })
  }
})

// 获取管理员信息
router.get('/info', auth, async (req, res) => {
  try {
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        id: req.admin.id,
        username: req.admin.username,
        nickname: req.admin.nickname,
        avatar: req.admin.avatar,
        role: req.admin.role
      }
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取信息失败'
    })
  }
})

// 管理员退出
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      code: 200,
      message: '退出成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '退出失败'
    })
  }
})

module.exports = router 