import bgsCrawlerService from '../services/bgsCrawlerService';
import cardService from '../services/cardService';
import databaseService from '../services/databaseService';
import robotsTxtService from '../services/robotsTxtService';

// 模擬 axios
jest.mock('axios');
const axios = require('axios');

// 模擬 react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(() => Promise.resolve([{ rows: { length: 0, item: () => {} } }])),
    close: jest.fn(() => Promise.resolve()),
  })),
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
}));

// 模擬 robotsTxtService
jest.mock('../services/robotsTxtService');

// 模擬 databaseService
jest.mock('../services/databaseService', () => ({
  initDatabase: jest.fn(() => Promise.resolve()),
  getCardGradingData: jest.fn(() => Promise.resolve(null)),
  insertCardGradingData: jest.fn(() => Promise.resolve(1)),
  updateCardGradingData: jest.fn(() => Promise.resolve(1)),
  getBGSCardGradingData: jest.fn(() => Promise.resolve(null)),
  insertBGSCardGradingData: jest.fn(() => Promise.resolve(1)),
  updateBGSCardGradingData: jest.fn(() => Promise.resolve(1)),
  getGradingStats: jest.fn(() => Promise.resolve({})),
  updateCardRecognitionInfo: jest.fn(() => Promise.resolve()),
  cleanupExpiredGradingData: jest.fn(() => Promise.resolve(5)),
  getExpiredGradingData: jest.fn(() => Promise.resolve([])),
  deleteGradingData: jest.fn(() => Promise.resolve(0)),
}));

describe('BGS 爬蟲服務測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bgsCrawlerService.isInitialized = false;
    bgsCrawlerService.robotsRules = null;
    
    // 重置模擬的 robotsTxtService
    robotsTxtService.checkRobotsTxt.mockReset();
    robotsTxtService.getCrawlDelay.mockReset();
    robotsTxtService.checkIfAllowed.mockReset();
    robotsTxtService.matchesPath.mockReset();
    robotsTxtService.generateSummary.mockReset();
  });

  describe('robots.txt 檢查', () => {
    it('應該正確解析 robots.txt', async () => {
      const mockRules = {
        userAgents: ['*', 'TCGAssistant/1.0'],
        disallow: ['/admin/', '/private/'],
        allow: ['/search'],
        crawlDelay: 1,
        isAllowed: true,
        hasRules: true,
        specificRules: true,
      };

      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce(mockRules);
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);

      await bgsCrawlerService.checkRobotsTxt();

      expect(robotsTxtService.checkRobotsTxt).toHaveBeenCalledWith(
        bgsCrawlerService.baseUrl,
        bgsCrawlerService.userAgent
      );
      expect(bgsCrawlerService.robotsRules).toEqual(mockRules);
      expect(bgsCrawlerService.requestDelay).toBe(1000);
    });

    it('應該正確檢查是否允許爬取', async () => {
      const mockRules = {
        userAgents: ['*'],
        disallow: ['/admin/'],
        allow: ['/search'],
        isAllowed: true,
        hasRules: true,
      };

      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce(mockRules);
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);
      robotsTxtService.checkIfAllowed.mockReturnValue(true);
      robotsTxtService.matchesPath.mockReturnValue(true);

      await bgsCrawlerService.checkRobotsTxt();

      expect(bgsCrawlerService.isAllowedToCrawl()).toBe(true);
      expect(bgsCrawlerService.matchesPath('/admin/', '/admin/')).toBe(true);
    });

    it('應該在 robots.txt 禁止時拋出錯誤', async () => {
      const mockRules = {
        userAgents: ['TCGAssistant/1.0'],
        disallow: ['/'],
        isAllowed: false,
        hasRules: true,
      };

      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce(mockRules);

      await expect(bgsCrawlerService.checkRobotsTxt()).rejects.toThrow('robots.txt 不允許爬取此網站');
    });
  });

  describe('評級資料搜索', () => {
    it('應該正確搜索卡牌評級數量', async () => {
      const mockHtmlResponse = `
        <div class="search-results">
          <div class="card-info">
            <h3>Charizard</h3>
            <p>Total Graded: 1,234</p>
            <p>BGS 10: 45</p>
            <p>BGS 9.5: 123</p>
            <p>BGS 9: 67</p>
            <p>PSA 10: 89</p>
          </div>
        </div>
      `;

      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);
      axios.get.mockResolvedValueOnce({ data: mockHtmlResponse }); // 搜索結果

      const result = await bgsCrawlerService.searchCardGradingCount('Charizard', 'Base Set');

      expect(result.cardName).toBe('Charizard');
      expect(result.totalGraded).toBe(1234);
      expect(result.gradeDistribution.BGS).toBeDefined();
      expect(result.gradeDistribution.BGS['10']).toBe(45);
      expect(result.gradeDistribution.BGS['9.5']).toBe(123);
      expect(result.gradeDistribution.BGS['9']).toBe(67);
      expect(result.gradeDistribution.PSA['10']).toBe(89);
      expect(parseFloat(result.averageGrade)).toBeGreaterThan(0);
      expect(result.source).toBe('BGS');
    });

    it('應該處理 BGS 特定的 .5 評級格式', async () => {
      const mockHtmlResponse = `
        <div class="search-results">
          <div class="card-info">
            <h3>Pikachu</h3>
            <p>BGS 9.5: 156</p>
            <p>BGS 8.5: 234</p>
            <p>BGS 7.5: 89</p>
          </div>
        </div>
      `;

      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);
      axios.get.mockResolvedValueOnce({ data: mockHtmlResponse });

      const result = await bgsCrawlerService.searchCardGradingCount('Pikachu');

      expect(result.gradeDistribution.BGS['9.5']).toBe(156);
      expect(result.gradeDistribution.BGS['8.5']).toBe(234);
      expect(result.gradeDistribution.BGS['7.5']).toBe(89);
    });

    it('應該處理搜索失敗的情況', async () => {
      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(bgsCrawlerService.searchCardGradingCount('TestCard')).rejects.toThrow('Network error');
    });
  });

  describe('資料庫整合', () => {
    it('應該正確儲存評級資料到資料庫', async () => {
      const mockGradingData = {
        cardName: 'TestCard',
        totalGraded: 100,
        gradeDistribution: { BGS: { '10': 10, '9.5': 20 } },
        averageGrade: 9.5,
        lastUpdated: new Date().toISOString(),
        source: 'BGS'
      };

      // 模擬資料庫操作
      databaseService.getBGSCardGradingData = jest.fn().mockResolvedValue(null);
      databaseService.insertBGSCardGradingData = jest.fn().mockResolvedValue(1);

      await bgsCrawlerService.saveGradingData('TestCard', 'TestSeries', mockGradingData);

      expect(databaseService.getBGSCardGradingData).toHaveBeenCalledWith('TestCard', 'TestSeries');
      expect(databaseService.insertBGSCardGradingData).toHaveBeenCalledWith('TestCard', 'TestSeries', mockGradingData);
    });

    it('應該正確更新現有評級資料', async () => {
      const existingData = {
        id: 1,
        cardName: 'TestCard',
        totalGraded: 50,
        lastUpdated: '2023-01-01T00:00:00Z'
      };

      const newGradingData = {
        cardName: 'TestCard',
        totalGraded: 100,
        gradeDistribution: { BGS: { '10': 10 } },
        averageGrade: 9.0,
        lastUpdated: new Date().toISOString(),
        source: 'BGS'
      };

      databaseService.getBGSCardGradingData = jest.fn().mockResolvedValue(existingData);
      databaseService.updateBGSCardGradingData = jest.fn().mockResolvedValue(1);

      await bgsCrawlerService.saveGradingData('TestCard', 'TestSeries', newGradingData);

      expect(databaseService.updateBGSCardGradingData).toHaveBeenCalledWith('TestCard', 'TestSeries', newGradingData);
    });
  });

  describe('批量處理', () => {
    it('應該正確批量搜索卡牌評級', async () => {
      const mockCards = [
        { name: 'Card1', series: 'Series1' },
        { name: 'Card2', series: 'Series2' },
        { name: 'Card3', series: 'Series3' }
      ];

      const mockGradingData = {
        cardName: 'TestCard',
        totalGraded: 100,
        gradeDistribution: {},
        averageGrade: 9.0,
        lastUpdated: new Date().toISOString(),
        source: 'BGS'
      };

      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);
      axios.get.mockResolvedValue({ data: '<div>Total Graded: 100</div>' });

      const results = await bgsCrawlerService.batchSearchGrading(mockCards, 1000);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[0].card.name).toBe('Card1');
      expect(results[0].gradingData).toBeDefined();
    });

    it('應該處理批量處理中的錯誤', async () => {
      const mockCards = [
        { name: 'Card1', series: 'Series1' },
        { name: 'Card2', series: 'Series2' }
      ];

      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);
      axios.get
        .mockResolvedValueOnce({ data: '<div>Total Graded: 100</div>' })
        .mockRejectedValueOnce(new Error('Network error'));

      const results = await bgsCrawlerService.batchSearchGrading(mockCards, 1000);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Network error');
    });
  });

  describe('服務狀態檢查', () => {
    it('應該正確檢查服務狀態', async () => {
      const mockRules = {
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      };
      
      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce(mockRules);
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);
      robotsTxtService.generateSummary.mockReturnValueOnce({
        hasRules: true,
        isAllowed: true,
        crawlDelay: 1,
      });

      const status = await bgsCrawlerService.checkServiceStatus();

      expect(status.status).toBe('active');
      expect(status.robotsTxtRespected).toBe(true);
      expect(status.isInitialized).toBe(true);
      expect(status.robotsTxtSummary).toBeDefined();
    });

    it('應該處理服務初始化失敗', async () => {
      robotsTxtService.checkRobotsTxt.mockRejectedValueOnce(new Error('Connection failed'));

      const status = await bgsCrawlerService.checkServiceStatus();

      expect(status.status).toBe('error');
      expect(status.error).toBe('Connection failed');
      expect(status.isInitialized).toBe(false);
    });
  });

  describe('卡牌服務整合', () => {
    it('應該正確獲取卡牌評級資訊', async () => {
      const mockGradingData = {
        cardName: 'TestCard',
        totalGraded: 100,
        gradeDistribution: {},
        averageGrade: 9.0,
        lastUpdated: new Date().toISOString(),
        source: 'BGS'
      };

      // 模擬 BGS 爬蟲服務
      bgsCrawlerService.getCachedGradingData = jest.fn().mockResolvedValue(null);
      bgsCrawlerService.searchCardGradingCount = jest.fn().mockResolvedValue(mockGradingData);
      
      // 模擬 robots.txt 檢查
      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);

      const result = await cardService.getCardGradingInfo('TestCard', 'TestSeries');

      expect(result).toEqual(mockGradingData);
      expect(bgsCrawlerService.searchCardGradingCount).toHaveBeenCalledWith('TestCard', 'TestSeries');
    });

    it('應該使用快取的資料當資料新鮮時', async () => {
      const freshData = {
        cardName: 'TestCard',
        totalGraded: 100,
        lastUpdated: new Date().toISOString(), // 現在的時間
        source: 'BGS'
      };

      bgsCrawlerService.getCachedGradingData = jest.fn().mockResolvedValue(freshData);
      
      // 模擬 robots.txt 檢查
      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);

      const result = await cardService.getCardGradingInfo('TestCard', 'TestSeries');

      expect(result).toEqual(freshData);
      expect(bgsCrawlerService.searchCardGradingCount).not.toHaveBeenCalled();
    });
  });

  describe('資料清理', () => {
    it('應該正確清理過期資料', async () => {
      // Mock robots.txt 檢查
      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);

      // Mock 資料庫操作
      databaseService.cleanupExpiredGradingData = jest.fn().mockResolvedValue(5);

      const result = await bgsCrawlerService.cleanupExpiredData(30);

      expect(result).toBe(5);
      expect(databaseService.cleanupExpiredGradingData).toHaveBeenCalledWith(30);
    });
  });

  describe('BGS 特定功能', () => {
    it('應該正確處理 BGS 的 .5 評級計算', () => {
      const gradeDistribution = {
        BGS: {
          '10': 10,
          '9.5': 20,
          '9': 15,
          '8.5': 25
        }
      };

      const averageGrade = bgsCrawlerService.calculateAverageGrade(gradeDistribution);
      
      // 計算: (10*10 + 9.5*20 + 9*15 + 8.5*25) / (10+20+15+25) = 9.25
      // 實際計算: (100 + 190 + 135 + 212.5) / 70 = 637.5 / 70 = 9.107
      expect(parseFloat(averageGrade)).toBeCloseTo(9.11, 2);
    });

    it('應該正確更新卡牌辨識資訊中的 BGS 欄位', async () => {
      const mockGradingData = {
        totalGraded: 150,
        averageGrade: 9.5,
        gradeDistribution: { BGS: { '10': 10, '9.5': 20 } },
        lastUpdated: new Date().toISOString()
      };

      databaseService.updateCardRecognitionInfo = jest.fn().mockResolvedValue();
      
      // 模擬 robots.txt 檢查
      robotsTxtService.checkRobotsTxt.mockResolvedValueOnce({
        isAllowed: true,
        crawlDelay: 1,
        hasRules: true,
      });
      robotsTxtService.getCrawlDelay.mockReturnValueOnce(1000);

      await bgsCrawlerService.updateCardRecognitionInfo('card123', mockGradingData);

      expect(databaseService.updateCardRecognitionInfo).toHaveBeenCalledWith('card123', {
        bgsGradingCount: 150,
        bgsAverageGrade: 9.5,
        bgsGradeDistribution: JSON.stringify({ BGS: { '10': 10, '9.5': 20 } }),
        bgsLastUpdated: mockGradingData.lastUpdated,
      });
    });
  });
});
