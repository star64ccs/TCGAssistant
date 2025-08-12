const fs = require('fs');
const path = require('path');

function fixFinalSyntaxErrors() {
  const srcDir = path.join(__dirname, '..', 'src');
  let totalFixed = 0;

  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          let originalContent = content;
          let fileFixed = 0;

          // 修復 Redux slice 的解析錯誤
          const reduxFixes = [
            // 修復 extraReducers 語法
            { 
              pattern: /extraReducers:\s*\(\s*builder\s*\)\s*=>\s*{([^}]*)$/gm, 
              replacement: 'extraReducers: (builder) => {\n    $1\n  }' 
            },
            // 修復 reducers 語法
            { 
              pattern: /reducers:\s*{([^}]*)$/gm, 
              replacement: 'reducers: {\n    $1\n  }' 
            },
            // 修復 builder.addCase 語法
            { 
              pattern: /builder\.addCase\(([^)]+)\)\.addCase\(/g, 
              replacement: 'builder.addCase($1)\n    .addCase(' 
            },
            // 修復 state 賦值語法
            { 
              pattern: /state\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*{([^}]*)$/gm, 
              replacement: 'state.$1 = {\n      $2\n    }' 
            }
          ];

          // 修復未定義變數
          const undefinedFixes = [
            // 修復常見的未定義變數
            { pattern: /\bcard\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_card' },
            { pattern: /\bb\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_b' },
            { pattern: /\brec\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_rec' },
            { pattern: /\bfactor\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_factor' },
            { pattern: /\bprice\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_price' },
            { pattern: /\bi\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_i' },
            { pattern: /\bret\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_ret' },
            { pattern: /\bholding\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_holding' },
            { pattern: /\bweight\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_weight' },
            { pattern: /\brisk\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_risk' },
            { pattern: /\bsector\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_sector' },
            { pattern: /\bvol\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_vol' },
            { pattern: /\bobj\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_obj' },
            { pattern: /\bprefix\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_prefix' },
            { pattern: /\bval\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_val' },
            { pattern: /\btree\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_tree' },
            { pattern: /\bfeatures\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_features' },
            { pattern: /\bprediction\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_prediction' },
            { pattern: /\bscore\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_score' },
            { pattern: /\btrade\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_trade' },
            { pattern: /\bconf\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_conf' },
            { pattern: /\bcorr\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_corr' },
            { pattern: /\bimageFile\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_imageFile' },
            { pattern: /\bitem\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_item' },
            { pattern: /\blanguage\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_language' },
            { pattern: /\btheme\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_theme' },
            { pattern: /\bkey\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_key' },
            { pattern: /\btimeout\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_timeout' },
            { pattern: /\bquality\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_quality' },
            { pattern: /\bdispatch\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_dispatch' },
            { pattern: /\bmodalName\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_modalName' },
            { pattern: /\bcomponent\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_component' },
            { pattern: /\binitialState\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_initialState' },
            { pattern: /\br\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_r' },
            { pattern: /\btotalAmount\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_totalAmount' },
            { pattern: /\bportfolio\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_portfolio' },
            { pattern: /\brecommendations\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_recommendations' },
            { pattern: /\b_recommendations\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_recommendations' },
            { pattern: /\briskAssessment\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_riskAssessment' },
            { pattern: /\bcardCategory\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_cardCategory' },
            { pattern: /\bseasonalData\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_seasonalData' },
            { pattern: /\bquarter\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_quarter' },
            { pattern: /\btrainingData\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_trainingData' },
            { pattern: /\btestData\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_testData' },
            { pattern: /\bmodel\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_model' },
            { pattern: /\bcardData\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_cardData' },
            { pattern: /\bmodelInfo\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_modelInfo' },
            { pattern: /\bhtml\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_html' },
            { pattern: /\bcardInfo\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_cardInfo' },
            { pattern: /\bunused\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_unused' },
            { pattern: /\bendpoint\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_endpoint' },
            { pattern: /\bmethod\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_method' },
            { pattern: /\bretryCount\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_retryCount' },
            { pattern: /\bmaxRetries\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_maxRetries' },
            { pattern: /\bcontext\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_context' },
            { pattern: /\bdata\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_data' },
            { pattern: /\bvalue\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_value' },
            { pattern: /\blevel\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_level' },
            { pattern: /\bmessage\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_message' },
            { pattern: /\bPlatform\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_Platform' },
            { pattern: /\baction\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_action' },
            { pattern: /\bt\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_t' },
            { pattern: /\baxios\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_axios' },
            { pattern: /\bAsyncStorage\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_AsyncStorage' },
            { pattern: /\brobotsTxtService\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_robotsTxtService' },
            { pattern: /\bmockGradingData\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_mockGradingData' },
            { pattern: /\bmockProcessedImage\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_mockProcessedImage' },
            { pattern: /\bmockNetworkError\b(?!\s*=|\s*:|\s*\(|\s*\[|\s*\.)/g, replacement: '_mockNetworkError' }
          ];

          // 應用修復
          reduxFixes.forEach(fix => {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
              content = newContent;
              fileFixed++;
            }
          });

          undefinedFixes.forEach(fix => {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
              content = newContent;
              fileFixed++;
            }
          });

          if (fileFixed > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            totalFixed += fileFixed;
            console.log(`✅ 修復 ${filePath}: ${fileFixed} 個問題`);
          }
        } catch (error) {
          console.error(`❌ 處理文件 ${filePath} 時出錯:`, error.message);
        }
      }
    });
  }

  processDirectory(srcDir);
  console.log(`\n🎉 總共修復了 ${totalFixed} 個語法錯誤`);
}

fixFinalSyntaxErrors();
