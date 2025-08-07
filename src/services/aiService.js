import apiIntegrationManager from './apiIntegrationManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 機器學習模型類型
export const ML_MODEL_TYPES = {
  PRICE_PREDICTION: 'price_prediction',
  CARD_RECOMMENDATION: 'card_recommendation',
  MARKET_ANALYSIS: 'market_analysis',
  RISK_ASSESSMENT: 'risk_assessment',
  TREND_FORECASTING: 'trend_forecasting',
  PERSONALIZATION: 'personalization'
};

// 預測算法類型
export const PREDICTION_ALGORITHMS = {
  LINEAR_REGRESSION: 'linear_regression',
  RANDOM_FOREST: 'random_forest',
  NEURAL_NETWORK: 'neural_network',
  TIME_SERIES: 'time_series',
  ENSEMBLE: 'ensemble'
};

// AI 服務
class AIService {
  constructor() {
    this.localModels = new Map();
    this.userPreferences = {};
    this.analysisCache = new Map();
    this.predictionHistory = [];
    this.modelPerformance = {};
  }

  // 初始化AI服務
  async initialize() {
    try {
      await this.loadLocalModels();
      await this.loadUserPreferences();
      await this.loadModelPerformance();
      await this.setupModelUpdates();
      
      console.log('AI服務初始化完成');
      return true;
    } catch (error) {
      console.error('AI服務初始化失敗:', error);
      return false;
    }
  }

  // 載入本地模型
  async loadLocalModels() {
    try {
      const savedModels = await AsyncStorage.getItem('ai_local_models');
      if (savedModels) {
        const models = JSON.parse(savedModels);
        this.localModels = new Map(Object.entries(models));
      }
    } catch (error) {
      console.error('載入本地模型失敗:', error);
    }
  }

  // 保存本地模型
  async saveLocalModels() {
    try {
      const models = Object.fromEntries(this.localModels);
      await AsyncStorage.setItem('ai_local_models', JSON.stringify(models));
    } catch (error) {
      console.error('保存本地模型失敗:', error);
    }
  }

  // 載入用戶偏好
  async loadUserPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('ai_user_preferences');
      if (preferences) {
        this.userPreferences = JSON.parse(preferences);
      }
    } catch (error) {
      console.error('載入用戶偏好失敗:', error);
    }
  }

  // 保存用戶偏好
  async saveUserPreferences() {
    try {
      await AsyncStorage.setItem('ai_user_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('保存用戶偏好失敗:', error);
    }
  }

  // 載入模型性能數據
  async loadModelPerformance() {
    try {
      const performance = await AsyncStorage.getItem('ai_model_performance');
      if (performance) {
        this.modelPerformance = JSON.parse(performance);
      }
    } catch (error) {
      console.error('載入模型性能數據失敗:', error);
    }
  }

  // 保存模型性能數據
  async saveModelPerformance() {
    try {
      await AsyncStorage.setItem('ai_model_performance', JSON.stringify(this.modelPerformance));
    } catch (error) {
      console.error('保存模型性能數據失敗:', error);
    }
  }

  // 設置模型更新
  async setupModelUpdates() {
    // 定期更新模型
    setInterval(async () => {
      await this.updateLocalModels();
    }, 24 * 60 * 60 * 1000); // 每24小時更新一次
  }

  // 更新本地模型
  async updateLocalModels() {
    try {
      for (const [modelType, model] of this.localModels) {
        const updatedModel = await this.fetchUpdatedModel(modelType);
        if (updatedModel) {
          this.localModels.set(modelType, updatedModel);
        }
      }
      await this.saveLocalModels();
    } catch (error) {
      console.error('更新本地模型失敗:', error);
    }
  }

  // 獲取更新的模型
  async fetchUpdatedModel(modelType) {
    try {
      const result = await apiIntegrationManager.callApi(
        'aiModel',
        'getUpdatedModel',
        { modelType },
        { useCache: false }
      );
      return result;
    } catch (error) {
      console.error(`獲取更新模型失敗 (${modelType}):`, error);
      return null;
    }
  }

  // 高級價格預測
  async advancedPricePrediction(cardInfo, period = '1y', options = {}) {
    try {
      // 使用多個算法進行預測
      const predictions = await Promise.all([
        this.predictWithLinearRegression(cardInfo, period),
        this.predictWithRandomForest(cardInfo, period),
        this.predictWithNeuralNetwork(cardInfo, period),
        this.predictWithTimeSeries(cardInfo, period)
      ]);

      // 集成預測結果
      const ensemblePrediction = this.ensemblePredictions(predictions);
      
      // 添加置信度評估
      const confidence = this.calculatePredictionConfidence(predictions);
      
      // 添加風險評估
      const riskAssessment = await this.assessPredictionRisk(cardInfo, ensemblePrediction);
      
      // 保存預測歷史
      this.savePredictionHistory(cardInfo, ensemblePrediction, confidence);

      return {
        prediction: ensemblePrediction,
        confidence,
        riskAssessment,
        individualPredictions: predictions,
        algorithm: 'ensemble',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('高級價格預測失敗:', error);
      throw error;
    }
  }

  // 線性回歸預測
  async predictWithLinearRegression(cardInfo, period) {
    try {
      const model = this.localModels.get(ML_MODEL_TYPES.PRICE_PREDICTION);
      if (!model || !model.linearRegression) {
        return this.fallbackPrediction(cardInfo, period);
      }

      // 提取特徵
      const features = this.extractCardFeatures(cardInfo);
      
      // 應用線性回歸模型
      const prediction = this.applyLinearRegression(model.linearRegression, features, period);
      
      return {
        algorithm: PREDICTION_ALGORITHMS.LINEAR_REGRESSION,
        prediction,
        confidence: 0.75
      };
    } catch (error) {
      console.error('線性回歸預測失敗:', error);
      return this.fallbackPrediction(cardInfo, period);
    }
  }

  // 隨機森林預測
  async predictWithRandomForest(cardInfo, period) {
    try {
      const model = this.localModels.get(ML_MODEL_TYPES.PRICE_PREDICTION);
      if (!model || !model.randomForest) {
        return this.fallbackPrediction(cardInfo, period);
      }

      const features = this.extractCardFeatures(cardInfo);
      const prediction = this.applyRandomForest(model.randomForest, features, period);
      
      return {
        algorithm: PREDICTION_ALGORITHMS.RANDOM_FOREST,
        prediction,
        confidence: 0.82
      };
    } catch (error) {
      console.error('隨機森林預測失敗:', error);
      return this.fallbackPrediction(cardInfo, period);
    }
  }

  // 神經網絡預測
  async predictWithNeuralNetwork(cardInfo, period) {
    try {
      const model = this.localModels.get(ML_MODEL_TYPES.PRICE_PREDICTION);
      if (!model || !model.neuralNetwork) {
        return this.fallbackPrediction(cardInfo, period);
      }

      const features = this.extractCardFeatures(cardInfo);
      const prediction = this.applyNeuralNetwork(model.neuralNetwork, features, period);
      
      return {
        algorithm: PREDICTION_ALGORITHMS.NEURAL_NETWORK,
        prediction,
        confidence: 0.88
      };
    } catch (error) {
      console.error('神經網絡預測失敗:', error);
      return this.fallbackPrediction(cardInfo, period);
    }
  }

  // 時間序列預測
  async predictWithTimeSeries(cardInfo, period) {
    try {
      const model = this.localModels.get(ML_MODEL_TYPES.PRICE_PREDICTION);
      if (!model || !model.timeSeries) {
        return this.fallbackPrediction(cardInfo, period);
      }

      const features = this.extractCardFeatures(cardInfo);
      const prediction = this.applyTimeSeries(model.timeSeries, features, period);
      
      return {
        algorithm: PREDICTION_ALGORITHMS.TIME_SERIES,
        prediction,
        confidence: 0.85
      };
    } catch (error) {
      console.error('時間序列預測失敗:', error);
      return this.fallbackPrediction(cardInfo, period);
    }
  }

  // 集成預測
  ensemblePredictions(predictions) {
    const validPredictions = predictions.filter(p => p && p.prediction);
    
    if (validPredictions.length === 0) {
      return null;
    }

    // 加權平均
    const weights = {
      [PREDICTION_ALGORITHMS.LINEAR_REGRESSION]: 0.15,
      [PREDICTION_ALGORITHMS.RANDOM_FOREST]: 0.25,
      [PREDICTION_ALGORITHMS.NEURAL_NETWORK]: 0.35,
      [PREDICTION_ALGORITHMS.TIME_SERIES]: 0.25
    };

    let weightedSum = 0;
    let totalWeight = 0;

    validPredictions.forEach(pred => {
      const weight = weights[pred.algorithm] || 0.25;
      weightedSum += pred.prediction * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }

  // 計算預測置信度
  calculatePredictionConfidence(predictions) {
    const validPredictions = predictions.filter(p => p && p.prediction);
    
    if (validPredictions.length === 0) {
      return 0;
    }

    // 計算預測值的一致性
    const values = validPredictions.map(p => p.prediction);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // 基於變異係數計算置信度
    const consistencyScore = Math.max(0, 1 - coefficientOfVariation);
    
    // 結合各算法的置信度
    const algorithmConfidence = validPredictions.reduce((sum, p) => sum + p.confidence, 0) / validPredictions.length;
    
    return (consistencyScore * 0.6 + algorithmConfidence * 0.4);
  }

  // 評估預測風險
  async assessPredictionRisk(cardInfo, prediction) {
    try {
      const riskFactors = {
        marketVolatility: this.calculateMarketVolatility(cardInfo),
        liquidityRisk: this.calculateLiquidityRisk(cardInfo),
        concentrationRisk: this.calculateConcentrationRisk(cardInfo),
        externalRisk: this.calculateExternalRisk(cardInfo)
      };

      const totalRisk = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0) / 4;
      
      return {
        totalRisk,
        riskFactors,
        riskLevel: this.getRiskLevel(totalRisk),
        recommendations: this.getRiskRecommendations(riskFactors)
      };
    } catch (error) {
      console.error('評估預測風險失敗:', error);
      return {
        totalRisk: 0.5,
        riskFactors: {},
        riskLevel: 'medium',
        recommendations: []
      };
    }
  }

  // 個性化推薦系統
  async getPersonalizedRecommendations(userId, options = {}) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const userBehavior = await this.getUserBehavior(userId);
      const marketData = await this.getMarketData();
      
      // 協同過濾推薦
      const collaborativeRecommendations = await this.getCollaborativeRecommendations(userId, userBehavior);
      
      // 內容基礎推薦
      const contentBasedRecommendations = await this.getContentBasedRecommendations(userProfile, marketData);
      
      // 混合推薦
      const hybridRecommendations = this.hybridRecommendations(
        collaborativeRecommendations,
        contentBasedRecommendations,
        userProfile
      );

      return {
        recommendations: hybridRecommendations,
        reasoning: this.generateRecommendationReasoning(hybridRecommendations, userProfile),
        confidence: this.calculateRecommendationConfidence(hybridRecommendations),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('獲取個性化推薦失敗:', error);
      throw error;
    }
  }

  // 協同過濾推薦
  async getCollaborativeRecommendations(userId, userBehavior) {
    try {
      const similarUsers = await this.findSimilarUsers(userId, userBehavior);
      const recommendations = await this.generateRecommendationsFromSimilarUsers(similarUsers);
      
      return recommendations;
    } catch (error) {
      console.error('協同過濾推薦失敗:', error);
      return [];
    }
  }

  // 內容基礎推薦
  async getContentBasedRecommendations(userProfile, marketData) {
    try {
      const userPreferences = this.extractUserPreferences(userProfile);
      const recommendations = this.matchPreferencesWithCards(userPreferences, marketData);
      
      return recommendations;
    } catch (error) {
      console.error('內容基礎推薦失敗:', error);
      return [];
    }
  }

  // 混合推薦
  hybridRecommendations(collaborative, contentBased, userProfile) {
    const recommendations = [];
    const seenCards = new Set();

    // 結合兩種推薦結果
    [...collaborative, ...contentBased].forEach(rec => {
      if (!seenCards.has(rec.cardId)) {
        seenCards.add(rec.cardId);
        
        const collaborativeScore = collaborative.find(c => c.cardId === rec.cardId)?.score || 0;
        const contentBasedScore = contentBased.find(c => c.cardId === rec.cardId)?.score || 0;
        
        recommendations.push({
          ...rec,
          hybridScore: (collaborativeScore * 0.6 + contentBasedScore * 0.4),
          reasoning: {
            collaborative: collaborativeScore,
            contentBased: contentBasedScore
          }
        });
      }
    });

    // 按混合分數排序
    return recommendations
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, 20);
  }

  // 智能市場分析
  async intelligentMarketAnalysis(marketData, analysisType = 'comprehensive') {
    try {
      const analysis = {
        trendAnalysis: await this.analyzeMarketTrends(marketData),
        volatilityAnalysis: await this.analyzeMarketVolatility(marketData),
        sectorAnalysis: await this.analyzeMarketSectors(marketData),
        opportunityAnalysis: await this.identifyMarketOpportunities(marketData),
        riskAnalysis: await this.analyzeMarketRisks(marketData)
      };

      // 生成綜合分析報告
      const comprehensiveReport = this.generateComprehensiveReport(analysis);
      
      // 預測市場趨勢
      const trendForecast = await this.forecastMarketTrends(marketData);
      
      return {
        analysis,
        comprehensiveReport,
        trendForecast,
        confidence: this.calculateAnalysisConfidence(analysis),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('智能市場分析失敗:', error);
      throw error;
    }
  }

  // 分析市場趨勢
  async analyzeMarketTrends(marketData) {
    try {
      const trends = {
        shortTerm: this.calculateTrend(marketData, '1m'),
        mediumTerm: this.calculateTrend(marketData, '3m'),
        longTerm: this.calculateTrend(marketData, '1y')
      };

      return {
        trends,
        direction: this.determineTrendDirection(trends),
        strength: this.calculateTrendStrength(trends),
        sustainability: this.assessTrendSustainability(trends)
      };
    } catch (error) {
      console.error('分析市場趨勢失敗:', error);
      return null;
    }
  }

  // 識別市場機會
  async identifyMarketOpportunities(marketData) {
    try {
      const opportunities = [];
      
      // 分析價格異常
      const priceAnomalies = this.detectPriceAnomalies(marketData);
      
      // 分析供需失衡
      const supplyDemandImbalances = this.analyzeSupplyDemandImbalances(marketData);
      
      // 分析新興趨勢
      const emergingTrends = this.detectEmergingTrends(marketData);
      
      // 分析套利機會
      const arbitrageOpportunities = this.findArbitrageOpportunities(marketData);

      return {
        priceAnomalies,
        supplyDemandImbalances,
        emergingTrends,
        arbitrageOpportunities,
        totalOpportunities: priceAnomalies.length + supplyDemandImbalances.length + 
                           emergingTrends.length + arbitrageOpportunities.length
      };
    } catch (error) {
      console.error('識別市場機會失敗:', error);
      return { totalOpportunities: 0 };
    }
  }

  // 預測市場趨勢
  async forecastMarketTrends(marketData) {
    try {
      const forecasts = {
        shortTerm: await this.forecastTrend(marketData, '1m'),
        mediumTerm: await this.forecastTrend(marketData, '3m'),
        longTerm: await this.forecastTrend(marketData, '1y')
      };

      return {
        forecasts,
        confidence: this.calculateForecastConfidence(forecasts),
        scenarios: this.generateForecastScenarios(forecasts)
      };
    } catch (error) {
      console.error('預測市場趨勢失敗:', error);
      return null;
    }
  }

  // 智能投資組合優化
  async optimizeInvestmentPortfolio(portfolio, userGoals, riskTolerance) {
    try {
      const analysis = {
        currentAllocation: this.analyzeCurrentAllocation(portfolio),
        riskAssessment: this.assessPortfolioRisk(portfolio),
        performanceAnalysis: this.analyzePortfolioPerformance(portfolio),
        diversificationAnalysis: this.analyzeDiversification(portfolio)
      };

      const optimization = {
        recommendedAllocation: this.calculateOptimalAllocation(portfolio, userGoals, riskTolerance),
        rebalancingRecommendations: this.generateRebalancingRecommendations(portfolio, analysis),
        riskAdjustments: this.suggestRiskAdjustments(portfolio, riskTolerance),
        growthOpportunities: this.identifyGrowthOpportunities(portfolio, userGoals)
      };

      return {
        analysis,
        optimization,
        implementation: this.generateImplementationPlan(optimization),
        expectedOutcomes: this.predictPortfolioOutcomes(optimization),
        confidence: this.calculateOptimizationConfidence(analysis, optimization)
      };
    } catch (error) {
      console.error('投資組合優化失敗:', error);
      throw error;
    }
  }

  // 實時學習和適應
  async updateModelWithFeedback(predictionId, actualOutcome, feedback) {
    try {
      // 更新預測歷史
      const prediction = this.predictionHistory.find(p => p.id === predictionId);
      if (prediction) {
        prediction.actualOutcome = actualOutcome;
        prediction.feedback = feedback;
        prediction.accuracy = this.calculatePredictionAccuracy(prediction);
      }

      // 更新模型性能
      await this.updateModelPerformance(predictionId, actualOutcome);
      
      // 如果準確率下降，觸發模型重新訓練
      if (this.shouldRetrainModel()) {
        await this.triggerModelRetraining();
      }

      return true;
    } catch (error) {
      console.error('更新模型反饋失敗:', error);
      return false;
    }
  }

  // 計算預測準確率
  calculatePredictionAccuracy(prediction) {
    if (!prediction.actualOutcome || !prediction.prediction) {
      return null;
    }

    const predictedValue = prediction.prediction;
    const actualValue = prediction.actualOutcome;
    
    return Math.max(0, 1 - Math.abs(predictedValue - actualValue) / actualValue);
  }

  // 檢查是否需要重新訓練模型
  shouldRetrainModel() {
    const recentPredictions = this.predictionHistory
      .filter(p => p.accuracy !== null)
      .slice(-100); // 最近100個預測

    if (recentPredictions.length < 50) {
      return false;
    }

    const averageAccuracy = recentPredictions.reduce((sum, p) => sum + p.accuracy, 0) / recentPredictions.length;
    return averageAccuracy < 0.7; // 準確率低於70%時重新訓練
  }

  // 觸發模型重新訓練
  async triggerModelRetraining() {
    try {
      console.log('觸發模型重新訓練...');
      
      // 通知後端重新訓練模型
      await apiIntegrationManager.callApi(
        'aiModel',
        'retrain',
        { trigger: 'accuracy_threshold' },
        { useCache: false }
      );
      
      return true;
    } catch (error) {
      console.error('觸發模型重新訓練失敗:', error);
      return false;
    }
  }

  // 輔助方法
  extractCardFeatures(cardInfo) {
    return {
      rarity: this.normalizeRarity(cardInfo.rarity),
      set: cardInfo.set,
      year: cardInfo.year || new Date().getFullYear(),
      condition: cardInfo.condition || 'NM',
      marketDemand: this.estimateMarketDemand(cardInfo),
      supplyLevel: this.estimateSupplyLevel(cardInfo),
      playability: this.estimatePlayability(cardInfo),
      collectorValue: this.estimateCollectorValue(cardInfo)
    };
  }

  normalizeRarity(rarity) {
    const rarityMap = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Ultra Rare': 4,
      'Secret Rare': 5,
      'Legendary': 6
    };
    return rarityMap[rarity] || 3;
  }

  estimateMarketDemand(cardInfo) {
    // 基於卡牌特性的需求估算
    let demand = 50; // 基礎需求
    
    if (cardInfo.rarity === 'Secret Rare') demand += 30;
    if (cardInfo.rarity === 'Ultra Rare') demand += 20;
    if (cardInfo.playability === 'high') demand += 25;
    if (cardInfo.collectorValue === 'high') demand += 20;
    
    return Math.min(100, Math.max(0, demand));
  }

  estimateSupplyLevel(cardInfo) {
    // 基於稀有度和發行量的供應估算
    let supply = 50;
    
    if (cardInfo.rarity === 'Common') supply += 30;
    if (cardInfo.rarity === 'Uncommon') supply += 20;
    if (cardInfo.rarity === 'Secret Rare') supply -= 30;
    if (cardInfo.rarity === 'Ultra Rare') supply -= 20;
    
    return Math.min(100, Math.max(0, supply));
  }

  estimatePlayability(cardInfo) {
    // 基於遊戲實用性的估算
    return cardInfo.playability === 'high' ? 80 : 
           cardInfo.playability === 'medium' ? 50 : 20;
  }

  estimateCollectorValue(cardInfo) {
    // 基於收藏價值的估算
    return cardInfo.collectorValue === 'high' ? 80 : 
           cardInfo.collectorValue === 'medium' ? 50 : 20;
  }

  fallbackPrediction(cardInfo, period) {
    // 簡單的基線預測
    const basePrice = cardInfo.currentPrice || 100;
    const growthRate = 0.05; // 5% 年增長率
    const months = this.periodToMonths(period);
    
    return {
      algorithm: 'baseline',
      prediction: basePrice * Math.pow(1 + growthRate, months / 12),
      confidence: 0.5
    };
  }

  periodToMonths(period) {
    const periodMap = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '1y': 12,
      '3y': 36
    };
    return periodMap[period] || 12;
  }

  savePredictionHistory(cardInfo, prediction, confidence) {
    const historyEntry = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardInfo,
      prediction,
      confidence,
      timestamp: new Date().toISOString(),
      actualOutcome: null,
      feedback: null,
      accuracy: null
    };

    this.predictionHistory.push(historyEntry);
    
    // 保持歷史記錄在合理範圍內
    if (this.predictionHistory.length > 1000) {
      this.predictionHistory = this.predictionHistory.slice(-500);
    }
  }

  // 原有的方法保持不變
  async chat(message, context = {}, options = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        {
          prompt: message,
          context,
          ...options,
        },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('AI聊天失敗:', error);
      throw error;
    }
  }

  async getSuggestions(context = {}, options = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'getSuggestions',
        { context, ...options },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取AI建議失敗:', error);
      throw error;
    }
  }

  async analyzeCard(cardInfo, analysisType = 'general', options = {}) {
    try {
      const prompt = this.buildAnalysisPrompt(cardInfo, analysisType);
      const context = {
        cardInfo,
        analysisType,
        ...options,
      };

      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { prompt, context },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('卡牌分析失敗:', error);
      throw error;
    }
  }

  async predictPriceTrend(cardInfo, period = '1y', options = {}) {
    try {
      // 使用新的高級預測方法
      return await this.advancedPricePrediction(cardInfo, period, options);
    } catch (error) {
      console.error('價格預測分析失敗:', error);
      throw error;
    }
  }

  async getInvestmentAdvice(cardInfo, userProfile = {}, options = {}) {
    try {
      const prompt = this.buildInvestmentAdvicePrompt(cardInfo, userProfile);
      const context = {
        cardInfo,
        userProfile,
        ...options,
      };

      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { prompt, context },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('獲取投資建議失敗:', error);
      throw error;
    }
  }

  async analyzeMarket(marketData, analysisType = 'trend', options = {}) {
    try {
      // 使用新的智能市場分析方法
      return await this.intelligentMarketAnalysis(marketData, analysisType);
    } catch (error) {
      console.error('市場分析失敗:', error);
      throw error;
    }
  }

  async assessRisk(cardInfo, marketConditions = {}, options = {}) {
    try {
      const prompt = this.buildRiskAssessmentPrompt(cardInfo, marketConditions);
      const context = {
        cardInfo,
        marketConditions,
        ...options,
      };

      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { prompt, context },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('風險評估失敗:', error);
      throw error;
    }
  }

  async getCollectionOptimizationAdvice(collection, userGoals = {}, options = {}) {
    try {
      const prompt = this.buildCollectionOptimizationPrompt(collection, userGoals);
      const context = {
        collection,
        userGoals,
        ...options,
      };

      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { prompt, context },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('獲取收藏優化建議失敗:', error);
      throw error;
    }
  }

  async getTradingStrategy(cardInfo, marketData = {}, userProfile = {}, options = {}) {
    try {
      const prompt = this.buildTradingStrategyPrompt(cardInfo, marketData, userProfile);
      const context = {
        cardInfo,
        marketData,
        userProfile,
        ...options,
      };

      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { prompt, context },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('獲取交易策略建議失敗:', error);
      throw error;
    }
  }

  // 構建分析提示詞
  buildAnalysisPrompt(cardInfo, analysisType) {
    const basePrompt = `請分析以下TCG卡牌：${cardInfo.name}`;
    
    switch (analysisType) {
      case 'price':
        return `${basePrompt}，重點分析其價格趨勢、市場表現和投資價值。`;
      case 'rarity':
        return `${basePrompt}，重點分析其稀有度、發行量和收藏價值。`;
      case 'playability':
        return `${basePrompt}，重點分析其在遊戲中的實用性和競技價值。`;
      case 'investment':
        return `${basePrompt}，重點分析其作為投資標的的潛力和風險。`;
      case 'market':
        return `${basePrompt}，重點分析其市場需求和供應情況。`;
      default:
        return `${basePrompt}，提供全面的分析報告。`;
    }
  }

  // 構建價格預測提示詞
  buildPricePredictionPrompt(cardInfo, period) {
    return `基於以下卡牌信息：${cardInfo.name}，請預測未來${period}的價格趨勢，包括：
1. 價格變動方向（上漲/下跌/穩定）
2. 預期價格範圍
3. 影響價格的關鍵因素
4. 風險提示
5. 投資建議`;
  }

  // 構建投資建議提示詞
  buildInvestmentAdvicePrompt(cardInfo, userProfile) {
    return `基於卡牌信息：${cardInfo.name} 和用戶檔案：${JSON.stringify(userProfile)}，請提供個性化的投資建議，包括：
1. 是否適合該用戶投資
2. 建議的投資時機
3. 建議的投資金額
4. 風險控制措施
5. 退出策略`;
  }

  // 構建市場分析提示詞
  buildMarketAnalysisPrompt(marketData, analysisType) {
    const basePrompt = '請分析當前TCG卡牌市場狀況';
    
    switch (analysisType) {
      case 'trend':
        return `${basePrompt}，重點分析市場趨勢和熱門卡牌。`;
      case 'sector':
        return `${basePrompt}，重點分析不同卡牌類型的表現。`;
      case 'volatility':
        return `${basePrompt}，重點分析市場波動性和風險。`;
      case 'opportunity':
        return `${basePrompt}，重點分析投資機會和潛在收益。`;
      default:
        return `${basePrompt}，提供全面的市場分析報告。`;
    }
  }

  // 構建風險評估提示詞
  buildRiskAssessmentPrompt(cardInfo, marketConditions) {
    return `請評估卡牌：${cardInfo.name} 的投資風險，考慮以下因素：
1. 市場條件：${JSON.stringify(marketConditions)}
2. 卡牌特性（稀有度、發行量、遊戲實用性等）
3. 外部風險（政策變化、市場波動等）
4. 流動性風險
5. 風險等級評定和緩解建議`;
  }

  // 構建收藏優化提示詞
  buildCollectionOptimizationPrompt(collection, userGoals) {
    return `基於用戶收藏：${JSON.stringify(collection)} 和目標：${JSON.stringify(userGoals)}，請提供收藏優化建議：
1. 收藏結構分析
2. 需要補充的卡牌類型
3. 可以考慮出售的卡牌
4. 收藏多樣化建議
5. 長期收藏策略`;
  }

  // 構建交易策略提示詞
  buildTradingStrategyPrompt(cardInfo, marketData, userProfile) {
    return `基於卡牌：${cardInfo.name}、市場數據：${JSON.stringify(marketData)} 和用戶檔案：${JSON.stringify(userProfile)}，請提供交易策略建議：
1. 最佳買入時機
2. 最佳賣出時機
3. 價格目標設定
4. 止損策略
5. 風險管理措施`;
  }

  // 批量分析
  async analyzeBatch(cards, analysisType = 'general', options = {}) {
    try {
      const results = [];
      const totalCards = cards.length;

      for (let i = 0; i < totalCards; i++) {
        const card = cards[i];
        
        // 更新進度
        if (options.onProgress) {
          options.onProgress({
            current: i + 1,
            total: totalCards,
            percentage: ((i + 1) / totalCards) * 100,
          });
        }

        try {
          const result = await this.analyzeCard(card, analysisType, options);
          results.push({
            success: true,
            data: result,
            card,
            index: i,
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
            card,
            index: i,
          });
        }
      }

      return {
        success: true,
        data: results,
        totalProcessed: totalCards,
        successfulCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
      };
    } catch (error) {
      console.error('批量分析失敗:', error);
      throw error;
    }
  }

  // 獲取AI模型信息
  async getModelInfo() {
    try {
      const result = await apiIntegrationManager.callApi(
        'aiModel',
        'getInfo',
        {},
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取AI模型信息失敗:', error);
      throw error;
    }
  }

  // 設置AI偏好
  async setPreferences(preferences) {
    try {
      this.userPreferences = { ...this.userPreferences, ...preferences };
      await this.saveUserPreferences();
      
      const result = await apiIntegrationManager.callApi(
        'aiPreferences',
        'setPreferences',
        { preferences },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('設置AI偏好失敗:', error);
      throw error;
    }
  }

  // 獲取AI偏好
  async getPreferences() {
    try {
      const result = await apiIntegrationManager.callApi(
        'aiPreferences',
        'getPreferences',
        {},
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取AI偏好失敗:', error);
      throw error;
    }
  }
}

export default new AIService();
