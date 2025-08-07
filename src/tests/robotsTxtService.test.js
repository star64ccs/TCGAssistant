import robotsTxtService from '../services/robotsTxtService';

// 模擬 axios
jest.mock('axios');
const axios = require('axios');

describe('Robots.txt 解析服務測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    robotsTxtService.cache.clear();
  });

  describe('基本功能測試', () => {
    it('應該正確構建 robots.txt URL', () => {
      const url = robotsTxtService.buildRobotsUrl('https://example.com');
      expect(url).toBe('https://example.com/robots.txt');
      
      const url2 = robotsTxtService.buildRobotsUrl('https://www.example.com/path');
      expect(url2).toBe('https://www.example.com/robots.txt');
    });

    it('應該正確檢查用戶代理適用性', () => {
      expect(robotsTxtService.isApplicableUserAgent('*', 'TCGAssistant/1.0')).toBe(true);
      expect(robotsTxtService.isApplicableUserAgent('TCGAssistant/1.0', 'TCGAssistant/1.0')).toBe(true);
      expect(robotsTxtService.isApplicableUserAgent('Googlebot', 'TCGAssistant/1.0')).toBe(false);
    });

    it('應該正確標準化路徑', () => {
      expect(robotsTxtService.normalizePath('/')).toBe('/');
      expect(robotsTxtService.normalizePath('')).toBe('/');
      expect(robotsTxtService.normalizePath('/path')).toBe('/path');
      expect(robotsTxtService.normalizePath('//path')).toBe('/path');
      expect(robotsTxtService.normalizePath('///path')).toBe('/path');
    });
  });

  describe('路徑匹配測試', () => {
    it('應該正確匹配路徑模式', () => {
      // 完全匹配
      expect(robotsTxtService.matchesPath('/path', '/path')).toBe(true);
      
      // 根路徑
      expect(robotsTxtService.matchesPath('/', '/')).toBe(true);
      expect(robotsTxtService.matchesPath('/', '/other')).toBe(false);
      
      // 前綴匹配
      expect(robotsTxtService.matchesPath('/admin', '/admin/users')).toBe(true);
      expect(robotsTxtService.matchesPath('/admin', '/admin')).toBe(true);
      expect(robotsTxtService.matchesPath('/admin', '/other')).toBe(false);
      
      // 通配符匹配
      expect(robotsTxtService.matchesPath('/admin/*', '/admin/users')).toBe(true);
      expect(robotsTxtService.matchesPath('/admin/*', '/admin')).toBe(true);
      expect(robotsTxtService.matchesPath('*.jpg', '/images/photo.jpg')).toBe(true);
      expect(robotsTxtService.matchesPath('*.jpg', '/images/photo.png')).toBe(false);
    });
  });

  describe('robots.txt 解析測試', () => {
    it('應該正確解析基本的 robots.txt', () => {
      const content = `
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /search
Crawl-delay: 2

User-agent: TCGAssistant/1.0
Allow: /search
Crawl-delay: 1
      `;

      const rules = robotsTxtService.parseRobotsTxt(content, 'TCGAssistant/1.0');

      expect(rules.userAgents).toContain('*');
      expect(rules.userAgents).toContain('TCGAssistant/1.0');
      expect(rules.disallow).toContain('/admin/');
      expect(rules.disallow).toContain('/private/');
      expect(rules.allow).toContain('/search');
      expect(rules.crawlDelay).toBe(1); // 應該使用針對特定用戶代理的延遲
      expect(rules.hasRules).toBe(true);
      expect(rules.specificRules).toBe(true);
    });

    it('應該正確解析包含 sitemap 和 host 的 robots.txt', () => {
      const content = `
User-agent: *
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
Host: example.com
      `;

      const rules = robotsTxtService.parseRobotsTxt(content, 'TCGAssistant/1.0');

      expect(rules.sitemap).toContain('https://example.com/sitemap.xml');
      expect(rules.sitemap).toContain('https://example.com/sitemap-news.xml');
      expect(rules.host).toBe('example.com');
      expect(rules.disallow).toContain('/admin/');
    });

    it('應該正確處理註釋和空行', () => {
      const content = `
# 這是註釋
User-agent: *

# 另一個註釋
Disallow: /admin/

# 空行下面

Allow: /search
      `;

      const rules = robotsTxtService.parseRobotsTxt(content, 'TCGAssistant/1.0');

      expect(rules.userAgents).toContain('*');
      expect(rules.disallow).toContain('/admin/');
      expect(rules.allow).toContain('/search');
    });

    it('應該正確處理無效的 crawl-delay 值', () => {
      const content = `
User-agent: *
Crawl-delay: invalid
Crawl-delay: -1
Crawl-delay: 0
Crawl-delay: 5
      `;

      const rules = robotsTxtService.parseRobotsTxt(content, 'TCGAssistant/1.0');

      expect(rules.crawlDelay).toBe(5); // 應該使用最後一個有效值
    });
  });

  describe('權限檢查測試', () => {
    it('應該正確檢查是否允許爬取', () => {
      const rules = {
        hasRules: true,
        userAgents: ['*'],
        disallow: ['/admin/', '/private/'],
        allow: ['/search'],
        isAllowed: true,
      };

      // 允許的路徑
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/search')).toBe(true);
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/search/results')).toBe(true);
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/public')).toBe(true);

      // 禁止的路徑
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/admin/')).toBe(false);
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/admin/users')).toBe(false);
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/private/')).toBe(false);
    });

    it('應該優先處理 Allow 規則', () => {
      const rules = {
        hasRules: true,
        userAgents: ['*'],
        disallow: ['/admin/'],
        allow: ['/admin/public'],
        isAllowed: true,
      };

      // Allow 規則應該優先於 Disallow 規則
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/admin/public')).toBe(true);
      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/admin/private')).toBe(false);
    });

    it('應該正確處理沒有規則的情況', () => {
      const rules = {
        hasRules: false,
        userAgents: [],
        disallow: [],
        allow: [],
        isAllowed: true,
      };

      expect(robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/any/path')).toBe(true);
    });
  });

  describe('快取功能測試', () => {
    it('應該正確快取和檢索結果', () => {
      const testData = { test: 'data' };
      const key = 'test:key';

      // 快取資料
      robotsTxtService.cacheResult(key, testData);

      // 檢索資料
      const cached = robotsTxtService.getCachedResult(key);
      expect(cached).toEqual(testData);
    });

    it('應該正確處理快取過期', () => {
      const testData = { test: 'data' };
      const key = 'test:key';

      // 快取資料
      robotsTxtService.cacheResult(key, testData);

      // 模擬時間過期
      const originalTimeout = robotsTxtService.cacheTimeout;
      robotsTxtService.cacheTimeout = 0;

      // 檢索資料應該返回 null
      const cached = robotsTxtService.getCachedResult(key);
      expect(cached).toBeNull();

      // 恢復原始超時時間
      robotsTxtService.cacheTimeout = originalTimeout;
    });

    it('應該正確清理過期快取', () => {
      const testData = { test: 'data' };
      const key1 = 'test:key1';
      const key2 = 'test:key2';

      // 快取兩個資料
      robotsTxtService.cacheResult(key1, testData);
      robotsTxtService.cacheResult(key2, testData);

      // 模擬第一個快取過期
      const cache = robotsTxtService.cache;
      const entry1 = cache.get(key1);
      entry1.timestamp = Date.now() - robotsTxtService.cacheTimeout - 1000;

      // 清理過期快取
      robotsTxtService.clearExpiredCache();

      // 檢查結果
      expect(cache.has(key1)).toBe(false);
      expect(cache.has(key2)).toBe(true);
    });
  });

  describe('驗證功能測試', () => {
    it('應該正確驗證 robots.txt 格式', () => {
      const validContent = `
User-agent: *
Disallow: /admin/
Crawl-delay: 1
      `;

      const validation = robotsTxtService.validateRobotsTxt(validContent);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.directiveCount).toBe(3);
    });

    it('應該檢測格式錯誤', () => {
      const invalidContent = `
User-agent: *
Disallow /admin/
Crawl-delay: invalid
      `;

      const validation = robotsTxtService.validateRobotsTxt(invalidContent);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('應該檢測未知指令', () => {
      const content = `
User-agent: *
Disallow: /admin/
Unknown-directive: value
      `;

      const validation = robotsTxtService.validateRobotsTxt(content);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('摘要生成測試', () => {
    it('應該正確生成摘要報告', () => {
      const rules = {
        hasRules: true,
        specificRules: true,
        isAllowed: true,
        crawlDelay: 2,
        disallow: ['/admin/', '/private/'],
        allow: ['/search'],
        sitemap: ['https://example.com/sitemap.xml'],
        host: 'example.com',
        userAgents: ['*', 'TCGAssistant/1.0'],
      };

      const summary = robotsTxtService.generateSummary(rules);

      expect(summary.hasRules).toBe(true);
      expect(summary.specificRules).toBe(true);
      expect(summary.isAllowed).toBe(true);
      expect(summary.crawlDelay).toBe(2);
      expect(summary.disallowCount).toBe(2);
      expect(summary.allowCount).toBe(1);
      expect(summary.sitemapCount).toBe(1);
      expect(summary.hasHost).toBe(true);
      expect(summary.userAgents).toEqual(['*', 'TCGAssistant/1.0']);
    });
  });

  describe('HTTP 請求測試', () => {
    it('應該正確處理 robots.txt 請求', async () => {
      const mockResponse = {
        data: 'User-agent: *\nDisallow: /admin/\nCrawl-delay: 1',
        status: 200,
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      const rules = await robotsTxtService.checkRobotsTxt('https://example.com');

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/robots.txt',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': robotsTxtService.defaultUserAgent,
          }),
          timeout: robotsTxtService.timeout,
        })
      );

      expect(rules.userAgents).toContain('*');
      expect(rules.disallow).toContain('/admin/');
      expect(rules.crawlDelay).toBe(1);
    });

    it('應該正確處理 404 錯誤', async () => {
      const error = {
        response: { status: 404 },
      };

      axios.get.mockRejectedValueOnce(error);

      const rules = await robotsTxtService.checkRobotsTxt('https://example.com');

      expect(rules.userAgents).toContain('*');
      expect(rules.allow).toContain('/');
      expect(rules.crawlDelay).toBe(1);
    });

    it('應該正確處理其他錯誤', async () => {
      const error = new Error('Network error');
      axios.get.mockRejectedValueOnce(error);

      await expect(robotsTxtService.checkRobotsTxt('https://example.com')).rejects.toThrow('無法檢查 robots.txt: Network error');
    });
  });

  describe('延遲計算測試', () => {
    it('應該正確計算爬取延遲', () => {
      const rules = { crawlDelay: 2 };
      const delay = robotsTxtService.getCrawlDelay(rules);
      expect(delay).toBe(2000); // 2秒 = 2000毫秒
    });

    it('應該使用預設延遲當沒有指定時', () => {
      const rules = {};
      const delay = robotsTxtService.getCrawlDelay(rules);
      expect(delay).toBe(1000); // 預設1秒
    });
  });
});
