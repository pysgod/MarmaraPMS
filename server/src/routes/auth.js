const express = require('express')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı' })
    }

    const user = await User.create({
      email,
      password,
      name,
      role: role || 'operator'
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.status(201).json({
      message: 'Kayıt başarılı',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Kayıt sırasında hata oluştu' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' })
    }

    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' })
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Hesap pasif durumda' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Giriş sırasında hata oluştu' })
  }
})

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  })
})

module.exports = router
