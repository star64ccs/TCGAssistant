import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants';

// 備份類型
export const BACKUP_TYPES = {
  FULL: 'full',
  INCREMENTAL: 'incremental',
  SELECTIVE: 'selective',
  CLOUD: 'cloud',
};

// 備份狀態
export const BACKUP_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// 同步類型
export const SYNC_TYPES = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  BIDIRECTIONAL: 'bidirectional',
};

class BackupService {
  constructor() {
    this.isInitialized = false;
    this.backupQueue = [];
    this.syncInProgress = false;
    this.lastBackupTime = null;
    this.lastSyncTime = null;
  }

  // 初始化備份服務
  async initialize() {
    try {
      if (this.isInitialized) return;

      // 載入備份配置
      await this.loadBackupConfig();
      
      // 設置自動備份任務
      this.setupAutoBackupTask();
      
      // 設置自動同步任務
      this.setupAutoSyncTask();
      
      this.isInitialized = true;
      console.log('BackupService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BackupService:', error);
      throw error;
    }
  }

  // 創建完整備份
  async createFullBackup(options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const backupId = this.generateBackupId();
      const backupData = {
        id: backupId,
        type: BACKUP_TYPES.FULL,
        status: BACKUP_STATUS.IN_PROGRESS,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        options,
      };

      // 開始備份
      const result = await this.performBackup(backupData);
      
      if (result.success) {
        await this.saveBackupRecord(result.backupData);
        this.lastBackupTime = Date.now();
        return { success: true, backupId, backupData: result.backupData };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to create full backup:', error);
      throw error;
    }
  }

  // 創建增量備份
  async createIncrementalBackup(options = {}) {
    try {
      const lastBackup = await this.getLastBackup();
      if (!lastBackup) {
        // 如果沒有之前的備份，創建完整備份
        return await this.createFullBackup(options);
      }

      const backupId = this.generateBackupId();
      const backupData = {
        id: backupId,
        type: BACKUP_TYPES.INCREMENTAL,
        status: BACKUP_STATUS.IN_PROGRESS,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        baseBackupId: lastBackup.id,
        options,
      };

      const result = await this.performIncrementalBackup(backupData, lastBackup);
      
      if (result.success) {
        await this.saveBackupRecord(result.backupData);
        this.lastBackupTime = Date.now();
        return { success: true, backupId, backupData: result.backupData };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to create incremental backup:', error);
      throw error;
    }
  }

  // 創建選擇性備份
  async createSelectiveBackup(selectedKeys, options = {}) {
    try {
      const backupId = this.generateBackupId();
      const backupData = {
        id: backupId,
        type: BACKUP_TYPES.SELECTIVE,
        status: BACKUP_STATUS.IN_PROGRESS,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        selectedKeys,
        options,
      };

      const result = await this.performSelectiveBackup(backupData, selectedKeys);
      
      if (result.success) {
        await this.saveBackupRecord(result.backupData);
        this.lastBackupTime = Date.now();
        return { success: true, backupId, backupData: result.backupData };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to create selective backup:', error);
      throw error;
    }
  }

  // 執行備份
  async performBackup(backupData) {
    try {
      // 獲取所有本地存儲數據
      const allKeys = await AsyncStorage.getAllKeys();
      const backupContent = {};

      // 讀取所有數據
      for (const key of allKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            backupContent[key] = value;
          }
        } catch (error) {
          console.warn(`Failed to read key ${key}:`, error);
        }
      }

      // 計算備份大小
      const backupSize = JSON.stringify(backupContent).length;
      
      // 更新備份數據
      const completedBackup = {
        ...backupData,
        status: BACKUP_STATUS.COMPLETED,
        content: backupContent,
        size: backupSize,
        itemCount: Object.keys(backupContent).length,
        completedAt: new Date().toISOString(),
      };

      return { success: true, backupData: completedBackup };
    } catch (error) {
      console.error('Failed to perform backup:', error);
      return { success: false, error: error.message };
    }
  }

  // 執行增量備份
  async performIncrementalBackup(backupData, baseBackup) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const incrementalContent = {};
      let changedCount = 0;

      // 比較當前數據與基礎備份
      for (const key of allKeys) {
        try {
          const currentValue = await AsyncStorage.getItem(key);
          const baseValue = baseBackup.content[key];

          // 如果數據有變化，包含在增量備份中
          if (currentValue !== baseValue) {
            incrementalContent[key] = currentValue;
            changedCount++;
          }
        } catch (error) {
          console.warn(`Failed to compare key ${key}:`, error);
        }
      }

      const backupSize = JSON.stringify(incrementalContent).length;
      
      const completedBackup = {
        ...backupData,
        status: BACKUP_STATUS.COMPLETED,
        content: incrementalContent,
        size: backupSize,
        itemCount: changedCount,
        completedAt: new Date().toISOString(),
      };

      return { success: true, backupData: completedBackup };
    } catch (error) {
      console.error('Failed to perform incremental backup:', error);
      return { success: false, error: error.message };
    }
  }

  // 執行選擇性備份
  async performSelectiveBackup(backupData, selectedKeys) {
    try {
      const selectiveContent = {};

      for (const key of selectedKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            selectiveContent[key] = value;
          }
        } catch (error) {
          console.warn(`Failed to read selected key ${key}:`, error);
        }
      }

      const backupSize = JSON.stringify(selectiveContent).length;
      
      const completedBackup = {
        ...backupData,
        status: BACKUP_STATUS.COMPLETED,
        content: selectiveContent,
        size: backupSize,
        itemCount: Object.keys(selectiveContent).length,
        completedAt: new Date().toISOString(),
      };

      return { success: true, backupData: completedBackup };
    } catch (error) {
      console.error('Failed to perform selective backup:', error);
      return { success: false, error: error.message };
    }
  }

  // 恢復備份
  async restoreBackup(backupId, options = {}) {
    try {
      const backup = await this.getBackupById(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      if (backup.status !== BACKUP_STATUS.COMPLETED) {
        throw new Error('Backup is not completed');
      }

      // 開始恢復
      const result = await this.performRestore(backup, options);
      
      if (result.success) {
        await this.updateBackupRecord(backupId, { lastRestoredAt: new Date().toISOString() });
        return { success: true, restoredItems: result.restoredItems };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  // 執行恢復
  async performRestore(backup, options = {}) {
    try {
      const { content, type } = backup;
      const { overwrite = true, merge = false } = options;
      
      let restoredItems = 0;
      const errors = [];

      if (type === BACKUP_TYPES.FULL) {
        // 完整恢復
        if (overwrite) {
          // 清除所有現有數據
          const allKeys = await AsyncStorage.getAllKeys();
          await AsyncStorage.multiRemove(allKeys);
        }

        // 恢復所有備份數據
        for (const [key, value] of Object.entries(content)) {
          try {
            await AsyncStorage.setItem(key, value);
            restoredItems++;
          } catch (error) {
            errors.push({ key, error: error.message });
          }
        }
      } else if (type === BACKUP_TYPES.INCREMENTAL) {
        // 增量恢復
        for (const [key, value] of Object.entries(content)) {
          try {
            if (overwrite || !(await AsyncStorage.getItem(key))) {
              await AsyncStorage.setItem(key, value);
              restoredItems++;
            }
          } catch (error) {
            errors.push({ key, error: error.message });
          }
        }
      } else if (type === BACKUP_TYPES.SELECTIVE) {
        // 選擇性恢復
        for (const [key, value] of Object.entries(content)) {
          try {
            if (overwrite || !(await AsyncStorage.getItem(key))) {
              await AsyncStorage.setItem(key, value);
              restoredItems++;
            }
          } catch (error) {
            errors.push({ key, error: error.message });
          }
        }
      }

      return { 
        success: true, 
        restoredItems, 
        errors: errors.length > 0 ? errors : null 
      };
    } catch (error) {
      console.error('Failed to perform restore:', error);
      return { success: false, error: error.message };
    }
  }

  // 雲端同步
  async syncToCloud(syncType = SYNC_TYPES.BIDIRECTIONAL) {
    try {
      if (this.syncInProgress) {
        throw new Error('Sync already in progress');
      }

      this.syncInProgress = true;
      
      const syncId = this.generateSyncId();
      const syncData = {
        id: syncId,
        type: syncType,
        status: 'in_progress',
        timestamp: Date.now(),
        startedAt: new Date().toISOString(),
      };

      let result;
      
      switch (syncType) {
        case SYNC_TYPES.UPLOAD:
          result = await this.performUploadSync(syncData);
          break;
        case SYNC_TYPES.DOWNLOAD:
          result = await this.performDownloadSync(syncData);
          break;
        case SYNC_TYPES.BIDIRECTIONAL:
          result = await this.performBidirectionalSync(syncData);
          break;
        default:
          throw new Error('Invalid sync type');
      }

      this.syncInProgress = false;
      this.lastSyncTime = Date.now();
      
      return result;
    } catch (error) {
      this.syncInProgress = false;
      console.error('Failed to sync to cloud:', error);
      throw error;
    }
  }

  // 執行上傳同步
  async performUploadSync(syncData) {
    try {
      // 獲取本地數據
      const allKeys = await AsyncStorage.getAllKeys();
      const localData = {};
      
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          localData[key] = value;
        }
      }

      // 上傳到雲端
      const uploadResult = await this.uploadToCloud(localData);
      
      if (uploadResult.success) {
        const completedSync = {
          ...syncData,
          status: 'completed',
          uploadedItems: Object.keys(localData).length,
          completedAt: new Date().toISOString(),
        };
        
        await this.saveSyncRecord(completedSync);
        return { success: true, syncId: syncData.id, uploadedItems: Object.keys(localData).length };
      } else {
        return { success: false, error: uploadResult.error };
      }
    } catch (error) {
      console.error('Failed to perform upload sync:', error);
      return { success: false, error: error.message };
    }
  }

  // 執行下載同步
  async performDownloadSync(syncData) {
    try {
      // 從雲端下載數據
      const downloadResult = await this.downloadFromCloud();
      
      if (downloadResult.success) {
        const cloudData = downloadResult.data;
        let downloadedItems = 0;
        
        // 恢復到本地
        for (const [key, value] of Object.entries(cloudData)) {
          try {
            await AsyncStorage.setItem(key, value);
            downloadedItems++;
          } catch (error) {
            console.warn(`Failed to restore key ${key}:`, error);
          }
        }

        const completedSync = {
          ...syncData,
          status: 'completed',
          downloadedItems,
          completedAt: new Date().toISOString(),
        };
        
        await this.saveSyncRecord(completedSync);
        return { success: true, syncId: syncData.id, downloadedItems };
      } else {
        return { success: false, error: downloadResult.error };
      }
    } catch (error) {
      console.error('Failed to perform download sync:', error);
      return { success: false, error: error.message };
    }
  }

  // 執行雙向同步
  async performBidirectionalSync(syncData) {
    try {
      // 先下載雲端數據
      const downloadResult = await this.performDownloadSync(syncData);
      if (!downloadResult.success) {
        return downloadResult;
      }

      // 再上傳本地數據
      const uploadResult = await this.performUploadSync({
        ...syncData,
        id: `${syncData.id}_upload`,
      });

      return {
        success: true,
        syncId: syncData.id,
        downloadedItems: downloadResult.downloadedItems,
        uploadedItems: uploadResult.uploadedItems,
      };
    } catch (error) {
      console.error('Failed to perform bidirectional sync:', error);
      return { success: false, error: error.message };
    }
  }

  // 上傳到雲端
  async uploadToCloud(data) {
    try {
      // 這裡應該調用真實的雲端API
      // 目前使用模擬API
      const response = await fetch('https://api.tcgassistant.com/backup/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          timestamp: Date.now(),
          deviceId: Platform.OS,
        }),
      });

      return { success: response.ok };
    } catch (error) {
      console.error('Failed to upload to cloud:', error);
      return { success: false, error: error.message };
    }
  }

  // 從雲端下載
  async downloadFromCloud() {
    try {
      // 這裡應該調用真實的雲端API
      const response = await fetch('https://api.tcgassistant.com/backup/download', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.backup };
      } else {
        return { success: false, error: 'Download failed' };
      }
    } catch (error) {
      console.error('Failed to download from cloud:', error);
      return { success: false, error: error.message };
    }
  }

  // 獲取備份列表
  async getBackupList(limit = 50, offset = 0) {
    try {
      const backupKey = STORAGE_KEYS.BACKUP_HISTORY;
      const backupData = await AsyncStorage.getItem(backupKey);
      const backups = backupData ? JSON.parse(backupData) : [];
      
      // 按時間排序
      const sortedBackups = backups.sort((a, b) => b.timestamp - a.timestamp);
      
      // 分頁
      return sortedBackups.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get backup list:', error);
      return [];
    }
  }

  // 獲取備份統計
  async getBackupStats() {
    try {
      const backups = await this.getBackupList(1000, 0);
      
      const stats = {
        total: backups.length,
        byType: {},
        byStatus: {},
        totalSize: 0,
        averageSize: 0,
        lastBackup: null,
        lastSync: null,
      };

      let totalSize = 0;

      backups.forEach(backup => {
        stats.byType[backup.type] = (stats.byType[backup.type] || 0) + 1;
        stats.byStatus[backup.status] = (stats.byStatus[backup.status] || 0) + 1;
        
        if (backup.size) {
          totalSize += backup.size;
        }
      });

      stats.totalSize = totalSize;
      stats.averageSize = backups.length > 0 ? totalSize / backups.length : 0;
      stats.lastBackup = this.lastBackupTime;
      stats.lastSync = this.lastSyncTime;

      return stats;
    } catch (error) {
      console.error('Failed to get backup stats:', error);
      return null;
    }
  }

  // 刪除備份
  async deleteBackup(backupId) {
    try {
      const backups = await this.getBackupList(1000, 0);
      const filteredBackups = backups.filter(b => b.id !== backupId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(filteredBackups));
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  // 生成備份ID
  generateBackupId() {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成同步ID
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 保存備份記錄
  async saveBackupRecord(backupData) {
    try {
      const backupKey = STORAGE_KEYS.BACKUP_HISTORY;
      const currentBackups = await AsyncStorage.getItem(backupKey);
      const backups = currentBackups ? JSON.parse(currentBackups) : [];
      
      backups.push(backupData);
      
      // 限制備份記錄數量
      if (backups.length > 100) {
        backups.splice(0, backups.length - 100);
      }
      
      await AsyncStorage.setItem(backupKey, JSON.stringify(backups));
    } catch (error) {
      console.error('Failed to save backup record:', error);
    }
  }

  // 保存同步記錄
  async saveSyncRecord(syncData) {
    try {
      const syncKey = STORAGE_KEYS.SYNC_HISTORY;
      const currentSyncs = await AsyncStorage.getItem(syncKey);
      const syncs = currentSyncs ? JSON.parse(currentSyncs) : [];
      
      syncs.push(syncData);
      
      if (syncs.length > 50) {
        syncs.splice(0, syncs.length - 50);
      }
      
      await AsyncStorage.setItem(syncKey, JSON.stringify(syncs));
    } catch (error) {
      console.error('Failed to save sync record:', error);
    }
  }

  // 獲取最後備份
  async getLastBackup() {
    try {
      const backups = await this.getBackupList(1, 0);
      return backups.length > 0 ? backups[0] : null;
    } catch (error) {
      console.error('Failed to get last backup:', error);
      return null;
    }
  }

  // 根據ID獲取備份
  async getBackupById(backupId) {
    try {
      const backups = await this.getBackupList(1000, 0);
      return backups.find(b => b.id === backupId) || null;
    } catch (error) {
      console.error('Failed to get backup by id:', error);
      return null;
    }
  }

  // 更新備份記錄
  async updateBackupRecord(backupId, updates) {
    try {
      const backups = await this.getBackupList(1000, 0);
      const backupIndex = backups.findIndex(b => b.id === backupId);
      
      if (backupIndex !== -1) {
        backups[backupIndex] = { ...backups[backupIndex], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(backups));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update backup record:', error);
      return false;
    }
  }

  // 載入備份配置
  async loadBackupConfig() {
    try {
      const configKey = STORAGE_KEYS.BACKUP_CONFIG;
      const configData = await AsyncStorage.getItem(configKey);
      this.config = configData ? JSON.parse(configData) : {
        autoBackup: true,
        autoBackupInterval: 24 * 60 * 60 * 1000, // 24小時
        autoSync: true,
        autoSyncInterval: 6 * 60 * 60 * 1000, // 6小時
        maxBackups: 50,
        compression: true,
        encryption: false,
      };
    } catch (error) {
      console.error('Failed to load backup config:', error);
      this.config = {
        autoBackup: true,
        autoBackupInterval: 24 * 60 * 60 * 1000,
        autoSync: true,
        autoSyncInterval: 6 * 60 * 60 * 1000,
        maxBackups: 50,
        compression: true,
        encryption: false,
      };
    }
  }

  // 設置自動備份任務
  setupAutoBackupTask() {
    if (this.config.autoBackup) {
      setInterval(async () => {
        try {
          await this.createIncrementalBackup();
        } catch (error) {
          console.error('Auto backup failed:', error);
        }
      }, this.config.autoBackupInterval);
    }
  }

  // 設置自動同步任務
  setupAutoSyncTask() {
    if (this.config.autoSync) {
      setInterval(async () => {
        try {
          await this.syncToCloud(SYNC_TYPES.BIDIRECTIONAL);
        } catch (error) {
          console.error('Auto sync failed:', error);
        }
      }, this.config.autoSyncInterval);
    }
  }

  // 清理舊備份
  async cleanupOldBackups(maxBackups = 50) {
    try {
      const backups = await this.getBackupList(1000, 0);
      
      if (backups.length > maxBackups) {
        const backupsToDelete = backups.slice(maxBackups);
        const remainingBackups = backups.slice(0, maxBackups);
        
        await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(remainingBackups));
        
        return { success: true, deleted: backupsToDelete.length };
      }
      
      return { success: true, deleted: 0 };
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
      return { success: false, error: error.message };
    }
  }
}

// 創建單例實例
const backupService = new BackupService();

export default backupService;
