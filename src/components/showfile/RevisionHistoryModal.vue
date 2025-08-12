<template>
  <transition name="modal">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- 内部的白色面板不再需要 transition 包裹 -->
      <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold">修改历史</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto space-y-4">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="text-center py-8">
            <p class="text-gray-500">正在加载历史记录...</p>
          </div>
          <!-- 错误状态 -->
          <div v-else-if="error" class="text-center py-8 text-red-500">
            <p>加载失败: {{ error }}</p>
          </div>
          <!-- 对话列表 -->
          <div v-else-if="history.length > 0" v-for="item in history" :key="item.id" class="space-y-4">
            <!-- 用户消息 -->
            <div v-if="item.role === 'user'" class="flex justify-end">
              <div class="bg-blue-500 text-white p-3 rounded-lg max-w-md">
                <p>{{ item.content }}</p>
              </div>
            </div>
            <!-- AI 消息 -->
            <div v-if="item.role === 'assistant'" class="flex justify-start">
              <div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-md">
                <p class="whitespace-pre-wrap">{{ item.content }}</p>
              </div>
            </div>
          </div>
          <!-- 无数据状态 -->
          <div v-else class="text-center py-8 text-gray-500">
            <p>暂无修改历史记录。</p>
          </div>
        </div>
      </div>

    </div>
  </transition>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Message } from '../../api/conversations'

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  history: {
    type: Array as PropType<Message[]>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String as PropType<string | null>,
    default: null,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 让内容面板在过渡期间也有动画 */
.modal-enter-active .modal-content {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
.modal-leave-active .modal-content {
  transition: all 0.2s ease-in;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>