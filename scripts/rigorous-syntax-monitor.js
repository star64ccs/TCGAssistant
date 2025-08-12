#!/usr/bin/env node

/**
 * 嚴謹的語法監控和預防系統
 * 使用真正的 JavaScript 解析器進行深度語法分析
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(80)}`);
  log(`🔍 ${title}`, 'cyan');
  console.log('='.repeat(80));
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

function logInfo(message) {
  log(`  ℹ️  ${message}`, 'blue');
}

// 檢查 Node.js 版本
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major < 16) {
    logError(`Node.js 版本過低: ${version}，需要 16.0.0 或更高版本`);
    process.exit(1);
  }
  
  logSuccess(`Node.js 版本檢查通過: ${version}`);
}

// 檢查文件編碼
function checkFileEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('utf8');
    
    // 檢查是否有 BOM
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return { valid: false, error: '檢測到 UTF-8 BOM，建議移除' };
    }
    
    // 檢查是否有無效字符
    const invalidChars = content.match(/[\uFFFD]/g);
    if (invalidChars) {
      return { valid: false, error: `檢測到 ${invalidChars.length} 個無效字符` };
    }
    
    return { valid: true, content };
  } catch (error) {
    return { valid: false, error: `文件讀取失敗: ${error.message}` };
  }
}

// 使用 Node.js 內建的語法檢查
function checkJavaScriptSyntax(content, filePath) {
  const errors = [];
  
  try {
    // 嘗試解析 JavaScript 代碼
    new Function(content);
  } catch (error) {
    // 解析錯誤信息
    const errorMessage = error.message;
    const lineMatch = errorMessage.match(/at position (\d+)/);
    
    if (lineMatch) {
      const position = parseInt(lineMatch[1]);
      const lines = content.split('\n');
      let currentPos = 0;
      let lineNumber = 1;
      let columnNumber = 1;
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 for newline
        if (currentPos + lineLength > position) {
          lineNumber = i + 1;
          columnNumber = position - currentPos + 1;
          break;
        }
        currentPos += lineLength;
      }
      
      errors.push({
        type: '語法錯誤',
        message: errorMessage.replace(/at position \d+/, ''),
        line: lineNumber,
        column: columnNumber,
        position: position
      });
    } else {
      errors.push({
        type: '語法錯誤',
        message: errorMessage,
        line: 0,
        column: 0,
        position: 0
      });
    }
  }
  
  return errors;
}

// 深度語法檢查
function deepSyntaxCheck(content, filePath) {
  const errors = [];
  
  // 1. 檢查基本語法結構
  const basicChecks = [
    {
      name: '括號匹配',
      pattern: /[\(\)]/g,
      check: (content) => {
        const stack = [];
        const lines = content.split('\n');
        
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
          const line = lines[lineNum];
          for (let charNum = 0; charNum < line.length; charNum++) {
            const char = line[charNum];
            
            // 跳過字符串和註釋
            if (char === '"' || char === "'" || char === '`') {
              const endChar = char;
              charNum++;
              while (charNum < line.length && line[charNum] !== endChar) {
                if (line[charNum] === '\\') charNum++;
                charNum++;
              }
              continue;
            }
            
            if (char === '/' && charNum + 1 < line.length) {
              if (line[charNum + 1] === '/' || line[charNum + 1] === '*') {
                break; // 跳過整行註釋
              }
            }
            
            if (char === '(') {
              stack.push({ char: '(', line: lineNum + 1, column: charNum + 1 });
            } else if (char === ')') {
              if (stack.length === 0) {
                errors.push({
                  type: '括號不匹配',
                  message: '發現未匹配的右括號',
                  line: lineNum + 1,
                  column: charNum + 1
                });
              } else {
                stack.pop();
              }
            }
          }
        }
        
        // 檢查未閉合的左括號
        stack.forEach(item => {
          errors.push({
            type: '括號不匹配',
            message: '發現未閉合的左括號',
            line: item.line,
            column: item.column
          });
        });
        
        return errors.length === 0;
      }
    },
    
    {
      name: '大括號匹配',
      pattern: /[{}]/g,
      check: (content) => {
        const stack = [];
        const lines = content.split('\n');
        
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
          const line = lines[lineNum];
          for (let charNum = 0; charNum < line.length; charNum++) {
            const char = line[charNum];
            
            // 跳過字符串和註釋
            if (char === '"' || char === "'" || char === '`') {
              const endChar = char;
              charNum++;
              while (charNum < line.length && line[charNum] !== endChar) {
                if (line[charNum] === '\\') charNum++;
                charNum++;
              }
              continue;
            }
            
            if (char === '/' && charNum + 1 < line.length) {
              if (line[charNum + 1] === '/' || line[charNum + 1] === '*') {
                break;
              }
            }
            
            if (char === '{') {
              stack.push({ char: '{', line: lineNum + 1, column: charNum + 1 });
            } else if (char === '}') {
              if (stack.length === 0) {
                errors.push({
                  type: '大括號不匹配',
                  message: '發現未匹配的右大括號',
                  line: lineNum + 1,
                  column: charNum + 1
                });
              } else {
                stack.pop();
              }
            }
          }
        }
        
        stack.forEach(item => {
          errors.push({
            type: '大括號不匹配',
            message: '發現未閉合的左大括號',
            line: item.line,
            column: item.column
          });
        });
        
        return errors.length === 0;
      }
    }
  ];
  
  // 執行基本檢查
  basicChecks.forEach(check => {
    if (!check.check(content)) {
      // 錯誤已在檢查過程中添加到 errors 數組
    }
  });
  
  // 2. 檢查 JavaScript 語法
  const jsErrors = checkJavaScriptSyntax(content, filePath);
  errors.push(...jsErrors);
  
  // 3. 檢查常見的語法問題
  const commonIssues = [
    {
      name: '未終止的正則表達式',
      pattern: /\/[^\/\n]*$/gm,
      check: (content) => {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^\/[^\/\n]*$/)) {
            errors.push({
              type: '正則表達式錯誤',
              message: '未終止的正則表達式',
              line: i + 1,
              column: 1
            });
          }
        }
      }
    },
    
    {
      name: '未閉合的字符串',
      pattern: /["'`][^"'`\n]*$/gm,
      check: (content) => {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let inString = false;
          let stringChar = '';
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (!inString && (char === '"' || char === "'" || char === '`')) {
              inString = true;
              stringChar = char;
            } else if (inString && char === stringChar) {
              if (j === 0 || line[j - 1] !== '\\') {
                inString = false;
                stringChar = '';
              }
            }
          }
          
          if (inString) {
            errors.push({
              type: '字符串錯誤',
              message: `未閉合的${stringChar === '"' ? '雙引號' : stringChar === "'" ? '單引號' : '反引號'}字符串`,
              line: i + 1,
              column: line.length + 1
            });
          }
        }
      }
    }
  ];
  
  commonIssues.forEach(issue => {
    issue.check(content);
  });
  
  return errors;
}

// 檢查單個文件
function checkFileSyntax(filePath) {
  logStep(`檢查文件: ${path.basename(filePath)}`);
  
  // 1. 檢查文件編碼
  const encodingCheck = checkFileEncoding(filePath);
  if (!encodingCheck.valid) {
    return {
      valid: false,
      errors: [{ type: '編碼錯誤', message: encodingCheck.error, line: 0, column: 0 }],
      filePath
    };
  }
  
  // 2. 深度語法檢查
  const syntaxErrors = deepSyntaxCheck(encodingCheck.content, filePath);
  
  return {
    valid: syntaxErrors.length === 0,
    errors: syntaxErrors,
    filePath
  };
}

// 監控整個項目
function monitorProject() {
  logSection('嚴謹的語法監控系統');
  
  // 檢查環境
  checkNodeVersion();
  
  const srcDir = path.join(__dirname, '..', 'src');
  if (!fs.existsSync(srcDir)) {
    logError(`源代碼目錄不存在: ${srcDir}`);
    return [];
  }
  
  const results = [];
  let totalFiles = 0;
  let validFiles = 0;
  let invalidFiles = 0;
  
  function scanDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
          totalFiles++;
          const result = checkFileSyntax(filePath);
          
          if (!result.valid) {
            invalidFiles++;
            results.push(result);
          } else {
            validFiles++;
          }
        }
      });
    } catch (error) {
      logError(`掃描目錄失敗: ${dir} - ${error.message}`);
    }
  }
  
  scanDirectory(srcDir);
  
  // 詳細報告
  logSection('檢查結果');
  log(`總文件數: ${totalFiles}`, 'blue');
  log(`語法正確: ${validFiles}`, 'green');
  log(`語法錯誤: ${invalidFiles}`, 'red');
  
  if (results.length > 0) {
    logSection('詳細錯誤報告');
    results.forEach(result => {
      const relativePath = path.relative(srcDir, result.filePath);
      logError(`文件: ${relativePath}`);
      
      result.errors.forEach(error => {
        if (error.line > 0) {
          log(`  第 ${error.line} 行，第 ${error.column} 列: ${error.type} - ${error.message}`, 'red');
        } else {
          log(`  ${error.type}: ${error.message}`, 'red');
        }
      });
      console.log('');
    });
  }
  
  return results;
}

// 預防性檢查
function preventiveCheck() {
  logSection('預防性語法檢查');
  
  const bestPractices = [
    '使用 ESLint 進行代碼檢查',
    '在編輯器中啟用語法高亮',
    '使用 Prettier 格式化代碼',
    '定期運行 npm run lint:check',
    '使用 TypeScript 進行類型檢查',
    '設置 Git hooks 進行提交前檢查',
    '使用 IDE 的實時語法檢查功能'
  ];
  
  logInfo('最佳實踐建議:');
  bestPractices.forEach((practice, index) => {
    log(`  ${index + 1}. ${practice}`, 'blue');
  });
  
  return monitorProject();
}

// 性能監控
function performanceMonitor() {
  const startTime = process.hrtime.bigint();
  
  const results = preventiveCheck();
  
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1000000; // 轉換為毫秒
  
  logSection('性能報告');
  log(`檢查耗時: ${duration.toFixed(2)} 毫秒`, 'cyan');
  log(`平均每文件: ${(duration / results.length).toFixed(2)} 毫秒`, 'cyan');
  
  return results;
}

// 運行監控
if (require.main === module) {
  try {
    const results = performanceMonitor();
    
    if (results.length > 0) {
      logSection('後續建議');
      log('1. 優先修復語法錯誤', 'yellow');
      log('2. 使用 npm run fix:safe 進行安全修復', 'yellow');
      log('3. 手動檢查複雜的語法問題', 'yellow');
      log('4. 考慮使用 TypeScript 提高代碼質量', 'yellow');
    } else {
      logSuccess('🎉 所有文件語法檢查通過！');
    }
  } catch (error) {
    logError(`監控過程發生錯誤: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { 
  monitorProject, 
  preventiveCheck, 
  checkFileSyntax, 
  performanceMonitor,
  checkNodeVersion,
  checkFileEncoding,
  deepSyntaxCheck
};
