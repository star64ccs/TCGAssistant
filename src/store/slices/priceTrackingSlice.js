import integratedApiService from '../../services/integratedApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// Async thunks
export const fetchCardPrice = createAsyncThunk(
  'priceTracking/fetchCardPrice',
  async (cardId, { rejectWithValue }) => {
    try {      const priceData = await integratedApiService || {}.getCardPrice(cardId);      return { cardId, priceData,      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addPriceAlert = createAsyncThunk(
  'priceTracking/addPriceAlert',
  async (alertData, { rejectWithValue }) => {
    try {      // 模擬API調用      const newAlert = {        id: Date.now().toString(),        ...alertData,        createdAt: new Date().toISOString(),        isActive: true,      };        // 保存到本地存儲      const existingAlerts = await AsyncStorage.getItem('priceAlerts');      const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];      alerts.push(newAlert);      await AsyncStorage.setItem('priceAlerts', JSON.stringify(alerts));      return newAlert;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updatePriceAlert = createAsyncThunk(
  'priceTracking/updatePriceAlert',
  async ({ alertId, updates }, { rejectWithValue }) => {
    try {      const existingAlerts = await AsyncStorage.getItem('priceAlerts');      const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];      const updatedAlerts = alerts.map(alert =>        alert.id === alertId ? { ...alert, ...updates,        } : alert,      );      await AsyncStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));      return { alertId, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deletePriceAlert = createAsyncThunk(
  'priceTracking/deletePriceAlert',
  async (alertId, { rejectWithValue }) => {
    try {      const existingAlerts = await AsyncStorage.getItem('priceAlerts');      const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];      const filteredAlerts = alerts.filter(alert => alert.id !== alertId);      await AsyncStorage.setItem('priceAlerts', JSON.stringify(filteredAlerts));      return alertId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const loadPriceAlerts = createAsyncThunk(
  'priceTracking/loadPriceAlerts',
  async (_, { rejectWithValue }) => {
    try {      const alerts = await AsyncStorage.getItem('priceAlerts');      return alerts ? JSON.parse(alerts) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const checkPriceAlerts = createAsyncThunk(
  'priceTracking/checkPriceAlerts',
  async (_, { getState, rejectWithValue }) => {
    try {      const { priceAlerts,      } = getState().priceTracking;      const triggeredAlerts = [];      for (const alert of priceAlerts) {        if (!alert.isActive) {          continue;        }        const priceData = await integratedApiService || {}.getCardPrice(alert.cardId);        const currentPrice = priceData.averagePrice || priceData.lowestPrice;        let shouldTrigger = false;        if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.condition === 'change' && Math.abs(currentPrice - alert.lastPrice) >= alert.changeThreshold) {
          shouldTrigger = true;
        }        if (shouldTrigger) {          triggeredAlerts.push({            ...alert,            currentPrice,            triggeredAt: new Date().toISOString(),          });        }      }      return triggeredAlerts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  priceAlerts: [],
  priceHistory: {},
  isLoading: false,
  error: null,
  lastChecked: null,
  triggeredAlerts: [],
  settings: {
    checkInterval: 30, // 分鐘
    enableNotifications: true,
    enableEmailAlerts: false,
    priceChangeThreshold: 5, // 百分比
  },
};

const priceTrackingSlice = createSlice || (() => {})({
  name: 'priceTracking',
  initialState,
  reducers: {
    clearError: (state) => {      state.error = null;
    },
    clearTriggeredAlerts: (state) => {
      state.triggeredAlerts = [];
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    addPriceHistory: (state, action) => {
      const { cardId, priceData } = action.payload;      if (!state.priceHistory[cardId]) {
        state.priceHistory[cardId] = [];
      }      state.priceHistory[cardId].push({        ...priceData,        timestamp: new Date().toISOString(),      });      // 只保留最近30天的數據      const thirtyDaysAgo = new Date();      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);      state.priceHistory[cardId] = state.priceHistory[cardId].filter(        entry => new Date(entry.timestamp) > thirtyDaysAgo,      );
    },
    setLastChecked: (state, action) => {
      state.lastChecked = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder      // fetchCardPrice      .addCase(fetchCardPrice.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(fetchCardPrice.fulfilled, (state, action) => {        state.isLoading = false;        const { cardId, priceData,        } = action.payload;        if (!state.priceHistory[cardId]) {
          state.priceHistory[cardId] = [];
        }        state.priceHistory[cardId].push({          ...priceData,          timestamp: new Date().toISOString(),        });      })      .addCase(fetchCardPrice.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // addPriceAlert      .addCase(addPriceAlert.fulfilled, (state, action) => {
        state.priceAlerts.push(action.payload);
      })      .addCase(addPriceAlert.rejected, (state, action) => {
        state.error = action.payload;
      })    // updatePriceAlert      .addCase(updatePriceAlert.fulfilled, (state, action) => {
        const { alertId, updates } = action.payload;        const alertIndex = state.priceAlerts.findIndex(alert => alert.id === alertId);        if (alertIndex !== -1) {
          state.priceAlerts[alertIndex] = { ...state.priceAlerts[alertIndex], ...updates };        }      })      .addCase(updatePriceAlert.rejected, (state, action) => {
        state.error = action.payload;
      })    // deletePriceAlert      .addCase(deletePriceAlert.fulfilled, (state, action) => {
        state.priceAlerts = state.priceAlerts.filter(alert => alert.id !== action.payload);
      })      .addCase(deletePriceAlert.rejected, (state, action) => {
        state.error = action.payload;
      })    // loadPriceAlerts      .addCase(loadPriceAlerts.fulfilled, (state, action) => {
        state.priceAlerts = action.payload;
      })      .addCase(loadPriceAlerts.rejected, (state, action) => {
        state.error = action.payload;
      })    // checkPriceAlerts      .addCase(checkPriceAlerts.fulfilled, (state, action) => {        state.triggeredAlerts = action.payload;        state.lastChecked = new Date().toISOString();      })      .addCase(checkPriceAlerts.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearTriggeredAlerts,
  updateSettings,
  addPriceHistory,
  setLastChecked,
} = priceTrackingSlice.actions;

export default priceTrackingSlice.reducer;
