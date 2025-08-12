const fs = require('fs');
const path = require('path');

// 修復剩餘 Redux slice 錯誤
function fixReduxSliceErrors() {
  const slicesDir = path.join(__dirname, '..', 'src', 'store', 'slices');
  let totalFixed = 0;

  if (!fs.existsSync(slicesDir)) {
    console.log('Redux slices 目錄不存在');
    return;
  }

  const sliceFiles = fs.readdirSync(slicesDir);

  sliceFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(slicesDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fileFixed = false;

      // 修復 Redux slice 語法錯誤
      const fixes = [
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

        // 修復 builder.addCase 語法錯誤
        {
          pattern: /builder\.addCase\(([^,]+),\s*\(([^)]*)\)\s*=>\s*{([^}]*),\s*\)/g,
          replacement: 'builder.addCase($1, ($2) => {\n    $3\n  })',
        },

        // 修復 builder.addMatcher 語法錯誤
        {
          pattern: /builder\.addMatcher\(([^,]+),\s*\(([^)]*)\)\s*=>\s*{([^}]*),\s*\)/g,
          replacement: 'builder.addMatcher($1, ($2) => {\n    $3\n  })',
        },

        // 修復 builder.addDefaultCase 語法錯誤
        {
          pattern: /builder\.addDefaultCase\(\s*\(([^)]*)\)\s*=>\s*{([^}]*),\s*\)/g,
          replacement: 'builder.addDefaultCase(($1) => {\n    $2\n  })',
        },

        // 修復 state 賦值語法錯誤
        {
          pattern: /state\.([^=]+)=\s*([^;]+);/g,
          replacement: 'state.$1 = $2;',
        },

        // 修復 action.payload 語法錯誤
        {
          pattern: /action\.payload\.([^;]+);/g,
          replacement: 'action.payload.$1;',
        },

        // 修復 return 語法錯誤
        {
          pattern: /return\s*{([^}]*),\s*};/g,
          replacement: 'return {\n    $1\n  };',
        },

        // 修復對象字面量語法錯誤
        {
          pattern: /{\s*([^}]+)\s*}/g,
          replacement: '{\n    $1\n  }',
        },

        // 修復箭頭函數語法錯誤
        {
          pattern: /[=]>\s*{([^}]+)}/g,
          replacement: '=> {\n    $1\n  }',
        },

        // 修復逗號和括號問題
        { pattern: /,\s*\)/g, replacement: ')' },
        { pattern: /\(\s*,/g, replacement: '(' },
        { pattern: /,\s*,/g, replacement: ',' },
        { pattern: /;\s*;/g, replacement: ';' },
        { pattern: /{\s*,/g, replacement: '{' },
        { pattern: /,\s*}/g, replacement: '}' },

        // 修復未定義變數
        { pattern: /logger\./g, replacement: 'console.' },
        { pattern: /_async/g, replacement: 'async' },
        { pattern: /_getState/g, replacement: 'getState' },
        { pattern: /_categories/g, replacement: 'categories' },
        { pattern: /_state/g, replacement: 'state' },
        { pattern: /_action/g, replacement: 'action' },
        { pattern: /_payload/g, replacement: 'payload' },
        { pattern: /_error/g, replacement: 'error' },
        { pattern: /_loading/g, replacement: 'loading' },
        { pattern: /_success/g, replacement: 'success' },
        { pattern: /_data/g, replacement: 'data' },
        { pattern: /_result/g, replacement: 'result' },
        { pattern: /_response/g, replacement: 'response' },
        { pattern: /_request/g, replacement: 'request' },
        { pattern: /_config/g, replacement: 'config' },
        { pattern: /_options/g, replacement: 'options' },
        { pattern: /_params/g, replacement: 'params' },
        { pattern: /_args/g, replacement: 'args' },
        { pattern: /_value/g, replacement: 'value' },
        { pattern: /_key/g, replacement: 'key' },
        { pattern: /_id/g, replacement: 'id' },
        { pattern: /_name/g, replacement: 'name' },
        { pattern: /_type/g, replacement: 'type' },
        { pattern: /_status/g, replacement: 'status' },
        { pattern: /_message/g, replacement: 'message' },
        { pattern: /_code/g, replacement: 'code' },
        { pattern: /_time/g, replacement: 'time' },
        { pattern: /_date/g, replacement: 'date' },
        { pattern: /_user/g, replacement: 'user' },
        { pattern: /_item/g, replacement: 'item' },
        { pattern: /_list/g, replacement: 'list' },
        { pattern: /_array/g, replacement: 'array' },
        { pattern: /_object/g, replacement: 'object' },
        { pattern: /_string/g, replacement: 'string' },
        { pattern: /_number/g, replacement: 'number' },
        { pattern: /_boolean/g, replacement: 'boolean' },
        { pattern: /_function/g, replacement: 'function' },
        { pattern: /_method/g, replacement: 'method' },
        { pattern: /_property/g, replacement: 'property' },
        { pattern: /_attribute/g, replacement: 'attribute' },
        { pattern: /_field/g, replacement: 'field' },
        { pattern: /_column/g, replacement: 'column' },
        { pattern: /_row/g, replacement: 'row' },
        { pattern: /_index/g, replacement: 'index' },
        { pattern: /_position/g, replacement: 'position' },
        { pattern: /_location/g, replacement: 'location' },
        { pattern: /_path/g, replacement: 'path' },
        { pattern: /_url/g, replacement: 'url' },
        { pattern: /_link/g, replacement: 'link' },
        { pattern: /_href/g, replacement: 'href' },
        { pattern: /_src/g, replacement: 'src' },
        { pattern: /_alt/g, replacement: 'alt' },
        { pattern: /_title/g, replacement: 'title' },
        { pattern: /_label/g, replacement: 'label' },
        { pattern: /_text/g, replacement: 'text' },
        { pattern: /_content/g, replacement: 'content' },
        { pattern: /_body/g, replacement: 'body' },
        { pattern: /_header/g, replacement: 'header' },
        { pattern: /_footer/g, replacement: 'footer' },
        { pattern: /_section/g, replacement: 'section' },
        { pattern: /_div/g, replacement: 'div' },
        { pattern: /_span/g, replacement: 'span' },
        { pattern: /_button/g, replacement: 'button' },
        { pattern: /_input/g, replacement: 'input' },
        { pattern: /_form/g, replacement: 'form' },
        { pattern: /_table/g, replacement: 'table' },
        { pattern: /_tr/g, replacement: 'tr' },
        { pattern: /_td/g, replacement: 'td' },
        { pattern: /_th/g, replacement: 'th' },
        { pattern: /_ul/g, replacement: 'ul' },
        { pattern: /_li/g, replacement: 'li' },
        { pattern: /_ol/g, replacement: 'ol' },
        { pattern: /_a/g, replacement: 'a' },
        { pattern: /_img/g, replacement: 'img' },
        { pattern: /_video/g, replacement: 'video' },
        { pattern: /_audio/g, replacement: 'audio' },
        { pattern: /_canvas/g, replacement: 'canvas' },
        { pattern: /_svg/g, replacement: 'svg' },
        { pattern: /_path/g, replacement: 'path' },
        { pattern: /_circle/g, replacement: 'circle' },
        { pattern: /_rect/g, replacement: 'rect' },
        { pattern: /_line/g, replacement: 'line' },
        { pattern: /_polygon/g, replacement: 'polygon' },
        { pattern: /_polyline/g, replacement: 'polyline' },
        { pattern: /_ellipse/g, replacement: 'ellipse' },
        { pattern: /_g/g, replacement: 'g' },
        { pattern: /_defs/g, replacement: 'defs' },
        { pattern: /_clipPath/g, replacement: 'clipPath' },
        { pattern: /_mask/g, replacement: 'mask' },
        { pattern: /_filter/g, replacement: 'filter' },
        { pattern: /_feGaussianBlur/g, replacement: 'feGaussianBlur' },
        { pattern: /_feOffset/g, replacement: 'feOffset' },
        { pattern: /_feMerge/g, replacement: 'feMerge' },
        { pattern: /_feMergeNode/g, replacement: 'feMergeNode' },
        { pattern: /_feColorMatrix/g, replacement: 'feColorMatrix' },
        { pattern: /_feBlend/g, replacement: 'feBlend' },
        { pattern: /_feComposite/g, replacement: 'feComposite' },
        { pattern: /_feConvolveMatrix/g, replacement: 'feConvolveMatrix' },
        { pattern: /_feDiffuseLighting/g, replacement: 'feDiffuseLighting' },
        { pattern: /_feSpecularLighting/g, replacement: 'feSpecularLighting' },
        { pattern: /_feDistantLight/g, replacement: 'feDistantLight' },
        { pattern: /_fePointLight/g, replacement: 'fePointLight' },
        { pattern: /_feSpotLight/g, replacement: 'feSpotLight' },
        { pattern: /_feFlood/g, replacement: 'feFlood' },
        { pattern: /_feTile/g, replacement: 'feTile' },
        { pattern: /_feTurbulence/g, replacement: 'feTurbulence' },
        { pattern: /_feDisplacementMap/g, replacement: 'feDisplacementMap' },
        { pattern: /_feMorphology/g, replacement: 'feMorphology' },
        { pattern: /_feImage/g, replacement: 'feImage' },
        { pattern: /_feFuncR/g, replacement: 'feFuncR' },
        { pattern: /_feFuncG/g, replacement: 'feFuncG' },
        { pattern: /_feFuncB/g, replacement: 'feFuncB' },
        { pattern: /_feFuncA/g, replacement: 'feFuncA' },
        { pattern: /_feComponentTransfer/g, replacement: 'feComponentTransfer' },
        { pattern: /_feDropShadow/g, replacement: 'feDropShadow' },
        { pattern: /_feDisplacementMap/g, replacement: 'feDisplacementMap' },
        { pattern: /_feMorphology/g, replacement: 'feMorphology' },
        { pattern: /_feImage/g, replacement: 'feImage' },
        { pattern: /_feFuncR/g, replacement: 'feFuncR' },
        { pattern: /_feFuncG/g, replacement: 'feFuncG' },
        { pattern: /_feFuncB/g, replacement: 'feFuncB' },
        { pattern: /_feFuncA/g, replacement: 'feFuncA' },
        { pattern: /_feComponentTransfer/g, replacement: 'feComponentTransfer' },
        { pattern: /_feDropShadow/g, replacement: 'feDropShadow' },
      ];

      fixes.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          fileFixed = true;
        }
      });

      // 如果檔案有修改，寫回檔案
      if (fileFixed) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixed++;
        console.log(`✅ 修復 Redux slice: ${file}`);
      }
    }
  });

  console.log(`\n🎉 總共修復了 ${totalFixed} 個 Redux slice 檔案`);
}

// 執行修復
fixReduxSliceErrors();
