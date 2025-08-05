<template>
  <div class="order-list">
    <el-card>
      <div class="order-header">
        <div class="header-left">
          <span class="title">订单管理</span>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchForm.order_no"
            placeholder="请输入订单号"
            style="width: 200px; margin-right: 10px;"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="searchForm.status"
            placeholder="订单状态"
            style="width: 150px; margin-right: 10px;"
            clearable
          >
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
          <el-date-picker
            v-model="searchForm.date_range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px; margin-right: 10px;"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>

      <el-table
        :data="orderList"
        stripe
        v-loading="loading"
        style="margin-top: 20px;"
      >
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="user_nickname" label="用户" width="120" />
        <el-table-column prop="total_amount" label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ formatPrice(row.total_amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="支付方式" width="100">
          <template #default="{ row }">
            {{ getPaymentMethodText(row.payment_method) }}
          </template>
        </el-table-column>
        <el-table-column prop="address_info" label="收货信息" min-width="200">
          <template #default="{ row }">
            <div class="address-info">
              <div>{{ row.address_name }} {{ row.address_phone }}</div>
              <div class="address-detail">{{ row.address_detail }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="success"
              @click="shipOrderFn(row)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="warning"
              @click="cancelOrder(row)"
            >
              取消订单
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

    <!-- 订单详情对话框 -->
    <OrderDetail
      v-model:visible="detailDialogVisible"
      :order-id="currentOrderId"
      @refresh="getOrderListFn"
    />

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="100px">
        <el-form-item label="物流公司" prop="logistics_company">
          <el-select v-model="shipForm.logistics_company" placeholder="请选择物流公司" style="width: 100%">
            <el-option label="顺丰速运" value="SF" />
            <el-option label="圆通速递" value="YTO" />
            <el-option label="中通快递" value="ZTO" />
            <el-option label="申通快递" value="STO" />
            <el-option label="韵达速递" value="YD" />
            <el-option label="百世快递" value="HTKY" />
            <el-option label="德邦快递" value="DBL" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="logistics_no">
          <el-input v-model="shipForm.logistics_no" placeholder="请输入物流单号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="shipForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getOrderList, shipOrder, updateOrderStatus } from '@/api/order'
import OrderDetail from './OrderDetail.vue'
import { formatDate, formatPrice } from '@/utils/format'

// 响应式数据
const loading = ref(false)
const orderList = ref([])
const detailDialogVisible = ref(false)
const shipDialogVisible = ref(false)
const currentOrderId = ref(null)
const shipFormRef = ref()

const searchForm = reactive({
  order_no: '',
  status: '',
  date_range: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const shipForm = reactive({
  order_id: null,
  logistics_company: '',
  logistics_no: '',
  remark: ''
})

const shipRules = {
  logistics_company: [
    { required: true, message: '请选择物流公司', trigger: 'change' }
  ],
  logistics_no: [
    { required: true, message: '请输入物流单号', trigger: 'blur' }
  ]
}

// 获取订单列表
const getOrderListFn = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      order_no: searchForm.order_no,
      status: searchForm.status,
      start_date: searchForm.date_range[0],
      end_date: searchForm.date_range[1]
    }
    const response = await getOrderList(params)
    // 确保orderList是数组
    if (response && Array.isArray(response.list)) {
      orderList.value = response.list
      pagination.total = response.total || response.list.length
    } else {
      orderList.value = []
      pagination.total = 0
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    orderList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getOrderListFn()
}

// 重置搜索
const resetSearch = () => {
  searchForm.order_no = ''
  searchForm.status = ''
  searchForm.date_range = []
  pagination.page = 1
  getOrderListFn()
}

// 查看详情
const viewDetail = (row) => {
  currentOrderId.value = row.id
  detailDialogVisible.value = true
}

// 发货
const shipOrderFn = (row) => {
  shipForm.order_id = row.id
  shipForm.logistics_company = ''
  shipForm.logistics_no = ''
  shipForm.remark = ''
  shipDialogVisible.value = true
}

// 确认发货
const confirmShip = async () => {
  try {
    await shipFormRef.value.validate()
    await shipOrder(shipForm)
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    getOrderListFn()
  } catch (error) {
    ElMessage.error('发货失败')
  }
}

// 取消订单
const cancelOrder = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单"${row.order_no}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await updateOrderStatus({
      id: row.id,
      status: 4
    })
    ElMessage.success('订单已取消')
    getOrderListFn()
  } catch (error) {
    // 用户取消操作
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'success',
    4: 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    0: '待支付',
    1: '已支付',
    2: '已发货',
    3: '已完成',
    4: '已取消'
  }
  return texts[status] || '未知'
}

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methods = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'balance': '余额支付'
  }
  return methods[method] || method || '未知'
}

// 分页事件处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  getOrderListFn()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  getOrderListFn()
}

// 组件挂载时获取数据
onMounted(() => {
  getOrderListFn()
})
</script>

<style scoped lang="scss">
.order-list {
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
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

  .amount {
    color: #f56c6c;
    font-weight: bold;
    font-size: 14px;
  }

  .address-info {
    .address-detail {
      color: #999;
      font-size: 12px;
      margin-top: 4px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 