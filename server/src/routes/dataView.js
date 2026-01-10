const express = require('express')
const router = express.Router()
const { Company, Project, Employee, User, Patrol, ReportType, DocumentCategory, FaqItem, HelpCategory } = require('../models')

router.get('/', async (req, res) => {
  try {
    const companies = await Company.findAll()
    const projects = await Project.findAll()
    const employees = await Employee.findAll()
    const users = await User.findAll({ attributes: { exclude: ['password'] } })
    const patrols = await Patrol.findAll()
    const reportTypes = await ReportType.findAll()
    const docCategories = await DocumentCategory.findAll()
    const faqItems = await FaqItem.findAll({ order: [['order', 'ASC']] })
    const helpCategories = await HelpCategory.findAll({ order: [['order', 'ASC']] })

    res.json({
      companies,
      projects,
      personnel: employees, // Mapping to 'personnel' as expected by frontend, or I can update frontend to 'employees'
      users,
      patrols,
      reportTypes,
      docCategories,
      faqItems,
      helpCategories
    })
  } catch (error) {
    console.error('Data view error:', error)
    res.status(500).json({ message: 'Veri hatası', error: error.message })
  }
})

module.exports = router
