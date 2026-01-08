require('dotenv').config()
const { sequelize, ReportType, DocumentCategory, FaqItem, HelpCategory } = require('../models')

const seedData = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected')
    
    // Sync tables
    await sequelize.sync({ alter: true })
    console.log('Tables synced')

    // Seed Report Types
    const reportTypes = [
      { key: 'company', icon: 'Building2', color: 'blue', count: 12, nameTr: 'Firma Raporları', nameEn: 'Company Reports' },
      { key: 'project', icon: 'FolderKanban', color: 'green', count: 8, nameTr: 'Proje Raporları', nameEn: 'Project Reports' },
      { key: 'personnel', icon: 'Users', color: 'purple', count: 15, nameTr: 'Personel Raporları', nameEn: 'Personnel Reports' },
      { key: 'financial', icon: 'DollarSign', color: 'amber', count: 6, nameTr: 'Finansal Raporlar', nameEn: 'Financial Reports' }
    ]

    for (const rt of reportTypes) {
      await ReportType.findOrCreate({
        where: { key: rt.key },
        defaults: rt
      })
    }
    console.log('✅ Report types seeded')

    // Seed Document Categories
    const docCategories = [
      { key: 'all', order: 0, nameTr: 'Tümü', nameEn: 'All' },
      { key: 'contracts', order: 1, nameTr: 'Sözleşmeler', nameEn: 'Contracts' },
      { key: 'reports', order: 2, nameTr: 'Raporlar', nameEn: 'Reports' },
      { key: 'plans', order: 3, nameTr: 'Planlar', nameEn: 'Plans' },
      { key: 'media', order: 4, nameTr: 'Medya', nameEn: 'Media' },
      { key: 'protocols', order: 5, nameTr: 'Protokoller', nameEn: 'Protocols' },
      { key: 'training', order: 6, nameTr: 'Eğitim', nameEn: 'Training' }
    ]

    for (const cat of docCategories) {
      await DocumentCategory.findOrCreate({
        where: { key: cat.key },
        defaults: cat
      })
    }
    console.log('✅ Document categories seeded')

    // Seed FAQ Items
    const faqItems = [
      { 
        order: 1,
        questionTr: 'Yeni firma nasıl eklenir?', 
        questionEn: 'How to add a new company?',
        answerTr: 'Sol menüden "Firmalar" bölümüne gidin, ardından sağ üst köşedeki "Yeni Firma Ekle" butonuna tıklayın. Açılan formda gerekli bilgileri doldurun ve kaydedin.',
        answerEn: 'Go to "Companies" section from the left menu, then click the "Add New Company" button in the top right corner. Fill in the required information and save.'
      },
      { 
        order: 2,
        questionTr: 'Devriye nasıl oluşturulur?', 
        questionEn: 'How to create a patrol?',
        answerTr: 'Devriye modülüne giderek "Yeni Devriye Oluştur" butonuna tıklayın. Personel ataması yapın, rota noktalarını belirleyin ve zaman dilimini seçin.',
        answerEn: 'Go to the Patrol module and click "Create New Patrol" button. Assign personnel, define route points, and select the time slot.'
      },
      { 
        order: 3,
        questionTr: 'Rapor nasıl indirilir?', 
        questionEn: 'How to download a report?',
        answerTr: 'Raporlar sayfasından istediğiniz raporu seçin ve sağ taraftaki indirme ikonuna tıklayın. PDF veya Excel formatında indirebilirsiniz.',
        answerEn: 'Select the desired report from the Reports page and click the download icon on the right. You can download in PDF or Excel format.'
      },
      { 
        order: 4,
        questionTr: 'Personel rolü nasıl değiştirilir?', 
        questionEn: 'How to change personnel role?',
        answerTr: 'Personeller > Personel Detay sayfasına gidin, "Düzenle" butonuna tıklayın ve rol alanını güncelleyin.',
        answerEn: 'Go to Personnel > Personnel Detail page, click "Edit" button and update the role field.'
      },
      { 
        order: 5,
        questionTr: 'Firma bağlamı (context) nedir?', 
        questionEn: 'What is company context?',
        answerTr: 'Topbar\'daki firma seçici ile bir firma seçtiğinizde, tüm sayfalar (Devriye, Projeler, Personeller vb.) seçili firmaya göre filtrelenir.',
        answerEn: 'When you select a company using the company selector in the topbar, all pages (Patrol, Projects, Personnel, etc.) are filtered according to the selected company.'
      }
    ]

    for (const faq of faqItems) {
      await FaqItem.findOrCreate({
        where: { questionTr: faq.questionTr },
        defaults: faq
      })
    }
    console.log('✅ FAQ items seeded')

    // Seed Help Categories
    const helpCategories = [
      { key: 'getting-started', icon: 'Book', articleCount: 12, order: 1, nameTr: 'Başlarken', nameEn: 'Getting Started' },
      { key: 'companies', icon: 'Users', articleCount: 8, order: 2, nameTr: 'Firma Yönetimi', nameEn: 'Company Management' },
      { key: 'patrol', icon: 'FileText', articleCount: 15, order: 3, nameTr: 'Devriye Sistemi', nameEn: 'Patrol System' },
      { key: 'reports', icon: 'FileText', articleCount: 10, order: 4, nameTr: 'Raporlar', nameEn: 'Reports' }
    ]

    for (const cat of helpCategories) {
      await HelpCategory.findOrCreate({
        where: { key: cat.key },
        defaults: cat
      })
    }
    console.log('✅ Help categories seeded')

    console.log('\n🎉 All static data seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
