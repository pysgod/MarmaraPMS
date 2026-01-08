import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import api from '../../services/api'
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
  Activity,
  Shield,
  Bell,
  Settings,
  Plus,
  Trash2
} from 'lucide-react'

const tabs = [
  { id: 'general', name: 'Genel Bilgiler', icon: FolderKanban },
  { id: 'employees', name: 'Çalışanlar', icon: Users },
  { id: 'patrols', name: 'Devriyeler', icon: Shield },
]

function TabContent({ activeTab, project, projectEmployees, projectPatrols, allEmployees, onAssignEmployee, onRemoveEmployee }) {
  const navigate = useNavigate()
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [assignedRole, setAssignedRole] = useState('')

  const handleAssign = async () => {
    if (!selectedEmployee) return
    await onAssignEmployee(selectedEmployee, assignedRole)
    setShowAssignModal(false)
    setSelectedEmployee('')
    setAssignedRole('')
  }

  // Filter out already assigned employees
  const availableEmployees = allEmployees.filter(
    emp => !projectEmployees.some(pe => pe.id === emp.id)
  )

  switch (activeTab) {
    case 'general':
      return (
        <div className="space-y-6">
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Proje Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-400">Proje Adı</label>
                  <p className="text-dark-100 mt-1">{project.name}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Açıklama</label>
                  <p className="text-dark-100 mt-1">{project.description || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Bağlı Firma</label>
                  <p className="text-dark-100 mt-1">{project.company?.name || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-dark-400" />
                  <span className="text-dark-200">
                    Başlangıç: {project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-dark-400" />
                  <span className="text-dark-200">
                    Bitiş: {project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR') : '-'}
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
            <p className="text-dark-400">{projectEmployees.length} çalışan atanmış</p>
            <button 
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-accent rounded-lg text-white text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Çalışan Ata
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectEmployees.map(employee => (
              <div key={employee.id} className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                  <span className="text-white font-semibold">{employee.name?.[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-100">{employee.name}</p>
                  <p className="text-sm text-dark-400">{employee.assigned_role || employee.role || 'Belirsiz'}</p>
                </div>
                <button
                  onClick={() => onRemoveEmployee(employee.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {projectEmployees.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <Users size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu projeye ait çalışan bulunmuyor.</p>
            </div>
          )}

          {/* Assign Employee Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-dark-800 rounded-2xl w-full max-w-md border border-dark-700">
                <div className="p-6 border-b border-dark-700">
                  <h2 className="text-xl font-semibold text-dark-100">Çalışan Ata</h2>
                  <p className="text-sm text-dark-400 mt-1">{project.name}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">Çalışan *</label>
                    <select
                      value={selectedEmployee}
                      onChange={e => setSelectedEmployee(e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    >
                      <option value="">Seçiniz...</option>
                      {availableEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-dark-300 mb-2">Proje Görevi</label>
                    <input
                      type="text"
                      value={assignedRole}
                      onChange={e => setAssignedRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                      placeholder="Proje Sorumlusu"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-dark-300 hover:text-dark-100 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedEmployee}
                    className="px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors disabled:opacity-50"
                  >
                    Ata
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )

    case 'patrols':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-dark-400">{projectPatrols.length} devriye</p>
            <button className="px-4 py-2 bg-accent rounded-lg text-white text-sm">
              Devriye Ekle
            </button>
          </div>
          <div className="space-y-3">
            {projectPatrols.map(patrol => {
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
                    <p className="text-sm text-dark-400">{patrol.description || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-300">{patrol.assignments?.length || 0} atama</p>
                  </div>
                </div>
              )
            })}
          </div>
          {projectPatrols.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <Shield size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu projeye ait devriye bulunmuyor.</p>
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

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, patrols } = useApp()
  const [activeTab, setActiveTab] = useState('general')
  const [project, setProject] = useState(null)
  const [projectEmployees, setProjectEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [id])

  const loadProject = async () => {
    try {
      const data = await api.getProject(id)
      setProject(data)
      
      // Load project employees
      const empData = await api.getProjectEmployees(id)
      setProjectEmployees(empData)
    } catch (error) {
      console.error('Load project error:', error)
    }
    setLoading(false)
  }

  const handleAssignEmployee = async (employeeId, assignedRole) => {
    try {
      await api.assignEmployeeToProject(id, employeeId, assignedRole)
      const empData = await api.getProjectEmployees(id)
      setProjectEmployees(empData)
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const handleRemoveEmployee = async (employeeId) => {
    if (!confirm('Bu çalışanı projeden çıkarmak istiyor musunuz?')) return
    try {
      await api.removeEmployeeFromProject(id, employeeId)
      setProjectEmployees(prev => prev.filter(e => e.id !== employeeId))
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <FolderKanban size={64} className="text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark-200 mb-2">Proje bulunamadı</h2>
        <p className="text-dark-400 mb-6">Lütfen geçerli bir proje seçin.</p>
        <button 
          onClick={() => navigate('/projects')}
          className="px-5 py-2.5 bg-accent rounded-lg text-white"
        >
          Proje Listesine Dön
        </button>
      </div>
    )
  }

  const projectPatrols = patrols.filter(p => p.project_id === parseInt(id))

  const statusConfig = {
    active: { icon: Clock, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aktif' },
    pending: { icon: AlertCircle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Bekliyor' },
    completed: { icon: CheckCircle, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Tamamlandı' },
    cancelled: { icon: AlertCircle, color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'İptal' },
  }
  
  const status = statusConfig[project.status] || statusConfig.pending
  const StatusIcon = status.icon

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
              <span>{project.company?.name}</span>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">{projectEmployees.length}</p>
              <p className="text-xs text-dark-400">Çalışan</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Shield size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-50">{projectPatrols.length}</p>
              <p className="text-xs text-dark-400">Devriye</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Calendar size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-dark-50">
                {project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : '-'}
              </p>
              <p className="text-xs text-dark-400">Başlangıç</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-dark-50">
                {project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR') : '-'}
              </p>
              <p className="text-xs text-dark-400">Bitiş</p>
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
            project={project} 
            projectEmployees={projectEmployees}
            projectPatrols={projectPatrols}
            allEmployees={employees}
            onAssignEmployee={handleAssignEmployee}
            onRemoveEmployee={handleRemoveEmployee}
          />
        </div>
      </div>
    </div>
  )
}
