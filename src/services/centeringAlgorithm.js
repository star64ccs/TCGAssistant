// 居中評估算法
export class CenteringAlgorithm {
  constructor() {
    this.gradingStandards = {      PSA: {        perfect: { min: 9.5, description: '完美居中' },        excellent: { min: 8.5, description: '優秀居中' },        good: { min: 7.0, description: '良好居中' },        fair: { min: 5.0, description: '一般居中' },        poor: { min: 0, description: '居中不良' },      },      BGS: {        pristine: { min: 9.5, description: '原始狀態' },        mint: { min: 9.0, description: '完美狀態' },        nearMint: { min: 8.0, description: '近完美' },        excellent: { min: 6.0, description: '優秀' },        good: { min: 4.0, description: '良好' },        fair: { min: 0, description: '一般' },      },
    };
  }

  // 主要居中評估方法
  async evaluateCentering(frontImage, backImage, options = {}) {
    try {      const {        gradingStandard = 'PSA',        includeVisualGuides = true,        onProgress = null,      } = options;      onProgress && onProgress('開始居中評估...');      // 1. 圖像預處理      const processedFront = await this.preprocessImage(frontImage, onProgress);      const processedBack = backImage ? await this.preprocessImage(backImage, onProgress) : null;      // 2. 邊緣檢測      const frontEdges = await this.detectEdges(processedFront, onProgress);      const backEdges = processedBack ? await this.detectEdges(processedBack, onProgress) : null;      // 3. 居中計算      const frontCentering = this.calculateCentering(frontEdges, 'front');      const backCentering = backEdges ? this.calculateCentering(backEdges, 'back') : null;      // 4. 綜合評分      const overallGrade = this.calculateOverallGrade(        frontCentering,        backCentering,        gradingStandard,      );        // 5. 生成視覺輔助      const visualGuides = includeVisualGuides        ? this.generateVisualGuides(frontEdges, backEdges)        : null;      onProgress && onProgress('生成評估結果...');      return {        success: true,        overallGrade: overallGrade.grade,        gradingStandard,        frontCentering,        backCentering,        analysis: {          horizontalCentering: overallGrade.horizontal,          verticalCentering: overallGrade.vertical,          cornerAnalysis: overallGrade.corners,        },        recommendations: this.generateRecommendations(overallGrade),        visualGuides,        timestamp: new Date().toISOString(),      };
    } catch (error) {      return {        success: false,        error: error.message,        timestamp: new Date().toISOString(),      };
    }
  }

  // 圖像預處理
  async preprocessImage(imageData, onProgress) {
    onProgress && onProgress('預處理圖像...');    // 模擬圖像預處理：灰度化、去噪、增強對比度
    return {      originalData: imageData,      processed: imageData, // 在實際實現中會進行圖像處理      width: 800, // 模擬寬度      height: 1120, // 模擬高度（標準卡片比例）      aspectRatio: 800 / 1120,
    };
  }

  // 邊緣檢測
  async detectEdges(processedImage, onProgress) {
    onProgress && onProgress('檢測卡片邊緣...');    // 模擬邊緣檢測算法（如 Canny 邊緣檢測）
    const { width, height } = processedImage;    // 模擬檢測到的邊緣座標
    const edgeThickness = 2; // 邊框厚度
    const topEdge = edgeThickness + Math.random() * 5;
    const bottomEdge = height - edgeThickness - Math.random() * 5;
    const leftEdge = edgeThickness + Math.random() * 5;
    const rightEdge = width - edgeThickness - Math.random() * 5;    return {      top: topEdge,      bottom: bottomEdge,      left: leftEdge,      right: rightEdge,      width: rightEdge - leftEdge,      height: bottomEdge - topEdge,      confidence: 0.85 + Math.random() * 0.1,
    };
  }

  // 計算居中度
  calculateCentering(edges, side) {
    const { top, bottom, left, right, width: cardWidth, height: cardHeight } = edges;    // 計算邊距
    const topMargin = top;
    const bottomMargin = cardHeight - bottom;
    const leftMargin = left;
    const rightMargin = cardWidth - right;    // 計算居中百分比
    const horizontalCentering = this.calculateCenteringPercentage(leftMargin, rightMargin);
    const verticalCentering = this.calculateCenteringPercentage(topMargin, bottomMargin);    // 計算角落對稱性
    const cornerAnalysis = this.analyzeCorners(edges);    return {      side,      horizontal: {        percentage: horizontalCentering.percentage,        leftMargin,        rightMargin,        difference: horizontalCentering.difference,        score: horizontalCentering.score,      },      vertical: {        percentage: verticalCentering.percentage,        topMargin,        bottomMargin,        difference: verticalCentering.difference,        score: verticalCentering.score,      },      corners: cornerAnalysis,      overallScore: (horizontalCentering.score + verticalCentering.score) / 2,
    };
  }

  // 計算居中百分比
  calculateCenteringPercentage(margin1, margin2) {
    const total = margin1 + margin2;
    if (total === 0) {
      return { percentage: 50, difference: 0, score: 10 };
    }    const smaller = Math.min(margin1, margin2);
    const larger = Math.max(margin1, margin2);
    const percentage = (smaller / total) * 100;
    const difference = larger - smaller;    // 計算評分（基於 PSA 標準）
    let score = 10;
    if (percentage < 40) {
      score = 5;
    } // 嚴重偏移
    else if (percentage < 42.5) {
      score = 6;
    } // 明顯偏移
    else if (percentage < 45) {
      score = 7;
    } // 輕微偏移
    else if (percentage < 47.5) {
      score = 8;
    } // 很好
    else if (percentage < 49) {
      score = 9;
    } // 優秀
    else {
      score = 10;
    } // 完美    return {      percentage: Math.round(percentage * 10) / 10,      difference: Math.round(difference * 10) / 10,      score,
    };
  }

  // 分析角落
  analyzeCorners(edges) {
    const { width, height } = edges;    // 模擬角落分析
    const corners = {      topLeft: { x: edges.left, y: edges.top },      topRight: { x: edges.right, y: edges.top },      bottomLeft: { x: edges.left, y: edges.bottom },      bottomRight: { x: edges.right, y: edges.bottom },
    };      // 計算角落對稱性
    const horizontalSymmetry = this.calculateSymmetry(      corners.topLeft.x,      width - corners.topRight.x,
    );    const verticalSymmetry = this.calculateSymmetry(      corners.topLeft.y,      height - corners.bottomLeft.y,
    );    return {      corners,      horizontalSymmetry,      verticalSymmetry,      overallSymmetry: (horizontalSymmetry + verticalSymmetry) / 2,
    };
  }

  // 計算對稱性
  calculateSymmetry(value1, value2) {
    const total = value1 + value2;
    if (total === 0) {
      return 100;
    }    const smaller = Math.min(value1, value2);
    return (smaller / total) * 200; // 轉換為百分比
  }

  // 計算綜合評分
  calculateOverallGrade(frontCentering, backCentering, gradingStandard) {
    const standards = this.gradingStandards[gradingStandard];    // 計算前面居中評分
    const frontHorizontal = frontCentering.horizontal.score;
    const frontVertical = frontCentering.vertical.score;    // 計算背面居中評分（如果有）
    let backHorizontal = frontHorizontal;
    let backVertical = frontVertical;    if (backCentering) {      backHorizontal = backCentering.horizontal.score;      backVertical = backCentering.vertical.score;
    }    // 取最低分（嚴格評分）
    const horizontalScore = Math.min(frontHorizontal, backHorizontal);
    const verticalScore = Math.min(frontVertical, backVertical);
    const overallScore = Math.min(horizontalScore, verticalScore);    // 轉換為等級
    const grade = this.scoreToGrade(overallScore, standards);    return {      grade: overallScore,      gradeLevel: grade.level,      description: grade.description,      horizontal: horizontalScore,      vertical: verticalScore,      corners: {        front: frontCentering.corners.overallSymmetry,        back: backCentering?.corners.overallSymmetry || frontCentering.corners.overallSymmetry,      },
    };
  }

  // 分數轉等級
  scoreToGrade(score, standards) {
    for (const [level, criteria] of Object.entries(standards)) {      if (score >= criteria.min) {        return {          level,          description: criteria.description,          min: criteria.min,        };      }
    }
    return {      level: 'poor',      description: '居中不良',      min: 0,
    };
  }

  // 生成建議
  generateRecommendations(overallGrade) {
    const recommendations = [];
    const score = overallGrade.grade;    if (score >= 9.5) {      recommendations.push({        type: 'positive',        message: '卡片居中度完美',        action: '適合高等級評級',      });
    } else if (score >= 8.5) {      recommendations.push({        type: 'positive',        message: '卡片居中度優秀',        action: '可考慮專業評級',      });
    } else if (score >= 7.0) {      recommendations.push({        type: 'info',        message: '卡片居中度良好',        action: '中等評級預期',      });
    } else if (score >= 5.0) {      recommendations.push({        type: 'warning',        message: '卡片居中度一般',        action: '評級可能受影響',      });
    } else {      recommendations.push({        type: 'danger',        message: '卡片居中度不佳',        action: '不建議送評',      });
    }    // 具體建議
    if (overallGrade.horizontal < overallGrade.vertical) {      recommendations.push({        type: 'info',        message: '水平居中需要改善',        action: '注意左右邊距',      });
    }    if (overallGrade.vertical < overallGrade.horizontal) {      recommendations.push({        type: 'info',        message: '垂直居中需要改善',        action: '注意上下邊距',      });
    }    return recommendations;
  }

  // 生成視覺輔助線
  generateVisualGuides(frontEdges, backEdges) {
    const guides = {      front: this.createGuideLines(frontEdges),      back: backEdges ? this.createGuideLines(backEdges) : null,
    };    return guides;
  }

  // 創建輔助線
  createGuideLines(edges) {
    const { width, height, left, right, top, bottom } = edges;    // 中心線
    const centerX = width / 2;
    const centerY = height / 2;    // 卡片中心
    const cardCenterX = (left + right) / 2;
    const cardCenterY = (top + bottom) / 2;    return {      centerLines: {        vertical: { x: centerX, y1: 0, y2: height },        horizontal: { x1: 0, x2: width, y: centerY },      },      cardCenter: {        x: cardCenterX,        y: cardCenterY,      },      offset: {        x: cardCenterX - centerX,        y: cardCenterY - centerY,      },      margins: {        top: top,        bottom: height - bottom,        left: left,        right: width - right,      },
    };
  }

  // 獲取評級建議
  getGradingAdvice(grade, gradingStandard) {
    const standards = this.gradingStandards[gradingStandard];
    const gradeInfo = this.scoreToGrade(grade, standards);    return {      expectedGrade: gradeInfo.level,      description: gradeInfo.description,      tips: this.getImprovementTips(grade),      nextLevel: this.getNextLevelRequirements(grade, standards),
    };
  }

  // 獲取改善建議
  getImprovementTips(grade) {
    const tips = [];    if (grade < 9.5) {      tips.push('確保卡片在保護套中完全平整');      tips.push('避免卡片在存儲過程中移動');
    }    if (grade < 8.5) {      tips.push('檢查卡片切割質量');      tips.push('考慮卡片的印刷批次差異');
    }    if (grade < 7.0) {      tips.push('居中度問題可能源於印刷過程');      tips.push('建議尋找居中度更好的同款卡片');
    }    return tips;
  }

  // 獲取下一等級要求
  getNextLevelRequirements(currentGrade, standards) {
    const sortedStandards = Object.entries(standards)      .sort(([,a], [,b]) => b.min - a.min);    for (const [level, criteria] of sortedStandards) {      if (currentGrade < criteria.min) {        return {          level,          requiredGrade: criteria.min,          improvement: criteria.min - currentGrade,          description: criteria.description,        };      }
    }    return null; // 已經是最高等級
  }
}

export default new CenteringAlgorithm();
