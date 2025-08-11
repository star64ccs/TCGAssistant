import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';

import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';

const { width } = Dimensions.get('window');

const PricePredictionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const membership = useSelector(state => state.membership);

  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1_month');
  const [availableCards, setAvailableCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // 載入可用卡牌數據
  useEffect(() => {
    const loadAvailableCards = async () => {
      setIsLoadingCards(true);
      try {
        // 調用API整合管理器獲取卡牌數據
        const apiIntegrationManager = require('../services/apiIntegrationManager').default;
        const result = await apiIntegrationManager.callApi(
          'cardData',
          'getAvailableCards',
          { limit: 100,
          },
          { useCache: true },
        );
        if (result && result.data && result.data.cards) {
          setAvailableCards(result.data.cards);
        } else {
          setAvailableCards([]);
        }
      } catch (error) {
        setAvailableCards([]);
      } finally {
        setIsLoadingCards(false);
      }
    };

    loadAvailableCards();
  }, []);

  // 價格影響因素
  const priceFactors = [
    {
      id: 'market_dynamics',
      title: '市场动态',
      icon: 'megaphone',
      color: '#00ffff',
    },
    {
      id: 'event_activities',
      title: '赛事活动',
      icon: 'calendar-star',
      color: '#ffeb3b',
    },
    {
      id: 'card_attributes',
      title: '卡牌属性',
      icon: 'card-text',
      color: '#4caf50',
    },
    {
      id: 'transaction_records',
      title: '成交记录',
      icon: 'currency-usd',
      color: '#ff9800',
    },
  ];

  // 折線圖數據
  const chartData = {
    labels: ['7日', '30日', '6个月'],
    datasets: [
      {
        data: [150, 200, 250, 300, 350],
        color: (opacity = 1) => `rgba(128, 0, 128, ${opacity
        })`,
        strokeWidth: 3,
      },
    ],
  };

  const handlePredict = async () => {
    if (!selectedCard) {
      Alert.alert(t('common.error'), t('ai_prediction.select_card_first'));
      return;
    }

    setIsProcessing(true);

    try {
      // 調用API整合管理器進行價格預測
      const apiIntegrationManager = require('../services/apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        {
          prompt: `請分析卡牌 ${selectedCard.name
          } 的價格趨勢，預測未來 ${ selectedPeriod || '1個月' } 的價格變化`,
          context: {
            cardName: selectedCard.name,
            currentPrice: selectedCard.price || 0,
            period: selectedPeriod || '1_month',
          },
        },
        { useCache: false },
      );
      if (result && result.data && result.data.response) {
        setPredictionResult({
          prediction: result.data.response,
          confidence: 0.85,
          factors: ['市場趨勢', '卡牌稀有度', '玩家需求'],
        });
      } else {
        Alert.alert('錯誤', '預測失敗，請重試');
      }
    } catch (error) {
      Alert.alert('錯誤', '預測失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCardSelector = () => (
    <View style={ styles.cardSelector }>
      <Text style={ styles.selectorLabel }>选择卡牌</Text>
      {
        isLoadingCards ? (
          <View style={styles.loadingContainer
          }>
            <Text style={ styles.loadingText }>載入中...</Text>
          </View>
        ) : (
          <TouchableOpacity style={ styles.cardDropdown }>
            <Text style={ styles.cardDropdownText }>
              { selectedCard ? selectedCard.name : '請選擇卡牌' }
            </Text>
            <Icon name="chevron-down" size={ 20 } color="#fff" />
          </TouchableOpacity>
        )}
    </View>
  );

  const renderPriceFactors = () => (
    <View style={ styles.priceFactors }>
      <Text style={ styles.sectionTitle }>价格影响因素</Text>
      <View style={ styles.factorsGrid }>
        {
          priceFactors.map((factor) => (
            <TouchableOpacity key={factor.id
            } style={ styles.factorButton }>
              <Icon name={ factor.icon } size={ 24 } color={ factor.color } />
              <Text style={ styles.factorText }>{ factor.title }</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  const renderPriceDisplay = () => (
    <View style={ styles.priceDisplay }>
      {
        predictionResult ? (
          <>
            <Text style={styles.priceValue
            }>${ predictionResult.currentPrice?.toFixed(2) || '0.00' }</Text>
            <Text style={
              [
                styles.priceChange,
                { color: predictionResult.changePercentage >= 0 ? '#4caf50' : '#f44336',
                },
              ]}>
              { predictionResult.changePercentage >= 0 ? '+' : '' }{ predictionResult.changePercentage?.toFixed(1) || '0.0' }%
            </Text>
          </>
        ) : (
          <>
            <Text style={ styles.priceValue }>$0.00</Text>
            <Text style={ styles.priceChange }>0.0%</Text>
          </>
        )}
    </View>
  );

  const renderPriceChart = () => (
    <View style={ styles.chartContainer }>
      <LineChart
        data={ chartData }
        width={ width - 40 }
        height={ 200 }
        chartConfig={
          {
            backgroundColor: '#1A1F71',
            backgroundGradientFrom: '#1A1F71',
            backgroundGradientTo: '#1A1F71',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(128, 0, 128, ${opacity
            })`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${ opacity })`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#800080',
            },
          }}
        bezier
        style={ styles.chart }
      />
    </View>
  );

  const renderCardOverlay = () => (
    <View style={ styles.cardOverlay }>
      <View style={ styles.overlayCard }>
        <Text style={ styles.overlayCardText }>Compla Cord</Text>
        <Text style={ styles.overlayCardSubtext }>Stunn</Text>
        <Text style={ styles.overlayCardNumber }>Seriee</Text>
        <Text style={ styles.overlayCardId }>Qrall</Text>
      </View>
    </View>
  );

  return (
    <View style={ styles.container }>
      { /* 頂部標題 */ }
      <View style={ styles.header }>
        <Text style={ styles.headerTitle }>价格预测</Text>
        <TouchableOpacity style={ styles.settingsButton }>
          <Icon name="cog" size={ 24 } color="#00ffff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={ styles.scrollView } showsVerticalScrollIndicator={ false }>
        { /* 卡牌選擇器 */ }
        { renderCardSelector() }
        { /* 價格影響因素 */ }
        { renderPriceFactors() }
        { /* 價格顯示 */ }
        { renderPriceDisplay() }
        { /* 價格圖表 */ }
        <View style={ styles.chartSection }>
          { renderPriceChart() }
          { renderCardOverlay() }
        </View>
        { /* 生成預測按鈕 */ }
        <TouchableOpacity
          style={ styles.predictButton }
          onPress={ handlePredict }
          disabled={ isProcessing }
        >
          <Text style={ styles.predictButtonText }>
            { isProcessing ? '生成中...' : '生成预测' }
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardDropdown: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  cardDropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  cardOverlay: {
    bottom: 20,
    left: 20,
    position: 'absolute',
  },
  cardSelector: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartContainer: { paddingHorizontal: 20 },
  chartSection: {
    marginBottom: 30,
    position: 'relative',
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
  },
  factorButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    marginBottom: 15,
    width: (width - 60) / 2,
  },
  factorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  overlayCard: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    padding: 5,
    width: 60,
  },
  overlayCardId: {
    color: '#000',
    fontSize: 6,
    marginTop: 2,
  },
  overlayCardNumber: {
    color: '#000',
    fontSize: 6,
    marginTop: 2,
  },
  overlayCardSubtext: {
    color: '#000',
    fontSize: 6,
    marginTop: 2,
  },
  overlayCardText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  predictButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#ffeb3b',
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 30,
    marginHorizontal: 20,
    padding: 15,
  },
  predictButtonText: {
    color: '#ffeb3b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceChange: {
    color: '#4caf50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceDisplay: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  priceFactors: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  priceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  scrollView: { flex: 1 },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  selectorLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  settingsButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});

export default PricePredictionScreen;
