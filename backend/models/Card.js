const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cardId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  series: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  setCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rarity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cardType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hp: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  attack: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  defense: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gameType: {
    type: DataTypes.ENUM('pokemon', 'onepiece', 'yugioh', 'magic'),
    allowNull: false,
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isPromo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSecretRare: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  priceUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'cards',
  indexes: [
    {
      fields: ['game_type'],
    },
    { fields: ['series'] },
    { fields: ['rarity'] },
    { fields: ['name'] },
  ],
});

module.exports = Card;
