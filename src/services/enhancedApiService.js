import apiClient, { API_ENDPOINTS } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 增強的API服務層
 * 整合認證、緩存、重試、錯誤處理等功能
 */
class EnhancedApiService {
  constructor() {
    this.retryCount = 3;
    this.retryDelay = 1000;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分鐘
  }

  /**
   * 通用請求方法
   */
  async request(config) {
    try {
      const response = await apiClient(config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * GET請求
   */
  async get(endpoint, params = {}, options = {}) {
    const { useCache = false, cacheKey = null } = options;
    
    if (useCache && cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    const response = await this.request({
      method: 'GET',
      url: endpoint,
      params,
    });

    if (useCache && cacheKey) {
      this.setCache(cacheKey, response);
    }

    return response;
  }

  /**
   * POST請求
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request({
      method: 'POST',
      url: endpoint,
      data,
      ...options,
    });
  }

  /**
   * PUT請求
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request({
      method: 'PUT',
      url: endpoint,
      data,
      ...options,
    });
  }

  /**
   * DELETE請求
   */
  async delete(endpoint, options = {}) {
    return this.request({
      method: 'DELETE',
      url: endpoint,
      ...options,
    });
  }

  /**
   * 文件上傳
   */
  async uploadFile(endpoint, file, onProgress = null, options = {}) {
    const formData = new FormData();
    
    if (file.uri) {
      // React Native 文件
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'file.jpg',
      });
    } else {
      // Web 文件
      formData.append('file', file);
    }

    return this.request({
      method: 'POST',
      url: endpoint,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
      ...options,
    });
  }

  /**
   * 批量文件上傳
   */
  async uploadFiles(endpoint, files, onProgress = null, options = {}) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      if (file.uri) {
        formData.append(`files[${index}]`, {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || `file_${index}.jpg`,
        });
      } else {
        formData.append(`files[${index}]`, file);
      }
    });

    return this.request({
      method: 'POST',
      url: endpoint,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
      ...options,
    });
  }

  /**
   * 緩存管理
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * 錯誤處理
   */
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // 服務器響應錯誤
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          this.handleForbidden();
          break;
        case 429:
          this.handleRateLimit();
          break;
        case 500:
          this.handleServerError();
          break;
      }
      
      throw new Error(data?.message || `請求失敗 (${status})`);
    } else if (error.request) {
      // 網絡錯誤
      throw new Error('網絡連接失敗，請檢查網絡設置');
    } else {
      // 其他錯誤
      throw new Error(error.message || '未知錯誤');
    }
  }

  /**
   * 認證相關處理
   */
  async handleUnauthorized() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
    // 可以觸發重新登入事件
  }

  handleForbidden() {
    // 處理權限不足
    console.warn('權限不足');
  }

  handleRateLimit() {
    // 處理請求頻率限制
    console.warn('請求過於頻繁，請稍後再試');
  }

  handleServerError() {
    // 處理服務器錯誤
    console.error('服務器內部錯誤');
  }

  /**
   * 重試機制
   */
  async retryRequest(requestFn, retries = this.retryCount) {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.delay(this.retryDelay * Math.pow(2, i));
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 創建單例實例
const enhancedApiService = new EnhancedApiService();

export default enhancedApiService;
