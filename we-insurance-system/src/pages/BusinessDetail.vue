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
    <div class="bg-white rounded-lg shadow p-6 card-shadow mb-6">
      <!-- 基本信息 -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-info-circle text-primary mr-2"></i>
          基本信息
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="detail-item">
            <span class="text-gray-500 text-sm">保单号：</span>
            <span class="font-medium">{{ businessData.policyNumber }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">险种名称：</span>
            <span class="font-medium">{{ businessData.insuranceName }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">投保人：</span>
            <span class="font-medium">{{ businessData.insuredName }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">投保人证件号：</span>
            <span class="font-medium">{{ businessData.insuredIdNumber }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">被保险人：</span>
            <span class="font-medium">{{ businessData.beneficiaryName }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">被保险人证件号：</span>
            <span class="font-medium">{{ businessData.beneficiaryIdNumber }}</span>
          </div>
        </div>
      </div>

      <!-- 保险信息 -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-shield-alt text-primary mr-2"></i>
          保险信息
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="detail-item">
            <span class="text-gray-500 text-sm">保险期限起期：</span>
            <span class="font-medium">{{ formatDate(businessData.insuranceStartDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">保险期限止期：</span>
            <span class="font-medium">{{ formatDate(businessData.insuranceEndDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">保险期限：</span>
            <span class="font-medium">{{ calculateInsurancePeriod() }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">保额：</span>
            <span class="font-medium">{{ formatCurrency(businessData.amountInsured) }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">保费：</span>
            <span class="font-medium">{{ formatCurrency(businessData.premium) }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">缴费方式：</span>
            <span class="font-medium">{{ getPaymentMethodText() }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">代理人：</span>
            <span class="font-medium">{{ businessData.agentName }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">登记人：</span>
            <span class="font-medium">{{ businessData.registerName }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">登记时间：</span>
            <span class="font-medium">{{ formatDate(businessData.registrationDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-phone text-primary mr-2"></i>
          联系方式
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="detail-item">
            <span class="text-gray-500 text-sm">联系电话：</span>
            <span class="font-medium">{{ businessData.contactPhone }}</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-500 text-sm">电子邮箱：</span>
            <span class="font-medium">{{ businessData.contactEmail || '-' }}</span>
          </div>
        </div>
        <div class="detail-item mt-4">
          <span class="text-gray-500 text-sm">联系地址：</span>
          <span class="font-medium">{{ businessData.contactAddress }}</span>
        </div>
      </div>

      <!-- 备注信息 -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-ellipsis-h text-primary mr-2"></i>
          备注信息
        </h3>
        <div class="bg-gray-50 rounded-md p-4">
          <p class="text-gray-700">{{ businessData.remark || '暂无备注信息' }}</p>
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
  insuredIdNumber: '',
  beneficiaryName: '',
  beneficiaryIdNumber: '',
  insuranceStartDate: '',
  insuranceEndDate: '',
  amountInsured: 0,
  premium: 0,
  paymentMethod: '',
  agentName: '',
  registerName: '',
  registrationDate: '',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  remark: ''
})

// 操作日志
const operationLogs = ref([
  {
    operationTime: '2024-01-15 10:30:00',
    operator: '张三',
    operationType: 'create',
    operationContent: '创建业务记录'
  },
  {
    operationTime: '2024-01-15 14:20:00',
    operator: '李四',
    operationType: 'update',
    operationContent: '修改保费金额'
  },
  {
    operationTime: '2024-01-16 09:15:00',
    operator: '王五',
    operationType: 'update',
    operationContent: '更新联系地址'
  }
])

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

// 计算保险期限
const calculateInsurancePeriod = () => {
  if (!businessData.value.insuranceStartDate || !businessData.value.insuranceEndDate) {
    return '-'
  }
  
  const startDate = dayjs(businessData.value.insuranceStartDate)
  const endDate = dayjs(businessData.value.insuranceEndDate)
  const diff = endDate.diff(startDate, 'day')
  
  return `${diff}天`
}

// 获取缴费方式文本
const getPaymentMethodText = () => {
  const paymentMethods = {
    'cash': '现金',
    'bank_transfer': '银行转账',
    'online_payment': '在线支付',
    'credit_card': '信用卡'
  }
  
  return paymentMethods[businessData.value.paymentMethod] || businessData.value.paymentMethod
}

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
onMounted(() => {
  loadBusinessDetail()
})
</script>

<style scoped>
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>