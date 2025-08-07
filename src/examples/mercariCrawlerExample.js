import mercariCrawlerService from '../services/mercariCrawlerService';

// Mercari爬蟲使用範例
export const mercariCrawlerExample = async () => {
  try {
    console.log('=== Mercari爬蟲使用範例 ===');

    // 1. 初始化服務
    console.log('1. 初始化Mercari爬蟲服務...');
    const initResult = await mercariCrawlerService.init();
    console.log('初始化結果:', initResult);

    // 2. 檢查服務狀態
    console.log('2. 檢查服務狀態...');
    const status = mercariCrawlerService.getServiceStatus();
    console.log('服務狀態:', status);

    // 3. 搜索卡牌
    console.log('3. 搜索卡牌...');
    const cardInfo = {
      name: 'ピカチュウ',
      series: '基本セット',
      cardNumber: '025/025',
      gameType: 'pokemon',
    };

    const searchResult = await mercariCrawlerService.searchCard(cardInfo, {
      maxResults: 10,
      useCache: true,
      maxRetries: 3,
    });

    console.log('搜索結果:', {
      success: searchResult.success,
      totalResults: searchResult.totalResults,
      platform: searchResult.platform,
      source: searchResult.source,
    });

    if (searchResult.success && searchResult.data) {
      console.log('找到的商品數量:', searchResult.data.length);
      
      // 顯示前3個結果
      searchResult.data.slice(0, 3).forEach((item, index) => {
        console.log(`商品 ${index + 1}:`);
        console.log(`  標題: ${item.title}`);
        console.log(`  價格: ¥${item.price}`);
        console.log(`  平台: ${item.platform}`);
        console.log(`  貨幣: ${item.currency}`);
        if (item.condition) console.log(`  狀態: ${item.condition}`);
        if (item.seller) console.log(`  賣家: ${item.seller}`);
        console.log('---');
      });
    }

    // 4. 檢查服務狀態
    console.log('4. 檢查服務狀態...');
    const serviceStatus = await mercariCrawlerService.checkServiceStatus();
    console.log('服務狀態:', serviceStatus);

    // 5. 清除快取
    console.log('5. 清除快取...');
    mercariCrawlerService.clearCache();
    console.log('快取已清除');

    return {
      success: true,
      message: 'Mercari爬蟲範例執行完成',
      searchResult,
      serviceStatus,
    };

  } catch (error) {
    console.error('Mercari爬蟲範例執行失敗:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 批量搜索範例
export const mercariBatchSearchExample = async () => {
  try {
    console.log('=== Mercari批量搜索範例 ===');

    // 初始化服務
    await mercariCrawlerService.init();

    // 定義要搜索的卡牌列表
    const cardList = [
      {
        name: 'ピカチュウ',
        series: '基本セット',
        gameType: 'pokemon',
      },
      {
        name: 'ルフィ',
        series: 'ワンピース',
        gameType: 'one-piece',
      },
      {
        name: '青眼の白龍',
        series: '遊戯王',
        gameType: 'yugioh',
      },
    ];

    const results = [];

    for (const cardInfo of cardList) {
      console.log(`搜索: ${cardInfo.name}`);
      
      try {
        const result = await mercariCrawlerService.searchCard(cardInfo, {
          maxResults: 5,
          useCache: true,
        });

        results.push({
          cardName: cardInfo.name,
          success: result.success,
          totalResults: result.totalResults || 0,
          error: result.error,
        });

        // 等待一段時間再搜索下一個
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`搜索 ${cardInfo.name} 失敗:`, error);
        results.push({
          cardName: cardInfo.name,
          success: false,
          error: error.message,
        });
      }
    }

    console.log('批量搜索結果:', results);

    return {
      success: true,
      results,
    };

  } catch (error) {
    console.error('批量搜索範例執行失敗:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 快取管理範例
export const mercariCacheExample = async () => {
  try {
    console.log('=== Mercari快取管理範例 ===');

    // 初始化服務
    await mercariCrawlerService.init();

    // 獲取服務狀態
    const status = mercariCrawlerService.getServiceStatus();
    console.log('當前快取大小:', status.cacheSize);

    // 搜索一個卡牌（會儲存到快取）
    const cardInfo = {
      name: 'ピカチュウ',
      series: '基本セット',
      gameType: 'pokemon',
    };

    console.log('執行搜索並儲存到快取...');
    await mercariCrawlerService.searchCard(cardInfo, {
      maxResults: 5,
      useCache: true,
    });

    // 再次獲取狀態
    const newStatus = mercariCrawlerService.getServiceStatus();
    console.log('搜索後快取大小:', newStatus.cacheSize);

    // 清除特定快取
    const cacheKey = mercariCrawlerService.generateCacheKey(cardInfo);
    console.log('清除特定快取:', cacheKey);
    mercariCrawlerService.clearCache(cacheKey);

    // 清除所有快取
    console.log('清除所有快取...');
    mercariCrawlerService.clearCache();

    const finalStatus = mercariCrawlerService.getServiceStatus();
    console.log('清除後快取大小:', finalStatus.cacheSize);

    return {
      success: true,
      message: '快取管理範例執行完成',
      initialCacheSize: status.cacheSize,
      finalCacheSize: finalStatus.cacheSize,
    };

  } catch (error) {
    console.error('快取管理範例執行失敗:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  mercariCrawlerExample,
  mercariBatchSearchExample,
  mercariCacheExample,
};
