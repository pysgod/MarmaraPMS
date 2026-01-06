import { useState } from 'react'
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Users
} from 'lucide-react'

const faqItems = [
  { 
    question: 'Yeni firma nasıl eklenir?', 
    answer: 'Sol menüden "Firmalar" bölümüne gidin, ardından sağ üst köşedeki "Yeni Firma Ekle" butonuna tıklayın. Açılan formda gerekli bilgileri doldurun ve kaydedin.' 
  },
  { 
    question: 'Devriye nasıl oluşturulur?', 
    answer: 'Devriye modülüne giderek "Yeni Devriye Oluştur" butonuna tıklayın. Personel ataması yapın, rota noktalarını belirleyin ve zaman dilimini seçin.' 
  },
  { 
    question: 'Rapor nasıl indirilir?', 
    answer: 'Raporlar sayfasından istediğiniz raporu seçin ve sağ taraftaki indirme ikonuna tıklayın. PDF veya Excel formatında indirebilirsiniz.' 
  },
  { 
    question: 'Personel rolü nasıl değiştirilir?', 
    answer: 'Personeller > Personel Detay sayfasına gidin, "Düzenle" butonuna tıklayın ve rol alanını güncelleyin.' 
  },
  { 
    question: 'Firma bağlamı (context) nedir?', 
    answer: 'Topbar\'daki firma seçici ile bir firma seçtiğinizde, tüm sayfalar (Devriye, Projeler, Personeller vb.) seçili firmaya göre filtrelenir.' 
  },
]

const helpCategories = [
  { id: 'getting-started', name: 'Başlarken', icon: Book, articles: 12 },
  { id: 'companies', name: 'Firma Yönetimi', icon: Users, articles: 8 },
  { id: 'patrol', name: 'Devriye Sistemi', icon: FileText, articles: 15 },
  { id: 'reports', name: 'Raporlar', icon: FileText, articles: 10 },
]

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-50">Yardım Merkezi</h1>
        <p className="text-dark-400 mt-2">Size nasıl yardımcı olabiliriz?</p>
        
        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            placeholder="Soru veya konu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-dark-700 rounded-xl
              text-dark-100 placeholder-dark-400 text-lg
              focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {helpCategories.map(category => {
          const Icon = category.icon
          return (
            <button 
              key={category.id}
              className="bg-dark-800 rounded-2xl border border-dark-700 p-6 text-left card-hover group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Icon size={24} className="text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-1">{category.name}</h3>
              <p className="text-sm text-dark-400">{category.articles} makale</p>
            </button>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <h2 className="text-xl font-semibold text-dark-100 mb-6">Sık Sorulan Sorular</h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="border border-dark-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-700/30 transition-colors"
              >
                <span className="font-medium text-dark-100">{item.question}</span>
                {openFaq === index ? (
                  <ChevronDown size={20} className="text-accent" />
                ) : (
                  <ChevronRight size={20} className="text-dark-400" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 text-dark-300 animate-fadeIn">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 text-center card-hover">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-100 mb-2">Canlı Destek</h3>
          <p className="text-sm text-dark-400 mb-4">Anında yardım alın</p>
          <button className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors">
            Sohbet Başlat
          </button>
        </div>
        
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 text-center card-hover">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Phone size={28} className="text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-100 mb-2">Telefon Desteği</h3>
          <p className="text-sm text-dark-400 mb-4">Hafta içi 09:00 - 18:00</p>
          <button className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors">
            0850 xxx xx xx
          </button>
        </div>
        
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 text-center card-hover">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-100 mb-2">E-posta</h3>
          <p className="text-sm text-dark-400 mb-4">24 saat içinde yanıt</p>
          <button className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors">
            destek@marmara.com
          </button>
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark-100">Video Eğitimler</h2>
          <button className="text-sm text-accent hover:text-accent-light flex items-center gap-1">
            Tümünü Gör <ExternalLink size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Platform Tanıtımı', duration: '5:32' },
            { title: 'Firma Ekleme Rehberi', duration: '3:45' },
            { title: 'Devriye Sistemi Kullanımı', duration: '8:20' },
          ].map((video, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative h-32 bg-dark-700 rounded-xl mb-3 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 group-hover:bg-dark-900/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center">
                    <Video size={20} className="text-white ml-1" />
                  </div>
                </div>
              </div>
              <h4 className="font-medium text-dark-100 group-hover:text-accent transition-colors">{video.title}</h4>
              <p className="text-sm text-dark-400">{video.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
