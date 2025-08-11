import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      // 從本地存儲載入收藏
      const collectionData = await AsyncStorage.getItem('collection_data');
      if (collectionData) {
        return JSON.parse(collectionData);
      }
      return { cards: [], totalValue: 0, totalProfitLoss: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// 異步 action：新增卡牌到收藏
export const addToCollection = createAsyncThunk(
  'collection/add',
  async (cardData, { getState, rejectWithValue }) => {
    try {
      const { collection } = getState();
      const newCard = {
        id: Date.now().toString(),
        ...cardData,
        addedAt: new Date().toISOString(),
      };
      const updatedCards = [...collection.cards, newCard];
      const updatedCollection = {
        ...collection,
        cards: updatedCards,
      };

      // 保存到本地存儲
      await AsyncStorage.setItem('collection_data', JSON.stringify(updatedCollection));
      return updatedCollection;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// 異步 action：從收藏移除卡牌
export const removeFromCollection = createAsyncThunk(
  'collection/remove',
  async (cardId, { getState, rejectWithValue }) => {
    try {
      const { collection } = getState();
      const updatedCards = collection.cards.filter(card => card.id !== cardId);
      const updatedCollection = {
        ...collection,
        cards: updatedCards,
      };

      // 保存到本地存儲
      await AsyncStorage.setItem('collection_data', JSON.stringify(updatedCollection));
      return updatedCollection;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// 異步 action：更新卡牌資訊
export const updateCardInfo = createAsyncThunk(
  'collection/updateCard',
  async ({ cardId, updates }, { getState, rejectWithValue }) => {
    try {
      const { collection } = getState();
      const updatedCards = collection.cards.map(card =>
        card.id === cardId ? { ...card, ...updates } : card,
      );
      const updatedCollection = {
        ...collection,
        cards: updatedCards,
      };

      // 保存到本地存儲
      await AsyncStorage.setItem('collection_data', JSON.stringify(updatedCollection));
      return updatedCollection;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
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

      // 保存到本地存儲
      await AsyncStorage.setItem('collection_data', JSON.stringify(updatedCollection));
      return updatedCollection;
    } catch (error) {
      return { totalValue: 0, totalProfitLoss: 0 };
    }
  },
);

// 異步 action：搜索收藏
export const searchCollection = createAsyncThunk(
  'collection/search',
  async ({ query, filters }, { getState, rejectWithValue }) => {
    try {
      const { collection } = getState();
      const filteredCards = collection.cards.filter(card => {
        const matchesQuery = card.name.toLowerCase().includes(query.toLowerCase()) ||
                           card.set.toLowerCase().includes(query.toLowerCase());
        return matchesQuery;
      });
      return { cards: filteredCards };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// 異步 action：同步收藏數據
export const syncCollection = createAsyncThunk(
  'collection/sync',
  async (_, { getState, rejectWithValue }) => {
    try {
      // 簡化的同步邏輯 - 只返回當前狀態
      const { collection } = getState();
      return collection;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
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

      // 更新本地狀態
      const updatedCards = collection.cards.map(c =>
        c.id === cardId ? { ...c, ...updates } : c,
      );
      const updatedCollection = {
        ...collection,
        cards: updatedCards,
      };

      // 保存到本地存儲
      await AsyncStorage.setItem('collection_data', JSON.stringify(updatedCollection));
      return updatedCollection;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
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
