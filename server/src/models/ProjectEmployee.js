const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ProjectEmployee = sequelize.define('ProjectEmployee', {
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
  assigned_role: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'project_employees',
  timestamps: false,
  underscored: true
})

module.exports = ProjectEmployee
