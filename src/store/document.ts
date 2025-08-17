import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import * as conversationsApi from '../api/conversations';

export const useDocumentStore = defineStore('document', () => {
  // --- State ---
  const checklistContent = ref<string | null>(null); // 用于存储清单内容
  const currentConversationId = ref<string | null>(null); // 存储当前会话ID
  const conversations = ref<conversationsApi.ConversationSummary[]>([]);
  const currentDocument = ref<conversationsApi.FinalDocument | null>(null);
  const isLoading = ref(false);
  const isRevising = ref(false);
  const isGenerating = ref(false); 
  const streamingContent = ref(''); 
  const error = ref<string | null>(null);
  const historyData = ref<conversationsApi.HistoryDataItem | null>(null);
  const revisionHistory = ref<conversationsApi.Message[]>([]);
  const isHistoryLoading = ref(false); // 为历史记录加载添加独立的状态

  // --- Actions ---

  /**
   * 获取并检查认证Token的辅助函数
   */
  const _getAuthToken = (): string => {
    const authStore = useAuthStore();
    if (!authStore.token) {
      throw new Error('用户未登录或Token无效');
    }
    return authStore.token;
  };

  /**
   * 获取用户的所有会话列表
   */
  const fetchConversations = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const token = _getAuthToken();
      const data = await conversationsApi.getConversationsList(token);
      conversations.value = data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch conversations:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 获取指定会话的最终文档
   * @param {string} conversationId - 会话ID
   */
  const fetchFinalDocument = async (conversationId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const token = _getAuthToken();
      if (!token) throw new Error("Authentication token not found.");

      const response = await conversationsApi.getFinalDocument(conversationId, token);

      if (response.documents && response.documents.length > 0) {
        // --- 核心修复：将整个文档对象赋值给 currentDocument ---
        // 这样可以确保 id, content, created_at, title 都被正确保存
        currentDocument.value = response.documents[0];
      } else {
        error.value = 'No document content found for this conversation.';
        currentDocument.value = null;
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch final document:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // ...existing code...
  /**
   * 使用AI修订文档
   * @param {Omit<conversationsApi.EditRequest, 'use_knowledge_base'>} payload - 修订请求数据
   */
  const reviseDocumentWithAI = async (
    payload: Omit<conversationsApi.EditRequest, 'use_knowledge_base'>
  ) => {
    isRevising.value = true; // 2. 开始修订，设置状态
    error.value = null;
    streamingContent.value = currentDocument.value?.content || ''; // 3. 初始化流式内容为当前内容

    try {
      const token = _getAuthToken();
      const fullPayload = { ...payload, use_knowledge_base: false };

      // 4. 定义流式回调，实时更新 streamingContent
      const onChunkReceived = (chunk: string) => {
        streamingContent.value = chunk;
      };

      // 5. 调用API，传入回调。我们现在等待它完成，以获取最终的ID
      const updatedDoc = await conversationsApi.editDocument(fullPayload, token, onChunkReceived);

      // 6. 流结束后，用最终结果更新 currentDocument
      if (currentDocument.value) {
        currentDocument.value.id = updatedDoc.id;
        currentDocument.value.content = updatedDoc.content;
        currentDocument.value.created_at = updatedDoc.created_at;
      } else {
        currentDocument.value = updatedDoc;
      }

    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to revise document:', err);
      throw err;
    } finally {
      isRevising.value = false; // 7. 无论成功或失败，结束修订状态
    }
  };

   /**
    * 自动保存文档修改
    * @param { conversationsApi.UpdateRequest } payload - 更新请求数据
    */
  const saveDocumentChanges = async (payload: conversationsApi.UpdateRequest) => {
    // 注意：这里不再设置全局 isLoading，因为这是一个后台的、无感知的保存
    // error.value = null;
    try {
      const token = _getAuthToken();
      // 调用更新后的 API 函数
      const response = await conversationsApi.updateDocument(payload, token);

      // 检查后端返回的 success 字段
      if (response.success) {
        // 如果保存成功，只更新 Pinia store 中的 content 内容，
        // 保持 id 和 created_at 不变。
        if (currentDocument.value) {
          currentDocument.value.content = payload.prompt;
        }
      } else {
        // 如果后端明确返回 success: false
        throw new Error("Failed to save document on the server.");
      }
    } catch (err: any) {
      // 保存失败时，需要有机制通知用户
      error.value = err.message;
      console.error('Failed to save document changes:', err);
      // 重新抛出错误，让调用方可以处理UI（例如显示“保存失败”）
      throw err;
    }
  };

  /**
   * 新增：根据大纲生成最终文档
   * @param {conversationsApi.GenerateDocumentRequest} payload
   * @returns {Promise<boolean>} - 返回是否成功
   */
  /**
    * 新增：调用 resume 接口，处理流式生成
    * @param payload - 包含 conversation_id 和 content 的对象
    * @returns {Promise<void>}
    */
  const generateDocumentFromChecklist = async (payload: conversationsApi.ResumeRequest): Promise<void> => {
    isGenerating.value = true;
    error.value = null;
    streamingContent.value = ''; // 开始前清空
    currentDocument.value = null; // 清空旧的最终文档

    try {
      const token = _getAuthToken();

      const onChunkReceived = (chunk: string) => {
        streamingContent.value = chunk;
      };

      const onEnd = (endData: conversationsApi.StreamEndData) => {
        // 流结束时，将最终内容和ID更新到 currentDocument
        currentDocument.value = {
          id: endData.message_id,
          content: streamingContent.value,
          created_at: new Date().toISOString(),
        };
        isGenerating.value = false; // 标记生成过程结束
      };

      // 这个调用是异步的，但我们不需要 await 它完成，因为它会通过回调更新状态
      conversationsApi.resumeAndGenerateDocument(payload, token, onChunkReceived, onEnd);

    } catch (err: any) {
      error.value = err.message;
      isGenerating.value = false; // 出错时也要结束状态
      console.error('Failed to trigger document generation:', err);
      throw err; // 抛出错误，让调用方知道
    }
  };

  /**
 * 新增：获取历史数据并存储，用于页面跳转
 * @param conversationId
 * @returns {Promise<boolean>} - 返回是否成功
 */
  const fetchAndSetHistoryData = async (conversationId: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    try {
      const token = _getAuthToken();
      const response = await conversationsApi.getHistoryData(conversationId, token);
      if (response.items && response.items.length > 0) {
        historyData.value = response.items[0];
        return true;
      }
      throw new Error("No history data found for this conversation.");
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch history data:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
 * 新增：获取修订历史记录
 * @param conversationId
 */
  const fetchRevisionHistory = async (conversationId: string) => {
    isHistoryLoading.value = true;
    error.value = null;
    revisionHistory.value = [];
    try {
      const token = _getAuthToken();
      const details = await conversationsApi.getConversationDetails(conversationId, token);



      if (details && Array.isArray(details.history)) {
        revisionHistory.value = details.history.filter(
          msg => msg.role === 'user' || msg.role === 'assistant'
        );
      }
      
    } catch (err: any) {
      console.error('Failed to fetch revision history:', err);
    } finally {
      isHistoryLoading.value = false;
    }
  };


  return {
    // State
    conversations,
    currentDocument,
    isLoading,
    isRevising,
    isGenerating,
    streamingContent, 
    error,
    historyData,
    revisionHistory,
    isHistoryLoading,
    checklistContent,
    currentConversationId,
    // Actions
    fetchConversations,
    fetchFinalDocument,
    generateDocumentFromChecklist,
    reviseDocumentWithAI,
    saveDocumentChanges,
    fetchAndSetHistoryData,
    fetchRevisionHistory
  };
});