const { logger } = require('../utils/logger');

class PricePredictionService {
  constructor() {
    this.marketData = new Map();
    this.predictionModels = new Map();
  }

  // 獲取價格預測
  async getPricePrediction(cardId, timeframe = '30d', confidence = 0.8) {
    try {
      logger.info(`開始價格預測: 卡片ID ${cardId}, 時間範圍 ${timeframe}`);
      
      // 模擬獲取市場數據
      const marketData = await this.getMarketData(cardId);
      
      // 模擬價格預測算法
      const prediction = this.calculatePrediction(marketData, timeframe, confidence);
      
      return {
        cardId,
        currentPrice: marketData.currentPrice,
        predictedPrice: prediction.predictedPrice,
        confidence: prediction.confidence,
        timeframe,
        factors: prediction.factors,
        trend: prediction.trend,
        volatility: prediction.volatility,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('價格預測服務錯誤:', error);
      throw new Error('價格預測服務暫時不可用');
    }
  }

  // 獲取歷史價格數據
  async getPriceHistory(cardId, days = 30) {
    try {
      logger.info(`獲取歷史價格: 卡片ID ${cardId}, 天數 ${days}`);
      
      const history = [];
      const now = new Date();
      
      // 模擬歷史數據生成
      for (let i = parseInt(days); i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const basePrice = 100 + Math.random() * 900;
        const volume = Math.floor(Math.random() * 100) + 1;
        const change = (Math.random() - 0.5) * 20;
        
        history.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(basePrice * 100) / 100,
          volume,
          change: Math.round(change * 100) / 100
        });
      }
      
      // 計算統計數據
      const prices = history.map(item => item.price);
      const summary = {
        averagePrice: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length * 100) / 100,
        highestPrice: Math.max(...prices),
        lowestPrice: Math.min(...prices),
        totalVolume: history.reduce((sum, item) => sum + item.volume, 0),
        priceChange: Math.round((prices[prices.length - 1] - prices[0]) * 100) / 100,
        priceChangePercent: Math.round(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 * 100) / 100
      };
      
      return {
        cardId,
        history,
        summary
      };
    } catch (error) {
      logger.error('歷史價格查詢錯誤:', error);
      throw new Error('歷史價格查詢失敗');
    }
  }

  // 獲取市場趨勢
  async getMarketTrends(category = 'all', timeframe = '7d') {
    try {
      logger.info(`獲取市場趨勢: 類別 ${category}, 時間範圍 ${timeframe}`);
      
      // 模擬市場趨勢分析
      const trends = {
        overall: {
          direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
          strength: Math.round((Math.random() * 0.5 + 0.5) * 100) / 100,
          confidence: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100
        },
        categories: {
          pokemon: {
            direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
            change: Math.round((Math.random() * 15 - 5) * 100) / 100
          },
          yugioh: {
            direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
            change: Math.round((Math.random() * 15 - 5) * 100) / 100
          },
          magic: {
            direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
            change: Math.round((Math.random() * 15 - 5) * 100) / 100
          }
        },
        topGainers: this.generateTopCards('gainers'),
        topLosers: this.generateTopCards('losers'),
        timestamp: new Date().toISOString()
      };
      
      return trends;
    } catch (error) {
      logger.error('市場趨勢分析錯誤:', error);
      throw new Error('市場趨勢分析失敗');
    }
  }

  // 批量價格預測
  async batchPricePrediction(cardIds, timeframe = '30d') {
    try {
      logger.info(`批量價格預測: ${cardIds.length} 張卡片`);
      
      const predictions = [];
      
      for (const cardId of cardIds) {
        const marketData = await this.getMarketData(cardId);
        const prediction = this.calculatePrediction(marketData, timeframe);
        
        predictions.push({
          cardId,
          currentPrice: marketData.currentPrice,
          predictedPrice: prediction.predictedPrice,
          confidence: prediction.confidence,
          timeframe,
          trend: prediction.trend,
          timestamp: new Date().toISOString()
        });
      }
      
      // 計算批量預測摘要
      const summary = {
        totalCards: predictions.length,
        averageConfidence: Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100) / 100,
        bullishCount: predictions.filter(p => p.trend === 'up').length,
        bearishCount: predictions.filter(p => p.trend === 'down').length,
        averagePriceChange: Math.round(predictions.reduce((sum, p) => sum + (p.predictedPrice - p.currentPrice), 0) / predictions.length * 100) / 100
      };
      
      return {
        predictions,
        summary
      };
    } catch (error) {
      logger.error('批量價格預測錯誤:', error);
      throw new Error('批量價格預測失敗');
    }
  }

  // 私有方法：獲取市場數據
  async getMarketData(cardId) {
    // 模擬從數據庫或外部API獲取市場數據
    return {
      cardId,
      currentPrice: Math.random() * 1000 + 50,
      marketCap: Math.random() * 1000000 + 100000,
      volume24h: Math.random() * 10000 + 1000,
      priceChange24h: (Math.random() - 0.5) * 20,
      supply: Math.random() * 10000 + 1000,
      demand: Math.random() * 10000 + 1000
    };
  }

  // 私有方法：計算預測
  calculatePrediction(marketData, timeframe, confidence = 0.8) {
    const basePrice = marketData.currentPrice;
    const volatility = Math.random() * 0.3 + 0.1;
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    
    // 根據時間範圍調整預測
    let timeMultiplier = 1;
    switch (timeframe) {
      case '7d':
        timeMultiplier = 0.25;
        break;
      case '30d':
        timeMultiplier = 1;
        break;
      case '90d':
        timeMultiplier = 2.5;
        break;
      case '1y':
        timeMultiplier = 10;
        break;
    }
    
    const priceChange = (Math.random() - 0.5) * 0.2 * timeMultiplier;
    const predictedPrice = basePrice * (1 + priceChange);
    
    return {
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
      factors: [
        '市場需求趨勢',
        '供應量變化',
        '競賽環境影響',
        '收藏價值評估',
        '經濟環境因素'
      ],
      trend,
      volatility: Math.round(volatility * 100) / 100
    };
  }

  // 私有方法：生成頂部卡片
  generateTopCards(type) {
    const cards = [
      { cardId: 'pokemon_001', name: '皮卡丘' },
      { cardId: 'yugioh_001', name: '青眼白龍' },
      { cardId: 'magic_001', name: '黑蓮花' },
      { cardId: 'pokemon_002', name: '妙蛙種子' },
      { cardId: 'yugioh_002', name: '真紅眼黑龍' },
      { cardId: 'magic_002', name: '閃電擊' }
    ];
    
    return cards.slice(0, 3).map(card => ({
      ...card,
      change: type === 'gainers' 
        ? Math.round((Math.random() * 30 + 10) * 100) / 100
        : Math.round((Math.random() * 20 + 5) * -100) / 100
    }));
  }

  // 更新預測模型
  async updatePredictionModel(cardId, newData) {
    try {
      logger.info(`更新預測模型: 卡片ID ${cardId}`);
      
      // 模擬模型更新邏輯
      const model = this.predictionModels.get(cardId) || {
        cardId,
        lastUpdated: new Date(),
        accuracy: 0.75,
        dataPoints: 0
      };
      
      model.lastUpdated = new Date();
      model.dataPoints += 1;
      model.accuracy = Math.min(0.95, model.accuracy + 0.01);
      
      this.predictionModels.set(cardId, model);
      
      return model;
    } catch (error) {
      logger.error('預測模型更新錯誤:', error);
      throw new Error('預測模型更新失敗');
    }
  }

  // 獲取預測準確性統計
  async getPredictionAccuracy(cardId) {
    try {
      const model = this.predictionModels.get(cardId);
      
      if (!model) {
        return {
          cardId,
          accuracy: 0.75,
          dataPoints: 0,
          lastUpdated: null,
          confidence: 'low'
        };
      }
      
      return {
        cardId,
        accuracy: model.accuracy,
        dataPoints: model.dataPoints,
        lastUpdated: model.lastUpdated,
        confidence: model.accuracy > 0.9 ? 'high' : model.accuracy > 0.8 ? 'medium' : 'low'
      };
    } catch (error) {
      logger.error('預測準確性查詢錯誤:', error);
      throw new Error('預測準確性查詢失敗');
    }
  }
}

module.exports = new PricePredictionService();
