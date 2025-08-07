const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { validateRequest, validateQuery, validateParams, schemas, querySchemas, paramSchemas } = require('../middleware/validationMiddleware');

// 備份服務
const backupService = require('../services/backupService');

// 創建備份
router.post('/create', validateRequest(schemas.createBackup), async (req, res) => {
  try {
    const { type, description, includeSettings, includeHistory, includeCollection } = req.validatedBody;
    const userId = req.user.id;
    
    const backup = await backupService.createBackup(userId, {
      type,
      description,
      includeSettings,
      includeHistory,
      includeCollection
    });
    
    res.json({ success: true, data: backup });
  } catch (error) {
    logger.error('創建備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_CREATE_ERROR', message: error.message || '創建備份失敗' } 
    });
  }
});

// 獲取備份列表
router.get('/', validateQuery(querySchemas.backupQuery), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.validatedQuery;
    const userId = req.user.id;
    
    const backups = await backupService.getBackupList(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status
    });
    
    res.json({ success: true, data: backups });
  } catch (error) {
    logger.error('獲取備份列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_LIST_ERROR', message: error.message || '獲取備份列表失敗' } 
    });
  }
});

// 獲取備份詳情
router.get('/:backupId', validateParams(paramSchemas.backupIdParam), async (req, res) => {
  try {
    const { backupId } = req.validatedParams;
    const userId = req.user.id;
    
    const backup = await backupService.getBackupDetail(backupId, userId);
    
    res.json({ success: true, data: backup });
  } catch (error) {
    logger.error('獲取備份詳情錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_DETAIL_ERROR', message: error.message || '獲取備份詳情失敗' } 
    });
  }
});

// 下載備份
router.get('/:backupId/download', validateParams(paramSchemas.backupIdParam), async (req, res) => {
  try {
    const { backupId } = req.validatedParams;
    const userId = req.user.id;
    
    const downloadData = await backupService.downloadBackup(backupId, userId);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${backupId}.zip"`);
    res.send(downloadData);
  } catch (error) {
    logger.error('下載備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_DOWNLOAD_ERROR', message: error.message || '下載備份失敗' } 
    });
  }
});

// 恢復備份
router.post('/:backupId/restore', validateParams(paramSchemas.backupIdParam), validateRequest(schemas.restoreBackup), async (req, res) => {
  try {
    const { backupId } = req.validatedParams;
    const { options, conflictResolution } = req.validatedBody;
    const userId = req.user.id;
    
    const restoreResult = await backupService.restoreBackup(backupId, userId, {
      options,
      conflictResolution
    });
    
    res.json({ success: true, data: restoreResult });
  } catch (error) {
    logger.error('恢復備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_RESTORE_ERROR', message: error.message || '恢復備份失敗' } 
    });
  }
});

// 刪除備份
router.delete('/:backupId', validateParams(paramSchemas.backupIdParam), async (req, res) => {
  try {
    const { backupId } = req.validatedParams;
    const userId = req.user.id;
    
    const result = await backupService.deleteBackup(backupId, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('刪除備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_DELETE_ERROR', message: error.message || '刪除備份失敗' } 
    });
  }
});

// 上傳備份文件
router.post('/upload', validateRequest(schemas.uploadBackup), async (req, res) => {
  try {
    const { backupData, description, type } = req.validatedBody;
    const userId = req.user.id;
    
    const backup = await backupService.uploadBackup(userId, {
      backupData,
      description,
      type
    });
    
    res.json({ success: true, data: backup });
  } catch (error) {
    logger.error('上傳備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_UPLOAD_ERROR', message: error.message || '上傳備份失敗' } 
    });
  }
});

// 驗證備份完整性
router.post('/:backupId/verify', validateParams(paramSchemas.backupIdParam), async (req, res) => {
  try {
    const { backupId } = req.validatedParams;
    const userId = req.user.id;
    
    const verificationResult = await backupService.verifyBackup(backupId, userId);
    
    res.json({ success: true, data: verificationResult });
  } catch (error) {
    logger.error('驗證備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_VERIFY_ERROR', message: error.message || '驗證備份失敗' } 
    });
  }
});

// 獲取備份統計
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await backupService.getBackupStats(userId);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('獲取備份統計錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BACKUP_STATS_ERROR', message: error.message || '獲取備份統計失敗' } 
    });
  }
});

// 設置自動備份
router.put('/auto-backup', validateRequest(schemas.autoBackupSettings), async (req, res) => {
  try {
    const { enabled, frequency, retention, includeSettings, includeHistory, includeCollection } = req.validatedBody;
    const userId = req.user.id;
    
    const settings = await backupService.setAutoBackupSettings(userId, {
      enabled,
      frequency,
      retention,
      includeSettings,
      includeHistory,
      includeCollection
    });
    
    res.json({ success: true, data: settings });
  } catch (error) {
    logger.error('設置自動備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'AUTO_BACKUP_SETTINGS_ERROR', message: error.message || '設置自動備份失敗' } 
    });
  }
});

// 獲取自動備份設置
router.get('/auto-backup', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const settings = await backupService.getAutoBackupSettings(userId);
    
    res.json({ success: true, data: settings });
  } catch (error) {
    logger.error('獲取自動備份設置錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'AUTO_BACKUP_GET_ERROR', message: error.message || '獲取自動備份設置失敗' } 
    });
  }
});

// 手動觸發自動備份
router.post('/auto-backup/trigger', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await backupService.triggerAutoBackup(userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('觸發自動備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'AUTO_BACKUP_TRIGGER_ERROR', message: error.message || '觸發自動備份失敗' } 
    });
  }
});

// 批量操作備份
router.post('/batch-action', validateRequest(schemas.batchBackupAction), async (req, res) => {
  try {
    const { backupIds, action, data } = req.validatedBody;
    const userId = req.user.id;
    
    const result = await backupService.batchAction(backupIds, action, data, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('批量操作備份錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BATCH_BACKUP_ACTION_ERROR', message: error.message || '批量操作備份失敗' } 
    });
  }
});

module.exports = router;
