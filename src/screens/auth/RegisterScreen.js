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
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { register } from '../../store/slices/authSlice';
import { upgradeMembership } from '../../store/slices/membershipSlice';
import { COLORS, TEXT_STYLES, MEMBERSHIP_TYPES } from '../../constants';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptVIPTrial, setAcceptVIPTrial] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone } = formData;

    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert(t('auth.error'), t('auth.please_fill_all_fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.error'), t('auth.passwords_not_match'));
      return;
    }

    if (!acceptTerms) {
      Alert.alert(t('auth.error'), t('auth.accept_terms_required'));
      return;
    }

    try {
      await dispatch(register({ name, email, password, phone })).unwrap();
      
      // If user accepted VIP trial, upgrade membership
      if (acceptVIPTrial) {
        await dispatch(upgradeMembership({ 
          membershipType: MEMBERSHIP_TYPES.VIP_TRIAL, 
          trialDays: 7 
        })).unwrap();
      }
    } catch (error) {
      // Error is handled by Redux slice
    }
  };

  const handleSocialRegister = (provider) => {
    Alert.alert(t('common.info'), `${t('auth.social_register')} ${provider} ${t('common.coming_soon')}`);
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Icon name="trending-up" size={40} color="#00ffff" />
                <Text style={styles.logoText}>TCG</Text>
              </View>
            </View>
            <Text style={styles.appName}>TCG 助手</Text>
          </View>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>注册</Text>
              </TouchableOpacity>

              <Text style={styles.orText}>遑未有帳户?</Text>

              {/* Form Fields */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>姓名</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入姓名"
                  placeholderTextColor="#666"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>電子郵件</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入電子郵件"
                  placeholderTextColor="#666"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>密碼</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入密碼"
                  placeholderTextColor="#666"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>買入電話 (选填)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入電話號碼"
                  placeholderTextColor="#666"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Terms and VIP Trial */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  免費下載、先註冊以開始使用免费会員能以及推荐订阅VIP试用
                </Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>免责声明</Text>
            <Text style={styles.disclaimerText}>
              本应用仅用于卡牌检索、卡牌授权、价格分析、真伪判断及相关服务。不得用于任何非法用途，信息仅供参考，投资需谨慎。
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffff',
    marginTop: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: '#2A2F81',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  registerButton: {
    backgroundColor: '#00ffff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#1A1F71',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1F71',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  termsContainer: {
    marginTop: 20,
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  disclaimerContainer: {
    paddingHorizontal: 24,
  },
  disclaimerTitle: {
    color: '#ff9800',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  disclaimerText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
  },
});

export default RegisterScreen;
