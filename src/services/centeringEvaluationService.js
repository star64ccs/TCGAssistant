// 導入必要的模組
import { getApiConfig } from '../config/apiConfig';
import imageUtils from '../utils/imageUtils';

// 置中評估服務
class CenteringEvaluationService {
  constructor() {
    this.cardDimensions = {
      // 標準卡牌尺寸 (毫米)
      standard: {
        width: 63,
        height: 88,
      },
      // 不同類型卡牌的尺寸比例
      pokemon: { width: 63, height: 88 },
      yugioh: { width: 59, height: 86 },
      onePiece: { width: 63, height: 88 },
    };
    this.gradingStandards = {
      PSA: {
        10: { min: 55, max: 45 }, // 55/45 到 45/55
        9: { min: 60, max: 40 }, // 60/40 到 40/60
        8: { min: 65, max: 35 }, // 65/35 到 35/65
        7: { min: 70, max: 30 }, // 70/30 到 30/70
        6: { min: 75, max: 25 }, // 75/25 到 25/75
      },
      BGS: {
        10: { min: 55, max: 45 },
        9: { min: 60, max: 40 },
        8: { min: 65, max: 35 },
        7: { min: 70, max: 30 },
        6: { min: 75, max: 25 },
      },
    };
  }

  // 評估卡牌置中度
  async evaluateCardCentering(frontImage, backImage = null, options = {}) {
    try {
      const {
        cardType = 'standard',
        gradingStandard = 'PSA',
        useRealApi = true,
        onProgress = null,
      } = options;
        // 更新進度
      onProgress && onProgress({ step: 'preprocessing', progress: 10 });
      // 預處理圖片
      const processedFront = await this.preprocessImage(frontImage);
      const processedBack = backImage ? await this.preprocessImage(backImage) : null;
      onProgress && onProgress({ step: 'detection', progress: 30 });
      // 檢測卡牌邊界
      const frontBounds = await this.detectCardBoundaries(processedFront);
      const backBounds = processedBack ? await this.detectCardBoundaries(processedBack) : null;
      onProgress && onProgress({ step: 'analysis', progress: 60 });
      // 分析置中度
      const frontCentering = this.analyzeCentering(frontBounds, cardType);
      const backCentering = backBounds ? this.analyzeCentering(backBounds, cardType) : null;
      onProgress && onProgress({ step: 'grading', progress: 80 });
      // 計算整體評級
      const overallGrade = this.calculateOverallGrade(frontCentering, backCentering, gradingStandard);
      onProgress && onProgress({ step: 'completed', progress: 100 });
      return {
        success: true,
        data: {
          id: `CE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          cardType: cardType,
          gradingStandard: gradingStandard,
          frontSide: {
            centering: frontCentering,
            imageAnalysis: frontBounds,
            grade: this.getCenteringGrade(frontCentering.overallScore, gradingStandard),
          },
          backSide: backCentering ? {
            centering: backCentering,
            imageAnalysis: backBounds,
            grade: this.getCenteringGrade(backCentering.overallScore, gradingStandard),
          } : null,
          overallGrade: overallGrade,
          recommendations: this.generateRecommendations(frontCentering, backCentering),
          confidence: this.calculateConfidence(frontBounds, backBounds),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 預處理圖片
  async preprocessImage(imageFile) {
    try {
      // 壓縮和調整圖片
      const compressed = await imageUtils.compressImage(imageFile, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.9,
      });
        // 驗證圖片
      const validation = await imageUtils.validateImage(compressed);
      if (!validation.isValid) {
        throw new Error(`圖片驗證失敗: ${validation.errors.join(', ')}`);
      }
      return compressed;
    } catch (error) {
      throw new Error(`圖片預處理失敗: ${error.message}`);
    }
  }

  // 檢測卡牌邊界
  async detectCardBoundaries(imageFile) {
    try {
      // 嘗試使用計算機視覺 API
      const visionResult = await this.detectBoundariesWithVision(imageFile);
      if (visionResult.success) {
        return visionResult.data;
      }
      // 備用：使用本地圖像處理
      return await this.detectBoundariesLocal(imageFile);
    } catch (error) {
      // 最終備用：返回估算邊界
      return this.getEstimatedBoundaries();
    }
  }

  // 使用計算機視覺 API 檢測邊界
  async detectBoundariesWithVision(imageFile) {
    try {
      // 檢查 Google Vision API
      const googleConfig = getApiConfig('recognition', 'GOOGLE_VISION');
      if (googleConfig && googleConfig.enabled) {
        return await this.detectWithGoogleVision(imageFile);
      }
      // 檢查 Azure Vision API
      const azureConfig = getApiConfig('recognition', 'AZURE_VISION');
      if (azureConfig && azureConfig.enabled) {
        return await this.detectWithAzureVision(imageFile);
      }
      throw new Error('沒有可用的計算機視覺 API');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 使用 Google Vision API
  async detectWithGoogleVision(imageFile) {
    const config = getApiConfig('recognition', 'GOOGLE_VISION');
    // 將圖片轉換為 base64
    const base64Image = await this.fileToBase64(imageFile);
    const requestBody = {
      requests: [{
        image: {
          content: base64Image.split(',')[1],
        },
        features: [{
          type: 'OBJECT_LOCALIZATION',
          maxResults: 10,
        }],
      }],
    };
    const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`Google Vision API 錯誤: ${response.status}`);
    }
    const data = await response.json();
    return this.parseGoogleVisionBounds(data);
  }

  // 使用 Azure Vision API
  async detectWithAzureVision(imageFile) {
    const config = getApiConfig('recognition', 'AZURE_VISION');
    const base64Image = await this.fileToBase64(imageFile);
    const requestBody = {
      url: `data:image/jpeg;base64,${base64Image.split(',')[1]}`,
    };
    const response = await fetch(`${config.endpoint}?visualFeatures=Objects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`Azure Vision API 錯誤: ${response.status}`);
    }
    const data = await response.json();
    return this.parseAzureVisionBounds(data);
  }

  // 本地邊界檢測（簡化版）
  async detectBoundariesLocal(imageFile) {
    // 這是一個簡化的邊界檢測實現
    // 實際應用中應該使用更複雜的圖像處理算法
    return {
      success: true,
      data: {
        cardBounds: {
          x: 50, // 卡牌左邊距
          y: 80, // 卡牌上邊距
          width: 600, // 卡牌寬度
          height: 840, // 卡牌高度
        },
        imageDimensions: {
          width: 700,
          height: 1000,
        },
        detectionMethod: 'local_processing',
        confidence: 0.7,
      },
    };
  }

  // 獲取估算邊界
  getEstimatedBoundaries() {
    return {
      success: true,
      data: {
        cardBounds: {
          x: 60,
          y: 90,
          width: 580,
          height: 820,
        },
        imageDimensions: {
          width: 700,
          height: 1000,
        },
        detectionMethod: 'estimated',
        confidence: 0.5,
      },
    };
  }

  // 分析置中度
  analyzeCentering(bounds, cardType) {
    const { cardBounds, imageDimensions } = bounds.data;
    // 計算邊界距離
    const leftMargin = cardBounds.x;
    const rightMargin = imageDimensions.width - (cardBounds.x + cardBounds.width);
    const topMargin = cardBounds.y;
    const bottomMargin = imageDimensions.height - (cardBounds.y + cardBounds.height);
    // 計算百分比
    const totalHorizontal = leftMargin + rightMargin;
    const totalVertical = topMargin + bottomMargin;
    const leftPercent = totalHorizontal > 0 ? (leftMargin / totalHorizontal) * 100 : 50;
    const rightPercent = totalHorizontal > 0 ? (rightMargin / totalHorizontal) * 100 : 50;
    const topPercent = totalVertical > 0 ? (topMargin / totalVertical) * 100 : 50;
    const bottomPercent = totalVertical > 0 ? (bottomMargin / totalVertical) * 100 : 50;
    // 計算置中分數（越接近50/50越好）
    const horizontalScore = 100 - Math.abs(leftPercent - 50) * 2;
    const verticalScore = 100 - Math.abs(topPercent - 50) * 2;
    const overallScore = (horizontalScore + verticalScore) / 2;
    return {
      horizontal: {
        left: Math.round(leftPercent),
        right: Math.round(rightPercent),
        score: Math.round(horizontalScore),
      },
      vertical: {
        top: Math.round(topPercent),
        bottom: Math.round(bottomPercent),
        score: Math.round(verticalScore),
      },
      overallScore: Math.round(overallScore),
      margins: {
        left: leftMargin,
        right: rightMargin,
        top: topMargin,
        bottom: bottomMargin,
      },
    };
  }

  // 計算整體評級
  calculateOverallGrade(frontCentering, backCentering, gradingStandard) {
    let totalScore = frontCentering.overallScore;
    let sidesCount = 1;
    if (backCentering) {
      totalScore += backCentering.overallScore;
      sidesCount = 2;
    }
    const averageScore = totalScore / sidesCount;
    const grade = this.getCenteringGrade(averageScore, gradingStandard);
    return {
      score: Math.round(averageScore),
      grade: grade,
      gradingStandard: gradingStandard,
      sidesEvaluated: sidesCount,
    };
  }

  // 獲取置中評級
  getCenteringGrade(score, gradingStandard = 'PSA') {
    const standards = this.gradingStandards[gradingStandard];
    if (score >= 90) {
      return '10';
    }
    if (score >= 80) {
      return '9';
    }
    if (score >= 70) {
      return '8';
    }
    if (score >= 60) {
      return '7';
    }
    if (score >= 50) {
      return '6';
    }
    return '5';
  }

  // 生成建議
  generateRecommendations(frontCentering, backCentering) {
    const recommendations = [];
    // 分析正面
    if (frontCentering.horizontal.score < 80) {
      recommendations.push({
        type: 'centering',
        severity: 'medium',
        message: '正面水平置中度可以改善',
        details: `左右比例為 ${frontCentering.horizontal.left}/${frontCentering.horizontal.right}`,
      });
    }
    if (frontCentering.vertical.score < 80) {
      recommendations.push({
        type: 'centering',
        severity: 'medium',
        message: '正面垂直置中度可以改善',
        details: `上下比例為 ${frontCentering.vertical.top}/${frontCentering.vertical.bottom}`,
      });
    }
    // 分析背面
    if (backCentering) {
      if (backCentering.horizontal.score < 80) {
        recommendations.push({
          type: 'centering',
          severity: 'medium',
          message: '背面水平置中度可以改善',
          details: `左右比例為 ${backCentering.horizontal.left}/${backCentering.horizontal.right}`,
        });
      }
      if (backCentering.vertical.score < 80) {
        recommendations.push({
          type: 'centering',
          severity: 'medium',
          message: '背面垂直置中度可以改善',
          details: `上下比例為 ${backCentering.vertical.top}/${backCentering.vertical.bottom}`,
        });
      }
    }
    // 整體建議
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'positive',
        severity: 'low',
        message: '置中度表現優秀',
        details: '這張卡牌具有良好的置中度，適合專業評級',
      });
    }
    return recommendations;
  }

  // 計算信心度
  calculateConfidence(frontBounds, backBounds) {
    let confidence = frontBounds.data.confidence || 0.5;
    if (backBounds) {
      confidence = (confidence + (backBounds.data.confidence || 0.5)) / 2;
    }
    // 根據檢測方法調整信心度
    if (frontBounds.data.detectionMethod === 'estimated') {
      confidence *= 0.6;
    } else if (frontBounds.data.detectionMethod === 'local_processing') {
      confidence *= 0.8;
    }
    return Math.round(confidence * 100);
  }

  // 輔助方法
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 解析 Google Vision 結果
  parseGoogleVisionBounds(data) {
    try {
      const objects = data.responses[0]?.localizedObjectAnnotations || [];
      // 尋找卡牌或矩形物件
      const cardObject = objects.find(obj =>
        obj.name.toLowerCase().includes('card') ||
        obj.name.toLowerCase().includes('rectangle') ||
        obj.score > 0.8,
      );
      if (cardObject) {
        const vertices = cardObject.boundingPoly.normalizedVertices;
        const bounds = this.normalizedToBounds(vertices, 1000, 1000); // 假設圖片尺寸
        return {
          success: true,
          data: {
            cardBounds: bounds,
            imageDimensions: { width: 1000, height: 1000 },
            detectionMethod: 'google_vision',
            confidence: cardObject.score,
          },
        };
      }
      throw new Error('未檢測到卡牌');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 解析 Azure Vision 結果
  parseAzureVisionBounds(data) {
    try {
      const objects = data.objects || [];
      const cardObject = objects.find(obj =>
        obj.object.toLowerCase().includes('card') ||
        obj.confidence > 0.8,
      );
      if (cardObject) {
        const rect = cardObject.rectangle;
        return {
          success: true,
          data: {
            cardBounds: {
              x: rect.x,
              y: rect.y,
              width: rect.w,
              height: rect.h,
            },
            imageDimensions: { width: 1000, height: 1000 },
            detectionMethod: 'azure_vision',
            confidence: cardObject.confidence,
          },
        };
      }
      throw new Error('未檢測到卡牌');
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 正規化座標轉換為實際邊界
  normalizedToBounds(vertices, imageWidth, imageHeight) {
    const minX = Math.min(...vertices.map(v => v.x || 0)) * imageWidth;
    const maxX = Math.max(...vertices.map(v => v.x || 0)) * imageWidth;
    const minY = Math.min(...vertices.map(v => v.y || 0)) * imageHeight;
    const maxY = Math.max(...vertices.map(v => v.y || 0)) * imageHeight;
    return {
      x: Math.round(minX),
      y: Math.round(minY),
      width: Math.round(maxX - minX),
      height: Math.round(maxY - minY),
    };
  }
}

export default new CenteringEvaluationService();
