const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// 生成JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

// 验证JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// 从请求头中提取token
const extractToken = (req) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken
} 