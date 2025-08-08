// pages/mine/mine.js
// 引入请求工具
const request = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    loading: false,
    hasError: false,
    menuList: [
      {
        id: 'orders',
        name: '我的订单',
        icon: '📋',
        url: '/pages/order-list/order-list'
      },
      {
        id: 'address',
        name: '收货地址',
        icon: '📍',
        url: '/pages/address-list/address-list'
      },
      {
        id: 'favorite',
        name: '我的收藏',
        icon: '❤️',
        url: '/pages/favorite/favorite'
      },
      {
        id: 'settings',
        name: '设置',
        icon: '⚙️',
        url: '/pages/settings/settings'
      }
    ]
  },

  onLoad() {
    // 监听全局登录/退出事件
    if (wx.eventCenter && wx.eventCenter.on) {
      this._authLoginHandler = () => this.updateUserInfo();
      this._authLogoutHandler = () => this.updateUserInfo();
      wx.eventCenter.on('auth:login', this._authLoginHandler);
      wx.eventCenter.on('auth:logout', this._authLogoutHandler);
    }
  },
  onUnload() {
    // 移除监听
    if (wx.eventCenter && wx.eventCenter.off) {
      if (this._authLoginHandler) wx.eventCenter.off('auth:login', this._authLoginHandler);
      if (this._authLogoutHandler) wx.eventCenter.off('auth:logout', this._authLogoutHandler);
    }
  },

  onShow() {
    this.updateUserInfo();
  },

  updateUserInfo() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.setData({ userInfo: userInfo });
    } else {
      this.setData({ userInfo: null });
    }
  },

  onLogin(e) {
    if (this.data.loading) return; // 防止重复点击
    this.setData({ loading: true });
    const that = this;
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.getUserProfile({
            desc: '用于完善会员资料',
            success: (profileRes) => {
              request.post('/api/user/login', {
                code: res.code,
                userInfo: profileRes.userInfo
              }).then(loginRes => {
                if (loginRes.code === 200) {
                  wx.setStorageSync('token', loginRes.data.token);
                  wx.setStorageSync('userInfo', loginRes.data.userInfo);
                  that.updateUserInfo();
                  if (wx.eventCenter && wx.eventCenter.emit) {
                    wx.eventCenter.emit('auth:login', loginRes.data.userInfo);
                  }
                  wx.showToast({ title: '登录成功', icon: 'success' });
                  // 登录后自动返回来源页
                  if (e && e.detail && e.detail.fromUrl) {
                    wx.redirectTo({ url: e.detail.fromUrl });
                  }
                } else {
                  wx.showToast({ title: loginRes.message || '登录失败', icon: 'error' });
                }
              }).catch(err => {
                if (err && err.message && err.message.indexOf('timeout') !== -1) {
                  wx.showToast({ title: '网络超时，请重试', icon: 'error' });
                } else {
                  wx.showToast({ title: '登录失败', icon: 'error' });
                }
              }).finally(() => {
                that.setData({ loading: false });
              });
            },
            fail: (err) => {
              that.setData({ loading: false });
              if (err && err.errMsg && err.errMsg.indexOf('auth') !== -1) {
                wx.showToast({ title: '用户拒绝授权', icon: 'error' });
              } else {
                wx.showToast({ title: '获取用户信息失败', icon: 'error' });
              }
            }
          });
        } else {
          that.setData({ loading: false });
          wx.showToast({ title: '微信登录失败', icon: 'error' });
        }
      },
      fail: () => {
        that.setData({ loading: false });
        wx.showToast({ title: '微信登录失败', icon: 'error' });
      }
    });
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          request.post('/api/user/logout').then(res => {
            if (res.code === 200) {
              wx.removeStorageSync('token');
              wx.removeStorageSync('userInfo');
              this.updateUserInfo();
              if (wx.eventCenter && wx.eventCenter.emit) {
                wx.eventCenter.emit('auth:logout');
              }
              wx.showToast({ 
                title: '退出成功', 
                icon: 'success' 
              });
            } else {
              wx.showToast({ 
                title: res.message || '退出失败', 
                icon: 'error' 
              });
            }
          }).catch(err => {
            console.error('退出登录失败:', err);
            wx.showToast({ 
              title: '退出失败', 
              icon: 'error' 
            });
          }).finally(() => {
            this.setData({ loading: false });
          });
        }
      }
    });
  },

  onNavigate(e) {
    const url = e.currentTarget.dataset.url;
    const token = wx.getStorageSync('token');
    if (!token) {
      this.onLogin();
      return;
    }
    wx.navigateTo({ url });
  },

  onUserTap() {
    if (!this.data.userInfo) {
      this.onLogin();
    }
  },

  onShareAppMessage() {
    return {
      title: '我的 - 精选好货等你来',
      path: '/pages/mine/mine',
      imageUrl: '/images/default/share.png'
    };
  }
});