// 出单员服务
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

// 出单员服务接口
const underwriterService = {
  // 获取出单员列表
  getUnderwriterList: async (params = {}) => {
    try {
      const response = await api.get('/underwriter/list', { params })
      return response
    } catch (error) {
      console.error('获取出单员列表失败:', error)
      throw error
    }
  },
  
  // 获取出单员详情
  getUnderwriterDetail: async (id) => {
    try {
      const response = await api.get(`/underwriter/detail/${id}`)
      return response
    } catch (error) {
      console.error('获取出单员详情失败:', error)
      throw error
    }
  },
  
  // 添加出单员
  addUnderwriter: async (data) => {
    try {
      const response = await api.post('/underwriter/add', data)
      return response
    } catch (error) {
      console.error('添加出单员失败:', error)
      throw error
    }
  },
  
  // 更新出单员
  updateUnderwriter: async (id, data) => {
    try {
      const response = await api.put(`/underwriter/update/${id}`, data)
      return response
    } catch (error) {
      console.error('更新出单员失败:', error)
      throw error
    }
  },
  
  // 删除出单员
  deleteUnderwriter: async (id) => {
    try {
      const response = await api.delete(`/underwriter/delete/${id}`)
      return response
    } catch (error) {
      console.error('删除出单员失败:', error)
      throw error
    }
  },
  
  // 批量删除出单员
  batchDeleteUnderwriter: async (ids) => {
    try {
      const response = await api.delete('/underwriter/batch-delete', { data: { ids } })
      return response
    } catch (error) {
      console.error('批量删除出单员失败:', error)
      throw error
    }
  },
  
  // 搜索出单员
  searchUnderwriter: async (keyword) => {
    try {
      const response = await api.get('/underwriter/search', { params: { keyword } })
      return response
    } catch (error) {
      console.error('搜索出单员失败:', error)
      throw error
    }
  }
}

export default underwriterService