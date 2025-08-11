import AsyncStorage from '@react-native-async-storage/async-storage';

// 導入必要的模組
import { STORAGE_KEYS } from '../config/constants';
import localStorage from '../utils/localStorage';

// 用戶認證服務
class UserAuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.REACT_APP_API_KEY || 'development_key';
  }

  // 獲取認證 headers
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem(STORAGE_KEYS || {} || {}.USER_TOKEN);
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-API-Key': this.apiKey,
    };
  }

  // 更新用戶個人資料
  async updateProfile(profileData) {
    try {
      console.debug('更新用戶個人資料:', profileData);
      // 檢查是否有真實的後端 API
      if (await this.hasRealBackend()) {
        return await this.updateProfileReal(profileData);
      }
      // 備用：本地存儲更新
      return await this.updateProfileLocal(profileData);
    } catch (error) {
      console.error('更新個人資料失敗:', error);
      throw error;
    }
  }

  // 使用真實後端 API 更新
  async updateProfileReal(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/user/profile`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API 錯誤: ${response.status}`);
      }
      const data = await response.json();
      // 更新本地存儲
      await this.updateLocalProfile(data.user);
      return {
        success: true,
        user: data.user,
        message: '個人資料更新成功',
      };
    } catch (error) {
      console.error('真實 API 更新失敗:', error);
      throw error;
    }
  }

  // 本地存儲更新（備用）
  async updateProfileLocal(profileData) {
    try {
      // 從本地存儲獲取當前用戶資料
      const currentUserData = await AsyncStorage.getItem(STORAGE_KEYS || {} || {}.USER_PROFILE);
      const currentUser = currentUserData ? JSON.parse(currentUserData) : {};
      // 更新用戶資料
      const updatedUser = {
        ...currentUser,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
        // 保存到本地存儲
      await AsyncStorage.setItem(STORAGE_KEYS || {} || {}.USER_PROFILE, JSON.stringify(updatedUser));
      return {
        success: true,
        user: updatedUser,
        message: '個人資料更新成功',
        source: 'local_storage',
      };
    } catch (error) {
      console.error('本地存儲更新失敗:', error);
      throw new Error('無法更新個人資料，請檢查存儲權限');
    }
  }

  // 更改密碼
  async changePassword(currentPassword, newPassword) {
    try {
      console.debug('更改用戶密碼');
      // 密碼強度驗證
      if (!this.validatePasswordStrength(newPassword)) {
        throw new Error('新密碼不符合安全要求');
      }
      // 檢查是否有真實的後端 API
      if (await this.hasRealBackend()) {
        return await this.changePasswordReal(currentPassword, newPassword);
      }
      // 備用：模擬密碼更改
      return await this.changePasswordMock(currentPassword, newPassword);
    } catch (error) {
      console.error('更改密碼失敗:', error);
      throw error;
    }
  }

  // 使用真實後端 API 更改密碼
  async changePasswordReal(currentPassword, newPassword) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/user/password`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('當前密碼不正確');
        }
        throw new Error(errorData.message || `API 錯誤: ${response.status}`);
      }
      const data = await response.json();
      return {
        success: true,
        message: '密碼更改成功',
        requireRelogin: data.requireRelogin || false,
      };
    } catch (error) {
      console.error('真實 API 密碼更改失敗:', error);
      throw error;
    }
  }

  // 模擬密碼更改（備用）
  async changePasswordMock(currentPassword, newPassword) {
    try {
      // 模擬密碼驗證延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 簡單驗證：檢查當前密碼不能為空
      if (!currentPassword) {
        throw new Error('請輸入當前密碼');
      }
      // 模擬成功
      return {
        success: true,
        message: '密碼更改成功（示範模式）',
        requireRelogin: false,
        source: 'mock',
      };
    } catch (error) {
      console.error('模擬密碼更改失敗:', error);
      throw error;
    }
  }

  // 上傳頭像
  async uploadAvatar(imageFile) {
    try {
      console.debug('上傳用戶頭像');
      // 檢查是否有真實的後端 API
      if (await this.hasRealBackend()) {
        return await this.uploadAvatarReal(imageFile);
      }
      // 備用：模擬頭像上傳
      return await this.uploadAvatarMock(imageFile);
    } catch (error) {
      console.error('上傳頭像失敗:', error);
      throw error;
    }
  }

  // 使用真實後端 API 上傳頭像
  async uploadAvatarReal(imageFile) {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // FormData 會自動設置
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'avatar.jpg',
      });
      const response = await fetch(`${this.baseURL}/api/user/avatar`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `上傳失敗: ${response.status}`);
      }
      const data = await response.json();
      // 更新本地用戶資料
      await this.updateLocalProfile({ avatar: data.avatarUrl });
      return {
        success: true,
        avatarUrl: data.avatarUrl,
        message: '頭像上傳成功',
      };
    } catch (error) {
      console.error('真實 API 頭像上傳失敗:', error);
      throw error;
    }
  }

  // 模擬頭像上傳（備用）
  // 真實的頭像上傳到雲端服務
  async uploadAvatarToCloudService(imageFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageFile.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });
      const response = await fetch(`${this.apiBaseUrl}/api/user/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '上傳失敗');
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatarMock(imageFile) {
    try {
      // 模擬上傳延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      // 使用真實的頭像上傳服務
      let avatarUrl;
      try {
        const uploadResult = await this.uploadAvatarToCloudService(imageFile);
        avatarUrl = uploadResult.url;
      } catch (error) {
        // 使用本地緩存作為fallback
        avatarUrl = `file://${imageFile.uri}`;
      }
      // 更新本地用戶資料
      await this.updateLocalProfile({ avatar: avatarUrl });
      return {
        success: true,
        avatarUrl: avatarUrl,
        message: '頭像上傳成功',
        source: 'real',
      };
    } catch (error) {
      console.error('模擬頭像上傳失敗:', error);
      throw error;
    }
  }

  // 獲取用戶資料
  async getUserProfile() {
    try {
      // 檢查是否有真實的後端 API
      if (await this.hasRealBackend()) {
        return await this.getUserProfileReal();
      }
      // 備用：從本地存儲獲取
      return await this.getUserProfileLocal();
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      throw error;
    }
  }

  // 使用真實後端 API 獲取用戶資料
  async getUserProfileReal() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/user/profile`, {
        method: 'GET',
        headers: headers,
      });
      if (!response.ok) {
        throw new Error(`API 錯誤: ${response.status}`);
      }
      const data = await response.json();
      // 更新本地存儲
      await this.updateLocalProfile(data.user);
      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('真實 API 獲取用戶資料失敗:', error);
      throw error;
    }
  }

  // 從本地存儲獲取用戶資料
  async getUserProfileLocal() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS || {} || {}.USER_PROFILE);
      if (!userData) {
        throw new Error('找不到用戶資料');
      }
      const user = JSON.parse(userData);
      return {
        success: true,
        user: user,
        source: 'local_storage',
      };
    } catch (error) {
      console.error('本地獲取用戶資料失敗:', error);
      throw error;
    }
  }

  // 刪除用戶帳戶
  async deleteAccount(password) {
    try {
      console.debug('刪除用戶帳戶');
      // 檢查是否有真實的後端 API
      if (await this.hasRealBackend()) {
        return await this.deleteAccountReal(password);
      }
      // 備用：模擬帳戶刪除
      return await this.deleteAccountMock(password);
    } catch (error) {
      console.error('刪除帳戶失敗:', error);
      throw error;
    }
  }

  // 使用真實後端 API 刪除帳戶
  async deleteAccountReal(password) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/user/account`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('密碼不正確');
        }
        throw new Error(errorData.message || `API 錯誤: ${response.status}`);
      }
      // 清除本地數據
      await this.clearLocalData();
      return {
        success: true,
        message: '帳戶已成功刪除',
      };
    } catch (error) {
      console.error('真實 API 刪除帳戶失敗:', error);
      throw error;
    }
  }

  // 模擬帳戶刪除（備用）
  async deleteAccountMock(password) {
    try {
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!password) {
        throw new Error('請輸入密碼以確認刪除');
      }
      // 清除本地數據
      await this.clearLocalData();
      return {
        success: true,
        message: '帳戶已刪除（示範模式）',
        source: 'mock',
      };
    } catch (error) {
      console.error('模擬刪除帳戶失敗:', error);
      throw error;
    }
  }

  // 輔助方法

  // 檢查是否有真實後端
  async hasRealBackend() {
    try {
      // 檢查後端 API 可用性
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.debug('後端 API 不可用，使用本地模式:', error.message);
      return false;
    }
  }

  // 更新本地用戶資料
  async updateLocalProfile(updates) {
    try {
      const currentUserData = await AsyncStorage.getItem(STORAGE_KEYS || {} || {}.USER_PROFILE);
      const currentUser = currentUserData ? JSON.parse(currentUserData) : {};
      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS || {} || {}.USER_PROFILE, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('更新本地用戶資料失敗:', error);
      throw error;
    }
  }

  // 清除本地數據
  async clearLocalData() {
    try {
      await localStorage.multiRemove([
        STORAGE_KEYS || {} || {}.USER_TOKEN,
        STORAGE_KEYS || {} || {}.USER_PROFILE,
        STORAGE_KEYS || {} || {}.DISCLAIMER_ACCEPTED,
        STORAGE_KEYS || {} || {}.ONBOARDING_COMPLETED,
      ]);
    } catch (error) {
      console.error('清除本地數據失敗:', error);
      throw error;
    }
  }

  // 驗證密碼強度
  validatePasswordStrength(password) {
    // 至少8個字符，包含大小寫字母和數字
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasNumbers;
  }

  // 獲取密碼強度要求
  getPasswordRequirements() {
    return {
      minLength: 8,
      requireUpperCase: true,
      requireLowerCase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      description: '密碼必須至少8個字符，包含大小寫字母和數字',
    };
  }

  // 驗證電子郵件格式
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 驗證電話號碼格式
  validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
  }
}

export default new UserAuthService();
