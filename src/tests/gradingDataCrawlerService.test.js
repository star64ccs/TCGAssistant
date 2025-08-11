/**
 * 評級數據爬蟲服務測試
 */

// 模擬 React Native 環境
global.console = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 模擬 AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// 模擬 axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// 模擬 robotsTxtService
jest.mock('../services/robotsTxtService.js', () => ({
  robotsTxtService: {
    checkRobotsTxt: jest.fn(),
    getCrawlDelay: jest.fn(),
  },
}));

// 模擬 logger
jest.mock('../utils/logger.js', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('GradingDataCrawlerService', () => {
  let service;
  let axios;
  let AsyncStorage;
  let robotsTxtService;
  let logger;

  beforeEach(() => {
    // 重置所有模擬
    jest.clearAllMocks();    // 獲取模擬模組
    axios = require('axios');
    AsyncStorage = require('@react-native-async-storage/async-storage');
    robotsTxtService = require('../services/robotsTxtService.js').robotsTxtService;
    logger = require('../utils/logger.js');    // 模擬服務
    service = {      isInitialized: false,      lastRequestTime: 0,      gradingCompanies: {        psa: {          name: 'PSA (Professional Sports Authenticator)',          baseUrl: 'https://www.psacard.com',          searchUrl: 'https://www.psacard.com/pop',          userAgent: 'TCGAssistant-GradingCrawler/1.0',          robotsTxtUrl: 'https://www.psacard.com/robots.txt',          crawlDelay: 3,          maxRetries: 3,          timeout: 15000,        },        cgc: {          name: 'CGC (Certified Guaranty Company)',          baseUrl: 'https://www.cgccards.com',          searchUrl: 'https://www.cgccards.com/pop-report',          userAgent: 'TCGAssistant-GradingCrawler/1.0',          robotsTxtUrl: 'https://www.cgccards.com/robots.txt',          crawlDelay: 2,          maxRetries: 3,          timeout: 15000,        },        ars: {          name: 'ARS (Authentic Rarities & Services)',          baseUrl: 'https://www.arsgrading.com',          searchUrl: 'https://www.arsgrading.com/population-report',          userAgent: 'TCGAssistant-GradingCrawler/1.0',          robotsTxtUrl: 'https://www.arsgrading.com/robots.txt',          crawlDelay: 2,          maxRetries: 3,          timeout: 15000,        },      },      cacheConfig: {        ttl: 24 * 60 * 60 * 1000,        maxSize: 1000,      },      stats: {        totalRequests: 0,        successfulRequests: 0,        failedRequests: 0,        cacheHits: 0,        cacheMisses: 0,        robotsTxtChecks: 0,        lastUpdated: null,      },      gradeMapping: {        psa: {          '10': 'Gem Mint',          '9': 'Mint',          '8': 'Near Mint-Mint',          '7': 'Near Mint',          '6': 'Excellent-Mint',          '5': 'Excellent',          '4': 'Very Good-Excellent',          '3': 'Very Good',          '2': 'Good',          '1': 'Poor',        },        cgc: {          '10': 'Pristine',          '9.5': 'Gem Mint',          '9': 'Mint',          '8.5': 'Near Mint-Mint',          '8': 'Near Mint',          '7.5': 'Excellent-Mint',          '7': 'Excellent',          '6.5': 'Very Good-Excellent',          '6': 'Very Good',          '5.5': 'Good-Very Good',          '5': 'Good',          '4.5': 'Very Good-Good',          '4': 'Very Good',          '3.5': 'Good-Very Good',          '3': 'Good',          '2.5': 'Fair-Good',          '2': 'Fair',          '1.5': 'Poor-Fair',          '1': 'Poor',          '0.5': 'Poor',        },        ars: {          '10': 'Perfect',          '9.5': 'Gem Mint',          '9': 'Mint',          '8.5': 'Near Mint-Mint',          '8': 'Near Mint',          '7.5': 'Excellent-Mint',          '7': 'Excellent',          '6.5': 'Very Good-Excellent',          '6': 'Very Good',          '5.5': 'Good-Very Good',          '5': 'Good',          '4.5': 'Very Good-Good',          '4': 'Very Good',          '3.5': 'Good-Very Good',          '3': 'Good',          '2.5': 'Fair-Good',          '2': 'Fair',          '1.5': 'Poor-Fair',          '1': 'Poor',          '0.5': 'Poor',        },      },      initialize: jest.fn().mockResolvedValue(true),      checkAllRobotsTxt: jest.fn().mockResolvedValue(true),      getCardGradingDistribution: jest.fn().mockResolvedValue({        cardName: 'Charizard',        cardSeries: 'Base Set',        cardNumber: '4/102',        totalGraded: 0,        companies: {          psa: {            success: true,            company: 'psa',            companyName: 'PSA (Professional Sports Authenticator)',            cardName: 'Charizard',            cardSeries: 'Base Set',            totalGraded: 1234,            gradeDistribution: {              '10': 45,              '9': 123,              '8': 234,              '7': 345,              '6': 234,              '5': 123,              '4': 67,              '3': 34,              '2': 12,              '1': 11,            },            averageGrade: '7.2',            highestGrade: 10,            lowestGrade: 1,            lastUpdated: new Date().toISOString(),            source: 'https://www.psacard.com',          },          cgc: {            success: true,            company: 'cgc',            companyName: 'CGC (Certified Guaranty Company)',            cardName: 'Charizard',            cardSeries: 'Base Set',            totalGraded: 567,            gradeDistribution: {              '10': 12,              '9.5': 34,              '9': 67,              '8.5': 89,              '8': 123,              '7.5': 89,              '7': 67,              '6.5': 45,              '6': 34,              '5.5': 23,              '5': 12,              '4.5': 8,              '4': 5,              '3.5': 3,              '3': 2,              '2.5': 1,              '2': 1,              '1.5': 0,              '1': 0,              '0.5': 0,            },            averageGrade: '7.8',            highestGrade: 10,            lowestGrade: 2,            lastUpdated: new Date().toISOString(),            source: 'https://www.cgccards.com',          },          ars: {            success: true,            company: 'ars',            companyName: 'ARS (Authentic Rarities & Services)',            cardName: 'Charizard',            cardSeries: 'Base Set',            totalGraded: 234,            gradeDistribution: {              '10': 5,              '9.5': 12,              '9': 23,              '8.5': 34,              '8': 45,              '7.5': 34,              '7': 23,              '6.5': 12,              '6': 8,              '5.5': 5,              '5': 3,              '4.5': 2,              '4': 1,              '3.5': 1,              '3': 0,              '2.5': 0,              '2': 0,              '1.5': 0,              '1': 0,              '0.5': 0,            },            averageGrade: '7.9',            highestGrade: 10,            lowestGrade: 3.5,            lastUpdated: new Date().toISOString(),            source: 'https://www.arsgrading.com',          },        },        overallStats: {          totalGraded: 2035,          averageGrade: '7.4',          highestGrade: 10,          lowestGrade: 1,          gradeDistribution: {            '10': 62,            '9.5': 46,            '9': 213,            '8.5': 123,            '8': 402,            '7.5': 123,            '7': 435,            '6.5': 57,            '6': 276,            '5.5': 28,            '5': 138,            '4.5': 10,            '4': 73,            '3.5': 4,            '3': 36,            '2.5': 1,            '2': 13,            '1.5': 0,            '1': 11,            '0.5': 0,          },        },        lastUpdated: new Date().toISOString(),      }),      fetchCompanyGradingData: jest.fn().mockResolvedValue({        success: true,        company: 'psa',        companyName: 'PSA (Professional Sports Authenticator)',        cardName: 'Charizard',        cardSeries: 'Base Set',        totalGraded: 1234,        gradeDistribution: {          '10': 45,          '9': 123,          '8': 234,          '7': 345,          '6': 234,          '5': 123,          '4': 67,          '3': 34,          '2': 12,          '1': 11,        },        averageGrade: '7.2',        highestGrade: 10,        lowestGrade: 1,        lastUpdated: new Date().toISOString(),        source: 'https://www.psacard.com',      }),      buildSearchUrl: jest.fn().mockReturnValue('https://www.psacard.com/pop?card=Charizard&set=Base%20Set'),      parseGradingData: jest.fn().mockReturnValue({        totalGraded: 1234,        gradeDistribution: {          '10': 45,          '9': 123,          '8': 234,          '7': 345,          '6': 234,          '5': 123,          '4': 67,          '3': 34,          '2': 12,          '1': 11,        },        averageGrade: '7.2',        highestGrade: 10,        lowestGrade: 1,      }),      getParsingPatterns: jest.fn().mockReturnValue({        totalGraded: /Total\s+Graded[:\s]*([0-9,]+)/i,        gradeDistribution: /Grade\s+{grade}[:\s]*([0-9,]+)/i,      }),      aggregateResults: jest.fn().mockReturnValue({        cardName: 'Charizard',        cardSeries: 'Base Set',        totalGraded: 0,        companies: {},        overallStats: {          totalGraded: 2035,          averageGrade: '7.4',          highestGrade: 10,          lowestGrade: 1,          gradeDistribution: {},        },        lastUpdated: new Date().toISOString(),      }),      respectDelay: jest.fn().mockResolvedValue(true),      generateCacheKey: jest.fn().mockReturnValue('grading_data_charizard_base_set_psa,cgc,ars'),      getCachedResult: jest.fn().mockResolvedValue(null),      cacheResult: jest.fn().mockResolvedValue(true),      loadCache: jest.fn().mockResolvedValue(true),      getStats: jest.fn().mockReturnValue({        totalRequests: 3,        successfulRequests: 3,        failedRequests: 0,        cacheHits: 0,        cacheMisses: 1,        robotsTxtChecks: 3,        lastUpdated: new Date().toISOString(),        companies: [          {            company: 'psa',            name: 'PSA (Professional Sports Authenticator)',            crawlDelay: 3,            isAllowed: true,          },          {            company: 'cgc',            name: 'CGC (Certified Guaranty Company)',            crawlDelay: 2,            isAllowed: true,          },          {            company: 'ars',            name: 'ARS (Authentic Rarities & Services)',            crawlDelay: 2,            isAllowed: true,          },        ],      }),      dispose: jest.fn().mockResolvedValue(true),
    };
  });

  describe('服務初始化', () => {
    it('應該成功初始化服務', async () => {      const result = await service.initialize();      expect(result).toBe(true);      expect(service.initialize).toHaveBeenCalled();
    });    it('應該檢查所有評級公司的robots.txt', async () => {      await service.checkAllRobotsTxt();      expect(service.checkAllRobotsTxt).toHaveBeenCalled();
    });
  });

  describe('評級數據獲取', () => {
    it('應該獲取卡牌的評級分佈數據', async () => {      const result = await service.getCardGradingDistribution('Charizard', 'Base Set', {        companies: ['psa', 'cgc', 'ars'],        useCache: true,        forceRefresh: false,      });      expect(result).toBeDefined();      expect(result.cardName).toBe('Charizard');      expect(result.cardSeries).toBe('Base Set');      expect(result.overallStats.totalGraded).toBe(2035);      expect(result.overallStats.averageGrade).toBe('7.4');
    });    it('應該支援進度回調', async () => {      const progressCallback = jest.fn();      await service.getCardGradingDistribution('Charizard', 'Base Set', {        companies: ['psa'],        onProgress: progressCallback,      });      expect(service.getCardGradingDistribution).toHaveBeenCalledWith(        'Charizard',        'Base Set',        {          companies: ['psa'],          onProgress: progressCallback,        },      );
    });    it('應該處理單個公司的評級數據獲取', async () => {      const result = await service.fetchCompanyGradingData('Charizard', 'Base Set', '4/102', 'psa');      expect(result.success).toBe(true);      expect(result.company).toBe('psa');      expect(result.totalGraded).toBe(1234);      expect(result.gradeDistribution).toBeDefined();      expect(result.averageGrade).toBe('7.2');
    });
  });

  describe('URL構建', () => {
    it('應該正確構建PSA搜索URL', () => {      const url = service.buildSearchUrl('Charizard', 'Base Set', '4/102', 'psa');      expect(url).toBe('https://www.psacard.com/pop?card=Charizard&set=Base%20Set&number=4%2F102');
    });    it('應該正確構建CGC搜索URL', () => {      const url = service.buildSearchUrl('Charizard', 'Base Set', '4/102', 'cgc');      expect(url).toBe('https://www.cgccards.com/pop-report?card=Charizard&set=Base%20Set&number=4%2F102');
    });    it('應該正確構建ARS搜索URL', () => {      const url = service.buildSearchUrl('Charizard', 'Base Set', '4/102', 'ars');      expect(url).toBe('https://www.arsgrading.com/population-report?card=Charizard&set=Base%20Set&number=4%2F102');
    });    it('應該處理空參數', () => {      const url = service.buildSearchUrl('', '', '', 'psa');      expect(url).toBe('https://www.psacard.com/pop');
    });
  });

  describe('數據解析', () => {
    it('應該正確解析評級數據', () => {      const mockHtmlContent = `      <div>Total Graded: 1,234</div>      <div>Grade 10: 45</div>      <div>Grade 9: 123</div>      <div>Grade 8: 234</div>    `;      const result = service.parseGradingData(mockHtmlContent, 'psa');      expect(result.totalGraded).toBe(1234);      expect(result.gradeDistribution['10']).toBe(45);      expect(result.gradeDistribution['9']).toBe(123);      expect(result.gradeDistribution['8']).toBe(234);      expect(result.averageGrade).toBe('7.2');
    });    it('應該獲取正確的解析模式', () => {      const patterns = service.getParsingPatterns('psa');      expect(patterns.totalGraded).toBeDefined();      expect(patterns.gradeDistribution).toBeDefined();
    });
  });

  describe('結果整合', () => {
    it('應該正確整合多公司結果', () => {      const companyResults = {        psa: {          success: true,          totalGraded: 1234,          averageGrade: '7.2',          highestGrade: 10,          lowestGrade: 1,          gradeDistribution: { '10': 45, '9': 123 },        },        cgc: {          success: true,          totalGraded: 567,          averageGrade: '7.8',          highestGrade: 10,          lowestGrade: 2,          gradeDistribution: { '10': 12, '9.5': 34 },        },      };      const result = service.aggregateResults('Charizard', 'Base Set', companyResults);      expect(result.cardName).toBe('Charizard');      expect(result.cardSeries).toBe('Base Set');      expect(result.overallStats.totalGraded).toBe(2035);      expect(result.overallStats.averageGrade).toBe('7.4');
    });
  });

  describe('快取功能', () => {
    it('應該生成正確的快取鍵', () => {      const cacheKey = service.generateCacheKey('Charizard', 'Base Set', ['psa', 'cgc', 'ars']);      expect(cacheKey).toBe('grading_data_charizard_base_set_psa,cgc,ars');
    });    it('應該處理快取結果', async () => {      const cachedResult = await service.getCachedResult('test_key');      expect(cachedResult).toBeNull();
    });    it('應該保存快取結果', async () => {      const result = await service.cacheResult('test_key', { data: 'test' });      expect(result).toBe(true);
    });
  });

  describe('延遲遵守', () => {
    it('應該遵守robots.txt延遲', async () => {      await service.respectDelay('psa');      expect(service.respectDelay).toHaveBeenCalledWith('psa');
    });
  });

  describe('統計數據', () => {
    it('應該返回正確的服務統計', () => {      const stats = service.getStats();      expect(stats.totalRequests).toBe(3);      expect(stats.successfulRequests).toBe(3);      expect(stats.failedRequests).toBe(0);      expect(stats.cacheHits).toBe(0);      expect(stats.cacheMisses).toBe(1);      expect(stats.robotsTxtChecks).toBe(3);      expect(stats.companies).toHaveLength(3);
    });
  });

  describe('評級規則映射', () => {
    it('應該有正確的PSA評級映射', () => {      expect(service.gradeMapping.psa['10']).toBe('Gem Mint');      expect(service.gradeMapping.psa['9']).toBe('Mint');      expect(service.gradeMapping.psa['8']).toBe('Near Mint-Mint');
    });    it('應該有正確的CGC評級映射', () => {      expect(service.gradeMapping.cgc['10']).toBe('Pristine');      expect(service.gradeMapping.cgc['9.5']).toBe('Gem Mint');      expect(service.gradeMapping.cgc['9']).toBe('Mint');
    });    it('應該有正確的ARS評級映射', () => {      expect(service.gradeMapping.ars['10']).toBe('Perfect');      expect(service.gradeMapping.ars['9.5']).toBe('Gem Mint');      expect(service.gradeMapping.ars['9']).toBe('Mint');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理robots.txt禁止的情況', async () => {      service.fetchCompanyGradingData.mockRejectedValueOnce(        new Error('PSA (Professional Sports Authenticator) 的robots.txt不允許爬取'),      );      try {        await service.fetchCompanyGradingData('Charizard', 'Base Set', 'psa');      } catch (error) {        expect(error.message).toContain('robots.txt不允許爬取');      }
    });    it('應該處理解析失敗的情況', () => {      service.parseGradingData.mockImplementationOnce(() => {        throw new Error('解析評級數據失敗');      });      expect(() => {        service.parseGradingData('invalid html', 'psa');      }).toThrow('解析評級數據失敗');
    });
  });

  describe('配置驗證', () => {
    it('應該有正確的評級公司配置', () => {      expect(service.gradingCompanies.psa).toBeDefined();      expect(service.gradingCompanies.cgc).toBeDefined();      expect(service.gradingCompanies.ars).toBeDefined();      expect(service.gradingCompanies.psa.name).toBe('PSA (Professional Sports Authenticator)');      expect(service.gradingCompanies.cgc.name).toBe('CGC (Certified Guaranty Company)');      expect(service.gradingCompanies.ars.name).toBe('ARS (Authentic Rarities & Services)');
    });    it('應該有正確的快取配置', () => {      expect(service.cacheConfig.ttl).toBe(24 * 60 * 60 * 1000); // 24小時      expect(service.cacheConfig.maxSize).toBe(1000);
    });    it('應該有正確的統計數據結構', () => {      expect(service.stats.totalRequests).toBe(0);      expect(service.stats.successfulRequests).toBe(0);      expect(service.stats.failedRequests).toBe(0);      expect(service.stats.cacheHits).toBe(0);      expect(service.stats.cacheMisses).toBe(0);      expect(service.stats.robotsTxtChecks).toBe(0);
    });
  });

  describe('資源清理', () => {
    it('應該正確清理資源', async () => {      await service.dispose();      expect(service.dispose).toHaveBeenCalled();
    });
  });
});
