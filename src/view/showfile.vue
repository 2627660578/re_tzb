<template>
  <div class="document-viewer-theme">
    <!-- Main Content -->
    <main class="main-content">
      <!-- 加载与错误状态 -->
      <div v-if="isLoading" class="status-message">
        <p>Loading document...</p>
      </div>
      <div v-else-if="error" class="status-message error-message">
        <p>Failed to load document:</p>
        <p>{{ error }}</p>
      </div>

      <template v-else>
        <div class="breadcrumb-section">
          <nav class="breadcrumb">
            <router-link class="breadcrumb-link" to="/documents">My Documents</router-link>
            <span>/</span>
            <span class="breadcrumb-current">{{ documentTitle }}</span>
          </nav>
        </div>

        <div class="content-grid">
          <!-- Document Section - 传递动态props给Editor组件 -->
        <div class="editor-section">
          <!-- 使用 v-model 并传递保存状态 -->
          <Editor 
            :document-title="documentTitle" 
            v-model:document-content="documentContent"
            :document-updated-at="documentUpdatedAt"
            :save-status="saveStatus"
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
                />

                <!-- AI Revision Panel -->
                <Revise @submit="submitRevisionRequest" :is-loading="isRevising" />
              </div>
            </aside>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted,watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 导入新创建的API函数
import { getFinalDocument, editDocument, updateDocument } from '../api/conversations'
import Editor from '../components/showfile/Editor.vue'
import Actions from '../components/showfile/Actions.vue'
import Revise from '../components/showfile/Revise.vue'

import { marked } from 'marked'
import html2pdf from 'html2pdf.js'

import { saveAs } from 'file-saver'


const route = useRoute();
const router = useRouter();

// --- 响应式数据 ---
const documentTitle = ref('Document');
const documentContent = ref('');
const documentMessageId = ref('');
const documentUpdatedAt = ref(''); // *** 修复：在这里声明 documentUpdatedAt ***
const isLoading = ref(true);
const isRevising = ref(false);
const saveStatus = ref('saved'); // 保存状态 (saved, saving, unsaved, error)
const error = ref(null);
let saveTimeout = null; // 用于防抖的计时器

const downloadOptions = ref([
  { format: 'PDF', label: '下载为 (PDF)' },
  { format: 'DOCX', label: '下载为 (DOCX)' }
]);

// --- 生命周期钩子 ---
onMounted(() => {
  // **修改部分开始**
  // 检查 localStorage 中是否存在从 2.html 传递过来的最终内容
  const finalContent = localStorage.getItem('docuCraftFinalContent');
  const conversationId = localStorage.getItem('docuCraftConversationId');

  if (finalContent && conversationId) {
    // 如果存在，说明是从第二步跳转过来的，需要开始生成最终文档
    console.log("检测到 finalContent，开始生成最终文档...");
    isLoading.value = true; // 显示加载状态
    startDocumentGeneration(conversationId, finalContent);

    // 清理 localStorage，防止下次直接访问此页面时重复生成
    localStorage.removeItem('docuCraftFinalContent');
    // conversationId 暂时保留，因为后续的修订和保存可能还需要
  } else {
    // 否则，按原逻辑获取已存在的文档
    const docId = route.params.id;
    if (docId) {
      fetchDocument(docId);
    } else {
      error.value = 'No document ID found in URL.';
      isLoading.value = false;
    }
  }
  // **修改部分结束**
});

// 监听文档内容变化以触发自动保存 ---
watch(documentContent, (newValue, oldValue) => {
  // 忽略初始加载时的内容设置
  if (isLoading.value || newValue === oldValue) {
    return;
  }

  saveStatus.value = 'unsaved';
  // 清除上一个计时器
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  // 设置一个新的计时器，1.5秒后执行保存
  saveTimeout = setTimeout(() => {
    saveChanges(newValue);
  }, 1500);
});

// --- 方法 ---

async function saveChanges(contentToSave) {
  if (saveStatus.value === 'saving') return;

  saveStatus.value = 'saving';
  try {
    const payload = {
      conversation_id: route.params.id,
      message_id: documentMessageId.value,
      prompt: contentToSave,
    };

    const updatedDocument = await updateDocument(payload);

    // 关键：用后端返回的新ID和时间更新本地状态
    documentMessageId.value = updatedDocument.id;
    documentUpdatedAt.value = updatedDocument.created_at;
    saveStatus.value = 'saved';

  } catch (e) {
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
      // *** 这是关键修改 ***
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

//处理AI修订请求的函数
async function submitRevisionRequest(prompt) {
  if (isRevising.value) return;

  if (!documentMessageId.value) {
    alert("Cannot revise document: The document ID is missing. Please try reloading the page.");
    return;
  }

  isRevising.value = true;
  error.value = null;
  documentContent.value = ''; // 开始修订时，清空当前内容

  try {
    const payload = {
      conversation_id: route.params.id,
      message_id: documentMessageId.value,
      prompt: prompt,
      use_knowledge_base: false,
      knowledge_base_id: ""
    };

    // 定义一个回调函数，用于在接收到数据块时更新UI
    const handleChunk = (fullContent) => {
      updateDocumentContent(fullContent);
    };

    // 调用API，并传入回调
    const finalDocument = await editDocument(payload, handleChunk);

    // 流结束后，用最终的ID和时间更新状态
    documentMessageId.value = finalDocument.id;
    documentUpdatedAt.value = finalDocument.created_at;
    saveStatus.value = 'saved'; // AI修订后也标记为已保存


  } catch (e) {
    console.error("Revision failed:", e);
    alert(`Revision failed: ${e.message}`);
  } finally {
    isRevising.value = false;
  }
}


function updateDocumentContent(rawContent) {
  documentContent.value = rawContent;
}
const downloadDocument = async (format) => {
    const markdownContent = documentContent.value;
  if (!markdownContent) {
    alert('Document is empty, cannot download.');
    return;
  }

  // 将 Markdown 转换为 HTML
  let htmlContent = marked.parse(markdownContent);
  const title = documentTitle.value || 'document';

  htmlContent = htmlContent.replace(/<li><p>/g, '<li>').replace(/<\/p><\/li>/g, '</li>');
  switch (format) {
    case 'PDF': {
      // *** 核心修复：定义PDF所需的CSS样式 ***
      const pdfStyles = `
        <style>
          ol { 
            list-style-type: decimal; 
            padding-left: 2em; /* 增加左边距，让数字和文本有间距 */
          }
        </style>
      `;

      // 创建一个临时的、带样式的容器来渲染HTML
      const element = document.createElement('div');
      // 将样式和HTML内容一起注入
      element.innerHTML = pdfStyles + htmlContent;
      // 添加一些内边距，让PDF内容不会紧贴边缘
      element.style.padding = '20mm'; 
      element.style.width = '210mm'; // A4 宽度

      // --- 新增：在下载前将最终的HTML内容打印到控制台 ---
      console.log("--- HTML content for PDF generation ---");
      console.log(element.innerHTML);
      console.log("---------------------------------------");

      const opt = {
        margin: 0,
        filename: `${title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().from(element).set(opt).save();
      break;
    }
    case 'DOCX': {
      break;
    }
    default:
      console.warn(`Unsupported download format: ${format}`);
  }
}

const backToEditing = () => {
  router.push('/documents');
}

/**
 * 启动最终文档的生成流程。
 * 此函数会从 localStorage 获取必要的数据，
 * 然后向后端 API 发送请求以接收流式文档内容。
 */
async function startDocumentGeneration() {
    // --- 1. 从 localStorage 获取数据 ---
    // 使用 localStorage.getItem() 方法，通过之前页面设定的键名来获取存储的值。
    const conversationId = localStorage.getItem('docuCraftConversationId');
    const finalContent = localStorage.getItem('docuCraftFinalContent');

    // --- 2. 验证数据是否存在 ---
    // 这是一个重要的健壮性检查，确保流程所需的前置数据都已到位。
    if (!conversationId || !finalContent) {
        console.error("错误：关键会话信息丢失，无法生成文档。请返回第一步重试。");
        // 在实际应用中，您应该在这里向用户显示一个友好的错误提示。
        // 例如: document.getElementById('error-message').textContent = "关键信息丢失...";
        return; // 终止函数执行
    }

    // (可选) 在控制台打印获取到的数据，方便调试
    console.log("获取到的 Conversation ID:", conversationId);
    console.log("获取到的最终内容:", finalContent);
    
    // 这是一个示例 JWT 令牌，实际应用中应从登录认证流程中动态获取
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODUyNDU3NzUsImlhdCI6MTc1MzcwOTc3NSwiand0VXNlcklkIjoxfQ.JYvVjxRbWuwXMHTwowExQIL1liYMDhLuwHQ668-PvAo';


    // --- 3. 准备并发送请求 ---
    // 根据接口文档构建请求体 (payload)
    const payload = {
        conversation_id: conversationId,
        content: finalContent,
        // template_id 是可选的，如果您的应用需要，可以在这里添加
        // template_id: "tpl_123" 
    };

    try {
        // 使用 Fetch API 发送 POST 请求
        const response = await fetch('http://47.98.215.181:8010/llmcenter/v1/chat/resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` // 根据接口要求添加认证头
            },
            body: JSON.stringify(payload) // 将 JavaScript 对象转换为 JSON 字符串
        });

        // 检查响应状态码，如果不是 2xx，则抛出错误
        if (!response.ok) {
            // 尝试解析错误响应体以获取更详细的错误信息
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.msg || `HTTP 错误: ${response.status}`;
            throw new Error(message);
        }

        // --- 4. 处理流式响应 (Server-Sent Events) ---
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = ''; // 用于拼接所有收到的文本块

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                console.log("数据流接收完毕。");
                break; // 当流结束时，退出循环
            }

            // 将接收到的二进制数据块解码为字符串，并追加到缓冲区
            buffer += decoder.decode(value, { stream: true });
            
            // SSE 事件以 `\n\n` 分隔，所以按此分割来处理每个事件块
            const parts = buffer.split('\n\n');
            buffer = parts.pop(); // 最后一个元素可能是不完整的事件，将其放回缓冲区等待下一次数据

            for (const part of parts) {
                const eventLine = part.split('\n').find(line => line.startsWith('event:'));
                const dataLine = part.split('\n').find(line => line.startsWith('data:'));

                if (eventLine && dataLine) {
                    const eventType = eventLine.substring(6).trim();
                    const dataJson = dataLine.substring(5).trim();

                    try {
                        const data = JSON.parse(dataJson);
                        
                        // 根据事件类型处理数据
                        if (eventType === 'message' && data.chunk) {
                            // 将新的文本块拼接到完整内容上
                            fullContent += data.chunk;
                            // **在这里更新你的UI**
                            updateDocumentContent(fullContent);
                            isLoading.value = false; // 收到第一个数据块后，停止全局加载动画

                        } else if (eventType === 'end') {
                            console.log('收到结束事件:', data);
                            // 流结束后，用最终的ID和时间更新状态
                            if(data.id) {
                                documentMessageId.value = data.id;
                            }
                            if(data.created_at) {
                                documentUpdatedAt.value = data.created_at;
                            }
                            saveStatus.value = 'saved'; // AI生成后也标记为已保存
                        }
                    } catch (e) {
                        console.error("解析流数据失败:", e, "原始数据:", dataJson);
                    }
                }
            }
        }
    } catch (error) {
        console.error('请求或处理流时出错:', error);
        // 在这里向用户显示错误信息
        // document.getElementById('error-message').textContent = error.message;
        self.error.value = error.message;
        isLoading.value = false;
    }
}

// 当页面DOM加载完成后，自动调用此函数
// document.addEventListener('DOMContentLoaded', startDocumentGeneration);
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
  grid-template-columns: 2fr 1fr; /* 左侧占2份，右侧占1份 */
  gap: 2rem;
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
</style>