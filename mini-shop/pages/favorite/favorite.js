// pages/favorite/favorite.js
// 引入请求工具和图片处理工具
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  data: {
    favoriteList: [],
    loading: false,
    globalLoading: false,
    hasError: false,
    isEmpty: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    // 每次显示时刷新数据
    this.refreshData();
  },

  onPullDownRefresh() {
    this.refreshData();
  },

  onReachBottom() {
    this.loadMoreData();
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.setData({
      globalLoading: true,
      hasError: false
    });
    
    this.loadFavoriteData();
  },

  /**
   * 加载收藏数据
   */
  loadFavoriteData() {
    this.setData({ 
      loading: true,
      hasError: false
    });
    
    const params = {
      page: this.data.page,
      limit: this.data.pageSize
    };
    
    request.get('/api/favorite/list', params).then(res => {
      if (res.code === 200) {
        // 处理商品图片
        const favoriteList = (res.data || []).map(item => ({
          ...item,
          goods: image.processGoodsImage(item.goods)
        }));
        
        this.setData({ 
          favoriteList: this.data.page === 1 ? favoriteList : [...this.data.favoriteList, ...favoriteList],
          loading: false,
          globalLoading: false,
          isEmpty: favoriteList.length === 0 && this.data.page === 1,
          hasMore: favoriteList.length >= this.data.pageSize,
          hasError: false
        });
      } else {
        console.error('获取收藏数据失败:', res);
        this.setData({ 
          loading: false,
          globalLoading: false,
          hasError: true
        });
        wx.showToast({
          title: res.message || '获取收藏失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('请求收藏数据失败:', err);
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

  /**
   * 刷新数据
   */
  refreshData() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadFavoriteData();
  },

  /**
   * 加载更多数据
   */
  loadMoreData() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({
      page: this.data.page + 1
    });
    this.loadFavoriteData();
  },

  /**
   * 点击商品
   */
  onGoodsTap(e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods-detail/goods-detail?id=${goodsId}`
    });
  },

  /**
   * 取消收藏
   */
  onCancelFavorite(e) {
    const goodsId = e.currentTarget.dataset.id;
    const goods = this.data.favoriteList.find(item => item.goods.id === goodsId);
    
    wx.showModal({
      title: '确认取消收藏',
      content: `确定要取消收藏"${goods.goods.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.cancelFavorite(goodsId);
        }
      }
    });
  },

  /**
   * 取消收藏请求
   */
  cancelFavorite(goodsId) {
    request.delete(`/api/favorite/${goodsId}`).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '取消收藏成功',
          icon: 'success'
        });
        
        // 从列表中移除
        const favoriteList = this.data.favoriteList.filter(item => item.goods.id !== goodsId);
        this.setData({ 
          favoriteList,
          isEmpty: favoriteList.length === 0
        });
      } else {
        wx.showToast({
          title: res.message || '取消收藏失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('取消收藏失败:', err);
      wx.showToast({
        title: '取消收藏失败',
        icon: 'error'
      });
    });
  },

  /**
   * 添加到购物车
   */
  onAddToCart(e) {
    const goodsId = e.currentTarget.dataset.id;
    const goods = this.data.favoriteList.find(item => item.goods.id === goodsId);
    
    request.post('/api/cart/add', {
      goodsId: goodsId,
      quantity: 1
    }).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
        
        // 更新购物车数量
        this.updateCartCount();
      } else {
        wx.showToast({
          title: res.message || '添加失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('添加到购物车失败:', err);
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      });
    });
  },

  /**
   * 更新购物车数量
   */
  updateCartCount() {
    request.get('/api/cart/count').then(res => {
      if (res.code === 200) {
        // 更新tabBar购物车数量
        if (res.data > 0) {
          wx.setTabBarBadge({
            index: 2, // 购物车tab的索引
            text: res.data.toString()
          });
        } else {
          wx.removeTabBarBadge({
            index: 2
          });
        }
      }
    }).catch(err => {
      console.error('获取购物车数量失败:', err);
    });
  },

  /**
   * 重试加载
   */
  onRetry() {
    this.refreshData();
  },

  /**
   * 去逛逛
   */
  onGoShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '我的收藏',
      path: '/pages/favorite/favorite'
    };
  }
}); 