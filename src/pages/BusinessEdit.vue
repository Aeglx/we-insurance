<template>
  <div class="business-register-page">
    
    <el-card shadow="hover" class="register-card">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-position="right" label-width="120px">
        <!-- 基础信息区 -->
        <div class="form-section">
          <h3 class="section-title">基础信息区</h3>
          <el-divider class="section-divider"></el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="代理人" prop="agentId" required>
                <el-autocomplete
                  v-model="searchAgent"
                  :fetch-suggestions="querySearchAgent"
                  @select="onAgentSelect"
                  @change="handleAgentChange"
                  placeholder="输入代理人姓名搜索或新增"
                  clearable
                  class="w-full"
                  value-key="name"
                >
                  <template #suffix>
                    <el-button 
                      v-if="searchAgent && !isAgentExists(searchAgent)" 
                      @click="handleAddAgent"
                      type="primary" 
                      size="small"
                    >
                      新增
                    </el-button>
                  </template>
                  <template #default="{ item }">
                    <div class="flex justify-between">
                      <span>{{ item.name }}</span>
                      <span class="text-gray-400 text-sm">{{ item.department || '无部门' }}</span>
                    </div>
                  </template>
                </el-autocomplete>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出单员" prop="underwriterId" required>
                <el-select
                  v-model="formData.underwriterId"
                  placeholder="请选择出单员"
                  class="w-full"
                  filterable
                >
                  <el-option
                    v-for="underwriter in underwriters"
                    :key="underwriter.id"
                    :label="underwriter.name"
                    :value="underwriter.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 险种信息区 -->
        <div class="form-section">
          <h3 class="section-title">险种信息区</h3>
          <el-divider class="section-divider"></el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="险种分类" prop="insuranceTypeId" required>
                <el-select
                  v-model="formData.insuranceTypeId"
                  placeholder="请选择险种分类"
                  @change="onInsuranceTypeChange"
                  class="w-full"
                  filterable
                >
                  <el-option
                    v-for="type in insuranceTypes"
                    :key="type.id"
                    :label="type.name"
                    :value="type.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="险种名称" prop="specificInsuranceId" required>
                <el-select
                  v-model="formData.specificInsuranceId"
                  placeholder="请选择险种名称"
                  class="w-full"
                  filterable
                  :disabled="!formData.insuranceTypeId"
                  @change="onSpecificInsuranceChange"
                >
                  <el-option
                    v-for="insurance in specificInsurances"
                    :key="insurance.id"
                    :label="insurance.name"
                    :value="insurance.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 客户信息区 -->
        <div class="form-section">
          <h3 class="section-title">客户信息区</h3>
          <el-divider class="section-divider"></el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="客户类型" prop="clientType" required>
                <el-radio-group v-model="formData.clientType" @change="handleClientTypeChange">
                  <el-radio label="personal">个人客户</el-radio>
                  <el-radio label="company">企业客户</el-radio>
                  <el-radio label="vehicle">车险客户</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="客户名称" prop="personalName" v-if="formData.clientType === 'personal'">
                <el-input v-model="formData.personalName" placeholder="请输入客户姓名"></el-input>
              </el-form-item>
              <el-form-item label="企业名称" prop="companyName" v-if="formData.clientType === 'company'">
                <el-input v-model="formData.companyName" placeholder="请输入企业名称"></el-input>
              </el-form-item>
              <el-form-item label="车牌号" prop="plateNumber" v-if="formData.clientType === 'vehicle'">
                <el-input v-model="formData.plateNumber" placeholder="请输入车牌号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系方式" prop="customerPhone" required>
                <el-input v-model="formData.customerPhone" placeholder="请输入客户联系方式"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="电子邮箱" prop="customerEmail">
                <el-input v-model="formData.customerEmail" placeholder="请输入客户电子邮箱"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系地址" prop="contactAddress">
                <el-input v-model="formData.contactAddress" placeholder="请输入客户联系地址"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 保险信息区 -->
        <div class="form-section">
          <h3 class="section-title">保险信息区</h3>
          <el-divider class="section-divider"></el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="保单号" prop="policyNumber">
                <el-input v-model="formData.policyNumber" placeholder="请输入保单号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保额" prop="amountInsured">
                <el-input-number
                  v-model="formData.amountInsured"
                  :min="0"
                  :step="1000"
                  :precision="2"
                  placeholder="请输入保额"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="保费" prop="premium">
                <el-input-number
                  v-model="formData.premium"
                  :min="0"
                  :step="100"
                  :precision="2"
                  placeholder="请输入保费"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="询价金额" prop="inquiryAmount" required>
                <el-input-number
                  v-model="formData.inquiryAmount"
                  :min="0"
                  :step="100"
                  :precision="2"
                  placeholder="请输入询价金额"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="保险期限起期" prop="insuranceStartDate">
                <el-date-picker
                  v-model="formData.insuranceStartDate"
                  type="datetime"
                  placeholder="选择起期"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保险期限止期" prop="insuranceEndDate">
                <el-date-picker
                  v-model="formData.insuranceEndDate"
                  type="datetime"
                  placeholder="选择止期"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="缴费方式" prop="paymentMethod">
                <el-select v-model="formData.paymentMethod" placeholder="请选择缴费方式">
                  <el-option label="一次性缴清" value="lump_sum"></el-option>
                  <el-option label="分期缴纳" value="installment"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="成交状态" prop="dealStatus" required>
                <el-select v-model="formData.dealStatus" placeholder="请选择成交状态">
                  <el-option label="跟进中" value="pending"></el-option>
                  <el-option label="已成交" value="success"></el-option>
                  <el-option label="已失效" value="failed"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 备注信息区 -->
        <div class="form-section">
          <h3 class="section-title">备注信息区</h3>
          <el-divider class="section-divider"></el-divider>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="跟进备注" prop="followUpRemark">
                <el-input
                  v-model="formData.followUpRemark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入跟进备注"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="提醒时间" prop="reminderTime">
                <el-date-picker
                  v-model="formData.reminderTime"
                  type="datetime"
                  placeholder="选择提醒时间"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="成交时间" prop="dealTime">
                <el-date-picker
                  v-model="formData.dealTime"
                  type="datetime"
                  placeholder="选择成交时间"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="其他备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入其他备注"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 提交按钮区 -->
        <div class="form-section">
          <div class="flex justify-center space-x-4">
            <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="router.back()">返回</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import businessService from '../services/businessService'
import agentService from '../services/agentService'
import insuranceService from '../services/insuranceService'

// 路由和参数
const router = useRouter()
const route = useRoute()
const businessId = route.params.id

// 表单相关
const formRef = ref(null)
const loading = ref(false)

// 代理人搜索相关
const searchAgent = ref('')
const agentList = ref([])
const underwriters = ref([])

// 险种相关
const insuranceTypes = ref([])
const specificInsurances = ref([])

// 表单数据
const formData = reactive({
  agentId: '',
  underwriterId: '',
  insuranceTypeId: '',
  specificInsuranceId: '',
  clientType: 'personal',
  personalName: '',
  companyName: '',
  plateNumber: '',
  customerPhone: '',
  customerEmail: '',
  contactAddress: '',
  policyNumber: '',
  amountInsured: 0,
  premium: 0,
  inquiryAmount: 0,
  insuranceStartDate: '',
  insuranceEndDate: '',
  paymentMethod: 'lump_sum',
  dealStatus: 'pending',
  followUpRemark: '',
  reminderTime: '',
  dealTime: '',
  remark: ''
})

// 表单验证规则（使用计算属性实现动态验证）
const formRules = computed(() => {
  return {
    agentId: [
      { required: true, message: '请选择代理人', trigger: 'change' }
    ],
    underwriterId: [
      { required: true, message: '请选择出单员', trigger: 'change' }
    ],
    insuranceTypeId: [
      { required: true, message: '请选择险种分类', trigger: 'change' }
    ],
    specificInsuranceId: [
      { required: true, message: '请选择险种名称', trigger: 'change' }
    ],
    clientType: [
      { required: true, message: '请选择客户类型', trigger: 'change' }
    ],
    personalName: [
      { 
        required: formData.clientType === 'personal', 
        message: '请输入客户姓名', 
        trigger: 'blur' 
      }
    ],
    companyName: [
      { 
        required: formData.clientType === 'company', 
        message: '请输入企业名称', 
        trigger: 'blur' 
      }
    ],
    plateNumber: [
      { 
        required: formData.clientType === 'vehicle', 
        message: '请输入车牌号', 
        trigger: 'blur' 
      }
    ],
    customerPhone: [
      { required: true, message: '请输入客户联系方式', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    inquiryAmount: [
      { required: true, message: '请输入询价金额', trigger: 'blur' }
    ],
    dealStatus: [
      { required: true, message: '请选择成交状态', trigger: 'change' }
    ]
  }
})

// 初始化数据
onMounted(() => {
  loadBusinessData()
  loadAgents()
  loadUnderwriters()
  loadInsuranceTypes()
})

// 加载业务数据
const loadBusinessData = async () => {
  if (!businessId) return
  
  try {
    loading.value = true
    const response = await businessService.getBusinessDetail(businessId)
    const businessData = response.data
    
    // 填充表单数据
    formData.agentId = businessData.agentId || ''
    formData.underwriterId = businessData.underwriterId || ''
    formData.insuranceTypeId = businessData.insuranceTypeId || ''
    formData.specificInsuranceId = businessData.specificInsuranceId || ''
    formData.clientType = businessData.clientType || 'personal'
    formData.personalName = businessData.personalName || businessData.customerName || ''
    formData.companyName = businessData.companyName || ''
    formData.plateNumber = businessData.plateNumber || ''
    formData.customerPhone = businessData.customerPhone || ''
    formData.customerEmail = businessData.customerEmail || ''
    formData.contactAddress = businessData.contactAddress || ''
    formData.policyNumber = businessData.policyNumber || ''
    formData.amountInsured = parseFloat(businessData.amountInsured || businessData.coverage_amount || 0)
    formData.premium = parseFloat(businessData.premium || businessData.premium_amount || 0)
    formData.inquiryAmount = parseFloat(businessData.inquiryAmount || businessData.inquiry_amount || 0)
    formData.insuranceStartDate = businessData.insuranceStartDate ? new Date(businessData.insuranceStartDate) : ''
    formData.insuranceEndDate = businessData.insuranceEndDate ? new Date(businessData.insuranceEndDate) : ''
    formData.paymentMethod = businessData.paymentMethod || 'lump_sum'
    formData.dealStatus = businessData.dealStatus || 'pending'
    formData.followUpRemark = businessData.followUpRemark || businessData.follow_up_remark || ''
    formData.reminderTime = businessData.reminderTime ? new Date(businessData.reminderTime) : ''
    formData.dealTime = businessData.dealTime ? new Date(businessData.dealTime) : ''
    formData.remark = businessData.remark || ''
    
    // 加载代理人信息
    if (businessData.agentId) {
      try {
        const agentResponse = await agentService.getAgentById(businessData.agentId)
        searchAgent.value = agentResponse.data.name
      } catch (agentError) {
        console.error('加载代理人信息失败:', agentError)
        // 如果获取代理人信息失败，尝试使用返回的agentName
        searchAgent.value = businessData.agentName || ''
      }
    } else if (businessData.agentName) {
      searchAgent.value = businessData.agentName
    }
    
    // 加载险种详情
    if (formData.insuranceTypeId) {
      await loadSpecificInsurances(formData.insuranceTypeId)
    }
    
  } catch (error) {
    console.error('加载业务数据失败:', error)
    ElMessage.error('加载业务数据失败')
  } finally {
    loading.value = false
  }
}

// 加载代理人列表
const loadAgents = async () => {
  try {
    const response = await agentService.getAgentList()
    agentList.value = response.data
  } catch (error) {
    console.error('加载代理人列表失败:', error)
  }
}

// 加载出单员列表
const loadUnderwriters = async () => {
  try {
    const response = await agentService.getAgentList()
    underwriters.value = response.data
  } catch (error) {
    console.error('加载出单员列表失败:', error)
  }
}

// 加载险种分类
const loadInsuranceTypes = async () => {
  try {
    const response = await insuranceService.getInsuranceCategories()
    insuranceTypes.value = response.data
  } catch (error) {
    console.error('加载险种分类失败:', error)
  }
}

// 加载具体险种
const loadSpecificInsurances = async (typeId) => {
  try {
    const response = await insuranceService.getInsurancesByCategory(typeId)
    specificInsurances.value = response.data
  } catch (error) {
    console.error('加载具体险种失败:', error)
  }
}

// 代理人搜索
const querySearchAgent = (query, cb) => {
  const results = query ? agentList.value.filter(item => item.name.toLowerCase().includes(query.toLowerCase())) : agentList.value
  cb(results)
}

// 选择代理人
const onAgentSelect = (item) => {
  formData.agentId = item.id
  searchAgent.value = item.name
}

// 代理人变化处理
const handleAgentChange = () => {
  if (!searchAgent.value) {
    formData.agentId = ''
  }
}

// 检查代理人是否存在
const isAgentExists = (name) => {
  return agentList.value.some(item => item.name === name)
}

// 新增代理人
const handleAddAgent = () => {
  ElMessage.warning('新增代理人功能未实现')
}

// 客户类型变化处理
const handleClientTypeChange = () => {
  // 重置客户名称相关字段
  formData.personalName = ''
  formData.companyName = ''
  formData.plateNumber = ''
}

// 险种分类变化处理
const onInsuranceTypeChange = () => {
  formData.specificInsuranceId = ''
  specificInsurances.value = []
  if (formData.insuranceTypeId) {
    loadSpecificInsurances(formData.insuranceTypeId)
  }
}

// 具体险种变化处理
const onSpecificInsuranceChange = () => {
  // 可以在这里添加险种变化的其他处理逻辑
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 提交数据
    const response = await businessService.updateBusiness(businessId, formData)
    
    if (response.code === 200) {
      ElMessage.success('业务记录更新成功')
      router.push(`/business/detail/${businessId}`)
    } else {
      ElMessage.error(response.message || '业务记录更新失败')
    }
  } catch (error) {
    console.error('业务记录更新失败:', error)
    ElMessage.error('业务记录更新失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.business-register-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.register-card {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.section-divider {
  margin: 10px 0 20px 0;
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.space-x-4 > * + * {
  margin-left: 16px;
}

.text-gray-400 {
  color: #c0c4cc;
}

.text-sm {
  font-size: 12px;
}
</style>