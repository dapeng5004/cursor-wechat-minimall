module.exports = {
  // 支付配置
  wechat: {
    mchid: process.env.WECHAT_PAY_MCHID,
    key: process.env.WECHAT_PAY_KEY,
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL,
    // 支付结果通知地址
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL,
    // 退款结果通知地址
    refundNotifyUrl: process.env.WECHAT_PAY_REFUND_NOTIFY_URL
  },
  
  // 支付状态
  status: {
    PENDING: 0,    // 待支付
    PAID: 1,       // 已支付
    REFUNDED: 2,   // 已退款
    FAILED: 3      // 支付失败
  },
  
  // 支付方式
  methods: {
    WECHAT: 'wechat',  // 微信支付
    BALANCE: 'balance'  // 余额支付
  }
} 