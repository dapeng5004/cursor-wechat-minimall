<template>
  <div class="sidebar" :class="{ 'sidebar-collapse': isCollapse }">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :unique-opened="true"
      router
      class="sidebar-menu"
    >
      <template v-for="menu in menuList" :key="menu.path">
        <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
          <template #title>
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.path"
            :index="child.path"
          >
            <el-icon><component :is="child.icon" /></el-icon>
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="menu.path">
          <el-icon><component :is="menu.icon" /></el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import {
  House,
  Picture,
  Menu,
  Goods,
  ShoppingCart,
  DataAnalysis
} from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapse)
const activeMenu = computed(() => route.path)

const menuList = [
  {
    path: '/dashboard',
    title: '仪表板',
    icon: 'House'
  },
  {
    path: '/banner',
    title: '轮播图管理',
    icon: 'Picture'
  },
  {
    path: '/category',
    title: '分类管理',
    icon: 'Menu'
  },
  {
    path: '/goods',
    title: '商品管理',
    icon: 'Goods'
  },
  {
    path: '/order',
    title: '订单管理',
    icon: 'ShoppingCart'
  },
  {
    path: '/stats',
    title: '数据统计',
    icon: 'DataAnalysis'
  }
]
</script>

<style scoped lang="scss">
.sidebar {
  width: 240px;
  height: 100vh;
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;

  &.sidebar-collapse {
    width: 64px;
  }

  .sidebar-menu {
    border: none;
    background: transparent;
    height: 100%;

    :deep(.el-menu-item) {
      color: #bfcbd9;
      
      &:hover {
        background: #263445;
        color: #fff;
      }
      
      &.is-active {
        background: var(--primary-color);
        color: #fff;
      }
    }

    :deep(.el-sub-menu__title) {
      color: #bfcbd9;
      
      &:hover {
        background: #263445;
        color: #fff;
      }
    }

    :deep(.el-sub-menu.is-active .el-sub-menu__title) {
      color: #fff;
    }
  }
}
</style>
