import React, { useState, useEffect } from 'react';
import { View,  Text,  StyleSheet,  ScrollView,  TouchableOpacity,  Alert,  ActivityIndicator,  Dimensions,  RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TEXT_STYLES } from '../constants';
import aiModelOptimizer from '../services/aiModelOptimizer';
const { width, height } = Dimensions.get('window');
const AIModelOptimizationScreen = () => {
  const navigation = useNavigation();
  const { t,
  } = useTranslation();
  const [optimizationReport, setOptimizationReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  useEffect(() => {
    loadOptimizationReport();
  }, []);
  const loadOptimizationReport = async () => {
    try {      setIsLoading(true);
      const report = await aiModelOptimizer.getOptimizationReport();
      setOptimizationReport(report);
    } catch (error) {
      // Alert.alert('錯誤', '載入優化報告失敗');
    } finally {
      setIsLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOptimizationReport();
    setRefreshing(false);
  };
  const handleManualOptimization = async () => {
    if (selectedModels.length === 0) {      Alert.alert('提示', '請選擇要優化的模型');
      return;
    }    Alert.alert(      '確認優化',      `確定要優化選中的 ${ selectedModels.length } 個模型嗎？這可能需要一些時間。`,      [        { text: '取消', style: 'cancel' },        {
          text: '確定',
          onPress: async () => {            try {              setIsOptimizing(true);
              const result = await aiModelOptimizer.triggerManualOptimization(selectedModels);
              Alert.alert('優化完成', result.message);
              setSelectedModels([]);
              await loadOptimizationReport();
            } catch (error) {
              // Alert.alert('錯誤', '優化失敗，請稍後再試');
            } finally {
              setIsOptimizing(false);
            }          },        },      ],
    );
  };
  const toggleModelSelection = (modelName) => {
    setSelectedModels(prev =>      prev.includes(modelName)        ? prev.filter(name => name !== modelName)        : [...prev, modelName],
    );
  };
  const getModelStatusColor = (accuracy) => {
    if (accuracy >= 0.9) {
      return '#4CAF50';
    } // 優秀    if (accuracy >= 0.8) {
      return '#FF9800';
    } // 良好    if (accuracy >= 0.7) {
      return '#FFC107';
    } // 一般    return '#F44336'; // 需要優化
  };
  const getModelStatusText = (accuracy) => {
    if (accuracy >= 0.9) {
      return '優秀';
    }    if (accuracy >= 0.8) {
      return '良好';
    }    if (accuracy >= 0.7) {
      return '一般';
    }    return '需要優化';
  };
  const renderModelCard = (modelName, performance) => {
    const isSelected = selectedModels.includes(modelName);
    const statusColor = getModelStatusColor(performance.accuracy || performance.satisfaction || 0);
    const statusText = getModelStatusText(performance.accuracy || performance.satisfaction || 0);
    return (      <TouchableOpacity        key={modelName
        }        style={
          [            styles.modelCard,            isSelected && styles.selectedModelCard,          ]
        }        onPress={ () => toggleModelSelection(modelName) }      >        <View style={ styles.modelHeader }>          <View style={ styles.modelInfo }>            <Text style={ styles.modelName }>              { t(`ai_optimization.models.${modelName }`)}            </Text>            <View style={ [styles.statusIndicator, { backgroundColor: statusColor }]}>              <Text style={ styles.statusText }>{ statusText }</Text>            </View>          </View>          { isSelected ? <Icon name="check-circle" size={24 } color="#4CAF50" /> : null}        </View>        <View style={ styles.modelMetrics }>          <View style={ styles.metric }>            <Text style={ styles.metricLabel }>準確率</Text>            <Text style={ styles.metricValue }>              { ((performance.accuracy || performance.satisfaction || 0) * 100).toFixed(1) }%            </Text>          </View>          <View style={ styles.metric }>            <Text style={ styles.metricLabel }>信心度</Text>            <Text style={ styles.metricValue }>              { ((performance.confidence || performance.responseQuality || 0) * 100).toFixed(1) }%            </Text>          </View>          <View style={ styles.metric }>            <Text style={ styles.metricLabel }>使用次數</Text>            <Text style={ styles.metricValue }>              { performance.totalPredictions || performance.totalRecognitions ||performance.totalChecks || performance.totalAnalyses ||performance.totalChats || 0 }            </Text>          </View>        </View>        { performance.lastOptimized ? <Text style={styles.lastOptimized }>            最後優化: { new Date(performance.lastOptimized).toLocaleDateString() }        </Text> : null}      </TouchableOpacity>
    );
  };
  const renderOptimizationHistory = () => {
    if (!optimizationReport?.recentOptimizations?.length) {      return (        <View style={styles.emptyHistory
        }>          <Icon name="history" size={ 48 } color="#666" />          <Text style={ styles.emptyHistoryText }>暫無優化記錄</Text>        </View>      );
    }    return optimizationReport.recentOptimizations.map((optimization, index) => (      <View key={ index } style={ styles.historyItem }>        <View style={ styles.historyHeader }>          <Text style={ styles.historyModelName }>            { t(`ai_optimization.models.${optimization.modelName }`)}          </Text>          <Text style={ styles.historyType }>            { t(`ai_optimization.types.${optimization.type }`)}          </Text>        </View>        <View style={ styles.historyDetails }>          <Text style={ styles.historyAccuracy }>            新準確率: { (optimization.newAccuracy * 100).toFixed(1) }%          </Text>          <Text style={ styles.historyTime }>            { new Date(optimization.timestamp).toLocaleString() }          </Text>        </View>      </View>
    ));
  };
  if (isLoading) {
    return (      <View style={styles.loadingContainer
      }>        <ActivityIndicator size="large" color="#00ffff" />        <Text style={ styles.loadingText }>載入優化報告中...</Text>      </View>
    );
  }  return (
    <View style={ styles.container }>      { /* 頂部標題 */ }      <View style={ styles.header }>        <TouchableOpacity          style={ styles.backButton }          onPress={ () => navigation.goBack() }        >          <Icon name="arrow-left" size={ 24 } color="#fff" />        </TouchableOpacity>        <Text style={ styles.headerTitle }>AI模型優化</Text>        <TouchableOpacity          style={ styles.settingsButton }          onPress={ () => navigation.navigate('Settings') }        >          <Icon name="cog" size={ 24 } color="#00ffff" />        </TouchableOpacity>      </View>      <ScrollView        style={ styles.scrollView }        showsVerticalScrollIndicator={ false }        refreshControl={ <RefreshControl refreshing={refreshing } onRefresh={ onRefresh } />        }      >        { /* 優化狀態概覽 */ }        <View style={ styles.overviewSection }>          <Text style={ styles.sectionTitle }>模型性能概覽</Text>          <View style={ styles.overviewCards }>            <View style={ styles.overviewCard }>              <Icon name="brain" size={ 32 } color="#00ffff" />              <Text style={ styles.overviewNumber }>                { Object.keys(optimizationReport?.currentPerformance || {}).length}              </Text>              <Text style={ styles.overviewLabel }>總模型數</Text>            </View>            <View style={ styles.overviewCard }>              <Icon name="trending-up" size={ 32 } color="#4CAF50" />              <Text style={ styles.overviewNumber }>                { optimizationReport?.recentOptimizations?.length || 0 }              </Text>              <Text style={ styles.overviewLabel }>優化次數</Text>            </View>            <View style={ styles.overviewCard }>              <Icon name="clock" size={ 32 } color="#FF9800" />              <Text style={ styles.overviewNumber }>                {
                  optimizationReport?.nextScheduledCheck                    ? new Date(optimizationReport.nextScheduledCheck).toLocaleDateString()                    : 'N/A'
                }              </Text>              <Text style={ styles.overviewLabel }>下次檢查</Text>            </View>          </View>        </View>        { /* 模型列表 */ }        <View style={ styles.modelsSection }>          <View style={ styles.sectionHeader }>            <Text style={ styles.sectionTitle }>模型狀態</Text>            <TouchableOpacity              style={ styles.selectAllButton }              onPress={ () => {                if (selectedModels.length === Object.keys(optimizationReport?.currentPerformance || {}).length) {
                  setSelectedModels([]);
                } else {
                  setSelectedModels(Object.keys(optimizationReport?.currentPerformance || {}));                }              }}            >              <Text style={ styles.selectAllText }>                { selectedModels.length === Object.keys(optimizationReport?.currentPerformance || {}).length                  ? '取消全選'                  : '全選'                }              </Text>            </TouchableOpacity>          </View>          {
            optimizationReport?.currentPerformance ? Object.entries(optimizationReport.currentPerformance).map(([modelName, performance]) =>              renderModelCard(modelName, performance),            ) : null
          }        </View>        { /* 手動優化按鈕 */ }        {
          selectedModels.length > 0 && (            <View style={styles.optimizationSection
            }>              <TouchableOpacity                style={
                  [                    styles.optimizeButton,                    isOptimizing && styles.optimizeButtonDisabled,                  ]
                }                onPress={ handleManualOptimization }                disabled={ isOptimizing }              >                {
                  isOptimizing ? (                    <ActivityIndicator size="small" color="#fff" />                  ) : (                    <Icon name="auto-fix" size={20
                    } color="#fff" />                  )}                <Text style={ styles.optimizeButtonText }>                  { isOptimizing ? '優化中...' : `優化選中模型 (${selectedModels.length })`}                </Text>              </TouchableOpacity>            </View>          )}        { /* 優化歷史 */ }        <View style={ styles.historySection }>          <Text style={ styles.sectionTitle }>最近優化記錄</Text>          { renderOptimizationHistory() }        </View>        { /* 優化配置 */ }        <View style={ styles.configSection }>          <Text style={ styles.sectionTitle }>優化配置</Text>          <View style={ styles.configCard }>            <View style={ styles.configItem }>              <Text style={ styles.configLabel }>準確率閾值</Text>              <Text style={ styles.configValue }>                { (optimizationReport?.optimizationConfig?.accuracyThreshold * 100).toFixed(0) }%              </Text>            </View>            <View style={ styles.configItem }>              <Text style={ styles.configLabel }>重新訓練閾值</Text>              <Text style={ styles.configValue }>                { (optimizationReport?.optimizationConfig?.retrainThreshold * 100).toFixed(0) }%              </Text>            </View>            <View style={ styles.configItem }>              <Text style={ styles.configLabel }>批次大小</Text>              <Text style={ styles.configValue }>                { optimizationReport?.optimizationConfig?.batchSize }              </Text>            </View>            <View style={ styles.configItem }>              <Text style={ styles.configLabel }>學習率</Text>              <Text style={ styles.configValue }>                { optimizationReport?.optimizationConfig?.learningRate }              </Text>            </View>          </View>        </View>      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  configCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  configItem: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  configLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  configSection: {
    padding: 20,
    paddingBottom: 40,
  },
  configValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  container: {    backgroundColor: '#1A1F71',
    flex: 1,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
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
  historyAccuracy: {
    color: '#4CAF50',
    fontSize: 12,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  historyModelName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historySection: { padding: 20 },
  historyTime: {
    color: '#999',
    fontSize: 12,
  },
  historyType: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 8,
    color: '#00ffff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lastOptimized: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#1A1F71',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    padding: 16,
  },
  modelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modelInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  modelMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modelName: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelsSection: { padding: 20 },
  optimizationSection: { padding: 20 },
  optimizeButton: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 16,
  },
  optimizeButtonDisabled: { backgroundColor: '#666' },
  optimizeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  overviewCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewLabel: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  overviewNumber: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  overviewSection: { padding: 20 },
  scrollView: { flex: 1 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectAllButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectAllText: {
    color: '#00ffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedModelCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
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
  statusIndicator: {
    borderRadius: 12,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
export default AIModelOptimizationScreen;
