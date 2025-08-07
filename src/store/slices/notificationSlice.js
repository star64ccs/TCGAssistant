import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock notifications for testing
const Notifications = {
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
};

// 配置通知
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Async thunks
export const requestNotificationPermissions = createAsyncThunk(
  'notification/requestPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted');
      }
      
      return finalStatus;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const scheduleLocalNotification = createAsyncThunk(
  'notification/scheduleLocal',
  async (notificationData, { rejectWithValue }) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
        },
        trigger: notificationData.trigger || null,
      });
      
      return { id: notificationId, ...notificationData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelNotification = createAsyncThunk(
  'notification/cancelNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelAllNotifications = createAsyncThunk(
  'notification/cancelAll',
  async (_, { rejectWithValue }) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNotification = createAsyncThunk(
  'notification/addNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const newNotification = {
        id: Date.now().toString(),
        ...notificationData,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      
      // 保存到本地存儲
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      notifications.unshift(newNotification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      
      return newNotification;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      );
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      const updatedNotifications = notifications.map(notification => ({ ...notification, isRead: true }));
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      const filteredNotifications = notifications.filter(notification => notification.id !== notificationId);
      await AsyncStorage.setItem('notifications', JSON.stringify(filteredNotifications));
      
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notification/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem('notifications');
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadNotifications = createAsyncThunk(
  'notification/loadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notification/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      return settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadNotificationSettings = createAsyncThunk(
  'notification/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : {
        priceAlerts: true,
        newCards: true,

        tradingUpdates: true,
        sound: true,
        vibration: true,
        badge: true,
        quietHours: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  scheduledNotifications: [],
  isLoading: false,
  error: null,
  permissions: {
    granted: false,
    status: 'undetermined',
  },
  settings: {
    priceAlerts: true,
    newCards: true,

    tradingUpdates: true,
    sound: true,
    vibration: true,
    badge: true,
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  stats: {
    totalNotifications: 0,
    unreadCount: 0,
    todayCount: 0,
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    addScheduledNotification: (state, action) => {
      state.scheduledNotifications.push(action.payload);
    },
    removeScheduledNotification: (state, action) => {
      state.scheduledNotifications = state.scheduledNotifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearScheduledNotifications: (state) => {
      state.scheduledNotifications = [];
    },
    updatePermissions: (state, action) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // requestNotificationPermissions
      .addCase(requestNotificationPermissions.fulfilled, (state, action) => {
        state.permissions.status = action.payload;
        state.permissions.granted = action.payload === 'granted';
      })
      .addCase(requestNotificationPermissions.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // scheduleLocalNotification
      .addCase(scheduleLocalNotification.fulfilled, (state, action) => {
        state.scheduledNotifications.push(action.payload);
      })
      .addCase(scheduleLocalNotification.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // cancelNotification
      .addCase(cancelNotification.fulfilled, (state, action) => {
        state.scheduledNotifications = state.scheduledNotifications.filter(
          notification => notification.id !== action.payload
        );
      })
      .addCase(cancelNotification.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // cancelAllNotifications
      .addCase(cancelAllNotifications.fulfilled, (state) => {
        state.scheduledNotifications = [];
      })
      .addCase(cancelAllNotifications.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // addNotification
      .addCase(addNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        state.stats.totalNotifications += 1;
        state.stats.unreadCount += 1;
      })
      .addCase(addNotification.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationIndex = state.notifications.findIndex(
          notification => notification.id === action.payload
        );
        if (notificationIndex !== -1) {
          state.notifications[notificationIndex].isRead = true;
          state.stats.unreadCount = Math.max(0, state.stats.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // markAllNotificationsAsRead
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.stats.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(
          notification => notification.id === action.payload
        );
        if (deletedNotification && !deletedNotification.isRead) {
          state.stats.unreadCount = Math.max(0, state.stats.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          notification => notification.id !== action.payload
        );
        state.stats.totalNotifications = Math.max(0, state.stats.totalNotifications - 1);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // clearAllNotifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.stats.totalNotifications = 0;
        state.stats.unreadCount = 0;
        state.stats.todayCount = 0;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // loadNotifications
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.stats.totalNotifications = action.payload.length;
        state.stats.unreadCount = action.payload.filter(notification => !notification.isRead).length;
        
        // 計算今天的通知數
        const today = new Date().toDateString();
        state.stats.todayCount = action.payload.filter(notification => 
          new Date(notification.createdAt).toDateString() === today
        ).length;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // updateNotificationSettings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // loadNotificationSettings
      .addCase(loadNotificationSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(loadNotificationSettings.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  updateStats,
  addScheduledNotification,
  removeScheduledNotification,
  clearScheduledNotifications,
  updatePermissions,
} = notificationSlice.actions;

export default notificationSlice.reducer;
