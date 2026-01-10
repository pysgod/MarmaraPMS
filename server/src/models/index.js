const sequelize = require('../config/database')
const User = require('./User')
const Company = require('./Company')
const Employee = require('./Employee')
const Project = require('./Project')
const ProjectEmployee = require('./ProjectEmployee')
const ProjectClothingType = require('./ProjectClothingType')
const ProjectCustomerRep = require('./ProjectCustomerRep')
const Patrol = require('./Patrol')
const PatrolAssignment = require('./PatrolAssignment')
const PatrolLog = require('./PatrolLog')
const Notification = require('./Notification')
const ReportType = require('./ReportType')
const DocumentCategory = require('./DocumentCategory')
const FaqItem = require('./FaqItem')
const HelpCategory = require('./HelpCategory')
const Report = require('./Report')
const Document = require('./Document')
const Activity = require('./Activity')

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

// Project has many ClothingTypes
Project.hasMany(ProjectClothingType, { foreignKey: 'project_id', as: 'clothingTypes' })
ProjectClothingType.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

// Project has many CustomerReps
Project.hasMany(ProjectCustomerRep, { foreignKey: 'project_id', as: 'customerReps' })
ProjectCustomerRep.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })
ProjectCustomerRep.belongsTo(Company, { foreignKey: 'company_id', as: 'company' })

// Project Manager associations
Project.belongsTo(User, { foreignKey: 'primary_manager_id', as: 'primaryManager' })
Project.belongsTo(User, { foreignKey: 'secondary_manager_id', as: 'secondaryManager' })

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

// ==========================================
// Report / Document Associations
// ==========================================
Report.belongsTo(ReportType, { foreignKey: 'type_id', as: 'reportType' })
ReportType.hasMany(Report, { foreignKey: 'type_id', as: 'reports' })

Document.belongsTo(DocumentCategory, { foreignKey: 'category_id', as: 'category' })
DocumentCategory.hasMany(Document, { foreignKey: 'category_id', as: 'documents' })

// ==========================================
// Shift Associations
// ==========================================
// Company has many ShiftDefinitions
const ShiftDefinition = require('./ShiftDefinition')
const ShiftAssignment = require('./ShiftAssignment')

Company.hasMany(ShiftDefinition, { foreignKey: 'company_id', as: 'shiftDefinitions' })
ShiftDefinition.belongsTo(Company, { foreignKey: 'company_id', as: 'company' })

// ShiftDefinition has many Assignments
ShiftDefinition.hasMany(ShiftAssignment, { foreignKey: 'shift_id', as: 'assignments' })
ShiftAssignment.belongsTo(ShiftDefinition, { foreignKey: 'shift_id', as: 'shiftDefinition' })

// Project has many Assignments
Project.hasMany(ShiftAssignment, { foreignKey: 'project_id', as: 'shiftAssignments' })
ShiftAssignment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

// Employee has many Assignments
Employee.hasMany(ShiftAssignment, { foreignKey: 'employee_id', as: 'shiftAssignments' })
ShiftAssignment.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })

module.exports = {
  sequelize,
  User,
  Company,
  Employee,
  Project,
  ProjectEmployee,
  ProjectClothingType,
  ProjectCustomerRep,
  Patrol,
  PatrolAssignment,
  PatrolLog,
  Notification,
  ReportType,
  DocumentCategory,
  FaqItem,
  HelpCategory,
  Report,
  Document,
  Activity,
  ShiftDefinition,
  ShiftAssignment
}

