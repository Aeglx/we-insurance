// 业务记录服务
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
  },
  
  // 仪表盘相关服务
  
  // 获取仪表盘概览数据
  getDashboardOverview: async () => {
    try {
      const response = await api.get('/dashboard/overview')
      // 转换数据格式以匹配前端期望
      if (response && response.data) {
        return {
          ...response,
          data: {
            todayInquiryCount: response.data.today_inquiry?.value || 0,
            todayDealCount: response.data.today_deal?.value || 0,
            monthlyPerformance: response.data.month_performance?.value || 0,
            todayInquiryGrowth: response.data.today_inquiry?.growth || 0,
            todayDealGrowth: response.data.today_deal?.growth || 0,
            monthlyPerformanceGrowth: response.data.month_performance?.growth || 0
          }
        }
      }
      return response
    } catch (error) {
      console.error('获取仪表盘概览数据失败:', error)
      throw error
    }
  },
  
  // 获取险种分布数据
  getInsuranceTypeDistribution: async () => {
    try {
      const response = await api.get('/dashboard/insurance-type-dist')
      return response
    } catch (error) {
      console.error('获取险种分布数据失败:', error)
      throw error
    }
  },
  
  // 获取成交率统计数据
  getDealRateStatistics: async () => {
    try {
      const response = await api.get('/dashboard/deal-rate')
      // 转换数据格式以匹配前端期望
      if (response && response.data) {
        return {
          ...response,
          data: response.data.map(item => ({
            type: item.type, // 保留原始type属性
            name: item.type, // 添加name别名
            rate: item.rate, // 保留原始rate属性（百分比）
            dealRate: item.rate / 100, // 添加dealRate小数形式
            total_count: item.total_count, // 保留询价数
            deal_count: item.deal_count // 保留成交数
          }))
        }
      }
      return response
    } catch (error) {
      console.error('获取成交率统计数据失败:', error)
      throw error
    }
  },
  
  // 获取最近业务列表
  getRecentBusiness: async () => {
    try {
      const response = await api.get('/dashboard/recent-business')
      return response
    } catch (error) {
      console.error('获取最近业务列表失败:', error)
      throw error
    }
  },
  
  // 获取业务趋势数据
  getBusinessTrend: async (params = {}) => {
    try {
      // 将前端range参数转换为后端time_range参数
      const { range, ...otherParams } = params
      const apiParams = {
        ...otherParams,
        time_range: range === 'week' ? '7d' : range === 'month' ? '30d' : '90d' // 转换为后端期望的格式
      }
      const response = await api.get('/dashboard/trend', { params: apiParams })
      return response
    } catch (error) {
      console.error('获取业务趋势数据失败:', error)
      throw error
    }
  },

  getUnderwriterStat: async () => {
    try {
      const response = await api.get('/dashboard/underwriter-stat')
      if (response.status === 200) {
        return response.data
      } else {
        throw new Error('获取数据失败')
      }
    } catch (error) {
      console.error('获取按出单员统计数据失败:', error)
      throw error
    }
  }
}

export default businessService