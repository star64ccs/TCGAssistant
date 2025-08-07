import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  RefreshControl,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY } from '../constants';
import multiSourceAutoUpdateService, { DATA_SOURCE_TYPES } from '../services/multiSourceAutoUpdateService';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const MultiSourceAutoUpdateSettingsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  
  // 狀態管理
  const [isEnabled, setIsEnabled] = useState(false);
  const [updateTime, setUpdateTime] = useState('02:00');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [dataSourceStatus, setDataSourceStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  // 載入設定
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      const [
        enabled,
        time,
        lastUpdateTime,
        history,
        status
      ] = await Promise.all([
        multiSourceAutoUpdateService.isAutoUpdateEnabled(),
        multiSourceAutoUpdateService.getUpdateTime(),
        multiSourceAutoUpdateService.getLastUpdateTime(),
        multiSourceAutoUpdateService.getUpdateHistory(20),
        multiSourceAutoUpdateService.getDataSourceStatus(),
      ]);

      setIsEnabled(enabled);
      setUpdateTime(time);
      setLastUpdate(lastUpdateTime);
      setUpdateHistory(history);
      setDataSourceStatus(status);
      
    } catch (error) {
      console.error('載入設定失敗:', error);
      Alert.alert(t('common.error'), t('auto_update.load_settings_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 切換自動更新
  const handleToggleAutoUpdate = async (value) => {
    try {
      setIsUpdating(true);
      
      const result = value 
        ? await multiSourceAutoUpdateService.enableAutoUpdate(updateTime)
        : await multiSourceAutoUpdateService.disableAutoUpdate();

      if (result.success) {
        setIsEnabled(value);
        Alert.alert(
          t('common.success'),
          value ? t('auto_update.enabled_success') : t('auto_update.disabled_success')
        );
      } else {
        Alert.alert(t('common.error'), result.error || t('auto_update.toggle_failed'));
      }
    } catch (error) {
      console.error('切換自動更新失敗:', error);
      Alert.alert(t('common.error'), t('auto_update.toggle_failed'));
    } finally {
      setIsUpdating(false);
    }
  };

  // 設定更新時間
  const handleUpdateTimeChange = async (time) => {
    try {
      setIsUpdating(true);
      
      const result = await multiSourceAutoUpdateService.setUpdateTime(time);
      
      if (result.success) {
        setUpdateTime(time);
        Alert.alert(t('common.success'), t('auto_update.time_updated'));
      } else {
        Alert.alert(t('common.error'), result.error || t('auto_update.time_update_failed'));
      }
    } catch (error) {
      console.error('設定更新時間失敗:', error);
      Alert.alert(t('common.error'), t('auto_update.time_update_failed'));
    } finally {
      setIsUpdating(false);
    }
  };

  // 手動觸發更新
  const handleManualUpdate = async (sourceKey = null) => {
    try {
      setIsUpdating(true);
      
      const result = await multiSourceAutoUpdateService.triggerManualUpdate(sourceKey ? [sourceKey] : null);
      
      if (result.success) {
        Alert.alert(t('common.success'), t('auto_update.manual_update_success'));
        await loadSettings(); // 重新載入設定以更新狀態
      } else {
        Alert.alert(t('common.error'), result.error || t('auto_update.manual_update_failed'));
      }
    } catch (error) {
      console.error('手動更新失敗:', error);
      Alert.alert(t('common.error'), t('auto_update.manual_update_failed'));
    } finally {
      setIsUpdating(false);
    }
  };

  // 切換資料來源
  const handleToggleDataSource = async (sourceKey, enabled) => {
    try {
      const result = await multiSourceAutoUpdateService.toggleDataSource(sourceKey, enabled);
      
      if (result.success) {
        await loadSettings(); // 重新載入設定
        Alert.alert(
          t('common.success'),
          `${t('auto_update.source')} ${enabled ? t('auto_update.enabled') : t('auto_update.disabled')}`
        );
      } else {
        Alert.alert(t('common.error'), result.error || t('auto_update.source_toggle_failed'));
      }
    } catch (error) {
      console.error('切換資料來源失敗:', error);
      Alert.alert(t('common.error'), t('auto_update.source_toggle_failed'));
    }
  };

  // 設定資料來源更新間隔
  const handleSetUpdateInterval = async (sourceKey, interval) => {
    try {
      const result = await multiSourceAutoUpdateService.setSourceUpdateInterval(sourceKey, interval);
      
      if (result.success) {
        await loadSettings(); // 重新載入設定
        Alert.alert(t('common.success'), t('auto_update.interval_updated'));
      } else {
        Alert.alert(t('common.error'), result.error || t('auto_update.interval_update_failed'));
      }
    } catch (error) {
      console.error('設定更新間隔失敗:', error);
      Alert.alert(t('common.error'), t('auto_update.interval_update_failed'));
    }
  };

  // 重新整理
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  // 格式化日期時間
  const formatDateTime = (dateString) => {
    if (!dateString) return t('auto_update.never');
    
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 獲取狀態顏色
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return COLORS.SUCCESS;
      case 'error':
        return COLORS.ERROR;
      case 'running':
        return COLORS.WARNING;
      default:
        return COLORS.GRAY_LIGHT;
    }
  };

  // 獲取狀態文字
  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return t('auto_update.status_success');
      case 'error':
        return t('auto_update.status_error');
      case 'running':
        return t('auto_update.status_running');
      case 'idle':
        return t('auto_update.status_idle');
      default:
        return t('auto_update.status_unknown');
    }
  };

  // 獲取資料來源類型名稱
  const getSourceTypeName = (type) => {
    switch (type) {
      case DATA_SOURCE_TYPES.GRADING:
        return t('auto_update.type_grading');
      case DATA_SOURCE_TYPES.PRICING:
        return t('auto_update.type_pricing');
      case DATA_SOURCE_TYPES.CARD_DATA:
        return t('auto_update.type_card_data');
      case DATA_SOURCE_TYPES.MARKET_DATA:
        return t('auto_update.type_market_data');
      default:
        return type;
    }
  };

  // 渲染資料來源項目
  const renderDataSourceItem = ({ item }) => {
    const { type, key, name, enabled, status, lastUpdate, updateInterval, priority } = item;
    
    return (
      <View style={[styles.sourceItem, { backgroundColor: colors.card }]}>
        <View style={styles.sourceHeader}>
          <View style={styles.sourceInfo}>
            <Text style={[styles.sourceName, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.sourceType, { color: colors.textSecondary }]}>
              {getSourceTypeName(type)}
            </Text>
          </View>
          <View style={styles.sourceControls}>
            <Switch
              value={enabled}
              onValueChange={(value) => handleToggleDataSource(key, value)}
              trackColor={{ false: colors.border, true: COLORS.PRIMARY }}
              thumbColor={enabled ? COLORS.WHITE : colors.textSecondary}
            />
          </View>
        </View>
        
        <View style={styles.sourceDetails}>
          <View style={styles.sourceDetail}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('auto_update.status')}:
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {getStatusText(status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.sourceDetail}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('auto_update.last_update')}:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDateTime(lastUpdate)}
            </Text>
          </View>
          
          <View style={styles.sourceDetail}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('auto_update.interval')}:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {updateInterval}h
            </Text>
          </View>
          
          <View style={styles.sourceDetail}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('auto_update.priority')}:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {priority}
            </Text>
          </View>
        </View>
        
        <View style={styles.sourceActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.updateButton]}
            onPress={() => handleManualUpdate(key)}
            disabled={isUpdating}
          >
            <MaterialCommunityIcons name="refresh" size={16} color={COLORS.WHITE} />
            <Text style={styles.actionButtonText}>{t('auto_update.update_now')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.settingsButton]}
            onPress={() => {
              setSelectedSource(item);
              setShowSourceModal(true);
            }}
          >
            <MaterialCommunityIcons name="cog" size={16} color={COLORS.PRIMARY} />
            <Text style={[styles.actionButtonText, { color: COLORS.PRIMARY }]}>
              {t('auto_update.settings')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 渲染更新歷史項目
  const renderHistoryItem = ({ item }) => {
    const { startTime, endTime, summary, error } = item;
    
    return (
      <View style={[styles.historyItem, { backgroundColor: colors.card }]}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTime, { color: colors.text }]}>
            {formatDateTime(startTime)}
          </Text>
          {error && (
            <View style={styles.errorBadge}>
              <Text style={styles.errorBadgeText}>{t('auto_update.error')}</Text>
            </View>
          )}
        </View>
        
        {error ? (
          <Text style={[styles.historyError, { color: COLORS.ERROR }]}>
            {error.error}
          </Text>
        ) : (
          <View style={styles.historySummary}>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {t('auto_update.total')}: {summary.total} | 
              {t('auto_update.successful')}: {summary.successful} | 
              {t('auto_update.failed')}: {summary.failed} | 
              {t('auto_update.skipped')}: {summary.skipped}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('auto_update.loading')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 主要設定區域 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('auto_update.general_settings')}
        </Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('auto_update.enable_auto_update')}
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {t('auto_update.enable_description')}
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={handleToggleAutoUpdate}
            disabled={isUpdating}
            trackColor={{ false: colors.border, true: COLORS.PRIMARY }}
            thumbColor={isEnabled ? COLORS.WHITE : colors.textSecondary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('auto_update.update_time')}
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {t('auto_update.update_time_description')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: colors.border }]}
            onPress={() => setShowTimePicker(true)}
            disabled={isUpdating}
          >
            <Text style={[styles.timeButtonText, { color: colors.text }]}>
              {updateTime}
            </Text>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {lastUpdate && (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('auto_update.last_update')}
              </Text>
            </View>
            <Text style={[styles.lastUpdateText, { color: colors.textSecondary }]}>
              {formatDateTime(lastUpdate)}
            </Text>
          </View>
        )}
      </View>

      {/* 資料來源管理 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('auto_update.data_sources')}
          </Text>
          <TouchableOpacity
            style={styles.manualUpdateButton}
            onPress={() => handleManualUpdate()}
            disabled={isUpdating}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={COLORS.WHITE} />
            <Text style={styles.manualUpdateText}>{t('auto_update.update_all')}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={Object.entries(dataSourceStatus).flatMap(([type, sources]) =>
            Object.entries(sources).map(([key, source]) => ({
              type,
              key: `${type}.${key}`,
              ...source,
            }))
          )}
          renderItem={renderDataSourceItem}
          keyExtractor={(item) => item.key}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* 更新歷史 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('auto_update.update_history')}
          </Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowHistoryModal(true)}
          >
            <Text style={[styles.viewAllText, { color: COLORS.PRIMARY }]}>
              {t('auto_update.view_all')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={updateHistory.slice(0, 5)}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* 時間選擇器 */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${updateTime}:00`)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              const timeString = selectedTime.toTimeString().slice(0, 5);
              handleUpdateTimeChange(timeString);
            }
          }}
        />
      )}

      {/* 歷史記錄模態框 */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('auto_update.update_history')}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowHistoryModal(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={updateHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* 資料來源設定模態框 */}
      <Modal
        visible={showSourceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedSource?.name} {t('auto_update.settings')}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSourceModal(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedSource && (
            <View style={[styles.sourceSettings, { backgroundColor: colors.card }]}>
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t('auto_update.update_interval')}
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {t('auto_update.interval_description')}
                </Text>
              </View>
              
              <View style={styles.intervalOptions}>
                {[1, 6, 12, 24, 168].map((interval) => (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.intervalButton,
                      { backgroundColor: colors.border },
                      selectedSource.updateInterval === interval && { backgroundColor: COLORS.PRIMARY }
                    ]}
                    onPress={() => {
                      handleSetUpdateInterval(selectedSource.key, interval);
                      setShowSourceModal(false);
                    }}
                  >
                    <Text style={[
                      styles.intervalButtonText,
                      { color: colors.text },
                      selectedSource.updateInterval === interval && { color: COLORS.WHITE }
                    ]}>
                      {interval}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  lastUpdateText: {
    fontSize: 14,
  },
  manualUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manualUpdateText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewAllButton: {
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sourceItem: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceType: {
    fontSize: 12,
  },
  sourceControls: {
    marginLeft: 16,
  },
  sourceDetails: {
    marginBottom: 12,
  },
  sourceDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  sourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  updateButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  settingsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: COLORS.WHITE,
  },
  historyItem: {
    marginBottom: 8,
    borderRadius: 6,
    padding: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorBadge: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  errorBadgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '600',
  },
  historyError: {
    fontSize: 12,
  },
  historySummary: {
    marginTop: 4,
  },
  summaryText: {
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalList: {
    flex: 1,
    padding: 16,
  },
  sourceSettings: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  intervalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MultiSourceAutoUpdateSettingsScreen;
