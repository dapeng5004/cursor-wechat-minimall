// pages/address-list/address-list.js
// 引入请求工具
const request = require('../../utils/request');

Page({
  data: {
    addressList: [],
    loading: false,
    hasError: false,
    isEmpty: false,
    isSelectMode: false, // 是否为选择模式
    selectedAddressId: null
  },

  onLoad(options) {
    // 检查是否为选择模式
    if (options.select === 'true') {
      this.setData({
        isSelectMode: true,
        selectedAddressId: options.selectedId || null
      });
    }
    this.loadAddressData();
  },

  onShow() {
    this.loadAddressData();
  },

  onPullDownRefresh() {
    this.loadAddressData();
  },

  /**
   * 加载地址数据
   */
  loadAddressData() {
    this.setData({ 
      loading: true,
      hasError: false
    });
    
    request.get('/api/address/list').then(res => {
      if (res.code === 200) {
        this.setData({ 
          addressList: res.data || [],
          isEmpty: (res.data || []).length === 0,
          hasError: false
        });
      } else {
        console.error('获取地址数据失败:', res);
        this.setData({ 
          hasError: true,
          isEmpty: false
        });
        wx.showToast({
          title: res.message || '获取地址失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('请求地址数据失败:', err);
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

  /**
   * 添加新地址
   */
  onAddAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  },

  /**
   * 编辑地址
   */
  onEditAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${addressId}`
    });
  },

  /**
   * 删除地址
   */
  onDeleteAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addressList.find(item => item.id === addressId);
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除地址"${address.name} ${address.phone}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteAddress(addressId);
        }
      }
    });
  },

  /**
   * 删除地址请求
   */
  deleteAddress(addressId) {
    request.delete(`/api/address/${addressId}`).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        this.loadAddressData();
      } else {
        wx.showToast({
          title: res.message || '删除失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('删除地址失败:', err);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    });
  },

  /**
   * 设为默认地址
   */
  onSetDefault(e) {
    const addressId = e.currentTarget.dataset.id;
    this.setDefaultAddress(addressId);
  },

  /**
   * 设置默认地址请求
   */
  setDefaultAddress(addressId) {
    request.put(`/api/address/${addressId}/default`).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '设置成功',
          icon: 'success'
        });
        this.loadAddressData();
      } else {
        wx.showToast({
          title: res.message || '设置失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('设置默认地址失败:', err);
      wx.showToast({
        title: '设置失败',
        icon: 'error'
      });
    });
  },

  /**
   * 选择地址（选择模式）
   */
  onSelectAddress(e) {
    if (!this.data.isSelectMode) return;
    
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addressList.find(item => item.id === addressId);
    
    // 返回上一页并传递选中的地址
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage && prevPage.onAddressSelected) {
      prevPage.onAddressSelected(address);
    }
    
    wx.navigateBack();
  },

  /**
   * 重试加载
   */
  onRetry() {
    this.loadAddressData();
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '收货地址管理',
      path: '/pages/address-list/address-list'
    };
  }
});