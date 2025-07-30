import request from '@/utils/request'

// 上传单个文件
export function uploadFile(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/admin/upload/file',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
  })
}

// 上传图片
export function uploadImage(file, onProgress) {
  const formData = new FormData()
  formData.append('image', file)
  
  return request({
    url: '/admin/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
  })
}

// 批量上传图片
export function uploadImages(files, onProgress) {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`images[${index}]`, file)
  })
  
  return request({
    url: '/admin/upload/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
  })
}

// 删除文件
export function deleteFile(fileUrl) {
  return request({
    url: '/admin/upload/delete',
    method: 'post',
    data: { fileUrl }
  })
} 