import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import databaseCleanupService from '../../services/databaseCleanupService';

// 初始狀態
const initialState = {
  isCleaning: false,
  lastCleanup: null,
  cleanupProgress: {
    localStorage: false,
    database: false,
    cache: false,
    realDataImport: false
  },
  error: null,
  stats: {
    totalCards: 0,
    cardsWithFeatures: 0,
    gameTypeBreakdown: {},
    isClean: false
  }
};

// 異步 action：清理所有不真實內容
export const cleanupAllUnrealContent = createAsyncThunk(
  'databaseCleanup/cleanupAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await databaseCleanupService.cleanupAllUnrealContent();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：獲取數據庫統計
export const getDatabaseStats = createAsyncThunk(
  'databaseCleanup/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await databaseCleanupService.getDatabaseStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：檢查清理狀態
export const checkCleanupStatus = createAsyncThunk(
  'databaseCleanup/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = databaseCleanupService.getCleanupStatus();
      return status;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 創建 slice
const databaseCleanupSlice = createSlice({
  name: 'databaseCleanup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCleaningProgress: (state, action) => {
      state.cleanupProgress = {
        ...state.cleanupProgress,
        ...action.payload
      };
    },
    resetCleanupProgress: (state) => {
      state.cleanupProgress = {
        localStorage: false,
        database: false,
        cache: false,
        realDataImport: false
      };
    },
    updateStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // cleanupAllUnrealContent
      .addCase(cleanupAllUnrealContent.pending, (state) => {
        state.isCleaning = true;
        state.error = null;
        state.cleanupProgress = {
          localStorage: false,
          database: false,
          cache: false,
          realDataImport: false
        };
      })
      .addCase(cleanupAllUnrealContent.fulfilled, (state, action) => {
        state.isCleaning = false;
        state.lastCleanup = new Date().toISOString();
        state.cleanupProgress = {
          localStorage: true,
          database: true,
          cache: true,
          realDataImport: true
        };
        state.error = null;
      })
      .addCase(cleanupAllUnrealContent.rejected, (state, action) => {
        state.isCleaning = false;
        state.error = action.payload;
      })
      
      // getDatabaseStats
      .addCase(getDatabaseStats.pending, (state) => {
        // 不設置loading狀態，因為這是一個輕量級操作
      })
      .addCase(getDatabaseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getDatabaseStats.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // checkCleanupStatus
      .addCase(checkCleanupStatus.pending, (state) => {
        // 不設置loading狀態
      })
      .addCase(checkCleanupStatus.fulfilled, (state, action) => {
        state.isCleaning = action.payload.isCleaning;
        state.lastCleanup = action.payload.lastCleanup;
      })
      .addCase(checkCleanupStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

// 導出 actions
export const {
  clearError,
  setCleaningProgress,
  resetCleanupProgress,
  updateStats
} = databaseCleanupSlice.actions;

// 導出 selectors
export const selectDatabaseCleanup = (state) => state.databaseCleanup;
export const selectIsCleaning = (state) => state.databaseCleanup.isCleaning;
export const selectCleanupProgress = (state) => state.databaseCleanup.cleanupProgress;
export const selectDatabaseStats = (state) => state.databaseCleanup.stats;
export const selectCleanupError = (state) => state.databaseCleanup.error;
export const selectLastCleanup = (state) => state.databaseCleanup.lastCleanup;

export default databaseCleanupSlice.reducer;
