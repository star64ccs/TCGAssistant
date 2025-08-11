import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import InvestmentAdviceScreen from '../screens/InvestmentAdviceScreen';

// Mock 投資建議服務
jest.mock('../services/investmentAdviceService', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn().mockResolvedValue(),
    generateInvestmentAdvice: jest.fn().mockResolvedValue({
      recommendations: [
        {
          card: { name: 'Test Card', id: '1' },
          recommendedAmount: 100,
          confidence: 0.8,
          risk: 0.3,
          potentialReturn: 0.15,
          timeToMaturity: 90,
          reasoning: ['測試理由'],
          action: 'BUY',
        },
      ],
      riskAssessment: {
        overallRisk: 0.3,
        maxRisk: 0.4,
        riskTolerance: 0.5,
        isWithinTolerance: true,
        riskFactors: ['測試風險因素'],
      },
      portfolioAdvice: {
        totalRecommended: 1000,
        allocationPercentage: 10,
        expectedReturn: { annualized: 0.12 },
        diversification: 0.7,
        optimization: { sharpeRatio: 1.2 },
        rebalancingAdvice: ['測試再平衡建議'],
      },
      marketAnalysis: {},
      investmentStrategy: {
        approach: 'value_investing',
        allocation: { method: 'risk_parity' },
        timing: 'immediate_entry',
        monitoring: { frequency: 'weekly' },
      },
      realTimeData: {
        marketSentiment: { overall: 0.7 },
        priceAlerts: [],
        volumeSpikes: [],
      },
      timestamp: Date.now(),
      confidence: 0.8,
    }),
    getUserInvestmentPortfolio: jest.fn().mockResolvedValue({
      totalValue: 5000,
      diversification: 0.6,
      riskLevel: 'MODERATE',
      performance: 8.5,
      holdings: [
        {
          id: '1',
          name: 'Test Card 1',
          totalValue: 2500,
          performance: 5.2,
        },
      ],
    }),
    getMarketTrends: jest.fn().mockResolvedValue({
      pokemon: 'rising',
      yugioh: 'stable',
      mtg: 'falling',
      onepiece: 'rising',
    }),
  },
}));

// Mock Redux store
const mockStore = configureStore([]);

describe('InvestmentAdviceScreen', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
        },
      },
    });
  });

  it('應該正確渲染投資建議螢幕', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('投資建議')).toBeTruthy();
    expect(getByText('基於 AI 的智能投資分析')).toBeTruthy();
  });

  it('應該顯示價格範圍選擇器', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('價格範圍')).toBeTruthy();
    expect(getByText('全部價格')).toBeTruthy();
    expect(getByText('經濟型 ($1-$50)')).toBeTruthy();
    expect(getByText('中價位 ($50-$200)')).toBeTruthy();
    expect(getByText('高價位 ($200-$1000)')).toBeTruthy();
    expect(getByText('奢華級 ($1000+)')).toBeTruthy();
  });

  it('應該顯示卡牌類型選擇器', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('卡牌類型')).toBeTruthy();
    expect(getByText('Pokemon')).toBeTruthy();
    expect(getByText('Yu-Gi-Oh!')).toBeTruthy();
    expect(getByText('Magic: The Gathering')).toBeTruthy();
    expect(getByText('One Piece')).toBeTruthy();
  });

  it('應該顯示當前篩選條件', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('當前篩選條件')).toBeTruthy();
    expect(getByText('價格範圍:')).toBeTruthy();
    expect(getByText('卡牌類型:')).toBeTruthy();
    expect(getByText('已選擇:')).toBeTruthy();
    expect(getByText('4 種卡牌類型')).toBeTruthy();
  });

  it('應該能夠選擇價格範圍', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    const budgetButton = getByText('經濟型 ($1-$50)');
    fireEvent.press(budgetButton);

    await waitFor(() => {
      expect(getByText('價格範圍:')).toBeTruthy();
    });
  });

  it('應該能夠選擇卡牌類型', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    const pokemonButton = getByText('Pokemon');
    fireEvent.press(pokemonButton);

    await waitFor(() => {
      expect(getByText('卡牌類型:')).toBeTruthy();
    });
  });

  it('應該顯示風險等級選擇器', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('風險等級')).toBeTruthy();
    expect(getByText('保守')).toBeTruthy();
    expect(getByText('適中')).toBeTruthy();
    expect(getByText('激進')).toBeTruthy();
  });

  it('應該顯示投資金額選擇器', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('投資金額')).toBeTruthy();
    expect(getByText('$500')).toBeTruthy();
    expect(getByText('$1,000')).toBeTruthy();
    expect(getByText('$2,500')).toBeTruthy();
    expect(getByText('$5,000')).toBeTruthy();
    expect(getByText('$10,000')).toBeTruthy();
  });

  it('應該顯示時間範圍選擇器', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('投資時間範圍')).toBeTruthy();
    expect(getByText('1個月')).toBeTruthy();
    expect(getByText('3個月')).toBeTruthy();
    expect(getByText('6個月')).toBeTruthy();
    expect(getByText('1年')).toBeTruthy();
  });

  it('應該顯示標籤頁', () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    expect(getByText('投資建議')).toBeTruthy();
    expect(getByText('投資組合')).toBeTruthy();
    expect(getByText('市場趨勢')).toBeTruthy();
  });

  it('應該能夠切換標籤頁', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    const portfolioTab = getByText('投資組合');
    fireEvent.press(portfolioTab);

    await waitFor(() => {
      expect(getByText('當前投資組合分析')).toBeTruthy();
    });
  });

  it('應該顯示投資建議內容', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('投資建議')).toBeTruthy();
      expect(getByText('Test Card')).toBeTruthy();
      expect(getByText('買入')).toBeTruthy();
    });
  });

  it('應該顯示風險評估', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('風險評估')).toBeTruthy();
      expect(getByText('整體風險評分')).toBeTruthy();
    });
  });

  it('應該顯示投資組合建議', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('投資組合建議')).toBeTruthy();
      expect(getByText('投資組合優化')).toBeTruthy();
    });
  });

  it('應該顯示實時市場數據', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('實時市場數據')).toBeTruthy();
      expect(getByText('市場情緒')).toBeTruthy();
    });
  });

  it('應該顯示投資策略', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <InvestmentAdviceScreen />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('投資策略')).toBeTruthy();
      expect(getByText('投資方法')).toBeTruthy();
      expect(getByText('分配策略')).toBeTruthy();
      expect(getByText('時機策略')).toBeTruthy();
      expect(getByText('監控頻率')).toBeTruthy();
    });
  });
});
