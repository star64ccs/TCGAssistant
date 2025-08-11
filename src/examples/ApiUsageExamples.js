import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import enhancedApiService from '../services/enhancedApiService';
import { API_ENDPOINTS } from '../services/api';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  selectUserProfile,
  selectUserLoading,
  selectUserError,
} from '../store/slices/enhancedUserSlice';

/**
 * API使用範例組件
 * 展示如何在前端組件中使用增強的API服務
 */
const ApiUsageExamples = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 載入用戶資料
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // 處理錯誤
  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error);
    }
  }, [error]);

  /**
   * 範例1：基本API調用
   */
  const handleBasicApiCall = async () => {
    try {
      // 獲取卡牌資料
      const cardData = await enhancedApiService.get(
        API_ENDPOINTS.CARD_DATA.POKEMON,
        { limit: 10, offset: 0 },
        { useCache: true, cacheKey: 'pokemon_cards' }
      );
      
      Alert.alert('成功', `獲取到 ${cardData.data.length} 張卡牌`);
    } catch (error) {
      Alert.alert('錯誤', error.message);
    }
  };

  /**
   * 範例2：文件上傳
   */
  const handleImageUpload = async () => {
    try {
      // 選擇圖片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageFile = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'uploaded_image.jpg',
        };

        // 上傳圖片
        const uploadResult = await enhancedApiService.uploadFile(
          API_ENDPOINTS.UPLOAD.IMAGE,
          imageFile,
          (progressEvent) => {
            const progress = progressEvent.loaded / progressEvent.total;
            setUploadProgress(progress);
          }
        );

        Alert.alert('上傳成功', `圖片已上傳到: ${uploadResult.url}`);
      }
    } catch (error) {
      Alert.alert('上傳失敗', error.message);
    }
  };

  /**
   * 範例3：批量文件上傳
   */
  const handleBatchUpload = async () => {
    try {
      // 選擇多張圖片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageFiles = result.assets.map((asset, index) => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        }));

        // 批量上傳
        const uploadResult = await enhancedApiService.uploadFiles(
          API_ENDPOINTS.UPLOAD.BATCH,
          imageFiles,
          (progressEvent) => {
            const progress = progressEvent.loaded / progressEvent.total;
            setUploadProgress(progress);
          }
        );

        Alert.alert('批量上傳成功', `已上傳 ${uploadResult.files.length} 個文件`);
      }
    } catch (error) {
      Alert.alert('批量上傳失敗', error.message);
    }
  };

  /**
   * 範例4：使用Redux Toolkit
   */
  const handleUpdateProfile = async () => {
    const updatedProfile = {
      name: '新用戶名稱',
      bio: '這是我的個人簡介',
      preferences: {
        language: 'zh-TW',
        notifications: true,
      },
    };

    dispatch(updateUserProfile(updatedProfile));
  };

  /**
   * 範例5：上傳頭像（使用Redux）
   */
  const handleUploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageFile = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        };

        dispatch(uploadUserAvatar(imageFile));
      }
    } catch (error) {
      Alert.alert('選擇圖片失敗', error.message);
    }
  };

  /**
   * 範例6：帶重試的API調用
   */
  const handleRetryApiCall = async () => {
    try {
      const result = await enhancedApiService.retryRequest(async () => {
        return await enhancedApiService.get('/api/unstable-endpoint');
      });
      
      Alert.alert('重試成功', 'API調用成功');
    } catch (error) {
      Alert.alert('重試失敗', error.message);
    }
  };

  /**
   * 範例7：清除緩存
   */
  const handleClearCache = () => {
    enhancedApiService.clearCache();
    Alert.alert('成功', '緩存已清除');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        API使用範例
      </Text>

      {/* 用戶資料顯示 */}
      {userProfile && (
        <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>用戶資料</Text>
          <Text>姓名: {userProfile.name}</Text>
          <Text>郵箱: {userProfile.email}</Text>
          {userProfile.avatar && (
            <Image
              source={{ uri: userProfile.avatar }}
              style={{ width: 50, height: 50, borderRadius: 25, marginTop: 10 }}
            />
          )}
        </View>
      )}

      {/* 載入狀態 */}
      {isLoading && (
        <Text style={{ color: 'blue', marginBottom: 10 }}>載入中...</Text>
      )}

      {/* 上傳進度 */}
      {uploadProgress > 0 && uploadProgress < 1 && (
        <Text style={{ color: 'green', marginBottom: 10 }}>
          上傳進度: {Math.round(uploadProgress * 100)}%
        </Text>
      )}

      {/* API調用按鈕 */}
      <Button title="基本API調用" onPress={handleBasicApiCall} />
      <View style={{ height: 10 }} />
      
      <Button title="上傳單張圖片" onPress={handleImageUpload} />
      <View style={{ height: 10 }} />
      
      <Button title="批量上傳圖片" onPress={handleBatchUpload} />
      <View style={{ height: 10 }} />
      
      <Button title="更新用戶資料" onPress={handleUpdateProfile} />
      <View style={{ height: 10 }} />
      
      <Button title="上傳頭像" onPress={handleUploadAvatar} />
      <View style={{ height: 10 }} />
      
      <Button title="重試API調用" onPress={handleRetryApiCall} />
      <View style={{ height: 10 }} />
      
      <Button title="清除緩存" onPress={handleClearCache} />
    </View>
  );
};

export default ApiUsageExamples;
