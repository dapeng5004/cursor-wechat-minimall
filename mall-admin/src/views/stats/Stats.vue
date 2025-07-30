<template>
  <div class="stats-page">
    <el-card>
      <h2>数据统计</h2>
      <p>这里展示商城的销售统计、订单统计、热销商品等数据。</p>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-statistic title="本月销售额" :value="88888" prefix="¥" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="本月订单数" :value="3200" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="转化率" :value="12.5" suffix="%" />
        </el-col>
      </el-row>
      <div style="margin-top: 40px;">
        <el-empty description="可对接后端API展示趋势图、排行等统计图表" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
// 可对接后端API，渲染ECharts等图表
</script>

<style scoped>
.stats-page {
  padding: 20px;
}
</style> 