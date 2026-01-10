const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ReportType = sequelize.define('ReportType', {
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
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: 'blue'
  }
}, {
  tableName: 'report_types',
  timestamps: true,
  underscored: true
})

module.exports = ReportType
