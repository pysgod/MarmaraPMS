const sequelize = require('../config/database')
const User = require('./User')
const Company = require('./Company')
const Employee = require('./Employee')
const Project = require('./Project')
const ProjectEmployee = require('./ProjectEmployee')
const Patrol = require('./Patrol')
const PatrolAssignment = require('./PatrolAssignment')
const PatrolLog = require('./PatrolLog')
const Notification = require('./Notification')

// ==========================================
// Company Associations (Grand Mother)
// ==========================================
// Company has many Employees
Company.hasMany(Employee, { foreignKey: 'company_id', as: 'employees' })
Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'company' })

// Company has many Projects
Company.hasMany(Project, { foreignKey: 'company_id', as: 'projects' })
Project.belongsTo(Company, { foreignKey: 'company_id', as: 'company' })

// Company has many Patrols
Company.hasMany(Patrol, { foreignKey: 'company_id', as: 'patrols' })
Patrol.belongsTo(Company, { foreignKey: 'company_id', as: 'company' })

// ==========================================
// Project Associations (Mother)
// ==========================================
// Project has many Patrols
Project.hasMany(Patrol, { foreignKey: 'project_id', as: 'patrols' })
Patrol.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

// Project-Employee Many-to-Many through ProjectEmployee
Project.belongsToMany(Employee, { 
  through: ProjectEmployee, 
  foreignKey: 'project_id', 
  otherKey: 'employee_id',
  as: 'employees' 
})
Employee.belongsToMany(Project, { 
  through: ProjectEmployee, 
  foreignKey: 'employee_id', 
  otherKey: 'project_id',
  as: 'projects' 
})

// ProjectEmployee belongs to Project and Employee for direct queries
ProjectEmployee.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })
ProjectEmployee.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })
Project.hasMany(ProjectEmployee, { foreignKey: 'project_id', as: 'projectEmployees' })
Employee.hasMany(ProjectEmployee, { foreignKey: 'employee_id', as: 'projectAssignments' })

// ==========================================
// Patrol Associations
// ==========================================
// Patrol has many assignments
Patrol.hasMany(PatrolAssignment, { foreignKey: 'patrol_id', as: 'assignments' })
PatrolAssignment.belongsTo(Patrol, { foreignKey: 'patrol_id', as: 'patrol' })

// PatrolAssignment belongs to Employee
PatrolAssignment.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })
Employee.hasMany(PatrolAssignment, { foreignKey: 'employee_id', as: 'patrolAssignments' })

// Patrol has many logs
Patrol.hasMany(PatrolLog, { foreignKey: 'patrol_id', as: 'logs' })
PatrolLog.belongsTo(Patrol, { foreignKey: 'patrol_id', as: 'patrol' })

// PatrolLog belongs to Employee
PatrolLog.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })
Employee.hasMany(PatrolLog, { foreignKey: 'employee_id', as: 'patrolLogs' })

// ==========================================
// User/Notification Associations
// ==========================================
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' })

module.exports = {
  sequelize,
  User,
  Company,
  Employee,
  Project,
  ProjectEmployee,
  Patrol,
  PatrolAssignment,
  PatrolLog,
  Notification
}
