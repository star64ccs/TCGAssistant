const axios = require('axios');
const { logger } = require('../utils/logger');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_VERSION = process.env.API_VERSION || 'v1';

// 測試用戶憑證
let authToken = null;
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// 設置axios默認配置
axios.defaults.baseURL = `${BASE_URL}/api/${API_VERSION}`;

// 登入並獲取認證令牌
async function login() {
  try {
    const response = await axios.post('/auth/login', testUser);
    if (response.data.success) {
      authToken = response.data.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      logger.info('✅ 登入成功');
      return true;
    }
  } catch (error) {
    logger.error('❌ 登入失敗:', error.response?.data || error.message);
    return false;
  }
}

// 測試通知系統
async function testNotificationAPIs() {
  logger.info('\n🔔 測試通知系統API...');
  
  try {
    // 獲取通知列表
    const notificationsResponse = await axios.get('/notification');
    logger.info('✅ 獲取通知列表成功:', notificationsResponse.data.success);

    // 獲取通知統計
    const statsResponse = await axios.get('/notification/stats');
    logger.info('✅ 獲取通知統計成功:', statsResponse.data.success);

    // 獲取通知設置
    const settingsResponse = await axios.get('/notification/settings');
    logger.info('✅ 獲取通知設置成功:', settingsResponse.data.success);

    // 更新通知設置
    const updateSettingsResponse = await axios.put('/notification/settings', {
      settings: {
        pushEnabled: true,
        emailEnabled: false,
        inAppEnabled: true
      }
    });
    logger.info('✅ 更新通知設置成功:', updateSettingsResponse.data.success);

  } catch (error) {
    logger.error('❌ 通知系統API測試失敗:', error.response?.data || error.message);
  }
}

// 測試反饋系統
async function testFeedbackAPIs() {
  logger.info('\n💬 測試反饋系統API...');
  
  try {
    // 提交反饋
    const submitResponse = await axios.post('/feedback', {
      type: 'feature_request',
      title: '測試反饋',
      description: '這是一個測試反饋',
      rating: 4,
      category: 'enhancement'
    });
    logger.info('✅ 提交反饋成功:', submitResponse.data.success);

    const feedbackId = submitResponse.data.data.id;

    // 獲取反饋列表
    const feedbacksResponse = await axios.get('/feedback');
    logger.info('✅ 獲取反饋列表成功:', feedbacksResponse.data.success);

    // 獲取反饋詳情
    const detailResponse = await axios.get(`/feedback/${feedbackId}`);
    logger.info('✅ 獲取反饋詳情成功:', detailResponse.data.success);

    // 添加反饋回覆
    const replyResponse = await axios.post(`/feedback/${feedbackId}/reply`, {
      message: '感謝您的反饋，我們會認真考慮',
      isInternal: false
    });
    logger.info('✅ 添加反饋回覆成功:', replyResponse.data.success);

    // 獲取反饋統計
    const statsResponse = await axios.get('/feedback/stats/overview');
    logger.info('✅ 獲取反饋統計成功:', statsResponse.data.success);

  } catch (error) {
    logger.error('❌ 反饋系統API測試失敗:', error.response?.data || error.message);
  }
}

// 測試備份系統
async function testBackupAPIs() {
  logger.info('\n💾 測試備份系統API...');
  
  try {
    // 創建備份
    const createResponse = await axios.post('/backup/create', {
      type: 'full',
      description: '測試備份',
      includeSettings: true,
      includeHistory: true,
      includeCollection: true
    });
    logger.info('✅ 創建備份成功:', createResponse.data.success);

    const backupId = createResponse.data.data.id;

    // 獲取備份列表
    const backupsResponse = await axios.get('/backup');
    logger.info('✅ 獲取備份列表成功:', backupsResponse.data.success);

    // 獲取備份詳情
    const detailResponse = await axios.get(`/backup/${backupId}`);
    logger.info('✅ 獲取備份詳情成功:', detailResponse.data.success);

    // 驗證備份完整性
    const verifyResponse = await axios.post(`/backup/${backupId}/verify`);
    logger.info('✅ 驗證備份成功:', verifyResponse.data.success);

    // 獲取備份統計
    const statsResponse = await axios.get('/backup/stats/overview');
    logger.info('✅ 獲取備份統計成功:', statsResponse.data.success);

    // 設置自動備份
    const autoBackupResponse = await axios.put('/backup/auto-backup', {
      enabled: true,
      frequency: 'weekly',
      retention: 30,
      includeSettings: true,
      includeHistory: true,
      includeCollection: true
    });
    logger.info('✅ 設置自動備份成功:', autoBackupResponse.data.success);

  } catch (error) {
    logger.error('❌ 備份系統API測試失敗:', error.response?.data || error.message);
  }
}

// 測試分析系統
async function testAnalyticsAPIs() {
  logger.info('\n📊 測試分析系統API...');
  
  try {
    // 記錄用戶行為
    const trackResponse = await axios.post('/analytics/track', {
      event: 'page_view',
      category: 'navigation',
      action: 'visit_home',
      label: 'home_page',
      value: 1,
      properties: { page: 'home' }
    });
    logger.info('✅ 記錄用戶行為成功:', trackResponse.data.success);

    // 獲取使用統計
    const usageResponse = await axios.get('/analytics/usage');
    logger.info('✅ 獲取使用統計成功:', usageResponse.data.success);

    // 獲取使用趨勢
    const trendsResponse = await axios.get('/analytics/trends');
    logger.info('✅ 獲取使用趨勢成功:', trendsResponse.data.success);

    // 獲取性能指標
    const performanceResponse = await axios.get('/analytics/performance');
    logger.info('✅ 獲取性能指標成功:', performanceResponse.data.success);

    // 獲取錯誤統計
    const errorsResponse = await axios.get('/analytics/errors');
    logger.info('✅ 獲取錯誤統計成功:', errorsResponse.data.success);

    // 獲取用戶行為分析
    const behaviorResponse = await axios.get('/analytics/behavior');
    logger.info('✅ 獲取用戶行為分析成功:', behaviorResponse.data.success);

    // 獲取系統健康狀態
    const healthResponse = await axios.get('/analytics/health');
    logger.info('✅ 獲取系統健康狀態成功:', healthResponse.data.success);

    // 獲取實時監控數據
    const realtimeResponse = await axios.get('/analytics/realtime');
    logger.info('✅ 獲取實時監控數據成功:', realtimeResponse.data.success);

  } catch (error) {
    logger.error('❌ 分析系統API測試失敗:', error.response?.data || error.message);
  }
}

// 測試文件管理系統
async function testFileManagerAPIs() {
  logger.info('\n📁 測試文件管理系統API...');
  
  try {
    // 創建文件夾
    const folderResponse = await axios.post('/fileManager/folder', {
      name: '測試文件夾',
      description: '用於測試的文件夾'
    });
    logger.info('✅ 創建文件夾成功:', folderResponse.data.success);

    const folderId = folderResponse.data.data.id;

    // 獲取文件夾結構
    const structureResponse = await axios.get('/fileManager/folder/structure');
    logger.info('✅ 獲取文件夾結構成功:', structureResponse.data.success);

    // 獲取文件列表
    const filesResponse = await axios.get('/fileManager');
    logger.info('✅ 獲取文件列表成功:', filesResponse.data.success);

    // 獲取文件統計
    const statsResponse = await axios.get('/fileManager/stats/overview');
    logger.info('✅ 獲取文件統計成功:', statsResponse.data.success);

    // 獲取存儲使用情況
    const storageResponse = await axios.get('/fileManager/stats/storage');
    logger.info('✅ 獲取存儲使用情況成功:', storageResponse.data.success);

    // 搜索文件
    const searchResponse = await axios.get('/fileManager/search', {
      params: {
        query: 'test',
        type: 'image'
      }
    });
    logger.info('✅ 搜索文件成功:', searchResponse.data.success);

  } catch (error) {
    logger.error('❌ 文件管理系統API測試失敗:', error.response?.data || error.message);
  }
}

// 主測試函數
async function runAllTests() {
  logger.info('🚀 開始測試低優先級功能API...');
  
  // 登入
  const loginSuccess = await login();
  if (!loginSuccess) {
    logger.error('❌ 無法登入，測試終止');
    return;
  }

  // 測試各個功能模組
  await testNotificationAPIs();
  await testFeedbackAPIs();
  await testBackupAPIs();
  await testAnalyticsAPIs();
  await testFileManagerAPIs();

  logger.info('\n🎉 所有低優先級功能API測試完成！');
}

// 根據命令行參數運行特定測試
async function runSpecificTest() {
  const testType = process.argv[2];
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    logger.error('❌ 無法登入，測試終止');
    return;
  }

  switch (testType) {
    case 'notification':
      await testNotificationAPIs();
      break;
    case 'feedback':
      await testFeedbackAPIs();
      break;
    case 'backup':
      await testBackupAPIs();
      break;
    case 'analytics':
      await testAnalyticsAPIs();
      break;
    case 'filemanager':
      await testFileManagerAPIs();
      break;
    default:
      logger.error('❌ 未知的測試類型:', testType);
      logger.info('可用的測試類型: notification, feedback, backup, analytics, filemanager');
  }
}

// 導出測試函數
module.exports = {
  runAllTests,
  runSpecificTest,
  testNotificationAPIs,
  testFeedbackAPIs,
  testBackupAPIs,
  testAnalyticsAPIs,
  testFileManagerAPIs
};

// 如果直接運行此文件
if (require.main === module) {
  const testType = process.argv[2];
  
  if (testType) {
    runSpecificTest();
  } else {
    runAllTests();
  }
}
