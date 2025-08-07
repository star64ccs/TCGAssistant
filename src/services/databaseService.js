import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 啟用SQLite調試模式
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  constructor() {
    this.database = null;
    this.isInitialized = false;
  }

  // 初始化資料庫
  async initDatabase() {
    try {
      if (this.isInitialized) {
        return this.database;
      }

      console.log('初始化資料庫...');
      
      // 開啟資料庫連接
      this.database = await SQLite.openDatabase({
        name: 'tcg_assistant.db',
        location: 'default',
        createFromLocation: '~tcg_assistant.db',
      });

      // 建立資料表
      await this.createTables();
      
      // 載入初始資料
      await this.loadInitialData();
      
      this.isInitialized = true;
      console.log('資料庫初始化完成');
      
      return this.database;
    } catch (error) {
      console.error('資料庫初始化失敗:', error);
      throw error;
    }
  }

  // 建立資料表
  async createTables() {
    const tables = [
      // 卡牌基礎資料表
      `CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        series VARCHAR(100) NOT NULL,
        set_code VARCHAR(20),
        card_number VARCHAR(20),
        rarity VARCHAR(50),
        card_type VARCHAR(50),
        hp VARCHAR(10),
        attack VARCHAR(10),
        defense VARCHAR(10),
        description TEXT,
        image_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        game_type VARCHAR(20) DEFAULT 'pokemon',
        release_date DATE,
        is_promo BOOLEAN DEFAULT 0,
        is_secret_rare BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 卡牌圖片特徵表
      `CREATE TABLE IF NOT EXISTS card_features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id VARCHAR(50) NOT NULL,
        feature_type VARCHAR(50) NOT NULL,
        feature_data TEXT NOT NULL,
        confidence_score FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(card_id)
      )`,

      // 價格歷史表
      `CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id VARCHAR(50) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        condition VARCHAR(20),
        date_recorded DATE NOT NULL,
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(card_id)
      )`,

      // 用戶收藏表
      `CREATE TABLE IF NOT EXISTS user_collection (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(50) NOT NULL,
        card_id VARCHAR(50) NOT NULL,
        quantity INTEGER DEFAULT 1,
        condition VARCHAR(20),
        purchase_price DECIMAL(10,2),
        purchase_date DATE,
        notes TEXT,
        is_favorite BOOLEAN DEFAULT 0,
        folder_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(card_id)
      )`,

      // 辨識歷史表
      `CREATE TABLE IF NOT EXISTS recognition_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(50) NOT NULL,
        card_id VARCHAR(50),
        card_name VARCHAR(200),
        card_series VARCHAR(100),
        confidence FLOAT,
        recognition_method VARCHAR(50),
        source VARCHAR(50),
        processing_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 卡牌辨識統計表
      `CREATE TABLE IF NOT EXISTS card_recognition_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id VARCHAR(50) NOT NULL,
        total_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        average_confidence FLOAT DEFAULT 0,
        last_recognized TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(card_id)
      )`,

      // 資料夾表
      `CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // BGC 評級資料表
      `CREATE TABLE IF NOT EXISTS bgc_grading_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_name VARCHAR(200) NOT NULL,
        card_series VARCHAR(100),
        total_graded INTEGER DEFAULT 0,
        average_grade DECIMAL(4,2) DEFAULT 0,
        grade_distribution TEXT,
        source VARCHAR(50) DEFAULT 'BGC',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(card_name, card_series)
      )`,

      // BGS 評級資料表
      `CREATE TABLE IF NOT EXISTS bgs_grading_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_name VARCHAR(200) NOT NULL,
        card_series VARCHAR(100),
        total_graded INTEGER DEFAULT 0,
        average_grade DECIMAL(4,2) DEFAULT 0,
        grade_distribution TEXT,
        source VARCHAR(50) DEFAULT 'BGS',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(card_name, card_series)
      )`,

      // 卡牌辨識資訊增強表
      `CREATE TABLE IF NOT EXISTS card_recognition_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id VARCHAR(50) NOT NULL,
        bgc_grading_count INTEGER DEFAULT 0,
        bgc_average_grade DECIMAL(4,2) DEFAULT 0,
        bgc_grade_distribution TEXT,
        bgc_last_updated TIMESTAMP,
        bgs_grading_count INTEGER DEFAULT 0,
        bgs_average_grade DECIMAL(4,2) DEFAULT 0,
        bgs_grade_distribution TEXT,
        bgs_last_updated TIMESTAMP,
        recognition_accuracy FLOAT DEFAULT 0,
        total_recognitions INTEGER DEFAULT 0,
        successful_recognitions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(card_id)
      )`
    ];

    for (const tableSQL of tables) {
      await this.database.executeSql(tableSQL);
    }

    // 建立索引
    await this.createIndexes();
  }

  // 建立索引
  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name)',
      'CREATE INDEX IF NOT EXISTS idx_cards_series ON cards(series)',
      'CREATE INDEX IF NOT EXISTS idx_cards_game_type ON cards(game_type)',
      'CREATE INDEX IF NOT EXISTS idx_price_history_card_date ON price_history(card_id, date_recorded)',
      'CREATE INDEX IF NOT EXISTS idx_price_history_platform ON price_history(platform)',
      'CREATE INDEX IF NOT EXISTS idx_recognition_user_date ON recognition_history(user_id, recognition_time)',
      'CREATE INDEX IF NOT EXISTS idx_collection_user ON user_collection(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_collection_card ON user_collection(card_id)'
    ];

    for (const indexSQL of indexes) {
      await this.database.executeSql(indexSQL);
    }
  }

  // 載入初始資料
  async loadInitialData() {
    try {
      // 檢查是否已載入初始資料
      const [result] = await this.database.executeSql(
        'SELECT COUNT(*) as count FROM cards'
      );
      
      if (result.rows.item(0).count > 0) {
        console.log('初始資料已存在，跳過載入');
        return;
      }

      console.log('載入初始卡牌資料...');
      
      // 載入Pokemon卡牌資料
      await this.loadPokemonCards();
      
      // 載入One Piece卡牌資料
      await this.loadOnePieceCards();
      
      console.log('初始資料載入完成');
    } catch (error) {
      console.error('載入初始資料失敗:', error);
    }
  }

  // 獲取資料庫統計資訊
  async getDatabaseStats() {
    try {
      const stats = {};
      
      // 總卡牌數量
      const [totalResult] = await this.database.executeSql(
        'SELECT COUNT(*) as count FROM cards'
      );
      stats.totalCards = totalResult.rows.item(0).count;
      
      // 有特徵的卡牌數量
      const [featuresResult] = await this.database.executeSql(
        'SELECT COUNT(DISTINCT card_id) as count FROM card_features'
      );
      stats.cardsWithFeatures = featuresResult.rows.item(0).count;
      
      // 按遊戲類型分類
      const [gameTypeResult] = await this.database.executeSql(
        'SELECT game_type, COUNT(*) as count FROM cards GROUP BY game_type'
      );
      stats.gameTypeBreakdown = {};
      for (let i = 0; i < gameTypeResult.rows.length; i++) {
        const row = gameTypeResult.rows.item(i);
        stats.gameTypeBreakdown[row.game_type] = row.count;
      }
      
      return stats;
    } catch (error) {
      console.error('獲取資料庫統計失敗:', error);
      throw error;
    }
  }

  // 獲取沒有特徵的卡牌
  async getCardsWithoutFeatures(gameType = null, limit = 100) {
    try {
      let query = `
        SELECT c.* FROM cards c 
        LEFT JOIN card_features cf ON c.card_id = cf.card_id 
        WHERE cf.card_id IS NULL
      `;
      const params = [];
      
      if (gameType) {
        query += ' AND c.game_type = ?';
        params.push(gameType);
      }
      
      query += ' LIMIT ?';
      params.push(limit);
      
      const [result] = await this.database.executeSql(query, params);
      
      const cards = [];
      for (let i = 0; i < result.rows.length; i++) {
        cards.push(result.rows.item(i));
      }
      
      return cards;
    } catch (error) {
      console.error('獲取沒有特徵的卡牌失敗:', error);
      throw error;
    }
  }

  // 清理重複資料
  async cleanupDuplicates() {
    try {
      let deletedCount = 0;
      
      // 清理重複的卡牌
      const [cardResult] = await this.database.executeSql(`
        DELETE FROM cards 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM cards 
          GROUP BY card_id
        )
      `);
      deletedCount += cardResult.rowsAffected;
      
      // 清理重複的特徵
      const [featureResult] = await this.database.executeSql(`
        DELETE FROM card_features 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM card_features 
          GROUP BY card_id, feature_type
        )
      `);
      deletedCount += featureResult.rowsAffected;
      
      return {
        success: true,
        deletedCount,
        message: `清理了 ${deletedCount} 條重複記錄`
      };
    } catch (error) {
      console.error('清理重複資料失敗:', error);
      throw error;
    }
  }

  // 載入Pokemon卡牌資料
  async loadPokemonCards() {
    try {
      console.log('從真實API載入Pokemon卡牌數據...');
      
      // 調用API整合管理器獲取Pokemon卡牌數據
      const apiIntegrationManager = require('./apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'cardData',
        'getPokemonCards',
        { limit: 1000 },
        { useCache: true }
      );
      
      if (result && result.data && result.data.cards) {
        // 批量插入卡牌數據
        for (const card of result.data.cards) {
          await this.insertCard({
            card_id: card.id,
            name: card.name,
            series: card.series,
            set_code: card.setCode,
            card_number: card.number,
            rarity: card.rarity,
            card_type: card.type,
            hp: card.hp,
            attack: card.attack,
            defense: card.defense,
            description: card.description,
            image_url: card.imageUrl,
            thumbnail_url: card.thumbnailUrl,
            game_type: 'pokemon',
            release_date: card.releaseDate,
            is_promo: card.isPromo || false,
            is_secret_rare: card.isSecretRare || false
          });
        }
        
        console.log(`成功載入 ${result.data.cards.length} 張Pokemon卡牌`);
        return result.data.cards;
      }
      
      console.log('未從API獲取到Pokemon卡牌數據');
      return [];
    } catch (error) {
      console.error('載入Pokemon卡牌數據失敗:', error);
      return [];
    }
  }

  // 載入One Piece卡牌資料
  async loadOnePieceCards() {
    try {
      console.log('從真實API載入One Piece卡牌數據...');
      
      // 調用API整合管理器獲取One Piece卡牌數據
      const apiIntegrationManager = require('./apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'cardData',
        'getOnePieceCards',
        { limit: 1000 },
        { useCache: true }
      );
      
      if (result && result.data && result.data.cards) {
        // 批量插入卡牌數據
        for (const card of result.data.cards) {
          await this.insertCard({
            card_id: card.id,
            name: card.name,
            series: card.series,
            set_code: card.setCode,
            card_number: card.number,
            rarity: card.rarity,
            card_type: card.type,
            hp: card.hp,
            attack: card.attack,
            defense: card.defense,
            description: card.description,
            image_url: card.imageUrl,
            thumbnail_url: card.thumbnailUrl,
            game_type: 'one_piece',
            release_date: card.releaseDate,
            is_promo: card.isPromo || false,
            is_secret_rare: card.isSecretRare || false
          });
        }
        
        console.log(`成功載入 ${result.data.cards.length} 張One Piece卡牌`);
        return result.data.cards;
      }
      
      console.log('未從API獲取到One Piece卡牌數據');
      return [];
    } catch (error) {
      console.error('載入One Piece卡牌數據失敗:', error);
      return [];
    }
  }

  // 插入卡牌資料
  async insertCard(cardData) {
    try {
      const [result] = await this.database.executeSql(
        `INSERT OR REPLACE INTO cards (
          card_id, name, series, set_code, card_number, rarity, card_type, 
          hp, attack, defense, description, image_url, thumbnail_url, 
          game_type, release_date, is_promo, is_secret_rare
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cardData.card_id,
          cardData.name,
          cardData.series,
          cardData.set_code,
          cardData.card_number,
          cardData.rarity,
          cardData.card_type,
          cardData.hp,
          cardData.attack,
          cardData.defense,
          cardData.description,
          cardData.image_url,
          cardData.thumbnail_url,
          cardData.game_type,
          cardData.release_date,
          cardData.is_promo || 0,
          cardData.is_secret_rare || 0
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('插入卡牌失敗:', error);
      throw error;
    }
  }

  // 搜尋卡牌
  async searchCards(query, filters = {}) {
    try {
      let sql = 'SELECT * FROM cards WHERE 1=1';
      const params = [];

      if (query) {
        sql += ' AND (name LIKE ? OR series LIKE ? OR card_number LIKE ?)';
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.gameType) {
        sql += ' AND game_type = ?';
        params.push(filters.gameType);
      }

      if (filters.rarity) {
        sql += ' AND rarity = ?';
        params.push(filters.rarity);
      }

      if (filters.series) {
        sql += ' AND series = ?';
        params.push(filters.series);
      }

      sql += ' ORDER BY name ASC LIMIT 100';

      const [result] = await this.database.executeSql(sql, params);
      
      const cards = [];
      for (let i = 0; i < result.rows.length; i++) {
        cards.push(result.rows.item(i));
      }
      
      return cards;
    } catch (error) {
      console.error('搜尋卡牌失敗:', error);
      throw error;
    }
  }

  // 根據ID獲取卡牌
  async getCardById(cardId) {
    try {
      const [result] = await this.database.executeSql(
        'SELECT * FROM cards WHERE card_id = ?',
        [cardId]
      );
      
      if (result.rows.length > 0) {
        return result.rows.item(0);
      }
      
      return null;
    } catch (error) {
      console.error('獲取卡牌失敗:', error);
      throw error;
    }
  }

  // 獲取卡牌特徵
  async getCardFeatures(cardId) {
    try {
      const [result] = await this.database.executeSql(
        'SELECT * FROM card_features WHERE card_id = ?',
        [cardId]
      );
      
      const features = [];
      for (let i = 0; i < result.rows.length; i++) {
        features.push(result.rows.item(i));
      }
      
      return features;
    } catch (error) {
      console.error('獲取卡牌特徵失敗:', error);
      throw error;
    }
  }

  // 儲存卡牌特徵
  async saveCardFeatures(cardId, features) {
    try {
      for (const feature of features) {
        await this.database.executeSql(
          `INSERT OR REPLACE INTO card_features (
            card_id, feature_type, feature_data, confidence_score
          ) VALUES (?, ?, ?, ?)`,
          [
            cardId,
            feature.type,
            JSON.stringify(feature.data),
            feature.confidence || 0
          ]
        );
      }
    } catch (error) {
      console.error('儲存卡牌特徵失敗:', error);
      throw error;
    }
  }

  // 根據圖片特徵找相似卡牌
  async findSimilarCards(imageFeatures, gameType = null) {
    try {
      // 這裡應該實作更複雜的相似度計算演算法
      // 目前使用簡單的文字搜尋作為示例
      
      let sql = 'SELECT c.*, cf.confidence_score FROM cards c';
      sql += ' LEFT JOIN card_features cf ON c.card_id = cf.card_id';
      sql += ' WHERE cf.feature_type = ?';
      
      const params = ['color_histogram'];
      
      if (gameType) {
        sql += ' AND c.game_type = ?';
        params.push(gameType);
      }
      
      sql += ' ORDER BY cf.confidence_score DESC LIMIT 10';
      
      const [result] = await this.database.executeSql(sql, params);
      
      const cards = [];
      for (let i = 0; i < result.rows.length; i++) {
        cards.push(result.rows.item(i));
      }
      
      return cards;
    } catch (error) {
      console.error('搜尋相似卡牌失敗:', error);
      throw error;
    }
  }

  // 儲存辨識結果
  async saveRecognitionResult(result) {
    try {
      const {
        userId,
        cardInfo,
        confidence,
        method,
        source,
        timestamp,
        processingTime
      } = result;

      // 插入辨識記錄
      const [insertResult] = await this.database.executeSql(
        `INSERT INTO recognition_history (
          user_id, card_id, card_name, card_series, confidence, 
          recognition_method, source, processing_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          cardInfo.card_id || cardInfo.id,
          cardInfo.name,
          cardInfo.series,
          confidence,
          method,
          source,
          processingTime,
          timestamp || new Date().toISOString()
        ]
      );

      // 更新卡牌辨識統計
      await this.updateRecognitionStats(cardInfo.card_id || cardInfo.id, confidence);

      return insertResult.insertId;
    } catch (error) {
      console.error('儲存辨識結果失敗:', error);
      throw error;
    }
  }

  // 獲取價格歷史
  async getPriceHistory(cardId, platform = null) {
    try {
      let sql = 'SELECT * FROM price_history WHERE card_id = ?';
      const params = [cardId];
      
      if (platform) {
        sql += ' AND platform = ?';
        params.push(platform);
      }
      
      sql += ' ORDER BY date_recorded DESC LIMIT 30';
      
      const [result] = await this.database.executeSql(sql, params);
      
      const prices = [];
      for (let i = 0; i < result.rows.length; i++) {
        prices.push(result.rows.item(i));
      }
      
      return prices;
    } catch (error) {
      console.error('獲取價格歷史失敗:', error);
      throw error;
    }
  }

  // 更新價格資料
  async updatePrices(cardId, prices) {
    try {
      for (const price of prices) {
        await this.database.executeSql(
          `INSERT OR REPLACE INTO price_history (
            card_id, platform, price, currency, condition, date_recorded, source
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            cardId,
            price.platform,
            price.price,
            price.currency || 'USD',
            price.condition,
            price.date || new Date().toISOString().split('T')[0],
            price.source
          ]
        );
      }
    } catch (error) {
      console.error('更新價格資料失敗:', error);
      throw error;
    }
  }

  // 用戶收藏相關操作
  async addToCollection(userId, cardId, collectionData = {}) {
    try {
      const [result] = await this.database.executeSql(
        `INSERT INTO user_collection (
          user_id, card_id, quantity, condition, purchase_price,
          purchase_date, notes, is_favorite, folder_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          cardId,
          collectionData.quantity || 1,
          collectionData.condition,
          collectionData.purchasePrice,
          collectionData.purchaseDate,
          collectionData.notes,
          collectionData.isFavorite || 0,
          collectionData.folderId
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('新增收藏失敗:', error);
      throw error;
    }
  }

  async getUserCollection(userId) {
    try {
      const [result] = await this.database.executeSql(
        `SELECT uc.*, c.name, c.series, c.image_url, c.rarity 
         FROM user_collection uc 
         JOIN cards c ON uc.card_id = c.card_id 
         WHERE uc.user_id = ? 
         ORDER BY uc.created_at DESC`,
        [userId]
      );
      
      const collection = [];
      for (let i = 0; i < result.rows.length; i++) {
        collection.push(result.rows.item(i));
      }
      
      return collection;
    } catch (error) {
      console.error('獲取用戶收藏失敗:', error);
      throw error;
    }
  }

  // 關閉資料庫連接
  async closeDatabase() {
    try {
      if (this.database) {
        await this.database.close();
        this.database = null;
        this.isInitialized = false;
        console.log('資料庫連接已關閉');
      }
    } catch (error) {
      console.error('關閉資料庫失敗:', error);
    }
  }

  // 備份資料庫
  async backupDatabase() {
    try {
      // 這裡應該實作資料庫備份邏輯
      console.log('資料庫備份功能待實作');
    } catch (error) {
      console.error('備份資料庫失敗:', error);
    }
  }

  // 還原資料庫
  async restoreDatabase() {
    try {
      // 這裡應該實作資料庫還原邏輯
      console.log('資料庫還原功能待實作');
    } catch (error) {
      console.error('還原資料庫失敗:', error);
    }
  }

  // BGC 評級資料相關操作
  async insertCardGradingData(cardName, cardSeries, gradingData) {
    try {
      const [result] = await this.database.executeSql(
        `INSERT INTO bgc_grading_data (
          card_name, card_series, total_graded, average_grade, 
          grade_distribution, source, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cardName,
          cardSeries,
          gradingData.totalGraded,
          gradingData.averageGrade,
          JSON.stringify(gradingData.gradeDistribution),
          gradingData.source || 'BGC',
          gradingData.lastUpdated
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('插入評級資料失敗:', error);
      throw error;
    }
  }

  async updateCardGradingData(cardName, cardSeries, gradingData) {
    try {
      const [result] = await this.database.executeSql(
        `UPDATE bgc_grading_data SET 
          total_graded = ?, 
          average_grade = ?, 
          grade_distribution = ?, 
          last_updated = ?
         WHERE card_name = ? AND card_series = ?`,
        [
          gradingData.totalGraded,
          gradingData.averageGrade,
          JSON.stringify(gradingData.gradeDistribution),
          gradingData.lastUpdated,
          cardName,
          cardSeries
        ]
      );
      
      return result.rowsAffected;
    } catch (error) {
      console.error('更新評級資料失敗:', error);
      throw error;
    }
  }

  async getCardGradingData(cardName, cardSeries) {
    try {
      const [result] = await this.database.executeSql(
        `SELECT * FROM bgc_grading_data 
         WHERE card_name = ? AND card_series = ?`,
        [cardName, cardSeries]
      );
      
      if (result.rows.length > 0) {
        const data = result.rows.item(0);
        return {
          ...data,
          gradeDistribution: JSON.parse(data.grade_distribution || '{}')
        };
      }
      
      return null;
    } catch (error) {
      console.error('獲取評級資料失敗:', error);
      throw error;
    }
  }

  // BGS 評級資料相關操作
  async insertBGSCardGradingData(cardName, cardSeries, gradingData) {
    try {
      const [result] = await this.database.executeSql(
        `INSERT INTO bgs_grading_data (
          card_name, card_series, total_graded, average_grade, 
          grade_distribution, source, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cardName,
          cardSeries,
          gradingData.totalGraded,
          gradingData.averageGrade,
          JSON.stringify(gradingData.gradeDistribution),
          gradingData.source || 'BGS',
          gradingData.lastUpdated
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('插入 BGS 評級資料失敗:', error);
      throw error;
    }
  }

  async updateBGSCardGradingData(cardName, cardSeries, gradingData) {
    try {
      const [result] = await this.database.executeSql(
        `UPDATE bgs_grading_data SET 
          total_graded = ?, 
          average_grade = ?, 
          grade_distribution = ?, 
          last_updated = ?
         WHERE card_name = ? AND card_series = ?`,
        [
          gradingData.totalGraded,
          gradingData.averageGrade,
          JSON.stringify(gradingData.gradeDistribution),
          gradingData.lastUpdated,
          cardName,
          cardSeries
        ]
      );
      
      return result.rowsAffected;
    } catch (error) {
      console.error('更新 BGS 評級資料失敗:', error);
      throw error;
    }
  }

  async getBGSCardGradingData(cardName, cardSeries) {
    try {
      const [result] = await this.database.executeSql(
        `SELECT * FROM bgs_grading_data 
         WHERE card_name = ? AND card_series = ?`,
        [cardName, cardSeries]
      );
      
      if (result.rows.length > 0) {
        const data = result.rows.item(0);
        return {
          ...data,
          gradeDistribution: JSON.parse(data.grade_distribution || '{}')
        };
      }
      
      return null;
    } catch (error) {
      console.error('獲取 BGS 評級資料失敗:', error);
      throw error;
    }
  }

  async updateCardRecognitionInfo(cardId, recognitionInfo) {
    try {
      // 檢查是否已存在
      const [existing] = await this.database.executeSql(
        `SELECT id FROM card_recognition_info WHERE card_id = ?`,
        [cardId]
      );
      
      if (existing.rows.length > 0) {
        // 更新現有記錄
        const updateFields = [];
        const updateValues = [];
        
        // BGC 欄位
        if (recognitionInfo.bgcGradingCount !== undefined) {
          updateFields.push('bgc_grading_count = ?');
          updateValues.push(recognitionInfo.bgcGradingCount);
        }
        if (recognitionInfo.bgcAverageGrade !== undefined) {
          updateFields.push('bgc_average_grade = ?');
          updateValues.push(recognitionInfo.bgcAverageGrade);
        }
        if (recognitionInfo.bgcGradeDistribution !== undefined) {
          updateFields.push('bgc_grade_distribution = ?');
          updateValues.push(recognitionInfo.bgcGradeDistribution);
        }
        if (recognitionInfo.bgcLastUpdated !== undefined) {
          updateFields.push('bgc_last_updated = ?');
          updateValues.push(recognitionInfo.bgcLastUpdated);
        }
        
        // BGS 欄位
        if (recognitionInfo.bgsGradingCount !== undefined) {
          updateFields.push('bgs_grading_count = ?');
          updateValues.push(recognitionInfo.bgsGradingCount);
        }
        if (recognitionInfo.bgsAverageGrade !== undefined) {
          updateFields.push('bgs_average_grade = ?');
          updateValues.push(recognitionInfo.bgsAverageGrade);
        }
        if (recognitionInfo.bgsGradeDistribution !== undefined) {
          updateFields.push('bgs_grade_distribution = ?');
          updateValues.push(recognitionInfo.bgsGradeDistribution);
        }
        if (recognitionInfo.bgsLastUpdated !== undefined) {
          updateFields.push('bgs_last_updated = ?');
          updateValues.push(recognitionInfo.bgsLastUpdated);
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(cardId);
        
        const [result] = await this.database.executeSql(
          `UPDATE card_recognition_info SET ${updateFields.join(', ')} WHERE card_id = ?`,
          updateValues
        );
        
        return result.rowsAffected;
      } else {
        // 插入新記錄
        const insertFields = ['card_id'];
        const insertValues = [cardId];
        const placeholders = ['?'];
        
        // BGC 欄位
        if (recognitionInfo.bgcGradingCount !== undefined) {
          insertFields.push('bgc_grading_count');
          insertValues.push(recognitionInfo.bgcGradingCount);
          placeholders.push('?');
        }
        if (recognitionInfo.bgcAverageGrade !== undefined) {
          insertFields.push('bgc_average_grade');
          insertValues.push(recognitionInfo.bgcAverageGrade);
          placeholders.push('?');
        }
        if (recognitionInfo.bgcGradeDistribution !== undefined) {
          insertFields.push('bgc_grade_distribution');
          insertValues.push(recognitionInfo.bgcGradeDistribution);
          placeholders.push('?');
        }
        if (recognitionInfo.bgcLastUpdated !== undefined) {
          insertFields.push('bgc_last_updated');
          insertValues.push(recognitionInfo.bgcLastUpdated);
          placeholders.push('?');
        }
        
        // BGS 欄位
        if (recognitionInfo.bgsGradingCount !== undefined) {
          insertFields.push('bgs_grading_count');
          insertValues.push(recognitionInfo.bgsGradingCount);
          placeholders.push('?');
        }
        if (recognitionInfo.bgsAverageGrade !== undefined) {
          insertFields.push('bgs_average_grade');
          insertValues.push(recognitionInfo.bgsAverageGrade);
          placeholders.push('?');
        }
        if (recognitionInfo.bgsGradeDistribution !== undefined) {
          insertFields.push('bgs_grade_distribution');
          insertValues.push(recognitionInfo.bgsGradeDistribution);
          placeholders.push('?');
        }
        if (recognitionInfo.bgsLastUpdated !== undefined) {
          insertFields.push('bgs_last_updated');
          insertValues.push(recognitionInfo.bgsLastUpdated);
          placeholders.push('?');
        }
        
        const [result] = await this.database.executeSql(
          `INSERT INTO card_recognition_info (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`,
          insertValues
        );
        
        return result.insertId;
      }
    } catch (error) {
      console.error('更新卡牌辨識資訊失敗:', error);
      throw error;
    }
  }

  async getGradingStats() {
    try {
      const [result] = await this.database.executeSql(
        `SELECT 
          COUNT(*) as total_cards,
          SUM(total_graded) as total_graded_cards,
          AVG(average_grade) as avg_grade,
          MAX(last_updated) as last_update
         FROM bgc_grading_data`
      );
      
      if (result.rows.length > 0) {
        return result.rows.item(0);
      }
      
      return {
        total_cards: 0,
        total_graded_cards: 0,
        avg_grade: 0,
        last_update: null
      };
    } catch (error) {
      console.error('獲取評級統計失敗:', error);
      throw error;
    }
  }

  async cleanupExpiredGradingData(daysOld = 30) {
    try {
      const [result] = await this.database.executeSql(
        `DELETE FROM bgc_grading_data 
         WHERE last_updated < datetime('now', '-${daysOld} days')`
      );
      
      return result.rowsAffected;
    } catch (error) {
      console.error('清理過期評級資料失敗:', error);
      throw error;
    }
  }

  async searchGradingData(query, limit = 50) {
    try {
      const [result] = await this.database.executeSql(
        `SELECT * FROM bgc_grading_data 
         WHERE card_name LIKE ? OR card_series LIKE ?
         ORDER BY total_graded DESC, last_updated DESC
         LIMIT ?`,
        [`%${query}%`, `%${query}%`, limit]
      );
      
      const data = [];
      for (let i = 0; i < result.rows.length; i++) {
        const item = result.rows.item(i);
        data.push({
          ...item,
          gradeDistribution: JSON.parse(item.grade_distribution || '{}')
        });
      }
      
      return data;
    } catch (error) {
      console.error('搜索評級資料失敗:', error);
      throw error;
    }
  }

  // 更新辨識統計
  async updateRecognitionStats(cardId, confidence) {
    try {
      // 檢查是否已有統計記錄
      const [existing] = await this.database.executeSql(
        `SELECT * FROM card_recognition_stats WHERE card_id = ?`,
        [cardId]
      );

      if (existing.rows.length > 0) {
        // 更新現有記錄
        const stats = existing.rows.item(0);
        const newTotalCount = stats.total_count + 1;
        const newAverageConfidence = ((stats.average_confidence * stats.total_count) + confidence) / newTotalCount;
        const newSuccessCount = confidence > 0.7 ? stats.success_count + 1 : stats.success_count;

        await this.database.executeSql(
          `UPDATE card_recognition_stats SET 
           total_count = ?, 
           success_count = ?, 
           average_confidence = ?, 
           last_recognized = ?
           WHERE card_id = ?`,
          [newTotalCount, newSuccessCount, newAverageConfidence, new Date().toISOString(), cardId]
        );
      } else {
        // 創建新記錄
        await this.database.executeSql(
          `INSERT INTO card_recognition_stats (
            card_id, total_count, success_count, average_confidence, last_recognized
          ) VALUES (?, 1, ?, ?, ?)`,
          [cardId, confidence > 0.7 ? 1 : 0, confidence, new Date().toISOString()]
        );
      }
    } catch (error) {
      console.error('更新辨識統計失敗:', error);
    }
  }

  // 獲取辨識統計
  async getRecognitionStats(userId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_recognitions,
          COUNT(CASE WHEN confidence > 0.7 THEN 1 END) as successful_recognitions,
          AVG(confidence) as average_confidence,
          AVG(processing_time) as average_processing_time,
          COUNT(DISTINCT card_id) as unique_cards_recognized,
          MAX(created_at) as last_recognition
        FROM recognition_history
      `;

      const params = [];
      if (userId) {
        query += ` WHERE user_id = ?`;
        params.push(userId);
      }

      const [result] = await this.database.executeSql(query, params);

      if (result.rows.length > 0) {
        const stats = result.rows.item(0);
        return {
          totalRecognitions: stats.total_recognitions,
          successfulRecognitions: stats.successful_recognitions,
          successRate: stats.total_recognitions > 0 ? 
            (stats.successful_recognitions / stats.total_recognitions) * 100 : 0,
          averageConfidence: stats.average_confidence || 0,
          averageProcessingTime: stats.average_processing_time || 0,
          uniqueCardsRecognized: stats.unique_cards_recognized,
          lastRecognition: stats.last_recognition
        };
      }

      return {
        totalRecognitions: 0,
        successfulRecognitions: 0,
        successRate: 0,
        averageConfidence: 0,
        averageProcessingTime: 0,
        uniqueCardsRecognized: 0,
        lastRecognition: null
      };
    } catch (error) {
      console.error('獲取辨識統計失敗:', error);
      throw error;
    }
  }

  // 獲取用戶辨識歷史
  async getRecognitionHistory(userId, limit = 50, offset = 0) {
    try {
      const [result] = await this.database.executeSql(
        `SELECT 
          rh.*,
          c.name as card_name,
          c.series as card_series,
          c.image_url as card_image
         FROM recognition_history rh
         LEFT JOIN cards c ON rh.card_id = c.card_id
         WHERE rh.user_id = ?
         ORDER BY rh.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      const history = [];
      for (let i = 0; i < result.rows.length; i++) {
        history.push(result.rows.item(i));
      }

      return history;
    } catch (error) {
      console.error('獲取辨識歷史失敗:', error);
      throw error;
    }
  }

  // 清理舊的辨識記錄
  async cleanupOldRecognitionRecords(daysOld = 30) {
    try {
      const [result] = await this.database.executeSql(
        `DELETE FROM recognition_history 
         WHERE created_at < datetime('now', '-${daysOld} days')`
      );

      console.log(`已清理 ${result.rowsAffected} 條舊辨識記錄`);
      return result.rowsAffected;
    } catch (error) {
      console.error('清理舊辨識記錄失敗:', error);
      throw error;
    }
  }

  // 獲取最常辨識的卡牌
  async getMostRecognizedCards(limit = 10) {
    try {
      const [result] = await this.database.executeSql(
        `SELECT 
          c.card_id,
          c.name,
          c.series,
          c.image_url,
          crs.total_count,
          crs.average_confidence,
          crs.last_recognized
         FROM card_recognition_stats crs
         JOIN cards c ON crs.card_id = c.card_id
         ORDER BY crs.total_count DESC, crs.average_confidence DESC
         LIMIT ?`,
        [limit]
      );

      const cards = [];
      for (let i = 0; i < result.rows.length; i++) {
        cards.push(result.rows.item(i));
      }

      return cards;
    } catch (error) {
      console.error('獲取最常辨識卡牌失敗:', error);
      throw error;
    }
  }

  // 獲取辨識方法統計
  async getRecognitionMethodStats() {
    try {
      const [result] = await this.database.executeSql(
        `SELECT 
          recognition_method,
          COUNT(*) as count,
          AVG(confidence) as avg_confidence,
          AVG(processing_time) as avg_processing_time
         FROM recognition_history
         GROUP BY recognition_method
         ORDER BY count DESC`
      );

      const stats = [];
      for (let i = 0; i < result.rows.length; i++) {
        stats.push(result.rows.item(i));
      }

      return stats;
    } catch (error) {
      console.error('獲取辨識方法統計失敗:', error);
      throw error;
    }
  }

  // 搜尋相似卡牌（改進版）
  async findSimilarCards(imageFeatures, gameType = null, limit = 20) {
    try {
      // 首先嘗試基於特徵的搜尋
      let query = `
        SELECT 
          c.*,
          cf.feature_data,
          cf.confidence_score
         FROM cards c
         LEFT JOIN card_features cf ON c.card_id = cf.card_id
         WHERE cf.feature_type = 'image_features'
      `;

      const params = [];
      if (gameType) {
        query += ` AND c.game_type = ?`;
        params.push(gameType);
      }

      query += ` ORDER BY cf.confidence_score DESC LIMIT ?`;
      params.push(limit);

      const [result] = await this.database.executeSql(query, params);

      const similarCards = [];
      for (let i = 0; i < result.rows.length; i++) {
        const card = result.rows.item(i);
        try {
          card.features = JSON.parse(card.feature_data || '{}');
        } catch (e) {
          card.features = {};
        }
        similarCards.push(card);
      }

      // 如果沒有找到基於特徵的結果，嘗試基於名稱的模糊搜尋
      if (similarCards.length === 0 && imageFeatures.metadata) {
        return await this.searchCardsByMetadata(imageFeatures.metadata, gameType, limit);
      }

      return similarCards;
    } catch (error) {
      console.error('搜尋相似卡牌失敗:', error);
      return [];
    }
  }

  // 基於元數據搜尋卡牌
  async searchCardsByMetadata(metadata, gameType = null, limit = 20) {
    try {
      let query = `
        SELECT * FROM cards 
        WHERE 1=1
      `;

      const params = [];
      if (gameType) {
        query += ` AND game_type = ?`;
        params.push(gameType);
      }

      // 基於長寬比搜尋
      if (metadata.aspectRatio) {
        const aspectRatio = metadata.aspectRatio;
        query += ` AND ABS((CAST(width AS FLOAT) / CAST(height AS FLOAT)) - ?) < 0.1`;
        params.push(aspectRatio);
      }

      query += ` ORDER BY RANDOM() LIMIT ?`;
      params.push(limit);

      const [result] = await this.database.executeSql(query, params);

      const cards = [];
      for (let i = 0; i < result.rows.length; i++) {
        cards.push(result.rows.item(i));
      }

      return cards;
    } catch (error) {
      console.error('基於元數據搜尋卡牌失敗:', error);
      return [];
    }
  }

  // 儲存卡牌特徵（改進版）
  async saveCardFeatures(cardId, features) {
    try {
      // 檢查是否已有特徵記錄
      const [existing] = await this.database.executeSql(
        `SELECT * FROM card_features WHERE card_id = ? AND feature_type = 'image_features'`,
        [cardId]
      );

      const featureData = JSON.stringify(features);
      const confidenceScore = this.calculateFeatureConfidence(features);

      if (existing.rows.length > 0) {
        // 更新現有記錄
        await this.database.executeSql(
          `UPDATE card_features SET 
           feature_data = ?, 
           confidence_score = ?, 
           created_at = ?
           WHERE card_id = ? AND feature_type = 'image_features'`,
          [featureData, confidenceScore, new Date().toISOString(), cardId]
        );
      } else {
        // 插入新記錄
        await this.database.executeSql(
          `INSERT INTO card_features (
            card_id, feature_type, feature_data, confidence_score, created_at
          ) VALUES (?, 'image_features', ?, ?, ?)`,
          [cardId, featureData, confidenceScore, new Date().toISOString()]
        );
      }

      return true;
    } catch (error) {
      console.error('儲存卡牌特徵失敗:', error);
      throw error;
    }
  }

  // 計算特徵信心度
  calculateFeatureConfidence(features) {
    let confidence = 0.5; // 基礎信心度

    // 根據特徵完整性調整信心度
    if (features.colorHistogram) confidence += 0.1;
    if (features.textureFeatures) confidence += 0.1;
    if (features.edgeFeatures) confidence += 0.1;
    if (features.shapeFeatures) confidence += 0.1;
    if (features.statisticalFeatures) confidence += 0.1;

    // 根據特徵品質調整信心度
    if (features.metadata && features.metadata.totalPixels > 100000) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  // 獲取卡牌辨識建議
  async getRecognitionSuggestions(userId, limit = 5) {
    try {
      // 基於用戶歷史獲取建議
      const [result] = await this.database.executeSql(
        `SELECT 
          c.card_id,
          c.name,
          c.series,
          c.image_url,
          COUNT(rh.id) as recognition_count,
          AVG(rh.confidence) as avg_confidence
         FROM cards c
         LEFT JOIN recognition_history rh ON c.card_id = rh.card_id AND rh.user_id = ?
         WHERE rh.id IS NULL OR rh.created_at < datetime('now', '-7 days')
         GROUP BY c.card_id
         ORDER BY recognition_count DESC, RANDOM()
         LIMIT ?`,
        [userId, limit]
      );

      const suggestions = [];
      for (let i = 0; i < result.rows.length; i++) {
        suggestions.push(result.rows.item(i));
      }

      return suggestions;
    } catch (error) {
      console.error('獲取辨識建議失敗:', error);
      return [];
    }
  }
}

// 建立單例實例
const databaseService = new DatabaseService();

export default databaseService;
