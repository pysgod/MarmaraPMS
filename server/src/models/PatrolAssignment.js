const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PatrolAssignment = sequelize.define('PatrolAssignment', {
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
  schedule_type: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'once'),
    defaultValue: 'daily'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active'
  }
}, {
  tableName: 'patrol_assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
})

module.exports = PatrolAssignment
