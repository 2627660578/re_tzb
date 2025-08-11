<template>
  <div class="document-section">
    <div class="document-container">
      <div class="document-padding">

        <p :class="['save-status', `save-status--${saveStatus}`]">
              {{ statusIndicator.text }}
        </p>
        
        <!-- Tiptap 编辑器容器 -->
        <div v-if="editor">
          <editor-content :editor="editor" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount,computed } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

// 1. 定义Props和Emits
const props = defineProps({
  documentTitle: {
    type: String,
    default: 'Document'
  },
  documentContent: {
    type: String,
    required: true,
    default: ''
  },
  documentUpdatedAt: {
    type: String,
    default: ''
  },
  saveStatus: {
    type: String,
    default: 'saved' // 'saved', 'saving', 'unsaved', 'error'
  }
});

const emit = defineEmits(['update:documentContent']);

const statusIndicator = computed(() => {
  switch (props.saveStatus) {
    case 'saving':
      return { text: '正在保存...' };
    case 'saved':
      return { text: '已保存' };
    case 'unsaved':
      return { text: '有未保存的更改' };
    case 'error':
      return { text: '保存失败' };
    default:
      return { text: '' };
  }
});

// 2. 初始化 Tiptap 编辑器
const editor = useEditor({
  // 使用 EditorContent 组件来渲染
  content: props.documentContent,
  extensions: [
    StarterKit.configure({
      // 根据需要配置StarterKit
      heading: {
        levels: [1, 2, 3],
      },
    }),
    // 关键：添加Markdown扩展
    Markdown.configure({
      html: true, // 允许在Markdown中解析HTML
      tightLists: true, // 紧凑列表
      linkify: true, // 自动识别链接
      // breaks: true, // 将软换行符渲染为<br>
    }),
  ],
  // 3. 当编辑器内容更新时，发出事件
  onUpdate: ({ editor }) => {
    // 将内容转换为Markdown格式并发送给父组件
    emit('update:documentContent', editor.storage.markdown.getMarkdown());
  },
});

// 4. 监听父组件传递的内容变化，并更新编辑器
watch(() => props.documentContent, (newValue) => {
  // isFocused 检查可以防止在用户正在输入时，由父组件触发的不必要更新
  if (editor.value && !editor.value.isFocused) {
    const currentMarkdown = editor.value.storage.markdown.getMarkdown();
    // 只有当内容确实不同时才更新
    if (currentMarkdown !== newValue) {
      editor.value.commands.setContent(newValue, false, {
        parseOptions: {
          markdown: true
        }
      });
    }
  }
}, {
  immediate: true
});

// 5. 在组件卸载前销毁编辑器实例，防止内存泄漏
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>

.ProseMirror {
  outline: none;
  line-height: 1.625;
  color: #374151;
}

.ProseMirror > * + * {
  margin-top: 0.75em;
}

.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3 {
  line-height: 1.1;
  font-weight: 700;
}

.ProseMirror h1 { font-size: 2em; }
.ProseMirror h2 { font-size: 1.5em; }
.ProseMirror h3 { font-size: 1.25em; }

.ProseMirror ul,
.ProseMirror ol {
  padding: 0 1rem;
}

.ProseMirror strong {
  font-weight: bold;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>

<style scoped>
/* Document Section */
.document-section {
  flex-grow: 1;
  width: 100%;
  height: fit-content;
}

.document-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
}

.document-padding {
  padding: 1rem;
}

@media (min-width: 640px) {
  .document-padding {
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .document-padding {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .document-padding {
    padding: 3rem;
  }
}

.document-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.document-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.document-meta {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.document-meta p {
  margin: 0.25rem 0;
}

.meta-label {
  font-weight: 600;
  color: #4b5563;
}

.document-meta {
  display: flex;
  justify-content: space-between; /* 让元数据两端对齐 */
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.save-status {
  font-weight: 500;
  transition: color 0.3s;
}
.save-status--saved {
  color: #10b981; /* 绿色 */
}
.save-status--saving {
  color: #6b7280; /* 灰色 */
}
.save-status--unsaved {
  color: #529df1; 
}
.save-status--error {
  color: #6b7280;
}

</style>

<style>
/* Tiptap 编辑器全局样式 */
.tiptap-editor-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1.5rem;
  min-height: 400px;
  transition: border-color 0.2s;
}

.tiptap-editor-wrapper:focus-within {
  border-color: #0b80ee;
  box-shadow: 0 0 0 2px rgba(11, 128, 238, 0.2);
}
/* ... */

.ProseMirror h1 { font-size: 2em; }
.ProseMirror h2 { font-size: 1.5em; }
.ProseMirror h3 { font-size: 1.25em; }

.ProseMirror ul,
.ProseMirror ol {
  padding: 0 1rem;
}

/* *** 核心修复：将这条规则移动到全局 <style> 块中 *** */
.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror strong {
  font-weight: bold;
}

</style>