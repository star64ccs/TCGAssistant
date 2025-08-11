/**
 * 示例服務 - 展示統一的編碼風格
 * 提供示例數據處理和業務邏輯
 */

// 服務配置
const SERVICE_CONFIG = {
  // API配置
  API_BASE_URL: 'https://api.example.com',
  API_TIMEOUT: 10000,
  MAX_RETRY_COUNT: 3,

  // 緩存配置
  CACHE_DURATION: 5 * 60 * 1000, // 5分鐘
  MAX_CACHE_SIZE: 100,

  // 數據驗證配置
  VALIDATION_RULES: {
    userId: {
      required: true,
      type: 'string',
      minLength: 1,
    },
    optionKey: {
      required: true,
      type: 'string',
      allowedValues: ['option1', 'option2', 'option3'],
    },
  },
};

/**
 * 示例服務類
 */
class ExampleService {
  constructor() {
    this.cache = new Map();
    this.isInitialized = false;
    this.apiClient = null;
    this.lastUpdate = null;
  }

  /**
   * 初始化服務
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.setupApiClient();
      await this.loadInitialData();
      this.isInitialized = true;
      console.log('示例服務初始化成功');
    } catch (error) {
      console.error('示例服務初始化失敗:', error);
      throw new Error('服務初始化失敗');
    }
  }

  /**
   * 設置API客戶端
   * @returns {Promise<void>}
   */
  async setupApiClient() {
    // 模擬API客戶端設置
    this.apiClient = {
      get: async (url) => {
        // 模擬API調用
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { data: this.getMockData() };
      },
      post: async (url, data) => {
        // 模擬API調用
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: { success: true, ...data } };
      },
    };
  }

  /**
   * 載入初始數據
   * @returns {Promise<void>}
   */
  async loadInitialData() {
    try {
      const data = await this.fetchInitialData();
      this.cache.set('initialData', {
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('載入初始數據失敗:', error);
    }
  }

  /**
   * 獲取數據
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} 數據對象
   */
  async getData(userId) {
    this.validateUserId(userId);

    // 檢查緩存
    const cachedData = this.getCachedData(userId);
    if (cachedData) {
      return cachedData;
    }

    try {
      const data = await this.fetchDataFromApi(userId);
      this.cacheData(userId, data);
      return data;
    } catch (error) {
      console.error('獲取數據失敗:', error);
      throw new Error('無法獲取數據');
    }
  }

  /**
   * 更新選項
   * @param {string} userId - 用戶ID
   * @param {string} optionKey - 選項鍵
   * @returns {Promise<Object>} 更新結果
   */
  async updateOption(userId, optionKey) {
    this.validateUserId(userId);
    this.validateOptionKey(optionKey);

    try {
      const result = await this.apiClient.post('/options', {
        userId,
        optionKey,
        timestamp: Date.now(),
      });

      // 清除相關緩存
      this.clearCache(userId);

      return result.data;
    } catch (error) {
      console.error('更新選項失敗:', error);
      throw new Error('更新選項失敗');
    }
  }

  /**
   * 獲取用戶統計數據
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} 統計數據
   */
  async getUserStats(userId) {
    this.validateUserId(userId);

    try {
      const stats = await this.calculateUserStats(userId);
      return stats;
    } catch (error) {
      console.error('獲取用戶統計失敗:', error);
      throw new Error('無法獲取用戶統計');
    }
  }

  /**
   * 清理過期緩存
   * @returns {void}
   */
  cleanupCache() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > SERVICE_CONFIG.CACHE_DURATION) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`清理了 ${expiredKeys.length} 個過期緩存`);
    }
  }

  /**
   * 重置服務狀態
   * @returns {void}
   */
  reset() {
    this.cache.clear();
    this.isInitialized = false;
    this.lastUpdate = null;
    console.log('示例服務已重置');
  }

  // 私有方法

  /**
   * 驗證用戶ID
   * @param {string} userId - 用戶ID
   * @throws {Error} 驗證失敗時拋出錯誤
   */
  validateUserId(userId) {
    const rules = SERVICE_CONFIG.VALIDATION_RULES.userId;

    if (rules.required && !userId) {
      throw new Error('用戶ID不能為空');
    }

    if (rules.type && typeof userId !== rules.type) {
      throw new Error('用戶ID類型錯誤');
    }

    if (rules.minLength && userId.length < rules.minLength) {
      throw new Error('用戶ID長度不足');
    }
  }

  /**
   * 驗證選項鍵
   * @param {string} optionKey - 選項鍵
   * @throws {Error} 驗證失敗時拋出錯誤
   */
  validateOptionKey(optionKey) {
    const rules = SERVICE_CONFIG.VALIDATION_RULES.optionKey;

    if (rules.required && !optionKey) {
      throw new Error('選項鍵不能為空');
    }

    if (rules.type && typeof optionKey !== rules.type) {
      throw new Error('選項鍵類型錯誤');
    }

    if (rules.allowedValues && !rules.allowedValues.includes(optionKey)) {
      throw new Error('無效的選項鍵');
    }
  }

  /**
   * 獲取緩存數據
   * @param {string} key - 緩存鍵
   * @returns {Object|null} 緩存數據或null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > SERVICE_CONFIG.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 緩存數據
   * @param {string} key - 緩存鍵
   * @param {Object} data - 要緩存的數據
   * @returns {void}
   */
  cacheData(key, data) {
    // 檢查緩存大小限制
    if (this.cache.size >= SERVICE_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除緩存
   * @param {string} key - 緩存鍵
   * @returns {void}
   */
  clearCache(key) {
    this.cache.delete(key);
  }

  /**
   * 從API獲取數據
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} API響應數據
   */
  async fetchDataFromApi(userId) {
    const response = await this.apiClient.get(`/data/${userId}`);
    return response.data;
  }

  /**
   * 獲取初始數據
   * @returns {Promise<Object>} 初始數據
   */
  async fetchInitialData() {
    const response = await this.apiClient.get('/initial-data');
    return response.data;
  }

  /**
   * 計算用戶統計數據
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} 統計數據
   */
  async calculateUserStats(userId) {
    // 模擬統計計算
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      userId,
      totalActions: Math.floor(Math.random() * 1000),
      successRate: Math.random() * 100,
      lastActivity: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        language: 'zh-TW',
        notifications: true,
      },
    };
  }

  /**
   * 獲取模擬數據
   * @returns {Object} 模擬數據
   */
  getMockData() {
    return {
      id: 'mock-data-001',
      title: '示例數據',
      description: '這是一個示例數據對象，用於展示統一的編碼風格。',
      timestamp: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        source: 'example-service',
        tags: ['example', 'mock', 'data'],
      },
      statistics: {
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
      },
    };
  }
}

// 創建單例實例
const exampleService = new ExampleService();

export default exampleService;
