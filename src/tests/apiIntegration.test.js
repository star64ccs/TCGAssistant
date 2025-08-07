import apiIntegrationManager from '../services/apiIntegrationManager';
import cardService from '../services/cardService';
import aiService from '../services/aiService';
import analysisService from '../services/analysisService';

// 模擬環境變數
const originalEnv = process.env;

// 模擬 Canvas API
const mockCanvas = {
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Uint8Array(100) })),
    putImageData: jest.fn(),
    toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock'),
  })),
  toBlob: jest.fn((callback) => callback(new Blob(['mock'], { type: 'image/jpeg' }))),
};

// 模擬 Image API
const mockImage = {
  onload: null,
  onerror: null,
  src: '',
  width: 100,
  height: 100,
};

// 設置全局模擬
global.HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
global.HTMLCanvasElement.prototype.toBlob = mockCanvas.toBlob;
global.Image = jest.fn(() => mockImage);

// 模擬 imageUtils
jest.mock('../utils/imageUtils', () => ({
  __esModule: true,
  default: {
    compressImage: jest.fn((file) => Promise.resolve(file)),
    validateImage: jest.fn(() => Promise.resolve({ valid: true, errors: [] })),
  },
}));

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  
  // 設置測試環境變數
  process.env.REACT_APP_ENVIRONMENT = 'test';
  process.env.REACT_APP_DEBUG_MODE = 'true';
  
  // 確保真實API模式啟用
  apiIntegrationManager.setRealApiEnabled(true);
  apiIntegrationManager.setFallbackToMock(false);
  
  // 重置 Canvas mock
  mockCanvas.getContext.mockClear();
  mockCanvas.toBlob.mockClear();
});

afterEach(() => {
  process.env = originalEnv;
});

describe('API Integration Manager', () => {
  describe('初始化', () => {
    test('應該正確檢測API可用性', () => {
      const status = apiIntegrationManager.getApiStatus();
      
      expect(status).toHaveProperty('realApiEnabled');
      expect(status).toHaveProperty('fallbackToMock');
      expect(status).toHaveProperty('retryConfig');
      expect(status).toHaveProperty('cacheConfig');
      expect(status).toHaveProperty('environment');
      expect(status).toHaveProperty('debugMode');
    });

    test('應該在沒有API密鑰時禁用真實API', () => {
      // 清除所有API密鑰
      delete process.env.REACT_APP_GOOGLE_VISION_API_KEY;
      delete process.env.REACT_APP_TCGPLAYER_API_KEY;
      delete process.env.REACT_APP_OPENAI_API_KEY;
      
      // 重新創建實例以重新檢測
      const newManager = new (require('../services/apiIntegrationManager').default.constructor)();
      
      expect(newManager.isRealApiEnabled).toBe(false);
    });

    test('應該在有API密鑰時啟用真實API', () => {
      // 設置測試API密鑰
      process.env.REACT_APP_GOOGLE_VISION_API_KEY = 'test_key';
      
      // 重新創建實例以重新檢測
      const newManager = new (require('../services/apiIntegrationManager').default.constructor)();
      
      expect(newManager.isRealApiEnabled).toBe(true);
    });
  });

  describe('配置管理', () => {
    test('應該能夠更新真實API狀態', () => {
      apiIntegrationManager.setRealApiEnabled(true);
      expect(apiIntegrationManager.isRealApiEnabled).toBe(true);
      
      apiIntegrationManager.setRealApiEnabled(false);
      expect(apiIntegrationManager.isRealApiEnabled).toBe(false);
    });

    test('應該能夠更新模擬API備用狀態', () => {
      apiIntegrationManager.setFallbackToMock(false);
      expect(apiIntegrationManager.fallbackToMock).toBe(false);
      
      apiIntegrationManager.setFallbackToMock(true);
      expect(apiIntegrationManager.fallbackToMock).toBe(false);
    });

    test('應該能夠更新重試配置', () => {
      const newConfig = { maxRetries: 5, delay: 2000 };
      apiIntegrationManager.setRetryConfig(newConfig);
      
      expect(apiIntegrationManager.retryConfig.maxRetries).toBe(5);
      expect(apiIntegrationManager.retryConfig.delay).toBe(2000);
    });

    test('應該能夠更新快取配置', () => {
      const newConfig = { duration: 10 * 60 * 1000 };
      apiIntegrationManager.setCacheConfig(newConfig);
      
      expect(apiIntegrationManager.cacheConfig.duration).toBe(10 * 60 * 1000);
    });
  });

  describe('API調用', () => {
    test('應該能夠調用模擬卡牌辨識API', async () => {
      const mockImageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await apiIntegrationManager.callApi(
        'cardRecognition',
        'recognize',
        { imageFile: mockImageFile }
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('cardInfo');
      expect(result.data.cardInfo).toHaveProperty('name');
      expect(result.apiUsed).toBe('MOCK');
    });

    test('應該能夠調用模擬價格查詢API', async () => {
      const cardInfo = { name: '皮卡丘 V', series: 'Sword & Shield' };
      
      const result = await apiIntegrationManager.callApi(
        'priceQuery',
        'getPrices',
        { cardInfo }
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('platforms');
      expect(result.data).toHaveProperty('average');
      expect(result.platformsUsed).toContain('TCGPLAYER');
    });

    test('應該能夠調用模擬AI分析API', async () => {
      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { prompt: '分析這張卡牌', context: {} }
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('response');
      expect(result.data).toHaveProperty('model');
      expect(result.modelUsed).toBe('MOCK');
    });

    test('應該能夠調用模擬用戶認證API', async () => {
      const result = await apiIntegrationManager.callApi(
        'userAuth',
        'login',
        { email: 'test@example.com', password: 'password123' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('token');
    });

    test('應該能夠調用模擬收藏管理API', async () => {
      const result = await apiIntegrationManager.callApi(
        'collection',
        'getCollection',
        { userId: 'user_123' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('cards');
      expect(result.data).toHaveProperty('totalValue');
    });
  });

  describe('錯誤處理', () => {
    test('應該在API調用失敗時拋出錯誤', async () => {
      // 禁用模擬API備用
      apiIntegrationManager.setFallbackToMock(false);
      apiIntegrationManager.setRealApiEnabled(false);
      
      await expect(
        apiIntegrationManager.callApi('invalidType', 'invalidMethod', {})
      ).rejects.toThrow('API調用失敗且未啟用模擬模式');
    });

    test('應該在方法不存在時拋出錯誤', async () => {
      await expect(
        apiIntegrationManager.callApi('cardRecognition', 'invalidMethod', {})
      ).rejects.toThrow('不支援的卡牌辨識方法: invalidMethod');
    });
  });

  describe('快取和重試', () => {
    test('應該能夠清除快取', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      apiIntegrationManager.clearCache();
      
      expect(consoleSpy).toHaveBeenCalledWith('API快取已清除');
      
      consoleSpy.mockRestore();
    });
  });
});

describe('Card Service Integration', () => {
  test('應該能夠獲取卡牌價格', async () => {
    const cardInfo = { name: '皮卡丘 V', series: 'Sword & Shield' };
    
    const result = await cardService.getCardPrices(cardInfo);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('platforms');
  });

  test('應該能夠獲取價格歷史', async () => {
    const result = await cardService.getPriceHistory('card_123', '1y');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('history');
  });

  test('應該能夠獲取市場趨勢', async () => {
    const result = await cardService.getMarketTrends({ period: '7d' });
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('trends');
  });
});

describe('AI Service Integration', () => {
  test('應該能夠進行AI聊天', async () => {
    const result = await aiService.chat('你好，請分析這張卡牌');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('response');
  });

  test('應該能夠分析卡牌', async () => {
    const cardInfo = { name: '皮卡丘 V', series: 'Sword & Shield' };
    
    const result = await aiService.analyzeCard(cardInfo, 'price');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('response');
  });

  test('應該能夠獲取投資建議', async () => {
    const cardInfo = { name: '皮卡丘 V', series: 'Sword & Shield' };
    const userProfile = { riskTolerance: 'medium', investmentGoal: 'growth' };
    
    const result = await aiService.getInvestmentAdvice(cardInfo, userProfile);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('response');
  });

  test('應該能夠批量分析', async () => {
    const cards = [
      { name: '皮卡丘 V', series: 'Sword & Shield' },
      { name: '路卡利歐 V', series: 'Sword & Shield' },
    ];
    
    const onProgress = jest.fn();
    const result = await aiService.analyzeBatch(cards, 'price', { onProgress });
    
    expect(result.success).toBe(true);
    expect(result.totalProcessed).toBe(2);
    expect(onProgress).toHaveBeenCalled();
  });
});

describe('Analysis Service Integration', () => {
  test('應該能夠獲取分析歷史', async () => {
    const result = await analysisService.getAnalysisHistory('user_123', { period: '1m' });
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('history');
  });

  test('應該能夠獲取分析統計', async () => {
    const result = await analysisService.getAnalysisStats('user_123', '1m');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('stats');
  });

  test('應該能夠獲取分析工具信息', async () => {
    const result = await analysisService.getAnalysisTools();
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('tools');
  });
});

describe('Utility Functions', () => {
  test('應該能夠計算綜合評分', () => {
    const analysisResults = {
      centering: { data: { score: 0.8 } },
      authenticity: { data: { confidence: 0.9 } },
      quality: { data: { score: 0.7 } },
    };
    
    const score = analysisService.calculateOverallScore(analysisResults);
    
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('應該能夠生成分析摘要', () => {
    const analysisResults = {
      centering: { data: { score: 0.8 } },
      authenticity: { data: { confidence: 0.9 } },
      quality: { data: { score: 0.7 } },
    };
    
    const summary = analysisService.generateAnalysisSummary(analysisResults);
    
    expect(summary).toHaveProperty('overallGrade');
    expect(summary).toHaveProperty('recommendations');
    expect(summary).toHaveProperty('warnings');
    expect(summary).toHaveProperty('strengths');
    expect(summary).toHaveProperty('weaknesses');
  });

  test('應該能夠根據評分獲取等級', () => {
    expect(analysisService.getGradeFromScore(0.95)).toBe('A+');
    expect(analysisService.getGradeFromScore(0.85)).toBe('A');
    expect(analysisService.getGradeFromScore(0.75)).toBe('B+');
    expect(analysisService.getGradeFromScore(0.65)).toBe('B-');
    expect(analysisService.getGradeFromScore(0.45)).toBe('D');
  });
});
