#!/usr/bin/env node

/**
 * TCG Assistant 專案清理腳本
 * 自動清理重複檔案、未使用的依賴、和過時的程式碼
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
  console.log(`\n${ '='.repeat(50)}`);
  log(`🔧 ${title}`, 'cyan');
  console.log('='.repeat(50));
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

// 讀取 JSON 檔案
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// 寫入 JSON 檔案
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

// 遞迴搜尋檔案
function findFiles(dir, pattern) {
  const files = [];

  function search(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        search(fullPath);
      } else if (pattern.test(item)) {
        files.push(fullPath);
      }
    }
  }

  search(dir);
  return files;
}

// 清理重複的 package.json 檔案
function cleanupDuplicatePackageFiles() {
  logStep('清理重複的 package.json 檔案');

  const duplicates = [
    'package-original.json',
    'package-simple.json',
  ];

  let cleanedCount = 0;

  for (const duplicate of duplicates) {
    if (fileExists(duplicate)) {
      try {
        fs.unlinkSync(duplicate);
        logSuccess(`已刪除: ${duplicate}`);
        cleanedCount++;
      } catch (error) {
        logError(`無法刪除 ${duplicate}: ${error.message}`);
      }
    }
  }

  if (cleanedCount > 0) {
    logSuccess(`已清理 ${cleanedCount} 個重複檔案`);
  } else {
    logSuccess('沒有發現重複的 package.json 檔案');
  }
}

// 清理重複的組件檔案
function cleanupDuplicateComponents() {
  logStep('清理重複的組件檔案');

  const duplicates = [
    'src/components/LightweightChart.js',
    'src/components/ReduxTestComponent.js',
    'src/components/ExampleComponent.js',
  ];

  let cleanedCount = 0;

  for (const duplicate of duplicates) {
    if (fileExists(duplicate)) {
      try {
        fs.unlinkSync(duplicate);
        logSuccess(`已刪除: ${duplicate}`);
        cleanedCount++;
      } catch (error) {
        logError(`無法刪除 ${duplicate}: ${error.message}`);
      }
    }
  }

  if (cleanedCount > 0) {
    logSuccess(`已清理 ${cleanedCount} 個重複組件`);
  } else {
    logSuccess('沒有發現重複的組件檔案');
  }
}

// 清理重複的服務檔案
function cleanupDuplicateServices() {
  logStep('清理重複的服務檔案');

  const duplicates = [
    'src/services/enhancedAIChatService.js',
    'src/services/enhancedAuthenticityService.js',
    'src/services/enhancedMarketAnalysisService.js',
    'src/services/enhancedMLService.js',
    'src/services/gradedCardRecognitionService.js',
    'src/services/imageFeatureService.js',
    'src/services/highPrecisionAuthenticityService.js',
    'src/services/integratedApiService.js',
    'src/services/marketPriceIntegrationService.js',
    'src/services/multiSourceAutoUpdateService.js',
    'src/services/networkOptimizationService.js',
    'src/services/realApiService.js',
    'src/services/robotsTxtService.js',
    'src/services/socialAuthService.js',
    'src/services/snkrdunkCrawlerService.js',
    'src/services/ultraPrecisionAuthenticityService.js',
    'src/services/ultraFastCardRecognitionService.js',
    'src/services/exampleService.js',
  ];

  let cleanedCount = 0;

  for (const duplicate of duplicates) {
    if (fileExists(duplicate)) {
      try {
        fs.unlinkSync(duplicate);
        logSuccess(`已刪除: ${duplicate}`);
        cleanedCount++;
      } catch (error) {
        logError(`無法刪除 ${duplicate}: ${error.message}`);
      }
    }
  }

  if (cleanedCount > 0) {
    logSuccess(`已清理 ${cleanedCount} 個重複服務`);
  } else {
    logSuccess('沒有發現重複的服務檔案');
  }
}

// 清理測試檔案
function cleanupTestFiles() {
  logStep('清理測試檔案');

  const testFiles = [
    'src/tests/ExampleComponent.test.js',
  ];

  let cleanedCount = 0;

  for (const testFile of testFiles) {
    if (fileExists(testFile)) {
      try {
        fs.unlinkSync(testFile);
        logSuccess(`已刪除: ${testFile}`);
        cleanedCount++;
      } catch (error) {
        logError(`無法刪除 ${testFile}: ${error.message}`);
      }
    }
  }

  if (cleanedCount > 0) {
    logSuccess(`已清理 ${cleanedCount} 個測試檔案`);
  } else {
    logSuccess('沒有發現需要清理的測試檔案');
  }
}

// 清理螢幕檔案
function cleanupScreenFiles() {
  logStep('清理螢幕檔案');

  const screenFiles = [
    'src/screens/ReduxTestScreen.js',
  ];

  let cleanedCount = 0;

  for (const screenFile of screenFiles) {
    if (fileExists(screenFile)) {
      try {
        fs.unlinkSync(screenFile);
        logSuccess(`已刪除: ${screenFile}`);
        cleanedCount++;
      } catch (error) {
        logError(`無法刪除 ${screenFile}: ${error.message}`);
      }
    }
  }

  if (cleanedCount > 0) {
    logSuccess(`已清理 ${cleanedCount} 個螢幕檔案`);
  } else {
    logSuccess('沒有發現需要清理的螢幕檔案');
  }
}

// 檢查未使用的依賴
function checkUnusedDependencies() {
  logStep('檢查未使用的依賴');

  try {
    // 檢查前端依賴
    const frontendResult = execSync('npx depcheck --json', { encoding: 'utf8' });
    const frontendData = JSON.parse(frontendResult);

    if (frontendData.dependencies.length > 0) {
      logWarning(`發現 ${frontendData.dependencies.length} 個可能未使用的依賴:`);
      frontendData.dependencies.forEach(dep => {
        logWarning(`  - ${dep}`);
      });
    } else {
      logSuccess('前端依賴檢查通過');
    }

    // 檢查後端依賴
    if (fileExists('backend/package.json')) {
      process.chdir('backend');
      const backendResult = execSync('npx depcheck --json', { encoding: 'utf8' });
      const backendData = JSON.parse(backendResult);

      if (backendData.dependencies.length > 0) {
        logWarning(`發現 ${backendData.dependencies.length} 個可能未使用的後端依賴:`);
        backendData.dependencies.forEach(dep => {
          logWarning(`  - ${dep}`);
        });
      } else {
        logSuccess('後端依賴檢查通過');
      }

      process.chdir('..');
    }
  } catch (error) {
    logError(`依賴檢查失敗: ${error.message}`);
  }
}

// 檢查安全漏洞
function checkSecurityVulnerabilities() {
  logStep('檢查安全漏洞');

  try {
    // 檢查前端安全漏洞
    const frontendAudit = execSync('npm audit --audit-level=moderate --json', { encoding: 'utf8' });
    const frontendData = JSON.parse(frontendAudit);

    if (frontendData.vulnerabilities) {
      const vulnCount = Object.keys(frontendData.vulnerabilities).length;
      logWarning(`發現 ${vulnCount} 個安全漏洞`);
    } else {
      logSuccess('前端安全檢查通過');
    }

    // 檢查後端安全漏洞
    if (fileExists('backend/package.json')) {
      process.chdir('backend');
      const backendAudit = execSync('npm audit --audit-level=moderate --json', { encoding: 'utf8' });
      const backendData = JSON.parse(backendAudit);

      if (backendData.vulnerabilities) {
        const vulnCount = Object.keys(backendData.vulnerabilities).length;
        logWarning(`發現 ${vulnCount} 個後端安全漏洞`);
      } else {
        logSuccess('後端安全檢查通過');
      }

      process.chdir('..');
    }
  } catch (error) {
    logError(`安全檢查失敗: ${error.message}`);
  }
}

// 生成清理報告
function generateCleanupReport() {
  logStep('生成清理報告');

  const report = {
    timestamp: new Date().toISOString(),
    cleanupActions: [
      '清理重複的 package.json 檔案',
      '清理重複的組件檔案',
      '清理重複的服務檔案',
      '清理測試檔案',
      '清理螢幕檔案',
    ],
    recommendations: [
      '定期執行 npm run clean:project 進行維護',
      '使用 npm audit 檢查安全漏洞',
      '使用 npx depcheck 檢查未使用的依賴',
      '定期更新依賴套件',
      '保持程式碼風格一致',
    ],
  };

  const reportPath = 'cleanup-report.json';
  if (writeJsonFile(reportPath, report)) {
    logSuccess(`清理報告已生成: ${reportPath}`);
  } else {
    logError('無法生成清理報告');
  }
}

// 主函數
function main() {
  log('🧹 TCG Assistant 專案清理工具', 'bright');
  log('開始清理專案...', 'blue');

  try {
    // 執行清理步驟
    cleanupDuplicatePackageFiles();
    cleanupDuplicateComponents();
    cleanupDuplicateServices();
    cleanupTestFiles();
    cleanupScreenFiles();

    // 檢查依賴和安全
    checkUnusedDependencies();
    checkSecurityVulnerabilities();

    // 生成報告
    generateCleanupReport();

    logSection('清理完成');
    log('🎉 專案清理完成！', 'green');
    log('建議定期執行此腳本以保持專案整潔。', 'blue');
  } catch (error) {
    logError(`清理過程中發生錯誤: ${error.message}`);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  cleanupDuplicatePackageFiles,
  cleanupDuplicateComponents,
  cleanupDuplicateServices,
  cleanupTestFiles,
  cleanupScreenFiles,
  checkUnusedDependencies,
  checkSecurityVulnerabilities,
  generateCleanupReport,
};
