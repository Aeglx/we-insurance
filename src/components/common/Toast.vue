<template>
  <transition name="toast-fade">
    <div v-if="visible" :class="['fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg', toastClass]" role="alert">
      <div class="flex items-center">
        <i :class="['mr-2', iconClass]"></i>
        <div class="flex-1">{{ message }}</div>
        <button @click="close" class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 定义props
const props = defineProps({
  // 消息内容
  message: {
    type: String,
    default: ''
  },
  // 类型：success, error, warning, info
  type: {
    type: String,
    default: 'success'
  },
  // 显示时长（毫秒），0表示不自动关闭
  duration: {
    type: Number,
    default: 3000
  },
  // 是否显示
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['close'])

// 计算Toast的样式类
const toastClass = computed(() => {
  const baseClass = 'text-white'
  const typeClass = {
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-info'
  }
  
  return [baseClass, typeClass[props.type] || typeClass.success]
})

// 计算图标类
const iconClass = computed(() => {
  const typeIcon = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  }
  
  return typeIcon[props.type] || typeIcon.success
})

// 关闭Toast
const close = () => {
  emit('close')
}

// 自动关闭
onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>