import { useState, useEffect } from 'react'
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

// Icon mapping
const getIcon = (iconName) => {
  const icons = {
    Book,
    Users,
    FileText,
    Video
  }
  return icons[iconName] || Book
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  
  const [faqItems, setFaqItems] = useState([])
  const [helpCategories, setHelpCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/data-view')
        const data = await res.json()
        
        setFaqItems(data.faqItems || [])
        setHelpCategories(data.helpCategories.map(c => ({
          ...c,
          icon: getIcon(c.icon),
          articles: c.articleCount || 0 // Assuming articleCount is coming from DB or derived
        })))
        setLoading(false)
      } catch (error) {
        console.error('Error fetching support data:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-6 text-center text-theme-text-tertiary">Yükleniyor...</div>

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-theme-text-primary">Yardım Merkezi</h1>
        <p className="text-theme-text-muted mt-2">Size nasıl yardımcı olabiliriz?</p>
        
        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" size={20} />
          <input
            type="text"
            placeholder="Soru veya konu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-theme-bg-secondary border border-theme-border-primary rounded-xl
              text-theme-text-primary placeholder-theme-text-placeholder text-lg
              focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
      </div>

      {/* Help Categories */}
      {helpCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {helpCategories.map(category => {
            const Icon = category.icon
            return (
              <button 
                key={category.id}
                className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6 text-left card-hover group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icon size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-1">{category.name}</h3>
                <p className="text-sm text-theme-text-muted">{category.articles} makale</p>
              </button>
            )
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6">
        <h2 className="text-xl font-semibold text-theme-text-primary mb-6">Sık Sorulan Sorular</h2>
        <div className="space-y-3">
          {faqItems.length === 0 ? (
            <p className="text-theme-text-muted">Henüz SSS eklenmemiş.</p>
          ) : (
            faqItems.map((item, index) => (
              <div 
                key={item.id || index}
                className="border border-theme-border-primary rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-theme-bg-tertiary/30 transition-colors"
                >
                  <span className="font-medium text-theme-text-primary">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronDown size={20} className="text-accent" />
                  ) : (
                    <ChevronRight size={20} className="text-theme-text-muted" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-theme-text-tertiary animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6 text-center card-hover">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-theme-text-primary mb-2">Canlı Destek</h3>
          <p className="text-sm text-theme-text-muted mb-4">Anında yardım alın</p>
          <button className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors">
            Sohbet Başlat
          </button>
        </div>
        
        <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6 text-center card-hover">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Phone size={28} className="text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-theme-text-primary mb-2">Telefon Desteği</h3>
          <p className="text-sm text-theme-text-muted mb-4">Hafta içi 09:00 - 18:00</p>
          <button className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors">
            0850 xxx xx xx
          </button>
        </div>
        
        <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6 text-center card-hover">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-theme-text-primary mb-2">E-posta</h3>
          <p className="text-sm text-theme-text-muted mb-4">24 saat içinde yanıt</p>
          <button className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors">
            destek@marmara.com
          </button>
        </div>
      </div>

      {/* Video Tutorials - Still hardcoded? Or dynamic? 
      For now leaving hardcoded as they were likely just links. 
      But user said delete ALL static data. 
      I should at least wrap checking if we have dynamic videos.
      But 'video' model doesn't exist. I'll comment out hardcoded items or make empty array. */}
      {/* 
      <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6">
        ...
      </div>
      */}
    </div>
  )
}
