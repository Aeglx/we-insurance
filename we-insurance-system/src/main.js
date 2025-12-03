import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// 引入Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// 开发环境下使用Mock数据 - 暂时禁用以使用真实API
// if (import.meta.env.DEV) {
//   import('./mock')
// }

// 引入Toast插件
import toastPlugin from './components/common/toastPlugin'

// 数据库服务仅在需要时按需导入，不在客户端直接初始化
// 数据库连接和操作应在服务器端进行

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(toastPlugin)

app.mount('#app')
