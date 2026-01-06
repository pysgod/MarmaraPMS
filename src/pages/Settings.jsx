import { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Lock,
  Key,
  Smartphone,
  Mail,
  Save,
  ChevronRight
} from 'lucide-react'

const settingsSections = [
  { id: 'profile', name: 'Profil Ayarları', icon: User },
  { id: 'security', name: 'Güvenlik', icon: Shield },
  { id: 'notifications', name: 'Bildirim Ayarları', icon: Bell },
  { id: 'appearance', name: 'Görünüm', icon: Palette },
  { id: 'language', name: 'Dil ve Bölge', icon: Globe },
]

function SettingsSection({ activeSection }) {
  switch (activeSection) {
    case 'profile':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Profil Bilgileri</h3>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <div>
                <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm mb-2">
                  Fotoğraf Değiştir
                </button>
                <p className="text-xs text-dark-400">JPG, GIF veya PNG. Maks 1MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Ad</label>
                <input 
                  type="text" 
                  defaultValue="Admin"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Soyad</label>
                <input 
                  type="text" 
                  defaultValue="User"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">E-posta</label>
                <input 
                  type="email" 
                  defaultValue="admin@marmara.com"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Telefon</label>
                <input 
                  type="tel" 
                  defaultValue="+90 532 xxx xx xx"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>
          </div>
        </div>
      )
    case 'security':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Şifre Değiştir</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Mevcut Şifre</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Yeni Şifre</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Yeni Şifre (Tekrar)</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-dark-700 pt-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">İki Faktörlü Kimlik Doğrulama</h3>
            <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Smartphone size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-dark-100">Authenticator Uygulaması</p>
                  <p className="text-sm text-dark-400">Google Authenticator veya benzeri</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm">
                Etkinleştir
              </button>
            </div>
          </div>
        </div>
      )
    case 'notifications':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Bildirim Tercihleri</h3>
          {[
            { title: 'E-posta Bildirimleri', desc: 'Önemli güncellemeler için e-posta al', enabled: true },
            { title: 'Push Bildirimleri', desc: 'Tarayıcı bildirimleri', enabled: true },
            { title: 'Devriye Hatırlatmaları', desc: 'Yaklaşan devriyeler için hatırlatma', enabled: true },
            { title: 'Proje Güncellemeleri', desc: 'Proje durum değişikliklerinde bildirim', enabled: false },
            { title: 'Haftalık Özet', desc: 'Her pazartesi haftalık rapor', enabled: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
              <div>
                <p className="font-medium text-dark-100">{item.title}</p>
                <p className="text-sm text-dark-400">{item.desc}</p>
              </div>
              <button 
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  item.enabled ? 'bg-accent' : 'bg-dark-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  item.enabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      )
    case 'appearance':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Tema</h3>
          <div className="grid grid-cols-3 gap-4">
            {['Koyu', 'Açık', 'Sistem'].map((theme, i) => (
              <button 
                key={theme}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  i === 0 ? 'border-accent bg-accent/10' : 'border-dark-700 bg-dark-700/50 hover:border-dark-600'
                }`}
              >
                <div className={`w-full h-20 rounded-lg mb-3 ${
                  i === 0 ? 'bg-dark-900' : i === 1 ? 'bg-white' : 'bg-gradient-to-r from-dark-900 to-white'
                }`} />
                <p className="text-sm font-medium text-dark-100">{theme}</p>
              </button>
            ))}
          </div>
        </div>
      )
    case 'language':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Dil ve Bölge</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-dark-400 mb-2">Dil</label>
              <select className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>Türkçe</option>
                <option>English</option>
                <option>Deutsch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-2">Saat Dilimi</label>
              <select className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>Europe/Istanbul (GMT+3)</option>
                <option>Europe/London (GMT+0)</option>
                <option>America/New_York (GMT-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-2">Tarih Formatı</label>
              <select className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>DD.MM.YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      )
    default:
      return null
  }
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Ayarlar</h1>
          <p className="text-dark-400 mt-1">Hesap ve sistem ayarlarını yönetin</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <Save size={18} />
          Değişiklikleri Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
            {settingsSections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors border-b border-dark-700 last:border-0 ${
                    activeSection === section.id 
                      ? 'bg-accent/10 text-accent' 
                      : 'text-dark-300 hover:bg-dark-700/50 hover:text-dark-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  <ChevronRight size={16} className={activeSection === section.id ? 'text-accent' : 'text-dark-500'} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <SettingsSection activeSection={activeSection} />
          </div>
        </div>
      </div>
    </div>
  )
}
