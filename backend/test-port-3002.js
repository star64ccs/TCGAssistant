const express = require('express');

console.log('開始創建Express應用程式...');

const app = express();
const PORT = 3002;

console.log('Express應用程式創建成功');

// 基本中間件
app.use(express.json());
console.log('中間件配置完成');

// 健康檢查端點
app.get('/health', (req, res) => {
  console.log('收到健康檢查請求');
  res.json({
    success: true,
    message: '測試服務器運行正常',
    timestamp: new Date().toISOString(),
  });
});

// 測試端點
app.get('/test', (req, res) => {
  console.log('收到測試請求');
  res.json({
    success: true,
    message: '測試端點正常',
    timestamp: new Date().toISOString(),
  });
});

console.log('路由配置完成');

// 錯誤處理
process.on('uncaughtException', (error) => {
  console.error('未捕獲的異常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的Promise拒絕:', reason);
});

// 嘗試啟動服務器
console.log(`嘗試在端口 ${PORT} 啟動服務器...`);

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 服務器成功啟動在端口 ${PORT}`);
    console.log(`健康檢查: http://localhost:${PORT}/health`);
    console.log(`測試端點: http://localhost:${PORT}/test`);
    
    // 檢查服務器狀態
    const address = server.address();
    console.log('服務器地址信息:', address);
  });
  
  server.on('error', (error) => {
    console.error('服務器錯誤:', error);
  });
  
  server.on('listening', () => {
    console.log('服務器開始監聽');
  });
  
} catch (error) {
  console.error('啟動服務器時發生錯誤:', error);
}
