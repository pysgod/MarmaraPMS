import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  FolderKanban, 
  Building2,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  MoreVertical,
  MapPin,
  User,
  FileText,
  Activity
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, personnel } = useApp()
  const [activeTab, setActiveTab] = useState('overview')

  const project = projects.find(p => p.id === parseInt(id))

  if (!project) {
    return (
      <div className="text-center py-16">
        <FolderKanban size={64} className="text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark-200 mb-2">Proje bulunamadı</h2>
        <button 
          onClick={() => navigate('/projects')}
          className="px-5 py-2.5 bg-accent rounded-lg text-white"
        >
          Proje Listesine Dön
        </button>
      </div>
    )
  }

  const statusConfig = {
    active: { icon: Clock, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aktif' },
    pending: { icon: AlertCircle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Bekliyor' },
    completed: { icon: CheckCircle, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Tamamlandı' },
  }
  
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  const projectPersonnel = personnel.filter(p => p.company === project.company).slice(0, 4)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            <ArrowLeft size={20} className="text-dark-300" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-50">{project.name}</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                <StatusIcon size={12} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-dark-400 mt-1">
              <Building2 size={14} />
              <span>{project.company}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-dark-200 text-sm transition-colors">
            <Edit size={16} />
            Düzenle
          </button>
          <button className="p-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
            <MoreVertical size={18} className="text-dark-300" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-dark-100">Proje İlerlemesi</h2>
            <p className="text-sm text-dark-400 mt-1">{project.category}</p>
          </div>
          <span className="text-3xl font-bold text-accent">{project.progress}%</span>
        </div>
        <div className="relative h-4 bg-dark-700 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-700"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-dark-400 mt-2">
          <span>Başlangıç</span>
          <span>Tamamlanma</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">Proje Bilgileri</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-400">Kategori</label>
                  <p className="text-dark-100 mt-1">{project.category}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Bağlı Firma</label>
                  <p className="text-dark-100 mt-1">{project.company}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Başlangıç Tarihi</label>
                  <div className="flex items-center gap-2 text-dark-100 mt-1">
                    <Calendar size={14} className="text-dark-400" />
                    <span>01.01.2024</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-400">Bitiş Tarihi</label>
                  <div className="flex items-center gap-2 text-dark-100 mt-1">
                    <Calendar size={14} className="text-dark-400" />
                    <span>31.12.2024</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Lokasyon</label>
                  <div className="flex items-center gap-2 text-dark-100 mt-1">
                    <MapPin size={14} className="text-dark-400" />
                    <span>İstanbul, Türkiye</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Proje Yöneticisi</label>
                  <div className="flex items-center gap-2 text-dark-100 mt-1">
                    <User size={14} className="text-dark-400" />
                    <span>Ahmet Yılmaz</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">Son Aktiviteler</h2>
            <div className="space-y-4">
              {[
                { user: 'Ahmet Yılmaz', action: 'proje durumunu güncelledi', time: '1 saat önce', icon: Activity },
                { user: 'Mehmet Demir', action: 'yeni belge ekledi', time: '3 saat önce', icon: FileText },
                { user: 'Ayşe Kaya', action: 'personel ataması yaptı', time: '1 gün önce', icon: Users },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <item.icon size={14} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-dark-200">
                      <span className="font-medium text-dark-100">{item.user}</span>
                      {' '}{item.action}
                    </p>
                    <p className="text-xs text-dark-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-100">Ekip</h2>
              <button className="text-sm text-accent hover:text-accent-light">+ Ekle</button>
            </div>
            <div className="space-y-3">
              {projectPersonnel.map(person => (
                <div key={person.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{person.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-100">{person.name}</p>
                    <p className="text-xs text-dark-400">{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">İstatistikler</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm">Atanan Personel</span>
                <span className="text-dark-100 font-medium">{projectPersonnel.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm">Toplam Görev</span>
                <span className="text-dark-100 font-medium">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm">Tamamlanan Görev</span>
                <span className="text-green-400 font-medium">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm">Belgeler</span>
                <span className="text-dark-100 font-medium">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
