import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import databaseService from '../services/databaseService';
import { COLORS, TEXT_STYLES } from '../constants';

const DatabaseInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('開始初始化資料庫...');
      
      // 初始化資料庫
      await databaseService.initDatabase();
      
      console.log('資料庫初始化完成');
      setIsInitialized(true);
      
    } catch (error) {
      console.error('資料庫初始化失敗:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>正在初始化資料庫...</Text>
        <Text style={styles.subText}>請稍候，這可能需要幾秒鐘</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>資料庫初始化失敗</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.retryText}>請重新啟動應用程式</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>資料庫未初始化</Text>
        <Text style={styles.retryText}>請重新啟動應用程式</Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    padding: 20,
  },
  loadingText: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
});

export default DatabaseInitializer;
