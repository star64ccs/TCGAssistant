import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  addPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
  loadPriceAlerts,
  checkPriceAlerts,
  clearTriggeredAlerts,
  updateSettings,
} from '../store/slices/priceTrackingSlice';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY } from '../constants';

const { width, height } = Dimensions.get('window');

const PriceTrackingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { priceAlerts, triggeredAlerts, settings, isLoading, error } = useSelector(
    state => state.priceTracking
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [newAlert, setNewAlert] = useState({
    cardName: '',
    cardId: '',
    targetPrice: '',
    condition: 'below', // below, above, change
    changeThreshold: '5',
  });

  useEffect(() => {
    dispatch(loadPriceAlerts());
  }, [dispatch]);

  const handleAddAlert = async () => {
    if (!newAlert.cardName || !newAlert.targetPrice) {
      Alert.alert(t('common.error'), t('price_tracking.fill_all_fields'));
      return;
    }

    try {
      await dispatch(addPriceAlert({
        ...newAlert,
        targetPrice: parseFloat(newAlert.targetPrice),
        changeThreshold: parseFloat(newAlert.changeThreshold),
      })).unwrap();
      
      setShowAddModal(false);
      setNewAlert({
        cardName: '',
        cardId: '',
        targetPrice: '',
        condition: 'below',
        changeThreshold: '5',
      });
      Alert.alert(t('common.success'), t('price_tracking.alert_added'));
    } catch (error) {
      Alert.alert(t('common.error'), error);
    }
  };

  const handleEditAlert = async (alertId, updates) => {
    try {
      await dispatch(updatePriceAlert({ alertId, updates })).unwrap();
      Alert.alert(t('common.success'), t('price_tracking.alert_updated'));
    } catch (error) {
      Alert.alert(t('common.error'), error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    Alert.alert(
      t('common.confirm'),
      t('price_tracking.delete_alert_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePriceAlert(alertId)).unwrap();
              Alert.alert(t('common.success'), t('price_tracking.alert_deleted'));
            } catch (error) {
              Alert.alert(t('common.error'), error);
            }
          },
        },
      ]
    );
  };

  const handleToggleAlert = async (alertId, isActive) => {
    await handleEditAlert(alertId, { isActive: !isActive });
  };

  const handleCheckAlerts = async () => {
    try {
      await dispatch(checkPriceAlerts()).unwrap();
      if (triggeredAlerts.length > 0) {
        Alert.alert(
          t('price_tracking.alerts_triggered'),
          t('price_tracking.alerts_triggered_message', { count: triggeredAlerts.length })
        );
      } else {
        Alert.alert(t('common.info'), t('price_tracking.no_alerts_triggered'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), error);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      await dispatch(updateSettings(newSettings)).unwrap();
      setShowSettingsModal(false);
      Alert.alert(t('common.success'), t('price_tracking.settings_updated'));
    } catch (error) {
      Alert.alert(t('common.error'), error);
    }
  };

  const renderAlertItem = ({ item }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.cardName}>{item.cardName}</Text>
          <Text style={styles.alertCondition}>
            {item.condition === 'below' ? '≤' : item.condition === 'above' ? '≥' : '±'} 
            ${item.targetPrice}
          </Text>
        </View>
        <View style={styles.alertActions}>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleAlert(item.id, item.isActive)}
            trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.PRIMARY }}
            thumbColor={COLORS.TEXT_WHITE}
          />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAlert(item.id)}
          >
            <Icon name="delete" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.alertDetails}>
        <Text style={styles.alertDate}>
          {t('price_tracking.created')}: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.lastChecked && (
          <Text style={styles.alertDate}>
            {t('price_tracking.last_checked')}: {new Date(item.lastChecked).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );

  const renderTriggeredAlert = ({ item }) => (
    <View style={[styles.alertCard, styles.triggeredAlert]}>
      <View style={styles.alertHeader}>
        <Icon name="bell-ring" size={24} color={COLORS.WARNING} />
        <View style={styles.alertInfo}>
          <Text style={styles.cardName}>{item.cardName}</Text>
          <Text style={styles.triggeredText}>
            {t('price_tracking.price_reached')}: ${item.currentPrice}
          </Text>
        </View>
      </View>
      <Text style={styles.triggeredTime}>
        {t('price_tracking.triggered_at')}: {new Date(item.triggeredAt).toLocaleString()}
      </Text>
    </View>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('price_tracking.add_alert')}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Icon name="close" size={24} color={COLORS.TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('price_tracking.card_name')}</Text>
              <TextInput
                style={styles.textInput}
                value={newAlert.cardName}
                onChangeText={(text) => setNewAlert({ ...newAlert, cardName: text })}
                placeholder={t('price_tracking.enter_card_name')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('price_tracking.target_price')}</Text>
              <TextInput
                style={styles.textInput}
                value={newAlert.targetPrice}
                onChangeText={(text) => setNewAlert({ ...newAlert, targetPrice: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('price_tracking.condition')}</Text>
              <View style={styles.conditionButtons}>
                <TouchableOpacity
                  style={[
                    styles.conditionButton,
                    newAlert.condition === 'below' && styles.conditionButtonActive,
                  ]}
                  onPress={() => setNewAlert({ ...newAlert, condition: 'below' })}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    newAlert.condition === 'below' && styles.conditionButtonTextActive,
                  ]}>
                    {t('price_tracking.below')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.conditionButton,
                    newAlert.condition === 'above' && styles.conditionButtonActive,
                  ]}
                  onPress={() => setNewAlert({ ...newAlert, condition: 'above' })}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    newAlert.condition === 'above' && styles.conditionButtonTextActive,
                  ]}>
                    {t('price_tracking.above')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.conditionButton,
                    newAlert.condition === 'change' && styles.conditionButtonActive,
                  ]}
                  onPress={() => setNewAlert({ ...newAlert, condition: 'change' })}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    newAlert.condition === 'change' && styles.conditionButtonTextActive,
                  ]}>
                    {t('price_tracking.change')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {newAlert.condition === 'change' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('price_tracking.change_threshold')} (%)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAlert.changeThreshold}
                  onChangeText={(text) => setNewAlert({ ...newAlert, changeThreshold: text })}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddAlert}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('price_tracking.settings')}</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Icon name="close" size={24} color={COLORS.TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('price_tracking.check_interval')} (分鐘)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.checkInterval.toString()}
                onChangeText={(text) => handleUpdateSettings({ checkInterval: parseInt(text) || 30 })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('price_tracking.enable_notifications')}</Text>
              <Switch
                value={settings.enableNotifications}
                onValueChange={(value) => handleUpdateSettings({ enableNotifications: value })}
                trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.PRIMARY }}
                thumbColor={COLORS.TEXT_WHITE}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('price_tracking.enable_email_alerts')}</Text>
              <Switch
                value={settings.enableEmailAlerts}
                onValueChange={(value) => handleUpdateSettings({ enableEmailAlerts: value })}
                trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.PRIMARY }}
                thumbColor={COLORS.TEXT_WHITE}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('price_tracking.price_change_threshold')} (%)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.priceChangeThreshold.toString()}
                onChangeText={(text) => handleUpdateSettings({ priceChangeThreshold: parseInt(text) || 5 })}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENT_PRIMARY} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.TEXT_WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('price_tracking.title')}</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettingsModal(true)}>
            <Icon name="cog" size={24} color={COLORS.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>{t('price_tracking.subtitle')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* 統計卡片 */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Icon name="bell" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{priceAlerts.length}</Text>
            <Text style={styles.statLabel}>{t('price_tracking.total_alerts')}</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="bell-ring" size={24} color={COLORS.WARNING} />
            <Text style={styles.statValue}>{triggeredAlerts.length}</Text>
            <Text style={styles.statLabel}>{t('price_tracking.triggered_alerts')}</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="clock" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{settings.checkInterval}m</Text>
            <Text style={styles.statLabel}>{t('price_tracking.check_interval')}</Text>
          </View>
        </View>

        {/* 操作按鈕 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="plus" size={20} color={COLORS.TEXT_WHITE} />
            <Text style={styles.addButtonText}>{t('price_tracking.add_alert')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheckAlerts}
            disabled={isLoading}
          >
            <Icon name="refresh" size={20} color={COLORS.TEXT_WHITE} />
            <Text style={styles.checkButtonText}>{t('price_tracking.check_now')}</Text>
          </TouchableOpacity>
        </View>

        {/* 觸發的提醒 */}
        {triggeredAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('price_tracking.triggered_alerts')}</Text>
              <TouchableOpacity onPress={() => dispatch(clearTriggeredAlerts())}>
                <Text style={styles.clearButton}>{t('common.clear')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={triggeredAlerts}
              renderItem={renderTriggeredAlert}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* 價格提醒列表 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('price_tracking.price_alerts')}</Text>
          <FlatList
            data={priceAlerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="bell-off" size={48} color={COLORS.GRAY} />
                <Text style={styles.emptyText}>{t('price_tracking.no_alerts')}</Text>
                <Text style={styles.emptySubtext}>{t('price_tracking.add_first_alert')}</Text>
              </View>
            }
          />
        </View>
      </View>

      {renderAddModal()}
      {renderSettingsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...TEXT_STYLES.H1,
    color: COLORS.TEXT_WHITE,
  },
  settingsButton: {
    padding: 8,
  },
  headerSubtitle: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_WHITE,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.TEXT_WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    ...TEXT_STYLES.H2,
    color: COLORS.TEXT_DARK,
    marginTop: 8,
  },
  statLabel: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  addButtonText: {
    ...TEXT_STYLES.BUTTON,
    color: COLORS.TEXT_WHITE,
    marginLeft: 8,
  },
  checkButton: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkButtonText: {
    ...TEXT_STYLES.BUTTON,
    color: COLORS.TEXT_WHITE,
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TEXT_STYLES.H3,
    color: COLORS.TEXT_DARK,
  },
  clearButton: {
    ...TEXT_STYLES.BUTTON,
    color: COLORS.PRIMARY,
  },
  alertCard: {
    backgroundColor: COLORS.TEXT_WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  triggeredAlert: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.WARNING,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
  },
  cardName: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_DARK,
    fontWeight: '600',
  },
  alertCondition: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.PRIMARY,
    marginTop: 2,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  alertDetails: {
    marginTop: 8,
  },
  alertDate: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  triggeredText: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.WARNING,
    marginTop: 2,
  },
  triggeredTime: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
  },
  emptySubtext: {
    ...TEXT_STYLES.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.TEXT_WHITE,
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  modalTitle: {
    ...TEXT_STYLES.H3,
    color: COLORS.TEXT_DARK,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_DARK,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  conditionButtons: {
    flexDirection: 'row',
  },
  conditionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  conditionButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  conditionButtonText: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_DARK,
  },
  conditionButtonTextActive: {
    color: COLORS.TEXT_WHITE,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    ...TEXT_STYLES.BUTTON,
    color: COLORS.TEXT_DARK,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    ...TEXT_STYLES.BUTTON,
    color: COLORS.TEXT_WHITE,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    ...TEXT_STYLES.BODY,
    color: COLORS.TEXT_DARK,
    flex: 1,
  },
});

export default PriceTrackingScreen;
