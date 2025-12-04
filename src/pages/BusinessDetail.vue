<template>
  <div class="business-detail-page">
    <!-- 页面标题 -->
    <div class="page-header mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">业务详情</h1>
          <p class="text-gray-500 mt-1">查看业务记录的完整信息</p>
        </div>
        <div class="flex space-x-3">
          <button class="btn-secondary" @click="router.push('/business/list')">
            <i class="fas fa-arrow-left mr-2"></i>
            返回列表
          </button>
          <button class="btn-primary" @click="router.push(`/business/edit/${businessData.id}`)">
            <i class="fas fa-edit mr-2"></i>
            编辑
          </button>
        </div>
      </div>
    </div>

    <!-- 业务详情卡片 -->
    <div class="bg-white rounded-xl shadow-lg p-8 card-shadow mb-8">
      <!-- 基本信息 -->
      <div class="mb-10">
        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
          <i class="fas fa-info-circle text-primary mr-3"></i>
          基本信息
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="detail-item p-4 bg-gray-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">保单号</span>
            <span class="text-gray-900 text-lg">{{ businessData.policyNumber }}</span>
          </div>
          <div class="detail-item p-4 bg-gray-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">险种名称</span>
            <span class="text-gray-900 text-lg">{{ businessData.insuranceName }}</span>
          </div>
          <div class="detail-item p-4 bg-gray-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">投保人</span>
            <span class="text-gray-900 text-lg">{{ businessData.insuredName }}</span>
          </div>
          <div class="detail-item p-4 bg-gray-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">被保险人</span>
            <span class="text-gray-900 text-lg">{{ businessData.beneficiaryName }}</span>
          </div>
        </div>
      </div>

      <!-- 保险信息 -->
      <div class="mb-10">
        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
          <i class="fas fa-shield-alt text-primary mr-3"></i>
          保险信息
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="detail-item p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">保险期限起期</span>
            <span class="text-gray-900">{{ formatDate(businessData.insuranceStartDate) }}</span>
          </div>
          <div class="detail-item p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">保险期限止期</span>
            <span class="text-gray-900">{{ formatDate(businessData.insuranceEndDate) }}</span>
          </div>
          <div class="detail-item p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">保额</span>
            <span class="text-green-700 font-bold">{{ formatCurrency(businessData.amountInsured) }}</span>
          </div>
          <div class="detail-item p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">保费</span>
            <span class="text-green-700 font-bold">{{ formatCurrency(businessData.premium) }}</span>
          </div>
          <div class="detail-item p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">代理人</span>
            <span class="text-purple-700 font-medium">{{ businessData.agentName }}</span>
          </div>
          <div class="detail-item p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg shadow-sm">
            <span class="text-gray-600 text-sm font-medium">登记时间</span>
            <span class="text-orange-700">{{ formatDate(businessData.registrationDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 备注信息 -->
      <div>
        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
          <i class="fas fa-ellipsis-h text-primary mr-3"></i>
          备注信息
        </h3>
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
          <p class="text-gray-700 leading-relaxed">{{ businessData.remark || '暂无备注信息' }}</p>
        </div>
      </div>
    </div>

    <!-- 操作日志 -->
    <div class="bg-white rounded-lg shadow p-6 card-shadow">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-history text-primary mr-2"></i>
        操作日志
      </h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作时间</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作类型</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作内容</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(log, index) in operationLogs" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(log.operationTime) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.operator }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full" :class="getOperationTypeClass(log.operationType)">
                  {{ getOperationTypeText(log.operationType) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.operationContent }}</td>
            </tr>
            <tr v-if="operationLogs.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-gray-500">
                暂无操作日志
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import businessService from '../services/businessService'

dayjs.extend(duration)

const router = useRouter()
const route = useRoute()
const businessData = ref({
  id: '',
  policyNumber: '',
  insuranceName: '',
  insuredName: '',
  beneficiaryName: '',
  insuranceStartDate: '',
  insuranceEndDate: '',
  amountInsured: 0,
  premium: 0,
  agentName: '',
  registrationDate: '',
  remark: ''
})

// 操作日志
const operationLogs = ref([])

// 加载业务详情
const loadBusinessDetail = async () => {
  try {
    const id = route.params.id
    const response = await businessService.getBusinessDetail(id)
    if (response.code === 200) {
      businessData.value = response.data
    }
  } catch (error) {
    console.error('加载业务详情失败:', error)
    router.push('/business/list')
  }
}

// 加载业务操作日志
const loadBusinessLogs = async () => {
  try {
    const id = route.params.id
    const response = await businessService.getBusinessLogs(id)
    if (response.code === 200) {
      operationLogs.value = response.data
    }
  } catch (error) {
    console.error('加载业务操作日志失败:', error)
  }
}

// 这些函数不再使用，已删除对应的UI字段

// 获取操作类型样式
const getOperationTypeClass = (type) => {
  const classes = {
    'create': 'bg-success text-white',
    'update': 'bg-blue-100 text-blue-800',
    'delete': 'bg-danger text-white'
  }
  
  return classes[type] || 'bg-gray-100 text-gray-800'
}

// 获取操作类型文本
const getOperationTypeText = (type) => {
  const texts = {
    'create': '创建',
    'update': '修改',
    'delete': '删除'
  }
  
  return texts[type] || type
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

// 初始化
onMounted(async () => {
  await loadBusinessDetail()
  await loadBusinessLogs()
})
</script>

<style scoped>
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-shadow {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.business-detail-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .business-detail-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .detail-item {
    gap: 6px;
  }
  
  .detail-item span:last-child {
    font-size: 1rem;
  }
}
</style>