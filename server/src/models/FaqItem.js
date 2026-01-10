const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const FaqItem = sequelize.define('FaqItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'faq_items',
  timestamps: true,
  underscored: true
})

module.exports = FaqItem
