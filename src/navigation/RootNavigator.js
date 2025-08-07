import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Redux actions
import { checkAuthStatus } from '../store/slices/authSlice';

// 認證相關頁面
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// 主要功能頁面
import HomeScreen from '../screens/HomeScreen';
import CardRecognitionScreen from '../screens/CardRecognitionScreen';
import CenteringEvaluationScreen from '../screens/CenteringEvaluationScreen';
import AuthenticityCheckScreen from '../screens/AuthenticityCheckScreen';
import PricePredictionScreen from '../screens/PricePredictionScreen';
import CollectionScreen from '../screens/CollectionScreen';
import AIChatbotScreen from '../screens/AIChatbotScreen';
import MLAnalysisScreen from '../screens/MLAnalysisScreen';
import InvestmentAdviceScreen from '../screens/InvestmentAdviceScreen';

// 第二階段功能頁面
import PriceTrackingScreen from '../screens/PriceTrackingScreen';
import TradingMarketScreen from '../screens/TradingMarketScreen';

import NotificationCenterScreen from '../screens/NotificationCenterScreen';
import CardRatingScreen from '../screens/CardRatingScreen';
import TradingHistoryScreen from '../screens/TradingHistoryScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';
import DataExpansionScreen from '../screens/DataExpansionScreen';

// 結果頁面
import RecognitionResultScreen from '../screens/RecognitionResultScreen';
import CenteringResultScreen from '../screens/CenteringResultScreen';
import AuthenticityResultScreen from '../screens/AuthenticityResultScreen';
import PriceResultScreen from '../screens/PriceResultScreen';

// 收藏與歷史頁面
import CollectionScreen from '../screens/CollectionScreen';
import CollectionFolderScreen from '../screens/CollectionFolderScreen';
import SearchHistoryScreen from '../screens/SearchHistoryScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';

// AI助手頁面
import AIChatbotScreen from '../screens/AIChatbotScreen';

// 會員相關頁面
import MembershipScreen from '../screens/MembershipScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';

// 其他頁面
import AboutScreen from '../screens/AboutScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import SupportScreen from '../screens/SupportScreen';
import DatabaseCleanupScreen from '../screens/DatabaseCleanupScreen';

// 元件
import TabBarIcon from '../components/TabBarIcon';
import DrawerContent from '../components/DrawerContent';

// 常數
import { ROUTES, COLORS } from '../constants';

// 建立導航器
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 主要標籤導航器
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_LIGHT,
        tabBarStyle: {
          backgroundColor: COLORS.BACKGROUND_PRIMARY,
          borderTopColor: COLORS.CARD_BORDER,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name={ROUTES.HOME} 
        component={HomeScreen}
        options={{ tabBarLabel: '首頁' }}
      />
      <Tab.Screen 
        name={ROUTES.CARD_RECOGNITION} 
        component={CardRecognitionScreen}
        options={{ tabBarLabel: '辨識' }}
      />
      <Tab.Screen 
        name={ROUTES.COLLECTION} 
        component={CollectionScreen}
        options={{ tabBarLabel: '收藏' }}
      />
      <Tab.Screen 
        name={ROUTES.AI_CHATBOT} 
        component={AIChatbotScreen}
        options={{ tabBarLabel: 'AI助手' }}
      />
    </Tab.Navigator>
  );
};

// 主要抽屜導航器
const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.TEXT_WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: COLORS.PRIMARY,
        drawerInactiveTintColor: COLORS.TEXT_SECONDARY,
        drawerStyle: {
          backgroundColor: COLORS.BACKGROUND_PRIMARY,
        },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ 
          title: 'TCG助手',
          drawerLabel: '首頁',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.CENTERING_EVALUATION} 
        component={CenteringEvaluationScreen}
        options={{ 
          title: '置中評估',
          drawerLabel: '置中評估',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.AUTHENTICITY_CHECK} 
        component={AuthenticityCheckScreen}
        options={{ 
          title: '真偽判斷',
          drawerLabel: '真偽判斷',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.PRICE_PREDICTION} 
        component={PricePredictionScreen}
        options={{ 
          title: 'AI價格預測',
          drawerLabel: 'AI價格預測',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.ML_ANALYSIS} 
        component={MLAnalysisScreen}
        options={{ 
          title: '機器學習分析',
          drawerLabel: '機器學習分析',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.INVESTMENT_ADVICE} 
        component={InvestmentAdviceScreen}
        options={{ 
          title: '投資建議',
          drawerLabel: '投資建議',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.SEARCH_HISTORY} 
        component={SearchHistoryScreen}
        options={{ 
          title: '查詢歷史',
          drawerLabel: '查詢歷史',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.MEMBERSHIP} 
        component={MembershipScreen}
        options={{ 
          title: '會員中心',
          drawerLabel: '會員中心',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.PROFILE} 
        component={ProfileScreen}
        options={{ 
          title: '個人資料',
          drawerLabel: '個人資料',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.SETTINGS} 
        component={SettingsScreen}
        options={{ 
          title: '設定',
          drawerLabel: '設定',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.PRICE_TRACKING} 
        component={PriceTrackingScreen}
        options={{ 
          title: '價格追蹤',
          drawerLabel: '價格追蹤',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.TRADING_MARKET} 
        component={TradingMarketScreen}
        options={{ 
          title: '交易市場',
          drawerLabel: '交易市場',
        }}
      />

      <Drawer.Screen 
        name={ROUTES.NOTIFICATION_CENTER} 
        component={NotificationCenterScreen}
        options={{ 
          title: '通知中心',
          drawerLabel: '通知中心',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.CARD_RATING} 
        component={CardRatingScreen}
        options={{ 
          title: '卡牌評分',
          drawerLabel: '卡牌評分',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.TRADING_HISTORY} 
        component={TradingHistoryScreen}
        options={{ 
          title: '交易歷史',
          drawerLabel: '交易歷史',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.ANALYTICS_DASHBOARD} 
        component={AnalyticsDashboardScreen}
        options={{ 
          title: '統計儀表板',
          drawerLabel: '統計儀表板',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.DATA_EXPANSION} 
        component={DataExpansionScreen}
        options={{ 
          title: '資料擴充',
          drawerLabel: '資料擴充',
        }}
      />
      <Drawer.Screen 
        name={ROUTES.DATABASE_CLEANUP} 
        component={DatabaseCleanupScreen}
        options={{ 
          title: '資料庫清理',
          drawerLabel: '資料庫清理',
        }}
      />
    </Drawer.Navigator>
  );
};

// 認證導航器
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// 主要應用程式導航器
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} />
      <Stack.Screen name={ROUTES.RECOGNITION_RESULT} component={RecognitionResultScreen} />
      <Stack.Screen name={ROUTES.CENTERING_RESULT} component={CenteringResultScreen} />
      <Stack.Screen name={ROUTES.AUTHENTICITY_RESULT} component={AuthenticityResultScreen} />
      <Stack.Screen name={ROUTES.PRICE_RESULT} component={PriceResultScreen} />
      <Stack.Screen name={ROUTES.COLLECTION_DETAIL} component={CollectionDetailScreen} />
      <Stack.Screen name={ROUTES.COLLECTION_FOLDER} component={CollectionFolderScreen} />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.ABOUT} component={AboutScreen} />
      <Stack.Screen name={ROUTES.PRIVACY_POLICY} component={PrivacyPolicyScreen} />
      <Stack.Screen name={ROUTES.TERMS_OF_SERVICE} component={TermsOfServiceScreen} />
      <Stack.Screen name={ROUTES.SUPPORT} component={SupportScreen} />
    </Stack.Navigator>
  );
};

// 根導航器
const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, disclaimerAccepted, onboardingCompleted } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // 載入中
  if (isLoading) {
    return <SplashScreen />;
  }

  // 未完成引導
  if (!onboardingCompleted) {
    return <OnboardingScreen />;
  }

  // 未接受免責聲明
  if (!disclaimerAccepted) {
    return <OnboardingScreen />;
  }

  // 未登入
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // 已登入，顯示主要應用程式
  return <AppNavigator />;
};

export default RootNavigator;
