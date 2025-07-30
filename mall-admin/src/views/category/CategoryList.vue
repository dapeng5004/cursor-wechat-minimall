<template>
  <div class="category-list">
    <el-card>
      <div class="category-header">
        <div class="header-left">
          <span class="title">商品分类管理</span>
          <el-button type="primary" @click="openEditDialog()">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入分类名称"
            style="width: 200px; margin-right: 10px;"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>

      <el-table
        :data="categoryList"
        stripe
        v-loading="loading"
        style="margin-top: 20px;"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="image" label="分类图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.image || '/placeholder.png'"
              style="width: 60px; height: 60px; border-radius: 4px;"
              fit="cover"
              :preview-src-list="[row.image]"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="sort" label="排序" width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="0"
              :max="999"
              size="small"
              @change="(value) => handleSortChange(row, value)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(value) => handleStatusChange(row, value)"
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
            <el-button size="small" type="primary" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
              :disabled="row.goods_count > 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 分类编辑对话框 -->
    <CategoryEdit
      v-model:visible="editDialogVisible"
      :category="currentCategory"
      @refresh="getCategoryList"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Picture } from '@element-plus/icons-vue'
import {
  getCategoryList,
  deleteCategory,
  updateCategoryStatus,
  updateCategorySort
} from '@/api/category'
import CategoryEdit from './CategoryEdit.vue'
import { formatDate } from '@/utils/format'

// 响应式数据
const loading = ref(false)
const categoryList = ref([])
const searchKeyword = ref('')
const editDialogVisible = ref(false)
const currentCategory = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取分类列表
const getCategoryListFn = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    }
    const data = await getCategoryList(params)
    categoryList.value = data.list || data
    pagination.total = data.total || data.length
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getCategoryListFn()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  pagination.page = 1
  getCategoryListFn()
}

// 打开编辑对话框
const openEditDialog = (category = null) => {
  currentCategory.value = category
  editDialogVisible.value = true
}

// 删除分类
const handleDelete = async (row) => {
  if (row.goods_count > 0) {
    ElMessage.warning('该分类下还有商品，无法删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCategory({ id: row.id })
    ElMessage.success('删除成功')
    getCategoryListFn()
  } catch (error) {
    // 用户取消操作
  }
}

// 状态切换
const handleStatusChange = async (row, value) => {
  try {
    await updateCategoryStatus({
      id: row.id,
      status: value
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = value === 1 ? 0 : 1
  }
}

// 排序修改
const handleSortChange = async (row, value) => {
  try {
    await updateCategorySort({
      id: row.id,
      sort: value
    })
    ElMessage.success('排序更新成功')
  } catch (error) {
    ElMessage.error('排序更新失败')
    // 恢复原排序
    row.sort = row.originalSort || 0
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  getCategoryListFn()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  getCategoryListFn()
}

// 组件挂载时获取数据
onMounted(() => {
  getCategoryListFn()
})
</script>

<style scoped lang="scss">
.category-list {
  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .title {
        font-size: 18px;
        font-weight: bold;
        color: var(--text-color-primary);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .image-placeholder {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    border-radius: 4px;
    color: #c0c4cc;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 