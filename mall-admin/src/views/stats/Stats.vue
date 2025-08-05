<template>
  <div class="stats-page">
    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      :closable="false"
      show-icon
      style="margin-bottom: 20px;"
    />

    <!-- KPI指标卡片 -->
    <el-row :gutter="20" style="margin-bottom: 30px;">
      <el-col :span="6">
        <el-card class="kpi-card" shadow="hover">
          <div class="kpi-content">
            <div class="kpi-icon" style="background-color: #409eff;">
              <el-icon><View /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">访问量(PV)</div>
              <div class="kpi-value" style="color: #409eff;">{{ statsData.pv || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="kpi-card" shadow="hover">
          <div class="kpi-content">
            <div class="kpi-icon" style="background-color: #67c23a;">
              <el-icon><User /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">访客数(UV)</div>
              <div class="kpi-value" style="color: #67c23a;">{{ statsData.uv || 0 }}</div>
            </div>
          </div>
        </el-card>
        </el-col>
      <el-col :span="6">
        <el-card class="kpi-card" shadow="hover">
          <div class="kpi-content">
            <div class="kpi-icon" style="background-color: #e6a23c;">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">下单数</div>
              <div class="kpi-value" style="color: #e6a23c;">{{ statsData.orders || 0 }}</div>
            </div>
          </div>
        </el-card>
        </el-col>
      <el-col :span="6">
        <el-card class="kpi-card" shadow="hover">
          <div class="kpi-content">
            <div class="kpi-icon" style="background-color: #f56c6c;">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">转化率</div>
              <div class="kpi-value" style="color: #f56c6c;">{{ statsData.conversionRate || 0 }}%</div>
            </div>
          </div>
        </el-card>
        </el-col>
      </el-row>

    <!-- 订单状态分布 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div class="order-status-container">
            <div class="status-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #409eff;"></div>
                <span>待付款</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #67c23a;"></div>
                <span>待发货</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #e6a23c;"></div>
                <span>已发货</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #f56c6c;"></div>
                <span>已完成</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #909399;"></div>
                <span>已取消</span>
              </div>
            </div>
            <div class="chart-container" ref="orderChartRef"></div>
      </div>
    </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
            </div>
          </template>
          <div class="chart-container" ref="salesChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热销商品 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热销商品</span>
            </div>
          </template>
          <el-table :data="hotGoods" stripe v-loading="loading">
            <el-table-column label="商品图片" width="100">
              <template #default="{ row }">
                <el-image
                  :src="getImageUrl(row.image)"
                  style="width: 60px; height: 60px; border-radius: 4px"
                  fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">
                ¥{{ row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="total_sales" label="销量" width="100" />
            <el-table-column prop="total_amount" label="销售额" width="120">
              <template #default="{ row }">
                ¥{{ row.total_amount || 0 }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { View, User, ShoppingCart, TrendCharts } from '@element-plus/icons-vue'
import { getSalesStats, getOrderStats, getConversionStats, getSalesTrend, getHotGoods } from '@/api/stats'
import { getImageUrl } from '@/utils/image'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const errorMessage = ref('')
const statsData = ref({})
const orderStats = ref({})
const hotGoods = ref([])
const orderChartRef = ref(null)
const salesChartRef = ref(null)

// 图表实例
let orderChart = null
let salesChart = null

// 获取统计数据
const getStatsData = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    // 并行获取所有统计数据
    const [salesRes, orderRes, conversionRes, trendRes, goodsRes] = await Promise.allSettled([
      getSalesStats({ type: 'month' }),
      getOrderStats(),
      getConversionStats(),
      getSalesTrend({ days: 7 }),
      getHotGoods({ limit: 10 })
    ])

    // 处理销售统计
    if (salesRes.status === 'fulfilled') {
      const salesData = salesRes.value
      statsData.value = {
        ...statsData.value,
        sales: salesData.sales,
        orders: salesData.orders,
        salesGrowth: salesData.salesGrowth,
        ordersGrowth: salesData.ordersGrowth
      }
    }

    // 处理订单统计
    if (orderRes.status === 'fulfilled') {
      orderStats.value = orderRes.value
    }

    // 处理转化率统计
    if (conversionRes.status === 'fulfilled') {
      const conversionData = conversionRes.value
      statsData.value = {
        ...statsData.value,
        pv: conversionData.totalUsers || 0,
        uv: conversionData.orderUsers || 0,
        conversionRate: conversionData.conversionRate || 0
      }
    } else {
      errorMessage.value = '加载转化率统计失败'
    }

    // 处理销售趋势
    if (trendRes.status === 'fulfilled') {
      await nextTick()
      initSalesChart(trendRes.value)
    }

    // 处理热销商品
    if (goodsRes.status === 'fulfilled') {
      hotGoods.value = goodsRes.value || []
    }

  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化订单状态分布图表
const initOrderChart = () => {
  if (!orderChartRef.value) return

  orderChart = echarts.init(orderChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      show: false
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '30',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: orderStats.value.pending || 0, name: '待付款', itemStyle: { color: '#409eff' } },
          { value: orderStats.value.paid || 0, name: '待发货', itemStyle: { color: '#67c23a' } },
          { value: orderStats.value.shipped || 0, name: '已发货', itemStyle: { color: '#e6a23c' } },
          { value: orderStats.value.completed || 0, name: '已完成', itemStyle: { color: '#f56c6c' } },
          { value: orderStats.value.cancelled || 0, name: '已取消', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }

  orderChart.setOption(option)
}

// 初始化销售趋势图表
const initSalesChart = (trendData) => {
  if (!salesChartRef.value || !trendData) return

  salesChart = echarts.init(salesChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['销售额', '订单数']
    },
    xAxis: [
      {
        type: 'category',
        data: trendData.dates || [],
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        min: 0,
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单数',
        min: 0,
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: trendData.sales || []
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.orders || []
      }
    ]
  }

  salesChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  if (orderChart) {
    orderChart.resize()
  }
  if (salesChart) {
    salesChart.resize()
  }
}

// 组件挂载
onMounted(async () => {
  await getStatsData()
  await nextTick()
  initOrderChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (orderChart) {
    orderChart.dispose()
  }
  if (salesChart) {
    salesChart.dispose()
  }
})
</script>

<style scoped lang="scss">
.stats-page {
  padding: 20px;
}

.kpi-card {
  .kpi-content {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .kpi-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
  }

  .kpi-info {
    flex: 1;
  }

  .kpi-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }

  .kpi-value {
    font-size: 24px;
    font-weight: bold;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-status-container {
  display: flex;
  gap: 20px;
  height: 300px;
}

.status-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 100px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-container {
  flex: 1;
  height: 300px;
}
</style> 