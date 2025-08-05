// 图片URL处理工具

// 获取完整的图片URL
export function getImageUrl(path) {
  if (!path) return ''
  
  // 如果已经是完整的URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // 如果是相对路径且以/uploads开头，直接返回（通过Vite代理访问）
  if (path.startsWith('/uploads/')) {
    return path
  }
  
  // 如果是其他相对路径，直接返回（可能是本地文件）
  return path
}

// 获取图片预览URL列表
export function getImagePreviewList(images) {
  if (!images) return []
  
  if (Array.isArray(images)) {
    return images.map(img => getImageUrl(img))
  }
  
  return [getImageUrl(images)]
}

// 处理图片上传响应
export function handleImageUploadResponse(response) {
  if (response.code === 200 && response.data) {
    return getImageUrl(response.data.url || response.data)
  }
  return ''
}

// 清理图片URL，移除可能的域名前缀
export function cleanImageUrl(url) {
  if (!url) return ''
  
  // 如果是完整的URL，提取路径部分
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname
    } catch (error) {
      return url
    }
  }
  
  return url
} 