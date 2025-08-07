import apiIntegrationManager from './apiIntegrationManager';
import imageUtils from '../utils/imageUtils';
import bgsCrawlerService from './bgsCrawlerService';

// 卡牌服務
class CardService {
  // 卡牌辨識
  async recognizeCard(imageFile, options = {}) {
    try {
      // 圖片預處理
      const processedImage = await imageUtils.compressImage(imageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });

      // 驗證圖片
      const validation = await imageUtils.validateImage(processedImage);
      if (!validation.valid) {
        throw new Error(`圖片驗證失敗: ${validation.errors.join(', ')}`);
      }

      // 調用API整合管理器
      const result = await apiIntegrationManager.callApi(
        'cardRecognition',
        'recognize',
        { imageFile: processedImage, ...options },
        { onProgress: options.onProgress }
      );

      return result;
    } catch (error) {
      console.error('卡牌辨識失敗:', error);
      throw error;
    }
  }

  // 搜索卡牌
  async searchCards(query, filters = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'cardSearch',
        'search',
        { query, filters },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('卡牌搜索失敗:', error);
      throw error;
    }
  }

  // 獲取卡牌詳情
  async getCardDetails(cardId) {
    try {
      const result = await apiIntegrationManager.callApi(
        'cardDetails',
        'getDetails',
        { cardId },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取卡牌詳情失敗:', error);
      throw error;
    }
  }

  // 獲取卡牌價格
  async getCardPrices(cardInfo, options = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'priceQuery',
        'getPrices',
        { cardInfo, ...options },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取卡牌價格失敗:', error);
      throw error;
    }
  }

  // 獲取價格歷史
  async getPriceHistory(cardId, period = '1y') {
    try {
      const result = await apiIntegrationManager.callApi(
        'priceQuery',
        'getPriceHistory',
        { cardId, period },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取價格歷史失敗:', error);
      throw error;
    }
  }

  // 獲取市場趨勢
  async getMarketTrends(filters = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'priceQuery',
        'getMarketTrends',
        { filters },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取市場趨勢失敗:', error);
      throw error;
    }
  }

  // 價格預測
  async predictPrice(cardInfo, options = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'pricePrediction',
        'predict',
        { cardInfo, ...options },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('價格預測失敗:', error);
      throw error;
    }
  }

  // 批量辨識
  async recognizeCardsBatch(imageFiles, options = {}) {
    try {
      const results = [];
      const totalFiles = imageFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const imageFile = imageFiles[i];
        
        // 更新進度
        if (options.onProgress) {
          options.onProgress({
            current: i + 1,
            total: totalFiles,
            percentage: ((i + 1) / totalFiles) * 100,
          });
        }

        try {
          const result = await this.recognizeCard(imageFile, options);
          results.push({
            success: true,
            data: result,
            index: i,
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
            index: i,
          });
        }
      }

      return {
        success: true,
        data: results,
        totalProcessed: totalFiles,
        successfulCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
      };
    } catch (error) {
      console.error('批量辨識失敗:', error);
      throw error;
    }
  }

  // 獲取推薦卡牌
  async getRecommendedCards(userId, filters = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'cardRecommendation',
        'getRecommendations',
        { userId, filters },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取推薦卡牌失敗:', error);
      throw error;
    }
  }

  // 獲取熱門卡牌
  async getPopularCards(period = '7d', limit = 10) {
    try {
      const result = await apiIntegrationManager.callApi(
        'cardTrends',
        'getPopular',
        { period, limit },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取熱門卡牌失敗:', error);
      throw error;
    }
  }

  // 獲取新發行卡牌
  async getNewReleases(limit = 20) {
    try {
      const result = await apiIntegrationManager.callApi(
        'cardReleases',
        'getNewReleases',
        { limit },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取新發行卡牌失敗:', error);
      throw error;
    }
  }

  // 設置價格提醒
  async setPriceAlert(cardId, targetPrice, userId) {
    try {
      const result = await apiIntegrationManager.callApi(
        'priceAlert',
        'setAlert',
        { cardId, targetPrice, userId },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('設置價格提醒失敗:', error);
      throw error;
    }
  }

  // 獲取價格提醒
  async getPriceAlerts(userId) {
    try {
      const result = await apiIntegrationManager.callApi(
        'priceAlert',
        'getAlerts',
        { userId },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取價格提醒失敗:', error);
      throw error;
    }
  }

  // 刪除價格提醒
  async deletePriceAlert(alertId, userId) {
    try {
      const result = await apiIntegrationManager.callApi(
        'priceAlert',
        'deleteAlert',
        { alertId, userId },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('刪除價格提醒失敗:', error);
      throw error;
    }
  }

  // 評級相關方法
  async getCardGradingInfo(cardName, cardSeries = null, source = 'BGS') {
    try {
      console.log(`獲取卡牌評級資訊: ${cardName} (${cardSeries || '不限系列'}) - 來源: ${source}`);
      
      // 只支援BGS爬蟲
      if (source !== 'BGS') {
        throw new Error('目前只支援BGS評級資料來源');
      }
      
      // 先嘗試從資料庫獲取
      const cachedData = await bgsCrawlerService.getCachedGradingData(cardName, cardSeries);
      if (cachedData && this.isDataFresh(cachedData.lastUpdated)) {
        console.log('使用快取的評級資料');
        return cachedData;
      }

      // 爬取最新資料
      const gradingData = await bgsCrawlerService.searchCardGradingCount(cardName, cardSeries);
      
      return gradingData;
    } catch (error) {
      console.error('獲取卡牌評級資訊失敗:', error);
      throw error;
    }
  }

  // 批量獲取卡牌評級資訊
  async batchGetGradingInfo(cards, options = {}) {
    try {
      console.log(`批量獲取 ${cards.length} 張卡牌的評級資訊`);
      
      const source = options.source || 'BGS';
      if (source !== 'BGS') {
        throw new Error('目前只支援BGS評級資料來源');
      }
      
      const results = await bgsCrawlerService.batchSearchGrading(
        cards, 
        options.delayBetweenCards || 2000
      );
      
      return results;
    } catch (error) {
      console.error('批量獲取評級資訊失敗:', error);
      throw error;
    }
  }

  // 更新卡牌辨識資訊（包含評級）
  async updateCardRecognitionWithGrading(cardId, cardName, cardSeries = null, source = 'BGS') {
    try {
      console.log(`更新卡牌辨識資訊: ${cardId} - 來源: ${source}`);
      
      if (source !== 'BGS') {
        throw new Error('目前只支援BGS評級資料來源');
      }
      
      // 獲取評級資訊
      const gradingData = await this.getCardGradingInfo(cardName, cardSeries, source);
      
      // 更新卡牌辨識資訊
      await bgsCrawlerService.updateCardRecognitionInfo(cardId, gradingData);
      
      return {
        cardId,
        gradingData,
        success: true
      };
    } catch (error) {
      console.error('更新卡牌辨識資訊失敗:', error);
      throw error;
    }
  }

  // 獲取評級統計
  async getGradingStats() {
    try {
      const stats = await bgsCrawlerService.getGradingStats();
      return stats;
    } catch (error) {
      console.error('獲取評級統計失敗:', error);
      throw error;
    }
  }

  // 搜索評級資料
  async searchGradingData(query, limit = 50) {
    try {
      const results = await bgsCrawlerService.searchGradingData(query, limit);
      return results;
    } catch (error) {
      console.error('搜索評級資料失敗:', error);
      throw error;
    }
  }

  // 檢查資料是否新鮮（7天內）
  isDataFresh(lastUpdated) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return new Date(lastUpdated) > sevenDaysAgo;
  }

  // 清理過期評級資料
  async cleanupExpiredGradingData(daysOld = 30) {
    try {
      const deletedCount = await bgsCrawlerService.cleanupExpiredData(daysOld);
      return { deletedCount };
    } catch (error) {
      console.error('清理過期評級資料失敗:', error);
      throw error;
    }
  }

  // 檢查 BGS 爬蟲服務狀態
  async checkBGSCrawlerStatus() {
    try {
      const status = await bgsCrawlerService.checkServiceStatus();
      return status;
    } catch (error) {
      console.error('檢查 BGS 爬蟲狀態失敗:', error);
      throw error;
    }
  }
}

export default new CardService();
