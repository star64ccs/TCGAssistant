import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Dimensions, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  loadAnalyticsData,
  generateComprehensiveReport,
  getInvestmentInsights,
  predictMarketTrends,
  getPortfolioAnalysis,
  selectDashboardData,
  selectComprehensiveReport,
  selectInvestmentInsights,
  selectMarketPredictions,
  selectPortfolioAnalysis,
  selectIsLoading,
  selectError,
  calculateOverview,
  calculatePerformance
} from '../store/slices/analyticsSlice';
import { selectCollection } from '../store/slices/collectionSlice';
import { selectTradingHistory } from '../store/slices/tradingHistorySlice';
import { selectPriceAlerts } from '../store/slices/priceTrackingSlice';
import { selectCardRatings } from '../store/slices/cardRatingSlice';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY } from '../constants';

const { width, height } = Dimensions.get('window');

const AnalyticsDashboardScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const dashboardData = useSelector(selectDashboardData);
  const comprehensiveReport = useSelector(selectComprehensiveReport);
  const investmentInsights = useSelector(selectInvestmentInsights);
  const marketPredictions = useSelector(selectMarketPredictions);
  const portfolioAnalysis = useSelector(selectPortfolioAnalysis);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Get data from other slices
  const collection = useSelector(selectCollection);
  const tradingHistory = useSelector(selectTradingHistory);
  const priceAlerts = useSelector(selectPriceAlerts);
  const cardRatings = useSelector(selectCardRatings);
  
  const [selectedSection, setSelectedSection] = useState('overview');
  const [insightsModalVisible, setInsightsModalVisible] = useState(false);
  const [predictionsModalVisible, setPredictionsModalVisible] = useState(false);

  useEffect(() => {
    dispatch(loadAnalyticsData());
  }, [dispatch]);

  useEffect(() => {
    // Calculate overview and performance when data changes
    dispatch(calculateOverview({
      collection: collection.collection,
      tradingHistory: tradingHistory.tradingHistory,
      priceTracking: priceAlerts,
      cardRating: cardRatings,
    }));
    
    dispatch(calculatePerformance({
      tradingHistory: tradingHistory.tradingHistory,
      collection: collection.collection,
    }));
  }, [collection, tradingHistory, priceAlerts, cardRatings, dispatch]);

  const handleGenerateReport = () => {
    dispatch(generateComprehensiveReport());
  };

  const handleGetInsights = () => {
    dispatch(getInvestmentInsights());
    setInsightsModalVisible(true);
  };

  const handleGetPredictions = () => {
    dispatch(predictMarketTrends({ timeframe: '3m', categories: 'all' }));
    setPredictionsModalVisible(true);
  };

  const handleGetPortfolioAnalysis = () => {
    dispatch(getPortfolioAnalysis());
  };

  const renderOverviewSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('overview')}</Text>
      <View style={styles.overviewGrid}>
        <View style={styles.overviewCard}>
          <Icon name="cards" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.overviewNumber}>{dashboardData.overview.totalCards}</Text>
          <Text style={styles.overviewLabel}>{t('total_cards')}</Text>
        </View>
        <View style={styles.overviewCard}>
          <Icon name="currency-usd" size={24} color={COLORS.SUCCESS} />
          <Text style={styles.overviewNumber}>${dashboardData.overview.totalValue?.toLocaleString() || 0}</Text>
          <Text style={styles.overviewLabel}>{t('total_value')}</Text>
        </View>
        <View style={styles.overviewCard}>
          <Icon name="trending-up" size={24} color={COLORS.SUCCESS} />
          <Text style={styles.overviewNumber}>${dashboardData.overview.totalProfit?.toLocaleString() || 0}</Text>
          <Text style={styles.overviewLabel}>{t('total_profit')}</Text>
        </View>
        <View style={styles.overviewCard}>
          <Icon name="star" size={24} color={COLORS.WARNING} />
          <Text style={styles.overviewNumber}>{dashboardData.overview.averageRating?.toFixed(1) || 0}</Text>
          <Text style={styles.overviewLabel}>{t('avg_rating')}</Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('performance')}</Text>
      <View style={styles.performanceGrid}>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>{t('monthly_growth')}</Text>
          <Text style={[
            styles.performanceValue,
            { color: dashboardData.performance.monthlyGrowth >= 0 ? COLORS.SUCCESS : COLORS.ERROR }
          ]}>
            ${dashboardData.performance.monthlyGrowth?.toLocaleString() || 0}
          </Text>
        </View>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>{t('yearly_growth')}</Text>
          <Text style={[
            styles.performanceValue,
            { color: dashboardData.performance.yearlyGrowth >= 0 ? COLORS.SUCCESS : COLORS.ERROR }
          ]}>
            ${dashboardData.performance.yearlyGrowth?.toLocaleString() || 0}
          </Text>
        </View>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>{t('roi')}</Text>
          <Text style={[
            styles.performanceValue,
            { color: dashboardData.performance.roi >= 0 ? COLORS.SUCCESS : COLORS.ERROR }
          ]}>
            {dashboardData.performance.roi?.toFixed(2) || 0}%
          </Text>
        </View>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>{t('profit_margin')}</Text>
          <Text style={[
            styles.performanceValue,
            { color: dashboardData.performance.profitMargin >= 0 ? COLORS.SUCCESS : COLORS.ERROR }
          ]}>
            {dashboardData.performance.profitMargin?.toFixed(2) || 0}%
          </Text>
        </View>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('analytics_tools')}</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={handleGenerateReport}>
          <Icon name="file-chart" size={24} color={COLORS.WHITE} />
          <Text style={styles.actionButtonText}>{t('generate_report')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleGetInsights}>
          <Icon name="lightbulb" size={24} color={COLORS.WHITE} />
          <Text style={styles.actionButtonText}>{t('investment_insights')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleGetPredictions}>
          <Icon name="crystal-ball" size={24} color={COLORS.WHITE} />
          <Text style={styles.actionButtonText}>{t('market_predictions')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleGetPortfolioAnalysis}>
          <Icon name="chart-pie" size={24} color={COLORS.WHITE} />
          <Text style={styles.actionButtonText}>{t('portfolio_analysis')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInsightsModal = () => (
    <Modal
      visible={insightsModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setInsightsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('investment_insights')}</Text>
            <TouchableOpacity onPress={() => setInsightsModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>{t('top_performers')}</Text>
              {investmentInsights.topPerformers?.map((item, index) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightItemName}>{item.name}</Text>
                  <Text style={styles.insightItemValue}>+{item.growth}%</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>{t('recommendations')}</Text>
              {investmentInsights.recommendations?.map((rec, index) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightItemName}>{rec.title}</Text>
                  <Text style={styles.insightItemDesc}>{rec.description}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderPredictionsModal = () => (
    <Modal
      visible={predictionsModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setPredictionsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('market_predictions')}</Text>
            <TouchableOpacity onPress={() => setPredictionsModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.predictionSection}>
              <Text style={styles.predictionTitle}>{t('short_term')} (1-3 months)</Text>
              {marketPredictions.shortTerm?.map((pred, index) => (
                <View key={index} style={styles.predictionItem}>
                  <Text style={styles.predictionItemName}>{pred.category}</Text>
                  <Text style={[
                    styles.predictionItemValue,
                    { color: pred.trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR }
                  ]}>
                    {pred.trend === 'up' ? '+' : '-'}{pred.percentage}%
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.predictionSection}>
              <Text style={styles.predictionTitle}>{t('medium_term')} (3-6 months)</Text>
              {marketPredictions.mediumTerm?.map((pred, index) => (
                <View key={index} style={styles.predictionItem}>
                  <Text style={styles.predictionItemName}>{pred.category}</Text>
                  <Text style={[
                    styles.predictionItemValue,
                    { color: pred.trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR }
                  ]}>
                    {pred.trend === 'up' ? '+' : '-'}{pred.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={GRADIENT_PRIMARY} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('analytics_dashboard')}</Text>
        <TouchableOpacity onPress={() => {}}>
          <Icon name="refresh" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOverviewSection()}
        {renderPerformanceSection()}
        {renderActionButtons()}
      </ScrollView>
      
      {renderInsightsModal()}
      {renderPredictionsModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.WHITE,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    ...TEXT_STYLES.TITLE_SMALL,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.PRIMARY,
    marginTop: 5,
    marginBottom: 5,
  },
  overviewLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 5,
  },
  performanceValue: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_WHITE,
    marginTop: 5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.TEXT,
  },
  modalBody: {
    padding: 20,
  },
  insightSection: {
    marginBottom: 20,
  },
  insightTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  insightItem: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
  },
  insightItemName: {
    ...TEXT_STYLES.body2,
    color: COLORS.TEXT,
    fontWeight: 'bold',
  },
  insightItemValue: {
    ...TEXT_STYLES.body2,
    color: COLORS.SUCCESS,
  },
  insightItemDesc: {
    ...TEXT_STYLES.body3,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  predictionSection: {
    marginBottom: 20,
  },
  predictionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
  },
  predictionItemName: {
    ...TEXT_STYLES.body2,
    color: COLORS.TEXT,
  },
  predictionItemValue: {
    ...TEXT_STYLES.body2,
    fontWeight: 'bold',
  },
});

export default AnalyticsDashboardScreen;
