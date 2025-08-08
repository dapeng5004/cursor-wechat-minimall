// utils/storage.js
// 本地存储工具函数

/**
 * 设置存储数据
 * @param {String} key 存储键名
 * @param {*} value 存储值
 * @param {Boolean} sync 是否同步存储，默认true
 */
function setStorage(key, value, sync = true) {
  try {
    if (sync) {
      wx.setStorageSync(key, value);
    } else {
      return new Promise((resolve, reject) => {
        wx.setStorage({
          key,
          data: value,
          success: resolve,
          fail: reject
        });
      });
    }
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
}

/**
 * 获取存储数据
 * @param {String} key 存储键名
 * @param {*} defaultValue 默认值
 * @param {Boolean} sync 是否同步获取，默认true
 */
function getStorage(key, defaultValue = null, sync = true) {
  try {
    if (sync) {
      const value = wx.getStorageSync(key);
      return value !== '' ? value : defaultValue;
    } else {
      return new Promise((resolve, reject) => {
        wx.getStorage({
          key,
          success: (res) => resolve(res.data),
          fail: () => resolve(defaultValue)
        });
      });
    }
  } catch (error) {
    console.error('获取存储数据失败:', error);
    return defaultValue;
  }
}

/**
 * 删除存储数据
 * @param {String} key 存储键名
 * @param {Boolean} sync 是否同步删除，默认true
 */
function removeStorage(key, sync = true) {
  try {
    if (sync) {
      wx.removeStorageSync(key);
    } else {
      return new Promise((resolve, reject) => {
        wx.removeStorage({
          key,
          success: resolve,
          fail: reject
        });
      });
    }
    return true;
  } catch (error) {
    console.error('删除存储数据失败:', error);
    return false;
  }
}

/**
 * 清空所有存储数据
 * @param {Boolean} sync 是否同步清空，默认true
 */
function clearStorage(sync = true) {
  try {
    if (sync) {
      wx.clearStorageSync();
    } else {
      return new Promise((resolve, reject) => {
        wx.clearStorage({
          success: resolve,
          fail: reject
        });
      });
    }
    return true;
  } catch (error) {
    console.error('清空存储数据失败:', error);
    return false;
  }
}

/**
 * 获取存储信息
 * @param {Boolean} sync 是否同步获取，默认true
 */
function getStorageInfo(sync = true) {
  try {
    if (sync) {
      return wx.getStorageInfoSync();
    } else {
      return new Promise((resolve, reject) => {
        wx.getStorageInfo({
          success: resolve,
          fail: reject
        });
      });
    }
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return null;
  }
}

/**
 * 设置用户数据
 * @param {Object} userData 用户数据
 */
function setUserData(userData) {
  return setStorage('userData', userData);
}

/**
 * 获取用户数据
 */
function getUserData() {
  return getStorage('userData', {});
}

/**
 * 删除用户数据
 */
function removeUserData() {
  return removeStorage('userData');
}

/**
 * 设置购物车数据
 * @param {Array} cartData 购物车数据
 */
function setCartData(cartData) {
  return setStorage('cartData', cartData);
}

/**
 * 获取购物车数据
 */
function getCartData() {
  return getStorage('cartData', []);
}

/**
 * 删除购物车数据
 */
function removeCartData() {
  return removeStorage('cartData');
}

/**
 * 设置搜索历史
 * @param {Array} searchHistory 搜索历史
 */
function setSearchHistory(searchHistory) {
  return setStorage('searchHistory', searchHistory);
}

/**
 * 获取搜索历史
 */
function getSearchHistory() {
  return getStorage('searchHistory', []);
}

/**
 * 添加搜索历史
 * @param {String} keyword 搜索关键词
 */
function addSearchHistory(keyword) {
  if (!keyword || keyword.trim() === '') return;
  
  const history = getSearchHistory();
  const index = history.indexOf(keyword);
  
  // 如果已存在，先删除
  if (index > -1) {
    history.splice(index, 1);
  }
  
  // 添加到开头
  history.unshift(keyword);
  
  // 限制历史记录数量
  if (history.length > 10) {
    history.splice(10);
  }
  
  setSearchHistory(history);
}

/**
 * 清空搜索历史
 */
function clearSearchHistory() {
  return removeStorage('searchHistory');
}

/**
 * 设置浏览历史
 * @param {Array} browseHistory 浏览历史
 */
function setBrowseHistory(browseHistory) {
  return setStorage('browseHistory', browseHistory);
}

/**
 * 获取浏览历史
 */
function getBrowseHistory() {
  return getStorage('browseHistory', []);
}

/**
 * 添加浏览历史
 * @param {Object} item 浏览项目
 */
function addBrowseHistory(item) {
  if (!item || !item.id) return;
  
  const history = getBrowseHistory();
  const index = history.findIndex(h => h.id === item.id);
  
  // 如果已存在，先删除
  if (index > -1) {
    history.splice(index, 1);
  }
  
  // 添加到开头
  history.unshift({
    ...item,
    viewTime: Date.now()
  });
  
  // 限制历史记录数量
  if (history.length > 20) {
    history.splice(20);
  }
  
  setBrowseHistory(history);
}

/**
 * 清空浏览历史
 */
function clearBrowseHistory() {
  return removeStorage('browseHistory');
}

/**
 * 设置应用配置
 * @param {Object} config 配置对象
 */
function setAppConfig(config) {
  return setStorage('appConfig', config);
}

/**
 * 获取应用配置
 */
function getAppConfig() {
  return getStorage('appConfig', {});
}

/**
 * 更新应用配置
 * @param {Object} config 要更新的配置
 */
function updateAppConfig(config) {
  const currentConfig = getAppConfig();
  const newConfig = { ...currentConfig, ...config };
  return setAppConfig(newConfig);
}

module.exports = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getStorageInfo,
  setUserData,
  getUserData,
  removeUserData,
  setCartData,
  getCartData,
  removeCartData,
  setSearchHistory,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  setBrowseHistory,
  getBrowseHistory,
  addBrowseHistory,
  clearBrowseHistory,
  setAppConfig,
  getAppConfig,
  updateAppConfig
};