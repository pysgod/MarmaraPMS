import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import api from '../../services/api'
import { 
  User, 
  ArrowLeft, 
  Edit, 
  MoreVertical,
  Phone,
  Building2,
  FolderKanban,
  Shield,
  Calendar,
  Briefcase,
  Trash2
} from 'lucide-react'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, selectedCompany, updateEmployee, deleteEmployee } = useApp()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    loadEmployee()
  }, [id])

  const loadEmployee = async () => {
    try {
      const data = await api.getEmployee(id)
      setEmployee(data)
    } catch (error) {
      console.error('Load employee error:', error)
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

  if (!employee) {
    return (
      <div className="text-center py-16">
        <User size={64} className="text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark-200 mb-2">Çalışan bulunamadı</h2>
        <button 
          onClick={() => navigate('/employees')}
          className="px-5 py-2.5 bg-accent rounded-lg text-white mt-4"
        >
          Çalışan Listesine Dön
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'general', name: 'Genel Bilgiler', icon: User },
    { id: 'projects', name: 'Projeler', icon: FolderKanban },
    { id: 'patrols', name: 'Devriyeler', icon: Shield },
  ]

  const handleDelete = async () => {
    if (confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteEmployee(employee.id)
        navigate('/employees')
      } catch (error) {
        alert('Silme hatası: ' + error.message)
      }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/employees')}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            <ArrowLeft size={20} className="text-dark-300" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {employee.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-50">{employee.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  employee.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-dark-400 mt-1">
                <Briefcase size={14} />
                <span>{employee.role || 'Belirsiz'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
          >
            <Trash2 size={16} />
            Sil
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
              <FolderKanban size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">
                {employee.projectAssignments?.length || 0}
              </p>
              <p className="text-xs text-dark-400">Proje</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Shield size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">
                {employee.patrolAssignments?.length || 0}
              </p>
              <p className="text-xs text-dark-400">Devriye</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Building2 size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-dark-50 truncate">
                {employee.company?.name || '-'}
              </p>
              <p className="text-xs text-dark-400">Firma</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Phone size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-dark-50 truncate">
                {employee.phone || '-'}
              </p>
              <p className="text-xs text-dark-400">Telefon</p>
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-dark-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark-100 mb-4">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-dark-400">Ad Soyad</label>
                      <p className="text-dark-100 mt-1">{employee.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-dark-400">Görev</label>
                      <p className="text-dark-100 mt-1">{employee.role || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-dark-400" />
                      <span className="text-dark-200">{employee.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 size={16} className="text-dark-400" />
                      <span className="text-dark-200">{employee.company?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-dark-400" />
                      <span className="text-dark-200">
                        Kayıt: {new Date(employee.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <p className="text-dark-400">
                {employee.projectAssignments?.length || 0} projeye atanmış
              </p>
              {employee.projectAssignments?.length > 0 ? (
                <div className="space-y-3">
                  {employee.projectAssignments.map(pa => (
                    <div key={pa.id} className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <FolderKanban size={18} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark-100">{pa.project?.name}</p>
                        <p className="text-sm text-dark-400">{pa.assigned_role || 'Atanmış'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pa.project?.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {pa.project?.status === 'active' ? 'Aktif' : 'Bekliyor'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-dark-700/50 rounded-xl">
                  <FolderKanban size={48} className="text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-300">Henüz projeye atanmamış.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'patrols' && (
            <div className="text-center py-16 bg-dark-700/50 rounded-xl">
              <Shield size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">Devriye bilgileri yükleniyor...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
