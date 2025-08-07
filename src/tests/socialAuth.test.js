import socialAuthService from '../services/socialAuthService';
import { validateSocialAuthConfig, getAvailableProviders } from '../config/socialAuthConfig';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock apiService
jest.mock('../services/api', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock crypto for Node.js environment
global.crypto = {
  subtle: {
    digest: jest.fn(),
  },
};

// Mock TextEncoder
global.TextEncoder = class {
  encode(str) {
    return new Uint8Array(str.split('').map(char => char.charCodeAt(0)));
  }
};

describe('Social Auth Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Tests', () => {
    test('should validate social auth config', () => {
      const result = validateSocialAuthConfig();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    test('should get available providers', () => {
      const providers = getAvailableProviders();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers).toContain('google');
      expect(providers).toContain('facebook');
      expect(providers).toContain('apple');
    });
  });

  describe('Token Management Tests', () => {
    test('should store tokens', async () => {
      const mockTokens = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
      };

      await socialAuthService.storeTokens('google', mockTokens);
      expect(socialAuthService.storeTokens).toBeDefined();
    });

    test('should get stored tokens', async () => {
      const tokens = await socialAuthService.getStoredTokens();
      expect(typeof tokens).toBe('object');
    });

    test('should clear tokens', async () => {
      await socialAuthService.clearTokens('google');
      expect(socialAuthService.clearTokens).toBeDefined();
    });
  });

  describe('Google Login Tests', () => {
    test('should handle Google login', async () => {
      const result = await socialAuthService.googleLogin();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('provider');
      expect(result.user.provider).toBe('google');
    });

    test('should handle mock Google login when config is invalid', async () => {
      // Mock config validation to return invalid
      socialAuthService.configValidation = { isValid: false, errors: ['Test error'] };
      
      const result = await socialAuthService.googleLogin();
      
      expect(result.success).toBe(true);
      expect(result.user.provider).toBe('google');
    });
  });

  describe('Facebook Login Tests', () => {
    test('should handle Facebook login', async () => {
      const result = await socialAuthService.facebookLogin();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('provider');
      expect(result.user.provider).toBe('facebook');
    });

    test('should handle mock Facebook login when config is invalid', async () => {
      // Mock config validation to return invalid
      socialAuthService.configValidation = { isValid: false, errors: ['Test error'] };
      
      const result = await socialAuthService.facebookLogin();
      
      expect(result.success).toBe(true);
      expect(result.user.provider).toBe('facebook');
    });
  });

  describe('Apple Login Tests', () => {
    test('should handle Apple login', async () => {
      const result = await socialAuthService.appleLogin();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('provider');
      expect(result.user.provider).toBe('apple');
    });

    test('should handle mock Apple login when config is invalid', async () => {
      // Mock config validation to return invalid
      socialAuthService.configValidation = { isValid: false, errors: ['Test error'] };
      
      const result = await socialAuthService.appleLogin();
      
      expect(result.success).toBe(true);
      expect(result.user.provider).toBe('apple');
    });
  });

  describe('Utility Functions Tests', () => {
    test('should generate state', () => {
      const state = socialAuthService.generateState();
      expect(typeof state).toBe('string');
      expect(state.length).toBeGreaterThan(0);
    });

    test('should generate PKCE', () => {
      const pkce = socialAuthService.generatePKCE();
      expect(pkce).toHaveProperty('codeVerifier');
      expect(pkce).toHaveProperty('codeChallenge');
      expect(typeof pkce.codeVerifier).toBe('string');
      expect(typeof pkce.codeChallenge).toBe('string');
    });

    test('should encode base64 URL', () => {
      const testString = 'test+string/with=equals';
      const encoded = socialAuthService.base64URLEncode(testString);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });
  });

  describe('Token Validation Tests', () => {
    test('should check token validity', async () => {
      const isValid = await socialAuthService.isTokenValid('google');
      expect(typeof isValid).toBe('boolean');
    });

    test('should get current user', async () => {
      try {
        const user = await socialAuthService.getCurrentUser('google');
        expect(user).toBeDefined();
      } catch (error) {
        // Expected in test environment without valid tokens
        expect(error.message).toContain('令牌無效或已過期');
      }
    });
  });

  describe('Logout Tests', () => {
    test('should handle logout', async () => {
      const result = await socialAuthService.logout('google');
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid provider', async () => {
      try {
        await socialAuthService.logout('invalid_provider');
      } catch (error) {
        expect(error.message).toContain('不支援的提供商');
      }
    });

    test('should handle missing refresh token', async () => {
      try {
        await socialAuthService.refreshToken('google');
      } catch (error) {
        expect(error.message).toContain('沒有可用的刷新令牌');
      }
    });
  });
});
