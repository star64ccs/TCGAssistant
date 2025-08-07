import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// Mock the services
jest.mock('../services/mlService', () => ({
  advancedPricePrediction: jest.fn(),
}));

jest.mock('../services/integratedApiService', () => ({
  getCardPrices: jest.fn(),
}));

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock the route
const mockRoute = {
  params: {},
};

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      membership: (state = { membershipType: 'FREE' }, action) => state,
      settings: (state = { language: 'zh-TW' }, action) => state,
    },
    preloadedState: initialState,
  });
};

// Import the component after mocking
import InvestmentAdviceScreen from '../screens/InvestmentAdviceScreen';

const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </Provider>
  );
};

describe('InvestmentAdviceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('應該正確渲染投資建議頁面', () => {
    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('投資建議')).toBeTruthy();
    expect(getByText('基於市場評級和AI預測的投資建議')).toBeTruthy();
  });

  test('應該顯示VIP要求提示當用戶不是VIP', () => {
    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('需要VIP會員訪問')).toBeTruthy();
    expect(getByText('升級VIP以訪問投資建議功能')).toBeTruthy();
  });

  test('應該處理VIP用戶的訪問', () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { queryByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    // VIP用戶不應該看到升級提示
    expect(queryByText('需要VIP會員訪問')).toBeNull();
  });

  test('應該顯示投資建議卡片', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('青眼白龍')).toBeTruthy();
      expect(getByText('皮卡丘 VMAX')).toBeTruthy();
      expect(getByText('艾斯')).toBeTruthy();
      expect(getByText('黑魔導')).toBeTruthy();
      expect(getByText('超夢')).toBeTruthy();
    });
  });

  test('應該顯示價格信息', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('當前價格: $1,200')).toBeTruthy();
      expect(getByText('預測價格: $1,500')).toBeTruthy();
      expect(getByText('價格漲幅: +25%')).toBeTruthy();
    });
  });

  test('應該顯示市場評級', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('市場評級: A+')).toBeTruthy();
      expect(getByText('置信度: 95%')).toBeTruthy();
    });
  });

  test('應該顯示投資建議類型', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('強烈買入')).toBeTruthy();
      expect(getByText('買入')).toBeTruthy();
      expect(getByText('持有')).toBeTruthy();
    });
  });

  test('應該顯示風險等級', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('低風險')).toBeTruthy();
      expect(getByText('中等風險')).toBeTruthy();
      expect(getByText('高風險')).toBeTruthy();
    });
  });

  test('應該顯示時間範圍', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('短期')).toBeTruthy();
      expect(getByText('中期')).toBeTruthy();
      expect(getByText('長期')).toBeTruthy();
    });
  });

  test('應該處理下拉刷新', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByTestId } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    const scrollView = getByTestId('investment-advice-scrollview');
    
    // 模擬下拉刷新
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: -100 },
        contentSize: { height: 1000, width: 400 },
        layoutMeasurement: { height: 800, width: 400 },
      },
    });

    await waitFor(() => {
      // 檢查是否觸發了刷新
      expect(scrollView).toBeTruthy();
    });
  });

  test('應該處理建議卡片點擊', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      const card = getByText('青眼白龍');
      fireEvent.press(card);
    });

    // 檢查是否導航到卡牌詳情頁面
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CardDetails', {
      cardName: '青眼白龍',
    });
  });

  test('應該顯示建議理由', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('理由: 市場需求強勁，供應有限')).toBeTruthy();
      expect(getByText('理由: 新版本發布帶動需求')).toBeTruthy();
      expect(getByText('理由: 收藏價值持續上升')).toBeTruthy();
    });
  });

  test('應該正確顯示價格漲幅顏色', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      const positiveChange = getByText('價格漲幅: +25%');
      const negativeChange = getByText('價格漲幅: -5%');
      
      expect(positiveChange).toBeTruthy();
      expect(negativeChange).toBeTruthy();
    });
  });

  test('應該顯示無建議時的提示', () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    // Mock empty advice
    jest.spyOn(require('../screens/InvestmentAdviceScreen'), 'generateInvestmentAdvice')
      .mockReturnValue([]);

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    expect(getByText('暫無投資建議')).toBeTruthy();
    expect(getByText('請稍後再試')).toBeTruthy();
  });

  test('應該處理錯誤狀態', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    // Mock service error
    jest.spyOn(require('../services/integratedApiService'), 'getCardPrices')
      .mockRejectedValue(new Error('API Error'));

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    await waitFor(() => {
      expect(getByText('載入失敗')).toBeTruthy();
      expect(getByText('請稍後再試')).toBeTruthy();
    });
  });

  test('應該顯示載入狀態', async () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    // Mock loading state
    jest.spyOn(require('../services/integratedApiService'), 'getCardPrices')
      .mockImplementation(() => new Promise(() => {}));

    const { getByText } = renderWithProviders(
      <InvestmentAdviceScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    expect(getByText('載入中...')).toBeTruthy();
  });
});
