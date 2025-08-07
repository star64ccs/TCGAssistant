import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, APP_CONFIG } from '../../constants';

// 初始狀態
const initialState = {
  language: APP_CONFIG.DEFAULT_LANGUAGE,
  theme: 'light',
  notifications: {
    enabled: true,
    priceAlerts: true,
    marketUpdates: true,
    newFeatures: false,
  },
  privacy: {
    shareAnalytics: true,
    shareUsageData: false,
  },
  security: {
    biometricAuth: false,
    autoLock: false,
    lockTimeout: 5, // 分鐘
  },
  display: {
    cardImageQuality: 'high',
    showPrices: true,
    showPredictions: true,
  },
  isLoading: false,
  error: null,
};

// 異步 action：載入設定
export const loadSettings = createAsyncThunk(
  'settings/load',
  async () => {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        const savedSettings = JSON.parse(settingsData);
        return { ...initialState, ...savedSettings };
      }
      return initialState;
    } catch (error) {
      console.error('Load settings error:', error);
      return initialState;
    }
  }
);

// 異步 action：更新設定
export const updateSettings = createAsyncThunk(
  'settings/update',
  async (updates, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const updatedSettings = { ...settings, ...updates };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：更新語言設定
export const updateLanguage = createAsyncThunk(
  'settings/updateLanguage',
  async (language, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const updatedSettings = { ...settings, language };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：更新主題設定
export const updateTheme = createAsyncThunk(
  'settings/updateTheme',
  async (theme, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const updatedSettings = { ...settings, theme };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
      
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：更新通知設定
export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotifications',
  async (notificationSettings, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const updatedSettings = {
        ...settings,
        notifications: { ...settings.notifications, ...notificationSettings },
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：更新隱私設定
export const updatePrivacySettings = createAsyncThunk(
  'settings/updatePrivacy',
  async (privacySettings, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const updatedSettings = {
        ...settings,
        privacy: { ...settings.privacy, ...privacySettings },
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：更新安全設定
export const updateSecuritySettings = createAsyncThunk(
  'settings/updateSecurity',
  async (securitySettings, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const updatedSettings = {
        ...settings,
        security: { ...settings.security, ...securitySettings },
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：重置設定
export const resetSettings = createAsyncThunk(
  'settings/reset',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
      return initialState;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 建立 slice
const settingsSlice = createSlice({
  name: 'settings',
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
      // loadSettings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // updateSettings
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateLanguage
      .addCase(updateLanguage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updateLanguage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateTheme
      .addCase(updateTheme.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updateTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateNotificationSettings
      .addCase(updateNotificationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updatePrivacySettings
      .addCase(updatePrivacySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateSecuritySettings
      .addCase(updateSecuritySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updateSecuritySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // resetSettings
      .addCase(resetSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = settingsSlice.actions;
export default settingsSlice.reducer;
