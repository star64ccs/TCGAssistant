/**
 * 評級數據查詢畫面
 * 顯示PSA、CGC和ARS的評級數量分佈
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TEXT_STYLES } from '../constants';
import { getGradingDataCrawlerService } from '../services/gradingDataCrawlerService';

const { width, height } = Dimensions.get('window');

const GradingDataScreen = () => {
  const { t } = useTranslation();
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardSeries, setCardSeries] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gradingData, setGradingData] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState(['psa', 'cgc', 'ars']);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const gradingCompanies = {
    psa: { name: 'PSA', fullName: 'Professional Sports Authenticator', color: '#FF6B35' },
    cgc: { name: 'CGC', fullName: 'Certified Guaranty Company', color: '#4ECDC4' },
    ars: { name: 'ARS', fullName: 'Authentic Rarities & Services', color: '#45B7D1' },
  };

  useEffect(() => {
    // 初始化服務
    initializeService();
  }, []);

  const initializeService = async () => {
    try {      const service = getGradingDataCrawlerService();      await service.initialize();
    } catch (error) {}
  };

  const handleSearch = async () => {
    // 檢查是否至少輸入了一個查詢條件
    if (!cardName.trim() && !cardNumber.trim() && !cardSeries.trim()) {      Alert.alert(t('common.error'), '請至少輸入卡牌名稱、編號或系列中的一項');      return;
    }    setIsLoading(true);
    setProgress(0);
    setProgressMessage('🔍 檢查robots.txt規則...');
    setGradingData(null);    try {      const service = getGradingDataCrawlerService();      const result = await service.getCardGradingDistribution(        cardName.trim(),        cardSeries.trim(),        {          companies: selectedCompanies,          useCache: true,          forceRefresh: false,          cardNumber: cardNumber.trim(), // 新增卡牌編號參數          onProgress: (progressData) => {            setProgress(progressData.progress);            setProgressMessage(`🔍 從 ${progressData.company} 獲取數據...`);          },        },      );      setGradingData(result);      setProgress(100);      setProgressMessage('✅ 數據獲取完成');      // 顯示統計摘要      const totalGraded = result.overallStats.totalGraded;      if (totalGraded > 0) {        Alert.alert(          '查詢完成',          `找到 ${totalGraded} 張評級卡牌\n平均等級: ${result.overallStats.averageGrade}\n最高等級: ${result.overallStats.highestGrade}`,          [{ text: '查看詳細結果', style: 'default' }],        );      } else {        Alert.alert('查詢完成', '未找到相關的評級數據');      }
    } catch (error) {      Alert.alert(t('common.error'), `獲取評級數據失敗: ${error.message}`);
    } finally {      setIsLoading(false);      setProgress(0);      setProgressMessage('');
    }
  };

  const toggleCompany = (company) => {
    setSelectedCompanies(prev => {      if (prev.includes(company)) {        return prev.filter(c => c !== company);      }      return [...prev, company];
    });
  };

  const renderCompanySelector = () => (
    <View style={styles.companySelector}>      <Text style={styles.sectionTitle}>選擇評級公司</Text>      <View style={styles.companyButtons}>        {Object.entries(gradingCompanies).map(([key, company]) => (          <TouchableOpacity            key={key}            style={[              styles.companyButton,              {                backgroundColor: selectedCompanies.includes(key) ? company.color : COLORS.lightGray,                borderColor: company.color,              },            ]}            onPress={() => toggleCompany(key)}          >            <Text              style={[                styles.companyButtonText,                {                  color: selectedCompanies.includes(key) ? COLORS.white : COLORS.darkGray,                },              ]}            >              {company.name}            </Text>          </TouchableOpacity>        ))}      </View>
    </View>
  );

  const renderSearchForm = () => (
    <View style={styles.searchForm}>      <Text style={styles.sectionTitle}>查詢評級數據</Text>      <View style={styles.inputContainer}>        <Icon name="card-text" size={20} color={COLORS.primary} style={styles.inputIcon} />        <TextInput          style={styles.input}          placeholder="輸入卡牌名稱 (選填，例如: Charizard)"          value={cardName}          onChangeText={setCardName}          autoCapitalize="words"        />      </View>      <View style={styles.inputContainer}>        <Icon name="numeric" size={20} color={COLORS.primary} style={styles.inputIcon} />        <TextInput          style={styles.input}          placeholder="輸入卡牌編號 (選填，例如: 4/102)"          value={cardNumber}          onChangeText={setCardNumber}          autoCapitalize="none"        />      </View>      <View style={styles.inputContainer}>        <Icon name="package-variant" size={20} color={COLORS.primary} style={styles.inputIcon} />        <TextInput          style={styles.input}          placeholder="輸入卡牌系列 (選填，例如: Base Set)"          value={cardSeries}          onChangeText={setCardSeries}          autoCapitalize="words"        />      </View>      {renderCompanySelector()}      <TouchableOpacity        style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}        onPress={handleSearch}        disabled={isLoading}      >        {isLoading ? (          <ActivityIndicator color={COLORS.white} size="small" />        ) : (          <Icon name="magnify" size={20} color={COLORS.white} />        )}        <Text style={styles.searchButtonText}>          {isLoading ? '查詢中...' : '查詢評級數據'}        </Text>      </TouchableOpacity>
    </View>
  );

  const renderProgress = () => {
    if (!isLoading) {
      return null;
    }    return (      <View style={styles.progressContainer}>        <Text style={styles.progressMessage}>{progressMessage}</Text>        <View style={styles.progressBar}>          <View style={[styles.progressFill, { width: `${progress}%` }]} />        </View>        <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>      </View>
    );
  };

  const renderGradingData = () => {
    if (!gradingData) {
      return null;
    }    return (      <View style={styles.resultsContainer}>        <Text style={styles.sectionTitle}>評級數據結果</Text>        {/* 總體統計 */}        <View style={styles.overallStats}>          <Text style={styles.overallStatsTitle}>總體統計</Text>          <View style={styles.statsGrid}>            <View style={styles.statItem}>              <Text style={styles.statValue}>{gradingData.overallStats.totalGraded}</Text>              <Text style={styles.statLabel}>總評級數量</Text>            </View>            <View style={styles.statItem}>              <Text style={styles.statValue}>{gradingData.overallStats.averageGrade}</Text>              <Text style={styles.statLabel}>平均等級</Text>            </View>            <View style={styles.statItem}>              <Text style={styles.statValue}>{gradingData.overallStats.highestGrade}</Text>              <Text style={styles.statLabel}>最高等級</Text>            </View>            <View style={styles.statItem}>              <Text style={styles.statValue}>{gradingData.overallStats.lowestGrade}</Text>              <Text style={styles.statLabel}>最低等級</Text>            </View>          </View>        </View>        {/* 各公司詳細數據 */}        {Object.entries(gradingData.companies).map(([company, data]) => {          if (!data.success) {
            return null;
          }          const companyInfo = gradingCompanies[company];          return (            <View key={company} style={styles.companyData}>              <View style={[styles.companyHeader, { backgroundColor: companyInfo.color }]}>                <Text style={styles.companyName}>{companyInfo.fullName}</Text>                <Text style={styles.companyStats}>                  {data.totalGraded} 張卡牌 | 平均 {data.averageGrade}                </Text>              </View>              {/* 等級分佈 */}              <View style={styles.gradeDistribution}>                <Text style={styles.gradeDistributionTitle}>等級分佈</Text>                <View style={styles.gradeGrid}>                  {Object.entries(data.gradeDistribution)                    .filter(([grade, count]) => count > 0)                    .sort(([a], [b]) => parseFloat(b) - parseFloat(a))                    .map(([grade, count]) => (                      <View key={grade} style={styles.gradeItem}>                        <Text style={styles.gradeLabel}>Grade {grade}</Text>                        <Text style={styles.gradeCount}>{count}</Text>                        <Text style={styles.gradePercentage}>                          {((count / data.totalGraded) * 100).toFixed(1)}%                        </Text>                      </View>                    ))}                </View>              </View>            </View>          );        })}        {/* 更新時間 */}        <View style={styles.updateInfo}>          <Icon name="clock-outline" size={16} color={COLORS.darkGray} />          <Text style={styles.updateText}>            最後更新: {new Date(gradingData.lastUpdated).toLocaleString('zh-TW')}          </Text>        </View>      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>      <View style={styles.header}>        <Icon name="certificate" size={24} color={COLORS.primary} />        <Text style={styles.headerTitle}>評級數據查詢</Text>      </View>      {renderSearchForm()}      {renderProgress()}      {renderGradingData()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  companyButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  companyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  companyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  companyData: {
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  companyHeader: {
    padding: 15,
  },
  companyName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companySelector: {
    marginBottom: 20,
  },
  companyStats: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  gradeCount: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gradeDistribution: {
    backgroundColor: COLORS.white,
    padding: 15,
  },
  gradeDistributionTitle: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeItem: {
    alignItems: 'center',
    padding: 8,
    width: '33.33%',
  },
  gradeLabel: {
    color: COLORS.darkGray,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  gradePercentage: {
    color: COLORS.darkGray,
    fontSize: 10,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginLeft: 10,
  },
  input: {
    color: COLORS.darkGray,
    flex: 1,
    fontSize: 16,
    height: 50,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  overallStats: {
    marginBottom: 20,
  },
  overallStatsTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  progressBar: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    height: 8,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    margin: 10,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressFill: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    height: '100%',
  },
  progressMessage: {
    color: COLORS.darkGray,
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressText: {
    color: COLORS.darkGray,
    fontSize: 14,
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    margin: 10,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 15,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchForm: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    margin: 10,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    width: '48%',
  },
  statLabel: {
    color: COLORS.darkGray,
    fontSize: 12,
    textAlign: 'center',
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  updateInfo: {
    alignItems: 'center',
    borderTopColor: COLORS.lightGray,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 15,
  },
  updateText: {
    color: COLORS.darkGray,
    fontSize: 12,
    marginLeft: 5,
  },
});

export default GradingDataScreen;
