import { store } from '../store';

// Redux 調試工具
export const ReduxDebugger = {
  // 獲取當前狀態
  getState: () => {
    return store.getState();
  },

  // 監聽狀態變化
  subscribe: (callback) => {
    return store.subscribe(callback);
  },

  // 分發 action
  dispatch: (action) => {
    return store.dispatch(action);
  },

  // 檢查特定 slice 狀態
  checkSlice: (sliceName) => {
    const state = store.getState();
    return state[sliceName];
  },

  // 打印完整狀態
  logState: () => {
    console.log('🔍 Redux 完整狀態:', store.getState());
  },

  // 打印特定 slice 狀態
  logSlice: (sliceName) => {
    const state = store.getState();
    console.log(`🔍 ${sliceName} 狀態:`, state[sliceName]);
  },

  // 檢查認證狀態
  checkAuth: () => {
    const auth = store.getState().auth;
    console.log('🔐 認證狀態:', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: auth.user ? '已登入' : '未登入',
      error: auth.error,
    });
    return auth;
  },

  // 檢查收藏狀態
  checkCollection: () => {
    const collection = store.getState().collection;
    console.log('📚 收藏狀態:', {
      cardCount: collection.cards?.length || 0,
      isLoading: collection.isLoading,
      totalValue: collection.totalValue,
      error: collection.error,
    });
    return collection;
  },

  // 檢查通知狀態
  checkNotifications: () => {
    const notification = store.getState().notification;
    console.log('🔔 通知狀態:', {
      notificationCount: notification.notifications?.length || 0,
      permissions: notification.permissions,
      error: notification.error,
    });
    return notification;
  },

  // 運行完整狀態檢查
  runFullCheck: () => {
    console.log('🧪 開始 Redux 完整狀態檢查...\n');

    this.checkAuth();
    this.checkCollection();
    this.checkNotifications();

    console.log('\n✅ Redux 狀態檢查完成');
  },
};

// 導出默認實例
export default ReduxDebugger;
