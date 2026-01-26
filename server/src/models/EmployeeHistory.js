const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * EmployeeHistory - Personel atama geçmişi
 * Firma ve proje atama/çıkarma işlemlerini takip eder
 */
const EmployeeHistory = sequelize.define('EmployeeHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM(
      'assigned_to_company',
      'removed_from_company',
      'assigned_to_project',
      'removed_from_project',
      // New shift-related actions
      'shift_entry',        // QR ile giriş yapıldı
      'shift_exit',         // QR ile çıkış yapıldı
      'shift_completed',    // Vardiya tamamlandı
      'shift_deleted',      // Vardiya silindi (eski veriler arşivlendi)
      'overtime_completed', // Mesai tamamlandı
      'auto_checkout'       // Sistem tarafından otomatik çıkış
    ),
    allowNull: false
  },
  performed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'employee_history',
  timestamps: true,
  underscored: true
})

module.exports = EmployeeHistory
