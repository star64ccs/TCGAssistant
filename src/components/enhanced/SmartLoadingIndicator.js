import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// 智能加載指示器
const SmartLoadingIndicator = ({
  visible = false,
  type = 'default', // default, upload, analysis, recognition, prediction
  progress = 0, // 0-100
  message = '',
  subMessage = '',
  showProgress = false,
  showCancel = false,
  onCancel = null,
  theme = 'light', // light, dark, auto
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const animatedProgress = useState(new Animated.Value(0));
  const spinAnimation = useState(new Animated.Value(0));
  const pulseAnimation = useState(new Animated.Value(1));
  const fadeAnimation = useState(new Animated.Value(0));
  const messageRotation = useRef(0);

  // 動態消息配置
  const messageConfig = {
    default: [
      '正在處理中...',
      '請稍候...',
      '即將完成...',
    ],
    upload: [
      '正在上傳圖片...',
      '分析圖片內容...',
      '處理圖片數據...',
      '即將完成上傳...',
    ],
    analysis: [
      '正在分析卡牌...',
      '識別卡牌特徵...',
      '評估卡牌狀態...',
      '計算品質評分...',
      '生成分析報告...',
    ],
    recognition: [
      '正在識別卡牌...',
      '匹配卡牌數據庫...',
      '驗證卡牌信息...',
      '獲取卡牌詳情...',
    ],
    prediction: [
      '正在預測價格...',
      '分析市場數據...',
      '計算價格趨勢...',
      '生成價格報告...',
    ],
  };

  // 圖標配置
  const iconConfig = {
    default: 'loading',
    upload: 'cloud-upload-outline',
    analysis: 'magnify-scan',
    recognition: 'card-search-outline',
    prediction: 'chart-line',
  };

  // 顏色主題
  const getThemeColors = () => {
    if (theme === 'dark' || (theme === 'auto' && shouldUseDarkTheme())) {
      return {
        background: 'rgba(0, 0, 0, 0.8)',
        card: '#2A2A2A',
        primary: COLORS.primary,
        text: '#FFFFFF',
        subText: '#CCCCCC',
        progress: '#4A90E2',
      };
    }
    return {
      background: 'rgba(255, 255, 255, 0.95)',
      card: '#FFFFFF',
      primary: COLORS.primary,
      text: '#333333',
      subText: '#666666',
      progress: '#4A90E2',
    };
  };
  const colors = getThemeColors();

  // 動畫效果
  useEffect(() => {
    if (visible) {
      // 淡入動畫
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // 旋轉動畫
      const spinAnimationLoop = Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      );
      spinAnimationLoop.start();
      // 脈衝動畫
      const pulseAnimationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimationLoop.start();
      return () => {
        spinAnimationLoop.stop();
        pulseAnimationLoop.stop();
      };
    }
    // 淡出動畫
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // 進度動畫
  useEffect(() => {
    if (showProgress) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress]);

  // 動態消息輪換
  useEffect(() => {
    if (visible && !message) {
      const messages = messageConfig[type] || messageConfig.default;
      const interval = setInterval(() => {
        messageRotation.current = (messageRotation.current + 1) % messages.length;
        setCurrentMessage(messages[messageRotation.current]);
      }, 2000);
      return () => clearInterval(interval);
    } else if (message) {
      setCurrentMessage(message);
    }
  }, [visible, type, message]);

  // 判斷是否使用深色主題
  const shouldUseDarkTheme = () => {
    // 這裡可以根據系統主題或時間判斷
    return false;
  };

  // 渲染進度條
  const renderProgressBar = () => {
    if (!showProgress) {
      return null;
    }
    return (
      <View style = { styles.progressContainer }>
        <View style={ [styles.progressTrack, { backgroundColor: `${colors.subText }30` }]}>
          <Animated.View
            style={
              [
                styles.progressFill,
                {
                  backgroundColor: colors.progress,
                  width: animatedProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.subText }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    );
  };

  // 渲染加載圖標
  const renderLoadingIcon = () => {
    const iconName = iconConfig[type] || iconConfig.default;
    const spin = spinAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <Animated.View
        style = {
          [
            styles.iconContainer,
            {
              transform: [
                { scale: pulseAnimation,
                },
                { rotate: spin },
              ],
            },
          ]}
      >
        <LinearGradient
          colors={ [colors.primary, colors.progress] }
          style={ styles.iconGradient }
          start={ { x: 0, y: 0 }}
          end={ { x: 1, y: 1 }}
        >
          <Icon
            name={iconName}
            size={32}
            color="#FFFFFF"
          />
        </LinearGradient>
      </Animated.View>
    );
  };

  // 渲染取消按鈕
  const renderCancelButton = () => {
    if (!showCancel || !onCancel) {
      return null;
    }
    return (
      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: colors.subText }]}
        onPress={onCancel}
        activeOpacity={0.7}
      >
        <Text style={[styles.cancelText, { color: colors.subText }]}>
          取消
        </Text>
      </TouchableOpacity>
    );
  };
  if (!visible) {
    return null;
  }
  return (
    <Animated.View
      style={[
        styles.overlay,
        { backgroundColor: colors.background, opacity: fadeAnimation },
      ]}
    >
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        {renderLoadingIcon()}
        <Text style={[styles.message, { color: colors.text }]}>
          {currentMessage}
        </Text>
        {subMessage ? (
          <Text style={[styles.subMessage, { color: colors.subText }]}>
            {subMessage}
          </Text>
        ) : null}
        {renderProgressBar()}
        {renderCancelButton()}
      </View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  cancelButton: {
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 10,
    maxWidth: width * 0.9,
    minWidth: width * 0.7,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: { marginBottom: 20 },
  iconGradient: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  progressFill: {
    borderRadius: 2,
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressTrack: {
    borderRadius: 2,
    height: 4,
    marginBottom: 8,
    overflow: 'hidden',
    width: '100%',
  },
  subMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SmartLoadingIndicator;
