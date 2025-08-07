const express = require('express');
const Joi = require('joi');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const Collection = require('../models/Collection');
const Card = require('../models/Card');
const UserHistory = require('../models/UserHistory');

const router = express.Router();

// 驗證模式
const addToCollectionSchema = Joi.object({
  cardData: Joi.object({
    cardId: Joi.string().required(),
    cardName: Joi.string().required(),
    set: Joi.string().required(),
    number: Joi.string().required(),
    rarity: Joi.string().required(),
    purchaseDate: Joi.date().optional(),
    purchasePrice: Joi.number().positive().optional(),
    isFavorite: Joi.boolean().default(false)
  }).required()
});

const updateCollectionSchema = Joi.object({
  updates: Joi.object({
    purchasePrice: Joi.number().positive().optional(),
    isFavorite: Joi.boolean().optional(),
    condition: Joi.string().valid('mint', 'near_mint', 'excellent', 'good', 'light_played', 'played', 'poor').optional(),
    quantity: Joi.number().integer().positive().optional(),
    notes: Joi.string().optional()
  }).required()
});

// 獲取用戶收藏
router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, search, filterType = 'all' } = req.query;
    const userId = req.userId;

    // 構建查詢條件
    const where = { userId };

    if (search) {
      where['$Card.name$'] = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (filterType === 'favorites') {
      where.isFavorite = true;
    }

    const collections = await Collection.findAndCountAll({
      where,
      include: [{
        model: Card,
        attributes: ['cardId', 'name', 'series', 'cardNumber', 'rarity', 'imageUrl', 'currentPrice']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // 轉換數據格式以匹配前端期望
    const formattedCollections = collections.rows.map(collection => {
      const card = collection.Card;
      const currentPrice = card.currentPrice || 0;
      const purchasePrice = collection.purchasePrice || 0;
      const profitLoss = currentPrice - purchasePrice;
      const profitLossPercentage = purchasePrice > 0 ? (profitLoss / purchasePrice) * 100 : 0;

      return {
        id: collection.id,
        cardId: card.cardId,
        cardName: card.name,
        set: card.series,
        number: card.cardNumber,
        rarity: card.rarity,
        purchaseDate: collection.purchaseDate,
        purchasePrice: purchasePrice,
        currentPrice: currentPrice,
        profitLoss: profitLoss,
        profitLossPercentage: profitLossPercentage,
        isFavorite: collection.isFavorite,
        imageUrl: card.imageUrl
      };
    });

    // 計算總價值
    const totalValue = formattedCollections.reduce((sum, item) => sum + item.currentPrice, 0);
    const totalPurchaseValue = formattedCollections.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalProfitLoss = totalValue - totalPurchaseValue;

    res.json({
      success: true,
      collection: formattedCollections,
      totalValue: totalValue,
      totalCards: collections.count,
      totalPurchaseValue: totalPurchaseValue,
      totalProfitLoss: totalProfitLoss
    });

  } catch (error) {
    next(error);
  }
});

// 添加到收藏
router.post('/add', async (req, res, next) => {
  try {
    const userId = req.userId;

    // 驗證請求數據
    const { error, value } = addToCollectionSchema.validate(req.body);
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

    const { cardData } = value;

    // 查找卡牌
    const card = await Card.findOne({
      where: { cardId: cardData.cardId }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CARD_NOT_FOUND',
          message: '卡牌不存在'
        }
      });
    }

    // 檢查是否已存在於收藏中
    const existingCollection = await Collection.findOne({
      where: { userId, cardId: card.id }
    });

    if (existingCollection) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CARD_ALREADY_IN_COLLECTION',
          message: '卡牌已在收藏中'
        }
      });
    }

    // 添加到收藏
    const collection = await Collection.create({
      userId,
      cardId: card.id,
      purchaseDate: cardData.purchaseDate || new Date(),
      purchasePrice: cardData.purchasePrice,
      isFavorite: cardData.isFavorite || false
    });

    // 記錄歷史
    await UserHistory.create({
      userId,
      cardId: card.id,
      actionType: 'collection_add',
      actionData: { cardName: cardData.cardName },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`用戶 ${userId} 添加卡牌到收藏: ${cardData.cardName}`);

    res.status(201).json({
      success: true,
      message: '卡牌已成功添加到收藏',
      cardId: collection.id
    });

  } catch (error) {
    next(error);
  }
});

// 從收藏移除
router.delete('/remove', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CARD_ID',
          message: '缺少卡牌ID'
        }
      });
    }

    // 查找收藏記錄
    const collection = await Collection.findOne({
      where: { userId, id: cardId },
      include: [{
        model: Card,
        attributes: ['name']
      }]
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COLLECTION_NOT_FOUND',
          message: '收藏記錄不存在'
        }
      });
    }

    // 記錄歷史
    await UserHistory.create({
      userId,
      cardId: collection.cardId,
      actionType: 'collection_remove',
      actionData: { cardName: collection.Card.name },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // 刪除收藏記錄
    await collection.destroy();

    logger.info(`用戶 ${userId} 從收藏移除卡牌: ${collection.Card.name}`);

    res.json({
      success: true,
      message: '卡牌已從收藏中移除'
    });

  } catch (error) {
    next(error);
  }
});

// 更新收藏
router.put('/update', async (req, res, next) => {
  try {
    const userId = req.userId;

    // 驗證請求數據
    const { error, value } = updateCollectionSchema.validate(req.body);
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

    const { cardId, updates } = value;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CARD_ID',
          message: '缺少卡牌ID'
        }
      });
    }

    // 查找收藏記錄
    const collection = await Collection.findOne({
      where: { userId, id: cardId }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COLLECTION_NOT_FOUND',
          message: '收藏記錄不存在'
        }
      });
    }

    // 更新收藏記錄
    await collection.update(updates);

    logger.info(`用戶 ${userId} 更新收藏記錄: ${cardId}`);

    res.json({
      success: true,
      message: '收藏已更新'
    });

  } catch (error) {
    next(error);
  }
});

// 收藏統計
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.userId;

    const collections = await Collection.findAll({
      where: { userId },
      include: [{
        model: Card,
        attributes: ['name', 'currentPrice']
      }]
    });

    const totalCards = collections.length;
    const totalValue = collections.reduce((sum, collection) => {
      return sum + (collection.Card.currentPrice || 0);
    }, 0);
    const averageValue = totalCards > 0 ? totalValue / totalCards : 0;

    // 找出最有價值的卡牌
    let mostValuable = null;
    let maxValue = 0;
    collections.forEach(collection => {
      const price = collection.Card.currentPrice || 0;
      if (price > maxValue) {
        maxValue = price;
        mostValuable = collection.Card.name;
      }
    });

    // 計算最近添加的數量（30天內）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAdditions = collections.filter(collection => 
      collection.createdAt > thirtyDaysAgo
    ).length;

    res.json({
      success: true,
      stats: {
        totalCards,
        totalValue,
        averageValue,
        mostValuable,
        recentAdditions
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
