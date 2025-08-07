import priceApiService from '../services/priceApiService';

/**
 * 價格API服務使用示例
 * 
 * 這個文件展示了如何使用價格API服務來查詢卡牌價格
 */

// 示例1: 基本價格查詢
export const basicPriceQuery = async () => {
  console.log('=== 基本價格查詢示例 ===');
  
  const cardInfo = {
    name: '皮卡丘 VMAX',
    series: 'Sword & Shield',
    gameType: 'pokemon',
    cardNumber: '044/185',
  };

  try {
    const result = await priceApiService.getCardPrices(cardInfo, {
      platforms: ['TCGPLAYER', 'EBAY', 'CARDMARKET'],
      useCache: true,
      maxRetries: 3,
    });

    if (result.success) {
      console.log('查詢成功!');
      console.log('平均價格:', result.data.average);
      console.log('最低價格:', result.data.min);
      console.log('最高價格:', result.data.max);
      console.log('使用的平台:', result.platformsUsed);
      
      // 顯示各平台詳細價格
      Object.entries(result.data.platforms).forEach(([platform, data]) => {
        console.log(`${platform}: $${data.average} (${data.currency})`);
      });
    } else {
      console.error('查詢失敗:', result.error);
    }
  } catch (error) {
    console.error('查詢異常:', error);
  }
};

// 示例2: 包含歷史數據和趨勢分析的查詢
export const advancedPriceQuery = async () => {
  console.log('=== 進階價格查詢示例 ===');
  
  const cardInfo = {
    name: '路飛',
    series: 'One Piece TCG',
    gameType: 'one-piece',
    cardNumber: 'ST01-001',
  };

  try {
    const result = await priceApiService.getCardPrices(cardInfo, {
      platforms: ['TCGPLAYER', 'EBAY', 'PRICECHARTING'],
      includeHistory: true,
      includeTrends: true,
      useCache: false, // 強制重新查詢
    });

    if (result.success) {
      console.log('進階查詢成功!');
      console.log('價格統計:', {
        average: result.data.average,
        median: result.data.median,
        min: result.data.min,
        max: result.data.max,
      });
      
      if (result.data.history) {
        console.log('歷史價格數據:', result.data.history);
      }
      
      if (result.data.trends) {
        console.log('趨勢分析:', result.data.trends);
      }
    }
  } catch (error) {
    console.error('進階查詢異常:', error);
  }
};

// 示例3: 單一平台查詢
export const singlePlatformQuery = async () => {
  console.log('=== 單一平台查詢示例 ===');
  
  const cardInfo = {
    name: '青眼白龍',
    series: 'Yu-Gi-Oh! TCG',
    gameType: 'yugioh',
  };

  try {
    // 只查詢TCGPlayer
    const tcgResult = await priceApiService.getCardPrices(cardInfo, {
      platforms: ['TCGPLAYER'],
      useCache: true,
    });

    if (tcgResult.success) {
      console.log('TCGPlayer價格:', tcgResult.data.platforms.TCGPLAYER);
    }

    // 只查詢eBay
    const ebayResult = await priceApiService.getCardPrices(cardInfo, {
      platforms: ['EBAY'],
      useCache: true,
    });

    if (ebayResult.success) {
      console.log('eBay價格:', ebayResult.data.platforms.EBAY);
    }
  } catch (error) {
    console.error('單一平台查詢異常:', error);
  }
};

// 示例4: 批量查詢
export const batchPriceQuery = async () => {
  console.log('=== 批量查詢示例 ===');
  
  const cards = [
    {
      name: '皮卡丘 VMAX',
      series: 'Sword & Shield',
      gameType: 'pokemon',
    },
    {
      name: '路飛',
      series: 'One Piece TCG',
      gameType: 'one-piece',
    },
    {
      name: '青眼白龍',
      series: 'Yu-Gi-Oh! TCG',
      gameType: 'yugioh',
    },
  ];

  const results = [];

  for (const card of cards) {
    try {
      console.log(`查詢 ${card.name} 的價格...`);
      
      const result = await priceApiService.getCardPrices(card, {
        platforms: ['TCGPLAYER', 'EBAY'],
        useCache: true,
      });

      results.push({
        card: card.name,
        success: result.success,
        averagePrice: result.success ? result.data.average : null,
        error: result.success ? null : result.error,
      });
    } catch (error) {
      results.push({
        card: card.name,
        success: false,
        averagePrice: null,
        error: error.message,
      });
    }
  }

  console.log('批量查詢結果:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✓ ${result.card}: $${result.averagePrice}`);
    } else {
      console.log(`✗ ${result.card}: ${result.error}`);
    }
  });
};

// 示例5: 快取管理
export const cacheManagementExample = async () => {
  console.log('=== 快取管理示例 ===');
  
  const cardInfo = {
    name: '測試卡牌',
    series: '測試系列',
    gameType: 'pokemon',
  };

  // 檢查初始快取狀態
  const initialStatus = priceApiService.getApiStatus();
  console.log('初始快取大小:', initialStatus.cacheSize);

  // 第一次查詢（會儲存到快取）
  const result1 = await priceApiService.getCardPrices(cardInfo, {
    platforms: ['TCGPLAYER'],
    useCache: true,
  });

  // 檢查快取狀態
  const statusAfterQuery = priceApiService.getApiStatus();
  console.log('查詢後快取大小:', statusAfterQuery.cacheSize);

  // 清除特定快取
  if (result1.cacheKey) {
    priceApiService.clearCache(result1.cacheKey);
    console.log('已清除特定快取');
  }

  // 清除所有快取
  priceApiService.clearCache();
  console.log('已清除所有快取');

  const finalStatus = priceApiService.getApiStatus();
  console.log('最終快取大小:', finalStatus.cacheSize);
};

// 示例6: 錯誤處理
export const errorHandlingExample = async () => {
  console.log('=== 錯誤處理示例 ===');
  
  // 測試不存在的卡牌
  const nonExistentCard = {
    name: '不存在的卡牌',
    series: '虛構系列',
    gameType: 'pokemon',
  };

  try {
    const result = await priceApiService.getCardPrices(nonExistentCard, {
      platforms: ['TCGPLAYER'],
      useCache: false,
    });

    if (!result.success) {
      console.log('預期的錯誤:', result.error);
    }
  } catch (error) {
    console.log('捕獲的異常:', error.message);
  }

  // 測試無效的平台
  const validCard = {
    name: '皮卡丘',
    series: 'Pokemon TCG',
    gameType: 'pokemon',
  };

  try {
    const result = await priceApiService.getCardPrices(validCard, {
      platforms: ['INVALID_PLATFORM'],
      useCache: false,
    });

    if (!result.success) {
      console.log('無效平台錯誤:', result.error);
    }
  } catch (error) {
    console.log('無效平台異常:', error.message);
  }
};

// 示例7: 性能測試
export const performanceTest = async () => {
  console.log('=== 性能測試示例 ===');
  
  const cardInfo = {
    name: '皮卡丘 VMAX',
    series: 'Sword & Shield',
    gameType: 'pokemon',
  };

  const iterations = 5;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    await priceApiService.getCardPrices(cardInfo, {
      platforms: ['TCGPLAYER', 'EBAY'],
      useCache: true,
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    times.push(duration);
    
    console.log(`第 ${i + 1} 次查詢耗時: ${duration}ms`);
  }

  const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`平均查詢時間: ${averageTime}ms`);
};

// 主函數：運行所有示例
export const runAllExamples = async () => {
  console.log('開始運行價格API服務示例...\n');

  try {
    await basicPriceQuery();
    console.log('\n');
    
    await advancedPriceQuery();
    console.log('\n');
    
    await singlePlatformQuery();
    console.log('\n');
    
    await batchPriceQuery();
    console.log('\n');
    
    await cacheManagementExample();
    console.log('\n');
    
    await errorHandlingExample();
    console.log('\n');
    
    await performanceTest();
    console.log('\n');
    
    console.log('所有示例運行完成!');
  } catch (error) {
    console.error('運行示例時發生錯誤:', error);
  }
};

// 如果直接運行此文件
if (require.main === module) {
  runAllExamples();
}
