const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

// 根據環境變量選擇數據庫類型
const useSQLite = process.env.USE_SQLITE === 'true' || process.env.SKIP_DB_CONNECTION === 'true';

let sequelize;

if (useSQLite) {
  // 使用SQLite進行開發
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  });
  logger.info('使用SQLite數據庫進行開發');
} else {
  // 使用PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME || 'tcg_assistant',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? false : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    },
  );
}

// 測試數據庫連接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('數據庫連接成功');
  } catch (error) {
    logger.error('數據庫連接失敗:', error);
    if (!useSQLite) {
      logger.info('💡 提示: 如果PostgreSQL連接失敗，可以設置 USE_SQLITE=true 使用SQLite進行開發');
    }
    process.exit(1);
  }
};

// 同步數據庫模型
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info('數據庫同步完成');
  } catch (error) {
    logger.error('數據庫同步失敗:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};
