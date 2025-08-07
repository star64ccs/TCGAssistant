const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('../utils/logger');

const setupBackend = async () => {
  try {
    logger.info('🚀 開始設置TCG Assistant後端...');

    // 檢查Node.js版本
    const nodeVersion = process.version;
    logger.info(`Node.js版本: ${nodeVersion}`);

    // 檢查是否已安裝依賴
    if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
      logger.info('📦 安裝依賴包...');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      logger.info('✅ 依賴包已安裝');
    }

    // 檢查環境變數文件
    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../env.example');

    if (!fs.existsSync(envPath)) {
      if (fs.existsSync(envExamplePath)) {
        logger.info('📝 創建環境變數文件...');
        fs.copyFileSync(envExamplePath, envPath);
        logger.info('✅ 環境變數文件已創建，請編輯 .env 文件設置數據庫連接');
      } else {
        logger.error('❌ 找不到 env.example 文件');
        process.exit(1);
      }
    } else {
      logger.info('✅ 環境變數文件已存在');
    }

    // 檢查數據庫連接
    logger.info('🔍 檢查數據庫連接...');
    try {
      require('dotenv').config();
      const { testConnection } = require('../config/database');
      await testConnection();
      logger.info('✅ 數據庫連接成功');
    } catch (error) {
      logger.warn('⚠️  數據庫連接失敗，請檢查配置');
      logger.info('💡 請確保PostgreSQL已啟動並創建了數據庫');
      logger.info('💡 運行以下命令創建數據庫:');
      logger.info('   createdb tcg_assistant');
    }

    // 創建日誌目錄
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      logger.info('📁 創建日誌目錄');
    }

    // 創建上傳目錄
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      logger.info('📁 創建上傳目錄');
    }

    logger.info('🎉 後端設置完成！');
    logger.info('');
    logger.info('📋 下一步操作:');
    logger.info('1. 編輯 .env 文件設置數據庫連接');
    logger.info('2. 運行 npm run seed 初始化數據');
    logger.info('3. 運行 npm run dev 啟動開發服務器');
    logger.info('');
    logger.info('🔗 API文檔: http://localhost:3000/health');
    logger.info('📚 詳細文檔請查看 README.md');

  } catch (error) {
    logger.error('❌ 設置失敗:', error);
    process.exit(1);
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  setupBackend();
}

module.exports = { setupBackend };
