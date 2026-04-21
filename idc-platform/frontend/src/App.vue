<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1>IDC 数字孪生管理平台</h1>
        <div class="user-info">
          <el-dropdown v-if="userStore.user">
            <span class="el-dropdown-link">
              <el-icon><User /></el-icon>
              {{ userStore.user.name }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside class="app-aside" width="200px">
        <el-menu
          :default-active="activeMenu"
          router
          class="el-menu-vertical"
        >
          <el-menu-item index="/">
            <el-icon><Monitor /></el-icon>
            <span>数字孪生</span>
          </el-menu-item>
          <el-menu-item index="/devices">
            <el-icon><Box /></el-icon>
            <span>设备管理</span>
          </el-menu-item>
          <el-menu-item index="/ipam">
            <el-icon><Connection /></el-icon>
            <span>IPAM</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
}

.user-info {
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.app-aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.app-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
