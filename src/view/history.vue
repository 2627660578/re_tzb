<template>
  <div class="flex flex-col min-h-screen bg-white text-gray-800">
    <!-- Main Content -->
    <main class="flex-grow bg-gray-100">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="max-w-5xl mx-auto">
          <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">历史记录</h1>
            <p class="mt-1 text-gray-600">查看和管理您的生成文档。</p>
          </header>

          <!-- 加载与错误状态 (从 Store 获取) -->
          <div v-if="documentStore.isLoading" class="text-center py-10">
            <p class="text-gray-500">加载文档中...</p>
          </div>
          <div v-else-if="documentStore.error" class="text-center py-10 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 font-medium">加载失败</p>
            <p class="text-red-500 mt-1">{{ documentStore.error }}</p>
          </div>

          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Search Section -->
            <div class="p-4 sm:p-6 border-b border-gray-200">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clip-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" fill-rule="evenodd"></path>
                  </svg>
                </span>
                <input 
                  v-model="searchQuery"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="输入标题查找..." 
                  type="search"
                />
              </div>
            </div>

            <!-- Documents Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 sm:pl-6" scope="col">文档</th>
                    <th class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-800 sm:table-cell" scope="col">生成时间</th>
                    <th class="relative py-3.5 pl-3 pr-4 sm:pr-6" scope="col">
                      <span class="sr-only">查看文档</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-if="paginatedDocuments.length === 0">
                    <td colspan="3" class="text-center py-10 text-gray-500">
                      {{ searchQuery ? '未找到匹配的文档' : '暂无文档' }}
                    </td>
                  </tr>
                  <tr 
                    v-for="doc in paginatedDocuments" 
                    :key="doc.conversation_id"
                    class="group cursor-pointer hover:bg-gray-50"
                    @click="viewDocument(doc)"
                  >
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="font-medium text-gray-800 group-hover:text-blue-500">{{ doc.title }}</div>
                      <div class="text-gray-600 sm:hidden">{{ formatDate(doc.updated_at) }}</div>
                    </td>
                    <td class="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-600 sm:table-cell">
                      {{ formatDate(doc.updated_at) }}
                    </td>
                    <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button 
                        class="text-blue-500 hover:text-blue-700"
                        @click.stop="viewDocument(doc)"
                      >
                        View
                        <span class="sr-only">, {{ doc.title }}</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 新增：分页控件 -->
            <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div class="flex flex-1 justify-between sm:hidden">
                <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">上一页</button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">下一页</button>
              </div>
              <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    第
                    <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                    到
                    <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredDocuments.length) }}</span>
                    条，共
                    <span class="font-medium">{{ filteredDocuments.length }}</span>
                    条
                  </p>
                </div>
                <div>
                  <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span class="sr-only">上一页</span>
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">第 {{ currentPage }} / {{ totalPages }} 页</span>
                    <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span class="sr-only">下一页</span>
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
        <p>© 2024 DocuCraft. All rights reserved.</p>
      </div>
    </footer>

    <!-- Document Modal -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 lg:p-8"
      @click="closeModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl w-full h-full max-w-[80vw] max-h-[80vh] flex flex-col relative"
        @click.stop
      >
        <button 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1"
          @click="closeModal"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>
        
        <div class="flex-grow p-6 sm:p-8 overflow-y-auto">
          <div v-if="modalContentLoading" class="text-center py-10">加载中...</div>
          <div v-else-if="modalError" class="text-red-500 text-center py-10">{{ modalError }}</div>
          <div v-else class="prose max-w-none">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">{{ selectedDocument?.title }}</h2>
            <div class="space-y-6 text-gray-700" v-html="selectedDocument?.content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,watch } from 'vue'
import { useRouter } from 'vue-router'
import { getConversationsList, getConversationDetails } from '../api/conversations'
import { useDocumentStore } from '../store/document'; // 导入新的 store


const documentStore = useDocumentStore();
const router = useRouter()

// --- 响应式数据 ---
const searchQuery = ref('')
const documents = ref([])
const isLoading = ref(true)
const error = ref(null)

// 模态框状态
const isModalOpen = ref(false)
const selectedDocument = ref(null)
const modalContentLoading = ref(false)
const modalError = ref(null)

const currentPage = ref(1);
const itemsPerPage = 10;


// --- 生命周期钩子 ---
onMounted(() => {
  // 调用 store action 来获取数据，它会自动处理认证
  documentStore.fetchConversations();
});

// --- 方法 ---

// 获取文档列表
async function fetchDocuments() {
  isLoading.value = true
  error.value = null
  try {
    // getConversationsList 现在会正确返回包含会话的数组
    const data = await getConversationsList()
    documents.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

// --- 计算属性：用于搜索过滤 ---
const filteredDocuments = computed(() => {
  // 直接从 store 获取会话列表
  const docs = [...documentStore.conversations];

  // 按时间从新到旧排序
  docs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (!searchQuery.value) {
    return docs;
  }
  return docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

//计算总页数
const totalPages = computed(() => {
  return Math.ceil(filteredDocuments.value.length / itemsPerPage);
});

// 根据分页和过滤结果，计算当前页要显示的数据
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredDocuments.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}
// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 导航到文档编辑/查看页面
const viewDocument = (doc) => {
  router.push(`/showfile/${doc.conversation_id}`)
}

watch(searchQuery, () => {
  currentPage.value = 1;
});

</script>

<style scoped>
/* 表格行悬停效果 */
tr:hover {
  background-color: #f9fafb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>