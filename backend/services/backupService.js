const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { Readable } = require('stream');

class BackupService {
  constructor() {
    this.backups = new Map();
    this.autoBackupSettings = new Map();
    this.backupDir = 'backups';
    this.ensureBackupDirectory();
  }

  // 確保備份目錄存在
  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true,
      });
    } catch (error) {
      logger.error('創建備份目錄失敗:', error);
    }
  }

  // 創建備份
  async createBackup(userId, options = {}) {
    try {
      const {
        type = 'full',
        description = '',
        includeSettings = true,
        includeHistory = true,
        includeCollection = true,
      } = options;

      const backupId = uuidv4();
      const timestamp = new Date();

      // 收集用戶數據
      const userData = await this.collectUserData(userId, {
        includeSettings,
        includeHistory,
        includeCollection,
      });

      // 創建備份文件
      const backupFileName = `backup_${ userId }_${ backupId }_${ timestamp.getTime() }.zip`;
      const backupFilePath = path.join(this.backupDir, backupFileName);

      await this.createBackupFile(backupFilePath, userData);

      // 記錄備份信息
      const backup = {
        id: backupId,
        userId,
        type,
        description,
        fileName: backupFileName,
        filePath: backupFilePath,
        fileSize: await this.getFileSize(backupFilePath),
        dataIncluded: {
          settings: includeSettings,
          history: includeHistory,
          collection: includeCollection,
        },
        status: 'completed',
        createdAt: timestamp,
        updatedAt: timestamp,
        checksum: await this.calculateChecksum(backupFilePath),
      };

      this.backups.set(backupId, backup);

      logger.info(`備份已創建: ${ backupId } 用戶 ${ userId }`);
      return backup;
    } catch (error) {
      logger.error('創建備份錯誤:', error);
      throw new Error('創建備份失敗');
    }
  }

  // 獲取備份列表
  getBackupList(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type, status,
      } = options;

      let backups = Array.from(this.backups.values())
        .filter(b => b.userId === userId);

      // 篩選條件
      if (type) {
        backups = backups.filter(b => b.type === type);
      }
      if (status) {
        backups = backups.filter(b => b.status === status);
      }

      // 排序（最新的在前）
      backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // 分頁
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBackups = backups.slice(startIndex, endIndex);

      return {
        backups: paginatedBackups,
        pagination: {
          page,
          limit,
          total: backups.length,
          totalPages: Math.ceil(backups.length / limit),
        },
      };
    } catch (error) {
      logger.error('獲取備份列表錯誤:', error);
      throw new Error('獲取備份列表失敗');
    }
  }

  // 獲取備份詳情
  getBackupDetail(backupId, userId) {
    try {
      const backup = this.backups.get(backupId);
      if (!backup || backup.userId !== userId) {
        throw new Error('備份不存在或無權限');
      }

      return backup;
    } catch (error) {
      logger.error('獲取備份詳情錯誤:', error);
      throw error;
    }
  }

  // 下載備份
  async downloadBackup(backupId, userId) {
    try {
      const backup = this.backups.get(backupId);
      if (!backup || backup.userId !== userId) {
        throw new Error('備份不存在或無權限');
      }

      const fileBuffer = await fs.readFile(backup.filePath);

      return {
        buffer: fileBuffer,
        filename: backup.fileName,
        mimeType: 'application/zip',
        size: backup.fileSize,
      };
    } catch (error) {
      logger.error('下載備份錯誤:', error);
      throw new Error('下載備份失敗');
    }
  }

  // 恢復備份
  async restoreBackup(backupId, userId, options = {}) {
    try {
      const backup = this.backups.get(backupId);
      if (!backup || backup.userId !== userId) {
        throw new Error('備份不存在或無權限');
      }

      const { conflictResolution = 'skip' } = options;

      // 讀取備份數據
      const backupData = await this.extractBackupData(backup.filePath);

      // 恢復數據
      const restoreResult = await this.restoreUserData(userId, backupData, { conflictResolution });

      // 更新備份狀態
      backup.lastRestored = new Date();
      backup.restoreCount = (backup.restoreCount || 0) + 1;
      this.backups.set(backupId, backup);

      logger.info(`備份已恢復: ${ backupId } 用戶 ${ userId }`);
      return {
        success: true,
        backupId,
        restoredData: restoreResult,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('恢復備份錯誤:', error);
      throw new Error('恢復備份失敗');
    }
  }

  // 刪除備份
  async deleteBackup(backupId, userId) {
    try {
      const backup = this.backups.get(backupId);
      if (!backup || backup.userId !== userId) {
        throw new Error('備份不存在或無權限');
      }

      // 刪除文件
      try {
        await fs.unlink(backup.filePath);
      } catch (fileError) {
        logger.warn(`刪除備份文件失敗: ${backup.filePath }`, fileError);
      }

      // 刪除記錄
      this.backups.delete(backupId);

      logger.info(`備份已刪除: ${ backupId }`);
      return { success: true };
    } catch (error) {
      logger.error('刪除備份錯誤:', error);
      throw error;
    }
  }

  // 上傳備份文件
  async uploadBackup(userId, { backupData, description, type }) {
    try {
      const backupId = uuidv4();
      const timestamp = new Date();

      // 保存上傳的文件
      const backupFileName = `uploaded_backup_${userId
      }_${ backupId }_${ timestamp.getTime() }.zip`;
      const backupFilePath = path.join(this.backupDir, backupFileName);

      await fs.writeFile(backupFilePath, Buffer.from(backupData, 'base64'));

      // 驗證備份文件
      const isValid = await this.validateBackupFile(backupFilePath);
      if (!isValid) {
        await fs.unlink(backupFilePath);
        throw new Error('無效的備份文件');
      }

      // 記錄備份信息
      const backup = {
        id: backupId,
        userId,
        type: type || 'full',
        description: description || '上傳的備份',
        fileName: backupFileName,
        filePath: backupFilePath,
        fileSize: await this.getFileSize(backupFilePath),
        dataIncluded: {
          settings: true,
          history: true,
          collection: true,
        },
        status: 'completed',
        createdAt: timestamp,
        updatedAt: timestamp,
        checksum: await this.calculateChecksum(backupFilePath),
        source: 'uploaded',
      };

      this.backups.set(backupId, backup);

      logger.info(`備份已上傳: ${ backupId } 用戶 ${ userId }`);
      return backup;
    } catch (error) {
      logger.error('上傳備份錯誤:', error);
      throw new Error('上傳備份失敗');
    }
  }

  // 驗證備份完整性
  async verifyBackup(backupId, userId) {
    try {
      const backup = this.backups.get(backupId);
      if (!backup || backup.userId !== userId) {
        throw new Error('備份不存在或無權限');
      }

      const currentChecksum = await this.calculateChecksum(backup.filePath);
      const isIntact = currentChecksum === backup.checksum;

      const verificationResult = {
        backupId,
        isIntact,
        originalChecksum: backup.checksum,
        currentChecksum,
        fileExists: await this.fileExists(backup.filePath),
        fileSize: await this.getFileSize(backup.filePath),
        verifiedAt: new Date(),
      };

      return verificationResult;
    } catch (error) {
      logger.error('驗證備份錯誤:', error);
      throw new Error('驗證備份失敗');
    }
  }

  // 獲取備份統計
  getBackupStats(userId) {
    try {
      const backups = Array.from(this.backups.values())
        .filter(b => b.userId === userId);

      const stats = {
        total: backups.length,
        byType: {
          full: backups.filter(b => b.type === 'full').length,
          partial: backups.filter(b => b.type === 'partial').length,
          incremental: backups.filter(b => b.type === 'incremental').length,
        },
        byStatus: {
          completed: backups.filter(b => b.status === 'completed').length,
          failed: backups.filter(b => b.status === 'failed').length,
          inProgress: backups.filter(b => b.status === 'in_progress').length,
        },
        totalSize: backups.reduce((sum, b) => sum + (b.fileSize || 0), 0),
        lastBackup: backups.length > 0 ? Math.max(...backups.map(b => new Date(b.createdAt))) : null,
        averageSize: backups.length > 0 ? backups.reduce((sum, b) => sum + (b.fileSize || 0), 0) / backups.length : 0,
      };

      return stats;
    } catch (error) {
      logger.error('獲取備份統計錯誤:', error);
      throw new Error('獲取備份統計失敗');
    }
  }

  // 設置自動備份
  async setAutoBackupSettings(userId, settings) {
    try {
      const currentSettings = await this.getAutoBackupSettings(userId);
      const updatedSettings = { ...currentSettings, ...settings, updatedAt: new Date(),
      };

      this.autoBackupSettings.set(userId, updatedSettings);

      logger.info(`自動備份設置已更新: ${ userId }`);
      return updatedSettings;
    } catch (error) {
      logger.error('設置自動備份錯誤:', error);
      throw new Error('設置自動備份失敗');
    }
  }

  // 獲取自動備份設置
  getAutoBackupSettings(userId) {
    try {
      const settings = this.autoBackupSettings.get(userId);
      if (!settings) {
        // 返回默認設置
        const defaultSettings = {
          enabled: false,
          frequency: 'weekly',
          retention: 30,
          includeSettings: true,
          includeHistory: true,
          includeCollection: true,
          lastBackup: null,
          nextBackup: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.autoBackupSettings.set(userId, defaultSettings);
        return defaultSettings;
      }

      return settings;
    } catch (error) {
      logger.error('獲取自動備份設置錯誤:', error);
      throw new Error('獲取自動備份設置失敗');
    }
  }

  // 觸發自動備份
  async triggerAutoBackup(userId) {
    try {
      const settings = await this.getAutoBackupSettings(userId);
      if (!settings.enabled) {
        throw new Error('自動備份未啟用');
      }

      const backup = await this.createBackup(userId, {
        type: 'auto',
        description: '自動備份',
        includeSettings: settings.includeSettings,
        includeHistory: settings.includeHistory,
        includeCollection: settings.includeCollection,
      });

      // 更新設置
      settings.lastBackup = new Date();
      settings.nextBackup = this.calculateNextBackup(settings.frequency);
      this.autoBackupSettings.set(userId, settings);

      return backup;
    } catch (error) {
      logger.error('觸發自動備份錯誤:', error);
      throw new Error('觸發自動備份失敗');
    }
  }

  // 批量操作備份
  async batchAction(backupIds, action, data, userId) {
    try {
      const results = [];

      for (const backupId of backupIds) {
        try {
          let result;
          switch (action) {
            case 'delete':
              result = await this.deleteBackup(backupId, userId);
              break;
            case 'download':
              result = await this.downloadBackup(backupId, userId);
              break;
            case 'verify':
              result = await this.verifyBackup(backupId, userId);
              break;
            default:
              throw new Error(`不支持的操作: ${action
              }`);
          }
          results.push({ success: true, backupId, result });
        } catch (error) {
          results.push({ success: false, backupId, error: error.message });
        }
      }

      return {
        success: true,
        results,
        summary: {
          total: backupIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        },
      };
    } catch (error) {
      logger.error('批量操作備份錯誤:', error);
      throw new Error('批量操作備份失敗');
    }
  }

  // 收集用戶數據
  collectUserData(userId, options) {
    // 從數據庫收集數據
    // 目前使用模擬數據
    const userData = {
      userId,
      timestamp: new Date(),
      version: '1.0.0',
      data: {
      },
    };

    if (options.includeSettings) {
      userData.data.settings = {
        language: 'zh-TW',
        theme: 'dark',
        notifications: true,
      };
    }

    if (options.includeHistory) {
      userData.data.history = [
        { action: 'card_recognition', timestamp: new Date(),
        },
        { action: 'price_check', timestamp: new Date() },
      ];
    }

    if (options.includeCollection) {
      userData.data.collection = [
        { cardId: 'card1', addedAt: new Date(),
        },
        { cardId: 'card2', addedAt: new Date() },
      ];
    }

    return userData;
  }

  // 創建備份文件
  createBackupFile(filePath, data) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 9,
      } });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.append(JSON.stringify(data, null, 2), { name: 'backup.json' });
      archive.finalize();
    });
  }

  // 提取備份數據
  extractBackupData(filePath) {
    // 解壓縮文件並解析數據
    // 目前返回模擬數據
    return {
      userId: 'user123',
      timestamp: new Date(),
      version: '1.0.0',
      data: {
        settings: {
        },
        history: [],
        collection: [],
      },
    };
  }

  // 恢復用戶數據
  restoreUserData(userId, backupData, options) {
    // 恢復數據到數據庫
    // 目前返回模擬結果
    return {
      restoredItems: {
        settings: 1,
        history: 10,
        collection: 5,
      },
      conflicts: [],
      timestamp: new Date(),
    };
  }

  // 獲取文件大小
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  // 計算文件校驗和
  calculateChecksum(filePath) {
    // 計算文件的MD5或SHA256校驗和
    // 目前返回模擬值
    return `checksum_${Date.now()
    }`;
  }

  // 檢查文件是否存在
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 驗證備份文件
  validateBackupFile(filePath) {
    // 驗證備份文件的完整性
    // 目前返回true
    return true;
  }

  // 計算下次備份時間
  calculateNextBackup(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}

module.exports = new BackupService();
