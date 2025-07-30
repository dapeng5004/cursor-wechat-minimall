export default [
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/order/OrderList.vue'),
    meta: {
      title: '订单管理',
      icon: 'ShoppingCart'
    }
  }
] 