import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, MEMBERSHIP_TYPES } from '../../constants';

// 初始狀態
const initialState = {
  membershipType: MEMBERSHIP_TYPES.FREE,
  trialDaysLeft: 0,
  dailyUsage: 0,
  dailyLimit: 5,
  subscriptionEndDate: null,
  isLoading: false,
  error: null,
};

// 異步 action：檢查會員狀態
export const checkMembershipStatus = createAsyncThunk(
  'membership/checkStatus',
  async () => {
    try {
      const membershipInfo = await AsyncStorage.getItem(STORAGE_KEYS.MEMBERSHIP_INFO);
      if (membershipInfo) {
        return JSON.parse(membershipInfo);
      }
      return initialState;
    } catch (error) {
      console.error('Check membership status error:', error);
      return initialState;
    }
  }
);

// 異步 action：升級會員
export const upgradeMembership = createAsyncThunk(
  'membership/upgrade',
  async ({ membershipType, trialDays = 7 }, { rejectWithValue }) => {
    try {
      // 這裡應該調用實際的支付 API
      // const response = await paymentAPI.upgrade(membershipType);
      
      const membershipInfo = {
        membershipType,
        trialDaysLeft: trialDays,
        dailyUsage: 0,
        dailyLimit: membershipType === MEMBERSHIP_TYPES.VIP_TRIAL ? 1 : Infinity,
        subscriptionEndDate: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.MEMBERSHIP_INFO, JSON.stringify(membershipInfo));
      return membershipInfo;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：使用功能
export const useFeature = createAsyncThunk(
  'membership/useFeature',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { membership } = getState();
      const { dailyUsage, dailyLimit, membershipType } = membership;

      if (membershipType === MEMBERSHIP_TYPES.FREE && dailyUsage >= dailyLimit) {
        throw new Error('Daily limit exceeded');
      }

      if (membershipType === MEMBERSHIP_TYPES.VIP_TRIAL && dailyUsage >= dailyLimit) {
        throw new Error('Trial daily limit exceeded');
      }

      const newUsage = dailyUsage + 1;
      const membershipInfo = {
        ...membership,
        dailyUsage: newUsage,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.MEMBERSHIP_INFO, JSON.stringify(membershipInfo));
      return membershipInfo;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步 action：重置每日使用量
export const resetDailyUsage = createAsyncThunk(
  'membership/resetDailyUsage',
  async (_, { getState }) => {
    try {
      const { membership } = getState();
      const membershipInfo = {
        ...membership,
        dailyUsage: 0,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.MEMBERSHIP_INFO, JSON.stringify(membershipInfo));
      return membershipInfo;
    } catch (error) {
      console.error('Reset daily usage error:', error);
    }
  }
);

// 建立 slice
const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateTrialDays: (state, action) => {
      state.trialDaysLeft = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkMembershipStatus
      .addCase(checkMembershipStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkMembershipStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(checkMembershipStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // upgradeMembership
      .addCase(upgradeMembership.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(upgradeMembership.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(upgradeMembership.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // useFeature
      .addCase(useFeature.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(useFeature.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // resetDailyUsage
      .addCase(resetDailyUsage.fulfilled, (state, action) => {
        if (action.payload) {
          Object.assign(state, action.payload);
        }
      });
  },
});

export const { clearError, updateTrialDays } = membershipSlice.actions;
export default membershipSlice.reducer;
