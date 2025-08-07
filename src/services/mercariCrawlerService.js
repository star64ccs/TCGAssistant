import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { retryRequest } from './api';

// Mercari爬蟲服務類
class MercariCrawlerService {
  constructor() {
    this.baseUrl = 'https://jp.mercari.com';
    this.robotsTxtUrl = `${this.baseUrl}/robots.txt`;
    this.searchUrl = `${this.baseUrl}/search`;
    this.userAgent = 'TCGAssistant/1.0 (+https://tcg-assistant.com/bot)';
    this.delayBetweenRequests = 2000; // 2秒延遲
    this.lastRequestTime = 0;
    this.robotsRules = null;
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30分鐘快取
  }

  // 初始化服務
  async init() {
    try {
      console.log('初始化Mercari爬蟲服務...');
      await this.checkRobotsTxt();
      await this.loadCachedData();
      console.log('Mercari爬蟲服務初始化完成');
      return true;
    } catch (error) {
      console.error('Mercari爬蟲服務初始化失敗:', error);
      return false;
    }
  }

  // 檢查robots.txt
  async checkRobotsTxt() {
    try {
      console.log('檢查Mercari robots.txt...');
      const response = await axios.get(this.robotsTxtUrl, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      this.robotsRules = this.parseRobotsTxt(response.data);
      console.log('Mercari robots.txt解析完成');
      
      // 儲存robots.txt規則到快取
      await AsyncStorage.setItem('mercari_robots_rules', JSON.stringify(this.robotsRules));
      
      return true;
    } catch (error) {
      console.error('檢查Mercari robots.txt失敗:', error);
      // 使用預設規則
      this.robotsRules = {
        allowed: true,
        crawlDelay: 2,
        disallow: ['/api/', '/admin/'],
      };
      return false;
    }
  }

  // 解析robots.txt
  parseRobotsTxt(content) {
    const rules = {
      allowed: true,
      crawlDelay: 2,
      disallow: [],
    };

    const lines = content.split('\n');
    let userAgentMatch = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
        const userAgent = trimmedLine.substring(11).trim();
        userAgentMatch = userAgent === '*' || userAgent.includes('TCGAssistant');
      } else if (userAgentMatch && trimmedLine.toLowerCase().startsWith('disallow:')) {
        const path = trimmedLine.substring(9).trim();
        if (path) {
          rules.disallow.push(path);
        }
      } else if (userAgentMatch && trimmedLine.toLowerCase().startsWith('crawl-delay:')) {
        const delay = parseInt(trimmedLine.substring(12).trim());
        if (!isNaN(delay)) {
          rules.crawlDelay = Math.max(delay, 1);
        }
      }
    }

    // 檢查是否允許爬取搜索頁面
    const searchPath = '/search';
    const isSearchAllowed = !rules.disallow.some(path => 
      searchPath.startsWith(path) || path.startsWith(searchPath)
    );

    rules.allowed = isSearchAllowed;
    return rules;
  }

  // 尊重延遲
  async respectDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const requiredDelay = (this.robotsRules?.crawlDelay || this.delayBetweenRequests);

    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest;
      console.log(`等待 ${waitTime}ms 以遵守robots.txt規則`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  // 搜索卡牌
  async searchCard(cardInfo, options = {}) {
    const {
      maxResults = 20,
      useCache = true,
      maxRetries = 3,
    } = options;

    try {
      // 檢查robots.txt規則
      if (!this.robotsRules?.allowed) {
        throw new Error('根據robots.txt規則，不允許爬取此網站');
      }

      // 檢查快取
      const cacheKey = this.generateCacheKey(cardInfo);
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('使用快取的Mercari搜索結果');
          return cached.data;
        }
      }

      // 尊重延遲
      await this.respectDelay();

      // 構建搜索查詢
      const searchQuery = this.buildSearchQuery(cardInfo);
      const searchUrl = `${this.searchUrl}?keyword=${encodeURIComponent(searchQuery)}&sort=score_desc&order=desc&status=on_sale`;

      console.log(`搜索Mercari: ${searchQuery}`);

      // 發送搜索請求
      const response = await retryRequest(async () => {
        return await axios.get(searchUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 15000,
        });
      }, maxRetries);

      // 解析搜索結果
      const searchResults = this.parseSearchResults(response.data, maxResults);

      // 獲取詳細價格信息
      const detailedResults = await this.getDetailedPrices(searchResults, maxRetries);

      const result = {
        success: true,
        platform: 'MERCARI',
        data: detailedResults,
        totalResults: detailedResults.length,
        searchQuery,
        timestamp: new Date().toISOString(),
        source: 'crawler',
      };

      // 儲存到快取
      if (useCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
        await this.saveCachedData();
      }

      return result;

    } catch (error) {
      console.error('Mercari搜索失敗:', error);
      return {
        success: false,
        error: error.message,
        platform: 'MERCARI',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 構建搜索查詢
  buildSearchQuery(cardInfo) {
    let query = cardInfo.name;
    
    if (cardInfo.series) {
      query += ` ${cardInfo.series}`;
    }
    
    if (cardInfo.cardNumber) {
      query += ` ${cardInfo.cardNumber}`;
    }

    // 添加遊戲類型關鍵字
    if (cardInfo.gameType) {
      const gameKeywords = {
        'pokemon': 'ポケモン カード',
        'one-piece': 'ワンピース カード',
        'yugioh': '遊戯王 カード',
        'magic': 'マジック カード',
      };
      
      if (gameKeywords[cardInfo.gameType]) {
        query += ` ${gameKeywords[cardInfo.gameType]}`;
      }
    }

    return query.trim();
  }

  // 解析搜索結果
  parseSearchResults(html, maxResults) {
    const results = [];
    
    try {
      // 使用正則表達式解析HTML（簡化版本）
      // 實際實現中可能需要更複雜的HTML解析
      
      // 查找商品項目
      const itemPattern = /<li[^>]*data-testid="item-cell"[^>]*>(.*?)<\/li>/gs;
      const titlePattern = /<h3[^>]*>(.*?)<\/h3>/s;
      const pricePattern = /<span[^>]*data-testid="price"[^>]*>¥([0-9,]+)<\/span>/s;
      const imagePattern = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/s;
      const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>/s;

      let match;
      let count = 0;

      while ((match = itemPattern.exec(html)) && count < maxResults) {
        const itemHtml = match[1];
        
        // 提取標題
        const titleMatch = titlePattern.exec(itemHtml);
        const title = titleMatch ? this.cleanHtml(titleMatch[1]) : '';

        // 提取價格
        const priceMatch = pricePattern.exec(itemHtml);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;

        // 提取圖片
        const imageMatch = imagePattern.exec(itemHtml);
        const imageUrl = imageMatch ? imageMatch[1] : '';
        const imageAlt = imageMatch ? imageMatch[2] : '';

        // 提取鏈接
        const linkMatch = linkPattern.exec(itemHtml);
        const itemUrl = linkMatch ? `${this.baseUrl}${linkMatch[1]}` : '';

        if (title && price > 0) {
          results.push({
            title,
            price,
            imageUrl,
            imageAlt,
            itemUrl,
            platform: 'MERCARI',
            currency: 'JPY',
          });
          count++;
        }
      }

    } catch (error) {
      console.error('解析Mercari搜索結果失敗:', error);
    }

    return results;
  }

  // 獲取詳細價格信息
  async getDetailedPrices(searchResults, maxRetries) {
    const detailedResults = [];
    
    for (const item of searchResults.slice(0, 5)) { // 限制詳細查詢數量
      try {
        await this.respectDelay();
        
        const detailedInfo = await retryRequest(async () => {
          return await this.getItemDetails(item.itemUrl);
        }, maxRetries);

        if (detailedInfo) {
          detailedResults.push({
            ...item,
            ...detailedInfo,
          });
        }
      } catch (error) {
        console.error(`獲取商品詳細信息失敗: ${item.title}`, error);
        // 保留基本信息
        detailedResults.push(item);
      }
    }

    return detailedResults;
  }

  // 獲取商品詳細信息
  async getItemDetails(itemUrl) {
    try {
      const response = await axios.get(itemUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        timeout: 10000,
      });

      return this.parseItemDetails(response.data);

    } catch (error) {
      console.error('獲取商品詳細信息失敗:', error);
      return null;
    }
  }

  // 解析商品詳細信息
  parseItemDetails(html) {
    try {
      // 提取商品狀態
      const conditionPattern = /<span[^>]*data-testid="condition"[^>]*>(.*?)<\/span>/s;
      const conditionMatch = conditionPattern.exec(html);
      const condition = conditionMatch ? this.cleanHtml(conditionMatch[1]) : '';

      // 提取商品描述
      const descriptionPattern = /<div[^>]*data-testid="description"[^>]*>(.*?)<\/div>/s;
      const descriptionMatch = descriptionPattern.exec(html);
      const description = descriptionMatch ? this.cleanHtml(descriptionMatch[1]) : '';

      // 提取賣家信息
      const sellerPattern = /<span[^>]*data-testid="seller-name"[^>]*>(.*?)<\/span>/s;
      const sellerMatch = sellerPattern.exec(html);
      const seller = sellerMatch ? this.cleanHtml(sellerMatch[1]) : '';

      return {
        condition,
        description,
        seller,
        lastUpdated: new Date().toISOString(),
      };

    } catch (error) {
      console.error('解析商品詳細信息失敗:', error);
      return {};
    }
  }

  // 清理HTML標籤
  cleanHtml(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // 生成快取鍵
  generateCacheKey(cardInfo) {
    return `mercari_${cardInfo.name}_${cardInfo.series || ''}_${cardInfo.cardNumber || ''}`;
  }

  // 載入快取數據
  async loadCachedData() {
    try {
      const cached = await AsyncStorage.getItem('mercari_crawler_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        this.cache = new Map(parsed);
        
        // 清理過期快取
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
          if (now - value.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('載入Mercari快取數據失敗:', error);
    }
  }

  // 儲存快取數據
  async saveCachedData() {
    try {
      const cacheArray = Array.from(this.cache.entries());
      await AsyncStorage.setItem('mercari_crawler_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('儲存Mercari快取數據失敗:', error);
    }
  }

  // 清除快取
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
    this.saveCachedData();
  }

  // 獲取服務狀態
  getServiceStatus() {
    return {
      baseUrl: this.baseUrl,
      robotsRules: this.robotsRules,
      cacheSize: this.cache.size,
      lastRequestTime: this.lastRequestTime,
      crawlDelay: this.robotsRules?.crawlDelay || this.delayBetweenRequests,
    };
  }

  // 檢查服務狀態
  async checkServiceStatus() {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 5000,
      });

      return {
        status: 'online',
        responseTime: response.headers['x-response-time'] || 'unknown',
        statusCode: response.status,
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message,
      };
    }
  }
}

// 創建單例實例
const mercariCrawlerService = new MercariCrawlerService();

export default mercariCrawlerService;
