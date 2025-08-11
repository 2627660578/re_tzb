<template>
  <div class="user-avatar-container">
    <!-- 用户头像 -->
    <img 
      v-if="userAvatar" 
      :src="userAvatar" 
      :alt="userName + '的头像'"
      class="user-avatar"
      @click="toggleDropdown"
      @error="handleImageError"
    />
    <!-- 头像占位符 -->
    <div 
      v-else 
      class="avatar-placeholder"
      :title="userName"
      @click="toggleDropdown"
    >
      {{ avatarText }}
    </div>
    
    <!-- 下拉菜单 -->
    <div 
      v-if="isDropdownVisible" 
      class="dropdown-menu"
      @click.stop
    >
      <router-link to="/settings" class="dropdown-item">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        个人设置
      </router-link>
      <div class="dropdown-item" @click="logout">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        退出登录
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import { computed, ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'UserAvatar',
  props: {
    showDropdown: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium' // small, medium, large
    }
  },
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const isDropdownVisible = ref(false)
    
    const userAvatar = computed(() => {
      return authStore.getUserAvatar()
    })
    
    const userName = computed(() => {
      return authStore.user?.name || '用户'
    })
    
    const avatarText = computed(() => {
      const name = userName.value
      return name ? name.charAt(0).toUpperCase() : 'U'
    })
    
    const toggleDropdown = () => {
      isDropdownVisible.value = !isDropdownVisible.value
    }
    
    const handleImageError = () => {
      // 如果图片加载失败，清除头像数据
      authStore.updateUserAvatar('')
    }
    
    const logout = () => {
      authStore.logout()
      emit('logout')
    }
    
    // 点击外部关闭下拉菜单
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-avatar-container')) {
        isDropdownVisible.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      userAvatar,
      userName,
      avatarText,
      isDropdownVisible,
      toggleDropdown,
      handleImageError,
      logout
    }
  }
}
</script>

<style scoped>
.user-avatar-container {
  position: relative;
  display: inline-block;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid var(--primary-600);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.avatar-placeholder {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: 2px solid var(--primary-600);
  transition: all 0.2s ease;
}

.avatar-placeholder:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 大小变体 */
.user-avatar-container.small .user-avatar,
.user-avatar-container.small .avatar-placeholder {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.75rem;
}

.user-avatar-container.large .user-avatar,
.user-avatar-container.large .avatar-placeholder {
  width: 3rem;
  height: 3rem;
  font-size: 1.125rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  min-width: 10rem;
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: all 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--border-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.dropdown-item svg {
  flex-shrink: 0;
}
</style>