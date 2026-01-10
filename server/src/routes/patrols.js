const express = require('express')
const router = express.Router()
const { Patrol, Company, Project, Employee, PatrolAssignment, PatrolLog } = require('../models')

// Get all patrols (optionally filter by company or project)
router.get('/', async (req, res) => {
  try {
    const { companyId, projectId } = req.query
    const where = {}
    if (companyId) where.company_id = companyId
    if (projectId) where.project_id = projectId
    
    const patrols = await Patrol.findAll({
      where,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
        { 
          model: PatrolAssignment, 
          as: 'assignments',
          include: [{ model: Employee, as: 'employee', attributes: ['id', 'name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    })
    res.json(patrols)
  } catch (error) {
    console.error('Get patrols error:', error)
    res.status(500).json({ message: 'Devriyeler getirilirken hata oluştu', error: error.message })
  }
})

// Get patrol by ID
router.get('/:id', async (req, res) => {
  try {
    const patrol = await Patrol.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
        { 
          model: PatrolAssignment, 
          as: 'assignments',
          include: [{ model: Employee, as: 'employee' }]
        },
        { 
          model: PatrolLog, 
          as: 'logs',
          include: [{ model: Employee, as: 'employee', attributes: ['id', 'name'] }],
          order: [['check_time', 'DESC']],
          limit: 50
        }
      ]
    })
    
    if (!patrol) {
      return res.status(404).json({ message: 'Devriye bulunamadı' })
    }
    
    res.json(patrol)
  } catch (error) {
    console.error('Get patrol error:', error)
    res.status(500).json({ message: 'Devriye getirilirken hata oluştu', error: error.message })
  }
})

// Create patrol
router.post('/', async (req, res) => {
  try {
    const { company_id, project_id, name, description, status } = req.body
    
    if (!company_id || !project_id || !name) {
      return res.status(400).json({ message: 'Firma, proje ve devriye adı zorunludur' })
    }
    
    const patrol = await Patrol.create({
      company_id,
      project_id,
      name,
      description,
      status: status || 'active'
    })
    
    const patrolWithRelations = await Patrol.findByPk(patrol.id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] }
      ]
    })
    
    res.status(201).json(patrolWithRelations)
  } catch (error) {
    console.error('Create patrol error:', error)
    res.status(500).json({ message: 'Devriye oluşturulurken hata oluştu', error: error.message })
  }
})

// Update patrol
router.put('/:id', async (req, res) => {
  try {
    const patrol = await Patrol.findByPk(req.params.id)
    
    if (!patrol) {
      return res.status(404).json({ message: 'Devriye bulunamadı' })
    }
    
    const { name, description, status } = req.body
    await patrol.update({ name, description, status })
    
    const updatedPatrol = await Patrol.findByPk(patrol.id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'status'] }
      ]
    })
    
    res.json(updatedPatrol)
  } catch (error) {
    console.error('Update patrol error:', error)
    res.status(500).json({ message: 'Devriye güncellenirken hata oluştu', error: error.message })
  }
})

// Delete patrol
router.delete('/:id', async (req, res) => {
  try {
    const patrol = await Patrol.findByPk(req.params.id)
    
    if (!patrol) {
      return res.status(404).json({ message: 'Devriye bulunamadı' })
    }
    
    await patrol.destroy()
    res.json({ message: 'Devriye silindi' })
  } catch (error) {
    console.error('Delete patrol error:', error)
    res.status(500).json({ message: 'Devriye silinirken hata oluştu', error: error.message })
  }
})

// ==========================================
// Patrol Assignment Endpoints
// ==========================================

// Get patrol assignments
router.get('/:id/assignments', async (req, res) => {
  try {
    const assignments = await PatrolAssignment.findAll({
      where: { patrol_id: req.params.id },
      include: [{ model: Employee, as: 'employee' }]
    })
    res.json(assignments)
  } catch (error) {
    console.error('Get patrol assignments error:', error)
    res.status(500).json({ message: 'Atamalar getirilirken hata oluştu', error: error.message })
  }
})

// Create patrol assignment
router.post('/:id/assignments', async (req, res) => {
  try {
    const { employee_id, schedule_type, start_time, end_time } = req.body
    const patrol_id = req.params.id
    
    const assignment = await PatrolAssignment.create({
      patrol_id,
      employee_id,
      schedule_type: schedule_type || 'daily',
      start_time,
      end_time,
      status: 'active'
    })
    
    const assignmentWithEmployee = await PatrolAssignment.findByPk(assignment.id, {
      include: [{ model: Employee, as: 'employee' }]
    })
    
    res.status(201).json(assignmentWithEmployee)
  } catch (error) {
    console.error('Create patrol assignment error:', error)
    res.status(500).json({ message: 'Atama oluşturulurken hata oluştu', error: error.message })
  }
})

// Delete patrol assignment
router.delete('/:id/assignments/:assignmentId', async (req, res) => {
  try {
    const result = await PatrolAssignment.destroy({
      where: { id: req.params.assignmentId, patrol_id: req.params.id }
    })
    
    if (result === 0) {
      return res.status(404).json({ message: 'Atama bulunamadı' })
    }
    
    res.json({ message: 'Atama silindi' })
  } catch (error) {
    console.error('Delete patrol assignment error:', error)
    res.status(500).json({ message: 'Atama silinirken hata oluştu', error: error.message })
  }
})

// ==========================================
// Patrol Log Endpoints
// ==========================================

// Get patrol logs
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await PatrolLog.findAll({
      where: { patrol_id: req.params.id },
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'name'] }],
      order: [['check_time', 'DESC']]
    })
    res.json(logs)
  } catch (error) {
    console.error('Get patrol logs error:', error)
    res.status(500).json({ message: 'Loglar getirilirken hata oluştu', error: error.message })
  }
})

// Create patrol log (for mobile app)
router.post('/:id/logs', async (req, res) => {
  try {
    const { employee_id, latitude, longitude, result } = req.body
    const patrol_id = req.params.id
    
    const log = await PatrolLog.create({
      patrol_id,
      employee_id,
      check_time: new Date(),
      latitude,
      longitude,
      result: result || 'success'
    })
    
    const logWithEmployee = await PatrolLog.findByPk(log.id, {
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'name'] }]
    })
    
    res.status(201).json(logWithEmployee)
  } catch (error) {
    console.error('Create patrol log error:', error)
    res.status(500).json({ message: 'Log oluşturulurken hata oluştu', error: error.message })
  }
})

module.exports = router
