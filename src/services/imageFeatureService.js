// 圖片特徵提取服務
// 用於分析卡牌圖片並生成特徵向量，支援本地辨識

class ImageFeatureService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isInitialized = false;
  }

  // 初始化Canvas
  async initCanvas() {
    if (this.isInitialized) {
      return;
    }

    try {
      // 在React Native環境中，我們需要使用不同的方法
      if (typeof document !== 'undefined') {
        // Web環境
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
      } else {
        // React Native環境 - 使用expo-2d-context或其他替代方案
        console.log('在React Native環境中初始化Canvas');
        // 這裡可以整合expo-2d-context或其他圖片處理庫
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('初始化Canvas失敗:', error);
      throw error;
    }
  }

  // 載入圖片到Canvas
  async loadImageToCanvas(imageUrl) {
    try {
      await this.initCanvas();
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);
            resolve(this.canvas);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          reject(error);
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('載入圖片失敗:', error);
      throw error;
    }
  }

  // 提取顏色直方圖特徵
  async extractColorHistogram(imageUrl, bins = 64) {
    try {
      const canvas = await this.loadImageToCanvas(imageUrl);
      const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const histogram = new Array(bins).fill(0);
      const totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 將RGB轉換為單一索引
        const index = Math.floor((r * 299 + g * 587 + b * 114) / 1000 / 256 * bins);
        histogram[index]++;
      }
      
      // 正規化直方圖
      const normalizedHistogram = histogram.map(count => count / totalPixels);
      
      return {
        type: 'color_histogram',
        data: normalizedHistogram,
        bins: bins,
        confidence: 0.8
      };
    } catch (error) {
      console.error('提取顏色直方圖失敗:', error);
      return {
        type: 'color_histogram',
        data: new Array(bins).fill(1 / bins),
        bins: bins,
        confidence: 0.1
      };
    }
  }

  // 提取主要顏色
  async extractDominantColors(imageUrl, numColors = 5) {
    try {
      const canvas = await this.loadImageToCanvas(imageUrl);
      const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const colorMap = new Map();
      
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.floor(data[i] / 16) * 16;
        const g = Math.floor(data[i + 1] / 16) * 16;
        const b = Math.floor(data[i + 2] / 16) * 16;
        
        const colorKey = `${r},${g},${b}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
      
      // 排序並取前N個顏色
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, numColors)
        .map(([color, count]) => {
          const [r, g, b] = color.split(',').map(Number);
          return {
            rgb: [r, g, b],
            hex: this.rgbToHex(r, g, b),
            percentage: count / (data.length / 4)
          };
        });
      
      return {
        type: 'dominant_colors',
        data: sortedColors,
        numColors: numColors,
        confidence: 0.9
      };
    } catch (error) {
      console.error('提取主要顏色失敗:', error);
      return {
        type: 'dominant_colors',
        data: [],
        numColors: numColors,
        confidence: 0.1
      };
    }
  }

  // 提取邊緣特徵
  async extractEdgeFeatures(imageUrl) {
    try {
      const canvas = await this.loadImageToCanvas(imageUrl);
      const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 簡化的Sobel邊緣檢測
      const edges = [];
      const width = canvas.width;
      const height = canvas.height;
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          // 計算梯度
          const gx = this.calculateGradientX(data, idx, width);
          const gy = this.calculateGradientY(data, idx, width);
          
          const magnitude = Math.sqrt(gx * gx + gy * gy);
          if (magnitude > 50) { // 閾值
            edges.push({ x, y, magnitude });
          }
        }
      }
      
      return {
        type: 'edge_features',
        data: {
          edgeCount: edges.length,
          edgeDensity: edges.length / (width * height),
          averageMagnitude: edges.reduce((sum, edge) => sum + edge.magnitude, 0) / edges.length || 0
        },
        confidence: 0.7
      };
    } catch (error) {
      console.error('提取邊緣特徵失敗:', error);
      return {
        type: 'edge_features',
        data: {
          edgeCount: 0,
          edgeDensity: 0,
          averageMagnitude: 0
        },
        confidence: 0.1
      };
    }
  }

  // 提取文字區域特徵
  async extractTextRegionFeatures(imageUrl) {
    try {
      const canvas = await this.loadImageToCanvas(imageUrl);
      const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 簡化的文字區域檢測
      const textRegions = [];
      const width = canvas.width;
      const height = canvas.height;
      
      // 檢測高對比度區域（可能是文字）
      for (let y = 0; y < height; y += 10) {
        for (let x = 0; x < width; x += 10) {
          const contrast = this.calculateLocalContrast(data, x, y, width, 10);
          if (contrast > 100) {
            textRegions.push({ x, y, contrast });
          }
        }
      }
      
      return {
        type: 'text_regions',
        data: {
          regionCount: textRegions.length,
          averageContrast: textRegions.reduce((sum, region) => sum + region.contrast, 0) / textRegions.length || 0,
          coverage: textRegions.length * 100 / (width * height / 100)
        },
        confidence: 0.6
      };
    } catch (error) {
      console.error('提取文字區域特徵失敗:', error);
      return {
        type: 'text_regions',
        data: {
          regionCount: 0,
          averageContrast: 0,
          coverage: 0
        },
        confidence: 0.1
      };
    }
  }

  // 提取完整圖片特徵
  async extractImageFeatures(imageUrl) {
    try {
      const features = {};
      
      // 並行提取各種特徵
      const [histogram, colors, edges, textRegions] = await Promise.all([
        this.extractColorHistogram(imageUrl),
        this.extractDominantColors(imageUrl),
        this.extractEdgeFeatures(imageUrl),
        this.extractTextRegionFeatures(imageUrl)
      ]);
      
      features.colorHistogram = histogram;
      features.dominantColors = colors;
      features.edgeFeatures = edges;
      features.textRegions = textRegions;
      
      // 計算整體信心度
      const confidences = [histogram.confidence, colors.confidence, edges.confidence, textRegions.confidence];
      features.overallConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
      
      return features;
    } catch (error) {
      console.error('提取圖片特徵失敗:', error);
      return {
        colorHistogram: { type: 'color_histogram', data: [], confidence: 0.1 },
        dominantColors: { type: 'dominant_colors', data: [], confidence: 0.1 },
        edgeFeatures: { type: 'edge_features', data: {}, confidence: 0.1 },
        textRegions: { type: 'text_regions', data: {}, confidence: 0.1 },
        overallConfidence: 0.1
      };
    }
  }

  // 計算相似度
  calculateSimilarity(features1, features2) {
    try {
      let totalSimilarity = 0;
      let weightSum = 0;
      
      // 顏色直方圖相似度
      if (features1.colorHistogram && features2.colorHistogram) {
        const histSimilarity = this.calculateHistogramSimilarity(
          features1.colorHistogram.data,
          features2.colorHistogram.data
        );
        totalSimilarity += histSimilarity * 0.4; // 權重40%
        weightSum += 0.4;
      }
      
      // 主要顏色相似度
      if (features1.dominantColors && features2.dominantColors) {
        const colorSimilarity = this.calculateColorSimilarity(
          features1.dominantColors.data,
          features2.dominantColors.data
        );
        totalSimilarity += colorSimilarity * 0.3; // 權重30%
        weightSum += 0.3;
      }
      
      // 邊緣特徵相似度
      if (features1.edgeFeatures && features2.edgeFeatures) {
        const edgeSimilarity = this.calculateEdgeSimilarity(
          features1.edgeFeatures.data,
          features2.edgeFeatures.data
        );
        totalSimilarity += edgeSimilarity * 0.2; // 權重20%
        weightSum += 0.2;
      }
      
      // 文字區域相似度
      if (features1.textRegions && features2.textRegions) {
        const textSimilarity = this.calculateTextSimilarity(
          features1.textRegions.data,
          features2.textRegions.data
        );
        totalSimilarity += textSimilarity * 0.1; // 權重10%
        weightSum += 0.1;
      }
      
      return weightSum > 0 ? totalSimilarity / weightSum : 0;
    } catch (error) {
      console.error('計算相似度失敗:', error);
      return 0;
    }
  }

  // 輔助方法
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  calculateGradientX(data, idx, width) {
    const left = this.getGrayValue(data, idx - 4);
    const right = this.getGrayValue(data, idx + 4);
    return right - left;
  }

  calculateGradientY(data, idx, width) {
    const top = this.getGrayValue(data, idx - width * 4);
    const bottom = this.getGrayValue(data, idx + width * 4);
    return bottom - top;
  }

  getGrayValue(data, idx) {
    if (idx < 0 || idx >= data.length) return 0;
    return data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  calculateLocalContrast(data, x, y, width, size) {
    const values = [];
    for (let dy = -size/2; dy <= size/2; dy++) {
      for (let dx = -size/2; dx <= size/2; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        if (idx >= 0 && idx < data.length) {
          values.push(this.getGrayValue(data, idx));
        }
      }
    }
    
    if (values.length === 0) return 0;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    return max - min;
  }

  calculateHistogramSimilarity(hist1, hist2) {
    if (hist1.length !== hist2.length) return 0;
    
    let sum = 0;
    for (let i = 0; i < hist1.length; i++) {
      sum += Math.min(hist1[i], hist2[i]);
    }
    return sum;
  }

  calculateColorSimilarity(colors1, colors2) {
    let totalSimilarity = 0;
    const maxColors = Math.max(colors1.length, colors2.length);
    
    for (let i = 0; i < maxColors; i++) {
      const color1 = colors1[i] || { rgb: [0, 0, 0] };
      const color2 = colors2[i] || { rgb: [0, 0, 0] };
      
      const distance = this.calculateColorDistance(color1.rgb, color2.rgb);
      const similarity = Math.max(0, 1 - distance / 441.67); // 441.67 = sqrt(255^2 + 255^2 + 255^2)
      totalSimilarity += similarity;
    }
    
    return totalSimilarity / maxColors;
  }

  calculateColorDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }

  calculateEdgeSimilarity(edges1, edges2) {
    const edgeDensityDiff = Math.abs(edges1.edgeDensity - edges2.edgeDensity);
    const magnitudeDiff = Math.abs(edges1.averageMagnitude - edges2.averageMagnitude);
    
    return Math.max(0, 1 - (edgeDensityDiff + magnitudeDiff / 100) / 2);
  }

  calculateTextSimilarity(text1, text2) {
    const coverageDiff = Math.abs(text1.coverage - text2.coverage);
    const contrastDiff = Math.abs(text1.averageContrast - text2.averageContrast);
    
    return Math.max(0, 1 - (coverageDiff / 100 + contrastDiff / 255) / 2);
  }
}

export default new ImageFeatureService();
