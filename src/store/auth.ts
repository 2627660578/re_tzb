import { defineStore } from 'pinia'
import { ref } from 'vue'
// 导入我们创建的API函数
import { loginUser, registerUser } from '../api/auth'

// 定义用户对象的类型
interface User {
  id: number | string;
  mobile: string;
  name: string;
  department: string;
  role: string;
  avatar?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = ref(!!token.value)

  // --- 内部辅助函数 ---
  const setAuthData = (tokenValue: string, mobile: string) => {
    // 由于API不返回用户信息，我们创建一个基础的用户对象
    // 在实际应用中，通常会用获取到的token再去请求一个 /user/info 接口来获取详细信息
    const currentUser: User = {
      id: 0, // 登录接口未返回用户ID，暂设为0或后续从info接口获取
      mobile: mobile,
      name: '已登录用户', // 默认名称，等待info接口更新
      department: '未知部门', // 默认值
      role: '未知角色' // 默认值
    }

    user.value = currentUser
    token.value = tokenValue
    isAuthenticated.value = true

    // 将token和基础用户信息存入localStorage
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(currentUser))
  }

  // --- Actions ---
  // 登录
  const login = async (credentials: { mobile: string, password: string }) => {
    try {
      const result = await loginUser(credentials);
      if (result.code === 0 && result.data.accessToken) {
        setAuthData(result.data.accessToken, credentials.mobile);
        return { success: true, user: user.value }
      } else {
        return { success: false, message: result.msg || '登录失败' }
      }
    } catch (error) {
      console.error('登录请求异常:', error)
      return { success: false, message: '登录服务无法访问' }
    }
  }

  // 注册
  const register = async (credentials: { mobile: string, password: string }) => {
    try {
      const result = await registerUser(credentials);
      // 注册成功后，API也返回了token，可以直接让用户登录
      if (result.code === 0 && result.data.accessToken) {
        setAuthData(result.data.accessToken, credentials.mobile);
        return { success: true, message: '注册成功并已自动登录！' }
      } else {
        return { success: false, message: result.msg || '注册失败' }
      }
    } catch (error) {
      console.error('注册请求异常:', error)
      return { success: false, message: '注册服务无法访问' }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  
  // 更新用户头像
  const updateUserAvatar = (avatarData: string) => {
    if (user.value) {
      user.value.avatar = avatarData
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    }
    return false
  }

  // 更新用户信息
  const updateUserInfo = (userInfo: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userInfo }
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    }
    return false
  }

  // 获取用户头像
  const getUserAvatar = () => {
    return user.value?.avatar || null
  }

  // 初始化用户信息
  const initializeAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth,
    updateUserAvatar,
    updateUserInfo,
    getUserAvatar
  }
})