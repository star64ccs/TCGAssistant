// 導入必要的模組
import robotsTxtService from './robotsTxtService';
import logger from '../utils/logger';
import localStorage from '../utils/localStorage';

/**
 * 評級數據爬蟲服務
 * 遵守robots.txt規則，獲取PSA、CGC和ARS的評級數量分佈
 */

class GradingDataCrawlerService {
  constructor() {
    this.isInitialized = false;
    this.lastRequestTime = 0;
    // 評級公司配置
    this.gradingCompanies = {
      psa: {
        name: 'PSA (Professional Sports Authenticator)',
        baseUrl: 'https://www.psacard.com',
        searchUrl: 'https://www.psacard.com/pop',
        userAgent: 'TCGAssistant-GradingCrawler/1.0',
        robotsTxtUrl: 'https://www.psacard.com/robots.txt',
        crawlDelay: 3, // 預設延遲3秒
        maxRetries: 3,
        timeout: 15000,
      },
      cgc: {
        name: 'CGC (Certified Guaranty Company)',
        baseUrl: 'https://www.cgccards.com',
        searchUrl: 'https://www.cgccards.com/pop-report',
        userAgent: 'TCGAssistant-GradingCrawler/1.0',
        robotsTxtUrl: 'https://www.cgccards.com/robots.txt',
        crawlDelay: 2, // 預設延遲2秒
        maxRetries: 3,
        timeout: 15000,
      },
      ars: {
        name: 'ARS (Authentic Rarities & Services)',
        baseUrl: 'https://www.arsgrading.com',
        searchUrl: 'https://www.arsgrading.com/population-report',
        userAgent: 'TCGAssistant-GradingCrawler/1.0',
        robotsTxtUrl: 'https://www.arsgrading.com/robots.txt',
        crawlDelay: 2, // 預設延遲2秒
        maxRetries: 3,
        timeout: 15000,
      },
    };
    // 快取配置
    this.cacheConfig = {
      ttl: 24 * 60 * 60 * 1000, // 24小時
      maxSize: 1000,
    };
    // 統計數據
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      robotsTxtChecks: 0,
      lastUpdated: null,
    };
    // 評級規則映射
    this.gradeMapping = {
      psa: {
        '10': 'Gem Mint',
        '9': 'Mint',
        '8': 'Near Mint-Mint',
        '7': 'Near Mint',
        '6': 'Excellent-Mint',
        '5': 'Excellent',
        '4': 'Very Good-Excellent',
        '3': 'Very Good',
        '2': 'Good',
        '1': 'Poor',
      },
      cgc: {
        '10': 'Pristine',
        '9.5': 'Gem Mint',
        '9': 'Mint',
        '8.5': 'Near Mint-Mint',
        '8': 'Near Mint',
        '7.5': 'Excellent-Mint',
        '7': 'Excellent',
        '6.5': 'Very Good-Excellent',
        '6': 'Very Good',
        '5.5': 'Good-Very Good',
        '5': 'Good',
        '4.5': 'Very Good-Good',
        '4': 'Very Good',
        '3.5': 'Good-Very Good',
        '3': 'Good',
        '2.5': 'Fair-Good',
        '2': 'Fair',
        '1.5': 'Poor-Fair',
        '1': 'Poor',
        '0.5': 'Poor',
      },
      ars: {
        '10': 'Perfect',
        '9.5': 'Gem Mint',
        '9': 'Mint',
        '8.5': 'Near Mint-Mint',
        '8': 'Near Mint',
        '7.5': 'Excellent-Mint',
        '7': 'Excellent',
        '6.5': 'Very Good-Excellent',
        '6': 'Very Good',
        '5.5': 'Good-Very Good',
        '5': 'Good',
        '4.5': 'Very Good-Good',
        '4': 'Very Good',
        '3.5': 'Good-Very Good',
        '3': 'Good',
        '2.5': 'Fair-Good',
        '2': 'Fair',
        '1.5': 'Poor-Fair',
        '1': 'Poor',
        '0.5': 'Poor',
      },
    };
  }

  /**
   * 初始化服務
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }
    try {
      console.info('🔄 初始化評級數據爬蟲服務...');
      // 檢查所有評級公司的robots.txt
      await this.checkAllRobotsTxt();
      // 載入快取
      await this.loadCache();
      this.isInitialized = true;
      console.info('✅ 評級數據爬蟲服務初始化完成');
      return true;
    } catch (error) {
      console.error('❌ 評級數據爬蟲服務初始化失敗:', error);
      return false;
    }
  }

  /**
   * 檢查所有評級公司的robots.txt
   */
  async checkAllRobotsTxt() {
    console.info('🔍 檢查所有評級公司的robots.txt...');
    for (const [company, config] of Object.entries(this.gradingCompanies)) {
      try {
        console.info(`檢查 ${config.name} 的robots.txt...`);
        const rules = await robotsTxtService || {} || {}.checkRobotsTxt(
          config.baseUrl,
          config.userAgent,
        );
          // 更新配置
        this.gradingCompanies[company].robotsRules = rules;
        this.gradingCompanies[company].crawlDelay = robotsTxtService || {} || {}.getCrawlDelay(rules);
        this.stats.robotsTxtChecks++;
        if (!rules.isAllowed) {
          console.warn(`⚠️ ${config.name} 的robots.txt不允許爬取`);
        } else {
          console.info(`✅ ${config.name} robots.txt檢查通過，延遲: ${this.gradingCompanies[company].crawlDelay}秒`);
        }
      } catch (error) {
        console.error(`❌ 檢查 ${config.name} robots.txt失敗:`, error);
        // 使用預設規則
        this.gradingCompanies[company].robotsRules = {
          isAllowed: true,
          crawlDelay: config.crawlDelay,
          hasRules: false,
        };
      }
    }
  }

  /**
   * 獲取卡牌的評級數量分佈
   */
  async getCardGradingDistribution(cardName, cardSeries = '', options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    const {
      companies = ['psa', 'cgc', 'ars'],
      useCache = true,
      forceRefresh = false,
      cardNumber = '',
      onProgress = null,
    } = options;
    try {
      console.info(`🔍 獲取卡牌 "${cardName}" 的評級分佈數據...`);
      // 生成快取鍵
      const cacheKey = this.generateCacheKey(cardName, cardSeries, cardNumber, companies);
      // 檢查快取
      if (useCache && !forceRefresh) {
        const cachedResult = await this.getCachedResult(cacheKey);
        if (cachedResult) {
          this.stats.cacheHits++;
          console.info('✅ 從快取獲取評級數據');
          return cachedResult;
        }
      }
      this.stats.cacheMisses++;
      // 並行獲取各公司的評級數據
      const results = {};
      const totalCompanies = companies.length;
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        if (onProgress) {
          onProgress({
            step: 'fetching',
            company: this.gradingCompanies[company].name,
            progress: ((i + 1) / totalCompanies) * 100,
          });
        }
        try {
          const companyResult = await this.fetchCompanyGradingData(cardName, cardSeries, cardNumber, company);
          results[company] = companyResult;
        } catch (error) {
          console.error(`❌ 獲取 ${this.gradingCompanies[company].name} 數據失敗:`, error);
          results[company] = {
            success: false,
            error: error.message,
            company: company,
          };
        }
      }
      // 整合結果
      const finalResult = this.aggregateResults(cardName, cardSeries, cardNumber, results);
      // 快取結果
      if (useCache) {
        await this.cacheResult(cacheKey, finalResult);
      }
      this.stats.successfulRequests++;
      this.stats.lastUpdated = new Date().toISOString();
      console.info('✅ 評級數據獲取完成');
      return finalResult;
    } catch (error) {
      this.stats.failedRequests++;
      console.error('❌ 獲取評級數據失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取單個公司的評級數據
   */
  async fetchCompanyGradingData(cardName, cardSeries, cardNumber, company) {
    const config = this.gradingCompanies[company];
    if (!config.robotsRules?.isAllowed) {
      throw new Error(`${config.name} 的robots.txt不允許爬取`);
    }
    // 遵守延遲
    await this.respectDelay(company);
    try {
      console.info(`🔍 從 ${config.name} 獲取 "${cardName}" 的評級數據...`);
      // 構建搜索URL
      const searchUrl = this.buildSearchUrl(cardName, cardSeries, cardNumber, company);
      // 發送請求
      const response = await fetch.get(searchUrl, {
        headers: {
          'User-Agent': config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: config.timeout,
        maxRedirects: 5,
      });
      this.stats.totalRequests++;
      // 解析HTML內容
      const gradingData = this.parseGradingData(response.data, company);
      return {
        success: true,
        company: company,
        companyName: config.name,
        cardName: cardName,
        cardSeries: cardSeries,
        totalGraded: gradingData.totalGraded,
        gradeDistribution: gradingData.gradeDistribution,
        averageGrade: gradingData.averageGrade,
        highestGrade: gradingData.highestGrade,
        lowestGrade: gradingData.lowestGrade,
        lastUpdated: new Date().toISOString(),
        source: config.baseUrl,
      };
    } catch (error) {
      console.error(`❌ 從 ${config.name} 獲取數據失敗:`, error);
      throw error;
    }
  }

  /**
   * 構建搜索URL
   */
  buildSearchUrl(cardName, cardSeries, cardNumber, company) {
    const config = this.gradingCompanies[company];
    // 構建查詢參數
    const params = new URLSearchParams();
    if (cardName.trim()) {
      params.append('card', cardName.trim());
    }
    if (cardSeries.trim()) {
      params.append('set', cardSeries.trim());
    }
    if (cardNumber.trim()) {
      params.append('number', cardNumber.trim());
    }
    const queryString = params.toString();
    const url = queryString ? `${config.searchUrl}?${queryString}` : config.searchUrl;
    return url;
  }

  /**
   * 解析評級數據
   */
  parseGradingData(htmlContent, company) {
    try {
      // 這裡需要根據實際的HTML結構進行解析
      // 由於不同公司的網站結構不同，這裡提供一個通用的解析框架
      const gradingData = {
        totalGraded: 0,
        gradeDistribution: {},
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 10,
      };
        // 使用正則表達式提取數據
      const patterns = this.getParsingPatterns(company);
      // 提取總評級數量
      const totalMatch = htmlContent.match(patterns.totalGraded);
      if (totalMatch) {
        gradingData.totalGraded = parseInt(totalMatch[1].replace(/,/g, ''));
      }
      // 提取各等級分佈
      for (const grade of Object.keys(this.gradeMapping[company])) {
        const gradePattern = patterns.gradeDistribution.replace('{grade}', grade);
        const gradeMatch = htmlContent.match(gradePattern);
        if (gradeMatch) {
          const count = parseInt(gradeMatch[1].replace(/,/g, ''));
          gradingData.gradeDistribution[grade] = count;
          // 更新最高和最低等級
          const gradeNum = parseFloat(grade);
          if (count > 0) {
            gradingData.highestGrade = Math.max(gradingData.highestGrade, gradeNum);
            gradingData.lowestGrade = Math.min(gradingData.lowestGrade, gradeNum);
          }
        }
      }
      // 計算平均等級
      let totalCount = 0;
      let totalScore = 0;
      for (const [grade, count] of Object.entries(gradingData.gradeDistribution)) {
        if (count > 0) {
          totalCount += count;
          totalScore += parseFloat(grade) * count;
        }
      }
      if (totalCount > 0) {
        gradingData.averageGrade = (totalScore / totalCount).toFixed(2);
      }
      return gradingData;
    } catch (error) {
      console.error(`❌ 解析 ${company} 評級數據失敗:`, error);
      throw new Error(`解析評級數據失敗: ${error.message}`);
    }
  }

  /**
   * 獲取解析模式
   */
  getParsingPatterns(company) {
    const patterns = {
      psa: {
        totalGraded: /Total\s+Graded[:\s]*([0-9,]+)/i,
        gradeDistribution: /Grade\s+{grade}[:\s]*([0-9,]+)/i,
      },
      cgc: {
        totalGraded: /Total\s+Population[:\s]*([0-9,]+)/i,
        gradeDistribution: /{grade}[:\s]*([0-9,]+)/i,
      },
      ars: {
        totalGraded: /Total\s+Cards[:\s]*([0-9,]+)/i,
        gradeDistribution: /Grade\s+{grade}[:\s]*([0-9,]+)/i,
      },
    };
    return patterns[company] || patterns.psa;
  }

  /**
   * 整合結果
   */
  aggregateResults(cardName, cardSeries, cardNumber, companyResults) {
    const aggregated = {
      cardName: cardName,
      cardSeries: cardSeries,
      cardNumber: cardNumber,
      totalGraded: 0,
      companies: {},
      overallStats: {
        totalGraded: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 10,
        gradeDistribution: {},
      },
      lastUpdated: new Date().toISOString(),
    };
    let totalCards = 0;
    let totalScore = 0;
    let highestGrade = 0;
    let lowestGrade = 10;
    // 整合各公司數據
    for (const [company, result] of Object.entries(companyResults)) {
      aggregated.companies[company] = result;
      if (result.success && result.totalGraded > 0) {
        totalCards += result.totalGraded;
        totalScore += parseFloat(result.averageGrade) * result.totalGraded;
        highestGrade = Math.max(highestGrade, parseFloat(result.highestGrade));
        lowestGrade = Math.min(lowestGrade, parseFloat(result.lowestGrade));
        // 合併等級分佈
        for (const [grade, count] of Object.entries(result.gradeDistribution)) {
          if (!aggregated.overallStats.gradeDistribution[grade]) {
            aggregated.overallStats.gradeDistribution[grade] = 0;
          }
          aggregated.overallStats.gradeDistribution[grade] += count;
        }
      }
    }
    // 計算總體統計
    aggregated.overallStats.totalGraded = totalCards;
    if (totalCards > 0) {
      aggregated.overallStats.averageGrade = (totalScore / totalCards).toFixed(2);
    }
    aggregated.overallStats.highestGrade = highestGrade;
    aggregated.overallStats.lowestGrade = lowestGrade;
    return aggregated;
  }

  /**
   * 遵守延遲
   */
  async respectDelay(company) {
    const config = this.gradingCompanies[company];
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const requiredDelay = config.crawlDelay * 1000; // 轉換為毫秒
    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest;
      console.info(`⏳ 遵守robots.txt延遲: ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * 生成快取鍵
   */
  generateCacheKey(cardName, cardSeries, cardNumber, companies) {
    const companiesStr = companies.sort().join(',');
    return `grading_data_${cardName}_${cardSeries}_${cardNumber}_${companiesStr}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }

  /**
   * 獲取快取結果
   */
  async getCachedResult(cacheKey) {
    try {
      const cached = await localStorage.getItem(`grading_crawler_${cacheKey}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.cacheConfig.ttl) {
          return data.result;
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ 讀取快取失敗:', error);
      return null;
    }
  }

  /**
   * 快取結果
   */
  async cacheResult(cacheKey, result) {
    try {
      const cacheData = {
        result: result,
        timestamp: Date.now(),
      };
      await localStorage.setItem(`grading_crawler_${cacheKey}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('⚠️ 快取結果失敗:', error);
    }
  }

  /**
   * 載入快取
   */
  async loadCache() {
    try {
      // 這裡可以載入一些預設的快取數據
      console.info('📦 載入評級數據快取...');
    } catch (error) {
      console.warn('⚠️ 載入快取失敗:', error);
    }
  }

  /**
   * 獲取服務統計
   */
  getStats() {
    return {
      ...this.stats,
      companies: Object.keys(this.gradingCompanies).map(company => ({
        company: company,
        name: this.gradingCompanies[company].name,
        crawlDelay: this.gradingCompanies[company].crawlDelay,
        isAllowed: this.gradingCompanies[company].robotsRules?.isAllowed || false,
      })),
    };
  }

  /**
   * 清理資源
   */
  async dispose() {
    try {
      console.info('🧹 清理評級數據爬蟲服務資源...');
      this.isInitialized = false;
    } catch (error) {
      console.error('❌ 清理資源失敗:', error);
    }
  }
}

// 單例模式
let gradingDataCrawlerServiceInstance = null;

export const getGradingDataCrawlerService = () => {
  if (!gradingDataCrawlerServiceInstance) {
    gradingDataCrawlerServiceInstance = new GradingDataCrawlerService();
  }
  return gradingDataCrawlerServiceInstance;
};

export { GradingDataCrawlerService };
export default GradingDataCrawlerService;
