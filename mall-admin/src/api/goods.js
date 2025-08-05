import request from '@/utils/request'

// 获取商品列表
export function getGoodsList(params) {
  return request({
    url: '/admin/goods/list',
    method: 'get',
    params
  })
}

// 获取商品详情
export function getGoodsDetail(id) {
  return request({
    url: `/admin/goods/detail/${id}`,
    method: 'get'
  })
}

// 新增商品
export function addGoods(data) {
  return request({
    url: '/admin/goods/add',
    method: 'post',
    data
  })
}

// 编辑商品
export function updateGoods(data) {
  return request({
    url: '/admin/goods/update',
    method: 'post',
    data
  })
}

// 删除商品
export function deleteGoods(data) {
  return request({
    url: '/admin/goods/delete',
    method: 'post',
    data
  })
}

// 商品上下架
export function updateGoodsStatus(data) {
  return request({
    url: '/admin/goods/status',
    method: 'post',
    data
  })
}

// 商品推荐状态更新
export function updateGoodsRecommend(data) {
  return request({
    url: '/admin/goods/recommend',
    method: 'post',
    data
  })
}

// 批量上下架
export function batchUpdateGoodsStatus(data) {
  return request({
    url: '/admin/goods/batch-status',
    method: 'post',
    data
  })
}

// 上传商品图片
export function uploadGoodsImage(data) {
  return request({
    url: '/admin/goods/upload-image',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 