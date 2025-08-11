import AsyncStorage from '@react-native-async-storage/async-storage';

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
      await this.checkRobotsTxt();
      await this.loadCachedData();
      return true;
    } catch (error) {
      return false;
    }
  }

  // 檢查robots.txt
  async checkRobotsTxt() {
    try {
      const response = await fetch.get(this.robotsTxtUrl, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });
      this.robotsRules = this.parseRobotsTxt(response.data);
      // 儲存robots.txt規則到快取
      await AsyncStorage.setItem('mercari_robots_rules', JSON.stringify(this.robotsRules));
      return true;
    } catch (error) {
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
          rules.crawlDelay = Math.max(rules.crawlDelay, delay);
        }
      }
    }
    // 檢查是否允許爬取搜索頁面
    const searchPath = '/search';
    const isSearchAllowed = !rules.disallow.some(path =>
      searchPath.startsWith(path) || path.startsWith(searchPath),
    );
    rules.allowed = isSearchAllowed;
    return rules;
  }

  // 尊重延遲
  async respectDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const requiredDelay = this.robotsRules?.crawlDelay || this.delayBetweenRequests;
    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest;
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
        const cachedData = this.cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < this.cacheTimeout) {
          return cachedData.data;
        }
      }
      // 尊重延遲
      await this.respectDelay();
      // 構建搜索查詢
      const searchQuery = this.buildSearchQuery(cardInfo);
      const searchParams = new URLSearchParams({
        keyword: searchQuery,
        limit: maxResults.toString(),
        sort: 'created_time',
        order: 'desc',
      });
      const response = await fetch.get(`${this.searchUrl}?${searchParams}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000,
      });
        // 解析搜索結果
      const results = this.parseSearchResults(response.data, cardInfo);
      // 儲存到快取
      if (useCache) {
        this.cache.set(cacheKey, {
          data: results,
          timestamp: Date.now(),
        });
      }
      return results;
    } catch (error) {
      throw error;
    }
  }

  // 生成快取鍵
  generateCacheKey(cardInfo) {
    return `mercari_${cardInfo.name}_${cardInfo.series}_${cardInfo.number}`;
  }

  // 構建搜索查詢
  buildSearchQuery(cardInfo) {
    const parts = [];
    if (cardInfo.name) {
      parts.push(cardInfo.name);
    }
    if (cardInfo.series) {
      parts.push(cardInfo.series);
    }
    if (cardInfo.number) {
      parts.push(`No.${cardInfo.number}`);
    }
    return parts.join(' ');
  }

  // 解析搜索結果
  parseSearchResults(html, cardInfo) {
    const results = [];
    try {
      // 這裡應該使用適當的HTML解析器
      // 由於React Native環境限制，這裡提供基本結構
      const items = this.extractItemsFromHtml(html);
      for (const item of items) {
        const parsedItem = this.parseItem(item, cardInfo);
        if (parsedItem) {
          results.push(parsedItem);
        }
      }
    } catch (error) {
      // 解析搜索結果時發生錯誤
    }
    return results;
  }

  // 從HTML中提取商品項目
  extractItemsFromHtml(html) {
    // 這裡應該實現實際的HTML解析邏輯
    // 由於環境限制，返回空陣列
    return [];
  }

  // 解析單個商品項目
  parseItem(itemHtml, cardInfo) {
    try {
      // 這裡應該實現實際的商品解析邏輯
      // 暫時返回基本結構，實際實現時會解析 itemHtml
      if (!itemHtml) {
        return null;
      }
      return {
        id: '',
        title: '',
        price: 0,
        condition: '',
        seller: '',
        location: '',
        url: '',
        imageUrl: '',
        postedDate: '',
        matchesCard: false,
      };
    } catch (error) {
      return null;
    }
  }

  // 載入快取資料
  async loadCachedData() {
    try {
      const cachedRules = await AsyncStorage.getItem('mercari_robots_rules');
      if (cachedRules) {
        this.robotsRules = JSON.parse(cachedRules);
      }
    } catch (error) {
      // 載入快取資料時發生錯誤
    }
  }

  // 清理快取
  clearCache() {
    this.cache.clear();
  }

  // 獲取快取統計
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export default MercariCrawlerService;
