const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const WorkScheduleJoker = sequelize.define('WorkScheduleJoker', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // Replaces numeric/string shift_type with FK
  shift_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'shift_types',
      key: 'id'
    }
  },
  gozetim_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: false
  },
  mesai_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: false
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'work_schedule_jokers',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['project_id', 'date']
    }
  ]
})

module.exports = WorkScheduleJoker
