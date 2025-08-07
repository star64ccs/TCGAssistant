// 資料載入和處理服務
// 用於批量載入卡牌資料並生成特徵

import databaseService from './databaseService';
import imageFeatureService from './imageFeatureService';
import { pokemonCards } from '../data/pokemonCards';
import { onePieceCards } from '../data/onePieceCards';
import { yuGiOhCards } from '../data/yuGiOhCards';
import { magicCards } from '../data/magicCards';

class DataLoaderService {
  constructor() {
    this.isLoading = false;
    this.progress = 0;
    this.totalCards = 0;
    this.processedCards = 0;
    this.onProgressCallback = null;
  }

  // 設定進度回調
  setProgressCallback(callback) {
    this.onProgressCallback = callback;
  }

  // 更新進度
  updateProgress(processed, total) {
    this.processedCards = processed;
    this.totalCards = total;
    this.progress = (processed / total) * 100;
    
    if (this.onProgressCallback) {
      this.onProgressCallback({
        processed,
        total,
        progress: this.progress,
        percentage: Math.round(this.progress)
      });
    }
  }

  // 載入所有卡牌資料
  async loadAllCardData() {
    if (this.isLoading) {
      throw new Error('資料載入已進行中');
    }

    this.isLoading = true;
    this.progress = 0;
    this.processedCards = 0;

    try {
      console.log('開始載入所有卡牌資料...');
      
      // 計算總卡牌數量
      const totalCards = pokemonCards.length + onePieceCards.length + 
                        yuGiOhCards.length + magicCards.length;
      this.totalCards = totalCards;
      
      console.log(`總計需要載入 ${totalCards} 張卡牌`);

      // 並行載入各遊戲的卡牌資料
      await Promise.all([
        this.loadPokemonCards(),
        this.loadOnePieceCards(),
        this.loadYuGiOhCards(),
        this.loadMagicCards()
      ]);

      console.log('所有卡牌資料載入完成');
      this.updateProgress(totalCards, totalCards);
      
      return {
        success: true,
        totalCards,
        message: '所有卡牌資料載入完成'
      };
    } catch (error) {
      console.error('載入卡牌資料失敗:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // 載入Pokemon卡牌資料
  async loadPokemonCards() {
    console.log(`開始載入 ${pokemonCards.length} 張Pokemon卡牌...`);
    
    for (let i = 0; i < pokemonCards.length; i++) {
      try {
        const card = pokemonCards[i];
        
        // 插入卡牌資料
        await databaseService.insertCard(card);
        
        // 生成並儲存圖片特徵
        if (card.image_url) {
          await this.generateAndSaveCardFeatures(card.card_id, card.image_url);
        }
        
        // 更新進度
        this.processedCards++;
        this.updateProgress(this.processedCards, this.totalCards);
        
        // 每100張卡牌輸出一次進度
        if ((i + 1) % 100 === 0) {
          console.log(`Pokemon卡牌進度: ${i + 1}/${pokemonCards.length}`);
        }
      } catch (error) {
        console.error(`載入Pokemon卡牌 ${card.card_id} 失敗:`, error);
        // 繼續處理下一張卡牌
      }
    }
    
    console.log('Pokemon卡牌載入完成');
  }

  // 載入One Piece卡牌資料
  async loadOnePieceCards() {
    console.log(`開始載入 ${onePieceCards.length} 張One Piece卡牌...`);
    
    for (let i = 0; i < onePieceCards.length; i++) {
      try {
        const card = onePieceCards[i];
        
        // 插入卡牌資料
        await databaseService.insertCard(card);
        
        // 生成並儲存圖片特徵
        if (card.image_url) {
          await this.generateAndSaveCardFeatures(card.card_id, card.image_url);
        }
        
        // 更新進度
        this.processedCards++;
        this.updateProgress(this.processedCards, this.totalCards);
        
        // 每50張卡牌輸出一次進度
        if ((i + 1) % 50 === 0) {
          console.log(`One Piece卡牌進度: ${i + 1}/${onePieceCards.length}`);
        }
      } catch (error) {
        console.error(`載入One Piece卡牌 ${card.card_id} 失敗:`, error);
        // 繼續處理下一張卡牌
      }
    }
    
    console.log('One Piece卡牌載入完成');
  }

  // 載入Yu-Gi-Oh卡牌資料
  async loadYuGiOhCards() {
    console.log(`開始載入 ${yuGiOhCards.length} 張Yu-Gi-Oh卡牌...`);
    
    for (let i = 0; i < yuGiOhCards.length; i++) {
      try {
        const card = yuGiOhCards[i];
        
        // 插入卡牌資料
        await databaseService.insertCard(card);
        
        // 生成並儲存圖片特徵
        if (card.image_url) {
          await this.generateAndSaveCardFeatures(card.card_id, card.image_url);
        }
        
        // 更新進度
        this.processedCards++;
        this.updateProgress(this.processedCards, this.totalCards);
        
        // 每50張卡牌輸出一次進度
        if ((i + 1) % 50 === 0) {
          console.log(`Yu-Gi-Oh卡牌進度: ${i + 1}/${yuGiOhCards.length}`);
        }
      } catch (error) {
        console.error(`載入Yu-Gi-Oh卡牌 ${card.card_id} 失敗:`, error);
        // 繼續處理下一張卡牌
      }
    }
    
    console.log('Yu-Gi-Oh卡牌載入完成');
  }

  // 載入Magic卡牌資料
  async loadMagicCards() {
    console.log(`開始載入 ${magicCards.length} 張Magic卡牌...`);
    
    for (let i = 0; i < magicCards.length; i++) {
      try {
        const card = magicCards[i];
        
        // 插入卡牌資料
        await databaseService.insertCard(card);
        
        // 生成並儲存圖片特徵
        if (card.image_url) {
          await this.generateAndSaveCardFeatures(card.card_id, card.image_url);
        }
        
        // 更新進度
        this.processedCards++;
        this.updateProgress(this.processedCards, this.totalCards);
        
        // 每100張卡牌輸出一次進度
        if ((i + 1) % 100 === 0) {
          console.log(`Magic卡牌進度: ${i + 1}/${magicCards.length}`);
        }
      } catch (error) {
        console.error(`載入Magic卡牌 ${card.card_id} 失敗:`, error);
        // 繼續處理下一張卡牌
      }
    }
    
    console.log('Magic卡牌載入完成');
  }

  // 生成並儲存卡牌特徵
  async generateAndSaveCardFeatures(cardId, imageUrl) {
    try {
      // 提取圖片特徵
      const features = await imageFeatureService.extractImageFeatures(imageUrl);
      
      // 儲存各種特徵
      const featureTypes = [
        { type: 'color_histogram', data: features.colorHistogram },
        { type: 'dominant_colors', data: features.dominantColors },
        { type: 'edge_features', data: features.edgeFeatures },
        { type: 'text_regions', data: features.textRegions }
      ];
      
      for (const featureType of featureTypes) {
        if (featureType.data && featureType.data.confidence > 0.1) {
          await databaseService.saveCardFeatures(cardId, {
            type: featureType.type,
            data: JSON.stringify(featureType.data),
            confidence_score: featureType.data.confidence
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error(`生成卡牌 ${cardId} 特徵失敗:`, error);
      return false;
    }
  }

  // 批量生成特徵（用於已存在的卡牌）
  async generateFeaturesForExistingCards(gameType = null, limit = 100) {
    try {
      console.log('開始為現有卡牌生成特徵...');
      
      // 獲取沒有特徵的卡牌
      const cards = await databaseService.getCardsWithoutFeatures(gameType, limit);
      
      console.log(`找到 ${cards.length} 張需要生成特徵的卡牌`);
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        
        if (card.image_url) {
          await this.generateAndSaveCardFeatures(card.card_id, card.image_url);
          
          // 更新進度
          this.updateProgress(i + 1, cards.length);
          
          // 每10張卡牌輸出一次進度
          if ((i + 1) % 10 === 0) {
            console.log(`特徵生成進度: ${i + 1}/${cards.length}`);
          }
        }
      }
      
      console.log('特徵生成完成');
      return {
        success: true,
        processedCards: cards.length,
        message: '特徵生成完成'
      };
    } catch (error) {
      console.error('批量生成特徵失敗:', error);
      throw error;
    }
  }

  // 檢查資料完整性
  async checkDataIntegrity() {
    try {
      const stats = await databaseService.getDatabaseStats();
      
      return {
        totalCards: stats.totalCards,
        cardsWithFeatures: stats.cardsWithFeatures,
        cardsWithoutFeatures: stats.totalCards - stats.cardsWithFeatures,
        featureCoverage: (stats.cardsWithFeatures / stats.totalCards * 100).toFixed(2) + '%',
        gameTypeBreakdown: stats.gameTypeBreakdown
      };
    } catch (error) {
      console.error('檢查資料完整性失敗:', error);
      throw error;
    }
  }

  // 清理重複資料
  async cleanupDuplicateData() {
    try {
      console.log('開始清理重複資料...');
      
      const result = await databaseService.cleanupDuplicates();
      
      console.log('重複資料清理完成');
      return result;
    } catch (error) {
      console.error('清理重複資料失敗:', error);
      throw error;
    }
  }

  // 重建索引
  async rebuildIndexes() {
    try {
      console.log('開始重建索引...');
      
      await databaseService.createIndexes();
      
      console.log('索引重建完成');
      return {
        success: true,
        message: '索引重建完成'
      };
    } catch (error) {
      console.error('重建索引失敗:', error);
      throw error;
    }
  }

  // 獲取載入狀態
  getLoadingStatus() {
    return {
      isLoading: this.isLoading,
      progress: this.progress,
      processedCards: this.processedCards,
      totalCards: this.totalCards
    };
  }

  // 停止載入
  stopLoading() {
    this.isLoading = false;
    console.log('資料載入已停止');
  }
}

export default new DataLoaderService();
