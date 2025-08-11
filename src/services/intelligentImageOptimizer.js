// 檢查是否支援 Image API
const isImageSupported = typeof Image !== 'undefined';

// 智能圖像優化器
export class IntelligentImageOptimizer {
  constructor() {
    this.optimizationStrategies = new Map();
    this.formatConverters = new Map();
    this.qualityAssessors = new Map();    // 優化配置
    this.config = {      // 質量目標      quality: {        minimum: 0.7, // 最低可接受質量        target: 0.85, // 目標質量        premium: 0.95, // 高品質目標      },      // 大小目標      size: {        aggressive: 0.3, // 激進壓縮，保留30%        balanced: 0.5, // 平衡壓縮，保留50%        conservative: 0.7, // 保守壓縮，保留70%      },      // 格式優先級      formatPriority: {        web: ['webp', 'jpeg', 'png'],        mobile: ['webp', 'jpeg', 'png'],        print: ['png', 'jpeg', 'tiff'],      },      // 性能配置      performance: {        maxProcessingTime: 30000, // 30秒超時        adaptiveQuality: true, // 自適應質量        smartCrop: true, // 智能裁剪        contentAware: true, // 內容感知優化      },
    };    this.initializeOptimizers();
  }

  // 初始化優化器
  initializeOptimizers() {
    // JPEG 優化器
    this.optimizationStrategies.set('jpeg', {      analyzer: this.analyzeJPEGContent.bind(this),      optimizer: this.optimizeJPEG.bind(this),      validator: this.validateJPEGQuality.bind(this),
    });    // PNG 優化器
    this.optimizationStrategies.set('png', {      analyzer: this.analyzePNGContent.bind(this),      optimizer: this.optimizePNG.bind(this),      validator: this.validatePNGQuality.bind(this),
    });    // WebP 優化器
    this.optimizationStrategies.set('webp', {      analyzer: this.analyzeWebPContent.bind(this),      optimizer: this.optimizeWebP.bind(this),      validator: this.validateWebPQuality.bind(this),
    });
  }

  // 主要優化方法
  async optimizeImage(imageData, options = {}) {
    try {      const {        targetSize = null, // 目標檔案大小        targetQuality = 'balanced', // 目標質量等級        targetFormat = 'auto', // 目標格式        useCase = 'web', // 使用場景        contentType = 'auto', // 內容類型        preserveMetadata = false, // 保留元數據        enableProgressive = true, // 啟用漸進式        onProgress = null,      } = options;      onProgress && onProgress('開始智能圖像優化...');      // 1. 內容分析      const contentAnalysis = await this.analyzeImageContent(imageData);      // 2. 優化策略選擇      onProgress && onProgress('分析優化策略...');      const strategy = await this.selectOptimizationStrategy(        contentAnalysis,        { targetSize, targetQuality, targetFormat, useCase, contentType },      );        // 3. 格式轉換決策      const formatDecision = this.makeFormatDecision(contentAnalysis, strategy);      // 4. 執行多階段優化      onProgress && onProgress('執行多階段優化...');      const optimizedImages = await this.performMultiStageOptimization(        imageData,        strategy,        formatDecision,        onProgress,      );        // 5. 質量評估和選擇      onProgress && onProgress('評估優化結果...');      const bestResult = await this.selectBestOptimization(        optimizedImages,        strategy,        contentAnalysis,      );        // 6. 後處理優化      const finalResult = await this.applyPostProcessing(        bestResult,        { preserveMetadata, enableProgressive },      );      onProgress && onProgress('圖像優化完成');      return {        success: true,        result: finalResult,        strategy,        analysis: contentAnalysis,        metrics: this.calculateOptimizationMetrics(imageData, finalResult),        timestamp: new Date().toISOString(),      };
    } catch (error) {      return {        success: false,        error: error.message,        timestamp: new Date().toISOString(),      };
    }
  }

  // 內容分析
  async analyzeImageContent(imageData) {
    const analysis = {      // 基本信息      basic: await this.extractBasicInfo(imageData),      // 內容類型檢測      contentType: await this.detectContentType(imageData),      // 複雜度分析      complexity: await this.analyzeComplexity(imageData),      // 顏色分析      colorAnalysis: await this.analyzeColorCharacteristics(imageData),      // 細節分析      detailAnalysis: await this.analyzeImageDetails(imageData),      // 壓縮友好性      compressionFriendliness: await this.assessCompressionFriendliness(imageData),
    };    return analysis;
  }

  // 檢測內容類型
  async detectContentType(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.loadImage(imageData);    canvas.width = Math.min(img.width, 500);
    canvas.height = Math.min(img.height, 500);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageDataObj.data;    const analysis = {      // 邊緣密度      edgeDensity: this.calculateEdgeDensity(data, canvas.width, canvas.height),      // 顏色豐富度      colorRichness: this.calculateColorRichness(data),      // 紋理複雜度      textureComplexity: this.calculateTextureComplexity(data, canvas.width, canvas.height),      // 對比度分布      contrastDistribution: this.analyzeContrastDistribution(data),
    };      // 內容類型判斷
    let contentType = 'mixed';    if (analysis.edgeDensity > 0.3 && analysis.colorRichness < 0.3) {      contentType = 'line_art'; // 線條藝術/圖表
    } else if (analysis.textureComplexity > 0.7 && analysis.colorRichness > 0.6) {      contentType = 'photo'; // 攝影作品
    } else if (analysis.colorRichness < 0.4 && analysis.contrastDistribution.high > 0.5) {      contentType = 'text'; // 文本/文檔
    } else if (analysis.edgeDensity < 0.2 && analysis.textureComplexity < 0.3) {      contentType = 'graphics'; // 圖形/插畫
    }    return {      type: contentType,      confidence: this.calculateContentTypeConfidence(analysis),      characteristics: analysis,
    };
  }

  // 複雜度分析
  async analyzeComplexity(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.loadImage(imageData);    // 使用較小的尺寸進行分析以提高性能
    const analysisSize = 256;
    const scale = Math.min(analysisSize / img.width, analysisSize / img.height);    canvas.width = Math.floor(img.width * scale);
    canvas.height = Math.floor(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);    return {      // 視覺複雜度      visual: this.calculateVisualComplexity(imageDataObj),      // 空間頻率      spatial: this.calculateSpatialFrequency(imageDataObj),      // 信息熵      entropy: this.calculateImageEntropy(imageDataObj),      // 噪聲水平      noiseLevel: this.estimateNoiseLevel(imageDataObj),      // 結構化程度      structuralLevel: this.assessStructuralLevel(imageDataObj),
    };
  }

  // 顏色特徵分析
  async analyzeColorCharacteristics(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.loadImage(imageData);    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageDataObj.data;    return {      // 主色調      dominantColors: this.extractDominantColors(data, 5),      // 色彩分布      colorDistribution: this.analyzeColorDistribution(data),      // 飽和度特徵      saturationProfile: this.analyzeSaturationProfile(data),      // 亮度特徵      brightnessProfile: this.analyzeBrightnessProfile(data),      // 色溫      colorTemperature: this.estimateColorTemperature(data),      // 色彩豐富度      colorfulness: this.calculateColorfulness(data),
    };
  }

  // 優化策略選擇
  async selectOptimizationStrategy(contentAnalysis, options) {
    const { targetQuality, useCase, contentType } = options;    const strategy = {      // 基礎策略      compression: this.selectCompressionLevel(contentAnalysis, targetQuality),      // 格式選擇      format: this.recommendFormat(contentAnalysis, useCase),      // 尺寸優化      sizing: this.calculateOptimalSizing(contentAnalysis, options),      // 質量參數      quality: this.calculateQualityParameters(contentAnalysis, targetQuality),      // 特殊處理      special: this.determineSpecialProcessing(contentAnalysis),
    };    return strategy;
  }

  // 多階段優化
  async performMultiStageOptimization(imageData, strategy, formatDecision, onProgress) {
    const optimizations = [];    // 階段1：基礎優化
    onProgress && onProgress('執行基礎優化...');
    const basicOptimized = await this.performBasicOptimization(imageData, strategy);
    optimizations.push({ stage: 'basic', result: basicOptimized });    // 階段2：格式轉換優化
    if (formatDecision.shouldConvert) {      onProgress && onProgress('執行格式轉換...');      const formatOptimized = await this.performFormatOptimization(        basicOptimized,        formatDecision.targetFormat,        strategy,      );      optimizations.push({ stage: 'format', result: formatOptimized });
    }    // 階段3：高級優化
    onProgress && onProgress('執行高級優化...');
    const advancedOptimized = await this.performAdvancedOptimization(      optimizations[optimizations.length - 1].result,      strategy,
    );
    optimizations.push({ stage: 'advanced', result: advancedOptimized });    // 階段4：自適應優化
    if (this.config.performance.adaptiveQuality) {      onProgress && onProgress('執行自適應優化...');      const adaptiveOptimized = await this.performAdaptiveOptimization(        advancedOptimized,        strategy,      );      optimizations.push({ stage: 'adaptive', result: adaptiveOptimized });
    }    return optimizations;
  }

  // 基礎優化
  async performBasicOptimization(imageData, strategy) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.loadImage(imageData);    // 設置目標尺寸
    const targetSize = strategy.sizing;
    canvas.width = targetSize.width;
    canvas.height = targetSize.height;    // 配置渲染質量
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';    // 繪製圖像
    ctx.drawImage(img, 0, 0, targetSize.width, targetSize.height);    // 應用基礎濾鏡
    if (strategy.special.enhanceSharpness) {      this.applySharpnessFilter(ctx, canvas);
    }    if (strategy.special.reduceNoise) {      this.applyNoiseReduction(ctx, canvas);
    }    return this.canvasToBlob(canvas, strategy.quality);
  }

  // 格式優化
  async performFormatOptimization(imageData, targetFormat, strategy) {
    const optimizer = this.optimizationStrategies.get(targetFormat);    if (!optimizer) {      throw new Error(`不支援的格式: ${targetFormat}`);
    }    // 分析目標格式的內容特性
    const formatAnalysis = await optimizer.analyzer(imageData);    // 執行格式特定的優化
    const optimized = await optimizer.optimizer(imageData, strategy, formatAnalysis);    // 驗證質量
    const qualityCheck = await optimizer.validator(optimized, imageData);    if (!qualityCheck.acceptable) {      // 如果質量不可接受，調整參數重試      const adjustedStrategy = this.adjustStrategyForQuality(strategy, qualityCheck);      return optimizer.optimizer(imageData, adjustedStrategy, formatAnalysis);
    }    return optimized;
  }

  // 高級優化
  async performAdvancedOptimization(imageData, strategy) {
    let optimized = imageData;    // 智能裁剪
    if (strategy.special.smartCrop) {      optimized = await this.applySmartCrop(optimized, strategy);
    }    // 內容感知調整
    if (strategy.special.contentAware) {      optimized = await this.applyContentAwareAdjustments(optimized, strategy);
    }    // 感知優化
    if (strategy.special.perceptualOptimization) {      optimized = await this.applyPerceptualOptimization(optimized, strategy);
    }    return optimized;
  }

  // 自適應優化
  async performAdaptiveOptimization(imageData, strategy) {
    // 測量當前質量
    const currentQuality = await this.measureImageQuality(imageData);    // 如果質量過高，可以進一步壓縮
    if (currentQuality.overall > this.config.quality.target + 0.1) {      const adjustedStrategy = {        ...strategy,        quality: {          ...strategy.quality,          compression: Math.min(strategy.quality.compression + 0.1, 0.9),        },      };      return this.performBasicOptimization(imageData, adjustedStrategy);
    }    // 如果質量過低，減少壓縮
    if (currentQuality.overall < this.config.quality.minimum) {      const adjustedStrategy = {        ...strategy,        quality: {          ...strategy.quality,          compression: Math.max(strategy.quality.compression - 0.1, 0.1),        },      };      return this.performBasicOptimization(imageData, adjustedStrategy);
    }    return imageData;
  }

  // 選擇最佳優化結果
  async selectBestOptimization(optimizations, strategy, contentAnalysis) {
    const evaluations = [];    for (const optimization of optimizations) {      const evaluation = await this.evaluateOptimization(        optimization.result,        strategy,        contentAnalysis,      );      evaluations.push({        ...optimization,        evaluation,        score: this.calculateOptimizationScore(evaluation, strategy),      });
    }    // 按分數排序，選擇最佳結果
    evaluations.sort((a, b) => b.score - a.score);
    return evaluations[0].result;
  }

  // 優化評估
  async evaluateOptimization(optimizedImage, strategy, contentAnalysis) {
    return {      // 檔案大小效率      sizeEfficiency: await this.calculateSizeEfficiency(optimizedImage, strategy),      // 視覺質量      visualQuality: await this.assessVisualQuality(optimizedImage),      // 格式適合度      formatSuitability: this.assessFormatSuitability(optimizedImage, contentAnalysis),      // 載入性能      loadingPerformance: this.estimateLoadingPerformance(optimizedImage),      // 兼容性      compatibility: this.assessCompatibility(optimizedImage, strategy),
    };
  }

  // 計算優化分數
  calculateOptimizationScore(evaluation, strategy) {
    const weights = {      sizeEfficiency: 0.3,      visualQuality: 0.35,      formatSuitability: 0.15,      loadingPerformance: 0.15,      compatibility: 0.05,
    };    let score = 0;
    for (const [metric, value] of Object.entries(evaluation)) {      if (weights[metric]) {        score += value * weights[metric];      }
    }    return score;
  }

  // JPEG 優化實現
  async optimizeJPEG(imageData, strategy, analysis) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.loadImage(imageData);    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);    // JPEG 特定優化
    const jpegQuality = this.calculateJPEGQuality(analysis, strategy);    return this.canvasToBlob(canvas, {      format: 'jpeg',      quality: jpegQuality,      progressive: true,
    });
  }

  // PNG 優化實現
  async optimizePNG(imageData, strategy, analysis) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.loadImage(imageData);    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);    // PNG 特定優化
    if (analysis.hasTransparency) {      // 保持透明度      return this.canvasToBlob(canvas, {        format: 'png',        quality: strategy.quality.compression,      });
    }    // 考慮轉換為 JPEG    const jpegAlternative = await this.optimizeJPEG(imageData, strategy, analysis);    const pngResult = this.canvasToBlob(canvas, {      format: 'png',      quality: strategy.quality.compression,    });    // 選擇較小的格式    return (await jpegAlternative).size < (await pngResult).size ?      jpegAlternative : pngResult;
  }

  // WebP 優化實現
  async optimizeWebP(imageData, strategy, analysis) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.loadImage(imageData);    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);    // WebP 特定優化
    const webpQuality = this.calculateWebPQuality(analysis, strategy);    return this.canvasToBlob(canvas, {      format: 'webp',      quality: webpQuality,      lossless: analysis.shouldUseLossless,
    });
  }

  // 工具方法
  loadImage(imageInput) {
    return new Promise((resolve, reject) => {      const Image = typeof window !== 'undefined' ? window.Image : null;      if (!Image) {        reject(new Error('Image API not available'));        return;      }      const img = new Image();      img.crossOrigin = 'anonymous';      img.onload = () => resolve(img);      img.onerror = reject;      if (typeof imageInput === 'string') {        img.src = imageInput;      } else {        img.src = URL.createObjectURL(imageInput);      }
    });
  }

  canvasToBlob(canvas, options) {
    return new Promise((resolve) => {      const { format = 'jpeg', quality = 0.8 } = options;      canvas.toBlob(resolve, `image/${format}`, quality);
    });
  }

  // 計算顏色豐富度
  calculateColorRichness(data) {
    const colorSet = new Set();    for (let i = 0; i < data.length; i += 4) {      const r = Math.floor(data[i] / 16);      const g = Math.floor(data[i + 1] / 16);      const b = Math.floor(data[i + 2] / 16);      colorSet.add(`${r},${g},${b}`);
    }    return Math.min(colorSet.size / 4096, 1); // 4096 = 16^3 (簡化的顏色空間)
  }

  // 計算邊緣密度
  calculateEdgeDensity(data, width, height) {
    let edgeCount = 0;
    const threshold = 50;    for (let y = 1; y < height - 1; y++) {      for (let x = 1; x < width - 1; x++) {        const idx = (y * width + x) * 4;        const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;        const neighbors = [          (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3,          (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3,          (data[(y - 1) * width * 4 + x * 4] + data[(y - 1) * width * 4 + x * 4 + 1] + data[(y - 1) * width * 4 + x * 4 + 2]) / 3,          (data[(y + 1) * width * 4 + x * 4] + data[(y + 1) * width * 4 + x * 4 + 1] + data[(y + 1) * width * 4 + x * 4 + 2]) / 3,        ];        const maxDiff = Math.max(...neighbors.map(n => Math.abs(center - n)));        if (maxDiff > threshold) {          edgeCount++;        }      }
    }    return edgeCount / ((width - 2) * (height - 2));
  }

  // 計算優化指標
  calculateOptimizationMetrics(original, optimized) {
    return {      compressionRatio: original.size / optimized.size,      sizeReduction: ((original.size - optimized.size) / original.size) * 100,      efficiency: this.calculateCompressionEfficiency(original, optimized),
    };
  }

  calculateCompressionEfficiency(original, optimized) {
    const sizeRatio = optimized.size / original.size;
    const qualityRatio = 0.9; // 假設的質量比率，實際應該通過質量評估得到    return qualityRatio / sizeRatio; // 質量/大小比率，越高越好
  }
}

export default new IntelligentImageOptimizer();
