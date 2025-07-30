import request from '@/utils/request'

// 获取订单列表
export function getOrderList(params) {
  return request({
    url: '/admin/order/list',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/admin/order/detail/${id}`,
    method: 'get'
  })
}

// 订单发货
export function shipOrder(data) {
  return request({
    url: '/admin/order/ship',
    method: 'post',
    data
  })
}

// 修改订单状态
export function updateOrderStatus(data) {
  return request({
    url: '/admin/order/status',
    method: 'post',
    data
  })
}

// 获取订单统计数据
export function getOrderStats() {
  return request({
    url: '/admin/stats/orders',
    method: 'get'
  })
}

// 取消订单
export function cancelOrder(data) {
  return request({
    url: '/admin/order/cancel',
    method: 'post',
    data
  })
} 