import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import investmentAdviceService from '../services/investmentAdviceService';
import { LightweightChart } from '../components/LightweightChart';
import { COLORS, FONTS, SIZES } from '../constants';

const InvestmentAdviceScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // 狀態管理
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [riskLevel, setRiskLevel] = useState('MODERATE');
  const [timeHorizon, setTimeHorizon] = useState(180);
  const [selectedTab, setSelectedTab] = useState('recommendations');
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [marketTrends, setMarketTrends] = useState(null);

  // 新增：價格範圍和卡牌類型選擇
  const [priceRange, setPriceRange] = useState('ALL');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [showCustomPriceInput, setShowCustomPriceInput] = useState(false);
  const [selectedCardTypes, setSelectedCardTypes] = useState(['pokemon', 'yugioh', 'mtg', 'onepiece']);

  // 風險等級選項
  const riskLevels = [
    { key: 'CONSERVATIVE', label: '保守', icon: 'shield-check', color: '#4CAF50' },
    { key: 'MODERATE', label: '適中', icon: 'balance-scale', color: '#FF9800' },
    { key: 'AGGRESSIVE', label: '激進', icon: 'rocket', color: '#F44336' },
  ];

  // 時間範圍選項
  const timeHorizons = [
    { value: 30, label: '1個月' },
    { value: 90, label: '3個月' },
    { value: 180, label: '6個月' },
    { value: 365, label: '1年' },
  ];

  // 投資金額選項
  const investmentAmounts = [
    { value: 500, label: '$500' },
    { value: 1000, label: '$1,000' },
    { value: 2500, label: '$2,500' },
    { value: 5000, label: '$5,000' },
    { value: 10000, label: '$10,000' },
  ];

  // 新增：價格範圍選項（保留預設選項）
  const priceRanges = [
    { key: 'ALL', label: '全部價格', icon: 'currency-usd', min: 0, max: 999999 },
    { key: 'BUDGET', label: '經濟型 ($1-$50)', icon: 'currency-usd-off', min: 1, max: 50 },
    { key: 'MID_RANGE', label: '中價位 ($50-$200)', icon: 'currency-usd', min: 50, max: 200 },
    { key: 'PREMIUM', label: '高價位 ($200-$1000)', icon: 'currency-usd', min: 200, max: 1000 },
    { key: 'LUXURY', label: '奢華級 ($1000+)', icon: 'diamond', min: 1000, max: 999999 },
  ];

  // 新增：卡牌類型選項
  const cardTypes = [
    { key: 'pokemon', label: 'Pokemon', icon: 'pokeball', color: '#FF6B6B' },
    { key: 'yugioh', label: 'Yu-Gi-Oh!', icon: 'sword-cross', color: '#4ECDC4' },
    { key: 'mtg', label: 'Magic: The Gathering', icon: 'cards', color: '#45B7D1' },
    { key: 'onepiece', label: 'One Piece', icon: 'sail-boat', color: '#96CEB4' },
  ];

  // 初始化
  useEffect(() => {
    initializeService();
  }, []);

  // 初始化服務
  const initializeService = async () => {
    try {
      await investmentAdviceService.initialize();
      await loadData();
    } catch (error) {
      Alert.alert('錯誤', '無法初始化投資建議服務');
    }
  };

  // 載入數據
  const loadData = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        generateAdvice(),
        loadPortfolioAnalysis(),
        loadMarketTrends(),
      ]);
    } catch (error) {
      Alert.alert('錯誤', '無法載入投資數據');
    } finally {
      setLoading(false);
    }
  };

  // 生成投資建議
  const generateAdvice = async () => {
    try {
      // 處理自定義價格範圍
      let priceRangeData = priceRange;
      if (priceRange === 'CUSTOM') {
        const minPrice = parseFloat(customMinPrice) || 0;
        const maxPrice = parseFloat(customMaxPrice) || 999999;
        priceRangeData = {
          type: 'CUSTOM',
          min: minPrice,
          max: maxPrice,
        };
      }
      
      const result = await investmentAdviceService.generateInvestmentAdvice(
        user.id,
        investmentAmount,
        riskLevel,
        timeHorizon,
        priceRangeData,
        selectedCardTypes,
      );
      setAdvice(result);
    } catch (error) {
      throw error;
    }
  };

  // 載入投資組合分析
  const loadPortfolioAnalysis = async () => {
    try {
      const portfolio = await investmentAdviceService.getUserInvestmentPortfolio(user.id);
      setPortfolioAnalysis(portfolio);
    } catch (error) {}
  };

  // 載入市場趨勢
  const loadMarketTrends = async () => {
    try {
      const trends = await investmentAdviceService.getMarketTrends();
      setMarketTrends(trends);
    } catch (error) {}
  };

  // 刷新數據
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (error) {} finally {
      setRefreshing(false);
    }
  }, [user?.id, investmentAmount, riskLevel, timeHorizon, priceRange, customMinPrice, customMaxPrice, selectedCardTypes]);

  // 更新投資參數
  const updateInvestmentParams = async (newAmount, newRiskLevel, newTimeHorizon, newPriceRange, newCardTypes) => {
    const paramsChanged =
      newAmount !== investmentAmount ||
      newRiskLevel !== riskLevel ||
      newTimeHorizon !== timeHorizon ||
      newPriceRange !== priceRange ||
      JSON.stringify(newCardTypes) !== JSON.stringify(selectedCardTypes);

    if (paramsChanged) {
      setInvestmentAmount(newAmount);
      setRiskLevel(newRiskLevel);
      setTimeHorizon(newTimeHorizon);
      if (newPriceRange !== undefined) {
        setPriceRange(newPriceRange);
      }
      if (newCardTypes !== undefined) {
        setSelectedCardTypes(newCardTypes);
      }
      // 重新生成建議
      setLoading(true);
      try {
        await generateAdvice();
      } catch (error) {} finally {
        setLoading(false);
      }
    }
  };

  // 渲染風險等級選擇器
  const renderRiskLevelSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>風險等級</Text>
      <View style={styles.riskLevelContainer}>
        {riskLevels.map((level) => (
          <TouchableOpacity
            key={level.key}
            style={[
              styles.riskLevelButton,
              riskLevel === level.key && styles.riskLevelButtonActive,
            ]}
            onPress={() => updateInvestmentParams(investmentAmount, level.key, timeHorizon, priceRange, selectedCardTypes)}
          >
            <MaterialCommunityIcons
              name={level.icon}
              size={24}
              color={riskLevel === level.key ? '#FFF' : level.color}
            />
            <Text
              style={[
                styles.riskLevelText,
                riskLevel === level.key && styles.riskLevelTextActive,
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // 渲染投資金額選擇器
  const renderInvestmentAmountSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>投資金額</Text>
      <View style={styles.amountContainer}>
        {investmentAmounts.map((amount) => (
          <TouchableOpacity
            key={amount.value}
            style={[
              styles.amountButton,
              investmentAmount === amount.value && styles.amountButtonActive,
            ]}
            onPress={() => updateInvestmentParams(amount.value, riskLevel, timeHorizon, priceRange, selectedCardTypes)}
          >
            <Text
              style={[
                styles.amountText,
                investmentAmount === amount.value && styles.amountTextActive,
              ]}
            >
              {amount.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // 渲染時間範圍選擇器
  const renderTimeHorizonSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>投資時間範圍</Text>
      <View style={styles.timeContainer}>
        {timeHorizons.map((time) => (
          <TouchableOpacity
            key={time.value}
            style={[
              styles.timeButton,
              timeHorizon === time.value && styles.timeButtonActive,
            ]}
            onPress={() => updateInvestmentParams(investmentAmount, riskLevel, time.value, priceRange, selectedCardTypes)}
          >
            <Text
              style={[
                styles.timeText,
                timeHorizon === time.value && styles.timeTextActive,
              ]}
            >
              {time.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // 新增：渲染價格範圍選擇器
  const renderPriceRangeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>價格範圍</Text>
      
      {/* 預設價格範圍選項 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceRangeContainer}>
        {priceRanges.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={[
              styles.priceRangeButton,
              priceRange === range.key && styles.priceRangeButtonActive,
            ]}
            onPress={() => {
              setPriceRange(range.key);
              setShowCustomPriceInput(false);
              updateInvestmentParams(investmentAmount, riskLevel, timeHorizon, range.key, selectedCardTypes);
            }}
          >
            <MaterialCommunityIcons
              name={range.icon}
              size={20}
              color={priceRange === range.key ? '#FFF' : COLORS.gray}
            />
            <Text
              style={[
                styles.priceRangeText,
                priceRange === range.key && styles.priceRangeTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* 自定義價格範圍按鈕 */}
        <TouchableOpacity
          style={[
            styles.priceRangeButton,
            showCustomPriceInput && styles.priceRangeButtonActive,
          ]}
          onPress={() => {
            setShowCustomPriceInput(!showCustomPriceInput);
            if (!showCustomPriceInput) {
              setPriceRange('CUSTOM');
            }
          }}
        >
          <MaterialCommunityIcons
            name="tune"
            size={20}
            color={showCustomPriceInput ? '#FFF' : COLORS.gray}
          />
          <Text
            style={[
              styles.priceRangeText,
              showCustomPriceInput && styles.priceRangeTextActive,
            ]}
          >
            自定義
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 自定義價格輸入 */}
      {showCustomPriceInput && (
        <View style={styles.customPriceContainer}>
          <View style={styles.priceInputRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceInputLabel}>最低價格 ($)</Text>
              <TextInput
                style={styles.priceInput}
                value={customMinPrice}
                onChangeText={setCustomMinPrice}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.priceInputSeparator}>
              <Text style={styles.priceInputSeparatorText}>至</Text>
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceInputLabel}>最高價格 ($)</Text>
              <TextInput
                style={styles.priceInput}
                value={customMaxPrice}
                onChangeText={setCustomMaxPrice}
                placeholder="1000"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.applyCustomPriceButton}
            onPress={() => {
              const minPrice = parseFloat(customMinPrice) || 0;
              const maxPrice = parseFloat(customMaxPrice) || 999999;
              if (minPrice > maxPrice) {
                Alert.alert('錯誤', '最低價格不能大於最高價格');
                return;
              }
              updateInvestmentParams(investmentAmount, riskLevel, timeHorizon, 'CUSTOM', selectedCardTypes);
            }}
          >
            <Text style={styles.applyCustomPriceButtonText}>應用自定義範圍</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // 新增：渲染卡牌類型選擇器
  const renderCardTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>卡牌類型</Text>
      <View style={styles.cardTypeContainer}>
        {cardTypes.map((type) => {
          const isSelected = selectedCardTypes.includes(type.key);
          return (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.cardTypeButton,
                isSelected && styles.cardTypeButtonActive,
                { borderColor: type.color },
              ]}
              onPress={() => {
                const newCardTypes = isSelected
                  ? selectedCardTypes.filter(t => t !== type.key)
                  : [...selectedCardTypes, type.key];
                updateInvestmentParams(investmentAmount, riskLevel, timeHorizon, priceRange, newCardTypes);
              }}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={24}
                color={isSelected ? '#FFF' : type.color}
              />
              <Text
                style={[
                  styles.cardTypeText,
                  isSelected && styles.cardTypeTextActive,
                  { color: isSelected ? '#FFF' : type.color },
                ]}
              >
                {type.label}
              </Text>
              {isSelected ? <View style={[styles.selectedIndicator, { backgroundColor: type.color }]}>
                  <MaterialIcons name="check" size={12} color="#FFF" />
                </View> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // 新增：渲染當前選擇條件
  const renderCurrentFilters = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>當前篩選條件</Text>
      <View style={styles.filtersCard}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>價格範圍:</Text>
          <Text style={styles.filterValue}>
            {priceRange === 'CUSTOM' 
              ? `$${customMinPrice || '0'} - $${customMaxPrice || '∞'}`
              : priceRanges.find(r => r.key === priceRange)?.label || '全部價格'
            }
          </Text>
        </View>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>卡牌類型:</Text>
          <View style={styles.selectedTypesContainer}>
            {selectedCardTypes.map(type => {
              const cardType = cardTypes.find(t => t.key === type);
              return (
                <View key={type} style={[styles.selectedTypeBadge, { backgroundColor: cardType?.color }]}>
                  <Text style={styles.selectedTypeText}>{cardType?.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>已選擇:</Text>
          <Text style={styles.filterValue}>
            {selectedCardTypes.length} 種卡牌類型
          </Text>
        </View>
      </View>
    </View>
  );

  // 渲染投資建議
  const renderRecommendations = () => {
    if (!advice?.recommendations || advice.recommendations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="trending-up" size={48} color={COLORS.gray} />
          <Text style={styles.emptyText}>暫無投資建議</Text>
          <Text style={styles.emptySubtext}>請調整投資參數或稍後再試</Text>
        </View>
      );
    }

    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>投資建議</Text>
        {advice.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{recommendation.card.name}</Text>
              <View style={[styles.actionBadge, { backgroundColor: getActionColor(recommendation.action) }]}>
                <Text style={styles.actionText}>{getActionText(recommendation.action)}</Text>
              </View>
            </View>
            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>建議投資:</Text>
                <Text style={styles.detailValue}>
                  ${recommendation.recommendedAmount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>潛在回報:</Text>
                <Text style={[styles.detailValue, { color: '#4CAF50' }]}>
                  +{(recommendation.potentialReturn * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>風險等級:</Text>
                <Text style={[styles.detailValue, { color: getRiskColor(recommendation.risk) }]}>
                  {getRiskLevelText(recommendation.risk)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>成熟時間:</Text>
                <Text style={styles.detailValue}>
                  {Math.round(recommendation.timeToMaturity / 30)}個月
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>信心度:</Text>
                <Text style={[styles.detailValue, { color: getConfidenceColor(recommendation.confidence) }]}>
                  {(recommendation.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            <View style={styles.reasoningContainer}>
              <Text style={styles.reasoningTitle}>投資理由:</Text>
              {recommendation.reasoning.map((reason, idx) => (
                <Text key={idx} style={styles.reasoningText}>
                  • {reason}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // 渲染進階風險評估
  const renderAdvancedRiskAssessment = () => {
    if (!advice?.riskAssessment) {
      return null;
    }

    const { riskAssessment } = advice;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>風險評估</Text>
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <Text style={styles.riskTitle}>整體風險評分</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskAssessment.overallRisk) }]}>
              <Text style={styles.riskBadgeText}>
                {(riskAssessment.overallRisk * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
          <View style={styles.riskBreakdown}>
            <Text style={styles.riskSubtitle}>風險分解:</Text>
            <View style={styles.riskItem}>
              <Text style={styles.riskLabel}>市場風險</Text>
              <View style={styles.riskBar}>
                <View style={[styles.riskBarFill, { width: `${riskAssessment.riskBreakdown.marketRisk * 100}%`, backgroundColor: '#FF5722' }]} />
              </View>
              <Text style={styles.riskValue}>{(riskAssessment.riskBreakdown.marketRisk * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={styles.riskLabel}>流動性風險</Text>
              <View style={styles.riskBar}>
                <View style={[styles.riskBarFill, { width: `${riskAssessment.riskBreakdown.liquidityRisk * 100}%`, backgroundColor: '#FF9800' }]} />
              </View>
              <Text style={styles.riskValue}>{(riskAssessment.riskBreakdown.liquidityRisk * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={styles.riskLabel}>集中度風險</Text>
              <View style={styles.riskBar}>
                <View style={[styles.riskBarFill, { width: `${riskAssessment.riskBreakdown.concentrationRisk * 100}%`, backgroundColor: '#9C27B0' }]} />
              </View>
              <Text style={styles.riskValue}>{(riskAssessment.riskBreakdown.concentrationRisk * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={styles.riskLabel}>波動性風險</Text>
              <View style={styles.riskBar}>
                <View style={[styles.riskBarFill, { width: `${riskAssessment.riskBreakdown.volatilityRisk * 100}%`, backgroundColor: '#607D8B' }]} />
              </View>
              <Text style={styles.riskValue}>{(riskAssessment.riskBreakdown.volatilityRisk * 100).toFixed(0)}%</Text>
            </View>
          </View>
          {riskAssessment.riskMitigation.length > 0 && (
            <View style={styles.mitigationContainer}>
              <Text style={styles.mitigationTitle}>風險緩解建議:</Text>
              {riskAssessment.riskMitigation.map((strategy, idx) => (
                <Text key={idx} style={styles.mitigationText}>• {strategy}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // 渲染投資組合建議
  const renderPortfolioAdvice = () => {
    if (!advice?.portfolioAdvice) {
      return null;
    }

    const { portfolioAdvice } = advice;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>投資組合建議</Text>
        <View style={styles.portfolioCard}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioTitle}>投資組合優化</Text>
            <Text style={styles.portfolioSubtitle}>
              建議投資: ${portfolioAdvice.totalRecommended.toFixed(2)}
              ({portfolioAdvice.allocationPercentage.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.portfolioMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>預期年化回報</Text>
              <Text style={[styles.metricValue, { color: '#4CAF50' }]}>
                {(portfolioAdvice.expectedReturn.annualized * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>多樣化程度</Text>
              <Text style={styles.metricValue}>
                {(portfolioAdvice.diversification * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>夏普比率</Text>
              <Text style={styles.metricValue}>
                {portfolioAdvice.optimization.sharpeRatio.toFixed(2)}
              </Text>
            </View>
          </View>
          {portfolioAdvice.rebalancingAdvice.length > 0 && (
            <View style={styles.rebalancingContainer}>
              <Text style={styles.rebalancingTitle}>再平衡建議:</Text>
              {portfolioAdvice.rebalancingAdvice.map((advice, idx) => (
                <Text key={idx} style={styles.rebalancingText}>• {advice}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // 渲染實時市場數據
  const renderRealTimeData = () => {
    if (!advice?.realTimeData) {
      return null;
    }

    const { realTimeData } = advice;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>實時市場數據</Text>
        <View style={styles.realTimeCard}>
          {realTimeData.marketSentiment ? <View style={styles.sentimentContainer}>
              <Text style={styles.sentimentTitle}>市場情緒</Text>
              <View style={styles.sentimentBar}>
                <View style={[styles.sentimentFill, { width: `${realTimeData.marketSentiment.overall * 100}%` }]} />
              </View>
              <Text style={styles.sentimentValue}>
                {(realTimeData.marketSentiment.overall * 100).toFixed(0)}%
              </Text>
            </View> : null}
          {realTimeData.priceAlerts.length > 0 && (
            <View style={styles.alertsContainer}>
              <Text style={styles.alertsTitle}>價格警報</Text>
              {realTimeData.priceAlerts.slice(0, 3).map((alert, idx) => (
                <Text key={idx} style={styles.alertText}>
                  • {alert.cardName}: {alert.change > 0 ? '+' : ''}{alert.change}%
                </Text>
              ))}
            </View>
          )}
          {realTimeData.volumeSpikes.length > 0 && (
            <View style={styles.spikesContainer}>
              <Text style={styles.spikesTitle}>交易量異常</Text>
              {realTimeData.volumeSpikes.slice(0, 3).map((spike, idx) => (
                <Text key={idx} style={styles.spikeText}>
                  • {spike.cardName}: 交易量增加 {spike.increase}%
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // 渲染投資策略
  const renderInvestmentStrategy = () => {
    if (!advice?.investmentStrategy) {
      return null;
    }

    const { investmentStrategy } = advice;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>投資策略</Text>
        <View style={styles.strategyCard}>
          <View style={styles.strategyItem}>
            <Text style={styles.strategyLabel}>投資方法</Text>
            <Text style={styles.strategyValue}>{getStrategyText(investmentStrategy.approach)}</Text>
          </View>
          <View style={styles.strategyItem}>
            <Text style={styles.strategyLabel}>分配策略</Text>
            <Text style={styles.strategyValue}>{getAllocationText(investmentStrategy.allocation.method)}</Text>
          </View>
          <View style={styles.strategyItem}>
            <Text style={styles.strategyLabel}>時機策略</Text>
            <Text style={styles.strategyValue}>{getTimingText(investmentStrategy.timing)}</Text>
          </View>
          <View style={styles.strategyItem}>
            <Text style={styles.strategyLabel}>監控頻率</Text>
            <Text style={styles.strategyValue}>{getMonitoringText(investmentStrategy.monitoring.frequency)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // 渲染風險評估
  const renderRiskAssessment = () => {
    if (!advice?.riskAssessment) {
      return null;
    }

    const { riskAssessment } = advice;

    return (
      <View style={styles.riskAssessmentContainer}>
        <Text style={styles.sectionTitle}>風險評估</Text>
        <View style={styles.riskMetricsContainer}>
          <View style={styles.riskMetric}>
            <Text style={styles.riskMetricLabel}>整體風險</Text>
            <Text style={[styles.riskMetricValue, { color: getRiskColor(riskAssessment.overallRisk) }]}>
              {(riskAssessment.overallRisk * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.riskMetric}>
            <Text style={styles.riskMetricLabel}>最高風險</Text>
            <Text style={[styles.riskMetricValue, { color: getRiskColor(riskAssessment.maxRisk) }]}>
              {(riskAssessment.maxRisk * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.riskMetric}>
            <Text style={styles.riskMetricLabel}>風險容忍度</Text>
            <Text style={styles.riskMetricValue}>
              {(riskAssessment.riskTolerance * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        <View style={styles.riskStatusContainer}>
          <MaterialIcons
            name={riskAssessment.isWithinTolerance ? 'check-circle' : 'warning'}
            size={24}
            color={riskAssessment.isWithinTolerance ? '#4CAF50' : '#FF9800'}
          />
          <Text style={[
            styles.riskStatusText,
            { color: riskAssessment.isWithinTolerance ? '#4CAF50' : '#FF9800' },
          ]}>
            {riskAssessment.isWithinTolerance ? '風險在可接受範圍內' : '風險超出可接受範圍'}
          </Text>
        </View>
        {riskAssessment.riskFactors.length > 0 && (
          <View style={styles.riskFactorsContainer}>
            <Text style={styles.riskFactorsTitle}>風險因素:</Text>
            {riskAssessment.riskFactors.map((factor, index) => (
              <Text key={index} style={styles.riskFactorText}>
                • {factor}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 渲染投資組合分析
  const renderPortfolioAnalysis = () => {
    if (!portfolioAnalysis) {
      return null;
    }

    return (
      <View style={styles.portfolioAnalysisContainer}>
        <Text style={styles.sectionTitle}>當前投資組合分析</Text>
        <View style={styles.portfolioMetricsContainer}>
          <View style={styles.portfolioMetric}>
            <Text style={styles.portfolioMetricLabel}>總價值</Text>
            <Text style={styles.portfolioMetricValue}>
              ${portfolioAnalysis.totalValue.toFixed(2)}
            </Text>
          </View>
          <View style={styles.portfolioMetric}>
            <Text style={styles.portfolioMetricLabel}>多樣化程度</Text>
            <Text style={styles.portfolioMetricValue}>
              {(portfolioAnalysis.diversification * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.portfolioMetric}>
            <Text style={styles.portfolioMetricLabel}>風險等級</Text>
            <Text style={styles.portfolioMetricValue}>
              {getRiskLevelText(portfolioAnalysis.riskLevel)}
            </Text>
          </View>
          <View style={styles.portfolioMetric}>
            <Text style={styles.portfolioMetricLabel}>表現</Text>
            <Text style={[
              styles.portfolioMetricValue,
              { color: portfolioAnalysis.performance >= 0 ? '#4CAF50' : '#F44336' },
            ]}>
              {portfolioAnalysis.performance >= 0 ? '+' : ''}{portfolioAnalysis.performance.toFixed(1)}%
            </Text>
          </View>
        </View>
        {portfolioAnalysis.holdings.length > 0 && (
          <View style={styles.holdingsContainer}>
            <Text style={styles.holdingsTitle}>持倉詳情:</Text>
            {portfolioAnalysis.holdings.slice(0, 5).map((holding, index) => (
              <View key={index} style={styles.holdingItem}>
                <Text style={styles.holdingName}>{holding.name}</Text>
                <View style={styles.holdingDetails}>
                  <Text style={styles.holdingValue}>
                    ${holding.totalValue.toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.holdingPerformance,
                    { color: holding.performance >= 0 ? '#4CAF50' : '#F44336' },
                  ]}>
                    {holding.performance >= 0 ? '+' : ''}{holding.performance.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 渲染市場趨勢
  const renderMarketTrends = () => {
    if (!marketTrends) {
      return null;
    }

    return (
      <View style={styles.marketTrendsContainer}>
        <Text style={styles.sectionTitle}>市場趨勢</Text>
        <View style={styles.trendsContainer}>
          {Object.entries(marketTrends).map(([game, trend]) => (
            <View key={game} style={styles.trendItem}>
              <Text style={styles.trendGame}>{getGameName(game)}</Text>
              <View style={styles.trendIndicator}>
                <MaterialIcons
                  name={getTrendIcon(trend)}
                  size={20}
                  color={getTrendColor(trend)}
                />
                <Text style={[styles.trendText, { color: getTrendColor(trend) }]}>
                  {getTrendText(trend)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 渲染標籤頁
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {[
        { key: 'recommendations', label: '投資建議', icon: 'trending-up' },
        { key: 'portfolio', label: '投資組合', icon: 'account-balance-wallet' },
        { key: 'market', label: '市場趨勢', icon: 'analytics' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
          onPress={() => setSelectedTab(tab.key)}
        >
          <MaterialIcons
            name={tab.icon}
            size={20}
            color={selectedTab === tab.key ? '#FFF' : COLORS.gray}
          />
          <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 渲染標籤頁內容
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'recommendations': {
        return (
        <ScrollView style={styles.tabContent}>
          {renderCurrentFilters()}
          {renderRecommendations()}
          {renderAdvancedRiskAssessment()}
          {renderPortfolioAdvice()}
          {renderRealTimeData()}
          {renderInvestmentStrategy()}
        </ScrollView>
        );
      }
      case 'portfolio': {
        return (
        <ScrollView style={styles.tabContent}>
          {renderPortfolioAnalysis()}
        </ScrollView>
        );
      }
      case 'market': {
        return (
        <ScrollView style={styles.tabContent}>
          {renderMarketTrends()}
        </ScrollView>
        );
      }
      default:
        return null;
    }
  };

  // 輔助方法
  const getActionColor = (action) => {
    const colors = {
      'STRONG_BUY': '#4CAF50',
      'BUY': '#8BC34A',
      'HOLD': '#FF9800',
      'WAIT': '#FFC107',
      'SELL': '#F44336',
    };
    return colors[action] || '#9E9E9E';
  };

  const getActionText = (action) => {
    const texts = {
      'STRONG_BUY': '強烈買入',
      'BUY': '買入',
      'HOLD': '持有',
      'WAIT': '觀望',
      'SELL': '賣出',
    };
    return texts[action] || '未知';
  };

  const getRiskColor = (risk) => {
    if (risk < 0.3) {
      return '#4CAF50';
    }
    if (risk < 0.6) {
      return '#FF9800';
    }
    return '#F44336';
  };

  const getRiskLevelText = (risk) => {
    if (risk < 0.3) {
      return '低風險';
    }
    if (risk < 0.6) {
      return '中等風險';
    }
    return '高風險';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) {
      return '#4CAF50';
    }
    if (confidence > 0.6) {
      return '#FF9800';
    }
    return '#F44336';
  };

  const getStrategyText = (approach) => {
    const texts = {
      'value_investing': '價值投資',
      'growth_investing': '成長投資',
      'momentum_investing': '動量投資',
    };
    return texts[approach] || approach;
  };

  const getAllocationText = (method) => {
    const texts = {
      'risk_parity': '風險平價',
      'equal_weight': '等權重',
      'mean_variance_optimization': '均值方差優化',
    };
    return texts[method] || method;
  };

  const getTimingText = (timing) => {
    const texts = {
      'immediate_entry': '立即進場',
      'dollar_cost_averaging': '定額投資',
      'gradual_build_up': '逐步建倉',
    };
    return texts[timing] || timing;
  };

  const getMonitoringText = (frequency) => {
    const texts = {
      'daily': '每日',
      'weekly': '每週',
      'monthly': '每月',
    };
    return texts[frequency] || frequency;
  };

  const getGameName = (game) => {
    const gameNames = {
      'overall': '整體市場',
      'pokemon': 'Pokemon',
      'yugioh': 'Yu-Gi-Oh!',
      'mtg': 'Magic: The Gathering',
    };
    return gameNames[game] || game;
  };

  const getTrendIcon = (trend) => {
    const icons = {
      'rising': 'trending-up',
      'stable': 'trending-flat',
      'falling': 'trending-down',
    };
    return icons[trend] || 'trending-flat';
  };

  const getTrendColor = (trend) => {
    const colors = {
      'rising': '#4CAF50',
      'stable': '#FF9800',
      'falling': '#F44336',
    };
    return colors[trend] || '#FF9800';
  };

  const getTrendText = (trend) => {
    const texts = {
      'rising': '上漲',
      'stable': '穩定',
      'falling': '下跌',
    };
    return texts[trend] || '穩定';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>正在分析投資機會...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>投資建議</Text>
        <Text style={styles.headerSubtitle}>基於 AI 的智能投資分析</Text>
      </LinearGradient>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderRiskLevelSelector()}
        {renderInvestmentAmountSelector()}
        {renderTimeHorizonSelector()}
        {renderPriceRangeSelector()}
        {renderCardTypeSelector()}
        {renderCurrentFilters()}
        {renderTabs()}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerSubtitle: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 5,
    opacity: 0.9,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  riskLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskLevelButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
  },
  riskLevelButtonActive: {
    backgroundColor: COLORS.primary,
  },
  riskLevelText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  riskLevelTextActive: {
    color: '#FFF',
  },
  amountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    width: '48%',
  },
  amountButtonActive: {
    backgroundColor: COLORS.primary,
  },
  amountText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  amountTextActive: {
    color: '#FFF',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 3,
    padding: 12,
  },
  timeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  timeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  timeTextActive: {
    color: '#FFF',
  },
  // 新增：價格範圍選擇器樣式
  priceRangeContainer: {
    marginBottom: 10,
  },
  priceRangeButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    flexDirection: 'row',
    marginRight: 10,
    minWidth: 120,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  priceRangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  priceRangeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  priceRangeTextActive: {
    color: '#FFF',
  },
  // 新增：自定義價格輸入樣式
  customPriceContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginTop: 10,
    padding: 15,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  priceInput: {
    backgroundColor: '#FFF',
    borderColor: '#E0E0E0',
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priceInputSeparator: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 30,
  },
  priceInputSeparatorText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  applyCustomPriceButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  applyCustomPriceButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // 新增：卡牌類型選擇器樣式
  cardTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardTypeButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
    position: 'relative',
    width: '48%',
  },
  cardTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  cardTypeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  cardTypeTextActive: {
    color: '#FFF',
  },
  selectedIndicator: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    top: 5,
    width: 20,
  },
  tabsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 5,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  tabTextActive: {
    color: '#FFF',
  },
  tabContent: {
    flex: 1,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  recommendationsTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    color: COLORS.gray,
    fontSize: 12,
  },
  confidenceValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardName: {
    color: COLORS.text,
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: COLORS.gray,
    fontSize: 14,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  reasoningContainer: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  reasoningTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reasoningText: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 4,
  },
  riskAssessmentContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  riskMetric: {
    alignItems: 'center',
    flex: 1,
  },
  riskMetricLabel: {
    color: COLORS.gray,
    fontSize: 12,
    marginBottom: 5,
  },
  riskMetricValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  riskStatusContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 15,
    padding: 15,
  },
  riskStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  riskFactorsContainer: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  riskFactorsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  riskFactorText: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 4,
  },
  portfolioAdviceContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  portfolioMetricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  portfolioMetric: {
    alignItems: 'center',
    marginBottom: 15,
    width: '48%',
  },
  portfolioMetricLabel: {
    color: COLORS.gray,
    fontSize: 12,
    marginBottom: 5,
  },
  portfolioMetricValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rebalancingContainer: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  rebalancingTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rebalancingText: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 4,
  },
  portfolioAnalysisContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  holdingsContainer: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  holdingsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  holdingItem: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  holdingName: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
  },
  holdingDetails: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  holdingPerformance: {
    fontSize: 12,
    marginTop: 2,
  },
  marketTrendsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trendsContainer: {
    gap: 15,
  },
  trendItem: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  trendGame: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  trendIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    paddingVertical: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubtext: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 5,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardDetails: {
    marginBottom: 15,
  },
  riskCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  riskTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  riskBadge: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  riskBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  riskBreakdown: {
    marginBottom: 15,
  },
  riskSubtitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  riskItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  riskLabel: {
    color: COLORS.gray,
    fontSize: 13,
    marginRight: 10,
  },
  riskBar: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    flex: 1,
    height: 10,
    overflow: 'hidden',
  },
  riskBarFill: {
    borderRadius: 5,
    height: '100%',
  },
  riskValue: {
    color: COLORS.gray,
    fontSize: 12,
    marginLeft: 10,
  },
  mitigationContainer: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  mitigationTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  mitigationText: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 4,
  },
  portfolioCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  portfolioHeader: {
    marginBottom: 15,
  },
  portfolioTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  portfolioSubtitle: {
    color: COLORS.gray,
    fontSize: 14,
  },
  portfolioMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricItem: {
    alignItems: 'center',
    marginBottom: 10,
    width: '48%',
  },
  metricLabel: {
    color: COLORS.gray,
    fontSize: 12,
    marginBottom: 5,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  realTimeCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sentimentContainer: {
    marginBottom: 15,
  },
  sentimentTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sentimentBar: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    height: 10,
    overflow: 'hidden',
  },
  sentimentFill: {
    borderRadius: 5,
    height: '100%',
  },
  sentimentValue: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 5,
  },
  alertsContainer: {
    marginBottom: 15,
  },
  alertsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  alertText: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 4,
  },
  spikesContainer: {
    marginBottom: 15,
  },
  spikesTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  spikeText: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 4,
  },
  strategyCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  strategyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  strategyLabel: {
    color: COLORS.gray,
    fontSize: 14,
  },
  strategyValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // 新增：當前篩選條件樣式
  filtersCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterLabel: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  filterValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  selectedTypeBadge: {
    borderRadius: 10,
    marginBottom: 5,
    marginRight: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedTypeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InvestmentAdviceScreen;
