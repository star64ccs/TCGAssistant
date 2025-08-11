import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// 內部服務
import exampleService from '../services/exampleService';

// 內部組件
import { CustomButton } from './CustomButton';

// 常數和配置
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, SIZES } from '../constants';

/**
 * 示例組件 - 展示統一的編碼風格
 * @param {Object} props - 組件屬性
 * @param {Object} props.navigation - 導航對象
 * @param {Object} props.route - 路由對象
 * @returns {React.Component} 示例組件
 */
const ExampleComponent = ({ navigation, route }) => {
  // Hooks
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useSelector((state) => state.example);

  // 狀態定義
  const [localData, setLocalData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOption, setSelectedOption] = useState('default');

  // 常數定義
  const OPTIONS = [
    { key: 'option1', label: t('example.option1'), icon: 'star' },
    { key: 'option2', label: t('example.option2'), icon: 'heart' },
    { key: 'option3', label: t('example.option3'), icon: 'bookmark' },
  ];

  const MAX_RETRY_COUNT = 3;
  const REFRESH_INTERVAL = 30000; // 30秒

  // 副作用
  useEffect(() => {
    initializeComponent();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadData();
    }
  }, [isAuthenticated, user?.id]);

  // 事件處理函數
  const handleOptionPress = useCallback((optionKey) => {
    setSelectedOption(optionKey);
    handleOptionChange(optionKey);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    loadData();
  }, []);

  // 業務邏輯函數
  const initializeComponent = async () => {
    try {
      await exampleService.initialize();
    } catch (error) {
      console.error('初始化失敗:', error);
    }
  };

  const loadData = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const result = await exampleService.getData(user.id);
      setLocalData(result);
    } catch (error) {
      console.error('載入數據失敗:', error);
      throw error;
    }
  };

  const handleOptionChange = async (optionKey) => {
    try {
      await exampleService.updateOption(user.id, optionKey);
      // 可以觸發其他操作
    } catch (error) {
      Alert.alert(t('common.error'), t('example.updateFailed'));
    }
  };

  // 渲染函數
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>{t('example.title')}</Text>
      <Text style={styles.subtitle}>{t('example.subtitle')}</Text>
    </View>
  );

  const renderOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={styles.sectionTitle}>{t('example.selectOption')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionButton,
              selectedOption === option.key && styles.optionButtonActive,
            ]}
            onPress={() => handleOptionPress(option.key)}
          >
            <MaterialIcons
              name={option.icon}
              size={24}
              color={
                selectedOption === option.key
                  ? COLORS.TEXT_WHITE
                  : COLORS.TEXT_SECONDARY
              }
            />
            <Text
              style={[
                styles.optionText,
                selectedOption === option.key && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={COLORS.ERROR}
          />
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton
            title={t('common.retry')}
            onPress={handleRetry}
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (!localData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('example.noData')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{localData.description}</Text>
        {/* 更多內容渲染邏輯 */}
      </View>
    );
  };

  // 主渲染
  return (
    <LinearGradient
      colors={COLORS.GRADIENT_PRIMARY}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {renderHeader()}
        {renderOptions()}
        {renderContent()}
      </ScrollView>
    </LinearGradient>
  );
};

// 樣式定義
const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  // 標題樣式
  header: {
    alignItems: 'center',
    padding: SIZES.LARGE,
  },

  title: {
    color: COLORS.TEXT_WHITE,
    fontFamily: FONTS.TITLE_PRIMARY,
    fontSize: FONT_SIZES.TITLE_LARGE,
    fontWeight: FONT_WEIGHTS.BOLD,
    marginBottom: SIZES.SMALL,
  },

  subtitle: {
    color: COLORS.TEXT_WHITE,
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.SUBTITLE_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    opacity: 0.8,
  },

  // 選項樣式
  optionsContainer: {
    marginBottom: SIZES.LARGE,
    paddingHorizontal: SIZES.LARGE,
  },

  sectionTitle: {
    color: COLORS.TEXT_WHITE,
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.SUBTITLE_MEDIUM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    marginBottom: SIZES.MEDIUM,
  },

  optionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: SIZES.SMALL,
    marginRight: SIZES.MEDIUM,
    minWidth: 100,
    paddingHorizontal: SIZES.LARGE,
    paddingVertical: SIZES.MEDIUM,
  },

  optionButtonActive: {
    backgroundColor: COLORS.SECONDARY,
  },

  optionText: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    marginTop: SIZES.XSMALL,
  },

  optionTextActive: {
    color: COLORS.TEXT_WHITE,
  },

  // 內容樣式
  contentContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: SIZES.MEDIUM,
    margin: SIZES.LARGE,
    padding: SIZES.LARGE,
  },

  contentText: {
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    lineHeight: 24,
  },

  // 載入樣式
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.LARGE,
  },

  loadingText: {
    color: COLORS.TEXT_WHITE,
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    marginTop: SIZES.MEDIUM,
  },

  // 錯誤樣式
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.LARGE,
  },

  errorText: {
    color: COLORS.ERROR,
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    marginVertical: SIZES.MEDIUM,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SIZES.MEDIUM,
  },

  // 空狀態樣式
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.LARGE,
  },

  emptyText: {
    color: COLORS.TEXT_WHITE,
    fontFamily: FONTS.BODY_PRIMARY,
    fontSize: FONT_SIZES.BODY_MEDIUM,
    fontWeight: FONT_WEIGHTS.REGULAR,
    textAlign: 'center',
  },
});

export default ExampleComponent;
