import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/apiConfig';
import apiService from './api';
import cachedRequest from '../utils/cachedRequest';

// 緩存配置
const COLLECTION_CACHE_KEY = 'collection_data';
const COLLECTION_CACHE_DURATION = 5 * 60 * 1000; // 5分鐘

// 收藏服務
export const collectionService = {
  // 獲取用戶收藏列表
  getCollection: async (params = {}) => {
    try {
      const response = await cachedRequest(
        COLLECTION_CACHE_KEY,
        () => apiService.get(API_ENDPOINTS.COLLECTION.LIST, params),
        COLLECTION_CACHE_DURATION,
      );
        // 處理收藏數據，計算盈虧
      const processedCards = response.cards.map(card => ({
        ...card,
        profitLoss: (card.currentPrice || 0) - (card.purchasePrice || 0),
        profitLossPercentage: card.purchasePrice > 0
          ? ((card.currentPrice - card.purchasePrice) / card.purchasePrice) * 100
          : 0,
      }));
      return {
        ...response,
        cards: processedCards,
      };
    } catch (error) {
      throw error;
    }
  },

  // 添加卡牌到收藏
  addToCollection: async (cardData) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.COLLECTION.ADD, cardData);
      // 清除緩存以確保數據同步
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 從收藏移除卡牌
  removeFromCollection: async (cardId) => {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.COLLECTION.REMOVE
      }/${ cardId }`);
        // 清除緩存以確保數據同步
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 更新卡牌資訊
  updateCardInfo: async (cardId, updates) => {
    try {
      const response = await apiService.put(`${API_ENDPOINTS.COLLECTION.UPDATE
      }/${ cardId }`, updates);
        // 清除緩存以確保數據同步
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 獲取收藏統計數據
  getCollectionStats: async () => {
    try {
      const response = await cachedRequest(
        `${COLLECTION_CACHE_KEY
        }_stats`,
        () => apiService.get(API_ENDPOINTS.COLLECTION.STATS),
        COLLECTION_CACHE_DURATION,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 切換收藏狀態
  toggleFavorite: async (cardId) => {
    try {
      const response = await apiService.put(`${API_ENDPOINTS.COLLECTION.UPDATE}/${cardId}`, {
        isFavorite: true, // 這裡需要先獲取當前狀態，然後切換
      });
        // 清除緩存以確保數據同步
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 批量操作
  batchOperation: async (operation, cardIds, data = {}) => {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.COLLECTION.LIST
      }/batch`, {
        operation,
        cardIds,
        data,
      });
        // 清除緩存以確保數據同步
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 搜索收藏
  searchCollection: async (query, filters = {}) => {
    try {
      const response = await apiService.get(API_ENDPOINTS.COLLECTION.LIST, {
        search: query,
        ...filters,
      });
        // 處理搜索結果
      const processedCards = response.cards.map(card => ({
        ...card,
        profitLoss: (card.currentPrice || 0) - (card.purchasePrice || 0),
        profitLossPercentage: card.purchasePrice > 0
          ? ((card.currentPrice - card.purchasePrice) / card.purchasePrice) * 100
          : 0,
      }));
      return {
        ...response,
        cards: processedCards,
      };
    } catch (error) {
      throw error;
    }
  },

  // 導出收藏數據
  exportCollection: async (format = 'json') => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.COLLECTION.LIST
      }/export`, { format });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 導入收藏數據
  importCollection: async (file) => {
    try {
      const response = await apiService.upload(`${API_ENDPOINTS.COLLECTION.LIST
      }/import`, file);
        // 清除緩存以確保數據同步
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 清除緩存
  clearCache: async () => {
    try {
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      await AsyncStorage.removeItem(`${COLLECTION_CACHE_KEY
      }_stats`);
    } catch (error) {}
  },

  // 同步本地數據到服務器
  syncToServer: async (localData) => {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.COLLECTION.LIST
      }/sync`, localData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 從服務器同步數據
  syncFromServer: async () => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.COLLECTION.LIST
      }/sync`);
        // 清除緩存以確保數據同步
      await AsyncStorage.removeItem(COLLECTION_CACHE_KEY);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// 離線支持
export const offlineCollectionService = {
  // 獲取本地緩存的收藏數據
  getLocalCollection: async () => {
    try {
      const cachedData = await AsyncStorage.getItem(COLLECTION_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // 保存收藏數據到本地
  saveLocalCollection: async (collectionData) => {
    try {
      await AsyncStorage.setItem(COLLECTION_CACHE_KEY, JSON.stringify(collectionData));
    } catch (error) {}
  },

  // 獲取待同步的操作
  getPendingOperations: async () => {
    try {
      const pendingOps = await AsyncStorage.getItem('collection_pending_ops');
      return pendingOps ? JSON.parse(pendingOps) : [];
    } catch (error) {
      return [];
    }
  },

  // 添加待同步的操作
  addPendingOperation: async (operation) => {
    try {
      const pendingOps = await offlineCollectionService.getPendingOperations();
      pendingOps.push({
        ...operation,
        timestamp: Date.now(),
        id: Date.now().toString(),
      });
      await AsyncStorage.setItem('collection_pending_ops', JSON.stringify(pendingOps));
    } catch (error) {}
  },

  // 清除已同步的操作
  clearPendingOperations: async () => {
    try {
      await AsyncStorage.removeItem('collection_pending_ops');
    } catch (error) {}
  },
};

export default collectionService;
