import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useTranslation } from 'react-i18next';

// 測試組件
import ExampleComponent from '../components/ExampleComponent';

// 模擬服務
import exampleService from '../services/exampleService';

// 模擬依賴
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../services/exampleService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    getData: jest.fn(),
    updateOption: jest.fn(),
    getUserStats: jest.fn(),
  },
}));

// 創建模擬store
const mockStore = configureStore([]);

// 測試數據
const mockUser = {
  id: 'test-user-001',
  name: '測試用戶',
  email: 'test@example.com',
};

const mockData = {
  id: 'mock-data-001',
  title: '示例數據',
  description: '這是一個示例數據對象',
  timestamp: '2024-01-01T00:00:00.000Z',
  metadata: {
    version: '1.0.0',
    source: 'example-service',
    tags: ['example', 'mock', 'data'],
  },
  statistics: {
    views: 500,
    likes: 50,
    shares: 25,
  },
};

const mockTranslation = {
  t: jest.fn((key) => {
    const translations = {
      'example.title': '示例標題',
      'example.subtitle': '示例副標題',
      'example.selectOption': '選擇選項',
      'example.option1': '選項1',
      'example.option2': '選項2',
      'example.option3': '選項3',
      'example.noData': '沒有數據',
      'example.updateFailed': '更新失敗',
      'common.loading': '載入中...',
      'common.error': '錯誤',
      'common.retry': '重試',
    };
    return translations[key] || key;
  }),
};

/**
 * 示例組件測試套件
 */
describe('ExampleComponent', () => {
  let store;

  beforeEach(() => {
    // 設置模擬store
    store = mockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
      },
      example: {
        data: null,
        isLoading: false,
        error: null,
      },
    });

    // 設置翻譯模擬
    useTranslation.mockReturnValue(mockTranslation);

    // 重置所有模擬
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * 渲染測試
   */
  describe('渲染測試', () => {
    it('應該正確渲染組件', () => {
      const { getByText } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      expect(getByText('示例標題')).toBeTruthy();
      expect(getByText('示例副標題')).toBeTruthy();
      expect(getByText('選擇選項')).toBeTruthy();
    });

    it('應該渲染所有選項按鈕', () => {
      const { getByText } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      expect(getByText('選項1')).toBeTruthy();
      expect(getByText('選項2')).toBeTruthy();
      expect(getByText('選項3')).toBeTruthy();
    });

    it('應該在未認證時顯示空狀態', () => {
      const unauthenticatedStore = mockStore({
        auth: {
          user: null,
          isAuthenticated: false,
        },
        example: {
          data: null,
          isLoading: false,
          error: null,
        },
      });

      const { getByText } = render(
        <Provider store={unauthenticatedStore}>
          <ExampleComponent />
        </Provider>,
      );

      expect(getByText('沒有數據')).toBeTruthy();
    });
  });

  /**
   * 交互測試
   */
  describe('交互測試', () => {
    it('應該能夠選擇選項', async () => {
      const { getByText } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      const option1Button = getByText('選項1');
      fireEvent.press(option1Button);

      await waitFor(() => {
        expect(exampleService.updateOption).toHaveBeenCalledWith(
          mockUser.id,
          'option1',
        );
      });
    });

    it('應該能夠刷新數據', async () => {
      exampleService.getData.mockResolvedValue(mockData);

      const { getByTestId } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      // 模擬下拉刷新
      const scrollView = getByTestId('scroll-view');
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 0 },
          contentSize: { height: 500, width: 100 },
          layoutMeasurement: { height: 100, width: 100 },
        },
      });

      await waitFor(() => {
        expect(exampleService.getData).toHaveBeenCalledWith(mockUser.id);
      });
    });

    it('應該能夠重試載入', async () => {
      exampleService.getData.mockRejectedValue(new Error('載入失敗'));

      const { getByText } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      const retryButton = getByText('重試');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(exampleService.getData).toHaveBeenCalledTimes(2);
      });
    });
  });

  /**
   * 狀態測試
   */
  describe('狀態測試', () => {
    it('應該在載入時顯示載入指示器', () => {
      const loadingStore = mockStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
        },
        example: {
          data: null,
          isLoading: true,
          error: null,
        },
      });

      const { getByText } = render(
        <Provider store={loadingStore}>
          <ExampleComponent />
        </Provider>,
      );

      expect(getByText('載入中...')).toBeTruthy();
    });

    it('應該在錯誤時顯示錯誤信息', () => {
      const errorStore = mockStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
        },
        example: {
          data: null,
          isLoading: false,
          error: '載入數據失敗',
        },
      });

      const { getByText } = render(
        <Provider store={errorStore}>
          <ExampleComponent />
        </Provider>,
      );

      expect(getByText('載入數據失敗')).toBeTruthy();
      expect(getByText('重試')).toBeTruthy();
    });

    it('應該在有數據時顯示內容', () => {
      const dataStore = mockStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
        },
        example: {
          data: mockData,
          isLoading: false,
          error: null,
        },
      });

      const { getByText } = render(
        <Provider store={dataStore}>
          <ExampleComponent />
        </Provider>,
      );

      expect(getByText('這是一個示例數據對象')).toBeTruthy();
    });
  });

  /**
   * 服務集成測試
   */
  describe('服務集成測試', () => {
    it('應該在組件掛載時初始化服務', async () => {
      exampleService.initialize.mockResolvedValue();

      render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      await waitFor(() => {
        expect(exampleService.initialize).toHaveBeenCalled();
      });
    });

    it('應該在用戶認證後載入數據', async () => {
      exampleService.getData.mockResolvedValue(mockData);

      render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      await waitFor(() => {
        expect(exampleService.getData).toHaveBeenCalledWith(mockUser.id);
      });
    });

    it('應該處理服務錯誤', async () => {
      exampleService.getData.mockRejectedValue(new Error('服務錯誤'));

      const { getByText } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      await waitFor(() => {
        expect(getByText('重試')).toBeTruthy();
      });
    });
  });

  /**
   * 性能測試
   */
  describe('性能測試', () => {
    it('應該避免不必要的重新渲染', () => {
      const { rerender } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      // 重新渲染相同的props
      rerender(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      // 驗證服務沒有被重複調用
      expect(exampleService.initialize).toHaveBeenCalledTimes(1);
    });

    it('應該正確使用useCallback', () => {
      const { getByText } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      const option1Button = getByText('選項1');
      const option2Button = getByText('選項2');

      // 多次點擊應該不會創建新的函數實例
      fireEvent.press(option1Button);
      fireEvent.press(option2Button);
      fireEvent.press(option1Button);

      // 驗證調用次數
      expect(exampleService.updateOption).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * 邊界情況測試
   */
  describe('邊界情況測試', () => {
    it('應該處理空數據', () => {
      const emptyDataStore = mockStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
        },
        example: {
          data: null,
          isLoading: false,
          error: null,
        },
      });

      const { getByText } = render(
        <Provider store={emptyDataStore}>
          <ExampleComponent />
        </Provider>,
      );

      expect(getByText('沒有數據')).toBeTruthy();
    });

    it('應該處理無效的用戶ID', async () => {
      const invalidUserStore = mockStore({
        auth: {
          user: { id: '' },
          isAuthenticated: true,
        },
        example: {
          data: null,
          isLoading: false,
          error: null,
        },
      });

      render(
        <Provider store={invalidUserStore}>
          <ExampleComponent />
        </Provider>,
      );

      // 驗證服務沒有被調用
      expect(exampleService.getData).not.toHaveBeenCalled();
    });

    it('應該處理網絡錯誤', async () => {
      exampleService.getData.mockRejectedValue(new Error('網絡錯誤'));

      const { getByText } = render(
        <Provider store={store}>
          <ExampleComponent />
        </Provider>,
      );

      await waitFor(() => {
        expect(getByText('重試')).toBeTruthy();
      });
    });
  });
});
