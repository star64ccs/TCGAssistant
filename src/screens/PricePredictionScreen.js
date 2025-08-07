import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
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
          { limit: 100 },
          { useCache: true }
        );
        
        if (result && result.data && result.data.cards) {
          setAvailableCards(result.data.cards);
        } else {
          setAvailableCards([]);
        }
      } catch (error) {
        console.error('載入卡牌數據失敗:', error);
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
        color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
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
          prompt: `請分析卡牌 ${selectedCard.name} 的價格趨勢，預測未來 ${selectedPeriod || '1個月'} 的價格變化`,
          context: {
            cardName: selectedCard.name,
            currentPrice: selectedCard.price || 0,
            period: selectedPeriod || '1_month'
          }
        },
        { useCache: false }
      );
      
      if (result && result.data && result.data.response) {
        setPredictionResult({
          prediction: result.data.response,
          confidence: 0.85,
          factors: ['市場趨勢', '卡牌稀有度', '玩家需求']
        });
      } else {
        Alert.alert('錯誤', '預測失敗，請重試');
      }
    } catch (error) {
      console.error('價格預測失敗:', error);
      Alert.alert('錯誤', '預測失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCardSelector = () => (
    <View style={styles.cardSelector}>
      <Text style={styles.selectorLabel}>选择卡牌</Text>
      {isLoadingCards ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.cardDropdown}>
          <Text style={styles.cardDropdownText}>
            {selectedCard ? selectedCard.name : '請選擇卡牌'}
          </Text>
          <Icon name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPriceFactors = () => (
    <View style={styles.priceFactors}>
      <Text style={styles.sectionTitle}>价格影响因素</Text>
      <View style={styles.factorsGrid}>
        {priceFactors.map((factor) => (
          <TouchableOpacity key={factor.id} style={styles.factorButton}>
            <Icon name={factor.icon} size={24} color={factor.color} />
            <Text style={styles.factorText}>{factor.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPriceDisplay = () => (
    <View style={styles.priceDisplay}>
      {predictionResult ? (
        <>
          <Text style={styles.priceValue}>${predictionResult.currentPrice?.toFixed(2) || '0.00'}</Text>
          <Text style={[
            styles.priceChange,
            { color: predictionResult.changePercentage >= 0 ? '#4caf50' : '#f44336' }
          ]}>
            {predictionResult.changePercentage >= 0 ? '+' : ''}{predictionResult.changePercentage?.toFixed(1) || '0.0'}%
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.priceValue}>$0.00</Text>
          <Text style={styles.priceChange}>0.0%</Text>
        </>
      )}
    </View>
  );

  const renderPriceChart = () => (
    <View style={styles.chartContainer}>
      <LineChart
        data={chartData}
        width={width - 40}
        height={200}
        chartConfig={{
          backgroundColor: '#1A1F71',
          backgroundGradientFrom: '#1A1F71',
          backgroundGradientTo: '#1A1F71',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#800080',
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );

  const renderCardOverlay = () => (
    <View style={styles.cardOverlay}>
      <View style={styles.overlayCard}>
        <Text style={styles.overlayCardText}>Compla Cord</Text>
        <Text style={styles.overlayCardSubtext}>Stunn</Text>
        <Text style={styles.overlayCardNumber}>Seriee</Text>
        <Text style={styles.overlayCardId}>Qrall</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 頂部標題 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>价格预测</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="cog" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 卡牌選擇器 */}
        {renderCardSelector()}

        {/* 價格影響因素 */}
        {renderPriceFactors()}

        {/* 價格顯示 */}
        {renderPriceDisplay()}

        {/* 價格圖表 */}
        <View style={styles.chartSection}>
          {renderPriceChart()}
          {renderCardOverlay()}
        </View>

        {/* 生成預測按鈕 */}
        <TouchableOpacity 
          style={styles.predictButton}
          onPress={handlePredict}
          disabled={isProcessing}
        >
          <Text style={styles.predictButtonText}>
            {isProcessing ? '生成中...' : '生成预测'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cardSelector: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  selectorLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  cardDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  cardDropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  priceFactors: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorButton: {
    width: (width - 60) / 2,
    height: 80,
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  factorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceChange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  chartSection: {
    position: 'relative',
    marginBottom: 30,
  },
  chartContainer: {
    paddingHorizontal: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  overlayCard: {
    width: 60,
    height: 80,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  overlayCardText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  overlayCardSubtext: {
    fontSize: 6,
    color: '#000',
    marginTop: 2,
  },
  overlayCardNumber: {
    fontSize: 6,
    color: '#000',
    marginTop: 2,
  },
  overlayCardId: {
    fontSize: 6,
    color: '#000',
    marginTop: 2,
  },
  predictButton: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#ffeb3b',
    alignItems: 'center',
  },
  predictButtonText: {
    color: '#ffeb3b',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PricePredictionScreen;
