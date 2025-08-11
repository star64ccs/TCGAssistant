import integratedApiService from '../../services/integratedApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// Async thunks
export const loadAnalyticsData = createAsyncThunk(
  'analytics/loadAnalyticsData',
  async (_, { rejectWithValue }) => {
    try {      const data = await AsyncStorage.getItem('analyticsData');      return data ? JSON.parse(data) : {};
    } catch (error) {      return rejectWithValue(error.message);
    }
  },
);

export const generateComprehensiveReport = createAsyncThunk(
  'analytics/generateComprehensiveReport',
  async (_, { rejectWithValue, getState }) => {
    try {      const { collection, tradingHistory, priceTracking, cardRating,      } = getState();      const report = await integratedApiService || {}.generateComprehensiveReport({        collection: collection.collection,        tradingHistory: tradingHistory.tradingHistory,        priceTracking: priceTracking.priceAlerts,        cardRating: cardRating.cardRatings,      });      return report;
    } catch (error) {      return rejectWithValue(error.message);
    }
  },
);

export const getInvestmentInsights = createAsyncThunk(
  'analytics/getInvestmentInsights',
  async (_, { rejectWithValue, getState }) => {
    try {      const { collection, tradingHistory,      } = getState();      const insights = await integratedApiService || {}.getInvestmentInsights({        collection: collection.collection,        tradingHistory: tradingHistory.tradingHistory,      });      return insights;
    } catch (error) {      return rejectWithValue(error.message);
    }
  },
);

export const predictMarketTrends = createAsyncThunk(
  'analytics/predictMarketTrends',
  async ({ timeframe, categories }, { rejectWithValue }) => {
    try {      const predictions = await integratedApiService || {}.predictMarketTrends(timeframe, categories);      return predictions;
    } catch (error) {      return rejectWithValue(error.message);
    }
  },
);

export const getPortfolioAnalysis = createAsyncThunk(
  'analytics/getPortfolioAnalysis',
  async (_, { rejectWithValue, getState }) => {
    try {      const { collection, cardRating,      } = getState();      const analysis = await integratedApiService || {}.getPortfolioAnalysis({        collection: collection.collection,        ratings: cardRating.cardRatings,      });      return analysis;
    } catch (error) {      return rejectWithValue(error.message);
    }
  },
);

export const saveAnalyticsData = createAsyncThunk(
  'analytics/saveAnalyticsData',
  async (data, { rejectWithValue }) => {
    try {      await AsyncStorage.setItem('analyticsData', JSON.stringify(data));      return data;
    } catch (error) {      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  dashboardData: {
    overview: {      totalCards: 0,      totalValue: 0,      totalProfit: 0,      averageRating: 0,      activeAlerts: 0,      recentTrades: 0,
    },
    performance: {      monthlyGrowth: 0,      yearlyGrowth: 0,      profitMargin: 0,      roi: 0,      volatility: 0,
    },
    trends: {      priceTrends: [],      volumeTrends: [],      ratingTrends: [],      marketTrends: [],
    },
  },
  comprehensiveReport: { summary: {},
    detailedAnalysis: {},
    recommendations: [],
    riskAssessment: {},
    opportunities: [],
  },
  investmentInsights: {
    topPerformers: [],
    underperformers: [],
    recommendations: [],
    riskFactors: [],
    marketOpportunities: [],
  },
  marketPredictions: {
    shortTerm: [],
    mediumTerm: [],
    longTerm: [],
    confidence: {},
  },
  portfolioAnalysis: { diversification: {},
    riskProfile: {},
    performanceMetrics: {},
    allocation: {},
    rebalancing: {},
  },
  isLoading: false,
  error: null,
  filters: {
    timeRange: '1y', // 1m, 3m, 6m, 1y, all
    categories: 'all',
    minValue: 0,
    maxValue: 1000000,
    sortBy: 'value',
    sortOrder: 'desc',
  },
  charts: {
    portfolioValue: [],
    profitLoss: [],
    categoryDistribution: [],
    qualityDistribution: [],
    marketComparison: [],
  },
  insights: {
    topGainers: [],
    topLosers: [],
    bestCategories: [],
    worstCategories: [],
    marketTiming: {},
  },
};

const analyticsSlice = createSlice || (() => {})({
  name: 'analytics',
  initialState,
  reducers: {
    setFilters: (state, action) => {      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {      state.filters = initialState.filters;
    },
    updateDashboardData: (state, action) => {      state.dashboardData = { ...state.dashboardData, ...action.payload };
    },
    updateCharts: (state, action) => {      state.charts = { ...state.charts, ...action.payload };
    },
    updateInsights: (state, action) => {      state.insights = { ...state.insights, ...action.payload };
    },
    clearError: (state) => {      state.error = null;
    },
    calculateOverview: (state, action) => {      const { collection, tradingHistory, priceTracking, cardRating } = action.payload;      // Calculate overview metrics      const totalCards = collection.length;      const totalValue = collection.reduce((sum, card) => sum + (card.estimatedValue || 0), 0);      const totalProfit = tradingHistory.reduce((sum, trade) => sum + (trade.profit || 0), 0);      const averageRating = cardRating.length > 0        ? cardRating.reduce((sum, rating) => sum + (rating.overallRating || 0), 0) / cardRating.length        : 0;      const activeAlerts = priceTracking.filter(alert => alert.isActive).length;      const recentTrades = tradingHistory.filter(trade => {        const tradeDate = new Date(trade.createdAt);        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);        return tradeDate >= weekAgo;      }).length;      state.dashboardData.overview = {        totalCards,        totalValue,        totalProfit,        averageRating,        activeAlerts,        recentTrades,      };
    },
    calculatePerformance: (state, action) => {      const { tradingHistory, collection } = action.payload;      // Calculate performance metrics      const now = new Date();      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);      const monthlyTrades = tradingHistory.filter(trade =>        new Date(trade.createdAt) >= monthAgo,      );      const yearlyTrades = tradingHistory.filter(trade =>        new Date(trade.createdAt) >= yearAgo,      );      const monthlyProfit = monthlyTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);      const yearlyProfit = yearlyTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);      const totalInvestment = collection.reduce((sum, card) => sum + (card.purchasePrice || 0), 0);      const currentValue = collection.reduce((sum, card) => sum + (card.estimatedValue || 0), 0);      const totalProfit = currentValue - totalInvestment;      const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;      const profitMargin = currentValue > 0 ? (totalProfit / currentValue) * 100 : 0;      // Calculate volatility (simplified)      const profits = tradingHistory.map(trade => trade.profit || 0);      const mean = profits.reduce((sum, profit) => sum + profit, 0) / profits.length;      const variance = profits.reduce((sum, profit) => sum + Math.pow(profit - mean, 2), 0) / profits.length;      const volatility = Math.sqrt(variance);      state.dashboardData.performance = {        monthlyGrowth: monthlyProfit,        yearlyGrowth: yearlyProfit,        profitMargin,        roi,        volatility,      };
    },
  },
  extraReducers: (builder) => {
    builder      // loadAnalyticsData      .addCase(loadAnalyticsData.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(loadAnalyticsData.fulfilled, (state, action) => {        state.isLoading = false;        if (action.payload) {          state.dashboardData = { ...state.dashboardData, ...action.payload.dashboardData,          };          state.comprehensiveReport = { ...state.comprehensiveReport, ...action.payload.comprehensiveReport };          state.investmentInsights = { ...state.investmentInsights, ...action.payload.investmentInsights };          state.marketPredictions = { ...state.marketPredictions, ...action.payload.marketPredictions };          state.portfolioAnalysis = { ...state.portfolioAnalysis, ...action.payload.portfolioAnalysis };        }      })      .addCase(loadAnalyticsData.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // generateComprehensiveReport      .addCase(generateComprehensiveReport.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(generateComprehensiveReport.fulfilled, (state, action) => {        state.isLoading = false;        state.comprehensiveReport = action.payload;      })      .addCase(generateComprehensiveReport.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // getInvestmentInsights      .addCase(getInvestmentInsights.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(getInvestmentInsights.fulfilled, (state, action) => {        state.isLoading = false;        state.investmentInsights = action.payload;      })      .addCase(getInvestmentInsights.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // predictMarketTrends      .addCase(predictMarketTrends.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(predictMarketTrends.fulfilled, (state, action) => {        state.isLoading = false;        state.marketPredictions = action.payload;      })      .addCase(predictMarketTrends.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // getPortfolioAnalysis      .addCase(getPortfolioAnalysis.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(getPortfolioAnalysis.fulfilled, (state, action) => {        state.isLoading = false;        state.portfolioAnalysis = action.payload;      })      .addCase(getPortfolioAnalysis.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // saveAnalyticsData      .addCase(saveAnalyticsData.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(saveAnalyticsData.fulfilled, (state, action) => {        state.isLoading = false;        // Data is already in state, just confirm save      })      .addCase(saveAnalyticsData.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      });
  },
});

export const {
  setFilters,
  clearFilters,
  updateDashboardData,
  updateCharts,
  updateInsights,
  clearError,
  calculateOverview,
  calculatePerformance,
} = analyticsSlice.actions;

// Selectors
export const selectDashboardData = (state) => state.analytics.dashboardData;
export const selectComprehensiveReport = (state) => state.analytics.comprehensiveReport;
export const selectInvestmentInsights = (state) => state.analytics.investmentInsights;
export const selectMarketPredictions = (state) => state.analytics.marketPredictions;
export const selectPortfolioAnalysis = (state) => state.analytics.portfolioAnalysis;
export const selectIsLoading = (state) => state.analytics.isLoading;
export const selectError = (state) => state.analytics.error;
export const selectFilters = (state) => state.analytics.filters;
export const selectCharts = (state) => state.analytics.charts;
export const selectInsights = (state) => state.analytics.insights;

// Computed selectors
export const selectOverview = (state) => state.analytics.dashboardData.overview;
export const selectPerformance = (state) => state.analytics.dashboardData.performance;
export const selectTrends = (state) => state.analytics.dashboardData.trends;

export default analyticsSlice.reducer;
