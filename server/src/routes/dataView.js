const express = require('express')
const { Company, Project, Personnel, Patrol, User } = require('../models')

const router = express.Router()

// Get all data for data view
router.get('/', async (req, res) => {
  try {
    const [
      companies,
      projects,
      personnel,
      patrols,
      users
    ] = await Promise.all([
      Company.findAll({ order: [['createdAt', 'DESC']] }),
      Project.findAll({ order: [['createdAt', 'DESC']] }),
      Personnel.findAll({ order: [['createdAt', 'DESC']] }),
      Patrol.findAll({ order: [['createdAt', 'DESC']] }),
      User.findAll({ 
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']] 
      })
    ])

    res.json({
      companies,
      projects,
      personnel,
      patrols,
      users
    })
  } catch (error) {
    console.error('Get all data error:', error)
    res.status(500).json({ message: 'Veriler alınırken hata oluştu', error: error.message })
  }
})

module.exports = router
