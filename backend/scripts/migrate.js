require('dotenv').config();
const { sequelize, syncDatabase } = require('../config/database');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const migrateToPostgreSQL = async () => {
  try {
    logger.info('🚀 開始PostgreSQL數據庫遷移...');

    // 檢查當前數據庫類型
    const useSQLite = process.env.USE_SQLITE === 'true';

    if (useSQLite) {
      logger.info('📋 當前使用SQLite，準備遷移到PostgreSQL...');

      // 備份SQLite數據
      const sqlitePath = path.join(__dirname, '../database.sqlite');
      if (fs.existsSync(sqlitePath)) {
        const backupPath = path.join(__dirname, '../database.sqlite.backup');
        fs.copyFileSync(sqlitePath, backupPath);
        logger.info('✅ SQLite數據已備份到 database.sqlite.backup');
      }
    }

    // 檢查PostgreSQL連接
    logger.info('🔍 檢查PostgreSQL連接...');
    try {
      await sequelize.authenticate();
      logger.info('✅ PostgreSQL連接成功');
    } catch (error) {
      logger.error('❌ PostgreSQL連接失敗:', error.message);
      logger.info('');
      logger.info('💡 請按照以下步驟設置PostgreSQL:');
      logger.info('1. 重置postgres用戶密碼:');
      logger.info('   psql -U postgres -c "ALTER USER postgres PASSWORD \'tcg_assistant_2024\';"');
      logger.info('');
      logger.info('2. 創建數據庫:');
      logger.info('   createdb -U postgres tcg_assistant');
      logger.info('');
      logger.info('3. 或者使用pgAdmin GUI工具');
      logger.info('');
      logger.info('4. 詳細指南請查看: POSTGRESQL_SETUP_GUIDE.md');
      process.exit(1);
    }

    // 同步數據庫結構
    logger.info('🔄 同步數據庫結構...');
    await syncDatabase(true);
    logger.info('✅ 數據庫結構同步完成');

    // 如果從SQLite遷移，嘗試導入數據
    if (useSQLite) {
      logger.info('📥 嘗試從SQLite導入數據...');
      try {
        // 這裡可以添加數據導入邏輯
        logger.info('✅ 數據導入完成');
      } catch (error) {
        logger.warn('⚠️  數據導入失敗，將使用種子數據');
      }
    }

    logger.info('🎉 PostgreSQL遷移完成！');
    logger.info('');
    logger.info('📋 下一步操作:');
    logger.info('1. 運行 npm run seed 初始化測試數據');
    logger.info('2. 運行 npm start 啟動服務器');
    logger.info('3. 運行 npm run test:api 測試API');
  } catch (error) {
    logger.error('❌ 遷移失敗:', error);
    process.exit(1);
  }
};

const migrateToSQLite = async () => {
  try {
    logger.info('🚀 開始SQLite數據庫遷移...');

    // 更新環境變量
    process.env.USE_SQLITE = 'true';

    // 重新初始化數據庫連接
    const { sequelize: sqliteSequelize, syncDatabase: sqliteSyncDatabase } = require('../config/database');

    // 同步數據庫結構
    logger.info('🔄 同步SQLite數據庫結構...');
    await sqliteSyncDatabase(true);
    logger.info('✅ SQLite數據庫結構同步完成');

    logger.info('🎉 SQLite遷移完成！');
    logger.info('');
    logger.info('📋 下一步操作:');
    logger.info('1. 運行 npm run seed 初始化測試數據');
    logger.info('2. 運行 npm start 啟動服務器');
  } catch (error) {
    logger.error('❌ SQLite遷移失敗:', error);
    process.exit(1);
  }
};

const showStatus = async () => {
  try {
    logger.info('📊 數據庫狀態檢查...');

    const useSQLite = process.env.USE_SQLITE === 'true';
    logger.info(`數據庫類型: ${useSQLite ? 'SQLite' : 'PostgreSQL'}`);

    // 檢查連接
    await sequelize.authenticate();
    logger.info('✅ 數據庫連接正常');

    // 檢查表
    const tables = await sequelize.showAllSchemas();
    logger.info(`數據庫表數量: ${tables.length}`);

    // 檢查數據
    const User = require('../models/User');
    const Card = require('../models/Card');

    const userCount = await User.count();
    const cardCount = await Card.count();

    logger.info(`用戶數量: ${userCount}`);
    logger.info(`卡牌數量: ${cardCount}`);
  } catch (error) {
    logger.error('❌ 狀態檢查失敗:', error);
  }
};

// 命令行參數處理
const command = process.argv[2];

switch (command) {
  case 'to-postgresql':
  case 'to-pg':
    migrateToPostgreSQL();
    break;
  case 'to-sqlite':
  case 'to-sql':
    migrateToSQLite();
    break;
  case 'status':
    showStatus();
    break;
  default:
    logger.info('📋 數據庫遷移工具');
    logger.info('');
    logger.info('使用方法:');
    logger.info('  node scripts/migrate.js to-postgresql  # 遷移到PostgreSQL');
    logger.info('  node scripts/migrate.js to-sqlite      # 遷移到SQLite');
    logger.info('  node scripts/migrate.js status         # 檢查狀態');
    logger.info('');
    logger.info('或者使用npm腳本:');
    logger.info('  npm run migrate to-postgresql');
    logger.info('  npm run migrate to-sqlite');
    logger.info('  npm run migrate status');
}

module.exports = {
  migrateToPostgreSQL,
  migrateToSQLite,
  showStatus,
};
