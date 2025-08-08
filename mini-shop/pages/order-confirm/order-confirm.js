// pages/order-confirm/order-confirm.js
// 引入请求工具和图片处理工具
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  data: {
    loading: false,
    submitting: false,
    // 订单信息
    orderInfo: {
      goods: [],
      totalPrice: 0,
      freight: 0,
      discount: 0,
      actualPrice: 0
    },
    // 收货地址
    selectedAddress: null,
    // 订单备注
    remark: '',
    // 支付方式
    payMethod: 'wechat', // wechat, alipay
    // 来源类型：cart(购物车), goods(商品详情)
    sourceType: 'cart',
    // 商品信息（从商品详情页传入）
    goodsInfo: null
  },

  onLoad(options) {
    console.log('订单确认页面参数:', options);
    
    // 解析来源类型和商品信息
    if (options.sourceType) {
      this.setData({ sourceType: options.sourceType });
    }
    
    if (options.goodsInfo) {
      try {
        const goodsInfo = JSON.parse(decodeURIComponent(options.goodsInfo));
        this.setData({ goodsInfo });
      } catch (e) {
        console.error('解析商品信息失败:', e);
      }
    }
    
    this.initPage();
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.setData({ loading: true });
    
    // 并行加载数据
    Promise.all([
      this.loadOrderInfo(),
      this.loadDefaultAddress()
    ]).then(() => {
      this.setData({ loading: false });
    }).catch(err => {
      console.error('页面初始化失败:', err);
      this.setData({ loading: false });
    });
  },

  /**
   * 加载订单信息
   */
  loadOrderInfo() {
    if (this.data.sourceType === 'cart') {
      // 从购物车创建订单
      return request.post('/api/order/preview', {
        cartIds: wx.getStorageSync('selectedCartIds') || []
      }).then(res => {
        if (res.code === 200) {
          const orderInfo = res.data;
          // 处理商品图片
          orderInfo.goods = image.processImageUrls(orderInfo.goods, 'image', '/images/default/goods.png');
          this.setData({ orderInfo });
          return res;
        } else {
          throw new Error(res.message || '获取订单信息失败');
        }
      });
    } else {
      // 从商品详情创建订单
      const { goodsInfo } = this.data;
      if (!goodsInfo) {
        throw new Error('商品信息不存在');
      }
      
      const orderInfo = {
        goods: [{
          ...goodsInfo,
          image: image.getImageUrl(goodsInfo.image, '/images/default/goods.png'),
          quantity: goodsInfo.quantity || 1
        }],
        totalPrice: (goodsInfo.price * (goodsInfo.quantity || 1)).toFixed(2),
        freight: 0,
        discount: 0,
        actualPrice: (goodsInfo.price * (goodsInfo.quantity || 1)).toFixed(2)
      };
      
      this.setData({ orderInfo });
      return Promise.resolve({ code: 200 });
    }
  },

  /**
   * 加载默认地址
   */
  loadDefaultAddress() {
    return request.get('/api/address/default').then(res => {
      if (res.code === 200 && res.data) {
        this.setData({ selectedAddress: res.data });
      }
      return res;
    }).catch(err => {
      console.error('获取默认地址失败:', err);
      return { code: 404 };
    });
  },

  /**
   * 选择收货地址
   */
  onSelectAddress() {
    wx.navigateTo({
      url: '/pages/address-list/address-list?select=true'
    });
  },

  /**
   * 地址选择回调
   */
  onAddressSelected(address) {
    this.setData({ selectedAddress: address });
  },

  /**
   * 备注输入变化
   */
  onRemarkChange(e) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 支付方式选择
   */
  onPayMethodChange(e) {
    this.setData({ payMethod: e.detail.value });
  },

  /**
   * 表单验证
   */
  validateForm() {
    if (!this.data.selectedAddress) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'error'
      });
      return false;
    }
    
    if (this.data.orderInfo.goods.length === 0) {
      wx.showToast({
        title: '订单商品不能为空',
        icon: 'error'
      });
      return false;
    }
    
    return true;
  },

  /**
   * 提交订单
   */
  onSubmitOrder() {
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({ submitting: true });
    
    const orderData = {
      addressId: this.data.selectedAddress.id,
      remark: this.data.remark,
      payMethod: this.data.payMethod,
      sourceType: this.data.sourceType,
      goodsInfo: this.data.goodsInfo
    };
    
    request.post('/api/order/create', orderData).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '订单创建成功',
          icon: 'success'
        });
        
        // 跳转到支付页面或订单详情页
        setTimeout(() => {
          if (res.data.payInfo) {
            // 有支付信息，跳转支付
            this.goToPay(res.data.orderId, res.data.payInfo);
          } else {
            // 无支付信息，跳转订单详情
            wx.redirectTo({
              url: `/pages/order-detail/order-detail?id=${res.data.orderId}`
            });
          }
        }, 1500);
      } else {
        wx.showToast({
          title: res.message || '创建订单失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('创建订单失败:', err);
      wx.showToast({
        title: '创建订单失败',
        icon: 'error'
      });
    }).finally(() => {
      this.setData({ submitting: false });
    });
  },

  /**
   * 跳转支付页面
   */
  goToPay(orderId, payInfo) {
    // 这里可以根据支付方式跳转到不同的支付页面
    // 或者直接调用微信支付API
    wx.requestPayment({
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package,
      signType: payInfo.signType,
      paySign: payInfo.paySign,
      success: (res) => {
        console.log('支付成功:', res);
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        });
        
        // 跳转到订单详情页
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/order-detail/order-detail?id=${orderId}`
          });
        }, 1500);
      },
      fail: (err) => {
        console.error('支付失败:', err);
        wx.showToast({
          title: '支付失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '确认订单',
      path: '/pages/order-confirm/order-confirm'
    };
  }
});