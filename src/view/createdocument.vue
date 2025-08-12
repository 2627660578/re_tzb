<!-- filepath: d:\0_挑战杯\网页\refronted3\my-project\src\view\createdocument.vue -->
<template>
  <div class="bg-[var(--background-color)] text-[var(--text-primary)]">
    <div class="flex flex-col min-h-screen">
      <!-- 主内容区域 -->
      <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">智能生成您的公文</h2>
            <p class="mt-3 text-base text-[var(--text-secondary)]">填写以下表单，快速生成专业公文清单。</p>
          </div>
          <div class="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-[var(--secondary-color)]">
            <!-- 使用 @submit.prevent 替代 form.addEventListener('submit') -->
            <form class="space-y-6" @submit.prevent="generateChecklist">
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5" for="document-type">公文类型</label>
                <!-- 使用 v-model 绑定数据 -->
                <select v-model="formData.documentType" id="document-type" class="form-select block w-full rounded-md border-[var(--input-border-color)] shadow-sm focus:border-[var(--input-focus-border-color)] focus:ring focus:ring-[var(--input-focus-border-color)] focus:ring-opacity-50 transition p-3 bg-white text-base">
                  <option value="">请选择公文类型</option>
                  <option>通知</option>
                  <option>通告</option>
                  <option>通报</option>
                  <option>报告</option>
                  <option>请示</option>
                  <option>批复</option>
                  <option>决议</option>
                  <option>决定</option>
                  <option>公告</option>
                  <option>意见</option>
                  <option>函</option>
                  <option>会议纪要</option>
                  <option>命令（令）</option>
                  <option>议案</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5" for="requests">生成要求</label>
                <!-- 使用 v-model 绑定数据 -->
                <textarea v-model="formData.requests" id="requests" class="block w-full rounded-md border-[var(--input-border-color)] shadow-sm focus:border-[var(--input-focus-border-color)] focus:ring focus:ring-[var(--input-focus-border-color)] focus:ring-opacity-50 transition p-3 placeholder:text-gray-400 text-base" placeholder="例如：语气严肃正式，突出会议的重要性..." rows="4"></textarea>
              </div>
              <div id="drop-zone-wrapper">
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-1.5" for="information">现有信息</label>
                <!-- 监听拖拽事件 -->
                <div 
                  id="drop-zone"
                  class="relative p-4 border-2 border-dashed border-[var(--input-border-color)] rounded-md transition-colors"
                  :class="{ 'drag-over': isDragOver }"
                  @dragenter.prevent="isDragOver = true"
                  @dragover.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                  @drop.prevent="handleDrop"
                >
                  <textarea v-model="formData.information" id="information" class="block w-full border-none focus:ring-0 p-0 placeholder:text-gray-400 text-base bg-transparent resize-none" placeholder="在此处粘贴或输入文本，或拖拽文件到此区域" rows="8"></textarea>
                  <!-- 隐藏的 input 用于点击上传 -->
                  <input type="file" ref="fileInputRef" @change="handleFileSelect" class="hidden" multiple accept=".jpg,.jpeg,.png,.txt,.md,.csv,.docx,.pdf,.xlsx,.pptx">
                  <!-- 使用 @click 替代 addEventListener -->
                  <button type="button" @click="fileInputRef?.click()" class="absolute bottom-2 right-2 text-gray-400 hover:text-[var(--primary-color)] transition-colors p-1 bg-white/50 backdrop-blur-sm rounded-full">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  </button>
                </div>
              </div>
              
              <!-- 文件上传列表 (使用 v-for 渲染) -->
              <div class="space-y-3">
                <div v-for="file in uploadedFiles" :key="file.tempId" class="file-item p-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 overflow-hidden">
                      <svg class="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <span class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</span>
                    </div>
                    <button type="button" @click="removeFile(file.tempId)" class="text-gray-400 hover:text-[var(--error-color)]">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                    </button>
                  </div>
                  <div class="mt-2">
                    <div class="progress-bar-bg">
                      <div class="progress-bar" :style="{ width: file.progress + '%' }" :class="{ 
                        'bg-[var(--success-color)]': file.status === 'success',
                        'bg-[var(--error-color)]': file.status === 'error',
                        'bg-[var(--primary-color)]': file.status === 'uploading'
                      }"></div>
                    </div>
                    <div class="status-text text-xs text-right mt-1" :class="{ 'text-[var(--error-color)]': file.status === 'error', 'text-gray-500': file.status !== 'error' }">
                      {{ file.statusText }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-semibold rounded-md text-white bg-[var(--primary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all shadow-lg">
                  生成清单
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>

    <!-- 全屏加载/消息提示模态框 (使用 v-if 控制) -->
    <div v-if="modal.show" class="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-[99]">
      <div class="bg-white rounded-lg shadow-xl p-8 text-center max-w-sm w-full mx-4">
        <div v-if="!modal.showCloseButton" class="flex justify-center items-center mb-4">
          <div class="loader"></div>
        </div>
        <h3 class="text-lg font-medium text-gray-900">{{ modal.title }}</h3>
        <p class="text-sm text-gray-500 mt-2">{{ modal.message }}</p>
        <button v-if="modal.showCloseButton" @click="modal.show = false" class="mt-6 w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'; // 导入 onMounted
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useDocumentStore } from '../store/document'; // 导入 document store

// --- 类型定义 ---
interface UploadedFile {
  tempId: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  statusText: string;
  backendId?: string; // 后端返回的真实ID
  url?: string;
}

// --- 响应式状态 ---
const router = useRouter();
const authStore = useAuthStore();
const documentStore = useDocumentStore(); // 初始化 document store
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

// 表单数据
const formData = reactive({
  documentType: '',
  requests: '',
  information: '',
});

// 文件列表
const uploadedFiles = ref<UploadedFile[]>([]);

// 模态框状态
const modal = reactive({
  show: false,
  title: '',
  message: '',
  showCloseButton: false,
});

// --- 生命周期钩子 ---
onMounted(() => {
  // 检查 store 中是否有历史数据
  if (documentStore.historyData) {
    const data = documentStore.historyData;

    // 填充表单
    formData.documentType = data.documenttype;
    formData.requests = data.requests;
    formData.information = data.information;

    // 填充文件列表
    uploadedFiles.value = data.references.map(ref => ({
      tempId: `hist-${ref.file_id}`,
      name: ref.filename,
      progress: 100,
      status: 'success',
      statusText: '来自历史记录',
      backendId: ref.file_id, // 注意：这里可能需要根据后端逻辑调整
      url: ref.file_id, // 假设 file_id 就是 url 的一部分
    }));

    // **关键**：使用后立即清空 store 中的数据，防止下次进入时污染表单
    documentStore.historyData = null;
  }
});

// --- 方法 ---

// 文件处理
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    handleFiles(target.files);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  if (event.dataTransfer?.files) {
    handleFiles(event.dataTransfer.files);
  }
};

const handleFiles = (files: FileList) => {
  [...files].forEach(uploadFile);
};

const removeFile = (tempId: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.tempId !== tempId);
};

// 文件上传逻辑 (使用 XMLHttpRequest)
const uploadFile = (file: File) => {
  const url = 'http://47.98.215.181:8010/llmcenter/v1/files/upload';
  const formData = new FormData();
  formData.append('file', file);

  const tempId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const newFile: UploadedFile = {
    tempId,
    name: file.name,
    progress: 0,
    status: 'uploading',
    statusText: '正在上传...',
  };
  uploadedFiles.value.push(newFile);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  // 从 Pinia store 获取 token
  xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`);

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      const targetFile = uploadedFiles.value.find(f => f.tempId === tempId);
      if (targetFile) {
        targetFile.progress = percent;
      }
    }
  });

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const targetFile = uploadedFiles.value.find(f => f.tempId === tempId);
      if (!targetFile) return;

      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.code === 0 && response.data) {
            targetFile.status = 'success';
            targetFile.statusText = response.data.message || '上传成功';
            targetFile.backendId = response.data.file_id;
            targetFile.url = response.data.url || '';
            targetFile.progress = 100;
          } else {
            throw new Error(response.msg || '响应格式不正确');
          }
        } catch (error: any) {
          targetFile.status = 'error';
          targetFile.statusText = `上传失败: ${error.message}`;
        }
      } else {
        targetFile.status = 'error';
        targetFile.statusText = `上传失败: HTTP ${xhr.status}`;
      }
    }
  };

  xhr.onerror = function () {
    const targetFile = uploadedFiles.value.find(f => f.tempId === tempId);
    if (targetFile) {
      targetFile.status = 'error';
      targetFile.statusText = '上传失败: 网络请求错误';
    }
  };

  xhr.send(formData);
};

// 模态框控制
const showModalMessage = (title: string, message: string, showCloseButton: boolean) => {
  modal.title = title;
  modal.message = message;
  modal.showCloseButton = showCloseButton;
  modal.show = true;
};

// 表单提交与SSE逻辑
const generateChecklist = async () => {
  if (!formData.documentType) {
    showModalMessage('错误', '请选择一个公文类型。', true);
    return;
  }
  showModalMessage('正在生成清单...', '', false);

  localStorage.removeItem('docuCraftChecklist');
  localStorage.removeItem('docuCraftConversationId');

  const payload = {
    conversation_id: "",
    documenttype: formData.documentType,
    information: formData.information,
    requests: formData.requests,
    use_knowledge_base: false,
    knowledge_base_id: "",
    references: uploadedFiles.value
      .filter(f => f.status === 'success' && f.url)
      .map(f => ({ type: 'file', file_id: f.url }))
  };

  try {
    const response = await fetch('http://47.98.215.181:8010/llmcenter/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(payload)
    });

    if (!response.ok || !response.body) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP 错误: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let interruptHandled = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        if (interruptHandled) continue;
        const eventLine = part.split('\n').find(line => line.startsWith('event:'));
        const dataLine = part.split('\n').find(line => line.startsWith('data:'));

        if (eventLine && dataLine) {
          const eventType = eventLine.substring(6).trim();
          const dataJson = dataLine.substring(5).trim();
          try {
            const data = JSON.parse(dataJson);
            if (data.conversation_id) {
              localStorage.setItem('docuCraftConversationId', data.conversation_id);
            }
            if (eventType === 'interrupt' && data.content_type === 'document_outline' && data.content) {
              localStorage.setItem('docuCraftChecklist', data.content);
              if (localStorage.getItem('docuCraftConversationId')) {
                router.push('/document/checklist');
                interruptHandled = true;
                reader.cancel();
                return;
              }
            }
          } catch (e) {
            console.error("解析流数据失败:", e);
          }
        }
      }
    }
    if (!interruptHandled) {
      showModalMessage('生成失败', '未能从服务器获取有效的内容清单。', true);
    }
  } catch (error: any) {
    showModalMessage('请求失败', error.message, true);
  }
};
</script>

<style scoped>
/* 您的自定义 CSS 变量和样式 */
:root {
    --primary-color: #0c7ff2;
    --secondary-color: #e7edf4;
    --text-primary: #0d141c;
    --text-secondary: #49739c;
    --background-color: #f8fafc;
    --input-border-color: #cedbe8;
    --input-focus-border-color: #0c7ff2;
    --success-color: #22c55e;
    --error-color: #ef4444;
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* 拖拽区域高亮 */
.drag-over {
  border-color: var(--primary-color);
  background-color: #eff6ff; /* Tailwind's bg-blue-50 */
}

/* 文件上传列表动画 */
.file-item {
  transition: all 0.3s ease-in-out;
}

/* 加载动画 */
.loader {
  width: 50px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 8px solid;
  border-color: #d1d5db #0000;
  animation: l1 1s infinite;
}

@keyframes l1 {
  to {
    transform: rotate(.5turn)
  }
}

/* 进度条 */
.progress-bar-bg {
  width: 100%;
  background-color: #e5e7eb; /* Tailwind's bg-gray-200 */
  border-radius: 9999px;
  height: 0.375rem; /* h-1.5 */
}

.progress-bar {
  height: 0.375rem; /* h-1.5 */
  border-radius: 9999px; /* rounded-full */
  transition: all 0.3s;
}
</style>