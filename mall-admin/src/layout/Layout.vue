<template>
  <div class="layout">
    <Sidebar class="sidebar" />
    <div class="main">
      <Header class="header" />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  height: 100vh;

  .sidebar {
    flex-shrink: 0;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      padding: 20px;
      background: #f0f2f5;
      overflow-y: auto;
    }
  }
}
</style> 