// app.js
App({
  // 全局数据
  globalData: {
    userInfo: null,
    token: '',
    isLogin: false
  },

  // 小程序启动
  onLaunch() {
    console.log('小程序启动');
    // 检查登录状态
    this.checkLoginStatus();
    // 获取系统信息
    this.getSystemInfo();
    // 全局事件中心（简易实现）
    if (!wx.eventCenter) {
      wx.eventCenter = {
        _events: {},
        on(event, handler) {
          if (!this._events[event]) this._events[event] = [];
          this._events[event].push(handler);
        },
        off(event, handler) {
          if (!this._events[event]) return;
          this._events[event] = this._events[event].filter(fn => fn !== handler);
        },
        emit(event, ...args) {
          if (!this._events[event]) return;
          this._events[event].forEach(fn => fn(...args));
        }
      };
    }
  },

  // 小程序显示
  onShow() {
    console.log('小程序显示');
  },

  // 小程序隐藏
  onHide() {
    console.log('小程序隐藏');
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.globalData.token = '';
      this.globalData.userInfo = null;
      this.globalData.isLogin = false;
      return;
    }
    // 自动登录：校验token有效性
    const request = require('./utils/request');
    request.get('/api/user/info', {}, { showLoading: false, showError: false })
      .then(res => {
        if (res && res.code === 200 && res.data) {
          this.globalData.token = token;
          this.globalData.userInfo = res.data;
          this.globalData.isLogin = true;
          wx.setStorageSync('userInfo', res.data);
          if (wx.eventCenter && wx.eventCenter.emit) {
            wx.eventCenter.emit('auth:login', res.data);
          }
        } else {
          this._clearLoginStatus();
        }
      })
      .catch(() => {
        this._clearLoginStatus();
      });
  },
  _clearLoginStatus() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.token = '';
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
    if (wx.eventCenter && wx.eventCenter.emit) {
      wx.eventCenter.emit('auth:logout');
    }
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('系统信息:', res);
      }
    });
  },

  // 全局登录方法
  login(callback) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          this.getUserProfile(res.code, callback);
        } else {
          console.log('登录失败！' + res.errMsg);
          callback && callback(false);
        }
      }
    });
  },

  // 获取用户信息
  getUserProfile(code, callback) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log('获取用户信息成功', res);
        // 调用后端登录接口
        this.requestLogin(code, res.userInfo, callback);
      },
      fail: (err) => {
        console.log('获取用户信息失败', err);
        callback && callback(false);
      }
    });
  },

  // 请求后端登录
  requestLogin(code, userInfo, callback) {
    // 引入request工具
    const request = require('./utils/request');
    
    request.post('/api/user/login', {
      code: code,
      userInfo: userInfo
    }).then(res => {
      if (res.success) {
        // 保存登录信息
        this.globalData.token = res.data.token;
        this.globalData.userInfo = res.data.userInfo;
        this.globalData.isLogin = true;
        
        // 存储到本地
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userInfo', res.data.userInfo);
        
        console.log('登录成功');
        callback && callback(true);
      } else {
        console.log('登录失败:', res.message || '未知错误');
        callback && callback(false);
      }
    }).catch(err => {
      console.log('登录请求失败:', err);
      callback && callback(false);
    });
  },

  // 全局退出登录方法
  logout(callback) {
    // 引入request工具
    const request = require('./utils/request');
    
    request.post('/api/user/logout').then(res => {
      // 清除本地存储
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
      
      // 清除全局数据
      this.globalData.token = '';
      this.globalData.userInfo = null;
      this.globalData.isLogin = false;
      
      console.log('退出登录成功');
      callback && callback(true);
    }).catch(err => {
      console.log('退出登录失败:', err);
      callback && callback(false);
    });
  }
});