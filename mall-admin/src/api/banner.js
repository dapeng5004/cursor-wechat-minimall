import request from '@/utils/request'

// 获取轮播图列表
export function getBannerList(params) {
  return request({
    url: '/admin/list',
    method: 'get',
    params
  })
}

// 获取轮播图详情
export function getBannerDetail(id) {
  return request({
    url: `/admin/detail/${id}`,
    method: 'get'
  })
}

// 新增轮播图
export function addBanner(data) {
  return request({
    url: '/admin/add',
    method: 'post',
    data
  })
}

// 更新轮播图
export function updateBanner(data) {
  return request({
    url: '/admin/update',
    method: 'put',
    data
  })
}

// 删除轮播图
export function deleteBanner(data) {
  return request({
    url: '/admin/delete',
    method: 'delete',
    data
  })
}

// 更新轮播图状态
export function updateBannerStatus(data) {
  return request({
    url: '/admin/status',
    method: 'put',
    data
  })
}

// 更新轮播图排序
export function updateBannerSort(data) {
  return request({
    url: '/admin/sort',
    method: 'put',
    data
  })
} 