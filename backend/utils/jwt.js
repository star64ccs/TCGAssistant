const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// 生成訪問令牌
const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    logger.error('生成訪問令牌失敗:', error);
    throw new Error('令牌生成失敗');
  }
};

// 生成刷新令牌
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  } catch (error) {
    logger.error('生成刷新令牌失敗:', error);
    throw new Error('刷新令牌生成失敗');
  }
};

// 驗證令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('令牌已過期');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('無效的令牌');
    } else {
      logger.error('令牌驗證失敗:', error);
      throw new Error('令牌驗證失敗');
    }
  }
};

// 解碼令牌（不驗證）
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('令牌解碼失敗:', error);
    throw new Error('令牌解碼失敗');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
