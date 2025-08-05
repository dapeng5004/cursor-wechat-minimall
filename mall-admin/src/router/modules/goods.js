import { Plus, Goods } from '@element-plus/icons-vue'

export default [
  {
    path: '/goods',
    name: 'Goods',
    component: () => import('@/views/goods/GoodsList.vue'),
    meta: {
      title: '商品管理',
      icon: Goods
    }
  }
] 