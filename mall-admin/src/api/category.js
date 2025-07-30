import request from '@/utils/request'

// 获取分类列表
export function getCategoryList(params) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/admin/category/add',
    method: 'post',
    data
  })
}

// 编辑分类
export function updateCategory(data) {
  return request({
    url: '/admin/category/update',
    method: 'post',
    data
  })
}

// 删除分类
export function deleteCategory(data) {
  return request({
    url: '/admin/category/delete',
    method: 'post',
    data
  })
}

// 修改分类状态
export function updateCategoryStatus(data) {
  return request({
    url: '/admin/category/status',
    method: 'post',
    data
  })
}

// 修改分类排序
export function updateCategorySort(data) {
  return request({
    url: '/admin/category/sort',
    method: 'post',
    data
  })
} 