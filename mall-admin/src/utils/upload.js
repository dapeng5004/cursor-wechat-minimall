import { getToken } from '@/utils/auth'

// 上传单个图片
export async function uploadImageFile(file) {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/test-upload-image`, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('图片上传失败')
  }
  
  const result = await response.json()
  return result.data.url
}

// 批量上传图片
export async function uploadImageFiles(files) {
  const uploadPromises = files.map(file => uploadImageFile(file))
  return await Promise.all(uploadPromises)
}

// 处理图片数据，区分文件对象和URL字符串
export function processImageData(imageData) {
  if (!imageData) return null
  
  // 如果是文件对象（新选择的图片）
  if (imageData.file) {
    return imageData.file
  }
  
  // 如果是URL字符串（已上传的图片）
  if (typeof imageData === 'string') {
    return imageData
  }
  
  // 如果是对象但包含URL
  if (imageData.url) {
    return imageData.url
  }
  
  return null
}

// 处理图片数组数据
export function processImageArrayData(imageArray) {
  if (!Array.isArray(imageArray)) return []
  
  return imageArray.map(image => processImageData(image)).filter(Boolean)
} 