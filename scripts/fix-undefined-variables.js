const fs = require('fs');
const path = require('path');

function fixUndefinedVariables() {
  const srcDir = path.join(__dirname, '..', 'src');
  let totalFixed = 0;

  function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          const originalContent = content;
          let fileFixed = 0;

          // 修復未定義的 _ 變數
          const undefinedFixes = [
            // 修復 filter 和 map 中的 _ 變數
            { pattern: /\.filter\(_\(([^)]*)\)\s*=>/g, replacement: '.filter(($1) =>' },
            { pattern: /\.map\(_\(([^)]*)\)\s*=>/g, replacement: '.map(($1) =>' },
            { pattern: /\.reduce\(_\(([^)]*)\)\s*=>/g, replacement: '.reduce(($1) =>' },
            { pattern: /\.forEach\(_\(([^)]*)\)\s*=>/g, replacement: '.forEach(($1) =>' },
            { pattern: /\.some\(_\(([^)]*)\)\s*=>/g, replacement: '.some(($1) =>' },
            { pattern: /\.every\(_\(([^)]*)\)\s*=>/g, replacement: '.every(($1) =>' },
            { pattern: /\.find\(_\(([^)]*)\)\s*=>/g, replacement: '.find(($1) =>' },
            { pattern: /\.findIndex\(_\(([^)]*)\)\s*=>/g, replacement: '.findIndex(($1) =>' },

            // 修復函數參數中的 _ 變數
            { pattern: /function\s*_\(([^)]*)\)/g, replacement: 'function ($1)' },
            { pattern: /const\s+_\s*=\s*\(([^)]*)\)\s*=>/g, replacement: 'const $1 = ($1) =>' },
            { pattern: /let\s+_\s*=\s*\(([^)]*)\)\s*=>/g, replacement: 'let $1 = ($1) =>' },
            { pattern: /var\s+_\s*=\s*\(([^)]*)\)\s*=>/g, replacement: 'var $1 = ($1) =>' },

            // 修復箭頭函數中的 _ 變數
            { pattern: /_\(([^)]*)\)\s*=>/g, replacement: '($1) =>' },

            // 修復解構賦值中的 _ 變數
            { pattern: /const\s*{\s*_([^}]*)\s*}\s*=/g, replacement: 'const {$1} =' },
            { pattern: /let\s*{\s*_([^}]*)\s*}\s*=/g, replacement: 'let {$1} =' },
            { pattern: /var\s*{\s*_([^}]*)\s*}\s*=/g, replacement: 'var {$1} =' },

            // 修復數組解構中的 _ 變數
            { pattern: /const\s*\[\s*_([^\]]*)\s*\]\s*=/g, replacement: 'const [$1] =' },
            { pattern: /let\s*\[\s*_([^\]]*)\s*\]\s*=/g, replacement: 'let [$1] =' },
            { pattern: /var\s*\[\s*_([^\]]*)\s*\]\s*=/g, replacement: 'var [$1] =' },

            // 修復單獨的 _ 變數（替換為適當的變數名）
            { pattern: /\b_\b(?!\()/g, replacement: 'unused' },

            // 修復 jest.fn 中的 _ 變數
            { pattern: /jest\.fn\(_\(([^)]*)\)\s*=>/g, replacement: 'jest.fn(($1) =>' },

            // 修復 Promise 相關的 _ 變數
            { pattern: /\.then\(_\(([^)]*)\)\s*=>/g, replacement: '.then(($1) =>' },
            { pattern: /\.catch\(_\(([^)]*)\)\s*=>/g, replacement: '.catch(($1) =>' },
            { pattern: /\.finally\(_\(([^)]*)\)\s*=>/g, replacement: '.finally(($1) =>' },
          ];

          // 應用修復
          undefinedFixes.forEach(fix => {
            const matches = content.match(fix.pattern);
            if (matches) {
              content = content.replace(fix.pattern, fix.replacement);
              fileFixed += matches.length;
            }
          });

          // 修復特定的未定義變數模式
          const specificUndefinedFixes = [
            // 修復 apiTester.js 中的特定問題
            { pattern: /\.filter\(_\(\[,\s*_result\]\)\s*=>/g, replacement: '.filter(([, result]) =>' },
            { pattern: /\.map\(_\(\[api,\s*_\]\)\s*=>/g, replacement: '.map(([api]) =>' },

            // 修復其他常見的未定義變數
            { pattern: /\b_async\b/g, replacement: 'async' },
            { pattern: /\b_getState\b/g, replacement: 'getState' },
            { pattern: /\b_logger\b/g, replacement: 'logger' },
            { pattern: /\b_categories\b/g, replacement: 'categories' },
            { pattern: /\b_data\b/g, replacement: 'data' },
            { pattern: /\b_response\b/g, replacement: 'response' },
            { pattern: /\b_error\b/g, replacement: 'error' },
            { pattern: /\b_result\b/g, replacement: 'result' },
            { pattern: /\b_payload\b/g, replacement: 'payload' },
            { pattern: /\b_action\b/g, replacement: 'action' },
            { pattern: /\b_state\b/g, replacement: 'state' },
            { pattern: /\b_builder\b/g, replacement: 'builder' },
          ];

          specificUndefinedFixes.forEach(fix => {
            const matches = content.match(fix.pattern);
            if (matches) {
              content = content.replace(fix.pattern, fix.replacement);
              fileFixed += matches.length;
            }
          });

          // 如果文件有修改，寫回文件
          if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 修復 ${filePath}: ${fileFixed} 個未定義變數`);
            totalFixed += fileFixed;
          }
        } catch (error) {
          console.error(`❌ 處理文件 ${filePath} 時出錯:`, error.message);
        }
      }
    });
  }

  console.log('🔧 開始修復未定義變數...');
  processDirectory(srcDir);
  console.log(`\n🎉 修復完成！總共修復了 ${totalFixed} 個未定義變數問題`);
}

fixUndefinedVariables();
