const express = require('express');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const UserHistory = require('../models/UserHistory');
const Card = require('../models/Card');

const router = express.Router();

// 獲取最近記錄
router.get('/recent', async (req, res, next) => {
  try {
    const { limit = 5, type } = req.query;
    const userId = req.userId;

    // 構建查詢條件
    const where = { userId };

    if (type) {
      where.actionType = type;
    }

    const histories = await UserHistory.findAll({
      where,
      include: [{
        model: Card,
        attributes: ['cardId', 'name', 'imageUrl', 'currentPrice'],
      }],
      limit: parseInt(limit, 10),
      order: [['createdAt', 'DESC']],
    });

    // 轉換數據格式以匹配前端期望
    const formattedRecords = histories.map(history => {
      const card = history.Card;
      return {
        id: history.id,
        type: history.actionType,
        cardName: card ? card.name : '未知卡牌',
        cardImage: card ? card.imageUrl : null,
        price: card ? card.currentPrice : null,
        rarity: card ? card.rarity : null,
        number: card ? card.cardNumber : null,
        timestamp: history.createdAt,
        confidence: history.confidence,
      };
    });

    res.json({
      success: true,
      records: formattedRecords,
    });
  } catch (error) {
    next(error);
  }
});

// 獲取完整歷史記錄
router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, type, startDate, endDate } = req.query;
    const userId = req.userId;

    // 構建查詢條件
    const where = { userId };

    if (type) {
      where.actionType = type;
    }

    if (startDate || endDate) {
      where.createdAt = { };
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const histories = await UserHistory.findAndCountAll({
      where,
      include: [{
        model: Card,
        attributes: ['cardId', 'name', 'imageUrl', 'currentPrice', 'rarity', 'cardNumber'],
      }],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
    });

    // 轉換數據格式
    const formattedHistories = histories.rows.map(history => {
      const card = history.Card;
      return {
        id: history.id,
        actionType: history.actionType,
        cardName: card ? card.name : '未知卡牌',
        cardImage: card ? card.imageUrl : null,
        price: card ? card.currentPrice : null,
        rarity: card ? card.rarity : null,
        number: card ? card.cardNumber : null,
        timestamp: history.createdAt,
        confidence: history.confidence,
        actionData: history.actionData,
        result: history.result,
      };
    });

    res.json({
      success: true,
      histories: formattedHistories,
      total: histories.count,
      hasMore: histories.count > parseInt(offset, 10) + parseInt(limit, 10),
    });
  } catch (error) {
    next(error);
  }
});

// 獲取統計信息
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { startDate, endDate,
    } = req.query;

    // 構建查詢條件
    const where = { userId };

    if (startDate || endDate) {
      where.createdAt = { };
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // 獲取總記錄數
    const totalRecords = await UserHistory.count({ where });

    // 按類型分組統計
    const typeStats = await UserHistory.findAll({
      where,
      attributes: [
        'actionType',
        [UserHistory.sequelize.fn('COUNT', UserHistory.sequelize.col('id')), 'count'],
      ],
      group: ['actionType'],
    });

    // 轉換統計數據
    const actionTypeStats = {};
    typeStats.forEach(stat => {
      actionTypeStats[stat.actionType] = parseInt(stat.dataValues.count, 10);
    });

    // 獲取最近7天的記錄數
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecords = await UserHistory.count({
      where: {
        ...where,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    // 獲取平均置信度
    const avgConfidence = await UserHistory.findOne({
      where: {
        ...where,
        confidence: {
          [Op.not]: null,
        },
      },
      attributes: [
        [UserHistory.sequelize.fn('AVG', UserHistory.sequelize.col('confidence')), 'avgConfidence'],
      ],
    });

    res.json({
      success: true,
      stats: {
        totalRecords,
        actionTypeStats,
        recentRecords,
        averageConfidence: avgConfidence ? parseFloat(avgConfidence.dataValues.avgConfidence) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 清除歷史記錄
router.delete('/clear', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { days = 30,
    } = req.query;

    // 計算截止日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days, 10));

    // 刪除指定日期之前的記錄
    const deletedCount = await UserHistory.destroy({
      where: {
        userId,
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    logger.info(`用戶 ${ userId } 清除了 ${ deletedCount } 條歷史記錄`);

    res.json({
      success: true,
      message: `已清除 ${deletedCount
      } 條歷史記錄`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
