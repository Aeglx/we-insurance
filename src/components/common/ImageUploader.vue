<template>
  <div class="image-uploader">
    <div class="upload-area" @click="triggerFileInput" :class="{ 'has-image': imagePreview }">
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        @change="handleFileChange"
        class="file-input"
      >
      
      <div v-if="!imagePreview" class="upload-placeholder">
        <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>{{ uploadText || '点击上传图片' }}</p>
        <p class="upload-tip">{{ tipText || '支持 JPG、PNG、GIF、WEBP 格式，大小不超过 10MB' }}</p>
      </div>
      
      <div v-else class="image-preview">
        <img :src="imagePreview" alt="Preview">
        <button class="remove-btn" @click.stop="removeImage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div v-if="uploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <span>{{ uploadProgress }}%</span>
      </div>
    </div>
    
    <div v-if="error" class="upload-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import axios from 'axios'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'general' // policies, certificates, agents, customers
  },
  uploadText: {
    type: String,
    default: ''
  },
  tipText: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'remove'])

// Refs
const fileInput = ref(null)
const imagePreview = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')

// Watch modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    imagePreview.value = newValue
  } else {
    imagePreview.value = ''
  }
}, { immediate: true })

// Trigger file input click
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

// Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = '只允许上传 JPG、PNG、GIF、WEBP 格式的图片'
    return
  }
  
  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = '图片大小不能超过 10MB'
    return
  }
  
  // Preview image
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
    uploadImage(file)
  }
  reader.readAsDataURL(file)
}

// Upload image to server
const uploadImage = async (file) => {
  uploading.value = true
  uploadProgress.value = 0
  error.value = ''
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', props.type)
    
    const response = await axios.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
      }
    })
    
    if (response.data.success) {
      const imageUrl = response.data.imageUrl
      emit('update:modelValue', imageUrl)
      emit('upload-success', imageUrl)
    } else {
      throw new Error(response.data.error || '上传失败')
    }
  } catch (err) {
    error.value = err.message || '上传失败，请稍后重试'
    emit('upload-error', err)
    // 清除预览
    imagePreview.value = props.modelValue
  } finally {
    uploading.value = false
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// Remove image
const removeImage = () => {
  imagePreview.value = ''
  emit('update:modelValue', '')
  emit('remove')
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
  max-width: 500px;
}

.upload-area {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.04);
}

.upload-area.has-image {
  border-style: solid;
  padding-top: 0;
  height: 200px;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.upload-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #d9d9d9;
  transition: color 0.3s;
}

.upload-area:hover .upload-icon {
  color: #1890ff;
}

.upload-placeholder p {
  margin: 0;
  font-size: 16px;
}

.upload-tip {
  font-size: 12px !important;
  margin-top: 8px !important;
  color: #bfbfbf;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.remove-btn svg {
  width: 16px;
  height: 16px;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 3;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s;
}

.upload-error {
  margin-top: 8px;
  color: #ff4d4f;
  font-size: 14px;
}
</style>