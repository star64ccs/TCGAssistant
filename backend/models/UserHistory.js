const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Card = require('./Card');

const UserHistory = sequelize.define('UserHistory', {
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
    allowNull: true,
    references: {
      model: Card,
      key: 'id'
    }
  },
  actionType: {
    type: DataTypes.ENUM('recognition', 'prediction', 'check', 'collection_add', 'collection_remove'),
    allowNull: false
  },
  actionData: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  result: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'user_histories',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['actionType']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['userId', 'createdAt']
    }
  ]
});

// 關聯關係
UserHistory.belongsTo(User, { foreignKey: 'userId' });
UserHistory.belongsTo(Card, { foreignKey: 'cardId' });

module.exports = UserHistory;
