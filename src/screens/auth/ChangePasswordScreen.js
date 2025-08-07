import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ROUTES } from '../../constants';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { changePassword } from '../../store/slices/authSlice';
import { validationUtils } from '../../utils/validationUtils';

const ChangePasswordScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const { isLoading, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 驗證表單
  const validateForm = () => {
    const newErrors = {};

    // 驗證當前密碼
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = t('validation.current_password_required');
    }

    // 驗證新密碼
    const passwordValidation = validationUtils.validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.message;
    }

    // 驗證確認密碼
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('validation.confirm_password_required');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwords_not_match');
    }

    // 檢查新密碼是否與當前密碼相同
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = t('validation.new_password_same_as_current');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理輸入變更
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 清除對應的錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // 切換密碼顯示
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // 處理密碼更改
  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })).unwrap();

      if (result.success) {
        Alert.alert(
          t('common.success'),
          t('password.change_success'),
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error || t('password.change_failed'),
        [{ text: t('common.ok') }]
      );
    }
  };

  // 處理取消
  const handleCancel = () => {
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      Alert.alert(
        t('common.confirm'),
        t('password.cancel_confirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.ok'), onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Icon name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('password.change_password')}</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? t('common.saving') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* 當前密碼 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password.current_password')}</Text>
            <View style={[styles.inputWrapper, errors.currentPassword && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                placeholder={t('password.current_password_placeholder')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('current')}
              >
                <Icon
                  name={showPasswords.current ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          {/* 新密碼 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password.new_password')}</Text>
            <View style={[styles.inputWrapper, errors.newPassword && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                placeholder={t('password.new_password_placeholder')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('new')}
              >
                <Icon
                  name={showPasswords.new ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          {/* 確認新密碼 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password.confirm_password')}</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder={t('password.confirm_password_placeholder')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('confirm')}
              >
                <Icon
                  name={showPasswords.confirm ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* 密碼要求提示 */}
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>{t('password.requirements_title')}</Text>
            <Text style={styles.requirementText}>• {t('password.requirement_length')}</Text>
            <Text style={styles.requirementText}>• {t('password.requirement_uppercase')}</Text>
            <Text style={styles.requirementText}>• {t('password.requirement_lowercase')}</Text>
            <Text style={styles.requirementText}>• {t('password.requirement_number')}</Text>
            <Text style={styles.requirementText}>• {t('password.requirement_special')}</Text>
          </View>

          {/* 社交登入用戶提示 */}
          {user?.isSocialUser && (
            <View style={styles.socialNotice}>
              <Icon name="information" size={16} color={colors.warning} />
              <Text style={styles.socialNoticeText}>
                {t('password.social_login_notice')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  form: {
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    ...typography.body1,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.textPrimary,
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  passwordRequirements: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  requirementsTitle: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  socialNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  socialNoticeText: {
    ...typography.caption,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
});

export default ChangePasswordScreen;
