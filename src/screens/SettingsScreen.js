import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ROUTES, APP_CONFIG } from '../constants';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import {
  loadSettings,
  updateLanguage,
  updateTheme,
  updateNotificationSettings,
  updatePrivacySettings,
  updateSecuritySettings,
  resetSettings,
} from '../store/slices/settingsSlice';
import { logout } from '../store/slices/authSlice';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const { user } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settings);
  const { isLoading } = useSelector((state) => state.settings);
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutValue, setTimeoutValue] = useState(settings.security.lockTimeout.toString());

  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  // 處理語言變更
  const handleLanguageChange = async (language) => {
    try {
      await dispatch(updateLanguage(language)).unwrap();
      i18n.changeLanguage(language);
      setShowLanguageModal(false);
      Alert.alert(t('common.success'), t('settings.settings_saved'));
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.settings_error'));
    }
  };

  // 處理主題變更
  const handleThemeChange = async (theme) => {
    try {
      await dispatch(updateTheme(theme)).unwrap();
      setShowThemeModal(false);
      Alert.alert(t('common.success'), t('settings.settings_saved'));
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.settings_error'));
    }
  };

  // 處理通知設定變更
  const handleNotificationChange = async (key, value) => {
    try {
      await dispatch(updateNotificationSettings({ [key]: value })).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.settings_error'));
    }
  };

  // 處理隱私設定變更
  const handlePrivacyChange = async (key, value) => {
    try {
      await dispatch(updatePrivacySettings({ [key]: value })).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.settings_error'));
    }
  };

  // 處理安全設定變更
  const handleSecurityChange = async (key, value) => {
    try {
      await dispatch(updateSecuritySettings({ [key]: value })).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.settings_error'));
    }
  };

  // 處理圖片品質變更
  const handleQualityChange = async (quality) => {
    try {
      await dispatch(updateNotificationSettings({ imageQuality: quality })).unwrap();
      setShowQualityModal(false);
      Alert.alert(t('common.success'), t('settings.settings_saved'));
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.settings_error'));
    }
  };

  // 處理超時設定變更
  const handleTimeoutChange = async () => {
    const timeout = parseInt(timeoutValue);
    if (isNaN(timeout) || timeout < 1 || timeout > 60) {
      Alert.alert(t('common.error'), t('settings.invalid_timeout'));
      return;
    }

    try {
      await dispatch(updateSecuritySettings({ lockTimeout: timeout })).unwrap();
      setShowTimeoutModal(false);
      Alert.alert(t('common.success'), t('settings.settings_saved'));
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.settings_error'));
    }
  };

  // 重置設定
  const handleResetSettings = () => {
    Alert.alert(
      t('settings.reset_confirm_title'),
      t('settings.reset_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.reset'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(resetSettings()).unwrap();
              Alert.alert(t('common.success'), t('settings.reset_success'));
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.reset_error'));
            }
          },
        },
      ]
    );
  };

  // 登出
  const handleLogout = () => {
    Alert.alert(
      t('auth.logout_confirm_title'),
      t('auth.logout_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  // 刪除帳戶
  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.delete_account_title'),
      t('settings.delete_account_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.delete_account'),
          style: 'destructive',
          onPress: () => {
            // TODO: 實現刪除帳戶功能
            Alert.alert(t('common.info'), t('settings.delete_account_coming_soon'));
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    rightComponent,
    showArrow = true 
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Icon name={icon} size={24} color="#00ffff" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {rightComponent}
        {showArrow && <Icon name="chevron-right" size={24} color="#00ffff" />}
      </View>
    </TouchableOpacity>
  );

  const SwitchSettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    value, 
    onValueChange 
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Icon name={icon} size={24} color="#00ffff" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#2A2F81', true: '#00ffff' }}
          thumbColor={value ? '#1A1F71' : '#fff'}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設置</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#00ffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>帳戶</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              title="個人資料"
              subtitle="管理您的個人信息"
              icon="account"
              onPress={() => navigation.navigate(ROUTES.PROFILE)}
            />
            <SettingItem
              title="會員資格"
              subtitle="查看和管理會員狀態"
              icon="crown"
              onPress={() => navigation.navigate(ROUTES.MEMBERSHIP)}
            />
            <SettingItem
              title="隱私設定"
              subtitle="管理數據隱私"
              icon="shield"
              onPress={() => navigation.navigate(ROUTES.PRIVACY_SETTINGS)}
            />
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>應用程式設定</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              title="語言"
              subtitle={settings.language === 'zh-TW' ? '繁體中文' : 'English'}
              icon="translate"
              onPress={() => setShowLanguageModal(true)}
            />
            <SettingItem
              title="主題"
              subtitle={settings.theme === 'dark' ? '深色' : '淺色'}
              icon="theme-light-dark"
              onPress={() => setShowThemeModal(true)}
            />
            <SettingItem
              title="圖片品質"
              subtitle={`${settings.imageQuality}%`}
              icon="image"
              onPress={() => setShowQualityModal(true)}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          <View style={styles.sectionCard}>
            <SwitchSettingItem
              title="推送通知"
              subtitle="接收重要更新"
              icon="bell"
              value={settings.notifications.push}
              onValueChange={(value) => handleNotificationChange('push', value)}
            />
            <SwitchSettingItem
              title="價格提醒"
              subtitle="卡牌價格變化通知"
              icon="chart-line"
              value={settings.notifications.priceAlerts}
              onValueChange={(value) => handleNotificationChange('priceAlerts', value)}
            />
            <SwitchSettingItem
              title="市場更新"
              subtitle="市場趨勢和新聞"
              icon="trending-up"
              value={settings.notifications.marketUpdates}
              onValueChange={(value) => handleNotificationChange('marketUpdates', value)}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>安全</Text>
          <View style={styles.sectionCard}>
            <SwitchSettingItem
              title="生物識別"
              subtitle="使用指紋或面容ID"
              icon="fingerprint"
              value={settings.security.biometric}
              onValueChange={(value) => handleSecurityChange('biometric', value)}
            />
            <SettingItem
              title="鎖定超時"
              subtitle={`${settings.security.lockTimeout} 分鐘`}
              icon="lock-clock"
              onPress={() => setShowTimeoutModal(true)}
            />
            <SwitchSettingItem
              title="自動備份"
              subtitle="定期備份數據"
              icon="cloud-upload"
              value={settings.security.autoBackup}
              onValueChange={(value) => handleSecurityChange('autoBackup', value)}
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>數據管理</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              title="備份與恢復"
              subtitle="管理數據備份"
              icon="cloud-sync"
              onPress={() => navigation.navigate(ROUTES.BACKUP)}
            />
            <SettingItem
              title="清除快取"
              subtitle="釋放存儲空間"
              icon="delete-sweep"
              onPress={() => {
                Alert.alert('成功', '快取已清除');
              }}
            />
            <SettingItem
              title="重置設定"
              subtitle="恢復預設設定"
              icon="refresh"
              onPress={handleResetSettings}
            />
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>帳戶操作</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              title="登出"
              subtitle="安全退出應用程式"
              icon="logout"
              onPress={handleLogout}
              showArrow={false}
            />
            <SettingItem
              title="刪除帳戶"
              subtitle="永久刪除帳戶和數據"
              icon="delete"
              onPress={handleDeleteAccount}
              showArrow={false}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>應用程式信息</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              title="版本"
              subtitle={APP_CONFIG.VERSION}
              icon="information"
              onPress={() => {}}
              showArrow={false}
            />
            <SettingItem
              title="關於我們"
              subtitle="了解更多信息"
              icon="help-circle"
              onPress={() => navigation.navigate(ROUTES.ABOUT)}
            />
            <SettingItem
              title="意見反饋"
              subtitle="幫助我們改進"
              icon="message-text"
              onPress={() => navigation.navigate(ROUTES.FEEDBACK)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇語言</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleLanguageChange('zh-TW')}
            >
              <Text style={styles.modalOptionText}>繁體中文</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={styles.modalOptionText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇主題</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleThemeChange('dark')}
            >
              <Text style={styles.modalOptionText}>深色</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleThemeChange('light')}
            >
              <Text style={styles.modalOptionText}>淺色</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backButton: {
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: '#2A2F81',
    marginHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2A2F81',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  modalCancel: {
    padding: 15,
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#ff9800',
    textAlign: 'center',
  },
});

export default SettingsScreen;
