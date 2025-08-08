// pages/goods-detail/goods-detail.js
// 引入请求工具和图片处理工具
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  data: {
    goods: {},
    loading: false,
    globalLoading: false,
    hasError: false,
    quantity: 1,
    showQuantityModal: false,
    currentImageIndex: 0,
    imageCount: 1,
    imageList: []
  },

  onLoad(options) {
    if (options.id) {
      this.loadGoodsDetail(options.id);
    } else {
      wx.showToast({
        title: '商品ID错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onShow() {
    // 更新购物车数量
    this.updateCartCount();
  },

  loadGoodsDetail(id) {
    this.setData({ 
      globalLoading: true,
      hasError: false
    });
    
    request.get(`/api/goods/${id}`).then(res => {
      if (res.code === 200) {
        // 处理图片URL，将相对路径转换为完整URL
        const goods = image.processGoodsImage(res.data || {});
        // 计算图片列表和数量
        const imageList = (goods.images && goods.images.length > 0) ? goods.images : [goods.image];
        const imageCount = imageList.length;
        this.setData({ 
          goods: goods,
          imageList: imageList,
          imageCount: imageCount,
          globalLoading: false,
          hasError: false
        });
        // 设置标题
        wx.setNavigationBarTitle({ title: goods.name || '商品详情' });
      } else {
        console.error('加载商品详情失败:', res);
        this.setData({ 
          globalLoading: false,
          hasError: true
        });
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('加载商品详情失败:', err);
      this.setData({ 
        globalLoading: false,
        hasError: true
      });
      wx.showToast({
        title: '网络请求失败',
        icon: 'error'
      });
    });
  },

  onImageChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  onQuantityChange(e) {
    const { action } = e.currentTarget.dataset;
    let quantity = this.data.quantity;
    
    if (action === 'plus') {
      quantity = Math.min(quantity + 1, this.data.goods.stock || 999);
    } else if (action === 'minus') {
      quantity = Math.max(quantity - 1, 1);
    }
    
    this.setData({ quantity });
  },

  onShowQuantityModal() {
    this.setData({ showQuantityModal: true });
  },

  onHideQuantityModal() {
    this.setData({ showQuantityModal: false });
  },

  onAddToCart() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ 
        title: '请先登录', 
        icon: 'error' 
      });
      return;
    }
    
    this.setData({ loading: true });
    
    request.post('/api/cart/add', {
      goodsId: this.data.goods.id,
      quantity: this.data.quantity
    }).then(res => {
      if (res.code === 200) {
        wx.showToast({ 
          title: '加入成功', 
          icon: 'success' 
        });
        this.updateCartCount();
        this.onHideQuantityModal();
      } else {
        wx.showToast({ 
          title: res.message || '加入失败', 
          icon: 'error' 
        });
      }
    }).catch(err => {
      console.error('加入购物车失败:', err);
      wx.showToast({ 
        title: '加入失败', 
        icon: 'error' 
      });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  onBuyNow() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ 
        title: '请先登录', 
        icon: 'error' 
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?goodsId=${this.data.goods.id}&quantity=${this.data.quantity}`
    });
  },

  updateCartCount() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    request.get('/api/cart/count').then(res => {
      if (res.code === 200) {
        const count = res.data.count || 0;
        if (count > 0) {
          wx.setTabBarBadge({
            index: 2, // 购物车tab索引
            text: count.toString()
          });
        } else {
          wx.removeTabBarBadge({
            index: 2
          });
        }
      }
    }).catch(err => {
      console.error('获取购物车数量失败:', err);
    });
  },

  onRetry() {
    this.loadGoodsDetail(this.data.goods.id);
  },

  onShareAppMessage() {
    const goods = this.data.goods;
    return {
      title: goods.name || '商品详情',
      path: `/pages/goods-detail/goods-detail?id=${goods.id}`,
      imageUrl: goods.image || '/images/default/share.png'
    };
  }
});