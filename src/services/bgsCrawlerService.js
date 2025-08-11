import axios from 'axios';
import robotsTxtService from './robotsTxtService';
import databaseService from './databaseService';

// BGS 爬蟲服務
class BGSCrawlerService {
  constructor() {
    this.baseUrl = 'https://www.beckett.com';
    this.searchUrl = `${this.baseUrl}/search`;
    this.userAgent = 'TCGAssistant/1.0 (https: //github.com/your-repo/tcg-assistant)';
    this.requestDelay = 1000, // 1秒延遲，遵守 robots.txt
    this.lastRequestTime = 0;
    this.robotsRules = null;
    this.isInitialized = false;
  }
  // 初始化爬蟲服務
  async init() {
    try {
      if (this.isInitialized) {
        return;
      }
      // 檢查 robots.txt
      await this.checkRobotsTxt();
      // 初始化資料庫
      await databaseService.initDatabase();
      this.isInitialized = true;
    } catch (error) {
      throw error;
    }
  }
  // 檢查 robots.txt
  async checkRobotsTxt() {
    try {
      this.robotsRules = await robotsTxtService.checkRobotsTxt(this.baseUrl, this.userAgent);
      // 檢查是否允許爬取
      if (!this.robotsRules || !this.robotsRules.isAllowed) {
        throw new Error('robots.txt 不允許爬取此網站');
      }
      // 更新請求延遲
      this.requestDelay = robotsTxtService.getCrawlDelay(this.robotsRules);
    } catch (error) {
      throw error;
    }
  }
  // 檢查是否允許爬取特定路徑
  isAllowedToCrawl(path = '/') {
    if (!this.robotsRules || !this.robotsRules.isAllowed) {
      return true; // 如果無法獲取 robots.txt，預設允許
    }
    return robotsTxtService.checkIfAllowed(this.robotsRules, this.userAgent, path);
  }
  // 檢查路徑是否匹配（向後兼容）
  matchesPath(pattern, path = '/') {
    return robotsTxtService.matchesPath(pattern, path);
  }
  // 遵守延遲規則
  async respectDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }
  // 搜索卡牌評級數量
  async searchCardGradingCount(cardName, cardSeries = null) {
    try {
      await this.init();
      await this.respectDelay();
      // 構建搜索查詢
      const searchQuery = this.buildSearchQuery(cardName, cardSeries);
      const response = await axios.get(this.searchUrl, {
        params: searchQuery,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000,
      });
      // 解析搜索結果
      const gradingData = this.parseSearchResults(response.data, cardName);
      // 儲存到資料庫
      await this.saveGradingData(cardName, cardSeries, gradingData);
      return gradingData;
    } catch (error) {
      throw error;
    }
  }
  // 構建搜索查詢
  buildSearchQuery(cardName, cardSeries) {
    const query = {
      q: cardName,
      type: 'card',
      sort: 'relevance',
      page: 1,
    };
    if (cardSeries) {
      query.series = cardSeries;
    }
    return query;
  }
  // 解析搜索結果
  parseSearchResults(htmlContent, cardName) {
    try {
      // 使用正則表達式解析 HTML
      const gradingData = {
        cardName: cardName,
        totalGraded: 0,
        gradeDistribution: {},
        averageGrade: 0,
        lastUpdated: new Date().toISOString(),
        source: 'BGS',
      };
      // 解析總評級數量 (BGS 特定格式)
      const totalGradedMatch = htmlContent.match(/總評級數量[：:]\s*([\d,]+)/i) ||
                              htmlContent.match(/Total Graded[：:]\s*([\d,]+)/i) ||
                              htmlContent.match(/Total.*?([\d,]+)/i) ||
                              htmlContent.match(/graded[：:]\s*([\d,]+)/i) ||
                              htmlContent.match(/BGS.*?([\d,]+)\s*graded/i);
      if (totalGradedMatch) {
        gradingData.totalGraded = parseInt(totalGradedMatch[1].replace(/,/g, ''));
      }
      // 解析評級分佈 (BGS 特定格式，支援 .5 評級)
      const gradePattern = /(BGS|PSA|CGC)\s*(\d+(?:\.\d+)?)[：:]\s*(\d+)/gi;
      let gradeMatch;
      while ((gradeMatch = gradePattern.exec(htmlContent)) !== null) {
        const gradeType = gradeMatch[1];
        const grade = gradeMatch[2];
        const count = parseInt(gradeMatch[3], 10);
        if (!gradingData.gradeDistribution[gradeType]) {
          gradingData.gradeDistribution[gradeType] = {};
        }
        gradingData.gradeDistribution[gradeType][grade] = count;
      }
      // 特別處理 BGS 的 .5 評級格式
      const bgsGradePattern = /BGS\s*(\d+\.\d+)[：:]\s*(\d+)/gi;
      while ((gradeMatch = bgsGradePattern.exec(htmlContent)) !== null) {
        const grade = gradeMatch[1];
        const count = parseInt(gradeMatch[2], 10);
        if (!gradingData.gradeDistribution.BGS) {
          gradingData.gradeDistribution.BGS = {};
        }
        gradingData.gradeDistribution.BGS[grade] = count;
      }
      // 計算平均評級
      gradingData.averageGrade = this.calculateAverageGrade(gradingData.gradeDistribution);
      return gradingData;
    } catch (error) {
      return {
        cardName: cardName,
        totalGraded: 0,
        gradeDistribution: {},
        averageGrade: 0,
        lastUpdated: new Date().toISOString(),
        source: 'BGS',
        error: '解析失敗',
      };
    }
  }
  // 計算平均評級
  calculateAverageGrade(gradeDistribution) {
    let totalCount = 0;
    let totalGrade = 0;
    for (const gradeType in gradeDistribution) {
      for (const grade in gradeDistribution[gradeType]) {
        const count = gradeDistribution[gradeType][grade];
        totalCount += count;
        totalGrade += parseFloat(grade) * count;
      }
    }
    return totalCount > 0 ? (totalGrade / totalCount).toFixed(2) : 0;
  }
  // 儲存評級資料到資料庫
  async saveGradingData(cardName, cardSeries, gradingData) {
    try {
      // 檢查是否已存在
      const existingData = await databaseService.getBGSCardGradingData(cardName, cardSeries);
      if (existingData) {
        // 更新現有資料
        await databaseService.updateBGSCardGradingData(cardName, cardSeries, gradingData);
      } else {
        // 插入新資料
        await databaseService.insertBGSCardGradingData(cardName, cardSeries, gradingData);
      }
    } catch (error) {
      throw error;
    }
  }
  // 批量搜索卡牌評級
  async batchSearchGrading(cards, delayBetweenCards = 2000) {
    try {
      await this.init();
      const results = [];
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        try {
          const gradingData = await this.searchCardGradingCount(card.name, card.series);
          results.push({
            card: card,
            gradingData: gradingData,
            success: true,
          });
          // 卡牌間延遲
          if (i < cards.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenCards));
          }
        } catch (error) {
          results.push({
            card: card,
            gradingData: null,
            success: false,
            error: error.message,
          });
        }
      }
      return results;
    } catch (error) {
      throw error;
    }
  }
  // 獲取快取的評級資料
  async getCachedGradingData(cardName, cardSeries) {
    try {} catch (error) {}
  }
  // 獲取卡牌評級統計
  async getGradingStats() {
    try {} catch (error) {}
  }
  // 更新卡牌辨識資訊
  async updateCardRecognitionInfo(cardId, gradingData) {
    try {
      await this.init();
      // 更新卡牌辨識資訊
      await databaseService.updateCardRecognitionInfo(cardId, {
        bgsGradingCount: gradingData.totalGraded,
        bgsAverageGrade: gradingData.averageGrade,
        bgsGradeDistribution: JSON.stringify(gradingData.gradeDistribution),
        bgsLastUpdated: gradingData.lastUpdated,
      });
    } catch (error) {
      throw error;
    }
  }
  // 檢查服務狀態
  async checkServiceStatus() {
    try {
      await this.init();
      const summary = robotsTxtService.generateSummary(this.robotsRules);
      return {
        status: 'active',
        robotsTxtRespected: this.robotsRules?.isAllowed || true,
        lastRequestTime: this.lastRequestTime,
        requestDelay: this.requestDelay,
        isInitialized: this.isInitialized,
        robotsTxtSummary: summary,
        robotsRules: this.robotsRules,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        isInitialized: this.isInitialized,
      };
    }
  }
  // 清理過期資料
  async cleanupExpiredData(daysOld = 30) {
    try {} catch (error) {}
  }
}

const bgscrawlerservice = new BGSCrawlerService();
export default bgscrawlerservice;
