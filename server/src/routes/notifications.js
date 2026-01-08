const express = require('express')
const { Notification } = require('../models')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    })

    res.json(notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      time: getRelativeTime(n.createdAt),
      createdAt: n.createdAt
    })))
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ message: 'Bildirimler alınırken hata oluştu' })
  }
})

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    })

    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' })
    }

    await notification.update({ read: true })
    res.json(notification)
  } catch (error) {
    console.error('Update notification error:', error)
    res.status(500).json({ message: 'Bildirim güncellenirken hata oluştu' })
  }
})

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    )
    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' })
  } catch (error) {
    console.error('Update notifications error:', error)
    res.status(500).json({ message: 'Bildirimler güncellenirken hata oluştu' })
  }
})

// Create notification (internal use)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      userId: req.body.userId || req.user.id
    })
    res.status(201).json(notification)
  } catch (error) {
    console.error('Create notification error:', error)
    res.status(500).json({ message: 'Bildirim oluşturulurken hata oluştu' })
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
