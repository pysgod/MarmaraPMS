const express = require('express')
const router = express.Router()
const { Document, DocumentCategory } = require('../models')

// Get all documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [{ model: DocumentCategory, as: 'category' }],
      order: [['created_at', 'DESC']]
    })
    res.json(documents)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message })
  }
})

// Create document
router.post('/', async (req, res) => {
  try {
    const document = await Document.create(req.body)
    res.status(201).json(document)
  } catch (error) {
    res.status(400).json({ message: 'Error creating document', error: error.message })
  }
})

module.exports = router
