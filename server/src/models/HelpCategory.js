const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const HelpCategory = sequelize.define('HelpCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'help_categories',
  timestamps: true,
  underscored: true
})

module.exports = HelpCategory
