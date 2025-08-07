import multiSourceAutoUpdateService, { DATA_SOURCE_TYPES } from '../services/multiSourceAutoUpdateService';
import { Alert } from 'react-native';

/**
 * 多源自動更新功能使用範例
 * 展示如何設定和管理多個資料來源的自動更新
 */

// 初始化多源自動更新服務
export const initializeMultiSourceAutoUpdate = async () => {
  try {
    console.log('初始化多源自動更新服務...');
    await multiSourceAutoUpdateService.init();
    console.log('多源自動更新服務初始化完成');
    
    // 獲取服務狀態
    const status = await multiSourceAutoUpdateService.getServiceStatus();
    console.log('服務狀態:', status);
    
    return { success: true, status };
  } catch (error) {
    console.error('初始化失敗:', error);
    return { success: false, error: error.message };
  }
};

// 啟用自動更新
export const enableAutoUpdate = async (updateTime = '02:00') => {
  try {
    console.log(`啟用自動更新，更新時間: ${updateTime}`);
    const result = await multiSourceAutoUpdateService.enableAutoUpdate(updateTime);
    
    if (result.success) {
      console.log('自動更新已啟用');
      Alert.alert('成功', '自動更新已啟用');
    } else {
      console.error('啟用失敗:', result.error);
      Alert.alert('錯誤', `啟用失敗: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('啟用自動更新失敗:', error);
    Alert.alert('錯誤', `啟用失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 停用自動更新
export const disableAutoUpdate = async () => {
  try {
    console.log('停用自動更新...');
    const result = await multiSourceAutoUpdateService.disableAutoUpdate();
    
    if (result.success) {
      console.log('自動更新已停用');
      Alert.alert('成功', '自動更新已停用');
    } else {
      console.error('停用失敗:', result.error);
      Alert.alert('錯誤', `停用失敗: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('停用自動更新失敗:', error);
    Alert.alert('錯誤', `停用失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 手動觸發完整更新
export const triggerFullUpdate = async () => {
  try {
    console.log('觸發完整更新...');
    const result = await multiSourceAutoUpdateService.triggerManualUpdate();
    
    if (result.success) {
      console.log('完整更新成功');
      Alert.alert('成功', '完整更新已開始執行');
    } else {
      console.error('完整更新失敗:', result.error);
      Alert.alert('錯誤', `更新失敗: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('觸發完整更新失敗:', error);
    Alert.alert('錯誤', `更新失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 手動觸發特定資料來源更新
export const triggerSpecificSourceUpdate = async (sourceKey) => {
  try {
    console.log(`觸發特定資料來源更新: ${sourceKey}`);
    const result = await multiSourceAutoUpdateService.triggerManualUpdate([sourceKey]);
    
    if (result.success) {
      console.log('特定來源更新成功');
      Alert.alert('成功', `${sourceKey} 更新已開始執行`);
    } else {
      console.error('特定來源更新失敗:', result.error);
      Alert.alert('錯誤', `更新失敗: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('觸發特定來源更新失敗:', error);
    Alert.alert('錯誤', `更新失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 管理資料來源
export const manageDataSources = async () => {
  try {
    console.log('管理資料來源...');
    
    // 獲取所有資料來源狀態
    const status = await multiSourceAutoUpdateService.getDataSourceStatus();
    console.log('資料來源狀態:', status);
    
    // 停用PSA評級資料來源
    await multiSourceAutoUpdateService.toggleDataSource('grading.psa', false);
    console.log('PSA評級資料來源已停用');
    
    // 設定TCGPlayer更新間隔為4小時
    await multiSourceAutoUpdateService.setSourceUpdateInterval('pricing.tcgplayer', 4);
    console.log('TCGPlayer更新間隔已設定為4小時');
    
    // 設定eBay更新間隔為8小時
    await multiSourceAutoUpdateService.setSourceUpdateInterval('pricing.ebay', 8);
    console.log('eBay更新間隔已設定為8小時');
    
    Alert.alert('成功', '資料來源管理完成');
    return { success: true, status };
  } catch (error) {
    console.error('管理資料來源失敗:', error);
    Alert.alert('錯誤', `管理失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 查看更新歷史
export const viewUpdateHistory = async (limit = 20) => {
  try {
    console.log(`查看更新歷史 (最近 ${limit} 條)...`);
    const history = await multiSourceAutoUpdateService.getUpdateHistory(limit);
    
    console.log('更新歷史:', history);
    
    if (history.length === 0) {
      Alert.alert('資訊', '暫無更新歷史');
    } else {
      const lastUpdate = history[0];
      const summary = lastUpdate.summary || {};
      
      Alert.alert(
        '更新歷史',
        `最近更新: ${new Date(lastUpdate.startTime).toLocaleString()}\n` +
        `總計: ${summary.total || 0}\n` +
        `成功: ${summary.successful || 0}\n` +
        `失敗: ${summary.failed || 0}\n` +
        `跳過: ${summary.skipped || 0}`
      );
    }
    
    return { success: true, history };
  } catch (error) {
    console.error('查看更新歷史失敗:', error);
    Alert.alert('錯誤', `查看失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 設定更新時間
export const setUpdateTime = async (time) => {
  try {
    console.log(`設定更新時間: ${time}`);
    const result = await multiSourceAutoUpdateService.setUpdateTime(time);
    
    if (result.success) {
      console.log('更新時間已設定');
      Alert.alert('成功', `更新時間已設定為 ${time}`);
    } else {
      console.error('設定更新時間失敗:', result.error);
      Alert.alert('錯誤', `設定失敗: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('設定更新時間失敗:', error);
    Alert.alert('錯誤', `設定失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 獲取詳細狀態
export const getDetailedStatus = async () => {
  try {
    console.log('獲取詳細狀態...');
    
    const [
      isEnabled,
      updateTime,
      lastUpdate,
      status,
      history
    ] = await Promise.all([
      multiSourceAutoUpdateService.isAutoUpdateEnabled(),
      multiSourceAutoUpdateService.getUpdateTime(),
      multiSourceAutoUpdateService.getLastUpdateTime(),
      multiSourceAutoUpdateService.getDataSourceStatus(),
      multiSourceAutoUpdateService.getUpdateHistory(5)
    ]);
    
    const detailedStatus = {
      isEnabled,
      updateTime,
      lastUpdate: lastUpdate?.toISOString(),
      dataSources: status,
      recentHistory: history
    };
    
    console.log('詳細狀態:', detailedStatus);
    
    // 顯示狀態摘要
    const enabledSources = Object.values(status).flatMap(typeSources =>
      Object.values(typeSources).filter(source => source.enabled)
    );
    
    Alert.alert(
      '詳細狀態',
      `自動更新: ${isEnabled ? '已啟用' : '已停用'}\n` +
      `更新時間: ${updateTime}\n` +
      `最後更新: ${lastUpdate ? new Date(lastUpdate).toLocaleString() : '從未'}\n` +
      `啟用資料來源: ${enabledSources.length} 個\n` +
      `最近更新記錄: ${history.length} 條`
    );
    
    return { success: true, status: detailedStatus };
  } catch (error) {
    console.error('獲取詳細狀態失敗:', error);
    Alert.alert('錯誤', `獲取失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 批次更新特定卡牌
export const batchUpdateSpecificCards = async (cardIds) => {
  try {
    console.log(`批次更新特定卡牌: ${cardIds.join(', ')}`);
    
    // 這裡可以實作針對特定卡牌的更新邏輯
    // 目前服務會自動選擇需要更新的卡牌
    
    Alert.alert('資訊', '批次更新功能已觸發，系統會自動選擇需要更新的卡牌');
    return { success: true };
  } catch (error) {
    console.error('批次更新失敗:', error);
    Alert.alert('錯誤', `批次更新失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 監控更新進度
export const monitorUpdateProgress = async () => {
  try {
    console.log('監控更新進度...');
    
    // 獲取服務狀態
    const status = await multiSourceAutoUpdateService.getServiceStatus();
    
    if (status.isRunning) {
      console.log('更新正在執行中...');
      Alert.alert('更新狀態', '更新正在執行中，請稍候...');
    } else {
      console.log('目前沒有更新在執行');
      Alert.alert('更新狀態', '目前沒有更新在執行');
    }
    
    return { success: true, isRunning: status.isRunning };
  } catch (error) {
    console.error('監控更新進度失敗:', error);
    Alert.alert('錯誤', `監控失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 完整的多源自動更新設定範例
export const completeMultiSourceAutoUpdateSetup = async () => {
  try {
    console.log('開始完整的多源自動更新設定...');
    
    // 1. 初始化服務
    const initResult = await initializeMultiSourceAutoUpdate();
    if (!initResult.success) {
      throw new Error('初始化失敗');
    }
    
    // 2. 啟用自動更新
    const enableResult = await enableAutoUpdate('03:00');
    if (!enableResult.success) {
      throw new Error('啟用自動更新失敗');
    }
    
    // 3. 管理資料來源
    const manageResult = await manageDataSources();
    if (!manageResult.success) {
      throw new Error('管理資料來源失敗');
    }
    
    // 4. 觸發首次更新
    const updateResult = await triggerFullUpdate();
    if (!updateResult.success) {
      throw new Error('首次更新失敗');
    }
    
    console.log('完整的多源自動更新設定完成');
    Alert.alert('成功', '多源自動更新設定完成！');
    
    return { success: true };
  } catch (error) {
    console.error('完整設定失敗:', error);
    Alert.alert('錯誤', `設定失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 重設多源自動更新設定
export const resetMultiSourceAutoUpdateSettings = async () => {
  try {
    console.log('重設多源自動更新設定...');
    
    // 停用自動更新
    await disableAutoUpdate();
    
    // 重設所有資料來源為預設狀態
    const status = await multiSourceAutoUpdateService.getDataSourceStatus();
    
    for (const [type, sources] of Object.entries(status)) {
      for (const [key, source] of Object.entries(sources)) {
        const sourceKey = `${type}.${key}`;
        
        // 重設為預設啟用狀態
        const defaultEnabled = key === 'tcgplayer' || key === 'pokemonApi' || key === 'onePieceApi';
        await multiSourceAutoUpdateService.toggleDataSource(sourceKey, defaultEnabled);
        
        // 重設為預設更新間隔
        let defaultInterval = 24; // 預設24小時
        if (key === 'tcgplayer' || key === 'ebay' || key === 'cardmarket') {
          defaultInterval = 6; // 價格資料6小時
        } else if (key === 'pokemonApi' || key === 'onePieceApi') {
          defaultInterval = 168; // 卡牌資料1週
        }
        
        await multiSourceAutoUpdateService.setSourceUpdateInterval(sourceKey, defaultInterval);
      }
    }
    
    console.log('多源自動更新設定已重設');
    Alert.alert('成功', '多源自動更新設定已重設為預設值');
    
    return { success: true };
  } catch (error) {
    console.error('重設設定失敗:', error);
    Alert.alert('錯誤', `重設失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 強健的更新執行範例（包含重試機制）
export const robustUpdateWithRetry = async (maxRetries = 3) => {
  try {
    console.log(`執行強健更新（最大重試次數: ${maxRetries}）...`);
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`嘗試更新 (第 ${attempt} 次)...`);
        
        const result = await multiSourceAutoUpdateService.triggerManualUpdate();
        
        if (result.success) {
          console.log(`更新成功 (第 ${attempt} 次嘗試)`);
          Alert.alert('成功', `更新成功 (第 ${attempt} 次嘗試)`);
          return { success: true, attempts: attempt };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        lastError = error;
        console.error(`更新失敗 (第 ${attempt} 次嘗試):`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`等待 5 秒後重試...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    console.error(`所有重試都失敗了 (${maxRetries} 次嘗試)`);
    Alert.alert('錯誤', `更新失敗 (${maxRetries} 次嘗試): ${lastError.message}`);
    
    return { success: false, error: lastError.message, attempts: maxRetries };
  } catch (error) {
    console.error('強健更新執行失敗:', error);
    Alert.alert('錯誤', `執行失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// 執行所有範例
export const runExamples = async () => {
  console.log('開始執行多源自動更新範例...');
  
  try {
    // 1. 初始化
    await initializeMultiSourceAutoUpdate();
    
    // 2. 完整設定
    await completeMultiSourceAutoUpdateSetup();
    
    // 3. 查看狀態
    await getDetailedStatus();
    
    // 4. 查看歷史
    await viewUpdateHistory();
    
    // 5. 觸發特定來源更新
    await triggerSpecificSourceUpdate('pricing.tcgplayer');
    
    console.log('所有範例執行完成');
    
  } catch (error) {
    console.error('執行範例失敗:', error);
  }
};

// 匯出所有範例函數
export default {
  initializeMultiSourceAutoUpdate,
  enableAutoUpdate,
  disableAutoUpdate,
  triggerFullUpdate,
  triggerSpecificSourceUpdate,
  manageDataSources,
  viewUpdateHistory,
  setUpdateTime,
  getDetailedStatus,
  batchUpdateSpecificCards,
  monitorUpdateProgress,
  completeMultiSourceAutoUpdateSetup,
  resetMultiSourceAutoUpdateSettings,
  robustUpdateWithRetry,
  runExamples
};
