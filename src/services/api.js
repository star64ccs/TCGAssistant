import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, getApiTimeout, getApiVersion, getFullApiUrl } from '../config/unifiedConfig';

// API 基礎配置
const API_BASE_URL = getFullApiUrl('');
const API_TIMEOUT = getApiTimeout();

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 請求攔截器
apiClient.interceptors.request.use(
  async (config) => {
  // 添加認證 token
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token
      }`;
    }

    // 添加用戶 ID
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-ID'] = userId;
    }

    // 添加會員權限信息
    const membership = await AsyncStorage.getItem('userMembership');
    if (membership) {
      const membershipData = JSON.parse(membership);
      config.headers['X-Membership-Type'] = membershipData.type;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 響應攔截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 處理 401 未授權錯誤
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      // 可以觸發重新登入
      // store.dispatch(logout());
    }

    // 處理 403 權限不足錯誤
    if (error.response?.status === 403) {}

    // 處理 429 請求過於頻繁
    if (error.response?.status === 429) {}

    return Promise.reject(error);
  },
);

// API 端點配置
export const API_ENDPOINTS = {
  // 認證相關
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },

  // 卡牌資料相關
  CARD_DATA: {
    POKEMON: '/cardData/pokemon',
    ONE_PIECE: '/cardData/one-piece',
    AVAILABLE: '/cardData/available',
    BY_ID: '/cardData/:id',
  },

  // 收藏相關
  COLLECTION: {
    GET: '/collection',
    ADD: '/collection/add',
    REMOVE: '/collection/remove',
    UPDATE: '/collection/update',
    STATS: '/collection/stats',
  },

  // 用戶歷史相關
  USER_HISTORY: {
    RECENT: '/userHistory/recent',
    ALL: '/userHistory/all',
    STATS: '/userHistory/stats',
    CLEAR: '/userHistory/clear',
  },

  // 分析相關
  ANALYSIS: {
    CENTERING: '/analysis/centering',
    AUTHENTICITY: '/analysis/authenticity',
    QUALITY: '/analysis/quality',
  },

  // 收藏管理相關
  COLLECTION_MANAGEMENT: {
    LIST: '/collection',
    ADD: '/collection/add',
    REMOVE: '/collection/remove',
    UPDATE: '/collection/update',
    STATS: '/collection/stats',
  },

  // 會員相關
  MEMBERSHIP: {
    INFO: '/membership/info',
    UPGRADE: '/membership/upgrade',
    TRIAL: '/membership/trial',
    USAGE: '/membership/usage',
  },

  // 用戶相關
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    HISTORY: '/user/history',
    PREFERENCES: '/user/preferences',
  },

  // AI 助手相關
  AI: {
    CHAT: '/ai/chat',
    SUGGESTIONS: '/ai/suggestions',
    ANALYSIS: '/ai/analysis',
  },

  // 文件上傳
  UPLOAD: {
    IMAGE: '/upload/image',
    BATCH: '/upload/batch',
  },

  // 分享相關
  SHARE: {
    CREATE: '/share/create',
    VIEW: '/share/:id',
    STATS: '/share/:id/stats',
  },
};

// 通用 API 方法
export const apiService = {
  // GET 請求
  get: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(endpoint, { params,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // POST 請求
  post: async (endpoint, data = {}) => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // PUT 請求
  put: async (endpoint, data = {}) => {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // DELETE 請求
  delete: async (endpoint) => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 文件上傳
  upload: async (endpoint, file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 批量上傳
  uploadBatch: async (endpoint, files, onProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index
        }]`, file);
      });
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// 錯誤處理函數
function handleApiError(error) {
  if (error.response) {
    // 服務器響應錯誤
    const { status, data,
    } = error.response;

    switch (status) {
      case 400:
        throw new Error(data.message || '請求參數錯誤');
      case 401:
        throw new Error('未授權，請重新登入');
      case 403:
        throw new Error('權限不足，可能需要升級會員');
      case 404:
        throw new Error('請求的資源不存在');
      case 429:
        throw new Error('請求過於頻繁，請稍後再試');
      case 500:
        throw new Error('服務器內部錯誤');
      default:
        throw new Error(data.message || '未知錯誤');
    }
  } else if (error.request) {
  // 網路錯誤
    throw new Error('網路連接失敗，請檢查網路設置');
  } else {
  // 其他錯誤
    throw new Error(error.message || '未知錯誤');
  }
}

// 重試機制
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// 快取機制
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分鐘

export const cachedRequest = async (key, requestFn, duration = CACHE_DURATION) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data;
  }

  const data = await requestFn();
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  return data;
};

// 清除快取
export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

export default apiClient;
