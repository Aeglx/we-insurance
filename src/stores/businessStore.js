import { defineStore } from 'pinia'
import businessService from '../services/businessService'

// 业务记录Store
export const useBusinessStore = defineStore('business', {
  // 状态定义
  state: () => ({
    // 业务记录列表
    businessList: [],
    // 业务记录详情
    businessDetail: null,
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    // 筛选条件
    filters: {
      policyNo: '',
      insuredName: '',
      insuranceId: '',
      agentId: '',
      startDate: '',
      endDate: '',
      status: ''
    },
    // 加载状态
    loading: false,
    // 详情加载状态
    detailLoading: false,
    // 统计数据
    statistics: {
      todayCount: 0,
      thisWeekCount: 0,
      thisMonthCount: 0,
      totalAmount: 0,
      trendData: [],
      insuranceDistribution: []
    },
    // 错误信息
    error: null
  }),
  
  // Getters
  getters: {
    // 过滤后的业务记录列表
    filteredBusinessList: (state) => {
      let list = [...state.businessList]
      
      // 按保单号筛选
      if (state.filters.policyNo) {
        list = list.filter(item => item.policyNo.includes(state.filters.policyNo))
      }
      
      // 按投保人筛选
      if (state.filters.insuredName) {
        list = list.filter(item => item.insuredName.includes(state.filters.insuredName))
      }
      
      // 按险种筛选
      if (state.filters.insuranceId) {
        list = list.filter(item => item.insuranceId === state.filters.insuranceId)
      }
      
      // 按代理人筛选
      if (state.filters.agentId) {
        list = list.filter(item => item.agentId === state.filters.agentId)
      }
      
      // 按日期范围筛选
      if (state.filters.startDate) {
        const startDate = new Date(state.filters.startDate)
        list = list.filter(item => new Date(item.createTime) >= startDate)
      }
      
      if (state.filters.endDate) {
        const endDate = new Date(state.filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        list = list.filter(item => new Date(item.createTime) <= endDate)
      }
      
      // 按状态筛选
      if (state.filters.status) {
        list = list.filter(item => item.status === state.filters.status)
      }
      
      return list
    },
    
    // 分页后的业务记录列表
    paginatedBusinessList: (state, getters) => {
      const startIndex = (state.pagination.currentPage - 1) * state.pagination.pageSize
      const endIndex = startIndex + state.pagination.pageSize
      return getters.filteredBusinessList.slice(startIndex, endIndex)
    },
    
    // 总页数
    totalPages: (state, getters) => {
      return Math.ceil(getters.filteredBusinessList.length / state.pagination.pageSize)
    },
    
    // 是否有上一页
    hasPrevPage: (state) => {
      return state.pagination.currentPage > 1
    },
    
    // 是否有下一页
    hasNextPage: (state, getters) => {
      return state.pagination.currentPage < getters.totalPages
    }
  },
  
  // Actions
  actions: {
    // 获取业务记录列表
    async getBusinessList(params = {}) {
      try {
        this.loading = true
        this.error = null
        
        // 合并参数
        const requestParams = {
          ...params,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          ...this.filters
        }
        
        const response = await businessService.getBusinessList(requestParams)
        
        // 更新状态
        this.businessList = response.list || []
        this.pagination.total = response.total || 0
        this.pagination.totalPages = Math.ceil(response.total / this.pagination.pageSize)
        
        return response
      } catch (error) {
        this.error = error.message || '获取业务记录列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取业务记录详情
    async getBusinessDetail(id) {
      try {
        this.detailLoading = true
        this.error = null
        
        const response = await businessService.getBusinessDetail(id)
        
        // 更新状态
        this.businessDetail = response
        
        return response
      } catch (error) {
        this.error = error.message || '获取业务记录详情失败'
        throw error
      } finally {
        this.detailLoading = false
      }
    },
    
    // 添加业务记录
    async addBusiness(data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await businessService.addBusiness(data)
        
        // 更新列表
        await this.getBusinessList()
        
        return response
      } catch (error) {
        this.error = error.message || '添加业务记录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新业务记录
    async updateBusiness(id, data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await businessService.updateBusiness(id, data)
        
        // 更新列表
        await this.getBusinessList()
        
        // 更新详情
        if (this.businessDetail && this.businessDetail.id === id) {
          this.businessDetail = response
        }
        
        return response
      } catch (error) {
        this.error = error.message || '更新业务记录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除业务记录
    async deleteBusiness(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await businessService.deleteBusiness(id)
        
        // 更新列表
        await this.getBusinessList()
        
        // 清除详情
        if (this.businessDetail && this.businessDetail.id === id) {
          this.businessDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '删除业务记录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 批量删除业务记录
    async batchDeleteBusiness(ids) {
      try {
        this.loading = true
        this.error = null
        
        const response = await businessService.batchDeleteBusiness(ids)
        
        // 更新列表
        await this.getBusinessList()
        
        // 清除详情
        if (this.businessDetail && ids.includes(this.businessDetail.id)) {
          this.businessDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '批量删除业务记录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取业务统计数据
    async getBusinessStatistics(params = {}) {
      try {
        this.loading = true
        this.error = null
        
        const response = await businessService.getBusinessStatistics(params)
        
        // 更新统计数据
        this.statistics = response
        
        return response
      } catch (error) {
        this.error = error.message || '获取业务统计数据失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 设置筛选条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },
    
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        policyNo: '',
        insuredName: '',
        insuranceId: '',
        agentId: '',
        startDate: '',
        endDate: '',
        status: ''
      }
    },
    
    // 设置分页
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },
    
    // 设置当前页码
    setCurrentPage(page) {
      this.pagination.currentPage = page
    },
    
    // 设置每页条数
    setPageSize(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
    },
    
    // 清除详情
    clearBusinessDetail() {
      this.businessDetail = null
    },
    
    // 清除错误信息
    clearError() {
      this.error = null
    }
  }
})
