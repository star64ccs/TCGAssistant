import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, checkAuthStatus } from '../store/slices/authSlice';
import { addToCollection, removeFromCollection } from '../store/slices/collectionSlice';
import { setNotification } from '../store/slices/notificationSlice';

const ReduxTestComponent = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const collection = useSelector((state) => state.collection);
  const notification = useSelector((state) => state.notification);
  const settings = useSelector((state) => state.settings);

  useEffect(() => {
    // 測試檢查認證狀態
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleTestLogin = () => {
    dispatch(login({
      email: 'test@example.com',
      password: 'password123',
    }));
  };

  const handleTestLogout = () => {
    dispatch(logout());
  };

  const handleAddToCollection = () => {
    const testCard = {
      id: Date.now().toString(),
      name: '測試卡牌',
      set: '測試系列',
      rarity: '稀有',
      price: 100,
      condition: 'NM',
    };
    dispatch(addToCollection(testCard));
  };

  const handleRemoveFromCollection = () => {
    if (collection.items.length > 0) {
      dispatch(removeFromCollection(collection.items[0].id));
    }
  };

  const handleTestNotification = () => {
    dispatch(setNotification({
      type: 'success',
      message: '這是一個測試通知！',
      duration: 3000,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Redux功能測試</Text>

      {/* 認證狀態測試 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 認證狀態測試</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            認證狀態: {auth.isAuthenticated ? '✅ 已登入' : '❌ 未登入'}
          </Text>
          <Text style={styles.statusText}>
            載入狀態: {auth.isLoading ? '⏳ 載入中' : '✅ 完成'}
          </Text>
          {auth.error ? <Text style={styles.errorText}>❌ 錯誤: {auth.error}</Text> : null}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleTestLogin}>
            <Text style={styles.buttonText}>測試登入</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleTestLogout}>
            <Text style={styles.buttonText}>測試登出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 收藏功能測試 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 收藏功能測試</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            收藏數量: {collection.items.length} 張卡牌
          </Text>
          <Text style={styles.statusText}>
            載入狀態: {collection.isLoading ? '⏳ 載入中' : '✅ 完成'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleAddToCollection}>
            <Text style={styles.buttonText}>添加卡牌</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRemoveFromCollection}>
            <Text style={styles.buttonText}>移除卡牌</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 通知功能測試 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 通知功能測試</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            通知數量: {notification.notifications.length}
          </Text>
          <Text style={styles.statusText}>
            最新通知: {notification.notifications.length > 0 ?
            notification.notifications[0].message : '無'}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleTestNotification}>
          <Text style={styles.buttonText}>發送測試通知</Text>
        </TouchableOpacity>
      </View>

      {/* 設置功能測試 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ 設置功能測試</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            主題: {settings.theme || '預設'}
          </Text>
          <Text style={styles.statusText}>
            語言: {settings.language || '預設'}
          </Text>
        </View>
      </View>

      {/* 調試信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐛 調試信息</Text>
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Auth State: {JSON.stringify(auth, null, 2)}
          </Text>
          <Text style={styles.debugText}>
            Collection Count: {collection.items.length}
          </Text>
          <Text style={styles.debugText}>
            Notification Count: {notification.notifications.length}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginHorizontal: 5,
    minWidth: 120,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
    padding: 20,
  },
  debugContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debugText: {
    color: '#666',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    color: '#333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ReduxTestComponent;
