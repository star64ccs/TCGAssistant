const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { authMiddleware } = require('./middleware/authMiddleware');

// 路由導入
const authRoutes = require('./routes/auth');
const cardDataRoutes = require('./routes/cardData');
const collectionRoutes = require('./routes/collection');
const userHistoryRoutes = require('./routes/userHistory');
const pricePredictionRoutes = require('./routes/pricePrediction');
const authenticityCheckRoutes = require('./routes/authenticityCheck');
const aiChatRoutes = require('./routes/aiChat');

// 低優先級功能路由
const notificationRoutes = require('./routes/notification');
const feedbackRoutes = require('./routes/feedback');
const backupRoutes = require('./routes/backup');
const analyticsRoutes = require('./routes/analytics');
const fileManagerRoutes = require('./routes/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中間件
app.use(helmet());
app.use(compression());

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // 允許所有來源，用於測試
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Membership-Type'],
}));

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15分鐘
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // 限制每個IP 100次請求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '請求頻率過高，請稍後再試',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// 日誌中間件
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 解析JSON請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TCG Assistant API 運行正常',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// 測試端點
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '測試端點正常',
    timestamp: new Date().toISOString(),
  });
});

// API路由
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${ apiVersion }/auth`, authRoutes);
app.use(`/api/${ apiVersion }/cardData`, cardDataRoutes);
app.use(`/api/${ apiVersion }/collection`, authMiddleware, collectionRoutes);
app.use(`/api/${ apiVersion }/userHistory`, authMiddleware, userHistoryRoutes);
app.use(`/api/${ apiVersion }/pricePrediction`, authMiddleware, pricePredictionRoutes);
app.use(`/api/${ apiVersion }/authenticityCheck`, authMiddleware, authenticityCheckRoutes);
app.use(`/api/${ apiVersion }/aiChat`, authMiddleware, aiChatRoutes);

// 低優先級功能路由
app.use(`/api/${ apiVersion }/notification`, authMiddleware, notificationRoutes);
app.use(`/api/${ apiVersion }/feedback`, authMiddleware, feedbackRoutes);
app.use(`/api/${ apiVersion }/backup`, authMiddleware, backupRoutes);
app.use(`/api/${ apiVersion }/analytics`, authMiddleware, analyticsRoutes);
app.use(`/api/${ apiVersion }/fileManager`, authMiddleware, fileManagerRoutes);

// 404處理
app.use(notFoundHandler);

// 錯誤處理
app.use(errorHandler);

// 啟動服務器
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    logger.error('服務器啟動失敗:', err);
    process.exit(1);
  }

  logger.info(`TCG Assistant API 服務器運行在端口 ${ PORT }`);
  logger.info(`環境: ${ process.env.NODE_ENV || 'development' }`);
  logger.info(`API版本: ${ apiVersion }`);
  logger.info(`服務器地址: http://localhost:${ PORT }`);
});

// 處理服務器錯誤
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${ PORT}` : `Port ${ PORT}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind } 需要提升權限`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind } 已被佔用`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// 優雅關閉
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信號，正在關閉服務器...');
  server.close(() => {
    logger.info('服務器已關閉');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信號，正在關閉服務器...');
  server.close(() => {
    logger.info('服務器已關閉');
    process.exit(0);
  });
});

module.exports = app;
