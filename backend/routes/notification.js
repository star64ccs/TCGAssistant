const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { validateRequest, validateQuery, validateParams, schemas, querySchemas, paramSchemas } = require('../middleware/validationMiddleware');

// 通知服務
const notificationService = require('../services/notificationService');

// 獲取用戶通知列表
router.get('/', validateQuery(querySchemas.notificationQuery), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.validatedQuery;
    const userId = req.user.id;
    
    const notifications = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      isRead: isRead === 'true'
    });
    
    res.json({ success: true, data: notifications });
  } catch (error) {
    logger.error('獲取通知列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'NOTIFICATION_FETCH_ERROR', message: error.message || '獲取通知失敗' } 
    });
  }
});

// 發送通知
router.post('/send', validateRequest(schemas.sendNotification), async (req, res) => {
  try {
    const { userId, type, title, message, data, priority } = req.validatedBody;
    
    const notification = await notificationService.sendNotification({
      userId,
      type,
      title,
      message,
      data,
      priority
    });
    
    res.json({ success: true, data: notification });
  } catch (error) {
    logger.error('發送通知錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'NOTIFICATION_SEND_ERROR', message: error.message || '發送通知失敗' } 
    });
  }
});

// 標記通知為已讀
router.put('/:notificationId/read', validateParams(paramSchemas.notificationIdParam), async (req, res) => {
  try {
    const { notificationId } = req.validatedParams;
    const userId = req.user.id;
    
    const result = await notificationService.markAsRead(notificationId, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('標記通知已讀錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'NOTIFICATION_READ_ERROR', message: error.message || '標記已讀失敗' } 
    });
  }
});

// 批量標記通知為已讀
router.put('/batch-read', validateRequest(schemas.batchReadNotifications), async (req, res) => {
  try {
    const { notificationIds } = req.validatedBody;
    const userId = req.user.id;
    
    const result = await notificationService.batchMarkAsRead(notificationIds, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('批量標記通知已讀錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BATCH_READ_ERROR', message: error.message || '批量標記已讀失敗' } 
    });
  }
});

// 刪除通知
router.delete('/:notificationId', validateParams(paramSchemas.notificationIdParam), async (req, res) => {
  try {
    const { notificationId } = req.validatedParams;
    const userId = req.user.id;
    
    const result = await notificationService.deleteNotification(notificationId, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('刪除通知錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'NOTIFICATION_DELETE_ERROR', message: error.message || '刪除通知失敗' } 
    });
  }
});

// 獲取通知統計
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await notificationService.getNotificationStats(userId);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('獲取通知統計錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'NOTIFICATION_STATS_ERROR', message: error.message || '獲取通知統計失敗' } 
    });
  }
});

// 更新通知設置
router.put('/settings', validateRequest(schemas.notificationSettings), async (req, res) => {
  try {
    const { settings } = req.validatedBody;
    const userId = req.user.id;
    
    const result = await notificationService.updateNotificationSettings(userId, settings);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('更新通知設置錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SETTINGS_UPDATE_ERROR', message: error.message || '更新通知設置失敗' } 
    });
  }
});

// 獲取通知設置
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const settings = await notificationService.getNotificationSettings(userId);
    
    res.json({ success: true, data: settings });
  } catch (error) {
    logger.error('獲取通知設置錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SETTINGS_FETCH_ERROR', message: error.message || '獲取通知設置失敗' } 
    });
  }
});

// 訂閱推送通知
router.post('/subscribe', validateRequest(schemas.pushSubscription), async (req, res) => {
  try {
    const { endpoint, keys } = req.validatedBody;
    const userId = req.user.id;
    
    const result = await notificationService.subscribeToPush(userId, { endpoint, keys });
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('訂閱推送通知錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'PUSH_SUBSCRIPTION_ERROR', message: error.message || '訂閱推送通知失敗' } 
    });
  }
});

// 取消訂閱推送通知
router.delete('/unsubscribe', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await notificationService.unsubscribeFromPush(userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('取消訂閱推送通知錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'PUSH_UNSUBSCRIPTION_ERROR', message: error.message || '取消訂閱推送通知失敗' } 
    });
  }
});

module.exports = router;
