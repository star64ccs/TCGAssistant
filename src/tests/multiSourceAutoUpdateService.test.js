import multiSourceAutoUpdateService, { DATA_SOURCE_TYPES } from '../services/multiSourceAutoUpdateService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundJob from 'react-native-background-job';
import cardService from '../services/cardService';
import databaseService from '../services/databaseService';
import integratedApiService from '../services/integratedApiService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-background-job');
jest.mock('../services/cardService');
jest.mock('../services/databaseService');
jest.mock('../services/integratedApiService');

describe('MultiSourceAutoUpdateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset service state
    multiSourceAutoUpdateService.isInitialized = false;
    multiSourceAutoUpdateService.isRunning = false;
    multiSourceAutoUpdateService.updateHistory = [];
    
    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    
    // Mock BackgroundJob
    BackgroundJob.register.mockResolvedValue();
    BackgroundJob.schedule.mockResolvedValue();
    BackgroundJob.cancel.mockResolvedValue();
    
    // Mock services
    cardService.checkBGSCrawlerStatus.mockResolvedValue({ available: true });
    cardService.getCardGradingInfo.mockResolvedValue({ success: true, data: {} });
    cardService.updateCardRecognitionWithGrading.mockResolvedValue();
    cardService.cleanupExpiredGradingData.mockResolvedValue();
    
    databaseService.searchCards.mockResolvedValue([
      { card_id: '1', name: 'Test Card', series: 'Test Series', last_grading_update: null },
      { card_id: '2', name: 'Test Card 2', series: 'Test Series', last_pricing_update: null },
    ]);
    
    integratedApiService.getCardPrices.mockResolvedValue({
      success: true,
      data: { platforms: { tcgplayer: 100 } }
    });
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await multiSourceAutoUpdateService.init();
      
      expect(multiSourceAutoUpdateService.isInitialized).toBe(true);
      expect(BackgroundJob.register).toHaveBeenCalled();
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    test('should not initialize twice', async () => {
      await multiSourceAutoUpdateService.init();
      await multiSourceAutoUpdateService.init();
      
      expect(BackgroundJob.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto Update Toggle', () => {
    test('should enable auto update', async () => {
      // Mock AsyncStorage to return the saved settings
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'multi_source_auto_update_settings') {
          return Promise.resolve(JSON.stringify({ enabled: true, updateTime: '03:00' }));
        }
        return Promise.resolve(null);
      });
      
      const result = await multiSourceAutoUpdateService.enableAutoUpdate('03:00');
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(BackgroundJob.schedule).toHaveBeenCalled();
    });

    test('should disable auto update', async () => {
      const result = await multiSourceAutoUpdateService.disableAutoUpdate();
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(BackgroundJob.cancel).toHaveBeenCalled();
    });

    test('should check if auto update is enabled', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ enabled: true }));
      
      const isEnabled = await multiSourceAutoUpdateService.isAutoUpdateEnabled();
      
      expect(isEnabled).toBe(true);
    });

    test('should get update time', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ updateTime: '04:00' }));
      
      const updateTime = await multiSourceAutoUpdateService.getUpdateTime();
      
      expect(updateTime).toBe('04:00');
    });

    test('should set update time', async () => {
      const result = await multiSourceAutoUpdateService.setUpdateTime('05:00');
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Data Source Management', () => {
    test('should toggle data source', async () => {
      const result = await multiSourceAutoUpdateService.toggleDataSource('pricing.tcgplayer', false);
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should set source update interval', async () => {
      const result = await multiSourceAutoUpdateService.setSourceUpdateInterval('pricing.tcgplayer', 12);
      
      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should get data source status', async () => {
      const status = await multiSourceAutoUpdateService.getDataSourceStatus();
      
      expect(status).toHaveProperty('grading');
      expect(status).toHaveProperty('pricing');
      expect(status).toHaveProperty('card_data');
      expect(status).toHaveProperty('market_data');
    });

    test('should find source by key', () => {
      const source = multiSourceAutoUpdateService.findSourceByKey('pricing.tcgplayer');
      
      expect(source).toBeDefined();
      expect(source.name).toBe('TCGPlayer');
    });

    test('should return null for invalid source key', () => {
      const source = multiSourceAutoUpdateService.findSourceByKey('invalid.key');
      
      expect(source).toBeNull();
    });
  });

  describe('Manual Update', () => {
    test('should trigger manual update for all sources', async () => {
      // Mock network check
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
      
      const result = await multiSourceAutoUpdateService.triggerManualUpdate();
      
      expect(result.success).toBe(true);
    });

    test('should trigger manual update for specific source', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
      
      const result = await multiSourceAutoUpdateService.triggerManualUpdate(['pricing.tcgplayer']);
      
      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
    });

    test('should handle manual update failure', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await multiSourceAutoUpdateService.triggerManualUpdate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Data Source Updates', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
    });

    test('should update grading data', async () => {
      const result = await multiSourceAutoUpdateService.updateGradingData({
        sourceKey: 'psa',
        type: DATA_SOURCE_TYPES.GRADING,
        name: 'PSA Grading'
      });
      
      expect(result).toBeGreaterThanOrEqual(0);
      expect(cardService.getCardGradingInfo).toHaveBeenCalled();
    });

    test('should update pricing data', async () => {
      const result = await multiSourceAutoUpdateService.updatePricingData({
        sourceKey: 'tcgplayer',
        type: DATA_SOURCE_TYPES.PRICING,
        name: 'TCGPlayer'
      });
      
      expect(result).toBeGreaterThanOrEqual(0);
      expect(integratedApiService.getCardPrices).toHaveBeenCalled();
    });

    test('should update card data', async () => {
      const result = await multiSourceAutoUpdateService.updateCardData({
        sourceKey: 'pokemonApi',
        type: DATA_SOURCE_TYPES.CARD_DATA,
        name: 'Pokemon API'
      });
      
      expect(result).toBeGreaterThanOrEqual(0);
    });

    test('should update market data', async () => {
      const result = await multiSourceAutoUpdateService.updateMarketData({
        sourceKey: 'marketAnalytics',
        type: DATA_SOURCE_TYPES.MARKET_DATA,
        name: 'Market Analytics'
      });
      
      expect(result).toBe(0); // Currently returns 0 as it's not implemented
    });
  });

  describe('Card Update Logic', () => {
    test('should get cards to update for grading', async () => {
      const cards = await multiSourceAutoUpdateService.getCardsToUpdate('grading');
      
      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
    });

    test('should get cards to update for pricing', async () => {
      const cards = await multiSourceAutoUpdateService.getCardsToUpdate('pricing');
      
      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
    });

    test('should get cards to update for card data', async () => {
      const cards = await multiSourceAutoUpdateService.getCardsToUpdate('card_data');
      
      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
    });

    test('should handle database error when getting cards', async () => {
      databaseService.searchCards.mockRejectedValue(new Error('Database error'));
      
      const cards = await multiSourceAutoUpdateService.getCardsToUpdate('grading');
      
      expect(cards).toEqual([]);
    });
  });

  describe('Batch Operations', () => {
    test('should batch update grading data', async () => {
      const cards = [
        { card_id: '1', name: 'Test Card', series: 'Test Series' },
        { card_id: '2', name: 'Test Card 2', series: 'Test Series' }
      ];
      
      const result = await multiSourceAutoUpdateService.batchUpdateGradingData(cards);
      
      expect(result).toBeGreaterThanOrEqual(0);
      expect(cardService.getCardGradingInfo).toHaveBeenCalledTimes(cards.length);
    });

    test('should handle errors in batch update', async () => {
      cardService.getCardGradingInfo.mockRejectedValue(new Error('API error'));
      
      const cards = [{ card_id: '1', name: 'Test Card', series: 'Test Series' }];
      
      const result = await multiSourceAutoUpdateService.batchUpdateGradingData(cards);
      
      expect(result).toBe(0);
    });
  });

  describe('Utility Functions', () => {
    test('should check if source should be updated', () => {
      const source = {
        lastUpdate: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        updateInterval: 24
      };
      
      const shouldUpdate = multiSourceAutoUpdateService.shouldUpdateSource(source);
      
      expect(shouldUpdate).toBe(true);
    });

    test('should not update source if recently updated', () => {
      const source = {
        lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        updateInterval: 24
      };
      
      const shouldUpdate = multiSourceAutoUpdateService.shouldUpdateSource(source);
      
      expect(shouldUpdate).toBe(false);
    });

    test('should update source if never updated', () => {
      const source = {
        lastUpdate: null,
        updateInterval: 24
      };
      
      const shouldUpdate = multiSourceAutoUpdateService.shouldUpdateSource(source);
      
      expect(shouldUpdate).toBe(true);
    });

    test('should check network connection', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
      
      const isConnected = await multiSourceAutoUpdateService.checkNetworkConnection();
      
      expect(isConnected).toBe(true);
    });

    test('should detect network failure', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const isConnected = await multiSourceAutoUpdateService.checkNetworkConnection();
      
      expect(isConnected).toBe(false);
    });

    test('should delay execution', async () => {
      const start = Date.now();
      
      await multiSourceAutoUpdateService.delay(100);
      
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('History Management', () => {
    test('should record update result', async () => {
      const results = {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        summary: { total: 5, successful: 3, failed: 1, skipped: 1 }
      };
      
      await multiSourceAutoUpdateService.recordUpdateResult(results);
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(multiSourceAutoUpdateService.updateHistory.length).toBe(1);
    });

    test('should record update error', async () => {
      const error = new Error('Update failed');
      
      await multiSourceAutoUpdateService.recordUpdateError(error);
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(multiSourceAutoUpdateService.updateHistory.length).toBe(1);
    });

    test('should get update history', async () => {
      multiSourceAutoUpdateService.updateHistory = [
        { id: 1, timestamp: new Date().toISOString() },
        { id: 2, timestamp: new Date().toISOString() }
      ];
      
      const history = await multiSourceAutoUpdateService.getUpdateHistory(1);
      
      expect(history.length).toBe(1);
    });

    test('should get last update time', async () => {
      const lastUpdate = new Date().toISOString();
      AsyncStorage.getItem.mockResolvedValue(lastUpdate);
      
      const result = await multiSourceAutoUpdateService.getLastUpdateTime();
      
      expect(result).toEqual(new Date(lastUpdate));
    });

    test('should update last update time', async () => {
      await multiSourceAutoUpdateService.updateLastUpdateTime();
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Service Status', () => {
    test('should get service status', async () => {
      const status = await multiSourceAutoUpdateService.getServiceStatus();
      
      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('isEnabled');
      expect(status).toHaveProperty('updateTime');
      expect(status).toHaveProperty('lastUpdate');
      expect(status).toHaveProperty('dataSources');
      expect(status).toHaveProperty('updateHistory');
    });
  });

  describe('Priority Grouping', () => {
    test('should group sources by priority', () => {
      const groups = multiSourceAutoUpdateService.groupSourcesByPriority();
      
      expect(groups).toHaveProperty('high');
      expect(groups).toHaveProperty('medium');
      expect(groups).toHaveProperty('low');
      expect(Array.isArray(groups.high)).toBe(true);
      expect(Array.isArray(groups.medium)).toBe(true);
      expect(Array.isArray(groups.low)).toBe(true);
    });

    test('should only include enabled sources', () => {
      // Disable all sources
      Object.values(multiSourceAutoUpdateService.dataSources).forEach(typeSources => {
        Object.values(typeSources).forEach(source => {
          source.enabled = false;
        });
      });
      
      const groups = multiSourceAutoUpdateService.groupSourcesByPriority();
      
      expect(groups.high.length).toBe(0);
      expect(groups.medium.length).toBe(0);
      expect(groups.low.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization error', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      await expect(multiSourceAutoUpdateService.init()).rejects.toThrow('Storage error');
    });

    test('should handle enable auto update error', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await multiSourceAutoUpdateService.enableAutoUpdate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });

    test('should handle disable auto update error', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await multiSourceAutoUpdateService.disableAutoUpdate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });

    test('should handle toggle data source error', async () => {
      const result = await multiSourceAutoUpdateService.toggleDataSource('invalid.key', true);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('找不到資料來源: invalid.key');
    });

    test('should handle set update interval error', async () => {
      const result = await multiSourceAutoUpdateService.setSourceUpdateInterval('invalid.key', 12);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('找不到資料來源: invalid.key');
    });
  });

  describe('Data Source Types', () => {
    test('should have correct data source types', () => {
      expect(DATA_SOURCE_TYPES.GRADING).toBe('grading');
      expect(DATA_SOURCE_TYPES.PRICING).toBe('pricing');
      expect(DATA_SOURCE_TYPES.CARD_DATA).toBe('card_data');
      expect(DATA_SOURCE_TYPES.MARKET_DATA).toBe('market_data');
      expect(DATA_SOURCE_TYPES.NEWS).toBe('news');
      expect(DATA_SOURCE_TYPES.ANALYTICS).toBe('analytics');
    });
  });
});
