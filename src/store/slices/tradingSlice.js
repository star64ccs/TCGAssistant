import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// Async thunks
export const createListing = createAsyncThunk(
  'trading/createListing',
  async (listingData, { rejectWithValue }) => {
    try {      // 模擬API調用      const newListing = {        id: Date.now().toString(),        ...listingData,
        status: 'active',
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
      };        // 保存到本地存儲      const existingListings = await AsyncStorage.getItem('tradingListings');      const listings = existingListings ? JSON.parse(existingListings) : [];      listings.push(newListing);      await AsyncStorage.setItem('tradingListings', JSON.stringify(listings));      return newListing;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateListing = createAsyncThunk(
  'trading/updateListing',
  async ({ listingId, updates }, { rejectWithValue }) => {
    try {      const existingListings = await AsyncStorage.getItem('tradingListings');      const listings = existingListings ? JSON.parse(existingListings) : [];      const updatedListings = listings.map(listing =>        listing.id === listingId ? { ...listing, ...updates, updatedAt: new Date().toISOString(),
        } : listing,      );      await AsyncStorage.setItem('tradingListings', JSON.stringify(updatedListings));      return { listingId, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteListing = createAsyncThunk(
  'trading/deleteListing',
  async (listingId, { rejectWithValue }) => {
    try {      const existingListings = await AsyncStorage.getItem('tradingListings');      const listings = existingListings ? JSON.parse(existingListings) : [];      const filteredListings = listings.filter(listing => listing.id !== listingId);      await AsyncStorage.setItem('tradingListings', JSON.stringify(filteredListings));      return listingId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const loadListings = createAsyncThunk(
  'trading/loadListings',
  async (_, { rejectWithValue }) => {
    try {      const listings = await AsyncStorage.getItem('tradingListings');      return listings ? JSON.parse(listings) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createOrder = createAsyncThunk(
  'trading/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {      const newOrder = {        id: Date.now().toString(),        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending',
        shippingStatus: 'pending',
      };        // 保存到本地存儲      const existingOrders = await AsyncStorage.getItem('tradingOrders');      const orders = existingOrders ? JSON.parse(existingOrders) : [];      orders.push(newOrder);      await AsyncStorage.setItem('tradingOrders', JSON.stringify(orders));      // 如果是購買，更新listing狀態      if (orderData.type === 'buy') {
        const existingListings = await AsyncStorage.getItem('tradingListings');        const listings = existingListings ? JSON.parse(existingListings) : [];        const updatedListings = listings.map(listing =>          listing.id === orderData.listingId ? { ...listing, status: 'sold',
          } : listing,        );        await AsyncStorage.setItem('tradingListings', JSON.stringify(updatedListings));      }      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  'trading/updateOrderStatus',
  async ({ orderId, status, updates = {} }, { rejectWithValue }) => {
    try {      const existingOrders = await AsyncStorage.getItem('tradingOrders');      const orders = existingOrders ? JSON.parse(existingOrders) : [];      const updatedOrders = orders.map(order =>        order.id === orderId ? { ...order, status, ...updates, updatedAt: new Date().toISOString(),
        } : order,      );      await AsyncStorage.setItem('tradingOrders', JSON.stringify(updatedOrders));      return { orderId, status, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const loadOrders = createAsyncThunk(
  'trading/loadOrders',
  async (_, { rejectWithValue }) => {
    try {      const orders = await AsyncStorage.getItem('tradingOrders');      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const searchListings = createAsyncThunk(
  'trading/searchListings',
  async (searchParams, { rejectWithValue }) => {
    try {      const listings = await AsyncStorage.getItem('tradingListings');      const allListings = listings ? JSON.parse(listings) : [];      // 簡單的搜索邏輯      let filteredListings = allListings.filter(listing => listing.status === 'active');      if (searchParams.keyword) {        filteredListings = filteredListings.filter(listing =>          listing.title.toLowerCase().includes(searchParams.keyword.toLowerCase()) ||          listing.description.toLowerCase().includes(searchParams.keyword.toLowerCase()),        );
      }      if (searchParams.minPrice) {
        filteredListings = filteredListings.filter(listing => listing.price >= searchParams.minPrice);
      }      if (searchParams.maxPrice) {
        filteredListings = filteredListings.filter(listing => listing.price <= searchParams.maxPrice);
      }      if (searchParams.condition) {
        filteredListings = filteredListings.filter(listing => listing.condition === searchParams.condition);
      }      // 排序      if (searchParams.sortBy === 'price_asc') {
        filteredListings.sort((a, b) => a.price - b.price);
      } else if (searchParams.sortBy === 'price_desc') {
        filteredListings.sort((a, b) => b.price - a.price);
      } else if (searchParams.sortBy === 'date_desc') {
        filteredListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }      return filteredListings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  listings: [],
  myListings: [],
  searchResults: [],
  orders: [],
  myOrders: [],
  isLoading: false,
  error: null,
  filters: {
    keyword: '',
    minPrice: null,
    maxPrice: null,
    condition: '',
    sortBy: 'date_desc',
  },
  stats: {
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalRevenue: 0,
  },
};

const tradingSlice = createSlice || (() => {})({
  name: 'trading',
  initialState,
  reducers: {
    clearError: (state) => {      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {        keyword: '',
        minPrice: null,
        maxPrice: null,
        condition: '',
        sortBy: 'date_desc',
      };
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    addViewToListing: (state, action) => {
      const listingId = action.payload;      const listing = state.listings.find(l => l.id === listingId);      if (listing) {        listing.views += 1;
      }
    },
    toggleListingLike: (state, action) => {
      const listingId = action.payload;      const listing = state.listings.find(l => l.id === listingId);      if (listing) {        listing.isLiked = !listing.isLiked;        listing.likes += listing.isLiked ? 1 : -1;
      }
    },
  },
  extraReducers: (builder) => {
    builder      // createListing      .addCase(createListing.pending, (state) => {        state.isLoading = true;        state.error = null;
      })      .addCase(createListing.fulfilled, (state, action) => {
        state.isLoading = false;        state.listings.push(action.payload);        state.myListings.push(action.payload);
      })      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;        state.error = action.payload;
      })    // updateListing      .addCase(updateListing.fulfilled, (state, action) => {
        const { listingId, updates } = action.payload;        const listingIndex = state.listings.findIndex(listing => listing.id === listingId);        if (listingIndex !== -1) {
          state.listings[listingIndex] = { ...state.listings[listingIndex], ...updates };        }        const myListingIndex = state.myListings.findIndex(listing => listing.id === listingId);        if (myListingIndex !== -1) {
          state.myListings[myListingIndex] = { ...state.myListings[myListingIndex], ...updates };        }      })      .addCase(updateListing.rejected, (state, action) => {
        state.error = action.payload;
      })    // deleteListing      .addCase(deleteListing.fulfilled, (state, action) => {
        state.listings = state.listings.filter(listing => listing.id !== action.payload);        state.myListings = state.myListings.filter(listing => listing.id !== action.payload);
      })      .addCase(deleteListing.rejected, (state, action) => {
        state.error = action.payload;
      })    // loadListings      .addCase(loadListings.fulfilled, (state, action) => {
        state.listings = action.payload;        state.myListings = action.payload.filter(listing => listing.userId === 'current_user_id');
      })      .addCase(loadListings.rejected, (state, action) => {
        state.error = action.payload;
      })    // createOrder      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;        state.error = null;
      })      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;        state.orders.push(action.payload);        state.myOrders.push(action.payload);
      })      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;        state.error = action.payload;
      })    // updateOrderStatus      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status, updates } = action.payload;        const orderIndex = state.orders.findIndex(order => order.id === orderId);        if (orderIndex !== -1) {
          state.orders[orderIndex] = { ...state.orders[orderIndex], status, ...updates };        }        const myOrderIndex = state.myOrders.findIndex(order => order.id === orderId);        if (myOrderIndex !== -1) {
          state.myOrders[myOrderIndex] = { ...state.myOrders[myOrderIndex], status, ...updates };        }      })      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload;
      })    // loadOrders      .addCase(loadOrders.fulfilled, (state, action) => {
        state.orders = action.payload;        state.myOrders = action.payload.filter(order => order.userId === 'current_user_id');
      })      .addCase(loadOrders.rejected, (state, action) => {
        state.error = action.payload;
      })    // searchListings      .addCase(searchListings.pending, (state) => {
        state.isLoading = true;        state.error = null;
      })      .addCase(searchListings.fulfilled, (state, action) => {
        state.isLoading = false;        state.searchResults = action.payload;
      })      .addCase(searchListings.rejected, (state, action) => {
        state.isLoading = false;        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSearchResults,
  updateFilters,
  clearFilters,
  updateStats,
  addViewToListing,
  toggleListingLike,
} = tradingSlice.actions;

export default tradingSlice.reducer;
