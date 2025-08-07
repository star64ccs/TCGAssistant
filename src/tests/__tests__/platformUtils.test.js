// 模擬 Platform
const mockPlatform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
};

jest.mock('react-native/Libraries/Utilities/Platform', () => mockPlatform);

// 在模擬設置後載入模組
let PlatformUtils;

describe('PlatformUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 設置默認平台為 iOS
    Object.defineProperty(mockPlatform, 'OS', {
      value: 'ios',
      writable: true,
    });
    // 重新載入模組
    jest.resetModules();
    PlatformUtils = require('../../utils/platformUtils').default;
  });

  describe('平台檢測', () => {
    it('應該正確檢測 iOS 平台', () => {
      // 重新設置 Platform.OS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'ios',
        writable: true,
      });
      
      // 重新載入模組以獲取新的平台值
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;
      
      expect(PlatformUtils.isIOS).toBe(true);
      expect(PlatformUtils.isAndroid).toBe(false);
      expect(PlatformUtils.isWeb).toBe(false);
    });

    it('應該正確檢測 Android 平台', () => {
      // 重新設置 Platform.OS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'android',
        writable: true,
      });
      
      // 重新載入模組以獲取新的平台值
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;
      
      expect(PlatformUtils.isIOS).toBe(false);
      expect(PlatformUtils.isAndroid).toBe(true);
      expect(PlatformUtils.isWeb).toBe(false);
    });

    it('應該正確檢測 Web 平台', () => {
      // 重新設置 Platform.OS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'web',
        writable: true,
      });
      
      // 重新載入模組以獲取新的平台值
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;
      
      expect(PlatformUtils.isIOS).toBe(false);
      expect(PlatformUtils.isAndroid).toBe(false);
      expect(PlatformUtils.isWeb).toBe(true);
    });
  });

  describe('getPlatformComponent', () => {
    it('應該返回正確的平台組件', () => {
      // 確保平台設置為 iOS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'ios',
        writable: true,
      });
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;

      const components = {
        ios: 'IOSComponent',
        android: 'AndroidComponent',
        web: 'WebComponent',
        default: 'DefaultComponent',
      };

      const result = PlatformUtils.getPlatformComponent(components);
      expect(result).toBe('IOSComponent');
    });

    it('應該返回默認組件當平台特定組件不存在時', () => {
      const components = {
        android: 'AndroidComponent',
        default: 'DefaultComponent',
      };

      const result = PlatformUtils.getPlatformComponent(components);
      expect(result).toBe('DefaultComponent');
    });
  });

  describe('getPlatformStyles', () => {
    it('應該合併平台特定樣式', () => {
      // 確保平台設置為 iOS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'ios',
        writable: true,
      });
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;

      const styles = {
        container: { flex: 1 },
        ios: { paddingTop: 44 },
        android: { paddingTop: 24 },
        web: { maxWidth: 1200 },
      };

      const result = PlatformUtils.getPlatformStyles(styles);
      expect(result).toEqual({
        container: { flex: 1 },
        paddingTop: 44,
      });
    });
  });

  describe('getPerformanceConfig', () => {
    it('應該返回 iOS 性能配置', () => {
      // 確保平台設置為 iOS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'ios',
        writable: true,
      });
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;

      const config = PlatformUtils.getPerformanceConfig();
      expect(config.imageQuality).toBe(0.9);
      expect(config.maxImageSize).toBe(15 * 1024 * 1024);
    });

    it('應該返回 Android 性能配置', () => {
      // 重新設置 Platform.OS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'android',
        writable: true,
      });
      
      // 重新載入模組以獲取新的平台值
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;

      const config = PlatformUtils.getPerformanceConfig();
      expect(config.imageQuality).toBe(0.85);
      expect(config.maxImageSize).toBe(12 * 1024 * 1024);
    });

    it('應該返回 Web 性能配置', () => {
      // 重新設置 Platform.OS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'web',
        writable: true,
      });
      
      // 重新載入模組以獲取新的平台值
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;

      const config = PlatformUtils.getPerformanceConfig();
      expect(config.imageQuality).toBe(0.7);
      expect(config.maxImageSize).toBe(5 * 1024 * 1024);
    });
  });

  describe('isFeatureSupported', () => {
    it('應該正確檢查相機功能支援', () => {
      // 確保平台設置為 iOS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'ios',
        writable: true,
      });
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;

      expect(PlatformUtils.isFeatureSupported('camera')).toBe(true);
    });

    it('應該正確檢查 Web 平台相機功能', () => {
      // 重新設置 Platform.OS
      Object.defineProperty(mockPlatform, 'OS', {
        value: 'web',
        writable: true,
      });
      
      // 重新載入模組以獲取新的平台值
      jest.resetModules();
      PlatformUtils = require('../../utils/platformUtils').default;

      expect(PlatformUtils.isFeatureSupported('camera')).toBe(false);
    });
  });

  describe('handlePlatformError', () => {
    it('應該正確處理平台錯誤', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      PlatformUtils.handlePlatformError(error, 'TestContext');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestContext'),
        error
      );

      consoleSpy.mockRestore();
    });
  });
});
