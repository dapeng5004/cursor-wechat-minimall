<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="goods?.id ? '编辑商品' : '新增商品'"
    width="900px"
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
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商品名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入商品名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品分类" prop="category_id">
            <el-select
              v-model="form.category_id"
              placeholder="请选择商品分类"
              style="width: 100%"
            >
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="商品价格" prop="price">
            <el-input-number
              v-model="form.price"
              :min="0"
              :precision="2"
              :step="0.01"
              style="width: 100%"
              placeholder="请输入价格"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="原价">
            <el-input-number
              v-model="form.original_price"
              :min="0"
              :precision="2"
              :step="0.01"
              style="width: 100%"
              placeholder="请输入原价"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="库存数量" prop="stock">
            <el-input-number
              v-model="form.stock"
              :min="0"
              :precision="0"
              style="width: 100%"
              placeholder="请输入库存"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="商品主图" prop="image">
        <SimpleUpload
          v-model="form.image"
          accept="image/*"
          :max-size="2"
          :tips="[
            '建议尺寸：800x800px，支持 JPG、PNG 格式',
            '文件大小不超过 2MB'
          ]"
        />
      </el-form-item>

      <el-form-item label="商品详情" prop="detail">
        <RichTextEditor
          v-model="form.detail"
          placeholder="请输入商品详情（包含商品描述）"
          height="300px"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="推荐商品">
            <el-switch
              v-model="form.is_recommend"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">上架</el-radio>
              <el-radio :value="0">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('update:visible', false)">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ submitLoading ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getGoodsDetail, addGoods, updateGoods } from '@/api/goods'
import { getCategoryList } from '@/api/category'
import SimpleUpload from '@/components/SimpleUpload.vue'
import RichTextEditor from '@/components/RichTextEditor.vue' // Added import for RichTextEditor
import { uploadImageFile, processImageData } from '@/utils/upload'
import { cleanImageUrl } from '@/utils/image'

// 组件属性
const props = defineProps({
  goods: {
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
const categoryList = ref([])

// 表单数据
const form = reactive({
  id: null,
  name: '',
  category_id: '',
  price: 0,
  original_price: 0,
  stock: 0,
  image: '', // 恢复商品主图字段
  detail: '', // 合并后的商品详情（包含描述）
  is_recommend: 0,
  status: 0  // 修改为0，避免默认上架
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传商品主图', trigger: 'change' }
  ],
  detail: [
    { required: true, message: '请输入商品详情', trigger: 'blur' }
  ]
}

// 获取分类列表
const getCategoryOptions = async () => {
  try {
    const response = await getCategoryList()
    // 响应拦截器已经提取了data字段，所以response就是data
    const categoryData = response.list || response || []
    // 过滤掉无效的分类数据，确保id和name都存在
    categoryList.value = categoryData.filter(item => 
      item && 
      item.id !== null && 
      item.id !== undefined && 
      item.name && 
      item.name.trim() !== ''
    )
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    categoryList.value = []
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    category_id: '',
    price: 0,
    original_price: 0,
    stock: 0,
    image: '', // 恢复商品主图字段
    detail: '', // 合并后的商品详情
    is_recommend: 0,
    status: 0  // 修改为0，避免默认上架
  })
  
  formRef.value?.clearValidate()
}

// 监听商品数据变化
watch(() => props.goods, (newGoods) => {
  console.log('商品数据变化:', newGoods)
  if (newGoods) {
    // 确保状态值正确转换为数字
    const rawStatus = newGoods.status
    const rawRecommend = newGoods.is_recommend
    
    console.log('原始状态值:', { 
      rawStatus,
      rawRecommend,
      rawStatus_type: typeof rawStatus,
      rawRecommend_type: typeof rawRecommend
    })
    
    // 转换后的状态值
    const convertedStatus = Number(rawStatus)
    const convertedRecommend = Number(rawRecommend)
    
    console.log('转换后的状态值:', {
      convertedStatus,
      convertedRecommend,
      convertedStatus_type: typeof convertedStatus,
      convertedRecommend_type: typeof convertedRecommend
    })
    
    const formData = {
      id: newGoods.id,
      name: newGoods.name,
      category_id: newGoods.category_id,
      price: parseFloat(newGoods.price) || 0,
      original_price: parseFloat(newGoods.original_price) || 0,
      stock: parseInt(newGoods.stock) || 0,
      image: cleanImageUrl(newGoods.image), // 恢复商品主图处理
      detail: newGoods.detail || newGoods.description || '', // 直接使用HTML内容，不转换
      is_recommend: convertedRecommend,
      status: convertedStatus
    }
    console.log('设置表单数据:', formData)
    Object.assign(form, formData)
    
    // 延迟检查表单值
    nextTick(() => {
      console.log('表单设置后的值:', {
        form_is_recommend: form.is_recommend,
        form_status: form.status,
        form_is_recommend_type: typeof form.is_recommend,
        form_status_type: typeof form.status
      })
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 提交表单
const submitForm = async () => {
  try {
    console.log('=== 提交表单前检查 ===')
    console.log('表单当前值:', {
      status: form.status,
      is_recommend: form.is_recommend,
      status_type: typeof form.status,
      is_recommend_type: typeof form.is_recommend
    })
    
    await formRef.value.validate()
    submitLoading.value = true
    
    console.log('=== 表单验证后检查 ===')
    console.log('验证后表单值:', {
      status: form.status,
      is_recommend: form.is_recommend,
      status_type: typeof form.status,
      is_recommend_type: typeof form.is_recommend
    })
    
    // 处理图片上传
    let imageUrl = processImageData(form.image)
    
    // 如果是文件对象，需要上传
    if (imageUrl instanceof File) {
      imageUrl = await uploadImageFile(imageUrl)
    }
    
    const submitData = {
      ...form,
      image: cleanImageUrl(imageUrl),
      detail: form.detail, // 保存HTML内容到商品详情字段
      description: '', // 清空描述字段，只使用详情字段
      category_id: parseInt(form.category_id) || 1 // 确保category_id是数字
    }
    
    console.log('=== 提交表单调试 ===')
    console.log('提交的数据:', submitData)
    console.log('状态字段值:', {
      status: submitData.status,
      is_recommend: submitData.is_recommend,
      status_type: typeof submitData.status,
      is_recommend_type: typeof submitData.is_recommend
    })
    
    if (form.id) {
      await updateGoods(submitData)
      ElMessage.success('更新成功')
    } else {
      await addGoods(submitData)
      ElMessage.success('创建成功')
    }
    
    emit('update:visible', false)
    emit('refresh')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 组件挂载时获取分类列表
onMounted(() => {
  getCategoryOptions()
})

// 测试函数：验证状态值
const testStatusValues = () => {
  console.log('=== 状态值测试 ===')
  console.log('当前表单状态值:', {
    is_recommend: form.is_recommend,
    status: form.status,
    is_recommend_type: typeof form.is_recommend,
    status_type: typeof form.status
  })
  
  if (props.goods) {
    console.log('商品数据状态值:', {
      is_recommend: props.goods.is_recommend,
      status: props.goods.status,
      is_recommend_type: typeof props.goods.is_recommend,
      status_type: typeof props.goods.status
    })
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style> 