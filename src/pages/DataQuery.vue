<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-800">数据查询</h1>
          <p class="text-sm text-gray-500 mt-1">查询和统计业务数据</p>
        </div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 查询条件区域 -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <!-- 业务员 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">业务员</label>
            <select 
              v-model="filters.agentId" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">全部</option>
              <option v-for="agent in agentList" :key="agent.id" :value="agent.id">
                {{ agent.name }}
              </option>
            </select>
          </div>
          
          <!-- 险种 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">险种</label>
            <select 
              v-model="filters.insuranceId" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">全部</option>
              <option v-for="insurance in insuranceList" :key="insurance.id" :value="insurance.id">
                {{ insurance.name }}
              </option>
            </select>
          </div>
          
          <!-- 成交状态 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">成交状态</label>
            <select 
              v-model="filters.status" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">全部</option>
              <option value="1">已成交</option>
              <option value="2">进行中</option>
              <option value="3">已失败</option>
            </select>
          </div>
          
          <!-- 客户名称 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
            <input 
              type="text" 
              v-model="filters.customerName" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="请输入客户名称"
            >
          </div>
          
          <!-- 开始日期 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input 
              type="date" 
              v-model="filters.startDate" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="yyyy/mm/日"
            >
          </div>
          
          <!-- 结束日期 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input 
              type="date" 
              v-model="filters.endDate" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="yyyy/mm/日"
            >
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="mt-4 flex justify-end gap-3">
          <button 
            @click="resetFilters" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            重置
          </button>
          <button 
            @click="search" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            查询
          </button>
        </div>
      </div>
      
      <!-- 查询结果区域 -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <!-- 导出按钮 -->
        <div class="flex justify-end gap-3 mb-4">
          <button 
            @click="exportExcel" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <i class="fas fa-file-excel mr-1"></i>导出Excel
          </button>
          <button 
            @click="exportPDF" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <i class="fas fa-file-pdf mr-1"></i>导出PDF
          </button>
        </div>
        
        <!-- 结果表格 -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary">
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  代理人
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  险种
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in businessList" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getAgentName(item.agentId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getInsuranceName(item.insuranceId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.customer_name || item.insuredName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ¥{{ (item.actual_amount || item.amount).toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 py-1 text-xs rounded-full', statusClass(item.status)]">
                    {{ getStatusText(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(item.created_at || item.createTime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="viewDetail(item.id)" 
                    class="text-primary hover:text-primary-dark mr-3"
                    title="查看"
                  >
                    查看
                  </button>
                  <button 
                    @click="editItem(item)" 
                    class="text-secondary hover:text-secondary-dark mr-3"
                    title="编辑"
                  >
                    编辑
                  </button>
                  <button 
                    @click="deleteItem(item.id)" 
                    class="text-error hover:text-error-dark"
                    title="删除"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 空数据提示 -->
        <div v-if="businessList.length === 0" class="text-center py-12">
          <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">暂无符合条件的数据</p>
        </div>
        
        <!-- 分页 -->
        <div v-if="businessList.length > 0" class="mt-4 flex justify-between items-center">
          <div class="text-sm text-gray-500">
            显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条结果
          </div>
          <div class="flex items-center space-x-1">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-2 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <!-- 页码 -->
            <button 
              v-if="currentPage === 1" 
              class="px-3 py-1 border rounded-md text-sm font-medium bg-blue-100 text-blue-800"
            >
              1
            </button>
            <button 
              v-else 
              @click="goToPage(1)"
              class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              1
            </button>
            
            <span v-if="currentPage > 3" class="px-2 text-sm text-gray-500">...</span>
            
            <button 
              v-if="currentPage > 2" 
              @click="goToPage(currentPage - 1)"
              class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {{ currentPage - 1 }}
            </button>
            
            <button 
              v-if="currentPage > 1 && currentPage < totalPages" 
              class="px-3 py-1 border rounded-md text-sm font-medium bg-blue-100 text-blue-800"
            >
              {{ currentPage }}
            </button>
            
            <button 
              v-if="currentPage < totalPages - 1" 
              @click="goToPage(currentPage + 1)"
              class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {{ currentPage + 1 }}
            </button>
            
            <span v-if="currentPage < totalPages - 2" class="px-2 text-sm text-gray-500">...</span>
            
            <button 
              v-if="totalPages > 1" 
              :class="['px-3 py-1 border rounded-md text-sm font-medium', currentPage === totalPages ? 'bg-blue-100 text-blue-800' : 'text-gray-700 bg-white hover:bg-gray-50']"
              @click="goToPage(totalPages)"
            >
              {{ totalPages }}
            </button>
            
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-2 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import businessService from '../services/businessService'
import insuranceService from '../services/insuranceService'
import agentService from '../services/agentService'

// 获取toast实例
const toast = inject('toast')

// 路由实例
const router = useRouter()

// 数据列表
const businessList = ref([])

// 险种列表
const insuranceList = ref([])

// 代理人列表
const agentList = ref([])

// 筛选条件
const filters = ref({
  agentId: '',
  insuranceId: '',
  status: '',
  customerName: '',
  startDate: '',
  endDate: ''
})

// 分页信息
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

// 加载状态
const loading = ref(false)

// 初始化数据
onMounted(() => {
  loadData()
  loadInsuranceList()
  loadAgentList()
})

// 加载业务数据
const loadData = async () => {
  try {
    loading.value = true
    
    const params = {
      ...filters.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    const response = await businessService.getBusinessList(params)
    businessList.value = response.list || []
    total.value = response.total || 0
    totalPages.value = Math.ceil(total.value / pageSize.value)
  } catch (error) {
    console.error('加载业务数据失败:', error)
    toast.error('加载业务数据失败')
  } finally {
    loading.value = false
  }
}

// 加载险种列表
const loadInsuranceList = async () => {
  try {
    const response = await insuranceService.getInsuranceList()
    insuranceList.value = response.list || []
  } catch (error) {
    console.error('加载险种列表失败:', error)
  }
}

// 加载代理人列表
const loadAgentList = async () => {
  try {
    const response = await agentService.getAgentList()
    agentList.value = response.list || []
  } catch (error) {
    console.error('加载代理人列表失败:', error)
  }
}

// 查询数据
const search = () => {
  currentPage.value = 1
  loadData()
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    agentId: '',
    insuranceId: '',
    status: '',
    customerName: '',
    startDate: '',
    endDate: ''
  }
  currentPage.value = 1
  loadData()
}

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadData()
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadData()
  }
}

// 跳转到指定页面
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadData()
  }
}

// 导出Excel
const exportExcel = async () => {
  try {
    await businessService.exportBusinessList(filters.value)
    toast.success('Excel导出成功')
  } catch (error) {
    console.error('Excel导出失败:', error)
    toast.error('Excel导出失败')
  }
}

// 导出PDF
const exportPDF = async () => {
  try {
    await businessService.exportBusinessList(filters.value, 'pdf')
    toast.success('PDF导出成功')
  } catch (error) {
    console.error('PDF导出失败:', error)
    toast.error('PDF导出失败')
  }
}

// 查看详情
const viewDetail = (id) => {
  router.push(`/business/detail/${id}`)
}

// 编辑项目
const editItem = (item) => {
  // 这里可以打开编辑模态框或跳转到编辑页面
  console.log('编辑', item)
  toast.info('编辑功能尚未实现')
}

// 删除项目
const deleteItem = async (id) => {
  if (confirm('确定要删除该记录吗？')) {
    try {
      await businessService.deleteBusiness(id)
      toast.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }
}

// 获取险种名称
const getInsuranceName = (id) => {
  const insurance = insuranceList.value.find(item => item.id === id)
  return insurance ? insurance.name : ''
}

// 获取代理人名称
const getAgentName = (id) => {
  const agent = agentList.value.find(item => item.id === id)
  return agent ? agent.name : ''
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 状态样式
const statusClass = (status) => {
  const statusMap = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-red-100 text-red-800',
    'success': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800'
}

// 状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '已成交',
    2: '进行中',
    3: '已失败',
    'success': '已成交',
    'pending': '进行中',
    'failed': '已失败'
  }
  return statusMap[status] || '未知状态'
}
</script>