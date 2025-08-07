import BackgroundJob from 'react-native-background-job';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import cardService from './cardService';
import databaseService from './databaseService';
import integratedApiService from './integratedApiService';
import { PRICE_SOURCES } from '../constants';

// 儲存鍵值
const STORAGE_KEYS = {
  AUTO_UPDATE_SETTINGS: 'multi_source_auto_update_settings',
  AUTO_UPDATE_HISTORY: 'multi_source_auto_update_history',
  LAST_UPDATE_TIME: 'multi_source_last_update_time',
  SOURCE_STATUS: 'multi_source_status',
  UPDATE_SCHEDULES: 'multi_source_update_schedules',
};

// 背景任務鍵值
const BACKGROUND_JOB_KEY = 'multi_source_auto_update';

// 支援的資料來源類型
export const DATA_SOURCE_TYPES = {
  GRADING: 'grading',           // 評級資料 (BGC, PSA, etc.)
  PRICING: 'pricing',           // 價格資料 (TCGPlayer, eBay, etc.)
  CARD_DATA: 'card_data',       // 卡牌基本資料
  MARKET_DATA: 'market_data',   // 市場趨勢資料
  NEWS: 'news',                 // 新聞和公告
  ANALYTICS: 'analytics',       // 分析資料
};

// 預設資料來源配置
const DEFAULT_DATA_SOURCES = {
  [DATA_SOURCE_TYPES.GRADING]: {
    psa: {
      name: 'PSA Grading',
      enabled: false,
      updateInterval: 24,
      priority: 'medium',
      service: 'psaService',
      lastUpdate: null,
      status: 'idle',
    },
  },
  [DATA_SOURCE_TYPES.PRICING]: {
    tcgplayer: {
      name: 'TCGPlayer',
      enabled: true,
      updateInterval: 6, // 小時
      priority: 'high',
      service: 'tcgPlayerService',
      lastUpdate: null,
      status: 'idle',
    },
    ebay: {
      name: 'eBay',
      enabled: true,
      updateInterval: 6,
      priority: 'medium',
      service: 'ebayService',
      lastUpdate: null,
      status: 'idle',
    },
    cardmarket: {
      name: 'Cardmarket',
      enabled: true,
      updateInterval: 6,
      priority: 'medium',
      service: 'cardmarketService',
      lastUpdate: null,
      status: 'idle',
    },
    pricecharting: {
      name: 'Price Charting',
      enabled: true,
      updateInterval: 12,
      priority: 'low',
      service: 'priceChartingService',
      lastUpdate: null,
      status: 'idle',
    },
  },
  [DATA_SOURCE_TYPES.CARD_DATA]: {
    pokemonApi: {
      name: 'Pokemon API',
      enabled: true,
      updateInterval: 168, // 週
      priority: 'low',
      service: 'pokemonApiService',
      lastUpdate: null,
      status: 'idle',
    },
    onePieceApi: {
      name: 'One Piece API',
      enabled: true,
      updateInterval: 168,
      priority: 'low',
      service: 'onePieceApiService',
      lastUpdate: null,
      status: 'idle',
    },
  },
  [DATA_SOURCE_TYPES.MARKET_DATA]: {
    marketAnalytics: {
      name: 'Market Analytics',
      enabled: true,
      updateInterval: 24,
      priority: 'medium',
      service: 'marketAnalyticsService',
      lastUpdate: null,
      status: 'idle',
    },
  },
};

class MultiSourceAutoUpdateService {
  constructor() {
    this.isInitialized = false;
    this.defaultUpdateTime = '02:00';
    this.dataSources = { ...DEFAULT_DATA_SOURCES };
    this.updateHistory = [];
    this.isRunning = false;
  }

  // 初始化服務
  async init() {
    if (this.isInitialized) return;

    try {
      // 載入設定
      await this.loadSettings();
      
      // 註冊背景任務
      await this.registerBackgroundJob();
      
      // 載入更新歷史
      await this.loadUpdateHistory();
      
      this.isInitialized = true;
      console.log('多源自動更新服務初始化完成');
    } catch (error) {
      console.error('多源自動更新服務初始化失敗:', error);
      throw error;
    }
  }

  // 註冊背景任務
  async registerBackgroundJob() {
    try {
      await BackgroundJob.register({
        jobKey: BACKGROUND_JOB_KEY,
        job: () => this.performMultiSourceUpdate(),
      });
      console.log('多源自動更新背景任務註冊成功');
    } catch (error) {
      console.error('背景任務註冊失敗:', error);
    }
  }

  // 啟用自動更新
  async enableAutoUpdate(updateTime = this.defaultUpdateTime) {
    try {
      const settings = await this.getUpdateSettings();
      settings.enabled = true;
      settings.updateTime = updateTime;
      
      await this.saveUpdateSettings(settings);
      await this.scheduleAutoUpdate();
      
      console.log('多源自動更新已啟用，更新時間:', updateTime);
      return { success: true };
    } catch (error) {
      console.error('啟用自動更新失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 停用自動更新
  async disableAutoUpdate() {
    try {
      const settings = await this.getUpdateSettings();
      settings.enabled = false;
      
      await this.saveUpdateSettings(settings);
      await this.cancelAutoUpdate();
      
      console.log('多源自動更新已停用');
      return { success: true };
    } catch (error) {
      console.error('停用自動更新失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 檢查自動更新是否啟用
  async isAutoUpdateEnabled() {
    const settings = await this.getUpdateSettings();
    return settings.enabled || false;
  }

  // 獲取更新時間
  async getUpdateTime() {
    const settings = await this.getUpdateSettings();
    return settings.updateTime || this.defaultUpdateTime;
  }

  // 設定更新時間
  async setUpdateTime(updateTime) {
    try {
      const settings = await this.getUpdateSettings();
      settings.updateTime = updateTime;
      
      await this.saveUpdateSettings(settings);
      
      if (settings.enabled) {
        await this.scheduleAutoUpdate();
      }
      
      return { success: true };
    } catch (error) {
      console.error('設定更新時間失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 排程自動更新
  async scheduleAutoUpdate() {
    try {
      const settings = await this.getUpdateSettings();
      if (!settings.enabled) return;

      const [hours, minutes] = settings.updateTime.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // 如果今天的時間已過，設定為明天
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      await BackgroundJob.schedule({
        jobKey: BACKGROUND_JOB_KEY,
        delay,
        period: 24 * 60 * 60 * 1000, // 24小時
      });

      console.log('多源自動更新已排程，下次更新時間:', scheduledTime);
    } catch (error) {
      console.error('排程自動更新失敗:', error);
    }
  }

  // 取消自動更新
  async cancelAutoUpdate() {
    try {
      await BackgroundJob.cancel({ jobKey: BACKGROUND_JOB_KEY });
      console.log('多源自動更新已取消');
    } catch (error) {
      console.error('取消自動更新失敗:', error);
    }
  }

  // 執行多源更新
  async performMultiSourceUpdate(throwOnError = false) {
    if (this.isRunning) {
      console.log('多源更新已在執行中，跳過本次更新');
      return;
    }

    this.isRunning = true;
    const updateStartTime = new Date();
    const results = {
      startTime: updateStartTime.toISOString(),
      endTime: null,
      sources: {},
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
      },
    };

    try {
      console.log('開始執行多源自動更新...');

      // 檢查網路連線
      if (!(await this.checkNetworkConnection())) {
        throw new Error('網路連線不可用');
      }

      // 按優先級和類型分組執行更新
      const updateGroups = this.groupSourcesByPriority();
      
      for (const [priority, sources] of Object.entries(updateGroups)) {
        console.log(`執行 ${priority} 優先級更新...`);
        
        for (const source of sources) {
          const sourceResult = await this.updateSingleSource(source);
          results.sources[source.key] = sourceResult;
          
          // 更新統計
          results.summary.total++;
          if (sourceResult.success) {
            results.summary.successful++;
          } else if (sourceResult.skipped) {
            results.summary.skipped++;
          } else {
            results.summary.failed++;
          }
        }
      }

      // 清理過期資料
      await this.cleanupExpiredData();
      
      // 記錄更新結果
      results.endTime = new Date().toISOString();
      await this.recordUpdateResult(results);
      
      console.log('多源自動更新完成:', results.summary);
      
    } catch (error) {
      console.error('多源自動更新失敗:', error);
      await this.recordUpdateError(error);
      
      // 如果是手動觸發的更新，重新拋出錯誤
      if (throwOnError) {
        throw error;
      }
    } finally {
      this.isRunning = false;
    }
  }

  // 按優先級分組資料來源
  groupSourcesByPriority() {
    const groups = {
      high: [],
      medium: [],
      low: [],
    };

    for (const [type, sources] of Object.entries(this.dataSources)) {
      for (const [key, source] of Object.entries(sources)) {
        if (source.enabled) {
          groups[source.priority].push({
            key: `${type}.${key}`,
            type,
            sourceKey: key,
            ...source,
          });
        }
      }
    }

    return groups;
  }

  // 更新單一資料來源
  async updateSingleSource(source) {
    const result = {
      source: source.key,
      type: source.type,
      startTime: new Date().toISOString(),
      endTime: null,
      success: false,
      skipped: false,
      error: null,
      dataUpdated: 0,
    };

    try {
      // 檢查是否需要更新
      if (!this.shouldUpdateSource(source)) {
        result.skipped = true;
        result.endTime = new Date().toISOString();
        return result;
      }

      console.log(`更新資料來源: ${source.name}`);

      // 根據來源類型執行不同的更新邏輯
      switch (source.type) {
        case DATA_SOURCE_TYPES.GRADING:
          result.dataUpdated = await this.updateGradingData(source);
          break;
        case DATA_SOURCE_TYPES.PRICING:
          result.dataUpdated = await this.updatePricingData(source);
          break;
        case DATA_SOURCE_TYPES.CARD_DATA:
          result.dataUpdated = await this.updateCardData(source);
          break;
        case DATA_SOURCE_TYPES.MARKET_DATA:
          result.dataUpdated = await this.updateMarketData(source);
          break;
        default:
          throw new Error(`不支援的資料來源類型: ${source.type}`);
      }

      result.success = true;
      
      // 更新來源狀態
      await this.updateSourceStatus(source.key, 'success', result.dataUpdated);
      
    } catch (error) {
      console.error(`更新資料來源失敗 ${source.name}:`, error);
      result.error = error.message;
      await this.updateSourceStatus(source.key, 'error', 0, error.message);
    } finally {
      result.endTime = new Date().toISOString();
    }

    return result;
  }

  // 檢查是否應該更新資料來源
  shouldUpdateSource(source) {
    if (!source.lastUpdate) return true;
    
    const lastUpdate = new Date(source.lastUpdate);
    const now = new Date();
    const hoursSinceLastUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    return hoursSinceLastUpdate >= source.updateInterval;
  }

  // 更新評級資料
  async updateGradingData(source) {
    switch (source.sourceKey) {
      case 'bgc':
        return await this.updateBGCGradingData();
      case 'psa':
        return await this.updatePSAGradingData();
      default:
        throw new Error(`不支援的評級來源: ${source.sourceKey}`);
    }
  }

  // 更新BGC評級資料 (已移除)
  async updateBGCGradingData() {
    console.log('BGC評級資料更新功能已移除');
    return 0;
  }

  // 更新PSA評級資料
  async updatePSAGradingData() {
    // TODO: 實作PSA評級資料更新
    console.log('PSA評級資料更新功能待實作');
    return 0;
  }

  // 更新價格資料
  async updatePricingData(source) {
    try {
      const cardsToUpdate = await this.getCardsToUpdate('pricing');
      
      if (cardsToUpdate.length === 0) {
        console.log('沒有需要更新的價格資料');
        return 0;
      }

      let updatedCount = 0;
      
      for (const card of cardsToUpdate) {
        try {
          // 使用整合API服務獲取最新價格
          const priceResult = await integratedApiService.getCardPrices(card, {
            useRealApi: true,
            useFallback: false,
            platforms: [source.sourceKey.toUpperCase()],
          });

          if (priceResult.success) {
            // 更新資料庫中的價格資料
            await databaseService.updateCardPricingData(card.card_id, {
              source: source.sourceKey,
              price: priceResult.data.platforms[source.sourceKey],
              timestamp: new Date().toISOString(),
            });
            
            updatedCount++;
          }

          // 避免請求過於頻繁
          await this.delay(1000);
          
        } catch (error) {
          console.error(`更新卡牌 ${card.name} 價格失敗:`, error);
        }
      }

      console.log(`${source.name} 價格資料更新完成，更新了 ${updatedCount} 張卡牌`);
      return updatedCount;
      
    } catch (error) {
      console.error(`更新 ${source.name} 價格資料失敗:`, error);
      throw error;
    }
  }

  // 更新卡牌基本資料
  async updateCardData(source) {
    try {
      const cardsToUpdate = await this.getCardsToUpdate('card_data');
      
      if (cardsToUpdate.length === 0) {
        console.log('沒有需要更新的卡牌資料');
        return 0;
      }

      let updatedCount = 0;
      
      for (const card of cardsToUpdate) {
        try {
          // 根據遊戲類型選擇對應的API
          switch (source.sourceKey) {
            case 'pokemonApi':
              if (card.game_type === 'pokemon') {
                await this.updatePokemonCardData(card);
                updatedCount++;
              }
              break;
            case 'onePieceApi':
              if (card.game_type === 'one-piece') {
                await this.updateOnePieceCardData(card);
                updatedCount++;
              }
              break;
          }

          await this.delay(500);
          
        } catch (error) {
          console.error(`更新卡牌 ${card.name} 資料失敗:`, error);
        }
      }

      console.log(`${source.name} 卡牌資料更新完成，更新了 ${updatedCount} 張卡牌`);
      return updatedCount;
      
    } catch (error) {
      console.error(`更新 ${source.name} 卡牌資料失敗:`, error);
      throw error;
    }
  }

  // 更新市場資料
  async updateMarketData(source) {
    try {
      // TODO: 實作市場資料更新
      console.log('市場資料更新功能待實作');
      return 0;
    } catch (error) {
      console.error(`更新 ${source.name} 市場資料失敗:`, error);
      throw error;
    }
  }

  // 批次更新評級資料
  async batchUpdateGradingData(cards) {
    let updatedCount = 0;
    
    for (const card of cards) {
      try {
        const gradingResult = await cardService.getCardGradingInfo(card.name, card.series);
        
        if (gradingResult.success) {
          await cardService.updateCardRecognitionWithGrading(card.card_id, gradingResult.data);
          updatedCount++;
        }

        // 避免請求過於頻繁
        await this.delay(2000);
        
      } catch (error) {
        console.error(`更新卡牌 ${card.name} 評級資料失敗:`, error);
      }
    }

    return updatedCount;
  }

  // 更新Pokemon卡牌資料
  async updatePokemonCardData(card) {
    // TODO: 實作Pokemon API更新
    console.log(`更新Pokemon卡牌資料: ${card.name}`);
  }

  // 更新One Piece卡牌資料
  async updateOnePieceCardData(card) {
    // TODO: 實作One Piece API更新
    console.log(`更新One Piece卡牌資料: ${card.name}`);
  }

  // 獲取需要更新的卡牌
  async getCardsToUpdate(dataType) {
    try {
      const cards = await databaseService.searchCards('', { limit: 1000 });
      
      // 根據資料類型篩選需要更新的卡牌
      switch (dataType) {
        case 'grading':
          // 評級資料：超過7天未更新的卡牌
          return cards.filter(card => {
            const lastUpdate = card.last_grading_update;
            if (!lastUpdate) return true;
            
            const daysSinceUpdate = (new Date() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate >= 7;
          });
          
        case 'pricing':
          // 價格資料：超過6小時未更新的卡牌
          return cards.filter(card => {
            const lastUpdate = card.last_pricing_update;
            if (!lastUpdate) return true;
            
            const hoursSinceUpdate = (new Date() - new Date(lastUpdate)) / (1000 * 60 * 60);
            return hoursSinceUpdate >= 6;
          });
          
        case 'card_data':
          // 卡牌基本資料：超過1週未更新的卡牌
          return cards.filter(card => {
            const lastUpdate = card.last_card_data_update;
            if (!lastUpdate) return true;
            
            const daysSinceUpdate = (new Date() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate >= 7;
          });
          
        default:
          return cards;
      }
    } catch (error) {
      console.error('獲取需要更新的卡牌失敗:', error);
      return [];
    }
  }

  // 手動觸發更新
  async triggerManualUpdate(sources = null) {
    try {
      console.log('手動觸發多源更新...');
      
      if (sources) {
        // 更新指定的資料來源
        const results = {};
        for (const sourceKey of sources) {
          const source = this.findSourceByKey(sourceKey);
          if (source) {
            results[sourceKey] = await this.updateSingleSource(source);
          }
        }
        return { success: true, results };
      } else {
        // 執行完整更新
        await this.performMultiSourceUpdate(true); // 手動觸發時拋出錯誤
        return { success: true };
      }
    } catch (error) {
      console.error('手動更新失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 根據鍵值查找資料來源
  findSourceByKey(sourceKey) {
    for (const [type, sources] of Object.entries(this.dataSources)) {
      for (const [key, source] of Object.entries(sources)) {
        if (`${type}.${key}` === sourceKey) {
          return {
            key: sourceKey,
            type,
            sourceKey: key,
            ...source,
          };
        }
      }
    }
    return null;
  }

  // 啟用/停用特定資料來源
  async toggleDataSource(sourceKey, enabled) {
    try {
      const [type, key] = sourceKey.split('.');
      
      if (this.dataSources[type] && this.dataSources[type][key]) {
        this.dataSources[type][key].enabled = enabled;
        await this.saveDataSources();
        
        console.log(`資料來源 ${sourceKey} ${enabled ? '已啟用' : '已停用'}`);
        return { success: true };
      } else {
        throw new Error(`找不到資料來源: ${sourceKey}`);
      }
    } catch (error) {
      console.error('切換資料來源狀態失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 設定資料來源更新間隔
  async setSourceUpdateInterval(sourceKey, interval) {
    try {
      const [type, key] = sourceKey.split('.');
      
      if (this.dataSources[type] && this.dataSources[type][key]) {
        this.dataSources[type][key].updateInterval = interval;
        await this.saveDataSources();
        
        console.log(`資料來源 ${sourceKey} 更新間隔已設定為 ${interval} 小時`);
        return { success: true };
      } else {
        throw new Error(`找不到資料來源: ${sourceKey}`);
      }
    } catch (error) {
      console.error('設定更新間隔失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 獲取資料來源狀態
  async getDataSourceStatus() {
    const status = {};
    
    for (const [type, sources] of Object.entries(this.dataSources)) {
      status[type] = {};
      for (const [key, source] of Object.entries(sources)) {
        status[type][key] = {
          name: source.name,
          enabled: source.enabled,
          status: source.status,
          lastUpdate: source.lastUpdate,
          updateInterval: source.updateInterval,
          priority: source.priority,
        };
      }
    }
    
    return status;
  }

  // 更新資料來源狀態
  async updateSourceStatus(sourceKey, status, dataUpdated = 0, error = null) {
    try {
      const [type, key] = sourceKey.split('.');
      
      if (this.dataSources[type] && this.dataSources[type][key]) {
        this.dataSources[type][key].status = status;
        this.dataSources[type][key].lastUpdate = new Date().toISOString();
        
        await this.saveDataSources();
      }
    } catch (error) {
      console.error('更新資料來源狀態失敗:', error);
    }
  }

  // 檢查網路連線
  async checkNetworkConnection() {
    try {
      // 簡單的網路連線檢查
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      console.error('網路連線檢查失敗:', error);
      return false;
    }
  }

  // 清理過期資料
  async cleanupExpiredData() {
    try {
      await cardService.cleanupExpiredGradingData();
      console.log('過期資料清理完成');
    } catch (error) {
      console.error('清理過期資料失敗:', error);
    }
  }

  // 記錄更新結果
  async recordUpdateResult(results) {
    try {
      this.updateHistory.unshift(results);
      
      // 保持最近100條記錄
      if (this.updateHistory.length > 100) {
        this.updateHistory = this.updateHistory.slice(0, 100);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_UPDATE_HISTORY, JSON.stringify(this.updateHistory));
      await this.updateLastUpdateTime();
      
    } catch (error) {
      console.error('記錄更新結果失敗:', error);
    }
  }

  // 記錄更新錯誤
  async recordUpdateError(error) {
    try {
      const errorRecord = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
      };
      
      this.updateHistory.unshift({
        startTime: errorRecord.timestamp,
        endTime: errorRecord.timestamp,
        error: errorRecord,
        summary: { total: 0, successful: 0, failed: 1, skipped: 0 },
      });
      
      if (this.updateHistory.length > 100) {
        this.updateHistory = this.updateHistory.slice(0, 100);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_UPDATE_HISTORY, JSON.stringify(this.updateHistory));
      
    } catch (saveError) {
      console.error('記錄更新錯誤失敗:', saveError);
    }
  }

  // 獲取更新歷史
  async getUpdateHistory(limit = 50) {
    try {
      return this.updateHistory.slice(0, limit);
    } catch (error) {
      console.error('獲取更新歷史失敗:', error);
      return [];
    }
  }

  // 載入更新歷史
  async loadUpdateHistory() {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_UPDATE_HISTORY);
      if (historyData) {
        this.updateHistory = JSON.parse(historyData);
      }
    } catch (error) {
      console.error('載入更新歷史失敗:', error);
      this.updateHistory = [];
    }
  }

  // 獲取最後更新時間
  async getLastUpdateTime() {
    try {
      const lastUpdate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE_TIME);
      return lastUpdate ? new Date(lastUpdate) : null;
    } catch (error) {
      console.error('獲取最後更新時間失敗:', error);
      return null;
    }
  }

  // 更新最後更新時間
  async updateLastUpdateTime() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE_TIME, new Date().toISOString());
    } catch (error) {
      console.error('更新最後更新時間失敗:', error);
    }
  }

  // 獲取更新設定
  async getUpdateSettings() {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_UPDATE_SETTINGS);
      if (settingsData) {
        return JSON.parse(settingsData);
      }
      return {
        enabled: false,
        updateTime: this.defaultUpdateTime,
      };
    } catch (error) {
      console.error('獲取更新設定失敗:', error);
      return {
        enabled: false,
        updateTime: this.defaultUpdateTime,
      };
    }
  }

  // 儲存更新設定
  async saveUpdateSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_UPDATE_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('儲存更新設定失敗:', error);
      throw error; // 重新拋出錯誤
    }
  }

  // 載入設定
  async loadSettings() {
    try {
      await this.loadUpdateHistory();
      
      // 載入資料來源設定
      const sourcesData = await AsyncStorage.getItem(STORAGE_KEYS.SOURCE_STATUS);
      if (sourcesData) {
        const savedSources = JSON.parse(sourcesData);
        this.dataSources = { ...this.dataSources, ...savedSources };
      }
    } catch (error) {
      console.error('載入設定失敗:', error);
      throw error; // 重新拋出錯誤
    }
  }

  // 儲存資料來源設定
  async saveDataSources() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SOURCE_STATUS, JSON.stringify(this.dataSources));
    } catch (error) {
      console.error('儲存資料來源設定失敗:', error);
    }
  }

  // 獲取服務狀態
  async getServiceStatus() {
    const settings = await this.getUpdateSettings();
    const lastUpdate = await this.getLastUpdateTime();
    const dataSourceStatus = await this.getDataSourceStatus();
    
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      isEnabled: settings.enabled,
      updateTime: settings.updateTime,
      lastUpdate: lastUpdate?.toISOString(),
      dataSources: dataSourceStatus,
      updateHistory: this.updateHistory.length,
    };
  }

  // 延遲函數
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new MultiSourceAutoUpdateService();
