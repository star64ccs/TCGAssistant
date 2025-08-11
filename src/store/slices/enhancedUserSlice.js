import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import enhancedApiService from '../../services/enhancedApiService';
import { API_ENDPOINTS } from '../../services/api';

// 初始狀態
const initialState = {
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// 異步操作：獲取用戶資料
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await enhancedApiService.get(
        API_ENDPOINTS.USER.PROFILE,
        {},
        { useCache: true, cacheKey: 'user_profile' }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：更新用戶資料
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await enhancedApiService.put(
        API_ENDPOINTS.USER.PROFILE,
        profileData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：上傳頭像
export const uploadUserAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (imageFile, { rejectWithValue }) => {
    try {
      const response = await enhancedApiService.uploadFile(
        API_ENDPOINTS.UPLOAD.IMAGE,
        imageFile,
        (progressEvent) => {
          // 可以通過dispatch更新上傳進度
          console.log('上傳進度:', progressEvent.loaded / progressEvent.total);
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：獲取用戶設置
export const fetchUserSettings = createAsyncThunk(
  'user/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await enhancedApiService.get(
        API_ENDPOINTS.USER.SETTINGS,
        {},
        { useCache: true, cacheKey: 'user_settings' }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步操作：更新用戶設置
export const updateUserSettings = createAsyncThunk(
  'user/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await enhancedApiService.put(
        API_ENDPOINTS.USER.SETTINGS,
        settings
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 用戶Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 清除用戶資料
    clearUser: (state) => {
      state.user = null;
      state.profile = null;
      state.error = null;
      state.lastUpdated = null;
    },
    // 設置用戶資料
    setUser: (state, action) => {
      state.user = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    // 清除錯誤
    clearError: (state) => {
      state.error = null;
    },
    // 設置載入狀態
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // uploadUserAvatar
      .addCase(uploadUserAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatarUrl;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // fetchUserSettings
      .addCase(fetchUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateUserSettings
      .addCase(updateUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// 導出actions
export const { clearUser, setUser, clearError, setLoading } = userSlice.actions;

// 導出selectors
export const selectUser = (state) => state.user.user;
export const selectUserProfile = (state) => state.user.profile;
export const selectUserSettings = (state) => state.user.settings;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;
export const selectUserLastUpdated = (state) => state.user.lastUpdated;

// 導出reducer
export default userSlice.reducer;
