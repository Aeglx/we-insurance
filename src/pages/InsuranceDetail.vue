<template>
  <div class="insurance-detail-page min-h-screen bg-gray-50">
    <!-- 产品封面区域 -->
    <div class="relative w-full bg-white">
      <div class="relative w-full aspect-video overflow-hidden">
        <img 
          v-if="insuranceData.image" 
          :src="getImageUrl(insuranceData.image)" 
          :alt="insuranceData.name" 
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        <div v-else class="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
          <div class="text-white text-center">
            <svg class="w-20 h-20 mx-auto mb-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
        
        <!-- 产品信息叠加层 -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end items-start p-6 md:p-10">
          <div class="max-w-7xl w-full mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div class="text-white">
                <span 
                  class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  :class="insuranceData.status ? 'bg-green-500' : 'bg-gray-500'"
                >
                  {{ insuranceData.status ? '在售' : '停售' }}
                </span>
                <h1 class="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight mb-3">
                  {{ insuranceData.name || '险种详情' }}
                </h1>
                <p class="text-white/90 text-lg max-w-3xl mb-4">
                  {{ insuranceData.tagline || '保障全面，值得信赖' }}
                </p>
                
                <!-- 产品关键信息 -->
                <div class="flex flex-wrap gap-6 text-white/90">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>年龄限制：{{ insuranceData.ageLimit || '18-60周岁' }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>保障期限：{{ insuranceData.term || '1年' }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                    <span>限购份数：{{ insuranceData.limit || '1份' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex space-x-3 bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <button 
                  class="inline-flex items-center px-4 py-2 border border-white/30 rounded-lg shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                  @click="router.push('/management')"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  返回列表
                </button>
                <button 
                  class="inline-flex items-center px-4 py-2 border border-white/30 rounded-lg shadow-sm text-sm font-medium text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="insuranceData.id && router.push(`/management/insurance/edit/${insuranceData.id}`)"
                  :disabled="!insuranceData.id"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  编辑产品
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航标签页 -->
    <div class="sticky top-0 bg-white shadow-sm z-10 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex overflow-x-auto no-scrollbar">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            class="flex-shrink-0 px-5 py-4 text-base font-medium transition-colors duration-200"
            :class="activeTab === tab.key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="max-w-7xl mx-auto py-8 px-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- 左侧：产品信息和保障详情 -->
        <div class="lg:col-span-3 space-y-8">
          <!-- 保障详情内容 -->
          <div v-if="activeTab === 'coverage'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- 方案选择 -->
            <div class="border-b border-gray-200">
              <div class="px-6 py-4">
                <h2 class="text-xl font-bold text-gray-800 mb-4">保障详情</h2>
                <div class="flex space-x-3">
                  <button 
                    v-for="plan in plans" 
                    :key="plan.id"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    :class="activePlan === plan.id ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'"
                    @click="activePlan = plan.id"
                  >
                    {{ plan.name }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 保障内容 -->
            <div class="px-6 py-6">
              <div class="space-y-4">
                <div v-for="item in currentPlan.coverages" :key="item.id" class="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <span class="text-gray-700">{{ item.name }}</span>
                  <span class="text-gray-900 font-semibold">{{ item.amount }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 产品优势内容 -->
          <div v-else-if="activeTab === 'advantages'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">产品优势</h2>
            <div class="space-y-5">
              <div v-for="(advantage, index) in advantages" :key="index" class="flex gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {{ index + 1 }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ advantage.title }}</h3>
                  <p class="text-gray-600">{{ advantage.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 投保须知内容 -->
          <div v-else-if="activeTab === 'instructions'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">投保须知</h2>
            <div class="prose max-w-none text-gray-700">
              <div v-if="insuranceData.instructions" class="whitespace-pre-line">
                {{ insuranceData.instructions }}
              </div>
              <div v-else class="text-gray-500 italic">
                暂无投保须知信息
              </div>
            </div>
          </div>
          
          <!-- 理赔流程内容 -->
          <div v-else-if="activeTab === 'claims'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">理赔流程</h2>
            <div class="space-y-6">
              <div v-for="(step, index) in claimsProcess" :key="index" class="flex gap-6">
                <div class="flex-shrink-0 relative">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold z-10">
                    {{ index + 1 }}
                  </div>
                  <div v-if="index < claimsProcess.length - 1" class="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-blue-200"></div>
                </div>
                <div class="pt-1 pb-6">
                  <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ step.title }}</h3>
                  <p class="text-gray-600">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 常见问题内容 -->
          <div v-else-if="activeTab === 'faq'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">常见问题</h2>
            <div class="space-y-4">
              <div v-for="(faq, index) in faqs" :key="index" class="border-b border-gray-100 pb-4 last:border-b-0">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ faq.question }}</h3>
                <p class="text-gray-600">{{ faq.answer }}</p>
              </div>
            </div>
          </div>
          
          <!-- 产品描述内容 -->
          <div v-else-if="activeTab === 'description'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">产品详情</h2>
            <div class="prose max-w-none text-gray-700">
              <div class="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <p v-if="insuranceData.description" class="leading-relaxed whitespace-pre-line">
                  {{ insuranceData.description }}
                </p>
                <p v-else class="text-gray-500 italic text-center py-8">
                  暂无产品描述信息
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：购买边栏 -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <!-- 产品价格卡片 -->
            <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <h3 class="text-lg font-bold text-gray-800">{{ currentPlan.name }}</h3>
              </div>
              <div class="px-6 py-6">
                <div class="text-center mb-6">
                  <span class="text-sm text-gray-500">保费</span>
                  <div class="mt-1">
                    <span class="text-3xl font-bold text-blue-600">¥{{ currentPlan.price }}</span>
                    <span class="text-sm text-gray-500 ml-1">起</span>
                  </div>
                </div>
                
                <!-- 保障亮点 -->
                <div class="space-y-3 mb-6">
                  <div class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-sm text-gray-600">{{ currentPlan.highlight }}</span>
                  </div>
                </div>
                
                <!-- 购买按钮 -->
                <button class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                  立即购买
                </button>
              </div>
            </div>
            
            <!-- 推广链接 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div class="text-sm text-gray-500 mb-2">推广链接</div>
              <button class="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200 border border-gray-200">
                打开产品海报
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import insuranceService from '../services/insuranceService'
import { API_BASE_URL, IMAGE_BASE_URL } from '../config/api'

const router = useRouter()
const route = useRoute()
const insuranceData = ref({
  id: '',
  name: '',
  code: '',
  categoryId: '',
  categoryName: '',
  description: '',
  status: true,
  image: '',
  createTime: '',
  updateTime: '',
  tagline: '',
  ageLimit: '',
  term: '',
  limit: '',
  instructions: '',
  coverages: []
})

// 标签页状态
const activeTab = ref('coverage')
const tabs = [
  { key: 'coverage', label: '保障详情' },
  { key: 'advantages', label: '产品优势' },
  { key: 'instructions', label: '投保须知' },
  { key: 'claims', label: '理赔流程' },
  { key: 'faq', label: '常见问题' },
  { key: 'description', label: '产品详情' }
]

// 保障方案
const activePlan = ref('plan1')
const plans = [
  { 
    id: 'plan1', 
    name: '方案一', 
    price: 598, 
    highlight: '适合日常出行保障',
    coverages: [
      { id: 'c1', name: '平安非机动车第三者责任险（含超标车）', amount: '10万元' },
      { id: 'c2', name: '法律费用补偿', amount: '2000元' },
      { id: 'c3', name: '救护车费用补偿', amount: '500元' },
      { id: 'c4', name: '一般意外身故残疾', amount: '1万元' },
      { id: 'c5', name: '一般意外医疗', amount: '1000元' },
      { id: 'c6', name: '摩托车、拖拉机意外身故残疾', amount: '1万元' }
    ] 
  },
  { 
    id: 'plan2', 
    name: '方案二', 
    price: 898, 
    highlight: '增强版保障方案',
    coverages: [
      { id: 'c1', name: '平安非机动车第三者责任险（含超标车）', amount: '20万元' },
      { id: 'c2', name: '法律费用补偿', amount: '5000元' },
      { id: 'c3', name: '救护车费用补偿', amount: '1000元' },
      { id: 'c4', name: '一般意外身故残疾', amount: '2万元' },
      { id: 'c5', name: '一般意外医疗', amount: '2000元' },
      { id: 'c6', name: '摩托车、拖拉机意外身故残疾', amount: '2万元' }
    ] 
  },
  { 
    id: 'plan3', 
    name: '方案三', 
    price: 1298, 
    highlight: '全面保障方案',
    coverages: [
      { id: 'c1', name: '平安非机动车第三者责任险（含超标车）', amount: '50万元' },
      { id: 'c2', name: '法律费用补偿', amount: '10000元' },
      { id: 'c3', name: '救护车费用补偿', amount: '2000元' },
      { id: 'c4', name: '一般意外身故残疾', amount: '5万元' },
      { id: 'c5', name: '一般意外医疗', amount: '5000元' },
      { id: 'c6', name: '摩托车、拖拉机意外身故残疾', amount: '5万元' }
    ] 
  }
]

// 计算当前选中的方案
const currentPlan = computed(() => {
  return plans.find(plan => plan.id === activePlan.value) || plans[0]
})

// 产品优势
const advantages = [
  { title: '保障全面', description: '覆盖非机动车第三者责任、意外身故残疾、意外医疗等多方面保障' },
  { title: '价格实惠', description: '多种方案选择，满足不同需求，性价比高' },
  { title: '理赔便捷', description: '线上报案，快速理赔，专业团队全程服务' },
  { title: '投保简单', description: '在线投保，流程简便，即时生效' }
]

// 理赔流程
const claimsProcess = [
  { title: '报案', description: '发生保险事故后，及时拨打客服电话报案' },
  { title: '提交材料', description: '准备相关理赔材料，在线或线下提交' },
  { title: '审核', description: '保险公司审核理赔材料，确定赔偿金额' },
  { title: '赔付', description: '审核通过后，将赔偿金额支付到指定账户' }
]

// 常见问题
const faqs = [
  { question: '投保年龄限制是多少？', answer: '本产品适合18-60周岁的人群投保。' },
  { question: '保险期限是多久？', answer: '保险期限为1年，到期后可以续保。' },
  { question: '如何申请理赔？', answer: '发生保险事故后，可拨打客服电话或通过APP在线申请理赔。' },
  { question: '保障范围包括哪些？', answer: '保障范围包括非机动车第三者责任、意外身故残疾、意外医疗等。' }
]

// 获取险种详情
const loadInsuranceDetail = async () => {
  try {
    const id = route.params.id
    const response = await insuranceService.getInsuranceDetail(id)
    if (response.code === 200) {
      // 响应拦截器返回的是后端的response.data，包含code、message和data字段
      insuranceData.value = response.data
    }
  } catch (error) {
    console.error('加载险种详情失败:', error)
    router.push('/management')
  }
}

// 获取图片URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  // 调试信息
  console.log('Image path:', imagePath)
  console.log('Image base URL:', IMAGE_BASE_URL)
  
  // 如果是完整URL则直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  // 如果已经以/uploads/开头，则直接返回，避免重复拼接
  if (imagePath.startsWith('/uploads/')) {
    return imagePath
  }
  // 否则拼接基础URL
  const fullUrl = `${IMAGE_BASE_URL}${imagePath}`
  console.log('Full image URL:', fullUrl)
  return fullUrl
}

// 图片加载错误处理
const handleImageError = (event) => {
  console.error('Image loading error:', event)
  console.error('Image src:', event.target.src)
  // 可以在这里设置默认图片
  event.target.src = '/default-image.jpg'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 初始化
onMounted(async () => {
  await loadInsuranceDetail()
})
</script>

<style scoped>
/* 基础样式 */
.insurance-detail-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 自定义滚动条 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 加载动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.insurance-detail-page > div {
  animation: fadeIn 0.6s ease-out;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .insurance-detail-page .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 768px) {
  /* 调整封面信息布局 */
  .insurance-detail-page .absolute .flex-col {
    gap: 3rem;
  }
  
  /* 调整操作按钮大小 */
  .insurance-detail-page .absolute button {
    padding: 0.625rem 1.25rem !important;
    font-size: 0.875rem !important;
  }
  
  /* 调整卡片内边距 */
  .insurance-detail-page .bg-white.rounded-xl {
    padding: 1.5rem !important;
  }
  
  /* 调整标签页 */
  .insurance-detail-page .sticky.top-0 {
    position: relative;
  }
  
  /* 调整方案选择 */
  .insurance-detail-page .border-b .flex.space-x-3 {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  /* 调整标题字体大小 */
  .insurance-detail-page h1 {
    font-size: 1.75rem !important;
  }
  
  /* 调整关键信息布局 */
  .insurance-detail-page .flex.flex-wrap.gap-6 {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  /* 调整保障详情字体大小 */
  .insurance-detail-page .space-y-4 .flex .text-gray-700,
  .insurance-detail-page .space-y-4 .flex .text-gray-900 {
    font-size: 0.875rem;
  }
}
</style>