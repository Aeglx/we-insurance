// 险种服务
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

// 险种服务接口
const insuranceService = {
  // 获取险种列表
  getInsuranceList: async (params = {}) => {
    try {
      const response = await api.get('/insurance/list', { params })
      return response
    } catch (error) {
      console.error('获取险种列表失败:', error)
      throw error
    }
  },
  
  // 获取险种详情
  getInsuranceDetail: async (id) => {
    try {
      const response = await api.get(`/insurance/detail/${id}`)
      return response
    } catch (error) {
      console.error('获取险种详情失败:', error)
      throw error
    }
  },
  
  // 添加险种
  addInsurance: async (data) => {
    try {
      // 检查image是否为File对象
      const isFile = data.image instanceof File
      
      if (isFile) {
        // 如果是File对象，使用FormData提交
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('code', data.code)
        formData.append('category_id', data.category_id)
        formData.append('description', data.description)
        formData.append('status', data.status)
        formData.append('image', data.image)
        
        const response = await api.post('/insurance/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response
      } else {
        // 如果是URL字符串或其他类型，直接使用JSON格式提交
        const response = await api.post('/insurance/add', data)
        return response
      }
    } catch (error) {
      console.error('添加险种失败:', error)
      throw error
    }
  },
  
  // 更新险种
  updateInsurance: async (id, data) => {
    try {
      // 检查image是否为File对象
      const isFile = data.image instanceof File
      
      if (isFile) {
        // 如果是File对象，使用FormData提交
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('code', data.code)
        formData.append('category_id', data.category_id)
        formData.append('description', data.description)
        formData.append('status', data.status)
        formData.append('image', data.image)
        
        const response = await api.put(`/insurance/update/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response
      } else {
        // 如果是URL字符串或其他类型，直接使用JSON格式提交
        const response = await api.put(`/insurance/update/${id}`, data)
        return response
      }
    } catch (error) {
      console.error('更新险种失败:', error)
      throw error
    }
  },
  
  // 删除险种
  deleteInsurance: async (id) => {
    try {
      const response = await api.delete(`/insurance/delete/${id}`)
      return response
    } catch (error) {
      console.error('删除险种失败:', error)
      throw error
    }
  },
  
  // 批量删除险种
  batchDeleteInsurance: async (ids) => {
    try {
      const response = await api.delete('/insurance/batch-delete', { data: { ids } })
      return response
    } catch (error) {
      console.error('批量删除险种失败:', error)
      throw error
    }
  },
  
  // 获取险种分类
  getInsuranceCategories: async () => {
    try {
      const response = await api.get('/insurance/categories')
      return response
    } catch (error) {
      console.error('获取险种分类失败:', error)
      throw error
    }
  },
  // 获取险种分类列表（别名方法，保持兼容性）
  getInsuranceCategoryList: async () => {
    try {
      const response = await api.get('/insurance/categories')
      return response
    } catch (error) {
      console.error('获取险种分类列表失败:', error)
      throw error
    }
  },
  
  // 根据分类获取险种
  getInsuranceByCategory: async (typeId) => {
    try {
      const response = await api.get('/insurance/list', { params: { typeId } })
      return response
    } catch (error) {
      console.error('根据分类获取险种失败:', error)
      throw error
    }
  },
  
  // 新增险种分类
  addInsuranceCategory: async (name) => {
    try {
      const response = await api.post('/insurance/category/add', { name })
      return response
    } catch (error) {
      console.error('新增险种分类失败:', error)
      throw error
    }
  },
  
  // 更新险种分类
  updateInsuranceCategory: async (id, name) => {
    try {
      const response = await api.put(`/insurance/category/update/${id}`, { name })
      return response
    } catch (error) {
      console.error('更新险种分类失败:', error)
      throw error
    }
  },
  
  // 删除险种分类
  deleteInsuranceCategory: async (id) => {
    try {
      const response = await api.delete(`/insurance/category/delete/${id}`)
      return response
    } catch (error) {
      console.error('删除险种分类失败:', error)
      throw error
    }
  }
}

export default insuranceService