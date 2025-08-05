<template>
  <div class="goods-list">
    <el-card>
      <div class="goods-header">
        <div class="header-left">
          <span class="title">商品管理</span>
          <el-button type="primary" @click="openEditDialog()">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
        <div class="header-right">
          <div class="search-form">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入商品名称"
              clearable
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="searchForm.category_id" placeholder="请选择分类" clearable class="form-item">
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="form-item">
              <el-option label="上架" :value="1" />
              <el-option label="下架" :value="0" />
            </el-select>
            <div class="button-group">
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
        <el-table-column label="商品图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="getImageUrl(row.image)"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_recommend"
              :active-value="1"
              :inactive-value="0"
              @change="handleRecommendChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button size="small" type="primary" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
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

    <!-- 商品编辑弹窗 -->
    <GoodsEdit
      v-model:visible="editDialogVisible"
      :goods="currentGoods"
      @refresh="getList"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'
import { getGoodsList, deleteGoods, updateGoods, updateGoodsStatus, updateGoodsRecommend, getGoodsDetail } from '@/api/goods'
import { getCategoryList } from '@/api/category'
import { getImageUrl } from '@/utils/image'
import GoodsEdit from '@/views/goods/GoodsEdit.vue'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const categoryOptions = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  category_id: null, // 使用null而不是空字符串
  status: null // 使用null而不是空字符串
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 弹窗相关
const editDialogVisible = ref(false)
const currentGoods = ref(null)

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    console.log('搜索参数:', params)
    console.log('搜索表单:', searchForm)
    
    const response = await getGoodsList(params)
    
    console.log('API响应:', response)
    
    // 响应拦截器已经提取了data字段，所以response就是data
    if (response && response.list) {
      tableData.value = response.list
      pagination.total = response.total || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 获取分类选项
const getCategoryOptions = async () => {
  try {
    const response = await getCategoryList()
    // 响应拦截器已经提取了data字段，所以response就是data
    const categoryData = response.list || response || []
    // 过滤掉无效的分类数据，确保id和name都存在
    categoryOptions.value = categoryData.filter(item => 
      item && 
      item.id !== null && 
      item.id !== undefined && 
      item.name && 
      item.name.trim() !== ''
    )
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    categoryOptions.value = []
  }
}

// 搜索
const handleSearch = () => {
  console.log('执行搜索，当前搜索表单:', searchForm)
  pagination.page = 1
  getList()
}

// 重置
const handleReset = () => {
  console.log('执行重置')
  Object.assign(searchForm, {
    name: '',
    category_id: null, // 使用null而不是空字符串
    status: null // 使用null而不是空字符串
  })
  console.log('重置后的搜索表单:', searchForm)
  pagination.page = 1
  getList()
}

// 打开编辑弹窗
const openEditDialog = async (row) => {
  try {
    console.log('=== 编辑弹窗调试 ===')
    console.log('列表行数据:', row)
    console.log('列表行状态值:', { status: row.status, is_recommend: row.is_recommend })
    
    // 获取完整的商品详情
    const goodsDetail = await getGoodsDetail(row.id)
    console.log('API返回的商品详情:', goodsDetail)
    console.log('API返回的状态值:', { 
      status: goodsDetail?.status, 
      is_recommend: goodsDetail?.is_recommend 
    })
    
    currentGoods.value = goodsDetail || row
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败:', error)
    // 如果获取详情失败，使用列表数据
    currentGoods.value = row
    editDialogVisible.value = true
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteGoods({ id: row.id })
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
    await updateGoodsStatus({
      id: row.id,
      status: row.status
    })
    ElMessage.success('状态更新成功')
    // 刷新列表数据
    getList()
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 推荐切换
const handleRecommendChange = async (row) => {
  try {
    await updateGoodsRecommend({
      id: row.id,
      is_recommend: row.is_recommend
    })
    ElMessage.success('推荐状态更新成功')
    // 刷新列表数据
    getList()
  } catch (error) {
    ElMessage.error('推荐状态更新失败')
    // 恢复原状态
    row.is_recommend = row.is_recommend === 1 ? 0 : 1
  }
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

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return timeStr
  }
}

// 生命周期
onMounted(() => {
  getList()
  getCategoryOptions()
})
</script>

<style scoped lang="scss">
.goods-list {
  .goods-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    flex-wrap: wrap;
    gap: 16px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      white-space: nowrap;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      flex: 1;
      min-width: 0;
    }

    // 搜索表单响应式
    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      width: 100%;
      max-width: 100%;

      .form-item {
        flex: 1;
        min-width: 200px;
        
        @media (max-width: 768px) {
          min-width: 150px;
        }
        
        @media (max-width: 480px) {
          min-width: 100%;
        }
      }

      .search-input {
        flex: 2;
        min-width: 200px;
        
        @media (max-width: 768px) {
          flex: 1;
          min-width: 150px;
        }
        
        @media (max-width: 480px) {
          min-width: 100%;
        }
      }

      .button-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        
        @media (max-width: 480px) {
          width: 100%;
          justify-content: space-between;
        }
      }
    }
  }

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

  // 操作按钮响应式
  .operation-buttons {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    
    @media (max-width: 480px) {
      flex-direction: column;
      gap: 2px;
    }
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
    
    @media (max-width: 768px) {
      text-align: center;
    }
    
    @media (max-width: 480px) {
      .el-pagination {
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }
}
</style> 