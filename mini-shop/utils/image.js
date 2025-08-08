/**
 * 图片URL处理工具
 */

// 引入环境配置
const envConfig = require('./config');

/**
 * 处理图片URL，将相对路径转换为完整URL
 * @param {string} imagePath - 图片路径
 * @param {string} defaultImage - 默认图片路径
 * @returns {string} 完整的图片URL
 */
function getImageUrl(imagePath, defaultImage = '/images/default/goods.png') {
  if (!imagePath) {
    return defaultImage;
  }
  
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 开发环境优先使用本地默认图片，避免HTTP协议限制
  if (envConfig.isDev) {
    // 根据图片类型返回对应的默认图片
    if (imagePath.includes('banner')) {
      return '/images/default/banner.png';
    } else if (imagePath.includes('category')) {
      return '/images/default/category.png';
    } else if (imagePath.includes('goods') || imagePath.includes('test.jpg')) {
      return '/images/default/goods.png';
    } else {
      return defaultImage;
    }
  }
  
  // 生产环境使用HTTPS方式加载图片
  if (imagePath.startsWith('/uploads/')) {
    return `${envConfig.config.imageBaseUrl}/api/base64img?path=${imagePath}`;
  }
  
  // 直接使用配置的baseUrl访问图片
  if (imagePath.startsWith('/')) {
    return `${envConfig.config.imageBaseUrl}${imagePath}`;
  }
  
  // 其他情况返回默认图片
  return defaultImage;
}

/**
 * 批量处理图片URL
 * @param {Array} items - 包含图片路径的对象数组
 * @param {string} imageKey - 图片字段名，默认为'image'
 * @param {string} defaultImage - 默认图片路径
 * @returns {Array} 处理后的数组
 */
function processImageUrls(items, imageKey = 'image', defaultImage = '/images/default/goods.png') {
  if (!Array.isArray(items)) {
    return items;
  }
  
  return items.map(item => ({
    ...item,
    [imageKey]: getImageUrl(item[imageKey], defaultImage)
  }));
}

/**
 * 处理商品数据的图片URL
 * @param {Object} goods - 商品对象
 * @returns {Object} 处理后的商品对象
 */
function processGoodsImage(goods) {
  if (!goods) return goods;
  
  return {
    ...goods,
    image: getImageUrl(goods.image, '/images/default/goods.png'),
    images: goods.images ? goods.images.map(img => getImageUrl(img, '/images/default/goods.png')) : []
  };
}

/**
 * 处理分类数据的图片URL
 * @param {Object} category - 分类对象
 * @returns {Object} 处理后的分类对象
 */
function processCategoryImage(category) {
  if (!category) return category;
  
  return {
    ...category,
    image: getImageUrl(category.image, '/images/default/category.png'),
    goods: category.goods ? category.goods.map(processGoodsImage) : []
  };
}

module.exports = {
  getImageUrl,
  processImageUrls,
  processGoodsImage,
  processCategoryImage
}; 