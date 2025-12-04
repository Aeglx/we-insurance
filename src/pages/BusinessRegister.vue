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
            <!-- 客户类型字段显示 -->
            <el-col :span="12">
              <el-form-item label="客户类别" prop="clientType" required>
                <el-select v-model="formData.clientType" placeholder="请选择客户类别" @change="handleClientTypeChange">
                  <el-option label="个人客户" value="personal"></el-option>
                  <el-option label="企业客户" value="company"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            
            <!-- 个人客户字段 -->
            <el-col :span="12" v-if="formData.clientType === 'personal'">
              <el-form-item label="客户名称" prop="clientName" required>
                <el-input v-model="formData.clientName" placeholder="请输入客户名称" clearable></el-input>
              </el-form-item>
            </el-col>
            
            <!-- 企业客户字段 -->
            <el-col :span="12" v-if="formData.clientType === 'company'">
              <el-form-item label="联系人姓名" prop="personalName" required>
                <el-input v-model="formData.personalName" placeholder="请输入联系人姓名" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="formData.clientType === 'company'">
              <el-form-item label="公司名称" prop="companyName" required>
                <el-input v-model="formData.companyName" placeholder="请输入公司名称" clearable></el-input>
              </el-form-item>
            </el-col>
            
            <!-- 车类客户字段 -->
            <el-col :span="12" v-if="formData.clientType === 'vehicle'">
              <el-form-item label="车牌号" prop="plateNumber" required>
                <el-input v-model="formData.plateNumber" placeholder="请输入车牌号" clearable></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 成交信息区 -->
        <div class="form-section">
          <h3 class="section-title">成交信息区</h3>
          <el-divider class="section-divider"></el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="询价金额" prop="inquiryAmount" required>
                <el-input-number
                  v-model="formData.inquiryAmount"
                  :min="0"
                  :precision="2"
                  :step="100"
                  placeholder="请输入询价金额"
                  style="width: 100%"
                  :controls-position="'right'"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="成交状态" prop="dealStatus" required>
                <el-select v-model="formData.dealStatus" @change="handleDealStatusChange" class="w-full">
                  <el-option label="跟进中" value="pending"></el-option>
                  <el-option label="已成交" value="approved"></el-option>
                  <el-option label="已失效" value="rejected"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="formData.dealStatus === '跟进中'">
              <el-form-item label="提醒时间" prop="reminderTime">
                <el-date-picker
                  v-model="formData.reminderTime"
                  type="date"
                  placeholder="选择提醒时间"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="formData.dealStatus === '已成交'">
              <el-form-item label="保单号" prop="policyNumber" required>
                <el-input v-model="formData.policyNumber" placeholder="请输入保单号" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="formData.dealStatus === '已成交'">
              <el-form-item label="成交时间" prop="dealTime" required>
                <el-date-picker
                  v-model="formData.dealTime"
                  type="date"
                  placeholder="选择成交时间"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                ></el-date-picker>
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
                  :rows="4"
                  placeholder="请输入跟进备注信息"
                  resize="none"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 表单按钮区 -->
        <div class="form-actions flex justify-center mt-10">
          <el-button type="primary" @click="submitForm" :loading="loading" size="large">提交</el-button>
          <el-button @click="resetForm" size="large" class="ml-4">重置</el-button>
          <el-button @click="handleCancel" size="large" class="ml-4">取消</el-button>
        </div>
      </el-form>
    </el-card>
    

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import businessService from '../services/businessService'
import agentService from '../services/agentService'
import insuranceService from '../services/insuranceService'
import underwriterService from '../services/underwriterService'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const instance = getCurrentInstance()

// 表单引用
const formRef = ref(null)
const agentFormRef = ref(null)

// 表单数据
const formData = reactive({
  agentId: '',
  underwriterId: '',
  insuranceTypeId: '',
  specificInsuranceId: '',
  clientType: 'personal', // 默认个人客户
  clientName: '',
  personalName: '',
  companyName: '',
  plateNumber: '', // 车牌号字段
  inquiryAmount: 0,
  dealStatus: 'pending', // 跟进中
  reminderTime: '',
  policyNumber: '',
  dealTime: '',
  followUpRemark: ''
})

// 成交状态映射（前端显示与后端存储的对应关系）
const dealStatusMap = {
  'pending': '跟进中',
  'approved': '已成交',
  'rejected': '已失效'
};

// 表单验证规则
const formRules = reactive({
  agentId: [{ required: true, message: '请选择代理人', trigger: 'change' }],
  underwriterId: [{ required: true, message: '请选择出单员', trigger: 'change' }],
  insuranceTypeId: [{ required: true, message: '请选择险种分类', trigger: 'change' }],
  specificInsuranceId: [{ required: true, message: '请选择险种名称', trigger: 'change' }],
  clientType: [{ required: true, message: '请选择客户类型', trigger: 'change' }],
  clientName: [
    {
      required: () => formData.clientType === 'personal',
      message: '请输入客户名称',
      trigger: 'blur'
    }
  ],
  personalName: [
    {
      required: () => formData.clientType === 'company',
      message: '请输入联系人姓名',
      trigger: ['blur', 'change']
    }
  ],
  companyName: [
    {
      required: () => formData.clientType === 'company',
      message: '请输入公司名称',
      trigger: ['blur', 'change']
    }
  ],

  inquiryAmount: [{ required: true, message: '请输入询价金额', trigger: 'blur' }, { type: 'number', min: 0, message: '询价金额不能为负数', trigger: 'blur' }],
  dealStatus: [{ required: true, message: '请选择成交状态', trigger: 'change' }],
  reminderTime: [
    {
      required: () => formData.dealStatus === 'pending',
      message: '请选择提醒时间',
      trigger: ['blur', 'change']
    }
  ],
  policyNumber: [
    {
      required: () => formData.dealStatus === 'approved',
      message: '请输入保单号',
      trigger: ['blur', 'change']
    }
  ],
  dealTime: [
    {
      required: () => formData.dealStatus === 'approved',
      message: '请选择成交时间',
      trigger: ['blur', 'change']
    }
  ]
})

// 代理人相关数据
const agents = ref([])
const searchAgent = ref('')

// 出单员数据
const underwriters = ref([])

// 险种分类数据
const insuranceTypes = ref([])
// 险种名称数据
const specificInsurances = ref([])

// 加载状态
const loading = ref(false)

// 处理客户类型变化
const handleClientTypeChange = () => {
  // 当客户类型变化时，重置不相关的字段
  if (formData.clientType === 'personal') {
    // 个人客户：保留clientName，清空其他
    formData.personalName = ''
    formData.companyName = ''
    formData.plateNumber = ''
  } else if (formData.clientType === 'company') {
    // 企业客户：保留personalName和companyName，清空其他
    formData.clientName = ''
    formData.plateNumber = ''
  }
}

// 初始化数据
const initData = async () => {
  // 加载代理人、出单员和险种分类数据
  await Promise.all([
    loadAgents(),
    loadUnderwriters(),
    loadInsuranceCategories()
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
    ElMessage.error('加载代理人数据失败')
  }
}

// 加载出单员数据
const loadUnderwriters = async () => {
  try {
    const response = await underwriterService.getUnderwriterList()
    // 出单员接口返回格式为 { data: [...], total: ... }
    underwriters.value = response.data || []
  } catch (error) {
    console.error('加载出单员数据失败:', error)
    ElMessage.error('加载出单员数据失败')
  }
}

// 加载险种分类数据
const loadInsuranceCategories = async () => {
  try {
    const response = await insuranceService.getInsuranceCategories()
    if (response.code === 200) {
      insuranceTypes.value = response.data
    }
  } catch (error) {
    console.error('加载险种分类数据失败:', error)
    ElMessage.error('加载险种分类数据失败')
  }
}

// 代理人搜索函数，用于el-autocomplete的fetch-suggestions属性
const querySearchAgent = (query, cb) => {
  if (query) {
    const results = agents.value.filter(agent => 
      agent.name.toLowerCase().includes(query.toLowerCase())
    )
    cb(results)
  } else {
    cb([])
  }
}

// 检查代理人是否已存在
const isAgentExists = (agentName) => {
  return agents.value.some(agent => agent.name.toLowerCase() === agentName.toLowerCase())
}

// 代理人选择事件处理
const onAgentSelect = (item) => {
  formData.agentId = item.id
  searchAgent.value = item.name
}

// 输入框变化事件处理
const handleAgentChange = (value) => {
  if (!value) {
    formData.agentId = ''
  }
}

// 直接新增代理人
const handleAddAgent = async () => {
  try {
    // 验证输入
    if (!searchAgent.value.trim()) {
      ElMessage.warning('请输入代理人姓名')
      return
    }

    // 调用后端API添加代理人
    const response = await agentService.addAgent({
      name: searchAgent.value.trim(),
      phone: '',
      status: true,
      department: ''
    })
    
    // 处理API响应
    if (response.code === 200) {
      ElMessage.success('代理人新增成功')
      
      // 更新代理人列表
      await loadAgents()
      
      // 自动选中新添加的代理人
      if (response.data && response.data.id) {
        const newAgent = agents.value.find(agent => agent.id === response.data.id)
        if (newAgent) {
          formData.agentId = newAgent.id
          searchAgent.value = newAgent.name
        }
      }
    } else {
      ElMessage.error(response.message || '代理人新增失败')
    }
  } catch (error) {
    console.error('新增代理人失败:', error)
    ElMessage.error('代理人新增失败，请稍后重试')
  }
}



// 险种分类选择变化
const onInsuranceTypeChange = async (typeId) => {
  // 重置险种名称
  formData.specificInsuranceId = ''
  specificInsurances.value = []
  
  // 根据险种分类加载险种名称
  if (typeId) {
    await loadSpecificInsurances(typeId)
  }
}

// 险种名称选择变化
const onSpecificInsuranceChange = (insuranceId) => {
  if (insuranceId) {
    // 获取选中的险种信息
    const selectedInsurance = specificInsurances.value.find(ins => ins.id === insuranceId)
    if (selectedInsurance) {
      console.log('Selected Insurance:', selectedInsurance)
      console.log('Insurance Name:', selectedInsurance.name)
      console.log('Insurance Category:', selectedInsurance.categoryName)
    }
  }
}

// 加载险种名称
const loadSpecificInsurances = async (typeId) => {
  try {
    // 使用真实API调用获取数据
    const response = await insuranceService.getInsuranceByCategory(typeId)
    
    if (response.code === 200) {
      specificInsurances.value = response.data || []
      console.log('Loaded Specific Insurances:', specificInsurances.value)
    } else {
      ElMessage.error(response.message || '加载险种名称数据失败')
    }
  } catch (error) {
    console.error('加载险种名称数据失败:', error)
    ElMessage.error('加载险种名称数据失败，请稍后重试')
    
    // 如果API调用失败，使用默认数据
    specificInsurances.value = [
      { id: 1, name: '个人意外险', categoryName: '个人意外险', typeId: 1 },
      { id: 2, name: '团体意外险', categoryName: '团体意外险', typeId: 2 },
      { id: 3, name: '学平险', categoryName: '学平险', typeId: 1 },
      { id: 4, name: '建工险', categoryName: '建工一切', typeId: 3 },
      { id: 5, name: '燃气险', categoryName: '个人意外险', typeId: 4 },
      { id: 6, name: '雇主险', categoryName: '团体雇主险', typeId: 2 },
      { id: 7, name: '健康险', categoryName: '健康险', typeId: 1 },
      { id: 8, name: '百万医疗', categoryName: '百万医疗', typeId: 1 },
      { id: 9, name: '医疗险', categoryName: '医疗险', typeId: 1 },
      { id: 10, name: '运动险', categoryName: '运动险', typeId: 1 },
      { id: 11, name: '团体雇主险', categoryName: '团体雇主险', typeId: 2 },
      { id: 12, name: '建工团意', categoryName: '建工团意', typeId: 3 },
      { id: 13, name: '建工安责', categoryName: '建工安责', typeId: 3 },
      { id: 14, name: '建工一切', categoryName: '建工一切', typeId: 3 },
      { id: 15, name: '超赔险', categoryName: '超赔险', typeId: 5 },
      { id: 16, name: '驾乘险', categoryName: '驾乘险', typeId: 5 },
      { id: 17, name: '随车雇主', categoryName: '随车雇主', typeId: 5 }
    ].filter(insurance => insurance.typeId === parseInt(typeId))
  }
}

// 处理成交状态变化
const handleDealStatusChange = () => {
  if (formData.dealStatus === 'pending') {
    // 设置默认提醒时间为当前时间+3天
    const reminderDate = new Date()
    reminderDate.setDate(reminderDate.getDate() + 3)
    formData.reminderTime = reminderDate.toISOString().split('T')[0]
    
    // 清空已成交相关字段
    formData.policyNumber = ''
    formData.dealTime = ''
  } else if (formData.dealStatus === 'approved') {
    // 设置默认成交时间为当前时间
    formData.dealTime = new Date().toISOString().split('T')[0]
    
    // 清空跟进中相关字段
    formData.reminderTime = ''
  } else if (formData.dealStatus === 'rejected') {
    // 清空所有时间字段
    formData.reminderTime = ''
    formData.dealTime = ''
    formData.policyNumber = ''
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置险种名称
  specificInsurances.value = []
  // 设置默认成交状态
  formData.dealStatus = 'pending' // 跟进中
  // 设置默认客户类型
  formData.clientType = 'personal'
  // 设置默认提醒时间
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() + 3)
  formData.reminderTime = reminderDate.toISOString().split('T')[0]
}

// 处理取消按钮点击事件
const handleCancel = () => {
  router.push('/dashboard')
}

// 提交表单
const submitForm = async () => {
  try {
    loading.value = true
    
    // 表单验证
    if (!formRef.value) return
    await formRef.value.validate()
    
    // 提交数据
    const response = await businessService.addBusiness(formData)
    
    if (response.code === 200) {
      ElMessage.success('业务登记成功')
      router.push('/dashboard')
    } else {
      ElMessage.error(response.message || '业务登记失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    // 如果是表单验证失败，Element Plus会自动显示错误信息
    // 这里只处理其他类型的错误
    if (error.name !== 'Error') {
      ElMessage.error('业务登记失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}



// 初始化
onMounted(async () => {
  await initData()
})
</script>

<style scoped>
/* 组件特定的样式 */
.business-register-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h2 {
  font-weight: 600;
  color: #1f2937;
}

.page-header p {
  color: #6b7280;
  margin-top: 8px;
}

.register-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 32px;
  background-color: white;
}

.form-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.section-divider {
  margin-bottom: 24px;
  border-color: #e5e7eb;
}

.search-container {
  position: relative;
}

.search-input {
  margin-bottom: 4px;
}

/* 表单按钮区 */
.form-actions {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

/* 表单组件样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.el-select),
:deep(.el-input),
:deep(.el-input-number) {
  width: 100%;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .business-register-page {
    padding: 16px;
  }
  
  .register-card {
    padding: 20px;
  }
  
  :deep(.el-form-item__label) {
    width: 100px !important;
  }
  
  :deep(.el-col-xs-24) {
    margin-bottom: 16px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions .el-button {
    margin: 8px 0 !important;
  }
}

@media (max-width: 576px) {
  :deep(.el-form-item__label) {
    width: 80px !important;
    font-size: 12px;
  }
  
  :deep(.el-form-item__content) {
    margin-left: 90px !important;
  }
}
</style>