// 圖片處理工具類
class ImageUtils {
  // 壓縮圖片
  async compressImage(file, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 計算新的尺寸
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 轉換為 Blob
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          `image/${format}`,
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // 調整圖片大小
  async resizeImage(imageFile, targetWidth, targetHeight) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // 使用高品質縮放
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 繪製圖片
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // 轉換為 Blob
        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], imageFile.name, {
              type: imageFile.type,
              lastModified: Date.now(),
            });
            
            // 添加尺寸資訊
            resizedFile.width = targetWidth;
            resizedFile.height = targetHeight;
            resizedFile.size = blob.size;
            
            resolve(resizedFile);
          },
          imageFile.type,
          0.9
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // 增強圖片品質
  async enhanceImage(imageFile) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 繪製原始圖片
        ctx.drawImage(img, 0, 0);
        
        // 獲取圖片數據
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 應用圖片增強算法
        this.applyImageEnhancement(data, canvas.width, canvas.height);
        
        // 將增強後的數據放回畫布
        ctx.putImageData(imageData, 0, 0);
        
        // 轉換為 Blob
        canvas.toBlob(
          (blob) => {
            const enhancedFile = new File([blob], imageFile.name, {
              type: imageFile.type,
              lastModified: Date.now(),
            });
            
            enhancedFile.width = img.width;
            enhancedFile.height = img.height;
            enhancedFile.size = blob.size;
            
            resolve(enhancedFile);
          },
          imageFile.type,
          0.95
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // 應用圖片增強算法
  applyImageEnhancement(data, width, height) {
    // 自動對比度增強
    this.enhanceContrast(data);
    
    // 銳化處理
    this.sharpenImage(data, width, height);
    
    // 降噪處理
    this.reduceNoise(data, width, height);
  }

  // 增強對比度
  enhanceContrast(data) {
    // 找到最小和最大值
    let min = 255;
    let max = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      min = Math.min(min, brightness);
      max = Math.max(max, brightness);
    }
    
    // 應用對比度拉伸
    const range = max - min;
    if (range > 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, ((data[i] - min) / range) * 255));
        data[i + 1] = Math.max(0, Math.min(255, ((data[i + 1] - min) / range) * 255));
        data[i + 2] = Math.max(0, Math.min(255, ((data[i + 2] - min) / range) * 255));
      }
    }
  }

  // 銳化圖片
  sharpenImage(data, width, height) {
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];
    
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += tempData[idx] * kernel[ky + 1][kx + 1];
            }
          }
          const idx = (y * width + x) * 4 + c;
          data[idx] = Math.max(0, Math.min(255, sum));
        }
      }
    }
  }

  // 降噪處理
  reduceNoise(data, width, height) {
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          // 計算3x3鄰域的中位數
          const values = [];
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              values.push(tempData[idx]);
            }
          }
          values.sort((a, b) => a - b);
          const idx = (y * width + x) * 4 + c;
          data[idx] = values[4]; // 中位數
        }
      }
    }
  }

  // 提取圖片特徵
  async extractFeatures(imageFile) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 提取多種特徵
        const features = {
          // 顏色特徵
          colorHistogram: this.extractColorHistogram(data),
          
          // 紋理特徵
          textureFeatures: this.extractTextureFeatures(data, canvas.width, canvas.height),
          
          // 邊緣特徵
          edgeFeatures: this.extractEdgeFeatures(data, canvas.width, canvas.height),
          
          // 形狀特徵
          shapeFeatures: this.extractShapeFeatures(data, canvas.width, canvas.height),
          
          // 統計特徵
          statisticalFeatures: this.extractStatisticalFeatures(data),
          
          // 圖片元數據
          metadata: {
            width: canvas.width,
            height: canvas.height,
            aspectRatio: canvas.width / canvas.height,
            totalPixels: canvas.width * canvas.height
          }
        };
        
        resolve(features);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // 提取詳細特徵
  async extractDetailedFeatures(imageFile) {
    const basicFeatures = await this.extractFeatures(imageFile);
    
    // 添加更多詳細特徵
    const detailedFeatures = {
      ...basicFeatures,
      
      // 區域特徵
      regionalFeatures: await this.extractRegionalFeatures(imageFile),
      
      // 頻域特徵
      frequencyFeatures: await this.extractFrequencyFeatures(imageFile),
      
      // 局部二值模式
      lbpFeatures: await this.extractLBPFeatures(imageFile),
      
      // 梯度方向直方圖
      hogFeatures: await this.extractHOGFeatures(imageFile)
    };
    
    return detailedFeatures;
  }

  // 提取顏色直方圖
  extractColorHistogram(data) {
    const histogram = {
      red: new Array(256).fill(0),
      green: new Array(256).fill(0),
      blue: new Array(256).fill(0),
      gray: new Array(256).fill(0)
    };
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = Math.round((r + g + b) / 3);
      
      histogram.red[r]++;
      histogram.green[g]++;
      histogram.blue[b]++;
      histogram.gray[gray]++;
    }
    
    // 正規化
    const total = data.length / 4;
    for (let i = 0; i < 256; i++) {
      histogram.red[i] /= total;
      histogram.green[i] /= total;
      histogram.blue[i] /= total;
      histogram.gray[i] /= total;
    }
    
    return histogram;
  }

  // 提取紋理特徵
  extractTextureFeatures(data, width, height) {
    // 計算灰度共生矩陣
    const glcm = this.calculateGLCM(data, width, height);
    
    // 計算紋理特徵
    return {
      contrast: this.calculateContrast(glcm),
      homogeneity: this.calculateHomogeneity(glcm),
      energy: this.calculateEnergy(glcm),
      correlation: this.calculateCorrelation(glcm)
    };
  }

  // 計算灰度共生矩陣
  calculateGLCM(data, width, height) {
    const glcm = Array(256).fill().map(() => Array(256).fill(0));
    
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const idx1 = (y * width + x) * 4;
        const idx2 = (y * width + (x + 1)) * 4;
        
        const gray1 = Math.round((data[idx1] + data[idx1 + 1] + data[idx1 + 2]) / 3);
        const gray2 = Math.round((data[idx2] + data[idx2 + 1] + data[idx2 + 2]) / 3);
        
        glcm[gray1][gray2]++;
        glcm[gray2][gray1]++;
      }
    }
    
    return glcm;
  }

  // 計算對比度
  calculateContrast(glcm) {
    let contrast = 0;
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        contrast += glcm[i][j] * Math.pow(i - j, 2);
      }
    }
    return contrast;
  }

  // 計算同質性
  calculateHomogeneity(glcm) {
    let homogeneity = 0;
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        homogeneity += glcm[i][j] / (1 + Math.pow(i - j, 2));
      }
    }
    return homogeneity;
  }

  // 計算能量
  calculateEnergy(glcm) {
    let energy = 0;
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        energy += Math.pow(glcm[i][j], 2);
      }
    }
    return energy;
  }

  // 計算相關性
  calculateCorrelation(glcm) {
    // 簡化的相關性計算
    let correlation = 0;
    let sum = 0;
    
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        sum += glcm[i][j];
        correlation += i * j * glcm[i][j];
      }
    }
    
    return correlation / sum;
  }

  // 提取邊緣特徵
  extractEdgeFeatures(data, width, height) {
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    let edgeStrength = 0;
    let edgeCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            
            gx += gray * sobelX[kernelIdx];
            gy += gray * sobelY[kernelIdx];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        if (magnitude > 50) { // 邊緣閾值
          edgeCount++;
        }
        edgeStrength += magnitude;
      }
    }
    
    return {
      edgeStrength: edgeStrength / (width * height),
      edgeDensity: edgeCount / (width * height),
      averageEdgeMagnitude: edgeStrength / edgeCount || 0
    };
  }

  // 提取形狀特徵
  extractShapeFeatures(data, width, height) {
    // 簡化的形狀特徵提取
    let foregroundPixels = 0;
    let perimeter = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        if (gray < 128) { // 前景像素
          foregroundPixels++;
          
          // 檢查邊界
          if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            perimeter++;
          } else {
            // 檢查鄰居
            const neighbors = [
              data[((y - 1) * width + x) * 4],
              data[((y + 1) * width + x) * 4],
              data[(y * width + (x - 1)) * 4],
              data[(y * width + (x + 1)) * 4]
            ];
            
            if (neighbors.some(n => n > 128)) {
              perimeter++;
            }
          }
        }
      }
    }
    
    const area = foregroundPixels;
    const compactness = (perimeter * perimeter) / (4 * Math.PI * area) || 0;
    
    return {
      area: area,
      perimeter: perimeter,
      compactness: compactness,
      aspectRatio: width / height
    };
  }

  // 提取統計特徵
  extractStatisticalFeatures(data) {
    let sum = 0;
    let sumSquared = 0;
    let min = 255;
    let max = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += gray;
      sumSquared += gray * gray;
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }
    
    const count = data.length / 4;
    const mean = sum / count;
    const variance = (sumSquared / count) - (mean * mean);
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: mean,
      variance: variance,
      stdDev: stdDev,
      min: min,
      max: max,
      range: max - min,
      skewness: this.calculateSkewness(data, mean, stdDev),
      kurtosis: this.calculateKurtosis(data, mean, stdDev)
    };
  }

  // 計算偏度
  calculateSkewness(data, mean, stdDev) {
    let sum = 0;
    const count = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += Math.pow((gray - mean) / stdDev, 3);
    }
    
    return sum / count;
  }

  // 計算峰度
  calculateKurtosis(data, mean, stdDev) {
    let sum = 0;
    const count = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += Math.pow((gray - mean) / stdDev, 4);
    }
    
    return (sum / count) - 3; // 減去正態分佈的峰度
  }

  // 提取區域特徵
  async extractRegionalFeatures(imageFile) {
    // 簡化的區域特徵提取
    return {
      centerRegion: await this.extractRegionFeatures(imageFile, 'center'),
      cornerRegions: await this.extractRegionFeatures(imageFile, 'corners'),
      edgeRegions: await this.extractRegionFeatures(imageFile, 'edges')
    };
  }

  // 提取頻域特徵
  async extractFrequencyFeatures(imageFile) {
    // 簡化的頻域特徵提取
    return {
      dominantFrequencies: [],
      frequencyEnergy: 0,
      spectralCentroid: 0
    };
  }

  // 提取LBP特徵
  async extractLBPFeatures(imageFile) {
    // 簡化的LBP特徵提取
    return {
      lbpHistogram: new Array(256).fill(0),
      lbpUniformity: 0
    };
  }

  // 提取HOG特徵
  async extractHOGFeatures(imageFile) {
    // 簡化的HOG特徵提取
    return {
      hogHistogram: new Array(9).fill(0),
      gradientMagnitude: 0,
      gradientDirection: 0
    };
  }

  // 提取區域特徵
  async extractRegionFeatures(imageFile, regionType) {
    // 簡化的區域特徵提取
    return {
      regionType: regionType,
      averageIntensity: 0,
      textureVariance: 0,
      colorDistribution: {}
    };
  }
  
  // 檢查圖片品質
  async checkImageQuality(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 計算亮度
        let brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        brightness /= data.length / 4;
        
        // 計算對比度
        let contrast = 0;
        for (let i = 0; i < data.length; i += 4) {
          const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          contrast += Math.abs(pixelBrightness - brightness);
        }
        contrast /= data.length / 4;
        
        // 計算銳度
        let sharpness = 0;
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;
            const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const left = (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3;
            const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
            const top = (data[(y - 1) * canvas.width * 4 + x * 4] + 
                        data[(y - 1) * canvas.width * 4 + x * 4 + 1] + 
                        data[(y - 1) * canvas.width * 4 + x * 4 + 2]) / 3;
            const bottom = (data[(y + 1) * canvas.width * 4 + x * 4] + 
                           data[(y + 1) * canvas.width * 4 + x * 4 + 1] + 
                           data[(y + 1) * canvas.width * 4 + x * 4 + 2]) / 3;
            
            sharpness += Math.abs(current - left) + Math.abs(current - right) + 
                        Math.abs(current - top) + Math.abs(current - bottom);
          }
        }
        sharpness /= (canvas.width - 2) * (canvas.height - 2);
        
        const qualityScore = this.calculateQualityScore(brightness, contrast, sharpness);
        
        resolve({
          brightness,
          contrast,
          sharpness,
          qualityScore,
          isGoodQuality: qualityScore > 0.7
        });
      };
      
      img.onerror = () => {
        resolve({
          brightness: 0,
          contrast: 0,
          sharpness: 0,
          qualityScore: 0,
          isGoodQuality: false
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 計算品質分數
  calculateQualityScore(brightness, contrast, sharpness) {
    // 亮度分數 (理想範圍: 50-200)
    const brightnessScore = brightness >= 50 && brightness <= 200 ? 1 : 
                           Math.max(0, 1 - Math.abs(brightness - 125) / 125);
    
    // 對比度分數 (理想範圍: 20-100)
    const contrastScore = contrast >= 20 && contrast <= 100 ? 1 : 
                         Math.max(0, 1 - Math.abs(contrast - 60) / 60);
    
    // 銳度分數 (理想範圍: 5-50)
    const sharpnessScore = sharpness >= 5 && sharpness <= 50 ? 1 : 
                          Math.max(0, 1 - Math.abs(sharpness - 27.5) / 27.5);
    
    // 綜合分數
    return (brightnessScore * 0.3 + contrastScore * 0.4 + sharpnessScore * 0.3);
  }

  // 獲取圖片資訊
  async getImageInfo(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          fileSize: file.size,
          fileType: file.type,
          lastModified: file.lastModified
        });
      };
      
      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          aspectRatio: 0,
          fileSize: file.size,
          fileType: file.type,
          lastModified: file.lastModified
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 創建縮圖
  async createThumbnail(file, size = 200) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 計算縮圖尺寸
        let { width, height } = img;
        const aspectRatio = width / height;
        
        if (width > height) {
          width = size;
          height = size / aspectRatio;
        } else {
          height = size;
          width = size * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 繪製縮圖
        ctx.drawImage(img, 0, 0, width, height);
        
        // 轉換為 Blob
        canvas.toBlob(
          (blob) => {
            const thumbnail = new File([blob], `thumb_${file.name}`, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(thumbnail);
          },
          file.type,
          0.8
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // 驗證圖片格式
  validateImageFormat(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  }

  // 驗證圖片大小
  validateImageSize(file, maxSize = 10 * 1024 * 1024) { // 10MB
    return file.size <= maxSize;
  }

  // 驗證圖片尺寸
  async validateImageDimensions(file, minWidth = 100, minHeight = 100) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          isValid: img.width >= minWidth && img.height >= minHeight,
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        resolve({
          isValid: false,
          width: 0,
          height: 0
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 綜合驗證
  async validateImage(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024,
      minWidth = 100,
      minHeight = 100,
      checkQuality = true
    } = options;

    const results = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 檢查格式
    if (!this.validateImageFormat(file)) {
      results.isValid = false;
      results.errors.push('不支援的圖片格式');
    }

    // 檢查大小
    if (!this.validateImageSize(file, maxSize)) {
      results.isValid = false;
      results.errors.push('圖片檔案過大');
    }

    // 檢查尺寸
    const dimensionResult = await this.validateImageDimensions(file, minWidth, minHeight);
    if (!dimensionResult.isValid) {
      results.isValid = false;
      results.errors.push('圖片尺寸過小');
    }

    // 檢查品質
    if (checkQuality) {
      const qualityResult = await this.checkImageQuality(file);
      if (!qualityResult.isGoodQuality) {
        results.warnings.push('圖片品質較低，可能影響辨識效果');
      }
    }

    return results;
  }

  // 格式化檔案大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 獲取圖片URL
  getImageUrl(file) {
    return URL.createObjectURL(file);
  }

  // 釋放圖片URL
  revokeImageUrl(url) {
    URL.revokeObjectURL(url);
  }
}

// 創建單例實例
const imageUtils = new ImageUtils();

export default imageUtils;
