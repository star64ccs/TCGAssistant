import configManager, {
  getApiConfig,
  getApiBaseUrl,
  getApiTimeout,
  getAiConfig,
  getThirdPartyConfig,
  getSocialAuthConfig,
  isFeatureEnabled,
  getStorageKey,
  getEndpoint,
  validateConfig,
  getConfigSummary,
  STORAGE_KEYS,
  APP_CONFIG,
  API_ENDPOINTS,
  MEMBERSHIP_TYPES,
  LIMITS,
  IMAGE_CONFIG,
  SUPPORTED,
  SHARE_CONFIG,
} from './unifiedConfig.js';

// 配置測試類
class ConfigTest {
  constructor() {
    this.testResults = [];
  }

  // 執行所有測試
  async runAllTests() {
    console.log('🧪 開始配置管理系統測試...\n');

    this.testBasicConfig();
    this.testApiConfig();
    this.testAiConfig();
    this.testThirdPartyConfig();
    this.testSocialAuthConfig();
    this.testFeatureFlags();
    this.testUtilityFunctions();
    this.testConstants();
    this.testValidation();

    await this.testAsyncStorage();

    this.printResults();
  }

  // 測試基本配置
  testBasicConfig() {
    console.log('📋 測試基本配置...');

    try {
      const config = configManager.config;

      // 檢查應用程式配置
      if (config.APP.NAME === 'TCG助手') {
        this.addResult('✅ 應用程式名稱配置正確');
      } else {
        this.addResult('❌ 應用程式名稱配置錯誤');
      }

      // 檢查環境配置
      if (config.APP.ENVIRONMENT) {
        this.addResult('✅ 環境配置正確');
      } else {
        this.addResult('❌ 環境配置錯誤');
      }

      // 檢查存儲鍵值
      if (config.STORAGE_KEYS.USER_TOKEN === 'user_token') {
        this.addResult('✅ 存儲鍵值配置正確');
      } else {
        this.addResult('❌ 存儲鍵值配置錯誤');
      }
    } catch (error) {
      this.addResult(`❌ 基本配置測試失敗: ${error.message}`);
    }
  }

  // 測試 API 配置
  testApiConfig() {
    console.log('🌐 測試 API 配置...');

    try {
      const apiConfig = getApiConfig();
      const baseUrl = getApiBaseUrl();
      const timeout = getApiTimeout();

      if (apiConfig && apiConfig.baseUrl) {
        this.addResult('✅ API 配置獲取成功');
      } else {
        this.addResult('❌ API 配置獲取失敗');
      }

      if (baseUrl && typeof baseUrl === 'string') {
        this.addResult('✅ API 基礎 URL 獲取成功');
      } else {
        this.addResult('❌ API 基礎 URL 獲取失敗');
      }

      if (timeout && typeof timeout === 'number') {
        this.addResult('✅ API 超時時間獲取成功');
      } else {
        this.addResult('❌ API 超時時間獲取失敗');
      }
    } catch (error) {
      this.addResult(`❌ API 配置測試失敗: ${error.message}`);
    }
  }

  // 測試 AI 配置
  testAiConfig() {
    console.log('🤖 測試 AI 配置...');

    try {
      const openaiConfig = getAiConfig('OPENAI');
      const googlePalmConfig = getAiConfig('GOOGLE_PALM');
      const azureConfig = getAiConfig('AZURE_OPENAI');

      if (openaiConfig && openaiConfig.endpoint) {
        this.addResult('✅ OpenAI 配置獲取成功');
      } else {
        this.addResult('❌ OpenAI 配置獲取失敗');
      }

      if (googlePalmConfig && googlePalmConfig.endpoint) {
        this.addResult('✅ Google PaLM 配置獲取成功');
      } else {
        this.addResult('❌ Google PaLM 配置獲取失敗');
      }

      if (azureConfig && azureConfig.endpoint) {
        this.addResult('✅ Azure OpenAI 配置獲取成功');
      } else {
        this.addResult('❌ Azure OpenAI 配置獲取失敗');
      }
    } catch (error) {
      this.addResult(`❌ AI 配置測試失敗: ${error.message}`);
    }
  }

  // 測試第三方 API 配置
  testThirdPartyConfig() {
    console.log('🔗 測試第三方 API 配置...');

    try {
      const tcgplayerConfig = getThirdPartyConfig('TCGPLAYER');
      const ebayConfig = getThirdPartyConfig('EBAY');
      const cardmarketConfig = getThirdPartyConfig('CARDMARKET');

      if (tcgplayerConfig) {
        this.addResult('✅ TCGPlayer 配置獲取成功');
      } else {
        this.addResult('❌ TCGPlayer 配置獲取失敗');
      }

      if (ebayConfig) {
        this.addResult('✅ eBay 配置獲取成功');
      } else {
        this.addResult('❌ eBay 配置獲取失敗');
      }

      if (cardmarketConfig) {
        this.addResult('✅ Cardmarket 配置獲取成功');
      } else {
        this.addResult('❌ Cardmarket 配置獲取失敗');
      }
    } catch (error) {
      this.addResult(`❌ 第三方 API 配置測試失敗: ${error.message}`);
    }
  }

  // 測試社交登入配置
  testSocialAuthConfig() {
    console.log('🔐 測試社交登入配置...');

    try {
      const googleConfig = getSocialAuthConfig('GOOGLE');
      const facebookConfig = getSocialAuthConfig('FACEBOOK');
      const appleConfig = getSocialAuthConfig('APPLE');

      if (googleConfig && googleConfig.clientId) {
        this.addResult('✅ Google 社交登入配置獲取成功');
      } else {
        this.addResult('❌ Google 社交登入配置獲取失敗');
      }

      if (facebookConfig && facebookConfig.appId) {
        this.addResult('✅ Facebook 社交登入配置獲取成功');
      } else {
        this.addResult('❌ Facebook 社交登入配置獲取失敗');
      }

      if (appleConfig && appleConfig.clientId) {
        this.addResult('✅ Apple 社交登入配置獲取成功');
      } else {
        this.addResult('❌ Apple 社交登入配置獲取失敗');
      }
    } catch (error) {
      this.addResult(`❌ 社交登入配置測試失敗: ${error.message}`);
    }
  }

  // 測試功能開關
  testFeatureFlags() {
    console.log('🚀 測試功能開關...');

    try {
      const aiChatEnabled = isFeatureEnabled('AI_CHAT');
      const cardRecognitionEnabled = isFeatureEnabled('CARD_RECOGNITION');
      const authenticityCheckEnabled = isFeatureEnabled('AUTHENTICITY_CHECK');

      if (typeof aiChatEnabled === 'boolean') {
        this.addResult('✅ AI 聊天功能開關測試成功');
      } else {
        this.addResult('❌ AI 聊天功能開關測試失敗');
      }

      if (typeof cardRecognitionEnabled === 'boolean') {
        this.addResult('✅ 卡牌識別功能開關測試成功');
      } else {
        this.addResult('❌ 卡牌識別功能開關測試失敗');
      }

      if (typeof authenticityCheckEnabled === 'boolean') {
        this.addResult('✅ 真偽檢查功能開關測試成功');
      } else {
        this.addResult('❌ 真偽檢查功能開關測試失敗');
      }
    } catch (error) {
      this.addResult(`❌ 功能開關測試失敗: ${error.message}`);
    }
  }

  // 測試工具函數
  testUtilityFunctions() {
    console.log('🔧 測試工具函數...');

    try {
      const storageKey = getStorageKey('USER_TOKEN');
      const endpoint = getEndpoint('AUTH');
      const membershipType = configManager.getMembershipType('FREE');
      const limit = LIMITS.FREE_DAILY_LIMIT;
      const imageConfig = IMAGE_CONFIG.QUALITY;

      if (storageKey === 'user_token') {
        this.addResult('✅ 存儲鍵值獲取成功');
      } else {
        this.addResult('❌ 存儲鍵值獲取失敗');
      }

      if (endpoint === '/auth') {
        this.addResult('✅ API 端點獲取成功');
      } else {
        this.addResult('❌ API 端點獲取失敗');
      }

      if (membershipType === 'free') {
        this.addResult('✅ 會員類型獲取成功');
      } else {
        this.addResult('❌ 會員類型獲取失敗');
      }

      if (limit === 5) {
        this.addResult('✅ 限制配置獲取成功');
      } else {
        this.addResult('❌ 限制配置獲取失敗');
      }

      if (imageConfig === 0.8) {
        this.addResult('✅ 圖片配置獲取成功');
      } else {
        this.addResult('❌ 圖片配置獲取失敗');
      }
    } catch (error) {
      this.addResult(`❌ 工具函數測試失敗: ${error.message}`);
    }
  }

  // 測試常數
  testConstants() {
    console.log('📊 測試常數...');

    try {
      if (STORAGE_KEYS.USER_TOKEN === 'user_token') {
        this.addResult('✅ STORAGE_KEYS 常數正確');
      } else {
        this.addResult('❌ STORAGE_KEYS 常數錯誤');
      }

      if (APP_CONFIG.NAME === 'TCG助手') {
        this.addResult('✅ APP_CONFIG 常數正確');
      } else {
        this.addResult('❌ APP_CONFIG 常數錯誤');
      }

      if (API_ENDPOINTS.AUTH === '/auth') {
        this.addResult('✅ API_ENDPOINTS 常數正確');
      } else {
        this.addResult('❌ API_ENDPOINTS 常數錯誤');
      }

      if (MEMBERSHIP_TYPES.FREE === 'free') {
        this.addResult('✅ MEMBERSHIP_TYPES 常數正確');
      } else {
        this.addResult('❌ MEMBERSHIP_TYPES 常數錯誤');
      }

      if (LIMITS.FREE_DAILY_LIMIT === 5) {
        this.addResult('✅ LIMITS 常數正確');
      } else {
        this.addResult('❌ LIMITS 常數錯誤');
      }

      if (IMAGE_CONFIG.QUALITY === 0.8) {
        this.addResult('✅ IMAGE_CONFIG 常數正確');
      } else {
        this.addResult('❌ IMAGE_CONFIG 常數錯誤');
      }

      if (SUPPORTED.GAMES.includes('pokemon')) {
        this.addResult('✅ SUPPORTED 常數正確');
      } else {
        this.addResult('❌ SUPPORTED 常數錯誤');
      }

      if (SHARE_CONFIG.BASE_URL === 'https://tcgassistant.com/share') {
        this.addResult('✅ SHARE_CONFIG 常數正確');
      } else {
        this.addResult('❌ SHARE_CONFIG 常數錯誤');
      }
    } catch (error) {
      this.addResult(`❌ 常數測試失敗: ${error.message}`);
    }
  }

  // 測試驗證
  testValidation() {
    console.log('✅ 測試配置驗證...');

    try {
      const validation = validateConfig();
      const summary = getConfigSummary();

      if (validation && typeof validation.isValid === 'boolean') {
        this.addResult('✅ 配置驗證功能正常');
      } else {
        this.addResult('❌ 配置驗證功能異常');
      }

      if (summary && summary.environment) {
        this.addResult('✅ 配置摘要功能正常');
      } else {
        this.addResult('❌ 配置摘要功能異常');
      }

      console.log('📋 配置摘要:', summary);
    } catch (error) {
      this.addResult(`❌ 配置驗證測試失敗: ${error.message}`);
    }
  }

  // 測試 AsyncStorage
  async testAsyncStorage() {
    console.log('💾 測試 AsyncStorage...');

    try {
      // 測試配置載入
      await configManager.loadFromStorage();
      this.addResult('✅ 配置載入功能正常');

      // 測試配置儲存
      await configManager.saveToStorage();
      this.addResult('✅ 配置儲存功能正常');

      // 測試配置更新
      await configManager.updateConfig({ test: 'value' });
      this.addResult('✅ 配置更新功能正常');

      // 測試配置重置
      await configManager.resetConfig();
      this.addResult('✅ 配置重置功能正常');
    } catch (error) {
      this.addResult(`❌ AsyncStorage 測試失敗: ${error.message}`);
    }
  }

  // 添加測試結果
  addResult(result) {
    this.testResults.push(result);
  }

  // 打印測試結果
  printResults() {
    console.log('\n📊 配置管理系統測試結果:');
    console.log('=' .repeat(50));

    const passed = this.testResults.filter(result => result.startsWith('✅')).length;
    const failed = this.testResults.filter(result => result.startsWith('❌')).length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      console.log(result);
    });

    console.log(`\n${ '=' .repeat(50)}`);
    console.log(`📈 總計: ${total} 項測試`);
    console.log(`✅ 通過: ${passed} 項`);
    console.log(`❌ 失敗: ${failed} 項`);
    console.log(`📊 成功率: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n🎉 所有配置測試通過！統一配置管理系統運行正常。');
    } else {
      console.log('\n⚠️  部分配置測試失敗，請檢查相關配置。');
    }
  }
}

// 創建測試實例並執行
const configTest = new ConfigTest();

// 導出測試函數
export const runConfigTest = () => {
  return configTest.runAllTests();
};

// 如果直接執行此文件，則運行測試
if (typeof window !== 'undefined') {
  // 在瀏覽器環境中
  window.runConfigTest = runConfigTest;
} else {
  // 在 Node.js 環境中
  runConfigTest();
}

export default configTest;
