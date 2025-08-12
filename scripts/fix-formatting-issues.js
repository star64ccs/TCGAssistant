const fs = require('fs');
const path = require('path');

function fixFormattingIssues() {
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

          // 修復格式化問題
          const formattingFixes = [
            // 修復尾隨空格
            { pattern: /[ \t]+$/gm, replacement: '' },

            // 修復多個空行
            { pattern: /\n\s*\n\s*\n/g, replacement: '\n\n' },

            // 修復縮進問題（將 4 空格改為 2 空格）
            { pattern: /^(\s{4})/gm, replacement: '$1' }, // 保持 4 空格

            // 修復缺少的尾隨逗號
            { pattern: /(\w+):\s*([^,\n]+)\s*\n(\s*)([}\]])/g, replacement: '$1: $2,\n$3$4' },

            // 修復多餘的逗號
            { pattern: /,\s*([}\]])/g, replacement: '$1' },

            // 修復塊級填充問題
            { pattern: /\{\s*\n\s*\n/g, replacement: '{\n' },
            { pattern: /\n\s*\n\s*\}/g, replacement: '\n}' },

            // 修復函數調用格式
            { pattern: /(\w+)\s*\|\|\s*\(\(\)\s*=>\s*\(\{\s*\}\)\)\s*\|\|\s*\(\(\)\s*=>\s*\(\{\s*\}\)\)\s*\|\|\s*\(\(\)\s*=>\s*\(\{\s*\}\)\)/g, replacement: '$1' },

            // 修復模板字符串格式
            { pattern: /\$\{\s*\n\s*([^}]+)\s*\n\s*\}/g, replacement: '${$1}' },

            // 修復對象字面量格式
            { pattern: /\{\s*\n\s*([^}]+)\s*\n\s*\}/g, replacement: '{\n  $1\n}' },

            // 修復數組格式
            { pattern: /\[\s*\n\s*([^\]]+)\s*\n\s*\]/g, replacement: '[\n  $1\n]' },
          ];

          // 應用修復
          formattingFixes.forEach(fix => {
            const matches = content.match(fix.pattern);
            if (matches) {
              content = content.replace(fix.pattern, fix.replacement);
              fileFixed += matches.length;
            }
          });

          // 修復特定的 apiTester.js 問題
          if (filePath.includes('apiTester.js')) {
            // 修復 getApiConfig 調用
            content = content.replace(
              /getApiConfig \|\| \(\(\) => \(\{\s*\}\)\) \|\| \(\(\) => \(\{\s*\}\)\) \|\| \(\(\) => \(\{\s*\}\)\)/g,
              'getApiConfig',
            );

            // 修復模板字符串
            content = content.replace(
              /\$\{\s*\n\s*([^}]+)\s*\n\s*\}/g,
              '${$1}',
            );

            // 修復對象字面量
            content = content.replace(
              /\{\s*\n\s*([^}]+)\s*\n\s*\}/g,
              '{\n  $1\n}',
            );
          }

          // 如果文件有修改，寫回文件
          if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 修復 ${filePath}: ${fileFixed} 個格式化問題`);
            totalFixed += fileFixed;
          }
        } catch (error) {
          console.error(`❌ 處理文件 ${filePath} 時出錯:`, error.message);
        }
      }
    });
  }

  console.log('🔧 開始修復格式化問題...');
  processDirectory(srcDir);
  console.log(`\n🎉 修復完成！總共修復了 ${totalFixed} 個格式化問題`);
}

fixFormattingIssues();
