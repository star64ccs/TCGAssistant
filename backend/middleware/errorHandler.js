const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('API錯誤:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Sequelize錯誤處理
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '數據驗證失敗',
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      },
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: '數據已存在',
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      },
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_ERROR',
        message: '關聯數據不存在',
      },
    });
  }

  // JWT錯誤處理
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: '令牌已過期',
      },
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '無效的令牌',
      },
    });
  }

  // 自定義錯誤處理
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code || 'CUSTOM_ERROR',
        message: err.message,
      },
    });
  }

  // 默認錯誤處理
  const statusCode = err.statusCode || 500;
  const message = err.message || '內部服務器錯誤';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? '內部服務器錯誤' : message,
    },
  });
};

module.exports = { errorHandler };
