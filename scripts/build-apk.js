#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始構建TCG助手APK...\n');

// 檢查必要的工具
function checkRequirements() {
  console.log('📋 檢查構建要求...');
  
  try {
    // 檢查Node.js版本
    const nodeVersion = process.version;
    console.log(`✅ Node.js版本: ${nodeVersion}`);
    
    // 檢查npm版本
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm版本: ${npmVersion}`);
    
    // 檢查Expo CLI
    try {
      const expoVersion = execSync('expo --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Expo CLI版本: ${expoVersion}`);
    } catch (error) {
      console.log('⚠️  Expo CLI未安裝，正在安裝...');
      execSync('npm install -g @expo/cli', { stdio: 'inherit' });
    }
    
    // 檢查EAS CLI
    try {
      const easVersion = execSync('eas --version', { encoding: 'utf8' }).trim();
      console.log(`✅ EAS CLI版本: ${easVersion}`);
    } catch (error) {
      console.log('⚠️  EAS CLI未安裝，正在安裝...');
      execSync('npm install -g eas-cli', { stdio: 'inherit' });
    }
    
  } catch (error) {
    console.error('❌ 檢查要求失敗:', error.message);
    process.exit(1);
  }
}

// 清理構建緩存
function cleanBuild() {
  console.log('\n🧹 清理構建緩存...');
  
  try {
    // 清理node_modules (可選)
    if (process.argv.includes('--clean-all')) {
      console.log('刪除node_modules...');
      execSync('rm -rf node_modules', { stdio: 'inherit' });
      execSync('npm install', { stdio: 'inherit' });
    }
    
    // 清理Expo緩存
    execSync('expo r -c', { stdio: 'inherit' });
    
    // 清理Metro緩存
    execSync('npx react-native start --reset-cache', { stdio: 'pipe', timeout: 5000 });
    
    console.log('✅ 緩存清理完成');
  } catch (error) {
    console.log('⚠️  緩存清理跳過');
  }
}

// 構建APK
async function buildAPK() {
  console.log('\n🔨 開始構建APK...');
  
  try {
    // 選擇構建類型
    const buildType = process.argv.includes('--production') ? 'production' : 
                     process.argv.includes('--preview') ? 'preview' : 'local';
    
    console.log(`📦 構建類型: ${buildType}`);
    
    if (buildType === 'local') {
      // 本地構建
      console.log('🏠 使用本地構建...');
      execSync('eas build --platform android --local --profile local', { 
        stdio: 'inherit',
        env: { ...process.env, EXPO_USE_LOCAL_CLI: '1' }
      });
    } else {
      // 雲端構建
      console.log('☁️ 使用雲端構建...');
      execSync(`eas build --platform android --profile ${buildType}`, { 
        stdio: 'inherit',
        env: { ...process.env, EXPO_USE_LOCAL_CLI: '1' }
      });
    }
    
    console.log('✅ APK構建完成！');
    
  } catch (error) {
    console.error('❌ APK構建失敗:', error.message);
    process.exit(1);
  }
}

// 主函數
async function main() {
  try {
    checkRequirements();
    cleanBuild();
    await buildAPK();
    
    console.log('\n🎉 TCG助手APK構建成功！');
    console.log('📱 APK文件位置:');
    console.log('   - 本地構建: ./android/app/build/outputs/apk/');
    console.log('   - 雲端構建: 請查看EAS構建頁面');
    
  } catch (error) {
    console.error('❌ 構建過程失敗:', error.message);
    process.exit(1);
  }
}

// 運行主函數
if (require.main === module) {
  main();
}

module.exports = { checkRequirements, cleanBuild, buildAPK };
