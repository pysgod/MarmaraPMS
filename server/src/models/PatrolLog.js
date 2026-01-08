const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PatrolLog = sequelize.define('PatrolLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patrol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patrols',
      key: 'id'
    }
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  check_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  result: {
    type: DataTypes.ENUM('success', 'failed', 'missed', 'pending'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'patrol_logs',
  timestamps: false,
  underscored: true
})

module.exports = PatrolLog
