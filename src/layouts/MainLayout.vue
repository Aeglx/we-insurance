<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo和应用名称 -->
        <div class="flex items-center space-x-3">
          <i class="fas fa-shield-alt text-primary text-2xl"></i>
          <h1 class="text-xl font-bold text-gray-800">非车险业务台账登记系统</h1>
        </div>
        
        <!-- 导航菜单 -->
        <div class="flex items-center space-x-1">
          <router-link 
            to="/dashboard" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            :class="[ $route.path === '/dashboard' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100', 'rounded-md' ]"
          >
            <i class="fas fa-chart-line mr-1"></i>
            <span>仪表盘</span>
          </router-link>
          <router-link 
            to="/business/register" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            :class="[ $route.path === '/business/register' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100', 'rounded-md' ]"
          >
            <i class="fas fa-file-alt mr-1"></i>
            <span>业务登记</span>
          </router-link>
          <router-link 
            to="/business/list" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            :class="[ $route.path === '/business/list' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100', 'rounded-md' ]"
          >
            <i class="fas fa-list mr-1"></i>
            <span>业务列表</span>
          </router-link>
          <router-link 
            to="/statistics" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            :class="[ $route.path === '/statistics' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100', 'rounded-md' ]"
          >
            <i class="fas fa-chart-bar mr-1"></i>
            <span>统计分析</span>
          </router-link>
          <router-link 
            to="/data/query" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            :class="[ $route.path === '/data/query' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100', 'rounded-md' ]"
          >
            <i class="fas fa-search mr-1"></i>
            <span>数据查询</span>
          </router-link>
          <router-link 
            to="/management" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            :class="[ $route.path === '/management' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100', 'rounded-md' ]"
          >
            <i class="fas fa-cog mr-1"></i>
            <span>管理</span>
          </router-link>
        </div>
        
        <!-- 用户信息和通知 -->
        <div class="flex items-center space-x-4">
          <div class="relative">
            <button class="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors">
              <i class="far fa-bell text-lg"></i>
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full flex items-center justify-center text-white text-xs">3</span>
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white border-2 border-primary">
              <i class="fas fa-user text-lg"></i>
            </div>
            <span class="text-gray-700 font-medium">{{ userInfo.name }}</span>
            <i class="fas fa-chevron-down text-sm text-gray-400"></i>
          </div>
          <button 
            class="text-gray-600 hover:text-danger transition-colors" 
            @click="handleLogout"
            title="退出登录"
          >
            <i class="fas fa-sign-out-alt text-lg"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-grow container mx-auto px-4 py-6">
      <!-- router-view 由 App.vue 渲染 -->
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userInfo = ref({
  name: '管理员',
  role: 'admin'
})

onMounted(() => {
  // 从localStorage获取用户信息
  const savedUser = localStorage.getItem('userInfo')
  if (savedUser) {
    userInfo.value = JSON.parse(savedUser)
  }
})

const handleLogout = () => {
  // 清除登录状态
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('role')
  
  // 跳转到登录页
  router.push('/')
}
</script>

