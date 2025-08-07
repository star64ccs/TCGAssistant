import apiIntegrationManager from './apiIntegrationManager';
import imageUtils from '../utils/imageUtils';

// 分析服務
class AnalysisService {
  // 居中度評估
  async evaluateCentering(imageFile, options = {}) {
    try {
      // 圖片預處理
      const processedImage = await imageUtils.compressImage(imageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });

      // 驗證圖片
      const validation = await imageUtils.validateImage(processedImage);
      if (!validation.valid) {
        throw new Error(`圖片驗證失敗: ${validation.errors.join(', ')}`);
      }

      // 調用API整合管理器
      const result = await apiIntegrationManager.callApi(
        'centeringAnalysis',
        'evaluate',
        { imageFile: processedImage, ...options },
        { onProgress: options.onProgress }
      );

      return result;
    } catch (error) {
      console.error('居中度評估失敗:', error);
      throw error;
    }
  }

  // 真偽鑑定
  async checkAuthenticity(imageFile, options = {}) {
    try {
      // 圖片預處理
      const processedImage = await imageUtils.compressImage(imageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });

      // 驗證圖片
      const validation = await imageUtils.validateImage(processedImage);
      if (!validation.valid) {
        throw new Error(`圖片驗證失敗: ${validation.errors.join(', ')}`);
      }

      // 調用API整合管理器
      const result = await apiIntegrationManager.callApi(
        'authenticityAnalysis',
        'check',
        { imageFile: processedImage, ...options },
        { onProgress: options.onProgress }
      );

      return result;
    } catch (error) {
      console.error('真偽鑑定失敗:', error);
      throw error;
    }
  }

  // 品質評估
  async evaluateQuality(imageFile, options = {}) {
    try {
      // 圖片預處理
      const processedImage = await imageUtils.compressImage(imageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });

      // 驗證圖片
      const validation = await imageUtils.validateImage(processedImage);
      if (!validation.valid) {
        throw new Error(`圖片驗證失敗: ${validation.errors.join(', ')}`);
      }

      // 調用API整合管理器
      const result = await apiIntegrationManager.callApi(
        'qualityAnalysis',
        'evaluate',
        { imageFile: processedImage, ...options },
        { onProgress: options.onProgress }
      );

      return result;
    } catch (error) {
      console.error('品質評估失敗:', error);
      throw error;
    }
  }

  // 綜合分析
  async comprehensiveAnalysis(imageFile, options = {}) {
    try {
      // 圖片預處理
      const processedImage = await imageUtils.compressImage(imageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });

      // 驗證圖片
      const validation = await imageUtils.validateImage(processedImage);
      if (!validation.valid) {
        throw new Error(`圖片驗證失敗: ${validation.errors.join(', ')}`);
      }

      // 並行執行多個分析
      const analysisPromises = [
        this.evaluateCentering(processedImage, options),
        this.checkAuthenticity(processedImage, options),
        this.evaluateQuality(processedImage, options),
      ];

      const results = await Promise.allSettled(analysisPromises);

      // 整合結果
      const analysisResults = {
        centering: results[0].status === 'fulfilled' ? results[0].value : null,
        authenticity: results[1].status === 'fulfilled' ? results[1].value : null,
        quality: results[2].status === 'fulfilled' ? results[2].value : null,
      };

      // 計算綜合評分
      const overallScore = this.calculateOverallScore(analysisResults);

      return {
        success: true,
        data: {
          ...analysisResults,
          overallScore,
          summary: this.generateAnalysisSummary(analysisResults),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('綜合分析失敗:', error);
      throw error;
    }
  }

  // 批量分析
  async batchAnalysis(imageFiles, analysisType = 'comprehensive', options = {}) {
    try {
      const results = [];
      const totalFiles = imageFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const imageFile = imageFiles[i];
        
        // 更新進度
        if (options.onProgress) {
          options.onProgress({
            current: i + 1,
            total: totalFiles,
            percentage: ((i + 1) / totalFiles) * 100,
          });
        }

        try {
          let result;
          switch (analysisType) {
            case 'centering':
              result = await this.evaluateCentering(imageFile, options);
              break;
            case 'authenticity':
              result = await this.checkAuthenticity(imageFile, options);
              break;
            case 'quality':
              result = await this.evaluateQuality(imageFile, options);
              break;
            case 'comprehensive':
            default:
              result = await this.comprehensiveAnalysis(imageFile, options);
              break;
          }

          results.push({
            success: true,
            data: result,
            index: i,
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
            index: i,
          });
        }
      }

      return {
        success: true,
        data: results,
        totalProcessed: totalFiles,
        successfulCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
      };
    } catch (error) {
      console.error('批量分析失敗:', error);
      throw error;
    }
  }

  // 獲取分析歷史
  async getAnalysisHistory(userId, filters = {}) {
    try {
      const result = await apiIntegrationManager.callApi(
        'analysisHistory',
        'getHistory',
        { userId, filters },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取分析歷史失敗:', error);
      throw error;
    }
  }

  // 保存分析結果
  async saveAnalysisResult(analysisData, userId) {
    try {
      const result = await apiIntegrationManager.callApi(
        'analysisHistory',
        'saveResult',
        { analysisData, userId },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('保存分析結果失敗:', error);
      throw error;
    }
  }

  // 導出分析報告
  async exportAnalysisReport(analysisId, format = 'pdf') {
    try {
      const result = await apiIntegrationManager.callApi(
        'analysisReport',
        'export',
        { analysisId, format },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('導出分析報告失敗:', error);
      throw error;
    }
  }

  // 獲取分析統計
  async getAnalysisStats(userId, period = '1m') {
    try {
      const result = await apiIntegrationManager.callApi(
        'analysisStats',
        'getStats',
        { userId, period },
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取分析統計失敗:', error);
      throw error;
    }
  }

  // 計算綜合評分
  calculateOverallScore(analysisResults) {
    let totalScore = 0;
    let weightSum = 0;

    // 居中度評分 (權重: 0.3)
    if (analysisResults.centering?.data?.score) {
      totalScore += analysisResults.centering.data.score * 0.3;
      weightSum += 0.3;
    }

    // 真偽評分 (權重: 0.4)
    if (analysisResults.authenticity?.data?.confidence) {
      totalScore += analysisResults.authenticity.data.confidence * 0.4;
      weightSum += 0.4;
    }

    // 品質評分 (權重: 0.3)
    if (analysisResults.quality?.data?.score) {
      totalScore += analysisResults.quality.data.score * 0.3;
      weightSum += 0.3;
    }

    return weightSum > 0 ? totalScore / weightSum : 0;
  }

  // 生成分析摘要
  generateAnalysisSummary(analysisResults) {
    const summary = {
      overallGrade: this.getGradeFromScore(this.calculateOverallScore(analysisResults)),
      recommendations: [],
      warnings: [],
      strengths: [],
      weaknesses: [],
    };

    // 分析居中度
    if (analysisResults.centering?.data) {
      const centeringScore = analysisResults.centering.data.score;
      if (centeringScore >= 0.8) {
        summary.strengths.push('居中度優秀');
      } else if (centeringScore < 0.6) {
        summary.weaknesses.push('居中度需要改善');
        summary.recommendations.push('考慮重新拍攝以獲得更好的居中效果');
      }
    }

    // 分析真偽
    if (analysisResults.authenticity?.data) {
      const authenticityConfidence = analysisResults.authenticity.data.confidence;
      if (authenticityConfidence >= 0.9) {
        summary.strengths.push('真偽鑑定結果可信度高');
      } else if (authenticityConfidence < 0.7) {
        summary.warnings.push('真偽鑑定結果可信度較低');
        summary.recommendations.push('建議尋求專業鑑定服務');
      }
    }

    // 分析品質
    if (analysisResults.quality?.data) {
      const qualityScore = analysisResults.quality.data.score;
      if (qualityScore >= 0.8) {
        summary.strengths.push('卡牌品質良好');
      } else if (qualityScore < 0.6) {
        summary.weaknesses.push('卡牌品質需要改善');
        summary.recommendations.push('考慮改善保存條件');
      }
    }

    return summary;
  }

  // 根據評分獲取等級
  getGradeFromScore(score) {
    if (score >= 0.9) return 'A+';
    if (score >= 0.85) return 'A';
    if (score >= 0.8) return 'A-';
    if (score >= 0.75) return 'B+';
    if (score >= 0.7) return 'B';
    if (score >= 0.65) return 'B-';
    if (score >= 0.6) return 'C+';
    if (score >= 0.55) return 'C';
    if (score >= 0.5) return 'C-';
    return 'D';
  }

  // 獲取分析工具信息
  async getAnalysisTools() {
    try {
      const result = await apiIntegrationManager.callApi(
        'analysisTools',
        'getTools',
        {},
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取分析工具信息失敗:', error);
      throw error;
    }
  }

  // 設置分析偏好
  async setAnalysisPreferences(preferences) {
    try {
      const result = await apiIntegrationManager.callApi(
        'analysisPreferences',
        'setPreferences',
        { preferences },
        { useCache: false }
      );

      return result;
    } catch (error) {
      console.error('設置分析偏好失敗:', error);
      throw error;
    }
  }

  // 獲取分析偏好
  async getAnalysisPreferences() {
    try {
      const result = await apiIntegrationManager.callApi(
        'analysisPreferences',
        'getPreferences',
        {},
        { useCache: true }
      );

      return result;
    } catch (error) {
      console.error('獲取分析偏好失敗:', error);
      throw error;
    }
  }
}

export default new AnalysisService();
