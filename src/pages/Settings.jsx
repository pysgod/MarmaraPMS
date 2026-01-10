import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
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

function SettingsSection({ activeSection, t, i18n, user }) {
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18nextLng', lng)
  }

  // Helpers to get name parts safe
  const getNameParts = (name) => {
    if (!name) return { first: '', last: '' }
    const parts = name.split(' ')
    return {
      first: parts[0] || '',
      last: parts.slice(1).join(' ') || ''
    }
  }

  const { first, last } = getNameParts(user?.name)

  switch (activeSection) {
    case 'profile':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-100 mb-4">{t('settings.profile.info')}</h3>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm mb-2">
                  {t('settings.profile.changePhoto')}
                </button>
                <p className="text-xs text-dark-400">{t('settings.profile.photoHint')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">{t('settings.profile.firstName')}</label>
                <input 
                  type="text" 
                  defaultValue={first}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">{t('settings.profile.lastName')}</label>
                <input 
                  type="text" 
                  defaultValue={last}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">{t('settings.profile.email')}</label>
                <input 
                  type="email" 
                  defaultValue={user?.email || ''}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">{t('settings.profile.phone')}</label>
                <input 
                  type="tel" 
                  defaultValue={user?.phone || ''}
                  placeholder="+90 5xx xxx xx xx"
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
            <h3 className="text-lg font-semibold text-dark-100 mb-4">{t('settings.security.changePassword')}</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-dark-400 mb-2">{t('settings.security.currentPassword')}</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">{t('settings.security.newPassword')}</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">{t('settings.security.confirmPassword')}</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-dark-700 pt-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">{t('settings.security.twoFactor')}</h3>
            <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Smartphone size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-dark-100">{t('settings.security.authenticatorApp')}</p>
                  <p className="text-sm text-dark-400">{t('settings.security.authenticatorHint')}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm">
                {t('settings.security.enable')}
              </button>
            </div>
          </div>
        </div>
      )
    case 'notifications':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">{t('settings.notifications.preferences')}</h3>
          {[
            { title: t('settings.notifications.email'), desc: t('settings.notifications.emailDesc'), enabled: true },
            { title: t('settings.notifications.push'), desc: t('settings.notifications.pushDesc'), enabled: true },
            { title: t('settings.notifications.patrolReminders'), desc: t('settings.notifications.patrolRemindersDesc'), enabled: true },
            { title: t('settings.notifications.projectUpdates'), desc: t('settings.notifications.projectUpdatesDesc'), enabled: false },
            { title: t('settings.notifications.weeklySummary'), desc: t('settings.notifications.weeklySummaryDesc'), enabled: true },
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
          <h3 className="text-lg font-semibold text-dark-100 mb-4">{t('settings.appearance.theme')}</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'dark', label: t('settings.appearance.dark') },
              { key: 'light', label: t('settings.appearance.light') },
              { key: 'system', label: t('settings.appearance.system') }
            ].map((theme, i) => (
              <button 
                key={theme.key}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  i === 0 ? 'border-accent bg-accent/10' : 'border-dark-700 bg-dark-700/50 hover:border-dark-600'
                }`}
              >
                <div className={`w-full h-20 rounded-lg mb-3 ${
                  i === 0 ? 'bg-dark-900' : i === 1 ? 'bg-white' : 'bg-gradient-to-r from-dark-900 to-white'
                }`} />
                <p className="text-sm font-medium text-dark-100">{theme.label}</p>
              </button>
            ))}
          </div>
        </div>
      )
    case 'language':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">{t('settings.language.title')}</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-dark-400 mb-2">{t('settings.language.language')}</label>
              <select 
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-2">{t('settings.language.timezone')}</label>
              <select className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>Europe/Istanbul (GMT+3)</option>
                <option>Europe/London (GMT+0)</option>
                <option>America/New_York (GMT-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-2">{t('settings.language.dateFormat')}</label>
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
  const { t, i18n } = useTranslation()
  const { user } = useApp()
  const [activeSection, setActiveSection] = useState('profile')

  const settingsSections = [
    { id: 'profile', name: t('settings.profile.title'), icon: User },
    { id: 'security', name: t('settings.security.title'), icon: Shield },
    { id: 'notifications', name: t('settings.notifications.title'), icon: Bell },
    { id: 'appearance', name: t('settings.appearance.title'), icon: Palette },
    { id: 'language', name: t('settings.language.title'), icon: Globe },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">{t('settings.title')}</h1>
          <p className="text-dark-400 mt-1">{t('settings.subtitle')}</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <Save size={18} />
          {t('settings.saveChanges')}
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
            <SettingsSection activeSection={activeSection} t={t} i18n={i18n} user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
