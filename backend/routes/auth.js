const express = require('express');
const Joi = require('joi');
const { logger } = require('../utils/logger');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const UserHistory = require('../models/UserHistory');

const router = express.Router();

// 驗證模式
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  socialLogin: Joi.boolean().default(false),
  socialData: Joi.object().optional()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// 用戶登入
router.post('/login', async (req, res, next) => {
  try {
    // 驗證請求數據
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '請求數據驗證失敗',
          details: error.details
        }
      });
    }

    const { email, password, socialLogin, socialData } = value;

    // 查找用戶
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '郵箱或密碼錯誤'
        }
      });
    }

    // 檢查用戶是否活躍
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: '帳戶已被停用'
        }
      });
    }

    // 驗證密碼
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '郵箱或密碼錯誤'
        }
      });
    }

    // 更新最後登入時間
    await user.update({ lastLogin: new Date() });

    // 生成令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      membership: user.membership
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 記錄登入歷史
    await UserHistory.create({
      userId: user.id,
      actionType: 'login',
      actionData: { socialLogin, ipAddress: req.ip },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`用戶登入成功: ${user.email}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membership: user.membership
      },
      token: accessToken,
      refreshToken: refreshToken
    });

  } catch (error) {
    next(error);
  }
});

// 用戶註冊
router.post('/register', async (req, res, next) => {
  try {
    // 驗證請求數據
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '請求數據驗證失敗',
          details: error.details
        }
      });
    }

    const { email, password, name } = value;

    // 檢查郵箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: '該郵箱已被註冊'
        }
      });
    }

    // 創建新用戶
    const user = await User.create({
      email,
      password,
      name
    });

    // 生成令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      membership: user.membership
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 記錄註冊歷史
    await UserHistory.create({
      userId: user.id,
      actionType: 'register',
      actionData: { ipAddress: req.ip },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`新用戶註冊成功: ${user.email}`);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membership: user.membership
      },
      token: accessToken,
      refreshToken: refreshToken
    });

  } catch (error) {
    next(error);
  }
});

// 登出
router.post('/logout', async (req, res, next) => {
  try {
    // 這裡可以實現令牌黑名單邏輯
    // 目前只是簡單返回成功
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    next(error);
  }
});

// 刷新令牌
router.post('/refresh', async (req, res, next) => {
  try {
    // 驗證請求數據
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '請求數據驗證失敗',
          details: error.details
        }
      });
    }

    const { refreshToken } = value;

    // 驗證刷新令牌
    const decoded = verifyToken(refreshToken);

    // 檢查用戶是否存在
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '無效的刷新令牌'
        }
      });
    }

    // 生成新的令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      membership: user.membership
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    next(error);
  }
});

// 驗證令牌
router.post('/verify', async (req, res, next) => {
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

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // 檢查用戶是否存在
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '無效的令牌'
        }
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membership: user.membership
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
