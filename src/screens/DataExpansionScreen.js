import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';
import dataLoaderService from '../services/dataLoaderService';
import databaseService from '../services/databaseService';

const DataExpansionScreen = () => {
  const [loadingStatus, setLoadingStatus] = useState({
    isLoading: false,
    progress: 0,
    processedCards: 0,
    totalCards: 0
  });
  const [databaseStats, setDatabaseStats] = useState(null);
  const [integrityData, setIntegrityData] = useState(null);

  // 載入資料庫統計
  useEffect(() => {
    loadDatabaseStats();
    loadIntegrityData();
  }, []);

  // 載入資料庫統計
  const loadDatabaseStats = async () => {
    try {
      const stats = await databaseService.getDatabaseStats();
      setDatabaseStats(stats);
    } catch (error) {
      console.error('載入資料庫統計失敗:', error);
    }
  };

  // 載入完整性資料
  const loadIntegrityData = async () => {
    try {
      const integrity = await dataLoaderService.checkDataIntegrity();
      setIntegrityData(integrity);
    } catch (error) {
      console.error('載入完整性資料失敗:', error);
    }
  };

  // 開始載入所有卡牌資料
  const handleLoadAllCards = async () => {
    Alert.alert(
      '確認載入',
      '這將載入所有卡牌資料並生成特徵，可能需要較長時間。確定要繼續嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            try {
              setLoadingStatus({ ...loadingStatus, isLoading: true });
              
              // 設定進度回調
              dataLoaderService.setProgressCallback((progress) => {
                setLoadingStatus(prev => ({
                  ...prev,
                  progress: progress.progress,
                  processedCards: progress.processed,
                  totalCards: progress.total
                }));
              });

              await dataLoaderService.loadAllCardData();
              
              Alert.alert('成功', '所有卡牌資料載入完成！');
              
              // 重新載入統計資料
              await loadDatabaseStats();
              await loadIntegrityData();
            } catch (error) {
              console.error('載入卡牌資料失敗:', error);
              Alert.alert('錯誤', '載入卡牌資料失敗: ' + error.message);
            } finally {
              setLoadingStatus(prev => ({ ...prev, isLoading: false }));
            }
          }
        }
      ]
    );
  };

  // 生成特徵
  const handleGenerateFeatures = async () => {
    Alert.alert(
      '生成特徵',
      '為現有卡牌生成圖片特徵？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            try {
              setLoadingStatus({ ...loadingStatus, isLoading: true });
              
              dataLoaderService.setProgressCallback((progress) => {
                setLoadingStatus(prev => ({
                  ...prev,
                  progress: progress.progress,
                  processedCards: progress.processed,
                  totalCards: progress.total
                }));
              });

              await dataLoaderService.generateFeaturesForExistingCards();
              
              Alert.alert('成功', '特徵生成完成！');
              
              await loadDatabaseStats();
              await loadIntegrityData();
            } catch (error) {
              console.error('生成特徵失敗:', error);
              Alert.alert('錯誤', '生成特徵失敗: ' + error.message);
            } finally {
              setLoadingStatus(prev => ({ ...prev, isLoading: false }));
            }
          }
        }
      ]
    );
  };

  // 清理重複資料
  const handleCleanupDuplicates = async () => {
    Alert.alert(
      '清理重複資料',
      '確定要清理重複的卡牌和特徵資料嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            try {
              const result = await dataLoaderService.cleanupDuplicateData();
              Alert.alert('成功', result.message);
              
              await loadDatabaseStats();
              await loadIntegrityData();
            } catch (error) {
              console.error('清理重複資料失敗:', error);
              Alert.alert('錯誤', '清理重複資料失敗: ' + error.message);
            }
          }
        }
      ]
    );
  };

  // 重建索引
  const handleRebuildIndexes = async () => {
    try {
      await dataLoaderService.rebuildIndexes();
      Alert.alert('成功', '索引重建完成！');
    } catch (error) {
      console.error('重建索引失敗:', error);
      Alert.alert('錯誤', '重建索引失敗: ' + error.message);
    }
  };

  // 停止載入
  const handleStopLoading = () => {
    dataLoaderService.stopLoading();
    setLoadingStatus(prev => ({ ...prev, isLoading: false }));
    Alert.alert('已停止', '資料載入已停止');
  };

  // 渲染進度條
  const renderProgressBar = () => {
    if (!loadingStatus.isLoading) return null;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          載入進度: {loadingStatus.processedCards}/{loadingStatus.totalCards} 
          ({Math.round(loadingStatus.progress)}%)
        </Text>
        {Platform.OS === 'android' ? (
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={loadingStatus.progress / 100}
            color={COLORS.PRIMARY}
          />
        ) : (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${loadingStatus.progress}%` }
              ]} 
            />
          </View>
        )}
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={handleStopLoading}
        >
          <Text style={styles.stopButtonText}>停止載入</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染統計卡片
  const renderStatCard = (title, value, subtitle = '') => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>資料擴充管理</Text>
        <Text style={styles.subtitle}>管理卡牌資料庫和圖片特徵</Text>
      </View>

      {/* 進度顯示 */}
      {renderProgressBar()}

      {/* 資料庫統計 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>資料庫統計</Text>
        {databaseStats ? (
          <View style={styles.statsGrid}>
            {renderStatCard('總卡牌數', databaseStats.totalCards)}
            {renderStatCard('有特徵卡牌', databaseStats.cardsWithFeatures)}
            {renderStatCard('特徵覆蓋率', integrityData?.featureCoverage || '0%')}
          </View>
        ) : (
          <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        )}
      </View>

      {/* 遊戲類型分布 */}
      {databaseStats?.gameTypeBreakdown && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>遊戲類型分布</Text>
          <View style={styles.gameTypeList}>
            {Object.entries(databaseStats.gameTypeBreakdown).map(([gameType, count]) => (
              <View key={gameType} style={styles.gameTypeItem}>
                <Text style={styles.gameTypeName}>{gameType}</Text>
                <Text style={styles.gameTypeCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 操作按鈕 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>資料操作</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleLoadAllCards}
          disabled={loadingStatus.isLoading}
        >
          <Text style={styles.buttonText}>載入所有卡牌資料</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleGenerateFeatures}
          disabled={loadingStatus.isLoading}
        >
          <Text style={styles.buttonText}>生成圖片特徵</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.warningButton]}
          onPress={handleCleanupDuplicates}
          disabled={loadingStatus.isLoading}
        >
          <Text style={styles.buttonText}>清理重複資料</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.infoButton]}
          onPress={handleRebuildIndexes}
          disabled={loadingStatus.isLoading}
        >
          <Text style={styles.buttonText}>重建索引</Text>
        </TouchableOpacity>
      </View>

      {/* 注意事項 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>注意事項</Text>
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            • 載入所有卡牌資料可能需要較長時間，請確保設備有足夠的儲存空間
          </Text>
          <Text style={styles.noticeText}>
            • 圖片特徵生成需要網路連接來下載卡牌圖片
          </Text>
          <Text style={styles.noticeText}>
            • 建議在WiFi環境下進行大規模資料載入
          </Text>
          <Text style={styles.noticeText}>
            • 可以隨時停止載入過程，已載入的資料會被保留
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
  },
  title: {
    ...TEXT_STYLES.H1,
    color: COLORS.WHITE,
    marginBottom: 5,
  },
  subtitle: {
    ...TEXT_STYLES.BODY,
    color: COLORS.WHITE,
    opacity: 0.8,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: COLORS.WHITE,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressText: {
    ...TEXT_STYLES.BODY,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  stopButtonText: {
    ...TEXT_STYLES.BUTTON,
    color: COLORS.WHITE,
  },
  section: {
    margin: 10,
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...TEXT_STYLES.H2,
    marginBottom: 15,
    color: COLORS.PRIMARY,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.LIGHT_BACKGROUND,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statTitle: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 5,
  },
  statValue: {
    ...TEXT_STYLES.H3,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  statSubtitle: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  gameTypeList: {
    marginTop: 10,
  },
  gameTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  gameTypeName: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_PRIMARY,
    textTransform: 'capitalize',
  },
  gameTypeCount: {
    ...TEXT_STYLES.BODY,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  warningButton: {
    backgroundColor: COLORS.WARNING,
  },
  infoButton: {
    backgroundColor: COLORS.INFO,
  },
  buttonText: {
    ...TEXT_STYLES.BUTTON,
    color: COLORS.WHITE,
  },
  noticeContainer: {
    backgroundColor: COLORS.LIGHT_BACKGROUND,
    padding: 15,
    borderRadius: 8,
  },
  noticeText: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default DataExpansionScreen;
