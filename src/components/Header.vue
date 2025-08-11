<template>
  <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
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
            :class="{ 'text-[var(--primary-color)] font-semibold': $route.path === navItem.path }"
          >
            {{ navItem.name }}
          </router-link>
        </nav>

        <!-- 用户区域 -->
        <div class="hidden md:flex items-center gap-4">
          <div 
            class="bg-cover bg-center rounded-full size-10 cursor-pointer hover:ring-2 hover:ring-[var(--primary-color)] hover:ring-offset-2 transition-all" 
            :style="{ backgroundImage: `url(${userAvatar})` }"
            @click="toggleUserMenu"
          ></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const navigation = ref([
  { name: '模板', path: '/templates' },
  { name: '历史记录', path: '/documents' },
  { name: '帮助', path: '/help' }
])

const userAvatar = ref('https://lh3.googleusercontent.com/aida-public/AB6AXuCitjpFlEqlnBsoVYxWojjpoZd3WPbOR40-yP4rUg-4eD1CKKP9QhyKPcqKPNeA-EzBnN3m70si7Stocfj_77xU04i4wL9m7I-aK5wvreSpqZTtuWtmoBcJwAKDkRnQYTYWJZjuMHIoQ2eiGIHjv5QYt7RZN3p-i9D04gNqfmROKvV5fB2H14pqObM-PmfJ8ucyaD_W_USN3gZQgCmsxf3kYrma7--Y43xB5mddnBFcbsriSK49PgHR63rcvdslNkf_pUrDTyd0vPum')

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleUserMenu = () => {
  console.log('Toggle user menu')
  // 这里可以添加用户菜单逻辑
}
</script>

<style scoped>
/* 活跃链接样式 */
.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
}

/* 悬停效果 */
nav a:hover {
  color: var(--primary-color);
}

/* 移动端菜单动画 */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>