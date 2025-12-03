// 业务等级服务
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

// 业务等级服务接口
const businessLevelService = {
  // 获取业务等级列表
  getBusinessLevelList: async (params = {}) => {
    try {
      const response = await api.get('/business-level/list', { params })
      return response
    } catch (error) {
      console.error('获取业务等级列表失败:', error)
      throw error
    }
  },
  
  // 获取业务等级详情
  getBusinessLevelDetail: async (id) => {
    try {
      const response = await api.get(`/business-level/detail/${id}`)
      return response
    } catch (error) {
      console.error('获取业务等级详情失败:', error)
      throw error
    }
  },
  
  // 添加业务等级
  addBusinessLevel: async (data) => {
    try {
      const response = await api.post('/business-level/add', data)
      return response
    } catch (error) {
      console.error('添加业务等级失败:', error)
      throw error
    }
  },
  
  // 更新业务等级
  updateBusinessLevel: async (id, data) => {
    try {
      const response = await api.put(`/business-level/update/${id}`, data)
      return response
    } catch (error) {
      console.error('更新业务等级失败:', error)
      throw error
    }
  },
  
  // 删除业务等级
  deleteBusinessLevel: async (id) => {
    try {
      const response = await api.delete(`/business-level/delete/${id}`)
      return response
    } catch (error) {
      console.error('删除业务等级失败:', error)
      throw error
    }
  },
  
  // 批量删除业务等级
  batchDeleteBusinessLevel: async (ids) => {
    try {
      const response = await api.delete('/business-level/batch-delete', { data: { ids } })
      return response
    } catch (error) {
      console.error('批量删除业务等级失败:', error)
      throw error
    }
  }
}

export default businessLevelService