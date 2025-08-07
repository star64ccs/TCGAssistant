import realApiService from './realApiService';
import databaseService from './databaseService';
import imageUtils from '../utils/imageUtils';
import notificationUtils from '../utils/notificationUtils';

// 卡牌辨識服務類
class CardRecognitionService {
  constructor() {
    this.isInitialized = false;
    this.recognitionMethods = {
      DATABASE_MATCH: 'database_match',
      AI_API: 'ai_api',
      FEATURE_MATCH: 'feature_match',
      HYBRID: 'hybrid'
    };
  }

  // 初始化服務
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await databaseService.initDatabase();
      this.isInitialized = true;
      console.log('卡牌辨識服務初始化完成');
    } catch (error) {
      console.error('卡牌辨識服務初始化失敗:', error);
      throw error;
    }
  }

  // 主要辨識方法
  async recognizeCard(imageFile, options = {}) {
    const {
      userId = 'default',
      method = 'hybrid',
      confidenceThreshold = 0.7,
      maxRetries = 3,
      onProgress = null,
      enableNotifications = true
    } = options;

    await this.initialize();

    try {
      // 更新進度
      if (onProgress) onProgress(10, '開始處理圖片...');

      // 預處理圖片
      const processedImage = await this.preprocessImage(imageFile);
      if (onProgress) onProgress(20, '圖片預處理完成');

      let recognitionResult = null;

      // 根據方法選擇辨識策略
      switch (method) {
        case this.recognitionMethods.DATABASE_MATCH:
          recognitionResult = await this.recognizeByDatabase(processedImage, userId, onProgress);
          break;
        
        case this.recognitionMethods.AI_API:
          recognitionResult = await this.recognizeByAI(processedImage, onProgress);
          break;
        
        case this.recognitionMethods.FEATURE_MATCH:
          recognitionResult = await this.recognizeByFeatures(processedImage, onProgress);
          break;
        
        case this.recognitionMethods.HYBRID:
        default:
          recognitionResult = await this.recognizeByHybrid(processedImage, userId, onProgress);
          break;
      }

      if (onProgress) onProgress(90, '辨識完成，處理結果...');

      // 驗證結果
      if (!recognitionResult || !recognitionResult.success) {
        throw new Error('卡牌辨識失敗');
      }

      // 如果信心度不足，嘗試其他方法
      if (recognitionResult.confidence < confidenceThreshold && method === this.recognitionMethods.HYBRID) {
        console.log('信心度不足，嘗試其他辨識方法...');
        recognitionResult = await this.fallbackRecognition(processedImage, userId, onProgress);
      }

      // 儲存辨識結果
      await this.saveRecognitionResult(recognitionResult, userId);

      // 發送通知
      if (enableNotifications) {
        notificationUtils.sendSuccessNotification(
          '卡牌辨識成功',
          `成功識別: ${recognitionResult.cardInfo.name}`
        );
      }

      if (onProgress) onProgress(100, '辨識完成');

      return {
        success: true,
        data: recognitionResult.cardInfo,
        confidence: recognitionResult.confidence,
        method: recognitionResult.method,
        source: recognitionResult.source,
        timestamp: new Date().toISOString(),
        processingTime: recognitionResult.processingTime
      };

    } catch (error) {
      console.error('卡牌辨識錯誤:', error);
      
      if (enableNotifications) {
        notificationUtils.sendErrorNotification(
          '卡牌辨識失敗',
          error.message
        );
      }

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 預處理圖片
  async preprocessImage(imageFile) {
    try {
      // 調整圖片大小
      const resizedImage = await imageUtils.resizeImage(imageFile, 800, 600);
      
      // 增強圖片品質
      const enhancedImage = await imageUtils.enhanceImage(resizedImage);
      
      // 提取圖片特徵
      const features = await imageUtils.extractFeatures(enhancedImage);
      
      return {
        original: imageFile,
        processed: enhancedImage,
        features: features,
        metadata: {
          width: enhancedImage.width,
          height: enhancedImage.height,
          format: enhancedImage.type,
          size: enhancedImage.size
        }
      };
    } catch (error) {
      console.error('圖片預處理失敗:', error);
      // 如果預處理失敗，返回原始圖片
      return {
        original: imageFile,
        processed: imageFile,
        features: null,
        metadata: null
      };
    }
  }

  // 資料庫匹配辨識
  async recognizeByDatabase(processedImage, userId, onProgress) {
    const startTime = Date.now();
    
    try {
      if (onProgress) onProgress(30, '搜尋資料庫...');

      // 提取圖片特徵
      const imageFeatures = await imageUtils.extractFeatures(processedImage.processed);
      
      // 在資料庫中搜尋相似卡牌
      const similarCards = await databaseService.findSimilarCards(imageFeatures);
      
      if (onProgress) onProgress(50, '分析匹配結果...');

      if (similarCards.length === 0) {
        return {
          success: false,
          error: '資料庫中未找到相似卡牌',
          method: this.recognitionMethods.DATABASE_MATCH
        };
      }

      // 計算最佳匹配
      const bestMatch = this.calculateBestMatch(similarCards, imageFeatures);
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        cardInfo: bestMatch.card,
        confidence: bestMatch.confidence,
        method: this.recognitionMethods.DATABASE_MATCH,
        source: 'database',
        processingTime: processingTime,
        alternatives: similarCards.slice(1, 5) // 前5個替代選項
      };

    } catch (error) {
      console.error('資料庫辨識失敗:', error);
      return {
        success: false,
        error: error.message,
        method: this.recognitionMethods.DATABASE_MATCH
      };
    }
  }

  // AI API辨識
  async recognizeByAI(processedImage, onProgress) {
    const startTime = Date.now();
    
    try {
      if (onProgress) onProgress(30, '調用AI辨識API...');

      // 使用真實API服務進行AI辨識
      const aiResult = await realApiService.recognizeCardReal(processedImage.processed, {
        onProgress: (progress) => {
          if (onProgress) onProgress(30 + progress * 0.5, 'AI分析中...');
        },
        maxRetries: 3
      });

      if (onProgress) onProgress(80, '處理AI結果...');

      if (!aiResult.success) {
        return {
          success: false,
          error: aiResult.error,
          method: this.recognitionMethods.AI_API
        };
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        cardInfo: aiResult.data.cardInfo,
        confidence: aiResult.data.confidence || 0.8,
        method: this.recognitionMethods.AI_API,
        source: 'ai_api',
        processingTime: processingTime,
        rawData: aiResult.data.rawData
      };

    } catch (error) {
      console.error('AI辨識失敗:', error);
      return {
        success: false,
        error: error.message,
        method: this.recognitionMethods.AI_API
      };
    }
  }

  // 特徵匹配辨識
  async recognizeByFeatures(processedImage, onProgress) {
    const startTime = Date.now();
    
    try {
      if (onProgress) onProgress(30, '提取圖片特徵...');

      // 提取詳細特徵
      const features = await imageUtils.extractDetailedFeatures(processedImage.processed);
      
      if (onProgress) onProgress(50, '特徵匹配分析...');

      // 使用特徵進行匹配
      const matchResult = await this.matchByFeatures(features);
      
      if (onProgress) onProgress(80, '處理匹配結果...');

      if (!matchResult.success) {
        return {
          success: false,
          error: '特徵匹配失敗',
          method: this.recognitionMethods.FEATURE_MATCH
        };
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        cardInfo: matchResult.cardInfo,
        confidence: matchResult.confidence,
        method: this.recognitionMethods.FEATURE_MATCH,
        source: 'feature_match',
        processingTime: processingTime,
        features: features
      };

    } catch (error) {
      console.error('特徵匹配失敗:', error);
      return {
        success: false,
        error: error.message,
        method: this.recognitionMethods.FEATURE_MATCH
      };
    }
  }

  // 混合辨識方法
  async recognizeByHybrid(processedImage, userId, onProgress) {
    const startTime = Date.now();
    
    try {
      // 並行執行多種辨識方法
      const [dbResult, aiResult, featureResult] = await Promise.allSettled([
        this.recognizeByDatabase(processedImage, userId, null),
        this.recognizeByAI(processedImage, null),
        this.recognizeByFeatures(processedImage, null)
      ]);

      if (onProgress) onProgress(70, '整合辨識結果...');

      // 收集成功的結果
      const results = [];
      
      if (dbResult.status === 'fulfilled' && dbResult.value.success) {
        results.push(dbResult.value);
      }
      
      if (aiResult.status === 'fulfilled' && aiResult.value.success) {
        results.push(aiResult.value);
      }
      
      if (featureResult.status === 'fulfilled' && featureResult.value.success) {
        results.push(featureResult.value);
      }

      if (results.length === 0) {
        return {
          success: false,
          error: '所有辨識方法都失敗了',
          method: this.recognitionMethods.HYBRID
        };
      }

      // 選擇最佳結果
      const bestResult = this.selectBestResult(results);
      
      const processingTime = Date.now() - startTime;

      return {
        ...bestResult,
        method: this.recognitionMethods.HYBRID,
        processingTime: processingTime,
        allResults: results
      };

    } catch (error) {
      console.error('混合辨識失敗:', error);
      return {
        success: false,
        error: error.message,
        method: this.recognitionMethods.HYBRID
      };
    }
  }

  // 備用辨識方法
  async fallbackRecognition(processedImage, userId, onProgress) {
    console.log('執行備用辨識方法...');
    
    // 嘗試其他辨識方法
    const methods = [
      this.recognitionMethods.AI_API,
      this.recognitionMethods.DATABASE_MATCH,
      this.recognitionMethods.FEATURE_MATCH
    ];

    for (const method of methods) {
      try {
        let result;
        switch (method) {
          case this.recognitionMethods.AI_API:
            result = await this.recognizeByAI(processedImage, onProgress);
            break;
          case this.recognitionMethods.DATABASE_MATCH:
            result = await this.recognizeByDatabase(processedImage, userId, onProgress);
            break;
          case this.recognitionMethods.FEATURE_MATCH:
            result = await this.recognizeByFeatures(processedImage, onProgress);
            break;
        }

        if (result.success && result.confidence > 0.5) {
          return result;
        }
      } catch (error) {
        console.error(`備用方法 ${method} 失敗:`, error);
        continue;
      }
    }

    throw new Error('所有辨識方法都失敗了');
  }

  // 計算最佳匹配
  calculateBestMatch(similarCards, imageFeatures) {
    let bestMatch = null;
    let highestConfidence = 0;

    for (const card of similarCards) {
      const confidence = this.calculateConfidence(card, imageFeatures);
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = {
          card: card,
          confidence: confidence
        };
      }
    }

    return bestMatch;
  }

  // 計算信心度
  calculateConfidence(card, imageFeatures) {
    // 這裡可以實現更複雜的信心度計算算法
    // 目前使用簡單的相似度計算
    let confidence = 0.5; // 基礎信心度

    // 根據特徵相似度調整信心度
    if (card.features && imageFeatures) {
      const similarity = this.calculateFeatureSimilarity(card.features, imageFeatures);
      confidence += similarity * 0.4;
    }

    // 根據卡牌資訊完整性調整信心度
    if (card.name && card.series) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  // 計算特徵相似度
  calculateFeatureSimilarity(features1, features2) {
    // 簡單的歐幾里得距離計算
    if (!features1 || !features2) return 0;

    const keys = Object.keys(features1);
    let sumSquaredDiff = 0;
    let count = 0;

    for (const key of keys) {
      if (features2[key] !== undefined) {
        const diff = features1[key] - features2[key];
        sumSquaredDiff += diff * diff;
        count++;
      }
    }

    if (count === 0) return 0;

    const distance = Math.sqrt(sumSquaredDiff / count);
    // 將距離轉換為相似度 (0-1)
    return Math.max(0, 1 - distance);
  }

  // 特徵匹配
  async matchByFeatures(features) {
    try {
      // 在資料庫中搜尋具有相似特徵的卡牌
      const similarCards = await databaseService.findSimilarCards(features);
      
      if (similarCards.length === 0) {
        return {
          success: false,
          error: '未找到匹配的特徵'
        };
      }

      const bestMatch = this.calculateBestMatch(similarCards, features);
      
      return {
        success: true,
        cardInfo: bestMatch.card,
        confidence: bestMatch.confidence
      };

    } catch (error) {
      console.error('特徵匹配失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 選擇最佳結果
  selectBestResult(results) {
    let bestResult = results[0];
    let highestConfidence = bestResult.confidence;

    for (const result of results) {
      if (result.confidence > highestConfidence) {
        highestConfidence = result.confidence;
        bestResult = result;
      }
    }

    return bestResult;
  }

  // 儲存辨識結果
  async saveRecognitionResult(result, userId) {
    try {
      if (result.success && result.cardInfo) {
        await databaseService.saveRecognitionResult({
          userId: userId,
          cardInfo: result.cardInfo,
          confidence: result.confidence,
          method: result.method,
          source: result.source,
          timestamp: new Date().toISOString(),
          processingTime: result.processingTime
        });
      }
    } catch (error) {
      console.error('儲存辨識結果失敗:', error);
    }
  }

  // 獲取辨識統計
  async getRecognitionStats(userId) {
    try {
      const stats = await databaseService.getRecognitionStats(userId);
      return stats;
    } catch (error) {
      console.error('獲取辨識統計失敗:', error);
      return null;
    }
  }

  // 清理舊的辨識記錄
  async cleanupOldRecords(daysOld = 30) {
    try {
      await databaseService.cleanupOldRecognitionRecords(daysOld);
      console.log(`已清理 ${daysOld} 天前的辨識記錄`);
    } catch (error) {
      console.error('清理辨識記錄失敗:', error);
    }
  }
}

// 創建單例實例
const cardRecognitionService = new CardRecognitionService();

export default cardRecognitionService;
