const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ShiftDefinition = sequelize.define('ShiftDefinition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  break_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true,
    comment: 'Dakika cinsinden dinlenme süresi'
  }
}, {
  tableName: 'shift_definitions',
  timestamps: true,
  underscored: true
})

module.exports = ShiftDefinition
