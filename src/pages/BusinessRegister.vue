<template>
  <div class="business-register-page">
    <div class="page-header">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">业务登记</h2>
      <p class="text-gray-500">请填写完整的业务登记信息</p>
    </div>
    
    <el-card shadow="hover" class="register-card">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-position="right" label-width="120px">
        <!-- 基础信息区 -->
        <div class="form-section">
          <h3 class="section-title">基础信息区</h3>
          <el-divider class="section-divider"></el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="代理人" prop="agentId" required>
                <div class="search-container">
                  <el-input
                    v-model="searchAgent"
                    @input="handleAgentSearch"
                    @focus="handleAgentSearch"
                    placeholder="输入代理人姓名搜索"
                    clearable
                    class="search-input"
                  >
                    <template #append>
                      <el-button @click="showAddAgentModal = true" type="primary" icon="Plus" circle></el-button>
                    </template>
                  </el-input>
                  <el-select
                    v-model="formData.agentId"
                    @change="onAgentChange"
                    placeholder="请选择代理人"
                    class="w-full"
                    :popper-append-to-body="false"
                    filterable
                    remote
                    :remote-method="handleAgentSearch"
                  >
                    <el-option
                      v-for="agent in filteredAgents"
                      :key="agent.id"
                      :label="agent.name"
                      :value="agent.id"
                    ></el-option>
                  </el-select>
                </div>
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
              <el-form-item label="险种类型" prop="insuranceTypeId" required>
                <el-select
                  v-model="formData.insuranceTypeId"
                  placeholder="请选择险种类型"
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
              <el-form-item label="具体险种" prop="specificInsuranceId" required>
                <el-select
                  v-model="formData.specificInsuranceId"
                  placeholder="请选择具体险种"
                  class="w-full"
                  filterable
                  :disabled="!formData.insuranceTypeId"
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
              <el-form-item label="客户名称" prop="clientName" required>
                <el-input v-model="formData.clientName" placeholder="请输入客户名称" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人姓名" prop="personalName">
                <el-input v-model="formData.personalName" placeholder="请输入联系人姓名" clearable :disabled="!showPersonalName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公司名称" prop="companyName">
                <el-input v-model="formData.companyName" placeholder="请输入公司名称" clearable :disabled="showPersonalName"></el-input>
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
                  <el-option label="跟进中" value="跟进中"></el-option>
                  <el-option label="已成交" value="已成交"></el-option>
                  <el-option label="已失效" value="已失效"></el-option>
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
    
    <!-- 新增代理人模态框 -->
    <el-dialog
      title="新增代理人"
      v-model="showAddAgentModal"
      width="500px"
      center
    >
      <el-form :model="newAgentForm" :rules="agentFormRules" ref="agentFormRef" label-position="right" label-width="100px">
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="newAgentForm.name" placeholder="请输入代理人姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone" required>
          <el-input v-model="newAgentForm.phone" placeholder="请输入联系电话" clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newAgentForm.email" placeholder="请输入邮箱地址" clearable></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddAgentModal = false">取消</el-button>
          <el-button type="primary" @click="addAgent" :loading="addingAgent">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import businessService from '../services/businessService'
import agentService from '../services/agentService'
import insuranceService from '../services/insuranceService'
import underwriterService from '../services/underwriterService'
import { ElMessage } from 'element-plus'

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
  clientName: '',
  personalName: '',
  companyName: '',
  inquiryAmount: 0,
  dealStatus: '跟进中',
  reminderTime: '',
  policyNumber: '',
  dealTime: '',
  followUpRemark: ''
})

// 表单验证规则
const formRules = reactive({
  agentId: [{ required: true, message: '请选择代理人', trigger: 'change' }],
  underwriterId: [{ required: true, message: '请选择出单员', trigger: 'change' }],
  insuranceTypeId: [{ required: true, message: '请选择险种类型', trigger: 'change' }],
  specificInsuranceId: [{ required: true, message: '请选择具体险种', trigger: 'change' }],
  clientName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  inquiryAmount: [{ required: true, message: '请输入询价金额', trigger: 'blur' }, { type: 'number', min: 0, message: '询价金额不能为负数', trigger: 'blur' }],
  dealStatus: [{ required: true, message: '请选择成交状态', trigger: 'change' }],
  reminderTime: [{ required: true, message: '请选择提醒时间', trigger: 'change' }],
  policyNumber: [{ required: true, message: '请输入保单号', trigger: 'blur' }],
  dealTime: [{ required: true, message: '请选择成交时间', trigger: 'change' }]
})

// 代理人相关数据
const agents = ref([])
const filteredAgents = ref([])
const searchAgent = ref('')

// 出单员数据
const underwriters = ref([])

// 险种类型数据
const insuranceTypes = ref([])

// 具体险种数据
const specificInsurances = ref([])

// 加载状态
const loading = ref(false)
const addingAgent = ref(false)

// 新增代理人模态框
const showAddAgentModal = ref(false)
const newAgentForm = reactive({
  name: '',
  phone: '',
  email: ''
})

// 代理人表单验证规则
const agentFormRules = reactive({
  name: [{ required: true, message: '请输入代理人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
})

// 计算属性：根据险种类型显示个人姓名或企业名称
const showPersonalName = computed(() => {
  // 当险种类型为以下几种时显示个人姓名
  const personalInsuranceTypes = ['个人意外险', '健康险', '学平险', '运动险', '百万医疗', '医疗险']
  // 找到当前选中的险种类型
  const selectedType = insuranceTypes.value.find(type => type.id === formData.insuranceTypeId)
  return selectedType ? personalInsuranceTypes.includes(selectedType.name) : false
})

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
      filteredAgents.value = [...response.data]
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
    if (response.code === 200) {
      underwriters.value = response.data
    }
  } catch (error) {
    console.error('加载出单员数据失败:', error)
    ElMessage.error('加载出单员数据失败')
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
    ElMessage.error('加载险种类型数据失败')
  }
}

// 代理人搜索
const handleAgentSearch = (query) => {
  if (query) {
    filteredAgents.value = agents.value.filter(agent => 
      agent.name.toLowerCase().includes(query.toLowerCase())
    )
  } else {
    filteredAgents.value = [...agents.value]
  }
}

// 代理人选择变化
const onAgentChange = (agentId) => {
  // 当代理人改变时，可以在这里添加额外的处理逻辑
  if (!agentId) {
    searchAgent.value = ''
  } else {
    const selectedAgent = agents.value.find(agent => agent.id === agentId)
    if (selectedAgent) {
      searchAgent.value = selectedAgent.name
    }
  }
}

// 险种类型选择变化
const onInsuranceTypeChange = async (typeId) => {
  // 重置具体险种
  formData.specificInsuranceId = ''
  specificInsurances.value = []
  
  // 根据险种类型加载具体险种
  if (typeId) {
    await loadSpecificInsurances(typeId)
  }
}

// 加载具体险种
const loadSpecificInsurances = async (typeId) => {
  try {
    // 实际应该调用API获取数据
    // 这里使用模拟数据
    specificInsurances.value = [
      { id: 1, name: '个人意外险', typeId: 1 },
      { id: 2, name: '团体意外险', typeId: 2 },
      { id: 3, name: '学平险', typeId: 1 },
      { id: 4, name: '建工险', typeId: 3 },
      { id: 5, name: '燃气险', typeId: 4 },
      { id: 6, name: '雇主险', typeId: 2 },
      { id: 7, name: '健康险', typeId: 1 },
      { id: 8, name: '百万医疗', typeId: 1 },
      { id: 9, name: '医疗险', typeId: 1 },
      { id: 10, name: '运动险', typeId: 1 }
    ].filter(insurance => insurance.typeId === parseInt(typeId))
  } catch (error) {
    console.error('加载具体险种数据失败:', error)
    ElMessage.error('加载具体险种数据失败')
  }
}

// 处理成交状态变化
const handleDealStatusChange = () => {
  if (formData.dealStatus === '跟进中') {
    // 设置默认提醒时间为当前时间+3天
    const reminderDate = new Date()
    reminderDate.setDate(reminderDate.getDate() + 3)
    formData.reminderTime = reminderDate.toISOString().split('T')[0]
    
    // 清空已成交相关字段
    formData.policyNumber = ''
    formData.dealTime = ''
  } else if (formData.dealStatus === '已成交') {
    // 设置默认成交时间为当前时间
    formData.dealTime = new Date().toISOString().split('T')[0]
    
    // 清空跟进中相关字段
    formData.reminderTime = ''
  } else if (formData.dealStatus === '已失效') {
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
  // 重置具体险种
  specificInsurances.value = []
  // 设置默认成交状态
  formData.dealStatus = '跟进中'
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
    await formRef.value.validate((valid, fields) => {
      if (!valid) {
        console.log('表单验证失败:', fields)
        return false
      }
      return true
    })
    
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
    ElMessage.error('业务登记失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 新增代理人
const addAgent = async () => {
  try {
    addingAgent.value = true
    
    // 表单验证
    if (!agentFormRef.value) return
    await agentFormRef.value.validate((valid, fields) => {
      if (!valid) {
        console.log('代理人表单验证失败:', fields)
        return false
      }
      return true
    })
    
    // 提交新增代理人请求
    const response = await agentService.addAgent(newAgentForm)
    
    if (response.code === 200) {
      ElMessage.success('代理人新增成功')
      
      // 更新代理人列表
      await loadAgents()
      
      // 选择新添加的代理人
      if (response.data && response.data.id) {
        formData.agentId = response.data.id
        searchAgent.value = newAgentForm.name
      }
      
      // 关闭模态框并重置表单
      showAddAgentModal.value = false
      resetAgentForm()
    } else {
      ElMessage.error(response.message || '代理人新增失败')
    }
  } catch (error) {
    console.error('新增代理人失败:', error)
    ElMessage.error('代理人新增失败，请稍后重试')
  } finally {
    addingAgent.value = false
  }
}

// 重置代理人表单
const resetAgentForm = () => {
  if (agentFormRef.value) {
    agentFormRef.value.resetFields()
  }
  Object.assign(newAgentForm, { name: '', phone: '', email: '' })
}

// 初始化
onMounted(async () => {
  await initData()
})
</script>

<style scoped>
/* 组件特定的样式 */
.business-register-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

/* 输入框焦点样式优化 */
.input-focus:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 下拉菜单样式 */
.absolute {
  z-index: 100;
}

/* 新增按钮样式 */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 表单区块样式 */
.bg-white {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>