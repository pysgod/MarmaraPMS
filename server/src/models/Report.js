const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('ready', 'processing', 'failed'),
    defaultValue: 'processing'
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'reports',
  timestamps: true,
  underscored: true
})

module.exports = Report
