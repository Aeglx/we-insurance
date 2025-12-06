<template>
  <div class="test-page">
    <h1>图片上传测试</h1>
    
    <div class="test-section">
      <h2>通用图片上传</h2>
      <ImageUploader v-model="imageUrl" />
      <div class="result">
        <p>上传结果: {{ imageUrl || '未上传' }}</p>
        <img v-if="imageUrl" :src="imageUrl" alt="Uploaded" style="max-width: 300px; margin-top: 10px;">
      </div>
    </div>
    
    <div class="test-section">
      <h2>险种图片上传</h2>
      <ImageUploader v-model="policyImage" type="policies" upload-text="上传险种图片" />
      <div class="result">
        <p>上传结果: {{ policyImage || '未上传' }}</p>
        <img v-if="policyImage" :src="policyImage" alt="Uploaded" style="max-width: 300px; margin-top: 10px;">
      </div>
    </div>
    
    <div class="test-section">
      <h2>业务员图片上传</h2>
      <ImageUploader v-model="agentImage" type="agents" upload-text="上传业务员图片" />
      <div class="result">
        <p>上传结果: {{ agentImage || '未上传' }}</p>
        <img v-if="agentImage" :src="agentImage" alt="Uploaded" style="max-width: 300px; margin-top: 10px;">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploader from '../components/common/ImageUploader.vue'

const imageUrl = ref('')
const policyImage = ref('')
const agentImage = ref('')
</script>

<style scoped>
.test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
}

h2 {
  color: #666;
  margin-top: 30px;
  margin-bottom: 15px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.result {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.result p {
  margin: 0;
  color: #666;
}
</style>