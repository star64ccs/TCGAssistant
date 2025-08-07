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
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TEXT_STYLES, GRADIENT_PRIMARY } from '../../constants';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('auth.error'), t('auth.please_enter_email'));
      return;
    }

    // 簡單的電子郵件驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('auth.error'), t('auth.invalid_email'));
      return;
    }

    setIsLoading(true);

    try {
      // 模擬發送重設密碼郵件
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        t('auth.reset_password_sent'),
        t('auth.check_email_for_reset'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('auth.error'), t('auth.reset_password_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient colors={GRADIENT_PRIMARY} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Icon name="arrow-left" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('auth.forgot_password')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.forgot_password_description')}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                placeholderTextColor={COLORS.GRAY}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>{t('common.sending')}</Text>
              ) : (
                <Text style={styles.buttonText}>{t('auth.send_reset_link')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backToLoginText}>
                {t('auth.back_to_login')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
  },
  title: {
    ...TEXT_STYLES.title,
    color: COLORS.WHITE,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.WHITE,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 30,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
  },
  resetButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    ...TEXT_STYLES.button,
    color: COLORS.WHITE,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToLoginText: {
    ...TEXT_STYLES.body,
    color: COLORS.PRIMARY,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
