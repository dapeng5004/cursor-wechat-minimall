<template>
  <div class="banner-list">
    <el-card>
      <div class="banner-header">
        <div class="header-left">
          <span class="title">轮播图管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增轮播图
          </el-button>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入轮播图标题"
            clearable
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px; margin-right: 10px;">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="getImageUrl(row.image)"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="link" label="跳转链接" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="160" :show-overflow-tooltip="false">
          <template #default="{ row }">
            <span class="sort-control-wrapper">
              <el-input-number
                v-model="row.sort"
                :min="0"
                :max="999"
                size="small"
                style="width: 140px;"
                @change="(value) => handleSortChange(row, value)"
              />
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" :show-overflow-tooltip="false">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="banner-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <SimpleUpload
            v-model="form.image"
            accept="image/*"
            :max-size="5"
            :tips="[
              '建议尺寸：1920x600px，支持 JPG、PNG 格式',
              '文件大小不超过 5MB'
            ]"
          />
        </el-form-item>
        
        <el-form-item label="跳转链接" prop="link">
          <div class="link-section">
            <!-- 跳转类型选择 -->
            <div class="link-row">
              <el-select 
                v-model="linkForm.type" 
                placeholder="选择跳转类型" 
                @change="handleLinkTypeChange"
                class="link-select"
              >
                <el-option label="商品列表" value="goods" />
                <el-option label="商品详情" value="detail" />
                <el-option label="分类页面" value="category" />
                <el-option label="外部链接" value="external" />
              </el-select>
            </div>
            
            <!-- 根据类型显示对应的选择框 -->
            <div class="link-row" v-if="linkForm.type === 'goods'">
              <el-select 
                v-model="linkForm.category" 
                placeholder="选择分类（可选）" 
                @change="updateLink"
                class="link-select"
                clearable
              >
                <el-option label="全部商品" value="" />
                <el-option 
                  v-for="item in categoryOptions" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id" 
                />
              </el-select>
            </div>
            
            <div class="link-row" v-if="linkForm.type === 'detail'">
              <el-input 
                v-model="linkForm.goodsId" 
                placeholder="请输入商品ID" 
                @input="updateLink"
                class="link-input"
              />
            </div>
            
            <div class="link-row" v-if="linkForm.type === 'category'">
              <el-select 
                v-model="linkForm.categoryId" 
                placeholder="请选择分类" 
                @change="updateLink"
                class="link-select"
              >
                <el-option 
                  v-for="item in categoryOptions" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id" 
                />
              </el-select>
            </div>
            
            <div class="link-row" v-if="linkForm.type === 'external'">
              <el-input 
                v-model="linkForm.url" 
                placeholder="请输入外部链接" 
                @input="updateLink"
                class="link-input"
              />
            </div>
            
            <!-- 生成的链接预览 -->
            <div v-if="form.link" class="link-preview">
              <div class="link-success">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
                <el-text type="success" size="small">生成的链接</el-text>
              </div>
              <div class="link-info">
                <el-text type="info" size="small">链接地址: {{ form.link }}</el-text>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, CircleCheck } from '@element-plus/icons-vue'
import { getBannerList, addBanner, updateBanner, deleteBanner, updateBannerStatus, updateBannerSort } from '@/api/banner'
import { getCategoryList } from '@/api/category'
import { getToken } from '@/utils/auth'
import { getImageUrl } from '@/utils/image'
import { formatDate } from '@/utils/format'
import { uploadImageFile, processImageData } from '@/utils/upload'
import SimpleUpload from '@/components/SimpleUpload.vue'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()

const tableData = ref([])
const searchForm = reactive({
  title: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

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
const dialogTitle = computed(() => {
  return form.id ? '编辑轮播图' : '新增轮播图'
})

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await getBannerList(params)
    // 确保tableData是数组，并为每个项保存原始排序值
    if (response && Array.isArray(response.list)) {
      tableData.value = response.list.map(item => ({
        ...item,
        originalSort: item.sort // 保存原始排序值
      }))
      pagination.total = response.total || response.list.length
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    ElMessage.error('获取列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    status: ''
  })
  pagination.page = 1
  getList()
}

// 新增
const handleAdd = () => {
  Object.assign(form, {
    id: null,
    title: '',
    image: '', // 确保图片字段是空字符串
    link: '',
    sort: 0,
    status: 1
  })
  // 重置跳转链接表单
  Object.assign(linkForm, {
    type: 'goods',
    category: null,
    goodsId: null,
    categoryId: null,
    url: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  // 确保图片字段是字符串格式，SimpleUpload组件会自动处理
  Object.assign(form, {
    ...row,
    image: row.image || '' // 确保image字段是字符串
  })
  // 解析跳转链接
  parseLink(row.link)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个轮播图吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteBanner({ id: row.id })
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    await updateBannerStatus({
      id: row.id,
      status: row.status
    })
    ElMessage.success('状态更新成功')
    // 移除立即刷新，避免条目跳动，等待页面刷新时再同步数据
    // getList()
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 排序修改
const handleSortChange = async (row, value) => {
  try {
    await updateBannerSort({
      id: row.id,
      sort: value
    })
    ElMessage.success('排序更新成功')
    // 移除立即刷新，避免条目跳动，等待页面刷新时再重新排序
    // getList()
  } catch (error) {
    ElMessage.error('排序更新失败')
    // 恢复原排序
    row.sort = row.originalSort || 0
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    console.log('提交表单，当前表单数据:', form)
    console.log('图片字段值:', form.image)
    
    await formRef.value.validate()
    submitLoading.value = true
    
    // 处理图片字段
    let imageUrl = processImageData(form.image)
    
    // 如果是文件对象，需要上传
    if (form.image && form.image.file) {
      try {
        imageUrl = await uploadImageFile(form.image.file)
      } catch (error) {
        ElMessage.error('图片上传失败：' + error.message)
        return
      }
    }
    
    // 准备提交数据
    const submitData = {
      ...form,
      image: imageUrl
    }
    
    console.log('提交的数据:', submitData)
    
    if (form.id) {
      await updateBanner(submitData)
      ElMessage.success('更新成功')
    } else {
      await addBanner(submitData)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('表单提交失败:', error)
    if (error.message) {
      ElMessage.error('操作失败: ' + error.message)
    } else {
      ElMessage.error('操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  // 重置跳转链接表单
  Object.assign(linkForm, {
    type: 'goods',
    category: null,
    goodsId: null,
    categoryId: null,
    url: ''
  })
}

// 分页事件处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  getList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  getList()
}

// 跳转链接相关
const linkForm = reactive({
  type: 'goods', // goods, detail, category, external
  category: null, // 使用null而不是空字符串，便于区分
  goodsId: null, // 使用null而不是空字符串
  categoryId: null, // 使用null而不是空字符串
  url: ''
})

const categoryOptions = ref([])

const updateLink = () => {
  let link = '';
  if (linkForm.type === 'goods') {
    link = linkForm.category ? `/goods/list?categoryId=${linkForm.category}` : '/goods/list';
  } else if (linkForm.type === 'detail') {
    link = linkForm.goodsId ? `/goods/detail/${linkForm.goodsId}` : '/goods/detail/';
  } else if (linkForm.type === 'category') {
    link = linkForm.categoryId ? `/category/detail/${linkForm.categoryId}` : '/category/detail/';
  } else if (linkForm.type === 'external') {
    link = linkForm.url || '';
  }
  form.link = link;
}

const handleLinkTypeChange = () => {
  updateLink();
}

// 解析跳转链接
const parseLink = (link) => {
  console.log('开始解析链接:', link)
  
  if (!link) {
    console.log('链接为空，重置为默认值')
    Object.assign(linkForm, {
      type: 'goods',
      category: null,
      goodsId: null,
      categoryId: null,
      url: ''
    });
    return;
  }

  if (link.startsWith('http://') || link.startsWith('https://')) {
    console.log('解析为外部链接')
    Object.assign(linkForm, {
      type: 'external',
      category: null,
      goodsId: null,
      categoryId: null,
      url: link
    });
  } else if (link.includes('goods/list?categoryId=')) {
    console.log('解析为商品列表链接')
    const categoryIdMatch = link.match(/goods\/list\?categoryId=(\d+)/);
    if (categoryIdMatch && categoryIdMatch[1]) {
      const categoryId = parseInt(categoryIdMatch[1])
      console.log('匹配到分类ID:', categoryId)
      Object.assign(linkForm, {
        type: 'goods',
        category: categoryId, // 转换为数字类型
        goodsId: null,
        categoryId: null,
        url: ''
      });
    } else {
      console.log('未匹配到分类ID')
      Object.assign(linkForm, {
        type: 'goods',
        category: null,
        goodsId: null,
        categoryId: null,
        url: ''
      });
    }
  } else if (link.includes('goods/detail/')) {
    console.log('解析为商品详情链接')
    const goodsIdMatch = link.match(/goods\/detail\/(\d+)/);
    if (goodsIdMatch && goodsIdMatch[1]) {
      const goodsId = parseInt(goodsIdMatch[1])
      console.log('匹配到商品ID:', goodsId)
      Object.assign(linkForm, {
        type: 'detail',
        category: null,
        goodsId: goodsId, // 转换为数字类型
        categoryId: null,
        url: ''
      });
    } else {
      console.log('未匹配到商品ID')
      Object.assign(linkForm, {
        type: 'detail',
        category: null,
        goodsId: null,
        categoryId: null,
        url: ''
      });
    }
  } else if (link.includes('category/detail/')) {
    console.log('解析为分类详情链接')
    const categoryIdMatch = link.match(/category\/detail\/(\d+)/);
    if (categoryIdMatch && categoryIdMatch[1]) {
      const categoryId = parseInt(categoryIdMatch[1])
      console.log('匹配到分类ID:', categoryId)
      Object.assign(linkForm, {
        type: 'category',
        category: null,
        goodsId: null,
        categoryId: categoryId, // 转换为数字类型
        url: ''
      });
    } else {
      console.log('未匹配到分类ID')
      Object.assign(linkForm, {
        type: 'category',
        category: null,
        goodsId: null,
        categoryId: null,
        url: ''
      });
    }
  } else {
    console.log('未知链接格式，设置为默认商品列表')
    Object.assign(linkForm, {
      type: 'goods', // 默认类型
      category: null,
      goodsId: null,
      categoryId: null,
      url: ''
    });
  }
  
  console.log('解析后的linkForm:', linkForm)
}

// 获取分类列表
const getCategoryOptions = async () => {
  try {
    console.log('开始获取分类列表...')
    const response = await getCategoryList({ pageSize: 1000 })
    console.log('分类列表API响应:', response)
    
    let categoryList = []
    if (response && response.data && Array.isArray(response.data.list)) {
      categoryList = response.data.list
    } else if (response && Array.isArray(response.list)) {
      categoryList = response.list
    } else {
      console.warn('分类列表数据格式异常:', response)
      categoryOptions.value = []
      return
    }
    
    // 确保ID是数字类型
    categoryOptions.value = categoryList.map(item => ({
      ...item,
      id: parseInt(item.id) || item.id
    }))
    
    console.log('分类选项设置成功:', categoryOptions.value)
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
    categoryOptions.value = []
  }
}

// 生命周期
onMounted(() => {
  getList()
  getCategoryOptions()
})
</script>

<style scoped lang="scss">
.banner-list {
  padding: 20px;
}

.banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
}

.banner-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .el-form-item__label {
    font-weight: 500;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

.search-form {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  
  // 响应式布局
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
}

.table-container {
  background: #fff;
  border-radius: 4px;
  
  // 表格响应式
  .el-table {
    @media (max-width: 768px) {
      font-size: 14px;
    }
    
    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
  
  // 表格列响应式
  .el-table .el-table__cell {
    @media (max-width: 768px) {
      padding: 8px 4px;
    }
    
    @media (max-width: 480px) {
      padding: 6px 2px;
    }
  }
}

.pagination {
  padding: 20px;
  text-align: right;
  
  @media (max-width: 768px) {
    text-align: center;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    
    .el-pagination {
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.link-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.link-select {
  min-width: 200px;
  flex: 1;
}

.link-input {
  min-width: 300px;
  flex: 1;
}

/* 链接预览区域 */
.link-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
}

.link-success {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.link-info {
  width: 100%;
  text-align: left;
  word-break: break-all;
}

.link-result {
  width: 100%;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  color: #606266;
  font-size: 14px;
}

// 排序控件包装器样式
.sort-control-wrapper {
  display: inline-block;
  width: 100%;
  overflow: visible !important;
  
  .el-input-number {
    width: 140px !important;
    overflow: visible !important;
  }
}

// 强制隐藏表格单元格的省略号
.el-table {
  .el-table__cell {
    .cell {
      overflow: visible !important;
      text-overflow: unset !important;
      white-space: normal !important;
      
      &::after {
        display: none !important;
        content: none !important;
      }
    }
  }
  
  // 特别针对排序列和状态列
  .el-table__row {
    td:nth-child(4), // 排序列
    td:nth-child(5) { // 状态列
      .cell {
        overflow: visible !important;
        text-overflow: unset !important;
        white-space: normal !important;
        
        &::after {
          display: none !important;
          content: none !important;
        }
      }
    }
  }
  
  // 全局覆盖省略号样式
  .el-table__cell .cell {
    overflow: visible !important;
    text-overflow: unset !important;
    white-space: normal !important;
    
    &::after {
      display: none !important;
      content: none !important;
    }
  }
}
</style> 