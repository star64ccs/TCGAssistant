import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// 初始狀態
const initialState = {
  isLoading: false,
  loadingText: '',
  modal: {
    visible: false,
    type: null,
    data: null,
  },
  toast: {
    visible: false,
    type: 'info', // 'success', 'error', 'warning', 'info'
    message: '',
    duration: 3000,
  },
  bottomSheet: {
    visible: false,
    type: null,
    data: null,
  },
  networkStatus: {
    isConnected: true,
    connectionType: 'wifi',
  },
  permissions: {
    camera: false,
    photoLibrary: false,
    notifications: false,
  },
};

// 建立 slice
const uiSlice = createSlice || (() => {})({
  name: 'ui',
  initialState,
  reducers: {
    // 載入狀態
    setLoading: (state, action) => {      state.isLoading = action.payload.isLoading;      state.loadingText = action.payload.text || '';
    },    // 模態框
    showModal: (state, action) => {
      state.modal = {        visible: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    hideModal: (state) => {
      state.modal = {        visible: false,
        type: null,
        data: null,
      };
    },    // Toast 通知
    showToast: (state, action) => {
      state.toast = {        visible: true,
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 3000,
      };
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },    // 底部彈出層
    showBottomSheet: (state, action) => {
      state.bottomSheet = {        visible: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    hideBottomSheet: (state) => {
      state.bottomSheet = {        visible: false,
        type: null,
        data: null,
      };
    },    // 網路狀態
    updateNetworkStatus: (state, action) => {
      state.networkStatus = {        ...state.networkStatus,        ...action.payload,
      };
    },    // 權限狀態
    updatePermissions: (state, action) => {
      state.permissions = {        ...state.permissions,        ...action.payload,
      };
    },    // 重置 UI 狀態
    resetUI: (state) => {
      state.isLoading = false;      state.loadingText = '';      state.modal = {        visible: false,
        type: null,
        data: null,
      };      state.toast = {
        visible: false,
        type: 'info',
        message: '',
        duration: 3000,
      };      state.bottomSheet = {
        visible: false,
        type: null,
        data: null,
      };
    },
  },
});

export const {
  setLoading,
  showModal,
  hideModal,
  showToast,
  hideToast,
  showBottomSheet,
  hideBottomSheet,
  updateNetworkStatus,
  updatePermissions,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
