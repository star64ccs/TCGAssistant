import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 導入所有slices
import analyticsReducer from './slices/analyticsSlice';
import authReducer from './slices/authSlice';
import authenticityReducer from './slices/authenticitySlice';
import cardRatingReducer from './slices/cardRatingSlice';
import collectionReducer from './slices/collectionSlice';
import databaseCleanupReducer from './slices/databaseCleanupSlice';
import historyReducer from './slices/historySlice';
import membershipReducer from './slices/membershipSlice';
import notificationReducer from './slices/notificationSlice';
import priceTrackingReducer from './slices/priceTrackingSlice';
import settingsReducer from './slices/settingsSlice';
import tradingReducer from './slices/tradingSlice';
import uiReducer from './slices/uiSlice';

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'collection'],
};

// 創建根reducer
const rootReducer = {
  analytics: analyticsReducer,
  auth: authReducer,
  authenticity: authenticityReducer,
  cardRating: cardRatingReducer,
  collection: collectionReducer,
  databaseCleanup: databaseCleanupReducer,
  history: historyReducer,
  membership: membershipReducer,
  notification: notificationReducer,
  priceTracking: priceTrackingReducer,
  settings: settingsReducer,
  trading: tradingReducer,
  ui: uiReducer,
};

// 創建持久化的根reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

// 創建persistor
export const persistor = persistStore(store);

// 導出類型
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
