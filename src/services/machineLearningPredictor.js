// 機器學習價格預測模型
export class MachineLearningPredictor {
  constructor() {
    this.models = new Map();
    this.trainingData = new Map();
    this.featureEngineering = new Map();
    this.modelPerformance = new Map();    // 模型配置
    this.modelConfigs = {      linearRegression: {        name: 'Linear Regression',        features: ['price_history', 'volume', 'rarity', 'condition'],        accuracy: 0.72,        bias: 'low',      },      randomForest: {        name: 'Random Forest',        features: ['price_history', 'volume', 'market_sentiment', 'seasonality'],        accuracy: 0.85,        bias: 'medium',      },      neuralNetwork: {        name: 'Neural Network',        features: ['all_features'],        accuracy: 0.91,        bias: 'high',      },      ensemble: {        name: 'Ensemble Model',        features: ['all_models'],        accuracy: 0.94,        bias: 'balanced',      },
    };    // 特徵權重
    this.featureWeights = {      priceHistory: 0.3,      marketTrend: 0.25,      volume: 0.15,      rarity: 0.1,      condition: 0.1,      seasonality: 0.05,      sentiment: 0.05,
    };
  }

  // 主要價格預測方法
  async predictPrice(cardData, options = {}) {
    try {      const {        model = 'ensemble',        timeHorizon = 30, // 天數        includeConfidenceInterval = true,        includeFeatureImportance = true,        includeModelExplanation = true,        onProgress = null,      } = options;      onProgress && onProgress('開始價格預測分析...');      // 1. 特徵工程      const features = await this.engineerFeatures(cardData, timeHorizon);      // 2. 數據預處理      onProgress && onProgress('預處理數據...');      const processedFeatures = this.preprocessFeatures(features);      // 3. 模型預測      onProgress && onProgress('運行機器學習模型...');      const predictions = await this.runModelPredictions(processedFeatures, model, timeHorizon);      // 4. 置信區間計算      let confidenceInterval = null;      if (includeConfidenceInterval) {        onProgress && onProgress('計算置信區間...');        confidenceInterval = this.calculateConfidenceInterval(predictions, processedFeatures);      }      // 5. 特徵重要性分析      let featureImportance = null;      if (includeFeatureImportance) {        onProgress && onProgress('分析特徵重要性...');        featureImportance = this.analyzeFeatureImportance(processedFeatures, predictions);      }      // 6. 模型解釋      let modelExplanation = null;      if (includeModelExplanation) {        onProgress && onProgress('生成模型解釋...');        modelExplanation = this.generateModelExplanation(predictions, features);      }      // 7. 風險評估      const riskAssessment = this.assessPredictionRisk(predictions, processedFeatures);      // 8. 情境分析      const scenarioAnalysis = await this.performScenarioAnalysis(cardData, processedFeatures);      onProgress && onProgress('價格預測完成！');      return {        success: true,        prediction: {          currentPrice: cardData.currentPrice,          predictedPrice: predictions.price,          priceChange: predictions.price - cardData.currentPrice,          percentChange: ((predictions.price - cardData.currentPrice) / cardData.currentPrice) * 100,          confidence: predictions.confidence,          timeHorizon,          modelUsed: model,        },        confidenceInterval,        featureImportance,        modelExplanation,        riskAssessment,        scenarioAnalysis,        technicalDetails: {          features: processedFeatures,          modelPerformance: this.getModelPerformance(model),          dataQuality: this.assessDataQuality(features),        },        timestamp: new Date().toISOString(),      };
    } catch (error) {      return {        success: false,        error: error.message,        timestamp: new Date().toISOString(),      };
    }
  }

  // 特徵工程
  async engineerFeatures(cardData, timeHorizon) {
    const features = {      // 基礎特徵      basic: {        currentPrice: cardData.currentPrice || 1000,        rarity: this.encodeRarity(cardData.rarity),        condition: this.encodeCondition(cardData.condition),        age: this.calculateAge(cardData.releaseDate),        series: this.encodeSeries(cardData.series),      },      // 價格歷史特徵      priceHistory: await this.extractPriceHistoryFeatures(cardData.name, timeHorizon),      // 市場特徵      market: await this.extractMarketFeatures(cardData.name),      // 技術指標特徵      technical: await this.extractTechnicalFeatures(cardData.name),      // 情緒特徵      sentiment: await this.extractSentimentFeatures(cardData.name),      // 季節性特徵      seasonality: this.extractSeasonalityFeatures(),      // 宏觀經濟特徵      macroeconomic: await this.extractMacroeconomicFeatures(),
    };    return features;
  }

  // 價格歷史特徵提取
  async extractPriceHistoryFeatures(cardName, timeHorizon) {
    const priceHistory = await this.getPriceHistory(cardName, timeHorizon * 2); // 獲取雙倍時間的歷史數據    if (!priceHistory || priceHistory.length < 2) {      return this.getDefaultPriceFeatures();
    }    const prices = priceHistory.map(p => p.price);
    const volumes = priceHistory.map(p => p.volume || 0);    return {      // 價格統計特徵      mean: this.calculateMean(prices),      std: this.calculateStd(prices),      min: Math.min(...prices),      max: Math.max(...prices),      median: this.calculateMedian(prices),      // 趨勢特徵      shortTermTrend: this.calculateTrend(prices.slice(-7)), // 7天趨勢      mediumTermTrend: this.calculateTrend(prices.slice(-30)), // 30天趨勢      longTermTrend: this.calculateTrend(prices), // 全期趨勢      // 波動性特徵      volatility: this.calculateVolatility(prices),      rollingVolatility: this.calculateRollingVolatility(prices, 7),      // 動量特徵      momentum: this.calculateMomentum(prices),      rsi: this.calculateRSI(prices),      // 量價關係特徵      volumeTrend: this.calculateTrend(volumes),      priceVolumeCorrelation: this.calculateCorrelation(prices, volumes),      // 技術指標      movingAverage5: this.calculateMovingAverage(prices, 5),      movingAverage20: this.calculateMovingAverage(prices, 20),      bollinger: this.calculateBollingerBands(prices),      macd: this.calculateMACD(prices),
    };
  }

  // 市場特徵提取
  async extractMarketFeatures(cardName) {
    return {      marketCap: await this.getMarketCap(cardName),      liquidityScore: await this.getLiquidityScore(cardName),      competitorPrices: await this.getCompetitorPrices(cardName),      marketShare: await this.getMarketShare(cardName),      tradingActivity: await this.getTradingActivity(cardName),      newListings: await this.getNewListings(cardName),      priceSpread: await this.getPriceSpread(cardName),
    };
  }

  // 技術指標特徵提取
  async extractTechnicalFeatures(cardName) {
    const priceData = await this.getPriceHistory(cardName, 100);
    if (!priceData) {
      return {};
    }    const prices = priceData.map(p => p.price);    return {      // 趨勢指標      ema12: this.calculateEMA(prices, 12),      ema26: this.calculateEMA(prices, 26),      // 震盪指標      stochastic: this.calculateStochastic(priceData),      williams: this.calculateWilliamsR(priceData),      // 量能指標      obv: this.calculateOBV(priceData),      mfi: this.calculateMFI(priceData),      // 支撐阻力      support: this.calculateSupport(prices),      resistance: this.calculateResistance(prices),      // 圖形模式      patterns: this.identifyPatterns(prices),
    };
  }

  // 情緒特徵提取
  async extractSentimentFeatures(cardName) {
    return {      socialMediaSentiment: await this.getSocialMediaSentiment(cardName),      newsSentiment: await this.getNewsSentiment(cardName),      forumSentiment: await this.getForumSentiment(cardName),      searchVolume: await this.getSearchVolume(cardName),      mentionCount: await this.getMentionCount(cardName),      influencerOpinions: await this.getInfluencerOpinions(cardName),
    };
  }

  // 數據預處理
  preprocessFeatures(features) {
    const flattened = this.flattenFeatures(features);
    const normalized = this.normalizeFeatures(flattened);
    const selected = this.selectFeatures(normalized);
    const engineered = this.addInteractionFeatures(selected);    return {      original: flattened,      normalized,      selected,      engineered,      final: engineered, // 使用工程特徵作為最終特徵
    };
  }

  // 運行模型預測
  async runModelPredictions(features, modelType, timeHorizon) {
    switch (modelType) {
      case 'linearRegression':        return this.runLinearRegression(features, timeHorizon);
      case 'randomForest':        return this.runRandomForest(features, timeHorizon);
      case 'neuralNetwork':        return this.runNeuralNetwork(features, timeHorizon);
      case 'ensemble':        return this.runEnsembleModel(features, timeHorizon);
      default:        throw new Error(`不支援的模型類型: ${modelType}`);
    }
  }

  // 線性回歸預測
  runLinearRegression(features, timeHorizon) {
    // 簡化的線性回歸實現
    const weights = this.getLinearRegressionWeights();
    let prediction = 0;    for (const [feature, value] of Object.entries(features.final)) {      const weight = weights[feature] || 0;      prediction += value * weight;
    }    // 添加時間因子
    const timeFactor = 1 + (timeHorizon / 365) * 0.1;
    prediction *= timeFactor;    return {      price: Math.max(0, prediction),      confidence: 0.72,      model: 'linear_regression',      featuresUsed: Object.keys(features.final).length,
    };
  }

  // 隨機森林預測
  runRandomForest(features, timeHorizon) {
    // 模擬隨機森林預測
    const trees = this.getRandomForestTrees();
    const predictions = [];    for (const tree of trees) {      const treePrediction = this.evaluateDecisionTree(tree, features.final);      predictions.push(treePrediction);
    }    const avgPrediction = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
    const variance = this.calculateVariance(predictions);    return {      price: Math.max(0, avgPrediction),      confidence: Math.max(0.6, 0.95 - variance),      model: 'random_forest',      treeCount: trees.length,      variance,
    };
  }

  // 神經網絡預測
  runNeuralNetwork(features, timeHorizon) {
    // 簡化的神經網絡實現
    const layers = this.getNeuralNetworkLayers();
    let output = features.final;    for (const layer of layers) {      output = this.applyLayerTransformation(output, layer);
    }    const prediction = this.applyOutputActivation(output);    return {      price: Math.max(0, prediction),      confidence: 0.91,      model: 'neural_network',      layersCount: layers.length,      neuronsActivated: this.countActivatedNeurons(output),
    };
  }

  // 集成模型預測
  async runEnsembleModel(features, timeHorizon) {
    // 運行所有子模型
    const linearPred = this.runLinearRegression(features, timeHorizon);
    const rfPred = this.runRandomForest(features, timeHorizon);
    const nnPred = this.runNeuralNetwork(features, timeHorizon);    // 加權平均
    const weights = { linear: 0.2, rf: 0.4, nn: 0.4 };
    const ensemblePrediction =      linearPred.price * weights.linear +      rfPred.price * weights.rf +      nnPred.price * weights.nn;    const ensembleConfidence =      linearPred.confidence * weights.linear +      rfPred.confidence * weights.rf +      nnPred.confidence * weights.nn;    return {      price: ensemblePrediction,      confidence: ensembleConfidence,      model: 'ensemble',      submodels: {        linear: linearPred,        randomForest: rfPred,        neuralNetwork: nnPred,      },      weights,
    };
  }

  // 置信區間計算
  calculateConfidenceInterval(prediction, features) {
    const basePrice = prediction.price;
    const confidence = prediction.confidence;    // 基於模型不確定性計算區間
    const uncertainty = 1 - confidence;
    const interval = basePrice * uncertainty * 0.5;    return {      lower: Math.max(0, basePrice - interval),      upper: basePrice + interval,      confidenceLevel: 0.95,      intervalWidth: interval * 2,      interpretation: this.interpretConfidenceInterval(interval, basePrice),
    };
  }

  // 特徵重要性分析
  analyzeFeatureImportance(features, prediction) {
    const importance = {};    // 基於特徵權重計算重要性
    for (const [feature, value] of Object.entries(features.final)) {      const weight = this.featureWeights[feature] || 0.01;      importance[feature] = {        value,        weight,        contribution: Math.abs(value * weight),        impact: value * weight > 0 ? 'positive' : 'negative',      };
    }    // 排序
    const sortedImportance = Object.entries(importance)      .sort(([,a], [,b]) => b.contribution - a.contribution)      .slice(0, 10); // 只保留前10個最重要的特徵    return {      topFeatures: sortedImportance.map(([name, data]) => ({        name,        ...data,      })),      totalFeatures: Object.keys(features.final).length,      explanation: this.generateFeatureExplanation(sortedImportance),
    };
  }

  // 模型解釋
  generateModelExplanation(prediction, features) {
    const explanations = [];    // 基於價格歷史的解釋
    if (features.priceHistory.shortTermTrend > 0) {      explanations.push('短期價格呈上升趨勢，支持價格增長預測');
    }    // 基於市場特徵的解釋
    if (features.market.liquidityScore > 0.7) {      explanations.push('高流動性支持價格穩定性');
    }    // 基於技術指標的解釋
    if (features.technical.rsi < 30) {      explanations.push('RSI指標顯示超賣狀態，可能反彈');
    } else if (features.technical.rsi > 70) {      explanations.push('RSI指標顯示超買狀態，可能回調');
    }    return {      keyFactors: explanations,      modelReasoning: this.generateModelReasoning(prediction),      predictionDrivers: this.identifyPredictionDrivers(features),      riskFactors: this.identifyRiskFactors(features),
    };
  }

  // 情境分析
  async performScenarioAnalysis(cardData, features) {
    const scenarios = {      optimistic: await this.runOptimisticScenario(cardData, features),      realistic: await this.runRealisticScenario(cardData, features),      pessimistic: await this.runPessimisticScenario(cardData, features),      blackSwan: await this.runBlackSwanScenario(cardData, features),
    };    return {      scenarios,      probabilities: {        optimistic: 0.2,        realistic: 0.6,        pessimistic: 0.15,        blackSwan: 0.05,      },      expectedValue: this.calculateExpectedValue(scenarios),      riskMetrics: this.calculateScenarioRiskMetrics(scenarios),
    };
  }

  // 輔助計算方法
  flattenFeatures(features) {
    const flattened = {};    const flatten = (obj, prefix = '') => {      for (const [key, value] of Object.entries(obj)) {        const newKey = prefix ? `${prefix}_${key}` : key;        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {          flatten(value, newKey);        } else {          flattened[newKey] = typeof value === 'number' ? value : 0;        }      }
    };    flatten(features);
    return flattened;
  }

  normalizeFeatures(features) {
    const normalized = {};
    const values = Object.values(features);
    const mean = this.calculateMean(values);
    const std = this.calculateStd(values);    for (const [key, value] of Object.entries(features)) {      normalized[key] = std > 0 ? (value - mean) / std : 0;
    }    return normalized;
  }

  calculateMean(array) {
    return array.length > 0 ? array.reduce((sum, val) => sum + val, 0) / array.length : 0;
  }

  calculateStd(array) {
    const mean = this.calculateMean(array);
    const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
  }

  calculateVariance(array) {
    const mean = this.calculateMean(array);
    return array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
  }

  // 模擬數據方法
  async getPriceHistory(cardName, days) {
    const history = [];
    let basePrice = 1000;    for (let i = days; i >= 0; i--) {      const date = new Date();      date.setDate(date.getDate() - i);      // 模擬價格變化      const volatility = 0.02;      const trend = 0.001; // 輕微上升趨勢      const noise = (Math.random() - 0.5) * volatility;      basePrice *= (1 + trend + noise);      history.push({        date: date.toISOString().split('T')[0],        price: Math.round(basePrice),        volume: Math.floor(50 + Math.random() * 100),      });
    }    return history;
  }

  getLinearRegressionWeights() {
    return {      basicCurrentPrice: 0.8,      priceHistoryShortTermTrend: 0.3,      priceHistoryVolatility: -0.2,      marketLiquidityScore: 0.15,      technicalRsi: -0.1,      sentimentSocialMediaSentiment: 0.05,
    };
  }

  getRandomForestTrees() {
    // 模擬決策樹結構
    return Array(100).fill(null).map((_, i) => ({      id: i,      depth: 5 + Math.floor(Math.random() * 5),      features: ['price', 'volume', 'trend'],
    }));
  }

  evaluateDecisionTree(tree, features) {
    // 簡化的決策樹評估
    return 1000 + (Math.random() - 0.5) * 200;
  }
}

export default new MachineLearningPredictor();
