import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { COLORS, FONTS, SIZES } from '../constants';
import backupService, { BACKUP_TYPES, SYNC_TYPES } from '../services/backupService';

const BackupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [backupList, setBackupList] = useState([]);
  const [stats, setStats] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupType, setSelectedBackupType] = useState(BACKUP_TYPES.INCREMENTAL);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    loadBackupList();
    loadBackupStats();
  }, []);

  const loadBackupList = async () => {
    try {
      const backups = await backupService.getBackupList(50, 0);
      setBackupList(backups);
    } catch (error) {
      console.error('Failed to load backup list:', error);
    }
  };

  const loadBackupStats = async () => {
    try {
      const backupStats = await backupService.getBackupStats();
      setStats(backupStats);
    } catch (error) {
      console.error('Failed to load backup stats:', error);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      let result;
      
      switch (selectedBackupType) {
        case BACKUP_TYPES.FULL:
          result = await backupService.createFullBackup();
          break;
        case BACKUP_TYPES.INCREMENTAL:
          result = await backupService.createIncrementalBackup();
          break;
        case BACKUP_TYPES.SELECTIVE:
          result = await backupService.createSelectiveBackup(['collection', 'settings']);
          break;
        default:
          result = await backupService.createIncrementalBackup();
      }

      if (result.success) {
        Alert.alert('成功', '備份已創建完成！');
        setShowBackupModal(false);
        loadBackupList();
        loadBackupStats();
      } else {
        Alert.alert('錯誤', result.error || '備份創建失敗');
      }
    } catch (error) {
      Alert.alert('錯誤', '備份創建失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) {
      Alert.alert('錯誤', '請選擇要恢復的備份');
      return;
    }

    Alert.alert(
      '確認恢復',
      '恢復備份將覆蓋當前數據，此操作無法撤銷。確定要繼續嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '恢復',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await backupService.restoreBackup(selectedBackup.id);
              
              if (result.success) {
                Alert.alert('成功', `已恢復 ${result.restoredItems} 個項目`);
                setShowRestoreModal(false);
                setSelectedBackup(null);
                loadBackupList();
                loadBackupStats();
              } else {
                Alert.alert('錯誤', result.error || '恢復失敗');
              }
            } catch (error) {
              Alert.alert('錯誤', '恢復失敗，請稍後再試');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSyncToCloud = async (syncType) => {
    setSyncInProgress(true);
    try {
      const result = await backupService.syncToCloud(syncType);
      
      if (result.success) {
        Alert.alert('成功', '同步完成！');
        loadBackupList();
        loadBackupStats();
      } else {
        Alert.alert('錯誤', result.error || '同步失敗');
      }
    } catch (error) {
      Alert.alert('錯誤', '同步失敗，請稍後再試');
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleDeleteBackup = (backup) => {
    Alert.alert(
      '確認刪除',
      '確定要刪除此備份嗎？此操作無法撤銷。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await backupService.deleteBackup(backup.id);
              if (success) {
                Alert.alert('成功', '備份已刪除');
                loadBackupList();
                loadBackupStats();
              } else {
                Alert.alert('錯誤', '刪除失敗');
              }
            } catch (error) {
              Alert.alert('錯誤', '刪除失敗，請稍後再試');
            }
          },
        },
      ]
    );
  };

  const getBackupTypeLabel = (type) => {
    switch (type) {
      case BACKUP_TYPES.FULL:
        return '完整備份';
      case BACKUP_TYPES.INCREMENTAL:
        return '增量備份';
      case BACKUP_TYPES.SELECTIVE:
        return '選擇性備份';
      case BACKUP_TYPES.CLOUD:
        return '雲端備份';
      default:
        return '未知類型';
    }
  };

  const getBackupTypeIcon = (type) => {
    switch (type) {
      case BACKUP_TYPES.FULL:
        return 'backup';
      case BACKUP_TYPES.INCREMENTAL:
        return 'update';
      case BACKUP_TYPES.SELECTIVE:
        return 'filter-list';
      case BACKUP_TYPES.CLOUD:
        return 'cloud';
      default:
        return 'backup';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.green;
      case 'in_progress':
        return COLORS.orange;
      case 'failed':
        return COLORS.red;
      case 'cancelled':
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderBackupItem = ({ item }) => (
    <View style={styles.backupItem}>
      <View style={styles.backupHeader}>
        <View style={styles.backupType}>
          <Icon
            name={getBackupTypeIcon(item.type)}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.backupTypeText}>
            {getBackupTypeLabel(item.type)}
          </Text>
        </View>
        <View style={styles.backupStatus}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {item.status === 'completed' ? '完成' :
             item.status === 'in_progress' ? '進行中' :
             item.status === 'failed' ? '失敗' :
             item.status === 'cancelled' ? '已取消' : '未知'}
          </Text>
        </View>
      </View>
      
      <View style={styles.backupInfo}>
        <Text style={styles.backupTime}>
          {formatTime(item.timestamp)}
        </Text>
        <Text style={styles.backupSize}>
          {formatFileSize(item.size || 0)} • {item.itemCount || 0} 個項目
        </Text>
      </View>
      
      <View style={styles.backupActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedBackup(item);
            setShowRestoreModal(true);
          }}
          disabled={item.status !== 'completed'}
        >
          <Icon name="restore" size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>恢復</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBackup(item)}
        >
          <Icon name="delete" size={16} color={COLORS.red} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>刪除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>備份統計</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.total || 0}</Text>
          <Text style={styles.statLabel}>總備份</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {formatFileSize(stats?.totalSize || 0)}
          </Text>
          <Text style={styles.statLabel}>總大小</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {stats?.lastBackup ? formatTime(stats.lastBackup).split(' ')[0] : '無'}
          </Text>
          <Text style={styles.statLabel}>最後備份</Text>
        </View>
      </View>
    </View>
  );

  const renderBackupModal = () => (
    <Modal
      visible={showBackupModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowBackupModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>創建備份</Text>
            <TouchableOpacity onPress={() => setShowBackupModal(false)}>
              <Icon name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>備份類型</Text>
              <View style={styles.typeSelector}>
                {Object.values(BACKUP_TYPES).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      selectedBackupType === type && styles.typeOptionActive,
                    ]}
                    onPress={() => setSelectedBackupType(type)}
                  >
                    <Icon
                      name={getBackupTypeIcon(type)}
                      size={20}
                      color={selectedBackupType === type ? COLORS.white : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        selectedBackupType === type && styles.typeOptionTextActive,
                      ]}
                    >
                      {getBackupTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.backupInfo}>
              <Text style={styles.backupDescription}>
                {selectedBackupType === BACKUP_TYPES.FULL && '完整備份將保存所有數據，包括收藏、設定、歷史記錄等。'}
                {selectedBackupType === BACKUP_TYPES.INCREMENTAL && '增量備份只保存自上次備份以來變更的數據，節省空間和時間。'}
                {selectedBackupType === BACKUP_TYPES.SELECTIVE && '選擇性備份允許您選擇要備份的特定數據類型。'}
                {selectedBackupType === BACKUP_TYPES.CLOUD && '雲端備份將數據同步到雲端存儲，提供額外的安全保障。'}
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowBackupModal(false)}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>創建備份</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRestoreModal = () => (
    <Modal
      visible={showRestoreModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRestoreModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>恢復備份</Text>
            <TouchableOpacity onPress={() => setShowRestoreModal(false)}>
              <Icon name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {selectedBackup && (
              <View style={styles.restoreInfo}>
                <Text style={styles.restoreTitle}>
                  {getBackupTypeLabel(selectedBackup.type)}
                </Text>
                <Text style={styles.restoreDetails}>
                  創建時間: {formatTime(selectedBackup.timestamp)}
                </Text>
                <Text style={styles.restoreDetails}>
                  大小: {formatFileSize(selectedBackup.size || 0)}
                </Text>
                <Text style={styles.restoreDetails}>
                  項目數: {selectedBackup.itemCount || 0}
                </Text>
              </View>
            )}

            <View style={styles.warningBox}>
              <Icon name="warning" size={24} color={COLORS.orange} />
              <Text style={styles.warningText}>
                警告：恢復備份將覆蓋當前數據，此操作無法撤銷。請確保您已備份重要數據。
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRestoreModal(false)}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, styles.restoreButton]}
              onPress={handleRestoreBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>恢復備份</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>備份管理</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {stats && renderStatsCard()}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowBackupModal(true)}
          >
            <Icon name="backup" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>創建備份</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSyncToCloud(SYNC_TYPES.BIDIRECTIONAL)}
            disabled={syncInProgress}
          >
            {syncInProgress ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Icon name="cloud-sync" size={24} color={COLORS.white} />
            )}
            <Text style={styles.actionButtonText}>
              {syncInProgress ? '同步中...' : '雲端同步'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.backupListContainer}>
          <Text style={styles.sectionTitle}>
            備份列表 ({backupList.length})
          </Text>
          
          {backupList.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="backup" size={64} color={COLORS.gray} />
              <Text style={styles.emptyText}>暫無備份記錄</Text>
              <Text style={styles.emptySubtext}>
                創建您的第一個備份來保護數據
              </Text>
            </View>
          ) : (
            <FlatList
              data={backupList}
              renderItem={renderBackupItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {renderBackupModal()}
      {renderRestoreModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
  },
  statsCard: {
    margin: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  statLabel: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base,
  },
  actionButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: SIZES.base,
  },
  backupListContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  backupItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  backupType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backupTypeText: {
    ...FONTS.body4,
    color: COLORS.black,
    marginLeft: SIZES.base,
    fontWeight: '600',
  },
  backupStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.base,
  },
  statusText: {
    ...FONTS.body5,
    color: COLORS.gray,
  },
  backupInfo: {
    marginBottom: SIZES.base,
  },
  backupTime: {
    ...FONTS.body4,
    color: COLORS.black,
    marginBottom: 2,
  },
  backupSize: {
    ...FONTS.body5,
    color: COLORS.gray,
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    marginLeft: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
  },
  actionButtonText: {
    ...FONTS.body5,
    color: COLORS.primary,
    marginLeft: SIZES.base,
  },
  deleteButton: {
    backgroundColor: COLORS.lightRed,
  },
  deleteButtonText: {
    color: COLORS.red,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.gray,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
  },
  emptySubtext: {
    ...FONTS.body4,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  modalBody: {
    padding: SIZES.padding,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  formSection: {
    marginBottom: SIZES.padding,
  },
  formLabel: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: SIZES.base,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    marginRight: SIZES.base,
    marginBottom: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
  },
  typeOptionActive: {
    backgroundColor: COLORS.primary,
  },
  typeOptionText: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginLeft: SIZES.base,
  },
  typeOptionTextActive: {
    color: COLORS.white,
  },
  backupInfo: {
    marginTop: SIZES.padding,
  },
  backupDescription: {
    ...FONTS.body4,
    color: COLORS.gray,
    lineHeight: 20,
  },
  restoreInfo: {
    marginBottom: SIZES.padding,
  },
  restoreTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  restoreDetails: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginBottom: 2,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightOrange,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'flex-start',
  },
  warningText: {
    ...FONTS.body4,
    color: COLORS.orange,
    marginLeft: SIZES.base,
    flex: 1,
    lineHeight: 20,
  },
  cancelButton: {
    flex: 1,
    padding: SIZES.padding,
    marginRight: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...FONTS.body3,
    color: COLORS.gray,
  },
  submitButton: {
    flex: 1,
    padding: SIZES.padding,
    marginLeft: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  restoreButton: {
    backgroundColor: COLORS.orange,
  },
  submitButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
  },
});

export default BackupScreen;
