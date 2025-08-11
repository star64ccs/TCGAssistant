import AsyncStorage from '@react-native-async-storage/async-storage';

// 環境檢測
const isDevelopmentEnv = __DEV__ || process.env.NODE_ENV === 'development';
const isProductionEnv = process.env.NODE_ENV === 'production';
const isStagingEnv = process.env.NODE_ENV === 'staging';

// 基礎配置
const BASE_CONFIG = {
  // 應用程式基本資訊
  APP: {
    NAME: 'TCG助手',
    VERSION: '1.0.0',
    BUILD_NUMBER: '1',
    BUNDLE_ID: 'com.tcgassistant.app',
    ENVIRONMENT: isDevelopmentEnv ? 'development' : isStagingEnv ? 'staging' : 'production',
  },

  // API 配置
  API: {
    DEVELOPMENT: {
      baseUrl: 'http://localhost:3000',
      apiVersion: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    STAGING: {
      baseUrl: 'https://staging-api.tcgassistant.com',
      apiVersion: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    PRODUCTION: {
      baseUrl: 'https://api.tcgassistant.com',
      apiVersion: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  },

  // 存儲鍵值
  STORAGE_KEYS: {
    USER_TOKEN: 'user_token',
    USER_PROFILE: 'user_profile',
    USER_DATA: 'user_data',
    SETTINGS: 'app_settings',
    CACHE: 'app_cache',
    DISCLAIMER_ACCEPTED: 'disclaimer_accepted',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    API_CONFIG: 'api_config',
    FEATURE_FLAGS: 'feature_flags',
  },

  // API 端點
  ENDPOINTS: {
    AUTH: '/auth',
    CARDS: '/cards',
    PRICES: '/prices',
    COLLECTION: '/collection',
    AI_CHAT: '/ai-chat',
    AUTHENTICITY: '/authenticity',
    GRADING: '/grading',
    INVESTMENT: '/investment',
    ANALYTICS: '/analytics',
    BACKUP: '/backup',
    FEEDBACK: '/feedback',
    NOTIFICATION: '/notification',
    FILE_MANAGER: '/file-manager',
    USER_HISTORY: '/user-history',
  },

  // 會員類型
  MEMBERSHIP_TYPES: {
    FREE: 'free',
    BASIC: 'basic',
    PREMIUM: 'premium',
    ULTRA: 'ultra',
  },

  // 功能限制
  LIMITS: {
    FREE_DAILY_LIMIT: 5,
    VIP_TRIAL_DAILY_LIMIT: 1,
    VIP_TRIAL_DAYS: 7,
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_CACHE_SIZE: 50,
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24小時
  },

  // 圖片處理配置
  IMAGE: {
    QUALITY: 0.8,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    COMPRESSION_QUALITY: 0.9,
  },

  // 支援的遊戲和語言
  SUPPORTED: {
    GAMES: ['pokemon', 'one-piece', 'yugioh', 'magic'],
    LANGUAGES: ['zh-TW', 'zh-CN', 'en', 'ja'],
    DEFAULT_LANGUAGE: 'zh-TW',
  },

  // 分享配置
  SHARE: {
    BASE_URL: 'https://tcgassistant.com/share',
  },
};

// AI 服務配置
const AI_CONFIG = {
  OPENAI: {
    enabled: false,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || null,
  },
  GOOGLE_PALM: {
    enabled: false,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    maxTokens: 1000,
    temperature: 0.7,
    apiKey: process.env.REACT_APP_GOOGLE_PALM_API_KEY || null,
  },
  AZURE_OPENAI: {
    enabled: false,
    endpoint: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY || null,
  },
  GOOGLE_VISION: {
    enabled: false,
    apiKey: process.env.REACT_APP_GOOGLE_VISION_API_KEY || null,
  },
};

// 第三方 API 配置
const THIRD_PARTY_CONFIG = {
  TCGPLAYER: {
    apiKey: process.env.REACT_APP_TCGPLAYER_API_KEY || null,
    publicKey: process.env.REACT_APP_TCGPLAYER_PUBLIC_KEY || null,
    privateKey: process.env.REACT_APP_TCGPLAYER_PRIVATE_KEY || null,
  },
  EBAY: {
    appId: process.env.REACT_APP_EBAY_APP_ID || null,
    certId: process.env.REACT_APP_EBAY_CERT_ID || null,
    clientSecret: process.env.REACT_APP_EBAY_CLIENT_SECRET || null,
  },
  CARDMARKET: {
    appToken: process.env.REACT_APP_CARDMARKET_APP_TOKEN || null,
    appSecret: process.env.REACT_APP_CARDMARKET_APP_SECRET || null,
    accessToken: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN || null,
    accessTokenSecret: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN_SECRET || null,
  },
  PRICECHARTING: {
    apiKey: process.env.REACT_APP_PRICECHARTING_API_KEY || null,
  },
  MERCARI: {
    apiKey: process.env.REACT_APP_MERCARI_API_KEY || null,
  },
  SNKRDUNK: {
    apiKey: process.env.REACT_APP_SNKRDUNK_API_KEY || null,
  },
};

// 社交登入配置
const SOCIAL_AUTH_CONFIG = {
  GOOGLE: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'com.tcgassistant://oauth2redirect',
    scope: 'openid email profile',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
  },
  FACEBOOK: {
    appId: process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id',
    appSecret: process.env.REACT_APP_FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
    redirectUri: process.env.REACT_APP_FACEBOOK_REDIRECT_URI || 'com.tcgassistant://oauth2redirect',
    scope: 'email public_profile',
    authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    permissionsUrl: 'https://graph.facebook.com/me/permissions',
  },
  APPLE: {
    clientId: process.env.REACT_APP_APPLE_CLIENT_ID || 'com.tcgassistant.signin',
    teamId: process.env.REACT_APP_APPLE_TEAM_ID || 'your-apple-team-id',
    keyId: process.env.REACT_APP_APPLE_KEY_ID || 'your-apple-key-id',
    privateKey: process.env.REACT_APP_APPLE_PRIVATE_KEY || 'your-apple-private-key',
    redirectUri: process.env.REACT_APP_APPLE_REDIRECT_URI || 'com.tcgassistant://oauth2redirect',
    scope: 'name email',
    authUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
  },
};

// 功能開關配置
const FEATURE_FLAGS = {
  REAL_API: process.env.REACT_APP_FEATURE_REAL_API === 'true',
  MOCK_FALLBACK: process.env.REACT_APP_FEATURE_MOCK_FALLBACK === 'true',
  NOTIFICATIONS: process.env.REACT_APP_FEATURE_NOTIFICATIONS === 'true',
  CACHE: process.env.REACT_APP_FEATURE_CACHE === 'true',
  AI_CHAT: true,
  CARD_RECOGNITION: true,
  AUTHENTICITY_CHECK: true,
  PRICE_PREDICTION: true,
  INVESTMENT_ADVICE: true,
  GRADING_DATA: true,
  BACKUP_RESTORE: true,
  ANALYTICS: true,
};

// 統一配置管理類
class UnifiedConfigManager {
  constructor() {
    this.config = {
      ...BASE_CONFIG,
      AI: AI_CONFIG,
      THIRD_PARTY: THIRD_PARTY_CONFIG,
      SOCIAL_AUTH: SOCIAL_AUTH_CONFIG,
      FEATURE_FLAGS,
    };
    this.cache = new Map();
  }

  // 獲取當前環境的 API 配置
  getApiConfig() {
    const env = this.config.APP.ENVIRONMENT.toUpperCase();
    return this.config.API[env] || this.config.API.DEVELOPMENT;
  }

  // 獲取 API 基礎 URL
  getApiBaseUrl() {
    return this.getApiConfig().baseUrl;
  }

  // 獲取 API 版本
  getApiVersion() {
    return this.getApiConfig().apiVersion;
  }

  // 獲取 API 超時時間
  getApiTimeout() {
    return this.getApiConfig().timeout;
  }

  // 獲取重試次數
  getRetryAttempts() {
    return this.getApiConfig().retryAttempts;
  }

  // 獲取重試延遲
  getRetryDelay() {
    return this.getApiConfig().retryDelay;
  }

  // 獲取完整的 API URL
  getFullApiUrl(endpoint) {
    const apiConfig = this.getApiConfig();
    return `${apiConfig.baseUrl}/api/${apiConfig.apiVersion}${endpoint}`;
  }

  // 獲取 AI 配置
  getAiConfig(provider) {
    return this.config.AI[provider.toUpperCase()] || null;
  }

  // 獲取第三方 API 配置
  getThirdPartyConfig(provider) {
    return this.config.THIRD_PARTY[provider.toUpperCase()] || null;
  }

  // 獲取社交登入配置
  getSocialAuthConfig(provider) {
    return this.config.SOCIAL_AUTH[provider.toUpperCase()] || null;
  }

  // 檢查功能是否啟用
  isFeatureEnabled(feature) {
    return this.config.FEATURE_FLAGS[feature] || false;
  }

  // 獲取存儲鍵值
  getStorageKey(key) {
    return this.config.STORAGE_KEYS[key] || key;
  }

  // 獲取端點
  getEndpoint(name) {
    return this.config.ENDPOINTS[name] || `/${name}`;
  }

  // 獲取會員類型
  getMembershipType(type) {
    return this.config.MEMBERSHIP_TYPES[type.toUpperCase()] || type;
  }

  // 獲取限制配置
  getLimit(name) {
    return this.config.LIMITS[name] || null;
  }

  // 獲取圖片配置
  getImageConfig(name) {
    return this.config.IMAGE[name] || null;
  }

  // 獲取支援的遊戲
  getSupportedGames() {
    return this.config.SUPPORTED.GAMES;
  }

  // 獲取支援的語言
  getSupportedLanguages() {
    return this.config.SUPPORTED.LANGUAGES;
  }

  // 獲取預設語言
  getDefaultLanguage() {
    return this.config.SUPPORTED.DEFAULT_LANGUAGE;
  }

  // 檢查是否為開發環境
  isDevelopment() {
    return this.config.APP.ENVIRONMENT === 'development';
  }

  // 檢查是否為生產環境
  isProduction() {
    return this.config.APP.ENVIRONMENT === 'production';
  }

  // 檢查是否為測試環境
  isStaging() {
    return this.config.APP.ENVIRONMENT === 'staging';
  }

  // 從 AsyncStorage 載入配置
  async loadFromStorage() {
    try {
      const storedConfig = await AsyncStorage.getItem(this.getStorageKey('API_CONFIG'));
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('載入配置失敗:', error);
    }
  }

  // 儲存配置到 AsyncStorage
  async saveToStorage() {
    try {
      await AsyncStorage.setItem(
        this.getStorageKey('API_CONFIG'),
        JSON.stringify(this.config),
      );
    } catch (error) {
      console.warn('儲存配置失敗:', error);
    }
  }

  // 更新配置
  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    await this.saveToStorage();
  }

  // 重置配置
  async resetConfig() {
    this.config = {
      ...BASE_CONFIG,
      AI: AI_CONFIG,
      THIRD_PARTY: THIRD_PARTY_CONFIG,
      SOCIAL_AUTH: SOCIAL_AUTH_CONFIG,
      FEATURE_FLAGS,
    };
    await this.saveToStorage();
  }

  // 驗證配置
  validateConfig() {
    const errors = [];
    const warnings = [];

    // 檢查必要的 API 配置
    const apiConfig = this.getApiConfig();
    if (!apiConfig.baseUrl) {
      errors.push('API 基礎 URL 未配置');
    }

    // 檢查 AI 配置
    Object.entries(this.config.AI).forEach(([provider, config]) => {
      if (config.enabled && !config.apiKey) {
        warnings.push(`${provider} API 金鑰未配置`);
      }
    });

    // 檢查第三方 API 配置
    Object.entries(this.config.THIRD_PARTY).forEach(([provider, config]) => {
      if (Object.values(config).some(value => value && value !== 'null')) {
        // 如果有任何配置，檢查是否完整
        const hasApiKey = Object.values(config).some(value => value && value !== 'null');
        if (!hasApiKey) {
          warnings.push(`${provider} API 配置不完整`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 獲取配置摘要
  getConfigSummary() {
    const validation = this.validateConfig();
    return {
      environment: this.config.APP.ENVIRONMENT,
      apiBaseUrl: this.getApiBaseUrl(),
      features: Object.keys(this.config.FEATURE_FLAGS).filter(
        key => this.config.FEATURE_FLAGS[key],
      ),
      aiProviders: Object.keys(this.config.AI).filter(
        key => this.config.AI[key].enabled,
      ),
      thirdPartyProviders: Object.keys(this.config.THIRD_PARTY).filter(
        key => Object.values(this.config.THIRD_PARTY[key]).some(value => value && value !== 'null'),
      ),
      validation,
    };
  }
}

// 創建單例實例
const configManager = new UnifiedConfigManager();

// 導出配置管理器和便捷函數
export default configManager;

// 便捷函數
export const getApiConfig = () => configManager.getApiConfig();
export const getApiBaseUrl = () => configManager.getApiBaseUrl();
export const getApiVersion = () => configManager.getApiVersion();
export const getApiTimeout = () => configManager.getApiTimeout();
export const getRetryAttempts = () => configManager.getRetryAttempts();
export const getRetryDelay = () => configManager.getRetryDelay();
export const getFullApiUrl = (endpoint) => configManager.getFullApiUrl(endpoint);
export const getAiConfig = (provider) => configManager.getAiConfig(provider);
export const getThirdPartyConfig = (provider) => configManager.getThirdPartyConfig(provider);
export const getSocialAuthConfig = (provider) => configManager.getSocialAuthConfig(provider);
export const isFeatureEnabled = (feature) => configManager.isFeatureEnabled(feature);
export const getStorageKey = (key) => configManager.getStorageKey(key);
export const getEndpoint = (name) => configManager.getEndpoint(name);
export const getMembershipType = (type) => configManager.getMembershipType(type);
export const getLimit = (name) => configManager.getLimit(name);
export const getImageConfig = (name) => configManager.getImageConfig(name);
export const getSupportedGames = () => configManager.getSupportedGames();
export const getSupportedLanguages = () => configManager.getSupportedLanguages();
export const getDefaultLanguage = () => configManager.getDefaultLanguage();
export const isDevelopment = () => configManager.isDevelopment();
export const isProduction = () => configManager.isProduction();
export const isStaging = () => configManager.isStaging();
export const validateConfig = () => configManager.validateConfig();
export const getConfigSummary = () => configManager.getConfigSummary();

// 導出常數
export const STORAGE_KEYS = BASE_CONFIG.STORAGE_KEYS;
export const APP_CONFIG = BASE_CONFIG.APP;
export const API_ENDPOINTS = BASE_CONFIG.ENDPOINTS;
export const MEMBERSHIP_TYPES = BASE_CONFIG.MEMBERSHIP_TYPES;
export const LIMITS = BASE_CONFIG.LIMITS;
export const IMAGE_CONFIG = BASE_CONFIG.IMAGE;
export const SUPPORTED = BASE_CONFIG.SUPPORTED;
export const SHARE_CONFIG = BASE_CONFIG.SHARE;
