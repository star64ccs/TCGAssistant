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
  const { t,
  } = useTranslation();
  const { listings, searchResults, filters, isLoading, error } = useSelector(
    state => state.trading,
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
      `確定要購買 "${listing.title
      }" 嗎？價格：$${ listing.price }`,
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
      ],
    );
  };

  const handleContactSeller = (listing) => {
    Alert.alert('功能提示', '聯繫賣家功能正在開發中');
  };

  const renderListingItem = ({ item }) => (
    <TouchableOpacity
      style={ styles.listingItem }
      onPress={ () => handleListingPress(item) }
    >
      <Image source={ { uri: item.image }} style={ styles.listingImage } />
      <View style={ styles.listingInfo }>
        <Text style={ styles.listingTitle }>{ item.title }</Text>
        <Text style={ styles.listingPrice }>${ item.price }</Text>
        <View style={ styles.listingMeta }>
          <Text style={ styles.listingCondition }>{ item.condition }</Text>
          <Text style={ styles.listingLocation }>{ item.location }</Text>
        </View>
        <View style={ styles.listingStats }>
          <View style={ styles.statItem }>
            <Icon name="eye" size={ 16 } color="#666" />
            <Text style={ styles.statText }>{ item.views }</Text>
          </View>
          <View style={ styles.statItem }>
            <Icon name="heart" size={ 16 } color="#666" />
            <Text style={ styles.statText }>{ item.likes }</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={ styles.container }>
      { /* Header */ }
      <View style={ styles.header }>
        <Text style={ styles.headerTitle }>交易市場</Text>
        <TouchableOpacity style={ styles.filterButton } onPress={ () => setShowFilterModal(true) }>
          <Icon name="filter" size={ 24 } color="#00ffff" />
        </TouchableOpacity>
      </View>
      { /* Search Bar */ }
      <View style={ styles.searchContainer }>
        <View style={ styles.searchBar }>
          <Icon name="magnify" size={ 20 } color="#666" style={ styles.searchIcon } />
          <TextInput
            style={ styles.searchInput }
            placeholder="搜索卡牌..."
            placeholderTextColor="#666"
            value={ searchKeyword }
            onChangeText={ setSearchKeyword }
            onSubmitEditing={ handleSearch }
          />
          {
            searchKeyword.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch
              }>
                <Icon name="close" size={ 20 } color="#666" />
              </TouchableOpacity>
            )}
        </View>
        <TouchableOpacity style={ styles.searchButton } onPress={ handleSearch }>
          <Text style={ styles.searchButtonText }>搜索</Text>
        </TouchableOpacity>
      </View>
      { /* Listings */ }
      <FlatList
        data={ searchResults.length > 0 ? searchResults : listings }
        renderItem={ renderListingItem }
        keyExtractor={ (item) => item.id }
        style={ styles.listingsList }
        showsVerticalScrollIndicator={ false }
        contentContainerStyle={ styles.listingsContainer }
      />
      { /* Listing Modal */ }
      <Modal
        visible={ showListingModal }
        transparent={ true }
        animationType="slide"
        onRequestClose={ () => setShowListingModal(false) }
      >
        <View style={ styles.modalOverlay }>
          <View style={ styles.modalContent }>
            {
              selectedListing ? <>
                  <View style={styles.modalHeader
                  }>
                    <Text style={ styles.modalTitle }>{ selectedListing.title }</Text>
                    <TouchableOpacity onPress={ () => setShowListingModal(false) }>
                      <Icon name="close" size={ 24 } color="#00ffff" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={ styles.modalBody }>
                    <Image source={ { uri: selectedListing.image }} style={ styles.modalImage } />
                    <View style={ styles.modalInfo }>
                      <Text style={ styles.modalPrice }>${ selectedListing.price }</Text>
                      <Text style={ styles.modalDescription }>{ selectedListing.description }</Text>
                      <View style={ styles.modalDetails }>
                        <Text style={ styles.modalDetail }>品相：{ selectedListing.condition }</Text>
                        <Text style={ styles.modalDetail }>位置：{ selectedListing.location }</Text>
                        <Text style={ styles.modalDetail }>發布時間：{ selectedListing.createdAt }</Text>
                      </View>
                    </View>
                  </ScrollView>
                  <View style={ styles.modalActions }>
                    <TouchableOpacity
                      style={ styles.contactButton }
                      onPress={ () => handleContactSeller(selectedListing) }
                    >
                      <Icon name="message" size={ 20 } color="#00ffff" />
                      <Text style={ styles.contactButtonText }>聯繫賣家</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={ styles.buyButton }
                      onPress={ () => handleBuyNow(selectedListing) }
                    >
                      <Text style={ styles.buyButtonText }>立即購買</Text>
                    </TouchableOpacity>
                  </View>
                </> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buyButton: {
    alignItems: 'center',
    backgroundColor: '#00ffff',
    borderRadius: 15,
    flex: 1,
    paddingVertical: 15,
  },
  buyButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 10,
    paddingVertical: 15,
  },
  contactButtonText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
  },
  filterButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listingCondition: {
    color: '#ccc',
    fontSize: 14,
  },
  listingImage: {
    height: 200,
    width: '100%',
  },
  listingInfo: { padding: 15 },
  listingItem: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
    overflow: 'hidden',
  },
  listingLocation: {
    color: '#ccc',
    fontSize: 14,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listingPrice: {
    color: '#ffeb3b',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listingsContainer: { paddingHorizontal: 20 },
  listingsList: { flex: 1 },
  modalActions: {
    borderTopColor: 'rgba(0, 255, 255, 0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  modalBody: { flex: 1 },
  modalContent: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    maxHeight: '80%',
    width: '90%',
  },
  modalDescription: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  modalDetail: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  modalDetails: { marginBottom: 15 },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalImage: {
    height: 300,
    width: '100%',
  },
  modalInfo: { padding: 20 },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
  },
  modalPrice: {
    color: '#ffeb3b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalTitle: {
    color: '#fff',
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 25,
    flex: 1,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: '#00ffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default TradingMarketScreen;
