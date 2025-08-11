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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux actions
import { saveToCollection, addToSearchHistory } from '../store/slices/collectionSlice';

// 常數
import { COLORS, ROUTES, PRICE_TRENDS, PRICE_SOURCES } from '../constants';

const PriceResultScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const result = route.params?.result || {};
  const {
    cardName,
    cardImage,
    currentPrice,
    predictedPrice,
    priceTrend,
    confidence,
    marketData,
    priceHistory,
    predictions,
    recommendations,
  } = result;

  useEffect(() => {
    if (result && Object.keys(result).length > 0) {      // 添加到搜尋歷史      dispatch(addToSearchHistory({        type: 'price_prediction',        cardName,        timestamp: new Date().toISOString(),        result,      }));
    }
  }, [result]);

  const handleSaveToCollection = async () => {
    if (!user) {      Alert.alert('需要登入', '請先登入以保存到收藏');      return;
    }    setIsLoading(true);
    try {      await dispatch(saveToCollection({        cardName,        cardImage,        currentPrice,        predictedPrice,        priceTrend,        addedAt: new Date().toISOString(),      })).unwrap();      Alert.alert('成功', '已保存到收藏');
    } catch (error) {      Alert.alert('錯誤', '保存失敗，請稍後再試');
    } finally {      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {      const trendText = priceTrend === PRICE_TRENDS.UP ? '上漲' :        priceTrend === PRICE_TRENDS.DOWN ? '下跌' : '穩定';      const shareMessage = `我在 TCG 助手中分析了這張卡牌的價格：${cardName}\n當前價格：$${currentPrice}\n預測價格：$${predictedPrice}\n趨勢：${trendText}\n信心度：${Math.round(confidence * 100)}%`;      await Share.share({        message: shareMessage,        title: 'TCG 助手 - 價格預測結果',      });
    } catch (error) {}
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case PRICE_TRENDS.UP:        return COLORS.SUCCESS;
      case PRICE_TRENDS.DOWN:        return COLORS.ERROR;
      case PRICE_TRENDS.STABLE:        return COLORS.WARNING;
      default:        return COLORS.TEXT_SECONDARY;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case PRICE_TRENDS.UP:        return 'trending-up';
      case PRICE_TRENDS.DOWN:        return 'trending-down';
      case PRICE_TRENDS.STABLE:        return 'remove';
      default:        return 'help-outline';
    }
  };

  const renderPriceSummary = () => {
    const priceChange = predictedPrice - currentPrice;
    const priceChangePercent = ((priceChange / currentPrice) * 100).toFixed(1);    return (      <View style={styles.priceSummaryContainer}>        <Text style={styles.summaryTitle}>價格預測摘要</Text>        <View style={styles.priceComparison}>          <View style={styles.priceItem}>            <Text style={styles.priceLabel}>當前價格</Text>            <Text style={styles.currentPrice}>${currentPrice}</Text>          </View>          <View style={styles.priceArrow}>            <Ionicons              name={getTrendIcon(priceTrend)}              size={24}              color={getTrendColor(priceTrend)}            />          </View>          <View style={styles.priceItem}>            <Text style={styles.priceLabel}>預測價格</Text>            <Text style={[styles.predictedPrice, { color: getTrendColor(priceTrend) }]}>              ${predictedPrice}            </Text>          </View>        </View>        <View style={styles.priceChangeContainer}>          <Text style={styles.priceChangeLabel}>預期變化</Text>          <Text style={[styles.priceChangeValue, { color: getTrendColor(priceTrend) }]}>            {priceChange > 0 ? '+' : ''}{priceChangePercent}%          </Text>          <Text style={[styles.priceChangeAmount, { color: getTrendColor(priceTrend) }]}>            {priceChange > 0 ? '+' : ''}${Math.abs(priceChange).toFixed(2)}          </Text>        </View>        <View style={styles.confidenceContainer}>          <Text style={styles.confidenceLabel}>預測信心度</Text>          <Text style={styles.confidenceValue}>{Math.round(confidence * 100)}%</Text>        </View>      </View>
    );
  };

  const renderMarketData = () => {
    if (!marketData) {
      return null;
    }    return (      <View style={styles.marketDataContainer}>        <Text style={styles.sectionTitle}>市場數據</Text>        <View style={styles.marketDataGrid}>          {Object.entries(marketData).map(([source, data]) => (            <View key={source} style={styles.marketDataItem}>              <Text style={styles.marketSource}>{PRICE_SOURCES[source] || source}</Text>              <Text style={styles.marketPrice}>${data.price}</Text>              <Text style={styles.marketAvailability}>                {data.available ? '有貨' : '缺貨'}              </Text>            </View>          ))}        </View>      </View>
    );
  };

  const renderPriceHistory = () => {
    if (!priceHistory || priceHistory.length === 0) {
      return null;
    }    return (      <View style={styles.priceHistoryContainer}>        <Text style={styles.sectionTitle}>價格歷史</Text>        <ScrollView horizontal showsHorizontalScrollIndicator={false}>          {priceHistory.map((entry, index) => (            <View key={index} style={styles.historyItem}>              <Text style={styles.historyDate}>{entry.date}</Text>              <Text style={styles.historyPrice}>${entry.price}</Text>              <View style={styles.historyTrend}>                <Ionicons                  name={entry.trend === 'up' ? 'trending-up' : 'trending-down'}                  size={12}                  color={entry.trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR}                />                <Text style={[                  styles.historyChange,                  { color: entry.trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR },                ]}>                  {entry.change}%                </Text>              </View>            </View>          ))}        </ScrollView>      </View>
    );
  };

  const renderPredictions = () => {
    if (!predictions || predictions.length === 0) {
      return null;
    }    return (      <View style={styles.predictionsContainer}>        <Text style={styles.sectionTitle}>未來預測</Text>        {predictions.map((prediction, index) => (          <View key={index} style={styles.predictionItem}>            <View style={styles.predictionHeader}>              <Text style={styles.predictionPeriod}>{prediction.period}</Text>              <Text style={[styles.predictionPrice, { color: getTrendColor(prediction.trend) }]}>                ${prediction.price}              </Text>            </View>            <Text style={styles.predictionDescription}>{prediction.description}</Text>          </View>        ))}      </View>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      return null;
    }    return (      <View style={styles.recommendationsContainer}>        <Text style={styles.sectionTitle}>投資建議</Text>        {recommendations.map((recommendation, index) => (          <View key={index} style={styles.recommendationItem}>            <Ionicons              name="bulb-outline"              size={16}              color={COLORS.PRIMARY}              style={styles.recommendationIcon}            />            <Text style={styles.recommendationText}>{recommendation}</Text>          </View>        ))}      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()}>          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>        <Text style={styles.headerTitle}>價格預測結果</Text>        <TouchableOpacity onPress={handleShare}>          <Ionicons name="share-outline" size={24} color={COLORS.TEXT_PRIMARY} />        </TouchableOpacity>      </View>      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>        {/* 卡牌圖片 */}        <View style={styles.cardImageContainer}>          <Image source={{ uri: cardImage }} style={styles.cardImage} />        </View>        {/* 卡牌名稱 */}        <View style={styles.cardInfoContainer}>          <Text style={styles.cardName}>{cardName}</Text>        </View>        {/* 價格摘要 */}        {renderPriceSummary()}        {/* 市場數據 */}        {renderMarketData()}        {/* 價格歷史 */}        {renderPriceHistory()}        {/* 未來預測 */}        {renderPredictions()}        {/* 投資建議 */}        {renderRecommendations()}      </ScrollView>      {/* 操作按鈕 */}      <View style={styles.actionButtons}>        <TouchableOpacity          style={[styles.actionButton, styles.saveButton]}          onPress={handleSaveToCollection}          disabled={isLoading}        >          <Ionicons name="bookmark-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>            {isLoading ? '保存中...' : '保存到收藏'}          </Text>        </TouchableOpacity>        <TouchableOpacity          style={[styles.actionButton, styles.trackButton]}          onPress={() => navigation.navigate(ROUTES.PRICE_TRACKING, { cardName })}        >          <Ionicons name="eye-outline" size={20} color={COLORS.TEXT_WHITE} />          <Text style={styles.actionButtonText}>追蹤價格</Text>        </TouchableOpacity>      </View>
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
  cardImage: {
    borderRadius: 10,
    height: 280,
    resizeMode: 'cover',
    width: 200,
  },
  cardImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 5,
  },
  confidenceValue: {
    color: COLORS.PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  currentPrice: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
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
  historyChange: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  historyDate: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 5,
  },
  historyItem: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 80,
    padding: 10,
  },
  historyPrice: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  historyTrend: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  marketAvailability: {
    color: COLORS.SUCCESS,
    fontSize: 10,
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
  predictedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  predictionDescription: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
  },
  predictionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  predictionItem: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
  },
  predictionPeriod: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  predictionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  priceArrow: {
    paddingHorizontal: 10,
  },
  priceChangeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceChangeContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  priceChangeLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 5,
  },
  priceChangeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  priceComparison: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priceHistoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  priceItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 5,
  },
  priceSummaryContainer: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
  },
  recommendationIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  recommendationItem: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  recommendationText: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  trackButton: {
    backgroundColor: COLORS.SUCCESS,
  },
});

export default PriceResultScreen;
