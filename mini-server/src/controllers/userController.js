const { code2Session } = require('../utils/wechat')
const { generateToken } = require('../utils/jwt')
const UserModel = require('../models/userModel')
const log = require('../utils/logger')

// 用户登录（微信小程序）
const login = async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少登录凭证'
      })
    }
    
    // 调用微信API获取用户openid
    const wechatResult = await code2Session(code)
    
    if (wechatResult.errcode) {
      return res.status(400).json({
        code: 400,
        message: '微信登录失败：' + wechatResult.errmsg
      })
    }
    
    const { openid, session_key } = wechatResult
    
    // 查找或创建用户
    let user = await UserModel.findByOpenid(openid)
    
    if (!user) {
      // 新用户，创建用户记录
      user = await UserModel.create({
        openid,
        nickname: '微信用户',
        avatar: null
      })
    }
    
    // 生成JWT token
    const token = generateToken({
      id: user.id,
      openid: user.openid,
      type: 'user'
    })
    
    log.info('用户登录成功', { userId: user.id, openid })
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone
        }
      }
    })
  } catch (error) {
    log.error('用户登录失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '登录失败'
    })
  }
}

// 获取用户信息
const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id
    
    const user = await UserModel.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: user
    })
  } catch (error) {
    log.error('获取用户信息失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败'
    })
  }
}

// 更新用户信息
const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id
    const { nickname, avatar, phone, gender } = req.body
    
    const updatedUser = await UserModel.update(userId, {
      nickname,
      avatar,
      phone,
      gender
    })
    
    if (!updatedUser) {
      return res.status(400).json({
        code: 400,
        message: '没有需要更新的字段'
      })
    }
    
    log.info('用户信息更新成功', { userId })
    
    res.json({
      code: 200,
      message: '更新成功',
      data: updatedUser
    })
  } catch (error) {
    log.error('更新用户信息失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '更新用户信息失败'
    })
  }
}

// 用户退出登录
const logout = async (req, res) => {
  try {
    // JWT token会在客户端删除，服务端无需特殊处理
    log.info('用户退出登录', { userId: req.user.id })
    
    res.json({
      code: 200,
      message: '退出成功'
    })
  } catch (error) {
    log.error('用户退出登录失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '退出失败'
    })
  }
}

module.exports = {
  login,
  getUserInfo,
  updateUserInfo,
  logout
}
