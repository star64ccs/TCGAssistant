import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

// 初始狀態
const initialState = {
  queries: [],
  isLoading: false,
  error: null,
};

// 異步 action：載入查詢歷史
export const loadHistory = createAsyncThunk(
  'history/load',
  async () => {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (historyData) {
        return JSON.parse(historyData);
      }
      return initialState;
    } catch (error) {
      console.error('Load history error:', error);
      return initialState;
    }
  }
);

// 異步 action：新增查詢記錄
export const addQueryRecord = createAsyncThunk(
  'history/addQuery',
  async (queryData, { getState, rejectWithValue }) => {
    try {
      const { history } = getState();
      const newQuery = {
        id: Date.now().toString(),
        ...queryData,
        timestamp: new Date().toISOString(),
      };
      
      const updatedQueries = [newQuery, ...history.queries].slice(0, 100); // 保留最近100條記錄
      const updatedHistory = {
        ...history,
        queries: updatedQueries,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：刪除查詢記錄
export const deleteQueryRecord = createAsyncThunk(
  'history/deleteQuery',
  async (queryId, { getState, rejectWithValue }) => {
    try {
      const { history } = getState();
      const updatedQueries = history.queries.filter(query => query.id !== queryId);
      const updatedHistory = {
        ...history,
        queries: updatedQueries,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：清除所有歷史
export const clearHistory = createAsyncThunk(
  'history/clear',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      return initialState;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：匯出歷史
export const exportHistory = createAsyncThunk(
  'history/export',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { history } = getState();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalQueries: history.queries.length,
        queries: history.queries,
      };
      
      // 這裡可以實現實際的匯出功能
      // 例如：分享檔案、發送郵件等
      console.log('Export data:', exportData);
      
      return exportData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 建立 slice
const historySlice = createSlice({
  name: 'history',
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
      // loadHistory
      .addCase(loadHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // addQueryRecord
      .addCase(addQueryRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addQueryRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(addQueryRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // deleteQueryRecord
      .addCase(deleteQueryRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQueryRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(deleteQueryRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // clearHistory
      .addCase(clearHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(clearHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // exportHistory
      .addCase(exportHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportHistory.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = historySlice.actions;
export default historySlice.reducer;
