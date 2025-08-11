import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { login } from '../../store/slices/authSlice';
import { COLORS, TEXT_STYLES } from '../../constants';
import socialAuthService from '../../services/socialAuthService';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.error'), t('auth.please_fill_all_fields'));
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (error) {
      // Error is handled by Redux slice
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      let result;
      // 根據不同的社交登入提供商進行處理
      switch (provider) {
        case 'google':
          result = await socialAuthService.googleLogin();
          break;
        case 'facebook':
          result = await socialAuthService.facebookLogin();
          break;
        case 'apple':
          result = await socialAuthService.appleLogin();
          break;
        default:
          throw new Error(`不支援的登入方式: ${provider}`);
      }
      if (result.success) {
        // 使用真實的社交登入數據
        await dispatch(login({
          email: result.user.email,
          password: null,
          socialLogin: true,
          socialData: result.user,
        })).unwrap();
      } else {
        throw new Error('社交登入失敗');
      }
    } catch (error) {
      Alert.alert(
        t('auth.error'),
        t('auth.social_login_failed') || '社交登入失敗，請稍後再試',
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={ styles.container }
      behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }
    >
      <View style={ styles.container }>
        <ScrollView
          style={ styles.scrollView }
          contentContainerStyle={ styles.scrollContent }
          showsVerticalScrollIndicator={ false }
        >
          { /* Header */ }
          <View style={ styles.header }>
            <View style={ styles.logoContainer }>
              <View style={ styles.logo }>
                <Icon name="trending-up" size={ 40 } color="#00ffff" />
                <Text style={ styles.logoText }>TCG</Text>
              </View>
            </View>
            <Text style={ styles.appName }>TCG 助手</Text>
          </View>
          { /* Login Form */ }
          <View style={ styles.formContainer }>
            <View style={ styles.formCard }>
              <TouchableOpacity
                style={ styles.loginButton }
                onPress={ handleLogin }
                disabled={ isLoading }
              >
                <Text style={ styles.loginButtonText }>登入</Text>
              </TouchableOpacity>
              <Text style={ styles.orText }>還未有帐户?</Text>
              <TouchableOpacity
                style={ styles.registerButton }
                onPress={ handleRegister }
              >
                <Text style={ styles.registerButtonText }>注册</Text>
              </TouchableOpacity>
              <View style={ styles.divider }>
                <View style={ styles.dividerLine } />
                <Text style={ styles.dividerText }>或</Text>
                <View style={ styles.dividerLine } />
              </View>
              <View style={ styles.socialButtons }>
                <TouchableOpacity
                  style={ styles.socialButton }
                  onPress={ () => handleSocialLogin('phone') }
                >
                  <Icon name="phone" size={ 20 } color="#fff" />
                  <Text style={ styles.socialButtonText }>使用手机验证码登入</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={ styles.socialButton }
                  onPress={ () => handleSocialLogin('email') }
                >
                  <Icon name="email" size={ 20 } color="#fff" />
                  <Text style={ styles.socialButtonText }>使用电子邮件登入</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={ styles.socialButton }
                  onPress={ () => handleSocialLogin('google') }
                >
                  <Icon name="google" size={ 20 } color="#fff" />
                  <Text style={ styles.socialButtonText }>使用 Google 登入</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={ styles.socialButton }
                  onPress={ () => handleSocialLogin('facebook') }
                >
                  <Icon name="facebook" size={ 20 } color="#fff" />
                  <Text style={ styles.socialButtonText }>使用Facebook 登入</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          { /* Disclaimer */ }
          <View style={ styles.disclaimerContainer }>
            <Text style={ styles.disclaimerTitle }>免责声明</Text>
            <Text style={ styles.disclaimerText }>
              本应用仅用于卡牌检索、卡牌授权、价格分析、真伪判断及相关服务。不得用于任何非法用途，信息仅供参考，投资需谨慎。
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
  },
  disclaimerContainer: { paddingHorizontal: 24 },
  disclaimerText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
  },
  disclaimerTitle: {
    color: '#ff9800',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  dividerLine: {
    backgroundColor: '#00ffff',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 15,
  },
  formCard: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
  },
  formContainer: { paddingHorizontal: 24 },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: height * 0.1,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#00ffff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
  },
  loginButtonText: {
    color: '#1A1F71',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 2,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  logoContainer: { marginBottom: 20 },
  logoText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  orText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 20,
    padding: 15,
  },
  registerButtonText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  scrollView: { flex: 1 },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 15,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  socialButtons: { gap: 10 },
});

export default LoginScreen;
