import axios from 'axios';

/**
 * Robots.txt 解析服務
 * 提供完整的 robots.txt 解析和檢查功能
 */
class RobotsTxtService {
  constructor() {
    this.cache = new Map(); // 快取已解析的 robots.txt
    this.cacheTimeout = 3600000; // 1小時快取過期
    this.defaultUserAgent = 'TCGAssistant/1.0 (https://github.com/your-repo/tcg-assistant)';
    this.maxRedirects = 5;
    this.timeout = 10000;
  }

  /**
   * 檢查並解析網站的 robots.txt
   * @param {string} baseUrl - 網站基礎URL
   * @param {string} userAgent - 用戶代理字串
   * @returns {Promise<Object>} 解析結果
   */
  async checkRobotsTxt(baseUrl, userAgent = this.defaultUserAgent) {
    try {
      const robotsUrl = this.buildRobotsUrl(baseUrl);
      const cacheKey = `${baseUrl}:${userAgent}`;
      
      // 檢查快取
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      console.log(`檢查 robots.txt: ${robotsUrl}`);
      
      const response = await this.fetchRobotsTxt(robotsUrl, userAgent);
      const rules = this.parseRobotsTxt(response.data, userAgent);
      
      // 快取結果
      this.cacheResult(cacheKey, rules);
      
      console.log('robots.txt 解析完成');
      return rules;
    } catch (error) {
      console.error('檢查 robots.txt 失敗:', error);
      throw new Error(`無法檢查 robots.txt: ${error.message}`);
    }
  }

  /**
   * 構建 robots.txt URL
   * @param {string} baseUrl - 基礎URL
   * @returns {string} robots.txt URL
   */
  buildRobotsUrl(baseUrl) {
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.host}/robots.txt`;
  }

  /**
   * 獲取 robots.txt 內容
   * @param {string} robotsUrl - robots.txt URL
   * @param {string} userAgent - 用戶代理
   * @returns {Promise<Object>} HTTP 響應
   */
  async fetchRobotsTxt(robotsUrl, userAgent) {
    try {
      const response = await axios.get(robotsUrl, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/plain, text/html, */*',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        timeout: this.timeout,
        maxRedirects: this.maxRedirects,
        validateStatus: (status) => status < 400,
      });

      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // robots.txt 不存在，返回預設允許規則
        return {
          data: 'User-agent: *\nAllow: /\nCrawl-delay: 1',
          status: 200
        };
      }
      throw error;
    }
  }

  /**
   * 解析 robots.txt 內容
   * @param {string} content - robots.txt 內容
   * @param {string} userAgent - 用戶代理
   * @returns {Object} 解析後的規則
   */
  parseRobotsTxt(content, userAgent) {
    const rules = {
      userAgents: [],
      disallow: [],
      allow: [],
      crawlDelay: 1,
      sitemap: [],
      host: null,
      hasRules: false,
      isAllowed: true,
      specificRules: false,
    };

    const lines = content.split('\n');
    let currentUserAgent = null;
    let hasWildcardRules = false;
    let hasSpecificRules = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 跳過空行和註釋
      if (!line || line.startsWith('#')) {
        continue;
      }

      // 處理多行值（以空格開頭的行）
      if (line.startsWith(' ') || line.startsWith('\t')) {
        if (currentUserAgent && rules.userAgents.includes(currentUserAgent)) {
          // 將多行值附加到前一個指令
          const lastRule = this.getLastRule(rules, currentUserAgent);
          if (lastRule) {
            lastRule.value += ' ' + line.trim();
          }
        }
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        continue;
      }

      const directive = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line.substring(colonIndex + 1).trim();

      switch (directive) {
        case 'user-agent':
          currentUserAgent = value;
          if (value === '*' || value === userAgent) {
            rules.userAgents.push(value);
            if (value === '*') {
              hasWildcardRules = true;
            } else if (value === userAgent) {
              hasSpecificRules = true;
            }
          }
          break;

        case 'disallow':
          if (this.isApplicableUserAgent(currentUserAgent, userAgent)) {
            rules.disallow.push(this.normalizePath(value));
          }
          break;

        case 'allow':
          if (this.isApplicableUserAgent(currentUserAgent, userAgent)) {
            rules.allow.push(this.normalizePath(value));
          }
          break;

        case 'crawl-delay':
          if (this.isApplicableUserAgent(currentUserAgent, userAgent)) {
            const delay = parseFloat(value);
            if (!isNaN(delay) && delay > 0) {
              rules.crawlDelay = Math.max(delay, 1);
            }
          }
          break;

        case 'sitemap':
          if (!rules.sitemap.includes(value)) {
            rules.sitemap.push(value);
          }
          break;

        case 'host':
          if (!rules.host) {
            rules.host = value;
          }
          break;
      }
    }

    rules.hasRules = hasWildcardRules || hasSpecificRules;
    rules.specificRules = hasSpecificRules;
    rules.isAllowed = this.checkIfAllowed(rules, userAgent);

    return rules;
  }

  /**
   * 檢查用戶代理是否適用
   * @param {string} currentUserAgent - 當前規則的用戶代理
   * @param {string} targetUserAgent - 目標用戶代理
   * @returns {boolean} 是否適用
   */
  isApplicableUserAgent(currentUserAgent, targetUserAgent) {
    return currentUserAgent === '*' || currentUserAgent === targetUserAgent;
  }

  /**
   * 標準化路徑
   * @param {string} path - 原始路徑
   * @returns {string} 標準化路徑
   */
  normalizePath(path) {
    if (!path) return '/';
    
    // 移除開頭的斜線（如果有多個）
    path = path.replace(/^\/+/, '/');
    
    // 如果路徑為空，返回根路徑
    if (path === '') return '/';
    
    return path;
  }

  /**
   * 檢查是否允許爬取特定路徑
   * @param {Object} rules - 解析的規則
   * @param {string} userAgent - 用戶代理
   * @param {string} path - 要檢查的路徑
   * @returns {boolean} 是否允許
   */
  checkIfAllowed(rules, userAgent, path = '/') {
    // 如果沒有規則，預設允許
    if (!rules.hasRules) {
      return true;
    }

    // 檢查是否有針對特定用戶代理的規則
    const hasSpecificRules = rules.userAgents.includes(userAgent);
    const hasWildcardRules = rules.userAgents.includes('*');

    // 如果沒有針對我們的規則，預設允許
    if (!hasSpecificRules && !hasWildcardRules) {
      return true;
    }

    // 優先檢查 Allow 規則
    for (const allowPath of rules.allow) {
      if (this.matchesPath(allowPath, path)) {
        return true;
      }
    }

    // 檢查 Disallow 規則
    for (const disallowPath of rules.disallow) {
      if (this.matchesPath(disallowPath, path)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 檢查路徑是否匹配模式
   * @param {string} pattern - 匹配模式
   * @param {string} path - 要檢查的路徑
   * @returns {boolean} 是否匹配
   */
  matchesPath(pattern, path) {
    // 標準化路徑
    pattern = this.normalizePath(pattern);
    path = this.normalizePath(path);

    // 完全匹配
    if (pattern === path) {
      return true;
    }

    // 根路徑特殊處理
    if (pattern === '/') {
      return path === '/';
    }

    // 通配符匹配
    if (pattern.includes('*')) {
      // 特殊處理：如果模式以 /* 結尾，應該匹配路徑本身和其子路徑
      if (pattern.endsWith('/*')) {
        const basePattern = pattern.slice(0, -2); // 移除 /*
        return path === basePattern || path.startsWith(basePattern + '/');
      }
      
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}`);
      return regex.test(path);
    }

    // 前綴匹配
    return path.startsWith(pattern);
  }

  /**
   * 獲取建議的爬取延遲
   * @param {Object} rules - 解析的規則
   * @returns {number} 延遲時間（毫秒）
   */
  getCrawlDelay(rules) {
    return (rules.crawlDelay || 1) * 1000;
  }

  /**
   * 獲取快取結果
   * @param {string} key - 快取鍵
   * @returns {Object|null} 快取結果
   */
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * 快取結果
   * @param {string} key - 快取鍵
   * @param {Object} data - 要快取的資料
   */
  cacheResult(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * 清理過期快取
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 獲取最後一個規則
   * @param {Object} rules - 規則物件
   * @param {string} userAgent - 用戶代理
   * @returns {Object|null} 最後一個規則
   */
  getLastRule(rules, userAgent) {
    // 這個方法用於處理多行值
    // 在實際實現中可能需要更複雜的邏輯
    return null;
  }

  /**
   * 驗證 robots.txt 格式
   * @param {string} content - robots.txt 內容
   * @returns {Object} 驗證結果
   */
  validateRobotsTxt(content) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      lineCount: 0,
      directiveCount: 0,
    };

    const lines = content.split('\n');
    validation.lineCount = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line.startsWith('#')) {
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        validation.errors.push(`第 ${i + 1} 行: 缺少冒號分隔符`);
        validation.isValid = false;
        continue;
      }

      const directive = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line.substring(colonIndex + 1).trim();

      validation.directiveCount++;

      // 驗證指令
      const validDirectives = ['user-agent', 'disallow', 'allow', 'crawl-delay', 'sitemap', 'host'];
      if (!validDirectives.includes(directive)) {
        validation.warnings.push(`第 ${i + 1} 行: 未知指令 "${directive}"`);
      }

      // 驗證 crawl-delay 值
      if (directive === 'crawl-delay') {
        const delay = parseFloat(value);
        if (isNaN(delay) || delay < 0) {
          validation.errors.push(`第 ${i + 1} 行: 無效的 crawl-delay 值 "${value}"`);
          validation.isValid = false;
        }
      }
    }

    return validation;
  }

  /**
   * 生成 robots.txt 摘要報告
   * @param {Object} rules - 解析的規則
   * @returns {Object} 摘要報告
   */
  generateSummary(rules) {
    return {
      hasRules: rules.hasRules,
      specificRules: rules.specificRules,
      isAllowed: rules.isAllowed,
      crawlDelay: rules.crawlDelay,
      disallowCount: rules.disallow.length,
      allowCount: rules.allow.length,
      sitemapCount: rules.sitemap.length,
      hasHost: !!rules.host,
      userAgents: rules.userAgents,
    };
  }
}

export default new RobotsTxtService();
