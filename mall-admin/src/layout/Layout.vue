<template>
  <div class="layout" :class="{ 'mobile-layout': isMobile }">
    <Sidebar class="sidebar" :class="{ 'sidebar-hidden': isMobile && !sidebarVisible }" />
    <div class="main" :class="{ 'main-full': isMobile && !sidebarVisible }">
      <Header class="header" @toggle-sidebar="toggleSidebar" />
      <div class="content">
        <router-view />
      </div>
    </div>
    <!-- 移动端遮罩层 -->
    <div v-if="isMobile && sidebarVisible" class="sidebar-mask" @click="closeSidebar"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

const isMobile = ref(false)
const sidebarVisible = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

const toggleSidebar = () => {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  }
}

const closeSidebar = () => {
  sidebarVisible.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  height: 100vh;
  position: relative;

  &.mobile-layout {
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1001;
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &.sidebar-hidden {
        transform: translateX(0);
      }
    }

    .main {
      width: 100%;
      margin-left: 0;

      &.main-full {
        width: 100%;
      }
    }
  }

  .sidebar {
    flex-shrink: 0;
    transition: width 0.3s ease;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: margin-left 0.3s ease;

    .header {
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      padding: 20px;
      background: #f0f2f5;
      overflow-y: auto;
      
      @media (max-width: 768px) {
        padding: 15px;
      }
      
      @media (max-width: 480px) {
        padding: 10px;
      }
    }
  }

  .sidebar-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
}

// 响应式断点
@media (max-width: 768px) {
  .layout {
    .main .content {
      padding: 15px;
    }
  }
}

@media (max-width: 480px) {
  .layout {
    .main .content {
      padding: 10px;
    }
  }
}
</style> 