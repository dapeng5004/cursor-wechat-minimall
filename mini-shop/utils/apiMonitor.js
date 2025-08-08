/**
 * API监控工具
 */

// API缓存
const apiCache = new Map();
const CACHE_EXPIRE_TIME = 5 * 60 * 1000; // 5分钟

// 性能监控数据
const performanceData = {
  requests: 0,
  errors: 0,
  avgResponseTime: 0,
  totalResponseTime: 0
};

/**
 * API请求监控装饰器
 * @param {Function} requestFn - 原始请求函数
 * @returns {Function} 监控后的请求函数
 */
function monitorRequest(requestFn) {
  return function(...args) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    console.log(`[API监控] 开始请求 ${requestId}:`, args[0]);
    
    return requestFn.apply(this, args)
      .then(response => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 更新性能数据
        performanceData.requests++;
        performanceData.totalResponseTime += responseTime;
        performanceData.avgResponseTime = performanceData.totalResponseTime / performanceData.requests;
        
        console.log(`[API监控] 请求成功 ${requestId}: ${responseTime}ms`);
        
        return response;
      })
      .catch(error => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 更新错误统计
        performanceData.errors++;
        
        console.error(`[API监控] 请求失败 ${requestId}: ${responseTime}ms`, error);
        
        throw error;
      });
  };
}

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 缓存管理器
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
  }
  
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} expireTime - 过期时间（毫秒）
   */
  set(key, value, expireTime = CACHE_EXPIRE_TIME) {
    const expireAt = Date.now() + expireTime;
    this.cache.set(key, {
      value,
      expireAt
    });
  }
  
  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any} 缓存值
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expireAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key);
  }
  
  /**
   * 清理过期缓存
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireAt) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * 获取缓存统计
   * @returns {Object} 缓存统计
   */
  getStats() {
    this.clearExpired();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * 错误处理器
 */
class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = 3;
  }
  
  /**
   * 处理API错误
   * @param {Error} error - 错误对象
   * @param {string} apiPath - API路径
   * @returns {boolean} 是否应该重试
   */
  handleError(error, apiPath) {
    const errorKey = `${apiPath}_${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    
    if (count < this.maxRetries) {
      this.errorCounts.set(errorKey, count + 1);
      console.warn(`[错误处理] API错误 (${count + 1}/${this.maxRetries}):`, apiPath, error.message);
      return true; // 允许重试
    } else {
      console.error(`[错误处理] API错误达到最大重试次数:`, apiPath, error.message);
      return false; // 不再重试
    }
  }
  
  /**
   * 重置错误计数
   * @param {string} apiPath - API路径
   */
  resetErrorCount(apiPath) {
    for (const key of this.errorCounts.keys()) {
      if (key.startsWith(apiPath)) {
        this.errorCounts.delete(key);
      }
    }
  }
  
  /**
   * 获取错误统计
   * @returns {Object} 错误统计
   */
  getErrorStats() {
    return {
      totalErrors: performanceData.errors,
      errorCounts: Object.fromEntries(this.errorCounts)
    };
  }
}

// 创建实例
const cacheManager = new CacheManager();
const errorHandler = new ErrorHandler();

/**
 * 带缓存的API请求
 * @param {string} url - 请求URL
 * @param {Object} options - 请求选项
 * @param {boolean} useCache - 是否使用缓存
 * @returns {Promise} 请求结果
 */
function cachedRequest(url, options = {}, useCache = true) {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  if (useCache) {
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.log(`[缓存] 命中缓存:`, url);
      return Promise.resolve(cached);
    }
  }
  
  const request = require('./request');
  return request.request(url, options)
    .then(response => {
      if (useCache && response.code === 200) {
        cacheManager.set(cacheKey, response);
      }
      return response;
    });
}

/**
 * 获取性能统计
 * @returns {Object} 性能统计
 */
function getPerformanceStats() {
  return {
    ...performanceData,
    cacheStats: cacheManager.getStats(),
    errorStats: errorHandler.getErrorStats()
  };
}

/**
 * 清理所有缓存
 */
function clearAllCache() {
  cacheManager.cache.clear();
  console.log('[缓存] 所有缓存已清理');
}

/**
 * 定期清理过期缓存
 */
setInterval(() => {
  cacheManager.clearExpired();
}, 60000); // 每分钟清理一次

module.exports = {
  monitorRequest,
  cachedRequest,
  getPerformanceStats,
  clearAllCache,
  cacheManager,
  errorHandler
}; 