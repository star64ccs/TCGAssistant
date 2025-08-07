import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';
import { collectionService, offlineCollectionService } from '../../services/collectionService';

// 初始狀態
const initialState = {
  cards: [],
  totalValue: 0,
  totalProfitLoss: 0,
  isLoading: false,
  error: null,
};

// 異步 action：載入收藏
export const loadCollection = createAsyncThunk(
  'collection/load',
  async (_, { rejectWithValue }) => {
    try {
      // 嘗試從 API 獲取數據
      const response = await collectionService.getCollection();
      
      // 保存到本地緩存
      await offlineCollectionService.saveLocalCollection(response);
      
      return response;
    } catch (error) {
      console.error('Load collection from API error:', error);
      
      // 如果 API 失敗，嘗試從本地緩存獲取
      try {
        const localData = await offlineCollectionService.getLocalCollection();
        if (localData) {
          console.log('Using cached collection data');
          return localData;
        }
      } catch (localError) {
        console.error('Load local collection error:', localError);
      }
      
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：新增卡牌到收藏
export const addToCollection = createAsyncThunk(
  'collection/add',
  async (cardData, { getState, rejectWithValue }) => {
    try {
      // 嘗試通過 API 添加
      const response = await collectionService.addToCollection(cardData);
      
      // 更新本地狀態
      const { collection } = getState();
      const updatedCollection = {
        ...collection,
        cards: response.cards || [...collection.cards, response.card],
      };

      await offlineCollectionService.saveLocalCollection(updatedCollection);
      return updatedCollection;
    } catch (error) {
      console.error('Add to collection API error:', error);
      
      // 如果 API 失敗，保存到本地並記錄待同步操作
      try {
        const { collection } = getState();
        const newCard = {
          id: Date.now().toString(),
          ...cardData,
          addedAt: new Date().toISOString(),
          isPendingSync: true,
        };
        
        const updatedCards = [...collection.cards, newCard];
        const updatedCollection = {
          ...collection,
          cards: updatedCards,
        };

        await offlineCollectionService.saveLocalCollection(updatedCollection);
        await offlineCollectionService.addPendingOperation({
          type: 'ADD',
          cardData: newCard
        });
        
        return updatedCollection;
      } catch (localError) {
        return rejectWithValue(localError.message);
      }
    }
  }
);

// 異步 action：從收藏移除卡牌
export const removeFromCollection = createAsyncThunk(
  'collection/remove',
  async (cardId, { getState, rejectWithValue }) => {
    try {
      // 嘗試通過 API 移除
      await collectionService.removeFromCollection(cardId);
      
      // 更新本地狀態
      const { collection } = getState();
      const updatedCards = collection.cards.filter(card => card.id !== cardId);
      const updatedCollection = {
        ...collection,
        cards: updatedCards,
      };

      await offlineCollectionService.saveLocalCollection(updatedCollection);
      return updatedCollection;
    } catch (error) {
      console.error('Remove from collection API error:', error);
      
      // 如果 API 失敗，仍然從本地移除並記錄待同步操作
      try {
        const { collection } = getState();
        const cardToRemove = collection.cards.find(card => card.id === cardId);
        const updatedCards = collection.cards.filter(card => card.id !== cardId);
        const updatedCollection = {
          ...collection,
          cards: updatedCards,
        };

        await offlineCollectionService.saveLocalCollection(updatedCollection);
        await offlineCollectionService.addPendingOperation({
          type: 'REMOVE',
          cardId: cardId,
          cardData: cardToRemove
        });
        
        return updatedCollection;
      } catch (localError) {
        return rejectWithValue(localError.message);
      }
    }
  }
);

// 異步 action：更新卡牌資訊
export const updateCardInfo = createAsyncThunk(
  'collection/updateCard',
  async ({ cardId, updates }, { getState, rejectWithValue }) => {
    try {
      // 嘗試通過 API 更新
      await collectionService.updateCardInfo(cardId, updates);
      
      // 更新本地狀態
      const { collection } = getState();
      const updatedCards = collection.cards.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      );
      const updatedCollection = {
        ...collection,
        cards: updatedCards,
      };

      await offlineCollectionService.saveLocalCollection(updatedCollection);
      return updatedCollection;
    } catch (error) {
      console.error('Update card info API error:', error);
      
      // 如果 API 失敗，仍然更新本地並記錄待同步操作
      try {
        const { collection } = getState();
        const updatedCards = collection.cards.map(card => 
          card.id === cardId ? { ...card, ...updates, isPendingSync: true } : card
        );
        const updatedCollection = {
          ...collection,
          cards: updatedCards,
        };

        await offlineCollectionService.saveLocalCollection(updatedCollection);
        await offlineCollectionService.addPendingOperation({
          type: 'UPDATE',
          cardId: cardId,
          updates: updates
        });
        
        return updatedCollection;
      } catch (localError) {
        return rejectWithValue(localError.message);
      }
    }
  }
);

// 異步 action：計算收藏價值
export const calculateCollectionValue = createAsyncThunk(
  'collection/calculateValue',
  async (_, { getState }) => {
    try {
      const { collection } = getState();
      let totalValue = 0;
      let totalProfitLoss = 0;

      collection.cards.forEach(card => {
        const currentValue = card.currentPrice || 0;
        const purchasePrice = card.purchasePrice || 0;
        
        totalValue += currentValue;
        totalProfitLoss += (currentValue - purchasePrice);
      });

      const updatedCollection = {
        ...collection,
        totalValue,
        totalProfitLoss,
      };

      await offlineCollectionService.saveLocalCollection(updatedCollection);
      return updatedCollection;
    } catch (error) {
      console.error('Calculate collection value error:', error);
    }
  }
);

// 異步 action：搜索收藏
export const searchCollection = createAsyncThunk(
  'collection/search',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const response = await collectionService.searchCollection(query, filters);
      return response;
    } catch (error) {
      console.error('Search collection error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：同步收藏數據
export const syncCollection = createAsyncThunk(
  'collection/sync',
  async (_, { getState, rejectWithValue }) => {
    try {
      // 獲取待同步的操作
      const pendingOps = await offlineCollectionService.getPendingOperations();
      
      if (pendingOps.length > 0) {
        // 執行待同步的操作
        for (const op of pendingOps) {
          try {
            switch (op.type) {
              case 'ADD':
                await collectionService.addToCollection(op.cardData);
                break;
              case 'REMOVE':
                await collectionService.removeFromCollection(op.cardId);
                break;
              case 'UPDATE':
                await collectionService.updateCardInfo(op.cardId, op.updates);
                break;
            }
          } catch (opError) {
            console.error(`Sync operation failed: ${op.type}`, opError);
          }
        }
        
        // 清除已同步的操作
        await offlineCollectionService.clearPendingOperations();
      }
      
      // 從服務器獲取最新數據
      const response = await collectionService.syncFromServer();
      return response;
    } catch (error) {
      console.error('Sync collection error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：切換收藏狀態
export const toggleFavorite = createAsyncThunk(
  'collection/toggleFavorite',
  async (cardId, { getState, rejectWithValue }) => {
    try {
      const { collection } = getState();
      const card = collection.cards.find(c => c.id === cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }
      
      const updates = { isFavorite: !card.isFavorite };
      await collectionService.updateCardInfo(cardId, updates);
      
      // 更新本地狀態
      const updatedCards = collection.cards.map(c => 
        c.id === cardId ? { ...c, ...updates } : c
      );
      const updatedCollection = {
        ...collection,
        cards: updatedCards,
      };

      await offlineCollectionService.saveLocalCollection(updatedCollection);
      return updatedCollection;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 建立 slice
const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadCollection
      .addCase(loadCollection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // addToCollection
      .addCase(addToCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(addToCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // removeFromCollection
      .addCase(removeFromCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(removeFromCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateCardInfo
      .addCase(updateCardInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCardInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updateCardInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // calculateCollectionValue
      .addCase(calculateCollectionValue.fulfilled, (state, action) => {
        if (action.payload) {
          Object.assign(state, action.payload);
        }
      })
      
      // searchCollection
      .addCase(searchCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(searchCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // syncCollection
      .addCase(syncCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(syncCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // toggleFavorite
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = collectionSlice.actions;
export default collectionSlice.reducer;
