import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';
import { ROUTES, FEATURES, MEMBERSHIP_TYPES } from '../constants/index';
import { mlService } from '../services/mlService';
import { integratedApiService } from '../services/integratedApiService';

const { width } = Dimensions.get('window');

const InvestmentAdviceScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { membershipType } = useSelector(state => state.auth);
  const { settings } = useSelector(state => state.settings);
  
  const [adviceList, setAdviceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 檢查VIP權限
  const hasVIPAccess = membershipType === MEMBERSHIP_TYPES.VIP_PAID || 
                      membershipType === MEMBERSHIP_TYPES.VIP_TRIAL;

  useEffect(() => {
    if (hasVIPAccess) {
      loadInvestmentAdvice();
    }
  }, [hasVIPAccess]);

  const loadInvestmentAdvice = async () => {
    if (!hasVIPAccess) {
      Alert.alert(
        t('investment_advice.vip_required_title'),
        t('investment_advice.vip_required_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.upgrade'), onPress: () => navigation.navigate(ROUTES.MEMBERSHIP) }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // 獲取市場數據和AI預測
      const marketData = await integratedApiService.getCardPrices();
      const aiPredictions = await mlService.advancedPricePrediction();
      
      // 生成投資建議
      const advice = generateInvestmentAdvice(marketData, aiPredictions);
      setAdviceList(advice);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('載入投資建議失敗:', error);
      Alert.alert(
        t('investment_advice.load_error_title'),
        t('investment_advice.load_error_message')
      );
    } finally {
      setLoading(false);
    }
  };

  const generateInvestmentAdvice = (marketData, aiPredictions) => {
    // 模擬數據 - 實際應用中會使用真實的市場數據和AI預測
    const mockAdvice = [
      {
        id: 1,
        cardName: '青眼白龍',
        cardSet: '遊戲王 - 初代系列',
        currentPrice: 1500,
        predictedPrice: 2200,
        priceIncrease: 46.7,
        marketRating: 'A+',
        confidence: 85,
        recommendation: 'strong_buy',
        reason: '市場需求強勁，收藏價值高，AI預測價格將大幅上漲',
        riskLevel: 'low',
        timeHorizon: '3-6個月'
      },
      {
        id: 2,
        cardName: '皮卡丘 VMAX',
        cardSet: '寶可夢 - 劍盾系列',
        currentPrice: 800,
        predictedPrice: 1200,
        priceIncrease: 50.0,
        marketRating: 'A',
        confidence: 78,
        recommendation: 'buy',
        reason: '新系列熱度持續，競技環境表現優異',
        riskLevel: 'medium',
        timeHorizon: '2-4個月'
      },
      {
        id: 3,
        cardName: '艾斯',
        cardSet: '海賊王 - 新世界篇',
        currentPrice: 2500,
        predictedPrice: 3200,
        priceIncrease: 28.0,
        marketRating: 'A-',
        confidence: 72,
        recommendation: 'hold',
        reason: '價格已處於高位，建議觀望等待回調',
        riskLevel: 'medium',
        timeHorizon: '4-8個月'
      },
      {
        id: 4,
        cardName: '黑魔導',
        cardSet: '遊戲王 - 經典系列',
        currentPrice: 600,
        predictedPrice: 950,
        priceIncrease: 58.3,
        marketRating: 'B+',
        confidence: 68,
        recommendation: 'buy',
        reason: '經典卡牌，長期收藏價值穩定',
        riskLevel: 'low',
        timeHorizon: '6-12個月'
      },
      {
        id: 5,
        cardName: '超夢',
        cardSet: '寶可夢 - 初代系列',
        currentPrice: 1800,
        predictedPrice: 2100,
        priceIncrease: 16.7,
        marketRating: 'B',
        confidence: 65,
        recommendation: 'watch',
        reason: '價格波動較大，建議密切關注市場動態',
        riskLevel: 'high',
        timeHorizon: '1-3個月'
      }
    ];

    return mockAdvice;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvestmentAdvice();
    setRefreshing(false);
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'strong_buy':
        return COLORS.SUCCESS;
      case 'buy':
        return COLORS.PRIMARY;
      case 'hold':
        return COLORS.WARNING;
      case 'watch':
        return COLORS.INFO;
      case 'sell':
        return COLORS.ERROR;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'strong_buy':
        return 'trending-up';
      case 'buy':
        return 'arrow-upward';
      case 'hold':
        return 'pause';
      case 'watch':
        return 'visibility';
      case 'sell':
        return 'trending-down';
      default:
        return 'help';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return COLORS.SUCCESS;
      case 'medium':
        return COLORS.WARNING;
      case 'high':
        return COLORS.ERROR;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const handleAdvicePress = (advice) => {
    Alert.alert(
      advice.cardName,
      `建議: ${t(`investment_advice.recommendations.${advice.recommendation}`)}\n\n${advice.reason}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('investment_advice.view_details'), onPress: () => {
          // 導航到卡片詳情頁面
          navigation.navigate(ROUTES.CARD_DETAILS, { cardId: advice.id });
        }}
      ]
    );
  };

  const renderAdviceCard = (advice, index) => (
    <TouchableOpacity
      key={advice.id}
      style={styles.adviceCard}
      onPress={() => handleAdvicePress(advice)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[COLORS.CARD_BACKGROUND, COLORS.CARD_BACKGROUND_SECONDARY]}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{advice.cardName}</Text>
            <Text style={styles.cardSet}>{advice.cardSet}</Text>
          </View>
          <View style={styles.rankingBadge}>
            <Text style={styles.rankingText}>#{index + 1}</Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('investment_advice.current_price')}:</Text>
            <Text style={styles.currentPrice}>NT$ {advice.currentPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('investment_advice.predicted_price')}:</Text>
            <Text style={styles.predictedPrice}>NT$ {advice.predictedPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.increaseRow}>
            <Icon name="trending-up" size={16} color={COLORS.SUCCESS} />
            <Text style={styles.increaseText}>+{advice.priceIncrease}%</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>{t('investment_advice.market_rating')}</Text>
            <Text style={styles.metricValue}>{advice.marketRating}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>{t('investment_advice.confidence')}</Text>
            <Text style={styles.metricValue}>{advice.confidence}%</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>{t('investment_advice.risk_level')}</Text>
            <Text style={[styles.metricValue, { color: getRiskLevelColor(advice.riskLevel) }]}>
              {t(`investment_advice.risk_levels.${advice.riskLevel}`)}
            </Text>
          </View>
        </View>

        <View style={styles.recommendationSection}>
          <View style={styles.recommendationBadge}>
            <Icon 
              name={getRecommendationIcon(advice.recommendation)} 
              size={20} 
              color={getRecommendationColor(advice.recommendation)} 
            />
            <Text style={[styles.recommendationText, { color: getRecommendationColor(advice.recommendation) }]}>
              {t(`investment_advice.recommendations.${advice.recommendation}`)}
            </Text>
          </View>
          <Text style={styles.timeHorizon}>{t('investment_advice.time_horizon')}: {advice.timeHorizon}</Text>
        </View>

        <Text style={styles.reasonText}>{advice.reason}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (!hasVIPAccess) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.BACKGROUND_PRIMARY, COLORS.BACKGROUND_SECONDARY]}
          style={styles.gradient}
        >
          <View style={styles.vipRequiredContainer}>
            <Icon name="lock" size={80} color={COLORS.PRIMARY} />
            <Text style={styles.vipRequiredTitle}>
              {t('investment_advice.vip_required_title')}
            </Text>
            <Text style={styles.vipRequiredMessage}>
              {t('investment_advice.vip_required_message')}
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate(ROUTES.MEMBERSHIP)}
            >
              <Text style={styles.upgradeButtonText}>
                {t('common.upgrade_to_vip')}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.BACKGROUND_PRIMARY, COLORS.BACKGROUND_SECONDARY]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('investment_advice.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('investment_advice.subtitle')}</Text>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              {t('investment_advice.last_updated')}: {lastUpdated.toLocaleString()}
            </Text>
          )}
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('investment_advice.loading')}</Text>
            </View>
          ) : adviceList.length > 0 ? (
            <View style={styles.adviceList}>
              {adviceList.map((advice, index) => renderAdviceCard(advice, index))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="analytics" size={60} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.emptyText}>{t('investment_advice.no_advice')}</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadInvestmentAdvice}
              >
                <Text style={styles.refreshButtonText}>{t('common.refresh')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  adviceList: {
    padding: 20,
  },
  adviceCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  cardSet: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  rankingBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rankingText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_WHITE,
    fontWeight: 'bold',
  },
  priceSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  currentPrice: {
    ...TEXT_STYLES.TITLE_SMALL,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  predictedPrice: {
    ...TEXT_STYLES.TITLE_SMALL,
    color: COLORS.SUCCESS,
    fontWeight: 'bold',
  },
  increaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  increaseText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.SUCCESS,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  metricValue: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  recommendationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND_SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendationText: {
    ...TEXT_STYLES.BODY_SMALL,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  timeHorizon: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  reasonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_WHITE,
    fontWeight: 'bold',
  },
  vipRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  vipRequiredTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  vipRequiredMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  upgradeButtonText: {
    ...TEXT_STYLES.TITLE_SMALL,
    color: COLORS.TEXT_WHITE,
    fontWeight: 'bold',
  },
});

export default InvestmentAdviceScreen;
