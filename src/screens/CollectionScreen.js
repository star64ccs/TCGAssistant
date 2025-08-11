import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Dimensions,
  TextInput,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';

const { width } = Dimensions.get('window');

const CollectionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const collection = useSelector(state => state.collection);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // 從真實API獲取收藏數據
  const [collectionData, setCollectionData] = useState([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  // 載入收藏數據
  useEffect(() => {
    const loadCollection = async () => {
      setIsLoadingCollection(true);
      try {
        // 調用API整合管理器獲取收藏數據
        const apiIntegrationManager = require('../services/apiIntegrationManager').default;
        const result = await apiIntegrationManager.callApi(
          'collection',
          'getCollection',
          {},
          { useCache: true }
        );
        if (result && result.data && result.data.collection) { setCollectionData(result.data.collection); } else { setCollectionData([]); }
    } catch (error) {
  setCollectionData([]);
} finally { setIsLoadingCollection(false); }
  }
    if (user?.id) { loadCollection(); }
}, [user?.id]);

  // 計算統計數據
  const totalValue = collectionData.reduce((sum, card) => sum + card.currentPrice, 0);
  const totalPurchaseValue = collectionData.reduce((sum, card) => sum + card.purchasePrice, 0);
  const totalProfitLoss = totalValue - totalPurchaseValue;
  const totalProfitLossPercentage = totalPurchaseValue > 0 ? (totalProfitLoss / totalPurchaseValue) * 100 : 0;

  // 篩選和排序
  const filteredCollection = collectionData
    .filter(card => {
  const matchesSearch = card.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          card.set.toLowerCase().includes(searchText.toLowerCase());
      const matchesFilter = filterType === 'all' ||
                          (filterType === 'favorites' && card.isFavorite) ||
                          (filterType === 'profit' && card.profitLoss > 0) ||
                          (filterType === 'loss' && card.profitLoss < 0);
      return matchesSearch && matchesFilter;
})
    .sort((a, b) => {
  switch (sortBy) {
        case 'date':
          return new Date(b.purchaseDate) - new Date(a.purchaseDate);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'profit':
          return b.profitLoss - a.profitLoss;
        default:
          return 0;
}
  });

  const handleAddToCollection = async (cardData) => {
  try {
      // 調用API整合管理器添加收藏
      const apiIntegrationManager = require('../services/apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'collection',
        'addToCollection',
        {
          cardId: cardData.id,
  cardName: cardData.name,
  cardImage: cardData.imageUrl,
  condition: 'Near Mint',
  quantity: 1
},
        { useCache: false }
      );
      if (result && result.success) {
        // 重新載入收藏數據
        const loadCollection = async () => {
          try {
            const collectionResult = await apiIntegrationManager.callApi(
              'collection',
              'getUserCollection',
              { userId: user?.id },
              { useCache: false }
            );
            if (collectionResult && collectionResult.collection) { 
              setCollectionData(collectionResult.collection); 
            }
          } catch (error) {}
        };
        loadCollection();
        setShowAddModal(false);
        Alert.alert('成功', '卡牌已添加到收藏');
    } else { Alert.alert('錯誤', '添加收藏失敗，請重試'); }
  } catch (error) {
  Alert.alert('錯誤', '添加收藏失敗，請重試');
}
}
}
  const handleDeleteCard = (cardId) => {
  Alert.alert(
      '確認刪除',
      '確定要從收藏中刪除此卡牌嗎？',
      [
        { text: '取消', style: 'cancel'
},
        {
  text: '刪除',
  style: 'destructive',
  onPress: () => {
            setCollectionData(collectionData.filter(card => card.id !== cardId));
            Alert.alert('成功', '卡牌已從收藏中刪除');
  },
      },
      ]
    );
}
  const handleShare = () => {
    const shareMessage = `我的 TCG 收藏統計：\n總價值：$${totalValue.toFixed(2)}\n總收益：$${totalProfitLoss.toFixed(2)} (${totalProfitLossPercentage.toFixed(1)}%)\n卡牌數量：${collectionData.length}`;

    Share.open({
  message: shareMessage,
  title: '分享我的收藏'
});
}
  const renderCardItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => setSelectedCard(item)}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        {item.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Icon name="heart" size={16} color="#f44336" />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardSet}>{item.set} #{item.number}</Text>
        <Text style={styles.cardPrice}>${item.currentPrice}</Text>
        <View style={styles.profitLossContainer}>
          <Text style={[
            styles.profitLossText,
            { color: item.profitLoss >= 0 ? '#4caf50' : '#f44336' }
          ]}>
            {item.profitLoss >= 0 ? '+' : ''}${item.profitLoss.toFixed(2)}
          </Text>
          <Text style={[
            styles.profitLossPercentage,
            { color: item.profitLossPercentage >= 0 ? '#4caf50' : '#f44336' }
          ]}>
            ({item.profitLossPercentage >= 0 ? '+' : ''}{item.profitLossPercentage.toFixed(1)}%)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      { /* Header */ }
      <View style={ styles.header }>
        <Text style={ styles.headerTitle }>收藏管理</Text>
        <TouchableOpacity style={ styles.addButton } onPress={ () => setShowAddModal(true) }>
          <Icon name="plus" size={ 24 } color="#00ffff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={ styles.scrollView } showsVerticalScrollIndicator={ false }>
        { /* 統計卡片 */ }
        <View style={ styles.statsContainer }>
          <View style={ styles.statCard }>
            <Icon name="cards" size={ 24 } color="#00ffff" />
            <Text style={ styles.statNumber }>{ collectionData.length }</Text>
            <Text style={ styles.statLabel }>總卡牌數</Text>
          </View>
          <View style={ styles.statCard }>
            <Icon name="currency-usd" size={ 24 } color="#ffeb3b" />
            <Text style={ styles.statNumber }>${ totalValue.toFixed(2) }</Text>
            <Text style={ styles.statLabel }>總價值</Text>
          </View>
          <View style={ styles.statCard }>
            <Icon name="trending-up" size={ 24 } color={ totalProfitLoss >= 0 ? '#4caf50' : '#f44336' } />
            <Text style={ styles.statNumber }>${ totalProfitLoss.toFixed(2) }</Text>
            <Text style={ styles.statLabel }>總收益</Text>
          </View>
        </View>
        { /* 搜索和篩選 */ }
        <View style={ styles.searchContainer }>
          <View style={ styles.searchBar }>
            <Icon name="magnify" size={ 20 } color="#666" style={ styles.searchIcon } />
            <TextInput
              style={ styles.searchInput }
              placeholder="搜索卡牌..."
              placeholderTextColor="#666"
              value={ searchText }
              onChangeText={ setSearchText }
            />
          </View>
          <TouchableOpacity style={ styles.filterButton } onPress={ () => setShowFilterModal(true) }>
            <Icon name="filter" size={ 20 } color="#00ffff" />
          </TouchableOpacity>
        </View>
        { /* 收藏列表 */ }
        {filteredCollection.length > 0 ? (
          <FlatList
            data={filteredCollection}
            renderItem={ renderCardItem }
            keyExtractor={ (item) => item.id }
            numColumns={ 2 }
            scrollEnabled={ false }
            contentContainerStyle={ styles.collectionList }
          />
        ) : (
          <View style={ styles.emptyContainer }>
            <Icon name="cards-outline" size={ 80 } color="#666" />
            <Text style={ styles.emptyText }>還沒有收藏任何卡牌</Text>
            <TouchableOpacity style={ styles.addFirstButton } onPress={ () => setShowAddModal(true) }>
              <Text style={ styles.addFirstButtonText }>添加第一張卡牌</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: '#1A1F71',
},
  headerTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#fff',
},
  addButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: '#00ffff',
  alignItems: 'center',
  justifyContent: 'center',
},
        scrollView: { flex: 1, },
          header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 50,
          paddingHorizontal: 20,
          paddingBottom: 20,
        },
  statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  marginBottom: 20,
},
  statCard: {
  flex: 1,
  backgroundColor: '#2A2F81',
  borderRadius: 15,
  padding: 15,
  alignItems: 'center',
  marginHorizontal: 5,
  borderWidth: 1,
  borderColor: '#00ffff',
},
  statNumber: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#fff',
  marginTop: 5,
},
  statLabel: {
  fontSize: 12,
  color: '#ccc',
  marginTop: 2,
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
  searchIcon: { marginRight: 10, },
  searchInput: {
  flex: 1,
  color: '#fff',
  fontSize: 16,
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
  collectionList: { paddingHorizontal: 20, },
  cardItem: {
  flex: 1,
  backgroundColor: '#2A2F81',
  borderRadius: 15,
  margin: 5,
  padding: 10,
  borderWidth: 1,
  borderColor: '#00ffff',
},
  cardImageContainer: {
  position: 'relative',
  marginBottom: 10,
},
  cardImage: {
  width: '100%',
  height: 120,
  borderRadius: 10,
},
  favoriteBadge: {
  position: 'absolute',
  top: 5,
  right: 5,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 12,
  padding: 4,
},
  cardInfo: { flex: 1, },
  cardName: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#fff',
  marginBottom: 2,
},
  cardSet: {
  fontSize: 12,
  color: '#ccc',
  marginBottom: 5,
},
  cardPrice: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ffeb3b',
  marginBottom: 5,
},
  profitLossContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},
  profitLossText: {
  fontSize: 12,
  fontWeight: 'bold',
  marginRight: 5,
},
  profitLossPercentage: { fontSize: 10, },
  emptyContainer: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 50,
},
  emptyText: {
  fontSize: 18,
  color: '#666',
  marginTop: 20,
  marginBottom: 30,
},
  addFirstButton: {
  backgroundColor: '#00ffff',
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 25,
},
  addFirstButtonText: {
  color: '#1A1F71',
  fontSize: 16,
  fontWeight: 'bold',
},
});

export default CollectionScreen;
