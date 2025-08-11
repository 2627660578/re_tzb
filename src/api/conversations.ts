// 定义API的基础URL
const API_BASE_URL = 'http://47.98.215.181:8010/llmcenter/v1';

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

// 新增：为最终文档接口定义类型
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

// --- 辅助函数 ---

/**
 * 获取预设的认证Token
 * @returns {string | null}
 */
function getAuthToken(): string | null {
  // 预设的accessToken
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODYxOTQyMTUsImlhdCI6MTc1NDY1ODIxNSwiand0VXNlcklkIjoyfQ.0QMukGjkjIuARsHJUgO5-RA8unKpqAzN70jMGv3CF8o";
}


// --- API 请求函数 ---

/**
 * 获取所有会话的列表
 * @returns {Promise<ConversationSummary[]>}
 */
export async function getConversationsList(): Promise<ConversationSummary[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

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
  // 根据API文档，会话列表在 'data' 字段中
  return result.data.data;
}

/**
 * 获取指定会话的详细历史消息
 * @param {string} conversationId - 会话ID
 * @returns {Promise<ConversationDetail>}
 */
export async function getConversationDetails(conversationId: string): Promise<ConversationDetail> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

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

  return response.json();
}

/**
 * 获取指定会话最终生成的文档
 * @param {string} conversationId - 会话ID
 * @returns {Promise<DocumentResponse>}
 */
export async function getFinalDocument(conversationId: string): Promise<DocumentResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

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
 * @param {(chunk: string) => void} onChunkReceived - 每次收到内容片段时调用的回调函数
 * @returns {Promise<EditResponse>} - 返回包含最终内容和ID的完整对象
 */
export async function editDocument(
  payload: EditRequest,
  onChunkReceived: (chunk: string) => void
): Promise<EditResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

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
 * @returns {Promise<FinalDocument>} - 返回更新后的文档信息，包含新的message_id
 */
export async function updateDocument(payload: UpdateRequest): Promise<FinalDocument> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

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

  // 假设成功后，API会返回新的文档对象（包含新的ID和时间戳）
  return response.json();
}