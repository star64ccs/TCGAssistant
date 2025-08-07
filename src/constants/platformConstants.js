import { Platform, Dimensions } from 'react-native';

/**
 * 平台特定常數配置
 */
export const PLATFORM_CONSTANTS = {
  // 平台識別
  PLATFORM: {
    IOS: 'ios',
    ANDROID: 'android',
    WEB: 'web',
    CURRENT: Platform.OS,
  },

  // 設備類型
  DEVICE_TYPE: {
    PHONE: 'phone',
    TABLET: 'tablet',
    DESKTOP: 'desktop',
  },

  // 安全區域配置
  SAFE_AREA: {
    IOS: {
      TOP: 44,
      BOTTOM: 34,
      LEFT: 0,
      RIGHT: 0,
    },
    ANDROID: {
      TOP: 24,
      BOTTOM: 0,
      LEFT: 0,
      RIGHT: 0,
    },
    WEB: {
      TOP: 0,
      BOTTOM: 0,
      LEFT: 0,
      RIGHT: 0,
    },
  },

  // 字體配置
  FONTS: {
    IOS: {
      REGULAR: 'System',
      MEDIUM: 'System',
      BOLD: 'System',
      LIGHT: 'System',
      MONOSPACE: 'Courier',
    },
    ANDROID: {
      REGULAR: 'Roboto',
      MEDIUM: 'Roboto',
      BOLD: 'Roboto',
      LIGHT: 'Roboto',
      MONOSPACE: 'monospace',
    },
    WEB: {
      REGULAR: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      MEDIUM: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      BOLD: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      LIGHT: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      MONOSPACE: 'Consolas, Monaco, "Courier New", monospace',
    },
  },

  // 性能配置
  PERFORMANCE: {
    IOS: {
      IMAGE_QUALITY: 0.9,
      MAX_IMAGE_SIZE: 15 * 1024 * 1024, // 15MB
      CACHE_DURATION: 24 * 60 * 60 * 1000, // 24小時
      ANIMATION_DURATION: 300,
    },
    ANDROID: {
      IMAGE_QUALITY: 0.85,
      MAX_IMAGE_SIZE: 12 * 1024 * 1024, // 12MB
      CACHE_DURATION: 24 * 60 * 60 * 1000, // 24小時
      ANIMATION_DURATION: 300,
    },
    WEB: {
      IMAGE_QUALITY: 0.7,
      MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
      CACHE_DURATION: 12 * 60 * 60 * 1000, // 12小時
      ANIMATION_DURATION: 250,
    },
  },

  // API 配置
  API: {
    TIMEOUT: {
      IOS: 30000,
      ANDROID: 30000,
      WEB: 20000,
    },
    RETRY_ATTEMPTS: {
      IOS: 3,
      ANDROID: 3,
      WEB: 2,
    },
    CACHE_DURATION: {
      IOS: 5 * 60 * 1000, // 5分鐘
      ANDROID: 5 * 60 * 1000, // 5分鐘
      WEB: 3 * 60 * 1000, // 3分鐘
    },
  },

  // UI 配置
  UI: {
    BORDER_RADIUS: {
      IOS: 8,
      ANDROID: 4,
      WEB: 6,
    },
    SHADOW: {
      IOS: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      ANDROID: {
        elevation: 4,
      },
      WEB: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
    SPACING: {
      IOS: {
        XS: 4,
        SM: 8,
        MD: 16,
        LG: 24,
        XL: 32,
      },
      ANDROID: {
        XS: 4,
        SM: 8,
        MD: 16,
        LG: 24,
        XL: 32,
      },
      WEB: {
        XS: 4,
        SM: 8,
        MD: 16,
        LG: 24,
        XL: 32,
      },
    },
  },

  // 功能支援
  FEATURES: {
    CAMERA: !Platform.OS === 'web',
    BIOMETRICS: Platform.OS === 'ios' || Platform.OS === 'android',
    PUSH_NOTIFICATIONS: Platform.OS === 'ios' || Platform.OS === 'android',
    FILE_SYSTEM: Platform.OS !== 'web',
    SHARE: Platform.OS === 'ios' || Platform.OS === 'android',
    HAPTIC_FEEDBACK: Platform.OS === 'ios' || Platform.OS === 'android',
    BACKGROUND_PROCESSING: Platform.OS !== 'web',
    LOCAL_STORAGE: true,
    INDEXED_DB: Platform.OS === 'web',
  },

  // 錯誤處理配置
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TIMEOUT: 10000,
    SHOW_ERROR_DIALOG: Platform.OS !== 'web',
    LOG_TO_CONSOLE: true,
    LOG_TO_SERVICE: Platform.OS !== 'web',
  },

  // 測試配置
  TESTING: {
    ENABLED: __DEV__,
    MOCK_DELAY: 2000,
    ENABLE_LOGGING: __DEV__,
    ENABLE_PERFORMANCE_MONITORING: __DEV__,
  },
};

/**
 * 獲取當前平台的配置
 * @param {string} configKey - 配置鍵
 * @returns {any} 平台特定配置
 */
export const getPlatformConfig = (configKey) => {
  const config = PLATFORM_CONSTANTS[configKey];
  if (!config) {
    console.warn(`配置鍵 "${configKey}" 不存在`);
    return null;
  }

  const platformConfig = config[Platform.OS.toUpperCase()];
  if (platformConfig) {
    return platformConfig;
  }

  // 如果沒有平台特定配置，返回第一個可用的配置
  const availableConfigs = Object.values(config);
  return availableConfigs[0] || null;
};

/**
 * 檢查功能是否支援
 * @param {string} feature - 功能名稱
 * @returns {boolean} 是否支援
 */
export const isFeatureSupported = (feature) => {
  return PLATFORM_CONSTANTS.FEATURES[feature] || false;
};

/**
 * 獲取設備類型
 * @returns {string} 設備類型
 */
export const getDeviceType = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;

  if (Platform.OS === 'web') {
    if (width >= 1200) return PLATFORM_CONSTANTS.DEVICE_TYPE.DESKTOP;
    if (width >= 768) return PLATFORM_CONSTANTS.DEVICE_TYPE.TABLET;
    return PLATFORM_CONSTANTS.DEVICE_TYPE.PHONE;
  } else {
    if (aspectRatio <= 1.6) return PLATFORM_CONSTANTS.DEVICE_TYPE.TABLET;
    return PLATFORM_CONSTANTS.DEVICE_TYPE.PHONE;
  }
};

/**
 * 獲取平台特定樣式
 * @param {Object} styles - 樣式對象
 * @returns {Object} 平台特定樣式
 */
export const getPlatformStyles = (styles) => {
  const { ios, android, web, ...commonStyles } = styles;
  
  let platformStyles = {};
  
  if (Platform.OS === 'ios' && ios) {
    platformStyles = { ...platformStyles, ...ios };
  } else if (Platform.OS === 'android' && android) {
    platformStyles = { ...platformStyles, ...android };
  } else if (Platform.OS === 'web' && web) {
    platformStyles = { ...platformStyles, ...web };
  }
  
  return { ...commonStyles, ...platformStyles };
};

export default PLATFORM_CONSTANTS;
