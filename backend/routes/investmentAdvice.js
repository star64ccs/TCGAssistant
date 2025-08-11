const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const investmentAdviceService = require('../services/investmentAdviceService');
const { validateRequest } = require('../middleware/validationMiddleware');

// 獲取投資建議
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { investmentAmount, riskLevel, timeHorizon } = req.body;
    const userId = req.user.id;

    // 驗證輸入參數
    if (!investmentAmount || !riskLevel || !timeHorizon) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數',
      });
    }

    // 生成投資建議
    const advice = await investmentAdviceService.generateInvestmentAdvice(
      userId,
      investmentAmount,
      riskLevel,
      timeHorizon,
    );

    res.json({
      success: true,
      data: advice,
    });
  } catch (error) {
    console.error('生成投資建議失敗:', error);
    res.status(500).json({
      success: false,
      message: '生成投資建議失敗',
      error: error.message,
    });
  }
});

// 獲取用戶投資組合分析
router.get('/portfolio/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // 檢查權限
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '無權限訪問此投資組合',
      });
    }

    const portfolio = await investmentAdviceService.getUserInvestmentPortfolio(userId);

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error('獲取投資組合分析失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資組合分析失敗',
      error: error.message,
    });
  }
});

// 獲取市場趨勢
router.get('/market/trends', async (req, res) => {
  try {
    const trends = await investmentAdviceService.getMarketTrends();

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('獲取市場趨勢失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場趨勢失敗',
      error: error.message,
    });
  }
});

// 獲取市場情緒
router.get('/market/sentiment', async (req, res) => {
  try {
    const sentiment = await investmentAdviceService.getMarketSentiment();

    res.json({
      success: true,
      data: sentiment,
    });
  } catch (error) {
    console.error('獲取市場情緒失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場情緒失敗',
      error: error.message,
    });
  }
});

// 獲取熱門卡牌
router.get('/market/trending', async (req, res) => {
  try {
    const trendingCards = await investmentAdviceService.getTrendingCards();

    res.json({
      success: true,
      data: trendingCards,
    });
  } catch (error) {
    console.error('獲取熱門卡牌失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取熱門卡牌失敗',
      error: error.message,
    });
  }
});

// 獲取低估卡牌
router.get('/market/undervalued', async (req, res) => {
  try {
    const undervaluedCards = await investmentAdviceService.getUndervaluedCards();

    res.json({
      success: true,
      data: undervaluedCards,
    });
  } catch (error) {
    console.error('獲取低估卡牌失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取低估卡牌失敗',
      error: error.message,
    });
  }
});

// 獲取新發行卡牌
router.get('/market/new-releases', async (req, res) => {
  try {
    const newReleases = await investmentAdviceService.getNewReleases();

    res.json({
      success: true,
      data: newReleases,
    });
  } catch (error) {
    console.error('獲取新發行卡牌失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取新發行卡牌失敗',
      error: error.message,
    });
  }
});

// 獲取卡牌交易量數據
router.get('/market/volume/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const volumeData = await investmentAdviceService.analyzeVolume(cardId);

    res.json({
      success: true,
      data: volumeData,
    });
  } catch (error) {
    console.error('獲取交易量數據失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取交易量數據失敗',
      error: error.message,
    });
  }
});

// 獲取卡牌市場情緒
router.get('/market/sentiment/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const sentimentData = await investmentAdviceService.analyzeSentiment(cardId);

    res.json({
      success: true,
      data: sentimentData,
    });
  } catch (error) {
    console.error('獲取市場情緒失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場情緒失敗',
      error: error.message,
    });
  }
});

// 獲取卡牌技術指標
router.get('/market/technical/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const technicalData = await investmentAdviceService.analyzeTechnicalIndicators(cardId);

    res.json({
      success: true,
      data: technicalData,
    });
  } catch (error) {
    console.error('獲取技術指標失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取技術指標失敗',
      error: error.message,
    });
  }
});

// 獲取投資建議歷史
router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // 檢查權限
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '無權限訪問此歷史記錄',
      });
    }

    // 這裡可以實現從數據庫獲取歷史建議記錄
    const history = await investmentAdviceService.getInvestmentHistory(userId, page, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('獲取投資建議歷史失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資建議歷史失敗',
      error: error.message,
    });
  }
});

// 保存投資建議
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { advice, portfolioId } = req.body;
    const userId = req.user.id;

    if (!advice) {
      return res.status(400).json({
        success: false,
        message: '缺少投資建議數據',
      });
    }

    // 保存投資建議到數據庫
    const savedAdvice = await investmentAdviceService.saveInvestmentAdvice(userId, advice, portfolioId);

    res.json({
      success: true,
      data: savedAdvice,
    });
  } catch (error) {
    console.error('保存投資建議失敗:', error);
    res.status(500).json({
      success: false,
      message: '保存投資建議失敗',
      error: error.message,
    });
  }
});

// 獲取投資建議統計
router.get('/stats/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // 檢查權限
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '無權限訪問此統計數據',
      });
    }

    const stats = await investmentAdviceService.getInvestmentStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('獲取投資統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資統計失敗',
      error: error.message,
    });
  }
});

// 獲取風險評估報告
router.get('/risk-assessment/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // 檢查權限
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '無權限訪問此風險評估',
      });
    }

    const riskAssessment = await investmentAdviceService.generateRiskAssessment(userId);

    res.json({
      success: true,
      data: riskAssessment,
    });
  } catch (error) {
    console.error('生成風險評估失敗:', error);
    res.status(500).json({
      success: false,
      message: '生成風險評估失敗',
      error: error.message,
    });
  }
});

// 獲取投資組合優化建議
router.post('/optimize-portfolio', authMiddleware, async (req, res) => {
  try {
    const { targetReturn, maxRisk, investmentAmount } = req.body;
    const userId = req.user.id;

    if (!targetReturn || !maxRisk || !investmentAmount) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數',
      });
    }

    const optimization = await investmentAdviceService.optimizePortfolio(
      userId,
      targetReturn,
      maxRisk,
      investmentAmount,
    );

    res.json({
      success: true,
      data: optimization,
    });
  } catch (error) {
    console.error('優化投資組合失敗:', error);
    res.status(500).json({
      success: false,
      message: '優化投資組合失敗',
      error: error.message,
    });
  }
});

// 獲取市場預測
router.get('/market/prediction', async (req, res) => {
  try {
    const { timeframe = '30d', game = 'all' } = req.query;

    const prediction = await investmentAdviceService.getMarketPrediction(timeframe, game);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('獲取市場預測失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場預測失敗',
      error: error.message,
    });
  }
});

// 獲取投資教育內容
router.get('/education', async (req, res) => {
  try {
    const { category = 'all', level = 'beginner' } = req.query;

    const education = await investmentAdviceService.getEducationContent(category, level);

    res.json({
      success: true,
      data: education,
    });
  } catch (error) {
    console.error('獲取教育內容失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取教育內容失敗',
      error: error.message,
    });
  }
});

// 獲取投資工具
router.get('/tools', async (req, res) => {
  try {
    const tools = await investmentAdviceService.getInvestmentTools();

    res.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    console.error('獲取投資工具失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資工具失敗',
      error: error.message,
    });
  }
});

// 健康檢查端點
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '投資建議服務運行正常',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
