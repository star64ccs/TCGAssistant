const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { validateRequest, validateQuery, validateParams, schemas, querySchemas, paramSchemas } = require('../middleware/validationMiddleware');

// 反饋服務
const feedbackService = require('../services/feedbackService');

// 提交反饋
router.post('/', validateRequest(schemas.feedback), async (req, res) => {
  try {
    const { type, title, description, rating, category, attachments } = req.validatedBody;
    const userId = req.user.id;
    
    const feedback = await feedbackService.submitFeedback({
      userId,
      type,
      title,
      description,
      rating,
      category,
      attachments
    });
    
    res.json({ success: true, data: feedback });
  } catch (error) {
    logger.error('提交反饋錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FEEDBACK_SUBMIT_ERROR', message: error.message || '提交反饋失敗' } 
    });
  }
});

// 獲取用戶反饋列表
router.get('/', validateQuery(querySchemas.feedbackQuery), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, category } = req.validatedQuery;
    const userId = req.user.id;
    
    const feedbacks = await feedbackService.getUserFeedbacks(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status,
      category
    });
    
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    logger.error('獲取反饋列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FEEDBACK_FETCH_ERROR', message: error.message || '獲取反饋列表失敗' } 
    });
  }
});

// 獲取反饋詳情
router.get('/:feedbackId', validateParams(paramSchemas.feedbackIdParam), async (req, res) => {
  try {
    const { feedbackId } = req.validatedParams;
    const userId = req.user.id;
    
    const feedback = await feedbackService.getFeedbackDetail(feedbackId, userId);
    
    res.json({ success: true, data: feedback });
  } catch (error) {
    logger.error('獲取反饋詳情錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FEEDBACK_DETAIL_ERROR', message: error.message || '獲取反饋詳情失敗' } 
    });
  }
});

// 更新反饋
router.put('/:feedbackId', validateParams(paramSchemas.feedbackIdParam), validateRequest(schemas.updateFeedback), async (req, res) => {
  try {
    const { feedbackId } = req.validatedParams;
    const { title, description, rating, status } = req.validatedBody;
    const userId = req.user.id;
    
    const feedback = await feedbackService.updateFeedback(feedbackId, userId, {
      title,
      description,
      rating,
      status
    });
    
    res.json({ success: true, data: feedback });
  } catch (error) {
    logger.error('更新反饋錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FEEDBACK_UPDATE_ERROR', message: error.message || '更新反饋失敗' } 
    });
  }
});

// 刪除反饋
router.delete('/:feedbackId', validateParams(paramSchemas.feedbackIdParam), async (req, res) => {
  try {
    const { feedbackId } = req.validatedParams;
    const userId = req.user.id;
    
    const result = await feedbackService.deleteFeedback(feedbackId, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('刪除反饋錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FEEDBACK_DELETE_ERROR', message: error.message || '刪除反饋失敗' } 
    });
  }
});

// 添加反饋回覆
router.post('/:feedbackId/reply', validateParams(paramSchemas.feedbackIdParam), validateRequest(schemas.feedbackReply), async (req, res) => {
  try {
    const { feedbackId } = req.validatedParams;
    const { message, isInternal } = req.validatedBody;
    const userId = req.user.id;
    
    const reply = await feedbackService.addFeedbackReply(feedbackId, userId, {
      message,
      isInternal: isInternal || false
    });
    
    res.json({ success: true, data: reply });
  } catch (error) {
    logger.error('添加反饋回覆錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FEEDBACK_REPLY_ERROR', message: error.message || '添加反饋回覆失敗' } 
    });
  }
});

// 獲取反饋統計
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await feedbackService.getFeedbackStats(userId);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('獲取反饋統計錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FEEDBACK_STATS_ERROR', message: error.message || '獲取反饋統計失敗' } 
    });
  }
});

// 獲取反饋分類統計
router.get('/stats/categories', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const categoryStats = await feedbackService.getFeedbackCategoryStats(userId);
    
    res.json({ success: true, data: categoryStats });
  } catch (error) {
    logger.error('獲取反饋分類統計錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'CATEGORY_STATS_ERROR', message: error.message || '獲取反饋分類統計失敗' } 
    });
  }
});

// 獲取反饋評分趨勢
router.get('/stats/rating-trend', validateQuery(querySchemas.ratingTrendQuery), async (req, res) => {
  try {
    const { period = '30d' } = req.validatedQuery;
    const userId = req.user.id;
    
    const ratingTrend = await feedbackService.getFeedbackRatingTrend(userId, period);
    
    res.json({ success: true, data: ratingTrend });
  } catch (error) {
    logger.error('獲取反饋評分趨勢錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'RATING_TREND_ERROR', message: error.message || '獲取反饋評分趨勢失敗' } 
    });
  }
});

// 批量操作反饋
router.post('/batch-action', validateRequest(schemas.batchFeedbackAction), async (req, res) => {
  try {
    const { feedbackIds, action, data } = req.validatedBody;
    const userId = req.user.id;
    
    const result = await feedbackService.batchAction(feedbackIds, action, data, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('批量操作反饋錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BATCH_ACTION_ERROR', message: error.message || '批量操作反饋失敗' } 
    });
  }
});

// 導出反饋數據
router.get('/export', validateQuery(querySchemas.exportQuery), async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, type, category } = req.validatedQuery;
    const userId = req.user.id;
    
    const exportData = await feedbackService.exportFeedbackData(userId, {
      format,
      startDate,
      endDate,
      type,
      category
    });
    
    res.json({ success: true, data: exportData });
  } catch (error) {
    logger.error('導出反饋數據錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'EXPORT_ERROR', message: error.message || '導出反饋數據失敗' } 
    });
  }
});

module.exports = router;
