import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiIntegrationManager from '../services/apiIntegrationManager';
import { getCurrentEnv } from '../config/api';

const ApiStatusMonitor = ({ onStatusChange }) => {
  const [status, setStatus] = useState({
    isConnected: false,
    status: 'checking',
    lastCheck: null,
    retryCount: 0,
    baseUrl: '',
    config: {}
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkConnection();
    
    // 定期檢查連接狀態
    const interval = setInterval(checkConnection, 30000); // 每30秒檢查一次
    
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const result = await apiIntegrationManager.checkConnection();
      setStatus(result);
      
      if (onStatusChange) {
        onStatusChange(result);
      }
    } catch (error) {
      console.error('連接檢查失敗:', error);
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        error: error.message
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const retryConnection = async () => {
    Alert.alert(
      '重試連接',
      '是否要重試API連接？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重試',
          onPress: async () => {
            setIsChecking(true);
            try {
              const result = await apiIntegrationManager.retryConnection();
              setStatus(result);
              
              if (onStatusChange) {
                onStatusChange(result);
              }
            } catch (error) {
              console.error('重試連接失敗:', error);
            } finally {
              setIsChecking(false);
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'disconnected':
        return { name: 'close-circle', color: '#F44336' };
      case 'checking':
        return { name: 'refresh', color: '#FF9800' };
      case 'error':
        return { name: 'alert-circle', color: '#F44336' };
      default:
        return { name: 'help-circle', color: '#9E9E9E' };
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'connected':
        return '已連接';
      case 'disconnected':
        return '未連接';
      case 'checking':
        return '檢查中...';
      case 'error':
        return '連接錯誤';
      default:
        return '未知狀態';
    }
  };

  const getEnvironmentText = () => {
    const env = getCurrentEnv();
    switch (env) {
      case 'development':
        return '開發環境';
      case 'staging':
        return '測試環境';
      case 'production':
        return '生產環境';
      default:
        return '未知環境';
    }
  };

  const icon = getStatusIcon();

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Ionicons 
          name={icon.name} 
          size={20} 
          color={icon.color} 
        />
        <Text style={[styles.statusText, { color: icon.color }]}>
          {getStatusText()}
        </Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          環境: {getEnvironmentText()}
        </Text>
        <Text style={styles.infoText}>
          服務器: {status.baseUrl || '未知'}
        </Text>
        {status.lastCheck && (
          <Text style={styles.infoText}>
            最後檢查: {new Date(status.lastCheck).toLocaleTimeString()}
          </Text>
        )}
        {status.retryCount > 0 && (
          <Text style={styles.infoText}>
            重試次數: {status.retryCount}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.retryButton, isChecking && styles.retryButtonDisabled]}
        onPress={retryConnection}
        disabled={isChecking}
      >
        <Ionicons 
          name="refresh" 
          size={16} 
          color={isChecking ? '#9E9E9E' : '#2196F3'} 
        />
        <Text style={[styles.retryText, isChecking && styles.retryTextDisabled]}>
          {isChecking ? '檢查中...' : '重試連接'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  retryButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#9E9E9E',
  },
  retryText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 4,
  },
  retryTextDisabled: {
    color: '#9E9E9E',
  },
});

export default ApiStatusMonitor;
