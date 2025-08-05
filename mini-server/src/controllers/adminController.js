const { executeQuery } = require('../utils/database')
const { generateToken } = require('../utils/jwt')
const bcrypt = require('bcryptjs')
const log = require('../utils/logger')

// 管理员登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }
    
    // 查找管理员
    const admins = await executeQuery(
      'SELECT * FROM admins WHERE username = ? AND status = 1',
      [username]
    )
    
    if (admins.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }
    
    const admin = admins[0]
    
    // 验证密码（使用MD5，因为数据库中的密码是MD5加密的）
    const crypto = require('crypto')
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex')
    
    if (hashedPassword !== admin.password) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }
    
    // 生成JWT token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin'
    })
    
    // 更新最后登录时间和IP
    await executeQuery(
      'UPDATE admins SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?',
      [req.ip, admin.id]
    )
    
    log.info('管理员登录成功', { adminId: admin.id, username: admin.username })
    
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
    log.error('管理员登录失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '登录失败'
    })
  }
}

// 获取管理员信息
const getAdminInfo = async (req, res) => {
  try {
    const adminId = req.user.id
    
    const admins = await executeQuery(
      'SELECT id, username, nickname, avatar, role, status, last_login_time, last_login_ip FROM admins WHERE id = ?',
      [adminId]
    )
    
    if (admins.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '管理员不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: admins[0]
    })
  } catch (error) {
    log.error('获取管理员信息失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取管理员信息失败'
    })
  }
}

// 管理员退出登录
const logout = async (req, res) => {
  try {
    log.info('管理员退出登录', { adminId: req.user.id })
    
    res.json({
      code: 200,
      message: '退出成功'
    })
  } catch (error) {
    log.error('管理员退出登录失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '退出失败'
    })
  }
}

module.exports = {
  login,
  getAdminInfo,
  logout
}
