import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import memoryOptimizer from '../utils/memoryOptimizer';
import { COLORS } from '../constants/colors';

/**
 * 優化的圖片組件
 * 包含懶加載、記憶體管理、錯誤處理等功能
 */
const OptimizedImage = React.memo(({
  source,
  style,
  placeholder,
  onLoad,
  onError,
  resizeMode = 'cover',
  quality = 0.8,
  cache = true,
  lazy = false,
  fallbackSource,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(!lazy);

  // 優化圖片源
  const optimizedSource = useMemo(() => {
    if (!source) {
      return null;
    }
    if (typeof source === 'string') {
      return cache ? memoryOptimizer.optimizeImage(source, { quality }) : { uri: source };
    }
    return source;
  }, [source, quality, cache]);

  const handleLoad = useCallback((event) => {
    setLoading(false);
    setError(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((event) => {
    setLoading(false);
    setError(true);
    onError?.(event);
  }, [onError]);

  const handleLayout = useCallback(() => {
    if (lazy && !loaded) {
      setLoaded(true);
    }
  }, [lazy, loaded]);

  // 渲染加載狀態
  if (loading && loaded) {
    return (
      <View style={[style, styles.container]}>
        {placeholder || (
          <View style={styles.placeholder}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          </View>
        )}
      </View>
    );
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <View style={[style, styles.container, styles.errorContainer]}>
        {fallbackSource ? (
          <Image
            source={fallbackSource}
            style={style}
            resizeMode={resizeMode}
            {...props}
          />
        ) : (
          <View style={styles.errorPlaceholder}>
            <Text style={styles.errorText}>圖片載入失敗</Text>
          </View>
        )}
      </View>
    );
  }

  // 懶加載處理
  if (lazy && !loaded) {
    return (
      <View
        style={[style, styles.container]}
        onLayout={handleLayout}
      >
        {placeholder}
      </View>
    );
  }

  return (
    <Image
      source={optimizedSource}
      style={style}
      resizeMode={resizeMode}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY || '#f5f5f5',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR_LIGHT || '#ffe6e6',
  },
  errorPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.ERROR || '#ff0000',
    fontSize: 12,
    textAlign: 'center',
  },
};

export default OptimizedImage;
