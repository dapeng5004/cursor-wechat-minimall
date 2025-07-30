<template>
  <div class="dashboard">
    <el-card>
      <h2>欢迎使用商城后台管理系统</h2>
      <p>这里是仪表盘，您可以在此快速查看商城的核心数据和快捷操作。</p>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <el-statistic title="今日销售额" :value="12580.5" prefix="¥" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="今日订单数" :value="156" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="新增用户" :value="23" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="商品总数" :value="1250" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
// 仪表盘可根据实际业务对接API
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style> 