import authenticityService from '../services/authenticityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock imageUtils
jest.mock('../utils/imageUtils', () => ({
  compressImage: jest.fn(),
  validateImage: jest.fn(),
  getImageInfo: jest.fn(),
}));

// Mock apiService
jest.mock('../services/api', () => ({
  apiService: {
    post: jest.fn(),
  },
  API_ENDPOINTS: {
    ANALYSIS: {
      AUTHENTICITY: '/analysis/authenticity',
    },
  },
}));

describe('AuthenticityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticityService.cache.clear();
    authenticityService.isOnline = true;
  });

  describe('checkAuthenticity', () => {
    it('應該成功檢查真偽並返回結果', async () => {
      const mockImageFile = {
        uri: 'test-image.jpg',
        type: 'image/jpeg',
        name: 'test.jpg',
      };

      const mockApiResponse = {
        data: {
          isAuthentic: true,
          confidence: 95,
          overallScore: 92,
          securityFeatures: {
            hologram: { detected: true, score: 95 },
            watermark: { detected: true, score: 88 },
            uvPattern: { detected: true, score: 91 },
            texture: { detected: true, score: 89 }
          },
          printQuality: {
            resolution: 94,
            colorAccuracy: 91,
            sharpness: 93,
            consistency: 90
          },
          materialCheck: {
            cardstock: 92,
            finish: 89,
            thickness: 94,
            flexibility: 91
          },
          edgeQuality: {
            smoothness: 88,
            consistency: 92,
            alignment: 90
          },
          cornerQuality: {
            sharpness: 93,
            consistency: 91,
            wear: 89
          },
          riskFactors: ['輕微邊緣磨損'],
          recommendations: ['建議在良好光線下重新檢查'],
          analysisId: 'AC_1234567890_abc123',
          metadata: {
            imageSize: 1024000,
            processingTime: 2.5,
            apiVersion: '1.0',
          }
        }
      };

      // Mock imageUtils
      const { compressImage, validateImage } = require('../utils/imageUtils');
      compressImage.mockResolvedValue(mockImageFile);
      validateImage.mockResolvedValue({ valid: true, errors: [] });

      // Mock apiService
      const { apiService } = require('../services/api');
      apiService.post.mockResolvedValue(mockApiResponse);

      // Mock AsyncStorage
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      const result = await authenticityService.checkAuthenticity(mockImageFile);

      expect(result).toBeDefined();
      expect(result.isAuthentic).toBe(true);
      expect(result.confidence).toBe(95);
      expect(result.overallScore).toBe(92);
      expect(result.securityFeatures.hologram.detected).toBe(true);
      expect(result.analysisId).toBeDefined();
      expect(result.timestamp).toBeDefined();

      expect(compressImage).toHaveBeenCalledWith(mockImageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });
      expect(validateImage).toHaveBeenCalledWith(mockImageFile);
      expect(apiService.post).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('應該在離線模式下使用本地分析', async () => {
      const mockImageFile = {
        uri: 'test-image.jpg',
        type: 'image/jpeg',
        name: 'test.jpg',
      };

      // Mock imageUtils
      const { compressImage, validateImage, getImageInfo } = require('../utils/imageUtils');
      compressImage.mockResolvedValue(mockImageFile);
      validateImage.mockResolvedValue({ valid: true, errors: [] });
      getImageInfo.mockResolvedValue({
        width: 800,
        height: 1120,
        fileSize: 1024000,
      });

      // Mock apiService to throw error
      const { apiService } = require('../services/api');
      apiService.post.mockRejectedValue(new Error('Network error'));

      // Set offline mode
      authenticityService.isOnline = false;

      const result = await authenticityService.checkAuthenticity(mockImageFile);

      expect(result).toBeDefined();
      expect(result.isOffline).toBe(true);
      expect(result.confidence).toBeLessThan(95); // 離線模式降低信心度
      expect(result.recommendations).toContain('此為離線分析結果，建議在網路連線時重新檢查以獲得更高準確度');
    });

    it('應該處理圖片驗證失敗', async () => {
      const mockImageFile = {
        uri: 'invalid-image.jpg',
        type: 'image/jpeg',
        name: 'invalid.jpg',
      };

      // Mock imageUtils to fail validation
      const { compressImage, validateImage } = require('../utils/imageUtils');
      compressImage.mockResolvedValue(mockImageFile);
      validateImage.mockResolvedValue({ 
        valid: false, 
        errors: ['圖片格式不支援', '圖片解析度過低'] 
      });

      await expect(authenticityService.checkAuthenticity(mockImageFile))
        .rejects
        .toThrow('圖片驗證失敗: 圖片格式不支援, 圖片解析度過低');
    });

    it('應該使用快取結果如果可用', async () => {
      const mockImageFile = { uri: 'test.jpg', type: 'image/jpeg', name: 'test.jpg' };
      const mockCachedResult = {
        isAuthentic: true,
        confidence: 95,
        timestamp: new Date().toISOString(),
      };

      // Mock AsyncStorage
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCachedResult));

      const result = await authenticityService.checkAuthenticity(mockImageFile);

      expect(result).toEqual(mockCachedResult);
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('performBasicAnalysis', () => {
    it('應該根據圖片資訊進行基本分析', async () => {
      const mockImageFile = {
        uri: 'test-image.jpg',
        type: 'image/jpeg',
        name: 'test.jpg',
      };

      const mockImageInfo = {
        width: 800,
        height: 1120,
        fileSize: 1024000,
      };

      // Mock imageUtils
      const { getImageInfo } = require('../utils/imageUtils');
      getImageInfo.mockResolvedValue(mockImageInfo);

      const result = await authenticityService.performBasicAnalysis(mockImageFile);

      expect(result).toBeDefined();
      expect(result.isAuthentic).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.analysisId).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('checkImageQuality', () => {
    it('應該根據解析度評分圖片品質', () => {
      const lowRes = { width: 200, height: 300, fileSize: 50000 };
      const mediumRes = { width: 400, height: 600, fileSize: 200000 };
      const highRes = { width: 800, height: 1200, fileSize: 800000 };
      const ultraRes = { width: 1600, height: 2400, fileSize: 2000000 };

      expect(authenticityService.checkImageQuality(lowRes)).toBe(30);
      expect(authenticityService.checkImageQuality(mediumRes)).toBe(60);
      expect(authenticityService.checkImageQuality(highRes)).toBe(80);
      expect(authenticityService.checkImageQuality(ultraRes)).toBe(95);
    });
  });

  describe('checkAspectRatio', () => {
    it('應該根據長寬比評分', () => {
      const standardRatio = { width: 250, height: 350 }; // 2.5:3.5
      const closeRatio = { width: 240, height: 350 }; // 接近標準
      const farRatio = { width: 200, height: 350 }; // 較遠
      const veryFarRatio = { width: 150, height: 350 }; // 很遠

      expect(authenticityService.checkAspectRatio(standardRatio)).toBe(95);
      expect(authenticityService.checkAspectRatio(closeRatio)).toBe(95);
      expect(authenticityService.checkAspectRatio(farRatio)).toBe(80);
      expect(authenticityService.checkAspectRatio(veryFarRatio)).toBe(60);
    });
  });

  describe('getStats', () => {
    it('應該返回正確的統計資訊', async () => {
      const mockHistory = [
        { isAuthentic: true, confidence: 95, timestamp: '2024-01-01T00:00:00Z' },
        { isAuthentic: true, confidence: 90, timestamp: '2024-01-02T00:00:00Z' },
        { isAuthentic: false, confidence: 85, timestamp: '2024-01-03T00:00:00Z' },
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockHistory));

      const stats = await authenticityService.getStats();

      expect(stats.total).toBe(3);
      expect(stats.authentic).toBe(2);
      expect(stats.fake).toBe(1);
      expect(stats.avgConfidence).toBe(90);
      expect(stats.lastAnalysis).toBe('2024-01-01T00:00:00Z');
    });

    it('應該處理空歷史記錄', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const stats = await authenticityService.getStats();

      expect(stats.total).toBe(0);
      expect(stats.authentic).toBe(0);
      expect(stats.fake).toBe(0);
      expect(stats.avgConfidence).toBe(0);
      expect(stats.lastAnalysis).toBe(null);
    });
  });

  describe('clearCache', () => {
    it('應該清除所有快取', async () => {
      const mockKeys = [
        'authenticity_cache_key1',
        'authenticity_cache_key2',
        'other_key',
      ];

      AsyncStorage.getAllKeys.mockResolvedValue(mockKeys);
      AsyncStorage.multiRemove.mockResolvedValue();

      await authenticityService.clearCache();

      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'authenticity_cache_key1',
        'authenticity_cache_key2',
      ]);
      expect(authenticityService.cache.size).toBe(0);
    });
  });

  describe('batchAnalysis', () => {
    it('應該批量分析多張圖片', async () => {
      const mockImageFiles = [
        { uri: 'image1.jpg', type: 'image/jpeg', name: 'image1.jpg' },
        { uri: 'image2.jpg', type: 'image/jpeg', name: 'image2.jpg' },
      ];

      const mockResult = {
        isAuthentic: true,
        confidence: 95,
        overallScore: 92,
        analysisId: 'AC_123',
        timestamp: new Date().toISOString(),
      };

      // Mock checkAuthenticity to return consistent result
      jest.spyOn(authenticityService, 'checkAuthenticity').mockResolvedValue(mockResult);

      const results = await authenticityService.batchAnalysis(mockImageFiles);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(mockResult);
      expect(results[1]).toEqual(mockResult);
      expect(authenticityService.checkAuthenticity).toHaveBeenCalledTimes(2);
    });

    it('應該處理批量分析中的錯誤', async () => {
      const mockImageFiles = [
        { uri: 'image1.jpg', type: 'image/jpeg', name: 'image1.jpg' },
        { uri: 'image2.jpg', type: 'image/jpeg', name: 'image2.jpg' },
      ];

      // Mock checkAuthenticity to fail on second image
      jest.spyOn(authenticityService, 'checkAuthenticity')
        .mockResolvedValueOnce({ isAuthentic: true, confidence: 95 })
        .mockRejectedValueOnce(new Error('Processing failed'));

      const results = await authenticityService.batchAnalysis(mockImageFiles);

      expect(results).toHaveLength(2);
      expect(results[0].isAuthentic).toBe(true);
      expect(results[1].error).toBe('Processing failed');
      expect(results[1].index).toBe(1);
      expect(results[1].filename).toBe('image2.jpg');
    });
  });
});
