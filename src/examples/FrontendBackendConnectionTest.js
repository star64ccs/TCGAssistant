import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import enhancedApiService from '../services/enhancedApiService';
import { API_ENDPOINTS } from '../services/api';

/**
 * 前後端連接測試組件
 * 用於測試前端與後端的API連接
 */
const FrontendBackendConnectionTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 添加測試結果
  const addTestResult = (testName, success, message, data = null) => {
    const result = {
      id: Date.now(),
      testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    setTestResults(prev => [result, ...prev]);
  };

  // 測試1：基本連接測試
  const testBasicConnection = async () => {
    try {
      addTestResult('基本連接測試', true, '開始測試...');
      
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      
      if (response.ok) {
        addTestResult('基本連接測試', true, '連接成功', data);
      } else {
        addTestResult('基本連接測試', false, `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addTestResult('基本連接測試', false, `連接失敗: ${error.message}`);
    }
  };

  // 測試2：API端點測試
  const testApiEndpoint = async () => {
    try {
      addTestResult('API端點測試', true, '開始測試...');
      
      const response = await fetch('http://localhost:3000/api/v1');
      const data = await response.json();
      
      if (response.ok) {
        addTestResult('API端點測試', true, 'API端點正常', data);
      } else {
        addTestResult('API端點測試', false, `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addTestResult('API端點測試', false, `API端點測試失敗: ${error.message}`);
    }
  };

  // 測試3：用戶資料端點測試
  const testUserProfileEndpoint = async () => {
    try {
      addTestResult('用戶資料端點測試', true, '開始測試...');
      
      const response = await fetch('http://localhost:3000/api/v1/user/profile');
      const data = await response.json();
      
      if (response.ok) {
        addTestResult('用戶資料端點測試', true, '用戶資料端點正常', data);
      } else {
        addTestResult('用戶資料端點測試', false, `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addTestResult('用戶資料端點測試', false, `用戶資料端點測試失敗: ${error.message}`);
    }
  };

  // 測試4：卡牌資料端點測試
  const testCardDataEndpoint = async () => {
    try {
      addTestResult('卡牌資料端點測試', true, '開始測試...');
      
      const response = await fetch('http://localhost:3000/api/v1/cardData/pokemon?limit=5');
      const data = await response.json();
      
      if (response.ok) {
        addTestResult('卡牌資料端點測試', true, '卡牌資料端點正常', data);
      } else {
        addTestResult('卡牌資料端點測試', false, `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addTestResult('卡牌資料端點測試', false, `卡牌資料端點測試失敗: ${error.message}`);
    }
  };

  // 測試5：增強的API服務測試
  const testEnhancedApiService = async () => {
    try {
      addTestResult('增強API服務測試', true, '開始測試...');
      
      const response = await enhancedApiService.get('/api/v1');
      
      addTestResult('增強API服務測試', true, '增強API服務正常', response);
    } catch (error) {
      addTestResult('增強API服務測試', false, `增強API服務測試失敗: ${error.message}`);
    }
  };

  // 測試6：批量測試
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      await testBasicConnection();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testApiEndpoint();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testUserProfileEndpoint();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testCardDataEndpoint();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testEnhancedApiService();
      
      addTestResult('批量測試', true, '所有測試完成');
    } catch (error) {
      addTestResult('批量測試', false, `批量測試失敗: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 清除測試結果
  const clearResults = () => {
    setTestResults([]);
  };

  // 計算測試統計
  const getTestStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.success).length;
    const failed = total - passed;
    return { total, passed, failed };
  };

  const stats = getTestStats();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>前後端連接測試</Text>
      
      {/* 測試統計 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          總測試: {stats.total} | 通過: {stats.passed} | 失敗: {stats.failed}
        </Text>
      </View>

      {/* 測試按鈕 */}
      <View style={styles.buttonContainer}>
        <Button 
          title="基本連接測試" 
          onPress={testBasicConnection}
          disabled={isLoading}
        />
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="API端點測試" 
          onPress={testApiEndpoint}
          disabled={isLoading}
        />
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="用戶資料測試" 
          onPress={testUserProfileEndpoint}
          disabled={isLoading}
        />
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="卡牌資料測試" 
          onPress={testCardDataEndpoint}
          disabled={isLoading}
        />
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="增強API服務測試" 
          onPress={testEnhancedApiService}
          disabled={isLoading}
        />
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="運行所有測試" 
          onPress={runAllTests}
          disabled={isLoading}
        />
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="清除結果" 
          onPress={clearResults}
          disabled={isLoading}
        />
      </View>

      {/* 載入指示器 */}
      {isLoading && (
        <Text style={styles.loadingText}>測試中...</Text>
      )}

      {/* 測試結果 */}
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>測試結果:</Text>
        {testResults.map((result) => (
          <View key={result.id} style={[
            styles.resultItem,
            result.success ? styles.successItem : styles.errorItem
          ]}>
            <Text style={styles.resultName}>{result.testName}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
            <Text style={styles.resultTime}>
              {new Date(result.timestamp).toLocaleTimeString()}
            </Text>
            {result.data && (
              <Text style={styles.resultData}>
                數據: {JSON.stringify(result.data, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  successItem: {
    borderLeftColor: '#4CAF50',
  },
  errorItem: {
    borderLeftColor: '#F44336',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
  },
  resultData: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontFamily: 'monospace',
  },
});

export default FrontendBackendConnectionTest;
