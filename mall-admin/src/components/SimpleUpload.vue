<template>
  <div class="simple-upload">
    <div class="upload-area" @click="triggerUpload" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileChange"
        style="display: none;"
      />
      
      <!-- 已选择图片预览 -->
      <div v-if="previewImages.length > 0" class="image-preview">
        <!-- 单图片预览 -->
        <div v-if="!multiple && previewImages.length === 1" class="single-preview">
          <img :src="previewImages[0].url" alt="预览图片" />
          <div class="image-overlay" @click.stop="triggerUpload">
            <el-icon><Edit /></el-icon>
            <span>重新选择</span>
          </div>
        </div>
        
        <!-- 多图片预览 -->
        <div v-else class="multiple-preview">
          <div v-for="(image, index) in previewImages" :key="index" class="image-item">
            <img :src="image.url" alt="预览图片" />
            <div class="image-overlay" @click.stop="removeImage(index)">
              <el-icon><Delete /></el-icon>
            </div>
          </div>
          <div v-if="previewImages.length < maxCount" class="upload-placeholder" @click="triggerUpload">
            <el-icon><Plus /></el-icon>
          </div>
        </div>
      </div>
      
      <!-- 上传占位符 -->
      <div v-else class="upload-placeholder">
        <el-icon class="cursor-icon"><Pointer /></el-icon>
        <el-icon class="plus-icon"><Plus /></el-icon>
      </div>
    </div>
    
    <!-- 上传提示 -->
    <div v-if="tips && tips.length > 0" class="upload-tips">
      <p v-for="tip in tips" :key="tip">{{ tip }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, Pointer } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 2 // MB
  },
  maxCount: {
    type: Number,
    default: 10
  },
  tips: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 响应式数据
const fileInput = ref()
const previewImages = ref([])

// 获取图片URL
const getImageUrl = (url) => {
  if (!url) return ''
  
  // 确保url是字符串类型
  if (typeof url !== 'string') {
    console.warn('getImageUrl: url不是字符串类型:', url)
    return ''
  }
  
  // 如果是完整的HTTP/HTTPS URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 如果是相对路径且以/uploads开头，直接返回（通过Vite代理访问）
  if (url.startsWith('/uploads/')) {
    return url
  }
  
  // 如果是其他相对路径，直接返回（可能是本地文件）
  return url
}

// 监听modelValue变化，初始化预览图片
watch(
  () => props.modelValue,
  (val) => {
    console.log('SimpleUpload modelValue变化:', val, '类型:', typeof val)
    
    if (val) {
      if (props.multiple && Array.isArray(val)) {
        previewImages.value = val.map((item, index) => {
          // 处理数组中的每个项目
          let url = ''
          if (typeof item === 'string') {
            url = getImageUrl(item)
          } else if (item && typeof item === 'object' && item.url) {
            url = getImageUrl(item.url)
          }
          
          return {
            id: index,
            url: url,
            file: null
          }
        })
      } else if (!props.multiple) {
        let url = ''
        if (typeof val === 'string') {
          url = getImageUrl(val)
        } else if (val && typeof val === 'object' && val.url) {
          url = getImageUrl(val.url)
        }
        
        previewImages.value = [{
          id: 0,
          url: url,
          file: null
        }]
      }
    } else {
      previewImages.value = []
    }
    
    console.log('预览图片设置完成:', previewImages.value)
  },
  { immediate: true }
)

// 触发文件选择
const triggerUpload = () => {
  if (props.disabled) return
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  
  // 验证文件
  for (const file of files) {
    if (!validateFile(file)) {
      return
    }
  }
  
  // 处理文件预览
  await handleFiles(files)
  
  // 清空input
  event.target.value = ''
}

// 处理拖拽
const handleDrop = async (event) => {
  event.preventDefault()
  if (props.disabled) return
  
  const files = Array.from(event.dataTransfer.files)
  if (files.length === 0) return
  
  // 验证文件
  for (const file of files) {
    if (!validateFile(file)) {
      return
    }
  }
  
  // 处理文件预览
  await handleFiles(files)
}

// 验证文件
const validateFile = (file) => {
  // 文件类型验证
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  
  // 文件大小验证
  if (file.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }
  
  return true
}

// 处理文件预览
const handleFiles = async (files) => {
  try {
    const newImages = []
    
    for (const file of files) {
      // 创建预览URL
      const url = URL.createObjectURL(file)
      newImages.push({
        id: Date.now() + Math.random(),
        url: url,
        file: file
      })
    }
    
    if (props.multiple) {
      // 多文件模式
      const currentImages = [...previewImages.value]
      const allImages = [...currentImages, ...newImages].slice(0, props.maxCount)
      previewImages.value = allImages
      
      // 更新modelValue为文件对象数组，供父组件处理
      emit('update:modelValue', allImages)
      emit('change', allImages)
    } else {
      // 单文件模式
      previewImages.value = [newImages[0]]
      emit('update:modelValue', newImages[0])
      emit('change', newImages[0])
    }
    
    ElMessage.success('图片选择成功')
  } catch (error) {
    ElMessage.error('图片处理失败：' + (error.message || '未知错误'))
  }
}

// 移除图片
const removeImage = (index) => {
  if (props.multiple) {
    const newImages = [...previewImages.value]
    newImages.splice(index, 1)
    previewImages.value = newImages
    emit('update:modelValue', newImages)
    emit('change', newImages)
  } else {
    previewImages.value = []
    emit('update:modelValue', null)
    emit('change', null)
  }
}
</script>

<style scoped lang="scss">
.simple-upload {
  .upload-area {
    width: 200px;
    height: 150px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    
    &:hover {
      border-color: var(--el-color-primary);
      background-color: #f5f7fa;
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .image-preview {
    width: 100%;
    height: 100%;
    
    .single-preview {
      width: 100%;
      height: 100%;
      position: relative;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        opacity: 0;
        transition: opacity 0.3s;
        
        .el-icon {
          font-size: 20px;
          margin-bottom: 5px;
        }
        
        span {
          font-size: 12px;
        }
      }
      
      &:hover .image-overlay {
        opacity: 1;
      }
    }
    
    .multiple-preview {
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      padding: 5px;
      
      .image-item {
        width: calc(50% - 2.5px);
        height: calc(50% - 2.5px);
        position: relative;
        border-radius: 4px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;
          
          .el-icon {
            font-size: 16px;
          }
        }
        
        &:hover .image-overlay {
          opacity: 1;
        }
      }
      
      .upload-placeholder {
        width: calc(50% - 2.5px);
        height: calc(50% - 2.5px);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #8c939d;
        border: 1px dashed #d9d9d9;
        border-radius: 4px;
        
        .el-icon {
          font-size: 20px;
        }
      }
    }
  }
  
  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8c939d;
    position: relative;
    
    .cursor-icon {
      font-size: 24px;
      margin-bottom: 8px;
      color: #c0c4cc;
    }
    
    .plus-icon {
      font-size: 20px;
      color: #c0c4cc;
    }
  }
  
  .upload-tips {
    margin-top: 10px;
    
    p {
      margin: 5px 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style> 