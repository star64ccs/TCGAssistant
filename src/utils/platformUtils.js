import { Platform, Dimensions } from 'react-native';

/**
 * 平台工具類 - 處理跨平台相容性
 */
class PlatformUtils {
  /**
   * 檢查當前平台
   */
  static isIOS = Platform.OS === 'ios';
  static isAndroid = Platform.OS === 'android';
  static isWeb = Platform.OS === 'web';

  /**
   * 獲取平台特定組件
   * @param {Object} components - 平台特定組件映射
   * @returns {Component} 當前平台的組件
   */
  static getPlatformComponent(components) {
    const { ios, android, web, default: defaultComponent } = components;
    
    if (this.isIOS && ios) return ios;
    if (this.isAndroid && android) return android;
    if (this.isWeb && web) return web;
    
    return defaultComponent || ios || android || web;
  }

  /**
   * 動態導入平台特定組件
   * @param {string} componentPath - 組件路徑
   * @returns {Component} 平台特定組件
   */
  static requirePlatformComponent(componentPath) {
    const platformPath = `${componentPath}.${Platform.OS}`;
    const defaultPath = `${componentPath}.default`;
    
    try {
      return require(platformPath);
    } catch (error) {
      try {
        return require(defaultPath);
      } catch (defaultError) {
        console.warn(`無法載入平台特定組件: ${platformPath} 或 ${defaultPath}`);
        return null;
      }
    }
  }

  /**
   * 獲取平台特定樣式
   * @param {Object} styles - 平台特定樣式映射
   * @returns {Object} 合併後的樣式
   */
  static getPlatformStyles(styles) {
    const { ios, android, web, ...commonStyles } = styles;
    
    let platformStyles = {};
    
    if (this.isIOS && ios) {
      platformStyles = { ...platformStyles, ...ios };
    } else if (this.isAndroid && android) {
      platformStyles = { ...platformStyles, ...android };
    } else if (this.isWeb && web) {
      platformStyles = { ...platformStyles, ...web };
    }
    
    return { ...commonStyles, ...platformStyles };
  }

  /**
   * 獲取平台特定配置
   * @param {Object} config - 平台特定配置映射
   * @returns {Object} 當前平台的配置
   */
  static getPlatformConfig(config) {
    const { ios, android, web, default: defaultConfig } = config;
    
    if (this.isIOS && ios) return { ...defaultConfig, ...ios };
    if (this.isAndroid && android) return { ...defaultConfig, ...android };
    if (this.isWeb && web) return { ...defaultConfig, ...web };
    
    return defaultConfig || {};
  }

  /**
   * 檢查設備類型
   */
  static isTablet() {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = height / width;
    
    if (this.isIOS) {
      return aspectRatio <= 1.6;
    } else if (this.isAndroid) {
      return aspectRatio <= 1.6;
    } else if (this.isWeb) {
      return width >= 768;
    }
    
    return false;
  }

  /**
   * 獲取安全區域配置
   */
  static getSafeAreaConfig() {
    if (this.isIOS) {
      return {
        top: 44,
        bottom: 34,
        left: 0,
        right: 0,
      };
    } else if (this.isAndroid) {
      return {
        top: 24,
        bottom: 0,
        left: 0,
        right: 0,
      };
    } else if (this.isWeb) {
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      };
    }
    
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  /**
   * 獲取平台特定字體
   */
  static getPlatformFonts() {
    if (this.isIOS) {
      return {
        regular: 'System',
        medium: 'System',
        bold: 'System',
        light: 'System',
      };
    } else if (this.isAndroid) {
      return {
        regular: 'Roboto',
        medium: 'Roboto',
        bold: 'Roboto',
        light: 'Roboto',
      };
    } else if (this.isWeb) {
      return {
        regular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        medium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        light: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      };
    }
    
    return {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      light: 'System',
    };
  }

  /**
   * 檢查功能支援
   */
  static isFeatureSupported(feature) {
    const supportedFeatures = {
      camera: !this.isWeb,
      biometrics: this.isIOS || this.isAndroid,
      pushNotifications: this.isIOS || this.isAndroid,
      fileSystem: !this.isWeb,
      share: this.isIOS || this.isAndroid,
      hapticFeedback: this.isIOS || this.isAndroid,
    };
    
    return supportedFeatures[feature] || false;
  }

  /**
   * 獲取平台特定API端點
   */
  static getApiEndpoint(baseUrl) {
    if (this.isWeb) {
      return `${baseUrl}/web`;
    } else if (this.isIOS) {
      return `${baseUrl}/ios`;
    } else if (this.isAndroid) {
      return `${baseUrl}/android`;
    }
    
    return baseUrl;
  }

  /**
   * 平台特定錯誤處理
   */
  static handlePlatformError(error, context) {
    if (this.isWeb) {
      console.error(`Web Error in ${context}:`, error);
      // Web 特定錯誤處理
    } else if (this.isIOS) {
      console.error(`iOS Error in ${context}:`, error);
      // iOS 特定錯誤處理
    } else if (this.isAndroid) {
      console.error(`Android Error in ${context}:`, error);
      // Android 特定錯誤處理
    }
  }

  /**
   * 獲取平台特定性能配置
   */
  static getPerformanceConfig() {
    const baseConfig = {
      imageQuality: 0.8,
      maxImageSize: 10 * 1024 * 1024, // 10MB
      cacheDuration: 24 * 60 * 60 * 1000, // 24小時
    };

    if (this.isWeb) {
      return {
        ...baseConfig,
        imageQuality: 0.7, // Web 上降低圖片品質以提升載入速度
        maxImageSize: 5 * 1024 * 1024, // 5MB for web
        cacheDuration: 12 * 60 * 60 * 1000, // 12小時 for web
      };
    } else if (this.isIOS) {
      return {
        ...baseConfig,
        imageQuality: 0.9, // iOS 上使用高品質
        maxImageSize: 15 * 1024 * 1024, // 15MB for iOS
      };
    } else if (this.isAndroid) {
      return {
        ...baseConfig,
        imageQuality: 0.85, // Android 平衡品質和性能
        maxImageSize: 12 * 1024 * 1024, // 12MB for Android
      };
    }

    return baseConfig;
  }
}

export default PlatformUtils;
