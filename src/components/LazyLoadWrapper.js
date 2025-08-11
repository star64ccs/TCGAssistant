import React, { Suspense } from 'react';
import {
  View,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * 懶加載包裝組件
 * 為懶加載組件提供統一的加載狀態
 */
const LazyLoadWrapper = ({ children, fallback = null }) => {
  const defaultFallback = (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
    </View>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
};

export default React.memo(LazyLoadWrapper);
