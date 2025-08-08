Page({
  data: {
    testResults: [],
    isLoading: false
  },

  onLoad() {
    this.testHttpConnection();
  },

  // 测试HTTP连接
  testHttpConnection() {
    this.setData({
      isLoading: true,
      testResults: []
    });

    const tests = [
      {
        name: '健康检查',
        url: '/health'
      },
      {
        name: '轮播图API',
        url: '/api/banner/list?position=home'
      },
      {
        name: '分类API',
        url: '/api/category/home?limit=3'
      },
      {
        name: '商品API',
        url: '/api/goods/recommend?limit=6'
      }
    ];

    const results = [];
    let completed = 0;

    tests.forEach((test, index) => {
      this.testApi(test.name, test.url)
        .then(result => {
          results[index] = { ...test, ...result, success: true };
        })
        .catch(error => {
          results[index] = { ...test, error: error.message, success: false };
        })
        .finally(() => {
          completed++;
          if (completed === tests.length) {
            this.setData({
              testResults: results,
              isLoading: false
            });
          }
        });
    });
  },

  // 测试单个API
  testApi(name, url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      wx.request({
        url: `http://127.0.0.1:3002${url}`,
        method: 'GET',
        timeout: 10000,
        success: (res) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime: responseTime,
            data: res.data
          });
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '请求失败'));
        }
      });
    });
  },

  // 重新测试
  onRetry() {
    this.testHttpConnection();
  },

  // 复制结果
  onCopyResult() {
    const results = this.data.testResults;
    const text = results.map(r => 
      `${r.name}: ${r.success ? '成功' : '失败'} ${r.success ? `(${r.responseTime}ms)` : `(${r.error})`}`
    ).join('\n');
    
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '结果已复制',
          icon: 'success'
        });
      }
    });
  }
}); 