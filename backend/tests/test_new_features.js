const axios = require('axios');
const { logger } = require('../utils/logger');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_VERSION = process.env.API_VERSION || 'v1';

// 測試配置
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  }
};

// 測試數據
const testData = {
  cardId: 'pokemon_001',
  cardIds: ['pokemon_001', 'yugioh_001', 'magic_001'],
  userId: 'test_user_001',
  message: '這張卡片的價格如何？'
};

// 測試函數
async function testPricePrediction() {
  console.log('\n=== 測試價格預測功能 ===');
  
  try {
    // 測試單張卡片價格預測
    console.log('1. 測試單張卡片價格預測...');
    const predictionResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/pricePrediction/predict/${testData.cardId}`,
      {
        ...testConfig,
        params: { timeframe: '30d', confidence: 0.8 }
      }
    );
    
    if (predictionResponse.data.success) {
      console.log('✅ 單張卡片價格預測成功');
      console.log('   預測結果:', predictionResponse.data.data);
    } else {
      console.log('❌ 單張卡片價格預測失敗');
    }
    
    // 測試歷史價格查詢
    console.log('\n2. 測試歷史價格查詢...');
    const historyResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/pricePrediction/history/${testData.cardId}`,
      {
        ...testConfig,
        params: { limit: 30 }
      }
    );
    
    if (historyResponse.data.success) {
      console.log('✅ 歷史價格查詢成功');
      console.log('   歷史數據條數:', historyResponse.data.data.history.length);
    } else {
      console.log('❌ 歷史價格查詢失敗');
    }
    
    // 測試市場趨勢分析
    console.log('\n3. 測試市場趨勢分析...');
    const trendsResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/pricePrediction/trends`,
      {
        ...testConfig,
        params: { category: 'all', timeframe: '7d' }
      }
    );
    
    if (trendsResponse.data.success) {
      console.log('✅ 市場趨勢分析成功');
      console.log('   整體趨勢:', trendsResponse.data.data.overall.direction);
    } else {
      console.log('❌ 市場趨勢分析失敗');
    }
    
    // 測試批量價格預測
    console.log('\n4. 測試批量價格預測...');
    const batchResponse = await axios.post(
      `${BASE_URL}/api/${API_VERSION}/pricePrediction/batch-predict`,
      {
        cardIds: testData.cardIds,
        timeframe: '30d'
      },
      testConfig
    );
    
    if (batchResponse.data.success) {
      console.log('✅ 批量價格預測成功');
      console.log('   預測卡片數量:', batchResponse.data.data.summary.totalCards);
    } else {
      console.log('❌ 批量價格預測失敗');
    }
    
  } catch (error) {
    console.error('❌ 價格預測測試失敗:', error.response?.data || error.message);
  }
}

async function testAuthenticityCheck() {
  console.log('\n=== 測試真偽檢查功能 ===');
  
  try {
    // 測試真偽檢查（模擬圖片數據）
    console.log('1. 測試真偽檢查...');
    const checkResponse = await axios.post(
      `${BASE_URL}/api/${API_VERSION}/authenticityCheck/check`,
      {
        cardId: testData.cardId,
        cardType: 'pokemon'
      },
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (checkResponse.data.success) {
      console.log('✅ 真偽檢查成功');
      console.log('   真偽分數:', checkResponse.data.data.authenticityScore);
    } else {
      console.log('❌ 真偽檢查失敗');
    }
    
    // 測試詳細真偽分析
    console.log('\n2. 測試詳細真偽分析...');
    const detailedResponse = await axios.post(
      `${BASE_URL}/api/${API_VERSION}/authenticityCheck/detailed-analysis`,
      {
        cardId: testData.cardId,
        cardType: 'pokemon',
        analysisType: 'comprehensive'
      },
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (detailedResponse.data.success) {
      console.log('✅ 詳細真偽分析成功');
      console.log('   總體分數:', detailedResponse.data.data.overallScore);
    } else {
      console.log('❌ 詳細真偽分析失敗');
    }
    
    // 測試批量真偽檢查
    console.log('\n3. 測試批量真偽檢查...');
    const batchResponse = await axios.post(
      `${BASE_URL}/api/${API_VERSION}/authenticityCheck/batch-check`,
      {
        cards: testData.cardIds.map(id => ({ cardId: id, cardType: 'pokemon' }))
      },
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (batchResponse.data.success) {
      console.log('✅ 批量真偽檢查成功');
      console.log('   檢查卡片數量:', batchResponse.data.data.summary.totalCards);
    } else {
      console.log('❌ 批量真偽檢查失敗');
    }
    
    // 測試真偽檢查歷史
    console.log('\n4. 測試真偽檢查歷史...');
    const historyResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/authenticityCheck/history/${testData.userId}`,
      {
        ...testConfig,
        params: { limit: 10, offset: 0 }
      }
    );
    
    if (historyResponse.data.success) {
      console.log('✅ 真偽檢查歷史查詢成功');
      console.log('   歷史記錄數量:', historyResponse.data.data.history.length);
    } else {
      console.log('❌ 真偽檢查歷史查詢失敗');
    }
    
    // 測試真偽檢查統計
    console.log('\n5. 測試真偽檢查統計...');
    const statsResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/authenticityCheck/stats/${testData.userId}`,
      testConfig
    );
    
    if (statsResponse.data.success) {
      console.log('✅ 真偽檢查統計查詢成功');
      console.log('   總檢查次數:', statsResponse.data.data.totalChecks);
    } else {
      console.log('❌ 真偽檢查統計查詢失敗');
    }
    
  } catch (error) {
    console.error('❌ 真偽檢查測試失敗:', error.response?.data || error.message);
  }
}

async function testAIChat() {
  console.log('\n=== 測試AI聊天功能 ===');
  
  try {
    // 測試AI聊天對話
    console.log('1. 測試AI聊天對話...');
    const chatResponse = await axios.post(
      `${BASE_URL}/api/${API_VERSION}/aiChat/chat`,
      {
        message: testData.message,
        userId: testData.userId,
        context: [],
        chatType: 'general'
      },
      testConfig
    );
    
    if (chatResponse.data.success) {
      console.log('✅ AI聊天對話成功');
      console.log('   AI回應:', chatResponse.data.data.response);
    } else {
      console.log('❌ AI聊天對話失敗');
    }
    
    // 測試智能建議
    console.log('\n2. 測試智能建議...');
    const suggestionsResponse = await axios.post(
      `${BASE_URL}/api/${API_VERSION}/aiChat/suggestions`,
      {
        userId: testData.userId,
        context: {},
        userBehavior: {}
      },
      testConfig
    );
    
    if (suggestionsResponse.data.success) {
      console.log('✅ 智能建議生成成功');
      console.log('   建議數量:', suggestionsResponse.data.data.suggestions.length);
    } else {
      console.log('❌ 智能建議生成失敗');
    }
    
    // 測試知識庫查詢
    console.log('\n3. 測試知識庫查詢...');
    const knowledgeResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/aiChat/knowledge`,
      {
        ...testConfig,
        params: { query: '價格預測', category: 'price', limit: 5 }
      }
    );
    
    if (knowledgeResponse.data.success) {
      console.log('✅ 知識庫查詢成功');
      console.log('   查詢結果數量:', knowledgeResponse.data.data.results.length);
    } else {
      console.log('❌ 知識庫查詢失敗');
    }
    
    // 測試聊天歷史
    console.log('\n4. 測試聊天歷史...');
    const historyResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/aiChat/history/${testData.userId}`,
      {
        ...testConfig,
        params: { limit: 10, offset: 0 }
      }
    );
    
    if (historyResponse.data.success) {
      console.log('✅ 聊天歷史查詢成功');
      console.log('   歷史記錄數量:', historyResponse.data.data.history.length);
    } else {
      console.log('❌ 聊天歷史查詢失敗');
    }
    
    // 測試聊天統計
    console.log('\n5. 測試聊天統計...');
    const statsResponse = await axios.get(
      `${BASE_URL}/api/${API_VERSION}/aiChat/stats/${testData.userId}`,
      testConfig
    );
    
    if (statsResponse.data.success) {
      console.log('✅ 聊天統計查詢成功');
      console.log('   總對話次數:', statsResponse.data.data.totalConversations);
    } else {
      console.log('❌ 聊天統計查詢失敗');
    }
    
    // 測試反饋評價
    console.log('\n6. 測試反饋評價...');
    const feedbackResponse = await axios.post(
      `${BASE_URL}/api/${API_VERSION}/aiChat/feedback`,
      {
        userId: testData.userId,
        messageId: 'test_message_001',
        rating: 5,
        feedback: '很好的服務！'
      },
      testConfig
    );
    
    if (feedbackResponse.data.success) {
      console.log('✅ 反饋評價提交成功');
      console.log('   評價分數:', feedbackResponse.data.data.rating);
    } else {
      console.log('❌ 反饋評價提交失敗');
    }
    
  } catch (error) {
    console.error('❌ AI聊天測試失敗:', error.response?.data || error.message);
  }
}

// 主測試函數
async function runAllTests() {
  console.log('🚀 開始測試新功能...');
  console.log(`📡 API基礎URL: ${BASE_URL}`);
  console.log(`📋 API版本: ${API_VERSION}`);
  
  try {
    await testPricePrediction();
    await testAuthenticityCheck();
    await testAIChat();
    
    console.log('\n🎉 所有測試完成！');
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
  }
}

// 單獨測試函數
async function testSpecificFeature(feature) {
  console.log(`🚀 開始測試 ${feature} 功能...`);
  
  try {
    switch (feature) {
      case 'price':
        await testPricePrediction();
        break;
      case 'authenticity':
        await testAuthenticityCheck();
        break;
      case 'chat':
        await testAIChat();
        break;
      default:
        console.log('❌ 未知的測試功能:', feature);
        console.log('可用的測試功能: price, authenticity, chat');
    }
    
    console.log(`🎉 ${feature} 功能測試完成！`);
  } catch (error) {
    console.error(`❌ ${feature} 功能測試失敗:`, error.message);
  }
}

// 導出測試函數
module.exports = {
  runAllTests,
  testSpecificFeature,
  testPricePrediction,
  testAuthenticityCheck,
  testAIChat
};

// 如果直接運行此文件
if (require.main === module) {
  const feature = process.argv[2];
  
  if (feature) {
    testSpecificFeature(feature);
  } else {
    runAllTests();
  }
}
