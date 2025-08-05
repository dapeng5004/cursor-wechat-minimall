module.exports = {
  // 微信小程序配置
  appid: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET,
  
  // 微信支付配置
  pay: {
    mchid: process.env.WECHAT_PAY_MCHID,
    key: process.env.WECHAT_PAY_KEY,
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL
  },
  
  // 微信API接口
  api: {
    // 登录凭证校验
    code2Session: 'https://api.weixin.qq.com/sns/jscode2session',
    // 获取小程序全局唯一后台接口调用凭据
    getAccessToken: 'https://api.weixin.qq.com/cgi-bin/token',
    // 微信支付统一下单
    unifiedOrder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    // 微信支付查询订单
    orderQuery: 'https://api.mch.weixin.qq.com/pay/orderquery',
    // 微信支付申请退款
    refund: 'https://api.mch.weixin.qq.com/secapi/pay/refund'
  }
} 