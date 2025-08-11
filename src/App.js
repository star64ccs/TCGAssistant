import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  LogBox,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { COLORS } from './constants/colors';
import { TEXT_STYLES } from './constants/typography';

// 忽略非關鍵警告
LogBox.ignoreLogs([
  'Require cycle:',
  'AsyncStorage has been extracted',
  'ViewPropTypes will be removed',
]);

// 懶加載組件 - 性能優化
const DatabaseInitializer = React.lazy(() => import('./components/DatabaseInitializer'));
const ApiStatusMonitor = React.lazy(() => import('./components/ApiStatusMonitor'));
const ConnectionErrorHandler = React.lazy(() => import('./components/ConnectionErrorHandler'));
const PerformanceMonitor = React.lazy(() => import('./components/PerformanceMonitor'));
const DrawerContent = React.lazy(() => import('./components/DrawerContent'));

// 懶加載服務 - 網路性能優化
const apiIntegrationManager = React.lazy(() => import('./services/apiIntegrationManager'));

// 引入優化服務
import { preload } from './utils/lazyLoader';
import { getNetworkOptimizationService } from './services/networkOptimizationService';
import { getImageCompressionService } from './services/imageCompressionService';

// 懶加載頁面 - 減少初始包大小
const SplashScreen = React.lazy(() => import('./screens/SplashScreen'));
const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const CardRecognitionScreen = React.lazy(() => import('./screens/CardRecognitionScreen'));
const CenteringEvaluationScreen = React.lazy(() => import('./screens/CenteringEvaluationScreen'));
const AuthenticityCheckScreen = React.lazy(() => import('./screens/AuthenticityCheckScreen'));
const PricePredictionScreen = React.lazy(() => import('./screens/PricePredictionScreen'));
const CollectionScreen = React.lazy(() => import('./screens/CollectionScreen'));
const AIChatbotScreen = React.lazy(() => import('./screens/AIChatbotScreen'));

// 導航器
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 錯誤邊界組件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>應用程序遇到錯誤</Text>
          <Text style={styles.errorSubText}>請重新啟動應用程序</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// 加載組件
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>載入中...</Text>
  </View>
);

// 優化的標籤導航器
const TabNavigator = React.memo(() => {
  const tabBarStyle = useMemo(() => ({
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderTopColor: COLORS.CARD_BORDER,
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }), []);

  const renderTabIcon = useCallback(({ color, route }) => {
    const icons = {
      Home: '🏠',
      Collection: '📚',
      AIChatbot: '🤖',
    };
    return <Text style={[styles.tabIcon, { color }]}>{icons[route.name]}</Text>;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => renderTabIcon({ color, route }),
        tabBarStyle,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_LIGHT,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首頁',
        }}
      />
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarLabel: '收藏',
        }}
      />
      <Tab.Screen
        name="AIChatbot"
        component={AIChatbotScreen}
        options={{
          tabBarLabel: 'AI助手',
        }}
      />
    </Tab.Navigator>
  );
});

// 優化的抽屜導航器
const DrawerNavigator = React.memo(() => {
  const headerStyle = useMemo(() => ({
    backgroundColor: COLORS.PRIMARY,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }), []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: COLORS.BACKGROUND_PRIMARY,
          width: 280,
        },
        drawerActiveTintColor: COLORS.PRIMARY,
        drawerInactiveTintColor: COLORS.TEXT_LIGHT,
      }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          title: 'TCG助手',
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
});

// 主應用組件
const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化應用程序
  const initializeApp = useCallback(async () => {
    try {
      setIsLoading(true);
      // 預加載關鍵組件
      await preload([
        () => import('./screens/HomeScreen'),
        () => import('./screens/CardRecognitionScreen'),
        () => import('./screens/CollectionScreen'),
      ]);
      // 初始化服務
      const networkService = getNetworkOptimizationService();
      const imageService = getImageCompressionService();
      await Promise.all([
        networkService.initialize(),
        imageService.initialize(),
      ]);
      setIsInitialized(true);
    } catch (err) {
      console.error('應用程序初始化失敗:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 處理API狀態變化
  const handleApiStatusChange = useCallback((status) => {
    console.log('API狀態變化:', status);
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // 如果正在加載，顯示啟動畫面
  if (isLoading) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingComponent />}>
          <SplashScreen />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // 如果有錯誤，顯示錯誤畫面
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>初始化失敗</Text>
        <Text style={styles.errorSubText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingComponent />} persistor={persistor}>
          <NavigationContainer>
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLORS.PRIMARY}
              translucent={false}
            />
            <Suspense fallback={<LoadingComponent />}>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  gestureEnabled: true,
                  cardStyleInterpolator: ({ current, layouts }) => ({
                    cardStyle: {
                      transform: [
                        {
                          translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                          }),
                        },
                      ],
                    },
                  }),
                }}
              >
                {!isInitialized ? (
                  <Stack.Screen name="Splash" component={SplashScreen} />
                ) : (
                  <Stack.Screen name="Main" component={DrawerNavigator} />
                )}
              </Stack.Navigator>
              {/* 性能監控組件 */}
              <PerformanceMonitor />
              {/* API狀態監控 */}
              <ApiStatusMonitor onStatusChange={handleApiStatusChange} />
              {/* 連接錯誤處理 */}
              <ConnectionErrorHandler />
            </Suspense>
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorSubText: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderTopColor: COLORS.CARD_BORDER,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabIcon: {
    fontSize: 20,
  },
});

export default App;
