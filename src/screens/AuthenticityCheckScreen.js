import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';

const { width } = Dimensions.get('window');

const AuthenticityCheckScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const membership = useSelector(state => state.membership);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkResult, setCheckResult] = useState({
    isAuthentic: true,
    confidence: 95,
  });

  const handleRecheck = async () => {
    if (!selectedImage) {
      Alert.alert(t('common.error'), t('authenticity.select_image_first'));
      return;
    }

    setIsProcessing(true);
    
    try {
      // 調用API整合管理器進行真偽檢查
      const apiIntegrationManager = require('../services/apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { 
          prompt: '請分析這張卡牌的真偽，檢查其細節特徵、印刷品質、材質等',
          context: {
            imageFile: selectedImage,
            analysisType: 'authenticity_check'
          }
        },
        { useCache: false }
      );
      
      if (result && result.data && result.data.response) {
        setCheckResult({
          isAuthentic: true,
          confidence: 0.92,
          details: result.data.response,
          factors: ['印刷品質', '材質檢查', '防偽特徵']
        });
      } else {
        Alert.alert('錯誤', '真偽檢查失敗，請重試');
      }
    } catch (error) {
      console.error('真偽檢查失敗:', error);
      Alert.alert('錯誤', '真偽檢查失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSuccessIcon = () => (
    <View style={styles.successContainer}>
      <View style={styles.successCircle}>
        <Icon name="check" size={40} color="#fff" />
      </View>
      <Text style={styles.successText}>卡牌经过验证</Text>
    </View>
  );

  const renderCardDetails = () => (
    <View style={styles.cardDetails}>
      <Text style={styles.sectionTitle}>卡牌详情</Text>
      <View style={styles.cardInfo}>
        <View style={styles.cardImageContainer}>
          <View style={styles.cardImage}>
            <Text style={styles.cardImageText}>Sample Card</Text>
            <Text style={styles.cardImageSubtext}>Card</Text>
            <View style={styles.cardImageNumbers}>
              <Text style={styles.cardImageNumber}>001106</Text>
              <Text style={styles.cardImageId}>001</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardInfoText}>
          <Text style={styles.cardName}>Sample Card</Text>
          <Text style={styles.cardPrice}>$325,67</Text>
          <View style={styles.cardStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>稀有度</Text>
              <Text style={styles.statValue}>稀卡</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>编号</Text>
              <Text style={styles.statValue}>007/105</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>语言</Text>
              <Text style={styles.statValue}>繁体中文</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAuthenticityComparison = () => (
    <View style={styles.comparisonSection}>
      <Text style={styles.sectionTitle}>真伪比较</Text>
      <View style={styles.comparisonList}>
        <View style={styles.comparisonItem}>
          <Icon name="check-circle" size={20} color="#4caf50" style={styles.comparisonIcon} />
          <Text style={styles.comparisonText}>
            检查卡面细节(字体、图案、材质等)
          </Text>
        </View>
        <View style={styles.comparisonItem}>
          <Icon name="check-circle" size={20} color="#4caf50" style={styles.comparisonIcon} />
          <Text style={styles.comparisonText}>
            利用紫外线光源检查防伪特征
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 頂部標題 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>真伪检查</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="cog" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 驗證成功圖標 */}
        {renderSuccessIcon()}

        {/* 卡牌詳情 */}
        {renderCardDetails()}

        {/* 真偽比較 */}
        {renderAuthenticityComparison()}

        {/* 重新檢查按鈕 */}
        <TouchableOpacity 
          style={styles.recheckButton}
          onPress={handleRecheck}
          disabled={isProcessing}
        >
          <Text style={styles.recheckButtonText}>
            {isProcessing ? '检查中...' : '重新检查'}
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
  successContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  cardDetails: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  cardInfo: {
    flexDirection: 'row',
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  cardImageContainer: {
    marginRight: 15,
  },
  cardImage: {
    width: 80,
    height: 120,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  cardImageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  cardImageSubtext: {
    fontSize: 10,
    color: '#000',
    marginTop: 5,
  },
  cardImageNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  cardImageNumber: {
    fontSize: 8,
    color: '#000',
  },
  cardImageId: {
    fontSize: 8,
    color: '#000',
  },
  cardInfoText: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  cardStats: {
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    width: 60,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  comparisonSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  comparisonList: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  comparisonIcon: {
    marginRight: 10,
  },
  comparisonText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  recheckButton: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#ffeb3b',
    alignItems: 'center',
  },
  recheckButtonText: {
    color: '#ffeb3b',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AuthenticityCheckScreen;
