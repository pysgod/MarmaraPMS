const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const DocumentCategory = sequelize.define('DocumentCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  tableName: 'document_categories',
  timestamps: true,
  underscored: true
})

module.exports = DocumentCategory
