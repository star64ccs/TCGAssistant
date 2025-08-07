#!/usr/bin/env node

/**
 * 基本功能測試腳本
 * 用於驗證後端服務器是否正常運行
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBasicFunctionality() {
  console.log('🔍 測試TCG Assistant後端基本功能...\n');

  try {
    // 1. 測試健康檢查端點
    console.log('1. 測試健康檢查端點...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`   ✅ 健康檢查通過: ${healthResponse.status}`);
    console.log(`   📊 服務器狀態: ${JSON.stringify(healthResponse.data)}\n`);

    // 2. 測試API根端點
    console.log('2. 測試API根端點...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log(`   ✅ API根端點正常: ${apiResponse.status}\n`);

    // 3. 測試卡牌資料API (不需要認證)
    console.log('3. 測試卡牌資料API...');
    const cardResponse = await axios.get(`${BASE_URL}/api/card-data/pokemon?limit=1`);
    console.log(`   ✅ 卡牌資料API正常: ${cardResponse.status}`);
    console.log(`   📋 返回卡牌數量: ${cardResponse.data.data?.length || 0}\n`);

    console.log('🎉 所有基本功能測試通過！');
    console.log('💡 現在您可以運行完整測試: npm run test:api');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 解決方案:');
      console.log('1. 確保後端服務器正在運行: npm start');
      console.log('2. 檢查端口3000是否被佔用');
      console.log('3. 確認.env文件配置正確');
    }
    
    process.exit(1);
  }
}

// 運行測試
if (require.main === module) {
  testBasicFunctionality();
}

module.exports = { testBasicFunctionality };
