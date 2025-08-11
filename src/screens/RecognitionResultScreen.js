import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux actions
import { saveToCollection, addToSearchHistory } from '../store/slices/collectionSlice';

// 常數
import { COLORS, ROUTES, PRICE_SOURCES } from '../constants';

const RecognitionResultScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const result = route.params?.result || {};
  const {
    cardName,
    cardImage,
    confidence,
    cardType,
    rarity,
    set,
    price,
    priceHistory,
    marketData,
    similarCards,
  } = result;

  useEffect(() => {
    if (result && Object.keys(result).length > 0) {      // 添加到搜尋歷史      dispatch(addToSearchHistory({        type: 'recognition',        cardName,        timestamp: new Date().toISOString(),        result,      }));
    }
  }, [result]);

  const handleSaveToCollection = async () => {
    if (!user) {      Alert.alert('需要登入', '請先登入以保存到收藏');      return;
    }    setIsLoading(true);
    try {      await dispatch(saveToCollection({        cardName,        cardImage,        cardType,        rarity,        set,        price,        addedAt: new Date().toISOString(),      })).unwrap();      Alert.alert('成功', '已保存到收藏');
    } catch (error) {      Alert.alert('錯誤', '保存失敗，請稍後再試');
    } finally {      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {      const shareMessage = `我在 TCG 助手中辨識到這張卡牌：${cardName}\n價格：${price}\n稀有度：${rarity}`;      await Share.share({        message: shareMessage,        title: 'TCG 助手 - 卡牌辨識結果',      });
    } catch (error) {}
  };

  const handleViewMarket = () => {
    // 導航到價格分析頁面
    navigation.navigate(ROUTES.PRICE_PREDICTION, { cardName });
  };

  const handleViewSimilar = () => {
    // 導航到相似卡牌頁面
    navigation.navigate(ROUTES.COLLECTION, {      filter: 'similar',      cardName,      similarCards,
    });
  };

  const renderPriceInfo = () => {
    if (!price) {
      return null;
    }    return (      <View style={styles.priceContainer}>        <Text style={styles.priceLabel}>當前價格</Text>        <Text style={styles.priceValue}>${price}</Text>        {priceHistory && priceHistory.length > 0 ? <View style={styles.priceTrend}>            <Ionicons              name={priceHistory[0].trend === 'up' ? 'trending-up' : 'trending-down'}              size={16}              color={priceHistory[0].trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR}            />            <Text style={[              styles.trendText,              { color: priceHistory[0].trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR },            ]}>              {priceHistory[0].change}%            </Text>          </View> : null}      </View>
    );
  };

  const renderMarketData = () => {
    if (!marketData) {
      return null;
    }    return (      <View style={styles.marketDataContainer}>        <Text style={styles.sectionTitle}>市場數據</Text>        <View style={styles.marketDataGrid}>          {Object.entries(marketData).map(([source, data]) => (            <View key={source} style={styles.marketDataItem}>              <Text style={styles.marketSource}>{PRICE_SOURCES[source] || source}</Text>              <Text style={styles.marketPrice}>${data.price}</Text>              <Text style={styles.marketAvailability}>                {data.available ? '有貨' : '缺貨'}              </Text>            </View>          ))}        </View>      </View>
    );
  };

  const renderSimilarCards = () => {
    if (!similarCards || similarCards.length === 0) {
      return null;
    }    return (      <View style={styles.similarCardsContainer}>        <View style={styles.sectionHeader}>          <Text style={styles.sectionTitle}>相似卡牌</Text>          <TouchableOpacity onPress={handleViewSimilar}>            <Text style={styles.viewAllText}>查看全部</Text>          </TouchableOpacity>        </View>        <ScrollView horizontal showsHorizontalScrollIndicator={false}>          {similarCards.slice(0, 5).map((card, index) => (            <TouchableOpacity              key={index}              style={styles.similarCard}              onPress={() => navigation.navigate(ROUTES.COLLECTION_DETAIL, { card })}            >              <Image source={{ uri: card.image }} style={styles.similarCardImage} />              <Text style={styles.similarCardName} numberOfLines={2}>                {card.name}              </Text>              <Text style={styles.similarCardPrice}>${card.price}</Text>            </TouchableOpacity>          ))}        </ScrollView>      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>辨識結果</Text>        <TouchableOpacity onPress={handleShare}>          <Ionicons name="share-outline" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>      </View>      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {/* 卡牌圖片 */}        <View style={styles.cardImageContainer}>          <Image source={{ uri: cardImage }} style={styles.cardImage} />          <View style={styles.confidenceBadge}>            <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>          </View>        </View>        {/* 卡牌資訊 */}        <View style={styles.cardInfoContainer}>          <Text style={styles.cardName}>{cardName}</Text>          <View style={styles.cardDetails}>            <View style={styles.detailItem}>              <Text style={styles.detailLabel}>類型</Text>              <Text style={styles.detailValue}>{cardType}</Text>            </View>            <View style={styles.detailItem}>              <Text style={styles.detailLabel}>稀有度</Text>              <Text style={styles.detailValue}>{rarity}</Text>            </View>            <View style={styles.detailItem}>              <Text style={styles.detailLabel}>系列</Text>              <Text style={styles.detailValue}>{set}</Text>            </View>          </View>        </View>        {/* 價格資訊 */}        {renderPriceInfo()}        {/* 市場數據 */}        {renderMarketData()}        {/* 相似卡牌 */}        {renderSimilarCards()}      </ScrollView>      {/* 操作按鈕 */}      <View style={styles.actionButtons}>        <TouchableOpacity          style={[styles.actionButton, styles.saveButton]}          onPress={handleSaveToCollection}          disabled={isLoading}        >          <Ionicons name="bookmark-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>            {isLoading ? '保存中...' : '保存到收藏'}          </Text>        </TouchableOpacity>        <TouchableOpacity          style={[styles.actionButton, styles.marketButton]}          onPress={handleViewMarket}        >          <Ionicons name="trending-up-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>查看市場</Text>        </TouchableOpacity>      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 5,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  actionButtons: {
    borderTopColor: COLORS.CARD_BORDER,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardImage: {
    borderRadius: 10,
    height: 280,
    resizeMode: 'cover',
    width: 200,
  },
  cardImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  cardInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  confidenceBadge: {
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 50,
    top: 10,
  },
  confidenceText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 5,
  },
  detailValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
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
  marketAvailability: {
    color: COLORS.SUCCESS,
    fontSize: 10,
  },
  marketButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  marketDataContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  marketDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  marketDataItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    width: '48%',
  },
  marketPrice: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  marketSource: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 5,
  },
  priceContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
  },
  priceLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 5,
  },
  priceTrend: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  priceValue: {
    color: COLORS.PRIMARY,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  similarCard: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    marginRight: 10,
    padding: 8,
    width: 120,
  },
  similarCardImage: {
    borderRadius: 4,
    height: 80,
    marginBottom: 5,
    width: '100%',
  },
  similarCardName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    marginBottom: 3,
  },
  similarCardPrice: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: 'bold',
  },
  similarCardsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  viewAllText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
  },
});

export default RecognitionResultScreen;
