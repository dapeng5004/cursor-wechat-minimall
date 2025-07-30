<template>
  <el-dialog
    v-model="visible"
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
        <Upload
          v-model="form.image"
          accept="image/*"
          :max-size="2"
          :placeholder="'点击上传商品主图'"
          :tips="[
            '建议尺寸：800x800px，支持 JPG、PNG 格式',
            '文件大小不超过 2MB'
          ]"
        />
      </el-form-item>

      <el-form-item label="商品图片">
        <Upload
          v-model="form.images"
          :multiple="true"
          accept="image/*"
          :max-size="2"
          :max-count="10"
          :placeholder="'点击上传图片'"
          :tips="[
            '可上传多张商品图片，建议尺寸：800x800px',
            '文件大小不超过 2MB，最多上传10张'
          ]"
        />
      </el-form-item>

      <el-form-item label="商品描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入商品描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="商品详情" prop="detail">
        <div class="rich-editor">
          <div
            ref="editorRef"
            class="editor-content"
            contenteditable="true"
            @input="handleEditorInput"
            @paste="handlePaste"
          ></div>
          <div class="editor-toolbar">
            <el-button size="small" @click="insertImage">插入图片</el-button>
            <el-button size="small" @click="insertText">插入文本</el-button>
          </div>
        </div>
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
              <el-radio :label="1">上架</el-radio>
              <el-radio :label="0">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
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
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { addGoods, updateGoods } from '@/api/goods'
import { getCategoryList } from '@/api/category'
import Upload from '@/components/Upload.vue'

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
const editorRef = ref()
const submitLoading = ref(false)
const categoryList = ref([])

const form = reactive({
  id: null,
  name: '',
  category_id: '',
  price: null,
  original_price: null,
  stock: 0,
  image: '',
  images: [],
  description: '',
  detail: '',
  is_recommend: 0,
  status: 1
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
  ]
}

// 获取分类列表
const getCategoryListFn = async () => {
  try {
    categoryList.value = await getCategoryList()
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 监听商品数据变化
watch(
  () => props.goods,
  (val) => {
    if (val) {
      Object.assign(form, {
        id: val.id,
        name: val.name,
        category_id: val.category_id,
        price: val.price,
        original_price: val.original_price,
        stock: val.stock,
        image: val.image,
        images: val.images ? JSON.parse(val.images) : [],
        description: val.description,
        detail: val.detail,
        is_recommend: val.is_recommend,
        status: val.status
      })
      
      // 设置富文本内容
      nextTick(() => {
        if (editorRef.value) {
          editorRef.value.innerHTML = form.detail
        }
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 富文本编辑器输入
const handleEditorInput = (e) => {
  form.detail = e.target.innerHTML
}

// 处理粘贴
const handlePaste = (e) => {
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// 插入图片
const insertImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 这里可以调用上传API
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto;" />`
        document.execCommand('insertHTML', false, img)
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 插入文本
const insertText = () => {
  const text = prompt('请输入要插入的文本：')
  if (text) {
    document.execCommand('insertText', false, text)
  }
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 处理图片列表
    form.images = JSON.stringify(form.images)

    if (form.id) {
      // 编辑
      await updateGoods(form)
      ElMessage.success('商品更新成功')
    } else {
      // 新增
      await addGoods(form)
      ElMessage.success('商品创建成功')
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
    category_id: '',
    price: null,
    original_price: null,
    stock: 0,
    image: '',
    images: [],
    description: '',
    detail: '',
    is_recommend: 0,
    status: 1
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
  }
}

// 初始化
getCategoryListFn()
</script>

<style scoped lang="scss">
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .editor-content {
    min-height: 200px;
    padding: 10px;
    outline: none;
    border-bottom: 1px solid #dcdfe6;
    
    &:focus {
      border-color: var(--primary-color);
    }
  }

  .editor-toolbar {
    padding: 10px;
    background: #f5f7fa;
    display: flex;
    gap: 10px;
  }
}

.dialog-footer {
  text-align: right;
}
</style> 