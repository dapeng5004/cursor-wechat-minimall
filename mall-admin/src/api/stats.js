import request from '@/utils/request'

// 获取销售统计
export function getSalesStats(params) {
  return request({
    url: '/admin/stats/sales',
    method: 'get',
    params
  })
}

// 获取销售趋势
export function getSalesTrend(params) {
  return request({
    url: '/admin/stats/sales-trend',
    method: 'get',
    params
  })
}

// 获取热销商品
export function getHotGoods(params) {
  return request({
    url: '/admin/stats/hot-goods',
    method: 'get',
    params
  })
}

// 获取订单统计
export function getOrderStats() {
  return request({
    url: '/admin/stats/orders',
    method: 'get'
  })
}

// 获取转化率统计
export function getConversionStats(params) {
  return request({
    url: '/admin/stats/conversion',
    method: 'get',
    params
  })
} 