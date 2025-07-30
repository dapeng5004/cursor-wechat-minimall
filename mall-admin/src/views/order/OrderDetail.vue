<template>
  <div class="order-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button @click="$router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span>订单详情</span>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 订单基本信息 -->
        <el-descriptions title="订单信息" :column="3" border>
          <el-descriptions-item label="订单号">{{ orderInfo.order_no }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(orderInfo.status)">
              {{ getStatusText(orderInfo.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ orderInfo.total_amount }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ orderInfo.payment_method || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ orderInfo.payment_time || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ orderInfo.created_at }}</el-descriptions-item>
        </el-descriptions>

        <!-- 收货信息 -->
        <el-descriptions title="收货信息" :column="2" border style="margin-top: 20px;">
          <el-descriptions-item label="收货人">{{ addressInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ addressInfo.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ addressInfo.province }} {{ addressInfo.city }} {{ addressInfo.district }} {{ addressInfo.detail }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 商品信息 -->
        <div style="margin-top: 20px;">
          <h3>商品信息</h3>
          <el-table :data="goodsList" border>
            <el-table-column label="商品图片" width="100">
              <template #default="{ row }">
                <el-image
                  :src="row.goods_image"
                  style="width: 60px; height: 60px; border-radius: 4px"
                  fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column prop="goods_name" label="商品名称" min-width="200" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">
                ¥{{ row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="subtotal" label="小计" width="100">
              <template #default="{ row }">
                ¥{{ row.subtotal }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 操作按钮 -->
        <div style="margin-top: 20px; text-align: center;">
          <el-button 
            v-if="orderInfo.status === 1" 
            type="primary" 
            @click="handleShip"
            :loading="shipLoading"
          >
            发货
          </el-button>
          <el-button 
            v-if="orderInfo.status === 0" 
            type="danger" 
            @click="handleCancel"
          >
            取消订单
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="快递公司">
          <el-select v-model="shipForm.express_company" placeholder="请选择快递公司">
            <el-option label="顺丰快递" value="SF" />
            <el-option label="圆通快递" value="YTO" />
            <el-option label="中通快递" value="ZTO" />
            <el-option label="申通快递" value="STO" />
            <el-option label="韵达快递" value="YD" />
            <el-option label="百世快递" value="HTKY" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.express_no" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShip" :loading="shipLoading">
            确认发货
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getOrderDetail, shipOrder, cancelOrder } from '@/api/order'

const route = useRoute()

// 响应式数据
const loading = ref(false)
const shipLoading = ref(false)
const shipDialogVisible = ref(false)
const orderInfo = ref({})
const addressInfo = ref({})
const goodsList = ref([])

// 发货表单
const shipForm = reactive({
  express_company: '',
  express_no: ''
})

// 获取订单详情
const getDetail = async () => {
  try {
    loading.value = true
    const response = await getOrderDetail(route.params.id)
    orderInfo.value = response.order
    addressInfo.value = response.address
    goodsList.value = response.goods
  } catch (error) {
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已发货',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知'
}

// 发货
const handleShip = () => {
  shipDialogVisible.value = true
}

// 确认发货
const confirmShip = async () => {
  if (!shipForm.express_company || !shipForm.express_no) {
    ElMessage.warning('请填写完整的发货信息')
    return
  }

  try {
    shipLoading.value = true
    await shipOrder({
      order_id: orderInfo.value.id,
      express_company: shipForm.express_company,
      express_no: shipForm.express_no
    })
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    getDetail() // 刷新数据
  } catch (error) {
    ElMessage.error('发货失败')
  } finally {
    shipLoading.value = false
  }
}

// 取消订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cancelOrder({ id: orderInfo.value.id })
    ElMessage.success('订单已取消')
    getDetail() // 刷新数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败')
    }
  }
}

// 生命周期
onMounted(() => {
  getDetail()
})
</script>

<style scoped lang="scss">
.order-detail {
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style> 