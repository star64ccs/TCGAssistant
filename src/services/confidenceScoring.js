// 置信度評分和結果驗證機制
export class ConfidenceScoring {
  constructor() {
    this.weights = {      imageQuality: 0.2,      apiConsistency: 0.3,      featureReliability: 0.25,      historicalAccuracy: 0.15,      userFeedback: 0.1,
    };    this.thresholds = {      high: 0.85,      medium: 0.65,      low: 0.45,
    };
  }

  // 計算綜合置信度分數
  calculateOverallConfidence(results, context = {}) {
    try {      const scores = {        imageQuality: this.assessImageQuality(results),        apiConsistency: this.assessApiConsistency(results),        featureReliability: this.assessFeatureReliability(results),        historicalAccuracy: this.assessHistoricalAccuracy(results, context),        userFeedback: this.assessUserFeedback(context),      };        // 計算加權平均      let weightedSum = 0;      let totalWeight = 0;      for (const [category, score] of Object.entries(scores)) {        if (score !== null) {          const weight = this.weights[category];          weightedSum += score * weight;          totalWeight += weight;        }      }      const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;      const confidenceLevel = this.getConfidenceLevel(overallScore);      return {        overallScore: Math.round(overallScore * 100) / 100,        confidenceLevel,        breakdown: scores,        factors: this.identifyKeyFactors(scores),        recommendations: this.generateConfidenceRecommendations(scores, overallScore),        reliability: this.assessReliability(scores),      };
    } catch (error) {      return {        overallScore: 0,        confidenceLevel: 'unknown',        error: error.message,      };
    }
  }

  // 評估圖像質量對置信度的影響
  assessImageQuality(results) {
    if (!results.imageAnalysis && !results.quality) {
      return null;
    }    const quality = results.imageAnalysis?.quality || results.quality;    let score = 0;
    let factors = 0;    // 清晰度
    if (quality.sharpness) {      score += quality.sharpness.score || quality.sharpness;      factors++;
    }    // 噪點水平
    if (quality.noise) {      const noiseScore = 1 - (quality.noise.level || quality.noise);      score += Math.max(0, noiseScore);      factors++;
    }    // 對比度
    if (quality.contrast) {      score += quality.contrast.score || quality.contrast;      factors++;
    }    // 亮度
    if (quality.brightness) {      score += quality.brightness.score || quality.brightness;      factors++;
    }    return factors > 0 ? score / factors : null;
  }

  // 評估 API 一致性
  assessApiConsistency(results) {
    const apiResults = [];    // 收集各 API 的結果
    if (results.recognition) {      apiResults.push({        api: 'recognition',        confidence: results.recognition.confidence || 0,        result: results.recognition.cardInfo?.name || 'unknown',      });
    }    if (results.authenticity) {      apiResults.push({        api: 'authenticity',        confidence: results.authenticity.confidence || 0,        result: results.authenticity.isAuthentic ? 'authentic' : 'fake',      });
    }    if (results.centering) {      apiResults.push({        api: 'centering',        confidence: (results.centering.overallGrade || 0) / 10,        result: results.centering.gradeLevel || 'unknown',      });
    }    if (apiResults.length < 2) {
      return null;
    }    // 計算一致性分數
    const avgConfidence = apiResults.reduce((sum, r) => sum + r.confidence, 0) / apiResults.length;
    const confidenceVariance = this.calculateVariance(apiResults.map(r => r.confidence));    // 低方差 = 高一致性
    const consistencyScore = Math.max(0, 1 - confidenceVariance);    return (avgConfidence + consistencyScore) / 2;
  }

  // 評估特徵可靠性
  assessFeatureReliability(results) {
    if (!results.features && !results.imageAnalysis?.features) {
      return null;
    }    const features = results.features || results.imageAnalysis.features;
    let reliabilityScore = 0;
    let featureCount = 0;    // 邊緣特徵可靠性
    if (features.edges) {      reliabilityScore += features.edges.confidence || 0.5;      featureCount++;
    }    // 紋理特徵可靠性
    if (features.texture) {      reliabilityScore += features.texture.confidence || 0.5;      featureCount++;
    }    // 形狀特徵可靠性
    if (features.shapes) {      reliabilityScore += features.shapes.confidence || 0.5;      featureCount++;
    }    // 關鍵點可靠性
    if (features.keypoints) {      reliabilityScore += features.keypoints.confidence || 0.5;      featureCount++;
    }    // 直方圖可靠性
    if (features.histogram) {      reliabilityScore += features.histogram.confidence || 0.5;      featureCount++;
    }    return featureCount > 0 ? reliabilityScore / featureCount : null;
  }

  // 評估歷史準確性
  assessHistoricalAccuracy(results, context) {
    // 模擬歷史數據分析
    const cardName = results.recognition?.cardInfo?.name || context.cardName;
    if (!cardName) {
      return null;
    }    // 基於卡片類型的歷史準確性
    const cardTypeAccuracy = {      'pokemon': 0.85,      'yugioh': 0.82,      'magic': 0.88,      'onepiece': 0.75,      'sports': 0.9,      'unknown': 0.6,
    };    const cardType = results.recognition?.cardInfo?.type || 'unknown';
    const baseAccuracy = cardTypeAccuracy[cardType] || 0.6;    // 考慮用戶歷史記錄
    const userHistory = context.userHistory || {};
    const historicalSuccess = userHistory.successRate || 0.8;    return (baseAccuracy + historicalSuccess) / 2;
  }

  // 評估用戶反饋
  assessUserFeedback(context) {
    const feedback = context.userFeedback;
    if (!feedback) {
      return null;
    }    // 用戶反饋分數轉換
    const feedbackScore = {      'excellent': 1.0,      'good': 0.8,      'fair': 0.6,      'poor': 0.4,      'terrible': 0.2,
    };    return feedbackScore[feedback] || null;
  }

  // 獲取置信度等級
  getConfidenceLevel(score) {
    if (score >= this.thresholds.high) {
      return 'high';
    }
    if (score >= this.thresholds.medium) {
      return 'medium';
    }
    if (score >= this.thresholds.low) {
      return 'low';
    }
    return 'very_low';
  }

  // 識別關鍵影響因素
  identifyKeyFactors(scores) {
    const factors = [];    for (const [category, score] of Object.entries(scores)) {      if (score === null) {
        continue;
      }      const weight = this.weights[category];      const impact = score * weight;      factors.push({        category,        score,        weight,        impact,        description: this.getFactorDescription(category, score),      });
    }    // 按影響力排序
    factors.sort((a, b) => b.impact - a.impact);    return factors;
  }

  // 獲取因素描述
  getFactorDescription(category, score) {
    const descriptions = {      imageQuality: {        high: '圖像質量優秀，有利於準確分析',        medium: '圖像質量良好，分析結果可靠',        low: '圖像質量一般，可能影響分析準確性',        very_low: '圖像質量較差，建議重新拍攝',      },      apiConsistency: {        high: 'API 結果高度一致，可信度高',        medium: 'API 結果基本一致，結果可靠',        low: 'API 結果存在分歧，需要進一步驗證',        very_low: 'API 結果差異較大，建議重新分析',      },      featureReliability: {        high: '圖像特徵清晰可靠，分析結果可信',        medium: '圖像特徵較為清晰，分析結果較可靠',        low: '圖像特徵不夠清晰，結果存在不確定性',        very_low: '圖像特徵模糊，分析結果不可靠',      },      historicalAccuracy: {        high: '基於歷史數據，該類型卡片識別準確率高',        medium: '歷史數據顯示該類型卡片識別準確率良好',        low: '該類型卡片識別歷史準確率一般',        very_low: '該類型卡片識別歷史準確率較低',      },      userFeedback: {        high: '用戶反饋積極，系統表現良好',        medium: '用戶反饋正面，系統表現可接受',        low: '用戶反饋一般，系統需要改進',        very_low: '用戶反饋較差，系統需要大幅改進',      },
    };    const level = this.getConfidenceLevel(score);
    return descriptions[category]?.[level] || `${category} 評分: ${score}`;
  }

  // 生成置信度建議
  generateConfidenceRecommendations(scores, overallScore) {
    const recommendations = [];    // 整體建議
    if (overallScore >= this.thresholds.high) {      recommendations.push({        type: 'success',        message: '分析結果高度可信，可以安心使用',        priority: 'info',      });
    } else if (overallScore >= this.thresholds.medium) {      recommendations.push({        type: 'info',        message: '分析結果較為可信，建議進行交叉驗證',        priority: 'medium',      });
    } else {      recommendations.push({        type: 'warning',        message: '分析結果置信度較低，建議重新分析或尋求專業意見',        priority: 'high',      });
    }    // 具體建議
    if (scores.imageQuality !== null && scores.imageQuality < this.thresholds.medium) {      recommendations.push({        type: 'improvement',        message: '建議改善圖像質量：確保充足光線，避免模糊和反光',        priority: 'high',      });
    }    if (scores.apiConsistency !== null && scores.apiConsistency < this.thresholds.medium) {      recommendations.push({        type: 'verification',        message: 'API 結果存在分歧，建議使用多個分析方法進行交叉驗證',        priority: 'medium',      });
    }    if (scores.featureReliability !== null && scores.featureReliability < this.thresholds.medium) {      recommendations.push({        type: 'improvement',        message: '圖像特徵不夠清晰，建議調整拍攝角度和距離',        priority: 'medium',      });
    }    return recommendations;
  }

  // 評估可靠性
  assessReliability(scores) {
    let reliableFactors = 0;
    let totalFactors = 0;    for (const [category, score] of Object.entries(scores)) {      if (score !== null) {        totalFactors++;        if (score >= this.thresholds.medium) {          reliableFactors++;        }      }
    }    const reliabilityRatio = totalFactors > 0 ? reliableFactors / totalFactors : 0;    return {      ratio: reliabilityRatio,      reliableFactors,      totalFactors,      level: reliabilityRatio >= 0.8 ? 'high' :        reliabilityRatio >= 0.6 ? 'medium' : 'low',      description: this.getReliabilityDescription(reliabilityRatio),
    };
  }

  // 獲取可靠性描述
  getReliabilityDescription(ratio) {
    if (ratio >= 0.8) {      return '多數指標達到可靠標準，結果高度可信';
    } else if (ratio >= 0.6) {      return '部分指標達到可靠標準，結果較為可信';
    }    return '多數指標未達到可靠標準，結果可信度有限';
  }

  // 計算方差
  calculateVariance(values) {
    if (values.length === 0) {
      return 0;
    }    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  // 跨域驗證
  crossValidate(results1, results2, tolerance = 0.1) {
    const validation = {      isConsistent: true,      differences: [],      overallAgreement: 0,      recommendations: [],
    };      // 比較識別結果
    if (results1.recognition && results2.recognition) {      const conf1 = results1.recognition.confidence || 0;      const conf2 = results2.recognition.confidence || 0;      const confDiff = Math.abs(conf1 - conf2);      if (confDiff > tolerance) {        validation.isConsistent = false;        validation.differences.push({          category: 'recognition_confidence',          difference: confDiff,          values: [conf1, conf2],        });      }
    }    // 比較真實性結果
    if (results1.authenticity && results2.authenticity) {      const auth1 = results1.authenticity.isAuthentic;      const auth2 = results2.authenticity.isAuthentic;      if (auth1 !== auth2) {        validation.isConsistent = false;        validation.differences.push({          category: 'authenticity',          difference: 'boolean_mismatch',          values: [auth1, auth2],        });      }
    }    // 計算整體一致性
    const totalComparisons = validation.differences.length + 1; // 至少有一個比較
    const agreementRatio = (totalComparisons - validation.differences.length) / totalComparisons;
    validation.overallAgreement = agreementRatio;    // 生成建議
    if (!validation.isConsistent) {      validation.recommendations.push({        type: 'warning',        message: '交叉驗證發現結果不一致，建議進行進一步分析',        priority: 'high',      });
    } else {      validation.recommendations.push({        type: 'success',        message: '交叉驗證結果一致，置信度較高',        priority: 'info',      });
    }    return validation;
  }
}

export default new ConfidenceScoring();
