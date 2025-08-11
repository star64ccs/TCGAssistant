require('dotenv').config();
const { sequelize, syncDatabase } = require('../config/database');
const User = require('../models/User');
const Card = require('../models/Card');
const { logger } = require('../utils/logger');

// 示例Pokemon卡牌數據
const pokemonCards = [
  {
    cardId: 'pokemon_001',
    name: '皮卡丘 V',
    series: 'Sword & Shield',
    setCode: 'SWSH',
    cardNumber: '043/185',
    rarity: 'Ultra Rare',
    cardType: 'Lightning',
    hp: 200,
    attack: 120,
    defense: 80,
    description: '電擊寶可夢，擁有強大的電擊能力',
    imageUrl: 'https://images.pokemontcg.io/swsh4/43_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/swsh4/43.png',
    gameType: 'pokemon',
    releaseDate: '2020-02-07',
    isPromo: false,
    isSecretRare: false,
    currentPrice: 42.87,
  },
  {
    cardId: 'pokemon_002',
    name: '路卡利歐 V',
    series: 'Sword & Shield',
    setCode: 'SWSH',
    cardNumber: '156/185',
    rarity: 'Ultra Rare',
    cardType: 'Fighting',
    hp: 210,
    attack: 130,
    defense: 90,
    description: '波導寶可夢，掌握波導之力',
    imageUrl: 'https://images.pokemontcg.io/swsh4/156_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/swsh4/156.png',
    gameType: 'pokemon',
    releaseDate: '2020-02-07',
    isPromo: false,
    isSecretRare: false,
    currentPrice: 28.50,
  },
  {
    cardId: 'pokemon_003',
    name: '噴火龍 V',
    series: 'Sword & Shield',
    setCode: 'SWSH',
    cardNumber: '020/185',
    rarity: 'Ultra Rare',
    cardType: 'Fire',
    hp: 220,
    attack: 140,
    defense: 100,
    description: '火焰寶可夢，擁有強大的火焰攻擊',
    imageUrl: 'https://images.pokemontcg.io/swsh4/21_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/swsh4/21.png',
    gameType: 'pokemon',
    releaseDate: '2020-02-07',
    isPromo: false,
    isSecretRare: false,
    currentPrice: 65.00,
  },
];

// 示例One Piece卡牌數據
const onePieceCards = [
  {
    cardId: 'onepiece_001',
    name: '路飛 四檔',
    series: 'One Piece',
    setCode: 'OP01',
    cardNumber: '001/100',
    rarity: 'Secret Rare',
    cardType: 'Leader',
    hp: 5000,
    attack: 5000,
    defense: 0,
    description: '草帽海賊團船長，橡膠果實能力者',
    imageUrl: 'https://onepiece-cardgame.com/images/cardlist/OP01-001.jpg',
    thumbnailUrl: 'https://onepiece-cardgame.com/images/cardlist/OP01-001_thumb.jpg',
    gameType: 'onepiece',
    releaseDate: '2023-03-01',
    isPromo: false,
    isSecretRare: true,
    currentPrice: 150.00,
  },
  {
    cardId: 'onepiece_002',
    name: '索隆 三刀流',
    series: 'One Piece',
    setCode: 'OP01',
    cardNumber: '002/100',
    rarity: 'Ultra Rare',
    cardType: 'Character',
    hp: 4000,
    attack: 4000,
    defense: 0,
    description: '草帽海賊團劍士，世界第一大劍豪候選',
    imageUrl: 'https://onepiece-cardgame.com/images/cardlist/OP01-002.jpg',
    thumbnailUrl: 'https://onepiece-cardgame.com/images/cardlist/OP01-002_thumb.jpg',
    gameType: 'onepiece',
    releaseDate: '2023-03-01',
    isPromo: false,
    isSecretRare: false,
    currentPrice: 45.00,
  },
];

// 示例用戶數據
const users = [
  {
    email: 'test@example.com',
    password: 'password123',
    name: '測試用戶',
    membership: 'FREE',
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    name: '管理員',
    membership: 'PREMIUM',
  },
];

const seedDatabase = async () => {
  try {
    logger.info('開始初始化數據庫...');

    // 同步數據庫
    await syncDatabase(true);

    // 創建用戶
    logger.info('創建用戶...');
    for (const userData of users) {
      await User.create(userData);
    }

    // 創建Pokemon卡牌
    logger.info('創建Pokemon卡牌...');
    for (const cardData of pokemonCards) {
      await Card.create(cardData);
    }

    // 創建One Piece卡牌
    logger.info('創建One Piece卡牌...');
    for (const cardData of onePieceCards) {
      await Card.create(cardData);
    }

    logger.info('數據庫初始化完成！');
    logger.info(`創建了 ${ users.length } 個用戶`);
    logger.info(`創建了 ${ pokemonCards.length } 張Pokemon卡牌`);
    logger.info(`創建了 ${ onePieceCards.length } 張One Piece卡牌`);

    process.exit(0);
  } catch (error) {
    logger.error('數據庫初始化失敗:', error);
    process.exit(1);
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
