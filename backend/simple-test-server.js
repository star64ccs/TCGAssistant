const express = require('express');

console.log('=== 簡單測試服務器 ===');
console.log('開始創建Express應用程式...');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('Express應用程式創建成功');

// 基本中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 允許跨域請求
app.use((req, res, next) => {
  // 根據環境調整CORS設置
  const allowedOrigins = NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com', 'http://localhost:3000'] 
    : ['*'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

console.log('中間件配置完成');

// 根路徑
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TCG助手後端服務器運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/health',
      test: '/test',
      api: '/api/v1'
    }
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  console.log('收到健康檢查請求');
  res.json({
    success: true,
    message: '服務器運行正常',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    uptime: process.uptime()
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

// API端點
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 端點正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 用戶資料端點（模擬）
app.get('/api/v1/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'user123',
      name: '測試用戶',
      email: 'test@example.com',
      avatar: 'https://via.placeholder.com/150',
      membership: 'free',
      createdAt: new Date().toISOString()
    }
  });
});

// 卡牌資料端點（模擬）
app.get('/api/v1/cardData/pokemon', (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const mockCards = Array.from({ length: parseInt(limit) }, (_, i) => ({
    id: `card_${offset + i}`,
    name: `寶可夢卡片 ${offset + i}`,
    type: 'pokemon',
    rarity: 'rare',
    price: Math.floor(Math.random() * 1000) + 100
  }));
  
  res.json({
    success: true,
    data: mockCards,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: 100
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
    console.log(`📊 API端點: http://localhost:${PORT}/api/v1`);
    
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
