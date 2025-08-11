import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux actions
import { clearSearchHistory, removeFromSearchHistory } from '../store/slices/collectionSlice';

// 常數
import { COLORS, ROUTES } from '../constants';

const SearchHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { searchHistory } = useSelector((state) => state.collection);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // 這裡可以添加重新載入歷史記錄的邏輯
    setTimeout(() => {      setRefreshing(false);
    }, 1000);
  };

  const handleClearHistory = () => {
    Alert.alert(      '清除歷史記錄',      '確定要清除所有搜尋歷史嗎？此操作無法復原。',      [        { text: '取消', style: 'cancel' },        {          text: '清除',          style: 'destructive',          onPress: () => dispatch(clearSearchHistory()),        },      ],
    );
  };

  const handleRemoveItem = (id) => {
    Alert.alert(      '刪除記錄',      '確定要刪除這條記錄嗎？',      [        { text: '取消', style: 'cancel' },        {          text: '刪除',          style: 'destructive',          onPress: () => dispatch(removeFromSearchHistory(id)),        },      ],
    );
  };

  const handleItemPress = (item) => {
    switch (item.type) {
      case 'recognition':        navigation.navigate(ROUTES.RECOGNITION_RESULT, { result: item.result });        break;
      case 'centering':        navigation.navigate(ROUTES.CENTERING_RESULT, { result: item.result });        break;
      case 'authenticity':        navigation.navigate(ROUTES.AUTHENTICITY_RESULT, { result: item.result });        break;
      case 'price_prediction':        navigation.navigate(ROUTES.PRICE_RESULT, { result: item.result });        break;
      default:      // 導航到相應的搜尋頁面        navigation.navigate(ROUTES.CARD_RECOGNITION, { searchTerm: item.cardName });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'recognition':        return 'camera-outline';
      case 'centering':        return 'crop-outline';
      case 'authenticity':        return 'shield-checkmark-outline';
      case 'price_prediction':        return 'trending-up-outline';
      default:        return 'search-outline';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'recognition':        return COLORS.PRIMARY;
      case 'centering':        return COLORS.SUCCESS;
      case 'authenticity':        return COLORS.WARNING;
      case 'price_prediction':        return COLORS.ERROR;
      default:        return COLORS.TEXT_SECONDARY;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'recognition':        return '卡牌辨識';
      case 'centering':        return '置中評估';
      case 'authenticity':        return '真偽判斷';
      case 'price_prediction':        return '價格預測';
      default:        return '搜尋';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));    if (diffInHours < 1) {      return '剛剛';
    } else if (diffInHours < 24) {      return `${diffInHours}小時前`;
    }    const diffInDays = Math.floor(diffInHours / 24);    return `${diffInDays}天前`;
  };

  const renderHistoryItem = ({ item }) => {
    return (      <TouchableOpacity        style={styles.historyItem}        onPress={() => handleItemPress(item)}        onLongPress={() => handleRemoveItem(item.id)}      >        <View style={styles.itemHeader}>          <View style={styles.itemInfo}>            <View style={styles.typeContainer}>              <Ionicons                name={getTypeIcon(item.type)}                size={20}                color={getTypeColor(item.type)}              />              <Text style={[styles.typeLabel, { color: getTypeColor(item.type) }]}>                {getTypeLabel(item.type)}              </Text>            </View>            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>          </View>          <TouchableOpacity            onPress={() => handleRemoveItem(item.id)}            style={styles.removeButton}          >            <Ionicons name="close" size={20} color={COLORS.TEXT_SECONDARY} />          </TouchableOpacity>        </View>        <View style={styles.itemContent}>          <Text style={styles.cardName}>{item.cardName}</Text>          {item.result ? <View style={styles.resultPreview}>              {item.result.cardImage ? <Image                  source={{ uri: item.result.cardImage }}                  style={styles.cardThumbnail}                /> : null}              <View style={styles.resultInfo}>                {item.result.confidence ? <Text style={styles.confidenceText}>                    信心度: {Math.round(item.result.confidence * 100)}%                  </Text> : null}                {item.result.price ? <Text style={styles.priceText}>                    價格: ${item.result.price}                  </Text> : null}                {item.result.centeringScore ? <Text style={styles.scoreText}>                    置中評分: {item.result.centeringScore}/10                  </Text> : null}                {item.result.authenticityScore ? <Text style={styles.scoreText}>                    真偽評分: {item.result.authenticityScore}/10                  </Text> : null}              </View>            </View> : null}        </View>      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (      <View style={styles.emptyState}>        <Ionicons name="time-outline" size={64} color={COLORS.TEXT_LIGHT} />        <Text style={styles.emptyTitle}>沒有搜尋歷史</Text>        <Text style={styles.emptyDescription}>          您的搜尋記錄將顯示在這裡        </Text>        <TouchableOpacity          style={styles.startButton}          onPress={() => navigation.navigate(ROUTES.CARD_RECOGNITION)}        >          <Text style={styles.startButtonText}>開始搜尋</Text>        </TouchableOpacity>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>搜尋歷史</Text>        {searchHistory.length > 0 && (          <TouchableOpacity onPress={handleClearHistory}>            <Ionicons name="trash-outline" size={24} color={COLORS.ERROR} />          </TouchableOpacity>        )}      </View>      <FlatList        data={searchHistory}        renderItem={renderHistoryItem}        keyExtractor={(item) => item.id}        contentContainerStyle={styles.listContainer}        showsVerticalScrollIndicator={false}        refreshControl={          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />        }        ListEmptyComponent={renderEmptyState}      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardThumbnail: {
    borderRadius: 6,
    height: 84,
    marginRight: 10,
    width: 60,
  },
  confidenceText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 2,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  emptyDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.CARD_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyItem: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  priceText: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  removeButton: {
    padding: 5,
  },
  resultInfo: {
    flex: 1,
  },
  resultPreview: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 2,
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  startButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  typeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SearchHistoryScreen;
