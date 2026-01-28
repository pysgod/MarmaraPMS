const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ShiftType = sequelize.define('ShiftType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  short_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: 'bg-blue-500',
    allowNull: false
  },
  hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 8.00,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  break_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Mola süresi (dakika)'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'shift_types',
  timestamps: true,
  underscored: true
})

module.exports = ShiftType
