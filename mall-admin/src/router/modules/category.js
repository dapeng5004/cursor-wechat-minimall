export default [
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/category/CategoryList.vue'),
    meta: {
      title: '分类管理',
      icon: 'Menu'
    }
  }
] 