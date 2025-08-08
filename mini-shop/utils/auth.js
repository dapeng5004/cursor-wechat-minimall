// utils/auth.js
// 认证相关工具函数

const app = getApp();
const request = require('./request.js');

/**
 * 检查是否已登录
 */
function isLogin() {
  return app.globalData.isLogin && app.globalData.token;
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  return app.globalData.userInfo;
}

/**
 * 获取token
 */
function getToken() {
  return app.globalData.token;
}

/**
 * 微信登录授权
 * @param {Function} callback 回调函数
 */
function wxLogin(callback) {
  if (isLogin()) {
    callback && callback(true, getUserInfo());
    return;
  }
  
  wx.showModal({
    title: '登录提示',
    content: '需要获取您的微信信息进行登录',
    confirmText: '立即登录',
    cancelText: '暂不登录',
    success: (res) => {
      if (res.confirm) {
        // 用户同意登录
        app.login((success) => {
          if (success) {
            callback && callback(true, getUserInfo());
          } else {
            callback && callback(false);
          }
        });
      } else {
        // 用户取消登录
        callback && callback(false);
      }
    }
  });
}

/**
 * 退出登录
 * @param {Function} callback 回调函数
 */
function logout(callback) {
  wx.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        app.logout((success) => {
          if (success) {
            wx.showToast({
              title: '退出成功',
              icon: 'success'
            });
          }
          callback && callback(success);
        });
      }
    }
  });
}

/**
 * 检查登录状态，未登录则跳转登录
 * @param {Function} callback 登录成功后的回调
 * @param {Boolean} showModal 是否显示登录提示框
 */
function checkLogin(callback, showModal = true) {
  if (isLogin()) {
    callback && callback(true);
    return true;
  }
  
  if (showModal) {
    wxLogin((success) => {
      callback && callback(success);
    });
  } else {
    callback && callback(false);
  }
  
  return false;
}

/**
 * 需要登录的页面跳转
 * @param {String} url 跳转地址
 * @param {String} type 跳转类型：navigateTo, redirectTo, switchTab, reLaunch
 */
function navigateWithLogin(url, type = 'navigateTo') {
  checkLogin((success) => {
    if (success) {
      switch (type) {
        case 'redirectTo':
          wx.redirectTo({ url });
          break;
        case 'switchTab':
          wx.switchTab({ url });
          break;
        case 'reLaunch':
          wx.reLaunch({ url });
          break;
        default:
          wx.navigateTo({ url });
      }
    }
  });
}

/**
 * 更新用户信息
 * @param {Object} userInfo 用户信息
 */
function updateUserInfo(userInfo) {
  app.globalData.userInfo = { ...app.globalData.userInfo, ...userInfo };
  wx.setStorageSync('userInfo', app.globalData.userInfo);
}

/**
 * 获取用户授权
 * @param {String} scope 授权范围
 * @param {Function} callback 回调函数
 */
function authorize(scope, callback) {
  wx.getSetting({
    success: (res) => {
      if (res.authSetting[scope]) {
        // 已授权
        callback && callback(true);
      } else {
        // 未授权，请求授权
        wx.authorize({
          scope: scope,
          success: () => {
            callback && callback(true);
          },
          fail: () => {
            // 授权失败，引导用户到设置页面
            wx.showModal({
              title: '授权提示',
              content: '需要您的授权才能使用此功能，是否前往设置？',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting({
                    success: (settingRes) => {
                      if (settingRes.authSetting[scope]) {
                        callback && callback(true);
                      } else {
                        callback && callback(false);
                      }
                    }
                  });
                } else {
                  callback && callback(false);
                }
              }
            });
          }
        });
      }
    }
  });
}

/**
 * 获取用户位置授权
 * @param {Function} callback 回调函数
 */
function getLocationAuth(callback) {
  authorize('scope.userLocation', callback);
}

/**
 * 获取相机授权
 * @param {Function} callback 回调函数
 */
function getCameraAuth(callback) {
  authorize('scope.camera', callback);
}

/**
 * 获取相册授权
 * @param {Function} callback 回调函数
 */
function getAlbumAuth(callback) {
  authorize('scope.writePhotosAlbum', callback);
}

/**
 * 检查网络状态
 * @param {Function} callback 回调函数
 */
function checkNetworkStatus(callback) {
  wx.getNetworkType({
    success: (res) => {
      const networkType = res.networkType;
      if (networkType === 'none') {
        wx.showToast({
          title: '网络连接失败',
          icon: 'error'
        });
        callback && callback(false, networkType);
      } else {
        callback && callback(true, networkType);
      }
    },
    fail: () => {
      callback && callback(false, 'unknown');
    }
  });
}

module.exports = {
  isLogin,
  getUserInfo,
  getToken,
  wxLogin,
  logout,
  checkLogin,
  navigateWithLogin,
  updateUserInfo,
  authorize,
  getLocationAuth,
  getCameraAuth,
  getAlbumAuth,
  checkNetworkStatus
};