const express = require('express')
const router = express.Router()
const { Employee, Company, ProjectEmployee, Project, PatrolAssignment, PatrolLog } = require('../models')

// Get all employees (optionally filter by company)
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query
    const where = companyId ? { company_id: companyId } : {}
    
    const employees = await Employee.findAll({
      where,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }
      ],
      order: [['created_at', 'DESC']]
    })
    res.json(employees)
  } catch (error) {
    console.error('Get employees error:', error)
    res.status(500).json({ message: 'Çalışanlar getirilirken hata oluştu', error: error.message })
  }
})

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { 
          model: ProjectEmployee, 
          as: 'projectAssignments',
          include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'status'] }]
        }
      ]
    })
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    res.json(employee)
  } catch (error) {
    console.error('Get employee error:', error)
    res.status(500).json({ message: 'Çalışan getirilirken hata oluştu', error: error.message })
  }
})

// Create employee
router.post('/', async (req, res) => {
  try {
    const { company_id, name, phone, role, status } = req.body
    
    if (!company_id || !name) {
      return res.status(400).json({ message: 'Firma ve çalışan adı zorunludur' })
    }
    
    const employee = await Employee.create({
      company_id,
      name,
      phone,
      role,
      status: status || 'active'
    })
    
    const employeeWithCompany = await Employee.findByPk(employee.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }]
    })
    
    res.status(201).json(employeeWithCompany)
  } catch (error) {
    console.error('Create employee error:', error)
    res.status(500).json({ message: 'Çalışan oluşturulurken hata oluştu', error: error.message })
  }
})

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id)
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    const { name, phone, role, status } = req.body
    await employee.update({ name, phone, role, status })
    
    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }]
    })
    
    res.json(updatedEmployee)
  } catch (error) {
    console.error('Update employee error:', error)
    res.status(500).json({ message: 'Çalışan güncellenirken hata oluştu', error: error.message })
  }
})

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id)
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    await employee.destroy()
    res.json({ message: 'Çalışan silindi' })
  } catch (error) {
    console.error('Delete employee error:', error)
    res.status(500).json({ message: 'Çalışan silinirken hata oluştu', error: error.message })
  }
})

module.exports = router
