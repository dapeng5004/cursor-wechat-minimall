// pages/index/index.js
// 引入请求工具和图片处理工具
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 轮播图数据
    bannerList: [],
    // 推荐商品数据
    recommendList: [],
    // 分类商品数据
    categoryList: [],
    // 加载状态
    loading: false,
    globalLoading: false,
    // 是否还有更多数据
    hasMore: true,
    // 是否为空
    isEmpty: false,
    // 是否显示回到顶部
    showBackTop: false,
    // 页面参数
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('首页加载', options);
    this.initPage();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('首页渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('首页显示');
    // 更新购物车数量
    this.updateCartCount();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('首页隐藏');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('首页卸载');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.refreshData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('上拉加载更多');
    this.loadMoreData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '商城小程序 - 精选好货等你来',
      path: '/pages/index/index',
      imageUrl: '/images/default/share.png'
    };
  },

  /**
   * 页面滚动监听
   */
  onPageScroll(e) {
    const scrollTop = e.scrollTop;
    const showBackTop = scrollTop > 500;
    
    if (showBackTop !== this.data.showBackTop) {
      this.setData({
        showBackTop: showBackTop
      });
    }
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.setData({
      globalLoading: true
    });
    
    // 并行加载数据
    Promise.all([
      this.loadBannerData(),
      this.loadRecommendData(),
      this.loadCategoryData()
    ]).then(() => {
      this.setData({
        globalLoading: false
      });
      
      // 检查是否为空
      this.checkEmpty();
    }).catch(err => {
      console.error('页面初始化失败:', err);
      this.setData({
        globalLoading: false,
        isEmpty: true
      });
    });
  },

  /**
   * 加载轮播图数据
   */
  loadBannerData() {
    return request.get('/api/banner/list', { position: 'home' }).then(res => {
      if (res.code === 200) {
        // 处理图片URL，将相对路径转换为完整URL
        const bannerList = image.processImageUrls(res.data || [], 'image', '/images/default/banner.png');
        this.setData({
          bannerList: bannerList
        });
        return res;
      } else {
        console.error('获取轮播图数据失败:', res);
        return { success: false };
      }
    }).catch(err => {
      console.error('请求轮播图数据失败:', err);
      throw err;
    });
  },

  /**
   * 加载推荐商品数据
   */
  loadRecommendData() {
    return request.get('/api/goods/recommend', { limit: 6 }).then(res => {
      if (res.code === 200) {
        // 处理图片URL，将相对路径转换为完整URL
        const recommendList = image.processImageUrls(res.data || [], 'image', '/images/default/goods.png');
        this.setData({
          recommendList: recommendList
        });
        return res;
      } else {
        console.error('获取推荐商品数据失败:', res);
        return { success: false };
      }
    }).catch(err => {
      console.error('请求推荐商品数据失败:', err);
      throw err;
    });
  },

  /**
   * 加载分类商品数据
   */
  loadCategoryData() {
    return request.get('/api/category/home', { limit: 3 }).then(res => {
      if (res.code === 200) {
        // 处理图片URL，将相对路径转换为完整URL
        const categoryList = (res.data || []).map(category => image.processCategoryImage(category));
        this.setData({
          categoryList: categoryList
        });
        return res;
      } else {
        console.error('获取分类数据失败:', res);
        return { success: false };
      }
    }).catch(err => {
      console.error('请求分类数据失败:', err);
      throw err;
    });
  },

  /**
   * 刷新数据
   */
  refreshData() {
    this.setData({
      page: 1,
      hasMore: true,
      isEmpty: false
    });
    
    this.initPage();
    
    // 停止下拉刷新
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 加载更多数据
   */
  loadMoreData() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }
    
    this.setData({
      loading: true
    });
    
    const nextPage = this.data.page + 1;
    
    // 这里可以加载更多推荐商品
    request.get('/api/goods/recommend', {
      page: nextPage,
      limit: this.data.pageSize
    }).then(res => {
      if (res.success) {
        const newList = image.processImageUrls(res.data || [], 'image', '/images/default/goods.png');
        const hasMore = newList.length >= this.data.pageSize;
        
        this.setData({
          recommendList: [...this.data.recommendList, ...newList],
          page: nextPage,
          hasMore: hasMore,
          loading: false
        });
      } else {
        this.setData({
          loading: false,
          hasMore: false
        });
      }
    }).catch(err => {
      console.error('加载更多失败:', err);
      this.setData({
        loading: false
      });
    });
  },

  /**
   * 检查是否为空
   */
  checkEmpty() {
    const { bannerList, recommendList, categoryList } = this.data;
    const isEmpty = bannerList.length === 0 && 
                   recommendList.length === 0 && 
                   categoryList.length === 0;
    
    this.setData({
      isEmpty: isEmpty
    });
  },

  /**
   * 轮播图点击事件
   */
  onBannerTap(e) {
    const banner = e.currentTarget.dataset.banner;
    console.log('点击轮播图:', banner);
    
    if (banner.linkType === 'goods' && banner.linkValue) {
      // 跳转到商品详情
      wx.navigateTo({
        url: `/pages/goods-detail/goods-detail?id=${banner.linkValue}`
      });
    } else if (banner.linkType === 'category' && banner.linkValue) {
      // 跳转到分类页面
      wx.navigateTo({
        url: `/pages/category-goods/category-goods?id=${banner.linkValue}`
      });
    } else if (banner.linkType === 'url' && banner.linkValue) {
      // 跳转到网页
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(banner.linkValue)}`
      });
    }
  },

  /**
   * 查看更多商品
   */
  onViewMore(e) {
    const type = e.currentTarget.dataset.type;
    console.log('查看更多:', type);
    
    if (type === 'recommend') {
      // 跳转到商品列表页
      wx.navigateTo({
        url: '/pages/goods-list/goods-list?type=recommend'
      });
    }
  },

  /**
   * 查看分类商品
   */
  onViewCategoryGoods(e) {
    const category = e.currentTarget.dataset.category;
    console.log('查看分类商品:', category);
    
    if (category && category.id) {
      wx.navigateTo({
        url: `/pages/category-goods/category-goods?id=${category.id}&name=${category.name}`
      });
    }
  },

  /**
   * 添加购物车成功回调
   */
  onAddCartSuccess(e) {
    const { goods, cartData } = e.detail;
    console.log('添加购物车成功:', goods, cartData);
    
    // 更新购物车数量
    this.updateCartCount();
    
    // 可以添加一些成功提示动画
    this.showAddCartAnimation();
  },

  /**
   * 显示添加购物车动画
   */
  showAddCartAnimation() {
    // 这里可以实现购物车图标的动画效果
    // 比如小球飞入购物车的动画
  },

  /**
   * 更新购物车数量
   */
  updateCartCount() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      return;
    }
    
    request.get('/api/cart/count').then(res => {
      if (res.success) {
        const count = res.data.count || 0;
        if (count > 0) {
          wx.setTabBarBadge({
            index: 2, // 购物车tab索引
            text: count.toString()
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
   * 回到顶部
   */
  onBackToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  /**
   * 刷新重试
   */
  onRefresh() {
    this.refreshData();
  }
});