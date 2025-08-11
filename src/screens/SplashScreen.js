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
    Animated.parallel([      Animated.timing(fadeAnim, {        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={ styles.container }>      <Animated.View        style={
          [            styles.content,            {              opacity: fadeAnim,
              transform: [{ scale: scaleAnim,
              }],            },          ]}      >        { /* Logo */ }        <View style={ styles.logoContainer }>          <View style={ styles.logo }>            <Icon name="trending-up" size={ 60 } color="#00ffff" />            <Text style={ styles.logoText }>TCG</Text>          </View>        </View>        { /* 應用程式名稱 */ }        <Text style={ styles.appName }>TCG 助手</Text>        { /* 副標題 */ }        <Text style={ styles.subtitle }>智能卡牌辨識與分析</Text>        { /* 載入指示器 */ }        <View style={ styles.loadingContainer }>          <View style={ styles.loadingDot } />          <View style={ [styles.loadingDot, styles.loadingDot2] } />          <View style={ [styles.loadingDot, styles.loadingDot3] } />        </View>        { /* 版本資訊 */ }        <View style={ styles.versionContainer }>          <Text style={ styles.versionText }>版本 1.0.0</Text>          <Text style={ styles.copyrightText }>© 2024 TCG Assistant Team</Text>        </View>      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#1A1F71',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyrightText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 50,
  },
  loadingDot: {
    backgroundColor: '#00ffff',
    borderRadius: 6,
    height: 12,
    marginHorizontal: 4,
    opacity: 0.6,
    width: 12,
  },
  loadingDot2: { opacity: 0.8 },
  loadingDot3: { opacity: 1 },
  logo: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 3,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  logoContainer: { marginBottom: 20 },
  logoText: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 50,
    opacity: 0.9,
    textAlign: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    bottom: 50,
    position: 'absolute',
  },
  versionText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
    opacity: 0.7,
  },
});

export default SplashScreen;
