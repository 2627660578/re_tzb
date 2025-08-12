<!-- filepath: d:\0_挑战杯\网页\refronted3\my-project\src\components\Header.vue -->
<template>
  <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
    <div class="container mx-auto px-6">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo区域 -->
        <div class="flex items-center gap-4">
          <router-link to="/" class="flex items-center gap-4">
            <svg 
              class="h-8 w-8 text-[var(--primary-color)]" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 12H16V14H8V12ZM8 16H16V18H8V16Z"></path>
            </svg>
            <h1 class="text-xl font-bold text-gray-900">DocuGen</h1>
          </router-link>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="hidden md:flex items-center gap-6">
          <router-link 
            v-for="navItem in navigation" 
            :key="navItem.name"
            :to="navItem.path"
            class="text-sm font-medium text-gray-600 hover:text-[var(--primary-color)] transition-colors"
          >
            {{ navItem.name }}
          </router-link>
        </nav>

        <!-- 用户区域 -->
        <div class="flex items-center gap-4">
          <!-- 如果已登录，显示用户菜单 -->
          <div v-if="authStore.isAuthenticated" class="relative" ref="userMenuContainer">
            <div 
              class="bg-cover bg-center rounded-full size-10 cursor-pointer hover:ring-2 hover:ring-[var(--primary-color)] hover:ring-offset-2 transition-all" 
              :style="{ backgroundImage: `url(${userAvatar})` }"
              @click="isUserMenuOpen = !isUserMenuOpen"
            ></div>
            <!-- 用户下拉菜单 -->
            <transition name="fade">
              <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                <div class="py-1">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    <p class="font-semibold">{{ authStore.user?.name || '用户' }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ authStore.user?.mobile }}</p>
                  </div>
                  <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">退出登录</a>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- 如果未登录，显示登录按钮 -->
          <!-- <div v-else>
            <router-link to="/login" class="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-color)] rounded-md hover:bg-opacity-90 transition-colors">
              登录
            </router-link>
          </div> -->
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const navigation = ref([
  { name: '创建文档', path: '/create' },
  { name: '历史记录', path: '/documents' },
])

const isUserMenuOpen = ref(false)
const userMenuContainer = ref<HTMLElement | null>(null) // 创建模板引用


// 计算用户头像，如果用户没有设置头像，则使用一个默认的SVG占位符
const userAvatar = computed(() => {
  return authStore.user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgMmM1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMFMxMiAyLjQ3NyAxMiAyem0wIDJjMS40MTQgMCAyLjczMy41NjYgMy43MDcgMS41MzlBOC45NDcgOC45NDcgMCAwIDAgMTIgNGE4Ljk0NyA4Ljk0NyAwIDAgMC0zLjcwNyA1LjUzOUM5LjI2NyA0LjU2NiAxMC41ODYgNCAxMiA0em0tNi45NjUgMy4xNThhOC4wMDMgOC4wMDMgMCAwIDEgMTMuOTMgMEE4LjAwMyA4LjAwMyAwIDAgMSAxOC44MyAxN0gxNy4zYy0xLjE4IDAtMi4yNTIuNTc2LTIuODg1IDEuNDk5QzEzLjgxNiAxOS4xNzggMTIuOTUgMTkuNSAxMiAxOS41cy0xLjgxNi0uMzIyLTIuNDEtMS4wMDJDOC45NTIgMTcuNTc2IDcuODggMTcgNi40OTkgMTdoLTEuMzMxYTguMDAzIDguMDAzIDAgMCAxLTMuMTMyLTkuODQyWiIvPjwvc3ZnPg=='
})

const handleLogout = () => {
  authStore.logout()
  isUserMenuOpen.value = false
  router.push('/login')
}

// --- 新增：处理外部点击的逻辑 ---
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 活跃链接样式 */
.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
}

/* 下拉菜单动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>