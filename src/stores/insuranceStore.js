import { defineStore } from 'pinia'
import insuranceService from '../services/insuranceService'

// 产品Store
export const useInsuranceStore = defineStore('insurance', {
  // 状态定义
  state: () => ({
    // 产品列表
    productList: [],
    // 产品详情
    productDetail: null,
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    // 搜索关键词
    searchKeyword: '',
    // 产品分类
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
    // 搜索后的产品列表
    searchedProductList: (state) => {
      if (!state.searchKeyword) {
        return state.insuranceList
      }
      
      return state.productList.filter(product => 
        product.name.includes(state.searchKeyword) ||
        product.code.includes(state.searchKeyword) ||
        product.description.includes(state.searchKeyword)
      )
    },
    
    // 分页后的产品列表
    paginatedProductList: (state, getters) => {
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
    
    // 产品名称映射
    productNameMap: (state) => {
      return state.productList.reduce((map, product) => {
        map[product.id] = product.name
        return map
      }, {})
    },
    
    // 产品代码映射
    productCodeMap: (state) => {
      return state.productList.reduce((map, product) => {
        map[product.id] = product.code
        return map
      }, {})
    },
    
    // 按分类分组的产品
    productsByCategory: (state) => {
      return state.categories.reduce((map, category) => {
        map[category.id] = state.productList.filter(product => product.categoryId === category.id)
        return map
      }, {})
    }
  },
  
  // Actions
  actions: {
    // 获取产品列表
    async getProductList(params = {}) {
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
        this.productList = response.list || []
        this.pagination.total = response.total || 0
        this.pagination.totalPages = Math.ceil(response.total / this.pagination.pageSize)
        
        return response
      } catch (error) {
        this.error = error.message || '获取产品列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取产品详情
    async getProductDetail(id) {
      try {
        this.detailLoading = true
        this.error = null
        
        const response = await insuranceService.getInsuranceDetail(id)
        
        // 更新状态
        this.productDetail = response
        
        return response
      } catch (error) {
        this.error = error.message || '获取产品详情失败'
        throw error
      } finally {
        this.detailLoading = false
      }
    },
    
    // 添加产品
    async addProduct(data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.addInsurance(data)
        
        // 更新列表
        await this.getProductList()
        
        return response
      } catch (error) {
        this.error = error.message || '添加产品失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新产品
    async updateProduct(id, data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.updateInsurance(id, data)
        
        // 更新列表
        await this.getProductList()
        
        // 更新详情
        if (this.productDetail && this.productDetail.id === id) {
          this.productDetail = response
        }
        
        return response
      } catch (error) {
        this.error = error.message || '更新产品失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除产品
    async deleteProduct(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.deleteInsurance(id)
        
        // 更新列表
        await this.getProductList()
        
        // 清除详情
        if (this.productDetail && this.productDetail.id === id) {
          this.productDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '删除产品失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 批量删除产品
    async batchDeleteProduct(ids) {
      try {
        this.loading = true
        this.error = null
        
        const response = await insuranceService.batchDeleteInsurance(ids)
        
        // 更新列表
        await this.getProductList()
        
        // 清除详情
        if (this.productDetail && ids.includes(this.productDetail.id)) {
          this.productDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '批量删除产品失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取产品分类
    async getProductCategories() {
      try {
        this.categoriesLoading = true
        this.error = null
        
        const response = await insuranceService.getInsuranceCategories()
        
        // 更新状态
        if (response.code === 200) {
          this.categories = response.data || []
        }
        
        return response
      } catch (error) {
        this.error = error.message || '获取产品分类失败'
        throw error
      } finally {
        this.categoriesLoading = false
      }
    },
    
    // 搜索产品
    async searchProduct(keyword) {
      try {
        this.loading = true
        this.error = null
        
        // 更新搜索关键词
        this.searchKeyword = keyword
        
        // 如果关键词为空，获取完整列表
        if (!keyword) {
          await this.getProductList()
          return
        }
        
        // 这里假设insuranceService有搜索方法，如果没有，可以在前端过滤
        // const response = await insuranceService.searchInsurance(keyword)
        
        // 更新列表
        await this.getProductList()
        
        return this.searchedProductList
      } catch (error) {
        this.error = error.message || '搜索产品失败'
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
    clearProductDetail() {
      this.productDetail = null
    },
    
    // 清除错误信息
    clearError() {
      this.error = null
    }
  }
})
