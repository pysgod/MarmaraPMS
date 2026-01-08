const express = require('express')
const router = express.Router()
const { Project, Company, Employee, ProjectEmployee, Patrol } = require('../models')

// Get all projects (optionally filter by company)
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query
    const where = companyId ? { company_id: companyId } : {}
    
    const projects = await Project.findAll({
      where,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }
      ],
      order: [['created_at', 'DESC']]
    })
    
    // Add employee count to each project
    const projectsWithCounts = await Promise.all(projects.map(async (project) => {
      const employeeCount = await ProjectEmployee.count({ where: { project_id: project.id, status: 'active' } })
      const patrolCount = await Patrol.count({ where: { project_id: project.id } })
      return {
        ...project.toJSON(),
        employeeCount,
        patrolCount
      }
    }))
    
    res.json(projectsWithCounts)
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ message: 'Projeler getirilirken hata oluştu', error: error.message })
  }
})

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { 
          model: ProjectEmployee, 
          as: 'projectEmployees',
          include: [{ model: Employee, as: 'employee' }]
        },
        { model: Patrol, as: 'patrols' }
      ]
    })
    
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı' })
    }
    
    res.json(project)
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ message: 'Proje getirilirken hata oluştu', error: error.message })
  }
})

// Create project
router.post('/', async (req, res) => {
  try {
    const { company_id, name, description, status, start_date, end_date } = req.body
    
    if (!company_id || !name) {
      return res.status(400).json({ message: 'Firma ve proje adı zorunludur' })
    }
    
    const project = await Project.create({
      company_id,
      name,
      description,
      status: status || 'pending',
      start_date,
      end_date
    })
    
    const projectWithCompany = await Project.findByPk(project.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }]
    })
    
    res.status(201).json(projectWithCompany)
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ message: 'Proje oluşturulurken hata oluştu', error: error.message })
  }
})

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı' })
    }
    
    const { name, description, status, start_date, end_date } = req.body
    await project.update({ name, description, status, start_date, end_date })
    
    const updatedProject = await Project.findByPk(project.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }]
    })
    
    res.json(updatedProject)
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ message: 'Proje güncellenirken hata oluştu', error: error.message })
  }
})

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı' })
    }
    
    await project.destroy()
    res.json({ message: 'Proje silindi' })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ message: 'Proje silinirken hata oluştu', error: error.message })
  }
})

// ==========================================
// Project Employee Endpoints
// ==========================================

// Get project employees
router.get('/:id/employees', async (req, res) => {
  try {
    const projectEmployees = await ProjectEmployee.findAll({
      where: { project_id: req.params.id },
      include: [{ model: Employee, as: 'employee' }]
    })
    
    res.json(projectEmployees.map(pe => ({
      ...pe.employee.toJSON(),
      assigned_role: pe.assigned_role,
      assigned_at: pe.assigned_at,
      assignment_status: pe.status
    })))
  } catch (error) {
    console.error('Get project employees error:', error)
    res.status(500).json({ message: 'Proje çalışanları getirilirken hata oluştu', error: error.message })
  }
})

// Assign employee to project
router.post('/:id/employees', async (req, res) => {
  try {
    const { employee_id, assigned_role } = req.body
    const project_id = req.params.id
    
    // Check if already assigned
    const existing = await ProjectEmployee.findOne({
      where: { project_id, employee_id }
    })
    
    if (existing) {
      return res.status(400).json({ message: 'Çalışan zaten bu projeye atanmış' })
    }
    
    const assignment = await ProjectEmployee.create({
      project_id,
      employee_id,
      assigned_role,
      status: 'active'
    })
    
    const assignmentWithEmployee = await ProjectEmployee.findByPk(assignment.id, {
      include: [{ model: Employee, as: 'employee' }]
    })
    
    res.status(201).json(assignmentWithEmployee)
  } catch (error) {
    console.error('Assign employee error:', error)
    res.status(500).json({ message: 'Çalışan atanırken hata oluştu', error: error.message })
  }
})

// Remove employee from project
router.delete('/:id/employees/:employeeId', async (req, res) => {
  try {
    const result = await ProjectEmployee.destroy({
      where: { 
        project_id: req.params.id, 
        employee_id: req.params.employeeId 
      }
    })
    
    if (result === 0) {
      return res.status(404).json({ message: 'Atama bulunamadı' })
    }
    
    res.json({ message: 'Çalışan projeden kaldırıldı' })
  } catch (error) {
    console.error('Remove employee error:', error)
    res.status(500).json({ message: 'Çalışan kaldırılırken hata oluştu', error: error.message })
  }
})

module.exports = router
