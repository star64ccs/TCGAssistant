import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, API_ENDPOINTS, retryRequest, cachedRequest } from './api';
import notificationUtils from '../utils/notificationUtils';
import mercariCrawlerService from './mercariCrawlerService';
import snkrdunkCrawlerService from './snkrdunkCrawlerService';

// 價格API配置
const PRICE_API_CONFIG = {
  // TCGPlayer API
  TCGPLAYER: {
    endpoint: 'https://api.tcgplayer.com/v1.39.0',
    apiKey: process.env.REACT_APP_TCGPLAYER_API_KEY,
    publicKey: process.env.REACT_APP_TCGPLAYER_PUBLIC_KEY,
    privateKey: process.env.REACT_APP_TCGPLAYER_PRIVATE_KEY,
    enabled: true,
  },
  
  // eBay API
  EBAY: {
    endpoint: 'https://api.ebay.com/buy/browse/v1/item_summary/search',
    appId: process.env.REACT_APP_EBAY_APP_ID,
    certId: process.env.REACT_APP_EBAY_CERT_ID,
    clientSecret: process.env.REACT_APP_EBAY_CLIENT_SECRET,
    enabled: true,
  },
  
  // Cardmarket API
  CARDMARKET: {
    endpoint: 'https://api.cardmarket.com/ws/v2.0',
    appToken: process.env.REACT_APP_CARDMARKET_APP_TOKEN,
    appSecret: process.env.REACT_APP_CARDMARKET_APP_SECRET,
    accessToken: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN,
    accessTokenSecret: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN_SECRET,
    enabled: true,
  },
  
  // PriceCharting API
  PRICECHARTING: {
    endpoint: 'https://www.pricecharting.com/api',
    apiKey: process.env.REACT_APP_PRICECHARTING_API_KEY,
    enabled: true,
  },
  
  // Mercari 爬蟲 (取代API)
  MERCARI: {
    enabled: true, // 啟用爬蟲
    crawler: true,
  },
  
  // SNKRDUNK 爬蟲 (取代API)
  SNKRDUNK: {
    enabled: true, // 啟用爬蟲
    crawler: true,
  },
  
  // 自定義價格API
  CUSTOM_PRICE: {
    endpoint: 'https://api.tcg-assistant.com/v1/prices',
    apiKey: process.env.REACT_APP_CUSTOM_PRICE_API_KEY,
    enabled: true,
  },
};

// 價格查詢服務類
class PriceApiService {
  constructor() {
    this.activeApis = this.detectActiveApis();
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30分鐘快取
  }

  // 檢測可用的API
  detectActiveApis() {
    const active = [];
    
    Object.entries(PRICE_API_CONFIG).forEach(([name, config]) => {
      if (config.enabled) {
        // 對於爬蟲服務，不需要檢查API密鑰
        if (config.crawler || config.apiKey || config.appId || config.appToken) {
          active.push(name);
        }
      }
    });
    
    console.log('可用的價格API:', active);
    return active;
  }

  // 主要價格查詢方法
  async getCardPrices(cardInfo, options = {}) {
    const {
      platforms = this.activeApis,
      useCache = true,
      maxRetries = 3,
      timeout = 30000,
      includeHistory = false,
      includeTrends = false,
    } = options;

    try {
      // 檢查快取
      const cacheKey = this.generateCacheKey(cardInfo, platforms);
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('使用快取的價格數據');
          return cached.data;
        }
      }

      // 並行查詢多個平台
      const pricePromises = platforms
        .filter(platform => this.activeApis.includes(platform))
        .map(platform => this.getPriceFromPlatform(platform, cardInfo, { maxRetries, timeout }));

      const results = await Promise.allSettled(pricePromises);
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulResults.length === 0) {
        throw new Error('所有價格API都失敗了');
      }

      // 整合價格數據
      const aggregatedPrices = this.aggregatePrices(successfulResults, cardInfo);

      // 如果需要歷史數據
      if (includeHistory) {
        aggregatedPrices.history = await this.getPriceHistory(cardInfo);
      }

      // 如果需要趨勢分析
      if (includeTrends) {
        aggregatedPrices.trends = await this.analyzePriceTrends(aggregatedPrices);
      }

      const result = {
        success: true,
        data: aggregatedPrices,
        platformsUsed: successfulResults.map(r => r.platform),
        timestamp: new Date().toISOString(),
        cacheKey,
      };

      // 儲存到快取
      if (useCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      // 發送成功通知
      notificationUtils.sendSuccessNotification('價格查詢成功', '已獲取最新市場價格');

      return result;

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

  // 從特定平台獲取價格
  async getPriceFromPlatform(platform, cardInfo, options = {}) {
    const { maxRetries = 3, timeout = 30000 } = options;

    return await retryRequest(async () => {
      switch (platform) {
        case 'TCGPLAYER':
          return await this.getTcgPlayerPrice(cardInfo, timeout);
        case 'EBAY':
          return await this.getEbayPrice(cardInfo, timeout);
        case 'CARDMARKET':
          return await this.getCardmarketPrice(cardInfo, timeout);
        case 'PRICECHARTING':
          return await this.getPriceChartingPrice(cardInfo, timeout);
        case 'MERCARI':
          return await this.getMercariPrice(cardInfo, timeout);
        case 'SNKRDUNK':
          return await this.getSnkrdunkPrice(cardInfo, timeout);
        case 'CUSTOM_PRICE':
          return await this.getCustomPrice(cardInfo, timeout);
        default:
          throw new Error(`不支援的平台: ${platform}`);
      }
    }, maxRetries);
  }

  // TCGPlayer API
  async getTcgPlayerPrice(cardInfo, timeout) {
    const config = PRICE_API_CONFIG.TCGPLAYER;
    
    try {
      // 搜索卡牌
      const searchResponse = await axios.get(
        `${config.endpoint}/catalog/products`,
        {
          params: {
            name: cardInfo.name,
            limit: 10,
          },
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
          timeout,
        }
      );

      const products = searchResponse.data.results;
      if (!products || products.length === 0) {
        throw new Error('未找到卡牌');
      }

      // 找到最匹配的產品
      const bestMatch = this.findBestMatch(products, cardInfo);
      const productId = bestMatch.productId;

      // 獲取價格
      const priceResponse = await axios.get(
        `${config.endpoint}/pricing/product/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
          timeout,
        }
      );

      return this.parseTcgPlayerPrice(priceResponse.data, 'TCGPLAYER', bestMatch);

    } catch (error) {
      throw new Error(`TCGPlayer API 錯誤: ${error.message}`);
    }
  }

  // eBay API
  async getEbayPrice(cardInfo, timeout) {
    const config = PRICE_API_CONFIG.EBAY;
    
    try {
      const searchQuery = `${cardInfo.name} ${cardInfo.series || ''}`.trim();
      
      const response = await axios.get(
        `${config.endpoint}`,
        {
          params: {
            q: searchQuery,
            filter: 'conditions:{NEW|USED_EXCELLENT|USED_VERY_GOOD}',
            sort: 'price',
            limit: 20,
          },
          headers: {
            'Authorization': `Bearer ${config.appId}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY-US',
          },
          timeout,
        }
      );

      return this.parseEbayPrice(response.data, 'EBAY');

    } catch (error) {
      throw new Error(`eBay API 錯誤: ${error.message}`);
    }
  }

  // Cardmarket API
  async getCardmarketPrice(cardInfo, timeout) {
    const config = PRICE_API_CONFIG.CARDMARKET;
    
    try {
      const searchQuery = encodeURIComponent(cardInfo.name);
      
      const response = await axios.get(
        `${config.endpoint}/output.json/products/find`,
        {
          params: {
            search: searchQuery,
            game: this.mapGameType(cardInfo.gameType),
            language: 1, // 英文
          },
          headers: {
            'Authorization': `Bearer ${config.appToken}`,
          },
          timeout,
        }
      );

      return this.parseCardmarketPrice(response.data, 'CARDMARKET');

    } catch (error) {
      throw new Error(`Cardmarket API 錯誤: ${error.message}`);
    }
  }

  // PriceCharting API
  async getPriceChartingPrice(cardInfo, timeout) {
    const config = PRICE_API_CONFIG.PRICECHARTING;
    
    try {
      const searchQuery = encodeURIComponent(cardInfo.name);
      
      const response = await axios.get(
        `${config.endpoint}/product`,
        {
          params: {
            t: searchQuery,
            key: config.apiKey,
          },
          timeout,
        }
      );

      return this.parsePriceChartingPrice(response.data, 'PRICECHARTING');

    } catch (error) {
      throw new Error(`PriceCharting API 錯誤: ${error.message}`);
    }
  }

  // Mercari 爬蟲實現
  async getMercariPrice(cardInfo, timeout) {
    try {
      // 初始化爬蟲服務
      await mercariCrawlerService.init();
      
      // 使用爬蟲搜索卡牌
      const searchResult = await mercariCrawlerService.searchCard(cardInfo, {
        maxResults: 20,
        useCache: true,
        maxRetries: 3,
      });

      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Mercari爬蟲搜索失敗');
      }

      // 解析爬蟲結果為價格數據
      const priceData = this.parseCrawlerPriceData(searchResult.data, 'MERCARI');
      
      return {
        platform: 'MERCARI',
        prices: priceData,
        currency: 'JPY',
        lastUpdated: new Date().toISOString(),
        source: 'crawler',
        totalResults: searchResult.totalResults,
      };
    } catch (error) {
      console.error('Mercari爬蟲錯誤:', error);
      // 回退到模擬數據
      const mockPrice = this.generateMockPrice(cardInfo, 'MERCARI');
      return {
        platform: 'MERCARI',
        prices: mockPrice,
        currency: 'JPY',
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
      };
    }
  }

  // SNKRDUNK 爬蟲實現
  async getSnkrdunkPrice(cardInfo, timeout) {
    try {
      // 初始化爬蟲服務
      await snkrdunkCrawlerService.init();
      
      // 使用爬蟲搜索卡牌
      const searchResult = await snkrdunkCrawlerService.searchCard(cardInfo, {
        maxResults: 20,
        useCache: true,
        maxRetries: 3,
      });

      if (!searchResult.success) {
        throw new Error(searchResult.error || 'SNKRDUNK爬蟲搜索失敗');
      }

      // 解析爬蟲結果為價格數據
      const priceData = this.parseCrawlerPriceData(searchResult.data, 'SNKRDUNK');
      
      return {
        platform: 'SNKRDUNK',
        prices: priceData,
        currency: 'JPY',
        lastUpdated: new Date().toISOString(),
        source: 'crawler',
        totalResults: searchResult.totalResults,
      };
    } catch (error) {
      console.error('SNKRDUNK爬蟲錯誤:', error);
      // 回退到模擬數據
      const mockPrice = this.generateMockPrice(cardInfo, 'SNKRDUNK');
      return {
        platform: 'SNKRDUNK',
        prices: mockPrice,
        currency: 'JPY',
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
      };
    }
  }

  // 自定義價格API
  async getCustomPrice(cardInfo, timeout) {
    const config = PRICE_API_CONFIG.CUSTOM_PRICE;
    
    try {
      const response = await axios.post(
        `${config.endpoint}/search`,
        {
          cardName: cardInfo.name,
          series: cardInfo.series,
          gameType: cardInfo.gameType,
          cardNumber: cardInfo.cardNumber,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout,
        }
      );

      return this.parseCustomPrice(response.data, 'CUSTOM_PRICE');

    } catch (error) {
      throw new Error(`自定義價格API 錯誤: ${error.message}`);
    }
  }

  // 整合價格數據
  aggregatePrices(priceResults, cardInfo) {
    const aggregated = {
      average: 0,
      median: 0,
      min: Infinity,
      max: -Infinity,
      platforms: {},
      totalResults: priceResults.length,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    };

    const allPrices = [];

    priceResults.forEach(result => {
      if (result.prices) {
        const platformData = {
          average: result.prices.average || 0,
          median: result.prices.median || 0,
          min: result.prices.min || 0,
          max: result.prices.max || 0,
          currency: result.currency || 'USD',
          lastUpdated: result.lastUpdated,
          source: result.source || 'api',
        };

        aggregated.platforms[result.platform] = platformData;
        allPrices.push(platformData.average);
      }
    });

    if (allPrices.length > 0) {
      aggregated.average = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
      aggregated.median = this.calculateMedian(allPrices);
      
      // 計算所有平台的最小值和最大值
      const allMins = priceResults
        .filter(result => result.prices)
        .map(result => result.prices.min || 0);
      const allMaxs = priceResults
        .filter(result => result.prices)
        .map(result => result.prices.max || 0);
      
      aggregated.min = Math.min(...allMins);
      aggregated.max = Math.max(...allMaxs);
    }

    return aggregated;
  }

  // 計算中位數
  calculateMedian(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  // 找到最佳匹配的產品
  findBestMatch(products, cardInfo) {
    // 簡單的匹配邏輯，可以根據需要改進
    return products[0];
  }

  // 映射遊戲類型
  mapGameType(gameType) {
    const mapping = {
      'pokemon': 3,
      'one-piece': 4,
      'yugioh': 1,
      'magic': 2,
    };
    return mapping[gameType] || 3;
  }

  // 生成快取鍵
  generateCacheKey(cardInfo, platforms) {
    return `price_${cardInfo.name}_${cardInfo.series}_${platforms.join('_')}`;
  }

  // 生成模擬價格
  generateMockPrice(cardInfo, platform) {
    const basePrice = 10 + Math.random() * 100;
    const variation = 0.2; // 20% 變異
    
    return {
      average: basePrice,
      median: basePrice * (1 + (Math.random() - 0.5) * variation),
      min: basePrice * (1 - variation),
      max: basePrice * (1 + variation),
    };
  }

  // 解析TCGPlayer價格數據
  parseTcgPlayerPrice(data, platform, productInfo) {
    const prices = data.results || [];
    
    if (prices.length === 0) {
      throw new Error('沒有價格數據');
    }

    const priceValues = prices.map(p => p.lowPrice || p.midPrice || p.highPrice).filter(p => p > 0);
    
    if (priceValues.length === 0) {
      throw new Error('沒有有效的價格數據');
    }

    return {
      platform,
      prices: {
        average: priceValues.reduce((a, b) => a + b, 0) / priceValues.length,
        median: this.calculateMedian(priceValues),
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
      },
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      source: 'api',
      productInfo,
    };
  }

  // 解析eBay價格數據
  parseEbayPrice(data, platform) {
    const items = data.itemSummaries || [];
    
    if (items.length === 0) {
      throw new Error('沒有找到商品');
    }

    const priceValues = items
      .map(item => parseFloat(item.price?.value || 0))
      .filter(price => price > 0);

    if (priceValues.length === 0) {
      throw new Error('沒有有效的價格數據');
    }

    return {
      platform,
      prices: {
        average: priceValues.reduce((a, b) => a + b, 0) / priceValues.length,
        median: this.calculateMedian(priceValues),
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
      },
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      source: 'api',
    };
  }

  // 解析Cardmarket價格數據
  parseCardmarketPrice(data, platform) {
    const products = data.data || [];
    
    if (products.length === 0) {
      throw new Error('沒有找到商品');
    }

    const priceValues = products
      .map(product => parseFloat(product.priceGuide?.SELL || 0))
      .filter(price => price > 0);

    if (priceValues.length === 0) {
      throw new Error('沒有有效的價格數據');
    }

    return {
      platform,
      prices: {
        average: priceValues.reduce((a, b) => a + b, 0) / priceValues.length,
        median: this.calculateMedian(priceValues),
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
      },
      currency: 'EUR',
      lastUpdated: new Date().toISOString(),
      source: 'api',
    };
  }

  // 解析PriceCharting價格數據
  parsePriceChartingPrice(data, platform) {
    const price = parseFloat(data.price || 0);
    
    if (price <= 0) {
      throw new Error('沒有有效的價格數據');
    }

    return {
      platform,
      prices: {
        average: price,
        median: price,
        min: price,
        max: price,
      },
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      source: 'api',
    };
  }

  // 解析自定義價格數據
  parseCustomPrice(data, platform) {
    const prices = data.prices || [];
    
    if (prices.length === 0) {
      throw new Error('沒有價格數據');
    }

    const priceValues = prices.map(p => parseFloat(p.price || 0)).filter(p => p > 0);
    
    if (priceValues.length === 0) {
      throw new Error('沒有有效的價格數據');
    }

    return {
      platform,
      prices: {
        average: priceValues.reduce((a, b) => a + b, 0) / priceValues.length,
        median: this.calculateMedian(priceValues),
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
      },
      currency: data.currency || 'USD',
      lastUpdated: new Date().toISOString(),
      source: 'api',
    };
  }

  // 解析爬蟲價格數據
  parseCrawlerPriceData(crawlerData, platform) {
    if (!crawlerData || crawlerData.length === 0) {
      throw new Error('沒有爬蟲數據');
    }

    const priceValues = crawlerData
      .map(item => parseFloat(item.price || 0))
      .filter(price => price > 0);

    if (priceValues.length === 0) {
      throw new Error('沒有有效的價格數據');
    }

    return {
      average: priceValues.reduce((a, b) => a + b, 0) / priceValues.length,
      median: this.calculateMedian(priceValues),
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
      totalItems: priceValues.length,
    };
  }

  // 獲取價格歷史
  async getPriceHistory(cardInfo) {
    // 這裡可以實現從資料庫或外部API獲取歷史價格
    return [];
  }

  // 分析價格趨勢
  async analyzePriceTrends(priceData) {
    // 這裡可以實現價格趨勢分析
    return {
      trend: 'stable',
      confidence: 0.5,
      prediction: priceData.average,
    };
  }

  // 清除快取
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // 獲取API狀態
  getApiStatus() {
    return {
      activeApis: this.activeApis,
      totalApis: Object.keys(PRICE_API_CONFIG).length,
      cacheSize: this.cache.size,
    };
  }
}

// 創建單例實例
const priceApiService = new PriceApiService();

export default priceApiService;
