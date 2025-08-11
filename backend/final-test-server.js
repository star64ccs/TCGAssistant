const express = require('express');

console.log('=== TCG助手後端測試服務器 ===');
console.log('開始創建Express應用程式...');

const app = express();
const PORT = 3000;

console.log('Express應用程式創建成功');

// 基本中間件
app.use(express.json());
console.log('中間件配置完成');

// 根路徑
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TCG助手後端服務器運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  console.log('收到健康檢查請求');
  res.json({
    success: true,
    message: '服務器運行正常',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// 測試端點
app.get('/test', (req, res) => {
  console.log('收到測試請求');
  res.json({
    success: true,
    message: '測試端點正常',
    timestamp: new Date().toISOString(),
    data: {
      server: 'TCG Assistant Backend',
      port: PORT,
      environment: 'development'
    }
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
    console.log(`🌐 服務器地址: http://localhost:${PORT}`);
    console.log(`🔍 健康檢查: http://localhost:${PORT}/health`);
    console.log(`🧪 測試端點: http://localhost:${PORT}/test`);
    
    // 檢查服務器狀態
    const address = server.address();
    console.log('📊 服務器地址信息:', address);
    console.log('🚀 服務器已準備就緒！');
  });
  
  server.on('error', (error) => {
    console.error('❌ 服務器錯誤:', error);
  });
  
  server.on('listening', () => {
    console.log('👂 服務器開始監聽');
  });
  
} catch (error) {
  console.error('❌ 啟動服務器時發生錯誤:', error);
}
