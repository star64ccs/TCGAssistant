const { verifyToken } = require('../utils/jwt');
const { logger } = require('../utils/logger');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: '需要認證令牌'
        }
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前綴
    const decoded = verifyToken(token);

    // 檢查用戶是否存在且活躍
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '用戶不存在或已被停用'
        }
      });
    }

    // 將用戶信息添加到請求對象
    req.user = user;
    req.userId = user.id;
    
    // 添加用戶ID到響應頭
    res.set('X-User-ID', user.id);
    res.set('X-Membership-Type', user.membership);

    next();
  } catch (error) {
    logger.error('認證中間件錯誤:', error);
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: error.message || '認證失敗'
      }
    });
  }
};

// 可選認證中間件（不強制要求認證）
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      const user = await User.findByPk(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
        res.set('X-User-ID', user.id);
        res.set('X-Membership-Type', user.membership);
      }
    }
    
    next();
  } catch (error) {
    // 可選認證失敗不阻斷請求
    logger.warn('可選認證失敗:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
