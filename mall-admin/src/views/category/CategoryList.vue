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
        :show-overflow-tooltip="false"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="image" label="分类图片" width="120" :show-overflow-tooltip="false">
          <template #default="{ row }">
            <el-image
              :src="getImageUrl(row.image) || '/placeholder.png'"
              style="width: 60px; height: 60px; border-radius: 4px;"
              fit="cover"
              :preview-src-list="[getImageUrl(row.image)]"
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
        <el-table-column prop="status" label="状态" width="100" :show-overflow-tooltip="false">
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
      @refresh="getCategoryListFn"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
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
import { getImageUrl } from '@/utils/image'

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
    const response = await getCategoryList(params)
    // 确保categoryList是数组，并为每个项保存原始排序值和状态值
    if (response && Array.isArray(response.list)) {
      categoryList.value = response.list.map(item => ({
        ...item,
        originalSort: item.sort, // 保存原始排序值
        originalStatus: item.status // 保存原始状态值
      }))
      pagination.total = response.total || response.list.length
    } else {
      categoryList.value = []
      pagination.total = 0
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    categoryList.value = []
    pagination.total = 0
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

// 监听编辑对话框关闭
watch(editDialogVisible, (newVal) => {
  if (!newVal) {
    // 对话框关闭时刷新数据
    getCategoryListFn()
  }
})

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
    // 移除立即刷新，避免条目跳动，等待页面刷新时再同步数据
    // getCategoryListFn()
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.originalStatus || 0
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
    // 移除立即刷新，避免条目跳动，等待页面刷新时再重新排序
    // getCategoryListFn()
  } catch (error) {
    ElMessage.error('排序更新失败')
    // 恢复原排序
    row.sort = row.originalSort || 0
  }
}

// 分页事件处理
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

      .title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        white-space: nowrap;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      flex: 1;
      min-width: 0;
    }
  }

  // 表格响应式
  .el-table {
    @media (max-width: 768px) {
      font-size: 14px;
      
      .el-input-number {
        width: 120px !important;
      }
    }
    
    @media (max-width: 480px) {
      font-size: 12px;
      
      .el-input-number {
        width: 100px !important;
      }
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