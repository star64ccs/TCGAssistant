import priceApiService from '../services/priceApiService';

// 模擬 axios
jest.mock('axios');
const axios = require('axios');

// 模擬通知工具
jest.mock('../utils/notificationUtils', () => ({
  sendSuccessNotification: jest.fn(),
  sendErrorNotification: jest.fn(),
}));

// 模擬爬蟲服務
jest.mock('../services/mercariCrawlerService', () => ({
  init: jest.fn().mockResolvedValue(true),
  searchCard: jest.fn().mockResolvedValue({
    success: true,
    data: [      {        title: 'ピカチュウ カード',
        price: 1500,
        platform: 'MERCARI',
        currency: 'JPY',
      },
    ],
    totalResults: 1,
  }),
}));

jest.mock('../services/snkrdunkCrawlerService', () => ({
  init: jest.fn().mockResolvedValue(true),
  searchCard: jest.fn().mockResolvedValue({
    success: true,
    data: [      {        title: 'ピカチュウ カード',
        price: 2000,
        platform: 'SNKRDUNK',
        currency: 'JPY',
      },
    ],
    totalResults: 1,
  }),
}));

describe('PriceApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    priceApiService.cache.clear();    // 模擬有可用的API，包括爬蟲平台
    priceApiService.activeApis = ['TCGPLAYER', 'EBAY', 'CARDMARKET', 'MERCARI', 'SNKRDUNK'];
  });

  describe('API檢測', () => {
    test('應該正確檢測可用的API', () => {      const status = priceApiService.getApiStatus();      expect(status).toHaveProperty('activeApis');      expect(status).toHaveProperty('totalApis');      expect(status).toHaveProperty('cacheSize');      expect(Array.isArray(status.activeApis)).toBe(true);
    });
  });

  describe('價格查詢', () => {
    const mockCardInfo = {      name: '皮卡丘 VMAX',
      series: 'Sword & Shield',
      gameType: 'pokemon',
      cardNumber: '044/185',
    };    test('應該成功查詢價格', async () => {
    // 模擬TCGPlayer API響應      axios.get.mockResolvedValueOnce({        data: {          results: [            {              productId: 12345,
              name: '皮卡丘 VMAX',
              cleanName: 'Pikachu VMAX',
            },          ],        },      });      axios.get.mockResolvedValueOnce({
        data: {          results: [            {              lowPrice: 40.00,
              midPrice: 45.00,
              highPrice: 50.00,
            },          ],        },      });      const result = await priceApiService.getCardPrices(mockCardInfo, {
        platforms: ['TCGPLAYER'],
        useCache: false,
      });      expect(result.success).toBe(true);      expect(result.data).toHaveProperty('average');      expect(result.data).toHaveProperty('platforms');      expect(result.platformsUsed).toContain('TCGPLAYER');
    });    test('應該處理API錯誤', async () => {
      axios.get.mockRejectedValueOnce(new Error('API錯誤'));      const result = await priceApiService.getCardPrices(mockCardInfo, {        platforms: ['TCGPLAYER'],
        useCache: false,
      });      expect(result.success).toBe(false);      expect(result.error).toContain('所有價格API都失敗了');
    });    test('應該使用快取', async () => {
    // 第一次查詢      axios.get.mockResolvedValueOnce({        data: {          results: [            {              productId: 12345,
              name: '皮卡丘 VMAX',
            },          ],        },      });      axios.get.mockResolvedValueOnce({
        data: {          results: [            {              lowPrice: 40.00,
              midPrice: 45.00,
              highPrice: 50.00,
            },          ],        },      });      const result1 = await priceApiService.getCardPrices(mockCardInfo, {
        platforms: ['TCGPLAYER'],
        useCache: true,
      });      // 第二次查詢應該使用快取      const result2 = await priceApiService.getCardPrices(mockCardInfo, {
        platforms: ['TCGPLAYER'],
        useCache: true,
      });      expect(result1.success).toBe(true);      expect(result2.success).toBe(true);      expect(result1.data).toEqual(result2.data);      expect(axios.get).toHaveBeenCalledTimes(2); // 只調用兩次API
    });
  });

  describe('平台特定查詢', () => {
    const mockCardInfo = {      name: '路飛',
      series: 'One Piece TCG',
      gameType: 'one-piece',
    };    test('TCGPlayer API查詢', async () => {
      axios.get.mockResolvedValueOnce({        data: {          results: [            {              productId: 67890,
              name: '路飛',
            },          ],        },      });      axios.get.mockResolvedValueOnce({
        data: {          results: [            {              lowPrice: 15.00,
              midPrice: 18.00,
              highPrice: 22.00,
            },          ],        },      });      const result = await priceApiService.getTcgPlayerPrice(mockCardInfo, 30000);      expect(result.platform).toBe('TCGPLAYER');      expect(result.prices).toHaveProperty('average');      expect(result.prices).toHaveProperty('median');      expect(result.prices).toHaveProperty('min');      expect(result.prices).toHaveProperty('max');
    });    test('eBay API查詢', async () => {
      axios.get.mockResolvedValueOnce({        data: {          itemSummaries: [            {              price: { value: '20.00',
              },            },            { price: { value: '25.00' },            },            { price: { value: '18.00' },            },          ],        },      });      const result = await priceApiService.getEbayPrice(mockCardInfo, 30000);      expect(result.platform).toBe('EBAY');      expect(result.prices.average).toBeGreaterThan(0);      expect(result.currency).toBe('USD');
    });    test('Cardmarket API查詢', async () => {
      axios.get.mockResolvedValueOnce({        data: {          data: [            {              priceGuide: {                SELL: '25.50',
              },            },            {
              priceGuide: {                SELL: '28.00',
              },            },          ],        },      });      const result = await priceApiService.getCardmarketPrice(mockCardInfo, 30000);      expect(result.platform).toBe('CARDMARKET');      expect(result.prices.average).toBeGreaterThan(0);      expect(result.currency).toBe('EUR');
    });    test('PriceCharting API查詢', async () => {
      axios.get.mockResolvedValueOnce({        data: {          price: '30.00',
        },      });      const result = await priceApiService.getPriceChartingPrice(mockCardInfo, 30000);      expect(result.platform).toBe('PRICECHARTING');      expect(result.prices.average).toBe(30.00);      expect(result.currency).toBe('USD');
    });
  });

  describe('數據整合', () => {
    test('應該正確整合多平台價格', () => {      const mockResults = [        {          platform: 'TCGPLAYER',
          prices: {            average: 40.00,
            median: 42.00,
            min: 35.00,
            max: 50.00,
          },
          currency: 'USD',        },        {
          platform: 'EBAY',
          prices: {            average: 45.00,
            median: 44.00,
            min: 38.00,
            max: 55.00,
          },
          currency: 'USD',        },      ];      const aggregated = priceApiService.aggregatePrices(mockResults, { name: '測試卡牌' });      expect(aggregated.average).toBe(42.5); // (40 + 45) / 2      expect(aggregated.median).toBe(42.5); // (42 + 44) / 2      expect(aggregated.min).toBe(35.00); // 修正：應該是最小值35      expect(aggregated.max).toBe(55.00);      expect(aggregated.totalResults).toBe(2);      expect(aggregated.platforms).toHaveProperty('TCGPLAYER');      expect(aggregated.platforms).toHaveProperty('EBAY');
    });    test('應該正確計算中位數', () => {
      const numbers = [1, 3, 5, 7, 9];      const median = priceApiService.calculateMedian(numbers);      expect(median).toBe(5);      const evenNumbers = [1, 3, 5, 7];      const evenMedian = priceApiService.calculateMedian(evenNumbers);      expect(evenMedian).toBe(4); // (3 + 5) / 2
    });
  });

  describe('快取管理', () => {
    test('應該正確生成快取鍵', () => {      const cardInfo = { name: '測試卡牌', series: '測試系列',
      };      const platforms = ['TCGPLAYER', 'EBAY'];      const cacheKey = priceApiService.generateCacheKey(cardInfo, platforms);      expect(cacheKey).toBe('price_測試卡牌_測試系列_TCGPLAYER_EBAY');
    });    test('應該清除快取', () => {
    // 添加一些測試數據到快取      priceApiService.cache.set('test_key_1', { data: 'test1', timestamp: Date.now(),
      });      priceApiService.cache.set('test_key_2', { data: 'test2', timestamp: Date.now() });      expect(priceApiService.cache.size).toBe(2);      // 清除特定快取      priceApiService.clearCache('test_key_1');      expect(priceApiService.cache.size).toBe(1);      expect(priceApiService.cache.has('test_key_2')).toBe(true);      // 清除所有快取      priceApiService.clearCache();      expect(priceApiService.cache.size).toBe(0);
    });
  });

  describe('錯誤處理', () => {
    test('應該處理沒有價格數據的情況', async () => {      axios.get.mockResolvedValueOnce({        data: {          results: [],
        },      });      await expect(priceApiService.getTcgPlayerPrice(        { name: '不存在的卡牌' },        30000,      )).rejects.toThrow('未找到卡牌');
    });    test('應該處理無效價格數據', async () => {
      axios.get.mockResolvedValueOnce({        data: {          results: [            {              productId: 12345,
              name: '測試卡牌',
            },          ],        },      });      axios.get.mockResolvedValueOnce({
        data: {          results: [            {              lowPrice: 0,
              midPrice: 0,
              highPrice: 0,
            },          ],        },      });      await expect(priceApiService.getTcgPlayerPrice(        { name: '測試卡牌' },        30000,      )).rejects.toThrow('沒有有效的價格數據');
    });
  });

  describe('遊戲類型映射', () => {
    test('應該正確映射遊戲類型', () => {      expect(priceApiService.mapGameType('pokemon')).toBe(3);      expect(priceApiService.mapGameType('one-piece')).toBe(4);      expect(priceApiService.mapGameType('yugioh')).toBe(1);      expect(priceApiService.mapGameType('magic')).toBe(2);      expect(priceApiService.mapGameType('unknown')).toBe(3); // 預設值
    });
  });

  describe('模擬價格生成', () => {
    test('應該生成合理的模擬價格', () => {      const cardInfo = { name: '測試卡牌',
      };      const mockPrice = priceApiService.generateMockPrice(cardInfo, 'MERCARI');      expect(mockPrice).toHaveProperty('average');      expect(mockPrice).toHaveProperty('median');      expect(mockPrice).toHaveProperty('min');      expect(mockPrice).toHaveProperty('max');      expect(mockPrice.average).toBeGreaterThan(0);      expect(mockPrice.min).toBeLessThanOrEqual(mockPrice.average);      expect(mockPrice.max).toBeGreaterThanOrEqual(mockPrice.average);
    });
  });

  describe('爬蟲服務整合', () => {
    test('應該成功使用Mercari爬蟲', async () => {      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      const result = await priceApiService.getCardPrices(cardInfo, {
        platforms: ['MERCARI'],
        useCache: false,
      });      expect(result.success).toBe(true);      expect(result.data).toHaveProperty('platforms');      expect(result.data.platforms.MERCARI).toHaveProperty('average');      expect(result.data.platforms.MERCARI.currency).toBe('JPY');      expect(result.data.platforms.MERCARI.source).toBe('crawler');
    });    test('應該成功使用SNKRDUNK爬蟲', async () => {
      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      const result = await priceApiService.getCardPrices(cardInfo, {
        platforms: ['SNKRDUNK'],
        useCache: false,
      });      expect(result.success).toBe(true);      expect(result.data).toHaveProperty('platforms');      expect(result.data.platforms.SNKRDUNK).toHaveProperty('average');      expect(result.data.platforms.SNKRDUNK.currency).toBe('JPY');      expect(result.data.platforms.SNKRDUNK.source).toBe('crawler');
    });    test('應該處理爬蟲服務失敗', async () => {
      const mercariCrawlerService = require('../services/mercariCrawlerService');      mercariCrawlerService.searchCard.mockRejectedValueOnce(new Error('爬蟲失敗'));      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      const result = await priceApiService.getCardPrices(cardInfo, {
        platforms: ['MERCARI'],
        useCache: false,
      });      expect(result.success).toBe(true);      expect(result.data.platforms.MERCARI.source).toBe('fallback');
    });    test('應該同時使用多個爬蟲平台', async () => {
      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      const result = await priceApiService.getCardPrices(cardInfo, {
        platforms: ['MERCARI', 'SNKRDUNK'],
        useCache: false,
      });      expect(result.success).toBe(true);      expect(result.platformsUsed).toContain('MERCARI');      expect(result.platformsUsed).toContain('SNKRDUNK');      expect(result.data.platforms.MERCARI).toBeDefined();      expect(result.data.platforms.SNKRDUNK).toBeDefined();
    });
  });

  describe('爬蟲數據解析', () => {
    test('應該正確解析爬蟲價格數據', () => {      const crawlerData = [        { price: 1000, title: '商品1',
        },        { price: 2000, title: '商品2' },        { price: 1500, title: '商品3' },      ];      const result = priceApiService.parseCrawlerPriceData(crawlerData, 'MERCARI');      expect(result).toHaveProperty('average');      expect(result).toHaveProperty('median');      expect(result).toHaveProperty('min');      expect(result).toHaveProperty('max');      expect(result).toHaveProperty('totalItems');      expect(result.average).toBe(1500);      expect(result.median).toBe(1500);      expect(result.min).toBe(1000);      expect(result.max).toBe(2000);      expect(result.totalItems).toBe(3);
    });    test('應該處理空的爬蟲數據', () => {
      expect(() => {        priceApiService.parseCrawlerPriceData([], 'MERCARI');
      }).toThrow('沒有爬蟲數據');
    });    test('應該處理無效價格數據', () => {
      const crawlerData = [        { price: 0, title: '商品1',
        },        { price: -100, title: '商品2' },        { price: null, title: '商品3' },      ];      expect(() => {
        priceApiService.parseCrawlerPriceData(crawlerData, 'MERCARI');
      }).toThrow('沒有有效的價格數據');
    });
  });
});
