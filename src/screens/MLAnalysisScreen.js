import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, RadarChart } from 'react-native-chart-kit';

import { COLORS, FONTS, SIZES } from '../constants';
import mlService, { ML_MODEL_TYPES, PREDICTION_ALGORITHMS } from '../services/mlService';

const { width } = Dimensions.get('window');

const MLAnalysisScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const membership = useSelector(state => state.membership);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('prediction');
  const [predictionResult, setPredictionResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [portfolioOptimization, setPortfolioOptimization] = useState(null);

  useEffect(() => {
    initializeMLService();
  }, []);

  const initializeMLService = async () => {
    try {      await mlService.initialize();
    } catch (error) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {      await initializeMLService();
    } catch (error) {} finally {
      setRefreshing(false);
    }
  };

  // 高級價格預測
  const handleAdvancedPrediction = async () => {
    if (!membership.isVIP) {      Alert.alert(        t('common.vip_required'),        t('ml_analysis.vip_required_message'),        [          { text: t('common.cancel'), style: 'cancel',
          },          { text: t('common.upgrade'), onPress: () => navigation.navigate('Membership') },        ],      );      return;
    }    setIsLoading(true);
    try {
      const cardInfo = {        name: '皮卡丘 VMAX',
        rarity: 'Secret Rare',
        set: 'Sword & Shield',
        year: 2020,
        condition: 'NM',
        currentPrice: 150,
        playability: 'high',
        collectorValue: 'high',
      };      const result = await mlService.advancedPricePrediction(cardInfo, '1y');      setPredictionResult(result);
    } catch (error) {
      Alert.alert(t('common.error'), t('ml_analysis.prediction_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 個性化推薦
  const handlePersonalizedRecommendations = async () => {
    if (!membership.isVIP) {      Alert.alert(        t('common.vip_required'),        t('ml_analysis.vip_required_message'),        [          { text: t('common.cancel'), style: 'cancel',
          },          { text: t('common.upgrade'), onPress: () => navigation.navigate('Membership') },        ],      );      return;
    }    setIsLoading(true);
    try {
      const result = await mlService.getPersonalizedRecommendations(user?.id || 'user123');      setRecommendations(result);
    } catch (error) {
      Alert.alert(t('common.error'), t('ml_analysis.recommendations_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 智能市場分析
  const handleMarketAnalysis = async () => {
    if (!membership.isVIP) {      Alert.alert(        t('common.vip_required'),        t('ml_analysis.vip_required_message'),        [          { text: t('common.cancel'), style: 'cancel',
          },          { text: t('common.upgrade'), onPress: () => navigation.navigate('Membership') },        ],      );      return;
    }    setIsLoading(true);
    try {
      const marketData = {        trendingCards: [],
        marketTrends: {},
        priceData: {},      };      const result = await mlService.intelligentMarketAnalysis(marketData);      setMarketAnalysis(result);
    } catch (error) {
      Alert.alert(t('common.error'), t('ml_analysis.market_analysis_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 投資組合優化
  const handlePortfolioOptimization = async () => {
    if (!membership.isVIP) {      Alert.alert(        t('common.vip_required'),        t('ml_analysis.vip_required_message'),        [          { text: t('common.cancel'), style: 'cancel',
          },          { text: t('common.upgrade'), onPress: () => navigation.navigate('Membership') },        ],      );      return;
    }    setIsLoading(true);
    try {
      const portfolio = {        cards: [],
        totalValue: 10000,
      };      const userGoals = {
        targetReturn: 0.15,
        timeHorizon: '5y',
        riskTolerance: 'medium',
      };      const result = await mlService.optimizeInvestmentPortfolio(portfolio, userGoals, 'medium');      setPortfolioOptimization(result);
    } catch (error) {
      Alert.alert(t('common.error'), t('ml_analysis.portfolio_optimization_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 圖表配置
  const chartConfig = {
    backgroundColor: COLORS.WHITE,
    backgroundGradientFrom: COLORS.WHITE,
    backgroundGradientTo: COLORS.WHITE,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 31, 113, ${opacity
    })`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${ opacity })`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.PRIMARY,
    },
  };

  // 渲染預測結果
  const renderPredictionResult = () => {
    if (!predictionResult) {
      return null;
    }    const { prediction, confidence, riskAssessment, individualPredictions } = predictionResult;    return (      <View style={ styles.resultSection }>        <Text style={ styles.sectionTitle }>{ t('ml_analysis.prediction_result') }</Text>        { /* 主要預測結果 */ }        <View style={ styles.mainPredictionCard }>          <LinearGradient            colors={ COLORS.GRADIENT_PRIMARY }            style={ styles.mainPredictionGradient }          >            <Text style={ styles.mainPredictionLabel }>{ t('ml_analysis.ensemble_prediction') }</Text>            <Text style={ styles.mainPredictionValue }>${ prediction?.toFixed(2) }</Text>            <Text style={ styles.confidenceText }>              { t('ml_analysis.confidence') }: { (confidence * 100).toFixed(1) }%            </Text>          </LinearGradient>        </View>        { /* 各算法預測結果 */ }        <View style={ styles.algorithmsCard }>          <Text style={ styles.cardTitle }>{ t('ml_analysis.individual_algorithms') }</Text>          {
            individualPredictions?.map((pred, index) => (              <View key={index
              } style={ styles.algorithmItem }>                <Text style={ styles.algorithmName }>                  { t(`ml_analysis.${pred.algorithm }`)}: ${ pred.prediction?.toFixed(2) }                </Text>                <Text style={ styles.algorithmConfidence }>                  { (pred.confidence * 100).toFixed(1) }%                </Text>              </View>            ))}        </View>        { /* 風險評估 */ }        {
          riskAssessment ? <View style={styles.riskCard
            }>              <Text style={ styles.cardTitle }>{ t('ml_analysis.risk_assessment') }</Text>              <View style={ styles.riskItem }>                <Text style={ styles.riskLabel }>{ t('ml_analysis.total_risk') }</Text>                <View style={ [styles.riskBadge, { backgroundColor: getRiskColor(riskAssessment.riskLevel) }]}>                  <Text style={ styles.riskBadgeText }>                    { t(`ml_analysis.risk_${riskAssessment.riskLevel }`)}                  </Text>                </View>              </View>              {
                riskAssessment.recommendations?.map((rec, index) => (                  <Text key={index
                  } style={ styles.recommendationText }>• { rec }</Text>                ))}            </View> : null}      </View>
    );
  };

  // 渲染推薦結果
  const renderRecommendationsResult = () => {
    if (!recommendations) {
      return null;
    }    return (      <View style={ styles.resultSection }>        <Text style={ styles.sectionTitle }>{ t('ml_analysis.recommendations_result') }</Text>        <View style={ styles.recommendationsCard }>          <Text style={ styles.cardTitle }>{ t('ml_analysis.personalized_recommendations') }</Text>          <Text style={ styles.reasoningText }>{ recommendations.reasoning }</Text>          <Text style={ styles.confidenceText }>            { t('ml_analysis.confidence') }: { (recommendations.confidence * 100).toFixed(1) }%          </Text>          {
            recommendations.recommendations?.length > 0 ? (              recommendations.recommendations.slice(0, 5).map((rec, index) => (                <View key={index
                } style={ styles.recommendationItem }>                  <Text style={ styles.recommendationCardName }>{ rec.cardName || `推薦卡牌 ${index + 1 }`}</Text>                  <Text style={ styles.recommendationScore }>                    { t('ml_analysis.score') }: { (rec.hybridScore * 100).toFixed(1) }%                  </Text>                </View>              ))            ) : (              <Text style={ styles.noDataText }>{ t('ml_analysis.no_recommendations') }</Text>            )}        </View>      </View>
    );
  };

  // 渲染市場分析結果
  const renderMarketAnalysisResult = () => {
    if (!marketAnalysis) {
      return null;
    }    return (      <View style={ styles.resultSection }>        <Text style={ styles.sectionTitle }>{ t('ml_analysis.market_analysis_result') }</Text>        <View style={ styles.marketCard }>          <Text style={ styles.cardTitle }>{ t('ml_analysis.comprehensive_analysis') }</Text>          <Text style={ styles.reportText }>{ marketAnalysis.comprehensiveReport }</Text>          {
            marketAnalysis.trendForecast ? <View style={styles.forecastItem
              }>                <Text style={ styles.forecastLabel }>{ t('ml_analysis.trend_forecast') }</Text>                <Text style={ styles.forecastValue }>                  { t(`ml_analysis.forecast_${marketAnalysis.trendForecast.forecast }`)}                </Text>                <Text style={ styles.forecastConfidence }>                  { (marketAnalysis.trendForecast.confidence * 100).toFixed(1) }%                </Text>              </View> : null}          <Text style={ styles.analysisConfidence }>            { t('ml_analysis.analysis_confidence') }: { (marketAnalysis.confidence * 100).toFixed(1) }%          </Text>        </View>      </View>
    );
  };

  // 渲染投資組合優化結果
  const renderPortfolioOptimizationResult = () => {
    if (!portfolioOptimization) {
      return null;
    }    return (      <View style={ styles.resultSection }>        <Text style={ styles.sectionTitle }>{ t('ml_analysis.portfolio_optimization_result') }</Text>        <View style={ styles.portfolioCard }>          <Text style={ styles.cardTitle }>{ t('ml_analysis.optimization_analysis') }</Text>          {
            portfolioOptimization.expectedOutcomes ? <View style={styles.outcomeItem
              }>                <Text style={ styles.outcomeLabel }>{ t('ml_analysis.expected_return') }</Text>                <Text style={ styles.outcomeValue }>                  { (portfolioOptimization.expectedOutcomes.expectedReturn * 100).toFixed(1) }%                </Text>              </View> : null}          {
            portfolioOptimization.implementation ? <View style={styles.implementationItem
              }>                <Text style={ styles.implementationLabel }>{ t('ml_analysis.implementation_timeline') }</Text>                <Text style={ styles.implementationValue }>{ portfolioOptimization.implementation.timeline }</Text>              </View> : null}          <Text style={ styles.optimizationConfidence }>            { t('ml_analysis.optimization_confidence') }: { (portfolioOptimization.confidence * 100).toFixed(1) }%          </Text>        </View>      </View>
    );
  };

  // 渲染標籤頁
  const renderTabs = () => {
    const tabs = [      { key: 'prediction', label: t('ml_analysis.prediction'), icon: 'trending-up',
      },      { key: 'recommendations', label: t('ml_analysis.recommendations'), icon: 'recommend' },      { key: 'market', label: t('ml_analysis.market'), icon: 'analytics' },      { key: 'portfolio', label: t('ml_analysis.portfolio'), icon: 'account-balance' },
    ];    return (      <View style={ styles.tabsContainer }>        {
          tabs.map((tab) => (            <TouchableOpacity              key={tab.key
              }              style={ [styles.tab, activeTab === tab.key && styles.activeTab] }              onPress={ () => setActiveTab(tab.key) }            >              <Icon                name={ tab.icon }                size={ 20 }                color={ activeTab === tab.key ? COLORS.WHITE : COLORS.GRAY }              />              <Text style={ [styles.tabText, activeTab === tab.key && styles.activeTabText] }>                { tab.label }              </Text>            </TouchableOpacity>          ))}      </View>
    );
  };

  // 渲染功能按鈕
  const renderActionButton = () => {
    const actions = {      prediction: {        onPress: handleAdvancedPrediction,
        label: t('ml_analysis.run_prediction'),
        icon: 'trending-up',
      },
      recommendations: {
        onPress: handlePersonalizedRecommendations,
        label: t('ml_analysis.get_recommendations'),
        icon: 'recommend',
      },
      market: {
        onPress: handleMarketAnalysis,
        label: t('ml_analysis.analyze_market'),
        icon: 'analytics',
      },
      portfolio: {
        onPress: handlePortfolioOptimization,
        label: t('ml_analysis.optimize_portfolio'),
        icon: 'account-balance',
      },
    };    const action = actions[activeTab];
    if (!action) {
      return null;
    }    return (      <View style={ styles.actionSection }>        <TouchableOpacity          style={ [styles.actionButton, isLoading && styles.actionButtonDisabled] }          onPress={ action.onPress }          disabled={ isLoading }        >          <LinearGradient            colors={ isLoading ? [COLORS.GRAY_LIGHT, COLORS.GRAY_LIGHT] : COLORS.GRADIENT_PRIMARY }            style={ styles.actionButtonGradient }          >            {
              isLoading ? (                <ActivityIndicator color={COLORS.WHITE
                } size="small" />              ) : (                <Icon name={ action.icon } size={ 24 } color={ COLORS.WHITE } />              )}            <Text style={ styles.actionButtonText }>              { isLoading ? t('ml_analysis.processing') : action.label }            </Text>          </LinearGradient>        </TouchableOpacity>      </View>
    );
  };

  // 渲染結果
  const renderResult = () => {
    switch (activeTab) {
      case 'prediction':        return renderPredictionResult();
      case 'recommendations':        return renderRecommendationsResult();
      case 'market':        return renderMarketAnalysisResult();
      case 'portfolio':        return renderPortfolioOptimizationResult();
      default:        return null;
    }
  };

  // 輔助函數
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low':        return COLORS.SUCCESS;
      case 'medium':        return COLORS.WARNING;
      case 'high':        return COLORS.ERROR;
      default:        return COLORS.GRAY;
    }
  };

  return (
    <ScrollView      style={ styles.container }      refreshControl={ <RefreshControl refreshing={refreshing } onRefresh={ onRefresh } />      }
    >      <LinearGradient        colors={ COLORS.GRADIENT_BACKGROUND }        style={ styles.gradient }      >        { /* 標題 */ }        <View style={ styles.header }>          <Text style={ styles.title }>{ t('ml_analysis.title') }</Text>          <Text style={ styles.subtitle }>{ t('ml_analysis.subtitle') }</Text>        </View>        { /* VIP提示 */ }        {
          !membership.isVIP && (            <View style={styles.vipNotice
            }>              <Icon name="star" size={ 20 } color={ COLORS.WARNING } />              <Text style={ styles.vipNoticeText }>{ t('ml_analysis.vip_notice') }</Text>            </View>          )}        { /* 標籤頁 */ }        { renderTabs() }        { /* 功能說明 */ }        <View style={ styles.descriptionSection }>          <Text style={ styles.descriptionTitle }>            { t(`ml_analysis.${activeTab }_title`)}          </Text>          <Text style={ styles.descriptionText }>            { t(`ml_analysis.${activeTab }_description`)}          </Text>        </View>        { /* 操作按鈕 */ }        { renderActionButton() }        { /* 結果顯示 */ }        { renderResult() }      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: SIZES.RADIUS,
    overflow: 'hidden',
  },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SIZES.PADDING * 2,
    paddingVertical: SIZES.PADDING * 1.5,
  },
  actionButtonText: {
    ...FONTS.h4,
    color: COLORS.WHITE,
    marginLeft: SIZES.MARGIN,
  },
  actionSection: { marginBottom: SIZES.MARGIN * 2 },
  activeTab: { backgroundColor: COLORS.PRIMARY },
  activeTabText: { color: COLORS.WHITE },
  algorithmConfidence: {
    ...FONTS.body4,
    color: COLORS.SUCCESS,
  },
  algorithmItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.MARGIN / 2,
  },
  algorithmName: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    flex: 1,
  },
  algorithmsCard: {
    backgroundColor: `${COLORS.WHITE }10`,
    borderRadius: SIZES.RADIUS,
    marginBottom: SIZES.MARGIN,
    padding: SIZES.PADDING,
  },
  analysisConfidence: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },
  cardTitle: {
    ...FONTS.h4,
    color: COLORS.WHITE,
    marginBottom: SIZES.MARGIN,
  },
  confidenceText: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  container: {
    flex: 1,
  },
  descriptionSection: {
    backgroundColor: `${COLORS.WHITE }10`,
    borderRadius: SIZES.RADIUS,
    marginBottom: SIZES.MARGIN * 2,
    padding: SIZES.PADDING,
  },
  descriptionText: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    lineHeight: 20,
    opacity: 0.9,
  },
  descriptionTitle: {
    ...FONTS.h4,
    color: COLORS.WHITE,
    marginBottom: SIZES.MARGIN,
  },
  forecastConfidence: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    opacity: 0.7,
  },
  forecastItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.MARGIN,
  },
  forecastLabel: {
    ...FONTS.body4,
    color: COLORS.WHITE,
  },
  forecastValue: {
    ...FONTS.body4,
    color: COLORS.SUCCESS,
  },
  gradient: {
    flex: 1,
    padding: SIZES.PADDING,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.MARGIN * 2,
  },
  implementationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.MARGIN,
  },
  implementationLabel: {
    ...FONTS.body4,
    color: COLORS.WHITE,
  },
  implementationValue: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  mainPredictionCard: {
    borderRadius: SIZES.RADIUS,
    marginBottom: SIZES.MARGIN,
    overflow: 'hidden',
  },
  mainPredictionGradient: {
    alignItems: 'center',
    padding: SIZES.PADDING * 2,
  },
  mainPredictionLabel: {
    ...FONTS.body3,
    color: COLORS.WHITE,
    marginBottom: SIZES.MARGIN,
  },
  mainPredictionValue: {
    ...FONTS.h1,
    color: COLORS.WHITE,
    marginBottom: SIZES.MARGIN,
  },
  marketCard: {
    backgroundColor: `${COLORS.WHITE }10`,
    borderRadius: SIZES.RADIUS,
    padding: SIZES.PADDING,
  },
  noDataText: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
  optimizationConfidence: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },
  outcomeItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.MARGIN,
  },
  outcomeLabel: {
    ...FONTS.body4,
    color: COLORS.WHITE,
  },
  outcomeValue: {
    ...FONTS.h4,
    color: COLORS.SUCCESS,
  },
  portfolioCard: {
    backgroundColor: `${COLORS.WHITE }10`,
    borderRadius: SIZES.RADIUS,
    padding: SIZES.PADDING,
  },
  reasoningText: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    lineHeight: 20,
    marginBottom: SIZES.MARGIN,
    opacity: 0.9,
  },
  recommendationCardName: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    flex: 1,
  },
  recommendationItem: {
    alignItems: 'center',
    borderBottomColor: `${COLORS.WHITE }20`,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.MARGIN / 2,
  },
  recommendationScore: {
    ...FONTS.body4,
    color: COLORS.SUCCESS,
  },
  recommendationText: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    marginBottom: SIZES.MARGIN / 2,
    opacity: 0.9,
  },
  recommendationsCard: {
    backgroundColor: `${COLORS.WHITE }10`,
    borderRadius: SIZES.RADIUS,
    padding: SIZES.PADDING,
  },
  reportText: {
    ...FONTS.body4,
    color: COLORS.WHITE,
    lineHeight: 20,
    marginBottom: SIZES.MARGIN,
    opacity: 0.9,
  },
  resultSection: { marginBottom: SIZES.MARGIN * 2 },
  riskBadge: {
    borderRadius: SIZES.RADIUS,
    paddingHorizontal: SIZES.PADDING,
    paddingVertical: SIZES.MARGIN / 2,
  },
  riskBadgeText: {
    ...FONTS.body4,
    color: COLORS.WHITE,
  },
  riskCard: {
    backgroundColor: `${COLORS.WHITE }10`,
    borderRadius: SIZES.RADIUS,
    padding: SIZES.PADDING,
  },
  riskItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.MARGIN,
  },
  riskLabel: {
    ...FONTS.body4,
    color: COLORS.WHITE,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.WHITE,
    marginBottom: SIZES.MARGIN,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.WHITE,
    opacity: 0.8,
    textAlign: 'center',
  },
  tab: {
    alignItems: 'center',
    borderRadius: SIZES.RADIUS - 4,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SIZES.PADDING,
  },
  tabText: {
    ...FONTS.body4,
    color: COLORS.GRAY,
    marginLeft: 4,
  },
  tabsContainer: {
    backgroundColor: `${COLORS.WHITE }20`,
    borderRadius: SIZES.RADIUS,
    flexDirection: 'row',
    marginBottom: SIZES.MARGIN * 2,
    padding: 4,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.WHITE,
    marginBottom: SIZES.MARGIN,
    textAlign: 'center',
  },
  vipNotice: {
    alignItems: 'center',
    backgroundColor: `${COLORS.WARNING }20`,
    borderRadius: SIZES.RADIUS,
    flexDirection: 'row',
    marginBottom: SIZES.MARGIN * 2,
    padding: SIZES.PADDING,
  },
  vipNoticeText: {
    ...FONTS.body4,
    color: COLORS.WARNING,
    flex: 1,
    marginLeft: SIZES.MARGIN,
  },
});

export default MLAnalysisScreen;
