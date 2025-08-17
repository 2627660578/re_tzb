<template>
  <div class="document-viewer-theme">
    <!-- Main Content -->
    <main class="main-content">
      <!-- 优先显示生成中的状态 -->

      <div v-if="isRevising" class="revising-overlay">
        <div class="revising-spinner"></div>
        <p class="revising-text">AI 正在修改中，请稍候...</p>
      </div>

      <div v-if="error" class="status-message error-message">
        <p>Failed to load document:</p>
        <p>{{ error }}</p>
      </div>

      <template v-else>

        <div class="content-grid">
          <!-- Document Section - 传递动态props给Editor组件 -->
        <div class="editor-section">
          <!-- 使用 v-model 并传递保存状态 -->
          <!-- <div v-if="documentStore.isGenerating" class="status-message">
            <p>正在为您生成文档，请稍候...</p>
          </div> -->
          <div v-if="isLoading && !documentStore.isGenerating" class="status-message">
            <p>正在加载中...</p>
          </div>
          <Editor v-else
            :document-title="documentTitle" 
            v-model:document-content="documentContent"
            :document-updated-at="documentUpdatedAt"
            :save-status="saveStatus"
            :is-generating="documentStore.isGenerating"
            :document-id="documentMessageId"
          />
        </div>

          <!-- Sidebar Section -->
          <div class="sidebar-section">
            <aside class="sidebar">
              <div class="sidebar-sticky">
                <!-- Actions Panel -->
                <Actions 
                  :downloadOptions="downloadOptions"
                  @download="downloadDocument"
                  @backToEditing="backToEditing"
                  :is-downloading="isDownloading"
                />

                <!-- AI Revision Panel -->
               <Revise 
                  @submit="submitRevisionRequest" 
                  :is-loading="isRevising"
                  @showHistory="handleShowHistory" 
                />
              </div>
            </aside>
          </div>
        </div>
      </template>
    </main>

    <RevisionHistoryModal
      :is-open="isHistoryModalOpen"
      :history="documentStore.revisionHistory"
      :is-loading="documentStore.isHistoryLoading"
      :error="documentStore.error"
      @close="isHistoryModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted,watch,computed,onBeforeUnmount} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFinalDocument, editDocument, updateDocument,downloadFile} from '../api/conversations'
import { useDocumentStore } from '../store/document' 
import { useAuthStore } from '../store/auth'
import Editor from '../components/showfile/Editor.vue'
import Actions from '../components/showfile/Actions.vue'
import Revise from '../components/showfile/Revise.vue'
import RevisionHistoryModal from '../components/showfile/RevisionHistoryModal.vue'

import { saveAs } from 'file-saver'

const isHistoryModalOpen = ref(false); 
const isDownloading = ref(false);//跟踪下载状态
const saveStatus = ref('saved'); // 保存状态 (saved, saving, unsaved, error)
let saveTimeout = null; // 用于防抖的计时器


const route = useRoute();
const router = useRouter();
const documentStore = useDocumentStore();
const authStore = useAuthStore(); 
// --- 响应式数据 ---

const documentContent = computed({
  get() {
    // 1. 修改：当正在生成 或 正在修订时，都显示流式内容
    if (documentStore.isGenerating || documentStore.isRevising) {
      return documentStore.streamingContent;
    }
    // 否则显示当前文档的稳定内容
    return documentStore.currentDocument?.content || '';
  },
  set(value) {
    // 当用户编辑时，直接更新 store 中的最终文档
    if (documentStore.currentDocument) {
      documentStore.currentDocument.content = value;
    }
  }
});
const downloadOptions = ref([
  { format: 'PDF', label: '下载为 (PDF)' },
  { format: 'DOCX', label: '下载为 (DOCX)' }
]);

// 处理显示历史记录的事件
const handleShowHistory = async () => {
  isHistoryModalOpen.value = true;
  const docId = route.params.id;
  if (docId) {
    // 调用 store action 获取数据
    await documentStore.fetchRevisionHistory(docId);
  }
};

// --- 计算属性，从 store 获取数据 ---
const documentTitle = computed(() => documentStore.currentDocument?.title || 'Document');
const documentMessageId = computed(() => documentStore.currentDocument?.id || '');
const documentUpdatedAt = computed(() => documentStore.currentDocument?.created_at || '');
const isLoading = computed(() => documentStore.isLoading);
const isRevising = computed(() => documentStore.isRevising); // 2. 从 store 获取 isRevising 状态
const error = computed(() => documentStore.error);

// --- 生命周期钩子 ---
onMounted(() => {
  const docId = route.params.id;
  // 只有在没有正在进行的生成任务时，才去获取历史文档
  if (docId && !documentStore.isGenerating) {
    documentStore.fetchFinalDocument(docId);
  } else if (!docId) {
    documentStore.error = 'No document ID found in URL.';
  }
});

onBeforeUnmount(() => {
  // 在组件销毁前，清除任何待处理的保存操作
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
});
// --- 监听器 ---
watch(
  () => documentStore.currentDocument?.content,
  (newValue, oldValue) => {

    if (!documentMessageId.value) {
      return;
    }
    if (isLoading.value || documentStore.isGenerating || newValue === oldValue) {
      return;
    }
    saveStatus.value = 'unsaved';
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveChanges(newValue), 1500);
  }
);

// --- 方法 ---
async function saveChanges(contentToSave) {
  if (saveStatus.value === 'saving') return;

  saveStatus.value = 'saving';
  try {
    // 构建 payload
    const payload = {
      conversation_id: route.params.id,
      message_id: documentMessageId.value,
      prompt: contentToSave, // prompt 就是最新的文档内容
    };

    // --- 核心修复：调用 store action 来处理保存逻辑 ---
    await documentStore.saveDocumentChanges(payload);
    
    saveStatus.value = 'saved';

  } catch (e) {
    // store action 抛出错误时，在这里捕获并更新UI
    console.error("Save failed:", e);
    saveStatus.value = 'error';
  }
}

async function fetchDocument(id) {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await getFinalDocument(id);
    if (response.documents && response.documents.length > 0) {
      // 同时获取文档内容和ID
      const currentDocument = response.documents[0];
      documentMessageId.value = currentDocument.id;
      documentUpdatedAt.value = currentDocument.created_at; // 保存更新时间
      updateDocumentContent(currentDocument.content);
    } else {
      documentContent.value = '<p>No document content found for this conversation.</p>';
      error.value = 'No document content found.';
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}

async function submitRevisionRequest(prompt) {
  // 3. 使用计算属性 isRevising.value
  if (isRevising.value) return;

  if (!documentMessageId.value) {
    alert("Cannot revise document: The document ID is missing. Please try reloading the page.");
    return;
  }
  error.value = null;

  try {
    const payload = {
      conversation_id: route.params.id,
      message_id: documentMessageId.value,
      prompt: prompt,
    };

    await documentStore.reviseDocumentWithAI(payload);

    // 流结束后，store 会自动更新 currentDocument，我们只需标记状态
    saveStatus.value = 'saved'; // AI修订后也标记为已保存

  } catch (e) {
    console.error("Revision failed:", e);
    alert(`Revision failed: ${documentStore.error || e.message}`);
  } 
}

function updateDocumentContent(rawContent) {
  documentContent.value = rawContent;
}

const downloadDocument = async (format) => {
  const markdownContent = documentContent.value;
  if (!markdownContent || isDownloading.value) {
    if (!markdownContent) alert('文档内容为空，无法下载。');
    return;
  }

  isDownloading.value = true;
  try {
    const token = authStore.token;
    if (!token) {
      throw new Error("用户未登录，无法下载。");
    }

    const fileType = format.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      throw new Error(`不支持的下载格式: ${format}`);
    }

    // --- 修正：直接从 store 获取发文机关和字号信息 ---
    // 不再从 markdownContent 中解析，因为内容已经被过滤
    const titleContent = documentStore.documentTitleInfo || '';
    const docNoContent = documentStore.documentDocNoInfo || '';
    
    const payload = {
      prompt: markdownContent,
      type: fileType,
      information: [
        { type: 'title', contant: titleContent },
        { type: 'docNo', contant: docNoContent }
      ]
    };

    // 调用新的API函数
    const blob = await downloadFile(payload, token);
    
    const title = documentTitle.value || 'document';
    // 使用 file-saver 保存 Blob
    saveAs(blob, `${title}.${fileType}`);

  } catch (e) {
    console.error("下载失败:", e);
    alert(`下载失败: ${e.message}`);
  } finally {
    isDownloading.value = false;
  }
}

const backToEditing = async () => {
  const docId = route.params.id;
  if (!docId) {
    alert("错误：无法获取当前文档ID。");
    return;
  }

  // 调用 store action 获取历史数据
  const success = await documentStore.fetchAndSetHistoryData(docId);

  if (success) {
    // 成功获取数据后，跳转到创建页面
    router.push('/create');
  } else {
    // 如果失败，提示用户
    alert(`无法加载历史信息: ${documentStore.error}`);
  }
}
</script>

<style>
/* ... 样式保持不变 ... */
.document-viewer-theme {
  --primary-color: #0b80ee;
  --secondary-color: #e7edf4;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --background-color: #f9fafb;
  --border-color: #e5e7eb;
  --accent-color: #0b80ee;
  
  background-color: var(--background-color);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main Content */
.main-content {
  flex-grow: 1;
  max-width: 1400px; /* 增加最大宽度 */
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

.status-message {
  padding: 4rem 1rem;
  text-align: center;
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.error-message {
  color: #ef4444;
}

/* Breadcrumb */
.breadcrumb-section {
  margin-bottom: 2rem;
}

.breadcrumb {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: var(--primary-color);
}

.breadcrumb-current {
  color: var(--text-primary);
}

/* Content Grid - 左右并列布局 */
.content-grid {
  display: grid;
  grid-template-columns: 7fr 3fr; /* 左侧占3份，右侧占1份 */
  gap: 1rem;
  width: 100%;
  min-height: 600px; /* 确保有足够的高度 */
}

/* 小屏幕时也保持左右布局 */
@media (max-width: 1023px) {
  .content-grid {
    grid-template-columns: 1.5fr 1fr; /* 小屏幕时调整比例 */
    gap: 1rem;
  }
}

/* 超小屏幕时才变为上下布局 */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* Editor Section */
.editor-section {
  min-width: 0; /* 防止内容溢出 */
  overflow: hidden;
}

/* Sidebar Section */
.sidebar-section {
  min-width: 300px; /* 确保侧边栏最小宽度 */
}

.sidebar {
  height: fit-content;
}

.sidebar-sticky {
  position: sticky;
  top: 2rem; /* 调整粘性定位的顶部距离 */
}

/* 确保在较小屏幕上侧边栏不会太窄 */
@media (max-width: 1200px) {
  .sidebar-section {
    min-width: 280px;
  }
}

@media (max-width: 768px) {
  .sidebar-section {
    min-width: auto;
  }
  
  .sidebar-sticky {
    position: static; /* 小屏幕时取消粘性定位 */
  }
}

.revising-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 1. 将背景色改为完全透明 */
  background-color: transparent; 
  /* 2. 移除模糊效果 */
  /* backdrop-filter: blur(4px); */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50; /* 保持在最上层以拦截点击 */
  border-radius: 0.75rem;
}


/* 3. 移除覆盖层内的加载动画和文字样式，因为我们将把它们移到 Revise 组件中 */
.revising-spinner {
  display: none;
}

.revising-text {
  display: none;
}


@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>