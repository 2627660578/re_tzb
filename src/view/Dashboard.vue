<template>
  <div class="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
    <!-- 左侧历史记录面板 -->
    <div 
      v-if="showHistoryPanel"
      class="fixed inset-0 z-40 flex"
    >
      <!-- 背景遮罩 -->
      <div 
        @click="showHistoryPanel = false"
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      ></div>
      
      <!-- 侧边面板 -->
      <div class="relative flex flex-col w-80 bg-white shadow-xl">
        <!-- 面板头部 -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">历史记录</h2>
          <button 
            @click="showHistoryPanel = false"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 新建公文按钮 -->
        <div class="p-4 border-b border-gray-200">
          <button 
            @click="createNewDocument"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            新建公文
          </button>
        </div>
        
        <!-- 历史记录列表 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            <div 
              v-for="doc in recentDocuments" 
              :key="doc.id"
              class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              @click="openDocument(doc)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900 line-clamp-1">{{ doc.title }}</h3>
                  <p class="text-xs text-gray-500 mt-1">{{ doc.type }} · {{ formatDate(doc.createdAt) }}</p>
                  <div class="flex items-center mt-2">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        doc.status === '已完成' ? 'bg-green-100 text-green-800' :
                        doc.status === '草稿' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      ]"
                    >
                      {{ doc.status }}
                    </span>
                  </div>
                </div>
                <button 
                  @click.stop="deleteDocument(doc)"
                  class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="recentDocuments.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无历史记录</h3>
            <p class="mt-1 text-sm text-gray-500">开始创建您的第一个公文</p>
          </div>
        </div>
        
        <!-- 查看全部按钮 -->
        <div class="p-4 border-t border-gray-200">
          <button 
            @click="viewAllHistory"
            class="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            查看全部历史记录
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- 欢迎区域 -->
      <div class="px-4 py-6 sm:px-0">
        <div class="max-w-2xl mx-auto">
          <div class="gov-card animate-fadeIn">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h2 class="text-3xl font-bold text-primary mb-3">
                    创建您的公文
                  </h2>
                  <p class="text-gray-600 text-lg">
                    填写下方表单以生成您的正式公文，AI将为您提供专业的文档生成服务。
                  </p>
                </div>
                <div class="hidden md:block">
                  <div class="w-16 h-16 bg-gradient-to-r from-primary-green to-accent-green rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 表单区域 -->
      <div class="px-4 sm:px-0">
        <div class="max-w-2xl mx-auto">
          <div class="gov-card">
            <div class="card-body">
              <form @submit.prevent="generateDocument" class="space-y-8">
                <!-- 公文类型 -->
                <div>
                  <label class="block text-sm font-medium text-primary mb-2" for="document-type">公文类型</label>
                  <select 
                    v-model="formData.documentType" 
                    class="gov-input" 
                    id="document-type" 
                    name="document-type"
                  >
                    <option value="">选择公文类型</option>
                    <option value="通知">通知</option>
                    <option value="通报">通报</option>
                    <option value="公告">公告</option>
                    <option value="通告">通告</option>
                    <option value="决定">决定</option>
                    <option value="命令">命令</option>
                    <option value="意见">意见</option>
                    <option value="请示">请示</option>
                    <option value="报告">报告</option>
                    <option value="批复">批复</option>
                    <option value="议案">议案</option>
                    <option value="会议纪要">会议纪要</option>
                  </select>
                </div>

                <!-- 具体要求/说明 -->
                <div>
                  <label class="block text-sm font-medium text-primary mb-2" for="instructions">具体要求/说明</label>
                  <textarea 
                    v-model="formData.instructions" 
                    class="gov-textarea" 
                    id="instructions" 
                    name="instructions" 
                    placeholder="例如：'请帮我生成一篇会议纪要'" 
                    rows="6"
                  ></textarea>
                </div>

                <!-- 现有信息/参考资料 -->
                <div>
                  <label class="block text-sm font-medium text-primary mb-2" for="existing-info">现有信息/参考资料</label>
                  <textarea 
                    v-model="formData.existingInfo" 
                    class="gov-textarea" 
                    id="existing-info" 
                    name="existing-info" 
                    placeholder="在此粘贴或输入与公文相关的现有文本、数据或详细信息。" 
                    rows="8"
                  ></textarea>
                </div>

                <!-- 生成按钮 -->
                <div class="flex justify-end pt-4">
                  <button 
                    type="button"
                    @click="goToNextStep"
                    :disabled="isLoading"
                    class="gov-button w-full sm:w-auto"
                  >
                    <span v-if="!isLoading">下一步</span>
                    <span v-else class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="gov-footer mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-secondary text-sm">
        <p>© 2025 政务智能助手. 保留所有权利。</p>
      </div>
    </footer>
  </div>
</template>

<script setup>

</script>

<style scoped>
/* 自定义样式已通过Tailwind CSS类实现 */
</style>