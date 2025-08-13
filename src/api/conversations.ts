// 定义API的基础URL
const API_BASE_URL = '/llmcenter/v1';

// --- TypeScript 类型定义 ---

// 会话列表项的类型 (根据API文档更新)
export interface ConversationSummary {
  conversation_id: string;
  title: string;
  updated_at: string;
}

// 单条消息的类型
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  content_type: 'text' | 'document_outline' | 'final_document';
  created_at: string;
}

// 完整会话详情的类型
export interface ConversationDetail {
  conversation_id: string;
  title: string;
  history: Message[];
}

// 为最终文档接口定义类型
export interface FinalDocument {
  id: string;
  content: string;
  created_at: string;
}

export interface DocumentResponse {
  conversation_id: string;
  documents: FinalDocument[];
}

// 为AI修订接口定义请求和响应类型
export interface EditRequest {
  conversation_id: string;
  message_id: string;
  prompt: string;
  use_knowledge_base: boolean;
  knowledge_base_id?: string;
}
// 修订后的响应也遵循FinalDocument的格式
export type EditResponse = FinalDocument;

//用户手动修改文章保存
export interface UpdateRequest {
  conversation_id: string;
  message_id: string;
  prompt: string; // prompt 在这里是完整的文档内容
}

//为最终文档生成接口定义请求类型
export interface GenerateDocumentRequest {
  conversation_id: string;
  content: string; // 这里是用户确认后的大纲内容
}

// 为 resume 接口定义请求和响应类型
export interface ResumeRequest {
  conversation_id: string;
  content: string;
  template_id?: string;
}

export interface StreamEndData {
  conversation_id: string;
  message_id: string;
}

// 为 historydatas 接口定义响应类型
export interface HistoryFileReference {
  file_id: string;
  filename: string;
}

export interface HistoryDataItem {
  id: string;
  documenttype: string;
  information: string;
  requests: string;
  created_at: string;
  references: HistoryFileReference[];
}

export interface HistoryDataResponse {
  conversation_id: string;
  items: HistoryDataItem[];
}
// --- API 请求函数 ---

/**
 * 获取所有会话的列表
 * @param {string} token - 用户的认证Token
 * @returns {Promise<ConversationSummary[]>}
 */
export async function getConversationsList(token: string): Promise<ConversationSummary[]> {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch conversations: ${errorData.message || response.statusText}`);
  }

  const result = await response.json();
  return result.data.data;
}

/**
 * 获取指定会话的详细历史消息
 * @param {string} conversationId - 会话ID
 * @param {string} token - 用户的认证Token
 * @returns {Promise<ConversationDetail>}
 */
export async function getConversationDetails(conversationId: string, token: string): Promise<ConversationDetail> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch conversation details: ${errorData.message || response.statusText}`);
  }

  const result = await response.json();
  console.log('[API 层] 从服务器收到的原始数据:', result);
  console.log('[API 层] 即将返回给 Store 的 data 部分:', result.data);


  return result.data;
}

/**
 * 获取指定会话最终生成的文档
 * @param {string} conversationId - 会话ID
 * @param {string} token - 用户的认证Token
 * @returns {Promise<DocumentResponse>}
 */
export async function getFinalDocument(conversationId: string, token: string): Promise<DocumentResponse> {
  const response = await fetch(`${API_BASE_URL}/documents/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch final document: ${errorData.message || response.statusText}`);
  }

  return response.json();
}


/**
 * 发送AI修订请求，并处理流式响应
 * @param {EditRequest} payload - 发送给API的数据
 * @param {string} token - 用户的认证Token
 * @param {(chunk: string) => void} onChunkReceived - 每次收到内容片段时调用的回调函数
 * @returns {Promise<EditResponse>} - 返回包含最终内容和ID的完整对象
 */
export async function editDocument(
  payload: EditRequest,
  token: string,
  onChunkReceived: (chunk: string) => void
): Promise<EditResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/edit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });


  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to edit document (HTTP ${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error("Response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let accumulatedContent = '';
  let finalMessageId = '';
  let leftover = ''; // 用于处理跨块的消息

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = leftover + decoder.decode(value, { stream: true });
    const messages = chunk.split('\n\n');

    leftover = messages.pop() || ''; // 最后一个可能是不完整的消息

    for (const message of messages) {
      if (!message) continue;

      const eventMatch = message.match(/^event: (.*)$/m);
      const dataMatch = message.match(/^data: (.*)$/m);

      if (eventMatch && dataMatch) {
        const event = eventMatch[1];
        const data = JSON.parse(dataMatch[1]);

        if (event === 'message') {
          const contentChunk = data.chunk || '';
          accumulatedContent += contentChunk;
          onChunkReceived(accumulatedContent); // 调用回调，实时更新UI
        } else if (event === 'end') {
          finalMessageId = data.message_id;
        }
      }
    }
  }

  if (accumulatedContent && finalMessageId) {
    return {
      id: finalMessageId,
      content: accumulatedContent,
      created_at: new Date().toISOString(), // 创建一个新的时间戳
    };
  } else {
    throw new Error("No valid data received from the revision stream.");
  }
}

/**
 * 保存用户对文档的手动修改
 * @param {UpdateRequest} payload - 发送给API的数据
 * @param {string} token - 用户的认证Token
 * @returns {Promise<FinalDocument>} - 返回更新后的文档信息
 */
export async function updateDocument(payload: UpdateRequest, token: string): Promise<FinalDocument> {
  const response = await fetch(`${API_BASE_URL}/chat/update`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to save document: ${errorData.message || response.statusText}`);
  }

  return response.json();
}


/**
 * 在工作流中断后，发送用户编辑好的内容以继续流程（生成最终文档）
 * 并处理流式响应
 * @param payload - 发送给API的数据
 * @param token - 用户的认证Token
 * @param onChunkReceived - 每次收到内容片段时调用的回调函数
 * @param onEnd - 流结束时调用的回调函数
 */
export async function resumeAndGenerateDocument(
  payload: ResumeRequest,
  token: string,
  onChunkReceived: (chunk: string) => void,
  onEnd: (endData: StreamEndData) => void
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to resume and generate document (HTTP ${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error("Response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedContent = '';
  let leftover = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = leftover + decoder.decode(value, { stream: true });
    const messages = chunk.split('\n\n');
    leftover = messages.pop() || '';

    for (const message of messages) {
      if (!message) continue;

      const eventMatch = message.match(/^event: (.*)$/m);
      const dataMatch = message.match(/^data: (.*)$/m);

      if (eventMatch && dataMatch) {
        const event = eventMatch[1];
        const data = JSON.parse(dataMatch[1]);

        if (event === 'message') {
          accumulatedContent += data.chunk || '';
          onChunkReceived(accumulatedContent); // 实时更新UI
        } else if (event === 'end') {
          onEnd(data as StreamEndData); // 流结束
        }
      }
    }
  }
}

/**
 * 新增：获取指定会话第一个页面的基本信息
 * @param conversationId - 会话ID
 * @param token - 用户的认证Token
 * @returns {Promise<HistoryDataResponse>}
 */
export async function getHistoryData(conversationId: string, token: string): Promise<HistoryDataResponse> {
  const response = await fetch(`${API_BASE_URL}/historydatas/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch history data: ${errorData.message || response.statusText}`);
  }

  return response.json();
}