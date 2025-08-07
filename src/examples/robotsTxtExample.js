import robotsTxtService from '../services/robotsTxtService';

/**
 * Robots.txt 解析服務使用示例
 * 展示如何使用新的 robots.txt 解析功能
 */

// 示例 1: 基本使用
async function basicUsageExample() {
  console.log('=== 基本使用示例 ===');
  
  try {
    const rules = await robotsTxtService.checkRobotsTxt('https://example.com');
    
    console.log('解析結果:', {
      hasRules: rules.hasRules,
      isAllowed: rules.isAllowed,
      crawlDelay: rules.crawlDelay,
      disallowCount: rules.disallow.length,
      allowCount: rules.allow.length,
    });
    
    // 檢查特定路徑是否允許
    const canAccessAdmin = robotsTxtService.checkIfAllowed(rules, 'TCGAssistant/1.0', '/admin/');
    console.log('是否可以訪問 /admin/:', canAccessAdmin);
    
    // 獲取建議的延遲時間
    const delay = robotsTxtService.getCrawlDelay(rules);
    console.log('建議延遲時間:', delay, 'ms');
    
  } catch (error) {
    console.error('檢查 robots.txt 失敗:', error.message);
  }
}

// 示例 2: 批量檢查多個網站
async function batchCheckExample() {
  console.log('\n=== 批量檢查示例 ===');
  
  const websites = [
    'https://example.com',
    'https://www.google.com',
    'https://github.com',
    'https://stackoverflow.com'
  ];
  
  const results = [];
  
  for (const website of websites) {
    try {
      console.log(`檢查 ${website}...`);
      const rules = await robotsTxtService.checkRobotsTxt(website);
      
      results.push({
        website,
        isAllowed: rules.isAllowed,
        crawlDelay: rules.crawlDelay,
        hasRules: rules.hasRules,
        specificRules: rules.specificRules,
      });
      
      // 添加延遲避免過於頻繁的請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`檢查 ${website} 失敗:`, error.message);
      results.push({
        website,
        error: error.message,
      });
    }
  }
  
  console.log('批量檢查結果:', results);
}

// 示例 3: 驗證 robots.txt 格式
function validationExample() {
  console.log('\n=== 格式驗證示例 ===');
  
  const validRobotsTxt = `
User-agent: *
Disallow: /admin/
Allow: /search
Crawl-delay: 1

Sitemap: https://example.com/sitemap.xml
Host: example.com
  `;
  
  const invalidRobotsTxt = `
User-agent: *
Disallow /admin/
Crawl-delay: invalid
Unknown-directive: value
  `;
  
  // 驗證有效的 robots.txt
  const validValidation = robotsTxtService.validateRobotsTxt(validRobotsTxt);
  console.log('有效 robots.txt 驗證結果:', {
    isValid: validValidation.isValid,
    errors: validValidation.errors,
    warnings: validValidation.warnings,
    lineCount: validValidation.lineCount,
    directiveCount: validValidation.directiveCount,
  });
  
  // 驗證無效的 robots.txt
  const invalidValidation = robotsTxtService.validateRobotsTxt(invalidRobotsTxt);
  console.log('無效 robots.txt 驗證結果:', {
    isValid: invalidValidation.isValid,
    errors: invalidValidation.errors,
    warnings: invalidValidation.warnings,
  });
}

// 示例 4: 路徑匹配測試
function pathMatchingExample() {
  console.log('\n=== 路徑匹配示例 ===');
  
  const testCases = [
    { pattern: '/admin/', path: '/admin/users', expected: true },
    { pattern: '/admin/', path: '/public', expected: false },
    { pattern: '*.jpg', path: '/images/photo.jpg', expected: true },
    { pattern: '*.jpg', path: '/images/photo.png', expected: false },
    { pattern: '/', path: '/', expected: true },
    { pattern: '/', path: '/other', expected: false },
    { pattern: '/api/*', path: '/api/users', expected: true },
    { pattern: '/api/*', path: '/api', expected: true },
  ];
  
  testCases.forEach(({ pattern, path, expected }) => {
    const result = robotsTxtService.matchesPath(pattern, path);
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} ${pattern} 匹配 ${path}: ${result} (期望: ${expected})`);
  });
}

// 示例 5: 快取功能演示
async function cacheExample() {
  console.log('\n=== 快取功能示例 ===');
  
  const website = 'https://example.com';
  
  // 第一次請求（會從網路獲取）
  console.log('第一次請求...');
  const startTime1 = Date.now();
  const rules1 = await robotsTxtService.checkRobotsTxt(website);
  const time1 = Date.now() - startTime1;
  console.log(`第一次請求耗時: ${time1}ms`);
  
  // 第二次請求（從快取獲取）
  console.log('第二次請求（應該從快取獲取）...');
  const startTime2 = Date.now();
  const rules2 = await robotsTxtService.checkRobotsTxt(website);
  const time2 = Date.now() - startTime2;
  console.log(`第二次請求耗時: ${time2}ms`);
  
  console.log('快取效果:', {
    firstRequest: time1,
    secondRequest: time2,
    speedup: time1 > 0 ? Math.round(time1 / time2) : 'N/A',
    rulesEqual: JSON.stringify(rules1) === JSON.stringify(rules2),
  });
  
  // 清理快取
  robotsTxtService.clearExpiredCache();
  console.log('已清理過期快取');
}

// 示例 6: 生成摘要報告
async function summaryExample() {
  console.log('\n=== 摘要報告示例 ===');
  
  try {
    const rules = await robotsTxtService.checkRobotsTxt('https://example.com');
    const summary = robotsTxtService.generateSummary(rules);
    
    console.log('Robots.txt 摘要報告:', {
      '是否有規則': summary.hasRules ? '是' : '否',
      '是否有特定規則': summary.specificRules ? '是' : '否',
      '是否允許爬取': summary.isAllowed ? '是' : '否',
      '爬取延遲': `${summary.crawlDelay} 秒`,
      '禁止路徑數量': summary.disallowCount,
      '允許路徑數量': summary.allowCount,
      'Sitemap 數量': summary.sitemapCount,
      '是否有 Host': summary.hasHost ? '是' : '否',
      '用戶代理': summary.userAgents.join(', '),
    });
    
  } catch (error) {
    console.error('生成摘要報告失敗:', error.message);
  }
}

// 示例 7: 錯誤處理
async function errorHandlingExample() {
  console.log('\n=== 錯誤處理示例 ===');
  
  const testCases = [
    'https://invalid-domain-that-does-not-exist.com',
    'https://httpstat.us/404',
    'https://httpstat.us/500',
  ];
  
  for (const website of testCases) {
    try {
      console.log(`測試 ${website}...`);
      const rules = await robotsTxtService.checkRobotsTxt(website);
      console.log(`✅ ${website} 成功:`, rules.isAllowed ? '允許' : '禁止');
    } catch (error) {
      console.log(`❌ ${website} 失敗:`, error.message);
    }
  }
}

// 示例 8: 自定義用戶代理
async function customUserAgentExample() {
  console.log('\n=== 自定義用戶代理示例 ===');
  
  const customUserAgent = 'MyCustomBot/1.0 (https://mybot.com)';
  
  try {
    const rules = await robotsTxtService.checkRobotsTxt('https://example.com', customUserAgent);
    
    console.log('自定義用戶代理結果:', {
      userAgent: customUserAgent,
      isAllowed: rules.isAllowed,
      hasSpecificRules: rules.specificRules,
      crawlDelay: rules.crawlDelay,
    });
    
  } catch (error) {
    console.error('自定義用戶代理測試失敗:', error.message);
  }
}

// 主函數
async function main() {
  console.log('🤖 Robots.txt 解析服務示例');
  console.log('=' * 50);
  
  try {
    await basicUsageExample();
    await batchCheckExample();
    validationExample();
    pathMatchingExample();
    await cacheExample();
    await summaryExample();
    await errorHandlingExample();
    await customUserAgentExample();
    
    console.log('\n✅ 所有示例執行完成！');
    
  } catch (error) {
    console.error('❌ 示例執行失敗:', error);
  }
}

// 導出示例函數
export {
  basicUsageExample,
  batchCheckExample,
  validationExample,
  pathMatchingExample,
  cacheExample,
  summaryExample,
  errorHandlingExample,
  customUserAgentExample,
  main,
};

// 如果直接運行此文件，執行主函數
if (require.main === module) {
  main();
}
