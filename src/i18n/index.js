import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 匯入語言檔案
import zhTW from './locales/zh-TW.json';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

// 語言資源
const resources = {
  'zh-TW': {
    translation: zhTW,
  },
  'zh-CN': {
    translation: zhCN,
  },
  'en': {
    translation: en,
  },
  'ja': {
    translation: ja,
  },
};

// 支援的語言
const supportedLanguages = ['zh-TW', 'zh-CN', 'en', 'ja'];

// 取得裝置語言
const getDeviceLanguage = () => {
  const locales = RNLocalize.getLocales();
  const deviceLanguage = locales[0]?.languageTag;
  
  // 檢查是否支援該語言
  if (supportedLanguages.includes(deviceLanguage)) {
    return deviceLanguage;
  }
  
  // 檢查語言代碼（不含地區）
  const languageCode = deviceLanguage?.split('-')[0];
  if (languageCode === 'zh') {
    return 'zh-TW'; // 預設繁體中文
  }
  if (languageCode === 'ja') {
    return 'ja';
  }
  
  return 'en'; // 預設英文
};

// 初始化 i18n
const initI18n = async () => {
  try {
    // 嘗試從本地儲存讀取語言設定
    const savedLanguage = await AsyncStorage.getItem('language');
    const language = savedLanguage || getDeviceLanguage();
    
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: language,
        fallbackLng: 'en',
        debug: __DEV__,
        
        interpolation: {
          escapeValue: false, // React 已經處理 XSS
        },
        
        react: {
          useSuspense: false,
        },
        
        // 語言檢測
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      });
      
    // 儲存語言設定
    await AsyncStorage.setItem('language', language);
    
  } catch (error) {
    console.error('i18n initialization error:', error);
    // 使用預設設定
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
  }
};

// 切換語言
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem('language', language);
  } catch (error) {
    console.error('Language change error:', error);
  }
};

// 取得當前語言
export const getCurrentLanguage = () => {
  return i18n.language;
};

// 取得支援的語言列表
export const getSupportedLanguages = () => {
  return supportedLanguages;
};

// 語言名稱對應
export const LANGUAGE_NAMES = {
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  'en': 'English',
  'ja': '日本語',
};

export default i18n;
export { initI18n };
