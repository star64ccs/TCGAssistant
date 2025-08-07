import { apiService, API_ENDPOINTS } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imageUtils from '../utils/imageUtils';

// 真偽判斷服務
class AuthenticityService {
  constructor() {
    this.cache = new Map();
    this.pendingOperations = [];
    this.isOnline = true;
  }

  // 檢查真偽
  async checkAuthenticity(imageFile, options = {}) {
    try {
      // 圖片預處理
      const processedImage = await this.preprocessImage(imageFile);
      
      // 檢查快取
      const cacheKey = this.generateCacheKey(processedImage);
      const cachedResult = await this.getCachedResult(cacheKey);
      if (cachedResult && !options.forceRefresh) {
        return cachedResult;
      }

      // 調用API
      const result = await this.callAuthenticityAPI(processedImage, options);
      
      // 儲存結果
      await this.saveResult(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('真偽判斷失敗:', error);
      
      // 離線模式：使用本地分析
      if (!this.isOnline) {
        return await this.offlineAnalysis(imageFile, options);
      }
      
      throw error;
    }
  }

  // 圖片預處理
  async preprocessImage(imageFile) {
    try {
      // 壓縮和優化圖片
      const processedImage = await imageUtils.compressImage(imageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });

      const validation = await imageUtils.validateImage(processedImage);
      if (!validation || !validation.valid) {
        const errors = validation?.errors || ['未知驗證錯誤'];
        throw new Error(`圖片驗證失敗: ${errors.join(', ')}`);
      }

      return processedImage;
    } catch (error) {
      throw new Error(`圖片預處理失敗: ${error.message}`);
    }
  }

  // 調用真偽判斷API
  async callAuthenticityAPI(imageFile, options = {}) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('options', JSON.stringify(options));

    const response = await apiService.post(API_ENDPOINTS.ANALYSIS.AUTHENTICITY, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options.onProgress,
    });

    return this.formatAuthenticityResult(response.data);
  }

  // 格式化真偽判斷結果
  formatAuthenticityResult(data) {
    return {
      isAuthentic: data.isAuthentic,
      confidence: data.confidence || 0,
      overallScore: data.overallScore || 0,
      securityFeatures: {
        hologram: { detected: data.securityFeatures?.hologram?.detected || false, score: data.securityFeatures?.hologram?.score || 0 },
        watermark: { detected: data.securityFeatures?.watermark?.detected || false, score: data.securityFeatures?.watermark?.score || 0 },
        uvPattern: { detected: data.securityFeatures?.uvPattern?.detected || false, score: data.securityFeatures?.uvPattern?.score || 0 },
        texture: { detected: data.securityFeatures?.texture?.detected || false, score: data.securityFeatures?.texture?.score || 0 }
      },
      printQuality: {
        resolution: data.printQuality?.resolution || 0,
        colorAccuracy: data.printQuality?.colorAccuracy || 0,
        sharpness: data.printQuality?.sharpness || 0,
        consistency: data.printQuality?.consistency || 0
      },
      materialCheck: {
        cardstock: data.materialCheck?.cardstock || 0,
        finish: data.materialCheck?.finish || 0,
        thickness: data.materialCheck?.thickness || 0,
        flexibility: data.materialCheck?.flexibility || 0
      },
      edgeQuality: {
        smoothness: data.edgeQuality?.smoothness || 0,
        consistency: data.edgeQuality?.consistency || 0,
        alignment: data.edgeQuality?.alignment || 0
      },
      cornerQuality: {
        sharpness: data.cornerQuality?.sharpness || 0,
        consistency: data.cornerQuality?.consistency || 0,
        wear: data.cornerQuality?.wear || 0
      },
      riskFactors: data.riskFactors || [],
      recommendations: data.recommendations || [],
      analysisId: data.analysisId || this.generateAnalysisId(),
      timestamp: new Date().toISOString(),
      metadata: {
        imageSize: data.metadata?.imageSize || 0,
        processingTime: data.metadata?.processingTime || 0,
        apiVersion: data.metadata?.apiVersion || '1.0',
      }
    };
  }

  // 離線分析
  async offlineAnalysis(imageFile, options = {}) {
    // 使用本地ML模型或基本分析
    const basicAnalysis = await this.performBasicAnalysis(imageFile);
    
    return {
      ...basicAnalysis,
      isOffline: true,
      confidence: Math.max(basicAnalysis.confidence - 20, 0), // 離線模式降低信心度
      recommendations: [
        ...basicAnalysis.recommendations,
        '此為離線分析結果，建議在網路連線時重新檢查以獲得更高準確度'
      ]
    };
  }

  // 基本分析
  async performBasicAnalysis(imageFile) {
    // 這裡可以整合TensorFlow Lite或其他本地ML模型
    const imageInfo = await imageUtils.getImageInfo(imageFile);
    
    // 基本檢查邏輯
    const checks = {
      imageQuality: this.checkImageQuality(imageInfo),
      aspectRatio: this.checkAspectRatio(imageInfo),
      colorDistribution: this.checkColorDistribution(imageInfo),
    };

    const overallScore = Object.values(checks).reduce((sum, score) => sum + score, 0) / Object.keys(checks).length;
    const isAuthentic = overallScore > 70;

    return {
      isAuthentic,
      confidence: Math.min(overallScore + 10, 95),
      overallScore,
      securityFeatures: {
        hologram: { detected: false, score: 0 },
        watermark: { detected: false, score: 0 },
        uvPattern: { detected: false, score: 0 },
        texture: { detected: false, score: 0 }
      },
      printQuality: {
        resolution: checks.imageQuality,
        colorAccuracy: checks.colorDistribution,
        sharpness: checks.imageQuality,
        consistency: checks.aspectRatio
      },
      materialCheck: {
        cardstock: 0,
        finish: 0,
        thickness: 0,
        flexibility: 0
      },
      edgeQuality: {
        smoothness: 0,
        consistency: 0,
        alignment: 0
      },
      cornerQuality: {
        sharpness: 0,
        consistency: 0,
        wear: 0
      },
      riskFactors: ['離線分析，準確度有限'],
      recommendations: ['建議在網路連線時重新檢查'],
      analysisId: this.generateAnalysisId(),
      timestamp: new Date().toISOString(),
    };
  }

  // 檢查圖片品質
  checkImageQuality(imageInfo) {
    const { width, height, fileSize } = imageInfo;
    const resolution = width * height;
    
    if (resolution < 100000) return 30; // 低解析度
    if (resolution < 500000) return 60; // 中等解析度
    if (resolution < 1000000) return 80; // 高解析度
    return 95; // 超高解析度
  }

  // 檢查長寬比
  checkAspectRatio(imageInfo) {
    const { width, height } = imageInfo;
    const ratio = width / height;
    
    // 標準卡牌長寬比約為 2.5:3.5
    const standardRatio = 2.5 / 3.5;
    const difference = Math.abs(ratio - standardRatio);
    
    if (difference < 0.1) return 95;
    if (difference < 0.2) return 80;
    if (difference < 0.3) return 60;
    return 40;
  }

  // 檢查顏色分布
  checkColorDistribution(imageInfo) {
    // 這裡可以實現更複雜的顏色分析
    return 75; // 預設值
  }

  // 生成快取鍵
  generateCacheKey(imageFile) {
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)); // 每小時一個鍵
    return `authenticity_${timestamp}_${imageFile.name || 'unknown'}`;
  }

  // 獲取快取結果
  async getCachedResult(cacheKey) {
    try {
      const cached = await AsyncStorage.getItem(`authenticity_cache_${cacheKey}`);
      if (cached) {
        const result = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(result.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24小時
        
        if (cacheAge < maxAge) {
          return result;
        } else {
          await AsyncStorage.removeItem(`authenticity_cache_${cacheKey}`);
        }
      }
    } catch (error) {
      console.error('讀取快取失敗:', error);
    }
    return null;
  }

  // 儲存結果
  async saveResult(cacheKey, result) {
    try {
      await AsyncStorage.setItem(`authenticity_cache_${cacheKey}`, JSON.stringify(result));
      this.cache.set(cacheKey, result);
    } catch (error) {
      console.error('儲存結果失敗:', error);
    }
  }

  // 生成分析ID
  generateAnalysisId() {
    return `AC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 獲取分析歷史
  async getAnalysisHistory(limit = 50) {
    try {
      const history = await AsyncStorage.getItem('authenticity_history');
      if (history) {
        const parsed = JSON.parse(history);
        return parsed.slice(0, limit);
      }
    } catch (error) {
      console.error('讀取分析歷史失敗:', error);
    }
    return [];
  }

  // 儲存分析歷史
  async saveAnalysisHistory(result) {
    try {
      const history = await this.getAnalysisHistory();
      const newHistory = [result, ...history].slice(0, 100); // 保留最近100條
      await AsyncStorage.setItem('authenticity_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('儲存分析歷史失敗:', error);
    }
  }

  // 清除快取
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('authenticity_cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      this.cache.clear();
    } catch (error) {
      console.error('清除快取失敗:', error);
    }
  }

  // 獲取統計資訊
  async getStats() {
    try {
      const history = await this.getAnalysisHistory();
      const total = history.length;
      const authentic = history.filter(h => h.isAuthentic).length;
      const fake = total - authentic;
      const avgConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / total || 0;

      return {
        total,
        authentic,
        fake,
        avgConfidence,
        lastAnalysis: history[0]?.timestamp || null,
      };
    } catch (error) {
      console.error('獲取統計失敗:', error);
      return { total: 0, authentic: 0, fake: 0, avgConfidence: 0, lastAnalysis: null };
    }
  }

  // 檢查網路狀態
  setOnlineStatus(isOnline) {
    this.isOnline = isOnline;
  }

  // 批量分析
  async batchAnalysis(imageFiles, options = {}) {
    const results = [];
    const total = imageFiles.length;

    for (let i = 0; i < total; i++) {
      try {
        if (options.onProgress) {
          options.onProgress((i / total) * 100);
        }

        const result = await this.checkAuthenticity(imageFiles[i], options);
        results.push(result);
      } catch (error) {
        console.error(`批量分析第${i + 1}張圖片失敗:`, error);
        results.push({
          error: error.message,
          index: i,
          filename: imageFiles[i].name
        });
      }
    }

    return results;
  }
}

export default new AuthenticityService();
