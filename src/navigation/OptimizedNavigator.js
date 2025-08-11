import React, { Suspense, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { COLORS } from '../constants/colors';

// 懶加載屏幕組件
const LazyScreen = React.memo(({ component: Component, fallback, ...props }) => (
  <Suspense fallback={fallback || <DefaultFallback />}>
    <Component {...props} />
  </Suspense>
));

// 默認加載組件
const DefaultFallback = () => (
  <View style={styles.fallback}>
    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
  </View>
);

/**
 * 優化的導航器工廠
 */
class OptimizedNavigatorFactory {
  constructor() {
    this.screenCache = new Map();
    this.navigatorCache = new Map();
  }

  // 創建懶加載屏幕
  createLazyScreen(importFunc, fallback) {
    const cacheKey = importFunc.toString();    if (this.screenCache.has(cacheKey)) {      return this.screenCache.get(cacheKey);
    }    const LazyComponent = React.lazy(importFunc);
    const WrappedComponent = React.memo((props) => (      <LazyScreen        component={LazyComponent}        fallback={fallback}        {...props}      />
    ));    this.screenCache.set(cacheKey, WrappedComponent);
    return WrappedComponent;
  }

  // 創建優化的 Stack Navigator
  createOptimizedStack(screens, options = {}) {
    const Stack = createStackNavigator();    const defaultOptions = {      headerShown: false,      cardStyleInterpolator: ({ current, layouts }) => ({        cardStyle: {          transform: [            {              translateX: current.progress.interpolate({                inputRange: [0, 1],                outputRange: [layouts.screen.width, 0],              }),            },          ],        },      }),      ...options,
    };    return function OptimizedStackNavigator() {      const memoizedScreens = useMemo(() => screens, [screens]);      return (        <Stack.Navigator screenOptions={defaultOptions}>          {memoizedScreens.map(({ name, component, options: screenOptions }) => (            <Stack.Screen              key={name}              name={name}              component={component}              options={screenOptions}            />          ))}        </Stack.Navigator>      );
    };
  }

  // 創建優化的 Tab Navigator
  createOptimizedTabs(screens, options = {}) {
    const Tab = createBottomTabNavigator();    const defaultOptions = {      lazy: true,      unmountOnBlur: false, // 保持狀態但優化記憶體      tabBarHideOnKeyboard: true,      ...options,
    };    return function OptimizedTabNavigator() {      const memoizedScreens = useMemo(() => screens, [screens]);      return (        <Tab.Navigator screenOptions={defaultOptions}>          {memoizedScreens.map(({ name, component, options: screenOptions }) => (            <Tab.Screen              key={name}              name={name}              component={component}              options={screenOptions}            />          ))}        </Tab.Navigator>      );
    };
  }

  // 創建優化的 Drawer Navigator
  createOptimizedDrawer(screens, options = {}) {
    const Drawer = createDrawerNavigator();    const defaultOptions = {      lazy: true,      unmountOnBlur: true, // Drawer 頁面可以卸載      ...options,
    };    return function OptimizedDrawerNavigator() {      const memoizedScreens = useMemo(() => screens, [screens]);      return (        <Drawer.Navigator screenOptions={defaultOptions}>          {memoizedScreens.map(({ name, component, options: screenOptions }) => (            <Drawer.Screen              key={name}              name={name}              component={component}              options={screenOptions}            />          ))}        </Drawer.Navigator>      );
    };
  }

  // 預加載關鍵屏幕
  preloadScreens(importFuncs) {
    if (__DEV__) {      // 在開發環境下預加載，避免首次導航延遲      importFuncs.forEach(importFunc => {        importFunc().catch(() => {          // 忽略預加載錯誤        });      });
    }
  }

  // 清理導航快取
  clearCache() {
    this.screenCache.clear();
    this.navigatorCache.clear();
  }
}

// 創建單例
const optimizedNavigatorFactory = new OptimizedNavigatorFactory();

// 導出工具函數
export const createLazyScreen = (importFunc, fallback) =>
  optimizedNavigatorFactory.createLazyScreen(importFunc, fallback);

export const createOptimizedStack = (screens, options) =>
  optimizedNavigatorFactory.createOptimizedStack(screens, options);

export const createOptimizedTabs = (screens, options) =>
  optimizedNavigatorFactory.createOptimizedTabs(screens, options);

export const createOptimizedDrawer = (screens, options) =>
  optimizedNavigatorFactory.createOptimizedDrawer(screens, options);

export const preloadScreens = (importFuncs) =>
  optimizedNavigatorFactory.preloadScreens(importFuncs);

// 樣式
const styles = {
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND || '#ffffff',
  },
};

export default optimizedNavigatorFactory;
