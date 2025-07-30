export default [
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/stats/Stats.vue'),
    meta: {
      title: '数据统计',
      icon: 'DataAnalysis'
    }
  }
] 