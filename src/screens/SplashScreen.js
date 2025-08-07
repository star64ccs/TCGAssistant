import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Icon name="trending-up" size={60} color="#00ffff" />
            <Text style={styles.logoText}>TCG</Text>
          </View>
        </View>

        {/* 應用程式名稱 */}
        <Text style={styles.appName}>TCG 助手</Text>
        
        {/* 副標題 */}
        <Text style={styles.subtitle}>智能卡牌辨識與分析</Text>

        {/* 載入指示器 */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDot2]} />
          <View style={[styles.loadingDot, styles.loadingDot3]} />
        </View>

        {/* 版本資訊 */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>版本 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 TCG Assistant Team</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    marginTop: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ffff',
    marginHorizontal: 4,
    opacity: 0.6,
  },
  loadingDot2: {
    opacity: 0.8,
  },
  loadingDot3: {
    opacity: 1,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.5,
  },
});

export default SplashScreen;
