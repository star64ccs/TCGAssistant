import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { updateProfile } from '../store/slices/authSlice';
import { imageUtils } from '../utils/imageUtils';
import { validationUtils } from '../utils/validationUtils';

const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // 驗證姓名
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能為空';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = '姓名長度必須在2-50個字符之間';
    }

    // 驗證電子郵件
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }

    // 驗證電話號碼（可選）
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = '請輸入有效的電話號碼';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async () => {
    try {
      setIsAvatarLoading(true);
      
      // 模擬圖片選擇和上傳
      const mockImageUri = 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=Avatar';
      
      setFormData(prev => ({
        ...prev,
        avatar: mockImageUri
      }));
      
      Alert.alert('成功', '頭像已更新');
    } catch (error) {
      Alert.alert('錯誤', '頭像上傳失敗，請重試');
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      await dispatch(updateProfile(formData)).unwrap();
      
      Alert.alert('成功', '個人資料已更新', [
        { text: '確定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('錯誤', error.message || '更新失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除該字段的錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const renderInputField = (field, label, placeholder, keyboardType = 'default', autoCapitalize = 'words') => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, errors[field] && styles.textInputError]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#00ffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>編輯個人資料</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>{isLoading ? '保存中...' : '保存'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {formData.avatar ? (
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={60} color="#666" />
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handleAvatarUpload}
              disabled={isAvatarLoading}
            >
              <Icon name="camera" size={20} color="#00ffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>點擊相機圖標更換頭像</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {renderInputField('name', '姓名', '請輸入您的姓名')}
          {renderInputField('email', '電子郵件', '請輸入您的電子郵件', 'email-address', 'none')}
          {renderInputField('phone', '電話號碼', '請輸入您的電話號碼（選填）', 'phone-pad')}
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>個人資料說明</Text>
          <Text style={styles.infoText}>
            • 您的個人資料將用於改善服務體驗{'\n'}
            • 電子郵件用於重要通知和帳戶安全{'\n'}
            • 電話號碼為可選項目，用於緊急聯繫
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00ffff',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00ffff',
    backgroundColor: '#2A2F81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2F81',
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2A2F81',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  textInputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: '#2A2F81',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});

export default EditProfileScreen;
