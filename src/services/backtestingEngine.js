// 回測和策略驗證引擎
export class BacktestingEngine {
  constructor() {
    this.strategies = new Map();
    this.backtestResults = new Map();
    this.portfolioHistory = new Map();
    this.benchmarks = new Map();    // 回測配置
    this.defaultConfig = {      initialCapital: 100000,      commissionRate: 0.02, // 2% 交易費用      slippageRate: 0.005, // 0.5% 滑點      rebalanceFrequency: 'monthly',      benchmarkIndex: 'tcg_market_index',
    };    // 風險指標配置
    this.riskMetrics = {      riskFreeRate: 0.02, // 無風險利率 2%      confidenceLevel: 0.05, // 95% 置信度      lookbackPeriod: 252, // 1年工作日
    };
  }

  // 主要回測方法
  async runBacktest(strategy, timeRange, options = {}) {
    try {      const {        initialCapital = this.defaultConfig.initialCapital,        benchmark = this.defaultConfig.benchmarkIndex,        includeTransaction = true,        includeRiskMetrics = true,        includeDrawdownAnalysis = true,        onProgress = null,      } = options;      onProgress && onProgress('開始回測分析...');      // 1. 準備歷史數據      const historicalData = await this.prepareHistoricalData(timeRange, strategy.universe);      // 2. 初始化投資組合      onProgress && onProgress('初始化投資組合...');      const portfolio = this.initializePortfolio(initialCapital, strategy);      // 3. 執行回測模擬      onProgress && onProgress('執行策略回測...');      const backtestResults = await this.simulateStrategy(        strategy,        historicalData,        portfolio,        options,      );        // 4. 計算基準比較      onProgress && onProgress('計算基準表現...');      const benchmarkResults = await this.calculateBenchmarkPerformance(        benchmark,        timeRange,        initialCapital,      );        // 5. 性能分析      onProgress && onProgress('分析投資性能...');      const performanceMetrics = this.calculatePerformanceMetrics(        backtestResults,        benchmarkResults,      );        // 6. 風險分析      let riskAnalysis = null;      if (includeRiskMetrics) {        onProgress && onProgress('分析風險指標...');        riskAnalysis = this.calculateRiskMetrics(backtestResults);      }      // 7. 回撤分析      let drawdownAnalysis = null;      if (includeDrawdownAnalysis) {        onProgress && onProgress('分析回撤風險...');        drawdownAnalysis = this.analyzeDrawdowns(backtestResults);      }      // 8. 交易分析      const tradeAnalysis = this.analyzeTradeActivity(backtestResults.trades);      // 9. 生成報告      const report = this.generateBacktestReport({        strategy,        backtestResults,        benchmarkResults,        performanceMetrics,        riskAnalysis,        drawdownAnalysis,        tradeAnalysis,        timeRange,      });      onProgress && onProgress('回測分析完成！');      return {        success: true,        backtest: {          strategy,          timeRange,          results: backtestResults,          benchmark: benchmarkResults,          performance: performanceMetrics,          risk: riskAnalysis,          drawdown: drawdownAnalysis,          trades: tradeAnalysis,          report,        },        timestamp: new Date().toISOString(),      };
    } catch (error) {      return {        success: false,        error: error.message,        timestamp: new Date().toISOString(),      };
    }
  }

  // 準備歷史數據
  async prepareHistoricalData(timeRange, universe) {
    const data = new Map();    for (const asset of universe) {      const assetData = await this.getAssetHistoricalData(asset, timeRange);      data.set(asset.id, assetData);
    }    // 添加市場數據
    const marketData = await this.getMarketData(timeRange);
    data.set('market', marketData);    return data;
  }

  // 初始化投資組合
  initializePortfolio(initialCapital, strategy) {
    return {      cash: initialCapital,      holdings: new Map(),      totalValue: initialCapital,      history: [],      trades: [],      rebalanceDates: [],      strategy: strategy.name,
    };
  }

  // 策略模擬
  async simulateStrategy(strategy, historicalData, portfolio, options) {
    const { includeTransaction } = options;
    const tradingDays = this.getTradingDays(historicalData);    for (const date of tradingDays) {      // 更新投資組合市值      this.updatePortfolioValue(portfolio, historicalData, date);      // 檢查再平衡條件      if (this.shouldRebalance(date, strategy.rebalanceFrequency, portfolio.rebalanceDates)) {        // 生成投資信號        const signals = await this.generateInvestmentSignals(          strategy,          historicalData,          date,          portfolio,        );          // 執行交易        if (signals.length > 0) {          await this.executeTrades(            portfolio,            signals,            historicalData,            date,            includeTransaction,          );          portfolio.rebalanceDates.push(date);        }      }      // 記錄投資組合狀態      this.recordPortfolioSnapshot(portfolio, date);
    }    return portfolio;
  }

  // 生成投資信號
  async generateInvestmentSignals(strategy, historicalData, date, portfolio) {
    const signals = [];    // 根據策略類型生成不同的信號
    switch (strategy.type) {
      case 'momentum':        signals.push(...this.generateMomentumSignals(historicalData, date, strategy));        break;
      case 'meanReversion':        signals.push(...this.generateMeanReversionSignals(historicalData, date, strategy));        break;
      case 'buyAndHold':        signals.push(...this.generateBuyAndHoldSignals(historicalData, date, strategy));        break;
      case 'smartBeta':        signals.push(...this.generateSmartBetaSignals(historicalData, date, strategy));        break;
      default:        signals.push(...this.generateDefaultSignals(historicalData, date, strategy));
    }    // 應用風險管理規則
    return this.applyRiskManagement(signals, portfolio, strategy);
  }

  // 動量策略信號
  generateMomentumSignals(historicalData, date, strategy) {
    const signals = [];
    const lookback = strategy.parameters?.lookback || 20;    for (const [assetId, data] of historicalData.entries()) {      if (assetId === 'market') {
        continue;
      }      const priceData = this.getPriceDataUpToDate(data, date);      if (priceData.length < lookback) {
        continue;
      }      const momentum = this.calculateMomentum(priceData, lookback);      const threshold = strategy.parameters?.threshold || 0.05;      if (momentum > threshold) {        signals.push({          assetId,          action: 'buy',          signal: momentum,          reason: `動量信號: ${(momentum * 100).toFixed(2)}%`,          date,        });      } else if (momentum < -threshold) {        signals.push({          assetId,          action: 'sell',          signal: momentum,          reason: `負動量信號: ${(momentum * 100).toFixed(2)}%`,          date,        });      }
    }    return signals;
  }

  // 均值回歸策略信號
  generateMeanReversionSignals(historicalData, date, strategy) {
    const signals = [];
    const lookback = strategy.parameters?.lookback || 30;
    const threshold = strategy.parameters?.threshold || 2; // 標準差倍數    for (const [assetId, data] of historicalData.entries()) {      if (assetId === 'market') {
        continue;
      }      const priceData = this.getPriceDataUpToDate(data, date);      if (priceData.length < lookback) {
        continue;
      }      const currentPrice = priceData[priceData.length - 1].price;      const mean = this.calculateMean(priceData.slice(-lookback).map(p => p.price));      const std = this.calculateStd(priceData.slice(-lookback).map(p => p.price));      const zScore = (currentPrice - mean) / std;      if (zScore > threshold) {        signals.push({          assetId,          action: 'sell',          signal: zScore,          reason: `超買信號: Z-Score ${zScore.toFixed(2)}`,          date,        });      } else if (zScore < -threshold) {        signals.push({          assetId,          action: 'buy',          signal: zScore,          reason: `超賣信號: Z-Score ${zScore.toFixed(2)}`,          date,        });      }
    }    return signals;
  }

  // 執行交易
  async executeTrades(portfolio, signals, historicalData, date, includeTransaction) {
    for (const signal of signals) {      const assetData = historicalData.get(signal.assetId);      const currentPrice = this.getCurrentPrice(assetData, date);      if (!currentPrice) {
        continue;
      }      const trade = {        date,        assetId: signal.assetId,        action: signal.action,        price: currentPrice,        signal: signal.signal,        reason: signal.reason,      };      if (signal.action === 'buy') {        this.executeBuyOrder(portfolio, trade, includeTransaction);      } else if (signal.action === 'sell') {        this.executeSellOrder(portfolio, trade, includeTransaction);      }      portfolio.trades.push(trade);
    }
  }

  // 執行買入訂單
  executeBuyOrder(portfolio, trade, includeTransaction) {
    const targetValue = portfolio.totalValue * 0.1; // 假設每次買入10%
    const commission = includeTransaction ? targetValue * this.defaultConfig.commissionRate : 0;
    const slippage = includeTransaction ? targetValue * this.defaultConfig.slippageRate : 0;
    const totalCost = targetValue + commission + slippage;    if (portfolio.cash >= totalCost) {      const quantity = Math.floor(targetValue / trade.price);      const actualCost = quantity * trade.price + commission + slippage;      portfolio.cash -= actualCost;      const currentHolding = portfolio.holdings.get(trade.assetId) || { quantity: 0, avgPrice: 0 };      const newQuantity = currentHolding.quantity + quantity;      const newAvgPrice = ((currentHolding.quantity * currentHolding.avgPrice) + (quantity * trade.price)) / newQuantity;      portfolio.holdings.set(trade.assetId, {        quantity: newQuantity,        avgPrice: newAvgPrice,      });      trade.quantity = quantity;      trade.commission = commission;      trade.slippage = slippage;      trade.actualCost = actualCost;
    }
  }

  // 執行賣出訂單
  executeSellOrder(portfolio, trade, includeTransaction) {
    const holding = portfolio.holdings.get(trade.assetId);
    if (!holding || holding.quantity <= 0) {
      return;
    }    const quantity = Math.min(holding.quantity, Math.floor(holding.quantity * 0.5)); // 賣出一半
    const grossProceeds = quantity * trade.price;
    const commission = includeTransaction ? grossProceeds * this.defaultConfig.commissionRate : 0;
    const slippage = includeTransaction ? grossProceeds * this.defaultConfig.slippageRate : 0;
    const netProceeds = grossProceeds - commission - slippage;    portfolio.cash += netProceeds;    const remainingQuantity = holding.quantity - quantity;
    if (remainingQuantity > 0) {      portfolio.holdings.set(trade.assetId, {        ...holding,        quantity: remainingQuantity,      });
    } else {      portfolio.holdings.delete(trade.assetId);
    }    trade.quantity = quantity;
    trade.commission = commission;
    trade.slippage = slippage;
    trade.netProceeds = netProceeds;
  }

  // 計算性能指標
  calculatePerformanceMetrics(backtestResults, benchmarkResults) {
    const portfolioReturns = this.calculateReturns(backtestResults.history);
    const benchmarkReturns = this.calculateReturns(benchmarkResults.history);    return {      totalReturn: this.calculateTotalReturn(portfolioReturns),      annualizedReturn: this.calculateAnnualizedReturn(portfolioReturns),      volatility: this.calculateVolatility(portfolioReturns),      sharpeRatio: this.calculateSharpeRatio(portfolioReturns),      maxDrawdown: this.calculateMaxDrawdown(backtestResults.history),      beta: this.calculateBeta(portfolioReturns, benchmarkReturns),      alpha: this.calculateAlpha(portfolioReturns, benchmarkReturns),      informationRatio: this.calculateInformationRatio(portfolioReturns, benchmarkReturns),      calmarRatio: this.calculateCalmarRatio(portfolioReturns, backtestResults.history),      winRate: this.calculateWinRate(backtestResults.trades),      profitFactor: this.calculateProfitFactor(backtestResults.trades),
    };
  }

  // 風險指標計算
  calculateRiskMetrics(backtestResults) {
    const returns = this.calculateReturns(backtestResults.history);    return {      var95: this.calculateVaR(returns, 0.05),      var99: this.calculateVaR(returns, 0.01),      cvar95: this.calculateCVaR(returns, 0.05),      skewness: this.calculateSkewness(returns),      kurtosis: this.calculateKurtosis(returns),      downside: this.calculateDownsideDeviation(returns),      sortinoRatio: this.calculateSortinoRatio(returns),      tailRatio: this.calculateTailRatio(returns),      stabilityRatio: this.calculateStabilityRatio(returns),
    };
  }

  // 回撤分析
  analyzeDrawdowns(backtestResults) {
    const equity = backtestResults.history.map(h => h.totalValue);
    const drawdowns = this.calculateDrawdownSeries(equity);    const drawdownPeriods = this.identifyDrawdownPeriods(drawdowns, backtestResults.history);    return {      maxDrawdown: Math.min(...drawdowns),      averageDrawdown: this.calculateMean(drawdowns.filter(d => d < 0)),      drawdownDuration: this.calculateMaxDrawdownDuration(drawdowns),      recoveryTime: this.calculateAverageRecoveryTime(drawdownPeriods),      drawdownFrequency: drawdownPeriods.length,      worstDrawdowns: this.getWorstDrawdowns(drawdownPeriods, 5),      underWaterChart: this.createUnderWaterChart(drawdowns, backtestResults.history),
    };
  }

  // 輔助計算方法
  calculateMean(array) {
    return array.length > 0 ? array.reduce((sum, val) => sum + val, 0) / array.length : 0;
  }

  calculateStd(array) {
    const mean = this.calculateMean(array);
    const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
  }

  calculateMomentum(priceData, lookback) {
    if (priceData.length < lookback) {
      return 0;
    }    const currentPrice = priceData[priceData.length - 1].price;
    const pastPrice = priceData[priceData.length - lookback].price;    return (currentPrice - pastPrice) / pastPrice;
  }

  calculateSharpeRatio(returns) {
    const excessReturns = returns.map(r => r - this.riskMetrics.riskFreeRate / 252);
    const meanExcess = this.calculateMean(excessReturns);
    const stdExcess = this.calculateStd(excessReturns);    return stdExcess > 0 ? (meanExcess * Math.sqrt(252)) / (stdExcess * Math.sqrt(252)) : 0;
  }

  calculateMaxDrawdown(history) {
    const values = history.map(h => h.totalValue);
    let maxDrawdown = 0;
    let peak = values[0];    for (const value of values) {      if (value > peak) {        peak = value;      }      const drawdown = (peak - value) / peak;      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }    return maxDrawdown;
  }

  // 模擬數據方法
  async getAssetHistoricalData(asset, timeRange) {
    const data = [];
    const { startDate, endDate } = timeRange;
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));    let basePrice = asset.currentPrice || 1000;    for (let i = 0; i < days; i++) {      const date = new Date(startDate);      date.setDate(date.getDate() + i);      // 模擬價格變化      const volatility = 0.02;      const drift = 0.0005; // 每日漂移      const change = drift + (Math.random() - 0.5) * volatility;      basePrice *= (1 + change);      data.push({        date: date.toISOString().split('T')[0],        price: Math.round(basePrice),        volume: Math.floor(50 + Math.random() * 100),      });
    }    return data;
  }

  getTradingDays(historicalData) {
    // 獲取所有交易日
    const marketData = historicalData.get('market');
    return marketData ? marketData.map(d => d.date) : [];
  }

  shouldRebalance(date, frequency, lastRebalanceDates) {
    if (lastRebalanceDates.length === 0) {
      return true;
    }    const lastRebalance = new Date(lastRebalanceDates[lastRebalanceDates.length - 1]);
    const currentDate = new Date(date);    switch (frequency) {
      case 'daily':        return true;
      case 'weekly':        return (currentDate - lastRebalance) >= 7 * 24 * 60 * 60 * 1000;
      case 'monthly':        return currentDate.getMonth() !== lastRebalance.getMonth();
      case 'quarterly':        return Math.floor(currentDate.getMonth() / 3) !== Math.floor(lastRebalance.getMonth() / 3);
      default:        return false;
    }
  }

  updatePortfolioValue(portfolio, historicalData, date) {
    let totalValue = portfolio.cash;    for (const [assetId, holding] of portfolio.holdings.entries()) {      const assetData = historicalData.get(assetId);      const currentPrice = this.getCurrentPrice(assetData, date);      if (currentPrice) {        totalValue += holding.quantity * currentPrice;      }
    }    portfolio.totalValue = totalValue;
  }

  getCurrentPrice(assetData, date) {
    const dayData = assetData.find(d => d.date === date);
    return dayData ? dayData.price : null;
  }

  recordPortfolioSnapshot(portfolio, date) {
    portfolio.history.push({      date,      totalValue: portfolio.totalValue,      cash: portfolio.cash,      holdings: new Map(portfolio.holdings),
    });
  }
}

export default new BacktestingEngine();
