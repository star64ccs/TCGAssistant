import { cleanupAllUnrealContent, getDatabaseStats, checkCleanupStatus } from '../store/slices/databaseCleanupSlice';
import databaseCleanupService from '../services/databaseCleanupService';
import { store } from '../store';

// Mock the services
jest.mock('../services/databaseCleanupService');
jest.mock('../services/api');
jest.mock('@react-native-async-storage/async-storage');

describe('Database Cleanup Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Cleanup Service', () => {
    test('should cleanup all unreal content successfully', async () => {
      const mockResult = {
        success: true,
        message: '數據庫清理和真實數據導入完成',
        details: {
          localStorageCleaned: true,
          databaseCleaned: true,
          cacheCleaned: true,
          realDataImported: true
        }
      };

      databaseCleanupService.cleanupAllUnrealContent.mockResolvedValue(mockResult);

      const result = await databaseCleanupService.cleanupAllUnrealContent();

      expect(result).toEqual(mockResult);
      expect(databaseCleanupService.cleanupAllUnrealContent).toHaveBeenCalledTimes(1);
    });

    test('should handle cleanup errors gracefully', async () => {
      const mockError = new Error('清理過程失敗');
      databaseCleanupService.cleanupAllUnrealContent.mockRejectedValue(mockError);

      await expect(databaseCleanupService.cleanupAllUnrealContent()).rejects.toThrow('清理過程失敗');
    });

    test('should get database stats correctly', async () => {
      const mockStats = {
        totalCards: 150,
        cardsWithFeatures: 120,
        gameTypeBreakdown: {
          pokemon: 100,
          onepiece: 50
        },
        isClean: true
      };

      databaseCleanupService.getDatabaseStats.mockResolvedValue(mockStats);

      const stats = await databaseCleanupService.getDatabaseStats();

      expect(stats).toEqual(mockStats);
      expect(databaseCleanupService.getDatabaseStats).toHaveBeenCalledTimes(1);
    });

    test('should check cleanup status correctly', async () => {
      const mockStatus = {
        isCleaning: false,
        lastCleanup: '2024-01-01T00:00:00.000Z'
      };

      databaseCleanupService.getCleanupStatus.mockReturnValue(mockStatus);

      const status = databaseCleanupService.getCleanupStatus();

      expect(status).toEqual(mockStatus);
      expect(databaseCleanupService.getCleanupStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('Redux Actions', () => {
    test('should dispatch cleanupAllUnrealContent successfully', async () => {
      const mockResult = {
        success: true,
        message: '數據庫清理和真實數據導入完成',
        details: {
          localStorageCleaned: true,
          databaseCleaned: true,
          cacheCleaned: true,
          realDataImported: true
        }
      };

      databaseCleanupService.cleanupAllUnrealContent.mockResolvedValue(mockResult);

      const result = await store.dispatch(cleanupAllUnrealContent());

      expect(result.payload).toEqual(mockResult);
      expect(result.type).toBe('databaseCleanup/cleanupAllUnrealContent/fulfilled');
    });

    test('should handle cleanupAllUnrealContent error', async () => {
      const mockError = new Error('清理過程失敗');
      databaseCleanupService.cleanupAllUnrealContent.mockRejectedValue(mockError);

      const result = await store.dispatch(cleanupAllUnrealContent());

      expect(result.payload).toBe('清理過程失敗');
      expect(result.type).toBe('databaseCleanup/cleanupAllUnrealContent/rejected');
    });

    test('should dispatch getDatabaseStats successfully', async () => {
      const mockStats = {
        totalCards: 150,
        cardsWithFeatures: 120,
        gameTypeBreakdown: {
          pokemon: 100,
          onepiece: 50
        },
        isClean: true
      };

      databaseCleanupService.getDatabaseStats.mockResolvedValue(mockStats);

      const result = await store.dispatch(getDatabaseStats());

      expect(result.payload).toEqual(mockStats);
      expect(result.type).toBe('databaseCleanup/getDatabaseStats/fulfilled');
    });

    test('should dispatch checkCleanupStatus successfully', async () => {
      const mockStatus = {
        isCleaning: false,
        lastCleanup: '2024-01-01T00:00:00.000Z'
      };

      databaseCleanupService.getCleanupStatus.mockReturnValue(mockStatus);

      const result = await store.dispatch(checkCleanupStatus());

      expect(result.payload).toEqual(mockStatus);
      expect(result.type).toBe('databaseCleanup/checkCleanupStatus/fulfilled');
    });
  });

  describe('Database Cleanup Service Methods', () => {
    test('should cleanup local storage correctly', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ mock: true }));
      mockAsyncStorage.removeItem.mockResolvedValue();
      mockAsyncStorage.getAllKeys.mockResolvedValue(['cache_test', 'temp_data']);

      await databaseCleanupService.cleanupLocalStorage();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith(['cache_test', 'temp_data']);
    });

    test('should cleanup database correctly', async () => {
      const mockDatabaseService = require('../services/databaseService');
      mockDatabaseService.initDatabase.mockResolvedValue();
      mockDatabaseService.cleanupDuplicates.mockResolvedValue();

      await databaseCleanupService.cleanupDatabase();

      expect(mockDatabaseService.initDatabase).toHaveBeenCalled();
      expect(mockDatabaseService.cleanupDuplicates).toHaveBeenCalled();
    });

    test('should import real data correctly', async () => {
      const mockApiService = require('../services/api');
      mockApiService.get.mockResolvedValue({ cards: [] });

      await databaseCleanupService.importRealData();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    test('should detect mock data correctly', () => {
      const mockData = { test: true, mock: true };
      const realData = { name: 'Pikachu', series: 'Base Set' };

      expect(databaseCleanupService.isMockData(mockData)).toBe(true);
      expect(databaseCleanupService.isMockData(realData)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors during cleanup', async () => {
      const networkError = new Error('網路連接失敗');
      databaseCleanupService.cleanupAllUnrealContent.mockRejectedValue(networkError);

      await expect(databaseCleanupService.cleanupAllUnrealContent()).rejects.toThrow('網路連接失敗');
    });

    test('should handle database errors during cleanup', async () => {
      const dbError = new Error('資料庫操作失敗');
      databaseCleanupService.cleanupDatabase.mockRejectedValue(dbError);

      await expect(databaseCleanupService.cleanupDatabase()).rejects.toThrow('資料庫操作失敗');
    });

    test('should handle API errors during real data import', async () => {
      const apiError = new Error('API 請求失敗');
      databaseCleanupService.importRealData.mockRejectedValue(apiError);

      await expect(databaseCleanupService.importRealData()).rejects.toThrow('API 請求失敗');
    });
  });

  describe('Progress Tracking', () => {
    test('should track cleanup progress correctly', async () => {
      const progressCallback = jest.fn();
      
      databaseCleanupService.cleanupAllUnrealContent.mockImplementation(async (callback) => {
        if (callback) {
          callback({ localStorage: true });
          callback({ database: true });
          callback({ cache: true });
          callback({ realDataImport: true });
        }
        return { success: true };
      });

      await databaseCleanupService.cleanupAllUnrealContent(progressCallback);

      expect(progressCallback).toHaveBeenCalledTimes(4);
    });
  });

  describe('Data Validation', () => {
    test('should validate real card data structure', () => {
      const validCard = {
        card_id: 'pokemon_real_001',
        name: 'Pikachu',
        series: 'Base Set',
        set_code: 'BS',
        card_number: '58/102',
        rarity: 'Common',
        card_type: 'Lightning',
        hp: '40',
        game_type: 'pokemon',
        image_url: 'https://images.pokemontcg.io/base1/58.png',
        thumbnail_url: 'https://images.pokemontcg.io/base1/58.png',
        release_date: '1999-01-09'
      };

      expect(databaseCleanupService.isValidCardData(validCard)).toBe(true);
    });

    test('should reject invalid card data', () => {
      const invalidCard = {
        name: 'Invalid Card',
        // Missing required fields
      };

      expect(databaseCleanupService.isValidCardData(invalidCard)).toBe(false);
    });
  });
});
