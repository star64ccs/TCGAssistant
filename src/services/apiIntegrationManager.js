
// API 整合管理器
class ApiIntegrationManager {
  constructor() {
    this.isRealApiEnabled = this.checkRealApiAvailability();
    this.fallbackToMock = false; // 移除mock回退
    this.retryConfig = {
      maxRetries: 3,
      delay: 1000,
    };
    this.cacheConfig = { duration: 5 * 60 * 1000 }; // 5分鐘
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.lastCheck = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }
  // 檢查真實API可用性
  checkRealApiAvailability() {
  // 檢查後端API是否可用
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

    // 在開發環境中，我們假設後端API可用
    return true;
  }
  // 檢查API連接狀態
  async checkConnection() {
    try {
      // 模擬API連接檢查
      const isConnected = true; // 暫時設為true，實際實現時會調用真實的API

      this.isConnected = isConnected;
      this.connectionStatus = isConnected ? 'connected' : 'disconnected';
      this.lastCheck = new Date();

      if (isConnected) {
        this.retryCount = 0;
      }
      return {
        isConnected,
        status: this.connectionStatus,
        lastCheck: this.lastCheck,
        baseUrl: this.backendUrl,
        config: this.apiConfig,
      };
    } catch (error) {
      this.isConnected = false;
      this.connectionStatus = 'error';
      return {
        isConnected: false,
        status: 'error',
        error: error.message,
        baseUrl: this.backendUrl,
        config: this.apiConfig,
      };
    }
  }
  // 重試連接
  async retryConnection() {
    if (this.retryCount >= this.maxRetries) {
      return false;
    }
    this.retryCount++;

    // 等待一段時間後重試
    await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));

    return await this.checkConnection();
  }
  // 獲取連接狀態
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      lastCheck: this.lastCheck,
      retryCount: this.retryCount,
      baseUrl: this.backendUrl,
      config: this.apiConfig,
    };
  }
  // 檢查API可用性
  checkApiAvailability() {
    // 模擬API可用性檢查
    const availability = {
      cardRecognition: true,
      priceQuery: true,
      aiAnalysis: true,
      auth: true,
      cardData: true,
      collection: true,
      userHistory: true,
    };
    return {
      ...availability,
      connection: this.getConnectionStatus(),
    };
  }
  // 初始化API集成
  async initialize() {
    // 檢查連接
    const connectionResult = await this.checkConnection();

    // 檢查API可用性
    const availability = this.checkApiAvailability();

    return {
      connection: connectionResult,
      availability,
      initialized: true,
    };
  }
  // 重置連接狀態
  reset() {
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.lastCheck = null;
    this.retryCount = 0;
  }
  // 通用API調用方法
  async callApi(apiType, method, params = {}, options = {}) {
    const {
      useCache = true,
      useRetry = true,
      fallbackToMock = this.fallbackToMock,
      onProgress = null,
    } = options;

    try {
      // 如果啟用了真實API，嘗試調用
      if (this.isRealApiEnabled) {
        try {
          const result = await this.callRealApi(apiType, method, params, options);
          if (result.success) {
            return result;
          }
        } catch (error) {
          console.error('真實API調用失敗:', error.message);
        }
      }
      // 如果真實API失敗，拋出錯誤
      throw new Error(`API調用失敗: ${apiType}.${method}`);
    } catch (error) {
      console.error('API調用錯誤:', error);
      throw error;
    }
  }
  // 調用真實API
  async callRealApi(apiType, method, params, options) {
    switch (apiType) {
      case 'auth':
        return await this.callRealAuth(method, params, options);
      case 'cardData':
        return await this.callRealCardData(method, params, options);
      case 'collection':
        return await this.callRealCollection(method, params, options);
      case 'userHistory':
        return await this.callRealUserHistory(method, params, options);
      default:
        throw new Error(`不支援的API類型: ${apiType}`);
    }
  }
  // 調用模擬API
  async callMockApi(apiType, method, params, options) {
  // 模擬網絡延遲
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    switch (apiType) {
      case 'auth':
        return await this.callMockAuth(method, params, options);
      case 'cardData':
        return await this.callMockCardData(method, params, options);
      case 'collection':
        return await this.callMockCollection(method, params, options);
      case 'userHistory':
        return await this.callMockUserHistory(method, params, options);
      default:
        throw new Error(`不支援的API類型: ${apiType}`);
    }
  }
  // 真實卡牌辨識
  async callRealCardRecognition(method, params, options) {
    try {
      // 模擬真實API調用
      const result = { success: true, data: { message: 'Card recognition successful' } };
      return result;
    } catch (error) {
      console.error('Real card recognition API error:', error);
      return { success: false, error: error.message };
    }
  }
  // 真實價格查詢
  async callRealPriceQuery(method, params, options) {
    try {
      // 模擬真實API調用
      const result = { success: true, data: { message: 'Price query successful' } };
      return result;
    } catch (error) {
      console.error('Real price query API error:', error);
      return { success: false, error: error.message };
    }
  }
  // 真實AI分析
  async callRealAiAnalysis(method, params, options) {
    try {
      // 模擬真實API調用
      const result = { success: true, data: { message: 'AI analysis successful' } };
      return result;
    } catch (error) {
      console.error('Real AI analysis API error:', error);
      return { success: false, error: error.message };
    }
  }
  // 真實用戶認證
  async callRealAuth(method, params, options) {
    try {
      // 模擬真實API調用
      const result = { success: true, data: { message: 'Auth successful' } };
      return result;
    } catch (error) {
      console.error('Real auth API error:', error);
      return { success: false, error: error.message };
    }
  }
  // 真實卡牌資料
  async callRealCardData(method, params, options) {
    try {
      // 模擬真實API調用
      const result = { success: true, data: { message: 'Card data successful' } };
      return result;
    } catch (error) {
      console.error('Real card data API error:', error);
      return { success: false, error: error.message };
    }
  }
  // 真實收藏管理
  async callRealCollection(method, params, options) {
    try {
      // 模擬真實API調用
      const result = { success: true, data: { message: 'Collection successful' } };
      return result;
    } catch (error) {
      console.error('Real collection API error:', error);
      return { success: false, error: error.message };
    }
  }
  // 真實用戶歷史
  async callRealUserHistory(method, params, options) {
    try {
      // 模擬真實API調用
      const result = { success: true, data: { message: 'User history successful' } };
      return result;
    } catch (error) {
      console.error('Real user history API error:', error);
      return { success: false, error: error.message };
    }
  }

  // 認證fallback數據
  getFallbackAuthData(method, params) {
    switch (method) {
      case 'login':
        return {
          success: true,
          data: {
            user: {
              id: Date.now(),
              email: params.email,
              name: params.email.split('@')[0],
              membership: 'free',
              createdAt: new Date().toISOString(),
            },
            accessToken: `fallback_token_${Date.now()}`,
            refreshToken: `fallback_refresh_${Date.now()}`,
          },
          apiUsed: 'FALLBACK',
          timestamp: new Date().toISOString(),
        };
      default:
        return { success: false, message: '認證失敗' };
    }
  }
  // 模擬卡牌資料
  callMockCardData(method, params, options) {
    switch (method) {
      case 'getPokemonCards':
        return {
          success: true,
          data: {
            cards: [
              {
                id: 1,
                name: '皮卡丘 V',
                series: 'Sword & Shield',
                number: '043/185',
                rarity: 'Ultra Rare',
                type: 'Lightning',
                hp: 200,
                imageUrl: 'https://images.pokemontcg.io/swsh4/43_hires.png',
              },
              {
                id: 2,
                name: '超夢 GX',
                series: 'Sun & Moon',
                number: '150/147',
                rarity: 'Ultra Rare',
                type: 'Psychic',
                hp: 180,
                imageUrl: 'https://images.pokemontcg.io/sm12/72_hires.png',
              },
            ],
            total: 2,
            page: params.page || 1,
            limit: params.limit || 10,
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      case 'getOnePieceCards':
        return {
          success: true,
          data: {
            cards: [
              {
                id: 3,
                name: '蒙奇·D·路飛',
                series: 'One Piece',
                number: 'ST01-001',
                rarity: 'Common',
                type: 'Leader',
                hp: 5000,
                imageUrl: 'https://onepiece-cardgame.com/images/cardlist/OP01-001.jpg',
              },
            ],
            total: 1,
            page: params.page || 1,
            limit: params.limit || 10,
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      case 'getAvailableCards':
        return {
          success: true,
          data: {
            cards: [
              {
                id: 1,
                name: '皮卡丘 V',
                series: 'Sword & Shield',
                number: '043/185',
                rarity: 'Ultra Rare',
                type: 'Lightning',
                hp: 200,
                imageUrl: 'https://images.pokemontcg.io/swsh4/43_hires.png',
              },
              {
                id: 2,
                name: '超夢 GX',
                series: 'Sun & Moon',
                number: '150/147',
                rarity: 'Ultra Rare',
                type: 'Psychic',
                hp: 180,
                imageUrl: 'https://images.pokemontcg.io/sm12/72_hires.png',
              },
              {
                id: 3,
                name: '蒙奇·D·路飛',
                series: 'One Piece',
                number: 'ST01-001',
                rarity: 'Common',
                type: 'Leader',
                hp: 5000,
                imageUrl: 'https://onepiece-cardgame.com/images/cardlist/OP01-001.jpg',
              },
            ],
            total: 3,
            page: params.page || 1,
            limit: params.limit || 10,
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      case 'getCardById':
        return {
          success: true,
          data: {
            card: {
              id: params.id,
              name: '皮卡丘 V',
              series: 'Sword & Shield',
              number: '043/185',
              rarity: 'Ultra Rare',
              type: 'Lightning',
              hp: 200,
              imageUrl: 'https://images.pokemontcg.io/swsh4/43_hires.png',
              description: '這是一張強大的皮卡丘V卡牌',
              attacks: [
                {
                  name: '電擊',
                  damage: '30',
                  cost: ['Lightning'],
                },
              ],
            },
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      default:
        throw new Error(`不支援的卡牌資料方法: ${method}`);
    }
  }
  // 模擬卡牌辨識
  callMockCardRecognition(method, params, options) {
    switch (method) {
      case 'recognize':
        return {
          success: true,
          data: {
            cardInfo: {
              name: '皮卡丘 V',
              series: 'Sword & Shield',
              number: '043/185',
              rarity: 'Ultra Rare',
              type: 'Lightning',
              hp: 200,
              confidence: 0.95,
            },
            rawData: {
              textAnnotations: ['皮卡丘 V', 'Sword & Shield', '043/185'],
              labelAnnotations: ['Pokemon', 'card', 'electric'],
            },
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      default:
        throw new Error(`不支援的卡牌辨識方法: ${method}`);
    }
  }
  // 模擬價格查詢
  callMockPriceQuery(method, params, options) {
    switch (method) {
      case 'getPrices':
        return {
          success: true,
          data: {
            platforms: {
              TCGPLAYER: 45.99,
              EBAY: 42.50,
              CARDMARKET: 38.75,
              PRICECHARTING: 44.25,
            },
            average: 42.87,
            median: 43.12,
            min: 38.75,
            max: 45.99,
            count: 4,
          },
          platformsUsed: ['TCGPLAYER', 'EBAY', 'CARDMARKET', 'PRICECHARTING'],
          timestamp: new Date().toISOString(),
        };
      case 'getPriceHistory':
        return {
          success: true,
          data: {
            history: [
              { date: '2024-01-01', price: 35.00,
              },
              { date: '2024-02-01', price: 38.50 },
              { date: '2024-03-01', price: 42.00 },
              { date: '2024-04-01', price: 42.87 },
            ],
            trend: 'up',
            changePercent: 22.5,
          },
        };
      case 'getMarketTrends':
        return {
          success: true,
          data: {
            trends: [
              { card: '皮卡丘 V', change: 22.5, trend: 'up',
              },
              { card: '路卡利歐 V', change: -5.2, trend: 'down' },
              { card: '噴火龍 V', change: 15.8, trend: 'up' },
            ],
            marketSentiment: 'bullish',
          },
        };
      default:
        throw new Error(`不支援的價格查詢方法: ${method}`);
    }
  }
  // 模擬AI分析
  callMockAiAnalysis(method, params, options) {
    switch (method) {
      case 'analyze':
        return {
          success: true,
          data: {
            response: '根據市場分析，這張皮卡丘 V 卡牌目前處於上升趨勢。建議持有或適時買入，但要注意市場波動風險。',
            model: 'gpt-4',
            usage: {
              prompt_tokens: 150,
              completion_tokens: 200,
              total_tokens: 350,
            },
          },
          modelUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      case 'getSuggestions':
        return {
          success: true,
          data: {
            suggestions: [
              '考慮在價格回調時買入',
              '關注相關卡牌的價格變動',
              '設置價格提醒',
              '查看歷史價格趨勢',
            ],
          },
        };
      default:
        throw new Error(`不支援的AI分析方法: ${method}`);
    }
  }
  // 模擬用戶認證
  callMockUserAuth(method, params, options) {
    switch (method) {
      case 'login':
        return {
          success: true,
          data: {
            user: {
              id: 'user_123',
              email: params.email,
              name: '測試用戶',
              membership: 'FREE',
            },
            token: 'mock_jwt_token_123',
            refreshToken: 'mock_refresh_token_123',
          },
        };
      case 'register':
        return {
          success: true,
          data: {
            user: {
              id: 'user_456',
              email: params.email,
              name: params.name,
              membership: 'FREE',
            },
            token: 'mock_jwt_token_456',
            refreshToken: 'mock_refresh_token_456',
          },
        };
      case 'socialLogin':
        return {
          success: true,
          data: {
            user: {
              id: 'user_789',
              email: params.email,
              name: params.name,
              membership: 'FREE',
              socialProvider: params.provider,
            },
            token: 'mock_jwt_token_789',
            refreshToken: 'mock_refresh_token_789',
          },
        };
      default:
        throw new Error(`不支援的用戶認證方法: ${method}`);
    }
  }
  // 模擬收藏管理
  callMockCollection(method, params, options) {
    switch (method) {
      case 'getCollection':
        return {
          success: true,
          data: {
            cards: [
              {
                id: 'card_1',
                name: '皮卡丘 V',
                series: 'Sword & Shield',
                number: '043/185',
                rarity: 'Ultra Rare',
                addedDate: '2024-01-15',
                estimatedValue: 42.87,
              },
              {
                id: 'card_2',
                name: '路卡利歐 V',
                series: 'Sword & Shield',
                number: '156/185',
                rarity: 'Ultra Rare',
                addedDate: '2024-02-20',
                estimatedValue: 28.50,
              },
            ],
            totalValue: 71.37,
            totalCards: 2,
          },
        };
      case 'addToCollection':
        return {
          success: true,
          data: {
            message: '卡牌已成功添加到收藏',
            cardId: 'card_3',
          },
        };
      case 'removeFromCollection':
        return {
          success: true,
          data: {
            message: '卡牌已從收藏中移除',
          },
        };
      case 'getStats':
        return {
          success: true,
          data: {
            totalCards: 2,
            totalValue: 71.37,
            averageValue: 35.69,
            mostValuable: '皮卡丘 V',
            recentAdditions: 1,
          },
        };
      default:
        throw new Error(`不支援的收藏管理方法: ${method}`);
    }
  }
  // 模擬用戶歷史
  callMockUserHistory(method, params, options) {
    switch (method) {
      case 'getRecentHistory':
        return {
          success: true,
          data: {
            history: [
              {
                id: 1,
                type: 'card_recognition',
                cardName: '皮卡丘 V',
                cardImage: 'https://images.pokemontcg.io/swsh4/43_hires.png',
                timestamp: new Date().toISOString(),
                details: {
                  confidence: 0.95,
                  series: 'Sword & Shield',
                },
              },
              {
                id: 2,
                type: 'price_query',
                cardName: '超夢 GX',
                cardImage: 'https://images.pokemontcg.io/sm12/72_hires.png',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                details: {
                  averagePrice: 45.99,
                  platforms: ['TCGPLAYER', 'EBAY'],
                },
              },
            ],
            total: 2,
            page: params.page || 1,
            limit: params.limit || 10,
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      case 'getAllHistory':
        return {
          success: true,
          data: {
            history: [
              {
                id: 1,
                type: 'card_recognition',
                cardName: '皮卡丘 V',
                cardImage: 'https://images.pokemontcg.io/swsh4/43_hires.png',
                timestamp: new Date().toISOString(),
                details: {
                  confidence: 0.95,
                  series: 'Sword & Shield',
                },
              },
              {
                id: 2,
                type: 'price_query',
                cardName: '超夢 GX',
                cardImage: 'https://images.pokemontcg.io/sm12/72_hires.png',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                details: {
                  averagePrice: 45.99,
                  platforms: ['TCGPLAYER', 'EBAY'],
                },
              },
              {
                id: 3,
                type: 'ai_analysis',
                cardName: '蒙奇·D·路飛',
                cardImage: 'https://onepiece-cardgame.com/images/cardlist/OP01-001.jpg',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                details: {
                  analysisType: 'investment_advice',
                  confidence: 0.87,
                },
              },
            ],
            total: 3,
            page: params.page || 1,
            limit: params.limit || 10,
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      case 'getHistoryStats':
        return {
          success: true,
          data: {
            totalRecords: 3,
            byType: {
              card_recognition: 1,
              price_query: 1,
              ai_analysis: 1,
            },
            byDate: {
              today: 1,
              thisWeek: 2,
              thisMonth: 3,
            },
            mostViewedCards: [
              {
                cardName: '皮卡丘 V',
                viewCount: 5,
              },
              {
                cardName: '超夢 GX',
                viewCount: 3,
              },
            ],
          },
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      case 'clearHistory':
        return {
          success: true,
          message: '歷史記錄已清空',
          apiUsed: 'MOCK',
          timestamp: new Date().toISOString(),
        };
      default:
        throw new Error(`不支援的用戶歷史方法: ${method}`);
    }
  }
  // 真實價格歷史API
  async getRealPriceHistory(params) {
    const { cardId, period = '1y' } = params;

    try {
      // 模擬真實API調用
      const result = {
        success: true,
        data: { message: 'Price history successful' },
        apiUsed: 'REAL',
        timestamp: new Date().toISOString(),
      };
      return result;
    } catch (error) {
      // Fallback到數據庫查詢
      try {
        const dbResult = await this.queryPriceHistoryFromDatabase(cardId, period);
        return {
          success: true,
          data: dbResult,
          apiUsed: 'DATABASE',
          timestamp: new Date().toISOString(),
        };
      } catch (dbError) {
        throw new Error('無法獲取價格歷史數據');
      }
    }
  }
  async getRealMarketTrends(params) {
    try {
      // 模擬真實API調用
      const result = {
        success: true,
        data: { message: 'Market trends successful' },
        apiUsed: 'REAL',
        timestamp: new Date().toISOString(),
      };
      return result;
    } catch (error) {
      // Fallback到本地算法分析
      try {
        const localAnalysis = await this.analyzeMarketTrendsLocally(params);
        return {
          success: true,
          data: localAnalysis,
          apiUsed: 'LOCAL_ANALYSIS',
          timestamp: new Date().toISOString(),
        };
      } catch (localError) {
        throw new Error('無法獲取市場趨勢數據');
      }
    }
  }
  async getRealAiSuggestions(params) {
    try {
      // 模擬真實API調用
      const result = {
        success: true,
        data: { message: 'AI suggestions successful' },
        apiUsed: 'REAL_AI',
        timestamp: new Date().toISOString(),
      };
      return result;
    } catch (error) {
      // Fallback到本地智能分析
      try {
        const localSuggestions = await this.generateLocalAiSuggestions(params);
        return {
          success: true,
          data: localSuggestions,
          apiUsed: 'LOCAL_AI',
          timestamp: new Date().toISOString(),
        };
      } catch (localError) {
        throw new Error('無法生成AI建議');
      }
    }
  }
  async handleRealSocialLogin(params) {
    const { provider, token, userInfo } = params;

    // 模擬真實API調用
    return {
      success: true,
      data: { message: 'Social login successful' },
      apiUsed: 'REAL',
      timestamp: new Date().toISOString(),
    };
  }
  // Fallback方法實現
  async queryPriceHistoryFromDatabase(cardId, period) {
    // 從本地數據庫查詢價格歷史
    const databaseService = require('./databaseService');
    const endDate = new Date();
    const startDate = new Date();

    // 根據period計算開始日期
    switch (period) {
      case '1m':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
      default:
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    return await databaseService.getPriceHistory(cardId, startDate, endDate);
  }
  async analyzeMarketTrendsLocally(params) {
    // 使用本地算法分析市場趨勢
    const marketTrendAnalyzer = require('./marketTrendAnalyzer');
    return await marketTrendAnalyzer.analyzeTrends(params);
  }
  async generateLocalAiSuggestions(params) {
    // 使用本地智能算法生成建議
    const intelligentInvestmentAdvisor = require('./intelligentInvestmentAdvisor');
    const suggestions = await intelligentInvestmentAdvisor.generateBasicSuggestions({
      cardInfo: params.cardInfo,
      userProfile: params.userProfile,
    });

    return {
      suggestions: suggestions.map(s => s.text || s.message || s),
      confidence: 0.7, // 本地算法置信度較低
      source: 'local_algorithm',
    };
  }
  // 模擬分析歷史
  callMockAnalysisHistory(method, params, options) {
    switch (method) {
      case 'getHistory':
        return {
          success: true,
          data: {
            history: [
              {
                id: '1',
                type: 'cardRecognition',
                cardName: '皮卡丘 VMAX',
                timestamp: '2024-01-15T10:30:00Z',
                result: '成功識別',
                confidence: 95,
              },
              {
                id: '2',
                type: 'pricePrediction',
                cardName: '路飛 四檔',
                timestamp: '2024-01-14T15:45:00Z',
                result: '預測完成',
                confidence: 88,
              },
            ],
            total: 2,
            page: 1,
            limit: 10,
          },
        };
      default:
        throw new Error(`不支援的分析歷史方法: ${method}`);
    }
  }
  // 模擬分析統計
  callMockAnalysisStats(method, params, options) {
    switch (method) {
      case 'getStats':
        return {
          success: true,
          data: {
            stats: {
              totalAnalyses: 150,
              successRate: 94.5,
              averageConfidence: 87.2,
              mostAnalyzedCard: '皮卡丘 VMAX',
              analysisTypes: {
                cardRecognition: 80,
                pricePrediction: 45,
                centeringEvaluation: 15,
                authenticityCheck: 10,
              },
              timeRange: 'last_30_days',
            },
          },
        };
      default:
        throw new Error(`不支援的分析統計方法: ${method}`);
    }
  }
  // 模擬分析工具
  callMockAnalysisTools(method, params, options) {
    switch (method) {
      case 'getTools':
        return {
          success: true,
          data: {
            tools: [
              {
                id: 'card_recognition',
                name: '卡牌辨識',
                description: 'AI智能辨識卡牌信息',
                status: 'active',
                accuracy: 95.2,
                supportedFormats: ['jpg', 'png', 'jpeg'],
              },
              {
                id: 'price_prediction',
                name: '價格預測',
                description: 'AI預測卡牌未來價格趨勢',
                status: 'active',
                accuracy: 87.8,
                supportedTimeframes: ['1m', '3m', '6m', '1y'],
              },
              {
                id: 'centering_evaluation',
                name: '置中評估',
                description: '精確評估卡牌置中程度',
                status: 'active',
                accuracy: 92.1,
                supportedGrades: ['perfect', 'good', 'average', 'poor'],
              },
              {
                id: 'authenticity_check',
                name: '真偽判斷',
                description: 'AI檢測卡牌真偽',
                status: 'active',
                accuracy: 96.5,
                supportedFeatures: ['hologram', 'watermark', 'uv_pattern'],
              },
            ],
          },
        };
      default:
        throw new Error(`不支援的分析工具方法: ${method}`);
    }
  }
  // 配置方法
  setRealApiEnabled(enabled) {
    this.isRealApiEnabled = enabled;
  }

  setFallbackToMock(enabled) {
    this.fallbackToMock = false; // 強制禁用mock回退
  }

  setRetryConfig(config) {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  setCacheConfig(config) {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  // 獲取API狀態
  getApiStatus() {
    return {
      realApiEnabled: this.isRealApiEnabled,
      fallbackToMock: this.fallbackToMock,
      retryConfig: this.retryConfig,
      cacheConfig: this.cacheConfig,
      environment: process.env.REACT_APP_ENVIRONMENT,
      debugMode: process.env.REACT_APP_DEBUG_MODE,
    };
  }

  // 清除快取
  clearCache() {
    // 清除API快取
    // 這裡可以添加清除其他快取的邏輯
  }
}

// 創建單例實例
const apiIntegrationManager = new ApiIntegrationManager();

export default apiIntegrationManager;
