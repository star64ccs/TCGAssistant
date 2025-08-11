import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAiConfig } from '../config/unifiedConfig';

// 導入必要的模組
import { getApiConfig } from '../config/apiConfig';

// AI 聊天服務
class AIChatService {
  constructor() {
    this.conversationHistory = [];
    this.maxHistoryLength = 50;
    this.systemPrompt = `你是 TCG 助手 AI，專門幫助用戶分析和了解 Pokemon、One Piece 等 TCG 卡牌。你能夠：

1. 提供卡牌的詳細信息和背景
2. 分析卡牌的價格趨勢和投資價值
3. 評估卡牌的品相和置中度
4. 提供市場分析和投資建議
5. 回答關於 TCG 收藏的各種問題

請用專業但易懂的方式回答用戶的問題，並保持友好和樂於助人的態度。`;
  }

  // 初始化服務
  async initialize() {
    try {
      await this.loadConversationHistory();
      return true;
    } catch (error) {
      return false;
    }
  }

  // 載入對話歷史
  async loadConversationHistory() {
    try {
      const history = await AsyncStorage.getItem('ai_chat_conversation_history');
      if (history) {
        this.conversationHistory = JSON.parse(history);
      }
    } catch (error) {}
  }

  // 保存對話歷史
  async saveConversationHistory() {
    try {
      await AsyncStorage.setItem(
        'ai_chat_conversation_history',
        JSON.stringify(this.conversationHistory.slice(-this.maxHistoryLength)),
      );
    } catch (error) {}
  }

  // 獲取 AI 回應
  async getChatResponse(userMessage, context = {}) {
    try {
      // 添加用戶訊息到歷史
      this.addMessageToHistory('user', userMessage);
      // 檢查是否有可用的 AI API
      const aiConfig = this.getApiConfig('ai', 'OPENAI');
      if (aiConfig && aiConfig.enabled) {
        const response = await this.callOpenAI(userMessage, context);
        this.addMessageToHistory('assistant', response);
        await this.saveConversationHistory();
        return response;
      }
      // 檢查 Google PaLM
      const palmConfig = this.getApiConfig('ai', 'GOOGLE_PALM');
      if (palmConfig && palmConfig.enabled) {
        const response = await this.callGooglePaLM(userMessage, context);
        this.addMessageToHistory('assistant', response);
        await this.saveConversationHistory();
        return response;
      }
      // 檢查 Azure OpenAI
      const azureConfig = this.getApiConfig('ai', 'AZURE_OPENAI');
      if (azureConfig && azureConfig.enabled) {
        const response = await this.callAzureOpenAI(userMessage, context);
        this.addMessageToHistory('assistant', response);
        await this.saveConversationHistory();
        return response;
      }
      // 如果沒有可用的 AI API，返回提示訊息
      return this.getOfflineResponse(userMessage);
    } catch (error) {
      return '抱歉，我暫時無法回應您的問題。請稍後再試，或檢查網路連接。';
    }
  }

  // 調用 OpenAI API
  async callOpenAI(userMessage, context) {
    const config = this.getApiConfig('ai', 'OPENAI');
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.getRecentHistory(10),
      { role: 'user', content: userMessage },
    ];
    const requestBody = {
      model: config.model || 'gpt-4',
      messages: messages,
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
      stream: false,
    };
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      timeout: config.timeout || 30000,
    });
    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || '抱歉，無法生成回應。';
  }

  // 調用 Google PaLM API
  async callGooglePaLM(userMessage, context) {
    const config = getApiConfig('ai', 'GOOGLE_PALM');
    const prompt = `${this.systemPrompt}\n\n對話歷史：\n${this.getFormattedHistory()}\n\n用戶問題：${userMessage}`;
    const requestBody = {
      prompt: {
        text: prompt,
      },
      temperature: config.temperature || 0.7,
      maxOutputTokens: config.maxTokens || 1000,
      candidateCount: 1,
    };
    const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      timeout: config.timeout || 30000,
    });
    if (!response.ok) {
      throw new Error(`Google PaLM API 錯誤: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.candidates[0]?.output || '抱歉，無法生成回應。';
  }

  // 調用 Azure OpenAI API
  async callAzureOpenAI(userMessage, context) {
    const config = getApiConfig('ai', 'AZURE_OPENAI');
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.getRecentHistory(10),
      { role: 'user', content: userMessage },
    ];
    const requestBody = {
      messages: messages,
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
    };
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify(requestBody),
      timeout: config.timeout || 30000,
    });
    if (!response.ok) {
      throw new Error(`Azure OpenAI API 錯誤: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || '抱歉，無法生成回應。';
  }

  // 獲取離線回應
  getOfflineResponse(userMessage) {
    const message = userMessage.toLowerCase();
    // 基於關鍵字的簡單回應
    if (message.includes('價格') || message.includes('多少錢')) {
      return '要獲取準確的卡牌價格信息，我需要連接到價格數據庫。請檢查網路連接或聯繫客服以獲得幫助。';
    }
    if (message.includes('投資') || message.includes('值得')) {
      return '卡牌投資需要考慮多個因素，包括稀有度、需求量、品相等。建議您進行詳細的市場研究，或諮詢專業的收藏顧問。';
    }
    if (message.includes('品相') || message.includes('評級')) {
      return '卡牌品相評估通常包括邊緣狀況、表面狀況、置中度和角落狀況。專業評級服務如 PSA、BGS 可以提供權威的品相評估。';
    }
    if (message.includes('市場') || message.includes('趨勢')) {
      return 'TCG 市場會受到多種因素影響，包括新卡發行、競技環境變化、收藏熱度等。建議關注官方消息和市場動態。';
    }
    return '抱歉，我目前需要網路連接才能提供最準確的信息。請檢查您的網路連接，或嘗試以下操作：\n\n1. 重新連接網路\n2. 重啟應用程式\n3. 聯繫客服支援';
  }

  // 添加訊息到歷史
  addMessageToHistory(role, content) {
    this.conversationHistory.push({
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
    });
    // 保持歷史長度在限制內
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  // 獲取最近的對話歷史
  getRecentHistory(count = 10) {
    return this.conversationHistory
      .slice(-count)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  // 獲取格式化的歷史
  getFormattedHistory() {
    return this.conversationHistory
      .slice(-10)
      .map(msg => `${msg.role === 'user' ? '用戶' : 'AI'}：${msg.content}`)
      .join('\n');
  }

  // 清除對話歷史
  async clearHistory() {
    try {
      this.conversationHistory = [];
      await AsyncStorage.removeItem('ai_chat_conversation_history');
      return true;
    } catch (error) {
      return false;
    }
  }

  // 獲取建議問題
  getSuggestionQuestions() {
    return [
      {
        id: '1',
        text: '這張卡牌的詳細信息是什麼？',
        icon: 'information',
      },
      {
        id: '2',
        text: '這張卡牌的當前價格如何？',
        icon: 'currency-usd',
      },
      {
        id: '3',
        text: '這張卡牌值得投資嗎？',
        icon: 'trending-up',
      },
      {
        id: '4',
        text: '如何評估卡牌的品相？',
        icon: 'eye',
      },
      {
        id: '5',
        text: '當前市場趨勢如何？',
        icon: 'chart-line',
      },
      {
        id: '6',
        text: '新手該如何開始收藏？',
        icon: 'school',
      },
      {
        id: '7',
        text: '如何保護卡牌不受損？',
        icon: 'shield',
      },
      {
        id: '8',
        text: '什麼是卡牌的置中度？',
        icon: 'crosshairs',
      },
    ];
  }

  // 獲取對話統計
  getConversationStats() {
    const total = this.conversationHistory.length;
    const userMessages = this.conversationHistory.filter(msg => msg.role === 'user').length;
    const aiMessages = this.conversationHistory.filter(msg => msg.role === 'assistant').length;
    return {
      totalMessages: total,
      userMessages: userMessages,
      aiMessages: aiMessages,
      conversationStarted: this.conversationHistory.length > 0 ? this.conversationHistory[0].timestamp : null,
      lastMessage: this.conversationHistory.length > 0 ? this.conversationHistory[this.conversationHistory.length - 1].timestamp : null,
    };
  }

  // 獲取 API 配置
  getApiConfig(type, provider) {
    // 使用統一配置管理系統
    if (type === 'ai') {
      return getAiConfig(provider);
    }
    return null;
  }
}

export default new AIChatService();
