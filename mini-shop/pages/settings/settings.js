// pages/settings/settings.js
// 引入请求工具
const request = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    settings: {
      notification: true,
      autoLogin: true,
      darkMode: false
    },
    version: '1.0.0',
    menuList: [
      {
        id: 'profile',
        name: '个人资料',
        icon: '👤',
        url: '/pages/profile/profile'
      },
      {
        id: 'notification',
        name: '消息通知',
        icon: '🔔',
        type: 'switch',
        value: 'notification'
      },
      {
        id: 'autoLogin',
        name: '自动登录',
        icon: '🔐',
        type: 'switch',
        value: 'autoLogin'
      },
      {
        id: 'darkMode',
        name: '深色模式',
        icon: '🌙',
        type: 'switch',
        value: 'darkMode'
      },
      {
        id: 'about',
        name: '关于我们',
        icon: 'ℹ️',
        url: '/pages/about/about'
      },
      {
        id: 'feedback',
        name: '意见反馈',
        icon: '💬',
        url: '/pages/feedback/feedback'
      },
      {
        id: 'help',
        name: '帮助中心',
        icon: '❓',
        url: '/pages/help/help'
      }
    ]
  },

  onLoad() {
    this.loadUserInfo();
    this.loadSettings();
  },

  onShow() {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  /**
   * 加载设置信息
   */
  loadSettings() {
    const settings = wx.getStorageSync('settings');
    if (settings) {
      this.setData({ 
        settings: { ...this.data.settings, ...settings }
      });
    }
  },

  /**
   * 菜单项点击
   */
  onMenuTap(e) {
    const { id, url, type } = e.currentTarget.dataset;
    
    if (type === 'switch') {
      return; // 开关类型不跳转
    }
    
    if (url) {
      wx.navigateTo({ url });
    } else {
      this.handleMenuAction(id);
    }
  },

  /**
   * 开关变化
   */
  onSwitchChange(e) {
    const { value } = e.currentTarget.dataset;
    const checked = e.detail.value;
    
    this.setData({
      [`settings.${value}`]: checked
    });
    
    // 保存设置
    wx.setStorageSync('settings', this.data.settings);
    
    // 处理特殊设置
    this.handleSettingChange(value, checked);
  },

  /**
   * 处理设置变化
   */
  handleSettingChange(setting, value) {
    switch (setting) {
      case 'notification':
        this.handleNotificationSetting(value);
        break;
      case 'autoLogin':
        this.handleAutoLoginSetting(value);
        break;
      case 'darkMode':
        this.handleDarkModeSetting(value);
        break;
    }
  },

  /**
   * 处理通知设置
   */
  handleNotificationSetting(enabled) {
    if (enabled) {
      wx.requestSubscribeMessage({
        tmplIds: ['your-template-id'], // 需要替换为实际的模板ID
        success: (res) => {
          console.log('订阅消息授权成功:', res);
        },
        fail: (err) => {
          console.error('订阅消息授权失败:', err);
        }
      });
    }
  },

  /**
   * 处理自动登录设置
   */
  handleAutoLoginSetting(enabled) {
    if (!enabled) {
      // 清除自动登录相关数据
      wx.removeStorageSync('autoLoginToken');
    }
  },

  /**
   * 处理深色模式设置
   */
  handleDarkModeSetting(enabled) {
    // 这里可以实现深色模式的切换逻辑
    console.log('深色模式:', enabled ? '开启' : '关闭');
  },

  /**
   * 处理菜单动作
   */
  handleMenuAction(id) {
    switch (id) {
      case 'logout':
        this.onLogout();
        break;
      case 'clearCache':
        this.onClearCache();
        break;
    }
  },

  /**
   * 退出登录
   */
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('autoLoginToken');
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 返回我的页面
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  },

  /**
   * 清除缓存
   */
  onClearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存
          wx.clearStorageSync();
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
          
          // 重新加载页面
          setTimeout(() => {
            this.loadUserInfo();
            this.loadSettings();
          }, 1500);
        }
      }
    });
  },

  /**
   * 检查更新
   */
  onCheckUpdate() {
    const updateManager = wx.getUpdateManager();
    
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        wx.showModal({
          title: '发现新版本',
          content: '是否立即更新？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      } else {
        wx.showToast({
          title: '已是最新版本',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '商城小程序',
      path: '/pages/index/index'
    };
  }
}); 