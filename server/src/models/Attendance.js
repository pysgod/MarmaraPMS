const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY, // YYYY-MM-DD
    allowNull: false
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  check_out_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Status calculated based on shift times vs actual times
  status: {
    type: DataTypes.ENUM('present', 'late', 'early_leave', 'absent', 'incomplete', 'off_day_work'),
    defaultValue: 'incomplete'
  },
  verification_method: {
    type: DataTypes.ENUM('qr', 'manual', 'gps'),
    defaultValue: 'qr'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Calculated work hours
  planned_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Planned shift hours from ShiftType'
  },
  actual_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Actual worked hours (check_out - check_in)'
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Extra hours beyond planned shift (actual - planned)'
  },
  break_start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Mola başlangıç zamanı'
  },
  break_end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Mola bitiş zamanı'
  },
  total_break_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Toplam mola süresi (dakika)'
  },
  session_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'shift',
    comment: 'Oturum tipi: vardiya veya mesai'
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  underscored: true
})

module.exports = Attendance
