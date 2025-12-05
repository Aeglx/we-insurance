<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- 主要内容 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 查询条件区域 -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">时间范围</label>
            <select 
              v-model="queryParams.timeRange" 
              class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年</option>
            </select>
          </div>
          
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">出单员</label>
            <select 
              v-model="queryParams.underwriterId" 
              class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">全部</option>
              <option v-for="underwriter in underwriters" :key="underwriter.id" :value="underwriter.id">
                {{ underwriter.name }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">险种</label>
            <select 
              v-model="queryParams.insuranceTypeId" 
              class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">全部</option>
              <option value="1">个人意外险</option>
              <option value="2">团体意外险</option>
              <option value="3">学平险</option>
              <option value="4">建工险</option>
              <option value="5">燃气险</option>
              <option value="6">雇主险</option>
            </select>
          </div>
          
          <button 
            @click="handleSearch" 
            class="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            查询
          </button>
        </div>
      </div>
      
      <!-- 统计概览卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-md p-4">
          <div>
            <p class="text-sm text-gray-500">总询价数</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ statistics.inquiryCount }}</h3>
            <p class="text-xs text-green-600 mt-1">
              <i class="fas fa-arrow-up mr-1"></i>{{ statistics.inquiryGrowth }}% 较上期
            </p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4">
          <div>
            <p class="text-sm text-gray-500">总成交数</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ statistics.dealCount }}</h3>
            <p class="text-xs text-green-600 mt-1">
              <i class="fas fa-arrow-up mr-1"></i>{{ statistics.dealGrowth }}% 较上期
            </p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4">
          <div>
            <p class="text-sm text-gray-500">成交率</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ statistics.conversionRate }}%</h3>
            <p class="text-xs text-red-600 mt-1">
              <i class="fas fa-arrow-down mr-1"></i>{{ statistics.conversionRateGrowth }}% 较上期
            </p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4">
          <div>
            <p class="text-sm text-gray-500">总成交额</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">¥{{ formatCurrency(statistics.totalAmount) }}</h3>
            <p class="text-xs text-green-600 mt-1">
              <i class="fas fa-arrow-up mr-1"></i>{{ statistics.totalAmountGrowth }}% 较上期
            </p>
          </div>
        </div>
      </div>
      
      <!-- 按出单员统计 -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">按出单员统计</h3>
        <div class="h-64 relative">
          <canvas ref="underwriterChart"></canvas>
        </div>
      </div>
      
      <!-- 按险种统计 -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">按险种统计</h3>
        <div class="h-64 relative">
          <canvas ref="insuranceChart"></canvas>
        </div>
      </div>
      
      <!-- 时间趋势 -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-800">时间趋势</h3>
          <div class="flex gap-2">
            <button 
              v-for="time in timeTypes" 
              :key="time.value" 
              @click="timeTrendType = time.value" 
              :class="['px-3 py-1 text-xs rounded-md', timeTrendType === time.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700']"
            >
              {{ time.label }}
            </button>
          </div>
        </div>
        <div class="h-64 relative">
          <canvas ref="timeTrendChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import underwriterService from '../services/underwriterService'
import businessService from '../services/businessService'

// 查询参数
const queryParams = ref({
  timeRange: 'month',
  underwriterId: '',
  insuranceTypeId: ''
})

// 出单员数据
const underwriters = ref([])

// 统计数据
const statistics = ref({
  inquiryCount: 0,
  dealCount: 0,
  conversionRate: 0,
  totalAmount: 0,
  inquiryGrowth: 0,
  dealGrowth: 0,
  conversionRateGrowth: 0,
  totalAmountGrowth: 0
})

// 按出单员统计数据
const underwriterStatistics = ref([])

// 按险种统计数据
const insuranceStatistics = ref([])

// 时间趋势数据
const timeTrendData = ref({
  labels: [],
  inquiryData: [],
  dealData: [],
  conversionData: []
})

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await businessService.getBusinessStatistics({
      type: 'statistics'
    })
    
    // 更新统计数据
    statistics.value = {
      inquiryCount: response.inquiryCount || 0,
      dealCount: response.dealCount || 0,
      conversionRate: response.conversionRate || 0,
      totalAmount: response.totalAmount || 0,
      inquiryGrowth: response.inquiryGrowth || 0,
      dealGrowth: response.dealGrowth || 0,
      conversionRateGrowth: response.conversionRateGrowth || 0,
      totalAmountGrowth: response.totalAmountGrowth || 0
    }
    
    // 更新按出单员统计数据
    underwriterStatistics.value = response.underwriterStatistics || []
    
    // 更新按险种统计数据
    insuranceStatistics.value = response.insuranceStatistics || []
    
    // 更新时间趋势数据
    timeTrendData.value = response.timeTrendData || {
      labels: [],
      inquiryData: [],
      dealData: [],
      conversionData: []
    }
    
    // 重新初始化图表
    initUnderwriterChart()
    initInsuranceChart()
    initTimeTrendChart()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 时间趋势类型
const timeTrendType = ref('day')
const timeTypes = ref([
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
])

// 图表引用
const underwriterChart = ref(null)
const insuranceChart = ref(null)
const timeTrendChart = ref(null)

// 图表实例
let underwriterChartInstance = null
let insuranceChartInstance = null
let timeTrendChartInstance = null

// 格式化金额
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN').format(amount)
}

// 加载出单员数据
const loadUnderwriters = async () => {
  try {
    const response = await underwriterService.getUnderwriterList()
    underwriters.value = response.data || []
  } catch (error) {
    console.error('加载出单员数据失败:', error)
  }
}

// 处理查询
const handleSearch = () => {
  // 根据查询参数获取统计数据
  fetchStatistics()
}

// 在组件挂载时加载数据
onMounted(async () => {
  await loadUnderwriters()
  await fetchStatistics()
})

// 初始化按出单员统计图表
const initUnderwriterChart = () => {
  // 检查Canvas元素是否存在且有效
  if (!underwriterChart.value || !(underwriterChart.value instanceof HTMLCanvasElement)) {
    console.error('无效的Canvas元素:', underwriterChart.value)
    return
  }
  
  // 销毁现有图表
  if (underwriterChartInstance) {
    underwriterChartInstance.destroy()
  }
  
  // 使用从API获取的数据
  const labels = underwriterStatistics.value.map(item => item.name) || ['出单员A', '出单员B', '出单员C']
  const inquiryData = underwriterStatistics.value.map(item => item.inquiryCount) || [65, 58, 80]
  const dealData = underwriterStatistics.value.map(item => item.dealCount) || [28, 35, 42]
  
  try {
    const ctx = underwriterChart.value.getContext('2d')
    if (!ctx) {
      console.error('无法获取Canvas上下文')
      return
    }
    
    underwriterChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '询价数',
            data: inquiryData,
            backgroundColor: '#3b82f6',
            borderRadius: 4
          },
          {
            label: '成交数',
            data: dealData,
            backgroundColor: '#10b981',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            boxPadding: 6
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('初始化按出单员统计图表失败:', error)
  }
}

// 初始化按险种统计图表
const initInsuranceChart = () => {
  // 检查Canvas元素是否存在且有效
  if (!insuranceChart.value || !(insuranceChart.value instanceof HTMLCanvasElement)) {
    console.error('无效的Canvas元素:', insuranceChart.value)
    return
  }
  
  // 销毁现有图表
  if (insuranceChartInstance) {
    insuranceChartInstance.destroy()
  }
  
  // 使用从API获取的数据
  const labels = insuranceStatistics.value.map(item => item.name) || ['个人意外险', '团体意外险', '学平险', '建工险', '燃气险', '雇主险']
  const inquiryData = insuranceStatistics.value.map(item => item.inquiryCount) || [45, 40, 28, 22, 16, 12]
  const dealData = insuranceStatistics.value.map(item => item.dealCount) || [20, 20, 18, 10, 8, 8]
  
  try {
    const ctx = insuranceChart.value.getContext('2d')
    if (!ctx) {
      console.error('无法获取Canvas上下文')
      return
    }
    
    insuranceChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '询价数',
            data: inquiryData,
            backgroundColor: '#3b82f6',
            borderRadius: 4
          },
          {
            label: '成交数',
            data: dealData,
            backgroundColor: '#10b981',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            boxPadding: 6
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('初始化按险种统计图表失败:', error)
  }
}

// 初始化时间趋势图
const initTimeTrendChart = () => {
  // 检查Canvas元素是否存在且有效
  if (!timeTrendChart.value || !(timeTrendChart.value instanceof HTMLCanvasElement)) {
    console.error('无效的Canvas元素:', timeTrendChart.value)
    return
  }
  
  // 销毁现有图表
  if (timeTrendChartInstance) {
    timeTrendChartInstance.destroy()
  }
  
  // 使用从API获取的数据
  const labels = timeTrendData.value.labels || ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日', '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日', '25日', '26日', '27日', '28日', '29日', '30日']
  const inquiryData = timeTrendData.value.inquiryData || labels.map(() => Math.floor(Math.random() * 10) + 15)
  const dealData = timeTrendData.value.dealData || labels.map(() => Math.floor(Math.random() * 5) + 5)
  const conversionData = timeTrendData.value.conversionData || labels.map(() => Math.floor(Math.random() * 10) + 35)
  
  try {
    const ctx = timeTrendChart.value.getContext('2d')
    if (!ctx) {
      console.error('无法获取Canvas上下文')
      return
    }
    
    timeTrendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '询价数',
            data: inquiryData,
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '成交数',
            data: dealData,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '成交率(%)',
            data: conversionData,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            boxPadding: 6
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            title: {
              display: true,
              text: '数量'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: '成交率(%)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('初始化时间趋势图失败:', error)
  }
}

// 时间趋势类型变化时更新图表
watch(timeTrendType, () => {
  initTimeTrendChart()
})

// 组件挂载时初始化
onMounted(() => {
  initUnderwriterChart()
  initInsuranceChart()
  initTimeTrendChart()
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  if (underwriterChartInstance) {
    underwriterChartInstance.destroy()
  }
  if (insuranceChartInstance) {
    insuranceChartInstance.destroy()
  }
  if (timeTrendChartInstance) {
    timeTrendChartInstance.destroy()
  }
})
</script>