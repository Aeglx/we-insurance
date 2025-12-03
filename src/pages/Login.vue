<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-blue-100">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md card-shadow">
      <!-- 登录表单 -->
      <div class="space-y-6" v-if="activeView === 'login'">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light mb-4">
            <i class="fas fa-shield-alt text-3xl text-primary"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">非车险业务台账登记系统</h2>
          <p class="text-gray-500 mt-2">请登录您的账户</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <i class="fas fa-user"></i>
                </span>
                <input
                  id="username"
                  v-model="loginForm.username"
                  type="text"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md input-focus"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
                <button
                  type="button"
                  class="text-sm text-primary hover:text-primary-dark transition-colors"
                  @click="activeView = 'forgot'"
                >忘记密码？</button>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <i class="fas fa-lock"></i>
                </span>
                <input
                  id="password"
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md input-focus"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="flex items-center">
              <input
                id="rememberMe"
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label for="rememberMe" class="ml-2 block text-sm text-gray-700">记住我</label>
            </div>
          </div>

          <button
            type="submit"
            class="w-full btn-primary mt-6"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            登录
          </button>
        </form>

        <div class="text-center text-sm text-gray-500">
          <p>© 2025 非车险业务台账登记系统</p>
        </div>
      </div>

      <!-- 忘记密码表单 -->
      <div class="space-y-6" v-else-if="activeView === 'forgot'">
        <div class="flex items-center">
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 mr-4"
            @click="activeView = 'login'"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
          <h2 class="text-xl font-bold text-gray-800">忘记密码</h2>
        </div>

        <form @submit.prevent="handleForgotPassword">
          <p class="text-gray-500">请输入您的邮箱地址，我们将发送重置密码的链接。</p>

          <div class="mt-4">
            <label for="forgotEmail" class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <i class="fas fa-envelope"></i>
              </span>
              <input
                id="forgotEmail"
                v-model="forgotForm.email"
                type="email"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md input-focus"
                placeholder="请输入您的邮箱"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full btn-primary mt-6"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            发送重置链接
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../services/userService'

const router = useRouter()
const activeView = ref('login')
const showPassword = ref(false)
const loading = ref(false)

// 登录表单数据
const loginForm = ref({
  username: 'admin',
  password: 'admin123',
  rememberMe: false
})

// 忘记密码表单数据
const forgotForm = ref({
  email: ''
})

// 获取当前组件实例
const instance = getCurrentInstance()

// 登录处理
const handleLogin = async () => {
  try {
    loading.value = true
    const response = await userService.login(loginForm.value)
    
    if (response.code === 200) {
      // 保存登录状态
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo))
      localStorage.setItem('username', response.data.userInfo.username)
      localStorage.setItem('role', response.data.userInfo.role)
      
      // 跳转至仪表盘
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('登录失败:', error)
    instance?.proxy?.$toast.error('用户名或密码错误')
  } finally {
    loading.value = false
  }
}

// 忘记密码处理
const handleForgotPassword = async () => {
  try {
    loading.value = true
    // 模拟发送重置链接
    await new Promise(resolve => setTimeout(resolve, 1000))
    instance?.proxy?.$toast.success('重置链接已发送至您的邮箱')
    activeView.value = 'login'
  } catch (error) {
    console.error('发送失败:', error)
    instance?.proxy?.$toast.error('发送失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>