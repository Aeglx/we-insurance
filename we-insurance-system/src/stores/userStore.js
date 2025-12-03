import { defineStore } from 'pinia'
import userService from '../services/userService'

// 用户信息Store
export const useUserStore = defineStore('user', {
  // 状态定义
  state: () => ({
    // 用户信息
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    // 认证token
    token: localStorage.getItem('token') || null,
    // 登录状态
    isLoggedIn: !!localStorage.getItem('token'),
    // 加载状态
    loading: false,
    // 错误信息
    error: null
  }),
  
  // Getters
  getters: {
    // 获取用户ID
    userId: (state) => state.userInfo?.id || null,
    // 获取用户名
    userName: (state) => state.userInfo?.name || '',
    // 获取用户角色
    userRole: (state) => state.userInfo?.role || '',
    // 判断是否为管理员
    isAdmin: (state) => state.userInfo?.role === 'admin',
    // 判断是否为普通用户
    isUser: (state) => state.userInfo?.role === 'user',
    // 获取用户部门
    userDepartment: (state) => state.userInfo?.department || '',
    // 获取用户邮箱
    userEmail: (state) => state.userInfo?.email || '',
    // 获取用户手机
    userPhone: (state) => state.userInfo?.phone || ''
  },
  
  // Actions
  actions: {
    // 登录
    async login(credentials) {
      try {
        this.loading = true
        this.error = null
        
        const response = await userService.login(credentials)
        
        // 更新状态
        this.userInfo = response.userInfo
        this.token = response.token
        this.isLoggedIn = true
        
        return response
      } catch (error) {
        this.error = error.message || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 退出
    async logout() {
      try {
        this.loading = true
        
        await userService.logout()
        
        // 清除状态
        this.userInfo = null
        this.token = null
        this.isLoggedIn = false
        this.error = null
      } catch (error) {
        // 即使API调用失败，也清除本地状态
        this.userInfo = null
        this.token = null
        this.isLoggedIn = false
        this.error = error.message || '退出失败'
      } finally {
        this.loading = false
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        this.loading = true
        this.error = null
        
        const response = await userService.getUserInfo()
        
        // 更新状态
        this.userInfo = response
        this.isLoggedIn = true
        
        return response
      } catch (error) {
        this.error = error.message || '获取用户信息失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新用户信息
    async updateUserInfo(userData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await userService.updateProfile(userData)
        
        // 更新状态
        this.userInfo = { ...this.userInfo, ...response }
        
        return response
      } catch (error) {
        this.error = error.message || '更新用户信息失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 修改密码
    async changePassword(passwordData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await userService.changePassword(passwordData)
        
        return response
      } catch (error) {
        this.error = error.message || '修改密码失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 清除错误信息
    clearError() {
      this.error = null
    },
    
    // 从localStorage恢复状态
    restoreState() {
      this.userInfo = JSON.parse(localStorage.getItem('userInfo')) || null
      this.token = localStorage.getItem('token') || null
      this.isLoggedIn = !!this.token
    }
  }
})
