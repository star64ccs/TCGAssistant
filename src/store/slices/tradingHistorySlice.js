import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { integratedApiService } from '../../services/integratedApiService';

// Async thunks
export const loadTradingHistory = createAsyncThunk(
  'tradingHistory/loadTradingHistory',
  async (_, { rejectWithValue }) => {
    try {
      const history = await AsyncStorage.getItem('tradingHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTradingRecord = createAsyncThunk(
  'tradingHistory/addTradingRecord',
  async (record, { rejectWithValue }) => {
    try {
      const history = await AsyncStorage.getItem('tradingHistory');
      const historyList = history ? JSON.parse(history) : [];
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      historyList.push(newRecord);
      await AsyncStorage.setItem('tradingHistory', JSON.stringify(historyList));
      return newRecord;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTradingRecord = createAsyncThunk(
  'tradingHistory/updateTradingRecord',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const history = await AsyncStorage.getItem('tradingHistory');
      const historyList = history ? JSON.parse(history) : [];
      const index = historyList.findIndex(record => record.id === id);
      
      if (index >= 0) {
        historyList[index] = {
          ...historyList[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('tradingHistory', JSON.stringify(historyList));
        return historyList[index];
      }
      throw new Error('Record not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTradingRecord = createAsyncThunk(
  'tradingHistory/deleteTradingRecord',
  async (id, { rejectWithValue }) => {
    try {
      const history = await AsyncStorage.getItem('tradingHistory');
      const historyList = history ? JSON.parse(history) : [];
      const filteredList = historyList.filter(record => record.id !== id);
      await AsyncStorage.setItem('tradingHistory', JSON.stringify(filteredList));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const analyzeTradingPerformance = createAsyncThunk(
  'tradingHistory/analyzeTradingPerformance',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { tradingHistory } = getState().tradingHistory;
      const analysis = await integratedApiService.analyzeTradingPerformance(tradingHistory);
      return analysis;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTradingTrends = createAsyncThunk(
  'tradingHistory/getTradingTrends',
  async ({ period, type }, { rejectWithValue, getState }) => {
    try {
      const { tradingHistory } = getState().tradingHistory;
      const trends = await integratedApiService.getTradingTrends(tradingHistory, period, type);
      return trends;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tradingHistory: [],
  performanceAnalysis: {
    totalTrades: 0,
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    winRate: 0,
    averageProfit: 0,
    averageLoss: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    bestTrade: null,
    worstTrade: null,
    monthlyStats: [],
    yearlyStats: [],
  },
  tradingTrends: {
    profitTrend: [],
    volumeTrend: [],
    cardTypeTrend: [],
    marketTrend: [],
  },
  isLoading: false,
  error: null,
  filters: {
    dateRange: 'all', // all, week, month, quarter, year, custom
    startDate: null,
    endDate: null,
    tradeType: 'all', // buy, sell, trade
    cardType: 'all',
    minAmount: 0,
    maxAmount: 1000000,
    sortBy: 'date',
    sortOrder: 'desc',
  },
  statistics: {
    topCards: [],
    topCategories: [],
    tradingFrequency: {},
    profitByCategory: {},
    profitByMonth: {},
    profitByYear: {},
  },
};

const tradingHistorySlice = createSlice({
  name: 'tradingHistory',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateRecord: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.tradingHistory.findIndex(record => record.id === id);
      if (index >= 0) {
        state.tradingHistory[index] = {
          ...state.tradingHistory[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    calculatePerformance: (state) => {
      const { tradingHistory } = state;
      let totalProfit = 0;
      let totalLoss = 0;
      let wins = 0;
      let totalTrades = tradingHistory.length;
      
      tradingHistory.forEach(trade => {
        const profit = trade.profit || 0;
        if (profit > 0) {
          totalProfit += profit;
          wins++;
        } else {
          totalLoss += Math.abs(profit);
        }
      });
      
      const netProfit = totalProfit - totalLoss;
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      const averageProfit = wins > 0 ? totalProfit / wins : 0;
      const averageLoss = (totalTrades - wins) > 0 ? totalLoss / (totalTrades - wins) : 0;
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
      
      // Calculate max drawdown
      let maxDrawdown = 0;
      let peak = 0;
      let runningTotal = 0;
      
      tradingHistory.forEach(trade => {
        runningTotal += (trade.profit || 0);
        if (runningTotal > peak) {
          peak = runningTotal;
        }
        const drawdown = peak - runningTotal;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      });
      
      // Find best and worst trades
      const bestTrade = tradingHistory.reduce((best, trade) => 
        (trade.profit || 0) > (best?.profit || 0) ? trade : best, null);
      const worstTrade = tradingHistory.reduce((worst, trade) => 
        (trade.profit || 0) < (worst?.profit || 0) ? trade : worst, null);
      
      state.performanceAnalysis = {
        totalTrades,
        totalProfit,
        totalLoss,
        netProfit,
        winRate,
        averageProfit,
        averageLoss,
        profitFactor,
        maxDrawdown,
        sharpeRatio: 0, // Would need more complex calculation
        bestTrade,
        worstTrade,
        monthlyStats: [], // Would need to calculate
        yearlyStats: [], // Would need to calculate
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // loadTradingHistory
      .addCase(loadTradingHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTradingHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tradingHistory = action.payload;
      })
      .addCase(loadTradingHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // addTradingRecord
      .addCase(addTradingRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTradingRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tradingHistory.push(action.payload);
      })
      .addCase(addTradingRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateTradingRecord
      .addCase(updateTradingRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTradingRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tradingHistory.findIndex(record => record.id === action.payload.id);
        if (index >= 0) {
          state.tradingHistory[index] = action.payload;
        }
      })
      .addCase(updateTradingRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // deleteTradingRecord
      .addCase(deleteTradingRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTradingRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tradingHistory = state.tradingHistory.filter(record => record.id !== action.payload);
      })
      .addCase(deleteTradingRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // analyzeTradingPerformance
      .addCase(analyzeTradingPerformance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzeTradingPerformance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.performanceAnalysis = action.payload;
      })
      .addCase(analyzeTradingPerformance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // getTradingTrends
      .addCase(getTradingTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTradingTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tradingTrends = action.payload;
      })
      .addCase(getTradingTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, updateRecord, clearError, updateStatistics, calculatePerformance } = tradingHistorySlice.actions;

// Selectors
export const selectTradingHistory = (state) => state.tradingHistory.tradingHistory;
export const selectPerformanceAnalysis = (state) => state.tradingHistory.performanceAnalysis;
export const selectTradingTrends = (state) => state.tradingHistory.tradingTrends;
export const selectIsLoading = (state) => state.tradingHistory.isLoading;
export const selectError = (state) => state.tradingHistory.error;
export const selectFilters = (state) => state.tradingHistory.filters;
export const selectStatistics = (state) => state.tradingHistory.statistics;

// Filtered selectors
export const selectFilteredTradingHistory = (state) => {
  const { tradingHistory } = state.tradingHistory;
  const { dateRange, startDate, endDate, tradeType, cardType, minAmount, maxAmount, sortBy, sortOrder } = state.tradingHistory.filters;
  
  let filtered = tradingHistory.filter(record => {
    const recordDate = new Date(record.createdAt);
    const recordAmount = record.amount || 0;
    const recordTradeType = record.tradeType || 'unknown';
    const recordCardType = record.cardType || 'unknown';
    
    // Date filtering
    let dateMatch = true;
    if (dateRange !== 'all') {
      const now = new Date();
      let filterStartDate;
      
      switch (dateRange) {
        case 'week':
          filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          filterStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          filterStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (startDate && endDate) {
            dateMatch = recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
          }
          break;
      }
      
      if (dateRange !== 'custom') {
        dateMatch = recordDate >= filterStartDate;
      }
    }
    
    return (
      dateMatch &&
      recordAmount >= minAmount &&
      recordAmount <= maxAmount &&
      (tradeType === 'all' || recordTradeType === tradeType) &&
      (cardType === 'all' || recordCardType === cardType)
    );
  });
  
  // Sort
  filtered.sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case 'profit':
        aValue = a.profit || 0;
        bValue = b.profit || 0;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'desc') {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });
  
  return filtered;
};

export default tradingHistorySlice.reducer;
