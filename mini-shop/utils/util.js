// utils/util.js
// 通用工具函数

/**
 * 格式化时间
 * @param {Date|Number|String} date 日期
 * @param {String} format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 获取相对时间
 * @param {Date|Number|String} date 日期
 */
function getRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  
  if (diff < 0) return '未来时间';
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < week) return `${Math.floor(diff / day)}天前`;
  if (diff < month) return `${Math.floor(diff / week)}周前`;
  if (diff < year) return `${Math.floor(diff / month)}个月前`;
  return `${Math.floor(diff / year)}年前`;
}

/**
 * 格式化价格
 * @param {Number|String} price 价格
 * @param {Number} decimals 小数位数，默认2
 */
function formatPrice(price, decimals = 2) {
  if (price === null || price === undefined || price === '') return '0.00';
  
  const num = parseFloat(price);
  if (isNaN(num)) return '0.00';
  
  return num.toFixed(decimals);
}

/**
 * 格式化数字，添加千分位分隔符
 * @param {Number|String} num 数字
 */
function formatNumber(num) {
  if (num === null || num === undefined || num === '') return '0';
  
  const number = parseFloat(num);
  if (isNaN(number)) return '0';
  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 生成唯一ID
 * @param {Number} length 长度，默认8
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {Number} wait 等待时间，默认300ms
 */
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {Number} wait 等待时间，默认300ms
 */
function throttle(func, wait = 300) {
  let timeout;
  return function (...args) {
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(this, args);
      }, wait);
    }
  };
}

/**
 * 深拷贝
 * @param {*} obj 要拷贝的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 判断是否为空
 * @param {*} value 值
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 判断是否为有效的手机号
 * @param {String} phone 手机号
 */
function isValidPhone(phone) {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
}

/**
 * 判断是否为有效的邮箱
 * @param {String} email 邮箱
 */
function isValidEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return reg.test(email);
}

/**
 * 隐藏手机号中间四位
 * @param {String} phone 手机号
 */
function hidePhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 获取文件扩展名
 * @param {String} filename 文件名
 */
function getFileExtension(filename) {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot > -1 ? filename.substring(lastDot + 1).toLowerCase() : '';
}

/**
 * 格式化文件大小
 * @param {Number} bytes 字节数
 * @param {Number} decimals 小数位数，默认2
 */
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * 随机打乱数组
 * @param {Array} array 数组
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 获取数组中的随机元素
 * @param {Array} array 数组
 * @param {Number} count 获取数量，默认1
 */
function getRandomItems(array, count = 1) {
  if (!Array.isArray(array) || array.length === 0) return [];
  
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * 计算两点间距离
 * @param {Number} lat1 纬度1
 * @param {Number} lng1 经度1
 * @param {Number} lat2 纬度2
 * @param {Number} lng2 经度2
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = lat1 * Math.PI / 180.0;
  const radLat2 = lat2 * Math.PI / 180.0;
  const a = radLat1 - radLat2;
  const b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  
  let s = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin(a / 2), 2) + 
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
  ));
  
  s = s * 6378.137; // 地球半径
  s = Math.round(s * 10000) / 10000; // 保留4位小数
  
  return s * 1000; // 转换为米
}

/**
 * URL参数转对象
 * @param {String} url URL字符串
 */
function parseUrlParams(url) {
  const params = {};
  const queryString = url.split('?')[1];
  
  if (queryString) {
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }
  
  return params;
}

/**
 * 对象转URL参数
 * @param {Object} params 参数对象
 */
function stringifyUrlParams(params) {
  if (!params || typeof params !== 'object') return '';
  
  const pairs = [];
  for (let key in params) {
    if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }
  
  return pairs.join('&');
}

module.exports = {
  formatTime,
  getRelativeTime,
  formatPrice,
  formatNumber,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  isValidPhone,
  isValidEmail,
  hidePhone,
  getFileExtension,
  formatFileSize,
  shuffleArray,
  getRandomItems,
  calculateDistance,
  parseUrlParams,
  stringifyUrlParams
};