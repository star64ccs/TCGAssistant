const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { validateRequest, validateQuery, schemas, querySchemas } = require('../middleware/validationMiddleware');

// 分析服務
const analyticsService = require('../services/analyticsService');

// 記錄用戶行為
router.post('/track', validateRequest(schemas.trackEvent), async (req, res, next) => {
  try {
    const { event, category, action, label, value, properties } = req.validatedBody;
    const userId = req.user.id;

    const result = await analyticsService.trackEvent(userId, {
      event,
      category,
      action,
      label,
      value,
      properties,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('記錄用戶行為錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'TRACK_EVENT_ERROR', message: error.message || '記錄用戶行為失敗',
      },
    });
  }
});

// 獲取用戶使用統計
router.get('/usage', validateQuery(querySchemas.usageQuery), async (req, res, next) => {
  try {
    const { period = '30d', feature, groupBy } = req.validatedQuery;
    const userId = req.user.id;

    const usageStats = await analyticsService.getUsageStats(userId, {
      period,
      feature,
      groupBy,
    });

    res.json({ success: true, data: usageStats });
  } catch (error) {
    logger.error('獲取使用統計錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'USAGE_STATS_ERROR', message: error.message || '獲取使用統計失敗',
      },
    });
  }
});

// 獲取功能使用趨勢
router.get('/trends', validateQuery(querySchemas.trendsQuery), async (req, res, next) => {
  try {
    const { period = '30d', feature, interval = 'day' } = req.validatedQuery;
    const userId = req.user.id;

    const trends = await analyticsService.getUsageTrends(userId, {
      period,
      feature,
      interval,
    });

    res.json({ success: true, data: trends });
  } catch (error) {
    logger.error('獲取使用趨勢錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'USAGE_TRENDS_ERROR', message: error.message || '獲取使用趨勢失敗',
      },
    });
  }
});

// 獲取性能指標
router.get('/performance', validateQuery(querySchemas.performanceQuery), async (req, res, next) => {
  try {
    const { period = '7d', metric, endpoint } = req.validatedQuery;
    const userId = req.user.id;

    const performance = await analyticsService.getPerformanceMetrics(userId, {
      period,
      metric,
      endpoint,
    });

    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('獲取性能指標錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'PERFORMANCE_METRICS_ERROR', message: error.message || '獲取性能指標失敗',
      },
    });
  }
});

// 獲取錯誤統計
router.get('/errors', validateQuery(querySchemas.errorsQuery), async (req, res, next) => {
  try {
    const { period = '7d', severity, type,
    } = req.validatedQuery;
    const userId = req.user.id;

    const errors = await analyticsService.getErrorStats(userId, {
      period,
      severity,
      type,
    });

    res.json({ success: true, data: errors });
  } catch (error) {
    logger.error('獲取錯誤統計錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR_STATS_ERROR', message: error.message || '獲取錯誤統計失敗',
      },
    });
  }
});

// 獲取用戶行為分析
router.get('/behavior', validateQuery(querySchemas.behaviorQuery), async (req, res, next) => {
  try {
    const { period = '30d', action, page,
    } = req.validatedQuery;
    const userId = req.user.id;

    const behavior = await analyticsService.getUserBehavior(userId, {
      period,
      action,
      page,
    });

    res.json({ success: true, data: behavior });
  } catch (error) {
    logger.error('獲取用戶行為分析錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'USER_BEHAVIOR_ERROR', message: error.message || '獲取用戶行為分析失敗',
      },
    });
  }
});

// 獲取轉換漏斗
router.get('/funnel', validateQuery(querySchemas.funnelQuery), async (req, res, next) => {
  try {
    const { steps, period = '30d', groupBy,
    } = req.validatedQuery;
    const userId = req.user.id;

    const funnel = await analyticsService.getConversionFunnel(userId, {
      steps,
      period,
      groupBy,
    });

    res.json({ success: true, data: funnel });
  } catch (error) {
    logger.error('獲取轉換漏斗錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CONVERSION_FUNNEL_ERROR', message: error.message || '獲取轉換漏斗失敗',
      },
    });
  }
});

// 獲取留存分析
router.get('/retention', validateQuery(querySchemas.retentionQuery), async (req, res, next) => {
  try {
    const { period = '30d', cohort, interval = 'day',
    } = req.validatedQuery;
    const userId = req.user.id;

    const retention = await analyticsService.getRetentionAnalysis(userId, {
      period,
      cohort,
      interval,
    });

    res.json({ success: true, data: retention });
  } catch (error) {
    logger.error('獲取留存分析錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'RETENTION_ANALYSIS_ERROR', message: error.message || '獲取留存分析失敗',
      },
    });
  }
});

// 獲取熱門功能排行
router.get('/popular', validateQuery(querySchemas.popularQuery), async (req, res, next) => {
  try {
    const { period = '7d', limit = 10, category,
    } = req.validatedQuery;
    const userId = req.user.id;

    const popular = await analyticsService.getPopularFeatures(userId, {
      period,
      limit,
      category,
    });

    res.json({ success: true, data: popular });
  } catch (error) {
    logger.error('獲取熱門功能排行錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'POPULAR_FEATURES_ERROR', message: error.message || '獲取熱門功能排行失敗',
      },
    });
  }
});

// 獲取系統健康狀態
router.get('/health', async (req, res, next) => {
  try {
    const health = await analyticsService.getSystemHealth();

    res.json({ success: true, data: health,
    });
  } catch (error) {
    logger.error('獲取系統健康狀態錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SYSTEM_HEALTH_ERROR', message: error.message || '獲取系統健康狀態失敗',
      },
    });
  }
});

// 獲取實時監控數據
router.get('/realtime', validateQuery(querySchemas.realtimeQuery), async (req, res, next) => {
  try {
    const { metric, duration = '1h',
    } = req.validatedQuery;
    const userId = req.user.id;

    const realtime = await analyticsService.getRealtimeMetrics(userId, {
      metric,
      duration,
    });

    res.json({ success: true, data: realtime });
  } catch (error) {
    logger.error('獲取實時監控數據錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'REALTIME_METRICS_ERROR', message: error.message || '獲取實時監控數據失敗',
      },
    });
  }
});

// 導出分析報告
router.get('/export', validateQuery(querySchemas.exportAnalyticsQuery), async (req, res, next) => {
  try {
    const { type, period, format = 'json', filters,
    } = req.validatedQuery;
    const userId = req.user.id;

    const report = await analyticsService.exportAnalyticsReport(userId, {
      type,
      period,
      format,
      filters,
    });

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('導出分析報告錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_ANALYTICS_ERROR', message: error.message || '導出分析報告失敗',
      },
    });
  }
});

// 設置分析偏好
router.put('/preferences', validateRequest(schemas.analyticsPreferences), async (req, res, next) => {
  try {
    const { preferences,
    } = req.validatedBody;
    const userId = req.user.id;

    const result = await analyticsService.updateAnalyticsPreferences(userId, preferences);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('更新分析偏好錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_PREFERENCES_ERROR', message: error.message || '更新分析偏好失敗',
      },
    });
  }
});

// 獲取分析偏好
router.get('/preferences', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const preferences = await analyticsService.getAnalyticsPreferences(userId);

    res.json({ success: true, data: preferences,
    });
  } catch (error) {
    logger.error('獲取分析偏好錯誤:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GET_PREFERENCES_ERROR', message: error.message || '獲取分析偏好失敗',
      },
    });
  }
});

module.exports = router;
