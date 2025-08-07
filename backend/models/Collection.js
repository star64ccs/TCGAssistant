const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Card = require('./Card');

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  cardId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Card,
      key: 'id'
    }
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  condition: {
    type: DataTypes.ENUM('mint', 'near_mint', 'excellent', 'good', 'light_played', 'played', 'poor'),
    defaultValue: 'near_mint'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'collections',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['cardId']
    },
    {
      fields: ['userId', 'cardId'],
      unique: true
    }
  ]
});

// 關聯關係
Collection.belongsTo(User, { foreignKey: 'userId' });
Collection.belongsTo(Card, { foreignKey: 'cardId' });

module.exports = Collection;
