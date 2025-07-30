<template>
  <div class="banner-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button @click="$router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span>{{ isEdit ? '编辑轮播图' : '新增轮播图' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 600px;"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入轮播图标题" />
        </el-form-item>

        <el-form-item label="图片" prop="image">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过5MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.image" class="image-preview">
            <el-image
              :src="form.image"
              style="width: 200px; height: 150px; margin-top: 10px"
            />
          </div>
        </el-form-item>

        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="form.link" placeholder="请输入跳转链接" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="$router.go(-1)">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getBannerDetail, addBanner, updateBanner } from '@/api/banner'
import { getToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  id: null,
  title: '',
  image: '',
  link: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入轮播图标题', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传轮播图片', trigger: 'change' }
  ]
}

// 计算属性
const isEdit = computed(() => {
  return !!route.params.id
})

const uploadUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/admin/upload/file'
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${getToken()}`
  }
})

// 获取详情
const getDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    const response = await getBannerDetail(route.params.id)
    Object.assign(form, response)
  } catch (error) {
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await updateBanner(form)
      ElMessage.success('更新成功')
    } else {
      await addBanner(form)
      ElMessage.success('创建成功')
    }
    
    router.go(-1)
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 文件上传
const handleUploadSuccess = (response) => {
  form.image = response.data.url
  ElMessage.success('上传成功')
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 生命周期
onMounted(() => {
  getDetail()
})
</script>

<style scoped lang="scss">
.banner-edit {
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .image-preview {
    margin-top: 10px;
  }
}
</style> 