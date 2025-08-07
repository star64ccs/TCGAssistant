const express = require('express');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const Card = require('../models/Card');

const router = express.Router();

// 獲取Pokemon卡牌
router.get('/pokemon', async (req, res, next) => {
  try {
    const { limit = 1000, offset = 0, series, rarity, search } = req.query;

    // 構建查詢條件
    const where = {
      gameType: 'pokemon'
    };

    if (series) {
      where.series = series;
    }

    if (rarity) {
      where.rarity = rarity;
    }

    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const cards = await Card.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    // 轉換數據格式以匹配前端期望
    const formattedCards = cards.rows.map(card => ({
      id: card.cardId,
      name: card.name,
      series: card.series,
      setCode: card.setCode,
      number: card.cardNumber,
      rarity: card.rarity,
      type: card.cardType,
      hp: card.hp,
      attack: card.attack,
      defense: card.defense,
      description: card.description,
      imageUrl: card.imageUrl,
      thumbnailUrl: card.thumbnailUrl,
      releaseDate: card.releaseDate,
      isPromo: card.isPromo,
      isSecretRare: card.isSecretRare
    }));

    res.json({
      success: true,
      cards: formattedCards,
      total: cards.count,
      hasMore: cards.count > parseInt(offset) + parseInt(limit)
    });

  } catch (error) {
    next(error);
  }
});

// 獲取One Piece卡牌
router.get('/onepiece', async (req, res, next) => {
  try {
    const { limit = 1000, offset = 0, series, rarity, search } = req.query;

    // 構建查詢條件
    const where = {
      gameType: 'onepiece'
    };

    if (series) {
      where.series = series;
    }

    if (rarity) {
      where.rarity = rarity;
    }

    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const cards = await Card.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    // 轉換數據格式以匹配前端期望
    const formattedCards = cards.rows.map(card => ({
      id: card.cardId,
      name: card.name,
      series: card.series,
      setCode: card.setCode,
      number: card.cardNumber,
      rarity: card.rarity,
      type: card.cardType,
      hp: card.hp,
      attack: card.attack,
      defense: card.defense,
      description: card.description,
      imageUrl: card.imageUrl,
      thumbnailUrl: card.thumbnailUrl,
      releaseDate: card.releaseDate,
      isPromo: card.isPromo,
      isSecretRare: card.isSecretRare
    }));

    res.json({
      success: true,
      cards: formattedCards,
      total: cards.count,
      hasMore: cards.count > parseInt(offset) + parseInt(limit)
    });

  } catch (error) {
    next(error);
  }
});

// 獲取可用卡牌
router.get('/available', async (req, res, next) => {
  try {
    const { limit = 100, gameType, search } = req.query;

    // 構建查詢條件
    const where = {};

    if (gameType) {
      where.gameType = gameType;
    }

    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const cards = await Card.findAll({
      where,
      limit: parseInt(limit),
      order: [['name', 'ASC']],
      attributes: ['cardId', 'name', 'gameType', 'series', 'cardNumber', 'rarity', 'imageUrl']
    });

    // 轉換數據格式以匹配前端期望
    const formattedCards = cards.map(card => ({
      id: card.cardId,
      name: card.name,
      gameType: card.gameType,
      series: card.series,
      number: card.cardNumber,
      rarity: card.rarity,
      imageUrl: card.imageUrl
    }));

    res.json({
      success: true,
      cards: formattedCards
    });

  } catch (error) {
    next(error);
  }
});

// 根據ID獲取卡牌詳情
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const card = await Card.findOne({
      where: { cardId: id }
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

    // 轉換數據格式
    const formattedCard = {
      id: card.cardId,
      name: card.name,
      series: card.series,
      setCode: card.setCode,
      number: card.cardNumber,
      rarity: card.rarity,
      type: card.cardType,
      hp: card.hp,
      attack: card.attack,
      defense: card.defense,
      description: card.description,
      imageUrl: card.imageUrl,
      thumbnailUrl: card.thumbnailUrl,
      gameType: card.gameType,
      releaseDate: card.releaseDate,
      isPromo: card.isPromo,
      isSecretRare: card.isSecretRare,
      currentPrice: card.currentPrice,
      priceUpdatedAt: card.priceUpdatedAt
    };

    res.json({
      success: true,
      card: formattedCard
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
