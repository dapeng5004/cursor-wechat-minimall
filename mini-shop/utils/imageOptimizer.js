/**
 * 图片优化工具
 */

// 图片缓存
const imageCache = new Map();

/**
 * 图片压缩配置
 */
const COMPRESS_CONFIG = {
  quality: 0.8,
  maxWidth: 750,
  maxHeight: 750,
  format: 'jpeg'
};

/**
 * 压缩图片
 * @param {string} imagePath - 图片路径
 * @param {Object} options - 压缩选项
 * @returns {Promise<string>} 压缩后的图片URL
 */
function compressImage(imagePath, options = {}) {
  return new Promise((resolve, reject) => {
    const config = { ...COMPRESS_CONFIG, ...options };
    
    // 检查缓存
    const cacheKey = `${imagePath}_${JSON.stringify(config)}`;
    if (imageCache.has(cacheKey)) {
      resolve(imageCache.get(cacheKey));
      return;
    }
    
    wx.compressImage({
      src: imagePath,
      quality: config.quality,
      success: (res) => {
        const compressedPath = res.tempFilePath;
        imageCache.set(cacheKey, compressedPath);
        resolve(compressedPath);
      },
      fail: (err) => {
        console.warn('图片压缩失败:', err);
        resolve(imagePath); // 压缩失败时返回原图
      }
    });
  });
}

/**
 * 获取图片信息
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Object>} 图片信息
 */
function getImageInfo(imagePath) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: imagePath,
      success: (res) => {
        resolve({
          width: res.width,
          height: res.height,
          path: res.path,
          type: res.type
        });
      },
      fail: (err) => {
        console.warn('获取图片信息失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 调整图片尺寸
 * @param {string} imagePath - 图片路径
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @returns {Promise<string>} 调整后的图片路径
 */
function resizeImage(imagePath, maxWidth = 750, maxHeight = 750) {
  return new Promise((resolve, reject) => {
    getImageInfo(imagePath).then((info) => {
      const { width, height } = info;
      
      // 计算缩放比例
      const scaleX = maxWidth / width;
      const scaleY = maxHeight / height;
      const scale = Math.min(scaleX, scaleY, 1); // 不放大图片
      
      if (scale >= 1) {
        // 图片尺寸合适，直接返回
        resolve(imagePath);
        return;
      }
      
      // 计算新尺寸
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);
      
      // 使用canvas调整尺寸
      const canvas = wx.createCanvasContext('imageResize');
      canvas.drawImage(imagePath, 0, 0, newWidth, newHeight);
      canvas.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'imageResize',
          width: newWidth,
          height: newHeight,
          success: (res) => {
            resolve(res.tempFilePath);
          },
          fail: (err) => {
            console.warn('图片尺寸调整失败:', err);
            resolve(imagePath); // 调整失败时返回原图
          }
        });
      });
    }).catch((err) => {
      console.warn('获取图片信息失败:', err);
      resolve(imagePath);
    });
  });
}

/**
 * 预加载图片
 * @param {Array<string>} imageUrls - 图片URL数组
 * @returns {Promise<Array>} 预加载结果
 */
function preloadImages(imageUrls) {
  const promises = imageUrls.map(url => {
    return new Promise((resolve) => {
      wx.getImageInfo({
        src: url,
        success: () => resolve({ url, success: true }),
        fail: () => resolve({ url, success: false })
      });
    });
  });
  
  return Promise.all(promises);
}

/**
 * 清理图片缓存
 */
function clearImageCache() {
  imageCache.clear();
  console.log('图片缓存已清理');
}

/**
 * 获取缓存统计信息
 * @returns {Object} 缓存统计
 */
function getCacheStats() {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys())
  };
}

module.exports = {
  compressImage,
  getImageInfo,
  resizeImage,
  preloadImages,
  clearImageCache,
  getCacheStats
}; 