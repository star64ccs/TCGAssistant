const fs = require('fs');
const path = require('path');

// 修復解析錯誤
function fixParsingErrors() {
  const srcDir = path.join(__dirname, '..', 'src');
  let totalFixed = 0;

  function processDirectory(dir) {
    if (!fs.existsSync(dir)) {return;}

    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        processDirectory(itemPath);
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        let content = fs.readFileSync(itemPath, 'utf8');
        const originalContent = content;
        let fileFixed = false;

        // 修復解析錯誤
        const parsingFixes = [
          // 修復未終止的正則表達式
          {
            pattern: /\/[^\/]*$/gm,
            replacement: (match) => {
              // 檢查是否真的是未終止的正則表達式
              if (match.includes('\\') || match.includes('[') || match.includes(']')) {
                return `${match }/`;
              }
              return match;
            },
          },

          // 修復未終止的字符串
          {
            pattern: /'[^']*$/gm,
            replacement: (match) => {
              if (!match.endsWith("'")) {
                return `${match }'`;
              }
              return match;
            },
          },

          {
            pattern: /"[^"]*$/gm,
            replacement: (match) => {
              if (!match.endsWith('"')) {
                return `${match }"`;
              }
              return match;
            },
          },

          {
            pattern: /`[^`]*$/gm,
            replacement: (match) => {
              if (!match.endsWith('`')) {
                return `${match }\``;
              }
              return match;
            },
          },

          // 修復語法錯誤
          { pattern: /,\s*\)/g, replacement: ')' },
          { pattern: /\(\s*,/g, replacement: '(' },
          { pattern: /,\s*,/g, replacement: ',' },
          { pattern: /;\s*;/g, replacement: ';' },
          { pattern: /{\s*,/g, replacement: '{' },
          { pattern: /,\s*}/g, replacement: '}' },

          // 修復括號不匹配
          { pattern: /\(\s*\)/g, replacement: '()' },
          { pattern: /{\s*}/g, replacement: '{}' },
          { pattern: /\[\s*\]/g, replacement: '[]' },

          // 修復常見的語法錯誤
          { pattern: /[=]>\s*{([^}]*)$/gm, replacement: '=> {\n    $1\n  }' },
          { pattern: /:\s*{([^}]*)$/gm, replacement: ': {\n    $1\n  }' },

          // 修復 createAsyncThunk 語法錯誤
          {
            pattern: /createAsyncThunk\('([^']+)',\s*async\s*\(([^)]*)\)\s*=>\s*{([^}]*),\s*\)/g,
            replacement: 'createAsyncThunk(\'$1\', async ($2) => {\n    $3\n  })',
          },

          // 修復 extraReducers 語法錯誤
          {
            pattern: /extraReducers:\s*\(\s*builder\s*\)\s*=>\s*{([^}]*)$/gm,
            replacement: 'extraReducers: (builder) => {\n    $1\n  }',
          },

          // 修復 reducers 語法錯誤
          {
            pattern: /reducers:\s*{([^}]*)$/gm,
            replacement: 'reducers: {\n    $1\n  }',
          },
        ];

        // 應用修復
        parsingFixes.forEach(fix => {
          if (fix.replacement instanceof Function) {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
              content = newContent;
              fileFixed = true;
            }
          } else {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
              content = newContent;
              fileFixed = true;
            }
          }
        });

        // 修復特定的解析錯誤
        const specificParsingFixes = [
          // 修復 securityManager.js 中的正則表達式錯誤
          {
            pattern: /\/[^\/]*$/gm,
            replacement: (match) => {
              // 檢查是否在 securityManager.js 中
              if (itemPath.includes('securityManager.js')) {
                if (match.includes('password') || match.includes('validation')) {
                  return `${match }/`;
                }
              }
              return match;
            },
          },

          // 修復 cardRecognitionHelpers.js 中的正則表達式錯誤
          {
            pattern: /\/[^\/]*$/gm,
            replacement: (match) => {
              if (itemPath.includes('cardRecognitionHelpers.js')) {
                if (match.includes('card') || match.includes('recognition')) {
                  return `${match }/`;
                }
              }
              return match;
            },
          },

          // 修復 gradingDataCrawlerService.js 中的字符串錯誤
          {
            pattern: /'[^']*$/gm,
            replacement: (match) => {
              if (itemPath.includes('gradingDataCrawlerService.js')) {
                if (match.includes('http') || match.includes('api')) {
                  return `${match }'`;
                }
              }
              return match;
            },
          },
        ];

        specificParsingFixes.forEach(fix => {
          if (fix.replacement instanceof Function) {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
              content = newContent;
              fileFixed = true;
            }
          }
        });

        // 如果檔案有修改，寫回檔案
        if (fileFixed) {
          fs.writeFileSync(itemPath, content, 'utf8');
          totalFixed++;
          console.log(`✅ 修復解析錯誤: ${itemPath}`);
        }
      }
    });
  }

  processDirectory(srcDir);
  console.log(`\n🎉 總共修復了 ${totalFixed} 個檔案的解析錯誤`);
}

// 執行修復
fixParsingErrors();
