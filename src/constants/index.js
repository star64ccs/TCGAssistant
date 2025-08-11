// 統一匯出所有常數
export * from './colors';
export * from './typography';

// 應用程式常數 - 已遷移到統一配置管理系統
// 請使用 src/config/unifiedConfig.js 中的配置

import {
  APP_CONFIG,
  LIMITS,
  IMAGE_CONFIG,
  SUPPORTED,
  SHARE_CONFIG,
} from '../config/unifiedConfig';

// 向後兼容的常數導出
export { APP_CONFIG, LIMITS, IMAGE_CONFIG, SUPPORTED, SHARE_CONFIG };

// 會員類型
export const MEMBERSHIP_TYPES = {
  FREE: 'free',
  VIP_TRIAL: 'vip_trial',
  VIP_PAID: 'vip_paid',
};

// 功能權限
export const FEATURES = {
  CARD_RECOGNITION: 'card_recognition',
  CENTERING_EVALUATION: 'centering_evaluation',
  AUTHENTICITY_CHECK: 'authenticity_check',
  PRICE_ANALYSIS: 'price_analysis',
  AI_PREDICTION: 'ai_prediction',
  ML_ANALYSIS: 'ml_analysis',
  INVESTMENT_ADVICE: 'investment_advice',
  COLLECTION_MANAGEMENT: 'collection_management',
  SHARE_LINK: 'share_link',
  QUERY_HISTORY: 'query_history',
  AI_CHATBOT: 'ai_chatbot',
};

// 會員功能對應
export const MEMBERSHIP_FEATURES = {
  [MEMBERSHIP_TYPES.FREE]: [
    FEATURES.CARD_RECOGNITION,
    FEATURES.CENTERING_EVALUATION,
    FEATURES.SHARE_LINK,
    FEATURES.QUERY_HISTORY,
  ],
  [MEMBERSHIP_TYPES.VIP_TRIAL]: [
    FEATURES.CARD_RECOGNITION,
    FEATURES.CENTERING_EVALUATION,
    FEATURES.SHARE_LINK,
    FEATURES.QUERY_HISTORY,
    FEATURES.AUTHENTICITY_CHECK,
    FEATURES.PRICE_ANALYSIS,
    FEATURES.AI_PREDICTION,
    FEATURES.COLLECTION_MANAGEMENT,
    FEATURES.AI_CHATBOT,
  ],
  [MEMBERSHIP_TYPES.VIP_PAID]: [
    FEATURES.CARD_RECOGNITION,
    FEATURES.CENTERING_EVALUATION,
    FEATURES.SHARE_LINK,
    FEATURES.QUERY_HISTORY,
    FEATURES.AUTHENTICITY_CHECK,
    FEATURES.PRICE_ANALYSIS,
    FEATURES.AI_PREDICTION,
    FEATURES.ML_ANALYSIS,
    FEATURES.INVESTMENT_ADVICE,
    FEATURES.COLLECTION_MANAGEMENT,
    FEATURES.AI_CHATBOT,
  ],
};

// 卡牌評分等級
export const CARD_GRADES = {
  MINT: 'Mint',
  NM: 'Near Mint',
  LP: 'Light Played',
  MP: 'Moderately Played',
  HP: 'Heavily Played',
};

// 價格趨勢
export const PRICE_TRENDS = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
};

// 風險評級
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
};

// 分析類型
export const ANALYSIS_TYPES = {
  CARD_RECOGNITION: 'card_recognition',
  CENTERING: 'centering',
  AUTHENTICITY: 'authenticity',
  PRICE: 'price',
};

// 平台來源
export const PRICE_SOURCES = {
  MERCARI: 'mercari',
  SNKRDUNK: 'snkrdunk',
  TCG_PLAYER: 'tcgplayer',
  EBAY: 'ebay',
  CARDMARKET: 'cardmarket',
  PRICE_CHARTING: 'pricecharting',
};

// 預測時間範圍
export const PREDICTION_PERIODS = {
  ONE_MONTH: '1m',
  THREE_MONTHS: '3m',
  SIX_MONTHS: '6m',
  ONE_YEAR: '1y',
  THREE_YEARS: '3y',
};

// 錯誤代碼
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_IMAGE: 'INVALID_IMAGE',
  RECOGNITION_FAILED: 'RECOGNITION_FAILED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// 成功代碼
export const SUCCESS_CODES = {
  CARD_RECOGNIZED: 'CARD_RECOGNIZED',
  CENTERING_EVALUATED: 'CENTERING_EVALUATED',
  AUTHENTICITY_CHECKED: 'AUTHENTICITY_CHECKED',
  PRICE_ANALYZED: 'PRICE_ANALYZED',
  COLLECTION_SAVED: 'COLLECTION_SAVED',
  SHARE_LINK_GENERATED: 'SHARE_LINK_GENERATED',
};

// 本地儲存鍵值
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
  MEMBERSHIP_INFO: 'membership_info',
  COLLECTION_DATA: 'collection_data',
  SEARCH_HISTORY: 'search_history',
  SETTINGS: 'settings',
  LANGUAGE: 'language',
  THEME: 'theme',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  DISCLAIMER_ACCEPTED: 'disclaimer_accepted',
  // 通知相關
  NOTIFICATION_HISTORY: 'notification_history',
  SCHEDULED_NOTIFICATIONS: 'scheduled_notifications',
  NOTIFICATION_STATS: 'notification_stats',
  // 反饋相關
  FEEDBACK_HISTORY: 'feedback_history',
  RATING_HISTORY: 'rating_history',
  OFFLINE_FEEDBACKS: 'offline_feedbacks',
  // 備份相關
  BACKUP_HISTORY: 'backup_history',
  SYNC_HISTORY: 'sync_history',
  BACKUP_CONFIG: 'backup_config',
};

// 導航路由
export const ROUTES = {
  // 認證相關
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',

  // 主要功能
  HOME: 'Home',
  CARD_RECOGNITION: 'CardRecognition',
  CENTERING_EVALUATION: 'CenteringEvaluation',
  AUTHENTICITY_CHECK: 'AuthenticityCheck',
  PRICE_PREDICTION: 'PricePrediction',
  ML_ANALYSIS: 'MLAnalysis',
  INVESTMENT_ADVICE: 'InvestmentAdvice',

  // 結果頁面
  RECOGNITION_RESULT: 'RecognitionResult',
  CENTERING_RESULT: 'CenteringResult',
  AUTHENTICITY_RESULT: 'AuthenticityResult',
  PRICE_RESULT: 'PriceResult',

  // 收藏與歷史
  COLLECTION: 'Collection',
  COLLECTION_FOLDER: 'CollectionFolder',
  SEARCH_HISTORY: 'SearchHistory',
  COLLECTION_DETAIL: 'CollectionDetail',

  // AI助手
  AI_CHATBOT: 'AIChatbot',

  // 會員相關
  MEMBERSHIP: 'Membership',
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  CHANGE_PASSWORD: 'ChangePassword',
  SETTINGS: 'Settings',

  // 第二階段功能
  PRICE_TRACKING: 'PriceTracking',
  TRADING_MARKET: 'TradingMarket',
  NOTIFICATION_CENTER: 'NotificationCenter',
  CARD_RATING: 'CardRating',
  TRADING_HISTORY: 'TradingHistory',
  ANALYTICS_DASHBOARD: 'AnalyticsDashboard',
  DATA_EXPANSION: 'DataExpansion',

  // 分享
  SHARE: 'Share',

  // 其他
  ABOUT: 'About',
  PRIVACY_POLICY: 'PrivacyPolicy',
  TERMS_OF_SERVICE: 'TermsOfService',
  SUPPORT: 'Support',
  DATABASE_CLEANUP: 'DatabaseCleanup',
};

// 免責聲明文字
export const DISCLAIMER_TEXT = {
  'zh-TW': `免責聲明

本應用程式所提供之卡牌辨識、價格分析、真偽判斷及相關AI預測僅供參考，並不構成任何投資建議或保證。所有資料來源於第三方平台，準確性及即時性可能因平台更新而有所變動。

使用者應自行判斷並承擔風險，本應用程式及其開發者不對任何因使用本程式所造成之損失負責。使用本程式即表示您已閱讀並同意本免責聲明。`,

  'zh-CN': `免责声明

本应用程序所提供的卡牌识别、价格分析、真伪判断及相关AI预测仅供参考，并不构成任何投资建议或保证。所有资料来源于第三方平台，准确性及即时性可能因平台更新而有所变动。

使用者应自行判断并承担风险，本应用程序及其开发者不对任何因使用本程序所造成的损失负责。使用本程序即表示您已阅读并同意本免责声明。`,

  'en': `Disclaimer

The card recognition, price analysis, authenticity verification, and related AI predictions provided by this application are for reference only and do not constitute any investment advice or guarantee. All data comes from third-party platforms, and accuracy and timeliness may vary due to platform updates.

Users should make their own judgments and bear the risks. This application and its developers are not responsible for any losses caused by using this program. Using this program indicates that you have read and agreed to this disclaimer.`,

  'ja': `免責事項

このアプリケーションが提供するカード認識、価格分析、真贋判定、および関連するAI予測は参考目的のみであり、投資助言や保証を構成するものではありません。すべてのデータは第三者プラットフォームから提供され、プラットフォームの更新により正確性と即時性が変動する可能性があります。

ユーザーは自己判断を行い、リスクを負担する必要があります。このアプリケーションとその開発者は、このプログラムの使用による損失について責任を負いません。このプログラムを使用することは、この免責事項を読み、同意したことを意味します。`,
};

export default {
  APP_CONFIG,
  MEMBERSHIP_TYPES,
  FEATURES,
  MEMBERSHIP_FEATURES,
  CARD_GRADES,
  PRICE_TRENDS,
  RISK_LEVELS,
  ANALYSIS_TYPES,
  PRICE_SOURCES,
  PREDICTION_PERIODS,
  ERROR_CODES,
  SUCCESS_CODES,
  STORAGE_KEYS,
  ROUTES,
  DISCLAIMER_TEXT,
};
