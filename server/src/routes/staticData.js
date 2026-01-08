const express = require('express')
const router = express.Router()
const { ReportType, DocumentCategory, FaqItem, HelpCategory } = require('../models')

// Helper function to get localized name
const getLocalizedName = (item, lang) => {
  return lang === 'en' ? item.nameEn : item.nameTr
}

// Get report types
router.get('/report-types', async (req, res) => {
  try {
    const lang = req.query.lang || 'tr'
    const reportTypes = await ReportType.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    })
    
    const result = reportTypes.map(rt => ({
      id: rt.key,
      name: getLocalizedName(rt, lang),
      icon: rt.icon,
      color: rt.color,
      count: rt.count
    }))
    
    res.json(result)
  } catch (error) {
    console.error('Get report types error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get document categories
router.get('/document-categories', async (req, res) => {
  try {
    const lang = req.query.lang || 'tr'
    const categories = await DocumentCategory.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    })
    
    const result = categories.map(cat => getLocalizedName(cat, lang))
    res.json(result)
  } catch (error) {
    console.error('Get document categories error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get FAQ items
router.get('/faq', async (req, res) => {
  try {
    const lang = req.query.lang || 'tr'
    const faqItems = await FaqItem.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    })
    
    const result = faqItems.map(faq => ({
      question: lang === 'en' ? faq.questionEn : faq.questionTr,
      answer: lang === 'en' ? faq.answerEn : faq.answerTr
    }))
    
    res.json(result)
  } catch (error) {
    console.error('Get FAQ error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get help categories
router.get('/help-categories', async (req, res) => {
  try {
    const lang = req.query.lang || 'tr'
    const categories = await HelpCategory.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    })
    
    const result = categories.map(cat => ({
      id: cat.key,
      name: getLocalizedName(cat, lang),
      icon: cat.icon,
      articles: cat.articleCount
    }))
    
    res.json(result)
  } catch (error) {
    console.error('Get help categories error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
