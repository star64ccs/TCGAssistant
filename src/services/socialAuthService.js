import { apiService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCIAL_AUTH_CONFIG, validateSocialAuthConfig, isDevelopmentMode } from '../config/socialAuthConfig';

// 社交登入服務類
class SocialAuthService {
  constructor() {
    this.config = SOCIAL_AUTH_CONFIG;
    this.storageKey = 'social_auth_tokens';
    this.configValidation = validateSocialAuthConfig();
    this.isDevMode = isDevelopmentMode();
  }

  // 生成隨機狀態碼用於防止CSRF攻擊
  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // 生成PKCE挑戰碼
  generatePKCE() {
    const codeVerifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const codeChallenge = this.base64URLEncode(this.sha256(codeVerifier));
    return { codeVerifier, codeChallenge };
  }

  // Base64 URL編碼
  base64URLEncode(str) {
    if (typeof str !== 'string') {
      return 'mock_base64_url_encoded';
    }
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  // SHA256哈希
  async sha256(str) {
    // 在Node.js環境中，使用crypto模組
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return String.fromCharCode.apply(null, hashArray);
    } else {
      // 在測試環境中，返回模擬值
      return 'mock_sha256_hash_' + str.length;
    }
  }

  // 儲存認證令牌
  async storeTokens(provider, tokens) {
    try {
      const existingTokens = await this.getStoredTokens();
      existingTokens[provider] = {
        ...tokens,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(existingTokens));
    } catch (error) {
      console.error('儲存社交登入令牌失敗:', error);
    }
  }

  // 獲取儲存的認證令牌
  async getStoredTokens() {
    try {
      const tokens = await AsyncStorage.getItem(this.storageKey);
      return tokens ? JSON.parse(tokens) : {};
    } catch (error) {
      console.error('獲取儲存的社交登入令牌失敗:', error);
      return {};
    }
  }

  // 清除認證令牌
  async clearTokens(provider = null) {
    try {
      if (provider) {
        const existingTokens = await this.getStoredTokens();
        delete existingTokens[provider];
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(existingTokens));
      } else {
        await AsyncStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('清除社交登入令牌失敗:', error);
    }
  }

  // Google登入
  async googleLogin() {
    try {
      const config = this.config.GOOGLE;
      
      // 檢查配置是否有效
      if (!this.configValidation.isValid) {
        console.warn('社交登入配置不完整，使用模擬模式');
        return this.mockGoogleLogin();
      }

      if (!config.clientId || config.clientId === 'your-google-client-id') {
        throw new Error('Google Client ID 未配置');
      }

      const state = this.generateState();
      const { codeVerifier, codeChallenge } = this.generatePKCE();

      // 構建授權URL
      const authUrl = new URL(config.authUrl);
      authUrl.searchParams.set('client_id', config.clientId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', config.scope);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      // 在React Native中，我們需要使用WebView或外部瀏覽器
      // 這裡模擬授權流程
      console.log('Google授權URL:', authUrl.toString());

      // 模擬授權碼（在實際應用中，這會從WebView回調中獲取）
      const authCode = 'mock_google_auth_code_' + Date.now();

      // 交換授權碼為訪問令牌
      const tokenResponse = await this.exchangeGoogleCode(authCode, codeVerifier);
      
      // 獲取用戶信息
      const userInfo = await this.getGoogleUserInfo(tokenResponse.access_token);

      // 儲存令牌
      await this.storeTokens('google', tokenResponse);

      return {
        success: true,
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture,
          provider: 'google',
        },
        tokens: tokenResponse,
      };
    } catch (error) {
      console.error('Google登入失敗:', error);
      throw error;
    }
  }

  // 模擬Google登入（用於開發和測試）
  async mockGoogleLogin() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: 'google_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: 'https://via.placeholder.com/100',
      provider: 'google',
    };

    const mockTokens = {
      access_token: 'mock_google_access_token',
      refresh_token: 'mock_google_refresh_token',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    await this.storeTokens('google', mockTokens);

    return {
      success: true,
      user: mockUser,
      tokens: mockTokens,
    };
  }

  // 交換Google授權碼
  async exchangeGoogleCode(authCode, codeVerifier) {
    const config = this.config.GOOGLE;
    
    const response = await apiService.post(config.tokenUrl, {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    });

    return response.data;
  }

  // 獲取Google用戶信息
  async getGoogleUserInfo(accessToken) {
    const config = this.config.GOOGLE;
    
    const response = await apiService.get(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  // Facebook登入
  async facebookLogin() {
    try {
      const config = this.config.FACEBOOK;
      
      // 檢查配置是否有效
      if (!this.configValidation.isValid) {
        console.warn('社交登入配置不完整，使用模擬模式');
        return this.mockFacebookLogin();
      }

      if (!config.appId || config.appId === 'your-facebook-app-id') {
        throw new Error('Facebook App ID 未配置');
      }

      const state = this.generateState();

      // 構建授權URL
      const authUrl = new URL(config.authUrl);
      authUrl.searchParams.set('client_id', config.appId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', config.scope);
      authUrl.searchParams.set('state', state);

      console.log('Facebook授權URL:', authUrl.toString());

      // 模擬授權碼
      const authCode = 'mock_facebook_auth_code_' + Date.now();

      // 交換授權碼為訪問令牌
      const tokenResponse = await this.exchangeFacebookCode(authCode);
      
      // 獲取用戶信息
      const userInfo = await this.getFacebookUserInfo(tokenResponse.access_token);

      // 儲存令牌
      await this.storeTokens('facebook', tokenResponse);

      return {
        success: true,
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatar: `https://graph.facebook.com/${userInfo.id}/picture?type=large`,
          provider: 'facebook',
        },
        tokens: tokenResponse,
      };
    } catch (error) {
      console.error('Facebook登入失敗:', error);
      throw error;
    }
  }

  // 模擬Facebook登入（用於開發和測試）
  async mockFacebookLogin() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: 'facebook_' + Date.now(),
      email: 'user@facebook.com',
      name: 'Facebook User',
      avatar: 'https://via.placeholder.com/100',
      provider: 'facebook',
    };

    const mockTokens = {
      access_token: 'mock_facebook_access_token',
      refresh_token: 'mock_facebook_refresh_token',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    await this.storeTokens('facebook', mockTokens);

    return {
      success: true,
      user: mockUser,
      tokens: mockTokens,
    };
  }

  // 交換Facebook授權碼
  async exchangeFacebookCode(authCode) {
    const config = this.config.FACEBOOK;
    
    const response = await apiService.get(config.tokenUrl, {
      params: {
        client_id: config.appId,
        client_secret: config.appSecret,
        code: authCode,
        redirect_uri: config.redirectUri,
      },
    });

    return response.data;
  }

  // 獲取Facebook用戶信息
  async getFacebookUserInfo(accessToken) {
    const config = this.config.FACEBOOK;
    
    const response = await apiService.get(config.userInfoUrl, {
      params: {
        fields: 'id,name,email,picture',
        access_token: accessToken,
      },
    });

    return response.data;
  }

  // Apple登入
  async appleLogin() {
    try {
      const config = this.config.APPLE;
      
      // 檢查配置是否有效
      if (!this.configValidation.isValid) {
        console.warn('社交登入配置不完整，使用模擬模式');
        return this.mockAppleLogin();
      }

      if (!config.clientId || config.clientId === 'com.tcgassistant.signin') {
        throw new Error('Apple Client ID 未配置');
      }

      const state = this.generateState();

      // 構建授權URL
      const authUrl = new URL(config.authUrl);
      authUrl.searchParams.set('client_id', config.clientId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code id_token');
      authUrl.searchParams.set('scope', config.scope);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('response_mode', 'form_post');

      console.log('Apple授權URL:', authUrl.toString());

      // 模擬授權碼
      const authCode = 'mock_apple_auth_code_' + Date.now();

      // 交換授權碼為訪問令牌
      const tokenResponse = await this.exchangeAppleCode(authCode);
      
      // 解析ID Token獲取用戶信息
      const userInfo = this.parseAppleIdToken(tokenResponse.id_token);

      // 儲存令牌
      await this.storeTokens('apple', tokenResponse);

      return {
        success: true,
        user: {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || 'Apple User',
          avatar: null, // Apple不提供頭像
          provider: 'apple',
        },
        tokens: tokenResponse,
      };
    } catch (error) {
      console.error('Apple登入失敗:', error);
      throw error;
    }
  }

  // 模擬Apple登入（用於開發和測試）
  async mockAppleLogin() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: 'apple_' + Date.now(),
      email: 'user@icloud.com',
      name: 'Apple User',
      avatar: null,
      provider: 'apple',
    };

    const mockTokens = {
      access_token: 'mock_apple_access_token',
      refresh_token: 'mock_apple_refresh_token',
      id_token: 'mock_apple_id_token',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    await this.storeTokens('apple', mockTokens);

    return {
      success: true,
      user: mockUser,
      tokens: mockTokens,
    };
  }

  // 交換Apple授權碼
  async exchangeAppleCode(authCode) {
    const config = this.config.APPLE;
    
    // 生成JWT客戶端認證
    const clientSecret = this.generateAppleClientSecret();
    
    const response = await apiService.post(config.tokenUrl, {
      client_id: config.clientId,
      client_secret: clientSecret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    });

    return response.data;
  }

  // 生成Apple客戶端密鑰
  generateAppleClientSecret() {
    // 這裡需要實現JWT簽名
    // 由於複雜性，這裡返回模擬值
    return 'mock_apple_client_secret';
  }

  // 解析Apple ID Token
  parseAppleIdToken(idToken) {
    try {
      // 在實際應用中，需要驗證JWT簽名
      // 這裡簡單解析payload部分
      const payload = idToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('解析Apple ID Token失敗:', error);
      throw error;
    }
  }

  // 刷新令牌
  async refreshToken(provider) {
    try {
      const storedTokens = await this.getStoredTokens();
      const tokens = storedTokens[provider];
      
      if (!tokens || !tokens.refresh_token) {
        throw new Error('沒有可用的刷新令牌');
      }

      let newTokens;
      switch (provider) {
        case 'google':
          newTokens = await this.refreshGoogleToken(tokens.refresh_token);
          break;
        case 'facebook':
          newTokens = await this.refreshFacebookToken(tokens.refresh_token);
          break;
        case 'apple':
          newTokens = await this.refreshAppleToken(tokens.refresh_token);
          break;
        default:
          throw new Error(`不支援的提供商: ${provider}`);
      }

      // 更新儲存的令牌
      await this.storeTokens(provider, newTokens);

      return newTokens;
    } catch (error) {
      console.error(`刷新${provider}令牌失敗:`, error);
      throw error;
    }
  }

  // 刷新Google令牌
  async refreshGoogleToken(refreshToken) {
    const config = this.config.GOOGLE;
    
    const response = await apiService.post(config.tokenUrl, {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return response.data;
  }

  // 刷新Facebook令牌
  async refreshFacebookToken(refreshToken) {
    const config = this.config.FACEBOOK;
    
    const response = await apiService.get(config.tokenUrl, {
      params: {
        client_id: config.appId,
        client_secret: config.appSecret,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: refreshToken,
      },
    });

    return response.data;
  }

  // 刷新Apple令牌
  async refreshAppleToken(refreshToken) {
    const config = this.config.APPLE;
    const clientSecret = this.generateAppleClientSecret();
    
    const response = await apiService.post(config.tokenUrl, {
      client_id: config.clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return response.data;
  }

  // 登出
  async logout(provider) {
    try {
      await this.clearTokens(provider);
      
      // 根據提供商執行特定的登出流程
      switch (provider) {
        case 'google':
          // Google登出需要撤銷令牌
          await this.revokeGoogleToken();
          break;
        case 'facebook':
          // Facebook登出
          await this.revokeFacebookToken();
          break;
        case 'apple':
          // Apple登出
          await this.revokeAppleToken();
          break;
      }

      return { success: true };
    } catch (error) {
      console.error(`${provider}登出失敗:`, error);
      throw error;
    }
  }

  // 撤銷Google令牌
  async revokeGoogleToken() {
    const storedTokens = await this.getStoredTokens();
    const tokens = storedTokens.google;
    
    if (tokens && tokens.access_token) {
      try {
        await apiService.post('https://oauth2.googleapis.com/revoke', {
          token: tokens.access_token,
        });
      } catch (error) {
        console.error('撤銷Google令牌失敗:', error);
      }
    }
  }

  // 撤銷Facebook令牌
  async revokeFacebookToken() {
    const storedTokens = await this.getStoredTokens();
    const tokens = storedTokens.facebook;
    
    if (tokens && tokens.access_token) {
      try {
        await apiService.delete(`https://graph.facebook.com/me/permissions`, {
          params: {
            access_token: tokens.access_token,
          },
        });
      } catch (error) {
        console.error('撤銷Facebook令牌失敗:', error);
      }
    }
  }

  // 撤銷Apple令牌
  async revokeAppleToken() {
    // Apple沒有直接的令牌撤銷端點
    // 清除本地儲存的令牌即可
    console.log('Apple令牌已清除');
  }

  // 檢查令牌是否有效
  async isTokenValid(provider) {
    try {
      const storedTokens = await this.getStoredTokens();
      const tokens = storedTokens[provider];
      
      if (!tokens || !tokens.access_token) {
        return false;
      }

      // 檢查令牌是否過期
      if (tokens.expires_at && Date.now() > tokens.expires_at) {
        // 嘗試刷新令牌
        await this.refreshToken(provider);
        return true;
      }

      return true;
    } catch (error) {
      console.error(`檢查${provider}令牌有效性失敗:`, error);
      return false;
    }
  }

  // 獲取當前用戶信息
  async getCurrentUser(provider) {
    try {
      const isValid = await this.isTokenValid(provider);
      if (!isValid) {
        throw new Error('令牌無效或已過期');
      }

      const storedTokens = await this.getStoredTokens();
      const tokens = storedTokens[provider];

      switch (provider) {
        case 'google':
          return await this.getGoogleUserInfo(tokens.access_token);
        case 'facebook':
          return await this.getFacebookUserInfo(tokens.access_token);
        case 'apple':
          return this.parseAppleIdToken(tokens.id_token);
        default:
          throw new Error(`不支援的提供商: ${provider}`);
      }
    } catch (error) {
      console.error(`獲取${provider}用戶信息失敗:`, error);
      throw error;
    }
  }
}

// 創建單例實例
const socialAuthService = new SocialAuthService();

export default socialAuthService;
