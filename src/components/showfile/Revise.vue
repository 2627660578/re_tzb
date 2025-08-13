<template>
  <div class="ai-revision-panel">
    <div class="ai-revision-header">
      <div class="flex items-center gap-3">
        <svg class="ai-icon" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Zm-40-28a12,12,0,1,0-12-12A12,12,0,0,0,184,100Zm-64,0a12,12,0,1,0-12-12A12,12,0,0,0,120,100Zm-28,40a16,16,0,0,0,0,32,16.5,16.5,0,0,0,8.2-2.39,47.88,47.88,0,0,1,63.6,0A16.5,16.5,0,0,0,172,172a16,16,0,0,0,0-32,12,12,0,0,0-11.23,8,24,24,0,0,0-32.34-3.48A23.65,23.65,0,0,0,119.2,148,12,12,0,0,0,92,140Z"></path>
        </svg>
        <h3 class="ai-revision-title">AI修改</h3>
      </div>
      <!-- 新增：查看历史链接 -->
      <button @click="$emit('showHistory')" class="text-sm font-medium text-blue-600 hover:text-blue-800">
        查看历史
      </button>
    </div>
    
    <p class="ai-revision-description">
      输入要求，AI将根据您的指示修改文本。请尽量具体，例如“使语气更正式”或“缩短第三段”。
    </p>

    <div class="textarea-container">
      <textarea 
        v-model="localRevisionRequest"
        class="revision-textarea"
        :disabled="isLoading"
        placeholder="请输入您的修改要求..."
      ></textarea>
      
      <button 
        @click="handleSubmitRevision"
        class="submit-button"
        :disabled="isLoading || !localRevisionRequest.trim()"
      >
        <!-- 根据加载状态显示不同内容 -->
        <span v-if="!isLoading">
          <svg class="submit-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </span>
        <span v-else>
          <!-- 可以添加一个加载动画 -->
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 新增：接收isLoading prop
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
})

// 本地响应式数据
const localRevisionRequest = ref('')

// 定义事件
const emit = defineEmits(['submit', 'showHistory'])

const handleSubmitRevision = () => {
  // 现在可以正确地通过 props.isLoading 访问 prop
  if (localRevisionRequest.value.trim() && !props.isLoading) {
    emit('submit', localRevisionRequest.value)
    localRevisionRequest.value = ''
  }
}

</script>

<style scoped>
/* AI Revision Panel */
.ai-revision-panel {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.ai-revision-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 修改为 space-between */
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ai-icon {
  height: 1.5rem;
  width: 1.5rem;
  color: #0b80ee;
}

.ai-revision-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.ai-revision-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.textarea-container {
  position: relative;
}

.revision-textarea {
  width: 100%;
  height: 7rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: box-shadow 0.15s ease-in-out;
  resize: vertical;
  box-sizing: border-box;
}

.revision-textarea:focus {
  outline: none;
  border-color: #0b80ee;
  box-shadow: 0 0 0 2px rgba(11, 128, 238, 0.1);
}

.submit-button {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  height: 2rem;
  padding: 0 0.75rem;
  background-color: #0b80ee;
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: opacity 0.15s ease-in-out;
}

.submit-button:hover {
  opacity: 0.9;
}

.submit-icon {
  height: 1rem;
  width: 1rem;
}
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.revision-textarea:disabled {
  background-color: #f9fafb;
}
</style>