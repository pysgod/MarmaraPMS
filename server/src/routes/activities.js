const express = require('express')
const router = express.Router()
const { Activity } = require('../models')

// Get recent activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.findAll({
      order: [['created_at', 'DESC']],
      limit: 10
    })
    
    // Format for frontend
    const formatted = activities.map(a => ({
      id: a.id,
      user: a.user_name,
      action: a.action,
      time: getRelativeTime(a.created_at)
    }))
    
    res.json(formatted)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message })
  }
})

function getRelativeTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Az önce'
  if (minutes < 60) return `${minutes} dk önce`
  if (hours < 24) return `${hours} saat önce`
  if (days < 7) return `${days} gün önce`
  return new Date(date).toLocaleDateString('tr-TR')
}

module.exports = router
