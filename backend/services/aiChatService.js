const { logger } = require('../utils/logger');

class AIChatService {
  constructor() {
    this.conversationHistory = new Map();
    this.knowledgeBase = this.initializeKnowledgeBase();
    this.responseTemplates = this.initializeResponseTemplates();
  }

  // AI聊天對話
  async processChat(message, userId, context = [], chatType = 'general') {
    try {
      logger.info(`處理AI聊天: 用戶ID ${userId}, 聊天類型 ${chatType}`);
      
      // 分析用戶意圖
      const intent = this.analyzeIntent(message);
      
      // 生成回應
      const response = await this.generateResponse(message, intent, chatType, context);
      
      // 生成建議
      const suggestions = this.generateSuggestions(intent, chatType);
      
      // 保存對話歷史
      await this.saveConversation(userId, message, response, chatType);
      
      return {
        messageId: `msg_${Date.now()}`,
        response,
        confidence: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
        suggestions,
        intent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('AI聊天處理錯誤:', error);
      throw new Error('AI聊天服務暫時不可用');
    }
  }

  // 智能建議
  async getSuggestions(userId, context = {}, userBehavior = {}) {
    try {
      logger.info(`生成智能建議: 用戶ID ${userId}`);
      
      // 分析用戶行為和上下文
      const userProfile = await this.analyzeUserProfile(userId, userBehavior);
      
      // 生成個性化建議
      const personalizedSuggestions = this.generatePersonalizedSuggestions(userProfile, context);
      
      // 生成通用建議
      const generalSuggestions = this.generateGeneralSuggestions();
      
      return {
        suggestions: personalizedSuggestions.concat(generalSuggestions),
        userProfile,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('智能建議生成錯誤:', error);
      throw new Error('智能建議服務暫時不可用');
    }
  }

  // 知識庫查詢
  async searchKnowledge(query, category = 'all', limit = 10) {
    try {
      logger.info(`知識庫查詢: 查詢詞 ${query}, 類別 ${category}`);
      
      // 搜索知識庫
      let results = this.knowledgeBase;
      
      if (query) {
        results = this.knowledgeBase.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) || 
          item.content.toLowerCase().includes(query.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      // 根據類別過濾
      if (category !== 'all') {
        results = results.filter(item => item.category === category);
      }
      
      // 計算相關性分數
      results = results.map(item => ({
        ...item,
        relevance: this.calculateRelevance(item, query)
      }));
      
      // 按相關性排序並限制數量
      results = results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, parseInt(limit));
      
      return {
        results,
        total: results.length,
        query,
        category,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('知識庫查詢錯誤:', error);
      throw new Error('知識庫查詢失敗');
    }
  }

  // 獲取聊天歷史
  async getChatHistory(userId, limit = 20, offset = 0) {
    try {
      logger.info(`獲取聊天歷史: 用戶ID ${userId}`);
      
      const history = this.conversationHistory.get(userId) || [];
      const paginatedHistory = history
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .reverse();
      
      return {
        history: paginatedHistory,
        pagination: {
          total: history.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < history.length
        }
      };
    } catch (error) {
      logger.error('聊天歷史查詢錯誤:', error);
      throw new Error('歷史查詢失敗');
    }
  }

  // 獲取聊天統計
  async getChatStats(userId) {
    try {
      logger.info(`獲取聊天統計: 用戶ID ${userId}`);
      
      const history = this.conversationHistory.get(userId) || [];
      
      const stats = {
        totalConversations: history.length,
        totalMessages: history.length * 2, // 每段對話包含用戶消息和AI回應
        averageResponseTime: Math.round((Math.random() * 5 + 1) * 100) / 100,
        chatTypeDistribution: this.calculateChatTypeDistribution(history),
        satisfactionScore: Math.round((Math.random() * 2 + 3) * 100) / 100, // 3-5分
        monthlyTrend: this.generateMonthlyTrend(history)
      };
      
      return stats;
    } catch (error) {
      logger.error('聊天統計錯誤:', error);
      throw new Error('統計查詢失敗');
    }
  }

  // 處理反饋
  async processFeedback(userId, messageId, rating, feedback = '') {
    try {
      logger.info(`處理聊天反饋: 用戶ID ${userId}, 評分 ${rating}`);
      
      // 模擬反饋處理邏輯
      const feedbackResult = {
        id: `feedback_${Date.now()}`,
        userId,
        messageId,
        rating: parseInt(rating),
        feedback,
        timestamp: new Date().toISOString(),
        processed: true,
        improvement: this.generateImprovementSuggestion(rating, feedback)
      };
      
      // 更新用戶滿意度統計
      await this.updateUserSatisfaction(userId, rating);
      
      return feedbackResult;
    } catch (error) {
      logger.error('反饋處理錯誤:', error);
      throw new Error('反饋提交失敗');
    }
  }

  // 私有方法：初始化知識庫
  initializeKnowledgeBase() {
    return [
      {
        id: 'kb_001',
        title: '如何識別假卡',
        content: '假卡通常具有以下特徵：印刷模糊、顏色偏差、邊緣處理不當、全息圖案異常等。建議在專業光線下檢查，對比官方參考圖片，並檢查卡片編號和防偽標記。',
        category: 'authenticity',
        tags: ['真偽檢查', '假卡識別', '安全', '防偽'],
        relevance: 0.95
      },
      {
        id: 'kb_002',
        title: '價格預測方法',
        content: '價格預測需要考慮多個因素：市場需求趨勢、供應量變化、競賽環境影響、收藏價值評估、經濟環境因素等。建議關注市場動態和競賽環境變化。',
        category: 'price',
        tags: ['價格預測', '市場分析', '投資', '趨勢'],
        relevance: 0.88
      },
      {
        id: 'kb_003',
        title: '投資策略建議',
        content: '建議分散投資，不要將所有資金投入單一卡片。關注市場趨勢，定期評估投資組合，考慮個人風險承受能力。建議長期持有優質卡片。',
        category: 'investment',
        tags: ['投資策略', '風險管理', '組合', '長期投資'],
        relevance: 0.82
      },
      {
        id: 'kb_004',
        title: '卡片保存方法',
        content: '使用專業的卡片保護套，避免陽光直射和潮濕環境。保持適當的溫度和濕度，定期檢查卡片狀況。建議使用防潮箱保存珍貴卡片。',
        category: 'maintenance',
        tags: ['保存', '保護', '維護', '防潮'],
        relevance: 0.75
      },
      {
        id: 'kb_005',
        title: '市場趨勢分析',
        content: '市場趨勢分析包括技術分析和基本面分析。技術分析關注價格圖表和交易量，基本面分析關注卡片稀有度、競賽影響等因素。',
        category: 'price',
        tags: ['市場分析', '技術分析', '基本面', '趨勢'],
        relevance: 0.78
      }
    ];
  }

  // 私有方法：初始化回應模板
  initializeResponseTemplates() {
    return {
      general: [
        '您好！我是TCG助手，很高興為您服務。',
        '我可以幫助您了解卡片信息、價格預測和真偽檢查等問題。',
        '請告訴我您想了解什麼？',
        '有什麼我可以幫助您的嗎？'
      ],
      price: [
        '關於價格預測，我建議您查看最近的市場趨勢。',
        '該卡片的價格可能會受到競賽環境的影響。',
        '建議您關注市場供需變化。',
        '價格預測需要考慮多個因素，包括市場需求和供應量。'
      ],
      authenticity: [
        '真偽檢查需要仔細觀察卡片的印刷質量和顏色。',
        '建議在專業光線下進行檢查。',
        '可以對比官方參考圖片。',
        '檢查卡片編號和防偽標記很重要。'
      ],
      investment: [
        '投資建議需要考慮多個因素，包括市場趨勢和個人風險承受能力。',
        '建議分散投資，不要將所有資金投入單一卡片。',
        '定期關注市場動態和競賽環境變化。',
        '長期持有優質卡片通常是好的策略。'
      ]
    };
  }

  // 私有方法：分析用戶意圖
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('價格') || lowerMessage.includes('price') || lowerMessage.includes('多少錢')) {
      return 'price_inquiry';
    } else if (lowerMessage.includes('真偽') || lowerMessage.includes('authentic') || lowerMessage.includes('假卡')) {
      return 'authenticity_check';
    } else if (lowerMessage.includes('投資') || lowerMessage.includes('investment') || lowerMessage.includes('買賣')) {
      return 'investment_advice';
    } else if (lowerMessage.includes('保存') || lowerMessage.includes('維護') || lowerMessage.includes('保護')) {
      return 'maintenance_advice';
    } else if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'greeting';
    } else {
      return 'general_inquiry';
    }
  }

  // 私有方法：生成回應
  async generateResponse(message, intent, chatType, context) {
    const templates = this.responseTemplates[chatType] || this.responseTemplates.general;
    
    // 根據意圖選擇回應
    switch (intent) {
      case 'price_inquiry':
        return templates.price[Math.floor(Math.random() * templates.price.length)];
      case 'authenticity_check':
        return templates.authenticity[Math.floor(Math.random() * templates.authenticity.length)];
      case 'investment_advice':
        return templates.investment[Math.floor(Math.random() * templates.investment.length)];
      case 'greeting':
        return templates.general[0];
      default:
        return templates.general[Math.floor(Math.random() * templates.general.length)];
    }
  }

  // 私有方法：生成建議
  generateSuggestions(intent, chatType) {
    const suggestions = [
      '查看卡片詳細信息',
      '進行價格預測',
      '真偽檢查',
      '投資建議'
    ];
    
    // 根據意圖添加特定建議
    switch (intent) {
      case 'price_inquiry':
        suggestions.unshift('查看歷史價格');
        break;
      case 'authenticity_check':
        suggestions.unshift('上傳卡片圖片');
        break;
      case 'investment_advice':
        suggestions.unshift('查看市場趨勢');
        break;
    }
    
    return suggestions.slice(0, 4);
  }

  // 私有方法：保存對話
  async saveConversation(userId, message, response, chatType) {
    try {
      const history = this.conversationHistory.get(userId) || [];
      history.push({
        id: `conv_${Date.now()}`,
        message,
        response,
        chatType,
        timestamp: new Date().toISOString()
      });
      
      // 只保留最近100次對話
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      this.conversationHistory.set(userId, history);
    } catch (error) {
      logger.error('保存對話歷史錯誤:', error);
    }
  }

  // 私有方法：分析用戶檔案
  async analyzeUserProfile(userId, userBehavior) {
    // 模擬用戶檔案分析
    return {
      userId,
      interests: ['pokemon', 'price_analysis'],
      activityLevel: 'high',
      expertise: 'intermediate',
      preferences: {
        chatType: 'general',
        responseStyle: 'detailed'
      }
    };
  }

  // 私有方法：生成個性化建議
  generatePersonalizedSuggestions(userProfile, context) {
    return [
      {
        type: 'price_alert',
        title: '價格提醒',
        description: '您關注的卡片價格有變化',
        priority: 'high'
      },
      {
        type: 'investment_opportunity',
        title: '投資機會',
        description: '發現潛在的投資機會',
        priority: 'medium'
      },
      {
        type: 'market_trend',
        title: '市場趨勢',
        description: '相關卡片類別的市場趨勢分析',
        priority: 'low'
      }
    ];
  }

  // 私有方法：生成通用建議
  generateGeneralSuggestions() {
    return [
      {
        type: 'feature_introduction',
        title: '功能介紹',
        description: '了解新功能的使用方法',
        priority: 'medium'
      },
      {
        type: 'tips',
        title: '使用技巧',
        description: '提高使用效率的技巧',
        priority: 'low'
      }
    ];
  }

  // 私有方法：計算相關性
  calculateRelevance(item, query) {
    if (!query) return item.relevance;
    
    const queryWords = query.toLowerCase().split(' ');
    let score = 0;
    
    // 標題匹配
    queryWords.forEach(word => {
      if (item.title.toLowerCase().includes(word)) score += 0.3;
    });
    
    // 內容匹配
    queryWords.forEach(word => {
      if (item.content.toLowerCase().includes(word)) score += 0.2;
    });
    
    // 標籤匹配
    queryWords.forEach(word => {
      if (item.tags.some(tag => tag.toLowerCase().includes(word))) score += 0.1;
    });
    
    return Math.min(1.0, item.relevance + score);
  }

  // 私有方法：計算聊天類型分佈
  calculateChatTypeDistribution(history) {
    const distribution = {
      general: 0,
      price: 0,
      authenticity: 0,
      investment: 0
    };
    
    history.forEach(conv => {
      distribution[conv.chatType] = (distribution[conv.chatType] || 0) + 1;
    });
    
    return distribution;
  }

  // 私有方法：生成月度趨勢
  generateMonthlyTrend(history) {
    return [
      { month: '2024-01', conversations: 15, messages: 45 },
      { month: '2024-02', conversations: 18, messages: 52 },
      { month: '2024-03', conversations: 22, messages: 68 }
    ];
  }

  // 私有方法：生成改進建議
  generateImprovementSuggestion(rating, feedback) {
    if (rating >= 4) {
      return '感謝您的正面反饋！我們會繼續努力提供更好的服務。';
    } else if (rating >= 3) {
      return '我們會根據您的反饋改進服務質量。';
    } else {
      return '非常抱歉沒有達到您的期望，我們會認真分析並改進。';
    }
  }

  // 私有方法：更新用戶滿意度
  async updateUserSatisfaction(userId, rating) {
    // 模擬更新用戶滿意度統計
    logger.info(`更新用戶滿意度: 用戶ID ${userId}, 評分 ${rating}`);
  }
}

module.exports = new AIChatService();
