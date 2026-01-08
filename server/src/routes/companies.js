const express = require('express')
const router = express.Router()
const { Company, Employee, Project, Patrol, ProjectEmployee } = require('../models')

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['created_at', 'DESC']]
    })
    
    // Add counts for each company
    const companiesWithCounts = await Promise.all(companies.map(async (company) => {
      const employeeCount = await Employee.count({ where: { company_id: company.id } })
      const projectCount = await Project.count({ where: { company_id: company.id } })
      const patrolCount = await Patrol.count({ where: { company_id: company.id } })
      
      return {
        ...company.toJSON(),
        employeeCount,
        projectCount,
        patrolCount
      }
    }))
    
    res.json(companiesWithCounts)
  } catch (error) {
    console.error('Get companies error:', error)
    res.status(500).json({ message: 'Firmalar getirilirken hata oluştu', error: error.message })
  }
})

// Get company by ID with all related data
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employees' },
        { 
          model: Project, 
          as: 'projects',
          include: [
            { 
              model: ProjectEmployee, 
              as: 'projectEmployees',
              include: [{ model: Employee, as: 'employee', attributes: ['id', 'name', 'role'] }]
            }
          ]
        },
        { 
          model: Patrol, 
          as: 'patrols',
          include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
        }
      ]
    })
    
    if (!company) {
      return res.status(404).json({ message: 'Firma bulunamadı' })
    }
    
    res.json(company)
  } catch (error) {
    console.error('Get company error:', error)
    res.status(500).json({ message: 'Firma getirilirken hata oluştu', error: error.message })
  }
})

// Create company
router.post('/', async (req, res) => {
  try {
    const { name, company_code, status, country, city, timezone } = req.body
    
    if (!name || !company_code) {
      return res.status(400).json({ message: 'Firma adı ve kodu zorunludur' })
    }
    
    // Check if company code already exists
    const existing = await Company.findOne({ where: { company_code } })
    if (existing) {
      return res.status(400).json({ message: 'Bu firma kodu zaten kullanımda' })
    }
    
    const company = await Company.create({
      name,
      company_code,
      status: status || 'active',
      country,
      city,
      timezone: timezone || 'Europe/Istanbul'
    })
    
    res.status(201).json({
      ...company.toJSON(),
      employeeCount: 0,
      projectCount: 0,
      patrolCount: 0
    })
  } catch (error) {
    console.error('Create company error:', error)
    res.status(500).json({ message: 'Firma oluşturulurken hata oluştu', error: error.message })
  }
})

// Update company
router.put('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id)
    
    if (!company) {
      return res.status(404).json({ message: 'Firma bulunamadı' })
    }
    
    const { name, company_code, status, country, city, timezone } = req.body
    
    // Check if new company code conflicts with another company
    if (company_code && company_code !== company.company_code) {
      const existing = await Company.findOne({ where: { company_code } })
      if (existing) {
        return res.status(400).json({ message: 'Bu firma kodu zaten kullanımda' })
      }
    }
    
    await company.update({ name, company_code, status, country, city, timezone })
    
    res.json(company)
  } catch (error) {
    console.error('Update company error:', error)
    res.status(500).json({ message: 'Firma güncellenirken hata oluştu', error: error.message })
  }
})

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id)
    
    if (!company) {
      return res.status(404).json({ message: 'Firma bulunamadı' })
    }
    
    // Check if company has related data
    const employeeCount = await Employee.count({ where: { company_id: company.id } })
    const projectCount = await Project.count({ where: { company_id: company.id } })
    
    if (employeeCount > 0 || projectCount > 0) {
      return res.status(400).json({ 
        message: 'Firmaya bağlı çalışan veya proje bulunduğu için silinemez' 
      })
    }
    
    await company.destroy()
    res.json({ message: 'Firma silindi' })
  } catch (error) {
    console.error('Delete company error:', error)
    res.status(500).json({ message: 'Firma silinirken hata oluştu', error: error.message })
  }
})

module.exports = router
