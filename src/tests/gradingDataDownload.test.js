/**
 * 評級數據下載功能測試
 */

import { getEnhancedGradingDatabase } from '../services/enhancedGradingDatabase';
import { getGradingDataCrawlerService } from '../services/gradingDataCrawlerService';
import databaseService from '../services/databaseService';

// Mock React Native modules
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(() => Promise.resolve([{ rows: { length: 0, item: () => {} } }])),
  })),
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('評級數據下載功能測試', () => {
  let enhancedDB;
  let crawlerService;

  beforeEach(() => {
    enhancedDB = getEnhancedGradingDatabase();
    crawlerService = getGradingDataCrawlerService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('增強版評級數據庫服務', () => {
    it('應該正確初始化', async () => {      const mockDatabase = {        executeSql: jest.fn(() => Promise.resolve([{ rows: { length: 0 } }])),      };      databaseService.database = mockDatabase;      databaseService.insertGradingInstitution = jest.fn(() => Promise.resolve(1));      databaseService.loadStats = jest.fn(() => Promise.resolve());      await enhancedDB.initialize();      expect(enhancedDB.isInitialized).toBe(true);
    });    it('應該正確下載單張卡牌評級數據', async () => {      const mockGradingData = {        success: true,        data: {          psa: {            totalGraded: 1000,            averageGrade: 8.5,            gradeDistribution: { '10': 50, '9': 200, '8': 400 },          },        },      };      crawlerService.getCardGradingDistribution = jest.fn(() => Promise.resolve(mockGradingData));      databaseService.insertCardGradingData = jest.fn(() => Promise.resolve(1));      const result = await enhancedDB.downloadCardGradingData(        'Charizard',        'Base Set',        '4/102',        ['PSA'],      );      expect(result.success).toBe(true);      expect(result.data.cardName).toBe('Charizard');      expect(result.data.cardSeries).toBe('Base Set');
    });    it('應該正確批量下載評級數據', async () => {      const cardList = [        { name: 'Charizard', series: 'Base Set', number: '4/102' },        { name: 'Blastoise', series: 'Base Set', number: '2/102' },      ];      const mockGradingData = {        success: true,        data: {          psa: {            totalGraded: 1000,            averageGrade: 8.5,            gradeDistribution: { '10': 50, '9': 200, '8': 400 },          },        },      };      enhancedDB.downloadCardGradingData = jest.fn(() => Promise.resolve(mockGradingData));      enhancedDB.saveGradingData = jest.fn(() => Promise.resolve());      enhancedDB.updateStats = jest.fn(() => Promise.resolve());      const results = await enhancedDB.batchDownloadGradingData(cardList, {        institutions: ['PSA'],        batchSize: 2,      });      expect(results.total).toBe(2);      expect(results.successful).toBe(2);      expect(results.failed).toBe(0);
    });    it('應該正確生成投資建議', async () => {      const mockGradingData = {        totalGraded: 1000,        averageGrade: 8.5,        gradeDistribution: { '10': 50, '9': 200, '8': 400 },      };      enhancedDB.getCardGradingData = jest.fn(() => Promise.resolve(mockGradingData));      enhancedDB.analyzeMarketTrends = jest.fn(() => Promise.resolve({        gradeInflation: 0.05,        marketSaturation: 0.3,        demandTrend: 'increasing',        priceCorrelation: 0.85,      }));      enhancedDB.assessInvestmentRisk = jest.fn(() => Promise.resolve({        riskLevel: 'medium',        riskFactors: ['market_volatility'],        riskScore: 0.6,      }));      databaseService.insertInvestmentAdvice = jest.fn(() => Promise.resolve(1));      const advice = await enhancedDB.generateInvestmentAdvice('charizard_base_4');      expect(advice.cardId).toBe('charizard_base_4');      expect(advice.adviceType).toBe('buy');      expect(advice.confidenceScore).toBe(0.85);
    });
  });

  describe('數據庫服務評級數據方法', () => {
    it('應該正確插入評級機構', async () => {      const mockDatabase = {        executeSql: jest.fn(() => Promise.resolve([{ insertId: 1 }])),      };      databaseService.database = mockDatabase;      const institution = {        code: 'PSA',        name: 'Professional Sports Authenticator',        baseUrl: 'https://www.psacard.com',        apiEndpoint: 'https://www.psacard.com/pop',        syncFrequency: 86400,      };      const result = await databaseService.insertGradingInstitution(institution);      expect(result).toBe(1);      expect(mockDatabase.executeSql).toHaveBeenCalledWith(        expect.stringContaining('INSERT OR REPLACE INTO grading_institutions'),        expect.arrayContaining(['PSA', 'Professional Sports Authenticator']),      );
    });    it('應該正確插入卡牌評級數據', async () => {      const mockDatabase = {        executeSql: jest.fn(() => Promise.resolve([{ insertId: 1 }])),      };      databaseService.database = mockDatabase;      const gradingData = {        cardName: 'Charizard',        cardSeries: 'Base Set',        cardNumber: '4/102',        institutionCode: 'PSA',        totalGraded: 1000,        averageGrade: 8.5,        gradeDistribution: JSON.stringify({ '10': 50, '9': 200 }),        priceData: JSON.stringify({ current: 500 }),        marketTrends: JSON.stringify({ trend: 'up' }),      };      const result = await databaseService.insertCardGradingData(gradingData);      expect(result).toBe(1);      expect(mockDatabase.executeSql).toHaveBeenCalledWith(        expect.stringContaining('INSERT OR REPLACE INTO card_grading_data'),        expect.arrayContaining(['Charizard', 'Base Set', '4/102', 'PSA']),      );
    });    it('應該正確獲取卡牌評級數據', async () => {      const mockData = {        cardName: 'Charizard',        cardSeries: 'Base Set',        cardNumber: '4/102',        institutionCode: 'PSA',        totalGraded: 1000,        averageGrade: 8.5,        gradeDistribution: JSON.stringify({ '10': 50, '9': 200 }),        priceData: JSON.stringify({ current: 500 }),        marketTrends: JSON.stringify({ trend: 'up' }),      };      const mockDatabase = {        executeSql: jest.fn(() => Promise.resolve([{          rows: { length: 1, item: () => mockData },        }])),      };      databaseService.database = mockDatabase;      const result = await databaseService.getCardGradingData(        'Charizard',        'Base Set',        '4/102',        'PSA',      );      expect(result).toBeDefined();      expect(result.cardName).toBe('Charizard');      expect(result.gradeDistribution).toEqual({ '10': 50, '9': 200 });      expect(result.priceData).toEqual({ current: 500 });
    });    it('應該正確獲取評級統計數據', async () => {      const mockStats = {        totalCards: 100,        totalRecords: 500,        avgGrade: 8.2,        totalGraded_cards: 1000,      };      const mockDatabase = {        executeSql: jest.fn(() => Promise.resolve([{          rows: { length: 1, item: () => mockStats },        }])),      };      databaseService.database = mockDatabase;      const result = await databaseService.getGradingStats();      expect(result.totalCards).toBe(100);      expect(result.totalRecords).toBe(500);      expect(result.avgGrade).toBe(8.2);      expect(result.totalGraded_cards).toBe(1000);
    });
  });

  describe('錯誤處理', () => {
    it('應該正確處理下載失敗的情況', async () => {      crawlerService.getCardGradingDistribution = jest.fn(() => {        throw new Error('Network error');      });      const result = await enhancedDB.downloadCardGradingData(        'Charizard',        'Base Set',        '4/102',        ['PSA'],      );      expect(result.success).toBe(false);      expect(result.error).toBe('Network error');
    });    it('應該正確處理數據庫錯誤', async () => {      const mockDatabase = {        executeSql: jest.fn(() => {          throw new Error('Database error');        }),      };      databaseService.database = mockDatabase;      await expect(        databaseService.insertCardGradingData({}),      ).rejects.toThrow('Database error');
    });
  });

  describe('性能測試', () => {
    it('應該能夠處理大量數據', async () => {      const largeCardList = Array.from({ length: 100 }, (_, i) => ({        name: `Card${i}`,        series: 'Test Set',        number: `${i + 1}/100`,      }));      const mockGradingData = {        success: true,        data: {          psa: {            totalGraded: 1000,            averageGrade: 8.5,            gradeDistribution: { '10': 50, '9': 200, '8': 400 },          },        },      };      enhancedDB.downloadCardGradingData = jest.fn(() => Promise.resolve(mockGradingData));      enhancedDB.saveGradingData = jest.fn(() => Promise.resolve());      enhancedDB.updateStats = jest.fn(() => Promise.resolve());      const startTime = Date.now();      const results = await enhancedDB.batchDownloadGradingData(largeCardList, {        institutions: ['PSA'],        batchSize: 10,      });      const endTime = Date.now();      expect(results.total).toBe(100);      expect(endTime - startTime).toBeLessThan(10000); // 應該在10秒內完成
    });
  });
});
