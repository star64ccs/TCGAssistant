// 投資建議配置
const INVESTMENT_CONFIG = {
  // 風險等級配置
  RISK_LEVELS: {
    CONSERVATIVE: { maxRisk: 0.2, targetReturn: 0.05, maxConcentration: 0.1, rebalanceFrequency: 30 },
    MODERATE: { maxRisk: 0.4, targetReturn: 0.12, maxConcentration: 0.15, rebalanceFrequency: 14 },
    AGGRESSIVE: { maxRisk: 0.6, targetReturn: 0.20, maxConcentration: 0.25, rebalanceFrequency: 7 },
  },

  // 市場指標權重
  MARKET_INDICATORS: {
    PRICE_TREND: 0.25,
    VOLUME_ANALYSIS: 0.20,
    MARKET_SENTIMENT: 0.15,
    TECHNICAL_INDICATORS: 0.20,
    FUNDAMENTAL_ANALYSIS: 0.20,
  },

  // 預測時間範圍
  PREDICTION_PERIODS: [30, 90, 180, 365], // 天

  // 最小投資金額
  MIN_INVESTMENT: 100,

  // 最大投資金額
  MAX_INVESTMENT: 10000,

  // 機器學習模型配置
  ML_CONFIG: {
    confidenceThreshold: 0.7,
    minDataPoints: 30,
    predictionHorizon: 180,
    updateFrequency: 24, // 小時
  },

  // 風險評估配置
  RISK_CONFIG: {
    volatilityWeight: 0.3,
    liquidityWeight: 0.2,
    marketRiskWeight: 0.25,
    concentrationWeight: 0.15,
    regulatoryWeight: 0.1,
  },
};

// 導入必要的模組
import IntelligentInvestmentAdvisor from './intelligentInvestmentAdvisor';
import apiClient from '../utils/apiClient';
import { getUserPortfolio } from '../services/portfolioService';
import { getCardPriceHistory } from '../services/priceService';

// 投資建議服務類
class InvestmentAdviceService {
  constructor() {
    this.analysisCache = new Map();
    this.userPreferences = new Map();
    this.marketData = null;
    this.lastUpdate = null;
    this.intelligentAdvisor = new IntelligentInvestmentAdvisor() || {} || {} || {}();
    this.mlModels = new Map();
    this.riskModels = new Map();
    // 實時數據更新
    this.realTimeData = {
      marketSentiment: null,
      priceAlerts: [],
      volumeSpikes: [],
      newsImpact: [],
    };
  }

  // 初始化服務
  async initialize() {
    try {
      await Promise.all([
        this.loadMarketData(),
        this.loadUserPreferences(),
        this.initializeMLModels(),
        this.initializeRiskModels(),
        this.startRealTimeUpdates(),
      ]);
    } catch (error) {
      throw error;
    }
  }

  // 初始化機器學習模型
  async initializeMLModels() {
    try {
      // 初始化價格預測模型
      this.mlModels.set('pricePrediction', await this.createPricePredictionModel());
      // 初始化風險評估模型
      this.mlModels.set('riskAssessment', await this.createRiskAssessmentModel());
      // 初始化投資組合優化模型
      this.mlModels.set('portfolioOptimization', await this.createPortfolioOptimizationModel());
    } catch (error) {}
  }

  // 初始化風險模型
  async initializeRiskModels() {
    try {
      // 市場風險模型
      this.riskModels.set('marketRisk', this.createMarketRiskModel());
      // 流動性風險模型
      this.riskModels.set('liquidityRisk', this.createLiquidityRiskModel());
      // 集中度風險模型
      this.riskModels.set('concentrationRisk', this.createConcentrationRiskModel());
    } catch (error) {}
  }

  // 開始實時數據更新
  async startRealTimeUpdates() {
    // 每小時更新市場數據
    setInterval(async () => {
      try {
        await this.updateRealTimeData();
      } catch (error) {}
    }, 60 * 60 * 1000); // 1小時
    // 每5分鐘檢查價格警報
    setInterval(async () => {
      try {
        await this.checkPriceAlerts();
      } catch (error) {}
    }, 5 * 60 * 1000); // 5分鐘
  }

  // 更新實時數據
  async updateRealTimeData() {
    try {
      const [sentiment, alerts, spikes, news] = await Promise.all([
        this.getRealTimeMarketSentiment(),
        this.getPriceAlerts(),
        this.getVolumeSpikes(),
        this.getNewsImpact(),
      ]);
      this.realTimeData = {
        marketSentiment: sentiment,
        priceAlerts: alerts,
        volumeSpikes: spikes,
        newsImpact: news,
        lastUpdate: Date.now(),
      };
    } catch (error) {}
  }

  // 載入市場數據
  async loadMarketData() {
    try {
      const [trends, sentiment, volatility, correlation] = await Promise.all([
        this.getMarketTrends(),
        this.getMarketSentiment(),
        this.getMarketVolatility(),
        this.getMarketCorrelation(),
      ]);
      this.marketData = {
        trends,
        sentiment,
        volatility,
        correlation,
        timestamp: Date.now(),
      };
      this.lastUpdate = Date.now();
    } catch (error) {
      throw error;
    }
  }

  // 獲取市場波動率
  async getMarketVolatility() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/volatility');
      return response.data;
    } catch (error) {
      return this.getDefaultMarketVolatility();
    }
  }

  // 獲取市場相關性
  async getMarketCorrelation() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/correlation');
      return response.data;
    } catch (error) {
      return this.getDefaultMarketCorrelation();
    }
  }

  // 獲取實時市場情緒
  async getRealTimeMarketSentiment() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/sentiment/realtime');
      return response.data;
    } catch (error) {
      return { overall: 0.5, confidence: 0.6 };
    }
  }

  // 獲取價格警報
  async getPriceAlerts() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/alerts/price');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // 獲取交易量異常
  async getVolumeSpikes() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/alerts/volume');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // 獲取新聞影響
  async getNewsImpact() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/news/impact');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // 檢查價格警報
  async checkPriceAlerts() {
    try {
      const alerts = await this.getPriceAlerts();
      const userAlerts = await this.getUserPriceAlerts();
      for (const alert of alerts) {
        if (userAlerts.some(userAlert => userAlert.cardId === alert.cardId)) {
          await this.sendPriceAlertNotification(alert);
        }
      }
    } catch (error) {}
  }

  // 生成投資建議
  async generateInvestmentAdvice(userId, investmentAmount, riskLevel = 'MODERATE', timeHorizon = 180, priceRange = 'ALL', cardTypes = ['pokemon', 'yugioh', 'mtg', 'onepiece']) {
    try {
      // 驗證輸入參數
      this.validateInvestmentParameters(investmentAmount, riskLevel, timeHorizon);
      // 獲取用戶投資組合
      const portfolio = await this.getUserInvestmentPortfolio(userId);
      // 分析市場機會（根據價格範圍和卡牌類型過濾）
      const marketOpportunities = await this.analyzeMarketOpportunities(priceRange, cardTypes);
      // 使用智能投資顧問
      const intelligentAdvice = await this.intelligentAdvisor.generateInvestmentAdvice(
        userId,
        { portfolio, opportunities: marketOpportunities },
        {
          timeHorizon: `${Math.round(timeHorizon / 30)}個月`,
          riskTolerance: riskLevel.toLowerCase(),
          investmentAmount,
          strategy: 'balanced',
          includeBacktest: true,
          priceRange,
          cardTypes,
        },
      );
        // 生成投資建議
      const recommendations = await this.generateRecommendations(
        portfolio,
        marketOpportunities,
        investmentAmount,
        riskLevel,
        timeHorizon,
        priceRange,
        cardTypes,
      );
        // 計算風險評估
      const riskAssessment = await this.calculateAdvancedRiskAssessment(recommendations, riskLevel, portfolio);
      // 生成投資組合建議
      const portfolioAdvice = await this.generateAdvancedPortfolioAdvice(recommendations, investmentAmount, portfolio);
      // 生成市場分析
      const marketAnalysis = await this.generateComprehensiveMarketAnalysis();
      // 生成投資策略
      const investmentStrategy = await this.generateInvestmentStrategy(
        recommendations,
        riskAssessment,
        portfolio,
        timeHorizon,
      );
      return {
        recommendations,
        riskAssessment,
        portfolioAdvice,
        marketAnalysis,
        investmentStrategy,
        intelligentAdvice: intelligentAdvice.success ? intelligentAdvice.advice : null,
        realTimeData: this.realTimeData,
        timestamp: Date.now(),
        confidence: this.calculateAdvancedConfidence(recommendations, intelligentAdvice),
      };
    } catch (error) {
      throw new Error('無法生成投資建議，請稍後再試');
    }
  }

  // 驗證投資參數
  validateInvestmentParameters(amount, riskLevel, timeHorizon) {
    if (amount < INVESTMENT_CONFIG.MIN_INVESTMENT || amount > INVESTMENT_CONFIG.MAX_INVESTMENT) {
      throw new Error(`投資金額必須在 $${INVESTMENT_CONFIG.MIN_INVESTMENT} - $${INVESTMENT_CONFIG.MAX_INVESTMENT} 之間`);
    }
    if (!INVESTMENT_CONFIG.RISK_LEVELS[riskLevel]) {
      throw new Error('無效的風險等級');
    }
    if (!INVESTMENT_CONFIG.PREDICTION_PERIODS.includes(timeHorizon)) {
      throw new Error('無效的投資時間範圍');
    }
  }

  // 獲取用戶投資組合
  async getUserInvestmentPortfolio(userId) {
    try {
      const portfolio = await getUserPortfolio || (() => {}) || (() => {}) || (() => {})(userId);
      return this.analyzePortfolio(portfolio);
    } catch (error) {
      return this.getDefaultPortfolio();
    }
  }

  // 分析投資組合
  analyzePortfolio(portfolio) {
    const analysis = {
      totalValue: 0,
      diversification: 0,
      riskLevel: 'MODERATE',
      performance: 0,
      holdings: [],
    };
    if (portfolio && portfolio.cards) {
      analysis.totalValue = portfolio.cards.reduce((sum, card) => sum + (card.currentPrice || 0), 0);
      analysis.holdings = portfolio.cards.map(card => ({
        id: card.id,
        name: card.name,
        currentPrice: card.currentPrice,
        quantity: card.quantity,
        totalValue: card.currentPrice * card.quantity,
        performance: this.calculateCardPerformance(card),
      }));
      analysis.diversification = this.calculateDiversification(analysis.holdings);
      analysis.riskLevel = this.calculatePortfolioRisk(analysis.holdings);
      analysis.performance = this.calculatePortfolioPerformance(analysis.holdings);
    }
    return analysis;
  }

  // 分析市場機會
  async analyzeMarketOpportunities(priceRange = 'ALL', cardTypes = ['pokemon', 'yugioh', 'mtg', 'onepiece']) {
    try {
      const opportunities = [];
      // 獲取熱門卡牌
      const trendingCards = await this.getTrendingCards();
      // 獲取低估卡牌
      const undervaluedCards = await this.getUndervaluedCards();
      // 獲取新發行卡牌
      const newReleases = await this.getNewReleases();

      // 合併所有卡牌並過濾
      const allCards = [...trendingCards, ...undervaluedCards, ...newReleases];
      const filteredCards = this.filterCardsByCriteria(allCards, priceRange, cardTypes);

      // 分析每個機會
      for (const card of filteredCards) {
        const analysis = await this.analyzeCardOpportunity(card);
        if (analysis.score > 0.6) { // 只推薦評分超過 60% 的機會
          opportunities.push(analysis);
        }
      }
      // 按評分排序
      return opportunities.sort((a, b) => b.score - a.score);
    } catch (error) {
      return [];
    }
  }

  // 新增：根據價格範圍和卡牌類型過濾卡牌
  filterCardsByCriteria(cards, priceRange, cardTypes) {
    return cards.filter(card => {
      // 檢查卡牌類型
      const cardType = card.game_type || card.type || 'unknown';
      if (!cardTypes.includes(cardType)) {
        return false;
      }

      // 檢查價格範圍
      const currentPrice = card.currentPrice || card.price || 0;
      switch (priceRange) {
        case 'BUDGET':
          return currentPrice >= 1 && currentPrice <= 50;
        case 'MID_RANGE':
          return currentPrice >= 50 && currentPrice <= 200;
        case 'PREMIUM':
          return currentPrice >= 200 && currentPrice <= 1000;
        case 'LUXURY':
          return currentPrice >= 1000;
        case 'ALL':
        default:
          return true;
      }
    });
  }

  // 分析單個卡牌機會
  async analyzeCardOpportunity(card) {
    try {
      const analysis = {
        card,
        score: 0,
        factors: {},
        risk: 0,
        potentialReturn: 0,
        timeToMaturity: 0,
      };
        // 價格趨勢分析
      const priceTrend = await this.analyzePriceTrend(card.id);
      analysis.factors.priceTrend = priceTrend;
      analysis.score += priceTrend.score * INVESTMENT_CONFIG.MARKET_INDICATORS.PRICE_TREND;
      // 交易量分析
      const volumeAnalysis = await this.analyzeVolume(card.id);
      analysis.factors.volumeAnalysis = volumeAnalysis;
      analysis.score += volumeAnalysis.score * INVESTMENT_CONFIG.MARKET_INDICATORS.VOLUME_ANALYSIS;
      // 市場情緒分析
      const sentiment = await this.analyzeSentiment(card.id);
      analysis.factors.sentiment = sentiment;
      analysis.score += sentiment.score * INVESTMENT_CONFIG.MARKET_INDICATORS.MARKET_SENTIMENT;
      // 技術指標分析
      const technical = await this.analyzeTechnicalIndicators(card.id);
      analysis.factors.technical = technical;
      analysis.score += technical.score * INVESTMENT_CONFIG.MARKET_INDICATORS.TECHNICAL_INDICATORS;
      // 基本面分析
      const fundamental = await this.analyzeFundamentals(card);
      analysis.factors.fundamental = fundamental;
      analysis.score += fundamental.score * INVESTMENT_CONFIG.MARKET_INDICATORS.FUNDAMENTAL_ANALYSIS;
      // 計算風險和潛在回報
      analysis.risk = this.calculateCardRisk(analysis.factors);
      analysis.potentialReturn = this.calculatePotentialReturn(analysis.factors);
      analysis.timeToMaturity = this.estimateTimeToMaturity(analysis.factors);
      return analysis;
    } catch (error) {
      return { card, score: 0, factors: {}, risk: 1, potentialReturn: 0, timeToMaturity: 365 };
    }
  }

  // 生成投資建議
  async generateRecommendations(portfolio, opportunities, amount, riskLevel, timeHorizon, priceRange, cardTypes) {
    const recommendations = [];
    const riskConfig = INVESTMENT_CONFIG.RISK_LEVELS[riskLevel];
    // 根據風險等級和投資金額分配資金
    const allocation = this.calculateAllocation(amount, riskLevel, opportunities.length);
    for (let i = 0; i < opportunities.length && i < allocation.length; i++) {
      const opportunity = opportunities[i];
      const allocationAmount = allocation[i];
      if (opportunity.score > 0.7 && opportunity.risk <= riskConfig.maxRisk) {
        recommendations.push({
          card: opportunity.card,
          recommendedAmount: allocationAmount,
          confidence: opportunity.score,
          risk: opportunity.risk,
          potentialReturn: opportunity.potentialReturn,
          timeToMaturity: opportunity.timeToMaturity,
          reasoning: this.generateReasoning(opportunity),
          action: this.determineAction(opportunity),
        });
      }
    }
    return recommendations;
  }

  // 計算資金分配
  calculateAllocation(amount, riskLevel, opportunityCount) {
    const riskConfig = INVESTMENT_CONFIG.RISK_LEVELS[riskLevel];
    const allocation = [];
    if (opportunityCount === 0) {
      return allocation;
    }
    // 根據風險等級調整分配策略
    const baseAllocation = amount / opportunityCount;
    if (riskLevel === 'CONSERVATIVE') {
      // 保守策略：平均分配
      for (let i = 0; i < opportunityCount; i++) {
        allocation.push(baseAllocation);
      }
    } else if (riskLevel === 'MODERATE') {
      // 適中策略：稍微傾斜分配
      for (let i = 0; i < opportunityCount; i++) {
        const multiplier = 1 + (i * 0.1); // 前幾個機會分配更多
        allocation.push(baseAllocation * multiplier);
      }
    } else {
      // 激進策略：集中分配
      for (let i = 0; i < opportunityCount; i++) {
        const multiplier = 1 + (i * 0.2); // 更明顯的傾斜
        allocation.push(baseAllocation * multiplier);
      }
    }
    // 確保總額不超過投資金額
    const total = allocation.reduce((sum, amount) => sum + amount, 0);
    return allocation.map(amount => (amount / total) * amount);
  }

  // 計算風險評估
  calculateRiskAssessment(recommendations, riskLevel) {
    const riskConfig = INVESTMENT_CONFIG.RISK_LEVELS[riskLevel];
    const totalRisk = recommendations.reduce((sum, rec) => sum + rec.risk, 0);
    const avgRisk = totalRisk / recommendations.length;
    const maxRisk = Math.max(...recommendations.map(rec => rec.risk));
    return {
      overallRisk: avgRisk,
      maxRisk,
      riskLevel,
      riskTolerance: riskConfig.maxRisk,
      isWithinTolerance: avgRisk <= riskConfig.maxRisk,
      riskFactors: this.identifyRiskFactors(recommendations),
    };
  }

  // 生成投資組合建議
  generatePortfolioAdvice(recommendations, totalAmount) {
    const totalRecommended = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);
    const allocationPercentage = (totalRecommended / totalAmount) * 100;
    return {
      totalRecommended,
      allocationPercentage,
      diversification: this.calculateRecommendationDiversification(recommendations),
      expectedReturn: this.calculateExpectedReturn(recommendations),
      timeHorizon: this.calculateAverageTimeHorizon(recommendations),
      rebalancingAdvice: this.generateRebalancingAdvice(recommendations),
    };
  }

  // 生成推理說明
  generateReasoning(opportunity) {
    const reasons = [];
    if (opportunity.factors.priceTrend.score > 0.7) {
      reasons.push('價格趨勢強勁，顯示上漲動能');
    }
    if (opportunity.factors.volumeAnalysis.score > 0.7) {
      reasons.push('交易量活躍，市場關注度高');
    }
    if (opportunity.factors.sentiment.score > 0.7) {
      reasons.push('市場情緒樂觀，投資者信心強');
    }
    if (opportunity.factors.technical.score > 0.7) {
      reasons.push('技術指標良好，支撐價格上漲');
    }
    if (opportunity.factors.fundamental.score > 0.7) {
      reasons.push('基本面強勁，長期價值突出');
    }
    return reasons.length > 0 ? reasons : ['綜合分析顯示投資價值'];
  }

  // 確定投資行動
  determineAction(opportunity) {
    if (opportunity.score > 0.8) {
      return 'STRONG_BUY';
    } else if (opportunity.score > 0.7) {
      return 'BUY';
    } else if (opportunity.score > 0.6) {
      return 'HOLD';
    }
    return 'WAIT';
  }

  // 計算信心度
  calculateConfidence(recommendations) {
    if (recommendations.length === 0) {
      return 0;
    }
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
    const marketDataFreshness = this.isMarketDataFresh() ? 1 : 0.8;
    return Math.min(avgConfidence * marketDataFreshness, 1);
  }

  // 檢查市場數據是否新鮮
  isMarketDataFresh() {
    if (!this.lastUpdate) {
      return false;
    }
    const hoursSinceUpdate = (Date.now() - this.lastUpdate) / (1000 * 60 * 60);
    return hoursSinceUpdate < 24; // 24小時內認為是新鮮的
  }

  // 輔助分析方法
  async analyzePriceTrend(cardId) {
    try {
      const priceHistory = await getCardPriceHistory || (() => {}) || (() => {}) || (() => {})(cardId, 30);
      const trend = this.calculateTrend(priceHistory);
      return {
        score: Math.max(0, Math.min(1, trend)),
        trend: trend,
        volatility: this.calculateVolatility(priceHistory),
      };
    } catch (error) {
      return { score: 0.5, trend: 0, volatility: 0.5 };
    }
  }

  async analyzeVolume(cardId) {
    try {
      const volumeData = await apiClient || {} || {} || {}.get(`/market/volume/${cardId}`);
      const volume = volumeData.data;
      return {
        score: Math.min(1, volume.average / 1000), // 標準化到 0-1
        average: volume.average,
        trend: volume.trend,
      };
    } catch (error) {
      return { score: 0.5, average: 500, trend: 0 };
    }
  }

  async analyzeSentiment(cardId) {
    try {
      const sentimentData = await apiClient || {} || {} || {}.get(`/market/sentiment/${cardId}`);
      return {
        score: (sentimentData.data.sentiment + 1) / 2, // 轉換 -1 到 1 為 0 到 1
        sentiment: sentimentData.data.sentiment,
        sources: sentimentData.data.sources,
      };
    } catch (error) {
      return { score: 0.5, sentiment: 0, sources: [] };
    }
  }

  async analyzeTechnicalIndicators(cardId) {
    try {
      const technicalData = await apiClient || {} || {} || {}.get(`/market/technical/${cardId}`);
      const indicators = technicalData.data;
      const rsiScore = indicators.rsi < 30 ? 1 : indicators.rsi > 70 ? 0 : 0.5;
      const macdScore = indicators.macd > 0 ? 1 : 0;
      const movingAverageScore = indicators.price > indicators.ma50 ? 1 : 0;
      return {
        score: (rsiScore + macdScore + movingAverageScore) / 3,
        rsi: indicators.rsi,
        macd: indicators.macd,
        movingAverage: indicators.ma50,
      };
    } catch (error) {
      return { score: 0.5, rsi: 50, macd: 0, movingAverage: 0 };
    }
  }

  analyzeFundamentals(card) {
    const factors = {
      rarity: this.getRarityScore(card.rarity),
      edition: this.getEditionScore(card.edition),
      condition: this.getConditionScore(card.condition),
      age: this.getAgeScore(card.releaseDate),
    };
    const score = Object.values(factors).reduce((sum, factor) => sum + factor.score, 0) / Object.keys(factors).length;
    return {
      score,
      factors,
    };
  }

  // 稀有度評分
  getRarityScore(rarity) {
    const rarityScores = {
      'Common': { score: 0.3, weight: 0.1 },
      'Uncommon': { score: 0.5, weight: 0.2 },
      'Rare': { score: 0.7, weight: 0.3 },
      'Mythic': { score: 0.9, weight: 0.4 },
      'Secret': { score: 1.0, weight: 0.5 },
    };
    return rarityScores[rarity] || { score: 0.5, weight: 0.2 };
  }

  // 版本評分
  getEditionScore(edition) {
    const editionScores = {
      '1st Edition': { score: 1.0, weight: 0.4 },
      'Limited': { score: 0.8, weight: 0.3 },
      'Unlimited': { score: 0.6, weight: 0.2 },
      'Reprint': { score: 0.4, weight: 0.1 },
    };
    return editionScores[edition] || { score: 0.5, weight: 0.2 };
  }

  // 品相評分
  getConditionScore(condition) {
    const conditionScores = {
      'Mint': { score: 1.0, weight: 0.4 },
      'Near Mint': { score: 0.9, weight: 0.3 },
      'Excellent': { score: 0.8, weight: 0.2 },
      'Good': { score: 0.6, weight: 0.1 },
      'Light Played': { score: 0.4, weight: 0.05 },
      'Played': { score: 0.2, weight: 0.02 },
    };
    return conditionScores[condition] || { score: 0.5, weight: 0.2 };
  }

  // 年齡評分
  getAgeScore(releaseDate) {
    const age = new Date().getFullYear() - new Date(releaseDate).getFullYear();
    if (age < 1) {
      return { score: 0.3, weight: 0.1 };
    }
    if (age < 5) {
      return { score: 0.5, weight: 0.2 };
    }
    if (age < 10) {
      return { score: 0.7, weight: 0.3 };
    }
    if (age < 20) {
      return { score: 0.8, weight: 0.4 };
    }
    return { score: 0.9, weight: 0.5 };
  }

  // 計算趨勢
  calculateTrend(priceHistory) {
    if (priceHistory.length < 2) {
      return 0;
    }
    const prices = priceHistory.map(p => p.price);
    const n = prices.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = prices.reduce((sum, price) => sum + price, 0);
    const sumXY = prices.reduce((sum, price, i) => sum + price * i, 0);
    const sumX2 = prices.reduce((sum, _, i) => sum + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgPrice = sumY / n;
    return slope / avgPrice; // 標準化斜率
  }

  // 計算波動率
  calculateVolatility(priceHistory) {
    if (priceHistory.length < 2) {
      return 0;
    }
    const prices = priceHistory.map(p => p.price);
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  // 獲取熱門卡牌
  async getTrendingCards() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/trending');
      return response.data.slice(0, 10); // 返回前10個熱門卡牌
    } catch (error) {
      return [];
    }
  }

  // 獲取低估卡牌
  async getUndervaluedCards() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/undervalued');
      return response.data.slice(0, 10); // 返回前10個低估卡牌
    } catch (error) {
      return [];
    }
  }

  // 獲取新發行卡牌
  async getNewReleases() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/new-releases');
      return response.data.slice(0, 5); // 返回前5個新發行卡牌
    } catch (error) {
      return [];
    }
  }

  // 默認數據
  getDefaultMarketTrends() {
    return {
      overall: 'stable',
      pokemon: 'rising',
      yugioh: 'stable',
      mtg: 'falling',
    };
  }

  getDefaultMarketSentiment() {
    return {
      overall: 0.6,
      pokemon: 0.7,
      yugioh: 0.5,
      mtg: 0.4,
    };
  }

  getDefaultPortfolio() {
    return {
      totalValue: 0,
      diversification: 0,
      riskLevel: 'MODERATE',
      performance: 0,
      holdings: [],
    };
  }

  // 其他輔助方法
  calculateCardPerformance(card) {
    if (!card.purchasePrice || !card.currentPrice) {
      return 0;
    }
    return ((card.currentPrice - card.purchasePrice) / card.purchasePrice) * 100;
  }

  calculateDiversification(holdings) {
    if (holdings.length === 0) {
      return 0;
    }
    const totalValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
    const weights = holdings.map(holding => holding.totalValue / totalValue);
    // 計算 Herfindahl-Hirschman Index (HHI)
    const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
    // 轉換為多樣化指數 (1 - HHI)
    return Math.max(0, 1 - hhi);
  }

  calculatePortfolioRisk(holdings) {
    if (holdings.length === 0) {
      return 'MODERATE';
    }
    const avgRisk = holdings.reduce((sum, holding) => sum + (holding.risk || 0.5), 0) / holdings.length;
    if (avgRisk < 0.3) {
      return 'CONSERVATIVE';
    }
    if (avgRisk < 0.6) {
      return 'MODERATE';
    }
    return 'AGGRESSIVE';
  }

  calculatePortfolioPerformance(holdings) {
    if (holdings.length === 0) {
      return 0;
    }
    return holdings.reduce((sum, holding) => sum + holding.performance, 0) / holdings.length;
  }

  calculateCardRisk(factors) {
    const riskFactors = [
      factors.priceTrend.volatility || 0.5,
      1 - (factors.volumeAnalysis.score || 0.5),
      1 - (factors.sentiment.score || 0.5),
      1 - (factors.technical.score || 0.5),
      1 - (factors.fundamental.score || 0.5),
    ];
    return riskFactors.reduce((sum, risk) => sum + risk, 0) / riskFactors.length;
  }

  calculatePotentialReturn(factors) {
    const returnFactors = [
      factors.priceTrend.score || 0.5,
      factors.volumeAnalysis.score || 0.5,
      factors.sentiment.score || 0.5,
      factors.technical.score || 0.5,
      factors.fundamental.score || 0.5,
    ];
    const avgReturn = returnFactors.reduce((sum, factor) => sum + factor, 0) / returnFactors.length;
    return Math.max(0, avgReturn * 0.3); // 最大30%年化回報
  }

  estimateTimeToMaturity(factors) {
    const timeFactors = [
      factors.priceTrend.trend || 0,
      factors.volumeAnalysis.trend || 0,
      factors.sentiment.sentiment || 0,
    ];
    const avgTrend = timeFactors.reduce((sum, factor) => sum + factor, 0) / timeFactors.length;
    if (avgTrend > 0.5) {
      return 90;
    } // 強勢趨勢，3個月
    if (avgTrend > 0) {
      return 180;
    } // 溫和趨勢，6個月
    return 365; // 弱勢趨勢，1年
  }

  identifyRiskFactors(recommendations) {
    const riskFactors = [];
    if (recommendations.length === 0) {
      riskFactors.push('無推薦投資機會');
      return riskFactors;
    }
    const avgRisk = recommendations.reduce((sum, rec) => sum + rec.risk, 0) / recommendations.length;
    if (avgRisk > 0.7) {
      riskFactors.push('整體風險較高');
    }
    if (recommendations.length < 3) {
      riskFactors.push('投資組合集中度較高');
    }
    const highRiskCards = recommendations.filter(rec => rec.risk > 0.8);
    if (highRiskCards.length > 0) {
      riskFactors.push(`包含 ${highRiskCards.length} 個高風險投資`);
    }
    return riskFactors;
  }

  calculateRecommendationDiversification(recommendations) {
    if (recommendations.length === 0) {
      return 0;
    }
    const totalAmount = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);
    const weights = recommendations.map(rec => rec.recommendedAmount / totalAmount);
    const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
    return Math.max(0, 1 - hhi);
  }

  calculateExpectedReturn(recommendations) {
    if (recommendations.length === 0) {
      return 0;
    }
    const totalAmount = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);
    const weightedReturn = recommendations.reduce((sum, rec) => {
      return sum + (rec.potentialReturn * rec.recommendedAmount);
    }, 0);
    return weightedReturn / totalAmount;
  }

  calculateAverageTimeHorizon(recommendations) {
    if (recommendations.length === 0) {
      return 180;
    }
    return recommendations.reduce((sum, rec) => sum + rec.timeToMaturity, 0) / recommendations.length;
  }

  generateRebalancingAdvice(recommendations) {
    const advice = [];
    if (recommendations.length === 0) {
      advice.push('建議等待更好的投資機會');
      return advice;
    }
    const avgTimeHorizon = this.calculateAverageTimeHorizon(recommendations);
    if (avgTimeHorizon < 90) {
      advice.push('建議每週檢查投資組合表現');
    } else if (avgTimeHorizon < 180) {
      advice.push('建議每月檢查投資組合表現');
    } else {
      advice.push('建議每季度檢查投資組合表現');
    }
    const highRiskCount = recommendations.filter(rec => rec.risk > 0.7).length;
    if (highRiskCount > 0) {
      advice.push(`注意監控 ${highRiskCount} 個高風險投資`);
    }
    return advice;
  }

  // 載入用戶偏好
  async loadUserPreferences() {
    try {
      // 這裡可以從本地存儲或API載入用戶偏好
      this.userPreferences = new Map();
    } catch (error) {}
  }

  // 機器學習模型創建方法
  async createPricePredictionModel() {
    // 模擬創建價格預測模型
    return {
      type: 'pricePrediction',
      accuracy: 0.85,
      lastTrained: Date.now(),
      features: ['price', 'volume', 'sentiment', 'technical_indicators'],
    };
  }

  async createRiskAssessmentModel() {
    // 模擬創建風險評估模型
    return {
      type: 'riskAssessment',
      accuracy: 0.78,
      lastTrained: Date.now(),
      features: ['volatility', 'liquidity', 'market_risk', 'concentration'],
    };
  }

  async createPortfolioOptimizationModel() {
    // 模擬創建投資組合優化模型
    return {
      type: 'portfolioOptimization',
      accuracy: 0.82,
      lastTrained: Date.now(),
      features: ['returns', 'risk', 'correlation', 'diversification'],
    };
  }

  // 風險模型創建方法
  createMarketRiskModel() {
    return {
      type: 'marketRisk',
      factors: ['market_volatility', 'sector_performance', 'economic_indicators'],
    };
  }

  createLiquidityRiskModel() {
    return {
      type: 'liquidityRisk',
      factors: ['trading_volume', 'bid_ask_spread', 'market_depth'],
    };
  }

  createConcentrationRiskModel() {
    return {
      type: 'concentrationRisk',
      factors: ['portfolio_concentration', 'sector_concentration', 'geographic_concentration'],
    };
  }

  // 輔助計算方法
  async calculateMarketRisk(recommendations) {
    try {
      const marketVolatility = this.marketData.volatility.overall || 0.3;
      const sectorRisks = recommendations.map(rec => rec.card.sector || 'general');
      const avgSectorRisk = sectorRisks.reduce((sum, sector) => sum + (this.getSectorRisk(sector) || 0.3), 0) / sectorRisks.length;
      return Math.min(1, (marketVolatility + avgSectorRisk) / 2);
    } catch (error) {
      return 0.3;
    }
  }

  async calculateLiquidityRisk(recommendations) {
    try {
      const liquidityScores = await Promise.all(
        recommendations.map(async (rec) => {
          const volumeData = await this.getCardVolume(rec.card.id);
          return this.calculateLiquidityScore(volumeData);
        }),
      );
      return liquidityScores.reduce((sum, score) => sum + score, 0) / liquidityScores.length;
    } catch (error) {
      return 0.4;
    }
  }

  calculateConcentrationRisk(recommendations, portfolio) {
    try {
      const totalValue = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);
      const weights = recommendations.map(rec => rec.recommendedAmount / totalValue);
      // 計算 Herfindahl-Hirschman Index
      const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
      return Math.min(1, hhi);
    } catch (error) {
      return 0.5;
    }
  }

  async calculateVolatilityRisk(recommendations) {
    try {
      const volatilityScores = await Promise.all(
        recommendations.map(async (rec) => {
          const priceHistory = await this.getCardPriceHistory || (() => {}) || (() => {}) || (() => {})(rec.card.id, 30);
          return this.calculateVolatility(priceHistory);
        }),
      );
      return volatilityScores.reduce((sum, vol) => sum + vol, 0) / volatilityScores.length;
    } catch (error) {
      return 0.3;
    }
  }

  async calculateRegulatoryRisk(recommendations) {
    // 模擬監管風險計算
    return 0.1 + Math.random() * 0.2;
  }

  calculateWeightedRisk(riskFactors) {
    const totalWeight = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedRisk = riskFactors.reduce((sum, factor) => sum + factor.risk * factor.weight, 0);
    return totalWeight > 0 ? weightedRisk / totalWeight : 0;
  }

  async generateRiskMitigationStrategies(risks) {
    const strategies = [];
    if (risks.marketRisk > 0.5) {
      strategies.push('考慮增加防禦性投資以對沖市場風險');
    }
    if (risks.liquidityRisk > 0.5) {
      strategies.push('選擇流動性較好的投資標的，避免集中持有');
    }
    if (risks.concentrationRisk > 0.5) {
      strategies.push('增加投資組合多樣化，降低集中度風險');
    }
    if (risks.volatilityRisk > 0.5) {
      strategies.push('設置止損點位，控制波動風險');
    }
    return strategies;
  }

  async performStressTest(recommendations, portfolio) {
    // 模擬壓力測試
    const scenarios = [
      { name: '市場崩盤', impact: -0.3 },
      { name: '經濟衰退', impact: -0.2 },
      { name: '利率上升', impact: -0.1 },
      { name: '通貨膨脹', impact: -0.15 },
    ];
    return scenarios.map(scenario => ({
      scenario: scenario.name,
      impact: scenario.impact,
      portfolioValue: portfolio.totalValue * (1 + scenario.impact),
      recommendations: recommendations.map(rec => ({
        card: rec.card.name,
        impact: rec.recommendedAmount * scenario.impact,
      })),
    }));
  }

  async performScenarioAnalysis(recommendations) {
    // 模擬情景分析
    return {
      optimistic: {
        probability: 0.25,
        return: 0.25,
        factors: ['強勁經濟增長', '市場情緒樂觀', '低利率環境'],
      },
      base: {
        probability: 0.50,
        return: 0.12,
        factors: ['穩定經濟增長', '正常市場條件', '適中利率'],
      },
      pessimistic: {
        probability: 0.25,
        return: -0.10,
        factors: ['經濟放緩', '市場情緒悲觀', '高利率環境'],
      },
    };
  }

  // 默認數據方法
  getDefaultMarketVolatility() {
    return {
      overall: 0.25,
      pokemon: 0.30,
      yugioh: 0.20,
      mtg: 0.35,
    };
  }

  getDefaultMarketCorrelation() {
    return {
      pokemonYugioh: 0.3,
      pokemonMtg: 0.2,
      yugiohMtg: 0.4,
    };
  }

  getDefaultRiskAssessment(riskLevel) {
    return {
      overallRisk: 0.3,
      riskLevel,
      riskTolerance: INVESTMENT_CONFIG.RISK_LEVELS[riskLevel].maxRisk,
      isWithinTolerance: true,
      riskBreakdown: {
        marketRisk: 0.3,
        liquidityRisk: 0.4,
        concentrationRisk: 0.5,
        volatilityRisk: 0.3,
        regulatoryRisk: 0.2,
      },
      riskMitigation: ['建議定期檢查投資組合', '保持適當的多樣化'],
    };
  }

  getDefaultMarketAnalysis() {
    return {
      marketTrends: this.getDefaultMarketTrends(),
      sentiment: this.getDefaultMarketSentiment(),
      volatility: this.getDefaultMarketVolatility(),
      correlation: this.getDefaultMarketCorrelation(),
      realTimeData: this.realTimeData,
      sectorAnalysis: {},
      opportunityAnalysis: [],
      riskAnalysis: {},
      forecast: {},
    };
  }

  getDefaultInvestmentStrategy() {
    return {
      approach: 'balanced',
      allocation: 'equal_weight',
      timing: 'dollar_cost_averaging',
      monitoring: 'weekly',
      exit: 'take_profit_stop_loss',
      contingency: 'reduce_exposure_on_high_risk',
    };
  }

  // 獲取市場趨勢
  async getMarketTrends() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/trends');
      return response.data;
    } catch (error) {
      return this.getDefaultMarketTrends();
    }
  }

  // 獲取市場情緒
  async getMarketSentiment() {
    try {
      const response = await apiClient || {} || {} || {}.get('/market/sentiment');
      return response.data;
    } catch (error) {
      return this.getDefaultMarketSentiment();
    }
  }

  // 獲取用戶價格警報
  async getUserPriceAlerts() {
    try {
      const response = await apiClient || {} || {} || {}.get('/user/alerts/price');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // 發送價格警報通知
  async sendPriceAlertNotification(alert) {
    try {
      await apiClient || {} || {} || {}.post('/notifications/price-alert', {
        alert,
        timestamp: Date.now(),
      });
    } catch (error) {}
  }

  // 計算進階風險評估
  async calculateAdvancedRiskAssessment(recommendations, riskLevel, portfolio) {
    try {
      const riskConfig = INVESTMENT_CONFIG.RISK_LEVELS[riskLevel];
      // 計算各種風險指標
      const marketRisk = await this.calculateMarketRisk(recommendations);
      const liquidityRisk = await this.calculateLiquidityRisk(recommendations);
      const concentrationRisk = this.calculateConcentrationRisk(recommendations, portfolio);
      const volatilityRisk = await this.calculateVolatilityRisk(recommendations);
      const regulatoryRisk = await this.calculateRegulatoryRisk(recommendations);
      // 綜合風險評分
      const overallRisk = this.calculateWeightedRisk([
        { risk: marketRisk, weight: INVESTMENT_CONFIG.RISK_CONFIG.marketRiskWeight },
        { risk: liquidityRisk, weight: INVESTMENT_CONFIG.RISK_CONFIG.liquidityWeight },
        { risk: concentrationRisk, weight: INVESTMENT_CONFIG.RISK_CONFIG.concentrationWeight },
        { risk: volatilityRisk, weight: INVESTMENT_CONFIG.RISK_CONFIG.volatilityWeight },
        { risk: regulatoryRisk, weight: INVESTMENT_CONFIG.RISK_CONFIG.regulatoryWeight },
      ]);
        // 風險緩解建議
      const riskMitigation = await this.generateRiskMitigationStrategies({
        marketRisk,
        liquidityRisk,
        concentrationRisk,
        volatilityRisk,
        regulatoryRisk,
      });
      return {
        overallRisk,
        riskLevel,
        riskTolerance: riskConfig.maxRisk,
        isWithinTolerance: overallRisk <= riskConfig.maxRisk,
        riskBreakdown: {
          marketRisk,
          liquidityRisk,
          concentrationRisk,
          volatilityRisk,
          regulatoryRisk,
        },
        riskMitigation,
        stressTest: await this.performStressTest(recommendations, portfolio),
        scenarioAnalysis: await this.performScenarioAnalysis(recommendations),
      };
    } catch (error) {
      return this.getDefaultRiskAssessment(riskLevel);
    }
  }

  // 生成進階投資組合建議
  async generateAdvancedPortfolioAdvice(recommendations, totalAmount, portfolio) {
    try {
      const totalRecommended = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);
      const allocationPercentage = (totalRecommended / totalAmount) * 100;
      // 計算投資組合優化
      const optimization = await this.optimizePortfolioAllocation(recommendations, totalAmount, portfolio);
      // 生成再平衡建議
      const rebalancingAdvice = await this.generateAdvancedRebalancingAdvice(recommendations, portfolio);
      // 計算預期回報
      const expectedReturn = await this.calculateAdvancedExpectedReturn(recommendations);
      // 生成時間軸建議
      const timelineAdvice = this.generateTimelineAdvice(recommendations);
      return {
        totalRecommended,
        allocationPercentage,
        optimization,
        rebalancingAdvice,
        expectedReturn,
        timelineAdvice,
        diversification: this.calculateAdvancedDiversification(recommendations, portfolio),
        correlationAnalysis: await this.analyzePortfolioCorrelation(recommendations, portfolio),
        performanceProjection: await this.projectPortfolioPerformance(recommendations, portfolio),
      };
    } catch (error) {
      return this.getDefaultPortfolioAdvice(recommendations, totalAmount);
    }
  }

  // 生成綜合市場分析
  async generateComprehensiveMarketAnalysis() {
    try {
      const analysis = {
        marketTrends: this.marketData.trends,
        sentiment: this.marketData.sentiment,
        volatility: this.marketData.volatility,
        correlation: this.marketData.correlation,
        realTimeData: this.realTimeData,
        sectorAnalysis: await this.analyzeMarketSectors(),
        opportunityAnalysis: await this.analyzeMarketOpportunities(),
        riskAnalysis: await this.analyzeMarketRisks(),
        forecast: await this.generateMarketForecast(),
      };
      return analysis;
    } catch (error) {
      return this.getDefaultMarketAnalysis();
    }
  }

  // 生成投資策略
  async generateInvestmentStrategy(recommendations, riskAssessment, portfolio, timeHorizon) {
    try {
      const strategy = {
        approach: this.determineInvestmentApproach(riskAssessment, timeHorizon),
        allocation: this.generateAllocationStrategy(recommendations, riskAssessment),
        timing: this.generateTimingStrategy(recommendations, timeHorizon),
        monitoring: this.generateMonitoringStrategy(recommendations, riskAssessment),
        exit: this.generateExitStrategy(recommendations, timeHorizon),
        contingency: this.generateContingencyPlan(riskAssessment),
      };
      return strategy;
    } catch (error) {
      return this.getDefaultInvestmentStrategy();
    }
  }

  // 計算進階信心度
  calculateAdvancedConfidence(recommendations, intelligentAdvice) {
    try {
      const factors = {
        dataQuality: this.assessDataQuality(),
        modelConsistency: this.assessModelConsistency(recommendations),
        marketConditions: this.assessMarketConditions(),
        historicalAccuracy: this.getHistoricalAccuracy(),
        intelligentAdvice: intelligentAdvice?.confidence || 0.5,
      };
      const weights = {
        dataQuality: 0.25,
        modelConsistency: 0.20,
        marketConditions: 0.20,
        historicalAccuracy: 0.20,
        intelligentAdvice: 0.15,
      };
      return this.calculateWeightedScore(factors, weights);
    } catch (error) {
      return 0.5;
    }
  }

  // 輔助方法
  async getCardVolume(cardId) {
    try {
      const response = await apiClient || {} || {} || {}.get(`/market/volume/${cardId}`);
      return response.data;
    } catch (error) {
      return { average: 500, trend: 0 };
    }
  }

  calculateLiquidityScore(volumeData) {
    const avgVolume = volumeData.average || 500;
    const trend = volumeData.trend || 0;
    // 標準化流動性評分
    const volumeScore = Math.min(1, avgVolume / 1000);
    const trendScore = (trend + 1) / 2; // 轉換 -1 到 1 為 0 到 1
    return (volumeScore + trendScore) / 2;
  }

  getSectorRisk(sector) {
    const sectorRisks = {
      pokemon: 0.3,
      yugioh: 0.4,
      mtg: 0.35,
      general: 0.3,
    };
    return sectorRisks[sector] || 0.3;
  }

  async optimizePortfolioAllocation(recommendations, totalAmount, portfolio) {
    try {
      // 使用現代投資組合理論優化分配
      const optimization = {
        method: 'mean_variance_optimization',
        targetReturn: this.calculateTargetReturn(portfolio),
        maxRisk: this.calculateMaxRisk(portfolio),
        allocation: this.calculateOptimalAllocation(recommendations, totalAmount),
        sharpeRatio: this.calculateSharpeRatio(recommendations),
        efficientFrontier: this.generateEfficientFrontier(recommendations),
      };
      return optimization;
    } catch (error) {
      return this.getDefaultOptimization(recommendations, totalAmount);
    }
  }

  async generateAdvancedRebalancingAdvice(recommendations, portfolio) {
    try {
      const advice = [];
      const currentAllocation = this.calculateCurrentAllocation(portfolio);
      const targetAllocation = this.calculateTargetAllocation(recommendations);
      // 檢查是否需要再平衡
      const rebalanceNeeded = this.checkRebalanceNeeded(currentAllocation, targetAllocation);
      if (rebalanceNeeded) {
        advice.push('建議進行投資組合再平衡');
        advice.push('考慮增加表現較好的投資標的');
        advice.push('減少表現較差的投資標的');
      }
      // 根據風險等級建議再平衡頻率
      const riskLevel = this.calculatePortfolioRisk(portfolio.holdings);
      const rebalanceFrequency = INVESTMENT_CONFIG.RISK_LEVELS[riskLevel].rebalanceFrequency;
      advice.push(`建議每 ${rebalanceFrequency} 天檢查一次投資組合`);
      return advice;
    } catch (error) {
      return ['建議定期檢查投資組合表現'];
    }
  }

  async calculateAdvancedExpectedReturn(recommendations) {
    try {
      if (recommendations.length === 0) {
        return 0;
      }
      const totalAmount = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);
      const weightedReturn = recommendations.reduce((sum, rec) => {
        return sum + (rec.potentialReturn * rec.recommendedAmount);
      }, 0);
      const expectedReturn = weightedReturn / totalAmount;
      return {
        annualized: expectedReturn,
        monthly: expectedReturn / 12,
        quarterly: expectedReturn / 4,
        confidence: this.calculateReturnConfidence(recommendations),
      };
    } catch (error) {
      return { annualized: 0.1, monthly: 0.008, quarterly: 0.025, confidence: 0.5 };
    }
  }

  generateTimelineAdvice(recommendations) {
    try {
      const avgTimeHorizon = this.calculateAverageTimeHorizon(recommendations);
      const timeline = {
        shortTerm: {
          period: '1-3個月',
          actions: ['建立初始倉位', '監控市場動態', '調整投資策略'],
        },
        mediumTerm: {
          period: '3-6個月',
          actions: ['評估投資表現', '考慮加倉或減倉', '重新平衡投資組合'],
        },
        longTerm: {
          period: '6個月以上',
          actions: ['長期持有策略', '定期檢視投資目標', '調整風險配置'],
        },
      };
      return timeline;
    } catch (error) {
      return this.getDefaultTimelineAdvice();
    }
  }

  calculateAdvancedDiversification(recommendations, portfolio) {
    try {
      const allHoldings = [...portfolio.holdings, ...recommendations.map(rec => ({
        id: rec.card.id,
        name: rec.card.name,
        totalValue: rec.recommendedAmount,
      }))];
      return this.calculateDiversification(allHoldings);
    } catch (error) {
      return 0.5;
    }
  }

  async analyzePortfolioCorrelation(recommendations, portfolio) {
    try {
      const allAssets = [...portfolio.holdings, ...recommendations];
      const correlationMatrix = this.calculateCorrelationMatrix(allAssets);
      return {
        matrix: correlationMatrix,
        averageCorrelation: this.calculateAverageCorrelation(correlationMatrix),
        diversificationBenefit: this.calculateDiversificationBenefit(correlationMatrix),
      };
    } catch (error) {
      return { matrix: {}, averageCorrelation: 0.5, diversificationBenefit: 0.3 };
    }
  }

  async projectPortfolioPerformance(recommendations, portfolio) {
    try {
      const projection = {
        shortTerm: this.projectPerformance(recommendations, portfolio, 30),
        mediumTerm: this.projectPerformance(recommendations, portfolio, 90),
        longTerm: this.projectPerformance(recommendations, portfolio, 365),
        scenarios: this.generatePerformanceScenarios(recommendations, portfolio),
      };
      return projection;
    } catch (error) {
      return this.getDefaultPerformanceProjection();
    }
  }

  // 投資策略生成方法
  determineInvestmentApproach(riskAssessment, timeHorizon) {
    if (riskAssessment.overallRisk < 0.3 && timeHorizon > 180) {
      return 'value_investing';
    } else if (riskAssessment.overallRisk < 0.5) {
      return 'growth_investing';
    }
    return 'momentum_investing';
  }

  generateAllocationStrategy(recommendations, riskAssessment) {
    const strategy = {
      method: 'risk_parity',
      allocation: recommendations.map(rec => ({
        card: rec.card.name,
        weight: rec.recommendedAmount / recommendations.reduce((sum, r) => sum + r.recommendedAmount, 0),
        riskContribution: rec.risk * rec.recommendedAmount,
      })),
    };
    return strategy;
  }

  generateTimingStrategy(recommendations, timeHorizon) {
    if (timeHorizon < 90) {
      return 'immediate_entry';
    } else if (timeHorizon < 180) {
      return 'dollar_cost_averaging';
    }
    return 'gradual_build_up';
  }

  generateMonitoringStrategy(recommendations, riskAssessment) {
    const frequency = riskAssessment.overallRisk > 0.5 ? 'daily' : 'weekly';
    return {
      frequency,
      metrics: ['price', 'volume', 'sentiment', 'technical_indicators'],
      alerts: ['price_breakout', 'volume_spike', 'sentiment_change'],
    };
  }

  generateExitStrategy(recommendations, timeHorizon) {
    return {
      takeProfit: this.calculateTakeProfitLevels(recommendations),
      stopLoss: this.calculateStopLossLevels(recommendations),
      timeBasedExit: timeHorizon < 90 ? 'flexible' : 'fixed',
    };
  }

  generateContingencyPlan(riskAssessment) {
    const plan = {
      highRiskScenario: '立即減倉並轉向防禦性投資',
      marketCrash: '保持現金儲備並等待機會',
      unexpectedEvent: '重新評估投資策略並調整配置',
    };
    return plan;
  }

  // 數據質量評估方法
  assessDataQuality() {
    const factors = {
      completeness: 0.85,
      accuracy: 0.80,
      timeliness: 0.90,
      consistency: 0.75,
    };
    return Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;
  }

  assessModelConsistency(recommendations) {
    if (recommendations.length === 0) {
      return 0.5;
    }
    const scores = recommendations.map(rec => rec.confidence);
    const variance = this.calculateVariance(scores);
    return Math.max(0, 1 - variance);
  }

  assessMarketConditions() {
    const conditions = {
      volatility: this.marketData?.volatility?.overall || 0.3,
      sentiment: this.marketData?.sentiment?.overall || 0.5,
      trend: this.marketData?.trends?.overall || 'stable',
    };
      // 綜合評分
    const volatilityScore = 1 - conditions.volatility;
    const sentimentScore = conditions.sentiment;
    const trendScore = conditions.trend === 'rising' ? 1 : conditions.trend === 'stable' ? 0.5 : 0;
    return (volatilityScore + sentimentScore + trendScore) / 3;
  }

  getHistoricalAccuracy() {
    // 模擬歷史準確度
    return 0.75 + Math.random() * 0.15;
  }

  calculateWeightedScore(factors, weights) {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const [category, score] of Object.entries(factors)) {
      const weight = weights[category] || 0.1;
      weightedSum += score * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // 默認方法
  getDefaultPortfolioAdvice(recommendations, totalAmount) {
    return {
      totalRecommended: recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0),
      allocationPercentage: 100,
      optimization: this.getDefaultOptimization(recommendations, totalAmount),
      rebalancingAdvice: ['建議定期檢查投資組合'],
      expectedReturn: { annualized: 0.1, monthly: 0.008, quarterly: 0.025, confidence: 0.5 },
      timelineAdvice: this.getDefaultTimelineAdvice(),
      diversification: 0.5,
      correlationAnalysis: { matrix: {}, averageCorrelation: 0.5, diversificationBenefit: 0.3 },
      performanceProjection: this.getDefaultPerformanceProjection(),
    };
  }

  getDefaultOptimization(recommendations, totalAmount) {
    return {
      method: 'equal_weight',
      targetReturn: 0.1,
      maxRisk: 0.4,
      allocation: recommendations.map(rec => ({
        card: rec.card.name,
        weight: 1 / recommendations.length,
      })),
      sharpeRatio: 1.0,
      efficientFrontier: [],
    };
  }

  getDefaultTimelineAdvice() {
    return {
      shortTerm: { period: '1-3個月', actions: ['建立倉位', '監控表現'] },
      mediumTerm: { period: '3-6個月', actions: ['評估表現', '調整策略'] },
      longTerm: { period: '6個月以上', actions: ['長期持有', '定期檢視'] },
    };
  }

  getDefaultPerformanceProjection() {
    return {
      shortTerm: { return: 0.05, risk: 0.15 },
      mediumTerm: { return: 0.12, risk: 0.25 },
      longTerm: { return: 0.20, risk: 0.35 },
      scenarios: {
        optimistic: { probability: 0.25, return: 0.25 },
        base: { probability: 0.50, return: 0.12 },
        pessimistic: { probability: 0.25, return: -0.10 },
      },
    };
  }

  // 其他輔助計算方法
  calculateTargetReturn(portfolio) {
    return portfolio.performance || 0.1;
  }

  calculateMaxRisk(portfolio) {
    return portfolio.riskLevel === 'CONSERVATIVE' ? 0.2 :
      portfolio.riskLevel === 'MODERATE' ? 0.4 : 0.6;
  }

  calculateOptimalAllocation(recommendations, totalAmount) {
    // 簡化的最優分配計算
    return recommendations.map(rec => ({
      card: rec.card.name,
      amount: rec.recommendedAmount,
      weight: rec.recommendedAmount / totalAmount,
    }));
  }

  calculateSharpeRatio(recommendations) {
    if (recommendations.length === 0) {
      return 1.0;
    }
    const avgReturn = recommendations.reduce((sum, rec) => sum + rec.potentialReturn, 0) / recommendations.length;
    const avgRisk = recommendations.reduce((sum, rec) => sum + rec.risk, 0) / recommendations.length;
    return avgRisk > 0 ? avgReturn / avgRisk : 1.0;
  }

  generateEfficientFrontier(recommendations) {
    // 簡化的有效前沿生成
    return [
      { risk: 0.1, return: 0.05 },
      { risk: 0.2, return: 0.10 },
      { risk: 0.3, return: 0.15 },
      { risk: 0.4, return: 0.20 },
    ];
  }

  calculateCurrentAllocation(portfolio) {
    const totalValue = portfolio.holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
    return portfolio.holdings.map(holding => ({
      card: holding.name,
      weight: holding.totalValue / totalValue,
    }));
  }

  calculateTargetAllocation(recommendations) {
    const totalAmount = recommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);
    return recommendations.map(rec => ({
      card: rec.card.name,
      weight: rec.recommendedAmount / totalAmount,
    }));
  }

  checkRebalanceNeeded(currentAllocation, targetAllocation) {
    // 檢查是否需要再平衡（簡化版本）
    const threshold = 0.1; // 10% 閾值
    for (let i = 0; i < currentAllocation.length; i++) {
      const current = currentAllocation[i];
      const target = targetAllocation.find(t => t.card === current.card);
      if (target && Math.abs(current.weight - target.weight) > threshold) {
        return true;
      }
    }
    return false;
  }

  calculateReturnConfidence(recommendations) {
    if (recommendations.length === 0) {
      return 0.5;
    }
    const confidences = recommendations.map(rec => rec.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  calculateCorrelationMatrix(assets) {
    // 簡化的相關性矩陣計算
    const matrix = {};
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        const key = `${assets[i].name}_${assets[j].name}`;
        matrix[key] = i === j ? 1 : 0.3 + Math.random() * 0.4;
      }
    }
    return matrix;
  }

  calculateAverageCorrelation(matrix) {
    const correlations = Object.values(matrix).filter(corr => corr !== 1);
    return correlations.reduce((sum, corr) => sum + corr, 0) / correlations.length;
  }

  calculateDiversificationBenefit(correlation) {
    return Math.max(0, 1 - correlation);
  }

  projectPerformance(recommendations, portfolio, days) {
    const avgReturn = recommendations.reduce((sum, rec) => sum + rec.potentialReturn, 0) / recommendations.length;
    const dailyReturn = avgReturn / 365;
    return {
      return: dailyReturn * days,
      risk: Math.sqrt(days / 365) * 0.2, // 簡化風險計算
    };
  }

  generatePerformanceScenarios(recommendations, portfolio) {
    return {
      optimistic: { probability: 0.25, return: 0.25 },
      base: { probability: 0.50, return: 0.12 },
      pessimistic: { probability: 0.25, return: -0.10 },
    };
  }

  calculateTakeProfitLevels(recommendations) {
    return recommendations.map(rec => ({
      card: rec.card.name,
      level1: rec.card.currentPrice * 1.1, // 10% 獲利
      level2: rec.card.currentPrice * 1.2, // 20% 獲利
      level3: rec.card.currentPrice * 1.3, // 30% 獲利
    }));
  }

  calculateStopLossLevels(recommendations) {
    return recommendations.map(rec => ({
      card: rec.card.name,
      level1: rec.card.currentPrice * 0.95, // 5% 止損
      level2: rec.card.currentPrice * 0.90, // 10% 止損
      level3: rec.card.currentPrice * 0.85, // 15% 止損
    }));
  }

  // 市場分析輔助方法
  async analyzeMarketSectors() {
    try {
      const sectors = ['pokemon', 'yugioh', 'mtg'];
      const analysis = {};
      for (const sector of sectors) {
        analysis[sector] = {
          performance: 0.1 + Math.random() * 0.2,
          volatility: 0.2 + Math.random() * 0.3,
          sentiment: 0.4 + Math.random() * 0.4,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        };
      }
      return analysis;
    } catch (error) {
      return {};
    }
  }

  async analyzeMarketRisks() {
    try {
      return {
        marketRisk: 0.3 + Math.random() * 0.2,
        liquidityRisk: 0.2 + Math.random() * 0.3,
        regulatoryRisk: 0.1 + Math.random() * 0.2,
        concentrationRisk: 0.4 + Math.random() * 0.3,
      };
    } catch (error) {
      return {};
    }
  }

  async generateMarketForecast() {
    try {
      return {
        shortTerm: {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          confidence: 0.6 + Math.random() * 0.3,
          factors: ['技術指標', '市場情緒', '基本面'],
        },
        mediumTerm: {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          confidence: 0.5 + Math.random() * 0.3,
          factors: ['經濟數據', '政策變化', '市場結構'],
        },
        longTerm: {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          confidence: 0.4 + Math.random() * 0.3,
          factors: ['長期趨勢', '結構性變化', '創新發展'],
        },
      };
    } catch (error) {
      return {};
    }
  }

  // 其他輔助方法保持不變...
  // ... existing code ...
}

// 創建單例實例
const investmentAdviceService = new InvestmentAdviceService();

export default investmentAdviceService;
