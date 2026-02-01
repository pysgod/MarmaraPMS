const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Patrol = sequelize.define('Patrol', {
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
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  schedule_start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  schedule_end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  interval_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 60
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active'
  }
}, {
  tableName: 'patrols',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
})

module.exports = Patrol
