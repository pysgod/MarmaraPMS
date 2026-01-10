const express = require('express')
const router = express.Router()
const { Report, ReportType } = require('../models')

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{ model: ReportType, as: 'reportType' }],
      order: [['created_at', 'DESC']]
    })
    res.json(reports)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message })
  }
})

// Create report
router.post('/', async (req, res) => {
  try {
    const report = await Report.create(req.body)
    res.status(201).json(report)
  } catch (error) {
    res.status(400).json({ message: 'Error creating report', error: error.message })
  }
})

module.exports = router
