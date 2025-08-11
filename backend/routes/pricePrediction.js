const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { validateRequest, validateQuery, validateParams, schemas, querySchemas, paramSchemas } = require('../middleware/validationMiddleware');
const pricePredictionService = require('../services/pricePredictionService');

// 價格預測路由
router.get('/predict/:cardId', validateParams(paramSchemas.cardIdParam), validateQuery(querySchemas.priceQuery), async (req, res, next) => {
  try {
    const { cardId } = req.validatedParams;
    const { timeframe, confidence } = req.validatedQuery;

    const prediction = await pricePredictionService.getPricePrediction(cardId, timeframe, confidence);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    logger.error('價格預測錯誤:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRICE_PREDICTION_ERROR',
        message: error.message || '價格預測服務暫時不可用',
      },
    });
  }
});

// 獲取歷史價格數據
router.get('/history/:cardId', validateParams(paramSchemas.cardIdParam), validateQuery(querySchemas.historyQuery), async (req, res, next) => {
  try {
    const { cardId } = req.validatedParams;
    const { limit: days } = req.validatedQuery;

    const historyData = await pricePredictionService.getPriceHistory(cardId, days);

    res.json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    logger.error('歷史價格查詢錯誤:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_QUERY_ERROR',
        message: error.message || '歷史價格查詢失敗',
      },
    });
  }
});

// 市場趨勢分析
router.get('/trends', validateQuery(querySchemas.priceQuery), async (req, res, next) => {
  try {
    const { category, timeframe } = req.validatedQuery;

    const trends = await pricePredictionService.getMarketTrends(category, timeframe);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error('市場趨勢分析錯誤:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TREND_ANALYSIS_ERROR',
        message: error.message || '市場趨勢分析失敗',
      },
    });
  }
});

// 批量價格預測
router.post('/batch-predict', validateRequest(schemas.pricePrediction), async (req, res, next) => {
  try {
    const { cardIds, timeframe } = req.validatedData;

    const batchResult = await pricePredictionService.batchPricePrediction(cardIds, timeframe);

    res.json({
      success: true,
      data: batchResult,
    });
  } catch (error) {
    logger.error('批量價格預測錯誤:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_PREDICTION_ERROR',
        message: error.message || '批量價格預測失敗',
      },
    });
  }
});

module.exports = router;
