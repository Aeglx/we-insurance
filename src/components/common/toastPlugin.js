// Toast插件
import { createApp } from 'vue'
import Toast from './Toast.vue'

// Toast实例和应用
let toastInstance = null
let toastApp = null

// Toast容器
const toastContainer = document.createElement('div')
document.body.appendChild(toastContainer)

// Toast插件
const toastPlugin = {
  install(app) {
    // 定义$toast方法
    const toast = (options) => {
      // 销毁之前的实例
      if (toastInstance && typeof toastInstance.close === 'function') {
        try {
          toastInstance.close()
        } catch (error) {
          console.warn('关闭toast实例失败:', error)
        }
      }
      if (toastApp) {
        try {
          toastApp.unmount()
        } catch (error) {
          console.warn('卸载toast应用失败:', error)
        }
      }
      
      // 默认配置
      const defaultOptions = {
        message: '',
        type: 'success',
        duration: 3000
      }
      
      // 合并配置
      const finalOptions = {
        ...defaultOptions,
        ...(typeof options === 'string' ? { message: options } : options)
      }
      
      // 创建应用
      toastApp = createApp(Toast, {
        ...finalOptions,
        visible: true,
        onClose: () => {
          if (toastApp) {
            toastApp.unmount()
          }
          toastInstance = null
          toastApp = null
        }
      })
      
      // 挂载应用
      toastInstance = toastApp.mount(toastContainer)
      
      return toastInstance
    }
    
    // 为toast添加快捷方法
    toast.success = (message, duration) => {
      return toast({ type: 'success', message, duration })
    }
    
    toast.error = (message, duration) => {
      return toast({ type: 'error', message, duration })
    }
    
    toast.warning = (message, duration) => {
      return toast({ type: 'warning', message, duration })
    }
    
    toast.info = (message, duration) => {
      return toast({ type: 'info', message, duration })
    }
    
    // 添加到全局属性
    app.config.globalProperties.$toast = toast
    
    // 添加到provide
    app.provide('toast', toast)
  }
}

export default toastPlugin