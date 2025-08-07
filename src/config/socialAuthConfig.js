// 社交登入配置管理
export const SOCIAL_AUTH_CONFIG = {
  // Google OAuth 2.0 配置
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
  
  // Facebook OAuth 2.0 配置
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
  
  // Apple Sign In 配置
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
