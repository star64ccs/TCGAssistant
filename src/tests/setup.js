import 'react-native-gesture-handler/jestSetup';

// Polyfill for setImmediate
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock Expo modules
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  Linking: {
    openURL: jest.fn(),
  },
  Notifications: { getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
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
  Sharing: { shareAsync: jest.fn() },
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
  useRoute: () => ({ params: {},
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
      request: { use: jest.fn(),
      },
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
jest.mock('react-native/Libraries/Alert/Alert', () => ({ alert: jest.fn() }));

// Mock Permissions (簡化版本)
jest.mock('expo-permissions', () => ({}), { virtual: true });

// Mock Notifications (簡化版本)
jest.mock('expo-notifications', () => ({}), { virtual: true });

// Mock Localization (簡化版本)
jest.mock('expo-localization', () => ({}), { virtual: true });

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
  }),
);

// Mock Background Jobs (簡化版本)
jest.mock('react-native-background-job', () => ({}), { virtual: true });

// Mock SQLite (使用 Expo SQLite)
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    exec: jest.fn(() => Promise.resolve()),
    transaction: jest.fn(),
  })),
}), { virtual: true });

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({})),
  },
  writable: true,
});
