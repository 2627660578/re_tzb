<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- 登录卡片 -->
      <div class="bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-200/80 animate-fadeIn">
        
        <!-- 卡片头部 -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <svg class="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 12H16V14H8V12ZM8 16H16V18H8V16Z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">
            公文智能助手
          </h1>
          <p class="text-gray-500 text-sm mt-6">
            欢迎回来，请登录您的账户
          </p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 手机号输入 -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5h-1.5A11.5 11.5 0 013.5 6.5v-3z" />
              </svg>
            </span>
            <input
              id="mobile"
              v-model="form.mobile"
              type="tel"
              required
              class="form-input"
              placeholder="请输入手机号"
            />
          </div>

          <!-- 密码输入 -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
              </svg>
            </span>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="form-input"
              placeholder="请输入密码"
            />
          </div>

          <!-- 记住我和忘记密码 -->
          <!-- <div class="flex items-center justify-between text-sm">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-gray-600">
                记住我
              </label>
            </div>
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              忘记密码？
            </a>
          </div> -->

          <!-- 错误提示 -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {{ error }}
          </div>

          <!-- 登录按钮 -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span v-if="isLoading" class="loading"></span>
              {{ isLoading ? '登录中...' : '安全登录' }}
            </button>
          </div>
        </form>
        
        <!-- 卡片底部 -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-500">
            还没有账户？
            <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 ml-1">
              立即注册
            </router-link>
          </p>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center animate-fadeIn">
        <p class="text-xs text-gray-400">
          © 2025 公文助手系统
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = ref({
  mobile: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await authStore.login(form.value)
    if (result.success) {
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    } else {
      error.value = result.message || '登录失败，请重试'
    }
  } catch (err) {
    error.value = '登录失败，请检查网络连接'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>

.form-input {
  display: block;
  width: 100%;
  padding-left: 2.5rem; /* 40px */
  padding-right: 0.75rem; /* 12px */
  padding-top: 0.75rem; /* 12px */
  padding-bottom: 0.75rem; /* 12px */
  border-width: 1px;
  border-color: #d1d5db; /* gray-300 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
  font-size: 1rem; /* 默认字体大小，sm断点下会改变 */
  line-height: 1.5rem; /* 默认行高 */
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.form-input::placeholder {
  color: #9ca3af; /* placeholder-gray-400 */
}

.form-input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #2563eb; /* focus:border-blue-600, 假设ring-blue-500也意图改变边框色 */
  --tw-ring-color: #3b82f6; /* focus:ring-blue-500 */
  box-shadow: var(--tw-ring-inset, 0 0 0 calc(0px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color)), 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* 对应 sm:text-sm */
@media (min-width: 640px) {
  .form-input {
    font-size: 0.875rem; /* 14px */
    line-height: 1.25rem; /* 20px */
  }
}
.loading {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0.2;
  }
  to {
    opacity: 1;
  }
}
</style>