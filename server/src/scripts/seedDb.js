require('dotenv').config()
const { sequelize, User, ReportType, DocumentCategory, HelpCategory, FaqItem } = require('../models')

async function seed() {
  try {
    await sequelize.authenticate()
    console.log('✅ Veritabanı bağlantısı başarılı')

    // 1. Admin Kullanıcısı
    const adminEmail = 'admin@marmara.com'
    const admin = await User.findOne({ where: { email: adminEmail } })
    
    if (!admin) {
      await User.create({
        name: 'Sistem Yöneticisi',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        status: 'active'
      })
      console.log('✅ Admin kullanıcısı oluşturuldu: admin@marmara.com / admin123')
    } else {
      console.log('ℹ️ Admin kullanıcısı zaten mevcut: admin@marmara.com')
      // Ensure password is updated if needed (optional, skipping for now to avoid overwriting user changes)
    }

    // 2. Rapor Türleri
    const reportTypes = [
      { name: 'Günlük Rapor', key: 'daily', icon: 'file-text', color: 'blue' },
      { name: 'Olay Raporu', key: 'incident', icon: 'alert-triangle', color: 'red' },
      { name: 'Devriye Raporu', key: 'patrol', icon: 'shield', color: 'green' },
      { name: 'Shift Raporu', key: 'shift', icon: 'clock', color: 'purple' }
    ]

    for (const rt of reportTypes) {
      const exists = await ReportType.findOne({ where: { key: rt.key } })
      if (!exists) {
        await ReportType.create(rt)
        console.log(`✅ Rapor türü oluşturuldu: ${rt.name}`)
      }
    }

    // 3. Doküman Kategorileri
    const docCategories = [
      { name: 'Genel Belgeler', key: 'general' },
      { name: 'Sözleşmeler', key: 'contracts' },
      { name: 'Prosedürler', key: 'procedures' },
      { name: 'Formlar', key: 'forms' }
    ]

    for (const dc of docCategories) {
      const exists = await DocumentCategory.findOne({ where: { key: dc.key } })
      if (!exists) {
        await DocumentCategory.create(dc)
        console.log(`✅ Doküman kategorisi oluşturuldu: ${dc.name}`)
      }
    }
    
    // 4. Yardım Kategorileri (Help Categories)
    const helpCategories = [
        { name: 'Başlarken', icon: 'Book', articleCount: 5 },
        { name: 'Hesap Yönetimi', icon: 'Users', articleCount: 3 },
        { name: 'Raporlama', icon: 'FileText', articleCount: 8 },
        { name: 'Video Eğitimler', icon: 'Video', articleCount: 4 }
    ]
    
    for (const hc of helpCategories) {
        const exists = await HelpCategory.findOne({ where: { name: hc.name } })
        if (!exists) {
            await HelpCategory.create(hc)
            console.log(`✅ Yardım kategorisi oluşturuldu: ${hc.name}`)
        }
    }

    // 5. FAQ Items
    const faqItems = [
        { 
            question: 'Şifremi nasıl değiştirebilirim?', 
            answer: 'Ayarlar sayfasından şifrenizi değiştirebilirsiniz.',
            order: 1
        },
        { 
            question: 'Yeni personel nasıl eklenir?', 
            answer: 'Personel sayfasındaki "Yeni Personel" butonunu kullanarak ekleyebilirsiniz.',
            order: 2
        }
    ]

    for (const faq of faqItems) {
        const exists = await FaqItem.findOne({ where: { question: faq.question } })
        if (!exists) {
            await FaqItem.create(faq)
            console.log(`✅ FAQ oluşturuldu: ${faq.question}`)
        }
    }

    console.log('🎉 Seed işlemi başarıyla tamamlandı')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed hatası:', error)
    process.exit(1)
  }
}

seed()
