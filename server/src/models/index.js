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
const EmployeeHistory = require('./EmployeeHistory')
const Attendance = require('./Attendance')

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
// Shift Associations (Legacy Removed)
// ==========================================
// ShiftDefinition and ShiftAssignment models have been removed.
// New system uses ShiftType and WorkSchedule.

// ==========================================
// Employee History Associations
// ==========================================
Employee.hasMany(EmployeeHistory, { foreignKey: 'employee_id', as: 'history' })
EmployeeHistory.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })
EmployeeHistory.belongsTo(Company, { foreignKey: 'company_id', as: 'company' })
EmployeeHistory.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })
EmployeeHistory.belongsTo(User, { foreignKey: 'performed_by', as: 'performedBy' })

// ==========================================
// Work Schedule Associations (New Table-based System)
// ==========================================
const WorkSchedule = require('./WorkSchedule')
const WorkScheduleJoker = require('./WorkScheduleJoker')

// Project has many WorkSchedule entries
Project.hasMany(WorkSchedule, { foreignKey: 'project_id', as: 'workSchedules' })
WorkSchedule.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

// Employee has many WorkSchedule entries
Employee.hasMany(WorkSchedule, { foreignKey: 'employee_id', as: 'workSchedules' })
WorkSchedule.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })

// Project has many Joker slots
Project.hasMany(WorkScheduleJoker, { foreignKey: 'project_id', as: 'jokerSlots' })
WorkScheduleJoker.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

// ShiftType Associations
const ShiftType = require('./ShiftType')

// Project has many ShiftTypes
Project.hasMany(ShiftType, { foreignKey: 'project_id', as: 'shiftTypes' })
ShiftType.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

// WorkSchedule belongs to ShiftType
WorkSchedule.belongsTo(ShiftType, { foreignKey: 'shift_type_id', as: 'shiftType' })
ShiftType.hasMany(WorkSchedule, { foreignKey: 'shift_type_id', as: 'workSchedules' })

// WorkScheduleJoker belongs to ShiftType
WorkScheduleJoker.belongsTo(ShiftType, { foreignKey: 'shift_type_id', as: 'shiftType' })
ShiftType.hasMany(WorkScheduleJoker, { foreignKey: 'shift_type_id', as: 'jokerSlots' })

// ==========================================
// Attendance Associations
// ==========================================
// Attendance belongs to Project
Project.hasMany(Attendance, { foreignKey: 'project_id', as: 'attendances' })
Attendance.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

// Attendance belongs to Employee
Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendances' })
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })

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
  EmployeeHistory,
  WorkSchedule,
  WorkScheduleJoker,
  ShiftType,
  Attendance
}

