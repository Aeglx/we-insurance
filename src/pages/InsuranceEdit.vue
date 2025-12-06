<template>
  <div class="insurance-edit-page">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800">编辑保险产品</h1>
        <button 
          @click="goBack" 
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          <i class="fas fa-arrow-left mr-2"></i>返回列表
        </button>
      </div>

      <!-- 编辑表单 -->
      <div class="bg-white rounded-lg shadow-md p-6 card-shadow">
        <el-form 
          ref="formRef" 
          :model="formData" 
          :rules="rules" 
          label-width="120px" 
          class="insurance-form"
        >
          <!-- 基本信息 -->
          <h2 class="text-xl font-semibold mb-4 text-gray-700">基本信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <el-form-item label="险种名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入险种名称" />
            </el-form-item>

            <el-form-item label="险种代码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入险种代码" />
            </el-form-item>

            <el-form-item label="险种分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择险种分类">
                <el-option 
                  v-for="category in categories" 
                  :key="category.id" 
                  :label="category.name" 
                  :value="category.name" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-switch 
                v-model="formData.status" 
                active-text="启用" 
                inactive-text="禁用"
                active-color="#1890ff"
                inactive-color="#d9d9d9"
              />
            </el-form-item>
          </div>

          <!-- 产品图片 -->
          <h2 class="text-xl font-semibold mt-8 mb-4 text-gray-700">产品图片</h2>
          <el-form-item label="封面图片">
            <ImageUploader 
              v-model="formData.imageUrl" 
              :max-size="2" 
              :max-count="1"
              @upload-success="handleImageChange"
            />
            <div v-if="formData.imageUrl" class="mt-4">
              <div class="text-sm text-gray-500 mb-2">当前图片：</div>
              <div class="relative w-full aspect-video overflow-hidden rounded border">
                <img :src="getImageUrl(formData.imageUrl)" alt="当前图片" class="w-full h-full object-cover" />
              </div>
            </div>
          </el-form-item>

          <!-- 产品描述 -->
          <h2 class="text-xl font-semibold mt-8 mb-4 text-gray-700">产品描述</h2>
          <el-form-item label="详细描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="6"
              placeholder="请输入产品详细描述"
            />
          </el-form-item>

          <!-- 操作按钮 -->
          <div class="flex justify-end space-x-3 mt-12">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitForm" :loading="loading">保存修改</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import insuranceService from '../services/insuranceService'
import ImageUploader from '../components/common/ImageUploader.vue'
import { API_BASE_URL, IMAGE_BASE_URL } from '../config/api'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const insuranceId = route.params.id

// 险种分类
const categories = ref([])

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  category: '',
  category_id: '',
  status: true,
  description: '',
  image: null,
  imageUrl: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入险种名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入险种代码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择险种分类', trigger: 'change' }
  ],
  description: [
    { max: 500, message: '描述最多 500 个字符', trigger: 'blur' }
  ]
}

// 加载险种分类
const loadCategories = async () => {
  try {
    const response = await insuranceService.getInsuranceCategories()
    if (response.code === 200) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('加载险种分类失败:', error)
    ElMessage.error('加载险种分类失败')
  }
}

// 加载险种详情
const loadInsuranceDetail = async () => {
  try {
    loading.value = true
    const response = await insuranceService.getInsuranceDetail(insuranceId)
    if (response.code === 200) {
      // 响应拦截器返回的是后端的response.data，包含code、message和data字段
      const data = response.data
      formData.name = data.name
      formData.code = data.code
      formData.category = data.category || ''
      formData.category_id = data.category_id || ''
      formData.status = data.status === 1
      formData.description = data.description
      formData.imageUrl = data.image ? data.image : ''
    }
  } catch (error) {
    console.error('加载险种详情失败:', error)
    ElMessage.error('加载险种详情失败')
  } finally {
    loading.value = false
  }
}

// 图片上传处理
const handleImageChange = (imageUrl) => {
  // 图片上传成功后，直接使用返回的URL
  formData.imageUrl = imageUrl
  // 由于图片已经上传到服务器，这里不需要再提交File对象
  formData.image = null
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 查找选中分类的ID
    const selectedCategory = categories.value.find(cat => cat.name === formData.category)
    
    // 准备提交数据
    const submitData = {
      name: formData.name,
      code: formData.code,
      category_id: selectedCategory ? selectedCategory.id : formData.category_id,
      status: formData.status,
      description: formData.description,
      image: formData.imageUrl // 直接使用服务器返回的图片URL
    }
    
    // 更新险种
    const response = await insuranceService.updateInsurance(insuranceId, submitData)
    
    if (response.code === 200) {
      ElMessage.success('修改成功')
      router.push(`/management/insurance/detail/${insuranceId}`)
    } else {
      ElMessage.error(response.message || '修改失败')
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error('修改失败，请重试')
  } finally {
    loading.value = false
  }
}

// 获取图片URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  // 如果是完整URL则直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  // 如果已经以/uploads/开头，则直接返回，避免重复拼接
  if (imagePath.startsWith('/uploads/')) {
    return imagePath
  }
  // 否则拼接基础URL
  return `${IMAGE_BASE_URL}${imagePath}`
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重新加载数据
  loadInsuranceDetail()
}

// 返回列表
const goBack = () => {
  router.push('/management')
}

// 初始化
onMounted(() => {
  loadCategories()
  loadInsuranceDetail()
})
</script>

<style scoped>
.insurance-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.insurance-form {
  max-width: 100%;
}

.insurance-form h2 {
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eaeaea;
}

.card-shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.card-shadow:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
}
</style>