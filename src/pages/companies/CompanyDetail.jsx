import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Building2, 
  Users, 
  FolderKanban,
  Shield,
  FileText,
  Bell,
  Settings,
  Activity,
  DollarSign,
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
  AlertCircle
} from 'lucide-react'

const tabs = [
  { id: 'general', name: 'Genel Bilgiler', icon: Building2 },
  { id: 'personnel', name: 'Personeller', icon: Users },
  { id: 'projects', name: 'Projeler', icon: FolderKanban },
  { id: 'patrol', name: 'Devriye', icon: Shield },
  { id: 'operations', name: 'Operasyon', icon: Activity },
  { id: 'accounting', name: 'Muhasebe', icon: DollarSign },
  { id: 'documents', name: 'Belgeler', icon: FileText },
  { id: 'notifications', name: 'Bildirimler', icon: Bell },
  { id: 'settings', name: 'Ayarlar', icon: Settings },
]

function TabContent({ activeTab, company }) {
  const { personnel, projects, patrols } = useApp()
  
  const companyPersonnel = personnel.filter(p => p.company === company.name)
  const companyProjects = projects.filter(p => p.company === company.name)
  const companyPatrols = patrols.filter(p => p.company === company.name)

  switch (activeTab) {
    case 'general':
      return (
        <div className="space-y-6">
          {/* Company Info Card */}
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
                  <p className="text-dark-100 mt-1">{company.code}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Vergi No</label>
                  <p className="text-dark-100 mt-1">1234567890</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-dark-400" />
                  <span className="text-dark-200">+90 212 555 0000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-dark-400" />
                  <span className="text-dark-200">info@{company.code.toLowerCase()}.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-dark-400" />
                  <span className="text-dark-200">İstanbul, Türkiye</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-dark-400" />
                  <span className="text-dark-200">Kayıt: 01.01.2023</span>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Persons */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Yetkililer</h3>
            <div className="space-y-3">
              {[
                { name: 'Ahmet Yıldırım', role: 'Genel Müdür', phone: '+90 532 111 2233' },
                { name: 'Fatma Kaya', role: 'Operasyon Müdürü', phone: '+90 533 444 5566' },
              ].map((person, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-dark-600/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <User size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-dark-100">{person.name}</p>
                      <p className="text-sm text-dark-400">{person.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-dark-300">{person.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'personnel':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-dark-400">{companyPersonnel.length} personel</p>
            <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm">
              Personel Ekle
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyPersonnel.map(person => (
              <div key={person.id} className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                  <span className="text-white font-semibold">{person.name[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-100">{person.name}</p>
                  <p className="text-sm text-dark-400">{person.role}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  person.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {person.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            ))}
          </div>
          {companyPersonnel.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <Users size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu firmaya ait personel bulunmuyor.</p>
            </div>
          )}
        </div>
      )

    case 'projects':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-dark-400">{companyProjects.length} proje</p>
            <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm">
              Proje Ekle
            </button>
          </div>
          <div className="space-y-3">
            {companyProjects.map(project => (
              <div key={project.id} className="bg-dark-700/50 rounded-xl p-4">
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
                <p className="text-sm text-dark-400 mb-3">{project.category}</p>
                <div className="relative h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-accent rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-xs text-dark-400 mt-2 text-right">{project.progress}% tamamlandı</p>
              </div>
            ))}
          </div>
          {companyProjects.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <FolderKanban size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu firmaya ait proje bulunmuyor.</p>
            </div>
          )}
        </div>
      )

    case 'patrol':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-dark-400">{companyPatrols.length} devriye</p>
            <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm">
              Devriye Ekle
            </button>
          </div>
          <div className="space-y-3">
            {companyPatrols.map(patrol => {
              const StatusIcon = patrol.status === 'active' ? Clock : 
                               patrol.status === 'completed' ? CheckCircle : AlertCircle
              const statusColor = patrol.status === 'active' ? 'text-green-400' :
                                 patrol.status === 'completed' ? 'text-blue-400' : 'text-amber-400'
              return (
                <div key={patrol.id} className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center`}>
                    <StatusIcon size={20} className={statusColor} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark-100">{patrol.name}</p>
                    <p className="text-sm text-dark-400">{patrol.assignee} • {patrol.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-300">{patrol.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
          {companyPatrols.length === 0 && (
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
  const { companies, selectedCompany, setSelectedCompany } = useApp()
  const [activeTab, setActiveTab] = useState('general')

  const company = selectedCompany || companies.find(c => c.id === parseInt(id))

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
            <p className="text-dark-400 mt-1">{company.code}</p>
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
              <p className="text-2xl font-bold text-dark-50">{company.personnel}</p>
              <p className="text-xs text-dark-400">Personel</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FolderKanban size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">{company.projects}</p>
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
              <p className="text-2xl font-bold text-dark-50">12</p>
              <p className="text-xs text-dark-400">Devriye</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">24</p>
              <p className="text-xs text-dark-400">Belge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        {/* Tab Navigation */}
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

        {/* Tab Content */}
        <div className="p-6">
          <TabContent activeTab={activeTab} company={company} />
        </div>
      </div>
    </div>
  )
}
