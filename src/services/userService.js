// 用户服务
import axios from 'axios'
import { API_BASE_URL, API_PATHS } from '../config/api'

// 创建Axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 用户服务接口
const userService = {
  // 用户登录
  login: async (credentials) => {
    try {
      const response = await api.post('/user/login', credentials)
      
      // 保存token到localStorage
      if (response.code === 200 && response.data) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo))
        localStorage.setItem('username', response.data.userInfo.username)
        localStorage.setItem('role', response.data.userInfo.role)
      }
      
      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },
  
  // 用户退出
  logout: async () => {
    try {
      // 由于Mock未实现logout接口，直接本地处理
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      return { success: true }
    } catch (error) {
      console.error('退出失败:', error)
      // 即使发生错误，也尝试清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      throw error
    }
  },
  
  // 获取用户信息
  getUserInfo: async () => {
    try {
      const response = await api.get('/user/info')
      
      // 更新localStorage中的用户信息
      localStorage.setItem('userInfo', JSON.stringify(response))
      
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },
  
  // 刷新token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh')
      
      // 更新localStorage中的token
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      
      return response
    } catch (error) {
      console.error('刷新token失败:', error)
      throw error
    }
  },
  
  // 修改密码
  changePassword: async (data) => {
    try {
      const response = await api.post('/user/change-password', data)
      return response
    } catch (error) {
      console.error('修改密码失败:', error)
      throw error
    }
  },
  
  // 更新用户资料
  updateProfile: async (data) => {
    try {
      const response = await api.put('/user/update-profile', data)
      
      // 更新localStorage中的用户信息
      const updatedUserInfo = { ...JSON.parse(localStorage.getItem('userInfo')), ...response }
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
      
      return response
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  },
  
  // 获取用户列表
  getUserList: async (params = {}) => {
    try {
      const response = await api.get('/user/list', { params })
      return response
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  },
  
  // 获取用户详情
  getUserDetail: async (id) => {
    try {
      const response = await api.get(`/user/detail/${id}`)
      return response
    } catch (error) {
      console.error('获取用户详情失败:', error)
      throw error
    }
  },
  
  // 添加用户
  addUser: async (data) => {
    try {
      const response = await api.post('/user/add', data)
      return response
    } catch (error) {
      console.error('添加用户失败:', error)
      throw error
    }
  },
  
  // 更新用户
  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/user/update/${id}`, data)
      return response
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  },
  
  // 删除用户
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/user/delete/${id}`)
      return response
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  },
  
  // 批量删除用户
  batchDeleteUser: async (ids) => {
    try {
      const response = await api.delete('/user/batch-delete', { data: { ids } })
      return response
    } catch (error) {
      console.error('批量删除用户失败:', error)
      throw error
    }
  }
}

export default userService