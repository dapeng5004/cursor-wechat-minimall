<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="category?.id ? '编辑分类' : '新增分类'"
    width="600px"
    @close="resetForm"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入分类名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="分类图片" prop="image">
        <Upload
          v-model="form.image"
          accept="image/*"
          :max-size="2"
          :placeholder="'点击上传分类图片'"
          :tips="[
            '建议尺寸：200x200px，支持 JPG、PNG 格式',
            '文件大小不超过 2MB'
          ]"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="form.sort"
          :min="0"
          :max="999"
          placeholder="数字越小排序越靠前"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ submitLoading ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addCategory, updateCategory } from '@/api/category'
import Upload from '@/components/Upload.vue'

const props = defineProps({
  category: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'refresh'])

// 响应式数据
const formRef = ref()
const submitLoading = ref(false)

const form = reactive({
  id: null,
  name: '',
  image: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分类名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传分类图片', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}



// 监听分类数据变化
watch(
  () => props.category,
  (val) => {
    if (val) {
      Object.assign(form, {
        id: val.id,
        name: val.name,
        image: val.image,
        sort: val.sort,
        status: val.status
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (form.id) {
      // 编辑
      await updateCategory(form)
      ElMessage.success('分类更新成功')
    } else {
      // 新增
      await addCategory(form)
      ElMessage.success('分类创建成功')
    }

    emit('update:visible', false)
    emit('refresh')
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    image: '',
    sort: 0,
    status: 1
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style> 