const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
// const ShiftType = require('./ShiftType') // Circular dependency avoidance if needed

const WorkSchedule = sequelize.define('WorkSchedule', {
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
  // Legacy support or fallback (optional, but good to keep for now if we want to migrate)
  // We will assume new system uses shift_type_id entirely for active shifts
  
  leave_type: {
    type: DataTypes.ENUM('hafta_tatili', 'resmi_tatil', 'ucretsiz_izin', 'yillik_izin', 'raporlu', 'dogum_izni'),
    allowNull: true
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
  tableName: 'work_schedules',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'employee_id', 'date']
    }
  ]
})

module.exports = WorkSchedule
