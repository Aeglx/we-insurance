// 业务记录服务
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

// 业务记录服务接口
const businessService = {
  // 获取业务列表
  getBusinessList: async (params = {}) => {
    try {
      const response = await api.get('/business/list', { params })
      return response
    } catch (error) {
      console.error('获取业务列表失败:', error)
      throw error
    }
  },
  
  // 获取业务详情
  getBusinessDetail: async (id) => {
    try {
      const response = await api.get(`/business/detail/${id}`)
      return response
    } catch (error) {
      console.error('获取业务详情失败:', error)
      throw error
    }
  },
  
  // 获取业务操作日志
  getBusinessLogs: async (id) => {
    try {
      const response = await api.get(`/business/logs/${id}`)
      return response
    } catch (error) {
      console.error('获取业务操作日志失败:', error)
      throw error
    }
  },
  
  // 添加业务记录
  addBusiness: async (data) => {
    try {
      const response = await api.post('/business/add', data)
      return response
    } catch (error) {
      console.error('添加业务记录失败:', error)
      throw error
    }
  },
  
  // 更新业务记录
  updateBusiness: async (id, data) => {
    try {
      const response = await api.put(`/business/update/${id}`, data)
      return response
    } catch (error) {
      console.error('更新业务记录失败:', error)
      throw error
    }
  },
  
  // 删除业务记录
  deleteBusiness: async (id) => {
    try {
      const response = await api.delete(`/business/delete/${id}`)
      return response
    } catch (error) {
      console.error('删除业务记录失败:', error)
      throw error
    }
  },
  
  // 批量删除业务记录
  batchDeleteBusiness: async (ids) => {
    try {
      const response = await api.delete('/business/batch-delete', { data: { ids } })
      return response
    } catch (error) {
      console.error('批量删除业务记录失败:', error)
      throw error
    }
  },
  
  // 获取业务统计数据
  getBusinessStatistics: async (params = {}) => {
    try {
      const response = await api.get('/business/statistics', { params })
      return response
    } catch (error) {
      console.error('获取业务统计数据失败:', error)
      throw error
    }
  },
  
  // 导出业务列表
  exportBusinessList: async (params = {}, format = 'excel') => {
    try {
      const response = await api.get('/business/export', {
        params: { ...params, format },
        responseType: 'blob'
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `业务记录_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
      document.body.appendChild(link)
      link.click()
      
      // 清理
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      return response
    } catch (error) {
      console.error('导出业务列表失败:', error)
      throw error
    }
  },
  
  // 导入业务列表
  importBusinessList: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post('/business/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response
    } catch (error) {
      console.error('导入业务列表失败:', error)
      throw error
    }
  }
}

export default businessService