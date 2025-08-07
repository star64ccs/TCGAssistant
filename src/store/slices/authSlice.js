import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

// 初始狀態
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  disclaimerAccepted: false,
  onboardingCompleted: false,
};

// 異步 action：檢查認證狀態
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const userProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const disclaimerAccepted = await AsyncStorage.getItem(STORAGE_KEYS.DISCLAIMER_ACCEPTED);
      const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);

      if (token && userProfile) {
        return {
          token,
          user: JSON.parse(userProfile),
          disclaimerAccepted: disclaimerAccepted === 'true',
          onboardingCompleted: onboardingCompleted === 'true',
        };
      }
      return null;
    } catch (error) {
      console.error('Check auth status error:', error);
      return null;
    }
  }
);

// 異步 action：登入
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, socialLogin = false, socialData = null }, { rejectWithValue }) => {
    try {
      // 調用API整合管理器進行登入
      const apiIntegrationManager = require('../../services/apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'auth',
        'login',
        { email, password, socialLogin, socialData },
        { useCache: false }
      );
      
      if (result && result.data && result.data.user) {
        return result.data;
      } else {
        throw new Error('登入失敗，請檢查帳號密碼');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：註冊
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      // 調用API整合管理器進行註冊
      const apiIntegrationManager = require('../../services/apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'auth',
        'register',
        { email, password, name },
        { useCache: false }
      );
      
      if (result && result.data && result.data.user) {
        return result.data;
      } else {
        throw new Error('註冊失敗，請重試');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：登出
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      // 清除本地儲存
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
);

// 異步 action：接受免責聲明
export const acceptDisclaimer = createAsyncThunk(
  'auth/acceptDisclaimer',
  async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.DISCLAIMER_ACCEPTED, 'true');
  }
);

// 異步 action：完成引導
export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  }
);

// 異步 action：更新個人資料
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // TODO: 實現真實的API調用
      // const response = await authAPI.updateProfile(profileData);
      
      throw new Error('真實API尚未實現，請聯繫開發團隊');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：更改密碼
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const user = state.auth.user;

      // 檢查是否為社交登入用戶
      if (user?.isSocialUser) {
        throw new Error('社交登入用戶無法更改密碼');
      }

      // TODO: 實現真實的API調用
      // const response = await authAPI.changePassword(currentPassword, newPassword);
      
      throw new Error('真實API尚未實現，請聯繫開發團隊');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 建立 slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuthStatus
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.disclaimerAccepted = action.payload.disclaimerAccepted;
          state.onboardingCompleted = action.payload.onboardingCompleted;
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // acceptDisclaimer
      .addCase(acceptDisclaimer.fulfilled, (state) => {
        state.disclaimerAccepted = true;
      })
      
      // completeOnboarding
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.onboardingCompleted = true;
      })
      
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
