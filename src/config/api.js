// API 配置文件
const API_CONFIG = {
  // 開發環境
  development: {
    baseUrl: 'http://localhost:8081',
    apiVersion: 'v1',
    timeout: 30000,
  },
  
  // 測試環境
  staging: {
    baseUrl: 'https://staging-api.tcgassistant.com',
    apiVersion: 'v1',
    timeout: 30000,
  },
  
  // 生產環境
  production: {
    baseUrl: 'https://api.tcgassistant.com',
    apiVersion: 'v1',
    timeout: 30000,
  },
};

// 獲取當前環境
const getCurrentEnvironment = () => {
  // 檢查是否在開發環境
  if (__DEV__) {
    return 'development';
  }
  return process.env.REACT_APP_ENVIRONMENT || 'development';
};

// 獲取API配置
export const getApiConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env] || API_CONFIG.development;
};

// 獲取完整的API基礎URL
export const getApiBaseUrl = () => {
  const config = getApiConfig();
  return `${config.baseUrl}/api/${config.apiVersion}`;
};

// 獲取API超時時間
export const getApiTimeout = () => {
  const config = getApiConfig();
  return config.timeout;
};

// 獲取當前環境信息
export const getCurrentEnv = () => {
  return getCurrentEnvironment();
};

// 檢查API連接狀態
export const checkApiConnection = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl.replace('/api/v1', '')}/health`);
    return response.ok;
  } catch (error) {
    console.error('API連接檢查失敗:', error);
    return false;
  }
};

export default API_CONFIG;
