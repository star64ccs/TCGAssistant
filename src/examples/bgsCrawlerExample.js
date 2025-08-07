import bgsCrawlerService from '../services/bgsCrawlerService';
import cardService from '../services/cardService';
import databaseService from '../services/databaseService';

/**
 * BGS 爬蟲使用範例
 * 展示如何使用 BGS 爬蟲服務進行卡牌評級資料抓取
 */
class BGSCrawlerExample {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * 初始化範例
   */
  async init() {
    try {
      console.log('初始化 BGS 爬蟲範例...');
      
      // 初始化資料庫
      await databaseService.initDatabase();
      
      // 檢查 BGS 爬蟲服務狀態
      const status = await bgsCrawlerService.checkServiceStatus();
      console.log('BGS 爬蟲服務狀態:', status);
      
      this.isInitialized = true;
      console.log('BGS 爬蟲範例初始化完成');
    } catch (error) {
      console.error('BGS 爬蟲範例初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 基本搜索範例
   */
  async basicSearchExample() {
    try {
      console.log('\n=== 基本搜索範例 ===');
      
      const cardName = 'Charizard';
      const cardSeries = 'Base Set';
      
      console.log(`搜索卡牌: ${cardName} (${cardSeries})`);
      
      const result = await bgsCrawlerService.searchCardGradingCount(cardName, cardSeries);
      
      console.log('搜索結果:');
      console.log('- 卡牌名稱:', result.cardName);
      console.log('- 總評級數量:', result.totalGraded);
      console.log('- 平均評級:', result.averageGrade);
      console.log('- 評級分佈:', result.gradeDistribution);
      console.log('- 資料來源:', result.source);
      console.log('- 最後更新:', result.lastUpdated);
      
      return result;
    } catch (error) {
      console.error('基本搜索範例失敗:', error);
      throw error;
    }
  }

  /**
   * BGS 特定評級格式範例
   */
  async bgsSpecificGradeExample() {
    try {
      console.log('\n=== BGS 特定評級格式範例 ===');
      
      const cardName = 'Pikachu';
      
      console.log(`搜索 BGS 評級: ${cardName}`);
      
      const result = await bgsCrawlerService.searchCardGradingCount(cardName);
      
      // 特別展示 BGS 的 .5 評級
      if (result.gradeDistribution.BGS) {
        console.log('BGS 評級分佈:');
        Object.entries(result.gradeDistribution.BGS)
          .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
          .forEach(([grade, count]) => {
            console.log(`  ${grade}: ${count} 張`);
          });
      }
      
      return result;
    } catch (error) {
      console.error('BGS 特定評級格式範例失敗:', error);
      throw error;
    }
  }

  /**
   * 批量搜索範例
   */
  async batchSearchExample() {
    try {
      console.log('\n=== 批量搜索範例 ===');
      
      const cards = [
        { name: 'Charizard', series: 'Base Set' },
        { name: 'Blastoise', series: 'Base Set' },
        { name: 'Venusaur', series: 'Base Set' },
        { name: 'Pikachu', series: 'Base Set' },
        { name: 'Mewtwo', series: 'Base Set' }
      ];
      
      console.log(`批量搜索 ${cards.length} 張卡牌...`);
      
      const results = await bgsCrawlerService.batchSearchGrading(cards, 2000);
      
      console.log('批量搜索結果:');
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.card.name}: ${result.success ? '成功' : '失敗'}`);
        if (result.success) {
          console.log(`   總評級: ${result.gradingData.totalGraded}, 平均: ${result.gradingData.averageGrade}`);
        } else {
          console.log(`   錯誤: ${result.error}`);
        }
      });
      
      return results;
    } catch (error) {
      console.error('批量搜索範例失敗:', error);
      throw error;
    }
  }

  /**
   * 快取功能範例
   */
  async cacheExample() {
    try {
      console.log('\n=== 快取功能範例 ===');
      
      const cardName = 'TestCard';
      const cardSeries = 'TestSeries';
      
      // 第一次搜索（會儲存到快取）
      console.log('第一次搜索（建立快取）...');
      const firstResult = await bgsCrawlerService.searchCardGradingCount(cardName, cardSeries);
      console.log('第一次搜索完成');
      
      // 第二次搜索（使用快取）
      console.log('第二次搜索（使用快取）...');
      const cachedResult = await bgsCrawlerService.getCachedGradingData(cardName, cardSeries);
      
      if (cachedResult) {
        console.log('使用快取資料成功');
        console.log('- 快取資料:', cachedResult.cardName);
        console.log('- 快取時間:', cachedResult.lastUpdated);
      } else {
        console.log('快取資料不存在');
      }
      
      return { firstResult, cachedResult };
    } catch (error) {
      console.error('快取功能範例失敗:', error);
      throw error;
    }
  }

  /**
   * 卡牌服務整合範例
   */
  async cardServiceIntegrationExample() {
    try {
      console.log('\n=== 卡牌服務整合範例 ===');
      
      const cardName = 'IntegrationTest';
      const cardSeries = 'TestSeries';
      
      console.log(`使用卡牌服務獲取評級資訊: ${cardName}`);
      
      const gradingInfo = await cardService.getCardGradingInfo(cardName, cardSeries);
      
      console.log('評級資訊:');
      console.log('- 卡牌名稱:', gradingInfo.cardName);
      console.log('- 總評級數量:', gradingInfo.totalGraded);
      console.log('- 平均評級:', gradingInfo.averageGrade);
      console.log('- 資料來源:', gradingInfo.source);
      
      return gradingInfo;
    } catch (error) {
      console.error('卡牌服務整合範例失敗:', error);
      throw error;
    }
  }

  /**
   * 服務狀態檢查範例
   */
  async serviceStatusExample() {
    try {
      console.log('\n=== 服務狀態檢查範例 ===');
      
      const status = await bgsCrawlerService.checkServiceStatus();
      
      console.log('BGS 爬蟲服務狀態:');
      console.log('- 狀態:', status.status);
      console.log('- 是否初始化:', status.isInitialized);
      console.log('- 遵守 robots.txt:', status.robotsTxtRespected);
      console.log('- 請求延遲:', status.requestDelay, 'ms');
      console.log('- 最後請求時間:', status.lastRequestTime);
      
      if (status.robotsTxtSummary) {
        console.log('- robots.txt 摘要:');
        console.log('  有規則:', status.robotsTxtSummary.hasRules);
        console.log('  允許爬取:', status.robotsTxtSummary.isAllowed);
        console.log('  爬取延遲:', status.robotsTxtSummary.crawlDelay);
      }
      
      return status;
    } catch (error) {
      console.error('服務狀態檢查範例失敗:', error);
      throw error;
    }
  }

  /**
   * 資料清理範例
   */
  async cleanupExample() {
    try {
      console.log('\n=== 資料清理範例 ===');
      
      console.log('清理 30 天前的過期資料...');
      
      const deletedCount = await bgsCrawlerService.cleanupExpiredData(30);
      
      console.log(`清理完成，刪除了 ${deletedCount} 條過期資料`);
      
      return deletedCount;
    } catch (error) {
      console.error('資料清理範例失敗:', error);
      throw error;
    }
  }

  /**
   * 評級統計範例
   */
  async gradingStatsExample() {
    try {
      console.log('\n=== 評級統計範例 ===');
      
      const stats = await bgsCrawlerService.getGradingStats();
      
      console.log('評級統計:');
      console.log('- 總卡牌數量:', stats.totalCards || 0);
      console.log('- 總評級數量:', stats.totalGraded || 0);
      console.log('- 平均評級:', stats.averageGrade || 0);
      console.log('- 最高評級:', stats.highestGrade || 'N/A');
      console.log('- 最低評級:', stats.lowestGrade || 'N/A');
      
      return stats;
    } catch (error) {
      console.error('評級統計範例失敗:', error);
      throw error;
    }
  }

  /**
   * 完整流程範例
   */
  async fullWorkflowExample() {
    try {
      console.log('\n=== 完整流程範例 ===');
      
      // 1. 初始化
      await this.init();
      
      // 2. 檢查服務狀態
      await this.serviceStatusExample();
      
      // 3. 基本搜索
      await this.basicSearchExample();
      
      // 4. BGS 特定評級
      await this.bgsSpecificGradeExample();
      
      // 5. 批量搜索
      await this.batchSearchExample();
      
      // 6. 快取功能
      await this.cacheExample();
      
      // 7. 卡牌服務整合
      await this.cardServiceIntegrationExample();
      
      // 8. 評級統計
      await this.gradingStatsExample();
      
      // 9. 資料清理
      await this.cleanupExample();
      
      console.log('\n=== 完整流程範例完成 ===');
    } catch (error) {
      console.error('完整流程範例失敗:', error);
      throw error;
    }
  }

  /**
   * 錯誤處理範例
   */
  async errorHandlingExample() {
    try {
      console.log('\n=== 錯誤處理範例 ===');
      
      // 測試無效卡牌名稱
      try {
        await bgsCrawlerService.searchCardGradingCount('', '');
        console.log('應該拋出錯誤但沒有');
      } catch (error) {
        console.log('正確捕獲錯誤:', error.message);
      }
      
      // 測試網路錯誤處理
      try {
        // 模擬網路錯誤
        const originalGet = bgsCrawlerService.searchCardGradingCount;
        bgsCrawlerService.searchCardGradingCount = jest.fn().mockRejectedValue(new Error('Network timeout'));
        
        await bgsCrawlerService.searchCardGradingCount('TestCard');
        console.log('應該拋出網路錯誤但沒有');
      } catch (error) {
        console.log('正確捕獲網路錯誤:', error.message);
      }
      
      console.log('錯誤處理範例完成');
    } catch (error) {
      console.error('錯誤處理範例失敗:', error);
      throw error;
    }
  }
}

export default BGSCrawlerExample;
