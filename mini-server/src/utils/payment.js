const axios = require('axios')
const wechatConfig = require('../config/wechat')
const { generatePaySign, verifyPaySign } = require('./wechat')

// 微信支付统一下单
const unifiedOrder = async (orderData) => {
  try {
    const url = wechatConfig.api.unifiedOrder
    const params = {
      appid: wechatConfig.appid,
      mch_id: wechatConfig.pay.mchid,
      nonce_str: generateNonceStr(),
      body: orderData.body || '商城商品',
      out_trade_no: orderData.orderNo,
      total_fee: Math.round(orderData.totalFee * 100), // 转换为分
      spbill_create_ip: orderData.clientIp || '127.0.0.1',
      notify_url: wechatConfig.pay.notifyUrl,
      trade_type: 'JSAPI',
      openid: orderData.openid
    }
    
    // 生成签名
    params.sign = generatePaySign(params, wechatConfig.pay.key)
    
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/xml' }
    })
    
    return response.data
  } catch (error) {
    console.error('微信支付统一下单失败:', error)
    throw error
  }
}

// 查询微信支付订单
const queryOrder = async (orderNo) => {
  try {
    const url = wechatConfig.api.orderQuery
    const params = {
      appid: wechatConfig.appid,
      mch_id: wechatConfig.pay.mchid,
      out_trade_no: orderNo,
      nonce_str: generateNonceStr()
    }
    
    params.sign = generatePaySign(params, wechatConfig.pay.key)
    
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/xml' }
    })
    
    return response.data
  } catch (error) {
    console.error('查询微信支付订单失败:', error)
    throw error
  }
}

// 生成随机字符串
const generateNonceStr = () => {
  return Math.random().toString(36).substr(2, 15)
}

// 处理微信支付回调
const handlePayNotify = (notifyData) => {
  try {
    // 验证签名
    const sign = notifyData.sign
    delete notifyData.sign
    
    if (!verifyPaySign(notifyData, sign, wechatConfig.pay.key)) {
      return { success: false, message: '签名验证失败' }
    }
    
    // 验证支付结果
    if (notifyData.result_code === 'SUCCESS') {
      return {
        success: true,
        orderNo: notifyData.out_trade_no,
        transactionId: notifyData.transaction_id,
        totalFee: notifyData.total_fee / 100
      }
    } else {
      return { success: false, message: '支付失败' }
    }
  } catch (error) {
    console.error('处理微信支付回调失败:', error)
    return { success: false, message: '处理回调失败' }
  }
}

module.exports = {
  unifiedOrder,
  queryOrder,
  handlePayNotify,
  generateNonceStr
} 