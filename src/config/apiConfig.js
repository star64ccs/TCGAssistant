// API配置管理文件
// 注意：實際部署時應使用環境變數來管理敏感信息

const API_CONFIG = {
  // 基礎配置
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8081',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // 功能開關
  FEATURES: {
    REAL_API: process.env.REACT_APP_FEATURE_REAL_API === 'true',
    MOCK_FALLBACK: process.env.REACT_APP_FEATURE_MOCK_FALLBACK !== 'false',
    NOTIFICATIONS: process.env.REACT_APP_FEATURE_NOTIFICATIONS !== 'false',
    CACHE: process.env.REACT_APP_FEATURE_CACHE !== 'false',
  },
  
  // 卡牌辨識API配置
  CARD_RECOGNITION: {
    // Google Cloud Vision API
    GOOGLE_VISION: {
      enabled: !!process.env.REACT_APP_GOOGLE_VISION_API_KEY,
      apiKey: process.env.REACT_APP_GOOGLE_VISION_API_KEY,
      endpoint: 'https://vision.googleapis.com/v1/images:annotate',
      maxResults: 20,
      confidence: 0.7,
    },
    
    // AWS Rekognition
    AWS_REKOGNITION: {
      enabled: !!(process.env.REACT_APP_AWS_ACCESS_KEY_ID && process.env.REACT_APP_AWS_SECRET_ACCESS_KEY),
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      endpoint: 'https://rekognition.amazonaws.com',
      maxLabels: 20,
      minConfidence: 70,
    },
    
    // Azure Computer Vision
    AZURE_VISION: {
      enabled: !!process.env.REACT_APP_AZURE_VISION_API_KEY,
      apiKey: process.env.REACT_APP_AZURE_VISION_API_KEY,
      endpoint: 'https://api.cognitive.microsoft.com/vision/v3.2/analyze',
      maxResults: 20,
    },
    
    // 自定義AI模型
    CUSTOM_AI: {
      enabled: !!process.env.REACT_APP_CUSTOM_AI_API_KEY,
      apiKey: process.env.REACT_APP_CUSTOM_AI_API_KEY,
      endpoint: 'https://ai.tcg-assistant.com/v1/recognize',
      timeout: 30000,
    },
  },
  
  // 價格查詢API配置
  PRICE_APIS: {
    // TCGPlayer API
    TCGPLAYER: {
      enabled: !!process.env.REACT_APP_TCGPLAYER_API_KEY,
      apiKey: process.env.REACT_APP_TCGPLAYER_API_KEY,
      publicKey: process.env.REACT_APP_TCGPLAYER_PUBLIC_KEY,
      privateKey: process.env.REACT_APP_TCGPLAYER_PRIVATE_KEY,
      endpoint: 'https://api.tcgplayer.com/v1.39.0',
      timeout: 15000,
    },
    
    // eBay API
    EBAY: {
      enabled: !!process.env.REACT_APP_EBAY_APP_ID,
      appId: process.env.REACT_APP_EBAY_APP_ID,
      certId: process.env.REACT_APP_EBAY_CERT_ID,
      clientSecret: process.env.REACT_APP_EBAY_CLIENT_SECRET,
      endpoint: 'https://api.ebay.com/buy/browse/v1/item_summary/search',
      marketplace: 'EBAY-US',
      timeout: 15000,
    },
    
    // Cardmarket API
    CARDMARKET: {
      enabled: !!process.env.REACT_APP_CARDMARKET_APP_TOKEN,
      appToken: process.env.REACT_APP_CARDMARKET_APP_TOKEN,
      appSecret: process.env.REACT_APP_CARDMARKET_APP_SECRET,
      accessToken: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN,
      accessTokenSecret: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN_SECRET,
      endpoint: 'https://api.cardmarket.com/ws/v2.0',
      timeout: 15000,
    },
    
    // PriceCharting API
    PRICECHARTING: {
      enabled: !!process.env.REACT_APP_PRICECHARTING_API_KEY,
      apiKey: process.env.REACT_APP_PRICECHARTING_API_KEY,
      endpoint: 'https://www.pricecharting.com/api',
      timeout: 15000,
    },
    
    // Mercari API (需要特殊授權)
    MERCARI: {
      enabled: !!process.env.REACT_APP_MERCARI_API_KEY,
      apiKey: process.env.REACT_APP_MERCARI_API_KEY,
      endpoint: 'https://api.mercari.com/v1',
      timeout: 15000,
    },
    
    // SNKRDUNK API (需要特殊授權)
    SNKRDUNK: {
      enabled: !!process.env.REACT_APP_SNKRDUNK_API_KEY,
      apiKey: process.env.REACT_APP_SNKRDUNK_API_KEY,
      endpoint: 'https://api.snkrdunk.com/v1',
      timeout: 15000,
    },
  },
  
  // AI分析API配置
  AI_ANALYSIS: {
    // OpenAI GPT-4
    OPENAI: {
      enabled: !!process.env.REACT_APP_OPENAI_API_KEY,
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000,
    },
    
    // Google PaLM
    GOOGLE_PALM: {
      enabled: !!process.env.REACT_APP_GOOGLE_PALM_API_KEY,
      apiKey: process.env.REACT_APP_GOOGLE_PALM_API_KEY,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText',
      model: 'text-bison-001',
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000,
    },
    
    // Azure OpenAI
    AZURE_OPENAI: {
      enabled: !!process.env.REACT_APP_AZURE_OPENAI_API_KEY,
      apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
      endpoint: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000,
    },
  },
  
  // 性能配置
  PERFORMANCE: {
    // 快取配置
    CACHE_DURATION: parseInt(process.env.REACT_APP_CACHE_DURATION) || 300000, // 5分鐘
    MAX_CACHE_SIZE: parseInt(process.env.REACT_APP_MAX_CACHE_SIZE) || 50,
    
    // 重試配置
    MAX_RETRIES: parseInt(process.env.REACT_APP_MAX_RETRIES) || 3,
    RETRY_DELAY: parseInt(process.env.REACT_APP_RETRY_DELAY) || 1000,
    
    // 超時配置
    API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
    UPLOAD_TIMEOUT: parseInt(process.env.REACT_APP_UPLOAD_TIMEOUT) || 60000,
  },
  
  // 圖片處理配置
  IMAGE_PROCESSING: {
    MAX_SIZE: parseInt(process.env.REACT_APP_MAX_IMAGE_SIZE) || 10485760, // 10MB
    MAX_WIDTH: parseInt(process.env.REACT_APP_MAX_IMAGE_WIDTH) || 1920,
    MAX_HEIGHT: parseInt(process.env.REACT_APP_MAX_IMAGE_HEIGHT) || 1080,
    QUALITY: parseFloat(process.env.REACT_APP_IMAGE_QUALITY) || 0.9,
    FORMATS: ['jpeg', 'jpg', 'png', 'webp'],
  },
  
  // 會員限制配置
  MEMBERSHIP_LIMITS: {
    FREE_DAILY: parseInt(process.env.REACT_APP_FREE_DAILY_LIMIT) || 5,
    VIP_DAILY: parseInt(process.env.REACT_APP_VIP_DAILY_LIMIT) || 50,
    PREMIUM_DAILY: parseInt(process.env.REACT_APP_PREMIUM_DAILY_LIMIT) || 1000,
  },
  
  // 安全配置
  SECURITY: {
    ENABLE_SSL_PINNING: process.env.REACT_APP_ENABLE_SSL_PINNING === 'true',
    ENABLE_CERT_PINNING: process.env.REACT_APP_ENABLE_CERT_PINNING === 'true',
    API_KEY_HEADER: 'X-API-Key',
    AUTH_HEADER: 'Authorization',
  },
  
  // 開發工具配置
  DEVELOPMENT: {
    ENABLE_LOGGING: process.env.REACT_APP_ENABLE_LOGGING !== 'false',
    LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
    ENABLE_PERFORMANCE_MONITORING: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING !== 'false',
    DEBUG: process.env.REACT_APP_DEBUG === 'true',
  },
  
  // 測試配置
  TESTING: {
    ENABLE_TEST_MODE: process.env.REACT_APP_ENABLE_TEST_MODE === 'true',
    TEST_API_URL: process.env.REACT_APP_TEST_API_URL || 'http://localhost:3000/api/v1',
    API_TIMEOUT: 10000, // API超時時間
  },
};

// 獲取啟用的API列表
export const getEnabledApis = () => {
  const enabled = {
    recognition: [],
    pricing: [],
    ai: [],
  };

  // 檢查卡牌辨識API
  Object.entries(API_CONFIG.CARD_RECOGNITION).forEach(([name, config]) => {
    if (config.enabled) {
      enabled.recognition.push(name);
    }
  });

  // 檢查價格API
  Object.entries(API_CONFIG.PRICE_APIS).forEach(([name, config]) => {
    if (config.enabled) {
      enabled.pricing.push(name);
    }
  });

  // 檢查AI API
  Object.entries(API_CONFIG.AI_ANALYSIS).forEach(([name, config]) => {
    if (config.enabled) {
      enabled.ai.push(name);
    }
  });

  return enabled;
};

// 獲取API配置
export const getApiConfig = (service, api) => {
  if (service === 'recognition') {
    return API_CONFIG.CARD_RECOGNITION[api];
  } else if (service === 'pricing') {
    return API_CONFIG.PRICE_APIS[api];
  } else if (service === 'ai') {
    return API_CONFIG.AI_ANALYSIS[api];
  }
  return null;
};

// 檢查API可用性
export const checkApiAvailability = () => {
  const enabled = getEnabledApis();
  const hasAnyApi = enabled.recognition.length > 0 || 
                   enabled.pricing.length > 0 || 
                   enabled.ai.length > 0;

  return {
    hasAnyApi,
    enabled,
    features: API_CONFIG.FEATURES,
    environment: API_CONFIG.ENVIRONMENT,
  };
};

// 獲取性能配置
export const getPerformanceConfig = () => {
  return API_CONFIG.PERFORMANCE;
};

// 獲取圖片處理配置
export const getImageProcessingConfig = () => {
  return API_CONFIG.IMAGE_PROCESSING;
};

// 獲取會員限制配置
export const getMembershipLimits = () => {
  return API_CONFIG.MEMBERSHIP_LIMITS;
};

// 獲取安全配置
export const getSecurityConfig = () => {
  return API_CONFIG.SECURITY;
};

// 獲取開發配置
export const getDevelopmentConfig = () => {
  return API_CONFIG.DEVELOPMENT;
};

// 獲取測試配置
export const getTestingConfig = () => {
  return API_CONFIG.TESTING;
};

// 驗證配置
export const validateConfig = () => {
  const errors = [];
  const warnings = [];

  // 檢查必要的配置
  if (!API_CONFIG.BASE_URL) {
    errors.push('BASE_URL is required');
  }

  // 檢查API密鑰
  const enabled = getEnabledApis();
  if (enabled.recognition.length === 0) {
    warnings.push('No card recognition APIs are enabled');
  }
  if (enabled.pricing.length === 0) {
    warnings.push('No pricing APIs are enabled');
  }
  if (enabled.ai.length === 0) {
    warnings.push('No AI analysis APIs are enabled');
  }

  // 檢查環境變數
  if (API_CONFIG.ENVIRONMENT === 'production') {
    if (!API_CONFIG.SECURITY.ENABLE_SSL_PINNING) {
      warnings.push('SSL pinning is recommended for production');
    }
    if (API_CONFIG.DEVELOPMENT.DEBUG) {
      warnings.push('Debug mode should be disabled in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    enabled,
  };
};

export default API_CONFIG;
