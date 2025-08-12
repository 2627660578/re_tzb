import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './store/auth' // 导入 auth store

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// **关键步骤**: 在挂载应用前初始化认证状态
// 这可以确保在路由守卫首次运行时，认证状态是正确的
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)
app.mount('#app')