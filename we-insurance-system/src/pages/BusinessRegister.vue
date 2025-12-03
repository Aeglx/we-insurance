<template>
  <div class="business-register-page">
    <!-- 页面标题 -->
    <div class="page-header mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">业务登记</h1>
        <p class="text-gray-500 mt-1">请填写业务信息进行登记</p>
      </div>
    </div>

    <!-- 业务登记表单 -->
    <div class="bg-white rounded-lg shadow p-6 card-shadow">
      <form @submit.prevent="submitForm">
        <div class="space-y-6">
          <!-- 代理人和出单员 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">代理人</label>
              <select
                v-model="formData.agentId"
                class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
                required
              >
                <option value="">请选择代理人</option>
                <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                  {{ agent.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">出单员</label>
              <select
                v-model="formData.underwriterId"
                class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
                required
              >
                <option value="">请选出单员</option>
                <option v-for="underwriter in underwriters" :key="underwriter.id" :value="underwriter.id">
                  {{ underwriter.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 险种类型和具体险种 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">险种类型</label>
              <select
                v-model="formData.insuranceTypeId"
                class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
                @change="handleInsuranceTypeChange"
                required
              >
                <option value="">请选择险种类型</option>
                <option v-for="type in insuranceTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">具体险种</label>
              <select
                v-model="formData.specificInsuranceId"
                class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
                required
              >
                <option value="">请先选择险种类型</option>
                <option v-for="insurance in specificInsurances" :key="insurance.id" :value="insurance.id">
                  {{ insurance.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 客户信息提示 -->
          <div>
            <p class="text-sm text-gray-500">客户信息</p>
            <p class="text-xs text-gray-400 mt-1">客户信息由代理人负责收集和管理</p>
          </div>

          <!-- 询价金额和成交状态 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">询价金额</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">¥</span>
                <input
                  v-model.number="formData.inquiryAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md input-focus"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">成交状态</label>
              <select
                v-model="formData.dealStatus"
                class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
                required
              >
                <option value="跟进中">跟进中</option>
                <option value="已成交">已成交</option>
                <option value="已失败">已失败</option>
              </select>
            </div>
          </div>

          <!-- 跟进备注 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">跟进备注</label>
            <textarea
              v-model="formData.followUpRemark"
              class="w-full px-4 py-2 border border-gray-300 rounded-md input-focus"
              rows="4"
              placeholder="请输入跟进备注"
            ></textarea>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors" @click="handleCancel">
              取消
            </button>
            <button type="submit" class="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              保存
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import businessService from '../services/businessService'
import agentService from '../services/agentService'
import insuranceService from '../services/insuranceService'
import underwriterService from '../services/underwriterService'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const formData = ref({})
const agents = ref([])
const underwriters = ref([])
const insuranceTypes = ref([])
const specificInsurances = ref([])

// 获取当前组件实例
const instance = getCurrentInstance()

// 表单初始数据
const initialFormData = {
  agentId: '',
  underwriterId: '',
  insuranceTypeId: '',
  specificInsuranceId: '',
  inquiryAmount: 0,
  dealStatus: '跟进中',
  followUpRemark: ''
}

// 初始化数据
const initData = async () => {
  // 加载代理人、出单员和险种类型数据
  await Promise.all([
    loadAgents(),
    loadUnderwriters(),
    loadInsuranceTypes()
  ])
  
  resetForm()
}

// 加载代理人数据
const loadAgents = async () => {
  try {
    const response = await agentService.getAgentList()
    if (response.code === 200) {
      agents.value = response.data
    }
  } catch (error) {
    console.error('加载代理人数据失败:', error)
  }
}

// 加载出单员数据
const loadUnderwriters = async () => {
  try {
    const response = await underwriterService.getUnderwriterList()
    if (response.code === 200) {
      underwriters.value = response.data
    }
  } catch (error) {
    console.error('加载出单员数据失败:', error)
  }
}

// 加载险种类型数据
const loadInsuranceTypes = async () => {
  try {
    const response = await insuranceService.getInsuranceList()
    if (response.code === 200) {
      insuranceTypes.value = response.data
    }
  } catch (error) {
    console.error('加载险种类型数据失败:', error)
  }
}

// 处理险种类型变化
const handleInsuranceTypeChange = () => {
  // 重置具体险种
  formData.value.specificInsuranceId = ''
  
  // 根据险种类型加载具体险种
  // 这里使用模拟数据，实际应该调用API
  specificInsurances.value = [
    { id: 1, name: '个人意外险' },
    { id: 2, name: '团体意外险' },
    { id: 3, name: '学平险' },
    { id: 4, name: '建工险' },
    { id: 5, name: '燃气险' },
    { id: 6, name: '雇主险' }
  ]
}

// 重置表单
const resetForm = () => {
  formData.value = { ...initialFormData }
  specificInsurances.value = []
}

// 处理取消按钮点击事件
const handleCancel = () => {
  router.push('/dashboard')
}

// 提交表单
const submitForm = async () => {
  try {
    loading.value = true
    
    // 验证表单
    if (!validateForm()) {
      instance?.proxy?.$toast.error('请填写完整的表单信息')
      return
    }
    
    // 提交数据
    const response = await businessService.addBusiness(formData.value)
    
    if (response.code === 200) {
      instance?.proxy?.$toast.success('业务登记成功')
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('提交失败:', error)
    instance?.proxy?.$toast.error('业务登记失败')
  } finally {
    loading.value = false
  }
}

// 验证表单
const validateForm = () => {
  // 基本必填项验证
  const requiredFields = [
    'agentId', 'underwriterId', 'insuranceTypeId', 
    'specificInsuranceId', 'inquiryAmount', 'dealStatus'
  ]
  
  for (const field of requiredFields) {
    if (!formData.value[field] && formData.value[field] !== 0) {
      return false
    }
  }
  
  return true
}

// 初始化
onMounted(() => {
  initData()
})
</script>