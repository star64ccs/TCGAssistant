// 導入必要的模組
import { getCloudAIService } from './cloudAIService';

/**
 * 真偽判斷服務 (雲端 AI 版本)
 * 使用雲端 AI 服務進行卡牌真偽判斷，替代本地模型
 */

class AuthenticityService {
  constructor() {
    this.cloudAI = getCloudAIService();
    this.cache = new Map();
    this.isInitialized = false;
    this.config = {
      confidenceThreshold: 0.7,
      cacheExpiry: 24 * 60 * 60 * 1000, // 24小時
      maxCacheSize: 500,
    };
  }

  /**
   * 初始化服務
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }
    try {
      console.info('🔍 初始化雲端真偽判斷服務...');
      this.isInitialized = true;
      console.info('✅ 雲端真偽判斷服務初始化完成');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 檢查真偽 (使用雲端 AI)
   */
  async checkAuthenticity(imageFile, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    const startTime = Date.now();
    try {
      console.info('🔍 使用雲端 AI 進行真偽判斷...');
      // 調用雲端 AI 服務
      const result = await this.cloudAI.checkAuthenticity(imageFile, options);
      // 轉換為兼容格式
      const compatibleResult = this.formatResult(result);
      console.info('✅ 雲端真偽判斷完成');
      return {
        ...compatibleResult,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        isAuthentic: null,
        confidence: 0,
        details: '服務暫時不可用',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 批量真偽檢查
   */
  async checkMultipleAuthenticity(imageFiles, options = {}) {
    const results = [];
    const { concurrent = 3, enableProgress = true } = options;
    console.info(`🔍 開始批量真偽判斷 ${imageFiles.length} 張卡牌...`);
    for (let i = 0; i < imageFiles.length; i += concurrent) {
      const batch = imageFiles.slice(i, i + concurrent);
      const batchPromises = batch.map(imageFile =>
        this.checkAuthenticity(imageFile, options),
      );
      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason.message,
            index: i + index,
          });
        }
      });
      if (enableProgress) {
        const progress = ((i + concurrent) / imageFiles.length * 100).toFixed(1);
        console.info(`📈 批量真偽判斷進度: ${progress}%`);
      }
      // API 限制延遲
      if (i + concurrent < imageFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    console.info(`✅ 批量真偽判斷完成: ${results.length} 張卡牌`);
    return {
      results,
      summary: this.generateSummary(results),
      total: imageFiles.length,
      successful: results.filter(r => r.success).length,
    };
  }

  /**
   * 格式化結果為兼容格式
   */
  formatResult(cloudResult) {
    return {
      success: cloudResult.success,
      isAuthentic: cloudResult.isAuthentic,
      confidence: cloudResult.confidence || 0,
      details: cloudResult.details || '無詳細分析',
      riskFactors: cloudResult.riskFactors || [],
      recommendations: cloudResult.recommendations || [],
      analysisMethod: 'cloud_ai',
      cached: cloudResult.cached || false,
    };
  }

  /**
   * 生成批量處理摘要
   */
  generateSummary(results) {
    const successful = results.filter(r => r.success);
    const authentic = successful.filter(r => r.isAuthentic === true);
    const fake = successful.filter(r => r.isAuthentic === false);
    const uncertain = successful.filter(r => r.isAuthentic === null);
    return {
      total: results.length,
      successful: successful.length,
      failed: results.length - successful.length,
      authentic: authentic.length,
      fake: fake.length,
      uncertain: uncertain.length,
      successRate: `${(successful.length / results.length * 100).toFixed(2) }%`,
      averageConfidence: successful.length > 0 ?
        (successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length).toFixed(3) : 0,
    };
  }

  /**
   * 獲取服務狀態
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      serviceType: 'cloud_ai',
      cloudAIStats: this.cloudAI.getStatistics(),
      config: this.config,
    };
  }

  /**
   * 清理資源
   */
  dispose() {
    this.cache.clear();
    this.isInitialized = false;
    console.info('🧹 真偽判斷服務資源已清理');
  }
}

// 單例模式
let authenticityServiceInstance = null;

export const getAuthenticityService = () => {
  if (!authenticityServiceInstance) {
    authenticityServiceInstance = new AuthenticityService();
  }
  return authenticityServiceInstance;
};

export { AuthenticityService };
export default AuthenticityService;
