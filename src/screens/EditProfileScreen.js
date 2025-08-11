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
  const { t,
  } = useTranslation();
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
      // 使用用戶認證服務上傳頭像
      const userAuthService = require('../services/userAuthService').default;
      // 模擬圖片選擇
      const mockImageFile = {
        uri: 'file://mock-avatar.jpg',
        type: 'image/jpeg',
        name: 'avatar.jpg',
      };
      const result = await userAuthService.uploadAvatar(mockImageFile);
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          avatar: result.avatarUrl,
        }));
        Alert.alert('成功', result.message);
      } else {
        throw new Error(result.error || '頭像上傳失敗');
      }
    } catch (error) {
      Alert.alert('錯誤', error.message || '頭像上傳失敗，請重試');
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
        { text: '確定', onPress: () => navigation.goBack(),
        },
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
      [field]: value,
    }));

    // 清除該字段的錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const renderInputField = (field, label, placeholder, keyboardType = 'default', autoCapitalize = 'words') => (
    <View style={ styles.inputContainer }>
      <Text style={ styles.inputLabel }>{ label }</Text>
      <TextInput
        style={ [styles.textInput, errors[field] && styles.textInputError] }
        placeholder={ placeholder }
        placeholderTextColor="#666"
        value={ formData[field] }
        onChangeText={ (value) => handleInputChange(field, value) }
        keyboardType={ keyboardType }
        autoCapitalize={ autoCapitalize }
        autoCorrect={ false }
      />
      {
        errors[field] ? <Text style={styles.errorText
          }>{ errors[field] }</Text> : null}
    </View>
  );

  return (
    <View style={ styles.container }>
      { /* Header */ }
      <View style={ styles.header }>
        <TouchableOpacity style={ styles.backButton } onPress={ () => navigation.goBack() }>
          <Icon name="arrow-left" size={ 24 } color="#00ffff" />
        </TouchableOpacity>
        <Text style={ styles.headerTitle }>編輯個人資料</Text>
        <TouchableOpacity
          style={ [styles.saveButton, isLoading && styles.saveButtonDisabled] }
          onPress={ handleSave }
          disabled={ isLoading }
        >
          <Text style={ styles.saveButtonText }>{ isLoading ? '保存中...' : '保存' }</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={ styles.scrollView } showsVerticalScrollIndicator={ false }>
        { /* Avatar Section */ }
        <View style={ styles.avatarSection }>
          <View style={ styles.avatarContainer }>
            {
              formData.avatar ? (
                <Image source={{ uri: formData.avatar,
                }} style={ styles.avatar } />
              ) : (
                <View style={ styles.avatarPlaceholder }>
                  <Icon name="account" size={ 60 } color="#666" />
                </View>
              )}
            <TouchableOpacity
              style={ styles.avatarEditButton }
              onPress={ handleAvatarUpload }
              disabled={ isAvatarLoading }
            >
              <Icon name="camera" size={ 20 } color="#00ffff" />
            </TouchableOpacity>
          </View>
          <Text style={ styles.avatarHint }>點擊相機圖標更換頭像</Text>
        </View>
        { /* Form Fields */ }
        <View style={ styles.formContainer }>
          { renderInputField('name', '姓名', '請輸入您的姓名') }
          { renderInputField('email', '電子郵件', '請輸入您的電子郵件', 'email-address', 'none') }
          { renderInputField('phone', '電話號碼', '請輸入您的電話號碼（選填）', 'phone-pad') }
        </View>
        { /* Additional Info */ }
        <View style={ styles.infoSection }>
          <Text style={ styles.infoTitle }>個人資料說明</Text>
          <Text style={ styles.infoText }>
            • 您的個人資料將用於改善服務體驗{ '\n' }
            • 電子郵件用於重要通知和帳戶安全{ '\n' }
            • 電話號碼為可選項目，用於緊急聯繫
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderColor: '#00ffff',
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    width: 120,
  },
  avatarContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  avatarEditButton: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 18,
    borderWidth: 2,
    bottom: 0,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 36,
  },
  avatarHint: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  backButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 5,
  },
  formContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 15,
    borderWidth: 1,
    marginHorizontal: 20,
    padding: 20,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: { marginBottom: 20 },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#00ffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: '#1A1F71',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: { flex: 1 },
  textInput: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 12,
    borderWidth: 1,
    color: '#fff',
    fontSize: 16,
    padding: 15,
  },
  textInputError: { borderColor: '#f44336' },
});

export default EditProfileScreen;
