import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TEXT_STYLES } from '../../constants';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone } = formData;

    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert(t('common.error'), t('auth.fill_all_fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwords_not_match'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.password_too_short'));
      return;
    }

    try {
      // 這裡應該調用註冊 API
      Alert.alert(t('common.success'), t('auth.registration_success'));
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.registration_failed'));
    }
  };

  const handleSocialRegister = (provider) => {
    Alert.alert(t('common.info'), `${t('auth.social_register')} ${provider} ${t('common.coming_soon')}`);
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>TCG</Text>
            </View>
          </View>
          <Text style={styles.appName}>{t('common.app_name')}</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.name')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder={t('auth.enter_name')}
                placeholderTextColor="#ccc"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.email')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                placeholder={t('auth.enter_email')}
                placeholderTextColor="#ccc"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.phone')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                placeholder={t('auth.enter_phone')}
                placeholderTextColor="#ccc"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.password')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                placeholder={t('auth.enter_password')}
                placeholderTextColor="#ccc"
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.confirm_password')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                placeholder={t('auth.confirm_password')}
                placeholderTextColor="#ccc"
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>{t('auth.or')}</Text>
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: '#2A2F81', borderColor: '#00ffff' }]}
              onPress={() => handleSocialRegister('Google')}
            >
              <Text style={styles.registerButtonText}>{t('auth.register_with_google')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: '#2A2F81', borderColor: '#00ffff' }]}
              onPress={() => handleSocialRegister('Apple')}
            >
              <Text style={styles.registerButtonText}>{t('auth.register_with_apple')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t('auth.terms_agreement')}
            </Text>
          </View>
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>{t('auth.disclaimer_title')}</Text>
            <Text style={styles.disclaimerText}>
              {t('auth.disclaimer_text')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  disclaimerContainer: {
    paddingHorizontal: 24,
  },
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
  formCard: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: height * 0.1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
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
  logoContainer: {
    marginBottom: 20,
  },
  logoText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  orText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: '#00ffff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
  },
  registerButtonText: {
    color: '#1A1F71',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
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
  textInput: {
    backgroundColor: '#1A1F71',
    borderColor: '#00ffff',
    borderRadius: 12,
    borderWidth: 1,
    color: '#fff',
    fontSize: 16,
    padding: 15,
  },
});

export default RegisterScreen;
