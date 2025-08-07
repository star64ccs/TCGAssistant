import { getApiBaseUrl, checkApiConnection } from '../config/api';
import apiIntegrationManager from '../services/apiIntegrationManager';

class ConnectionTest {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  // 執行完整的連接測試
  async runFullTest() {
    if (this.isRunning) {
      throw new Error('測試正在進行中');
    }

    this.isRunning = true;
    this.testResults = [];

    try {
      console.log('開始執行連接測試...');

      // 測試1: 基礎連接測試
      await this.testBasicConnection();

      // 測試2: API端點測試
      await this.testApiEndpoints();

      // 測試3: 認證測試
      await this.testAuthentication();

      // 測試4: 功能測試
      await this.testFeatures();

      console.log('連接測試完成');
      return {
        success: true,
        results: this.testResults,
        summary: this.generateSummary()
      };
    } catch (error) {
      console.error('連接測試失敗:', error);
      return {
        success: false,
        error: error.message,
        results: this.testResults
      };
    } finally {
      this.isRunning = false;
    }
  }

  // 基礎連接測試
  async testBasicConnection() {
    const testName = '基礎連接測試';
    console.log(`執行 ${testName}...`);

    try {
      const isConnected = await checkApiConnection();
      
      this.testResults.push({
        name: testName,
        success: isConnected,
        message: isConnected ? '連接成功' : '連接失敗',
        timestamp: new Date()
      });

      return isConnected;
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        message: `連接錯誤: ${error.message}`,
        error: error,
        timestamp: new Date()
      });
      throw error;
    }
  }

  // API端點測試
  async testApiEndpoints() {
    const testName = 'API端點測試';
    console.log(`執行 ${testName}...`);

    const endpoints = [
      { name: '健康檢查', path: '/health' },
      { name: '認證端點', path: '/auth/login' },
      { name: '卡牌資料端點', path: '/cardData/pokemon' },
      { name: '收藏端點', path: '/collection' },
      { name: '用戶歷史端點', path: '/userHistory' },
      { name: '價格預測端點', path: '/pricePrediction' },
      { name: '真偽檢查端點', path: '/authenticityCheck' },
      { name: 'AI聊天端點', path: '/aiChat' }
    ];

    const baseUrl = getApiBaseUrl().replace('/api/v1', '');
    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint.path}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const success = response.status !== 404; // 404表示端點不存在
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          success,
          status: response.status,
          message: success ? '端點可訪問' : '端點不可訪問'
        });
      } catch (error) {
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          success: false,
          message: `請求失敗: ${error.message}`,
          error: error
        });
      }
    }

    const overallSuccess = results.some(r => r.success);
    
    this.testResults.push({
      name: testName,
      success: overallSuccess,
      message: `${results.filter(r => r.success).length}/${results.length} 個端點可訪問`,
      details: results,
      timestamp: new Date()
    });

    return overallSuccess;
  }

  // 認證測試
  async testAuthentication() {
    const testName = '認證測試';
    console.log(`執行 ${testName}...`);

    try {
      const baseUrl = getApiBaseUrl();
      
      // 測試註冊端點
      const registerResponse = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'test_user',
          email: 'test@example.com',
          password: 'testpassword123'
        })
      });

      const registerSuccess = registerResponse.status === 201 || registerResponse.status === 400; // 400表示用戶已存在
      
      this.testResults.push({
        name: testName,
        success: registerSuccess,
        message: registerSuccess ? '認證端點可訪問' : '認證端點不可訪問',
        status: registerResponse.status,
        timestamp: new Date()
      });

      return registerSuccess;
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        message: `認證測試失敗: ${error.message}`,
        error: error,
        timestamp: new Date()
      });
      throw error;
    }
  }

  // 功能測試
  async testFeatures() {
    const testName = '功能測試';
    console.log(`執行 ${testName}...`);

    try {
      const availability = apiIntegrationManager.checkApiAvailability();
      
      this.testResults.push({
        name: testName,
        success: availability.hasAnyApi,
        message: availability.hasAnyApi ? '有可用的API功能' : '沒有可用的API功能',
        details: availability,
        timestamp: new Date()
      });

      return availability.hasAnyApi;
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        message: `功能測試失敗: ${error.message}`,
        error: error,
        timestamp: new Date()
      });
      throw error;
    }
  }

  // 生成測試摘要
  generateSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0,
      overallSuccess: failedTests === 0
    };
  }

  // 獲取測試結果
  getTestResults() {
    return {
      results: this.testResults,
      summary: this.generateSummary(),
      isRunning: this.isRunning
    };
  }

  // 清除測試結果
  clearResults() {
    this.testResults = [];
  }

  // 導出測試報告
  exportReport() {
    const summary = this.generateSummary();
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      results: this.testResults,
      config: {
        baseUrl: getApiBaseUrl(),
        environment: process.env.REACT_APP_ENVIRONMENT || 'development'
      }
    };

    return JSON.stringify(report, null, 2);
  }
}

// 創建單例實例
const connectionTest = new ConnectionTest();

export default connectionTest;
