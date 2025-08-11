import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { databaseService } from '../services/databaseService';
import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';

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
      // 初始化資料庫
      await databaseService.initDatabase();
      setIsInitialized(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container
      }>
        <ActivityIndicator size="large" color={ COLORS.PRIMARY } />
        <Text style={ styles.loadingText }>正在初始化資料庫...</Text>
        <Text style={ styles.subText }>請稍候，這可能需要幾秒鐘</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container
      }>
        <Text style={ styles.errorText }>資料庫初始化失敗</Text>
        <Text style={ styles.errorMessage }>{ error }</Text>
        <Text style={ styles.retryText }>請重新啟動應用程式</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container
      }>
        <Text style={ styles.errorText }>資料庫未初始化</Text>
        <Text style={ styles.retryText }>請重新啟動應用程式</Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorMessage: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.ERROR,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 20,
    textAlign: 'center',
  },
  retryText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
  subText: {
    ...TEXT_STYLES.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default DatabaseInitializer;
