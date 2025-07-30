export default [
  {
    path: '/banner',
    name: 'Banner',
    component: () => import('@/views/banner/BannerList.vue'),
    meta: {
      title: '轮播图管理',
      icon: 'Picture'
    }
  }
] 