// 導入必要的模組
import { getCloudAIService } from './cloudAIService';

/**
 * 卡牌辨識服務 (雲端 AI 版本)
 * 使用雲端 AI 服務進行卡牌辨識，替代本地 TensorFlow.js 模型
 */

class CardRecognitionService {
  constructor() {
    this.cloudAI = getCloudAIService();
    this.isInitialized = false;
    // 卡牌類別映射
    this.cardCategories = {
      0: 'Pokemon',
      1: 'Magic: The Gathering',
      2: 'One Piece',
      3: 'Yu-Gi-Oh!',
      4: 'Dragon Ball Super',
      5: 'Digimon',
      6: 'Cardfight!! Vanguard',
      7: 'Weiss Schwarz',
      8: 'Unknown/Other',
    };
    // 稀有度映射
    this.rarityLevels = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Super Rare': 4,
      'Ultra Rare': 5,
      'Secret Rare': 6,
      'Legendary': 7,
    };
    this.config = {
      confidenceThreshold: 0.6,
      maxRecognitionTime: 3000, // 3秒
      enableCache: true,
      batchSize: 4,
      imageSize: 224,
    };
  }

  /**
   * 初始化卡牌辨識服務
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }
    try {
      console.info('🃏 初始化雲端卡牌辨識服務...');
      // 雲端 AI 服務無需預載入模型，直接標記為已初始化
      this.isInitialized = true;
      console.info('✅ 雲端卡牌辨識服務初始化完成');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 辨識卡牌 (使用雲端 AI)
   */
  async recognizeCard(imageData, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    const startTime = performance.now();
    try {
      console.info('🔄 使用雲端 AI 進行卡牌辨識...');
      // 調用雲端 AI 服務
      const result = await this.cloudAI.recognizeCard(imageData, options);
      // 轉換為原有格式以保持兼容性
      const compatibleResult = this._convertToCompatibleFormat(result);
      console.info('✅ 雲端卡牌辨識完成');
      return {
        ...compatibleResult,
        processTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        cardType: 'Unknown',
        confidence: 0,
        processTime: performance.now() - startTime,
      };
    }
  }

  /**
   * 批量卡牌辨識 (雲端 AI 版本)
   */
  async recognizeMultipleCards(imageDataArray, options = {}) {
    const {
      concurrent = this.config.batchSize,
      enableProgress = true,
    } = options;
    const results = [];
    const total = imageDataArray.length;
    console.info(`🃏 開始雲端批量辨識 ${total} 張卡牌...`);
    // 分批處理以避免超出 API 限制
    for (let i = 0; i < imageDataArray.length; i += concurrent) {
      const batch = imageDataArray.slice(i, i + concurrent);
      // 並行處理批次
      const batchPromises = batch.map(imageData =>
        this.recognizeCard(imageData, options),
      );
      const batchResults = await Promise.allSettled(batchPromises);
      // 處理批次結果
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
      // 顯示進度
      if (enableProgress) {
        const progress = ((i + concurrent) / total * 100).toFixed(1);
        console.info(`📈 雲端批量辨識進度: ${progress}%`);
      }
      // API 限制：避免過快請求
      if (i + concurrent < imageDataArray.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 增加延遲
      }
    }
    console.info(`✅ 雲端批量辨識完成: ${results.length} 張卡牌`);
    return {
      results,
      summary: this._generateBatchSummary(results),
      total,
      successful: results.filter(r => r.success).length,
    };
  }

  /**
   * 轉換雲端 AI 結果為兼容格式
   */
  _convertToCompatibleFormat(cloudResult) {
    try {
      // 將雲端 AI 的結果格式轉換為原有接口格式
      return {
        success: cloudResult.success,
        cardType: cloudResult.cardType || 'Unknown',
        confidence: cloudResult.confidence || 0,
        categoryIndex: this._getIndexFromCardType(cloudResult.cardType),
        details: {
          cardName: cloudResult.cardName || 'Unknown Card',
          rarity: cloudResult.rarity || 'Common',
          setName: cloudResult.setName || 'Unknown Set',
          cardNumber: cloudResult.cardNumber || 'N/A',
          condition: cloudResult.condition || 'Unknown',
          estimatedValue: cloudResult.estimatedValue || 0,
          series: cloudResult.details?.series || 'Unknown',
          artist: cloudResult.details?.artist || 'Unknown',
          releaseYear: cloudResult.details?.releaseYear || 'Unknown',
          language: cloudResult.details?.language || 'Unknown',
        },
        cached: cloudResult.cached || false,
        error: cloudResult.error || null,
      };
    } catch (error) {
      return {
        success: false,
        error: '格式轉換失敗',
        cardType: 'Unknown',
        confidence: 0,
      };
    }
  }

  /**
   * 從卡牌類型獲取索引
   */
  _getIndexFromCardType(cardType) {
    const typeMap = {
      'Pokemon': 0,
      'Magic: The Gathering': 1,
      'One Piece': 2,
      'Yu-Gi-Oh!': 3,
      'Dragon Ball Super': 4,
      'Digimon': 5,
      'Cardfight!! Vanguard': 6,
      'Weiss Schwarz': 7,
    };
    return typeMap[cardType] || 8; // 8 = Unknown/Other
  }

  /**
   * 從索引獲取卡牌類型
   */
  _getCardTypeFromIndex(index) {
    return this.cardCategories[index] || 'Unknown/Other';
  }

  /**
   * 生成批量處理摘要
   */
  _generateBatchSummary(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const cardTypeCounts = {};
    successful.forEach(result => {
      const cardType = result.cardType;
      cardTypeCounts[cardType] = (cardTypeCounts[cardType] || 0) + 1;
    });
    const averageConfidence = successful.length > 0
      ? successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length
      : 0;
    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: `${(successful.length / results.length * 100).toFixed(2) }%`,
      cardTypeCounts,
      averageConfidence: averageConfidence.toFixed(3),
      averageProcessTime: successful.length > 0
        ? (successful.reduce((sum, r) => sum + r.processTime, 0) / successful.length).toFixed(2)
        : 0,
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
    if (this.cloudAI) {
      this.cloudAI.dispose();
    }
    this.isInitialized = false;
    console.info('🧹 雲端卡牌辨識服務資源已清理');
  }
}

// 單例模式
let cardRecognitionServiceInstance = null;

export const getCardRecognitionService = () => {
  if (!cardRecognitionServiceInstance) {
    cardRecognitionServiceInstance = new CardRecognitionService();
  }
  return cardRecognitionServiceInstance;
};

export { CardRecognitionService };
export default CardRecognitionService;
