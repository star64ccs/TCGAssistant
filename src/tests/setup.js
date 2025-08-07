import 'react-native-gesture-handler/jestSetup';

// Polyfill for setImmediate
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  Linking: {
    openURL: jest.fn(),
  },
  Notifications: {
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
  },
  Camera: {
    CameraType: {
      front: 'front',
      back: 'back',
    },
  },
  ImagePicker: {
    launchCameraAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
  },
  FileSystem: {
    documentDirectory: '/mock/document/directory/',
    cacheDirectory: '/mock/cache/directory/',
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
    moveAsync: jest.fn(),
    copyAsync: jest.fn(),
    makeDirectoryAsync: jest.fn(),
    readDirectoryAsync: jest.fn(),
  },
  Sharing: {
    shareAsync: jest.fn(),
  },
  Haptics: {
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'zh-TW',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock Axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({
    width: 375,
    height: 812,
  })),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
}));

// Mock Push Notifications
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  onRegister: jest.fn(),
  onNotification: jest.fn(),
  onAction: jest.fn(),
  onRegistrationError: jest.fn(),
  permissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  requestPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  abandonPermissions: jest.fn(),
  checkPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  getBadgeCount: jest.fn(() => Promise.resolve(0)),
  setBadgeCount: jest.fn(),
  clearAllNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(() => Promise.resolve([])),
  removeDeliveredNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(() => Promise.resolve([])),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  createChannel: jest.fn(),
  channelExists: jest.fn(() => Promise.resolve(false)),
  deleteChannel: jest.fn(),
  getChannels: jest.fn(() => Promise.resolve([])),
  channelBlocked: jest.fn(() => Promise.resolve(false)),
  unregister: jest.fn(),
}));

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  getLocales: () => [
    {
      countryCode: 'TW',
      languageTag: 'zh-TW',
      languageCode: 'zh',
      isRTL: false,
    },
  ],
  getCountry: () => 'TW',
  getLanguages: () => ['zh-TW'],
  getTimeZone: () => 'Asia/Taipei',
  isRTL: false,
  uses24HourClock: () => true,
  usesMetricSystem: () => true,
}));

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock react-native-background-job
jest.mock('react-native-background-job', () => ({
  register: jest.fn(() => Promise.resolve()),
  schedule: jest.fn(() => Promise.resolve()),
  cancel: jest.fn(() => Promise.resolve()),
  cancelAll: jest.fn(() => Promise.resolve()),
  isJobScheduled: jest.fn(() => Promise.resolve(false)),
  getJobStatus: jest.fn(() => Promise.resolve('idle')),
}));

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(() => Promise.resolve()),
    transaction: jest.fn((callback) => callback({
      executeSql: jest.fn(),
    })),
    close: jest.fn(() => Promise.resolve()),
  })),
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({})),
  },
  writable: true,
});
