// pages/cart/cart.js
// 引入请求工具和图片处理工具
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  data: {
    cartList: [],
    selectAll: false,
    totalPrice: '0.00',
    selectedCount: 0,
    loading: false,
    hasError: false,
    isEmpty: false
  },

  onShow() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.loadCartData();
    } else {
      this.setData({ 
        cartList: [],
        isEmpty: true
      });
    }
  },

  onPullDownRefresh() {
    this.loadCartData();
  },

  loadCartData() {
    this.setData({ 
      loading: true,
      hasError: false
    });
    
    request.get('/api/cart/list').then(res => {
      if (res.code === 200) {
        // 处理图片URL，将相对路径转换为完整URL
        const cartList = (res.data || []).map(item => ({
          ...item,
          checked: false,
          goods: image.processGoodsImage(item.goods)
        }));
        this.setData({ 
          cartList,
          isEmpty: cartList.length === 0,
          hasError: false
        });
        this.calculateTotal();
      } else {
        console.error('获取购物车数据失败:', res);
        this.setData({ 
          hasError: true,
          isEmpty: false
        });
        wx.showToast({
          title: res.message || '获取购物车失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('请求购物车数据失败:', err);
      this.setData({ 
        hasError: true,
        isEmpty: false
      });
      wx.showToast({
        title: '网络请求失败',
        icon: 'error'
      });
    }).finally(() => {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    });
  },

  onCheckItem(e) {
    const id = e.currentTarget.dataset.id;
    const cartList = this.data.cartList.map(item => {
      if (item.id === id) {
        item.checked = !item.checked;
      }
      return item;
    });
    this.setData({ cartList });
    this.calculateTotal();
  },

  onSelectAll() {
    const selectAll = !this.data.selectAll;
    const cartList = this.data.cartList.map(item => {
      item.checked = selectAll;
      return item;
    });
    this.setData({ cartList, selectAll });
    this.calculateTotal();
  },

  onQuantityChange(e) {
    const { id, action } = e.currentTarget.dataset;
    const cartList = this.data.cartList.map(item => {
      if (item.id === id) {
        if (action === 'plus') {
          item.quantity += 1;
        } else if (action === 'minus' && item.quantity > 1) {
          item.quantity -= 1;
        }
      }
      return item;
    });
    this.setData({ cartList });
    this.updateCartItem(id, cartList.find(item => item.id === id).quantity);
    this.calculateTotal();
  },

  updateCartItem(id, quantity) {
    request.put(`/api/cart/update`, {
      id: id,
      quantity: quantity
    }).then(res => {
      if (res.code !== 200) {
        wx.showToast({
          title: res.message || '更新失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('更新购物车失败:', err);
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    });
  },

  onDeleteItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除商品',
      content: '确定要删除这个商品吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteCartItem(id);
        }
      }
    });
  },

  deleteCartItem(id) {
    request.delete(`/api/cart/delete`, { id: id }).then(res => {
      if (res.code === 200) {
        const cartList = this.data.cartList.filter(item => item.id !== id);
        this.setData({ 
          cartList,
          isEmpty: cartList.length === 0
        });
        this.calculateTotal();
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.message || '删除失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('删除购物车商品失败:', err);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    });
  },

  calculateTotal() {
    let totalPrice = 0;
    let selectedCount = 0;
    let allSelected = true;
    
    this.data.cartList.forEach(item => {
      if (item.checked) {
        totalPrice += parseFloat(item.goods.price) * item.quantity;
        selectedCount += item.quantity;
      } else {
        allSelected = false;
      }
    });
    
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      selectedCount,
      selectAll: allSelected && this.data.cartList.length > 0
    });
  },

  onGoShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  onCheckout() {
    const selectedItems = this.data.cartList.filter(item => item.checked);
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择要结算的商品',
        icon: 'none'
      });
      return;
    }

    // 跳转到订单确认页面
    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm'
    });
  },

  onRetry() {
    this.loadCartData();
  },

  onShareAppMessage() {
    return {
      title: '购物车 - 精选好货等你来',
      path: '/pages/cart/cart',
      imageUrl: '/images/default/share.png'
    };
  }
});