import { defineStore } from 'pinia'
import insuranceService from '../services/insuranceService'

// 险种Store
export const useInsuranceStore = defineStore('insurance', {
  // 状态定义
  state: () => ({
    // 险种列表
    insuranceList: [],
    // 险种详情
    insuranceDetail: null,
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    // 搜索关键词
    searchKeyword: '',
    // 险种分类
    categories: [],
    // 加载状态
    loading: false,
    // 详情加载状态
    detailLoading: false,
    // 分类加载状态
    categoriesLoading: false,
    // 错误信息
    error: null
  }),
  
  // Getters
  getters: {
    // 搜索后的险种列表
    searchedInsuranceList: (state) => {
      if (!state.searchKeyword) {
        return state.insuranceList
      }
      
      return state.insuranceList.filter(insurance => 
        insurance.name.includes(state.searchKeyword) ||
        insurance.code.includes(state.searchKeyword) ||
        insurance.description.includes(state.searchKeyword)
      )
    },
    
    // 分页后的险种列表
    paginatedInsuranceList: (state, getters) => {
      const startIndex = (state.pagination.currentPage - 1) * state.pagination.pageSize
      const endIndex = startIndex + state.pagination.pageSize
      return getters.searchedInsuranceList.slice(startIndex, endIndex)
    },
    
    // 总页数
    totalPages: (state, getters) => {
      return Math.ceil(getters.searchedInsuranceList.length / state.pagination.pageSize)
    },
    
    // 是否有上一页
    hasPrevPage: (state) => {
      return state.pagination.currentPage > 1
    },
    
    // 是否有下一页
    hasNextPage: (state, getters) => {
      return state.pagination.currentPage < getters.totalPages
    },
    
    // 险种名称映射
    insuranceNameMap: (state) => {
      return state.insuranceList.reduce((map, insurance) => {
        map[insurance.id] = insurance.name
        return map
      }, {})
    },
    
    // 险种代码映射
    insuranceCodeMap: (state) => {
      return state.insuranceList.reduce((map, insurance) => {
        map[insurance.id] = insurance.code
        return map
      }, {})
    },
    
    // 按分类分组的险种
    insuranceByCategory: (state) => {
      return state.categories.reduce((map, category) => {
        map[category.id] = state.insuranceList.filter(insurance => insurance.categoryId === category.id)
        return map
      }, {})
    }
  },
  
  // Actions
  actions: {
    // 获取险种列表
    async getInsuranceList(params = {}) {
      try {
        this.loading = true
        this.error = null
        
        // 合并参数
        const requestParams = {
          ...params,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }
        
        const response = await insuranceService.getInsuranceList(requestParams)
        
        // 更新状态
        this.insuranceList = response.list || []
        this.pagination.total = response.total || 0
        this.pagination.totalPages = Math.ceil(response.total / this.pagination.pageSize)
        
        return response
      } catch (error) {
        this.error = error.message || '获取险种列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取险种详情
    async getInsuranceDetail(id) {
      try {
        this.detailLoading = true
        this.error = null
        
        const response = await insuranceService.getInsuranceDetail(id)
        
        // 更新状态
        this.insuranceDetail = response
        
        return response
      } catch (error) {
        this.error = error.message || '获取险种详情失败'
        throw error
      } finally {
        this.detailLoading = false
      }
    },
    
    // 添加险种
    async addInsurance(data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.addInsurance(data)
        
        // 更新列表
        await this.getInsuranceList()
        
        return response
      } catch (error) {
        this.error = error.message || '添加险种失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新险种
    async updateInsurance(id, data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.updateInsurance(id, data)
        
        // 更新列表
        await this.getInsuranceList()
        
        // 更新详情
        if (this.insuranceDetail && this.insuranceDetail.id === id) {
          this.insuranceDetail = response
        }
        
        return response
      } catch (error) {
        this.error = error.message || '更新险种失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除险种
    async deleteInsurance(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.deleteInsurance(id)
        
        // 更新列表
        await this.getInsuranceList()
        
        // 清除详情
        if (this.insuranceDetail && this.insuranceDetail.id === id) {
          this.insuranceDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '删除险种失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 批量删除险种
    async batchDeleteInsurance(ids) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.batchDeleteInsurance(ids)
        
        // 更新列表
        await this.getInsuranceList()
        
        // 清除详情
        if (this.insuranceDetail && ids.includes(this.insuranceDetail.id)) {
          this.insuranceDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '批量删除险种失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取险种分类
    async getInsuranceCategories() {
      try {
        this.categoriesLoading = true
        this.error = null
        
        const response = await insuranceService.getInsuranceCategories()
        
        // 更新状态
        this.categories = response || []
        
        return response
      } catch (error) {
        this.error = error.message || '获取险种分类失败'
        throw error
      } finally {
        this.categoriesLoading = false
      }
    },
    
    // 搜索险种
    async searchInsurance(keyword) {
      try {
        this.loading = true
        this.error = null
        
        // 更新搜索关键词
        this.searchKeyword = keyword
        
        // 如果关键词为空，获取完整列表
        if (!keyword) {
          await this.getInsuranceList()
          return
        }
        
        // 这里假设insuranceService有搜索方法，如果没有，可以在前端过滤
        // const response = await insuranceService.searchInsurance(keyword)
        
        // 更新列表
        await this.getInsuranceList()
        
        return this.searchedInsuranceList
      } catch (error) {
        this.error = error.message || '搜索险种失败'
        throw error
      } finally {
        this.loading = false
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
    
    // 清除搜索关键词
    clearSearchKeyword() {
      this.searchKeyword = ''
    },
    
    // 清除详情
    clearInsuranceDetail() {
      this.insuranceDetail = null
    },
    
    // 清除错误信息
    clearError() {
      this.error = null
    }
  }
})
