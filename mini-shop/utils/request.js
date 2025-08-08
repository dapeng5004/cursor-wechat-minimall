// utils/request.js
// 网络请求封装

const app = getApp();
const envConfig = require('./config');

// 请求基础配置
const config = {
  baseUrl: envConfig.config.baseUrl,
  timeout: 10000,
  header: {
    'Content-Type': 'application/json'
  }
};

// 显示加载提示
function showLoading(title = '加载中...') {
  wx.showLoading({
    title: title,
    mask: true
  });
}

// 隐藏加载提示
function hideLoading() {
  wx.hideLoading();
}

// 显示错误提示
function showError(message) {
  wx.showToast({
    title: message,
    icon: 'error',
    duration: 2000
  });
}

// 防止多次弹窗
let isAuthModalShown = false;

// 处理请求URL
function buildUrl(url) {
  if (url.startsWith('http')) {
    return url;
  }
  return config.baseUrl + url;
}

// 处理请求头
function buildHeader(customHeader = {}) {
  const header = { ...config.header, ...customHeader };
  
  // 添加token
  const token = app.globalData.token || wx.getStorageSync('token');
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  
  return header;
}

// 处理响应数据
function handleResponse(res) {
  const { statusCode, data } = res;
  
  // HTTP状态码检查
  if (statusCode >= 200 && statusCode < 300) {
    return data;
  } else if (statusCode === 401) {
    // token过期，跳转登录
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    app.globalData.token = '';
    app.globalData.userInfo = null;
    app.globalData.isLogin = false;

    // 触发全局事件，通知页面登录失效
    if (typeof wx.eventCenter === 'object' && wx.eventCenter.emit) {
      wx.eventCenter.emit('auth:expired');
    }

    // 防止多次弹窗
    if (!isAuthModalShown) {
      isAuthModalShown = true;
      wx.showModal({
        title: '提示',
        content: '登录已过期，请重新登录',
        showCancel: false,
        success: () => {
          isAuthModalShown = false;
          wx.switchTab({
            url: '/pages/mine/mine'
          });
        },
        fail: () => {
          isAuthModalShown = false;
        }
      });
    }
    return Promise.reject(new Error('登录已过期'));
  } else {
    return Promise.reject(new Error(`请求失败: ${statusCode}`));
  }
}

// 通用请求方法
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading: needLoading = true,
    showError: needShowError = true
  } = options;
  
  let loadingShown = false;
  
  // 显示加载提示
  if (needLoading) {
    showLoading();
    loadingShown = true;
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(url),
      method: method.toUpperCase(),
      data: data,
      header: buildHeader(header),
      timeout: config.timeout,
      success: (res) => {
        try {
          const result = handleResponse(res);
          resolve(result);
        } catch (error) {
          if (needShowError) {
            showError(error.message);
          }
          reject(error);
        }
      },
      fail: (error) => {
        const message = error.errMsg || '网络请求失败';
        if (needShowError) {
          showError(message);
        }
        reject(new Error(message));
      },
      complete: () => {
        if (loadingShown) {
          hideLoading();
        }
      }
    });
  });
}

// 参数序列化函数
function serializeParams(params) {
  const pairs = [];
  for (let key in params) {
    if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  return pairs.join('&');
}

// GET请求
function get(url, data = {}, options = {}) {
  // 将参数拼接到URL
  if (Object.keys(data).length > 0) {
    const params = serializeParams(data);
    url += (url.includes('?') ? '&' : '?') + params;
  }
  
  return request({
    url,
    method: 'GET',
    ...options
  });
}

// POST请求
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

// PUT请求
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

// DELETE请求
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

// 文件上传
function uploadFile(options) {
  const {
    url,
    filePath,
    name = 'file',
    formData = {},
    showLoading: needLoading = true
  } = options;
  
  if (needLoading) {
    showLoading('上传中...');
  }
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: buildUrl(url),
      filePath,
      name,
      formData,
      header: buildHeader(),
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          resolve(data);
        } catch (error) {
          reject(new Error('上传失败'));
        }
      },
      fail: (error) => {
        const message = error.errMsg || '上传失败';
        showError(message);
        reject(new Error(message));
      },
      complete: () => {
        if (needLoading) {
          hideLoading();
        }
      }
    });
  });
}

// 下载文件
function downloadFile(url, showLoading = true) {
  if (showLoading) {
    showLoading('下载中...');
  }
  
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: buildUrl(url),
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error('下载失败'));
        }
      },
      fail: (error) => {
        const message = error.errMsg || '下载失败';
        showError(message);
        reject(new Error(message));
      },
      complete: () => {
        if (showLoading) {
          hideLoading();
        }
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  uploadFile,
  downloadFile,
  config
};