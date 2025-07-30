import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import Layout from '@/layout/Layout.vue'

// 路由模块
import loginRoutes from './modules/login'
import dashboardRoutes from './modules/dashboard'
import bannerRoutes from './modules/banner'
import categoryRoutes from './modules/category'
import goodsRoutes from './modules/goods'
import orderRoutes from './modules/order'
import statsRoutes from './modules/stats'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  ...loginRoutes,
  {
    path: '/',
    component: Layout,
    children: [
      ...dashboardRoutes,
      ...bannerRoutes,
      ...categoryRoutes,
      ...goodsRoutes,
      ...orderRoutes,
      ...statsRoutes
    ]
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      hidden: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 商城后台管理系统` : '商城后台管理系统'
  
  if (to.path === '/login') {
    if (token) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router 