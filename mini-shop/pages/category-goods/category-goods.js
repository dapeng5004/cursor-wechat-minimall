// pages/category-goods/category-goods.js
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  data: {
    categoryId: '',
    categoryName: '',
    goodsList: [],
    globalLoading: false,
    hasError: false,
    isEmpty: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    paginationError: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        categoryId: options.id,
        categoryName: decodeURIComponent(options.name || '')
      });
      wx.setNavigationBarTitle({
        title: decodeURIComponent(options.name || '分类商品')
      });
      this.initGoodsList();
    } else {
      wx.showToast({
        title: '分类ID错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 初始化商品列表（支持重置）
  initGoodsList(reset = true) {
    if (this.data.loading) return;
    this.setData({ loading: true, hasError: false, paginationError: false });
    const params = {
      categoryId: this.data.categoryId,
      page: this.data.page,
      limit: this.data.pageSize,
      sort: 'default',
    };
    request.get('/api/goods/list', params).then(res => {
      if (res.code === 200 && res.data && res.data.list) {
        const goodsList = image.processImageUrls(res.data.list, 'image', '/images/default/goods.png');
        let newGoodsList = reset ? goodsList : [...this.data.goodsList, ...goodsList];
        this.setData({
          goodsList: newGoodsList,
          globalLoading: false,
          loading: false,
          isEmpty: newGoodsList.length === 0,
          hasError: false,
          paginationError: false,
          hasMore: goodsList.length === this.data.pageSize,
        });
      } else {
        this.setData({
          goodsList: reset ? [] : this.data.goodsList,
          globalLoading: false,
          loading: false,
          isEmpty: reset,
          hasError: false,
          paginationError: !reset,
          hasMore: false,
        });
      }
    }).catch(() => {
      this.setData({ 
        globalLoading: false, 
        loading: false, 
        hasError: reset,
        paginationError: !reset
      });
      wx.showToast({ title: '获取商品失败', icon: 'error' });
    });
  },

  // 加入购物车成功回调
  onAddCartSuccess() {
    this.updateCartCount();
  },

  // 商品卡片点击跳转详情
  onGoodsItemTap(e) {
    const goods = e.detail.goods;
    if (goods && goods.id) {
      wx.navigateTo({
        url: `/pages/goods-detail/goods-detail?id=${goods.id}`
      });
    }
  },

  // 更新购物车数量
  updateCartCount() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    request.get('/api/cart/count').then(res => {
      if (res.code === 200) {
        const count = res.data.count || 0;
        if (count > 0) {
          wx.setTabBarBadge({ index: 2, text: count.toString() });
        } else {
          wx.removeTabBarBadge({ index: 2 });
        }
      }
    });
  },

  // 重新加载
  onRetry() {
    this.initGoodsList();
  },

  // 分页错误重试
  onRetryPagination() {
    this.initGoodsList(false);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, isEmpty: false, paginationError: false });
    this.initGoodsList(true);
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.loading || !this.data.hasMore || this.data.paginationError) return;
    this.setData({ page: this.data.page + 1 });
    this.initGoodsList(false);
  },

  onShareAppMessage() {
    return {
      title: `${this.data.categoryName} - 精选好货等你来`,
      path: `/pages/category-goods/category-goods?id=${this.data.categoryId}&name=${encodeURIComponent(this.data.categoryName)}`,
      imageUrl: '/images/default/share.png',
    };
  },
});