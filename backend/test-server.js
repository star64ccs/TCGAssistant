const express = require('express');
const app = express();
const PORT = 3001;

// 基本中間件
app.use(express.json());

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '測試服務器運行正常',
    timestamp: new Date().toISOString(),
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

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`測試服務器運行在端口 ${PORT}`);
  console.log(`健康檢查: http://localhost:${PORT}/health`);
  console.log(`測試端點: http://localhost:${PORT}/test`);
});

// 錯誤處理
process.on('uncaughtException', (error) => {
  console.error('未捕獲的異常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的Promise拒絕:', reason);
});
