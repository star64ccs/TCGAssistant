import { apiService, API_ENDPOINTS, retryRequest, cachedRequest } from './api';
import imageUtils from '../utils/imageUtils';
import notificationUtils from '../utils/notificationUtils';

// 真實API配置
const REAL_API_CONFIG = {
  // 卡牌辨識API
  CARD_RECOGNITION: {
    // Google Cloud Vision API
    GOOGLE_VISION: {
      endpoint: 'https://vision.googleapis.com/v1/images:annotate',
      apiKey: process.env.REACT_APP_GOOGLE_VISION_API_KEY,
    },
    // AWS Rekognition
    AWS_REKOGNITION: {
      endpoint: 'https://rekognition.amazonaws.com',
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
    // Azure Computer Vision
    AZURE_VISION: {
      endpoint: 'https://api.cognitive.microsoft.com/vision/v3.2/analyze',
      apiKey: process.env.REACT_APP_AZURE_VISION_API_KEY,
    },
    // 自定義AI模型
    CUSTOM_AI: {
      endpoint: 'https://ai.tcg-assistant.com/v1/recognize',
      apiKey: process.env.REACT_APP_CUSTOM_AI_API_KEY,
    },
  },
  
  // 價格API
  PRICE_APIS: {
    // TCGPlayer API
    TCGPLAYER: {
      endpoint: 'https://api.tcgplayer.com/v1.39.0',
      apiKey: process.env.REACT_APP_TCGPLAYER_API_KEY,
      publicKey: process.env.REACT_APP_TCGPLAYER_PUBLIC_KEY,
      privateKey: process.env.REACT_APP_TCGPLAYER_PRIVATE_KEY,
    },
    // eBay API
    EBAY: {
      endpoint: 'https://api.ebay.com/buy/browse/v1/item_summary/search',
      appId: process.env.REACT_APP_EBAY_APP_ID,
      certId: process.env.REACT_APP_EBAY_CERT_ID,
      clientSecret: process.env.REACT_APP_EBAY_CLIENT_SECRET,
    },
    // Cardmarket API
    CARDMARKET: {
      endpoint: 'https://api.cardmarket.com/ws/v2.0',
      appToken: process.env.REACT_APP_CARDMARKET_APP_TOKEN,
      appSecret: process.env.REACT_APP_CARDMARKET_APP_SECRET,
      accessToken: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN,
      accessTokenSecret: process.env.REACT_APP_CARDMARKET_ACCESS_TOKEN_SECRET,
    },
    // PriceCharting API
    PRICECHARTING: {
      endpoint: 'https://www.pricecharting.com/api',
      apiKey: process.env.REACT_APP_PRICECHARTING_API_KEY,
    },
    // Mercari API (需要特殊授權)
    MERCARI: {
      endpoint: 'https://api.mercari.com/v1',
      apiKey: process.env.REACT_APP_MERCARI_API_KEY,
    },
    // SNKRDUNK API (需要特殊授權)
    SNKRDUNK: {
      endpoint: 'https://api.snkrdunk.com/v1',
      apiKey: process.env.REACT_APP_SNKRDUNK_API_KEY,
    },
  },
  
  // AI分析API
  AI_ANALYSIS: {
    // OpenAI GPT-4
    OPENAI: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      model: 'gpt-4',
    },
    // Google PaLM
    GOOGLE_PALM: {
      endpoint: 'https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText',
      apiKey: process.env.REACT_APP_GOOGLE_PALM_API_KEY,
    },
    // Azure OpenAI
    AZURE_OPENAI: {
      endpoint: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions',
      apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
    },
  },
};

// 真實API服務類
class RealApiService {
  constructor() {
    this.activeApis = this.detectActiveApis();
    this.fallbackOrder = this.getFallbackOrder();
  }

  // 檢測可用的API
  detectActiveApis() {
    const active = {
      recognition: [],
      pricing: [],
      ai: [],
    };

    // 檢測卡牌辨識API
    if (REAL_API_CONFIG.CARD_RECOGNITION.GOOGLE_VISION.apiKey) {
      active.recognition.push('GOOGLE_VISION');
    }
    if (REAL_API_CONFIG.CARD_RECOGNITION.AWS_REKOGNITION.accessKeyId) {
      active.recognition.push('AWS_REKOGNITION');
    }
    if (REAL_API_CONFIG.CARD_RECOGNITION.AZURE_VISION.apiKey) {
      active.recognition.push('AZURE_VISION');
    }
    if (REAL_API_CONFIG.CARD_RECOGNITION.CUSTOM_AI.apiKey) {
      active.recognition.push('CUSTOM_AI');
    }

    // 檢測價格API
    if (REAL_API_CONFIG.PRICE_APIS.TCGPLAYER.apiKey) {
      active.pricing.push('TCGPLAYER');
    }
    if (REAL_API_CONFIG.PRICE_APIS.EBAY.appId) {
      active.pricing.push('EBAY');
    }
    if (REAL_API_CONFIG.PRICE_APIS.CARDMARKET.appToken) {
      active.pricing.push('CARDMARKET');
    }
    if (REAL_API_CONFIG.PRICE_APIS.PRICECHARTING.apiKey) {
      active.pricing.push('PRICECHARTING');
    }
    if (REAL_API_CONFIG.PRICE_APIS.MERCARI.apiKey) {
      active.pricing.push('MERCARI');
    }
    if (REAL_API_CONFIG.PRICE_APIS.SNKRDUNK.apiKey) {
      active.pricing.push('SNKRDUNK');
    }

    // 檢測AI API
    if (REAL_API_CONFIG.AI_ANALYSIS.OPENAI.apiKey) {
      active.ai.push('OPENAI');
    }
    if (REAL_API_CONFIG.AI_ANALYSIS.GOOGLE_PALM.apiKey) {
      active.ai.push('GOOGLE_PALM');
    }
    if (REAL_API_CONFIG.AI_ANALYSIS.AZURE_OPENAI.apiKey) {
      active.ai.push('AZURE_OPENAI');
    }

    return active;
  }

  // 獲取備用順序
  getFallbackOrder() {
    return {
      recognition: ['CUSTOM_AI', 'GOOGLE_VISION', 'AWS_REKOGNITION', 'AZURE_VISION'],
      pricing: ['TCGPLAYER', 'EBAY', 'CARDMARKET', 'PRICECHARTING', 'MERCARI', 'SNKRDUNK'],
      ai: ['OPENAI', 'GOOGLE_PALM', 'AZURE_OPENAI'],
    };
  }

  // 工具方法
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  validateRecognitionResult(result) {
    return result && 
           result.cardInfo && 
           result.cardInfo.name && 
           result.confidence > 0.5;
  }

  aggregatePrices(priceResults) {
    const aggregated = {
      platforms: {},
      average: 0,
      median: 0,
      min: Infinity,
      max: -Infinity,
      count: priceResults.length,
    };

    const prices = [];

    priceResults.forEach(result => {
      if (result.price && result.price > 0) {
        aggregated.platforms[result.platform] = result.price;
        prices.push(result.price);
        aggregated.min = Math.min(aggregated.min, result.price);
        aggregated.max = Math.max(aggregated.max, result.price);
      }
    });

    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      aggregated.average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      aggregated.median = prices[Math.floor(prices.length / 2)];
    }

    return aggregated;
  }

  // 真實卡牌辨識
  async recognizeCardReal(imageFile, options = {}) {
    const {
      useFallback = true,
      maxRetries = 3,
      onProgress = null,
    } = options;

    try {
      // 圖片預處理
      const processedImage = await imageUtils.compressImage(imageFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });

      // 驗證圖片
      const validation = await imageUtils.validateImage(processedImage);
      if (!validation.isValid) {
        throw new Error(`圖片驗證失敗: ${validation.errors.join(', ')}`);
      }

      // 轉換為base64
      const base64Image = await this.fileToBase64(processedImage);

      // 嘗試不同的辨識API
      const availableApis = this.activeApis.recognition;
      if (availableApis.length === 0) {
        throw new Error('沒有可用的卡牌辨識API');
      }

      let lastError = null;
      for (const apiName of availableApis) {
        try {
          const result = await this.callRecognitionApi(apiName, base64Image, onProgress);
          
          // 驗證結果
          if (this.validateRecognitionResult(result)) {
            return {
              success: true,
              data: result,
              apiUsed: apiName,
              timestamp: new Date().toISOString(),
            };
          }
        } catch (error) {
          lastError = error;
          console.warn(`${apiName} 辨識失敗:`, error.message);
          
          if (!useFallback) {
            break;
          }
        }
      }

      throw lastError || new Error('所有辨識API都失敗了');

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 調用辨識API
  async callRecognitionApi(apiName, base64Image, onProgress) {
    switch (apiName) {
      case 'GOOGLE_VISION':
        return await this.callGoogleVisionApi(base64Image, onProgress);
      case 'AWS_REKOGNITION':
        return await this.callAwsRekognitionApi(base64Image, onProgress);
      case 'AZURE_VISION':
        return await this.callAzureVisionApi(base64Image, onProgress);
      case 'CUSTOM_AI':
        return await this.callCustomAiApi(base64Image, onProgress);
      default:
        throw new Error(`不支援的API: ${apiName}`);
    }
  }

  // Google Vision API
  async callGoogleVisionApi(base64Image, onProgress) {
    const config = REAL_API_CONFIG.CARD_RECOGNITION.GOOGLE_VISION;
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image.split(',')[1], // 移除 data:image/jpeg;base64, 前綴
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10,
            },
            {
              type: 'LABEL_DETECTION',
              maxResults: 20,
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10,
            },
          ],
        },
      ],
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
    return this.parseGoogleVisionResult(data);
  }

  // AWS Rekognition API
  async callAwsRekognitionApi(base64Image, onProgress) {
    const config = REAL_API_CONFIG.CARD_RECOGNITION.AWS_REKOGNITION;
    
    // 注意：實際實現需要AWS SDK
    // 這裡提供基本結構
    const requestBody = {
      Image: {
        Bytes: Buffer.from(base64Image.split(',')[1], 'base64'),
      },
      MaxLabels: 20,
      MinConfidence: 70,
    };

    // 使用AWS SDK v3
    const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
    
    const client = new RekognitionClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const command = new DetectLabelsCommand(requestBody);
    const response = await client.send(command);
    
    return this.parseAwsRekognitionResult(response);
  }

  // Azure Computer Vision API
  async callAzureVisionApi(base64Image, onProgress) {
    const config = REAL_API_CONFIG.CARD_RECOGNITION.AZURE_VISION;
    
    const requestBody = {
      url: `data:image/jpeg;base64,${base64Image.split(',')[1]}`,
    };

    const response = await fetch(config.endpoint, {
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
    return this.parseAzureVisionResult(data);
  }

  // 自定義AI API
  async callCustomAiApi(base64Image, onProgress) {
    const config = REAL_API_CONFIG.CARD_RECOGNITION.CUSTOM_AI;
    
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('api_key', config.apiKey);

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`自定義AI API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseCustomAiResult(data);
  }

  // 解析結果方法
  parseGoogleVisionResult(data) {
    // 實現Google Vision結果解析
    const textAnnotations = data.responses[0]?.textAnnotations || [];
    const labels = data.responses[0]?.labelAnnotations || [];
    
    return {
      cardInfo: {
        name: this.extractCardName(textAnnotations, labels),
        confidence: this.calculateConfidence(data.responses[0]),
      },
      rawData: data,
    };
  }

  parseAwsRekognitionResult(data) {
    // 實現AWS Rekognition結果解析
    const labels = data.Labels || [];
    
    return {
      cardInfo: {
        name: this.extractCardNameFromLabels(labels),
        confidence: this.calculateAwsConfidence(labels),
      },
      rawData: data,
    };
  }

  parseAzureVisionResult(data) {
    // 實現Azure Vision結果解析
    const tags = data.tags || [];
    const description = data.description || {};
    
    return {
      cardInfo: {
        name: this.extractCardNameFromAzure(tags, description),
        confidence: this.calculateAzureConfidence(data),
      },
      rawData: data,
    };
  }

  parseCustomAiResult(data) {
    // 實現自定義AI結果解析
    return {
      cardInfo: {
        name: data.card_name,
        series: data.series,
        number: data.card_number,
        rarity: data.rarity,
        type: data.type,
        hp: data.hp,
        confidence: data.confidence,
      },
      rawData: data,
    };
  }

  // 輔助方法
  extractCardName(textAnnotations, labels) {
    // 實現卡牌名稱提取邏輯
    const text = textAnnotations[0]?.description || '';
    const labelNames = labels.map(label => label.description).join(' ');
    
    // 這裡需要實現更複雜的邏輯來識別卡牌名稱
    return text.split('\n')[0] || 'Unknown Card';
  }

  extractCardNameFromLabels(labels) {
    const labelNames = labels.map(label => label.Name).join(' ');
    return labelNames || 'Unknown Card';
  }

  extractCardNameFromAzure(tags, description) {
    const tagNames = tags.map(tag => tag.name).join(' ');
    const caption = description.captions?.[0]?.text || '';
    return caption || tagNames || 'Unknown Card';
  }

  calculateConfidence(response) {
    // 實現置信度計算
    return 0.85; // 示例值
  }

  calculateAwsConfidence(labels) {
    const avgConfidence = labels.reduce((sum, label) => sum + label.Confidence, 0) / labels.length;
    return avgConfidence / 100;
  }

  calculateAzureConfidence(data) {
    // 實現Azure置信度計算
    return 0.80; // 示例值
  }

  // 真實價格查詢
  async getCardPricesReal(cardInfo, options = {}) {
    const {
      platforms = ['TCGPLAYER', 'EBAY', 'CARDMARKET', 'PRICECHARTING'],
      useFallback = true,
      maxRetries = 3,
    } = options;

    try {
      const availablePlatforms = platforms.filter(platform => 
        this.activeApis.pricing.includes(platform)
      );

      if (availablePlatforms.length === 0) {
        throw new Error('沒有可用的價格API');
      }

      const pricePromises = availablePlatforms.map(platform =>
        this.getPriceFromPlatform(platform, cardInfo, maxRetries)
      );

      const results = await Promise.allSettled(pricePromises);
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulResults.length === 0) {
        throw new Error('所有價格API都失敗了');
      }

      // 整合價格數據
      const aggregatedPrices = this.aggregatePrices(successfulResults);

      return {
        success: true,
        data: aggregatedPrices,
        platformsUsed: successfulResults.map(r => r.platform),
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 從特定平台獲取價格
  async getPriceFromPlatform(platform, cardInfo, maxRetries) {
    return await retryRequest(async () => {
      switch (platform) {
        case 'TCGPLAYER':
          return await this.getTcgPlayerPrice(cardInfo);
        case 'EBAY':
          return await this.getEbayPrice(cardInfo);
        case 'CARDMARKET':
          return await this.getCardmarketPrice(cardInfo);
        case 'PRICECHARTING':
          return await this.getPriceChartingPrice(cardInfo);
        case 'MERCARI':
          return await this.getMercariPrice(cardInfo);
        case 'SNKRDUNK':
          return await this.getSnkrdunkPrice(cardInfo);
        default:
          throw new Error(`不支援的平台: ${platform}`);
      }
    }, maxRetries);
  }

  // TCGPlayer API
  async getTcgPlayerPrice(cardInfo) {
    const config = REAL_API_CONFIG.PRICE_APIS.TCGPLAYER;
    
    // 首先搜索卡牌
    const searchResponse = await fetch(
      `${config.endpoint}/catalog/products?name=${encodeURIComponent(cardInfo.name)}`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`TCGPlayer 搜索失敗: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const productId = searchData.results[0]?.productId;

    if (!productId) {
      throw new Error('未找到卡牌');
    }

    // 獲取價格
    const priceResponse = await fetch(
      `${config.endpoint}/pricing/product/${productId}`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    if (!priceResponse.ok) {
      throw new Error(`TCGPlayer 價格查詢失敗: ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();
    return this.parseTcgPlayerPrice(priceData, 'TCGPLAYER');
  }

  // eBay API
  async getEbayPrice(cardInfo) {
    const config = REAL_API_CONFIG.PRICE_APIS.EBAY;
    
    const searchQuery = encodeURIComponent(`${cardInfo.name} ${cardInfo.series || ''}`);
    const response = await fetch(
      `${config.endpoint}?q=${searchQuery}&filter=conditions:{NEW|USED_EXCELLENT|USED_VERY_GOOD}&sort=price`,
      {
        headers: {
          'Authorization': `Bearer ${config.appId}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY-US',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`eBay API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseEbayPrice(data, 'EBAY');
  }

  // Cardmarket API
  async getCardmarketPrice(cardInfo) {
    const config = REAL_API_CONFIG.PRICE_APIS.CARDMARKET;
    
    const searchQuery = encodeURIComponent(cardInfo.name);
    const response = await fetch(
      `${config.endpoint}/products/find?search=${searchQuery}&game=1&language=1`,
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Cardmarket API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseCardmarketPrice(data, 'CARDMARKET');
  }

  // PriceCharting API
  async getPriceChartingPrice(cardInfo) {
    const config = REAL_API_CONFIG.PRICE_APIS.PRICECHARTING;
    
    const searchQuery = encodeURIComponent(cardInfo.name);
    const response = await fetch(
      `${config.endpoint}/product?t=${searchQuery}&api_token=${config.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`PriceCharting API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parsePriceChartingPrice(data, 'PRICECHARTING');
  }

  // Mercari API (需要特殊授權)
  async getMercariPrice(cardInfo) {
    const config = REAL_API_CONFIG.PRICE_APIS.MERCARI;
    
    // 注意：Mercari API 需要特殊授權和實現
    // 這裡提供基本結構
    const searchQuery = encodeURIComponent(cardInfo.name);
    const response = await fetch(
      `${config.endpoint}/search?q=${searchQuery}&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Mercari API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseMercariPrice(data, 'MERCARI');
  }

  // SNKRDUNK API (需要特殊授權)
  async getSnkrdunkPrice(cardInfo) {
    const config = REAL_API_CONFIG.PRICE_APIS.SNKRDUNK;
    
    // 注意：SNKRDUNK API 需要特殊授權和實現
    // 這裡提供基本結構
    const searchQuery = encodeURIComponent(cardInfo.name);
    const response = await fetch(
      `${config.endpoint}/search?q=${searchQuery}&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SNKRDUNK API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseSnkrdunkPrice(data, 'SNKRDUNK');
  }

  // 真實AI分析
  async analyzeWithAI(prompt, context = {}, options = {}) {
    const {
      model = 'OPENAI',
      maxTokens = 1000,
      temperature = 0.7,
    } = options;

    try {
      const availableModels = this.activeApis.ai;
      if (availableModels.length === 0) {
        throw new Error('沒有可用的AI API');
      }

      // 選擇最佳模型
      const selectedModel = availableModels.includes(model) ? model : availableModels[0];

      const result = await this.callAiApi(selectedModel, prompt, context, {
        maxTokens,
        temperature,
      });

      return {
        success: true,
        data: result,
        modelUsed: selectedModel,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 調用AI API
  async callAiApi(model, prompt, context, options) {
    switch (model) {
      case 'OPENAI':
        return await this.callOpenAiApi(prompt, context, options);
      case 'GOOGLE_PALM':
        return await this.callGooglePalmApi(prompt, context, options);
      case 'AZURE_OPENAI':
        return await this.callAzureOpenAiApi(prompt, context, options);
      default:
        throw new Error(`不支援的AI模型: ${model}`);
    }
  }

  // OpenAI API
  async callOpenAiApi(prompt, context, options) {
    const config = REAL_API_CONFIG.AI_ANALYSIS.OPENAI;
    
    const requestBody = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一個專業的TCG卡牌分析師，專門分析Pokemon和One Piece卡牌的價格趨勢、投資價值和市場分析。',
        },
        {
          role: 'user',
          content: `${prompt}\n\n上下文信息：${JSON.stringify(context)}`,
        },
      ],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    };

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseOpenAiResult(data);
  }

  // Google PaLM API
  async callGooglePalmApi(prompt, context, options) {
    const config = REAL_API_CONFIG.AI_ANALYSIS.GOOGLE_PALM;
    
    const requestBody = {
      prompt: {
        text: `${prompt}\n\n上下文信息：${JSON.stringify(context)}`,
      },
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
    };

    const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google PaLM API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseGooglePalmResult(data);
  }

  // Azure OpenAI API
  async callAzureOpenAiApi(prompt, context, options) {
    const config = REAL_API_CONFIG.AI_ANALYSIS.AZURE_OPENAI;
    
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: '你是一個專業的TCG卡牌分析師，專門分析Pokemon和One Piece卡牌的價格趨勢、投資價值和市場分析。',
        },
        {
          role: 'user',
          content: `${prompt}\n\n上下文信息：${JSON.stringify(context)}`,
        },
      ],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    };

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.parseAzureOpenAiResult(data);
  }

  // 價格解析方法
  parseTcgPlayerPrice(data, platform) {
    // 實現TCGPlayer價格解析
    const prices = data.results || [];
    const marketPrice = prices.find(p => p.subTypeName === 'Normal')?.marketPrice || 0;
    
    return {
      platform,
      price: marketPrice,
      currency: 'USD',
      condition: 'Near Mint',
      lastUpdated: new Date().toISOString(),
    };
  }

  parseEbayPrice(data, platform) {
    // 實現eBay價格解析
    const items = data.itemSummaries || [];
    const averagePrice = items.length > 0 
      ? items.reduce((sum, item) => sum + parseFloat(item.price.value), 0) / items.length
      : 0;
    
    return {
      platform,
      price: averagePrice,
      currency: 'USD',
      condition: 'Mixed',
      lastUpdated: new Date().toISOString(),
    };
  }

  parseCardmarketPrice(data, platform) {
    // 實現Cardmarket價格解析
    const products = data.data || [];
    const averagePrice = products.length > 0
      ? products.reduce((sum, product) => sum + parseFloat(product.priceGuide.PRICESELL || 0), 0) / products.length
      : 0;
    
    return {
      platform,
      price: averagePrice,
      currency: 'EUR',
      condition: 'Near Mint',
      lastUpdated: new Date().toISOString(),
    };
  }

  parsePriceChartingPrice(data, platform) {
    // 實現PriceCharting價格解析
    const price = parseFloat(data.price || 0);
    
    return {
      platform,
      price,
      currency: 'USD',
      condition: 'Near Mint',
      lastUpdated: new Date().toISOString(),
    };
  }

  parseMercariPrice(data, platform) {
    // 實現Mercari價格解析
    const items = data.data || [];
    const averagePrice = items.length > 0
      ? items.reduce((sum, item) => sum + parseFloat(item.price), 0) / items.length
      : 0;
    
    return {
      platform,
      price: averagePrice,
      currency: 'JPY',
      condition: 'Mixed',
      lastUpdated: new Date().toISOString(),
    };
  }

  parseSnkrdunkPrice(data, platform) {
    // 實現SNKRDUNK價格解析
    const items = data.data || [];
    const averagePrice = items.length > 0
      ? items.reduce((sum, item) => sum + parseFloat(item.price), 0) / items.length
      : 0;
    
    return {
      platform,
      price: averagePrice,
      currency: 'JPY',
      condition: 'Mixed',
      lastUpdated: new Date().toISOString(),
    };
  }

  // AI結果解析方法
  parseOpenAiResult(data) {
    return {
      response: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage,
    };
  }

  parseGooglePalmResult(data) {
    return {
      response: data.candidates[0]?.output || '',
      model: 'text-bison-001',
      usage: data.usageMetadata,
    };
  }

  parseAzureOpenAiResult(data) {
    return {
      response: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage,
    };
  }
}

export default new RealApiService();
