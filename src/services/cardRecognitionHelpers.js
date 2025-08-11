// 卡片識別輔助方法
export class CardRecognitionHelpers {
  // AWS 簽名方法
  static async makeAwsRequest(endpoint, action, requestBody, config, onProgress) {
    try {      onProgress && onProgress(`準備 AWS ${action} 請求...`);      // 簡化的 AWS API 調用（使用 HTTP POST）      const headers = {        'Content-Type': 'application/x-amz-json-1.1',        'X-Amz-Target': `RekognitionService.${action}`,        'Authorization': this.createAwsAuthHeader(config),      };      const response = await fetch(endpoint, {        method: 'POST',        headers,        body: JSON.stringify(requestBody),      });      if (!response.ok) {        const errorData = await response.json();        throw new Error(`AWS API 錯誤: ${response.status} - ${errorData.message || 'Unknown error'}`);      }      return await response.json();
    } catch (error) {      throw error;
    }
  }

  // 創建 AWS 授權標頭（簡化版本）
  static createAwsAuthHeader(config) {
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);    // 簡化的授權標頭
    return `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${date}/${config.region}/rekognition/aws4_request, SignedHeaders=host;x-amz-date, Signature=placeholder`;
  }

  // 從文本中提取卡片名稱
  static extractCardNameFromText(textAnnotations) {
    if (!textAnnotations || textAnnotations.length === 0) {
      return 'Unknown Card';
    }    // 卡片名稱通常出現在文本的前幾行
    const fullText = textAnnotations[0]?.description || '';
    const lines = fullText.split('\n').filter(line => line.trim());    // 常見的卡片名稱模式
    const cardNamePatterns = [      /^([^0-9\n]+)(?:\s+[0-9]+\/[0-9]+)?$/m, // 基本卡片名稱      /([A-Za-z\s]+)(?:\s+V(?:MAX)?)?/i, // Pokemon 卡片      /^([^#\n]+)(?:\s+#[0-9]+)?$/m, // 帶編號的卡片
    ];    for (const pattern of cardNamePatterns) {      const match = fullText.match(pattern);      if (match && match[1]) {        return match[1].trim();      }
    }    // 如果沒有匹配的模式，返回第一行
    return lines[0] || 'Unknown Card';
  }

  // 從標籤中提取卡片類型
  static extractCardTypeFromLabels(labelAnnotations) {
    const typeKeywords = {      'pokemon': ['pokemon', 'pikachu', 'charizard', 'trading card'],      'yugioh': ['yu-gi-oh', 'yugioh', 'duel monsters'],      'magic': ['magic', 'mtg', 'planeswalker'],      'onepiece': ['one piece', 'luffy', 'anime'],      'sports': ['baseball', 'football', 'basketball', 'hockey'],
    };    for (const label of labelAnnotations) {      const labelName = label.description?.toLowerCase() || '';      for (const [type, keywords] of Object.entries(typeKeywords)) {        if (keywords.some(keyword => labelName.includes(keyword))) {          return type;        }      }
    }    return 'trading_card';
  }

  // 從文本中提取稀有度
  static extractRarityFromText(textAnnotations) {
    if (!textAnnotations || textAnnotations.length === 0) {
      return 'Common';
    }    const fullText = textAnnotations[0]?.description?.toLowerCase() || '';    const rarityKeywords = {      'secret': ['secret rare', 'sr'],      'ultra': ['ultra rare', 'ur'],      'super': ['super rare'],      'rare': ['rare', 'r'],      'uncommon': ['uncommon', 'u'],      'common': ['common', 'c'],
    };    for (const [rarity, keywords] of Object.entries(rarityKeywords)) {      if (keywords.some(keyword => fullText.includes(keyword))) {        return rarity;      }
    }    return 'common';
  }

  // 計算 Google Vision 置信度
  static calculateGoogleConfidence(response) {
    if (!response) {
      return 0;
    }    const textConfidence = response.textAnnotations?.[0]?.confidence || 0;
    const labelConfidences = response.labelAnnotations?.map(l => l.score) || [];
    const objectConfidences = response.localizedObjectAnnotations?.map(o => o.score) || [];    const allConfidences = [textConfidence, ...labelConfidences, ...objectConfidences];    if (allConfidences.length === 0) {
      return 0;
    }    const average = allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length;
    return Math.round(average * 100);
  }

  // 從 AWS 標籤中提取卡片名稱
  static extractCardNameFromAwsLabels(labels) {
    // AWS Rekognition 主要識別物體，對文字識別有限
    // 我們根據標籤推測卡片類型
    const cardRelatedLabels = labels.filter(label =>      label.Name.toLowerCase().includes('card') ||      label.Name.toLowerCase().includes('game') ||      label.Name.toLowerCase().includes('trading'),
    );    if (cardRelatedLabels.length > 0) {      return `${cardRelatedLabels[0].Name} Card`;
    }    return 'Trading Card';
  }

  // 從 AWS 標籤中提取卡片類型
  static extractCardTypeFromAwsLabels(labels) {
    const typeKeywords = {      'pokemon': ['pokemon', 'game', 'toy'],      'sports': ['sport', 'baseball', 'football'],      'trading': ['trading', 'card', 'collectible'],
    };    for (const label of labels) {      const labelName = label.Name.toLowerCase();      for (const [type, keywords] of Object.entries(typeKeywords)) {        if (keywords.some(keyword => labelName.includes(keyword))) {          return type;        }      }
    }    return 'trading_card';
  }

  // 計算 AWS 置信度
  static calculateAwsConfidence(labels) {
    if (!labels || labels.length === 0) {
      return 0;
    }    const confidences = labels.map(l => l.Confidence);
    const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    return Math.round(average);
  }

  // 從 Azure 結果中提取卡片名稱
  static extractCardNameFromAzure(data) {
    // 檢查描述
    const description = data.description?.captions?.[0]?.text || '';
    if (description.includes('card')) {      return description.replace(/^a\s+|^an\s+/i, '').trim();
    }    // 檢查標籤
    const cardTag = data.tags?.find(tag =>      tag.name.toLowerCase().includes('card') ||      tag.name.toLowerCase().includes('game'),
    );    if (cardTag) {      return `${cardTag.name} Card`;
    }    return 'Trading Card';
  }

  // 計算 Azure 置信度
  static calculateAzureConfidence(data) {
    const confidences = [];    if (data.description?.captions?.[0]?.confidence) {      confidences.push(data.description.captions[0].confidence);
    }    if (data.tags) {      confidences.push(...data.tags.map(t => t.confidence));
    }    if (confidences.length === 0) {
      return 0;
    }    const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    return Math.round(average * 100);
  }

  // 智能卡片名稱清理
  static cleanCardName(rawName) {
    if (!rawName) {
      return 'Unknown Card';
    }    return rawName      .replace(/[^\w\s.-]/g, ' ') // 移除特殊字符      .replace(/\s+/g, ' ') // 合併多個空格      .trim()      .replace(/^(a|an|the)\s+/i, '') // 移除冠詞      .slice(0, 50); // 限制長度
  }

  // 卡片類型標準化
  static normalizeCardType(type) {
    const typeMap = {      'pokemon': 'Pokemon',      'yugioh': 'Yu-Gi-Oh!',      'magic': 'Magic: The Gathering',      'onepiece': 'One Piece',      'sports': 'Sports Card',      'trading_card': 'Trading Card',
    };    return typeMap[type] || 'Trading Card';
  }

  // 稀有度標準化
  static normalizeRarity(rarity) {
    const rarityMap = {      'secret': 'Secret Rare',      'ultra': 'Ultra Rare',      'super': 'Super Rare',      'rare': 'Rare',      'uncommon': 'Uncommon',      'common': 'Common',
    };    return rarityMap[rarity] || 'Common';
  }
}

export default CardRecognitionHelpers;
