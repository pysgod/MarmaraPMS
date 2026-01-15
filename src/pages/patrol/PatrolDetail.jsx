import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Shield,
  Building2,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  MoreVertical,
  Calendar,
  Navigation,
  Activity,
  Target
} from 'lucide-react'

export default function PatrolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patrols } = useApp()

  const patrol = patrols.find(p => p.id === parseInt(id))

  if (!patrol) {
    return (
      <div className="text-center py-16">
        <Shield size={64} className="text-theme-text-placeholder mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-theme-text-secondary mb-2">Devriye bulunamadı</h2>
        <button 
          onClick={() => navigate('/patrol')}
          className="px-5 py-2.5 bg-accent rounded-lg text-white"
        >
          Devriye Listesine Dön
        </button>
      </div>
    )
  }

  const statusConfig = {
    active: { icon: Clock, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aktif' },
    pending: { icon: AlertCircle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Bekliyor' },
    completed: { icon: CheckCircle, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Tamamlandı' },
  }
  
  const status = statusConfig[patrol.status]
  const StatusIcon = status.icon

  const routePoints = [
    { id: 1, name: 'Giriş Kapısı', time: '22:00', status: 'completed' },
    { id: 2, name: 'A Blok Kat 1', time: '22:15', status: 'completed' },
    { id: 3, name: 'A Blok Kat 2', time: '22:30', status: 'active' },
    { id: 4, name: 'B Blok Giriş', time: '22:45', status: 'pending' },
    { id: 5, name: 'Otopark', time: '23:00', status: 'pending' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/patrol')}
            className="p-2 rounded-lg bg-theme-bg-tertiary hover:bg-theme-bg-elevated transition-colors"
          >
            <ArrowLeft size={20} className="text-theme-text-tertiary" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-theme-text-primary">{patrol.name}</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                <StatusIcon size={12} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-theme-text-muted mt-1">
              <Building2 size={14} />
              <span>{patrol.company}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-theme-bg-tertiary hover:bg-theme-bg-elevated rounded-lg text-theme-text-secondary text-sm transition-colors">
            <Edit size={16} />
            Düzenle
          </button>
          <button className="p-2.5 bg-theme-bg-tertiary hover:bg-theme-bg-elevated rounded-lg transition-colors">
            <MoreVertical size={18} className="text-theme-text-tertiary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patrol Info */}
          <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Devriye Bilgileri</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-theme-bg-hover rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <User size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-theme-text-muted">Atanan Personel</p>
                    <p className="text-theme-text-primary">{patrol.assignee}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-theme-bg-hover rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Building2 size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-theme-text-muted">Firma</p>
                    <p className="text-theme-text-primary">{patrol.company}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-theme-bg-hover rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <MapPin size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-theme-text-muted">Lokasyon</p>
                    <p className="text-theme-text-primary">{patrol.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-theme-bg-hover rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-theme-text-muted">Zaman Dilimi</p>
                    <p className="text-theme-text-primary">{patrol.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Map */}
          <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-theme-text-primary">Rota Bilgisi</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-theme-text-muted">İlerleme:</span>
                <span className="text-accent font-medium">2/5 nokta</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-theme-bg-tertiary rounded-full overflow-hidden mb-6">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-accent-dark rounded-full"
                style={{ width: '40%' }}
              />
            </div>

            {/* Route Points */}
            <div className="space-y-3">
              {routePoints.map((point, index) => (
                <div key={point.id} className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      point.status === 'completed' ? 'bg-green-500' :
                      point.status === 'active' ? 'bg-accent animate-pulse-glow' : 'bg-theme-bg-elevated'
                    }`}>
                      {point.status === 'completed' ? (
                        <CheckCircle size={16} className="text-white" />
                      ) : point.status === 'active' ? (
                        <Navigation size={16} className="text-white" />
                      ) : (
                        <Target size={16} className="text-theme-text-muted" />
                      )}
                    </div>
                    {index < routePoints.length - 1 && (
                      <div className={`absolute left-1/2 top-8 w-0.5 h-6 -translate-x-1/2 ${
                        point.status === 'completed' ? 'bg-green-500' : 'bg-theme-bg-elevated'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 p-3 bg-theme-bg-hover rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-theme-text-primary">{point.name}</p>
                      <span className={`text-xs ${
                        point.status === 'completed' ? 'text-green-400' :
                        point.status === 'active' ? 'text-accent' : 'text-theme-text-muted'
                      }`}>
                        {point.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Hızlı İşlemler</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Devriyeyi Tamamla</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">Sorun Bildir</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-theme-bg-hover hover:bg-theme-bg-tertiary text-theme-text-tertiary rounded-lg transition-colors">
                <Activity size={18} />
                <span className="text-sm font-medium">Aktivite Ekle</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">İstatistikler</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-theme-text-muted text-sm">Toplam Nokta</span>
                <span className="text-theme-text-primary font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-text-muted text-sm">Tamamlanan</span>
                <span className="text-green-400 font-medium">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-text-muted text-sm">Bekleyen</span>
                <span className="text-amber-400 font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-text-muted text-sm">Tahmini Süre</span>
                <span className="text-theme-text-primary font-medium">1 saat</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary p-6">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Zaman Çizelgesi</h2>
            <div className="space-y-4">
              {[
                { time: '22:00', event: 'Devriye başlatıldı' },
                { time: '22:05', event: 'Giriş Kapısı kontrol edildi' },
                { time: '22:20', event: 'A Blok Kat 1 kontrol edildi' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs text-theme-text-muted w-12">{item.time}</span>
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                  <span className="text-sm text-theme-text-secondary">{item.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
