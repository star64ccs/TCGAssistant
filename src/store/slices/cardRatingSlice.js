import integratedApiService from '../../services/integratedApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// Async thunks
export const rateCard = createAsyncThunk(
  'cardRating/rateCard',
  async ({ cardId, ratingData }, { rejectWithValue }) => {
    try {      const response = await integratedApiService || {}.rateCard(cardId, ratingData);      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const analyzeCardValue = createAsyncThunk(
  'cardRating/analyzeCardValue',
  async ({ cardId, analysisType }, { rejectWithValue }) => {
    try {      const response = await integratedApiService || {}.analyzeCardValue(cardId, analysisType);      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const getCardQualityScore = createAsyncThunk(
  'cardRating/getCardQualityScore',
  async ({ cardId, images }, { rejectWithValue }) => {
    try {      const response = await integratedApiService || {}.getCardQualityScore(cardId, images);      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const getCollectionStats = createAsyncThunk(
  'cardRating/getCollectionStats',
  async (_, { rejectWithValue }) => {
    try {      const response = await integratedApiService || {}.getCollectionStats();      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const loadCardRatings = createAsyncThunk(
  'cardRating/loadCardRatings',
  async (_, { rejectWithValue }) => {
    try {      const ratings = await AsyncStorage.getItem('cardRatings');      return ratings ? JSON.parse(ratings) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const saveCardRating = createAsyncThunk(
  'cardRating/saveCardRating',
  async ({ cardId, rating }, { rejectWithValue }) => {
    try {      const ratings = await AsyncStorage.getItem('cardRatings');      const ratingsList = ratings ? JSON.parse(ratings) : [];      const existingIndex = ratingsList.findIndex(r => r.cardId === cardId);      if (existingIndex >= 0) {        ratingsList[existingIndex] = { ...ratingsList[existingIndex], ...rating,        };      } else {
        ratingsList.push({ cardId, ...rating, createdAt: new Date().toISOString() });      }      await AsyncStorage.setItem('cardRatings', JSON.stringify(ratingsList));      return { cardId, ...rating };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  cardRatings: [],
  qualityScores: {},
  valueAnalysis: {},
  collectionStats: {
    totalCards: 0,
    averageRating: 0,
    totalValue: 0,
    topRatedCards: [],
    recentAdditions: [],
    valueDistribution: {},
    qualityDistribution: {},
    investmentPotential: {},
  },
  isLoading: false,
  error: null,
  filters: {
    minRating: 0,
    maxRating: 10,
    minValue: 0,
    maxValue: 1000000,
    quality: 'all',
    sortBy: 'rating',
    sortOrder: 'desc',
  },
  analytics: {
    ratingTrends: [],
    valueTrends: [],
    qualityTrends: [],
    marketComparison: {},
  },
};

const cardRatingSlice = createSlice || (() => {})({
  name: 'cardRating',
  initialState,
  reducers: {
    setFilters: (state, action) => {      state.filters = { ...state.filters, ...action.payload,      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateRating: (state, action) => {
      const { cardId, rating } = action.payload;      const existingIndex = state.cardRatings.findIndex(r => r.cardId === cardId);      if (existingIndex >= 0) {
        state.cardRatings[existingIndex] = { ...state.cardRatings[existingIndex], ...rating };      } else {
        state.cardRatings.push({ cardId, ...rating, createdAt: new Date().toISOString() });      }
    },
    deleteRating: (state, action) => {
      state.cardRatings = state.cardRatings.filter(r => r.cardId !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder      // rateCard      .addCase(rateCard.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(rateCard.fulfilled, (state, action) => {        state.isLoading = false;        const { cardId, rating,        } = action.payload;        const existingIndex = state.cardRatings.findIndex(r => r.cardId === cardId);        if (existingIndex >= 0) {
          state.cardRatings[existingIndex] = { ...state.cardRatings[existingIndex], ...rating };        } else {
          state.cardRatings.push({ cardId, ...rating, createdAt: new Date().toISOString() });        }      })      .addCase(rateCard.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // analyzeCardValue      .addCase(analyzeCardValue.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(analyzeCardValue.fulfilled, (state, action) => {        state.isLoading = false;        const { cardId, analysis,        } = action.payload;        state.valueAnalysis[cardId] = analysis;      })      .addCase(analyzeCardValue.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // getCardQualityScore      .addCase(getCardQualityScore.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(getCardQualityScore.fulfilled, (state, action) => {        state.isLoading = false;        const { cardId, qualityScore,        } = action.payload;        state.qualityScores[cardId] = qualityScore;      })      .addCase(getCardQualityScore.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // getCollectionStats      .addCase(getCollectionStats.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(getCollectionStats.fulfilled, (state, action) => {        state.isLoading = false;        state.collectionStats = action.payload;      })      .addCase(getCollectionStats.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // loadCardRatings      .addCase(loadCardRatings.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(loadCardRatings.fulfilled, (state, action) => {        state.isLoading = false;        state.cardRatings = action.payload;      })      .addCase(loadCardRatings.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      })    // saveCardRating      .addCase(saveCardRating.pending, (state) => {        state.isLoading = true;        state.error = null;      })      .addCase(saveCardRating.fulfilled, (state, action) => {        state.isLoading = false;        const { cardId, ...rating        } = action.payload;        const existingIndex = state.cardRatings.findIndex(r => r.cardId === cardId);        if (existingIndex >= 0) {
          state.cardRatings[existingIndex] = { ...state.cardRatings[existingIndex], ...rating };        } else {
          state.cardRatings.push({ cardId, ...rating, createdAt: new Date().toISOString() });        }      })      .addCase(saveCardRating.rejected, (state, action) => {        state.isLoading = false;        state.error = action.payload;      });
  },
});

export const { setFilters, clearFilters, updateRating, deleteRating, clearError, updateAnalytics } = cardRatingSlice.actions;

// Selectors
export const selectCardRatings = (state) => state.cardRating.cardRatings;
export const selectQualityScores = (state) => state.cardRating.qualityScores;
export const selectValueAnalysis = (state) => state.cardRating.valueAnalysis;
export const selectCollectionStats = (state) => state.cardRating.collectionStats;
export const selectIsLoading = (state) => state.cardRating.isLoading;
export const selectError = (state) => state.cardRating.error;
export const selectFilters = (state) => state.cardRating.filters;
export const selectAnalytics = (state) => state.cardRating.analytics;

// Filtered selectors
export const selectFilteredRatings = (state) => {
  const { cardRatings } = state.cardRating;
  const { minRating, maxRating, minValue, maxValue, quality, sortBy, sortOrder } = state.cardRating.filters;

  const filtered = cardRatings.filter(rating => {
    const ratingValue = rating.overallRating || 0;
    const cardValue = rating.estimatedValue || 0;
    const cardQuality = rating.quality || 'unknown';    return (      ratingValue >= minRating &&      ratingValue <= maxRating &&      cardValue >= minValue &&      cardValue <= maxValue &&      (quality === 'all' || cardQuality === quality)
    );
  });

  // Sort
  filtered.sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'rating':        aValue = a.overallRating || 0;        bValue = b.overallRating || 0;        break;
      case 'value':        aValue = a.estimatedValue || 0;        bValue = b.estimatedValue || 0;        break;
      case 'date':        aValue = new Date(a.createdAt || 0);        bValue = new Date(b.createdAt || 0);        break;
      default:        aValue = a.overallRating || 0;        bValue = b.overallRating || 0;
    }    if (sortOrder === 'desc') {
      return bValue - aValue;
    }
    return aValue - bValue;
  });

  return filtered;
};

export default cardRatingSlice.reducer;
