import cardRecognitionService from '../services/cardRecognitionService';
import databaseService from '../services/databaseService';
import imageUtils from '../utils/imageUtils';

// Mock dependencies
jest.mock('../services/databaseService');
jest.mock('../utils/imageUtils');
jest.mock('../services/realApiService');

describe('CardRecognitionService', () => {
  let mockImageFile;
  let mockProcessedImage;
  let mockFeatures;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock data
    mockImageFile = {
      uri: 'file://test-image.jpg',
      type: 'image/jpeg',
      name: 'test-image.jpg',
      size: 1024000
    };

    mockProcessedImage = {
      original: mockImageFile,
      processed: mockImageFile,
      features: mockFeatures,
      metadata: {
        width: 800,
        height: 600,
        format: 'jpeg',
        size: 1024000
      }
    };

    mockFeatures = {
      colorHistogram: {
        red: new Array(256).fill(0.01),
        green: new Array(256).fill(0.01),
        blue: new Array(256).fill(0.01),
        gray: new Array(256).fill(0.01)
      },
      textureFeatures: {
        contrast: 0.5,
        homogeneity: 0.7,
        energy: 0.3,
        correlation: 0.6
      },
      edgeFeatures: {
        edgeStrength: 0.4,
        edgeDensity: 0.2,
        averageEdgeMagnitude: 0.3
      },
      shapeFeatures: {
        area: 480000,
        perimeter: 2800,
        compactness: 1.2,
        aspectRatio: 1.33
      },
      statisticalFeatures: {
        mean: 128,
        variance: 4096,
        stdDev: 64,
        min: 0,
        max: 255,
        range: 255,
        skewness: 0.1,
        kurtosis: 0.2
      },
      metadata: {
        width: 800,
        height: 600,
        aspectRatio: 1.33,
        totalPixels: 480000
      }
    };

    // Mock database service
    databaseService.initDatabase.mockResolvedValue();
    databaseService.findSimilarCards.mockResolvedValue([
      {
        card_id: 'test_card_1',
        name: 'Test Card 1',
        series: 'Test Series',
        card_number: '001/100',
        rarity: 'Rare',
        card_type: 'Pokemon',
        hp: '100',
        image_url: 'https://example.com/test1.jpg',
        features: mockFeatures
      }
    ]);

    // Mock image utils
    imageUtils.resizeImage.mockResolvedValue(mockImageFile);
    imageUtils.enhanceImage.mockResolvedValue(mockImageFile);
    imageUtils.extractFeatures.mockResolvedValue(mockFeatures);
    imageUtils.extractDetailedFeatures.mockResolvedValue(mockFeatures);

    // Mock real API service
    const realApiService = require('../services/realApiService');
    realApiService.default = {
      recognizeCardReal: jest.fn().mockResolvedValue({
        success: true,
        data: {
          cardInfo: {
            card_id: 'api_card_1',
            name: 'API Card 1',
            series: 'API Series',
            card_number: '002/100',
            rarity: 'Ultra Rare',
            card_type: 'Pokemon',
            hp: '150',
            image_url: 'https://example.com/api1.jpg'
          },
          confidence: 0.85
        },
        apiUsed: 'GOOGLE_VISION'
      })
    };
  });

  describe('initialization', () => {
    test('should initialize successfully', async () => {
      await cardRecognitionService.initialize();
      
      expect(databaseService.initDatabase).toHaveBeenCalled();
      expect(cardRecognitionService.isInitialized).toBe(true);
    });

    test('should not reinitialize if already initialized', async () => {
      cardRecognitionService.isInitialized = true;
      
      await cardRecognitionService.initialize();
      
      expect(databaseService.initDatabase).not.toHaveBeenCalled();
    });
  });

  describe('recognizeCard', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    test('should recognize card using hybrid method successfully', async () => {
      const onProgress = jest.fn();
      
      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        method: 'hybrid',
        onProgress
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.method).toBe('hybrid');
      expect(onProgress).toHaveBeenCalled();
    });

    test('should recognize card using database method', async () => {
      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        method: 'database_match'
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe('database_match');
      expect(result.source).toBe('database');
    });

    test('should recognize card using AI method', async () => {
      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        method: 'ai_api'
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe('ai_api');
      expect(result.source).toBe('ai_api');
    });

    test('should recognize card using feature method', async () => {
      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        method: 'feature_match'
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe('feature_match');
      expect(result.source).toBe('feature_match');
    });

    test('should handle recognition failure gracefully', async () => {
      databaseService.findSimilarCards.mockResolvedValue([]);
      const realApiService = require('../services/realApiService');
      realApiService.default.recognizeCardReal.mockResolvedValue({
        success: false,
        error: 'API failed'
      });

      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        method: 'hybrid'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should use fallback methods when confidence is low', async () => {
      // Mock low confidence result
      databaseService.findSimilarCards.mockResolvedValue([
        {
          ...mockFeatures,
          confidence: 0.3 // Low confidence
        }
      ]);

      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        method: 'hybrid',
        confidenceThreshold: 0.7
      });

      expect(result.success).toBe(true);
    });
  });

  describe('preprocessImage', () => {
    test('should preprocess image successfully', async () => {
      const processed = await cardRecognitionService.preprocessImage(mockImageFile);

      expect(processed.original).toBe(mockImageFile);
      expect(processed.processed).toBeDefined();
      expect(processed.features).toBeDefined();
      expect(processed.metadata).toBeDefined();

      expect(imageUtils.resizeImage).toHaveBeenCalled();
      expect(imageUtils.enhanceImage).toHaveBeenCalled();
      expect(imageUtils.extractFeatures).toHaveBeenCalled();
    });

    test('should handle preprocessing failure gracefully', async () => {
      imageUtils.resizeImage.mockRejectedValue(new Error('Resize failed'));

      const processed = await cardRecognitionService.preprocessImage(mockImageFile);

      expect(processed.original).toBe(mockImageFile);
      expect(processed.processed).toBe(mockImageFile);
      expect(processed.features).toBeNull();
    });
  });

  describe('calculateBestMatch', () => {
    test('should calculate best match correctly', () => {
      const similarCards = [
        { ...mockFeatures, confidence: 0.8 },
        { ...mockFeatures, confidence: 0.6 },
        { ...mockFeatures, confidence: 0.9 }
      ];

      const bestMatch = cardRecognitionService.calculateBestMatch(similarCards, mockFeatures);

      expect(bestMatch.card).toBe(similarCards[2]);
      expect(bestMatch.confidence).toBe(0.9);
    });

    test('should handle empty cards array', () => {
      const bestMatch = cardRecognitionService.calculateBestMatch([], mockFeatures);

      expect(bestMatch).toBeNull();
    });
  });

  describe('calculateConfidence', () => {
    test('should calculate confidence correctly', () => {
      const card = {
        name: 'Test Card',
        series: 'Test Series',
        features: mockFeatures
      };

      const confidence = cardRecognitionService.calculateConfidence(card, mockFeatures);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    test('should handle missing features', () => {
      const card = {
        name: 'Test Card',
        series: 'Test Series'
      };

      const confidence = cardRecognitionService.calculateConfidence(card, mockFeatures);

      expect(confidence).toBeGreaterThan(0);
    });
  });

  describe('calculateFeatureSimilarity', () => {
    test('should calculate similarity correctly', () => {
      const features1 = { a: 1, b: 2, c: 3 };
      const features2 = { a: 1, b: 2, c: 3 };

      const similarity = cardRecognitionService.calculateFeatureSimilarity(features1, features2);

      expect(similarity).toBe(1); // Perfect similarity
    });

    test('should handle different features', () => {
      const features1 = { a: 1, b: 2, c: 3 };
      const features2 = { a: 4, b: 5, c: 6 };

      const similarity = cardRecognitionService.calculateFeatureSimilarity(features1, features2);

      expect(similarity).toBeLessThan(1);
      expect(similarity).toBeGreaterThan(0);
    });

    test('should handle missing features', () => {
      const similarity = cardRecognitionService.calculateFeatureSimilarity(null, mockFeatures);

      expect(similarity).toBe(0);
    });
  });

  describe('saveRecognitionResult', () => {
    test('should save recognition result successfully', async () => {
      const result = {
        success: true,
        cardInfo: {
          card_id: 'test_card',
          name: 'Test Card'
        },
        confidence: 0.8,
        method: 'hybrid',
        source: 'database'
      };

      await cardRecognitionService.saveRecognitionResult(result, 'test_user');

      expect(databaseService.saveRecognitionResult).toHaveBeenCalled();
    });

    test('should handle save failure gracefully', async () => {
      databaseService.saveRecognitionResult.mockRejectedValue(new Error('Save failed'));

      const result = {
        success: true,
        cardInfo: { card_id: 'test_card' },
        confidence: 0.8,
        method: 'hybrid',
        source: 'database'
      };

      await expect(cardRecognitionService.saveRecognitionResult(result, 'test_user'))
        .resolves.not.toThrow();
    });
  });

  describe('getRecognitionStats', () => {
    test('should get recognition stats successfully', async () => {
      const mockStats = {
        totalRecognitions: 100,
        successfulRecognitions: 85,
        successRate: 85,
        averageConfidence: 0.8,
        averageProcessingTime: 1500,
        uniqueCardsRecognized: 50,
        lastRecognition: '2024-01-01T00:00:00Z'
      };

      databaseService.getRecognitionStats.mockResolvedValue(mockStats);

      const stats = await cardRecognitionService.getRecognitionStats('test_user');

      expect(stats).toEqual(mockStats);
      expect(databaseService.getRecognitionStats).toHaveBeenCalledWith('test_user');
    });

    test('should handle stats retrieval failure', async () => {
      databaseService.getRecognitionStats.mockRejectedValue(new Error('Stats failed'));

      const stats = await cardRecognitionService.getRecognitionStats('test_user');

      expect(stats).toBeNull();
    });
  });

  describe('cleanupOldRecords', () => {
    test('should cleanup old records successfully', async () => {
      databaseService.cleanupOldRecognitionRecords.mockResolvedValue(10);

      await cardRecognitionService.cleanupOldRecords(30);

      expect(databaseService.cleanupOldRecognitionRecords).toHaveBeenCalledWith(30);
    });

    test('should handle cleanup failure gracefully', async () => {
      databaseService.cleanupOldRecognitionRecords.mockRejectedValue(new Error('Cleanup failed'));

      await expect(cardRecognitionService.cleanupOldRecords(30))
        .resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    test('should handle initialization error', async () => {
      databaseService.initDatabase.mockRejectedValue(new Error('Init failed'));

      await expect(cardRecognitionService.initialize()).rejects.toThrow('Init failed');
    });

    test('should handle recognition error with notifications disabled', async () => {
      databaseService.findSimilarCards.mockRejectedValue(new Error('Database error'));

      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        enableNotifications: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('performance', () => {
    test('should measure processing time correctly', async () => {
      const startTime = Date.now();
      
      const result = await cardRecognitionService.recognizeCard(mockImageFile, {
        userId: 'test_user',
        method: 'database_match'
      });

      const endTime = Date.now();
      const actualTime = endTime - startTime;

      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.processingTime).toBeLessThan(actualTime + 100); // Allow some tolerance
    });
  });
});
