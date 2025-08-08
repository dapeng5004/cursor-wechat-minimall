// components/goods-item/goods-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 商品数据
    goods: {
      type: Object,
      value: {}
    },
    // 是否显示添加购物车按钮
    showAddCart: {
      type: Boolean,
      value: true
    },
    // 是否显示库存
    showStock: {
      type: Boolean,
      value: true
    },
    // 是否显示销量
    showSales: {
      type: Boolean,
      value: false
    },
    // 是否显示评分
    showRating: {
      type: Boolean,
      value: false
    },
    // 布局模式：vertical(垂直) | horizontal(水平)
    layout: {
      type: String,
      value: 'vertical'
    },
    // 尺寸：normal | small
    size: {
      type: String,
      value: 'normal'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击商品项
     */
    onItemTap(e) {
      const goods = this.data.goods;
      if (!goods || !goods.id) return;
      
      // 触发父组件事件
      this.triggerEvent('itemtap', {
        goods: goods
      });
      
      // 跳转到商品详情页
      wx.navigateTo({
        url: `/pages/goods-detail/goods-detail?id=${goods.id}`
      });
    },

    /**
     * 添加到购物车
     */
    onAddToCart(e) {
      e.stopPropagation(); // 阻止事件冒泡
      
      const goods = this.data.goods;
      if (!goods || !goods.id) {
        wx.showToast({
          title: '商品信息错误',
          icon: 'error'
        });
        return;
      }
      
      // 检查库存
      if (goods.stock <= 0) {
        wx.showToast({
          title: '商品已售完',
          icon: 'error'
        });
        return;
      }
      
      // 触发父组件事件
      this.triggerEvent('addcart', {
        goods: goods
      });
      
      // 调用添加购物车方法
      this.addToCart(goods);
    },

    /**
     * 添加商品到购物车
     */
    addToCart(goods) {
      // 检查登录状态
      const token = wx.getStorageSync('token');
      if (!token) {
        // 提示用户登录
        wx.showModal({
          title: '登录提示',
          content: '需要登录后才能添加商品到购物车',
          confirmText: '立即登录',
          success: (res) => {
            if (res.confirm) {
              // 跳转到我的页面进行登录
              wx.switchTab({
                url: '/pages/mine/mine'
              });
            }
          }
        });
        return;
      }
      
      this.requestAddToCart(goods);
    },

    /**
     * 请求添加到购物车
     */
    requestAddToCart(goods) {
      const token = wx.getStorageSync('token');
      
      wx.request({
        url: 'http://localhost:3002/api/cart/add',
        method: 'POST',
        data: {
          goodsId: goods.id,
          quantity: 1
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data && res.data.success) {
            wx.showToast({
              title: '添加成功',
              icon: 'success'
            });
            
            // 更新购物车数量
            this.updateCartCount();
            
            // 触发添加成功事件
            this.triggerEvent('addcartsuccess', {
              goods: goods,
              cartData: res.data.data
            });
          } else {
            wx.showToast({
              title: res.data ? res.data.message : '添加失败',
              icon: 'error'
            });
          }
        },
        fail: (err) => {
          console.error('添加购物车失败:', err);
          wx.showToast({
            title: '添加失败',
            icon: 'error'
          });
        }
      });
    },

    /**
     * 更新购物车数量
     */
    updateCartCount() {
      const token = wx.getStorageSync('token');
      if (!token) return;
      
      wx.request({
        url: 'http://localhost:3002/api/cart/count',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data && res.data.success) {
            const count = res.data.data.count || 0;
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
        },
        fail: (err) => {
          console.error('获取购物车数量失败:', err);
        }
      });
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件实例进入页面节点树时执行
    },
    
    detached() {
      // 组件实例被从页面节点树移除时执行
    }
  },

  /**
   * 组件所在页面的生命周期
   */
  pageLifetimes: {
    show() {
      // 组件所在的页面被展示时执行
    },
    
    hide() {
      // 组件所在的页面被隐藏时执行
    },
    
    resize(size) {
      // 组件所在的页面尺寸变化时执行
    }
  }
});