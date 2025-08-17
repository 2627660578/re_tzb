<template>
  <div class="relative flex min-h-screen flex-col bg-[var(--background-color)] text-gray-800">
    <!-- 页面头部 (可以提取为独立组件) -->
    <header class="sticky top-0 z-10 w-full border-b border-[var(--border-color)] bg-white/80 backdrop-blur-md">
      <!-- ... 头部导航 HTML ... -->
    </header>

    <!-- 主内容区域 -->
    <main class="flex-grow">
      <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="space-y-6">
          <!-- 面包屑导航和标题 -->
          <div>
            <!-- ... 面包屑和标题 HTML ... -->
          </div>

          <!-- 动态表单容器  -->
          <div v-if="sections.length > 0" class="space-y-6">
            <div 
              v-for="(section, index) in sections" 
              :key="index" 
              class="bg-white border border-[var(--border-color)] rounded-xl shadow-sm transition-all hover:shadow-md"
            >
              <div class="title-toolbar-wrapper">
                <input type="text" v-model="section.title" class="dynamic-title-input" />
                <div class="formatting-toolbar">
                  <button 
                    title="加粗 (Ctrl+B)"
                    @mousedown.prevent="execBold"
                    :class="{ 'active': activeToolbar === index }"
                  >B</button>
                </div>
              </div>
              <div class="p-4">
                <div
                  contenteditable="true"
                  class="dynamic-content-editor"
                  v-html="section.contentHtml"
                  :ref="el => setEditorRef(el, index)"
                  @focus="activeToolbar = index"
                  @keyup="updateToolbarState($event, index)"
                  @mouseup="updateToolbarState($event, index)"
                ></div>
              </div>
            </div>
          </div>
          <!-- 加载失败或无内容时的提示 -->
          <div v-else class="bg-white border border-dashed border-yellow-400 rounded-xl shadow-sm p-6 text-center">
            <h3 class="text-lg font-medium text-yellow-800">未收到有效内容</h3>
            <p class="mt-1 text-sm text-yellow-700">未能解析出有效的内容清单，请返回上一页重试。</p>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end pt-4">
            <button @click="submitAndContinue" class="btn-primary" type="button">确认并继续</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,onBeforeUpdate } from 'vue';
import { useRouter } from 'vue-router';
import { useDocumentStore } from '../store/document'; // 导入 document store

// --- 类型定义 ---
interface Section {
  title: string;
  contentHtml: string; // 存储为HTML以便渲染
}

// **新增：为解析过程中的对象定义一个清晰的类型**
interface ParsingSection {
  title: string;
  content: string[];
}
// --- 响应式状态 ---
const router = useRouter();
const documentStore = useDocumentStore(); // 使用 store
const sections = ref<Section[]>([]);
const activeToolbar = ref<number | null>(null);
const editorRefs = ref<HTMLDivElement[]>([]);
// --- 方法 ---

const setEditorRef = (el: any, index: number) => {
  if (el) {
    editorRefs.value[index] = el as HTMLDivElement;
  }
};

onBeforeUpdate(() => {
  editorRefs.value = [];
});

/**
 * 解析获取的文本数据
 */
const parseChecklistData = (data: string) => {
  const lines = data.trim().split('\n');
  const parsedSections: Section[] = [];
  let currentSection: ParsingSection | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('### ')) {
      if (currentSection) {
        parsedSections.push({
          title: currentSection.title,
          contentHtml: currentSection.content.map(formatLineToHtml).join('')
        });
      }
      currentSection = { title: trimmedLine.replace('### ', '').replace(/：$/, ''), content: [] };
    } else if (currentSection && trimmedLine.startsWith('- ')) {
      currentSection.content.push(trimmedLine.replace(/^- \s*/, ''));
    }
  }

  if (currentSection) {
    parsedSections.push({
      title: currentSection.title,
      contentHtml: currentSection.content.map(formatLineToHtml).join('')
    });
  }
  
  sections.value = parsedSections;
};

const formatLineToHtml = (line: string): string => {
  const colonIndex = line.indexOf('：');
  if (colonIndex !== -1) {
    const label = line.substring(0, colonIndex);
    const value = line.substring(colonIndex + 1);
    return `<div><strong>${label}：</strong>${value}</div>`;
  }
  return `<div>${line}</div>`;
};


/**
 * 执行加粗命令
 */
const execBold = () => {
  document.execCommand('bold', false, undefined);
};

/**
 * 更新工具栏按钮的激活状态
 */
const updateToolbarState = (event: Event, index: number) => {
    activeToolbar.value = index;
    const button = (event.currentTarget as HTMLElement).closest('.bg-white')?.querySelector('.formatting-toolbar button');
    if (button) {
        if (document.queryCommandState('bold')) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }
};


const submitAndContinue = async () => {
  if (documentStore.isGenerating) return;

  let contentParts: string[] = [];
  
  // **核心改动**：从 sections 和 editorRefs 中收集数据
  sections.value.forEach((section, index) => {
    const editor = editorRefs.value[index];
    if (editor) {
      contentParts.push(`### ${section.title.trim()}`);
      
      // 使用临时的 div 来解析 HTML 内容，这是一种安全可靠的方式
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editor.innerHTML; // 从编辑器DOM引用直接读取内容
      
      const lineDivs = tempDiv.querySelectorAll('div');
      lineDivs.forEach(lineDiv => {
        const plainText = lineDiv.textContent?.trim();
        if (plainText) {
          contentParts.push(`- ${plainText}`);
        }
      });
    }
  });
  
  const finalContent = contentParts.join('\n');
  
  const conversationId = documentStore.currentConversationId; // 从 store 获取 ID
  if (!conversationId) {
    alert("错误：无法在Store中找到会话ID，无法继续。");
    return;
  }

  try {
    await documentStore.generateDocumentFromChecklist({
      conversation_id: conversationId,
      content: finalContent,
    });
    router.push(`/showfile/${conversationId}`);
  } catch (err: any) {
    alert(`启动文档生成失败: ${err.message}`);
  }
};

// --- 生命周期钩子 ---
onMounted(() => {
  const checklistData = documentStore.checklistContent;
  if (checklistData) {
    parseChecklistData(checklistData);
  } else {
    console.error('未在Store中找到清单数据，请确保已正确保存。');
    // 可以在这里添加一个备用内容或导航回上一页的逻辑
  }
});
</script>

<style scoped>
:root {
  --primary-color: #dce8f3;
  --text-primary: #111827;
  --text-strong: #374151;
  --text-secondary: #6b7280;
  --background-color: #f9fafb;
  --border-color: #e5e7eb;
  --accent-color: #3b82f6;
}

.btn-primary {
  width: 100%;
  border-radius: 0.5rem; /* rounded-lg */
  background-color: var(--accent-color);
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  font-size: 1rem; /* text-base */
  font-weight: 600; /* font-semibold */
  color: white;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #2563eb; /* hover:bg-blue-700 */
}
.btn-primary:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  --tw-ring-color: #3b82f6; /* focus:ring-blue-500 */
  box-shadow: 0 0 0 2px var(--background-color), 0 0 0 4px var(--tw-ring-color);
}

.btn-secondary {
  border-radius: 0.5rem;
  background-color: var(--primary-color);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: #bfdbfe; /* hover:bg-blue-200 */
}

.dynamic-content-editor {
  width: 100%;
  font-size: 1rem;
  background-color: white;
  outline: none;
  border: none;
  padding: 0;
  line-height: 1.625; /* leading-relaxed */
  transition: all 0.2s;
  color: var(--text-secondary);
  min-height: 80px;
}

.dynamic-content-editor strong, .dynamic-content-editor b {
  font-weight: 600;
  color: var(--text-strong);
}

.dynamic-title-input {
  width: 100%;
  font-size: 1.25rem; /* text-xl */
  font-weight: 700; /* font-bold */
  color: var(--text-primary);
  background-color: transparent;
  outline: none;
  border: none;
  padding: 0;
}

.formatting-toolbar {
  display: flex;
  align-items: center;
}

.formatting-toolbar button {
  display: flex;
  height: 2rem; /* h-8 */
  width: 2rem; /* w-8 */
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem; /* rounded-md */
  border: 1px solid transparent;
  font-size: 1.125rem; /* text-lg */
  font-weight: 700; /* font-bold */
  color: #4b5563; /* text-gray-600 */
  transition: background-color 0.2s, color 0.2s;
}
.formatting-toolbar button:hover {
  background-color: #f3f4f6; /* hover:bg-gray-100 */
  color: #111827; /* hover:text-gray-900 */
}
.formatting-toolbar button:focus {
  outline: 2px solid transparent;
  outline-offset: 1px;
  --tw-ring-color: #60a5fa; /* focus:ring-blue-400 */
  box-shadow: 0 0 0 2px var(--background-color), 0 0 0 4px var(--tw-ring-color);
}

.formatting-toolbar button.active {
  background-color: #dbeafe; /* bg-blue-100 */
  color: #2563eb; /* text-blue-600 */
}

.title-toolbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}
</style>