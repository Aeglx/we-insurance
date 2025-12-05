<template>
  <div class="dashboard-page">


    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6 card-shadow transition-all hover:shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center mb-1">
              <i class="fas fa-file-alt text-blue-500 mr-2"></i>
              <p class="text-gray-500 text-sm">今日询价</p>
            </div>
            <h3 class="text-3xl font-bold text-blue-500">{{ statistics.todayInquiryCount }}</h3>
            <div class="text-success mt-2 flex items-center">
              <i class="fas fa-arrow-up mr-1"></i>
              <span class="text-sm">12% 较昨日</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 card-shadow transition-all hover:shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center mb-1">
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              <p class="text-gray-500 text-sm">今日成交</p>
            </div>
            <h3 class="text-3xl font-bold text-green-500">{{ statistics.todayDealCount }}</h3>
            <div class="text-success mt-2 flex items-center">
              <i class="fas fa-arrow-up mr-1"></i>
              <span class="text-sm">8% 较昨日</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 card-shadow transition-all hover:shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center mb-1">
              <i class="fas fa-chart-line text-purple-500 mr-2"></i>
              <p class="text-gray-500 text-sm">本月业绩</p>
            </div>
            <h3 class="text-3xl font-bold text-purple-500">{{ formatCurrency(statistics.monthlyPerformance) }}</h3>
            <div class="text-danger mt-2 flex items-center">
              <i class="fas fa-arrow-down mr-1"></i>
              <span class="text-sm">3% 较上月</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 业务趋势图表 -->
      <div class="bg-white rounded-lg shadow p-6 card-shadow col-span-1 lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">业务趋势</h3>
          <div class="flex space-x-2">
            <button class="text-sm px-3 py-1 rounded bg-primary text-white" @click="changeTimeRange('week')">本周</button>
            <button class="text-sm px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" @click="changeTimeRange('month')">本月</button>
            <button class="text-sm px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" @click="changeTimeRange('quarter')">本季度</button>
          </div>
        </div>
        <div class="h-80">
          <canvas ref="trendChart"></canvas>
        </div>
      </div>

      <!-- 险种分布和成交率统计 - 占据整个宽度 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
        <!-- 险种分布图表 - 均分宽度 -->
        <div class="bg-white rounded-lg shadow p-6 card-shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">险种分布</h3>
          <div class="h-80">
            <canvas ref="distributionChart"></canvas>
          </div>
        </div>

        <!-- 成交率统计图表 - 均分宽度 -->
        <div class="bg-white rounded-lg shadow p-6 card-shadow">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">成交率统计</h3>
          <div class="h-80">
            <canvas ref="conversionRateChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近业务列表 -->
    <div class="bg-white rounded-lg shadow p-6 card-shadow">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-800">最近业务</h3>
        <button class="text-primary hover:text-primary-dark text-sm font-medium flex items-center" @click="$router.push('/business/list')">
          查看全部
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代理人</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">险种</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="business in recentBusiness" :key="business.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ business.agentName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ business.insuranceName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ business.customerName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(business.amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="business.status === '已成交'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ business.status }}
                </span>
                <span v-else-if="business.status === '跟进中'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {{ business.status }}
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ business.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(business.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import dayjs from 'dayjs'
import businessService from '../services/businessService'

// 注册Chart.js组件
Chart.register(...registerables)

const router = useRouter()
const trendChart = ref(null)
const distributionChart = ref(null)
const conversionRateChart = ref(null)
const trendChartInstance = ref(null)
const distributionChartInstance = ref(null)
const conversionRateChartInstance = ref(null)
const timeRange = ref('week')

// 统计数据
const statistics = ref({
  todayInquiryCount: 0,
  todayDealCount: 0,
  monthlyPerformance: 0,
  todayInquiryGrowth: 0,
  todayDealGrowth: 0,
  monthlyPerformanceGrowth: 0
})

// 统计数据保持默认值，不调用API

// 最近业务数据
const recentBusiness = ref([
  {
    id: 1,
    agentName: '张三',
    insuranceName: '个人意外险',
    customerName: '李明',
    amount: 2500,
    status: '已成交',
    date: '2025-07-20'
  },
  {
    id: 2,
    agentName: '王五',
    insuranceName: '团体意外险',
    customerName: 'ABC科技有限公司',
    amount: 15000,
    status: '跟进中',
    date: '2025-07-19'
  },
  {
    id: 3,
    agentName: '李四',
    insuranceName: '学平险',
    customerName: '希望小学',
    amount: 8000,
    status: '已成交',
    date: '2025-07-18'
  }
])

// 用户信息
const userInfo = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  return userInfoStr ? JSON.parse(userInfoStr) : { username: 'admin' }
})

// 初始化数据
const initData = async () => {
  await loadRecentBusiness()
  initCharts()
}

// 加载最近业务
const loadRecentBusiness = async () => {
  try {
    // 这里可以添加从API获取最近业务的逻辑
    // 目前保持模拟数据，因为API可能还没实现
    recentBusiness.value = [
      {
        id: 1,
        agentName: '张三',
        insuranceName: '个人意外险',
        customerName: '李明',
        amount: 2500,
        status: '已成交',
        date: '2025-07-20'
      },
      {
        id: 2,
        agentName: '王五',
        insuranceName: '团体意外险',
        customerName: 'ABC科技有限公司',
        amount: 15000,
        status: '跟进中',
        date: '2025-07-19'
      },
      {
        id: 3,
        agentName: '李四',
        insuranceName: '学平险',
        customerName: '希望小学',
        amount: 8000,
        status: '已成交',
        date: '2025-07-18'
      }
    ]
  } catch (error) {
    console.error('获取最近业务失败:', error)
  }
}

// 初始化图表
const initCharts = () => {
  initTrendChart()
  initDistributionChart()
  initConversionRateChart()
}

// 初始化趋势图表
const initTrendChart = () => {
  // 检查Canvas元素是否存在
  if (!trendChart.value) return
  
  // 销毁现有图表实例
  if (trendChartInstance.value) {
    trendChartInstance.value.destroy()
  }
  
  // 生成模拟数据 - 本周数据（周一到周日）
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const inquiryData = [18, 25, 22, 29, 27, 15, 10]
  const dealData = [8, 12, 10, 15, 13, 7, 5]
  
  try {
    // 创建图表
    trendChartInstance.value = new Chart(trendChart.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '询价数',
            data: inquiryData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: '成交数',
            data: dealData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
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
              padding: 20,
              font: {
                size: 12
              }
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
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            beginAtZero: true,
            ticks: {
              font: {
                size: 11
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    })
  } catch (error) {
    console.error('初始化趋势图表失败:', error)
  }
}

// 初始化分布图表
const initDistributionChart = () => {
  // 检查Canvas元素是否存在
  if (!distributionChart.value) return
  
  // 销毁现有图表实例
  if (distributionChartInstance.value) {
    distributionChartInstance.value.destroy()
  }
  
  // 模拟数据 - 险种分布
  const labels = ['个人意外险', '团体意外险', '学平险', '建工险', '燃气险', '雇主险']
  const data = [30, 25, 20, 10, 10, 5]
  const colors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'
  ]
  
  try {
    // 创建图表
    distributionChartInstance.value = new Chart(distributionChart.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            boxPadding: 6
          }
        },
        cutout: '70%'
      }
    })
  } catch (error) {
    console.error('初始化分布图表失败:', error)
  }
}

// 初始化成交率统计图表
const initConversionRateChart = () => {
  // 检查Canvas元素是否存在
  if (!conversionRateChart.value) return
  
  // 销毁现有图表实例
  if (conversionRateChartInstance.value) {
    conversionRateChartInstance.value.destroy()
  }
  
  // 模拟数据 - 成交率统计
  const labels = ['个人意外险', '团体意外险', '学平险', '建工险', '燃气险', '雇主险']
  const data = [50, 55, 60, 40, 35, 50]
  
  try {
    // 创建图表
    conversionRateChartInstance.value = new Chart(conversionRateChart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '成交率',
          data: data,
          backgroundColor: '#3B82F6',
          borderRadius: 4,
          barThickness: 30
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
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
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%'
              },
              font: {
                size: 11
              }
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('初始化成交率统计图表失败:', error)
  }
}

// 刷新数据
const refreshData = async () => {
  await loadRecentBusiness()
  initCharts()
}

// 更改时间范围
const changeTimeRange = (range) => {
  timeRange.value = range
  // 根据时间范围重新生成图表数据
  initTrendChart()
}

// 查看业务详情
const viewBusinessDetail = (id) => {
  router.push(`/business/detail/${id}`)
}

// 编辑业务
const editBusiness = (id) => {
  router.push(`/business/edit/${id}`)
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化金额
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(amount)
}

// 生命周期钩子
onMounted(() => {
  initData()
})

onUnmounted(() => {
  // 销毁图表实例
  if (trendChartInstance.value) {
    trendChartInstance.value.destroy()
  }
  if (distributionChartInstance.value) {
    distributionChartInstance.value.destroy()
  }
  if (conversionRateChartInstance.value) {
    conversionRateChartInstance.value.destroy()
  }
})
</script>