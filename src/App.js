import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider } from 'react-redux';
import { store } from './store';
import { COLORS } from './constants/colors';
import { TEXT_STYLES } from './constants/typography';
import DatabaseInitializer from './components/DatabaseInitializer';
import ApiStatusMonitor from './components/ApiStatusMonitor';
import apiIntegrationManager from './services/apiIntegrationManager';

// 導入真實的功能頁面
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import CardRecognitionScreen from './screens/CardRecognitionScreen';
import CenteringEvaluationScreen from './screens/CenteringEvaluationScreen';
import AuthenticityCheckScreen from './screens/AuthenticityCheckScreen';
import PricePredictionScreen from './screens/PricePredictionScreen';
import CollectionScreen from './screens/CollectionScreen';
import AIChatbotScreen from './screens/AIChatbotScreen';

// 導航器
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: COLORS.PRIMARY,
      tabBarInactiveTintColor: COLORS.GRAY_LIGHT,
      headerShown: false,
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        tabBarLabel: '首頁',
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Collection" 
      component={CollectionScreen}
      options={{
        tabBarLabel: '收藏',
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>📚</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="AIChatbot" 
      component={AIChatbotScreen}
      options={{
        tabBarLabel: 'AI助手',
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>🤖</Text>
        ),
      }}
    />
  </Tab.Navigator>
);

const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.PRIMARY,
      },
      headerTintColor: COLORS.WHITE,
      drawerStyle: {
        backgroundColor: COLORS.WHITE,
      },
    }}
  >
    <Drawer.Screen 
      name="MainTabs" 
      component={TabNavigator}
      options={{ title: 'TCG助手', headerShown: false }}
    />
    <Drawer.Screen 
      name="CardRecognition" 
      component={CardRecognitionScreen}
      options={{ title: '卡牌辨識' }}
    />
    <Drawer.Screen 
      name="CenteringEvaluation" 
      component={CenteringEvaluationScreen}
      options={{ title: '置中評估' }}
    />
    <Drawer.Screen 
      name="AuthenticityCheck" 
      component={AuthenticityCheckScreen}
      options={{ title: '真偽判斷' }}
    />
    <Drawer.Screen 
      name="PricePrediction" 
      component={PricePredictionScreen}
      options={{ title: '價格預測' }}
    />
  </Drawer.Navigator>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 初始化API集成
        const apiResult = await apiIntegrationManager.initialize();
        setApiStatus(apiResult);
        
        console.log('API初始化結果:', apiResult);
      } catch (error) {
        console.error('API初始化失敗:', error);
        setApiStatus({
          connection: { isConnected: false, status: 'error' },
          availability: { hasAnyApi: false },
          initialized: false
        });
      }
      
      // 延遲顯示主界面
      setTimeout(() => setIsLoading(false), 2000);
    };

    initializeApp();
  }, []);

  const handleApiStatusChange = (status) => {
    setApiStatus(prev => ({
      ...prev,
      connection: status
    }));
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      <DatabaseInitializer>
        <NavigationContainer>
          <View style={styles.container}>
            {/* API狀態監控 */}
            {apiStatus && (
              <ApiStatusMonitor onStatusChange={handleApiStatusChange} />
            )}
            
            {/* 主導航 */}
            <DrawerNavigator />
          </View>
        </NavigationContainer>
      </DatabaseInitializer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.WHITE,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  splashSubtitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
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
  featureGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (Dimensions.get('window').width - 60) / 2,
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    ...TEXT_STYLES.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDesc: {
    ...TEXT_STYLES.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  screenHeader: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  screenTitle: {
    ...TEXT_STYLES.TITLE_LARGE,
    color: COLORS.WHITE,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoon: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
  },
  comingSoonDesc: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabIcon: {
    fontSize: 24,
  },
});

export default App;
