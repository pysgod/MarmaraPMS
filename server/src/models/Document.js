const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    comment: 'pdf, excel, word, etc.'
  },
  size: {
    type: DataTypes.STRING
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'documents',
  timestamps: true,
  underscored: true
})

module.exports = Document
