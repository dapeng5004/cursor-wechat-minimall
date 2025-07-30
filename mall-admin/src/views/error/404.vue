<template>
  <div class="not-found">
    <div class="error-content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;

  .error-content {
    text-align: center;

    h1 {
      font-size: 120px;
      color: #1890ff;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #666;
      margin-bottom: 24px;
    }
  }
}
</style> 