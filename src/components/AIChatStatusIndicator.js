import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { getEnabledApis, validateConfig } from '../config/unifiedConfig';
import apiTester from '../utils/apiTester';

const AIChatStatusIndicator = ({ onPress, style }) => {
  const [apiStatus, setApiStatus] = useState({
    hasAnyAI: false,
    enabledAIs: [],
    isConfigValid: false,
    isLoading: false,
    lastChecked: null,
  });

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiStatus(prev => ({ ...prev, isLoading: true }));
    try {
      const enabledApis = getEnabledApis();
      const config = validateConfig();
      // 快速檢查 API 可用性
      const quickCheck = await apiTester.quickCheck();
      setApiStatus({
        hasAnyAI: quickCheck.hasWorkingAPI,
        enabledAIs: enabledApis.ai,
        workingAIs: quickCheck.workingAPIs,
        isConfigValid: config.isValid,
        warnings: config.warnings,
        errors: config.errors,
        isLoading: false,
        lastChecked: new Date(),
      });
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        isLoading: false,
        hasAnyAI: false,
      }));
    }
  };

  const getStatusIcon = () => {
    if (apiStatus.isLoading) {
      return { name: 'loading', color: '#00ffff' };
    }
    if (!apiStatus.isConfigValid) {
      return { name: 'alert-circle', color: '#FF3B3B' };
    }
    if (apiStatus.hasAnyAI) {
      return { name: 'check-circle', color: '#4CAF50' };
    }
    return { name: 'information', color: '#FFD700' };
  };

  const getStatusText = () => {
    if (apiStatus.isLoading) {
      return '檢查中...';
    }
    if (!apiStatus.isConfigValid) {
      return '配置錯誤';
    }
    if (apiStatus.hasAnyAI) {
      return `AI 就緒 (${apiStatus.workingAIs?.length || 0})`;
    }
    return '離線模式';
  };

  const getStatusDescription = () => {
    if (apiStatus.isLoading) {
      return '正在檢測 API 服務...';
    }
    if (!apiStatus.isConfigValid) {
      return '請檢查 API 配置';
    }
    if (apiStatus.hasAnyAI) {
      const aiTypes = {
        'openai': 'OpenAI GPT-4',
        'googlePaLM': 'Google PaLM',
        'azureOpenAI': 'Azure OpenAI',
      };
      const workingTypes = (apiStatus.workingAIs || []).map(ai => aiTypes[ai] || ai).join(', ');
      return `可用服務：${workingTypes}`;
    }
    return '使用基礎回應模式';
  };

  const icon = getStatusIcon();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {apiStatus.isLoading ? (
          <ActivityIndicator
            size="small"
            color="#00ffff"
            style={styles.icon}
          />
        ) : (
          <Icon
            name={icon.name}
            size={16}
            color={icon.color}
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <Text style={styles.descriptionText}>{getStatusDescription()}</Text>
        </View>
        {!apiStatus.isLoading && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={checkApiStatus}
          >
            <Icon name="refresh" size={14} color="#00ffff" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(42, 47, 129, 0.8)',
    borderColor: '#00ffff',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 12,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  descriptionText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  icon: {
    marginRight: 8,
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginLeft: 8,
    width: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
});

export default AIChatStatusIndicator;
