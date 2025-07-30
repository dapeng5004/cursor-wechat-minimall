<template>
  <div class="goods-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="商品名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入商品名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="searchForm.category_id" placeholder="请选择分类" clearable style="width: 150px">
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="上架" :value="1" />
              <el-option label="下架" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
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
              :src="row.image"
              :preview-src-list="[row.image]"
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
        <el-table-column prop="created_at" label="创建时间" width="180" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { getGoodsList, deleteGoods, updateGoods } from '@/api/goods'
import { getCategoryList } from '@/api/category'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const categoryOptions = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  category_id: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
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
    const response = await getGoodsList(params)
    tableData.value = response.list
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分类选项
const getCategoryOptions = async () => {
  try {
    const response = await getCategoryList({ pageSize: 1000 })
    categoryOptions.value = response.list
  } catch (error) {
    console.error('获取分类失败:', error)
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
    name: '',
    category_id: '',
    status: ''
  })
  pagination.page = 1
  getList()
}

// 新增
const handleAdd = () => {
  router.push('/goods/edit')
}

// 编辑
const handleEdit = (row) => {
  router.push(`/goods/edit/${row.id}`)
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
    await updateGoods({
      id: row.id,
      status: row.status
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1 // 恢复原状态
  }
}

// 推荐切换
const handleRecommendChange = async (row) => {
  try {
    await updateGoods({
      id: row.id,
      is_recommend: row.is_recommend
    })
    ElMessage.success('推荐状态更新成功')
  } catch (error) {
    ElMessage.error('推荐状态更新失败')
    row.is_recommend = row.is_recommend === 1 ? 0 : 1 // 恢复原状态
  }
}

// 分页
const handleSizeChange = (val) => {
  pagination.pageSize = val
  getList()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getList()
}

// 生命周期
onMounted(() => {
  getList()
  getCategoryOptions()
})
</script>

<style scoped lang="scss">
.goods-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-bar {
    margin-bottom: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style> 