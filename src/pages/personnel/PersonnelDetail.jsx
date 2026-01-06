import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  ArrowLeft,
  Edit,
  MoreVertical,
  FolderKanban,
  UserCheck,
  UserX,
  Clock,
  Award
} from 'lucide-react'

export default function PersonnelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { personnel, projects, companies } = useApp()

  const person = personnel.find(p => p.id === parseInt(id))

  if (!person) {
    return (
      <div className="text-center py-16">
        <Users size={64} className="text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark-200 mb-2">Personel bulunamadı</h2>
        <button 
          onClick={() => navigate('/personnel')}
          className="px-5 py-2.5 bg-accent rounded-lg text-white"
        >
          Personel Listesine Dön
        </button>
      </div>
    )
  }

  const company = companies.find(c => c.name === person.company)
  const personProjects = projects.filter(p => p.company === person.company).slice(0, 3)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/personnel')}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            <ArrowLeft size={20} className="text-dark-300" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">{person.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-50">{person.name}</h1>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  person.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {person.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
                  {person.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <p className="text-accent mt-1">{person.role}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">İletişim Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">E-posta</p>
                    <p className="text-dark-100">{person.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Phone size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Telefon</p>
                    <p className="text-dark-100">+90 532 xxx xx xx</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <MapPin size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Adres</p>
                    <p className="text-dark-100">İstanbul, Türkiye</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Calendar size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">İşe Başlama</p>
                    <p className="text-dark-100">01.01.2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Info */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">Çalışma Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-dark-400">Bağlı Firma</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Building2 size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-dark-100 font-medium">{person.company}</p>
                    <p className="text-xs text-dark-400">{company?.code}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Rol</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Award size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-dark-100 font-medium">{person.role}</p>
                    <p className="text-xs text-dark-400">Tam yetkili</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Projects */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-100">Atanan Projeler</h2>
              <button className="text-sm text-accent hover:text-accent-light">Tümünü Gör</button>
            </div>
            <div className="space-y-3">
              {personProjects.map(project => (
                <div key={project.id} className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FolderKanban size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark-100">{project.name}</p>
                    <p className="text-sm text-dark-400">{project.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-300">{project.progress}%</p>
                    <div className="w-20 h-1.5 bg-dark-600 rounded-full mt-1">
                      <div 
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">İstatistikler</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-dark-400" />
                  <span className="text-dark-300 text-sm">Çalışma Süresi</span>
                </div>
                <span className="text-dark-100 font-medium">2 yıl</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FolderKanban size={16} className="text-dark-400" />
                  <span className="text-dark-300 text-sm">Aktif Proje</span>
                </div>
                <span className="text-dark-100 font-medium">{personProjects.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-dark-400" />
                  <span className="text-dark-300 text-sm">Devriye</span>
                </div>
                <span className="text-dark-100 font-medium">8</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">Yetkiler</h2>
            <div className="space-y-2">
              {['Dashboard Görüntüleme', 'Proje Yönetimi', 'Devriye Oluşturma', 'Rapor Görüntüleme'].map((perm, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-dark-300">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
