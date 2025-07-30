<template>
  <div class="upload-component">
    <!-- 单文件上传 -->
    <div v-if="!multiple" class="single-upload">
      <el-upload
        ref="uploadRef"
        class="upload-uploader"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :http-request="customUpload"
        :accept="accept"
        :disabled="disabled"
      >
        <div v-if="modelValue" class="file-preview">
          <el-image
            v-if="isImage"
            :src="modelValue"
            fit="cover"
            style="width: 100%; height: 100%;"
            :preview-src-list="[modelValue]"
          />
          <div v-else class="file-info">
            <el-icon><Document /></el-icon>
            <span>{{ getFileName(modelValue) }}</span>
          </div>
          <div class="file-overlay">
            <el-icon><Edit /></el-icon>
            <span>重新上传</span>
          </div>
        </div>
        <div v-else class="upload-placeholder">
          <el-icon><Plus /></el-icon>
          <span>{{ placeholder }}</span>
        </div>
      </el-upload>
      
      <!-- 上传进度 -->
      <el-progress
        v-if="uploadProgress > 0 && uploadProgress < 100"
        :percentage="uploadProgress"
        :stroke-width="4"
        style="margin-top: 10px;"
      />
    </div>

    <!-- 多文件上传 -->
    <div v-else class="multiple-upload">
      <el-upload
        ref="uploadRef"
        v-model:file-list="fileList"
        list-type="picture-card"
        :before-upload="beforeUpload"
        :http-request="customUpload"
        :accept="accept"
        :disabled="disabled"
        :on-remove="handleRemove"
        :on-preview="handlePreview"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
      
      <!-- 上传进度 -->
      <el-progress
        v-if="uploadProgress > 0 && uploadProgress < 100"
        :percentage="uploadProgress"
        :stroke-width="4"
        style="margin-top: 10px;"
      />
    </div>

    <!-- 上传提示 -->
    <div class="upload-tips">
      <p v-for="tip in tips" :key="tip">{{ tip }}</p>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览">
      <el-image :src="previewUrl" style="width: 100%;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Document } from '@element-plus/icons-vue'
import { uploadFile, uploadImage, uploadImages } from '@/api/upload'

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
  placeholder: {
    type: String,
    default: '点击上传'
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

const emit = defineEmits(['update:modelValue', 'change', 'remove'])

// 响应式数据
const uploadRef = ref()
const uploadProgress = ref(0)
const fileList = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')

// 计算属性
const isImage = computed(() => {
  return props.accept.includes('image')
})

// 监听文件列表变化
watch(
  () => props.modelValue,
  (val) => {
    if (props.multiple && Array.isArray(val)) {
      fileList.value = val.map((url, index) => ({
        uid: index,
        name: getFileName(url),
        url: url,
        status: 'success'
      }))
    }
  },
  { immediate: true }
)

// 获取文件名
const getFileName = (url) => {
  if (!url) return ''
  return url.split('/').pop().split('?')[0]
}

// 上传前验证
const beforeUpload = (file) => {
  // 文件类型验证
  if (props.accept !== '*') {
    const acceptTypes = props.accept.split(',')
    const fileType = file.type
    const isValidType = acceptTypes.some(type => {
      if (type.includes('*')) {
        return fileType.startsWith(type.replace('*', ''))
      }
      return fileType === type
    })
    
    if (!isValidType) {
      ElMessage.error(`文件类型不支持，请上传 ${props.accept} 格式的文件`)
      return false
    }
  }

  // 文件大小验证
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  // 文件数量验证
  if (props.multiple && fileList.value.length >= props.maxCount) {
    ElMessage.error(`最多只能上传 ${props.maxCount} 个文件`)
    return false
  }

  return true
}

// 自定义上传
const customUpload = async (options) => {
  try {
    uploadProgress.value = 0
    
    let result
    if (props.multiple) {
      result = await uploadImages([options.file], (progress) => {
        uploadProgress.value = progress
      })
    } else if (isImage.value) {
      result = await uploadImage(options.file, (progress) => {
        uploadProgress.value = progress
      })
    } else {
      result = await uploadFile(options.file, (progress) => {
        uploadProgress.value = progress
      })
    }

    uploadProgress.value = 100
    
    if (props.multiple) {
      // 多文件上传
      const newFile = {
        uid: Date.now(),
        name: options.file.name,
        url: result.url || result.data.url,
        status: 'success'
      }
      fileList.value.push(newFile)
      
      const urls = fileList.value.map(file => file.url)
      emit('update:modelValue', urls)
      emit('change', urls)
    } else {
      // 单文件上传
      const url = result.url || result.data.url
      emit('update:modelValue', url)
      emit('change', url)
    }

    ElMessage.success('上传成功')
  } catch (error) {
    uploadProgress.value = 0
    ElMessage.error('上传失败：' + (error.message || '未知错误'))
  }
}

// 移除文件
const handleRemove = (file) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    const urls = fileList.value.map(file => file.url)
    emit('update:modelValue', urls)
    emit('change', urls)
    emit('remove', file)
  }
}

// 预览文件
const handlePreview = (file) => {
  if (isImage.value) {
    previewUrl.value = file.url
    previewVisible.value = true
  } else {
    window.open(file.url, '_blank')
  }
}
</script>

<style scoped lang="scss">
.upload-component {
  .single-upload {
    .upload-uploader {
      .file-preview {
        width: 120px;
        height: 120px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;

        &:hover .file-overlay {
          opacity: 1;
        }

        .file-info {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;

          .el-icon {
            font-size: 24px;
            color: #c0c4cc;
            margin-bottom: 8px;
          }

          span {
            font-size: 12px;
            color: #606266;
            text-align: center;
            word-break: break-all;
            padding: 0 8px;
          }
        }

        .file-overlay {
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
      }

      .upload-placeholder {
        width: 120px;
        height: 120px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #8c939d;

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .el-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        span {
          font-size: 14px;
        }
      }
    }
  }

  .multiple-upload {
    :deep(.el-upload--picture-card) {
      width: 100px;
      height: 100px;
      line-height: 100px;
    }
  }

  .upload-tips {
    margin-top: 10px;
    
    p {
      margin: 5px 0;
      font-size: 12px;
      color: var(--text-color-secondary);
    }
  }
}
</style> 