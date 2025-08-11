import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colors';

const PerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const animationFrameId = useRef(null);

  // 計算FPS
  const calculateFPS = () => {
    frameCount.current++;
    const currentTime = Date.now();

    if (currentTime - lastTime.current >= 1000) {
      const currentFps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      setFps(currentFps);
      frameCount.current = 0;
      lastTime.current = currentTime;
    }

    animationFrameId.current = requestAnimationFrame(calculateFPS);
  };

  // 監控記憶體使用
  const monitorMemory = () => {
    if (global.performance && global.performance.memory) {
      const memory = global.performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      setMemoryUsage(usedMB);
    }
  };

  // 顯示/隱藏監控器
  const toggleVisibility = () => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    // 開發環境下顯示性能監控
    if (__DEV__) {
      setIsVisible(true);
      fadeAnim.setValue(1);
    }

    // 開始FPS監控
    calculateFPS();

    // 定期檢查記憶體使用
    const memoryInterval = setInterval(monitorMemory, 2000);

    // 添加手勢監聽（三指點擊切換顯示）
    const handleTouch = (event) => {
      if (event.touches.length === 3) {
        toggleVisibility();
      }
    };

    // 清理函數
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearInterval(memoryInterval);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const getPerformanceColor = () => {
    if (fps >= 55) {
      return COLORS.SUCCESS;
    }
    if (fps >= 45) {
      return COLORS.WARNING;
    }
    return COLORS.ERROR;
  };

  const getMemoryColor = () => {
    if (memoryUsage < 100) {
      return COLORS.SUCCESS;
    }
    if (memoryUsage < 200) {
      return COLORS.WARNING;
    }
    return COLORS.ERROR;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.monitor}>
        <Text style={styles.title}>性能監控</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.label}>FPS</Text>
            <Text style={[styles.value, { color: getPerformanceColor() }]}>
              {fps}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.label}>記憶體</Text>
            <Text style={[styles.value, { color: getMemoryColor() }]}>
              {memoryUsage}MB
            </Text>
          </View>
        </View>
        <Text style={styles.hint}>三指點擊切換顯示</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 10,
    top: 50,
    zIndex: 9999,
  },
  hint: {
    color: COLORS.WHITE,
    fontSize: 8,
    marginTop: 4,
    opacity: 0.6,
    textAlign: 'center',
  },
  label: {
    color: COLORS.WHITE,
    fontSize: 10,
    opacity: 0.8,
  },
  metric: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monitor: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    minWidth: 120,
    padding: 12,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PerformanceMonitor;
