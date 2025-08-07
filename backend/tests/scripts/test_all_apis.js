#!/usr/bin/env node

/**
 * TCG Assistant API 完整測試腳本
 * 使用方法: node tests/scripts/test_all_apis.js
 */

const axios = require('axios');
const colors = require('colors');

// 配置
const BASE_URL = 'http://localhost:3000/api';
let accessToken = '';
let refreshToken = '';

// 測試結果統計
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// 工具函數
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'success':
      console.log(`[${timestamp}] ✅ ${message}`.green);
      break;
    case 'error':
      console.log(`[${timestamp}] ❌ ${message}`.red);
      break;
    case 'warning':
      console.log(`[${timestamp}] ⚠️  ${message}`.yellow);
      break;
    default:
      console.log(`[${timestamp}] ℹ️  ${message}`.blue);
  }
}

function logTestResult(testName, success, response = null, error = null) {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`測試通過: ${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`測試失敗: ${testName}`, 'error');
    if (error) {
      console.log(`   錯誤: ${error.message}`.red);
    }
    if (response) {
      console.log(`   回應: ${JSON.stringify(response.data, null, 2)}`.gray);
    }
  }
}

// 認證API測試
async function testAuthAPIs() {
  log('開始測試認證API...', 'info');
  
  try {
    // 1. 用戶註冊
    log('測試用戶註冊...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'password123',
      name: '測試用戶'
    });
    
    if (registerResponse.status === 201 || registerResponse.status === 200) {
      logTestResult('用戶註冊', true);
      if (registerResponse.data.data) {
        accessToken = registerResponse.data.data.accessToken;
        refreshToken = registerResponse.data.data.refreshToken;
      }
    } else {
      logTestResult('用戶註冊', false, registerResponse);
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      log('用戶已存在，跳過註冊測試', 'warning');
    } else {
      logTestResult('用戶註冊', false, null, error);
    }
  }

  try {
    // 2. 用戶登入
    log('測試用戶登入...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginResponse.status === 200) {
      logTestResult('用戶登入', true);
      if (loginResponse.data.data) {
        accessToken = loginResponse.data.data.accessToken;
        refreshToken = loginResponse.data.data.refreshToken;
      }
    } else {
      logTestResult('用戶登入', false, loginResponse);
    }
  } catch (error) {
    logTestResult('用戶登入', false, null, error);
  }

  try {
    // 3. 驗證Token
    log('測試Token驗證...');
    const verifyResponse = await axios.post(`${BASE_URL}/auth/verify`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (verifyResponse.status === 200) {
      logTestResult('Token驗證', true);
    } else {
      logTestResult('Token驗證', false, verifyResponse);
    }
  } catch (error) {
    logTestResult('Token驗證', false, null, error);
  }

  try {
    // 4. 刷新Token
    log('測試Token刷新...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    
    if (refreshResponse.status === 200) {
      logTestResult('Token刷新', true);
      if (refreshResponse.data.data) {
        accessToken = refreshResponse.data.data.accessToken;
      }
    } else {
      logTestResult('Token刷新', false, refreshResponse);
    }
  } catch (error) {
    logTestResult('Token刷新', false, null, error);
  }
}

// 卡牌資料API測試
async function testCardDataAPIs() {
  log('開始測試卡牌資料API...', 'info');
  
  try {
    // 1. 獲取Pokemon卡牌
    log('測試獲取Pokemon卡牌...');
    const pokemonResponse = await axios.get(`${BASE_URL}/card-data/pokemon?limit=5`);
    
    if (pokemonResponse.status === 200) {
      logTestResult('獲取Pokemon卡牌', true);
    } else {
      logTestResult('獲取Pokemon卡牌', false, pokemonResponse);
    }
  } catch (error) {
    logTestResult('獲取Pokemon卡牌', false, null, error);
  }

  try {
    // 2. 獲取One Piece卡牌
    log('測試獲取One Piece卡牌...');
    const onePieceResponse = await axios.get(`${BASE_URL}/card-data/onepiece?limit=5`);
    
    if (onePieceResponse.status === 200) {
      logTestResult('獲取One Piece卡牌', true);
    } else {
      logTestResult('獲取One Piece卡牌', false, onePieceResponse);
    }
  } catch (error) {
    logTestResult('獲取One Piece卡牌', false, null, error);
  }

  try {
    // 3. 獲取可用卡牌
    log('測試獲取可用卡牌...');
    const availableResponse = await axios.get(`${BASE_URL}/card-data/available?limit=10`);
    
    if (availableResponse.status === 200) {
      logTestResult('獲取可用卡牌', true);
    } else {
      logTestResult('獲取可用卡牌', false, availableResponse);
    }
  } catch (error) {
    logTestResult('獲取可用卡牌', false, null, error);
  }

  try {
    // 4. 獲取特定卡牌
    log('測試獲取特定卡牌...');
    const cardResponse = await axios.get(`${BASE_URL}/card-data/1`);
    
    if (cardResponse.status === 200) {
      logTestResult('獲取特定卡牌', true);
    } else {
      logTestResult('獲取特定卡牌', false, cardResponse);
    }
  } catch (error) {
    logTestResult('獲取特定卡牌', false, null, error);
  }
}

// 收藏管理API測試
async function testCollectionAPIs() {
  log('開始測試收藏管理API...', 'info');
  
  try {
    // 1. 獲取用戶收藏
    log('測試獲取用戶收藏...');
    const collectionResponse = await axios.get(`${BASE_URL}/collection?limit=10`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (collectionResponse.status === 200) {
      logTestResult('獲取用戶收藏', true);
    } else {
      logTestResult('獲取用戶收藏', false, collectionResponse);
    }
  } catch (error) {
    logTestResult('獲取用戶收藏', false, null, error);
  }

  try {
    // 2. 添加卡牌到收藏
    log('測試添加卡牌到收藏...');
    const addResponse = await axios.post(`${BASE_URL}/collection/add`, {
      cardId: 1,
      purchaseDate: '2024-01-01',
      purchasePrice: 25.50,
      condition: 'mint',
      notes: '從本地卡店購買'
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (addResponse.status === 201 || addResponse.status === 200) {
      logTestResult('添加卡牌到收藏', true);
    } else {
      logTestResult('添加卡牌到收藏', false, addResponse);
    }
  } catch (error) {
    logTestResult('添加卡牌到收藏', false, null, error);
  }

  try {
    // 3. 獲取收藏統計
    log('測試獲取收藏統計...');
    const statsResponse = await axios.get(`${BASE_URL}/collection/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (statsResponse.status === 200) {
      logTestResult('獲取收藏統計', true);
    } else {
      logTestResult('獲取收藏統計', false, statsResponse);
    }
  } catch (error) {
    logTestResult('獲取收藏統計', false, null, error);
  }
}

// 用戶歷史API測試
async function testUserHistoryAPIs() {
  log('開始測試用戶歷史API...', 'info');
  
  try {
    // 1. 獲取最近記錄
    log('測試獲取最近記錄...');
    const recentResponse = await axios.get(`${BASE_URL}/user-history/recent?limit=10`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (recentResponse.status === 200) {
      logTestResult('獲取最近記錄', true);
    } else {
      logTestResult('獲取最近記錄', false, recentResponse);
    }
  } catch (error) {
    logTestResult('獲取最近記錄', false, null, error);
  }

  try {
    // 2. 獲取歷史統計
    log('測試獲取歷史統計...');
    const statsResponse = await axios.get(`${BASE_URL}/user-history/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (statsResponse.status === 200) {
      logTestResult('獲取歷史統計', true);
    } else {
      logTestResult('獲取歷史統計', false, statsResponse);
    }
  } catch (error) {
    logTestResult('獲取歷史統計', false, null, error);
  }
}

// 主測試函數
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🚀 TCG Assistant API 完整測試開始'.cyan.bold);
  console.log('='.repeat(60));
  
  // 檢查服務器是否運行
  try {
    await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    log('後端服務器正在運行', 'success');
  } catch (error) {
    log('後端服務器未運行，請先啟動服務器 (npm start)', 'error');
    process.exit(1);
  }

  // 執行所有測試
  await testAuthAPIs();
  await testCardDataAPIs();
  await testCollectionAPIs();
  await testUserHistoryAPIs();

  // 輸出測試結果
  console.log('\n' + '='.repeat(60));
  console.log('📊 測試結果摘要'.cyan.bold);
  console.log('='.repeat(60));
  console.log(`總測試數: ${testResults.total}`.white);
  console.log(`通過: ${testResults.passed}`.green);
  console.log(`失敗: ${testResults.failed}`.red);
  console.log(`成功率: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`.cyan);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 所有測試都通過了！'.green.bold);
  } else {
    console.log('\n⚠️  有測試失敗，請檢查錯誤信息'.yellow.bold);
  }
  
  console.log('='.repeat(60));
}

// 運行測試
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('測試執行錯誤:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testAuthAPIs,
  testCardDataAPIs,
  testCollectionAPIs,
  testUserHistoryAPIs
};
