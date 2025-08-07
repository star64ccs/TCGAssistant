import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

// Redux actions
import { logout } from '../store/slices/authSlice';

// 常數
import { COLORS, TEXT_STYLES, ROUTES } from '../constants';

const DrawerContent = (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      title: t('features.card_recognition'),
      icon: 'camera',
      route: ROUTES.CARD_RECOGNITION,
    },
    {
      title: t('features.centering_evaluation'),
      icon: 'crop-free',
      route: ROUTES.CENTERING_EVALUATION,
    },
    {
      title: t('features.authenticity_check'),
      icon: 'shield-check',
      route: ROUTES.AUTHENTICITY_CHECK,
    },
    {
      title: t('features.price_analysis'),
      icon: 'chart-line',
      route: ROUTES.PRICE_ANALYSIS,
    },
    {
      title: t('features.ml_analysis'),
      icon: 'brain',
      route: ROUTES.ML_ANALYSIS,
    },
    {
      title: t('features.investment_advice'),
      icon: 'trending-up',
      route: ROUTES.INVESTMENT_ADVICE,
    },
    {
      title: t('features.collection_management'),
      icon: 'cards',
      route: ROUTES.COLLECTION,
    },
    {
      title: t('features.query_history'),
      icon: 'history',
      route: ROUTES.SEARCH_HISTORY,
    },
    {
      title: t('features.ai_chatbot'),
      icon: 'robot',
      route: ROUTES.AI_CHATBOT,
    },
  ];

  const settingsItems = [
    {
      title: t('membership.title'),
      icon: 'crown',
      route: ROUTES.MEMBERSHIP,
    },
    {
      title: t('settings.profile'),
      icon: 'account',
      route: ROUTES.PROFILE,
    },
    {
      title: t('settings.title'),
      icon: 'cog',
      route: ROUTES.SETTINGS,
    },
  ];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={() => {
        navigation.navigate(item.route);
        props.navigation.closeDrawer();
      }}
    >
      <Icon name={item.icon} size={24} color={COLORS.TEXT_SECONDARY} />
      <Text style={styles.menuText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 用戶資訊區域 */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={40} color={COLORS.TEXT_WHITE} />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user?.name || '用戶'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 主要功能選單 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features.title')}</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* 設定選單 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.title')}</Text>
          {settingsItems.map(renderMenuItem)}
        </View>

        {/* 其他選單 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.other')}</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate(ROUTES.DATABASE_CLEANUP);
              props.navigation.closeDrawer();
            }}
          >
            <Icon name="database" size={24} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.menuText}>{t('database_cleanup.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate(ROUTES.ABOUT);
              props.navigation.closeDrawer();
            }}
          >
            <Icon name="information" size={24} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.menuText}>{t('settings.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate(ROUTES.SUPPORT);
              props.navigation.closeDrawer();
            }}
          >
            <Icon name="help-circle" size={24} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.menuText}>{t('settings.help')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 登出按鈕 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color={COLORS.ERROR} />
        <Text style={styles.logoutText}>{t('auth.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  userSection: {
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...TEXT_STYLES.SUBTITLE_LARGE,
    color: COLORS.TEXT_WHITE,
    marginBottom: 5,
  },
  userEmail: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_WHITE,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    ...TEXT_STYLES.LABEL_LARGE,
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.CARD_BORDER,
  },
  menuText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.CARD_BORDER,
  },
  logoutText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.ERROR,
    marginLeft: 15,
  },
});

export default DrawerContent;
