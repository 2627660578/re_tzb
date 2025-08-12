<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- 注册卡片 -->
      <div class="bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-200/80 animate-fadeIn">
        
        <!-- 卡片头部 -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">
            创建新账户
          </h1>
 
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 手机号输入 -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5h-1.5A11.5 11.5 0 013.5 6.5v-3z" />
              </svg>
            </span>
            <input id="mobile" v-model="form.mobile" type="tel" required class="form-input" placeholder="请输入11位手机号" />
          </div>

          <!-- 密码输入 -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
              </svg>
            </span>
            <input id="password" v-model="form.password" type="password" required class="form-input" placeholder="请输入至少6位密码" />
          </div>

          <!-- 确认密码 -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
              </svg>
            </span>
            <input id="confirmPassword" v-model="form.confirmPassword" type="password" required class="form-input" placeholder="请再次输入密码" />
          </div>

          <!-- 服务条款 -->
          <div class="flex items-start">
            <input id="agree" v-model="form.agree" type="checkbox" required class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1" />
            <label for="agree" class="ml-2 block text-sm text-gray-600">
              我已阅读并同意
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">《用户服务协议》</a>
            </label>
          </div>

          <!-- 注册按钮 -->
          <div>
            <button type="submit" :disabled="isLoading || !form.agree" class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <span v-if="isLoading" class="loading"></span>
              {{ isLoading ? '注册中...' : '立即注册' }}
            </button>
          </div>

          <!-- 错误/成功提示 -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {{ error }}
          </div>
          <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {{ success }}
          </div>
        </form>
        
        <!-- 卡片底部 -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-500">
            已有账户？
            <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 ml-1">
              立即登录
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

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  mobile: '',
  password: '',
  confirmPassword: '',
  agree: false
});

const isLoading = ref(false);
const error = ref('');
const success = ref('');

const handleRegister = async () => {
  if (isLoading.value) return;

  error.value = '';
  success.value = '';

  if (form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致';
    return;
  }
  if (form.password.length < 6) {
    error.value = '密码长度不能少于6位';
    return;
  }

  isLoading.value = true;

  try {
    const result = await authStore.register({
      mobile: form.mobile,
      password: form.password
    });

    if (result.success) {
      success.value = result.message || '注册成功！即将跳转到主页...';
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } else {
      error.value = result.message || '注册失败，请重试';
    }
  } catch (err: any) {
    error.value = err.message || '注册服务发生未知错误';
    console.error('Register component error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.form-input {
  display: block;
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 0.75rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-width: 1px;
  border-color: #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 1rem;
  line-height: 1.5rem;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #2563eb;
  --tw-ring-color: #3b82f6;
  box-shadow: var(--tw-ring-inset, 0 0 0 calc(0px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color)), 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

@media (min-width: 640px) {
  .form-input {
    font-size: 0.875rem;
    line-height: 1.25rem;
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
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>