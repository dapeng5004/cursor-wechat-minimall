// pages/order-list/order-list.js
// 引入请求工具和图片处理工具
const request = require('../../utils/request');
const image = require('../../utils/image');

Page({
  data: {
    orderList: [],
    loading: false,
    globalLoading: false,
    hasError: false,
    isEmpty: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    status: 'all', // all, pending, paid, shipped, completed, cancelled
    statusList: [
      { value: 'all', name: '全部' },
      { value: 'pending', name: '待付款' },
      { value: 'paid', name: '待发货' },
      { value: 'shipped', name: '待收货' },
      { value: 'completed', name: '已完成' },
      { value: 'cancelled', name: '已取消' }
    ],
    showStatusModal: false
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

  initPage() {
    this.setData({
      globalLoading: true,
      hasError: false
    });
    
    this.loadOrderData();
  },

  loadOrderData() {
    this.setData({ 
      loading: true,
      hasError: false
    });
    
    const params = {
      page: this.data.page,
      limit: this.data.pageSize,
      status: this.data.status === 'all' ? '' : this.data.status
    };
    
    request.get('/api/order/list', params).then(res => {
      if (res.code === 200) {
        // 处理订单中的商品图片
        const orderList = (res.data || []).map(order => ({
          ...order,
          goods: order.goods ? image.processImageUrls(order.goods, 'image', '/images/default/goods.png') : []
        }));
        
        this.setData({ 
          orderList: this.data.page === 1 ? orderList : [...this.data.orderList, ...orderList],
          loading: false,
          globalLoading: false,
          isEmpty: orderList.length === 0 && this.data.page === 1,
          hasMore: orderList.length >= this.data.pageSize,
          hasError: false
        });
      } else {
        console.error('获取订单数据失败:', res);
        this.setData({ 
          loading: false,
          globalLoading: false,
          hasError: true
        });
        wx.showToast({
          title: res.message || '获取订单失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('请求订单数据失败:', err);
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

  refreshData() {
    this.setData({
      page: 1,
      hasMore: true,
      isEmpty: false
    });
    this.loadOrderData();
  },

  loadMoreData() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }
    
    this.setData({
      page: this.data.page + 1
    });
    
    this.loadOrderData();
  },

  onStatusChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      status: status,
      page: 1,
      hasMore: true
    });
    this.loadOrderData();
  },

  onOrderTap(e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${order.id}`
    });
  },

  onPayOrder(e) {
    const order = e.currentTarget.dataset.order;
    wx.showModal({
      title: '确认支付',
      content: `确定要支付订单 ${order.orderNo} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.payOrder(order.id);
        }
      }
    });
  },

  payOrder(orderId) {
    request.post('/api/order/pay', { orderId: orderId }).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        });
        this.refreshData();
      } else {
        wx.showToast({
          title: res.message || '支付失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('支付失败:', err);
      wx.showToast({
        title: '支付失败',
        icon: 'error'
      });
    });
  },

  onCancelOrder(e) {
    const order = e.currentTarget.dataset.order;
    wx.showModal({
      title: '取消订单',
      content: `确定要取消订单 ${order.orderNo} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.cancelOrder(order.id);
        }
      }
    });
  },

  cancelOrder(orderId) {
    request.post('/api/order/cancel', { orderId: orderId }).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '取消成功',
          icon: 'success'
        });
        this.refreshData();
      } else {
        wx.showToast({
          title: res.message || '取消失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('取消订单失败:', err);
      wx.showToast({
        title: '取消失败',
        icon: 'error'
      });
    });
  },

  onConfirmReceive(e) {
    const order = e.currentTarget.dataset.order;
    wx.showModal({
      title: '确认收货',
      content: `确定要确认收货订单 ${order.orderNo} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.confirmReceive(order.id);
        }
      }
    });
  },

  confirmReceive(orderId) {
    request.post('/api/order/confirm', { orderId: orderId }).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '确认成功',
          icon: 'success'
        });
        this.refreshData();
      } else {
        wx.showToast({
          title: res.message || '确认失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('确认收货失败:', err);
      wx.showToast({
        title: '确认失败',
        icon: 'error'
      });
    });
  },

  getStatusText(status) {
    const statusMap = {
      'pending': '待付款',
      'paid': '待发货',
      'shipped': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || '未知状态';
  },

  getStatusColor(status) {
    const colorMap = {
      'pending': 'orange',
      'paid': 'blue',
      'shipped': 'green',
      'completed': 'gray',
      'cancelled': 'red'
    };
    return colorMap[status] || 'gray';
  },

  onRetry() {
    this.loadOrderData();
  },

  onShareAppMessage() {
    return {
      title: '我的订单 - 精选好货等你来',
      path: '/pages/order-list/order-list',
      imageUrl: '/images/default/share.png'
    };
  }
});