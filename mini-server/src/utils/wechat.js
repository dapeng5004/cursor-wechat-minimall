const axios = require('axios')
const wechatConfig = require('../config/wechat')

// 微信登录凭证校验
const code2Session = async (code) => {
  try {
    const url = wechatConfig.api.code2Session
    const params = {
      appid: wechatConfig.appid,
      secret: wechatConfig.secret,
      js_code: code,
      grant_type: 'authorization_code'
    }
    
    const response = await axios.get(url, { params })
    return response.data
  } catch (error) {
    console.error('微信登录凭证校验失败:', error)
    throw error
  }
}

// 获取小程序全局唯一后台接口调用凭据
const getAccessToken = async () => {
  try {
    const url = wechatConfig.api.getAccessToken
    const params = {
      grant_type: 'client_credential',
      appid: wechatConfig.appid,
      secret: wechatConfig.secret
    }
    
    const response = await axios.get(url, { params })
    return response.data
  } catch (error) {
    console.error('获取微信access_token失败:', error)
    throw error
  }
}

// 生成微信支付签名
const generatePaySign = (params, key) => {
  // TODO: 实现微信支付签名算法
  return ''
}

// 验证微信支付回调签名
const verifyPaySign = (params, sign, key) => {
  // TODO: 实现微信支付签名验证
  return false
}

module.exports = {
  code2Session,
  getAccessToken,
  generatePaySign,
  verifyPaySign
} 