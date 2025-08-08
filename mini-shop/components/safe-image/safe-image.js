// components/safe-image/safe-image.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: String,
      value: ''
    },
    defaultSrc: {
      type: String,
      value: '/images/default/goods.png'
    },
    mode: {
      type: String,
      value: 'aspectFill'
    },
    lazyLoad: {
      type: Boolean,
      value: true
    },
    showMenuByLongpress: {
      type: Boolean,
      value: false
    },
    preload: {
      type: Boolean,
      value: false // 是否预加载
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imageSrc: '',
    isLoading: true,
    hasError: false,
    retryCount: 0,
    maxRetries: 3,
    observer: null,
    hasIntersected: false // 是否已进入视口
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached() {
      if (this.properties.lazyLoad) {
        this.initIntersectionObserver();
      } else {
        this.loadImage();
      }
      // 预加载模式
      if (this.properties.preload) {
        this.preloadImage(this.properties.src);
      }
    },
    detached() {
      if (this.data.observer) {
        this.data.observer.disconnect();
      }
    }
  },

  /**
   * 监听属性变化
   */
  observers: {
    'src': function(newSrc) {
      if (newSrc !== this.data.imageSrc) {
        this.setData({
          imageSrc: '',
          isLoading: true,
          hasError: false,
          retryCount: 0,
          hasIntersected: false
        });
        // 只重置懒加载状态，不重复创建observer
        if (!this.properties.lazyLoad) {
          this.loadImage();
        }
        // 懒加载时，observer已存在，等待进入视口自动加载
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 只在attached时创建observer
    initIntersectionObserver() {
      if (this.data.observer) {
        this.data.observer.disconnect();
      }
      const observer = this.createIntersectionObserver({ thresholds: [0], observeAll: false });
      observer.relativeToViewport({ bottom: 0 });
      observer.observe('.safe-image-container', (res) => {
        if (res.intersectionRatio > 0 && !this.data.hasIntersected) {
          this.setData({ hasIntersected: true });
          this.loadImage();
          observer.disconnect();
        }
      });
      this.setData({ observer });
    },

    // 预加载图片（静态方法，可用于页面）
    preloadImage(url) {
      if (!url) return;
      wx.getImageInfo({ src: url });
    },

    // 批量预加载图片（静态方法）
    statics: {
      preloadImages(urls = []) {
        urls.forEach(url => { wx.getImageInfo({ src: url }); });
      }
    },

    loadImage() {
      const { src, defaultSrc } = this.properties;
      
      if (!src) {
        this.setData({
          imageSrc: defaultSrc,
          isLoading: false,
          hasError: false
        });
        return;
      }

      // 如果已经是完整URL，直接使用
      if (src.startsWith('http://') || src.startsWith('https://')) {
        this.setData({
          imageSrc: src,
          isLoading: false,
          hasError: false
        });
        return;
      }

      // 处理相对路径
      this.processImagePath(src);
    },

    processImagePath(path) {
      const { retryCount, maxRetries } = this.data;
      
      if (retryCount >= maxRetries) {
        let defaultImage = this.properties.defaultSrc;
        if (path.includes('banner')) defaultImage = '/images/default/banner.png';
        else if (path.includes('category')) defaultImage = '/images/default/category.png';
        else if (path.includes('goods') || path.includes('test.jpg')) defaultImage = '/images/default/goods.png';
        this.setData({ imageSrc: defaultImage, isLoading: false, hasError: true });
        return;
      }

      // 使用图片处理工具
      const image = require('../../utils/image');
      const imageUrl = image.getImageUrl(path, this.properties.defaultSrc);
      
      this.setData({ imageSrc: imageUrl, isLoading: false, hasError: false });
    },

    /**
     * 图片加载成功
     */
    onImageLoad() {
      this.setData({ isLoading: false, hasError: false });
      this.triggerEvent('load');
    },

    /**
     * 图片加载失败
     */
    onImageError() {
      const { retryCount, maxRetries } = this.data;
      
      if (retryCount < maxRetries) {
        this.setData({ retryCount: retryCount + 1, isLoading: true });
        setTimeout(() => { this.processImagePath(this.properties.src); }, 1000);
      } else {
        this.setData({ imageSrc: this.properties.defaultSrc, isLoading: false, hasError: true });
        this.triggerEvent('error', { src: this.properties.src, retryCount: retryCount });
      }
    },

    /**
     * 图片点击事件
     */
    onImageTap() {
      this.triggerEvent('tap');
    }
  }
}); 