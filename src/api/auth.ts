// 定义API的基础URL
const API_BASE_URL = '/usercenter/v1';

// --- 类型定义 ---
// 登录/注册的凭证类型
interface Credentials {
    mobile: string;
    password: string;
}

// API成功响应的数据结构
interface AuthResponseData {
    accessToken: string;
    accessExpire: number;
    refreshAfter: number;
}

// API响应的完整结构
interface ApiResponse {
    code: number;
    msg: string;
    data: AuthResponseData;
}

/**
 * 用户登录函数
 * @param credentials - 包含手机号和密码的对象
 * @returns Promise<ApiResponse>
 */
export const loginUser = async (credentials: Credentials): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) {
        // 处理网络层面的错误
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

/**
 * 用户注册函数
 * @param credentials - 包含手机号和密码的对象
 * @returns Promise<ApiResponse>
 */
export const registerUser = async (credentials: Credentials): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) {
        // 处理网络层面的错误
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};