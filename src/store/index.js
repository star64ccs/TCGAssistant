import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import authReducer from './slices/authSlice';
import membershipReducer from './slices/membershipSlice';
import collectionReducer from './slices/collectionSlice';
import historyReducer from './slices/historySlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';
import priceTrackingReducer from './slices/priceTrackingSlice';
import tradingReducer from './slices/tradingSlice';

import notificationReducer from './slices/notificationSlice';
import cardRatingReducer from './slices/cardRatingSlice';
import tradingHistoryReducer from './slices/tradingHistorySlice';
import analyticsReducer from './slices/analyticsSlice';
import databaseCleanupReducer from './slices/databaseCleanupSlice';
import authenticityReducer from './slices/authenticitySlice';

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'membership', 'settings', 'collection', 'priceTracking', 'trading', 'notification', 'cardRating', 'tradingHistory', 'analytics', 'databaseCleanup', 'authenticity'],
};

// 根 reducer
const rootReducer = {
  auth: authReducer,
  membership: membershipReducer,
  collection: collectionReducer,
  history: historyReducer,
  settings: settingsReducer,
  ui: uiReducer,
  priceTracking: priceTrackingReducer,
  trading: tradingReducer,

  notification: notificationReducer,
  cardRating: cardRatingReducer,
  tradingHistory: tradingHistoryReducer,
  analytics: analyticsReducer,
  databaseCleanup: databaseCleanupReducer,
  authenticity: authenticityReducer,
};

// 創建 store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'priceTracking/fetchCardPrice/fulfilled',
          'trading/createListing/fulfilled',

          'notification/scheduleLocalNotification/fulfilled',
          'cardRating/rateCard/fulfilled',
          'tradingHistory/addTradingRecord/fulfilled',
          'analytics/generateComprehensiveReport/fulfilled',
          'authenticity/checkAuthenticity/fulfilled',
          'authenticity/batchCheck/fulfilled',
          'authenticity/recheck/fulfilled',
        ],
      },
    }),
});

export const persistor = persistStore(store);
