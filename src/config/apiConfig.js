// API配置 - 已遷移到統一配置管理系統
// 請使用 src/config/unifiedConfig.js 中的配置

import { getApiConfig as getUnifiedApiConfig } from './unifiedConfig';

// 向後兼容的 API 配置函數
export const getApiConfig = () => {
  const config = getUnifiedApiConfig();
  return {
    baseURL: config.baseUrl,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export const apiClient = {
  get: async (url) => fetch(url),
  post: async (url, data) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const cachedRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('API請求失敗:', error);
    return { success: false, error: error.message };
  }
};
