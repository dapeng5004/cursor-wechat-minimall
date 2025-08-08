/**
 * 环境配置文件
 */

// 获取当前环境
const env = __wxConfig.envVersion || 'develop';

// 环境配置
const config = {
  // 开发环境
  develop: {
    baseUrl: 'http://127.0.0.1:3002',
    imageBaseUrl: 'http://127.0.0.1:3002',
    enableSSL: false
  },
  // 体验版 
  trial: {
    baseUrl: 'https://your-domain.com',
    imageBaseUrl: 'https://your-domain.com',
    enableSSL: true
  },
  // 正式版
  release: {
    baseUrl: 'https://your-domain.com',
    imageBaseUrl: 'https://your-domain.com',
    enableSSL: true
  }
};

// 当前环境配置
const currentConfig = config[env] || config.develop;

module.exports = {
  env,
  config: currentConfig,
  isDev: env === 'develop',
  isTrial: env === 'trial',
  isRelease: env === 'release'
}; 