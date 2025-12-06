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
              <option v-for="category in insuranceCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
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
      
      <!-- 按险种分类统计 -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">按险种分类统计</h3>
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
import insuranceService from '../services/insuranceService'

// 查询参数
const queryParams = ref({
  timeRange: 'month',
  underwriterId: '',
  insuranceTypeId: ''
})

// 出单员数据
const underwriters = ref([])

// 险种分类数据
const insuranceCategories = ref([])

// 统计数据
const statistics = ref({
  inquiryCount: 156,
  dealCount: 68,
  conversionRate: 43.6,
  totalAmount: 458200,
  inquiryGrowth: 12.5,
  dealGrowth: 8.3,
  conversionRateGrowth: -2.1,
  totalAmountGrowth: 15.2
})

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

// 加载险种分类数据
const loadInsuranceCategories = async () => {
  try {
    const response = await insuranceService.getInsuranceCategories()
    if (response.code === 200) {
      insuranceCategories.value = response.data || []
    }
  } catch (error) {
    console.error('加载险种分类数据失败:', error)
  }
}

// 处理查询
const handleSearch = async () => {
  // 这里可以添加查询逻辑
  initUnderwriterChart()
  await initInsuranceChart()
  initTimeTrendChart()
}

// 在组件挂载时加载数据
onMounted(async () => {
  await loadUnderwriters()
  await loadInsuranceCategories()
})

// 初始化按出单员统计图表
const initUnderwriterChart = async () => {
  // 检查Canvas元素是否存在且有效
  if (!underwriterChart.value || !(underwriterChart.value instanceof HTMLCanvasElement)) {
    console.error('无效的Canvas元素:', underwriterChart.value)
    return
  }
  
  // 销毁现有图表
  if (underwriterChartInstance) {
    underwriterChartInstance.destroy()
  }
  
  try {
    const response = await businessService.getUnderwriterStat()
    const data = response.data
    
    // 转换数据格式
    const labels = data.map(item => item.name)
    const inquiryData = data.map(item => item.total_count)
    const dealData = data.map(item => item.deal_count)
    
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
    // 显示错误信息
    const ctx = underwriterChart.value.getContext('2d')
    if (ctx) {
      // 清空画布
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      
      // 设置错误文本样式
      ctx.font = '16px Arial'
      ctx.fillStyle = '#ff4d4f'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 绘制错误信息
      ctx.fillText('获取数据失败，请检查网络连接或刷新页面', ctx.canvas.width / 2, ctx.canvas.height / 2)
    }
  }
}

// 初始化按险种分类统计图表
const initInsuranceChart = async () => {
  // 检查Canvas元素是否存在且有效
  if (!insuranceChart.value || !(insuranceChart.value instanceof HTMLCanvasElement)) {
    console.error('无效的Canvas元素:', insuranceChart.value)
    return
  }
  
  // 销毁现有图表
  if (insuranceChartInstance) {
    insuranceChartInstance.destroy()
  }
  
  try {
    // 从API获取成交率统计数据
    const response = await businessService.getDealRateStatistics()
    const dealRateData = response.data
    
    // 提取险种分类名称作为标签
    const labels = dealRateData.map(item => item.type)
    
    // 提取成交率数据
    const conversionRates = dealRateData.map(item => item.rate) // 直接使用百分比值
    
    // 提取询价数和成交数数据
    const inquiryData = dealRateData.map(item => item.total_count)
    const dealData = dealRateData.map(item => item.deal_count)
    
    const ctx = insuranceChart.value.getContext('2d')
    if (!ctx) {
      console.error('无法获取Canvas上下文')
      return
    }
    
    insuranceChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            label: '成交率',
            data: conversionRates,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              callback: function(context) {
                return context.text + ': ' + conversionRates[context.index] + '%'
              }
            }
          },
          tooltip: {
              callbacks: {
                label: function(context) {
                  const index = context.dataIndex
                  return [
                    '询价数: ' + inquiryData[index],
                    '成交数: ' + dealData[index],
                    '成交率: ' + context.raw + '%'
                  ]
                }
              }
            }
          }
        }
      })
  } catch (error) {
    console.error('初始化按险种分类统计图表失败:', error)
    
    // 只显示错误信息，不使用模拟数据
    const ctx = insuranceChart.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, insuranceChart.value.width, insuranceChart.value.height)
      ctx.font = '16px Arial'
      ctx.fillStyle = 'red'
      ctx.textAlign = 'center'
      ctx.fillText('获取数据失败，请检查网络连接或刷新页面', insuranceChart.value.width / 2, insuranceChart.value.height / 2)
    }
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
  
  // 模拟数据
  const labels = ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日', '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日', '25日', '26日', '27日', '28日', '29日', '30日']
  const inquiryData = labels.map(() => Math.floor(Math.random() * 10) + 15)
  const dealData = labels.map(() => Math.floor(Math.random() * 5) + 5)
  const conversionData = labels.map(() => Math.floor(Math.random() * 10) + 35)
  
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
onMounted(async () => {
  initUnderwriterChart()
  await initInsuranceChart()
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