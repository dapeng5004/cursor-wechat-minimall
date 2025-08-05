const jwt = require('jsonwebtoken')
const pool = require('../config/database')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '请先登录'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE id = ? AND status = 1',
      [decoded.id]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在或已被禁用'
      })
    }

    req.admin = rows[0]
    next()
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: '登录已过期，请重新登录'
    })
  }
}

module.exports = auth 