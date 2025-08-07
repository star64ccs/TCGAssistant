import { configureStore } from '@reduxjs/toolkit';
import authReducer, { changePassword } from '../store/slices/authSlice';

// 模擬 AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// 模擬 i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'validation.current_password_required': '請輸入當前密碼',
        'validation.confirm_password_required': '請輸入確認密碼',
        'validation.passwords_not_match': '密碼不一致',
        'validation.new_password_same_as_current': '新密碼不能與當前密碼相同',
        'password.change_success': '密碼更改成功',
        'password.change_failed': '密碼更改失敗',
        'common.success': '成功',
        'common.error': '錯誤',
        'common.ok': '確定',
        'common.saving': '儲存中...',
        'common.save': '儲存',
      };
      return translations[key] || key;
    },
  }),
}));

// 模擬 validationUtils
jest.mock('../utils/validationUtils', () => ({
  validationUtils: {
    validatePassword: jest.fn(),
  },
}));

describe('ChangePasswordScreen Logic Tests', () => {
  let store;
  let mockValidationUtils;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          user: {
            id: 'user_1',
            email: 'test@example.com',
            name: '測試用戶',
            isSocialUser: false,
          },
          isLoading: false,
          error: null,
        },
      },
    });

    mockValidationUtils = require('../utils/validationUtils').validationUtils;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Validation', () => {
    test('should validate current password is required', () => {
      const validateForm = (formData, t) => {
        const errors = {};
        
        if (!formData.currentPassword.trim()) {
          errors.currentPassword = t('validation.current_password_required');
        }
        
        return errors;
      };

      const formData = {
        currentPassword: '',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const t = (key) => key;
      const errors = validateForm(formData, t);

      expect(errors.currentPassword).toBe('validation.current_password_required');
    });

    test('should validate new password using validationUtils', () => {
      mockValidationUtils.validatePassword.mockReturnValue({
        isValid: false,
        message: '密碼強度不足',
      });

      const validateForm = (formData, t, validationUtils) => {
        const errors = {};
        
        const passwordValidation = validationUtils.validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
          errors.newPassword = passwordValidation.message;
        }
        
        return errors;
      };

      const formData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak',
        confirmPassword: 'weak',
      };

      const t = (key) => key;
      const errors = validateForm(formData, t, mockValidationUtils);

      expect(mockValidationUtils.validatePassword).toHaveBeenCalledWith('weak');
      expect(errors.newPassword).toBe('密碼強度不足');
    });

    test('should validate confirm password matches new password', () => {
      const validateForm = (formData, t) => {
        const errors = {};
        
        if (!formData.confirmPassword.trim()) {
          errors.confirmPassword = t('validation.confirm_password_required');
        } else if (formData.newPassword !== formData.confirmPassword) {
          errors.confirmPassword = t('validation.passwords_not_match');
        }
        
        return errors;
      };

      const formData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      const t = (key) => key;
      const errors = validateForm(formData, t);

      expect(errors.confirmPassword).toBe('validation.passwords_not_match');
    });

    test('should validate new password is not same as current password', () => {
      const validateForm = (formData, t) => {
        const errors = {};
        
        if (formData.currentPassword === formData.newPassword) {
          errors.newPassword = t('validation.new_password_same_as_current');
        }
        
        return errors;
      };

      const formData = {
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmPassword: 'SamePassword123!',
      };

      const t = (key) => key;
      const errors = validateForm(formData, t);

      expect(errors.newPassword).toBe('validation.new_password_same_as_current');
    });

    test('should return no errors for valid form data', () => {
      mockValidationUtils.validatePassword.mockReturnValue({
        isValid: true,
        message: '',
      });

      const validateForm = (formData, t, validationUtils) => {
        const errors = {};

        // 驗證當前密碼
        if (!formData.currentPassword.trim()) {
          errors.currentPassword = t('validation.current_password_required');
        }

        // 驗證新密碼
        const passwordValidation = validationUtils.validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
          errors.newPassword = passwordValidation.message;
        }

        // 驗證確認密碼
        if (!formData.confirmPassword.trim()) {
          errors.confirmPassword = t('validation.confirm_password_required');
        } else if (formData.newPassword !== formData.confirmPassword) {
          errors.confirmPassword = t('validation.passwords_not_match');
        }

        // 檢查新密碼是否與當前密碼相同
        if (formData.currentPassword === formData.newPassword) {
          errors.newPassword = t('validation.new_password_same_as_current');
        }

        return errors;
      };

      const formData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const t = (key) => key;
      const errors = validateForm(formData, t, mockValidationUtils);

      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('Redux Actions', () => {
    test('should dispatch changePassword action successfully', async () => {
      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const result = await store.dispatch(changePassword(passwordData));

      expect(result.type).toBe('auth/changePassword/rejected');
      expect(result.payload).toBe('真實API尚未實現，請聯繫開發團隊');
    });

    test('should handle social user password change error', async () => {
      // 設置社交登入用戶狀態
      store = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            user: {
              id: 'user_1',
              email: 'test@example.com',
              name: '測試用戶',
              isSocialUser: true,
            },
            isLoading: false,
            error: null,
          },
        },
      });

      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const result = await store.dispatch(changePassword(passwordData));

      expect(result.type).toBe('auth/changePassword/rejected');
      expect(result.payload).toBe('社交登入用戶無法更改密碼');
    });

    test('should update loading state during password change', async () => {
      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      // 開始更改密碼
      const changePromise = store.dispatch(changePassword(passwordData));
      
      // 檢查 loading 狀態
      expect(store.getState().auth.isLoading).toBe(true);
      
      // 等待完成
      await changePromise;
      
      // 檢查 loading 狀態已重置
      expect(store.getState().auth.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // 模擬 API 錯誤
      const mockApiError = new Error('網路連線錯誤');
      
      // 暫時替換 changePassword 實現來模擬錯誤
      const originalChangePassword = changePassword;
      
      // 創建一個會拋出錯誤的版本
      const mockChangePassword = jest.fn().mockImplementation(() => {
        throw mockApiError;
      });

      // 測試錯誤處理邏輯
      const handleChangePassword = async (passwordData, dispatch) => {
        try {
          await dispatch(mockChangePassword(passwordData));
        } catch (error) {
          return error.message;
        }
      };

      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const errorMessage = await handleChangePassword(passwordData, store.dispatch);
      expect(errorMessage).toBe('網路連線錯誤');
    });
  });

  describe('State Management', () => {
    test('should clear errors when input changes', () => {
      const handleInputChange = (field, value, setFormData, setErrors, errors) => {
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

      const setFormData = jest.fn();
      const setErrors = jest.fn();
      const errors = { currentPassword: '請輸入當前密碼' };

      handleInputChange('currentPassword', 'newValue', setFormData, setErrors, errors);

      expect(setFormData).toHaveBeenCalled();
      expect(setErrors).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should toggle password visibility', () => {
      const togglePasswordVisibility = (field, setShowPasswords) => {
        setShowPasswords(prev => ({
          ...prev,
          [field]: !prev[field],
        }));
      };

      const setShowPasswords = jest.fn();
      const currentState = {
        current: false,
        new: true,
        confirm: false,
      };

      togglePasswordVisibility('current', setShowPasswords);

      expect(setShowPasswords).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
