<template>
  <div class="dashboard">
    <el-card>
      <h2 class="dashboard-title">欢迎使用商城后台管理系统</h2>
      <p class="dashboard-desc">这里是仪表盘，您可以在此快速查看商城的核心数据和快捷操作。</p>
      
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <el-statistic title="今日销售额" :value="12580.5" prefix="¥" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <el-statistic title="今日订单数" :value="156" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <el-statistic title="新增用户" :value="23" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <el-statistic title="商品总数" :value="1250" />
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
// 仪表盘可根据实际业务对接API
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }

  .dashboard-title {
    font-size: 24px;
    color: var(--text-color-primary);
    margin-bottom: 10px;
    
    @media (max-width: 768px) {
      font-size: 20px;
    }
    
    @media (max-width: 480px) {
      font-size: 18px;
    }
  }

  .dashboard-desc {
    font-size: 16px;
    color: var(--text-color-regular);
    margin-bottom: 30px;
    
    @media (max-width: 768px) {
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    @media (max-width: 480px) {
      font-size: 13px;
      margin-bottom: 15px;
    }
  }

  .stats-row {
    margin-top: 20px;
    
    @media (max-width: 768px) {
      margin-top: 15px;
    }
    
    @media (max-width: 480px) {
      margin-top: 10px;
    }
  }

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    @media (max-width: 768px) {
      padding: 15px;
      margin-bottom: 15px;
    }
    
    @media (max-width: 480px) {
      padding: 12px;
      margin-bottom: 10px;
    }

    :deep(.el-statistic) {
      .el-statistic__head {
        font-size: 14px;
        color: var(--text-color-regular);
        margin-bottom: 8px;
        
        @media (max-width: 768px) {
          font-size: 13px;
          margin-bottom: 6px;
        }
        
        @media (max-width: 480px) {
          font-size: 12px;
          margin-bottom: 4px;
        }
      }

      .el-statistic__content {
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-color);
        
        @media (max-width: 768px) {
          font-size: 20px;
        }
        
        @media (max-width: 480px) {
          font-size: 18px;
        }
      }
    }
  }
}
</style> 