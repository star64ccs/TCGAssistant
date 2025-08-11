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
  calculatePerformance,
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
    dispatch(calculateOverview({      collection: collection.collection,
      tradingHistory: tradingHistory.tradingHistory,
      priceTracking: priceAlerts,
      cardRating: cardRatings,
    }));    dispatch(calculatePerformance({
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
    <View style={ styles.section }>      <Text style={ styles.sectionTitle }>{ t('overview') }</Text>      <View style={ styles.overviewGrid }>        <View style={ styles.overviewCard }>          <Icon name="cards" size={ 24 } color={ COLORS.PRIMARY } />          <Text style={ styles.overviewNumber }>{ dashboardData.overview.totalCards }</Text>          <Text style={ styles.overviewLabel }>{ t('total_cards') }</Text>        </View>        <View style={ styles.overviewCard }>          <Icon name="currency-usd" size={ 24 } color={ COLORS.SUCCESS } />          <Text style={ styles.overviewNumber }>${ dashboardData.overview.totalValue?.toLocaleString() || 0 }</Text>          <Text style={ styles.overviewLabel }>{ t('total_value') }</Text>        </View>        <View style={ styles.overviewCard }>          <Icon name="trending-up" size={ 24 } color={ COLORS.SUCCESS } />          <Text style={ styles.overviewNumber }>${ dashboardData.overview.totalProfit?.toLocaleString() || 0 }</Text>          <Text style={ styles.overviewLabel }>{ t('total_profit') }</Text>        </View>        <View style={ styles.overviewCard }>          <Icon name="star" size={ 24 } color={ COLORS.WARNING } />          <Text style={ styles.overviewNumber }>{ dashboardData.overview.averageRating?.toFixed(1) || 0 }</Text>          <Text style={ styles.overviewLabel }>{ t('avg_rating') }</Text>        </View>      </View>
    </View>
  );

  const renderPerformanceSection = () => (
    <View style={ styles.section }>      <Text style={ styles.sectionTitle }>{ t('performance') }</Text>      <View style={ styles.performanceGrid }>        <View style={ styles.performanceCard }>          <Text style={ styles.performanceLabel }>{ t('monthly_growth') }</Text>          <Text style={
            [              styles.performanceValue,              { color: dashboardData.performance.monthlyGrowth >= 0 ? COLORS.SUCCESS : COLORS.ERROR,
              },            ]}>            ${ dashboardData.performance.monthlyGrowth?.toLocaleString() || 0 }          </Text>        </View>        <View style={ styles.performanceCard }>          <Text style={ styles.performanceLabel }>{ t('yearly_growth') }</Text>          <Text style={
            [              styles.performanceValue,              { color: dashboardData.performance.yearlyGrowth >= 0 ? COLORS.SUCCESS : COLORS.ERROR,
              },            ]}>            ${ dashboardData.performance.yearlyGrowth?.toLocaleString() || 0 }          </Text>        </View>        <View style={ styles.performanceCard }>          <Text style={ styles.performanceLabel }>{ t('roi') }</Text>          <Text style={
            [              styles.performanceValue,              { color: dashboardData.performance.roi >= 0 ? COLORS.SUCCESS : COLORS.ERROR,
              },            ]}>            { dashboardData.performance.roi?.toFixed(2) || 0 }%          </Text>        </View>        <View style={ styles.performanceCard }>          <Text style={ styles.performanceLabel }>{ t('profit_margin') }</Text>          <Text style={
            [              styles.performanceValue,              { color: dashboardData.performance.profitMargin >= 0 ? COLORS.SUCCESS : COLORS.ERROR,
              },            ]}>            { dashboardData.performance.profitMargin?.toFixed(2) || 0 }%          </Text>        </View>      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={ styles.section }>      <Text style={ styles.sectionTitle }>{ t('analytics_tools') }</Text>      <View style={ styles.actionGrid }>        <TouchableOpacity style={ styles.actionButton } onPress={ handleGenerateReport }>          <Icon name="file-chart" size={ 24 } color={ COLORS.WHITE } />          <Text style={ styles.actionButtonText }>{ t('generate_report') }</Text>        </TouchableOpacity>        <TouchableOpacity style={ styles.actionButton } onPress={ handleGetInsights }>          <Icon name="lightbulb" size={ 24 } color={ COLORS.WHITE } />          <Text style={ styles.actionButtonText }>{ t('investment_insights') }</Text>        </TouchableOpacity>        <TouchableOpacity style={ styles.actionButton } onPress={ handleGetPredictions }>          <Icon name="crystal-ball" size={ 24 } color={ COLORS.WHITE } />          <Text style={ styles.actionButtonText }>{ t('market_predictions') }</Text>        </TouchableOpacity>        <TouchableOpacity style={ styles.actionButton } onPress={ handleGetPortfolioAnalysis }>          <Icon name="chart-pie" size={ 24 } color={ COLORS.WHITE } />          <Text style={ styles.actionButtonText }>{ t('portfolio_analysis') }</Text>        </TouchableOpacity>      </View>
    </View>
  );

  const renderInsightsModal = () => (
    <Modal      visible={ insightsModalVisible }      animationType="slide"      transparent={ true }      onRequestClose={ () => setInsightsModalVisible(false) }
    >      <View style={ styles.modalOverlay }>        <View style={ styles.modalContent }>          <View style={ styles.modalHeader }>            <Text style={ styles.modalTitle }>{ t('investment_insights') }</Text>            <TouchableOpacity onPress={ () => setInsightsModalVisible(false) }>              <Icon name="close" size={ 24 } color={ COLORS.WHITE } />            </TouchableOpacity>          </View>          <ScrollView style={ styles.modalBody }>            <View style={ styles.insightSection }>              <Text style={ styles.insightTitle }>{ t('top_performers') }</Text>              {
                investmentInsights.topPerformers?.map((item, index) => (                  <View key={index
                  } style={ styles.insightItem }>                    <Text style={ styles.insightItemName }>{ item.name }</Text>                    <Text style={ styles.insightItemValue }>+{ item.growth }%</Text>                  </View>                ))}            </View>            <View style={ styles.insightSection }>              <Text style={ styles.insightTitle }>{ t('recommendations') }</Text>              {
                investmentInsights.recommendations?.map((rec, index) => (                  <View key={index
                  } style={ styles.insightItem }>                    <Text style={ styles.insightItemName }>{ rec.title }</Text>                    <Text style={ styles.insightItemDesc }>{ rec.description }</Text>                  </View>                ))}            </View>          </ScrollView>        </View>      </View>
    </Modal>
  );

  const renderPredictionsModal = () => (
    <Modal      visible={ predictionsModalVisible }      animationType="slide"      transparent={ true }      onRequestClose={ () => setPredictionsModalVisible(false) }
    >      <View style={ styles.modalOverlay }>        <View style={ styles.modalContent }>          <View style={ styles.modalHeader }>            <Text style={ styles.modalTitle }>{ t('market_predictions') }</Text>            <TouchableOpacity onPress={ () => setPredictionsModalVisible(false) }>              <Icon name="close" size={ 24 } color={ COLORS.WHITE } />            </TouchableOpacity>          </View>          <ScrollView style={ styles.modalBody }>            <View style={ styles.predictionSection }>              <Text style={ styles.predictionTitle }>{ t('short_term') } (1-3 months)</Text>              {
                marketPredictions.shortTerm?.map((pred, index) => (                  <View key={index
                  } style={ styles.predictionItem }>                    <Text style={ styles.predictionItemName }>{ pred.category }</Text>                    <Text style={
                      [                        styles.predictionItemValue,                        { color: pred.trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR,
                        },                      ]}>                      { pred.trend === 'up' ? '+' : '-' }{ pred.percentage }%                    </Text>                  </View>                ))}            </View>            <View style={ styles.predictionSection }>              <Text style={ styles.predictionTitle }>{ t('medium_term') } (3-6 months)</Text>              {
                marketPredictions.mediumTerm?.map((pred, index) => (                  <View key={index
                  } style={ styles.predictionItem }>                    <Text style={ styles.predictionItemName }>{ pred.category }</Text>                    <Text style={
                      [                        styles.predictionItemValue,                        { color: pred.trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR,
                        },                      ]}>                      { pred.trend === 'up' ? '+' : '-' }{ pred.percentage }%                    </Text>                  </View>                ))}            </View>          </ScrollView>        </View>      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={ GRADIENT_PRIMARY } style={ styles.container }>      <View style={ styles.header }>        <TouchableOpacity onPress={ () => navigation.goBack() }>          <Icon name="arrow-left" size={ 24 } color={ COLORS.WHITE } />        </TouchableOpacity>        <Text style={ styles.headerTitle }>{ t('analytics_dashboard') }</Text>        <TouchableOpacity onPress={ () => {}}>          <Icon name="refresh" size={ 24 } color={ COLORS.WHITE } />        </TouchableOpacity>      </View>      <ScrollView style={ styles.content } showsVerticalScrollIndicator={ false }>        { renderOverviewSection() }        { renderPerformanceSection() }        { renderActionButtons() }      </ScrollView>      { renderInsightsModal() }      { renderPredictionsModal() }
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 10,
    padding: 15,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  actionButtonText: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_WHITE,
    marginTop: 5,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.WHITE,
  },
  insightItem: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    marginBottom: 5,
    padding: 10,
  },
  insightItemDesc: {
    ...TEXT_STYLES.body3,
    color: COLORS.GRAY,
    marginTop: 2,
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
  insightSection: { marginBottom: 20 },
  insightTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  modalBody: { padding: 20 },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    maxHeight: height * 0.8,
    width: width * 0.9,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.TEXT,
  },
  overviewCard: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 10,
    padding: 15,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewLabel: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  overviewNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.PRIMARY,
    marginBottom: 5,
    marginTop: 5,
  },
  performanceCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 10,
    padding: 15,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  predictionItem: {
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 10,
  },
  predictionItemName: {
    ...TEXT_STYLES.body2,
    color: COLORS.TEXT,
  },
  predictionItemValue: {
    ...TEXT_STYLES.body2,
    fontWeight: 'bold',
  },
  predictionSection: { marginBottom: 20 },
  predictionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...TEXT_STYLES.TITLE_SMALL,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
  },
});

export default AnalyticsDashboardScreen;
