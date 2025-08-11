const { execSync } = require('child_process');
const { logger } = require('../utils/logger');

const setupPostgreSQL = async () => {
  try {
    logger.info('🚀 開始設置PostgreSQL數據庫...');

    // 檢查PostgreSQL是否安裝
    try {
      execSync('psql --version', { stdio: 'pipe' });
      logger.info('✅ PostgreSQL已安裝');
    } catch (error) {
      logger.error('❌ PostgreSQL未安裝，請先安裝PostgreSQL');
      process.exit(1);
    }

    // 檢查PostgreSQL服務是否運行
    try {
      execSync('pg_isready -h localhost -p 5432', { stdio: 'pipe' });
      logger.info('✅ PostgreSQL服務正在運行');
    } catch (error) {
      logger.error('❌ PostgreSQL服務未運行，請啟動PostgreSQL服務');
      process.exit(1);
    }

    logger.info('📋 PostgreSQL設置指南:');
    logger.info('');
    logger.info('1. 重置postgres用戶密碼:');
    logger.info('   psql -U postgres -c "ALTER USER postgres PASSWORD \'tcg_assistant_2024\';"');
    logger.info('');
    logger.info('2. 創建數據庫:');
    logger.info('   createdb -U postgres tcg_assistant');
    logger.info('');
    logger.info('3. 或者使用pgAdmin GUI工具:');
    logger.info('   - 連接到PostgreSQL服務器');
    logger.info('   - 創建新數據庫: tcg_assistant');
    logger.info('   - 設置postgres用戶密碼: tcg_assistant_2024');
    logger.info('');
    logger.info('4. 測試連接:');
    logger.info('   psql -U postgres -d tcg_assistant -c "SELECT version();"');
    logger.info('');
    logger.info('5. 完成設置後運行:');
    logger.info('   npm run seed');
    logger.info('');

    // 嘗試創建數據庫
    logger.info('🔍 嘗試創建數據庫...');
    try {
      execSync('createdb -U postgres tcg_assistant', { stdio: 'pipe' });
      logger.info('✅ 數據庫創建成功');
    } catch (error) {
      logger.warn('⚠️  數據庫創建失敗，可能需要手動創建');
      logger.info('💡 請手動執行: createdb -U postgres tcg_assistant');
    }

    logger.info('🎉 PostgreSQL設置指南完成！');
    logger.info('');
    logger.info('📋 下一步操作:');
    logger.info('1. 確保PostgreSQL密碼正確設置');
    logger.info('2. 確保數據庫 tcg_assistant 已創建');
    logger.info('3. 運行 npm run seed 初始化數據');
    logger.info('4. 運行 npm start 啟動服務器');
    logger.info('');
  } catch (error) {
    logger.error('❌ PostgreSQL設置失敗:', error);
    process.exit(1);
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  setupPostgreSQL();
}

module.exports = { setupPostgreSQL };
