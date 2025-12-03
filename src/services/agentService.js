// 代理人服务
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

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

// 代理人服务接口
const agentService = {
  // 获取代理人列表
  getAgentList: async (params = {}) => {
    try {
      const response = await api.get('/agent/list', { params })
      return response
    } catch (error) {
      console.error('获取代理人列表失败:', error)
      throw error
    }
  },
  
  // 获取代理人详情
  getAgentDetail: async (id) => {
    try {
      const response = await api.get(`/agent/detail/${id}`)
      return response
    } catch (error) {
      console.error('获取代理人详情失败:', error)
      throw error
    }
  },
  
  // 添加代理人
  addAgent: async (data) => {
    try {
      const response = await api.post('/agent/add', data)
      return response
    } catch (error) {
      console.error('添加代理人失败:', error)
      throw error
    }
  },
  
  // 更新代理人
  updateAgent: async (id, data) => {
    try {
      const response = await api.put(`/agent/update/${id}`, data)
      return response
    } catch (error) {
      console.error('更新代理人失败:', error)
      throw error
    }
  },
  
  // 删除代理人
  deleteAgent: async (id) => {
    try {
      const response = await api.delete(`/agent/delete/${id}`)
      return response
    } catch (error) {
      console.error('删除代理人失败:', error)
      throw error
    }
  },
  
  // 批量删除代理人
  batchDeleteAgent: async (ids) => {
    try {
      const response = await api.delete('/agent/batch-delete', { data: { ids } })
      return response
    } catch (error) {
      console.error('批量删除代理人失败:', error)
      throw error
    }
  },
  
  // 搜索代理人
  searchAgent: async (keyword) => {
    try {
      const response = await api.get('/agent/search', { params: { keyword } })
      return response
    } catch (error) {
      console.error('搜索代理人失败:', error)
      throw error
    }
  }
}

export default agentService