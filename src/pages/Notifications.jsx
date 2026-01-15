import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { 
  Bell, 
  Check, 
  CheckCheck,
  Filter,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Settings
} from 'lucide-react'

export default function Notifications() {
  const { notifications } = useApp()
  const [filter, setFilter] = useState('all')

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type) => {
    switch (type) {
      case 'success': return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' }
      case 'warning': return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' }
      case 'error': return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' }
      default: return { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Bildirimler</h1>
          <p className="text-theme-text-muted mt-1">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-theme-bg-tertiary hover:bg-theme-bg-elevated rounded-lg text-theme-text-secondary text-sm transition-colors">
            <CheckCheck size={18} />
            Tümünü Okundu İşaretle
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-theme-bg-tertiary hover:bg-theme-bg-elevated rounded-lg text-theme-text-secondary text-sm transition-colors">
            <Settings size={18} />
            Ayarlar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
          <p className="text-2xl font-bold text-theme-text-primary">{notifications.length}</p>
          <p className="text-xs text-theme-text-muted">Toplam Bildirim</p>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
          <p className="text-2xl font-bold text-accent">{unreadCount}</p>
          <p className="text-xs text-theme-text-muted">Okunmamış</p>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
          <p className="text-2xl font-bold text-green-400">{notifications.filter(n => n.type === 'success').length}</p>
          <p className="text-xs text-theme-text-muted">Başarılı</p>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
          <p className="text-2xl font-bold text-amber-400">{notifications.filter(n => n.type === 'warning').length}</p>
          <p className="text-xs text-theme-text-muted">Uyarı</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-theme-bg-secondary rounded-xl p-2 border border-theme-border-primary w-fit">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'unread', label: 'Okunmamış' },
          { id: 'read', label: 'Okunmuş' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id 
                ? 'bg-accent text-white' 
                : 'text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-dark-700">
            {filteredNotifications.map(notification => {
              const iconConfig = getIcon(notification.type)
              const Icon = iconConfig.icon
              return (
                <div 
                  key={notification.id}
                  className={`p-5 hover:bg-theme-bg-tertiary/30 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-accent/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={iconConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-theme-text-primary">{notification.title}</h3>
                          <p className="text-sm text-theme-text-muted mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-theme-text-placeholder mt-3">{notification.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-theme-bg-elevated rounded-lg transition-colors">
                        <Check size={16} className="text-theme-text-muted" />
                      </button>
                      <button className="p-2 hover:bg-theme-bg-elevated rounded-lg transition-colors">
                        <Trash2 size={16} className="text-theme-text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell size={48} className="text-theme-text-placeholder mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-text-secondary mb-2">Bildirim bulunamadı</h3>
            <p className="text-theme-text-muted">Seçili filtreye uygun bildirim yok.</p>
          </div>
        )}
      </div>
    </div>
  )
}
