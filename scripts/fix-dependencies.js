#!/usr/bin/env node

/**
 * TCG Assistant 依賴修復腳本
 * 自動修復缺失依賴、清理未使用依賴、更新過時依賴
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${ '='.repeat(60)}`);
  log(`🔧 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logStep(step) {
  log(`  📋 ${step}`, 'yellow');
}

function logSuccess(message) {
  log(`  ✅ ${message}`, 'green');
}

function logError(message) {
  log(`  ❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠️  ${message}`, 'yellow');
}

// 檢查檔案是否存在
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// 執行命令
function executeCommand(command, cwd = process.cwd()) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd,
      stdio: 'pipe',
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 修復前端依賴
function fixFrontendDependencies() {
  logSection('修復前端依賴');

  // 1. 安裝缺失的依賴
  logStep('安裝缺失的依賴');
  const missingDeps = ['crypto-js', 'react-native-device-info'];
  const installResult = executeCommand(`npm install ${missingDeps.join(' ')}`);

  if (installResult.success) {
    logSuccess('缺失依賴安裝成功');
  } else {
    logError(`安裝缺失依賴失敗: ${installResult.error}`);
  }

  // 2. 移除未使用的依賴
  logStep('移除未使用的依賴');
  const unusedDeps = [
    '@react-native-community/datetimepicker',
    '@react-navigation/bottom-tabs',
    '@react-navigation/drawer',
    '@react-navigation/stack',
    'expo-camera',
    'expo-constants',
    'expo-image-manipulator',
    'expo-image-picker',
    'expo-linear-gradient',
    'expo-localization',
    'react-dom',
    'react-native-chart-kit',
    'react-native-gesture-handler',
    'react-native-image-picker',
    'react-native-qrcode-svg',
    'react-native-screens',
    'react-native-share',
    'react-native-svg',
    'react-native-web',
    'sharp',
  ];

  const removeResult = executeCommand(`npm uninstall ${unusedDeps.join(' ')}`);

  if (removeResult.success) {
    logSuccess('未使用依賴移除成功');
  } else {
    logWarning(`移除未使用依賴時出現警告: ${removeResult.error}`);
  }

  // 3. 移除未使用的開發依賴
  logStep('移除未使用的開發依賴');
  const unusedDevDeps = [
    '@babel/runtime',
    'depcheck',
    'jest-environment-jsdom',
    'metro-react-native-babel-preset',
    'react-native-svg-asset-plugin',
    'react-native-svg-transformer',
    'typescript',
  ];

  const removeDevResult = executeCommand(`npm uninstall ${unusedDevDeps.join(' ')}`);

  if (removeDevResult.success) {
    logSuccess('未使用開發依賴移除成功');
  } else {
    logWarning(`移除未使用開發依賴時出現警告: ${removeDevResult.error}`);
  }
}

// 修復後端依賴
function fixBackendDependencies() {
  logSection('修復後端依賴');

  const backendPath = path.join(process.cwd(), 'backend');

  if (!fileExists(backendPath)) {
    logError('後端目錄不存在');
    return;
  }

  // 1. 移除未使用的依賴
  logStep('移除後端未使用的依賴');
  const unusedDeps = [
    'multer',
    'sqlite3',
    'pg',
    'redis',
    'axios',
    'node-cron',
    'express-validator',
    'sharp',
    'nodemailer',
  ];

  const removeResult = executeCommand(`npm uninstall ${unusedDeps.join(' ')}`, backendPath);

  if (removeResult.success) {
    logSuccess('後端未使用依賴移除成功');
  } else {
    logWarning(`移除後端未使用依賴時出現警告: ${removeResult.error}`);
  }

  // 2. 移除未使用的開發依賴
  logStep('移除後端未使用的開發依賴');
  const unusedDevDeps = [
    'supertest',
    'eslint-config-airbnb-base',
    'eslint-plugin-import',
    'prettier',
  ];

  const removeDevResult = executeCommand(`npm uninstall ${unusedDevDeps.join(' ')}`, backendPath);

  if (removeDevResult.success) {
    logSuccess('後端未使用開發依賴移除成功');
  } else {
    logWarning(`移除後端未使用開發依賴時出現警告: ${removeDevResult.error}`);
  }
}

// 檢查安全漏洞
function checkSecurityVulnerabilities() {
  logSection('檢查安全漏洞');

  // 檢查前端安全漏洞
  logStep('檢查前端安全漏洞');
  const frontendAudit = executeCommand('npm audit --audit-level=moderate');

  if (frontendAudit.success) {
    logSuccess('前端安全檢查通過');
  } else {
    logWarning(`前端安全檢查發現問題: ${frontendAudit.error}`);
  }

  // 檢查後端安全漏洞
  logStep('檢查後端安全漏洞');
  const backendPath = path.join(process.cwd(), 'backend');

  if (fileExists(backendPath)) {
    const backendAudit = executeCommand('npm audit --audit-level=moderate', backendPath);

    if (backendAudit.success) {
      logSuccess('後端安全檢查通過');
    } else {
      logWarning(`後端安全檢查發現問題: ${backendAudit.error}`);
    }
  }
}

// 生成依賴報告
function generateDependencyReport() {
  logStep('生成依賴報告');

  const report = {
    timestamp: new Date().toISOString(),
    frontend: {
      missingDependencies: ['crypto-js', 'react-native-device-info'],
      unusedDependencies: [
        '@react-native-community/datetimepicker',
        '@react-navigation/bottom-tabs',
        '@react-navigation/drawer',
        '@react-navigation/stack',
        'expo-camera',
        'expo-constants',
        'expo-image-manipulator',
        'expo-image-picker',
        'expo-linear-gradient',
        'expo-localization',
        'react-dom',
        'react-native-chart-kit',
        'react-native-gesture-handler',
        'react-native-image-picker',
        'react-native-qrcode-svg',
        'react-native-screens',
        'react-native-share',
        'react-native-svg',
        'react-native-web',
        'sharp',
      ],
      unusedDevDependencies: [
        '@babel/runtime',
        'depcheck',
        'jest-environment-jsdom',
        'metro-react-native-babel-preset',
        'react-native-svg-asset-plugin',
        'react-native-svg-transformer',
        'typescript',
      ],
    },
    backend: {
      unusedDependencies: [
        'multer',
        'sqlite3',
        'pg',
        'redis',
        'axios',
        'node-cron',
        'express-validator',
        'sharp',
        'nodemailer',
      ],
      unusedDevDependencies: [
        'supertest',
        'eslint-config-airbnb-base',
        'eslint-plugin-import',
        'prettier',
      ],
    },
    recommendations: [
      '定期執行 npm audit 檢查安全漏洞',
      '定期執行 npm outdated 檢查過時依賴',
      '定期執行 npx depcheck 檢查未使用依賴',
      '在更新依賴前進行充分測試',
      '保持 package.json 的整潔性',
    ],
  };

  const reportPath = 'dependency-report.json';
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logSuccess(`依賴報告已生成: ${reportPath}`);
  } catch (error) {
    logError(`無法生成依賴報告: ${error.message}`);
  }
}

// 主函數
function main() {
  log('🔧 TCG Assistant 依賴修復工具', 'bright');
  log('開始修復依賴問題...', 'blue');

  try {
    // 修復前端依賴
    fixFrontendDependencies();

    // 修復後端依賴
    fixBackendDependencies();

    // 檢查安全漏洞
    checkSecurityVulnerabilities();

    // 生成報告
    generateDependencyReport();

    logSection('修復完成');
    log('🎉 依賴修復完成！', 'green');
    log('建議執行以下命令驗證修復結果：', 'blue');
    log('  npm audit --audit-level=moderate', 'yellow');
    log('  npx depcheck', 'yellow');
    log('  npm test', 'yellow');
  } catch (error) {
    logError(`修復過程中發生錯誤: ${error.message}`);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  fixFrontendDependencies,
  fixBackendDependencies,
  checkSecurityVulnerabilities,
  generateDependencyReport,
};
