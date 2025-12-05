import { defineStore } from 'pinia'
import agentService from '../services/agentService'

// 代理人Store
export const useAgentStore = defineStore('agent', {
  // 状态定义
  state: () => ({
    // 代理人列表
    agentList: [],
    // 代理人详情
    agentDetail: null,
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    // 搜索关键词
    searchKeyword: '',
    // 加载状态
    loading: false,
    // 详情加载状态
    detailLoading: false,
    // 错误信息
    error: null
  }),
  
  // Getters
  getters: {
    // 搜索后的代理人列表
    searchedAgentList: (state) => {
      if (!state.searchKeyword) {
        return state.agentList
      }
      
      return state.agentList.filter(agent => 
        agent.name.includes(state.searchKeyword) ||
        agent.code.includes(state.searchKeyword) ||
        agent.phone.includes(state.searchKeyword) ||
        agent.email.includes(state.searchKeyword)
      )
    },
    
    // 分页后的代理人列表
    paginatedAgentList: (state, getters) => {
      const startIndex = (state.pagination.currentPage - 1) * state.pagination.pageSize
      const endIndex = startIndex + state.pagination.pageSize
      return getters.searchedAgentList.slice(startIndex, endIndex)
    },
    
    // 总页数
    totalPages: (state, getters) => {
      return Math.ceil(getters.searchedAgentList.length / state.pagination.pageSize)
    },
    
    // 是否有上一页
    hasPrevPage: (state) => {
      return state.pagination.currentPage > 1
    },
    
    // 是否有下一页
    hasNextPage: (state, getters) => {
      return state.pagination.currentPage < getters.totalPages
    },
    
    // 代理人名称映射
    agentNameMap: (state) => {
      return state.agentList.reduce((map, agent) => {
        map[agent.id] = agent.name
        return map
      }, {})
    },
    
    // 代理人编号映射
    agentCodeMap: (state) => {
      return state.agentList.reduce((map, agent) => {
        map[agent.id] = agent.code
        return map
      }, {})
    }
  },
  
  // Actions
  actions: {
    // 获取代理人列表
    async getAgentList(params = {}) {
      try {
        this.loading = true
        this.error = null
        
        // 合并参数
        const requestParams = {
          ...params,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }
        
        const response = await agentService.getAgentList(requestParams)
        
        // 更新状态
        this.agentList = response.list || []
        this.pagination.total = response.total || 0
        this.pagination.totalPages = Math.ceil(response.total / this.pagination.pageSize)
        
        return response
      } catch (error) {
        this.error = error.message || '获取代理人列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取代理人详情
    async getAgentDetail(id) {
      try {
        this.detailLoading = true
        this.error = null
        
        const response = await agentService.getAgentDetail(id)
        
        // 更新状态
        this.agentDetail = response
        
        return response
      } catch (error) {
        this.error = error.message || '获取代理人详情失败'
        throw error
      } finally {
        this.detailLoading = false
      }
    },
    
    // 添加代理人
    async addAgent(data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await agentService.addAgent(data)
        
        // 更新列表
        await this.getAgentList()
        
        return response
      } catch (error) {
        this.error = error.message || '添加代理人失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新代理人
    async updateAgent(id, data) {
      try {
        this.loading = true
        this.error = null
        
        const response = await agentService.updateAgent(id, data)
        
        // 更新列表
        await this.getAgentList()
        
        // 更新详情
        if (this.agentDetail && this.agentDetail.id === id) {
          this.agentDetail = response
        }
        
        return response
      } catch (error) {
        this.error = error.message || '更新代理人失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除代理人
    async deleteAgent(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await agentService.deleteAgent(id)
        
        // 更新列表
        await this.getAgentList()
        
        // 清除详情
        if (this.agentDetail && this.agentDetail.id === id) {
          this.agentDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '删除代理人失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 批量删除代理人
    async batchDeleteAgent(ids) {
      try {
        this.loading = true
        this.error = null
        
        const response = await agentService.batchDeleteAgent(ids)
        
        // 更新列表
        await this.getAgentList()
        
        // 清除详情
        if (this.agentDetail && ids.includes(this.agentDetail.id)) {
          this.agentDetail = null
        }
        
        return response
      } catch (error) {
        this.error = error.message || '批量删除代理人失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 搜索代理人
    async searchAgent(keyword) {
      try {
        this.loading = true
        this.error = null
        
        // 更新搜索关键词
        this.searchKeyword = keyword
        
        // 如果关键词为空，获取完整列表
        if (!keyword) {
          await this.getAgentList()
          return
        }
        
        const response = await agentService.searchAgent(keyword)
        
        // 更新状态
        this.agentList = response || []
        this.pagination.total = this.agentList.length
        this.pagination.totalPages = Math.ceil(this.agentList.length / this.pagination.pageSize)
        
        return response
      } catch (error) {
        this.error = error.message || '搜索代理人失败'
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
    clearAgentDetail() {
      this.agentDetail = null
    },
    
    // 清除错误信息
    clearError() {
      this.error = null
    }
  }
})
