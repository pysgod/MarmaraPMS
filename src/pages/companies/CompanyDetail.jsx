import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import api from '../../services/api'
import { 
  Building2, 
  Users, 
  FolderKanban,
  Shield,
  FileText,
  Bell,
  Settings,
  Activity,
  ArrowLeft,
  Edit,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

const tabs = [
  { id: 'general', name: 'Genel Bilgiler', icon: Building2 },
  { id: 'employees', name: 'Çalışanlar', icon: Users },
  { id: 'projects', name: 'Projeler', icon: FolderKanban },
  { id: 'patrols', name: 'Devriyeler', icon: Shield },
]

function TabContent({ activeTab, company, employees, projects, patrols }) {
  const navigate = useNavigate()

  switch (activeTab) {
    case 'general':
      return (
        <div className="space-y-6">
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Firma Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-400">Firma Adı</label>
                  <p className="text-dark-100 mt-1">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Firma Kodu</label>
                  <p className="text-dark-100 mt-1">{company.company_code}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Zaman Dilimi</label>
                  <p className="text-dark-100 mt-1">{company.timezone || 'Europe/Istanbul'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-dark-400" />
                  <span className="text-dark-200">{company.city || '-'}, {company.country || 'Türkiye'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-dark-400" />
                  <span className="text-dark-200">
                    Kayıt: {company.created_at ? new Date(company.created_at).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case 'employees':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-dark-400">{employees.length} çalışan</p>
            <button 
              onClick={() => navigate('/employees')}
              className="px-4 py-2 bg-accent rounded-lg text-white text-sm"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.slice(0, 6).map(employee => (
              <div 
                key={employee.id} 
                onClick={() => navigate(`/employees/${employee.id}`)}
                className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-dark-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                  <span className="text-white font-semibold">{employee.name?.[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-100">{employee.name}</p>
                  <p className="text-sm text-dark-400">{employee.role || 'Belirsiz'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  employee.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            ))}
          </div>
          {employees.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <Users size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu firmaya ait çalışan bulunmuyor.</p>
            </div>
          )}
        </div>
      )

    case 'projects':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-dark-400">{projects.length} proje</p>
            <button 
              onClick={() => navigate('/projects')}
              className="px-4 py-2 bg-accent rounded-lg text-white text-sm"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="space-y-3">
            {projects.map(project => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-dark-700/50 rounded-xl p-4 cursor-pointer hover:bg-dark-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-dark-100">{project.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                  </span>
                </div>
                <p className="text-sm text-dark-400 mb-2">{project.description || 'Açıklama yok'}</p>
                <div className="flex items-center gap-4 text-xs text-dark-500">
                  <span>{project.employeeCount || 0} çalışan</span>
                  <span>{project.patrolCount || 0} devriye</span>
                </div>
              </div>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <FolderKanban size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu firmaya ait proje bulunmuyor.</p>
            </div>
          )}
        </div>
      )

    case 'patrols':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-dark-400">{patrols.length} devriye</p>
            <button 
              onClick={() => navigate('/patrol')}
              className="px-4 py-2 bg-accent rounded-lg text-white text-sm"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="space-y-3">
            {patrols.map(patrol => {
              const StatusIcon = patrol.status === 'active' ? Clock : 
                               patrol.status === 'completed' ? CheckCircle : AlertCircle
              const statusColor = patrol.status === 'active' ? 'text-green-400' :
                                 patrol.status === 'completed' ? 'text-blue-400' : 'text-amber-400'
              return (
                <div 
                  key={patrol.id} 
                  onClick={() => navigate(`/patrol/${patrol.id}`)}
                  className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-dark-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center">
                    <StatusIcon size={20} className={statusColor} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark-100">{patrol.name}</p>
                    <p className="text-sm text-dark-400">{patrol.project?.name || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-300">{patrol.assignments?.length || 0} atama</p>
                  </div>
                </div>
              )
            })}
          </div>
          {patrols.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <Shield size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu firmaya ait devriye bulunmuyor.</p>
            </div>
          )}
        </div>
      )

    default:
      return (
        <div className="text-center py-16 bg-dark-700/50 rounded-xl">
          <p className="text-dark-400">Bu bölüm yapım aşamasındadır.</p>
        </div>
      )
  }
}

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedCompany, setCompanyContext, companies, employees, projects, patrols } = useApp()
  const [activeTab, setActiveTab] = useState('general')
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    try {
      const data = await api.getCompany(id)
      setCompany(data)
      // Set company context if not already set
      if (!selectedCompany || selectedCompany.id !== parseInt(id)) {
        setCompanyContext(data)
      }
    } catch (error) {
      console.error('Load company error:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <Building2 size={64} className="text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark-200 mb-2">Firma bulunamadı</h2>
        <p className="text-dark-400 mb-6">Lütfen geçerli bir firma seçin.</p>
        <button 
          onClick={() => navigate('/companies')}
          className="px-5 py-2.5 bg-accent rounded-lg text-white"
        >
          Firma Listesine Dön
        </button>
      </div>
    )
  }

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    passive: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    archived: 'bg-dark-500/20 text-dark-400 border-dark-500/30',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/companies')}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            <ArrowLeft size={20} className="text-dark-300" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-50">{company.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[company.status]}`}>
                {company.status === 'active' ? 'Aktif' : company.status === 'passive' ? 'Pasif' : 'Arşiv'}
              </span>
            </div>
            <p className="text-dark-400 mt-1">{company.company_code}</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">{employees.length}</p>
              <p className="text-xs text-dark-400">Çalışan</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FolderKanban size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">{projects.length}</p>
              <p className="text-xs text-dark-400">Proje</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Shield size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">{patrols.length}</p>
              <p className="text-xs text-dark-400">Devriye</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <MapPin size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-dark-50 truncate">{company.city || '-'}</p>
              <p className="text-xs text-dark-400">Şehir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-dark-700">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id 
                    ? 'text-accent border-accent bg-dark-700/50' 
                    : 'text-dark-400 border-transparent hover:text-dark-200 hover:bg-dark-700/30'
                }`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          <TabContent 
            activeTab={activeTab} 
            company={company}
            employees={employees}
            projects={projects}
            patrols={patrols}
          />
        </div>
      </div>
    </div>
  )
}
