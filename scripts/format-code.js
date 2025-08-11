#!/usr/bin/env node

/**
 * 統一格式化整個項目的代碼
 * 使用 Prettier 和 ESLint 來確保代碼風格一致性
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// 需要格式化的文件類型
const FORMAT_EXTENSIONS = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'md',
  'yml',
  'yaml',
];

// 需要排除的目錄
const EXCLUDE_DIRS = [
  'node_modules',
  '.expo',
  'android',
  'ios',
  'web',
  'build',
  'dist',
  '.git',
  'coverage',
];

// 需要排除的文件
const EXCLUDE_FILES = [
  'package-lock.json',
  'yarn.lock',
  '*.min.js',
  '*.bundle.js',
];

/**
 * 檢查是否為需要排除的目錄
 */
function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.includes(dirName) || dirName.startsWith('.');
}

/**
 * 檢查是否為需要排除的文件
 */
function shouldExcludeFile(fileName) {
  return EXCLUDE_FILES.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(fileName);
    }
    return fileName === pattern;
  });
}

/**
 * 檢查文件是否為需要格式化的類型
 */
function shouldFormatFile(fileName) {
  const ext = path.extname(fileName).slice(1);
  return FORMAT_EXTENSIONS.includes(ext);
}

/**
 * 遞歸獲取所有需要格式化的文件
 */
function getFilesToFormat(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldExcludeDir(item)) {
        getFilesToFormat(fullPath, files);
      }
    } else if (stat.isFile()) {
      if (shouldFormatFile(item) && !shouldExcludeFile(item)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * 運行 Prettier 格式化
 */
function runPrettier(files) {
  try {
    log.info('運行 Prettier 格式化...');

    if (files.length === 0) {
      log.warning('沒有找到需要格式化的文件');
      return true;
    }

    // 使用 Prettier 格式化文件
    const command = `npx prettier --write "${files.join('" "')}"`;
    execSync(command, { stdio: 'inherit' });

    log.success(`成功格式化 ${files.length} 個文件`);
    return true;
  } catch (error) {
    log.error(`Prettier 格式化失敗: ${error.message}`);
    return false;
  }
}

/**
 * 運行 ESLint 修復
 */
function runESLint() {
  try {
    log.info('運行 ESLint 修復...');

    const command = 'npx eslint --fix src/';
    execSync(command, { stdio: 'inherit' });

    log.success('ESLint 修復完成');
    return true;
  } catch (error) {
    log.error(`ESLint 修復失敗: ${error.message}`);
    return false;
  }
}

/**
 * 檢查代碼風格
 */
function checkCodeStyle() {
  try {
    log.info('檢查代碼風格...');

    const command = 'npx eslint src/';
    execSync(command, { stdio: 'inherit' });

    log.success('代碼風格檢查通過');
    return true;
  } catch (error) {
    log.error(`代碼風格檢查失敗: ${error.message}`);
    return false;
  }
}

/**
 * 主函數
 */
function main() {
  log.header('TCG助手應用程式 - 代碼格式化工具');

  const projectRoot = process.cwd();
  log.info(`項目根目錄: ${projectRoot}`);

  // 獲取需要格式化的文件
  log.info('掃描需要格式化的文件...');
  const filesToFormat = getFilesToFormat(projectRoot);
  log.info(`找到 ${filesToFormat.length} 個文件需要格式化`);

  // 顯示文件列表
  if (filesToFormat.length > 0) {
    log.info('需要格式化的文件:');
    filesToFormat.forEach(file => {
      console.log(`  ${path.relative(projectRoot, file)}`);
    });
  }

  // 運行格式化
  const prettierSuccess = runPrettier(filesToFormat);
  const eslintSuccess = runESLint();

  // 檢查代碼風格
  const styleCheckSuccess = checkCodeStyle();

  // 總結
  log.header('格式化結果總結');

  if (prettierSuccess && eslintSuccess && styleCheckSuccess) {
    log.success('所有格式化任務完成！');
    log.info('代碼現在符合統一的編碼風格標準');
  } else {
    log.error('部分格式化任務失敗，請檢查錯誤信息');
    process.exit(1);
  }

  log.info('\n建議:');
  log.info('1. 在編輯器中安裝 Prettier 和 ESLint 插件');
  log.info('2. 設置保存時自動格式化');
  log.info('3. 在提交前運行此腳本確保代碼風格一致');
}

// 運行主函數
if (require.main === module) {
  main();
}

module.exports = {
  getFilesToFormat,
  runPrettier,
  runESLint,
  checkCodeStyle,
};
