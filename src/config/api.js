// API 配置文件 - 已遷移到統一配置管理系統
// 請使用 src/config/unifiedConfig.js 中的配置

import { getApiConfig as getUnifiedApiConfig } from './unifiedConfig';

// 向後兼容的 API 配置函數
export const getApiConfig = () => {
  return getUnifiedApiConfig();
};

// 獲取完整的API基礎URL
export const getApiBaseUrl = () => {
  const config = getApiConfig();
  return `${config.baseUrl
  }/api/${ config.apiVersion }`;
};

// 獲取API超時時間
export const getApiTimeout = () => {
  const config = getApiConfig();
  return config.timeout;
};

// 獲取當前環境信息
export const getCurrentEnv = () => {
  const config = getApiConfig();
  return config.environment || 'development';
};

// 檢查API連接狀態
export const checkApiConnection = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl.replace('/api/v1', '')
    }/health`);
    return response.ok;
  } catch (error) {
    console.error('API連接檢查失敗:', error);
    return false;
  }
};

export default getApiConfig;
