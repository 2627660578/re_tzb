import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import * as conversationsApi from '../api/conversations';

export const useDocumentStore = defineStore('document', () => {
  // --- State ---
  const conversations = ref<conversationsApi.ConversationSummary[]>([]);
  const currentDocument = ref<conversationsApi.FinalDocument | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

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
    currentDocument.value = null;
    try {
      const token = _getAuthToken();
      const response = await conversationsApi.getFinalDocument(conversationId, token);
      if (response.documents && response.documents.length > 0) {
        // 假设我们总是取最新的文档
        currentDocument.value = response.documents[response.documents.length - 1];
      }
    } catch (err: any) {
      error.value = err.message;
      console.error(`Failed to fetch document for conversation ${conversationId}:`, err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 使用AI修订文档
   * @param {Omit<conversationsApi.EditRequest, 'use_knowledge_base'>} payload - 修订请求数据
   * @param {(chunk: string) => void} onChunkReceived - 流式数据回调
   */
  const reviseDocumentWithAI = async (
    payload: Omit<conversationsApi.EditRequest, 'use_knowledge_base'>,
    onChunkReceived: (chunk: string) => void
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      const token = _getAuthToken();
      const fullPayload = { ...payload, use_knowledge_base: false };
      const updatedDoc = await conversationsApi.editDocument(fullPayload, token, onChunkReceived);
      currentDocument.value = updatedDoc; // 更新当前文档状态
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to revise document:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 手动保存文档修改
   * @param {conversationsApi.UpdateRequest} payload - 更新请求数据
   */
  const saveDocumentChanges = async (payload: conversationsApi.UpdateRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const token = _getAuthToken();
      const updatedDoc = await conversationsApi.updateDocument(payload, token);
      currentDocument.value = updatedDoc; // 更新当前文档状态
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to save document changes:', err);
    } finally {
      isLoading.value = false;
    }
  };


  return {
    // State
    conversations,
    currentDocument,
    isLoading,
    error,
    // Actions
    fetchConversations,
    fetchFinalDocument,
    reviseDocumentWithAI,
    saveDocumentChanges,
  };
});