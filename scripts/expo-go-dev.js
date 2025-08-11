#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📱 開始 Expo Go 開發服務器...');

// 檢查必要工具
function checkTools() {
  console.log('📋 檢查必要工具...');

  try {
    const nodeVersion = process.version;
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const expoVersion = execSync('npx expo --version', { encoding: 'utf8' }).trim();

    console.log(`✅ Node.js: ${nodeVersion}`);
    console.log(`✅ npm: ${npmVersion}`);
    console.log(`✅ Expo CLI: ${expoVersion}`);

    return true;
  } catch (error) {
    console.error('❌ 工具檢查失敗:', error.message);
    return false;
  }
}

// 準備項目
function prepare() {
  console.log('🧹 準備項目...');

  try {
    // 安裝依賴
    console.log('📦 安裝依賴...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

    // 檢查app.json配置
    console.log('📝 檢查配置...');
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));

    if (!appConfig.expo.extra?.eas?.projectId || appConfig.expo.extra.eas.projectId === 'your-project-id') {
      console.log('⚠️  需要配置EAS項目ID');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ 準備失敗:', error.message);
    return false;
  }
}

// 創建開發版本
function createDevelopmentBuild() {
  console.log('🔨 創建開發版本...');

  try {
    // 使用expo start創建開發服務器
    console.log('🌐 啟動開發服務器...');

    const startCommand = 'npx expo start --dev-client';
    console.log(`執行: ${startCommand}`);

    // 這裡我們只啟動服務器，實際的APK需要通過Expo Go應用程序訪問
    execSync(startCommand, {
      stdio: 'inherit',
      timeout: 60000, // 1分鐘超時
    });

    return true;
  } catch (error) {
    console.log(`❌ 開發版本創建失敗: ${error.message}`);
    return false;
  }
}

// 生成QR碼和說明
function generateInstructions() {
  console.log('\n📱 Expo Go 使用說明');
  console.log('==================');
  console.log('1. 在Android設備上安裝Expo Go應用程序');
  console.log('2. 掃描下面顯示的QR碼');
  console.log('3. 應用程序將在Expo Go中運行');
  console.log('');
  console.log('💡 注意: 這不是獨立的APK文件，而是通過Expo Go運行的開發版本');
  console.log('💡 要創建獨立APK，需要配置EAS構建或設置本地Android開發環境');
}

// 主函數
async function main() {
  console.log('🎯 TCG助手 Expo Go 構建工具');
  console.log('==========================\n');

  if (!checkTools()) {
    console.error('❌ 工具檢查失敗，退出構建');
    process.exit(1);
  }

  if (!prepare()) {
    console.error('❌ 準備失敗，退出構建');
    process.exit(1);
  }

  const success = createDevelopmentBuild();

  if (success) {
    console.log('\n🎉 開發服務器啟動成功！');
    generateInstructions();
  } else {
    console.error('\n💥 開發版本創建失敗');
    console.log('💡 建議:');
    console.log('   1. 檢查網絡連接');
    console.log('   2. 確保端口8081或8082可用');
    console.log('   3. 嘗試手動運行: npx expo start');
    process.exit(1);
  }
}

// 運行主函數
if (require.main === module) {
  main().catch(error => {
    console.error('💥 構建過程出錯:', error);
    process.exit(1);
  });
}

module.exports = { main };
