<template>
  <div class="bg-gray-50 min-h-screen text-sm">
    
    <!-- 主要内容 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 查询条件区域 -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 代理人 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">代理人</label>
            <el-autocomplete
              v-model="searchAgent"
              :fetch-suggestions="querySearchAgent"
              @select="onAgentSelect"
              placeholder="输入代理人姓名搜索"
              clearable
              class="w-full"
              value-key="name"
            >
              <template #default="{ item }">
                <div class="flex justify-between">
                  <span>{{ item.name }}</span>
                  <span class="text-gray-400 text-xs">{{ item.department || '无部门' }}</span>
                </div>
              </template>
            </el-autocomplete>
          </div>
          
          <!-- 出单员 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">出单员</label>
            <el-select
              v-model="filters.underwriterId"
              placeholder="请选择出单员"
              class="w-full"
              filterable
            >
              <el-option
                v-for="underwriter in underwriterList"
                :key="underwriter.id"
                :label="underwriter.name"
                :value="underwriter.id"
              ></el-option>
            </el-select>
          </div>
          
          <!-- 险种分类 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">险种分类</label>
            <select 
              v-model="filters.insuranceTypeId" 
              class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="">全部</option>
              <option v-for="category in insuranceCategoryList" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <!-- 产品种类 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">产品种类</label>
            <select 
              v-model="filters.specificInsuranceId" 
              class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="">全部</option>
              <option v-for="insurance in insuranceList" :key="insurance.id" :value="insurance.id">
                {{ insurance.name }}
              </option>
            </select>
          </div>
          
          <!-- 客户名称 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">客户名称</label>
            <input 
              type="text" 
              v-model="filters.customerName" 
              class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="请输入客户名称"
            >
          </div>
          
          <!-- 询价金额 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">询价金额</label>
            <div class="flex gap-1">
              <input 
                type="number" 
                v-model="filters.minAmount" 
                class="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="最小值"
                min="0"
                step="0.01"
              >
              <input 
                type="number" 
                v-model="filters.maxAmount" 
                class="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="最大值"
                min="0"
                step="0.01"
              >
            </div>
          </div>
          
          <!-- 成交状态 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">成交状态</label>
            <select 
              v-model="filters.dealStatus" 
              class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="">全部</option>
              <option value="pending">跟进中</option>
              <option value="success">已成交</option>
              <option value="failed">已失效</option>
            </select>
          </div>
          
          <!-- 开始日期 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">开始日期</label>
            <input 
              type="date" 
              v-model="filters.startDate" 
              class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="yyyy/mm/日"
            >
          </div>
          
          <!-- 结束日期 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">结束日期</label>
            <input 
              type="date" 
              v-model="filters.endDate" 
              class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="yyyy/mm/日"
            >
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="mt-3 flex justify-end gap-2">
          <button 
            @click="resetFilters" 
            class="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            重置
          </button>
          <button 
            @click="search" 
            class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
          >
            查询
          </button>
        </div>
      </div>
      
      <!-- 查询结果区域 -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <!-- 导出按钮 -->
        <div class="flex justify-end gap-2 mb-4">
          <button 
            @click="exportExcel" 
            class="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            <i class="fas fa-file-excel mr-1"></i>导出Excel
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
                  出单员
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  险种分类
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  产品种类
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户名称
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  询价金额
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成交状态
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登记日期
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  跟进备注
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
                  {{ item.agentName || getAgentName(item.agentId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.underwriterName || getUnderwriterName(item.underwriterId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getInsuranceCategoryName(item.insuranceTypeId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.insuranceName || getSpecificProductTypeName(item.insuranceId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.insuredName || item.customer_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ¥{{ item.inquiryAmount ? item.inquiryAmount.toFixed(2) : item.premium ? item.premium.toFixed(2) : '0.00' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 py-1 text-xs rounded-full', dealStatusClass(item.dealStatus || item.status)]">
                    {{ item.dealStatus || getStatusText(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(item.registrationDate || item.createTime || item.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title="{{ item.remark || item.remarks || item.followUpRemark }}">
                  {{ item.remark || item.remarks || item.followUpRemark || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="viewDetail(item.id)" 
                    class="text-primary hover:text-primary-dark mr-3 text-sm"
                    title="查看"
                  >
                    查看
                  </button>
                  <button 
                    @click="deleteItem(item.id)" 
                    class="text-error hover:text-error-dark text-sm"
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
import { ElMessageBox } from 'element-plus'
import businessService from '../services/businessService'
import insuranceService from '../services/insuranceService'
import agentService from '../services/agentService'
import underwriterService from '../services/underwriterService'

// 获取toast实例
const toast = inject('toast')

// 路由实例
const router = useRouter()

// 数据列表
const businessList = ref([])

// 险种列表
const insuranceList = ref([])

// 险种分类列表
const insuranceCategoryList = ref([])

// 代理人列表
const agentList = ref([])

// 出单员列表
const underwriterList = ref([])

// 筛选条件
const filters = ref({
  agentId: '',
  underwriterId: '',
  insuranceTypeId: '',
  specificInsuranceId: '',
  customerName: '',
  minAmount: '',
  maxAmount: '',
  dealStatus: '',
  startDate: '',
  endDate: ''
})

// 代理人搜索相关
const searchAgent = ref('')

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
  loadInsuranceCategoryList()
  loadAgentList()
  loadUnderwriterList()
})

// 代理人搜索建议
const querySearchAgent = (queryString, cb) => {
  if (!queryString) {
    cb([])
    return
  }
  
  // 从agentList中过滤匹配的代理人
  const results = agentList.value.filter(agent => {
    return agent.name.toLowerCase().includes(queryString.toLowerCase())
  })
  
  // 模拟异步请求延迟
  setTimeout(() => {
    cb(results)
  }, 200)
}

// 选择代理人
const onAgentSelect = (agent) => {
  filters.value.agentId = agent.id
}

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
    businessList.value = response.data?.records || []
    total.value = response.data?.total || 0
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
    insuranceList.value = response.data || []
  } catch (error) {
    console.error('加载险种列表失败:', error)
  }
}

// 加载险种分类列表
const loadInsuranceCategoryList = async () => {
  try {
    const response = await insuranceService.getInsuranceCategoryList()
    if (response.code === 200) {
      insuranceCategoryList.value = response.data || []
    }
  } catch (error) {
    console.error('加载险种分类列表失败:', error)
  }
}

// 加载代理人列表
const loadAgentList = async () => {
  try {
    const response = await agentService.getAgentList()
    agentList.value = response.data || []
  } catch (error) {
    console.error('加载代理人列表失败:', error)
  }
}

// 加载出单员列表
const loadUnderwriterList = async () => {
  try {
    const response = await underwriterService.getUnderwriterList()
    underwriterList.value = response.data || []
  } catch (error) {
    console.error('加载出单员列表失败:', error)
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
    underwriterId: '',
    insuranceTypeId: '',
    specificInsuranceId: '',
    customerName: '',
    minAmount: '',
    maxAmount: '',
    dealStatus: '',
    startDate: '',
    endDate: ''
  }
  searchAgent.value = ''
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
  ElMessageBox.confirm('确定要删除该记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await businessService.deleteBusiness(id)
      toast.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 获取产品种类名称
const getProductTypeName = (id) => {
  const insurance = insuranceList.value.find(item => item.id === id)
  return insurance ? insurance.name : ''
}

// 获取险种分类名称
const getInsuranceCategoryName = (id) => {
  const category = insuranceCategoryList.value.find(item => item.id === id)
  return category ? category.name : ''
}

// 获取产品种类名称
const getSpecificProductTypeName = (id) => {
  const insurance = insuranceList.value.find(item => item.id === id)
  return insurance ? insurance.name : ''
}

// 获取代理人名称
const getAgentName = (id) => {
  const agent = agentList.value.find(item => item.id === id)
  return agent ? agent.name : ''
}

// 获取出单员名称
const getUnderwriterName = (id) => {
  const underwriter = underwriterList.value.find(item => item.id === id)
  return underwriter ? underwriter.name : ''
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

// 成交状态样式
const dealStatusClass = (status) => {
  const statusMap = {
    '跟进中': 'bg-blue-100 text-blue-800',
    '已成交': 'bg-green-100 text-green-800',
    '已失效': 'bg-red-100 text-red-800'
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