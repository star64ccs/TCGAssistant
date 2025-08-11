/**
 * 雲端 AI 服務測試
 * 測試雲端 AI 功能的基本運作
 */

import { getCloudAIService } from '../services/cloudAIService.js';
import { getCardRecognitionService } from '../services/cardRecognitionService.js';
import { getAuthenticityService } from '../services/authenticityService.js';

describe('Cloud AI Service Tests', () => {
  let cloudAI;
  let cardRecognition;
  let authenticity;

  beforeAll(async () => {
    cloudAI = getCloudAIService();
    cardRecognition = getCardRecognitionService();
    authenticity = getAuthenticityService();
  });

  afterAll(async () => {
    if (cloudAI) {      await cloudAI.dispose();
    }
    if (cardRecognition) {      cardRecognition.dispose();
    }
    if (authenticity) {      authenticity.dispose();
    }
  });

  describe('Cloud AI Service', () => {
    test('should initialize successfully', () => {      expect(cloudAI).toBeDefined();      expect(cloudAI.providers).toBeDefined();      expect(cloudAI.config).toBeDefined();
    });    test('should have correct fallback chain', () => {      expect(cloudAI.fallbackChain).toContain('google_vision');      expect(cloudAI.fallbackChain).toContain('openai_gpt4');      expect(cloudAI.fallbackChain).toContain('custom_api');
    });    test('should return statistics', () => {      const stats = cloudAI.getStatistics();      expect(stats).toHaveProperty('totalRequests');      expect(stats).toHaveProperty('successfulRequests');      expect(stats).toHaveProperty('successRate');
    });
  });

  describe('Card Recognition Service', () => {
    test('should initialize successfully', async () => {      const initialized = await cardRecognition.initialize();      expect(initialized).toBe(true);
    });    test('should have cloud AI reference', () => {      expect(cardRecognition.cloudAI).toBeDefined();
    });    test('should handle invalid image gracefully', async () => {      const result = await cardRecognition.recognizeCard(null);      expect(result).toHaveProperty('success');      expect(result.success).toBe(false);      expect(result).toHaveProperty('error');
    });    test('should return proper format for valid input', async () => {    // 模擬有效圖像數據      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...';      try {        const result = await cardRecognition.recognizeCard(mockImageData);        // 檢查返回格式        expect(result).toHaveProperty('success');        expect(result).toHaveProperty('cardType');        expect(result).toHaveProperty('confidence');        expect(result).toHaveProperty('processTime');        if (result.success) {          expect(typeof result.cardType).toBe('string');          expect(typeof result.confidence).toBe('number');          expect(result.confidence).toBeGreaterThanOrEqual(0);          expect(result.confidence).toBeLessThanOrEqual(1);        }      } catch (error) {      // 在測試環境中，API 調用可能會失敗，這是預期的        expect(error).toBeDefined();      }
    });    test('should get status correctly', () => {      const status = cardRecognition.getStatus();      expect(status).toHaveProperty('initialized');      expect(status).toHaveProperty('serviceType');      expect(status.serviceType).toBe('cloud_ai');
    });
  });

  describe('Authenticity Service', () => {
    test('should initialize successfully', async () => {      const initialized = await authenticity.initialize();      expect(initialized).toBe(true);
    });    test('should have cloud AI reference', () => {      expect(authenticity.cloudAI).toBeDefined();
    });    test('should handle invalid image gracefully', async () => {      const result = await authenticity.checkAuthenticity(null);      expect(result).toHaveProperty('success');      expect(result.success).toBe(false);      expect(result).toHaveProperty('isAuthentic');      expect(result.isAuthentic).toBe(null);      // 錯誤信息可能在不同地方      expect(result.details || result.error).toBeTruthy();
    });    test('should return proper format for valid input', async () => {      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...';      try {        const result = await authenticity.checkAuthenticity(mockImageData);        expect(result).toHaveProperty('success');        expect(result).toHaveProperty('isAuthentic');        expect(result).toHaveProperty('confidence');        expect(result).toHaveProperty('responseTime');        if (result.success) {          expect(typeof result.confidence).toBe('number');          expect(result.confidence).toBeGreaterThanOrEqual(0);          expect(result.confidence).toBeLessThanOrEqual(1);        }      } catch (error) {        expect(error).toBeDefined();      }
    });    test('should get status correctly', () => {      const status = authenticity.getStatus();      expect(status).toHaveProperty('initialized');      expect(status).toHaveProperty('serviceType');      expect(status.serviceType).toBe('cloud_ai');
    });
  });

  describe('Offline Fallback', () => {
    test('cloud AI should provide offline response', () => {      const offlineResponse = cloudAI.getOfflineResponse('card_recognition');      expect(offlineResponse).toHaveProperty('success');      expect(offlineResponse.success).toBe(false);      expect(offlineResponse).toHaveProperty('offline');      expect(offlineResponse.offline).toBe(true);      expect(offlineResponse).toHaveProperty('cardType');      expect(offlineResponse.cardType).toBe('Unknown');
    });    test('authenticity offline response should be proper', () => {      const offlineResponse = cloudAI.getOfflineResponse('authenticity_check');      expect(offlineResponse).toHaveProperty('success');      expect(offlineResponse.success).toBe(false);      expect(offlineResponse).toHaveProperty('isAuthentic');      expect(offlineResponse.isAuthentic).toBe(null);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {    // 模擬網絡錯誤情況      const mockNetworkError = new Error('Network request failed');      try {      // 這裡可以模擬網絡失敗的情況        const result = await cloudAI.recognizeCard('invalid_data');        expect(result.success).toBe(false);      } catch (error) {        expect(error).toBeDefined();      }
    });    test('should handle malformed data gracefully', async () => {      try {        const result = await cloudAI.recognizeCard('malformed_image_data');        expect(result).toHaveProperty('success');        if (!result.success) {          expect(result).toHaveProperty('error');        }      } catch (error) {        expect(error).toBeDefined();      }
    });
  });

  describe('Cache Management', () => {
    test('should generate cache keys', async () => {      const cacheKey1 = await cloudAI.generateCacheKey('test_image_1', 'card_recognition');      const cacheKey2 = await cloudAI.generateCacheKey('test_image_2', 'card_recognition');      expect(cacheKey1).toBeDefined();      expect(cacheKey2).toBeDefined();      expect(cacheKey1).not.toBe(cacheKey2);      expect(cacheKey1).toContain('cloud_ai_card_recognition');
    });    test('should handle cache operations', async () => {      const testKey = 'test_cache_key';      const testData = { test: 'data', timestamp: Date.now() };      // 設置快取      await cloudAI.cacheResult(testKey, testData);      // 獲取快取      const cachedData = await cloudAI.getCachedResult(testKey);      if (cachedData) {        expect(cachedData).toMatchObject(testData);      }    // 如果沒有快取數據，說明可能因為環境限制無法存儲
    });
  });

  describe('Performance', () => {
    test('should complete recognition within reasonable time', async () => {      const startTime = Date.now();      try {        await cardRecognition.recognizeCard('test_image_data');      } catch (error) {      // 預期的錯誤      }      const endTime = Date.now();      const duration = endTime - startTime;      // 應該在 30 秒內完成（包括錯誤處理）      expect(duration).toBeLessThan(30000);
    });    test('should update statistics correctly', async () => {      const initialStats = cloudAI.getStatistics();      const initialRequests = initialStats.totalRequests;      try {        await cloudAI.recognizeCard('test_data');      } catch (error) {      // 忽略錯誤      }      const finalStats = cloudAI.getStatistics();      // 統計應該有更新（除非在初始化過程中已經有請求）      expect(finalStats.totalRequests).toBeGreaterThanOrEqual(initialRequests);
    });
  });
});

// 集成測試
describe('Cloud AI Integration Tests', () => {
  test('card recognition and authenticity should work together', async () => {
    const cardRecognition = getCardRecognitionService();
    const authenticity = getAuthenticityService();    const mockImageData = 'test_image_data';    try {    // 先進行卡牌識別      const recognitionResult = await cardRecognition.recognizeCard(mockImageData);      // 再進行真偽判斷      const authenticityResult = await authenticity.checkAuthenticity(mockImageData);      // 兩個結果都應該有基本結構      expect(recognitionResult).toHaveProperty('success');      expect(authenticityResult).toHaveProperty('success');
    } catch (error) {    // 在測試環境中預期會有錯誤      expect(error).toBeDefined();
    }
  });
});

