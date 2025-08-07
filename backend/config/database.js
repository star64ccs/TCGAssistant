const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tcg_assistant',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// 測試數據庫連接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('數據庫連接成功');
  } catch (error) {
    logger.error('數據庫連接失敗:', error);
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
  syncDatabase
};
