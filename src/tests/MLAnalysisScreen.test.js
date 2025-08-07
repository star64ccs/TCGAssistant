import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// Mock the services
jest.mock('../services/mlService', () => ({
  advancedPricePrediction: jest.fn(),
  getPersonalizedRecommendations: jest.fn(),
  intelligentMarketAnalysis: jest.fn(),
  optimizeInvestmentPortfolio: jest.fn(),
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
import MLAnalysisScreen from '../screens/MLAnalysisScreen';

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

describe('MLAnalysisScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('應該正確渲染ML分析頁面', () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('機器學習分析')).toBeTruthy();
    expect(getByText('高級AI分析功能')).toBeTruthy();
  });

  test('應該顯示VIP要求提示當用戶不是VIP', () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('需要VIP會員')).toBeTruthy();
    expect(getByText('立即升級')).toBeTruthy();
  });

  test('應該顯示所有標籤頁', () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('價格預測')).toBeTruthy();
    expect(getByText('個性化推薦')).toBeTruthy();
    expect(getByText('市場分析')).toBeTruthy();
    expect(getByText('投資組合')).toBeTruthy();
  });

  test('應該能夠切換標籤頁', () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const recommendationsTab = getByText('個性化推薦');
    fireEvent.press(recommendationsTab);

    // 檢查是否顯示推薦相關內容
    expect(getByText('個性化推薦')).toBeTruthy();
  });

  test('應該處理VIP用戶的訪問', () => {
    const vipState = {
      membership: { membershipType: 'VIP_PAID' },
      settings: { language: 'zh-TW' },
    };

    const { queryByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />,
      vipState
    );

    // VIP用戶不應該看到升級提示
    expect(queryByText('需要VIP會員')).toBeNull();
  });

  test('應該顯示算法選項', () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('線性回歸')).toBeTruthy();
    expect(getByText('隨機森林')).toBeTruthy();
    expect(getByText('神經網絡')).toBeTruthy();
    expect(getByText('時間序列')).toBeTruthy();
    expect(getByText('集成學習')).toBeTruthy();
  });

  test('應該顯示風險等級選項', () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('低風險')).toBeTruthy();
    expect(getByText('中等風險')).toBeTruthy();
    expect(getByText('高風險')).toBeTruthy();
  });

  test('應該處理預測按鈕點擊', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const predictButton = getByText('開始高級預測');
    fireEvent.press(predictButton);

    await waitFor(() => {
      expect(getByText('預測中...')).toBeTruthy();
    });
  });

  test('應該處理推薦按鈕點擊', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const recommendationsTab = getByText('個性化推薦');
    fireEvent.press(recommendationsTab);

    const recommendButton = getByText('獲取個性化推薦');
    fireEvent.press(recommendButton);

    await waitFor(() => {
      expect(getByText('分析中...')).toBeTruthy();
    });
  });

  test('應該處理市場分析按鈕點擊', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const marketTab = getByText('市場分析');
    fireEvent.press(marketTab);

    const analyzeButton = getByText('開始市場分析');
    fireEvent.press(analyzeButton);

    await waitFor(() => {
      expect(getByText('分析中...')).toBeTruthy();
    });
  });

  test('應該處理投資組合優化按鈕點擊', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const portfolioTab = getByText('投資組合');
    fireEvent.press(portfolioTab);

    const optimizeButton = getByText('優化投資組合');
    fireEvent.press(optimizeButton);

    await waitFor(() => {
      expect(getByText('優化中...')).toBeTruthy();
    });
  });

  test('應該顯示預測結果', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const predictButton = getByText('開始高級預測');
    fireEvent.press(predictButton);

    await waitFor(() => {
      expect(getByText('預測結果')).toBeTruthy();
    });
  });

  test('應該顯示推薦結果', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const recommendationsTab = getByText('個性化推薦');
    fireEvent.press(recommendationsTab);

    const recommendButton = getByText('獲取個性化推薦');
    fireEvent.press(recommendButton);

    await waitFor(() => {
      expect(getByText('推薦結果')).toBeTruthy();
    });
  });

  test('應該顯示市場洞察', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const marketTab = getByText('市場分析');
    fireEvent.press(marketTab);

    const analyzeButton = getByText('開始市場分析');
    fireEvent.press(analyzeButton);

    await waitFor(() => {
      expect(getByText('市場洞察')).toBeTruthy();
    });
  });

  test('應該顯示投資組合建議', async () => {
    const { getByText } = renderWithProviders(
      <MLAnalysisScreen navigation={mockNavigation} route={mockRoute} />
    );

    const portfolioTab = getByText('投資組合');
    fireEvent.press(portfolioTab);

    const optimizeButton = getByText('優化投資組合');
    fireEvent.press(optimizeButton);

    await waitFor(() => {
      expect(getByText('投資組合建議')).toBeTruthy();
    });
  });
});
