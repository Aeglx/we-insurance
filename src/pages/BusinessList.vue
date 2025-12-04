<template>
  <div class="business-list-page">
    <!-- 页面标题 -->
    <div class="page-header mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">业务列表</h1>
          <p class="text-gray-500 mt-1">管理和查看所有业务记录</p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" @click="refreshList">
            <i class="fas fa-sync-alt mr-2"></i>
            刷新列表
          </button>
          <button class="btn-primary" @click="router.push('/business/register')">
            <i class="fas fa-plus mr-2"></i>
            新增业务
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选搜索区域 -->
    <div class="bg-white rounded-lg shadow p-6 card-shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">保单号/投保人</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <i class="fas fa-search"></i>
            </span>
            <input
              v-model="searchParams.keyword"
              type="text"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md input-focus"
              placeholder="请输入保单号或投保人"
              @input="handleSearch"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">险种</label>
          <select
            v-model="searchParams.insuranceTypeId"
            class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
            @change="handleSearch"
          >
            <option value="">全部险种</option>
            <option v-for="insurance in insuranceTypes" :key="insurance.id" :value="insurance.id">
              {{ insurance.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">代理人</label>
          <select
            v-model="searchParams.agentId"
            class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
            @change="handleSearch"
          >
            <option value="">全部代理人</option>
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">
              {{ agent.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">登记日期范围</label>
          <div class="flex space-x-2">
            <input
              v-model="searchParams.startDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
              @change="handleSearch"
            />
            <span class="flex items-center text-gray-500">至</span>
            <input
              v-model="searchParams.endDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
              @change="handleSearch"
            />
          </div>
        </div>
        
        <div class="flex items-end">
          <button class="btn-primary" @click="handleSearch">
            <i class="fas fa-filter mr-2"></i>
            筛选
          </button>
        </div>
        
        <div class="flex items-end ml-auto">
          <button class="btn-secondary" @click="resetFilter">
            <i class="fas fa-times mr-2"></i>
            重置筛选
          </button>
        </div>
      </div>
    </div>

    <!-- 业务列表 -->
    <div class="bg-white rounded-lg shadow p-6 card-shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  v-model="selectAll"
                  @change="handleSelectAll"
                />
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序号</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保单号</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">险种名称</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投保人</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保额</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保费</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代理人</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登记时间</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(business, index) in businessList" :key="business.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  v-model="selectedIds"
                  :value="business.id"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ business.policyNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ business.insuranceName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ business.insuredName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(business.amountInsured) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(business.premium) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ business.agentName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(business.registrationDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary hover:text-primary-dark mr-3" @click="viewDetail(business.id)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="text-danger hover:text-danger-dark" @click="deleteBusiness(business.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="10" class="px-6 py-10 text-center">
                <div class="flex justify-center items-center">
                  <i class="fas fa-spinner fa-spin text-primary text-xl mr-2"></i>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="businessList.length === 0">
              <td colspan="10" class="px-6 py-10 text-center text-gray-500">
                <div class="flex justify-center items-center flex-col">
                  <i class="fas fa-search text-4xl mb-3 opacity-20"></i>
                  <span>暂无业务记录</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-gray-500">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
        </div>
        <div class="flex space-x-2">
          <button
            class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            v-for="page in pageCount"
            :key="page"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm"
            :class="{
              'bg-primary text-white': currentPage === page,
              'text-gray-700 hover:bg-gray-50': currentPage !== page
            }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button
            class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            :disabled="currentPage === pageCount"
            @click="changePage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import businessService from '../services/businessService'
import agentService from '../services/agentService'
import insuranceService from '../services/insuranceService'

const router = useRouter()
const loading = ref(false)
const businessList = ref([])
const agents = ref([])
const insuranceTypes = ref([])
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索参数
const searchParams = ref({
  keyword: '',
  insuranceTypeId: '',
  agentId: '',
  startDate: '',
  endDate: ''
})

// 全选
const selectAll = computed({
  get() {
    return businessList.value.length > 0 && selectedIds.value.length === businessList.value.length
  },
  set(value) {
    selectedIds.value = value ? businessList.value.map(item => item.id) : []
  }
})

// 总页数
const pageCount = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

// 初始化数据
const initData = async () => {
  await Promise.all([
    loadAgents(),
    loadInsuranceTypes()
  ])
  await loadBusinessList()
}

// 加载代理人数据
const loadAgents = async () => {
  try {
    console.log('开始加载代理人数据')
    const response = await agentService.getAgentList()
    console.log('代理人数据响应:', response)
    if (response.code === 200) {
      console.log('代理人数据:', response.data)
      agents.value = response.data
      console.log('代理人数据已更新:', agents.value)
    }
  } catch (error) {
    console.error('加载代理人数据失败:', error)
  }
}

// 加载险种数据
const loadInsuranceTypes = async () => {
  try {
    console.log('开始加载险种数据')
    const response = await insuranceService.getInsuranceList()
    console.log('险种数据响应:', response)
    if (response.code === 200) {
      console.log('险种数据:', response.data)
      insuranceTypes.value = response.data
      console.log('险种数据已更新:', insuranceTypes.value)
    }
  } catch (error) {
    console.error('加载险种数据失败:', error)
  }
}

// 加载业务列表
const loadBusinessList = async () => {
  try {
    loading.value = true
    const params = {
      ...searchParams.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const response = await businessService.getBusinessList(params)
    if (response.code === 200) {
      businessList.value = response.data.records
      total.value = response.data.total
      selectedIds.value = []
    }
  } catch (error) {
    console.error('加载业务列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadBusinessList()
}

// 刷新列表
const refreshList = () => {
  loadBusinessList()
}

// 重置筛选
const resetFilter = () => {
  searchParams.value = {
    keyword: '',
    insuranceTypeId: '',
    agentId: '',
    startDate: '',
    endDate: ''
  }
  currentPage.value = 1
  loadBusinessList()
}

// 全选处理
const handleSelectAll = () => {
  // 由computed属性自动处理
}

// 改变页码
const changePage = (page) => {
  if (page >= 1 && page <= pageCount.value) {
    currentPage.value = page
    loadBusinessList()
  }
}

// 查看详情
const viewDetail = (id) => {
  router.push(`/business/detail/${id}`)
}

// 编辑业务
const editBusiness = (id) => {
  router.push(`/business/edit/${id}`)
}

// 删除业务
const deleteBusiness = (id) => {
  if (confirm('确定要删除这条业务记录吗？')) {
    handleDelete(id)
  }
}

// 处理删除
const handleDelete = async (id) => {
  try {
    const response = await businessService.deleteBusiness(id)
    if (response.code === 200) {
      showToast('删除成功', 'success')
      loadBusinessList()
    }
  } catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败', 'error')
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 格式化金额
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(amount)
}

// Toast提示函数
const showToast = (message, type = 'info') => {
  // 创建toast元素
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0 opacity-100 ${getToastClass(type)}`
  toast.innerHTML = `
    <div class="flex items-center">
      <i class="${getToastIcon(type)} mr-2"></i>
      <span>${message}</span>
    </div>
  `
  
  // 添加到页面
  document.body.appendChild(toast)
  
  // 3秒后移除
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0')
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// 获取Toast样式类
const getToastClass = (type) => {
  const classes = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-info text-white'
  }
  return classes[type] || classes.info
}

// 获取Toast图标
const getToastIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type] || icons.info
}

// 初始化
onMounted(() => {
  initData()
})
</script>