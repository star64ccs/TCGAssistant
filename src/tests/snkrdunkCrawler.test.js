import snkrdunkCrawlerService from '../services/snkrdunkCrawlerService';

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock retryRequest
jest.mock('../services/api', () => ({ retryRequest: jest.fn((fn) => fn()) }));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('SnkrdunkCrawlerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    snkrdunkCrawlerService.cache.clear();
    snkrdunkCrawlerService.lastRequestTime = 0;
    snkrdunkCrawlerService.robotsRules = null;
  });

  describe('init', () => {
    it('should initialize service successfully', async () => {    // Mock robots.txt response      axios.get.mockResolvedValueOnce({        data: `
User-agent: *
Disallow: /api/
Disallow: /admin/
Crawl-delay: 3      `,
      });      // Mock AsyncStorage      const AsyncStorage = require('@react-native-async-storage/async-storage');      AsyncStorage.getItem.mockResolvedValueOnce(null);      const result = await snkrdunkCrawlerService.init();      expect(result).toBe(true);      expect(snkrdunkCrawlerService.robotsRules).toEqual({
        allowed: true,
        crawlDelay: 3,
        disallow: ['/api/', '/admin/'],
      });
    });    it('should handle robots.txt failure gracefully', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));      const result = await snkrdunkCrawlerService.init();      expect(result).toBe(true); // 即使robots.txt失敗，init仍然返回true      expect(snkrdunkCrawlerService.robotsRules).toEqual({        allowed: true,
        crawlDelay: 3,
        disallow: ['/api/', '/admin/'],
      });
    });
  });

  describe('checkRobotsTxt', () => {
    it('should parse robots.txt correctly', async () => {      const robotsTxtContent = `
User-agent: *
Disallow: /api/
Disallow: /admin/
Crawl-delay: 3

User-agent: TCGAssistant
Disallow: /user/
Crawl-delay: 2    `;      axios.get.mockResolvedValueOnce({        data: robotsTxtContent,
      });      const result = await snkrdunkCrawlerService.checkRobotsTxt();      expect(result).toBe(true);      expect(snkrdunkCrawlerService.robotsRules).toEqual({
        allowed: true,
        crawlDelay: 2,
        disallow: ['/user/'],
      });
    });    it('should handle robots.txt that disallows search', async () => {
      const robotsTxtContent = `
User-agent: *
Disallow: /search/
Crawl-delay: 3    `;      axios.get.mockResolvedValueOnce({        data: robotsTxtContent,
      });      const result = await snkrdunkCrawlerService.checkRobotsTxt();      expect(result).toBe(true);      expect(snkrdunkCrawlerService.robotsRules.allowed).toBe(false);
    });
  });

  describe('parseRobotsTxt', () => {
    it('should parse empty robots.txt', () => {      const result = snkrdunkCrawlerService.parseRobotsTxt('');      expect(result).toEqual({        allowed: true,
        crawlDelay: 3,
        disallow: [],
      });
    });    it('should parse robots.txt with wildcard user agent', () => {
      const content = `
User-agent: *
Disallow: /api/
Crawl-delay: 5    `;      const result = snkrdunkCrawlerService.parseRobotsTxt(content);      expect(result).toEqual({        allowed: true,
        crawlDelay: 5,
        disallow: ['/api/'],
      });
    });    it('should parse robots.txt with specific user agent', () => {
      const content = `
User-agent: TCGAssistant
Disallow: /admin/
Crawl-delay: 2    `;      const result = snkrdunkCrawlerService.parseRobotsTxt(content);      expect(result).toEqual({        allowed: true,
        crawlDelay: 2,
        disallow: ['/admin/'],
      });
    });
  });

  describe('searchCard', () => {
    beforeEach(async () => {    // Setup robots.txt      axios.get.mockResolvedValueOnce({        data: 'User-agent: *\nCrawl-delay: 1',
      });      await snkrdunkCrawlerService.init();
    });    it('should search card successfully', async () => {
      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      // Mock search response      axios.get.mockResolvedValueOnce({
        data: `      <div class="item">        <h3 class="title">ピカチュウ 基本セット</h3>        <span class="price">¥1,500</span>        <img src="image.jpg" alt="ピカチュウ" />        <a href="/item/123">商品リンク</a>      </div>      `,
      });      const result = await snkrdunkCrawlerService.searchCard(cardInfo);      expect(result.success).toBe(true);      expect(result.platform).toBe('SNKRDUNK');      expect(result.source).toBe('crawler');      expect(result.data).toHaveLength(1);      expect(result.data[0]).toEqual({
        title: 'ピカチュウ 基本セット',
        price: 1500,
        imageUrl: 'image.jpg',
        imageAlt: 'ピカチュウ',
        itemUrl: 'https://snkrdunk.com/item/123',
        platform: 'SNKRDUNK',
        currency: 'JPY',
      });
    });    it('should handle search failure', async () => {
      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      axios.get.mockRejectedValueOnce(new Error('Search failed'));      const result = await snkrdunkCrawlerService.searchCard(cardInfo);      expect(result.success).toBe(false);      expect(result.error).toBe('Search failed');
    });    it('should respect robots.txt rules', async () => {
    // Set robots.txt to disallow search      snkrdunkCrawlerService.robotsRules = {        allowed: false,
        crawlDelay: 1,
        disallow: ['/search/'],
      };      const cardInfo = {
        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      const result = await snkrdunkCrawlerService.searchCard(cardInfo);      expect(result.success).toBe(false);      expect(result.error).toBe('根據robots.txt規則，不允許爬取此網站');
    });
  });

  describe('buildSearchQuery', () => {
    it('should build basic search query', () => {      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        cardNumber: '025/025',
        gameType: 'pokemon',
      };      const result = snkrdunkCrawlerService.buildSearchQuery(cardInfo);      expect(result).toBe('ピカチュウ 基本セット 025/025 ポケモン カード');
    });    it('should handle missing optional fields', () => {
      const cardInfo = {        name: 'ピカチュウ',
        gameType: 'pokemon',
      };      const result = snkrdunkCrawlerService.buildSearchQuery(cardInfo);      expect(result).toBe('ピカチュウ ポケモン カード');
    });    it('should handle unknown game type', () => {
      const cardInfo = {        name: 'テストカード',
        gameType: 'unknown',
      };      const result = snkrdunkCrawlerService.buildSearchQuery(cardInfo);      expect(result).toBe('テストカード');
    });
  });

  describe('parseSearchResults', () => {
    it('should parse valid HTML results', () => {      const html = `      <div class="item">      <h3 class="title">ピカチュウ カード</h3>      <span class="price">¥1,000</span>      <img src="image1.jpg" alt="ピカチュウ" />      <a href="/item/1">リンク1</a>      </div>      <div class="item">      <h3 class="title">ピカチュウ レア</h3>      <span class="price">¥2,000</span>      <img src="image2.jpg" alt="ピカチュウレア" />      <a href="/item/2">リンク2</a>      </div>    `;      const result = snkrdunkCrawlerService.parseSearchResults(html, 10);      expect(result).toHaveLength(2);      expect(result[0]).toEqual({        title: 'ピカチュウ カード',
        price: 1000,
        imageUrl: 'image1.jpg',
        imageAlt: 'ピカチュウ',
        itemUrl: 'https://snkrdunk.com/item/1',
        platform: 'SNKRDUNK',
        currency: 'JPY',
      });      expect(result[1]).toEqual({
        title: 'ピカチュウ レア',
        price: 2000,
        imageUrl: 'image2.jpg',
        imageAlt: 'ピカチュウレア',
        itemUrl: 'https://snkrdunk.com/item/2',
        platform: 'SNKRDUNK',
        currency: 'JPY',
      });
    });    it('should handle invalid HTML gracefully', () => {
      const html = 'Invalid HTML content';      const result = snkrdunkCrawlerService.parseSearchResults(html, 10);      expect(result).toHaveLength(0);
    });    it('should respect maxResults limit', () => {
      const html = `      <div class="item">      <h3 class="title">商品1</h3>      <span class="price">¥1,000</span>      <img src="image1.jpg" alt="商品1" />      <a href="/item/1">リンク1</a>      </div>      <div class="item">      <h3 class="title">商品2</h3>      <span class="price">¥2,000</span>      <img src="image2.jpg" alt="商品2" />      <a href="/item/2">リンク2</a>      </div>      <div class="item">      <h3 class="title">商品3</h3>      <span class="price">¥3,000</span>      <img src="image3.jpg" alt="商品3" />      <a href="/item/3">リンク3</a>      </div>    `;      const result = snkrdunkCrawlerService.parseSearchResults(html, 2);      expect(result).toHaveLength(2);
    });
  });

  describe('getItemDetails', () => {
    it('should get item details successfully', async () => {      const itemUrl = 'https://snkrdunk.com/item/123';      // Mock item details response      axios.get.mockResolvedValueOnce({        data: `      <span class="condition">新品</span>      <div class="description">ピカチュウのカードです</div>      <span class="seller">テスト売家</span>      <span class="size">M</span>      `,
      });      const result = await snkrdunkCrawlerService.getItemDetails(itemUrl);      expect(result).toEqual({
        condition: '新品',
        description: 'ピカチュウのカードです',
        seller: 'テスト売家',
        size: 'M',
        lastUpdated: expect.any(String),
      });
    });    it('should handle item details failure', async () => {
      const itemUrl = 'https://snkrdunk.com/item/123';      axios.get.mockRejectedValueOnce(new Error('Item details failed'));      const result = await snkrdunkCrawlerService.getItemDetails(itemUrl);      expect(result).toBeNull();
    });
  });

  describe('parseItemDetails', () => {
    it('should parse item details correctly', () => {      const html = `      <span class="condition">新品</span>      <div class="description">ピカチュウのカードです</div>      <span class="seller">テスト売家</span>      <span class="size">M</span>    `;      const result = snkrdunkCrawlerService.parseItemDetails(html);      expect(result).toEqual({        condition: '新品',
        description: 'ピカチュウのカードです',
        seller: 'テスト売家',
        size: 'M',
        lastUpdated: expect.any(String),
      });
    });    it('should handle missing details gracefully', () => {
      const html = '<div>No details available</div>';      const result = snkrdunkCrawlerService.parseItemDetails(html);      expect(result).toEqual({        condition: '',
        description: '',
        seller: '',
        size: '',
        lastUpdated: expect.any(String),
      });
    });
  });

  describe('cleanHtml', () => {
    it('should clean HTML tags', () => {      const html = '<p>Hello <strong>World</strong>!</p>';      const result = snkrdunkCrawlerService.cleanHtml(html);      expect(result).toBe('Hello World!');
    });    it('should decode HTML entities', () => {
      const html = 'Hello &amp; World &lt;3&gt;';      const result = snkrdunkCrawlerService.cleanHtml(html);      expect(result).toBe('Hello & World <3>');
    });    it('should trim whitespace', () => {
      const html = '  <p>Hello World</p>  ';      const result = snkrdunkCrawlerService.cleanHtml(html);      expect(result).toBe('Hello World');
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache key', () => {      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        cardNumber: '025/025',
      };      const key1 = snkrdunkCrawlerService.generateCacheKey(cardInfo);      const key2 = snkrdunkCrawlerService.generateCacheKey(cardInfo);      expect(key1).toBe(key2);      expect(key1).toBe('snkrdunk_ピカチュウ_基本セット_025/025');
    });    it('should handle missing fields', () => {
      const cardInfo = {        name: 'ピカチュウ',
      };      const key = snkrdunkCrawlerService.generateCacheKey(cardInfo);      expect(key).toBe('snkrdunk_ピカチュウ__');
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status', () => {      snkrdunkCrawlerService.robotsRules = {        allowed: true,
        crawlDelay: 3,
        disallow: ['/api/'],
      };      snkrdunkCrawlerService.cache.set('test', { data: 'test' });      const status = snkrdunkCrawlerService.getServiceStatus();      expect(status).toEqual({
        baseUrl: 'https://snkrdunk.com',
        robotsRules: {          allowed: true,
          crawlDelay: 3,
          disallow: ['/api/'],
        },
        cacheSize: 1,
        lastRequestTime: 0,
        crawlDelay: 3,      });
    });
  });

  describe('checkServiceStatus', () => {
    it('should return online status when service is available', async () => {      axios.get.mockResolvedValueOnce({        status: 200,
        headers: { 'x-response-time': '150ms',
        },      });      const status = await snkrdunkCrawlerService.checkServiceStatus();      expect(status).toEqual({
        status: 'online',
        responseTime: '150ms',
        statusCode: 200,
      });
    });    it('should return offline status when service is unavailable', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));      const status = await snkrdunkCrawlerService.checkServiceStatus();      expect(status).toEqual({        status: 'offline',
        error: 'Network error',
      });
    });
  });

  describe('respectDelay', () => {
    it('should respect crawl delay', async () => {      snkrdunkCrawlerService.robotsRules = {        crawlDelay: 1000, // 1 second
      };      snkrdunkCrawlerService.lastRequestTime = Date.now();      const startTime = Date.now();      await snkrdunkCrawlerService.respectDelay();      const endTime = Date.now();      // Should have waited at least 1000ms      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });    it('should not delay if enough time has passed', async () => {
      snkrdunkCrawlerService.robotsRules = {        crawlDelay: 1000,
      };      snkrdunkCrawlerService.lastRequestTime = Date.now() - 2000; // 2 seconds ago      const startTime = Date.now();      await snkrdunkCrawlerService.respectDelay();      const endTime = Date.now();      // Should not have waited much      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
