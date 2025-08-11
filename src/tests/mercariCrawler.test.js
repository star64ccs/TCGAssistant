import mercariCrawlerService from '../services/mercariCrawlerService';

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

describe('MercariCrawlerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    mercariCrawlerService.cache.clear();
    mercariCrawlerService.lastRequestTime = 0;
    mercariCrawlerService.robotsRules = null;
  });

  describe('init', () => {
    it('should initialize service successfully', async () => {    // Mock robots.txt response      axios.get.mockResolvedValueOnce({        data: `
User-agent: *
Disallow: /api/
Disallow: /admin/
Crawl-delay: 2      `,
      });      // Mock AsyncStorage      const AsyncStorage = require('@react-native-async-storage/async-storage');      AsyncStorage.getItem.mockResolvedValueOnce(null);      const result = await mercariCrawlerService.init();      expect(result).toBe(true);      expect(mercariCrawlerService.robotsRules).toEqual({
        allowed: true,
        crawlDelay: 2,
        disallow: ['/api/', '/admin/'],
      });
    });    it('should handle robots.txt failure gracefully', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));      const result = await mercariCrawlerService.init();      expect(result).toBe(true); // 即使robots.txt失敗，init仍然返回true      expect(mercariCrawlerService.robotsRules).toEqual({        allowed: true,
        crawlDelay: 2,
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
Crawl-delay: 1    `;      axios.get.mockResolvedValueOnce({        data: robotsTxtContent,
      });      const result = await mercariCrawlerService.checkRobotsTxt();      expect(result).toBe(true);      expect(mercariCrawlerService.robotsRules).toEqual({
        allowed: true,
        crawlDelay: 1,
        disallow: ['/user/'],
      });
    });    it('should handle robots.txt that disallows search', async () => {
      const robotsTxtContent = `
User-agent: *
Disallow: /search/
Crawl-delay: 2    `;      axios.get.mockResolvedValueOnce({        data: robotsTxtContent,
      });      const result = await mercariCrawlerService.checkRobotsTxt();      expect(result).toBe(true);      expect(mercariCrawlerService.robotsRules.allowed).toBe(false);
    });
  });

  describe('parseRobotsTxt', () => {
    it('should parse empty robots.txt', () => {      const result = mercariCrawlerService.parseRobotsTxt('');      expect(result).toEqual({        allowed: true,
        crawlDelay: 2,
        disallow: [],
      });
    });    it('should parse robots.txt with wildcard user agent', () => {
      const content = `
User-agent: *
Disallow: /api/
Crawl-delay: 5    `;      const result = mercariCrawlerService.parseRobotsTxt(content);      expect(result).toEqual({        allowed: true,
        crawlDelay: 5,
        disallow: ['/api/'],
      });
    });    it('should parse robots.txt with specific user agent', () => {
      const content = `
User-agent: TCGAssistant
Disallow: /admin/
Crawl-delay: 1    `;      const result = mercariCrawlerService.parseRobotsTxt(content);      expect(result).toEqual({        allowed: true,
        crawlDelay: 1,
        disallow: ['/admin/'],
      });
    });
  });

  describe('searchCard', () => {
    beforeEach(async () => {    // Setup robots.txt      axios.get.mockResolvedValueOnce({        data: 'User-agent: *\nCrawl-delay: 1',
      });      await mercariCrawlerService.init();
    });    it('should search card successfully', async () => {
      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      // Mock search response      axios.get.mockResolvedValueOnce({
        data: `      <li data-testid="item-cell">        <h3>ピカチュウ 基本セット</h3>        <span data-testid="price">¥1,500</span>        <img src="image.jpg" alt="ピカチュウ" />        <a href="/item/123">商品リンク</a>      </li>      `,
      });      const result = await mercariCrawlerService.searchCard(cardInfo);      expect(result.success).toBe(true);      expect(result.platform).toBe('MERCARI');      expect(result.source).toBe('crawler');      expect(result.data).toHaveLength(1);      expect(result.data[0]).toEqual({
        title: 'ピカチュウ 基本セット',
        price: 1500,
        imageUrl: 'image.jpg',
        imageAlt: 'ピカチュウ',
        itemUrl: 'https://jp.mercari.com/item/123',
        platform: 'MERCARI',
        currency: 'JPY',
      });
    });    it('should handle search failure', async () => {
      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      axios.get.mockRejectedValueOnce(new Error('Search failed'));      const result = await mercariCrawlerService.searchCard(cardInfo);      expect(result.success).toBe(false);      expect(result.error).toBe('Search failed');
    });    it('should respect robots.txt rules', async () => {
    // Set robots.txt to disallow search      mercariCrawlerService.robotsRules = {        allowed: false,
        crawlDelay: 1,
        disallow: ['/search/'],
      };      const cardInfo = {
        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      };      const result = await mercariCrawlerService.searchCard(cardInfo);      expect(result.success).toBe(false);      expect(result.error).toBe('根據robots.txt規則，不允許爬取此網站');
    });
  });

  describe('buildSearchQuery', () => {
    it('should build basic search query', () => {      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        cardNumber: '025/025',
        gameType: 'pokemon',
      };      const result = mercariCrawlerService.buildSearchQuery(cardInfo);      expect(result).toBe('ピカチュウ 基本セット 025/025 ポケモン カード');
    });    it('should handle missing optional fields', () => {
      const cardInfo = {        name: 'ピカチュウ',
        gameType: 'pokemon',
      };      const result = mercariCrawlerService.buildSearchQuery(cardInfo);      expect(result).toBe('ピカチュウ ポケモン カード');
    });    it('should handle unknown game type', () => {
      const cardInfo = {        name: 'テストカード',
        gameType: 'unknown',
      };      const result = mercariCrawlerService.buildSearchQuery(cardInfo);      expect(result).toBe('テストカード');
    });
  });

  describe('parseSearchResults', () => {
    it('should parse valid HTML results', () => {      const html = `      <li data-testid="item-cell">      <h3>ピカチュウ カード</h3>      <span data-testid="price">¥1,000</span>      <img src="image1.jpg" alt="ピカチュウ" />      <a href="/item/1">リンク1</a>      </li>      <li data-testid="item-cell">      <h3>ピカチュウ レア</h3>      <span data-testid="price">¥2,000</span>      <img src="image2.jpg" alt="ピカチュウレア" />      <a href="/item/2">リンク2</a>      </li>    `;      const result = mercariCrawlerService.parseSearchResults(html, 10);      expect(result).toHaveLength(2);      expect(result[0]).toEqual({        title: 'ピカチュウ カード',
        price: 1000,
        imageUrl: 'image1.jpg',
        imageAlt: 'ピカチュウ',
        itemUrl: 'https://jp.mercari.com/item/1',
        platform: 'MERCARI',
        currency: 'JPY',
      });      expect(result[1]).toEqual({
        title: 'ピカチュウ レア',
        price: 2000,
        imageUrl: 'image2.jpg',
        imageAlt: 'ピカチュウレア',
        itemUrl: 'https://jp.mercari.com/item/2',
        platform: 'MERCARI',
        currency: 'JPY',
      });
    });    it('should handle invalid HTML gracefully', () => {
      const html = 'Invalid HTML content';      const result = mercariCrawlerService.parseSearchResults(html, 10);      expect(result).toHaveLength(0);
    });    it('should respect maxResults limit', () => {
      const html = `      <li data-testid="item-cell">      <h3>商品1</h3>      <span data-testid="price">¥1,000</span>      <img src="image1.jpg" alt="商品1" />      <a href="/item/1">リンク1</a>      </li>      <li data-testid="item-cell">      <h3>商品2</h3>      <span data-testid="price">¥2,000</span>      <img src="image2.jpg" alt="商品2" />      <a href="/item/2">リンク2</a>      </li>      <li data-testid="item-cell">      <h3>商品3</h3>      <span data-testid="price">¥3,000</span>      <img src="image3.jpg" alt="商品3" />      <a href="/item/3">リンク3</a>      </li>    `;      const result = mercariCrawlerService.parseSearchResults(html, 2);      expect(result).toHaveLength(2);
    });
  });

  describe('cleanHtml', () => {
    it('should clean HTML tags', () => {      const html = '<p>Hello <strong>World</strong>!</p>';      const result = mercariCrawlerService.cleanHtml(html);      expect(result).toBe('Hello World!');
    });    it('should decode HTML entities', () => {
      const html = 'Hello &amp; World &lt;3&gt;';      const result = mercariCrawlerService.cleanHtml(html);      expect(result).toBe('Hello & World <3>');
    });    it('should trim whitespace', () => {
      const html = '  <p>Hello World</p>  ';      const result = mercariCrawlerService.cleanHtml(html);      expect(result).toBe('Hello World');
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache key', () => {      const cardInfo = {        name: 'ピカチュウ',
        series: '基本セット',
        cardNumber: '025/025',
      };      const key1 = mercariCrawlerService.generateCacheKey(cardInfo);      const key2 = mercariCrawlerService.generateCacheKey(cardInfo);      expect(key1).toBe(key2);      expect(key1).toBe('mercari_ピカチュウ_基本セット_025/025');
    });    it('should handle missing fields', () => {
      const cardInfo = {        name: 'ピカチュウ',
      };      const key = mercariCrawlerService.generateCacheKey(cardInfo);      expect(key).toBe('mercari_ピカチュウ__');
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status', () => {      mercariCrawlerService.robotsRules = {        allowed: true,
        crawlDelay: 2,
        disallow: ['/api/'],
      };      mercariCrawlerService.cache.set('test', { data: 'test' });      const status = mercariCrawlerService.getServiceStatus();      expect(status).toEqual({
        baseUrl: 'https://jp.mercari.com',
        robotsRules: {          allowed: true,
          crawlDelay: 2,
          disallow: ['/api/'],
        },
        cacheSize: 1,
        lastRequestTime: 0,
        crawlDelay: 2,      });
    });
  });

  describe('checkServiceStatus', () => {
    it('should return online status when service is available', async () => {      axios.get.mockResolvedValueOnce({        status: 200,
        headers: { 'x-response-time': '100ms',
        },      });      const status = await mercariCrawlerService.checkServiceStatus();      expect(status).toEqual({
        status: 'online',
        responseTime: '100ms',
        statusCode: 200,
      });
    });    it('should return offline status when service is unavailable', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));      const status = await mercariCrawlerService.checkServiceStatus();      expect(status).toEqual({        status: 'offline',
        error: 'Network error',
      });
    });
  });
});
