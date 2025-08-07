import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  loadListings,
  searchListings,
  createOrder,
  updateFilters,
  clearFilters,
  addViewToListing,
  toggleListingLike,
} from '../store/slices/tradingSlice';

const { width, height } = Dimensions.get('window');

const TradingMarketScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { listings, searchResults, filters, isLoading, error } = useSelector(
    state => state.trading
  );

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    dispatch(loadListings());
  }, [dispatch]);

  const handleSearch = () => {
    const searchParams = {
      keyword: searchKeyword,
      ...filters,
    };
    dispatch(searchListings(searchParams));
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    dispatch(clearFilters());
    dispatch(loadListings());
  };

  const handleListingPress = (listing) => {
    setSelectedListing(listing);
    setShowListingModal(true);
    dispatch(addViewToListing(listing.id));
  };

  const handleBuyNow = async (listing) => {
    Alert.alert(
      '確認購買',
      `確定要購買 "${listing.title}" 嗎？價格：$${listing.price}`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '立即購買',
          style: 'default',
          onPress: async () => {
            try {
              await dispatch(createOrder({
                listingId: listing.id,
                type: 'buy',
                price: listing.price,
                quantity: 1,
                sellerId: listing.userId,
                buyerId: 'current_user_id',
              })).unwrap();
              
              setShowListingModal(false);
              Alert.alert('成功', '購買成功！');
            } catch (error) {
              Alert.alert('錯誤', error);
            }
          },
        },
      ]
    );
  };

  const handleContactSeller = (listing) => {
    // TODO: 實現聯繫賣家功能
    Alert.alert('功能提示', '聯繫賣家功能正在開發中');
  };

  const renderListingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listingItem}
      onPress={() => handleListingPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle}>{item.title}</Text>
        <Text style={styles.listingPrice}>${item.price}</Text>
        <View style={styles.listingMeta}>
          <Text style={styles.listingCondition}>{item.condition}</Text>
          <Text style={styles.listingLocation}>{item.location}</Text>
        </View>
        <View style={styles.listingStats}>
          <View style={styles.statItem}>
            <Icon name="eye" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="heart" size={16} color="#666" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>交易市場</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Icon name="filter" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索卡牌..."
            placeholderTextColor="#666"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* Listings */}
      <FlatList
        data={searchResults.length > 0 ? searchResults : listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        style={styles.listingsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listingsContainer}
      />

      {/* Listing Modal */}
      <Modal
        visible={showListingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowListingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedListing && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedListing.title}</Text>
                  <TouchableOpacity onPress={() => setShowListingModal(false)}>
                    <Icon name="close" size={24} color="#00ffff" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  <Image source={{ uri: selectedListing.image }} style={styles.modalImage} />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalPrice}>${selectedListing.price}</Text>
                    <Text style={styles.modalDescription}>{selectedListing.description}</Text>
                    <View style={styles.modalDetails}>
                      <Text style={styles.modalDetail}>品相：{selectedListing.condition}</Text>
                      <Text style={styles.modalDetail}>位置：{selectedListing.location}</Text>
                      <Text style={styles.modalDetail}>發布時間：{selectedListing.createdAt}</Text>
                    </View>
                  </View>
                </ScrollView>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContactSeller(selectedListing)}
                  >
                    <Icon name="message" size={20} color="#00ffff" />
                    <Text style={styles.contactButtonText}>聯繫賣家</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyNow(selectedListing)}
                  >
                    <Text style={styles.buyButtonText}>立即購買</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listingsList: {
    flex: 1,
  },
  listingsContainer: {
    paddingHorizontal: 20,
  },
  listingItem: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  listingImage: {
    width: '100%',
    height: 200,
  },
  listingInfo: {
    padding: 15,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffeb3b',
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listingCondition: {
    fontSize: 14,
    color: '#ccc',
  },
  listingLocation: {
    fontSize: 14,
    color: '#ccc',
  },
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  modalBody: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalInfo: {
    padding: 20,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffeb3b',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 15,
  },
  modalDetails: {
    marginBottom: 15,
  },
  modalDetail: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.2)',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2F81',
    paddingVertical: 15,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  contactButtonText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#00ffff',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TradingMarketScreen;
