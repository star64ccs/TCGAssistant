// 投資組合優化器
export class PortfolioOptimizer {
  constructor() {
    this.optimizationModels = new Map();
    this.constraints = new Map();
    this.objectives = new Map();    // 優化目標權重
    this.defaultObjectives = {      return: 0.4, // 追求收益      risk: 0.3, // 控制風險      diversification: 0.2, // 分散投資      liquidity: 0.1, // 保持流動性
    };    // 約束條件
    this.defaultConstraints = {      maxSinglePosition: 0.25, // 單一投資最大比例      minCashReserve: 0.05, // 最小現金儲備      maxRiskLevel: 0.6, // 最大風險水平      minLiquidityRatio: 0.3, // 最小流動性比例      maxConcentration: 0.4, // 最大集中度
    };
  }

  // 主要投資組合優化方法
  async optimizePortfolio(currentPortfolio, userProfile, investmentUniverse, options = {}) {
    try {      const {        optimizationMethod = 'markowitz', // markowitz, blackLitterman, riskParity        timeHorizon = '1year',        rebalanceFrequency = 'quarterly',        includeTransaction = true,        onProgress = null,      } = options;      onProgress && onProgress('開始投資組合優化...');      // 1. 分析當前投資組合      const currentAnalysis = await this.analyzeCurrentPortfolio(currentPortfolio);      // 2. 設定優化目標和約束      onProgress && onProgress('設定優化參數...');      const objectives = this.setupObjectives(userProfile, options);      const constraints = this.setupConstraints(userProfile, currentPortfolio, options);      // 3. 構建預期收益和風險模型      onProgress && onProgress('構建收益風險模型...');      const expectedReturns = await this.estimateExpectedReturns(investmentUniverse, timeHorizon);      const riskModel = await this.buildRiskModel(investmentUniverse, timeHorizon);      // 4. 執行優化算法      onProgress && onProgress('執行投資組合優化...');      const optimizedWeights = await this.runOptimization(        optimizationMethod,        expectedReturns,        riskModel,        objectives,        constraints,      );        // 5. 構建優化後的投資組合      const optimizedPortfolio = this.constructOptimizedPortfolio(        optimizedWeights,        investmentUniverse,        userProfile.budget,      );        // 6. 計算交易成本      let transactionCosts = null;      if (includeTransaction) {        onProgress && onProgress('計算交易成本...');        transactionCosts = this.calculateTransactionCosts(currentPortfolio, optimizedPortfolio);      }      // 7. 生成再平衡建議      const rebalancingPlan = this.generateRebalancingPlan(        currentPortfolio,        optimizedPortfolio,        transactionCosts,        rebalanceFrequency,      );        // 8. 回測和驗證      onProgress && onProgress('執行回測驗證...');      const backtestResults = await this.backtestPortfolio(optimizedPortfolio, timeHorizon);      // 9. 風險分析      const riskAnalysis = await this.analyzePortfolioRisk(optimizedPortfolio, userProfile);      onProgress && onProgress('投資組合優化完成！');      return {        success: true,        optimization: {          method: optimizationMethod,          currentPortfolio: currentAnalysis,          optimizedPortfolio,          rebalancingPlan,          backtestResults,          riskAnalysis,          transactionCosts,          performance: this.comparePortfolios(currentAnalysis, optimizedPortfolio),          recommendations: this.generateOptimizationRecommendations(optimizedPortfolio, currentAnalysis),        },        timestamp: new Date().toISOString(),      };
    } catch (error) {      return {        success: false,        error: error.message,        timestamp: new Date().toISOString(),      };
    }
  }

  // 分析當前投資組合
  async analyzeCurrentPortfolio(portfolio) {
    if (!portfolio || !portfolio.holdings) {      return this.createEmptyPortfolioAnalysis();
    }    const holdings = portfolio.holdings;
    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);    return {      totalValue,      holdings: holdings.map(holding => ({        ...holding,        weight: holding.value / totalValue,        allocation: this.categorizeHolding(holding),      })),      allocation: this.calculateAllocation(holdings),      risk: this.calculatePortfolioRisk(holdings),      diversification: this.calculateDiversification(holdings),      liquidity: this.calculateLiquidity(holdings),      concentration: this.calculateConcentration(holdings),      performance: this.calculatePortfolioPerformance(holdings),
    };
  }

  // 設定優化目標
  setupObjectives(userProfile, options) {
    const baseObjectives = { ...this.defaultObjectives };    // 根據用戶風險偏好調整
    switch (userProfile.riskTolerance) {
      case 'conservative':        baseObjectives.return = 0.2;        baseObjectives.risk = 0.5;        baseObjectives.liquidity = 0.2;        break;
      case 'aggressive':        baseObjectives.return = 0.6;        baseObjectives.risk = 0.2;        baseObjectives.diversification = 0.15;        break;
      default: // moderate      // 保持默認權重        break;
    }    // 根據投資期限調整
    if (userProfile.timeHorizon === 'short') {      baseObjectives.liquidity += 0.1;      baseObjectives.return -= 0.1;
    } else if (userProfile.timeHorizon === 'long') {      baseObjectives.return += 0.1;      baseObjectives.liquidity -= 0.1;
    }    return {      ...baseObjectives,      ...options.customObjectives,
    };
  }

  // 設定約束條件
  setupConstraints(userProfile, currentPortfolio, options) {
    const baseConstraints = { ...this.defaultConstraints };    // 根據用戶資金規模調整
    if (userProfile.budget < 10000) {      baseConstraints.maxSinglePosition = 0.4; // 小資金允許更高集中度      baseConstraints.minCashReserve = 0.1; // 提高現金儲備
    } else if (userProfile.budget > 100000) {      baseConstraints.maxSinglePosition = 0.15; // 大資金要求更分散      baseConstraints.minCashReserve = 0.02; // 降低現金儲備
    }    // 根據風險承受能力調整
    switch (userProfile.riskTolerance) {
      case 'conservative':        baseConstraints.maxRiskLevel = 0.3;        baseConstraints.minLiquidityRatio = 0.5;        break;
      case 'aggressive':        baseConstraints.maxRiskLevel = 0.8;        baseConstraints.minLiquidityRatio = 0.1;        break;
    }    return {      ...baseConstraints,      ...options.customConstraints,
    };
  }

  // 預期收益估算
  async estimateExpectedReturns(investmentUniverse, timeHorizon) {
    const returns = {};    for (const investment of investmentUniverse) {      // 使用多種方法估算預期收益      const historicalReturn = await this.calculateHistoricalReturn(investment, timeHorizon);      const fundamentalReturn = await this.calculateFundamentalReturn(investment);      const technicalReturn = await this.calculateTechnicalReturn(investment);      const sentimentReturn = await this.calculateSentimentReturn(investment);      // 綜合預期收益      returns[investment.id] = this.combineReturnEstimates({        historical: historicalReturn,        fundamental: fundamentalReturn,        technical: technicalReturn,        sentiment: sentimentReturn,      });
    }    return returns;
  }

  // 構建風險模型
  async buildRiskModel(investmentUniverse, timeHorizon) {
    const riskModel = {      volatilities: {},      correlations: {},      factorExposures: {},      idiosyncraticRisks: {},
    };      // 計算各投資的波動率
    for (const investment of investmentUniverse) {      riskModel.volatilities[investment.id] = await this.calculateVolatility(investment, timeHorizon);
    }    // 計算相關係數矩陣
    riskModel.correlations = await this.calculateCorrelationMatrix(investmentUniverse, timeHorizon);    // 因子風險模型
    riskModel.factorExposures = await this.calculateFactorExposures(investmentUniverse);
    riskModel.idiosyncraticRisks = await this.calculateIdiosyncraticRisks(investmentUniverse);    return riskModel;
  }

  // 執行優化算法
  async runOptimization(method, expectedReturns, riskModel, objectives, constraints) {
    switch (method) {
      case 'markowitz':        return this.runMarkowitzOptimization(expectedReturns, riskModel, objectives, constraints);
      case 'blackLitterman':        return this.runBlackLittermanOptimization(expectedReturns, riskModel, objectives, constraints);
      case 'riskParity':        return this.runRiskParityOptimization(riskModel, constraints);
      case 'minVariance':        return this.runMinVarianceOptimization(riskModel, constraints);
      default:        throw new Error(`不支援的優化方法: ${method}`);
    }
  }

  // Markowitz 均值方差優化
  runMarkowitzOptimization(expectedReturns, riskModel, objectives, constraints) {
    // 簡化的 Markowitz 優化實現
    const investments = Object.keys(expectedReturns);
    const n = investments.length;    // 初始等權重分配
    let weights = investments.reduce((acc, id) => {      acc[id] = 1 / n;      return acc;
    }, {});      // 迭代優化（簡化版本）
    for (let iteration = 0; iteration < 100; iteration++) {      const gradient = this.calculateGradient(weights, expectedReturns, riskModel, objectives);      weights = this.updateWeights(weights, gradient, constraints);      if (this.hasConverged(gradient)) {
        break;
      }
    }    return this.normalizeWeights(weights);
  }

  // Black-Litterman 優化
  runBlackLittermanOptimization(expectedReturns, riskModel, objectives, constraints) {
    // 市場均衡組合
    const marketWeights = this.getMarketWeights(Object.keys(expectedReturns));    // 投資者觀點
    const views = this.formulateInvestorViews(expectedReturns);    // Black-Litterman 調整
    const adjustedReturns = this.applyBlackLittermanAdjustment(      expectedReturns,      marketWeights,      views,      riskModel,
    );      // 基於調整後的收益進行 Markowitz 優化
    return this.runMarkowitzOptimization(adjustedReturns, riskModel, objectives, constraints);
  }

  // 風險平價優化
  runRiskParityOptimization(riskModel, constraints) {
    const investments = Object.keys(riskModel.volatilities);    // 計算風險貢獻相等的權重
    const weights = {};
    const totalInverseVol = investments.reduce((sum, id) =>      sum + (1 / riskModel.volatilities[id]), 0,
    );    investments.forEach(id => {      weights[id] = (1 / riskModel.volatilities[id]) / totalInverseVol;
    });    return this.applyConstraints(weights, constraints);
  }

  // 構建優化後的投資組合
  constructOptimizedPortfolio(weights, investmentUniverse, budget) {
    const holdings = [];    for (const investment of investmentUniverse) {      const weight = weights[investment.id] || 0;      if (weight > 0.001) { // 忽略極小權重        const value = budget * weight;        const quantity = Math.floor(value / investment.currentPrice);        holdings.push({          id: investment.id,          name: investment.name,          type: investment.type,          currentPrice: investment.currentPrice,          quantity,          value: quantity * investment.currentPrice,          weight,          expectedReturn: investment.expectedReturn || 0,          risk: investment.risk || 0,        });      }
    }    // 剩餘資金作為現金
    const investedAmount = holdings.reduce((sum, holding) => sum + holding.value, 0);
    const cashAmount = budget - investedAmount;    if (cashAmount > 0) {      holdings.push({        id: 'cash',        name: '現金',        type: 'cash',        quantity: 1,        value: cashAmount,        weight: cashAmount / budget,        expectedReturn: 0.02, // 假設現金收益率2%        risk: 0,      });
    }    return {      totalValue: budget,      holdings,      allocation: this.calculateAllocation(holdings),      metrics: this.calculatePortfolioMetrics(holdings),
    };
  }

  // 生成再平衡計劃
  generateRebalancingPlan(currentPortfolio, targetPortfolio, transactionCosts, frequency) {
    const trades = [];
    const currentHoldings = this.createHoldingsMap(currentPortfolio.holdings);
    const targetHoldings = this.createHoldingsMap(targetPortfolio.holdings);    // 計算需要的交易
    const allAssets = new Set([      ...Object.keys(currentHoldings),      ...Object.keys(targetHoldings),
    ]);    for (const assetId of allAssets) {      const currentWeight = currentHoldings[assetId]?.weight || 0;      const targetWeight = targetHoldings[assetId]?.weight || 0;      const weightDiff = targetWeight - currentWeight;      if (Math.abs(weightDiff) > 0.01) { // 只有超過1%的差異才交易        trades.push({          assetId,          action: weightDiff > 0 ? 'buy' : 'sell',          currentWeight,          targetWeight,          weightChange: weightDiff,          estimatedCost: this.estimateTradeCost(assetId, Math.abs(weightDiff), transactionCosts),        });      }
    }    return {      trades,      totalCost: trades.reduce((sum, trade) => sum + trade.estimatedCost, 0),      frequency,      nextRebalanceDate: this.calculateNextRebalanceDate(frequency),      triggers: this.setupRebalanceTriggers(targetPortfolio),
    };
  }

  // 回測投資組合
  async backtestPortfolio(portfolio, timeHorizon) {
    const backTestPeriods = this.getBacktestPeriods(timeHorizon);
    const results = [];    for (const period of backTestPeriods) {      const periodReturn = await this.calculatePeriodReturn(portfolio, period);      const periodRisk = await this.calculatePeriodRisk(portfolio, period);      const benchmark = await this.getBenchmarkReturn(period);      results.push({        period: period.name,        return: periodReturn,        risk: periodRisk,        sharpeRatio: (periodReturn - 0.02) / periodRisk, // 假設無風險利率2%        benchmark: benchmark,        alpha: periodReturn - benchmark,        maxDrawdown: await this.calculateMaxDrawdown(portfolio, period),      });
    }    return {      periods: results,      overallMetrics: this.calculateOverallBacktestMetrics(results),      riskMetrics: this.calculateBacktestRiskMetrics(results),      performance: this.analyzeBacktestPerformance(results),
    };
  }

  // 輔助方法
  calculateAllocation(holdings) {
    const allocation = {      byType: {},      byRisk: { low: 0, medium: 0, high: 0 },      byLiquidity: { high: 0, medium: 0, low: 0 },      cash: 0,
    };    holdings.forEach(holding => {      // 按類型分配      allocation.byType[holding.type] = (allocation.byType[holding.type] || 0) + holding.weight;      // 按風險分配      const riskLevel = this.categorizeRisk(holding.risk || 0);      allocation.byRisk[riskLevel] += holding.weight;      // 按流動性分配      const liquidityLevel = this.categorizeLiquidity(holding);      allocation.byLiquidity[liquidityLevel] += holding.weight;      // 現金比例      if (holding.type === 'cash') {        allocation.cash += holding.weight;      }
    });    return allocation;
  }

  calculatePortfolioRisk(holdings) {
    // 簡化的風險計算
    const weightedRisk = holdings.reduce((sum, holding) => {      return sum + (holding.weight * (holding.risk || 0));
    }, 0);    return Math.min(1, weightedRisk);
  }

  calculateDiversification(holdings) {
    // 赫芬達爾指數的逆數作為分散化指標
    const herfindahl = holdings.reduce((sum, holding) => {      return sum + Math.pow(holding.weight, 2);
    }, 0);    return 1 / herfindahl / holdings.length;
  }

  normalizeWeights(weights) {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const normalized = {};    for (const [id, weight] of Object.entries(weights)) {      normalized[id] = weight / total;
    }    return normalized;
  }

  applyConstraints(weights, constraints) {
    const adjustedWeights = { ...weights };    // 應用單一投資最大比例約束
    for (const [id, weight] of Object.entries(adjustedWeights)) {      if (weight > constraints.maxSinglePosition) {        adjustedWeights[id] = constraints.maxSinglePosition;      }
    }    // 重新歸一化
    return this.normalizeWeights(adjustedWeights);
  }

  createHoldingsMap(holdings) {
    return holdings.reduce((map, holding) => {      map[holding.id] = holding;      return map;
    }, {});
  }

  categorizeRisk(riskScore) {
    if (riskScore < 0.3) {
      return 'low';
    }
    if (riskScore < 0.6) {
      return 'medium';
    }
    return 'high';
  }

  categorizeLiquidity(holding) {
    if (holding.type === 'cash') {
      return 'high';
    }
    // 基於交易量等因素判斷流動性
    return 'medium'; // 簡化處理
  }

  // 模擬數據方法
  async calculateHistoricalReturn(investment, timeHorizon) {
    // 模擬歷史收益率計算
    return 0.05 + Math.random() * 0.15; // 5-20%
  }

  async calculateVolatility(investment, timeHorizon) {
    // 模擬波動率計算
    return 0.1 + Math.random() * 0.3; // 10-40%
  }

  calculateGradient(weights, expectedReturns, riskModel, objectives) {
    // 簡化的梯度計算
    const gradient = {};
    for (const id of Object.keys(weights)) {      gradient[id] = (Math.random() - 0.5) * 0.01;
    }
    return gradient;
  }

  updateWeights(weights, gradient, constraints) {
    const learningRate = 0.01;
    const updated = {};    for (const [id, weight] of Object.entries(weights)) {      updated[id] = Math.max(0, weight - learningRate * gradient[id]);
    }    return this.normalizeWeights(updated);
  }

  hasConverged(gradient) {
    const maxGradient = Math.max(...Object.values(gradient).map(Math.abs));
    return maxGradient < 0.001;
  }
}

export default new PortfolioOptimizer();
