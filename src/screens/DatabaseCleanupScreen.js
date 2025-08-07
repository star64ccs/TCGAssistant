import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux actions
import {
  cleanupAllUnrealContent,
  getDatabaseStats,
  checkCleanupStatus,
  clearError,
  selectIsCleaning,
  selectCleanupProgress,
  selectDatabaseStats,
  selectCleanupError,
  selectLastCleanup,
} from '../store/slices/databaseCleanupSlice';

// 常數
import { COLORS, TEXT_STYLES } from '../constants';

const DatabaseCleanupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Redux state
  const isCleaning = useSelector(selectIsCleaning);
  const cleanupProgress = useSelector(selectCleanupProgress);
  const databaseStats = useSelector(selectDatabaseStats);
  const error = useSelector(selectCleanupError);
  const lastCleanup = useSelector(selectLastCleanup);
  
  // Local state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // 載入初始數據
  useEffect(() => {
    dispatch(getDatabaseStats());
    dispatch(checkCleanupStatus());
  }, [dispatch]);

  // 處理錯誤
  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      dispatch(clearError());
    }
  }, [error, t, dispatch]);

  // 開始清理
  const handleStartCleanup = () => {
    setShowConfirmModal(false);
    
    Alert.alert(
      t('database_cleanup.confirm_title'),
      t('database_cleanup.confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('database_cleanup.start_cleanup'),
          style: 'destructive',
          onPress: () => {
            dispatch(cleanupAllUnrealContent())
              .unwrap()
              .then(() => {
                Alert.alert(
                  t('common.success'),
                  t('database_cleanup.cleanup_completed')
                );
                dispatch(getDatabaseStats());
              })
              .catch((error) => {
                Alert.alert(t('common.error'), error);
              });
          }
        }
      ]
    );
  };

  // 渲染進度條
  const renderProgressBar = () => {
    const steps = [
      { key: 'localStorage', label: t('database_cleanup.local_storage'), icon: 'database' },
      { key: 'database', label: t('database_cleanup.database'), icon: 'table' },
      { key: 'cache', label: t('database_cleanup.cache'), icon: 'cached' },
      { key: 'realDataImport', label: t('database_cleanup.real_data'), icon: 'download' }
    ];

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>{t('database_cleanup.cleanup_progress')}</Text>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.progressStep}>
            <View style={styles.stepIconContainer}>
              <MaterialCommunityIcons
                name={step.icon}
                size={24}
                color={cleanupProgress[step.key] ? COLORS.SUCCESS : COLORS.GRAY_LIGHT}
              />
              {cleanupProgress[step.key] && (
                <View style={styles.checkmark}>
                  <MaterialCommunityIcons name="check" size={12} color={COLORS.WHITE} />
                </View>
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepLabel,
                cleanupProgress[step.key] && styles.stepLabelCompleted
              ]}>
                {step.label}
              </Text>
              <View style={styles.stepProgressBar}>
                <View style={[
                  styles.stepProgressFill,
                  { width: cleanupProgress[step.key] ? '100%' : '0%' }
                ]} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // 渲染統計卡片
  const renderStatsCard = (title, value, subtitle, icon, color = COLORS.PRIMARY) => (
    <View style={styles.statsCard}>
      <View style={styles.statsCardHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={styles.statsCardTitle}>{title}</Text>
      </View>
      <Text style={[styles.statsCardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statsCardSubtitle}>{subtitle}</Text>}
    </View>
  );

  // 渲染數據庫統計
  const renderDatabaseStats = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>{t('database_cleanup.database_statistics')}</Text>
      <View style={styles.statsGrid}>
        {renderStatsCard(
          t('database_cleanup.total_cards'),
          databaseStats.totalCards || 0,
          t('database_cleanup.cards_in_database'),
          'cards',
          COLORS.PRIMARY
        )}
        {renderStatsCard(
          t('database_cleanup.cards_with_features'),
          databaseStats.cardsWithFeatures || 0,
          t('database_cleanup.with_ai_features'),
          'brain',
          COLORS.SECONDARY
        )}
        {renderStatsCard(
          t('database_cleanup.pokemon_cards'),
          databaseStats.gameTypeBreakdown?.pokemon || 0,
          t('database_cleanup.pokemon_tcg'),
          'pokeball',
          COLORS.ACCENT_YELLOW
        )}
        {renderStatsCard(
          t('database_cleanup.one_piece_cards'),
          databaseStats.gameTypeBreakdown?.onepiece || 0,
          t('database_cleanup.one_piece_tcg'),
          'sail-boat',
          COLORS.ACCENT_ORANGE
        )}
      </View>
      
      <View style={styles.cleanStatusContainer}>
        <MaterialCommunityIcons
          name={databaseStats.isClean ? 'shield-check' : 'alert-circle'}
          size={24}
          color={databaseStats.isClean ? COLORS.SUCCESS : COLORS.WARNING}
        />
        <Text style={[
          styles.cleanStatusText,
          { color: databaseStats.isClean ? COLORS.SUCCESS : COLORS.WARNING }
        ]}>
          {databaseStats.isClean 
            ? t('database_cleanup.database_clean')
            : t('database_cleanup.database_needs_cleanup')
          }
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.GRADIENT_PRIMARY}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('database_cleanup.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('database_cleanup.subtitle')}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 數據庫統計 */}
        {renderDatabaseStats()}

        {/* 清理進度 */}
        {isCleaning && renderProgressBar()}

        {/* 最後清理時間 */}
        {lastCleanup && (
          <View style={styles.lastCleanupSection}>
            <Text style={styles.sectionTitle}>{t('database_cleanup.last_cleanup')}</Text>
            <Text style={styles.lastCleanupText}>
              {new Date(lastCleanup).toLocaleString()}
            </Text>
          </View>
        )}

        {/* 操作按鈕 */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, isCleaning && styles.actionButtonDisabled]}
            onPress={() => setShowConfirmModal(true)}
            disabled={isCleaning}
          >
            <LinearGradient
              colors={isCleaning ? [COLORS.GRAY_LIGHT, COLORS.GRAY_LIGHT] : COLORS.GRADIENT_PRIMARY}
              style={styles.actionButtonGradient}
            >
              {isCleaning ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <MaterialCommunityIcons name="broom" size={24} color={COLORS.WHITE} />
              )}
              <Text style={styles.actionButtonText}>
                {isCleaning 
                  ? t('database_cleanup.cleaning_in_progress')
                  : t('database_cleanup.start_cleanup')
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              dispatch(getDatabaseStats());
              setShowStatsModal(true);
            }}
          >
            <MaterialCommunityIcons name="chart-bar" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.secondaryButtonText}>
              {t('database_cleanup.refresh_stats')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 說明文字 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('database_cleanup.what_will_be_cleaned')}</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="delete" size={16} color={COLORS.ACCENT_RED} />
              <Text style={styles.infoText}>{t('database_cleanup.real_data')}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="delete" size={16} color={COLORS.ACCENT_RED} />
              <Text style={styles.infoText}>{t('database_cleanup.example_cards')}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="delete" size={16} color={COLORS.ACCENT_RED} />
              <Text style={styles.infoText}>{t('database_cleanup.test_prices')}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="delete" size={16} color={COLORS.ACCENT_RED} />
              <Text style={styles.infoText}>{t('database_cleanup.cache_data')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('database_cleanup.what_will_be_added')}</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="plus" size={16} color={COLORS.SUCCESS} />
              <Text style={styles.infoText}>{t('database_cleanup.real_pokemon_cards')}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="plus" size={16} color={COLORS.SUCCESS} />
              <Text style={styles.infoText}>{t('database_cleanup.real_one_piece_cards')}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="plus" size={16} color={COLORS.SUCCESS} />
              <Text style={styles.infoText}>{t('database_cleanup.real_price_data')}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="plus" size={16} color={COLORS.SUCCESS} />
              <Text style={styles.infoText}>{t('database_cleanup.grading_data')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 確認模態框 */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="alert" size={32} color={COLORS.WARNING} />
              <Text style={styles.modalTitle}>{t('database_cleanup.confirm_title')}</Text>
            </View>
            <Text style={styles.modalMessage}>
              {t('database_cleanup.confirm_message')}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleStartCleanup}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {t('database_cleanup.start_cleanup')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 統計詳情模態框 */}
      <Modal
        visible={showStatsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('database_cleanup.detailed_statistics')}</Text>
              <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailedStats}>
                <Text style={styles.detailedStatsTitle}>
                  {t('database_cleanup.game_type_breakdown')}
                </Text>
                {Object.entries(databaseStats.gameTypeBreakdown || {}).map(([gameType, count]) => (
                  <View key={gameType} style={styles.gameTypeRow}>
                    <Text style={styles.gameTypeLabel}>
                      {gameType === 'pokemon' ? 'Pokemon TCG' : 
                       gameType === 'onepiece' ? 'One Piece TCG' : gameType}
                    </Text>
                    <Text style={styles.gameTypeCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.WHITE,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsCardTitle: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
  },
  statsCardValue: {
    ...TEXT_STYLES.TITLE_LARGE,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsCardSubtitle: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  cleanStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cleanStatusText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepIconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  checkmark: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 5,
  },
  stepLabelCompleted: {
    color: COLORS.SUCCESS,
    fontWeight: 'bold',
  },
  stepProgressBar: {
    height: 4,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepProgressFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 2,
  },
  lastCleanupSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lastCleanupText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  actionButtonText: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.ACCENT_RED,
  },
  modalButtonText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButtonTextPrimary: {
    color: COLORS.WHITE,
  },
  modalBody: {
    maxHeight: 400,
  },
  detailedStats: {
    marginBottom: 20,
  },
  detailedStatsTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  gameTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  gameTypeLabel: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  gameTypeCount: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
});

export default DatabaseCleanupScreen;
