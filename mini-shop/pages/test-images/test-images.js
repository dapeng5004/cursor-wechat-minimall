Page({
  data: {
    testImages: [
      {
        name: '轮播图默认图片',
        src: '/uploads/banner/test.jpg',
        defaultSrc: '/images/default/banner.png'
      },
      {
        name: '商品默认图片',
        src: '/uploads/test.jpg',
        defaultSrc: '/images/default/goods.png'
      },
      {
        name: '分类默认图片',
        src: '/uploads/category/test.jpg',
        defaultSrc: '/images/default/category.png'
      },
      {
        name: '空路径测试',
        src: '',
        defaultSrc: '/images/default/goods.png'
      },
      {
        name: 'null路径测试',
        src: null,
        defaultSrc: '/images/default/goods.png'
      }
    ]
  },

  onLoad() {
    console.log('测试图片页面加载');
  },

  onImageLoad(e) {
    console.log('图片加载成功:', e.detail);
  },

  onImageError(e) {
    console.log('图片加载失败:', e.detail);
  },

  onImageTap(e) {
    console.log('图片点击:', e.detail);
  }
}); 