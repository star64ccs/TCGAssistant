const { Card, Collection, User } = require('../models');
const { Op } = require('sequelize');

// 投資建議配置
const INVESTMENT_CONFIG = {
  // 風險等級配置
  RISK_LEVELS: {
    CONSERVATIVE: { maxRisk: 0.2, targetReturn: 0.05, maxConcentration: 0.1 },
    MODERATE: { maxRisk: 0.4, targetReturn: 0.12, maxConcentration: 0.15 },
    AGGRESSIVE: { maxRisk: 0.6, targetReturn: 0.20, maxConcentration: 0.25 },
  },

  // 市場指標權重
  MARKET_INDICATORS: {
    PRICE_TREND: 0.3,
    VOLUME_ANALYSIS: 0.2,
    MARKET_SENTIMENT: 0.15,
    TECHNICAL_INDICATORS: 0.2,
    FUNDAMENTAL_ANALYSIS: 0.15,
  },

  // 預測時間範圍
  PREDICTION_PERIODS: [30, 90, 180, 365], // 天

  // 最小投資金額
  MIN_INVESTMENT: 100,

  // 最大投資金額
  MAX_INVESTMENT: 10000,
};

class InvestmentAdviceService {
  constructor() {
    this.analysisCache = new Map();
    this.marketData = null;
    this.lastUpdate = null;
  }

  // 初始化服務
  async initialize() {
    try {
      await this.loadMarketData();
      console.log('投資建議服務初始化完成');
    } catch (error) {
      console.error('投資建議服務初始化失敗:', error);
      throw error;
    }
  }

  // 載入市場數據
  async loadMarketData() {
    try {
      const [trends, sentiment] = await Promise.all([
        this.getMarketTrends(),
        this.getMarketSentiment(),
      ]);

      this.marketData = {
        trends,
        sentiment,
        timestamp: Date.now(),
      };

      this.lastUpdate = Date.now();
    } catch (error) {
      console.error('載入市場數據失敗:', error);
      throw error;
    }
  }

  // 生成投資建議
  async generateInvestmentAdvice(userId, investmentAmount, riskLevel = 'MODERATE', timeHorizon = 180) {
    try {
      // 驗證輸入參數
      this.validateInvestmentParameters(investmentAmount, riskLevel, timeHorizon);

      // 獲取用戶投資組合
      const portfolio = await this.getUserInvestmentPortfolio(userId);

      // 分析市場機會
      const marketOpportunities = await this.analyzeMarketOpportunities();

      // 生成投資建議
      const recommendations = await this.generateRecommendations(
        portfolio,
        marketOpportunities,
        investmentAmount,
        riskLevel,
        timeHorizon,
      );

      // 計算風險評估
      const riskAssessment = this.calculateRiskAssessment(recommendations, riskLevel);

      // 生成投資組合建議
      const portfolioAdvice = this.generatePortfolioAdvice(recommendations, investmentAmount);

      return {
        recommendations,
        riskAssessment,
        portfolioAdvice,
        marketAnalysis: this.marketData,
        timestamp: Date.now(),
        confidence: this.calculateConfidence(recommendations),
      };
    } catch (error) {
      console.error('生成投資建議失敗:', error);
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
      const collections = await Collection.findAll({
        where: { userId },
        include: [
          {
            model: Card,
            as: 'cards',
            through: { attributes: ['quantity'] },
          },
        ],
      });

      const portfolio = {
        totalValue: 0,
        diversification: 0,
        riskLevel: 'MODERATE',
        performance: 0,
        holdings: [],
        cards: [],
      };

      for (const collection of collections) {
        for (const card of collection.cards) {
          const cardData = card.toJSON();
          const quantity = card.CollectionCard?.quantity || 1;
          const currentPrice = cardData.currentPrice || 0;
          const purchasePrice = cardData.purchasePrice || currentPrice;

          portfolio.cards.push({
            id: cardData.id,
            name: cardData.name,
            currentPrice,
            purchasePrice,
            quantity,
            totalValue: currentPrice * quantity,
            performance: purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0,
          });

          portfolio.totalValue += currentPrice * quantity;
        }
      }

      portfolio.holdings = portfolio.cards.map(card => ({
        id: card.id,
        name: card.name,
        currentPrice: card.currentPrice,
        quantity: card.quantity,
        totalValue: card.totalValue,
        performance: card.performance,
      }));

      portfolio.diversification = this.calculateDiversification(portfolio.holdings);
      portfolio.riskLevel = this.calculatePortfolioRisk(portfolio.holdings);
      portfolio.performance = this.calculatePortfolioPerformance(portfolio.holdings);

      return portfolio;
    } catch (error) {
      console.error('獲取用戶投資組合失敗:', error);
      return this.getDefaultPortfolio();
    }
  }

  // 分析市場機會
  async analyzeMarketOpportunities() {
    try {
      const opportunities = [];

      // 獲取熱門卡牌
      const trendingCards = await this.getTrendingCards();

      // 獲取低估卡牌
      const undervaluedCards = await this.getUndervaluedCards();

      // 獲取新發行卡牌
      const newReleases = await this.getNewReleases();

      // 分析每個機會
      for (const card of [...trendingCards, ...undervaluedCards, ...newReleases]) {
        const analysis = await this.analyzeCardOpportunity(card);
        if (analysis.score > 0.6) { // 只推薦評分超過 60% 的機會
          opportunities.push(analysis);
        }
      }

      // 按評分排序
      return opportunities.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('分析市場機會失敗:', error);
      return [];
    }
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
      console.error('分析卡牌機會失敗:', error);
      return { card, score: 0, factors: {}, risk: 1, potentialReturn: 0, timeToMaturity: 365 };
    }
  }

  // 生成投資建議
  async generateRecommendations(portfolio, opportunities, amount, riskLevel, timeHorizon) {
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

  // 獲取市場趨勢
  async getMarketTrends() {
    try {
      // 這裡可以實現真實的市場趨勢分析
      // 目前返回模擬數據
      return {
        overall: 'stable',
        pokemon: 'rising',
        yugioh: 'stable',
        mtg: 'falling',
      };
    } catch (error) {
      console.error('獲取市場趨勢失敗:', error);
      return this.getDefaultMarketTrends();
    }
  }

  // 獲取市場情緒
  async getMarketSentiment() {
    try {
      // 這裡可以實現真實的市場情緒分析
      // 目前返回模擬數據
      return {
        overall: 0.6,
        pokemon: 0.7,
        yugioh: 0.5,
        mtg: 0.4,
      };
    } catch (error) {
      console.error('獲取市場情緒失敗:', error);
      return this.getDefaultMarketSentiment();
    }
  }

  // 獲取熱門卡牌
  async getTrendingCards() {
    try {
      // 從數據庫獲取熱門卡牌
      const trendingCards = await Card.findAll({
        where: {
          currentPrice: { [Op.gt]: 100 }, // 價格大於100的卡牌
        },
        order: [['currentPrice', 'DESC']],
        limit: 10,
      });

      return trendingCards.map(card => card.toJSON());
    } catch (error) {
      console.error('獲取熱門卡牌失敗:', error);
      return [];
    }
  }

  // 獲取低估卡牌
  async getUndervaluedCards() {
    try {
      // 從數據庫獲取可能被低估的卡牌
      const undervaluedCards = await Card.findAll({
        where: {
          currentPrice: { [Op.lt]: 50 }, // 價格小於50的卡牌
          rarity: { [Op.in]: ['Rare', 'Mythic', 'Secret'] }, // 稀有度較高的卡牌
        },
        order: [['currentPrice', 'ASC']],
        limit: 10,
      });

      return undervaluedCards.map(card => card.toJSON());
    } catch (error) {
      console.error('獲取低估卡牌失敗:', error);
      return [];
    }
  }

  // 獲取新發行卡牌
  async getNewReleases() {
    try {
      // 從數據庫獲取新發行的卡牌
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newReleases = await Card.findAll({
        where: {
          releaseDate: { [Op.gte]: thirtyDaysAgo },
        },
        order: [['releaseDate', 'DESC']],
        limit: 5,
      });

      return newReleases.map(card => card.toJSON());
    } catch (error) {
      console.error('獲取新發行卡牌失敗:', error);
      return [];
    }
  }

  // 輔助分析方法
  async analyzePriceTrend(cardId) {
    try {
      // 這裡可以實現真實的價格趨勢分析
      // 目前返回模擬數據
      return {
        score: Math.random() * 0.5 + 0.5, // 0.5-1.0 之間的隨機分數
        trend: Math.random() * 0.4 - 0.2, // -0.2 到 0.2 之間的趨勢
        volatility: Math.random() * 0.3 + 0.1, // 0.1-0.4 之間的波動率
      };
    } catch (error) {
      return { score: 0.5, trend: 0, volatility: 0.5 };
    }
  }

  async analyzeVolume(cardId) {
    try {
      // 這裡可以實現真實的交易量分析
      // 目前返回模擬數據
      return {
        score: Math.random() * 0.5 + 0.5,
        average: Math.random() * 500 + 100,
        trend: Math.random() * 0.4 - 0.2,
      };
    } catch (error) {
      return { score: 0.5, average: 500, trend: 0 };
    }
  }

  async analyzeSentiment(cardId) {
    try {
      // 這裡可以實現真實的市場情緒分析
      // 目前返回模擬數據
      return {
        score: Math.random() * 0.5 + 0.5,
        sentiment: Math.random() * 0.4 - 0.2,
        sources: ['social_media', 'news', 'forums'],
      };
    } catch (error) {
      return { score: 0.5, sentiment: 0, sources: [] };
    }
  }

  async analyzeTechnicalIndicators(cardId) {
    try {
      // 這裡可以實現真實的技術指標分析
      // 目前返回模擬數據
      return {
        score: Math.random() * 0.5 + 0.5,
        rsi: Math.random() * 40 + 30, // 30-70 之間的 RSI
        macd: Math.random() * 10 - 5, // -5 到 5 之間的 MACD
        movingAverage: Math.random() * 100 + 50, // 50-150 之間的移動平均
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
    if (!releaseDate) {
      return { score: 0.5, weight: 0.2 };
    }

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

  // 其他輔助方法
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
      cards: [],
    };
  }

  // 其他服務方法（用於 API 路由）
  async getInvestmentHistory(userId, page = 1, limit = 10) {
    try {
      // 這裡可以實現從數據庫獲取歷史建議記錄
      // 目前返回模擬數據
      return {
        history: [],
        total: 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('獲取投資歷史失敗:', error);
      throw error;
    }
  }

  async saveInvestmentAdvice(userId, advice, portfolioId) {
    try {
      // 這裡可以實現保存投資建議到數據庫
      // 目前返回模擬數據
      return {
        id: Date.now(),
        userId,
        advice,
        portfolioId,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('保存投資建議失敗:', error);
      throw error;
    }
  }

  async getInvestmentStats(userId) {
    try {
      // 這裡可以實現獲取投資統計數據
      // 目前返回模擬數據
      return {
        totalInvestments: 0,
        totalReturn: 0,
        averageReturn: 0,
        bestInvestment: null,
        worstInvestment: null,
      };
    } catch (error) {
      console.error('獲取投資統計失敗:', error);
      throw error;
    }
  }

  async generateRiskAssessment(userId) {
    try {
      const portfolio = await this.getUserInvestmentPortfolio(userId);

      return {
        portfolioRisk: portfolio.riskLevel,
        diversificationScore: portfolio.diversification,
        performanceScore: portfolio.performance,
        recommendations: this.generateRiskRecommendations(portfolio),
      };
    } catch (error) {
      console.error('生成風險評估失敗:', error);
      throw error;
    }
  }

  generateRiskRecommendations(portfolio) {
    const recommendations = [];

    if (portfolio.diversification < 0.3) {
      recommendations.push('建議增加投資組合多樣化');
    }

    if (portfolio.performance < -10) {
      recommendations.push('建議重新評估投資策略');
    }

    if (portfolio.riskLevel === 'AGGRESSIVE') {
      recommendations.push('注意控制風險，考慮降低風險等級');
    }

    return recommendations;
  }

  async optimizePortfolio(userId, targetReturn, maxRisk, investmentAmount) {
    try {
      // 這裡可以實現投資組合優化算法
      // 目前返回模擬數據
      return {
        optimizedAllocation: [],
        expectedReturn: targetReturn * 0.8,
        expectedRisk: maxRisk * 0.9,
        optimizationScore: 0.85,
      };
    } catch (error) {
      console.error('優化投資組合失敗:', error);
      throw error;
    }
  }

  async getMarketPrediction(timeframe = '30d', game = 'all') {
    try {
      // 這裡可以實現市場預測算法
      // 目前返回模擬數據
      return {
        timeframe,
        game,
        prediction: 'stable',
        confidence: 0.7,
        factors: ['market_sentiment', 'price_trend', 'volume_analysis'],
      };
    } catch (error) {
      console.error('獲取市場預測失敗:', error);
      throw error;
    }
  }

  async getEducationContent(category = 'all', level = 'beginner') {
    try {
      // 這裡可以實現獲取教育內容
      // 目前返回模擬數據
      return {
        articles: [],
        videos: [],
        tutorials: [],
        category,
        level,
      };
    } catch (error) {
      console.error('獲取教育內容失敗:', error);
      throw error;
    }
  }

  async getInvestmentTools() {
    try {
      // 這裡可以實現獲取投資工具
      // 目前返回模擬數據
      return {
        calculators: ['roi_calculator', 'risk_calculator', 'diversification_calculator'],
        charts: ['price_chart', 'trend_chart', 'volume_chart'],
        analysis: ['technical_analysis', 'fundamental_analysis', 'sentiment_analysis'],
      };
    } catch (error) {
      console.error('獲取投資工具失敗:', error);
      throw error;
    }
  }
}

// 創建單例實例
const investmentAdviceService = new InvestmentAdviceService();

module.exports = investmentAdviceService;
