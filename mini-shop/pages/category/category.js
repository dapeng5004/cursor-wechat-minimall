// pages/category/category.js
// 引入请求工具和图片处理工具
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  data: {
    categoryList: [],
    loading: false,
    globalLoading: false,
    isEmpty: false,
    hasError: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadCategoryData();
  },

  onPullDownRefresh() {
    this.loadCategoryData();
  },

  initPage() {
    this.setData({
      globalLoading: true,
      hasError: false
    });
    
    this.loadCategoryData();
  },

  loadCategoryData() {
    this.setData({ 
      loading: true,
      hasError: false
    });
    
    request.get('/api/category/list').then(res => {
      if (res.code === 200) {
        // 处理图片URL，将相对路径转换为完整URL
        const categoryList = image.processImageUrls(res.data || [], 'image', '/images/default/category.png');
        this.setData({ 
          categoryList: categoryList,
          loading: false,
          globalLoading: false,
          isEmpty: categoryList.length === 0,
          hasError: false
        });
      } else {
        console.error('获取分类数据失败:', res);
        this.setData({ 
          loading: false,
          globalLoading: false,
          hasError: true
        });
        wx.showToast({
          title: res.message || '获取分类失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('请求分类数据失败:', err);
      this.setData({ 
        loading: false,
        globalLoading: false,
        hasError: true
      });
      wx.showToast({
        title: '网络请求失败',
        icon: 'error'
      });
    }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    if (!category || !category.id) {
      wx.showToast({
        title: '分类信息错误',
        icon: 'error'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/category-goods/category-goods?id=${category.id}&name=${encodeURIComponent(category.name)}`
    });
  },

  onRetry() {
    this.loadCategoryData();
  },

  onShareAppMessage() {
    return {
      title: '商品分类 - 精选好货等你来',
      path: '/pages/category/category',
      imageUrl: '/images/default/share.png'
    };
  }
});