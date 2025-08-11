/**
 * 超高速卡牌識別服務測試
 * 測試識別速度和準確性
 */

// 模擬 React Native 環境
global.performance = {
  now: () => Date.now(),
};

global.console = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// 模擬 AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// 模擬 expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: {
    manipulateAsync: jest.fn(),
    SaveFormat: {
      JPEG: 'jpeg',
    },
  },
}));

// 模擬 cloudAIService
jest.mock('../services/cloudAIService', () => ({
  getCloudAIService: jest.fn(() => ({
    recognizeCard: jest.fn().mockResolvedValue({
      success: true,
      cardType: 'Pokemon',
      confidence: 0.95,
      cardName: 'Pikachu',
      rarity: 'Common',
    }),
  })),
}));

// 模擬 imageUtils
jest.mock('../utils/imageUtils', () => ({
  compressImage: jest.fn(),
  validateImage: jest.fn(),
}));

describe('UltraFastCardRecognitionService', () => {
  let service;
  let mockImageData;

  beforeEach(() => {
    // 重置所有模擬
    jest.clearAllMocks();
    // 創建模擬圖片數據
    mockImageData = {
      uri: 'file://test-image.jpg',
      width: 1920,
      height: 1080,
      type: 'image/jpeg',
    };
    // 動態導入服務
    const { getUltraFastCardRecognitionService } = require('../services/ultraFastCardRecognitionService');
    service = getUltraFastCardRecognitionService();
  });

  describe('服務初始化', () => {
    it('應該成功初始化服務', async () => {
      const result = await service.initialize();
      expect(result).toBe(true);
      expect(service.isInitialized).toBe(true);
    });
    it('應該預載入常用模板', async () => {
      await service.initialize();
      expect(service.preloadedTemplates.size).toBeGreaterThan(0);
    });
    it('應該初始化智能快取', async () => {
      await service.initialize();
      expect(service.smartCache).toBeDefined();
    });
  });

  describe('超高速識別', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該在1秒內完成識別', async () => {
      const startTime = performance.now();
      const result = await service.recognizeCard(mockImageData);
      const processTime = performance.now() - startTime;
      expect(result.success).toBe(true);
      expect(result.speedOptimized).toBe(true);
      expect(result.processTime).toBeLessThan(1000); // 應該小於1秒
      expect(processTime).toBeLessThan(1000); // 實際執行時間也應該小於1秒
    });
    it('應該返回正確的識別結果格式', async () => {
      const result = await service.recognizeCard(mockImageData);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('cardType');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('cardName');
      expect(result).toHaveProperty('processTime');
      expect(result).toHaveProperty('speedOptimized');
      expect(result).toHaveProperty('performanceMetrics');
    });
    it('應該支持進度回調', async () => {
      const progressCallback = jest.fn();
      await service.recognizeCard(mockImageData, {
        onProgress: progressCallback,
      });
      expect(progressCallback).toHaveBeenCalled();
    });
    it('應該處理快取命中情況', async () => {
    // 第一次識別
      const result1 = await service.recognizeCard(mockImageData);
      expect(result1.cached).toBe(false);
      // 第二次識別應該命中快取
      const result2 = await service.recognizeCard(mockImageData);
      expect(result2.cached).toBe(true);
      expect(result2.processTime).toBeLessThan(result1.processTime);
    });
  });

  describe('性能指標', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該正確更新性能指標', async () => {
      await service.recognizeCard(mockImageData);
      const metrics = service.getPerformanceMetrics();
      expect(metrics.totalRecognitions).toBe(1);
      expect(metrics.averageSpeed).toBeGreaterThan(0);
      expect(metrics.fastestRecognition).toBeLessThan(Infinity);
      expect(metrics.slowestRecognition).toBeGreaterThan(0);
    });
    it('應該計算快取命中率', async () => {
    // 第一次識別
      await service.recognizeCard(mockImageData);
      // 第二次識別（快取命中）
      await service.recognizeCard(mockImageData);
      const metrics = service.getPerformanceMetrics();
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.cacheHitRate).toBe(0.5);
    });
    it('應該判斷是否達到目標速度', async () => {
      await service.recognizeCard(mockImageData);
      const metrics = service.getPerformanceMetrics();
      expect(metrics.targetSpeed).toBe(1000);
      expect(typeof metrics.isTargetAchieved).toBe('boolean');
    });
  });

  describe('圖片預處理', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該正確預處理圖片', async () => {
      const processedImage = await service.ultraFastPreprocessImage(mockImageData);
      expect(processedImage).toBeDefined();
    });
    it('應該在預處理失敗時使用原始圖片', async () => {
    // 模擬預處理失敗
      const { ImageManipulator } = require('expo-image-manipulator');
      ImageManipulator.manipulateAsync.mockRejectedValue(new Error('Preprocessing failed'));
      const processedImage = await service.ultraFastPreprocessImage(mockImageData);
      expect(processedImage).toEqual(mockImageData);
    });
  });

  describe('並行處理', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該使用並行處理進行識別', async () => {
      const result = await service.parallelRecognition(mockImageData, {});
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('模板匹配', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該正確計算雜湊相似度', () => {
      const hash1 = '1010101010101010';
      const hash2 = '1010101010101010';
      const hash3 = '0000000000000000';
      expect(service.calculateHashSimilarity(hash1, hash2)).toBe(1);
      expect(service.calculateHashSimilarity(hash1, hash3)).toBe(0);
    });
    it('應該從文字檢測卡牌類型', () => {
      expect(service.detectCardTypeFromText('Pikachu')).toBe('Pokemon');
      expect(service.detectCardTypeFromText('Lightning Bolt')).toBe('Magic');
      expect(service.detectCardTypeFromText('Blue-Eyes White Dragon')).toBe('Yu-Gi-Oh');
      expect(service.detectCardTypeFromText('Unknown Card')).toBe('Unknown');
    });
  });

  describe('快取系統', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該生成智能快取鍵', async () => {
      const cacheKey = await service.generateSmartCacheKey(mockImageData);
      expect(cacheKey).toContain('ultra_fast_recognition_');
    });
    it('應該正確快取和檢索結果', async () => {
      const testResult = {
        success: true,
        cardType: 'Test',
        confidence: 0.9,
      };
      const cacheKey = await service.generateSmartCacheKey(mockImageData);
      // 快取結果
      await service.cacheSmartResult(cacheKey, testResult);
      // 檢索結果
      const retrieved = await service.getSmartCachedResult(cacheKey);
      expect(retrieved).toEqual(testResult);
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該優雅處理識別失敗', async () => {
    // 模擬識別失敗
      const { getCloudAIService } = require('../services/cloudAIService');
      getCloudAIService().recognizeCard.mockRejectedValue(new Error('Recognition failed'));
      const result = await service.recognizeCard(mockImageData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Recognition failed');
      expect(result.speedOptimized).toBe(false);
    });
    it('應該在服務未初始化時自動初始化', async () => {
      service.isInitialized = false;
      const result = await service.recognizeCard(mockImageData);
      expect(service.isInitialized).toBe(true);
      expect(result).toBeDefined();
    });
  });

  describe('服務狀態', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該返回正確的服務狀態', () => {
      const status = service.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.serviceType).toBe('ultra_fast_recognition');
      expect(status.config).toBeDefined();
      expect(status.performanceMetrics).toBeDefined();
      expect(status.cacheSize).toBeGreaterThanOrEqual(0);
      expect(status.templateCount).toBeGreaterThan(0);
    });
  });

  describe('資源清理', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該正確清理資源', async () => {
      await service.dispose();
      expect(service.isInitialized).toBe(false);
      expect(service.smartCache.size).toBe(0);
      expect(service.preloadedTemplates.size).toBe(0);
      expect(service.processingPool.length).toBe(0);
    });
  });

  describe('速度優化驗證', () => {
    beforeEach(async () => {
      await service.initialize();
    });
    it('應該達到 <1秒 的目標速度', async () => {
      const speeds = [];
      // 執行多次識別以獲取平均速度
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        await service.recognizeCard(mockImageData);
        const processTime = performance.now() - startTime;
        speeds.push(processTime);
      }
      const averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
      console.log(`平均識別速度: ${averageSpeed}ms`);
      expect(averageSpeed).toBeLessThan(1000); // 平均速度應該小於1秒
    });
    it('應該在快取命中時達到極快速度', async () => {
    // 第一次識別
      await service.recognizeCard(mockImageData);
      // 第二次識別（快取命中）
      const startTime = performance.now();
      const result = await service.recognizeCard(mockImageData);
      const processTime = performance.now() - startTime;
      expect(result.cached).toBe(true);
      expect(processTime).toBeLessThan(100); // 快取命中應該非常快
    });
  });
});
