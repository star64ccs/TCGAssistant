import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/colors';

const ConnectionErrorHandler = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-100);

  // 監聽網絡狀態變化
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // 檢查網絡連接
        const response = await fetch('https://www.google.com', {
          method: 'HEAD',
          timeout: 5000,
        });
        if (response.ok) {
          hideError();
        } else {
          showError('網絡連接不穩定');
        }
      } catch (error) {
        showError('無法連接到網絡');
      }
    };

    // 定期檢查連接
    const interval = setInterval(checkConnection, 30000);

    // 初始檢查
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  const showError = (message) => {
    setErrorMessage(message);
    setIsVisible(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideError = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setRetryCount(0);
    });
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);

    try {
      // 重試連接
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 5000,
      });
      if (response.ok) {
        hideError();
        Alert.alert('成功', '網絡連接已恢復');
      } else {
        showError('重試失敗，請檢查網絡設置');
      }
    } catch (error) {
      showError('重試失敗，請檢查網絡設置');
    }
  };

  const handleSettings = () => {
    Alert.alert(
      '網絡設置',
      '請檢查以下設置：\n\n1. 確保設備已連接WiFi或移動數據\n2. 檢查網絡信號強度\n3. 嘗試重啟網絡連接\n4. 檢查防火牆設置',
      [
        { text: '取消', style: 'cancel' },
        { text: '重試', onPress: handleRetry },
      ],
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <View style={styles.errorTextContainer}>
            <Text style={styles.errorTitle}>連接錯誤</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            {retryCount > 0 && (
              <Text style={styles.retryCount}>重試次數: {retryCount}</Text>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={handleRetry}
          >
            <Text style={styles.buttonText}>重試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.settingsButton]}
            onPress={handleSettings}
          >
            <Text style={styles.buttonText}>設置</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={hideError}
          >
            <Text style={styles.buttonText}>忽略</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999,
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    elevation: 8,
    margin: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  errorContent: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorMessage: {
    color: COLORS.WHITE,
    fontSize: 14,
    opacity: 0.9,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryCount: {
    color: COLORS.WHITE,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default ConnectionErrorHandler;
