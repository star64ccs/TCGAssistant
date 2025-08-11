// 社交登入配置管理 - 已遷移到統一配置管理系統
// 請使用 src/config/unifiedConfig.js 中的配置

import { getSocialAuthConfig } from './unifiedConfig';

// 向後兼容的社交登入配置
export const SOCIAL_AUTH_CONFIG = {
  GOOGLE: getSocialAuthConfig('GOOGLE'),
  FACEBOOK: getSocialAuthConfig('FACEBOOK'),
  APPLE: getSocialAuthConfig('APPLE'),
};

// 檢查配置是否完整
export const validateSocialAuthConfig = () => {
  const errors = [];

  // 檢查Google配置
  if (!SOCIAL_AUTH_CONFIG.GOOGLE.clientId || SOCIAL_AUTH_CONFIG.GOOGLE.clientId === 'your-google-client-id') {
    errors.push('Google Client ID 未配置');
  }

  // 檢查Facebook配置
  if (!SOCIAL_AUTH_CONFIG.FACEBOOK.appId || SOCIAL_AUTH_CONFIG.FACEBOOK.appId === 'your-facebook-app-id') {
    errors.push('Facebook App ID 未配置');
  }

  // 檢查Apple配置
  if (!SOCIAL_AUTH_CONFIG.APPLE.clientId || SOCIAL_AUTH_CONFIG.APPLE.clientId === 'com.tcgassistant.signin') {
    errors.push('Apple Client ID 未配置');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 獲取可用的社交登入提供商
export const getAvailableProviders = () => {
  const providers = [];
  const config = validateSocialAuthConfig();

  if (config.isValid) {
    providers.push('google', 'facebook', 'apple');
  } else {
  // 如果配置不完整，返回模擬模式
    providers.push('google', 'facebook', 'apple');
  }

  return providers;
};

// 檢查是否為開發模式
export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || __DEV__;
};

// 獲取重定向URI
export const getRedirectUri = (provider) => {
  const config = SOCIAL_AUTH_CONFIG[provider.toUpperCase()];
  return config ? config.redirectUri : null;
};

// 獲取授權URL
export const getAuthUrl = (provider) => {
  const config = SOCIAL_AUTH_CONFIG[provider.toUpperCase()];
  return config ? config.authUrl : null;
};

// 獲取令牌URL
export const getTokenUrl = (provider) => {
  const config = SOCIAL_AUTH_CONFIG[provider.toUpperCase()];
  return config ? config.tokenUrl : null;
};

// 獲取用戶信息URL
export const getUserInfoUrl = (provider) => {
  const config = SOCIAL_AUTH_CONFIG[provider.toUpperCase()];
  return config ? config.userInfoUrl : null;
};

export default SOCIAL_AUTH_CONFIG;
