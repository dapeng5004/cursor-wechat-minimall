<template>
  <div class="header">
    <div class="header-left">
      <el-icon class="menu-toggle" @click="toggleSidebar">
        <Expand v-if="!isCollapse" />
        <Fold v-else />
      </el-icon>
      <div class="logo">商城后台管理系统</div>
    </div>
    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :src="userStore.userInfo.avatar">
            {{ userStore.userInfo.nickname?.charAt(0) || 'A' }}
          </el-avatar>
          <span class="username">{{ userStore.userInfo.nickname || '管理员' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Expand, Fold, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapse)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
      router.push('/login')
      ElMessage.success('退出登录成功')
    } catch (error) {
      // 用户取消操作
    }
  } else if (command === 'profile') {
    ElMessage.info('个人信息功能开发中...')
  }
}
</script>

<style scoped lang="scss">
.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .menu-toggle {
      font-size: 20px;
      cursor: pointer;
      color: #606266;
      
      &:hover {
        color: var(--primary-color);
      }
    }

    .logo {
      font-size: 18px;
      font-weight: bold;
      color: var(--text-color-primary);
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      .username {
        font-size: 14px;
        color: var(--text-color-regular);
      }
    }
  }
}
</style> 