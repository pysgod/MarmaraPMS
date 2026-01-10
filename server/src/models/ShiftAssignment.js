const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ShiftAssignment = sequelize.define('ShiftAssignment', {
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
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  shift_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shift_definitions',
      key: 'id'
    }
  }
}, {
  tableName: 'shift_assignments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'employee_id']
    }
  ]
})

module.exports = ShiftAssignment
