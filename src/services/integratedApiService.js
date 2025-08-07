import realApiService from './realApiService';
import priceApiService from './priceApiService';
import cardService from './cardService';
import analysisService from './analysisService';
import aiService from './aiService';
import notificationUtils from '../utils/notificationUtils';
import databaseService from './databaseService';

// 整合API服務類
class IntegratedApiService {
  constructor() {
    this.isRealApiEnabled = this.checkRealApiAvailability();
    this.fallbackToMock = false; // 移除mock回退
    this.databaseInitialized = false;
  }

  // 檢查真實API可用性
  checkRealApiAvailability() {
    const hasRecognitionApis = realApiService.activeApis.recognition.length > 0;
    const hasPricingApis = priceApiService.activeApis.length > 0;
    const hasAiApis = realApiService.activeApis.ai.length > 0;

    console.log('真實API狀態:', {
      recognition: hasRecognitionApis,
      pricing: hasPricingApis,
      ai: hasAiApis,
    });

    return hasRecognitionApis || hasPricingApis || hasAiApis;
  }

  // 初始化資料庫
  async initDatabase() {
    if (!this.databaseInitialized) {
      try {
        await databaseService.initDatabase();
        this.databaseInitialized = true;
        console.log('資料庫初始化完成');
      } catch (error) {
        console.error('資料庫初始化失敗:', error);
      }
    }
  }

  // 整合卡牌辨識
  async recognizeCard(imageFile, options = {}) {
    const {
      useRealApi = this.isRealApiEnabled,
      useFallback = this.fallbackToMock,
      onProgress = null,
      userId = 'default',
    } = options;

    try {
      // 確保資料庫已初始化
      await this.initDatabase();

      // 首先嘗試本地資料庫辨識
      console.log('嘗試本地資料庫辨識...');
      const localResult = await this.recognizeCardLocal(imageFile, userId);
      
      if (localResult.success && localResult.confidence > 0.7) {
        console.log('本地辨識成功，信心度:', localResult.confidence);
        return {
          success: true,
          data: localResult.cardInfo,
          source: 'local_database',
          apiUsed: 'local',
          confidence: localResult.confidence,
          timestamp: new Date().toISOString(),
        };
      }

      // 嘗試使用真實API
      if (useRealApi && this.isRealApiEnabled) {
        console.log('使用真實API進行卡牌辨識...');
        
        const realResult = await realApiService.recognizeCardReal(imageFile, {
          onProgress,
          maxRetries: 3,
        });

        if (realResult.success) {
          // 將辨識結果儲存到本地資料庫
          await this.saveRecognitionToDatabase(realResult.data, userId, 'real_api');
          
          // 發送成功通知
          notificationUtils.sendSuccessNotification('卡牌辨識成功', '已成功識別卡牌信息');
          
          return {
            ...realResult,
            source: 'real_api',
            apiUsed: realResult.apiUsed,
          };
        } else {
          console.warn('真實API辨識失敗:', realResult.error);
          
          if (!useFallback) {
            throw new Error(realResult.error);
          }
        }
      }

      // 如果沒有可用的API，拋出錯誤
      throw new Error('沒有可用的卡牌辨識API');

      throw new Error('沒有可用的辨識服務');

    } catch (error) {
      console.error('卡牌辨識失敗:', error);
      
      // 發送錯誤通知
      notificationUtils.sendErrorNotification('卡牌辨識失敗', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 整合價格查詢
  async getCardPrices(cardInfo, options = {}) {
    const {
      useRealApi = this.isRealApiEnabled,
      useFallback = this.fallbackToMock,
      platforms = ['TCGPLAYER', 'EBAY', 'CARDMARKET', 'PRICECHARTING'],
      includeHistory = false,
      includeTrends = false,
    } = options;

    try {
      // 嘗試使用真實API
      if (useRealApi && this.isRealApiEnabled) {
        console.log('使用真實API查詢價格...');
        
        const realResult = await priceApiService.getCardPrices(cardInfo, {
          platforms,
          maxRetries: 3,
          includeHistory,
          includeTrends,
        });

        if (realResult.success) {
          return {
            ...realResult,
            source: 'real_api',
            platformsUsed: realResult.platformsUsed,
          };
        } else {
          console.warn('真實API價格查詢失敗:', realResult.error);
          
          if (!useFallback) {
            throw new Error(realResult.error);
          }
        }
      }

      // 回退到模擬數據
      if (useFallback) {
        console.log('使用模擬數據查詢價格...');
        
        const mockResult = await this.getMockPriceResult(cardInfo);
        
        return {
          success: true,
          data: mockResult,
          source: 'mock_data',
          platformsUsed: ['MOCK'],
          timestamp: new Date().toISOString(),
        };
      }

      throw new Error('沒有可用的價格查詢服務');

    } catch (error) {
      console.error('價格查詢失敗:', error);
      
      // 發送錯誤通知
      notificationUtils.sendErrorNotification('價格查詢失敗', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 整合AI分析
  async analyzeWithAI(prompt, context = {}, options = {}) {
    const {
      useRealApi = this.isRealApiEnabled,
      useFallback = this.fallbackToMock,
      model = 'OPENAI',
    } = options;

    try {
      // 嘗試使用真實API
      if (useRealApi && this.isRealApiEnabled) {
        console.log('使用真實AI API進行分析...');
        
        const realResult = await realApiService.analyzeWithAI(prompt, context, {
          model,
          maxTokens: 1000,
          temperature: 0.7,
        });

        if (realResult.success) {
          // 發送成功通知
          notificationUtils.sendSuccessNotification('AI分析完成', '已生成專業分析報告');
          
          return {
            ...realResult,
            source: 'real_api',
            modelUsed: realResult.modelUsed,
          };
        } else {
          console.warn('真實AI API分析失敗:', realResult.error);
          
          if (!useFallback) {
            throw new Error(realResult.error);
          }
        }
      }

      // 如果沒有可用的API，拋出錯誤
      throw new Error('沒有可用的AI分析API');

      throw new Error('沒有可用的AI分析服務');

    } catch (error) {
      console.error('AI分析失敗:', error);
      
      // 發送錯誤通知
      notificationUtils.sendErrorNotification('AI分析失敗', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 整合置中評估
  async analyzeCentering(imageFile, options = {}) {
    const {
      useRealApi = this.isRealApiEnabled,
      useFallback = this.fallbackToMock,
      onProgress = null,
    } = options;

    try {
      // 嘗試使用真實API
      if (useRealApi && this.isRealApiEnabled) {
        console.log('使用真實API進行置中評估...');
        
        // 這裡可以整合真實的置中評估API
        // 目前使用模擬數據
        const mockResult = await this.getMockCenteringResult(imageFile);
        
        return {
          success: true,
          data: mockResult,
          source: 'mock_data',
          apiUsed: 'mock',
          timestamp: new Date().toISOString(),
        };
      }

      // 如果沒有可用的API，拋出錯誤
      throw new Error('沒有可用的置中評估API');

      throw new Error('沒有可用的置中評估服務');

    } catch (error) {
      console.error('置中評估失敗:', error);
      
      // 發送錯誤通知
      notificationUtils.sendErrorNotification('置中評估失敗', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 整合真偽判斷
  async analyzeAuthenticity(imageFile, options = {}) {
    const {
      useRealApi = this.isRealApiEnabled,
      useFallback = this.fallbackToMock,
      onProgress = null,
    } = options;

    try {
      // 嘗試使用真實API
      if (useRealApi && this.isRealApiEnabled) {
        console.log('使用真實API進行真偽判斷...');
        
        // 這裡需要整合真實的真偽判斷API
        throw new Error('真偽判斷API尚未實現');
      }

      // 如果沒有可用的API，拋出錯誤
      throw new Error('沒有可用的真偽判斷API');

      throw new Error('沒有可用的真偽判斷服務');

    } catch (error) {
      console.error('真偽判斷失敗:', error);
      
      // 發送錯誤通知
      notificationUtils.sendErrorNotification('真偽判斷失敗', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 模擬數據生成方法
  async getMockRecognitionResult(imageFile) {
    // 移除mock數據，改為拋出錯誤
    throw new Error('卡牌辨識需要真實API支持');
  }

  async getMockPriceResult(cardInfo) {
    // 移除mock數據，改為拋出錯誤
    throw new Error('價格查詢需要真實API支持');
  }

  async getMockAiResult(prompt, context) {
    // TODO: 實現真實的AI API調用
    throw new Error('真實AI API尚未實現，請聯繫開發團隊');
  }

  async getMockCenteringResult(imageFile) {
    // TODO: 實現真實的置中評估API調用
    throw new Error('真實置中評估API尚未實現，請聯繫開發團隊');
  }

  async getMockAuthenticityResult(imageFile) {
    // TODO: 實現真實的真偽判斷API調用
    throw new Error('真實真偽判斷API尚未實現，請聯繫開發團隊');
  }

  // 輔助方法
  getCenteringGrade(score) {
    if (score >= 60) return 'PSA 10';
    if (score >= 55) return 'PSA 9';
    if (score >= 50) return 'PSA 8';
    if (score >= 45) return 'PSA 7';
    return 'PSA 6';
  }

  // 獲取API狀態
  // 本地卡牌辨識
  async recognizeCardLocal(imageFile, userId) {
    try {
      // 提取圖片特徵
      const imageFeatures = await this.extractImageFeatures(imageFile);
      
      // 在本地資料庫中搜尋相似卡牌
      const similarCards = await databaseService.findSimilarCards(imageFeatures);
      
      if (similarCards.length > 0) {
        const bestMatch = similarCards[0];
        const confidence = bestMatch.confidence_score || 0.5;
        
        return {
          success: true,
          cardInfo: bestMatch,
          confidence: confidence,
        };
      }
      
      return {
        success: false,
        confidence: 0,
      };
    } catch (error) {
      console.error('本地辨識失敗:', error);
      return {
        success: false,
        confidence: 0,
        error: error.message,
      };
    }
  }

  // 提取圖片特徵
  async extractImageFeatures(imageFile) {
    // 這裡應該實作圖片特徵提取演算法
    // 包括顏色直方圖、邊緣檢測、文字區域等
    // 目前返回簡單的特徵作為示例
    
    return {
      type: 'color_histogram',
      data: {
        // 簡化的顏色特徵
        dominantColors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
        brightness: 0.7,
        contrast: 0.8,
      },
      confidence: 0.6,
    };
  }

  // 儲存辨識結果到資料庫
  async saveRecognitionToDatabase(cardInfo, userId, apiUsed) {
    try {
      const imageHash = await this.generateImageHash(cardInfo.image || '');
      
      await databaseService.saveRecognitionResult({
        userId: userId,
        imageHash: imageHash,
        cardId: cardInfo.card_id || cardInfo.id,
        confidence: cardInfo.confidence || 0.8,
        recognitionTime: new Date().toISOString(),
        apiUsed: apiUsed,
        processingTime: Date.now(),
        imagePath: cardInfo.image || '',
      });
      
      console.log('辨識結果已儲存到資料庫');
    } catch (error) {
      console.error('儲存辨識結果失敗:', error);
    }
  }

  // 生成圖片雜湊值
  async generateImageHash(imageUrl) {
    // 簡化的雜湊生成
    return btoa(imageUrl).substring(0, 64);
  }

  getApiStatus() {
    return {
      realApiEnabled: this.isRealApiEnabled,
      fallbackEnabled: this.fallbackToMock,
      databaseEnabled: this.databaseInitialized,
      recognitionApis: realApiService.activeApis.recognition,
      pricingApis: realApiService.activeApis.pricing,
      aiApis: realApiService.activeApis.ai,
    };
  }

  // 切換API模式
  setApiMode(useRealApi, fallbackToMock = false) {
    this.isRealApiEnabled = useRealApi;
    this.fallbackToMock = fallbackToMock;
    
    console.log('API模式已切換:', {
      useRealApi: this.isRealApiEnabled,
      fallbackToMock: this.fallbackToMock,
    });
  }
}

export default new IntegratedApiService();
