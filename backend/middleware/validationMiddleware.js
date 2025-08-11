const Joi = require('joi');
const { logger } = require('../utils/logger');

// 通用驗證函數
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value,
    } = schema.validate(req.body);

    if (error) {
      logger.warn(`請求驗證失敗: ${error.details[0].message }`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details,
        },
      });
    }

    req.validatedData = value;
    next();
  };
};

// 查詢參數驗證
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value,
    } = schema.validate(req.query);

    if (error) {
      logger.warn(`查詢參數驗證失敗: ${error.details[0].message }`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'QUERY_VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details,
        },
      });
    }

    req.validatedQuery = value;
    next();
  };
};

// 路徑參數驗證
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value,
    } = schema.validate(req.params);

    if (error) {
      logger.warn(`路徑參數驗證失敗: ${error.details[0].message }`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'PARAMS_VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details,
        },
      });
    }

    req.validatedParams = value;
    next();
  };
};

// 預定義的驗證模式
const schemas = {
  // 價格預測相關
  pricePrediction: Joi.object({
    cardIds: Joi.array().items(Joi.string().required()).min(1).max(50).required(),
    timeframe: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
  }),

  // 真偽檢查相關
  authenticityCheck: Joi.object({
    cardId: Joi.string().required(),
    cardType: Joi.string().valid('pokemon', 'yugioh', 'magic', 'onepiece').default('pokemon'),
    analysisType: Joi.string().valid('basic', 'comprehensive', 'detailed').default('comprehensive'),
  }),

  // AI聊天相關
  aiChat: Joi.object({
    message: Joi.string().min(1).max(1000).required(),
    userId: Joi.string().required(),
    context: Joi.array().items(Joi.object()).default([]),
    chatType: Joi.string().valid('general', 'price', 'authenticity', 'investment').default('general'),
  }),

  // 智能建議相關
  suggestions: Joi.object({
    userId: Joi.string().required(),
    context: Joi.object().optional(),
    userBehavior: Joi.object().optional(),
  }),

  // 反饋相關
  feedback: Joi.object({
    type: Joi.string().valid('bug', 'feature_request', 'general', 'complaint', 'suggestion').required(),
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(1).max(2000).required(),
    rating: Joi.number().min(1).max(5).optional(),
    category: Joi.string().valid('technical', 'enhancement', 'feedback', 'security', 'other').default('general'),
    attachments: Joi.array().items(Joi.string()).max(5).default([]),
  }),

  // 更新反饋
  updateFeedback: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().min(1).max(2000).optional(),
    rating: Joi.number().min(1).max(5).optional(),
    status: Joi.string().valid('pending', 'in_progress', 'replied', 'resolved', 'closed').optional(),
  }),

  // 反饋回覆
  feedbackReply: Joi.object({
    message: Joi.string().min(1).max(1000).required(),
    isInternal: Joi.boolean().default(false),
  }),

  // 批量反饋操作
  batchFeedbackAction: Joi.object({
    feedbackIds: Joi.array().items(Joi.string()).min(1).max(50).required(),
    action: Joi.string().valid('delete', 'update_status', 'add_reply').required(),
    data: Joi.object().optional(),
  }),

  // 通知相關
  sendNotification: Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('system', 'price', 'security', 'marketing', 'update').required(),
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(500).required(),
    data: Joi.object().optional(),
    priority: Joi.string().valid('high', 'normal', 'low').default('normal'),
  }),

  // 批量標記通知已讀
  batchReadNotifications: Joi.object({ notificationIds: Joi.array().items(Joi.string()).min(1).max(50).required() }),

  // 通知設置
  notificationSettings: Joi.object({
    settings: Joi.object({
      pushEnabled: Joi.boolean().optional(),
      emailEnabled: Joi.boolean().optional(),
      inAppEnabled: Joi.boolean().optional(),
      types: Joi.object().optional(),
      quietHours: Joi.object().optional(),
    }).required(),
  }),

  // 推送訂閱
  pushSubscription: Joi.object({
    endpoint: Joi.string().uri().required(),
    keys: Joi.object({
      p256dh: Joi.string().required(),
      auth: Joi.string().required(),
    }).required(),
  }),

  // 備份相關
  createBackup: Joi.object({
    type: Joi.string().valid('full', 'partial', 'incremental').default('full'),
    description: Joi.string().max(500).optional(),
    includeSettings: Joi.boolean().default(true),
    includeHistory: Joi.boolean().default(true),
    includeCollection: Joi.boolean().default(true),
  }),

  // 恢復備份
  restoreBackup: Joi.object({
    options: Joi.object({
      overwrite: Joi.boolean().default(false),
      merge: Joi.boolean().default(true),
    }).optional(),
    conflictResolution: Joi.string().valid('skip', 'overwrite', 'rename').default('skip'),
  }),

  // 上傳備份
  uploadBackup: Joi.object({
    backupData: Joi.string().required(),
    description: Joi.string().max(500).optional(),
    type: Joi.string().valid('full', 'partial').default('full'),
  }),

  // 自動備份設置
  autoBackupSettings: Joi.object({
    enabled: Joi.boolean().required(),
    frequency: Joi.string().valid('daily', 'weekly', 'monthly').default('weekly'),
    retention: Joi.number().integer().min(1).max(365).default(30),
    includeSettings: Joi.boolean().default(true),
    includeHistory: Joi.boolean().default(true),
    includeCollection: Joi.boolean().default(true),
  }),

  // 批量備份操作
  batchBackupAction: Joi.object({
    backupIds: Joi.array().items(Joi.string()).min(1).max(20).required(),
    action: Joi.string().valid('delete', 'download', 'verify').required(),
    data: Joi.object().optional(),
  }),

  // 文件管理相關
  updateFile: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().max(100).optional(),
    tags: Joi.array().items(Joi.string()).max(20).optional(),
  }),

  // 圖片處理
  imageProcessing: Joi.object({
    operations: Joi.array().items(Joi.object({
      type: Joi.string().valid('resize', 'crop', 'rotate', 'filter', 'compress').required(),
      params: Joi.object().optional(),
    })).min(1).max(10).required(),
  }),

  // 批量文件操作
  batchFileAction: Joi.object({
    fileIds: Joi.array().items(Joi.string()).min(1).max(50).required(),
    action: Joi.string().valid('delete', 'move', 'copy', 'download').required(),
    data: Joi.object().optional(),
  }),

  // 創建文件夾
  createFolder: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    parentId: Joi.string().optional(),
    description: Joi.string().max(500).optional(),
  }),

  // 移動文件
  moveFile: Joi.object({ targetFolderId: Joi.string().required() }),

  // 複製文件
  copyFile: Joi.object({
    targetFolderId: Joi.string().required(),
    newName: Joi.string().min(1).max(255).optional(),
  }),

  // 分析相關
  trackEvent: Joi.object({
    event: Joi.string().min(1).max(100).required(),
    category: Joi.string().max(50).optional(),
    action: Joi.string().max(50).optional(),
    label: Joi.string().max(100).optional(),
    value: Joi.number().optional(),
    properties: Joi.object().optional(),
  }),

  // 分析偏好
  analyticsPreferences: Joi.object({
    preferences: Joi.object({
      trackingEnabled: Joi.boolean().optional(),
      dataRetention: Joi.number().integer().min(1).max(365).optional(),
      exportFormat: Joi.string().valid('json', 'csv', 'excel').optional(),
      privacyLevel: Joi.string().valid('minimal', 'standard', 'detailed').optional(),
    }).required(),
  }),

  // 分頁查詢
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),

  // 用戶ID驗證
  userId: Joi.object({ userId: Joi.string().required() }),

  // 卡片ID驗證
  cardId: Joi.object({ cardId: Joi.string().required() }),
};

// 查詢模式
const querySchemas = {
  // 知識庫查詢
  knowledgeQuery: Joi.object({
    query: Joi.string().optional(),
    category: Joi.string().valid('all', 'authenticity', 'price', 'investment', 'maintenance').default('all'),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),

  // 歷史查詢
  historyQuery: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    timeframe: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
  }),

  // 價格預測查詢
  priceQuery: Joi.object({
    timeframe: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
    confidence: Joi.number().min(0.1).max(1.0).default(0.8),
    days: Joi.number().integer().min(1).max(365).default(30),
    category: Joi.string().valid('all', 'pokemon', 'yugioh', 'magic').default('all'),
  }),

  // 通知查詢
  notificationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: Joi.string().valid('system', 'price', 'security', 'marketing', 'update').optional(),
    isRead: Joi.string().valid('true', 'false').optional(),
  }),

  // 反饋查詢
  feedbackQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: Joi.string().valid('bug', 'feature_request', 'general', 'complaint', 'suggestion').optional(),
    status: Joi.string().valid('pending', 'in_progress', 'replied', 'resolved', 'closed').optional(),
    category: Joi.string().valid('technical', 'enhancement', 'feedback', 'security', 'other').optional(),
  }),

  // 評分趨勢查詢
  ratingTrendQuery: Joi.object({ period: Joi.string().valid('7d', '30d', '90d').default('30d') }),

  // 導出查詢
  exportQuery: Joi.object({
    format: Joi.string().valid('json', 'csv', 'excel').default('json'),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    type: Joi.string().optional(),
    category: Joi.string().optional(),
  }),

  // 備份查詢
  backupQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    type: Joi.string().valid('full', 'partial', 'incremental').optional(),
    status: Joi.string().valid('completed', 'failed', 'in_progress').optional(),
  }),

  // 文件查詢
  fileQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string().optional(),
    type: Joi.string().optional(),
    search: Joi.string().optional(),
    sortBy: Joi.string().valid('name', 'size', 'createdAt', 'updatedAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // 文件搜索查詢
  fileSearchQuery: Joi.object({
    query: Joi.string().min(1).max(200).required(),
    type: Joi.string().optional(),
    category: Joi.string().optional(),
    dateRange: Joi.object({
      start: Joi.date().optional(),
      end: Joi.date().optional(),
    }).optional(),
    sizeRange: Joi.object({
      min: Joi.number().optional(),
      max: Joi.number().optional(),
    }).optional(),
  }),

  // 使用統計查詢
  usageQuery: Joi.object({
    period: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
    feature: Joi.string().optional(),
    groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
  }),

  // 趨勢查詢
  trendsQuery: Joi.object({
    period: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
    feature: Joi.string().optional(),
    interval: Joi.string().valid('hour', 'day', 'week', 'month').default('day'),
  }),

  // 性能查詢
  performanceQuery: Joi.object({
    period: Joi.string().valid('1h', '24h', '7d', '30d').default('7d'),
    metric: Joi.string().valid('response_time', 'error_rate', 'throughput').optional(),
    endpoint: Joi.string().optional(),
  }),

  // 錯誤查詢
  errorsQuery: Joi.object({
    period: Joi.string().valid('1h', '24h', '7d', '30d').default('7d'),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    type: Joi.string().optional(),
  }),

  // 行為查詢
  behaviorQuery: Joi.object({
    period: Joi.string().valid('7d', '30d', '90d').default('30d'),
    action: Joi.string().optional(),
    page: Joi.string().optional(),
  }),

  // 漏斗查詢
  funnelQuery: Joi.object({
    steps: Joi.array().items(Joi.string()).min(2).max(10).required(),
    period: Joi.string().valid('7d', '30d', '90d').default('30d'),
    groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
  }),

  // 留存查詢
  retentionQuery: Joi.object({
    period: Joi.string().valid('7d', '30d', '90d').default('30d'),
    cohort: Joi.string().valid('day', 'week', 'month').default('week'),
    interval: Joi.string().valid('day', 'week', 'month').default('day'),
  }),

  // 熱門查詢
  popularQuery: Joi.object({
    period: Joi.string().valid('1d', '7d', '30d').default('7d'),
    limit: Joi.number().integer().min(1).max(50).default(10),
    category: Joi.string().optional(),
  }),

  // 實時查詢
  realtimeQuery: Joi.object({
    metric: Joi.string().valid('users', 'requests', 'errors').optional(),
    duration: Joi.string().valid('1h', '6h', '24h').default('1h'),
  }),

  // 分析報告導出查詢
  exportAnalyticsQuery: Joi.object({
    type: Joi.string().valid('usage', 'performance', 'behavior', 'errors').required(),
    period: Joi.string().valid('7d', '30d', '90d').default('30d'),
    format: Joi.string().valid('json', 'csv', 'excel').default('json'),
    filters: Joi.object().optional(),
  }),
};

// 路徑參數模式
const paramSchemas = {
  // 用戶ID路徑參數
  userIdParam: Joi.object({
    userId: Joi.string().required(),
  }),

  // 卡片ID路徑參數
  cardIdParam: Joi.object({ cardId: Joi.string().required() }),

  // 通知ID路徑參數
  notificationIdParam: Joi.object({ notificationId: Joi.string().required() }),

  // 反饋ID路徑參數
  feedbackIdParam: Joi.object({ feedbackId: Joi.string().required() }),

  // 備份ID路徑參數
  backupIdParam: Joi.object({ backupId: Joi.string().required() }),

  // 文件ID路徑參數
  fileIdParam: Joi.object({ fileId: Joi.string().required() }),
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  schemas,
  querySchemas,
  paramSchemas,
};
