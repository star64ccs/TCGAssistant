import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authenticityService from '../../services/authenticityService';

// 異步操作：檢查真偽
export const checkAuthenticity = createAsyncThunk(
  'authenticity/checkAuthenticity',
  async ({ imageFile, options = {} }, { rejectWithValue }) => {
    try {
      const result = await authenticityService.checkAuthenticity(imageFile, options);
      await authenticityService.saveAnalysisHistory(result);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：批量分析
export const batchAuthenticityCheck = createAsyncThunk(
  'authenticity/batchCheck',
  async ({ imageFiles, options = {} }, { rejectWithValue }) => {
    try {
      const results = await authenticityService.batchAnalysis(imageFiles, options);
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：獲取分析歷史
export const loadAnalysisHistory = createAsyncThunk(
  'authenticity/loadHistory',
  async (limit = 50, { rejectWithValue }) => {
    try {
      const history = await authenticityService.getAnalysisHistory(limit);
      return history;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：獲取統計資訊
export const loadAuthenticityStats = createAsyncThunk(
  'authenticity/loadStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await authenticityService.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：清除快取
export const clearAuthenticityCache = createAsyncThunk(
  'authenticity/clearCache',
  async (_, { rejectWithValue }) => {
    try {
      await authenticityService.clearCache();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：重新檢查
export const recheckAuthenticity = createAsyncThunk(
  'authenticity/recheck',
  async ({ imageFile, analysisId, options = {} }, { rejectWithValue }) => {
    try {
      const result = await authenticityService.checkAuthenticity(imageFile, {
        ...options,
        forceRefresh: true
      });
      await authenticityService.saveAnalysisHistory(result);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // 當前檢查狀態
  currentCheck: {
    result: null,
    isProcessing: false,
    error: null,
    progress: 0,
  },
  
  // 批量檢查狀態
  batchCheck: {
    results: [],
    isProcessing: false,
    error: null,
    progress: 0,
    total: 0,
    completed: 0,
  },
  
  // 分析歷史
  history: {
    items: [],
    isLoading: false,
    error: null,
    hasMore: true,
  },
  
  // 統計資訊
  stats: {
    total: 0,
    authentic: 0,
    fake: 0,
    avgConfidence: 0,
    lastAnalysis: null,
    isLoading: false,
    error: null,
  },
  
  // 設定
  settings: {
    autoSave: true,
    highQualityMode: false,
    offlineMode: false,
    cacheEnabled: true,
  },
  
  // 快取狀態
  cache: {
    isClearing: false,
    lastCleared: null,
    size: 0,
  },
  
  // 網路狀態
  networkStatus: {
    isOnline: true,
    lastChecked: null,
  },
};

const authenticitySlice = createSlice({
  name: 'authenticity',
  initialState,
  reducers: {
    // 重置當前檢查
    resetCurrentCheck: (state) => {
      state.currentCheck = initialState.currentCheck;
    },
    
    // 重置批量檢查
    resetBatchCheck: (state) => {
      state.batchCheck = initialState.batchCheck;
    },
    
    // 更新進度
    updateProgress: (state, action) => {
      const { progress, type = 'current' } = action.payload;
      if (type === 'current') {
        state.currentCheck.progress = progress;
      } else if (type === 'batch') {
        state.batchCheck.progress = progress;
      }
    },
    
    // 更新網路狀態
    setNetworkStatus: (state, action) => {
      state.networkStatus = {
        ...state.networkStatus,
        ...action.payload,
        lastChecked: new Date().toISOString(),
      };
      authenticityService.setOnlineStatus(action.payload.isOnline);
    },
    
    // 更新設定
    updateSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
    
    // 清除錯誤
    clearError: (state, action) => {
      const { type = 'current' } = action.payload;
      if (type === 'current') {
        state.currentCheck.error = null;
      } else if (type === 'batch') {
        state.batchCheck.error = null;
      } else if (type === 'history') {
        state.history.error = null;
      } else if (type === 'stats') {
        state.stats.error = null;
      }
    },
    
    // 添加分析結果到歷史
    addToHistory: (state, action) => {
      const newItem = action.payload;
      state.history.items = [newItem, ...state.history.items].slice(0, 100);
      
      // 更新統計
      if (newItem.isAuthentic) {
        state.stats.authentic += 1;
      } else {
        state.stats.fake += 1;
      }
      state.stats.total += 1;
      state.stats.lastAnalysis = newItem.timestamp;
    },
    
    // 移除歷史項目
    removeFromHistory: (state, action) => {
      const analysisId = action.payload;
      const removedItem = state.history.items.find(item => item.analysisId === analysisId);
      
      if (removedItem) {
        state.history.items = state.history.items.filter(item => item.analysisId !== analysisId);
        
        // 更新統計
        if (removedItem.isAuthentic) {
          state.stats.authentic = Math.max(0, state.stats.authentic - 1);
        } else {
          state.stats.fake = Math.max(0, state.stats.fake - 1);
        }
        state.stats.total = Math.max(0, state.stats.total - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 檢查真偽
      .addCase(checkAuthenticity.pending, (state) => {
        state.currentCheck.isProcessing = true;
        state.currentCheck.error = null;
        state.currentCheck.progress = 0;
      })
      .addCase(checkAuthenticity.fulfilled, (state, action) => {
        state.currentCheck.isProcessing = false;
        state.currentCheck.result = action.payload;
        state.currentCheck.progress = 100;
        state.currentCheck.error = null;
      })
      .addCase(checkAuthenticity.rejected, (state, action) => {
        state.currentCheck.isProcessing = false;
        state.currentCheck.error = action.payload;
        state.currentCheck.progress = 0;
      })
      
      // 批量檢查
      .addCase(batchAuthenticityCheck.pending, (state, action) => {
        state.batchCheck.isProcessing = true;
        state.batchCheck.error = null;
        state.batchCheck.progress = 0;
        state.batchCheck.total = action.meta.arg.imageFiles.length;
        state.batchCheck.completed = 0;
      })
      .addCase(batchAuthenticityCheck.fulfilled, (state, action) => {
        state.batchCheck.isProcessing = false;
        state.batchCheck.results = action.payload;
        state.batchCheck.progress = 100;
        state.batchCheck.completed = action.payload.length;
        state.batchCheck.error = null;
      })
      .addCase(batchAuthenticityCheck.rejected, (state, action) => {
        state.batchCheck.isProcessing = false;
        state.batchCheck.error = action.payload;
        state.batchCheck.progress = 0;
      })
      
      // 載入歷史
      .addCase(loadAnalysisHistory.pending, (state) => {
        state.history.isLoading = true;
        state.history.error = null;
      })
      .addCase(loadAnalysisHistory.fulfilled, (state, action) => {
        state.history.isLoading = false;
        state.history.items = action.payload;
        state.history.hasMore = action.payload.length >= 50;
      })
      .addCase(loadAnalysisHistory.rejected, (state, action) => {
        state.history.isLoading = false;
        state.history.error = action.payload;
      })
      
      // 載入統計
      .addCase(loadAuthenticityStats.pending, (state) => {
        state.stats.isLoading = true;
        state.stats.error = null;
      })
      .addCase(loadAuthenticityStats.fulfilled, (state, action) => {
        state.stats.isLoading = false;
        state.stats = {
          ...state.stats,
          ...action.payload,
        };
      })
      .addCase(loadAuthenticityStats.rejected, (state, action) => {
        state.stats.isLoading = false;
        state.stats.error = action.payload;
      })
      
      // 清除快取
      .addCase(clearAuthenticityCache.pending, (state) => {
        state.cache.isClearing = true;
      })
      .addCase(clearAuthenticityCache.fulfilled, (state) => {
        state.cache.isClearing = false;
        state.cache.lastCleared = new Date().toISOString();
        state.cache.size = 0;
      })
      .addCase(clearAuthenticityCache.rejected, (state) => {
        state.cache.isClearing = false;
      })
      
      // 重新檢查
      .addCase(recheckAuthenticity.pending, (state) => {
        state.currentCheck.isProcessing = true;
        state.currentCheck.error = null;
        state.currentCheck.progress = 0;
      })
      .addCase(recheckAuthenticity.fulfilled, (state, action) => {
        state.currentCheck.isProcessing = false;
        state.currentCheck.result = action.payload;
        state.currentCheck.progress = 100;
        state.currentCheck.error = null;
      })
      .addCase(recheckAuthenticity.rejected, (state, action) => {
        state.currentCheck.isProcessing = false;
        state.currentCheck.error = action.payload;
        state.currentCheck.progress = 0;
      });
  },
});

export const {
  resetCurrentCheck,
  resetBatchCheck,
  updateProgress,
  setNetworkStatus,
  updateSettings,
  clearError,
  addToHistory,
  removeFromHistory,
} = authenticitySlice.actions;

export default authenticitySlice.reducer;
