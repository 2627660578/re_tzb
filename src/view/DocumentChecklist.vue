<template>
  <div class="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
    <!-- 顶部导航栏 -->
    <nav class="gov-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <button
              @click="goBack"
              class="mr-4 p-2 text-secondary hover:text-primary transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div class="flex items-center">
              <div class="gov-logo w-8 h-8 mr-3">
                <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <h1 class="text-xl font-semibold text-primary">文档信息清单</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- 用户头像下拉菜单 -->
            <div 
              @click="toggleUserMenu"
              class="relative"
            >
              <img 
                v-if="userInfo.avatar" 
                :src="userInfo.avatar" 
                :alt="userInfo.name"
                class="user-avatar"
              />
              <div 
                v-else
                class="avatar-placeholder"
              >
                {{ userInfo.name ? userInfo.name.charAt(0) : 'U' }}
              </div>
              
              <!-- 下拉菜单 -->
              <div 
                :class="['dropdown-menu', { 'show': showUserMenu }]"
              >
                <router-link to="/" class="dropdown-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  返回主页
                </router-link>
                <router-link to="/settings" class="dropdown-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  个人设置
                </router-link>
                <a href="#" @click="logout" class="dropdown-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  退出登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 页面标题卡片 -->
      <div class="mb-8 animate-fadeIn">
        <div class="gov-card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gradient">公文内容信息清单</h1>
                <p class="text-secondary mt-1">请填写完整的文档信息，确保生成的公文准确无误</p>
              </div>
              <div class="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单卡片 -->
      <div class="gov-card animate-slideInFromBottom">
        <form @submit.prevent="confirmAndContinue">
          <div class="card-body space-y-8">
            <!-- 基本信息 -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-primary">基本信息</h2>
              </div>

              <!-- 标题 -->
              <div>
                <label class="block text-sm font-semibold text-primary mb-3" for="title">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    <span>文档标题</span>
                    <span class="text-error text-xs">*</span>
                  </div>
                </label>
                <input 
                  v-model="formData.title" 
                  class="gov-input w-full" 
                  id="title" 
                  placeholder="例如：关于加强疫情防控工作的通知" 
                  type="text"
                  required
                />
              </div>
              
              <!-- 公文编号和收件单位 -->
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-semibold text-primary mb-3" for="doc-number">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                      </svg>
                      <span>公文编号</span>
                    </div>
                  </label>
                  <input 
                    v-model="formData.docNumber" 
                    class="gov-input w-full" 
                    id="doc-number" 
                    placeholder="例如：ZF-2024-001" 
                    type="text"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-primary mb-3" for="recipient-unit">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <span>收件单位</span>
                      <span class="text-error text-xs">*</span>
                    </div>
                  </label>
                  <input 
                    v-model="formData.recipientUnit" 
                    class="gov-input w-full" 
                    id="recipient-unit" 
                    placeholder="例如：各区县政府、市直各部门" 
                    type="text"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- 文档内容 -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-r from-info to-success rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-primary">文档内容</h2>
              </div>

              <!-- 主体内容 -->
              <div>
                <label class="block text-sm font-semibold text-primary mb-3" for="main-body">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                    </svg>
                    <span>主体内容</span>
                    <span class="text-error text-xs">*</span>
                  </div>
                </label>
                <textarea 
                  v-model="formData.mainBody" 
                  class="gov-textarea w-full h-40" 
                  id="main-body" 
                  placeholder="请详细描述文档的主要内容，可以包含多个段落和要点...\n\n示例：\n一、背景情况\n二、主要措施\n三、工作要求"
                  required
                ></textarea>
                <p class="text-xs text-tertiary mt-2">提示：您可以使用标题格式（如：一、二、三、）来组织内容结构</p>
              </div>
            </div>

            <!-- 发文信息 -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-r from-warning to-error rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-primary">发文信息</h2>
              </div>

              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-semibold text-primary mb-3" for="issuing-unit">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      <span>发文单位</span>
                      <span class="text-error text-xs">*</span>
                    </div>
                  </label>
                  <input 
                    v-model="formData.issuingUnit" 
                    class="gov-input w-full" 
                    id="issuing-unit" 
                    placeholder="例如：市政府办公厅" 
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-primary mb-3" for="date">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>发文日期</span>
                    </div>
                  </label>
                  <input 
                    v-model="formData.date" 
                    class="gov-input w-full" 
                    id="date" 
                    type="date"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-primary mb-3" for="contact-person">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span>联系人及信息</span>
                    </div>
                  </label>
                  <input 
                    v-model="formData.contactPerson" 
                    class="gov-input w-full" 
                    id="contact-person" 
                    placeholder="例如：张三，电话：138****1234" 
                    type="text"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-primary mb-3" for="copy-recipients">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      <span>抄送单位</span>
                    </div>
                  </label>
                  <input 
                    v-model="formData.copyRecipients" 
                    class="gov-input w-full" 
                    id="copy-recipients" 
                    placeholder="例如：市委办公厅、市人大办公厅" 
                    type="text"
                  />
                </div>
              </div>
            </div>

            <!-- 附加信息 -->
            <div class="space-y-6">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-r from-secondary to-tertiary rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-primary">附加信息</h2>
              </div>

              <!-- 附件 -->
              <div>
                <label class="block text-sm font-semibold text-primary mb-3" for="attachments">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                    <span>附件说明</span>
                  </div>
                </label>
                <input 
                  v-model="formData.attachments" 
                  class="gov-input w-full" 
                  id="attachments" 
                  placeholder="例如：1.实施方案.docx  2.统计表格.xlsx" 
                  type="text"
                />
              </div>

              <!-- 备注 -->
              <div>
                <label class="block text-sm font-semibold text-primary mb-3" for="remarks">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                    </svg>
                    <span>备注说明</span>
                  </div>
                </label>
                <textarea 
                  v-model="formData.remarks" 
                  class="gov-textarea w-full h-24" 
                  id="remarks" 
                  placeholder="其他需要说明的事项..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-footer">
            <div class="flex items-center justify-between">
              <button
                type="button"
                @click="goBack"
                class="gov-button-ghost flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span>返回上一步</span>
              </button>
              
              <div class="flex items-center space-x-4">
                <button
                  type="button"
                  @click="saveDraft"
                  class="gov-button-secondary flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <span>保存草稿</span>
                </button>
                
                <button
                  type="submit"
                  :disabled="!isFormValid"
                  class="gov-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  <span>确认并生成文档</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'DocumentChecklist',
  data() {
    return {
      userInfo: {
        name: localStorage.getItem('userName') || '用户',
        avatar: localStorage.getItem('userAvatar') || ''
      },
      showUserMenu: false,
      formData: {
        title: '',
        docNumber: '',
        recipientUnit: '',
        mainBody: '',
        issuingUnit: '',
        date: new Date().toISOString().split('T')[0],
        contactPerson: '',
        copyRecipients: '',
        attachments: '',
        remarks: ''
      }
    }
  },
  computed: {
    isFormValid() {
      return this.formData.title.trim() && 
             this.formData.recipientUnit.trim() && 
             this.formData.mainBody.trim() && 
             this.formData.issuingUnit.trim()
    }
  },
  methods: {
    goBack() {
      this.$router.push('/dashboard')
    },
    saveDraft() {
      // 保存草稿到本地存储
      localStorage.setItem('documentDraft', JSON.stringify(this.formData))
      this.$message.success('草稿已保存')
    },
    confirmAndContinue() {
      if (!this.isFormValid) {
        this.$message.warning('请填写所有必填项')
        return
      }
      
      // 保存表单数据
      localStorage.setItem('documentChecklistInfo', JSON.stringify(this.formData))
      
      // 跳转到文档生成页面
      this.$router.push('/document/generation')
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showUserMenu = false
      }
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        this.$router.push('/login')
      })
    }
  },
  mounted() {
    // 尝试从本地存储恢复草稿
    const draft = localStorage.getItem('documentDraft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        this.formData = { ...this.formData, ...draftData }
      } catch (error) {
        console.error('恢复草稿失败:', error)
      }
    }
    
    // 添加点击外部关闭菜单的事件监听器
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    // 移除事件监听器
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
/* 组件特定样式 */
.gov-input:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.gov-textarea:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

/* 表单验证样式 */
.gov-input:invalid {
  border-color: #ef4444;
}

.gov-textarea:invalid {
  border-color: #ef4444;
}
</style>