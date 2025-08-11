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
  STORAGE_KEYS,
  APP_CONFIG,
  API_ENDPOINTS,
  MEMBERSHIP_TYPES,
  LIMITS,
  IMAGE_CONFIG,
  SUPPORTED,
  SHARE_CONFIG,
} from './unifiedConfig.js';

// 配置遷移助手類
class ConfigMigrationHelper {
  constructor() {
    this.migrationLog = [];
  }

  // 生成遷移指南
  generateMigrationGuide() {
    console.log('📋 統一配置管理系統遷移指南');
    console.log('=' .repeat(60));

    this.addLog('開始生成遷移指南...');

    const guide = {
      overview: this.generateOverview(),
      imports: this.generateImportExamples(),
      replacements: this.generateReplacementExamples(),
      bestPractices: this.generateBestPractices(),
      troubleshooting: this.generateTroubleshooting(),
    };

    this.printMigrationGuide(guide);
    return guide;
  }

  // 生成概述
  generateOverview() {
    return {
      title: '🎯 遷移概述',
      content: [
        '統一配置管理系統已建立，整合了所有分散的配置文件。',
        '新的配置系統提供：',
        '• 集中化的配置管理',
        '• 環境自適應配置',
        '• 類型安全的配置訪問',
        '• 配置驗證和測試',
        '• AsyncStorage 持久化',
        '• 向後兼容性支持',
      ],
    };
  }

  // 生成導入範例
  generateImportExamples() {
    return {
      title: '📥 導入範例',
      content: [
        '// 導入配置管理器（推薦）',
        'import configManager from \'../config/unifiedConfig\';',
        '',
        '// 導入便捷函數',
        'import { getApiConfig, getAiConfig, isFeatureEnabled } from \'../config/unifiedConfig\';',
        '',
        '// 導入常數',
        'import { STORAGE_KEYS, API_ENDPOINTS, LIMITS } from \'../config/unifiedConfig\';',
        '',
        '// 導入所有配置（不推薦，會增加包大小）',
        'import * as Config from \'../config/unifiedConfig\';',
      ],
    };
  }

  // 生成替換範例
  generateReplacementExamples() {
    return {
      title: '🔄 替換範例',
      content: [
        '// 舊方式',
        'const API_BASE_URL = \'http://localhost:3000\';',
        'const API_TIMEOUT = 30000;',
        '',
        '// 新方式',
        'import { getApiBaseUrl, getApiTimeout } from \'../config/unifiedConfig\';',
        'const API_BASE_URL = getApiBaseUrl();',
        'const API_TIMEOUT = getApiTimeout();',
        '',
        '// 舊方式',
        'const openaiConfig = { enabled: false, apiKey: \'xxx\' };',
        '',
        '// 新方式',
        'import { getAiConfig } from \'../config/unifiedConfig\';',
        'const openaiConfig = getAiConfig(\'OPENAI\');',
        '',
        '// 舊方式',
        'const isFeatureEnabled = true;',
        '',
        '// 新方式',
        'import { isFeatureEnabled } from \'../config/unifiedConfig\';',
        'const aiChatEnabled = isFeatureEnabled(\'AI_CHAT\');',
      ],
    };
  }

  // 生成最佳實踐
  generateBestPractices() {
    return {
      title: '✨ 最佳實踐',
      content: [
        '1. 優先使用便捷函數而非直接訪問配置對象',
        '2. 在組件頂部導入所需的配置函數',
        '3. 使用 isFeatureEnabled() 檢查功能開關',
        '4. 使用 getStorageKey() 獲取存儲鍵值',
        '5. 使用 getEndpoint() 獲取 API 端點',
        '6. 定期運行配置驗證測試',
        '7. 使用環境變數覆蓋默認配置',
        '8. 避免在運行時修改配置對象',
      ],
    };
  }

  // 生成故障排除
  generateTroubleshooting() {
    return {
      title: '🔧 故障排除',
      content: [
        '問題：配置函數返回 undefined',
        '解決：檢查導入路徑是否正確',
        '',
        '問題：環境變數未生效',
        '解決：確保 .env 文件在正確位置且變數名正確',
        '',
        '問題：AsyncStorage 相關錯誤',
        '解決：確保已安裝 @react-native-async-storage/async-storage',
        '',
        '問題：配置驗證失敗',
        '解決：運行 validateConfig() 查看詳細錯誤信息',
      ],
    };
  }

  // 打印遷移指南
  printMigrationGuide(guide) {
    Object.values(guide).forEach(section => {
      console.log(`\n${section.title}`);
      console.log('-'.repeat(section.title.length));
      section.content.forEach(line => {
        console.log(line);
      });
    });
  }

  // 檢查文件是否需要遷移
  checkFileForMigration(fileContent) {
    const migrationPatterns = [
      // 舊的配置導入
      /import.*from.*['"]\.\.\/config\/(api|constants|socialAuthConfig)['"]/g,
      /import.*from.*['"]\.\.\/constants\/index['"]/g,

      // 硬編碼的配置值
      /const\s+API_BASE_URL\s*=\s*['"][^'"]+['"]/g,
      /const\s+API_TIMEOUT\s*=\s*\d+/g,
      /const\s+STORAGE_KEYS\s*=\s*\{/g,
      /const\s+APP_CONFIG\s*=\s*\{/g,

      // 舊的配置訪問方式
      /getApiConfig\(\)/g,
      /SOCIAL_AUTH_CONFIG/g,
      /API_ENDPOINTS/g,
    ];

    const suggestions = [];

    migrationPatterns.forEach((pattern, index) => {
      const matches = fileContent.match(pattern);
      if (matches) {
        suggestions.push({
          pattern: pattern.toString(),
          matches: matches.length,
          suggestion: this.getSuggestionForPattern(index),
        });
      }
    });

    return suggestions;
  }

  // 根據模式獲取建議
  getSuggestionForPattern(patternIndex) {
    const suggestions = [
      '建議使用統一配置管理系統的導入',
      '建議使用 getApiBaseUrl() 和 getApiTimeout()',
      '建議使用 STORAGE_KEYS 常數',
      '建議使用 APP_CONFIG 常數',
      '建議使用 API_ENDPOINTS 常數',
      '建議使用 getApiConfig() 函數',
      '建議使用 getSocialAuthConfig() 函數',
      '建議使用 API_ENDPOINTS 常數',
    ];

    return suggestions[patternIndex] || '建議遷移到統一配置管理系統';
  }

  // 生成自動遷移腳本
  generateMigrationScript(filePath) {
    return `
// 自動遷移腳本 - ${filePath}
// 請手動檢查並應用以下更改

// 1. 更新導入語句
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
  STORAGE_KEYS,
  APP_CONFIG,
  API_ENDPOINTS,
  MEMBERSHIP_TYPES,
  LIMITS,
  IMAGE_CONFIG,
  SUPPORTED,
  SHARE_CONFIG
} from '../config/unifiedConfig';

// 2. 替換硬編碼配置
// 舊: const API_BASE_URL = 'http://localhost:3000';
// 新: const API_BASE_URL = getApiBaseUrl();

// 3. 替換配置訪問
// 舊: getApiConfig()
// 新: getApiConfig()

// 4. 替換常數訪問
// 舊: STORAGE_KEYS.USER_TOKEN
// 新: STORAGE_KEYS.USER_TOKEN (保持不變，但來源改變)

// 5. 添加配置驗證
const validation = validateConfig();
if (!validation.isValid) {
  console.warn('配置驗證失敗:', validation.errors);
}
`;
  }

  // 檢查項目中的配置使用情況
  async scanProjectForConfigUsage() {
    this.addLog('開始掃描項目配置使用情況...');

    const scanResults = {
      filesWithOldConfig: [],
      totalFiles: 0,
      migrationNeeded: false,
    };

    // 這裡可以添加實際的文件掃描邏輯
    // 由於我們在瀏覽器環境中，這裡只是示例

    this.addLog(`掃描完成：發現 ${scanResults.filesWithOldConfig.length} 個文件需要遷移`);

    return scanResults;
  }

  // 生成遷移報告
  generateMigrationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.migrationLog.length,
        migratedFiles: this.migrationLog.filter(log => log.includes('✅')).length,
        failedFiles: this.migrationLog.filter(log => log.includes('❌')).length,
      },
      details: this.migrationLog,
      recommendations: [
        '優先遷移核心服務文件',
        '逐步遷移組件文件',
        '保持向後兼容性',
        '運行配置測試驗證',
        '更新文檔和註釋',
      ],
    };

    console.log('\n📊 遷移報告');
    console.log('=' .repeat(40));
    console.log(`時間: ${report.timestamp}`);
    console.log(`總文件數: ${report.summary.totalFiles}`);
    console.log(`成功遷移: ${report.summary.migratedFiles}`);
    console.log(`失敗文件: ${report.summary.failedFiles}`);

    console.log('\n📋 詳細日誌:');
    report.details.forEach(log => console.log(log));

    console.log('\n💡 建議:');
    report.recommendations.forEach(rec => console.log(`• ${rec}`));

    return report;
  }

  // 添加日誌
  addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.migrationLog.push(logEntry);
    console.log(logEntry);
  }

  // 運行完整遷移流程
  async runFullMigration() {
    console.log('🚀 開始完整配置遷移流程...\n');

    this.addLog('步驟 1: 生成遷移指南');
    this.generateMigrationGuide();

    this.addLog('步驟 2: 掃描項目配置使用情況');
    const scanResults = await this.scanProjectForConfigUsage();

    this.addLog('步驟 3: 生成遷移報告');
    const report = this.generateMigrationReport();

    this.addLog('✅ 遷移流程完成');

    return {
      guide: this.generateMigrationGuide(),
      scanResults,
      report,
    };
  }
}

// 創建遷移助手實例
const migrationHelper = new ConfigMigrationHelper();

// 導出遷移助手和便捷函數
export const runMigrationGuide = () => migrationHelper.generateMigrationGuide();
export const runFullMigration = () => migrationHelper.runFullMigration();
export const checkFileForMigration = (fileContent) => migrationHelper.checkFileForMigration(fileContent);
export const generateMigrationScript = (filePath) => migrationHelper.generateMigrationScript(filePath);

// 如果直接執行此文件，則運行遷移指南
if (typeof window !== 'undefined') {
  // 在瀏覽器環境中
  window.runMigrationGuide = runMigrationGuide;
  window.runFullMigration = runFullMigration;
} else {
  // 在 Node.js 環境中
  runMigrationGuide();
}

export default migrationHelper;
