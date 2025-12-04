<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div v-if="activeTab === 'agent'">
          <h1 class="text-xl font-semibold text-gray-800">业务员管理</h1>
        </div>
        <div v-else-if="activeTab === 'insurance'">
          <h1 class="text-xl font-semibold text-gray-800">险种管理</h1>
        </div>
        <button 
          @click="addItem" 
          v-if="activeTab === 'agent'" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <i class="fas fa-plus mr-1"></i>添加业务员
        </button>
      </div>
    </div>
    
    <!-- 标签页导航 -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex space-x-8 overflow-x-auto">
          <button 
            @click="activeTab = 'agent'" 
            :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'agent' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          >
            业务员管理
          </button>
          <button 
            @click="activeTab = 'insurance'" 
            :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'insurance' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          >
            险种管理
          </button>

        </div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 险种管理 -->
        <div v-if="activeTab === 'insurance'">
          <!-- 搜索和分类管理区域 -->
          <div class="bg-white rounded-lg shadow-md p-4 mb-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center space-x-3">
                <input 
                  type="text" 
                  v-model="insuranceSearchKeyword" 
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="搜索险种名称或代码"
                >
                <button 
                  @click="searchInsurance" 
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <i class="fas fa-search mr-1"></i>搜索
                </button>
              </div>
              <div class="flex items-center space-x-3">
                <button 
                  @click="openCategoryModal" 
                  class="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                >
                  <i class="fas fa-tags mr-1"></i>管理分类
                </button>
                <button 
                  @click="addItem" 
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <i class="fas fa-plus mr-1"></i>新增险种
                </button>
              </div>
            </div>
          </div>
        
        <!-- 险种列表 -->
        <div class="bg-white rounded-lg shadow-md p-4">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    险种名称
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    险种代码
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    险种分类
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in insuranceList" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ item.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.code }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.categoryName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {{ item.description }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['px-2 py-1 text-xs rounded-full', item.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                      {{ item.status ? '启用' : '禁用' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(item.createTime) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="editItem(item)" 
                      class="text-primary hover:text-primary-dark mr-3"
                      title="编辑"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="deleteItem('insurance', item.id)" 
                      class="text-error hover:text-error-dark"
                      title="删除"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 空数据提示 -->
          <div v-if="insuranceList.length === 0" class="text-center py-12">
            <i class="fas fa-shield-alt text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">暂无险种数据</p>
          </div>
        </div>
      </div>
      
      <!-- 业务员管理 -->
      <div v-if="activeTab === 'agent'">
        <!-- 搜索和添加区域 -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
              <input 
                type="text" 
                v-model="agentSearchKeyword" 
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="搜索业务员名称或电话"
              >
              <button 
                @click="searchAgent" 
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <i class="fas fa-search mr-1"></i>搜索
              </button>
            </div>
            <div class="flex space-x-3">
              <button 
                @click="downloadTemplate" 
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <i class="fas fa-download mr-1"></i>下载模板
              </button>
              <button 
                @click="openImportModal" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <i class="fas fa-upload mr-1"></i>批量导入
              </button>
              <button 
                @click="addItem" 
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <i class="fas fa-plus mr-1"></i>添加业务员
              </button>
            </div>
          </div>
        </div>
        <!-- 业务员列表 -->
        <div class="bg-white rounded-lg shadow-md">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系电话
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    电子邮箱
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属部门
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in agentList" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ item.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.phone }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.department || '未分配' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['px-2 py-1 text-xs rounded-full', item.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                      {{ item.status ? '在职' : '离职' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(item.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="editItem(item)" 
                      class="text-blue-600 hover:text-blue-800 mr-3"
                      title="编辑"
                    >
                      编辑
                    </button>
                    <button 
                      @click="deleteItem('agent', item.id)" 
                      class="text-red-600 hover:text-red-800"
                      title="删除"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 空数据提示 -->
          <div v-if="agentList.length === 0" class="text-center py-12">
            <i class="fas fa-user-tie text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">暂无业务员数据</p>
          </div>
          
          <!-- 分页 -->
          <div v-if="agentList.length > 0" class="flex justify-between items-center px-6 py-3 bg-white border-t border-gray-200">
            <div class="text-sm text-gray-500">
              共 {{ agentList.length }} 条记录
            </div>
            <div class="flex items-center space-x-1">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="px-2 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button 
                class="px-3 py-1 border rounded-md text-sm font-medium bg-blue-100 text-blue-800"
              >
                1
              </button>
              <button 
                class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                2
              </button>
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="px-2 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      

      
      <!-- 险种分类管理模态框 -->
      <div v-if="categoryModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">{{ editingCategory ? '编辑分类' : '分类管理' }}</h3>
            <button @click="closeCategoryModal" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="p-6">
            <!-- 新增分类 -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 mb-2">新增分类</h4>
              <div class="flex space-x-2">
                <input 
                  v-model="newCategoryName" 
                  type="text" 
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="输入新的分类名称"
                >
                <button 
                  @click="addInsuranceCategory" 
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            
            <!-- 分类列表 -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">分类列表</h4>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                <div 
                  v-for="category in insuranceCategories" 
                  :key="category.id" 
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div v-if="editingCategory === category.id" class="flex-1">
                    <input 
                      v-model="editingCategoryName" 
                      type="text" 
                      class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                  </div>
                  <span v-else class="flex-1">{{ category.name }}</span>
                  <div class="flex space-x-2">
                    <button 
                      v-if="editingCategory === category.id" 
                      @click="saveCategoryEdit(category)" 
                      class="text-green-600 hover:text-green-800"
                      title="保存"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button 
                      v-if="editingCategory === category.id" 
                      @click="cancelCategoryEdit" 
                      class="text-gray-600 hover:text-gray-800"
                      title="取消"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button 
                      v-else 
                      @click="editInsuranceCategory(category)" 
                      class="text-blue-600 hover:text-blue-800"
                      title="编辑"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="deleteInsuranceCategory(category.id)" 
                      class="text-red-600 hover:text-red-800"
                      title="删除"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button 
              @click="closeCategoryModal" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      <!-- 新增模态框 -->
      <div v-if="isModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800">{{ modalTitle }}</h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- 险种表单 -->
            <div v-if="modalType === 'insurance'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">险种名称</label>
                <input 
                  v-model="formData.insurance.name" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入险种名称"
                >
                <p v-if="formErrors.name" class="text-sm text-error mt-1">{{ formErrors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">险种代码</label>
                <input 
                  v-model="formData.insurance.code" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="系统自动生成"
                  readonly
                >
                <p v-if="formErrors.code" class="text-sm text-error mt-1">{{ formErrors.code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">险种分类</label>
                <div class="flex items-center">
                  <select 
                    v-model="formData.insurance.category" 
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">请选择险种分类</option>
                    <option v-for="category in insuranceCategories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                    <option value="new">+ 新增分类</option>
                  </select>
                </div>
                <div v-if="formData.insurance.category === 'new'" class="mt-2">
                  <input 
                    v-model="newCategoryName" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="请输入新的险种分类名称"
                  >
                </div>
                <p v-if="formErrors.category" class="text-sm text-error mt-1">{{ formErrors.category }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea 
                  v-model="formData.insurance.description" 
                  rows="3" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入险种描述"
                ></textarea>
              </div>
              <div class="flex items-center">
                <input 
                  v-model="formData.insurance.status" 
                  type="checkbox" 
                  class="mr-2"
                >
                <label class="text-sm font-medium text-gray-700">启用</label>
              </div>
            </div>
            
            <!-- 代理人表单 -->
            <div v-if="modalType === 'agent'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">代理人姓名</label>
                <input 
                  v-model="formData.agent.name" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入代理人姓名"
                >
                <p v-if="formErrors.name" class="text-sm text-error mt-1">{{ formErrors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">代理人代码</label>
                <input 
                  v-model="formData.agent.code" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="系统自动生成"
                  readonly
                >
                <p v-if="formErrors.code" class="text-sm text-error mt-1">{{ formErrors.code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input 
                  v-model="formData.agent.phone" 
                  type="tel" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入联系电话"
                >
                <p v-if="formErrors.phone" class="text-sm text-error mt-1">{{ formErrors.phone }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
                <select 
                  v-model="formData.agent.department" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">请选择所属部门</option>
                  <option value="直客">直客</option>
                  <option value="渠道">渠道</option>
                  <option value="合作">合作</option>
                </select>
                <p v-if="formErrors.department" class="text-sm text-error mt-1">{{ formErrors.department }}</p>
              </div>
              <div class="flex items-center">
                <input 
                  v-model="formData.agent.status" 
                  type="checkbox" 
                  class="mr-2"
                >
                <label class="text-sm font-medium text-gray-700">启用</label>
              </div>
            </div>
            
            <!-- 业务等级表单 -->
            <div v-if="modalType === 'businessLevel'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">业务等级名称</label>
                <input 
                  v-model="formData.businessLevel.name" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入业务等级名称"
                >
                <p v-if="formErrors.name" class="text-sm text-error mt-1">{{ formErrors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea 
                  v-model="formData.businessLevel.description" 
                  rows="3" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入业务等级描述"
                ></textarea>
              </div>
              <div class="flex items-center">
                <input 
                  v-model="formData.businessLevel.status" 
                  type="checkbox" 
                  class="mr-2"
                >
                <label class="text-sm font-medium text-gray-700">启用</label>
              </div>
            </div>
            
            <!-- 用户表单 -->
            <div v-if="modalType === 'user'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input 
                  v-model="formData.user.username" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入用户名"
                >
                <p v-if="formErrors.username" class="text-sm text-error mt-1">{{ formErrors.username }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input 
                  v-model="formData.user.password" 
                  type="password" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入密码"
                >
                <p v-if="formErrors.password" class="text-sm text-error mt-1">{{ formErrors.password }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input 
                  v-model="formData.user.name" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入姓名"
                >
                <p v-if="formErrors.name" class="text-sm text-error mt-1">{{ formErrors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select 
                  v-model="formData.user.role" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
                <p v-if="formErrors.role" class="text-sm text-error mt-1">{{ formErrors.role }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input 
                  v-model="formData.user.email" 
                  type="email" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入邮箱"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input 
                  v-model="formData.user.phone" 
                  type="tel" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="请输入联系电话"
                >
              </div>
              <div class="flex items-center">
                <input 
                  v-model="formData.user.status" 
                  type="checkbox" 
                  class="mr-2"
                >
                <label class="text-sm font-medium text-gray-700">启用</label>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="closeModal" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            >
              取消
            </button>
            <button 
              @click="submitForm" 
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 批量导入模态框 -->
  <div v-if="isImportModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">批量导入业务员</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">选择文件</label>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              @change="handleFileChange"
            >
            <p class="text-sm text-gray-500 mt-1">支持 .xlsx 和 .xls 格式文件</p>
            <p class="text-sm text-gray-500 mt-1">请先下载模板，按照模板格式填写数据后再导入</p>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="closeImportModal" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
          >
            取消
          </button>
          <button 
            @click="batchImport" 
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import insuranceService from '../services/insuranceService'
import agentService from '../services/agentService'

// 导入toast
const toast = inject('toast')

// 激活的标签页
const activeTab = ref('agent') // insurance, agent

// 模态框状态
const isModalVisible = ref(false)
const modalTitle = ref('')
const modalType = ref('agent')

// 险种列表
const insuranceList = ref([])
const insuranceSearchKeyword = ref('')

// 代理人列表
const agentList = ref([])
const agentSearchKeyword = ref('')

// 分页信息
const currentPage = ref(1)
const totalPages = ref(1)

// 新增表单数据
const formData = ref({
  insurance: {
    name: '',
    code: '',
    category: '',
    description: '',
    status: true
  },
  agent: {
    name: '',
    code: '',
    phone: '',
    department: '',
    status: true
  },
  currentId: null
})

// 表单验证错误信息
const formErrors = ref({})

// 险种分类列表（使用对象数组以便支持编辑和删除）
const insuranceCategories = ref([])
const newCategoryName = ref('')
const editingCategory = ref(null)
const categoryModalVisible = ref(false)
const maxCategoryId = ref(0)

// 初始化数据
onMounted(() => {
  loadInsuranceList()
  loadAgentList()
  loadInsuranceCategories()
})

// 加载险种列表
const loadInsuranceList = async () => {
  try {
    const response = await insuranceService.getInsuranceList()
    insuranceList.value = response.data || []
  } catch (error) {
      console.error('加载险种列表失败:', error)
      toast.error('加载险种列表失败')
    }
}

// 加载险种分类列表
const loadInsuranceCategories = async () => {
  try {
    const response = await insuranceService.getInsuranceCategories()
    // 更新险种分类列表
    if (response.data) {
      insuranceCategories.value = response.data
      // 更新最大分类ID
      if (insuranceCategories.value.length > 0) {
        maxCategoryId.value = Math.max(...insuranceCategories.value.map(category => category.id))
      }
    }
  } catch (error) {
      console.error('加载险种分类列表失败:', error)
      toast.error('加载险种分类列表失败')
    }
}

// 加载代理人列表
const loadAgentList = async () => {
  try {
    const response = await agentService.getAgentList()
    agentList.value = response.data || []
  } catch (error) {
      console.error('加载代理人列表失败:', error)
      toast.error('加载代理人列表失败')
    }
}

// 搜索险种
const searchInsurance = async () => {
  try {
    const response = await insuranceService.getInsuranceList({ keyword: insuranceSearchKeyword.value })
    insuranceList.value = response.data || []
  } catch (error) {
      console.error('搜索险种失败:', error)
      toast.error('搜索险种失败')
    }
}

// 搜索代理人
const searchAgent = async () => {
  try {
    const response = await agentService.searchAgent(agentSearchKeyword.value)
    agentList.value = response.data || []
  } catch (error) {
      console.error('搜索代理人失败:', error)
      toast.error('搜索代理人失败')
    }
}

// 险种分类编辑相关
const editingCategoryName = ref('')

// 打开分类管理模态框
const openCategoryModal = () => {
  categoryModalVisible.value = true
  editingCategory.value = null
  editingCategoryName.value = ''
  newCategoryName.value = ''
}

// 关闭分类管理模态框
const closeCategoryModal = () => {
  categoryModalVisible.value = false
  editingCategory.value = null
  editingCategoryName.value = ''
  newCategoryName.value = ''
}

// 新增险种分类
const addInsuranceCategory = async () => {
  if (!newCategoryName.value.trim()) {
    toast.warning('请输入分类名称')
    return
  }
  
  // 检查分类是否已存在
  const categoryExists = insuranceCategories.value.some(category => category.name === newCategoryName.value.trim())
  if (categoryExists) {
    toast.warning('该分类已存在')
    return
  }
  
  try {
    // 调用API保存新分类到数据库
    const response = await insuranceService.addInsuranceCategory(newCategoryName.value.trim())
    if (response.code === 200) {
      // 生成新的分类ID
      maxCategoryId.value++
      // 添加到分类列表
      insuranceCategories.value.push({ id: response.data.id, name: newCategoryName.value.trim() })
      
      toast.success('分类添加成功')
      newCategoryName.value = ''
    }
  } catch (error) {
      console.error('添加险种分类失败:', error)
      toast.error('添加险种分类失败')
    }
}

// 编辑险种分类
const editInsuranceCategory = (category) => {
  editingCategory.value = category.id
  editingCategoryName.value = category.name
}

// 保存编辑的险种分类
const saveCategoryEdit = async (category) => {
  if (!editingCategoryName.value.trim()) {
    toast.warning('请输入分类名称')
    return
  }
  
  // 检查分类是否已存在（排除当前编辑的分类）
  const categoryExists = insuranceCategories.value.some(c => 
    c.name === editingCategoryName.value.trim() && c.id !== category.id
  )
  if (categoryExists) {
    toast.warning('该分类已存在')
    return
  }
  
  try {
    // 调用API更新分类到数据库
    const response = await insuranceService.updateInsuranceCategory(category.id, editingCategoryName.value.trim())
    if (response.code === 200) {
      // 更新分类名称
      const index = insuranceCategories.value.findIndex(c => c.id === category.id)
      if (index !== -1) {
        insuranceCategories.value[index].name = editingCategoryName.value.trim()
        
        toast.success('分类更新成功')
        editingCategory.value = null
        editingCategoryName.value = ''
      }
    }
  } catch (error) {
      console.error('更新险种分类失败:', error)
      toast.error('更新险种分类失败')
    }
}

// 取消编辑险种分类
const cancelCategoryEdit = () => {
  editingCategory.value = null
  editingCategoryName.value = ''
}

// 删除险种分类
const deleteInsuranceCategory = async (categoryId) => {
  // 检查是否有险种使用该分类
  const hasInsuranceUsingCategory = insuranceList.value.some(insurance => 
    insurance.category_id === categoryId
  )
  
  if (hasInsuranceUsingCategory) {
    toast.warning('该分类正在被险种使用，无法删除')
    return
  }
  
  // 确认删除
  if (confirm('确定要删除该分类吗？')) {
    try {
      // 调用API删除分类
      const response = await insuranceService.deleteInsuranceCategory(categoryId)
      if (response.code === 200) {
        // 从分类列表中删除
        insuranceCategories.value = insuranceCategories.value.filter(category => category.id !== categoryId)
        
        toast.success('分类删除成功')
      }
    } catch (error) {
      console.error('删除险种分类失败:', error)
      toast.error('删除险种分类失败')
    }
  }
}

// 新增项目
const addItem = () => {
  modalType.value = activeTab.value
  
  // 设置模态框标题
  if (activeTab.value === 'insurance') {
    modalTitle.value = '新增险种'
  } else if (activeTab.value === 'agent') {
    modalTitle.value = '添加业务员'
  }
  
  // 重置表单数据和错误信息
  formData.value = {
    insurance: {
      name: '',
      code: '',
      category: '',
      description: '',
      status: true
    },
    agent: {
      name: '',
      code: '',
      phone: '',
      department: '',
      status: true
    },
    currentId: null
  }
  
  // 为代理人自动生成代码
  if (modalType.value === 'agent') {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    formData.value.agent.code = `AGT${timestamp}${random}`
  } else if (modalType.value === 'insurance') {
    // 为险种自动生成代码
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    formData.value.insurance.code = `INS${timestamp}${random}`
  }
  
  formErrors.value = {}
  
  // 打开模态框
  isModalVisible.value = true
}

// 关闭模态框
const closeModal = () => {
  isModalVisible.value = false
  formErrors.value = {}
}

// 验证表单
const validateForm = () => {
  const errors = {}
  const currentForm = formData.value[modalType.value]
  
  // 通用验证
  if (!currentForm.name) {
    errors.name = '名称不能为空'
  }
  
  // 针对不同类型的表单进行验证
  if (modalType.value === 'insurance') {
    if (!currentForm.code) {
      errors.code = '险种代码不能为空'
    }
    if (!currentForm.category) {
      errors.category = '请选择险种分类'
    } else if (currentForm.category === 'new' && !newCategoryName.value) {
      errors.category = '请输入新的险种分类名称'
    }
  } else if (modalType.value === 'agent') {
    if (!currentForm.code) {
      errors.code = '业务员代码不能为空'
    }
    if (!currentForm.phone) {
      errors.phone = '联系电话不能为空'
    }
    if (!currentForm.department) {
      errors.department = '请选择所属部门'
    }
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

// 提交表单
const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    const currentForm = formData.value[modalType.value]
    
    if (modalType.value === 'insurance') {
      let finalCategory = currentForm.category
      let categoryIdToSubmit = currentForm.category
      
      // 处理新增分类的情况
      if (currentForm.category === 'new' && newCategoryName.value.trim()) {
        finalCategory = newCategoryName.value.trim()
        
        // 检查分类是否已存在
        const existingCategory = insuranceCategories.value.find(category => category.name === finalCategory)
        if (existingCategory) {
          categoryIdToSubmit = existingCategory.id
        } else {
          // 生成新的分类ID
          maxCategoryId.value++
          categoryIdToSubmit = maxCategoryId.value
          // 添加到分类列表
          insuranceCategories.value.push({ id: maxCategoryId.value, name: finalCategory })
          
          // 可以在这里调用API保存新分类到数据库
          // await insuranceService.addInsuranceCategory(finalCategory)
        }
      }
      
      // 更新表单中的分类值
      const formDataToSubmit = { ...currentForm, category: categoryIdToSubmit }
      
      if (formData.value.currentId) {
        // 编辑模式
        await insuranceService.updateInsurance(formData.value.currentId, formDataToSubmit)
        await loadInsuranceList()
        toast.success('编辑险种成功')
      } else {
        // 新增模式
        await insuranceService.addInsurance(formDataToSubmit)
        await loadInsuranceList()
        toast.success('新增险种成功')
      }
    } else if (modalType.value === 'agent') {
        if (formData.value.currentId) {
          // 编辑模式
          await agentService.updateAgent(formData.value.currentId, currentForm)
          await loadAgentList()
          toast.success('编辑业务员成功')
        } else {
          // 新增模式
          await agentService.addAgent(currentForm)
          await loadAgentList()
          toast.success('添加业务员成功')
        }
    }
    
    closeModal()
  } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
}

// 编辑项目
const editItem = (item) => {
  modalType.value = activeTab.value
  
  // 设置模态框标题
  if (activeTab.value === 'insurance') {
    modalTitle.value = '编辑险种'
  } else if (activeTab.value === 'agent') {
    modalTitle.value = '编辑业务员'
  }
  
  // 填充表单数据
  if (activeTab.value === 'insurance') {
    formData.value.insurance = {
      name: item.name,
      code: item.code,
      category: item.categoryId || item.category,
      description: item.description,
      status: item.status
    }
  } else if (activeTab.value === 'agent') {
    formData.value.agent = {
      name: item.name,
      code: item.code,
      phone: item.phone,
      email: item.email,
      department: item.department,
      status: item.status
    }
  }
  
  formErrors.value = {}
  
  // 保存当前编辑的项目ID
  formData.value.currentId = item.id
  
  // 打开模态框
  isModalVisible.value = true
}

// 批量导入相关
const isImportModalVisible = ref(false);
const selectedFile = ref(null);

// 打开导入模态框
const openImportModal = () => {
  isImportModalVisible.value = true;
  selectedFile.value = null;
};

// 关闭导入模态框
const closeImportModal = () => {
  isImportModalVisible.value = false;
};

// 选择文件
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

// 批量导入
const batchImport = async () => {
  if (!selectedFile.value) {
    toast.warning('请选择要导入的文件');
    return;
  }

  try {
    const result = await agentService.batchImportAgents(selectedFile.value);
    toast.success(result.message || `成功导入${result.data.count}条数据`);
    await loadAgentList();
    closeImportModal();
  } catch (error) {
    console.error('批量导入失败:', error);
    toast.error('批量导入失败');
  }
};

// 下载模板
const downloadTemplate = async () => {
  try {
    const blob = await agentService.downloadAgentTemplate();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'agent_import_template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('模板下载成功');
  } catch (error) {
    console.error('下载模板失败:', error);
    toast.error('下载模板失败');
  }
};

// 删除项目
const deleteItem = async (type, id) => {
  if (confirm('确定要删除该记录吗？')) {
    try {
      if (type === 'insurance') {
        await insuranceService.deleteInsurance(id)
        await loadInsuranceList()
        toast.success('删除险种成功')
      } else if (type === 'agent') {
        await agentService.deleteAgent(id)
        await loadAgentList()
        toast.success('删除业务员成功')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }
}

// 分页函数
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>