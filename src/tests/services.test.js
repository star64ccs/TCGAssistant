// 服務層測試文件
import { jest } from '@jest/globals';

// 模擬 axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

// 模擬 AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// 導入服務
import { API_ENDPOINTS, retryRequest, cachedRequest } from '../services/api';

// 導入工具
import imageUtils from '../utils/imageUtils';
import validationUtils from '../utils/validationUtils';
import notificationUtils from '../utils/notificationUtils';

describe('API Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('API_ENDPOINTS should have correct structure', () => {
    expect(API_ENDPOINTS).toHaveProperty('AUTH');
    expect(API_ENDPOINTS).toHaveProperty('CARDS');
    expect(API_ENDPOINTS).toHaveProperty('ANALYSIS');
    expect(API_ENDPOINTS).toHaveProperty('COLLECTION');
    expect(API_ENDPOINTS).toHaveProperty('MEMBERSHIP');
    expect(API_ENDPOINTS).toHaveProperty('USER');
    expect(API_ENDPOINTS).toHaveProperty('AI');
    expect(API_ENDPOINTS).toHaveProperty('UPLOAD');
    expect(API_ENDPOINTS).toHaveProperty('SHARE');
  });

  test('retryRequest should retry failed requests', async () => {
    const mockRequest = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('Success');

    const result = await retryRequest(mockRequest, 3, 100);
    
    expect(result).toBe('Success');
    expect(mockRequest).toHaveBeenCalledTimes(3);
  });

  test('cachedRequest should cache results', async () => {
    const mockRequest = jest.fn().mockResolvedValue('Cached data');
    
    // 第一次調用
    const result1 = await cachedRequest('test_key', mockRequest, 5000);
    expect(result1).toBe('Cached data');
    expect(mockRequest).toHaveBeenCalledTimes(1);
    
    // 第二次調用應該使用快取
    const result2 = await cachedRequest('test_key', mockRequest, 5000);
    expect(result2).toBe('Cached data');
    expect(mockRequest).toHaveBeenCalledTimes(1); // 不應該再次調用
  });
});

describe('Image Utils Tests', () => {
  test('validateImageFormat should return true for valid formats', () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    expect(imageUtils.validateImageFormat(validFile)).toBe(true);
    
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
    expect(imageUtils.validateImageFormat(pngFile)).toBe(true);
    
    const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' });
    expect(imageUtils.validateImageFormat(webpFile)).toBe(true);
  });

  test('validateImageFormat should return false for invalid formats', () => {
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' });
    expect(imageUtils.validateImageFormat(gifFile)).toBe(false);
    
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    expect(imageUtils.validateImageFormat(pdfFile)).toBe(false);
  });

  test('validateImageSize should return true for valid size', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB
    
    expect(imageUtils.validateImageSize(mockFile, 5 * 1024 * 1024)).toBe(true);
  });

  test('validateImageSize should return false for oversized file', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB
    
    expect(imageUtils.validateImageSize(mockFile, 5 * 1024 * 1024)).toBe(false);
  });

  test('formatFileSize should format bytes correctly', () => {
    expect(imageUtils.formatFileSize(1024)).toBe('1 KB');
    expect(imageUtils.formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(imageUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('Validation Utils Tests', () => {
  test('validateEmail should return true for valid emails', () => {
    expect(validationUtils.validateEmail('test@example.com')).toBe(true);
    expect(validationUtils.validateEmail('user.name@domain.co.uk')).toBe(true);
  });

  test('validateEmail should return false for invalid emails', () => {
    expect(validationUtils.validateEmail('invalid-email')).toBe(false);
    expect(validationUtils.validateEmail('test@')).toBe(false);
    expect(validationUtils.validateEmail('@example.com')).toBe(false);
  });

  test('validatePhone should return true for valid Taiwan phone numbers', () => {
    expect(validationUtils.validatePhone('0912345678')).toBe(true);
    expect(validationUtils.validatePhone('+886912345678')).toBe(true);
  });

  test('validatePhone should return false for invalid phone numbers', () => {
    expect(validationUtils.validatePhone('123')).toBe(false);
    expect(validationUtils.validatePhone('invalid')).toBe(false);
  });

  test('validatePassword should return correct strength assessment', () => {
    const weakResult = validationUtils.validatePassword('weak');
    expect(weakResult.strength).toBe('weak');
    
    const strongResult = validationUtils.validatePassword('StrongPass123!');
    expect(strongResult.strength).toBe('very-strong');
  });

  test('validateRequired should return correct validation result', () => {
    expect(validationUtils.validateRequired('test').isValid).toBe(true);
    expect(validationUtils.validateRequired('').isValid).toBe(false);
    expect(validationUtils.validateRequired(null).isValid).toBe(false);
  });

  test('validateLength should return correct validation result', () => {
    expect(validationUtils.validateLength('test', 2, 10).isValid).toBe(true);
    expect(validationUtils.validateLength('a', 2, 10).isValid).toBe(false);
    expect(validationUtils.validateLength('verylongstring', 2, 10).isValid).toBe(false);
  });

  test('validateNumberRange should return correct validation result', () => {
    expect(validationUtils.validateNumberRange(5, 1, 10).isValid).toBe(true);
    expect(validationUtils.validateNumberRange(0, 1, 10).isValid).toBe(false);
    expect(validationUtils.validateNumberRange(15, 1, 10).isValid).toBe(false);
  });

  test('validateURL should return correct validation result', () => {
    expect(validationUtils.validateURL('https://example.com').isValid).toBe(true);
    expect(validationUtils.validateURL('http://test.org').isValid).toBe(true);
    expect(validationUtils.validateURL('invalid-url').isValid).toBe(false);
  });

  test('validateDate should return correct validation result', () => {
    expect(validationUtils.validateDate('2023-12-31').isValid).toBe(true);
    expect(validationUtils.validateDate('invalid-date').isValid).toBe(false);
  });

  test('validateCreditCard should return correct validation result', () => {
    expect(validationUtils.validateCreditCard('4111111111111111').isValid).toBe(true);
    expect(validationUtils.validateCreditCard('1234567890123456').isValid).toBe(false);
  });

  test('validateTaiwanID should return correct validation result', () => {
    expect(validationUtils.validateTaiwanID('A123456789').isValid).toBe(true);
    expect(validationUtils.validateTaiwanID('123456789').isValid).toBe(false);
  });

  test('validateForm should validate multiple fields', () => {
    const formData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      phone: '0912345678',
    };
    
    const rules = {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
      phone: { required: true, phone: true },
    };
    
    const result = validationUtils.validateForm(formData, rules);
    expect(result.isValid).toBe(true);
  });
});

describe('Notification Utils Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shouldSendNotification should respect user preferences', () => {
    // 模擬偏好設置
    jest.spyOn(notificationUtils, 'getNotificationPreferences').mockReturnValue({
      analysisComplete: true,
      priceChanges: false,
    });
    
    const result1 = notificationUtils.shouldSendNotification('analysisComplete');
    const result2 = notificationUtils.shouldSendNotification('priceChanges');
    
    expect(result1).toBe(true);
    expect(result2).toBe(false);
  });

  test('shouldSendNotification should handle undefined preferences', () => {
    // 模擬偏好設置
    jest.spyOn(notificationUtils, 'getNotificationPreferences').mockReturnValue({
      analysisComplete: undefined,
    });
    
    const result = notificationUtils.shouldSendNotification('analysisComplete');
    expect(result).toBe(true); // 未定義時默認允許
  });

  test('shouldSendNotification should handle disabled notification type', () => {
    // 模擬偏好設置
    jest.spyOn(notificationUtils, 'getNotificationPreferences').mockReturnValue({
      analysisComplete: false,
    });
    
    const result = notificationUtils.shouldSendNotification('analysisComplete');
    expect(result).toBe(false);
  });
});

// 整合測試
describe('Integration Tests', () => {
  test('Complete validation flow', () => {
    const formData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      phone: '0912345678',
    };
    
    const rules = {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
      phone: { required: true, phone: true },
    };
    
    const validationResult = validationUtils.validateForm(formData, rules);
    expect(validationResult.isValid).toBe(true);
  });

  test('Complete image validation flow', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB
    
    const formatValid = imageUtils.validateImageFormat(mockFile);
    const sizeValid = imageUtils.validateImageSize(mockFile, 5 * 1024 * 1024);
    
    expect(formatValid).toBe(true);
    expect(sizeValid).toBe(true);
  });
});
