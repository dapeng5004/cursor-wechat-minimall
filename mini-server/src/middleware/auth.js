const { verifyToken, extractToken } = require('../utils/jwt')

// 用户身份认证中间件
const auth = (req, res, next) => {
  try {
    const token = extractToken(req)
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        code: 401,
        message: '认证令牌无效'
      })
    }
    
    req.user = decoded
    next()
  } catch (error) {
    console.error('身份认证错误:', error)
    return res.status(401).json({
      code: 401,
      message: '身份认证失败'
    })
  }
}

// 管理员身份认证中间件
const adminAuth = (req, res, next) => {
  try {
    const token = extractToken(req)
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        code: 401,
        message: '认证令牌无效'
      })
    }
    
    // 检查是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }
    
    req.admin = decoded
    next()
  } catch (error) {
    console.error('管理员身份认证错误:', error)
    return res.status(401).json({
      code: 401,
      message: '身份认证失败'
    })
  }
}

module.exports = {
  auth,
  adminAuth
} 