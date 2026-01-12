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
  Trash2,
  UserCheck,
  Play,
  Pause,
  StopCircle,
  AlertTriangle
} from 'lucide-react'
import AddProjectWizard from './AddProjectWizard'
import ProjectShifts from './ProjectShifts'

const tabs = [
  { id: 'general', name: 'Genel Bilgiler', icon: FolderKanban },
  { id: 'employees', name: 'Çalışanlar', icon: Users },
  { id: 'patrols', name: 'Devriyeler', icon: Shield },
  { id: 'shifts', name: 'Vardiyalar', icon: Clock },
]

function TabContent({ activeTab, project, projectEmployees, projectPatrols, allEmployees, onAssignEmployee, onRemoveEmployee }) {
  const navigate = useNavigate()
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [employeeToRemove, setEmployeeToRemove] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [assignedRole, setAssignedRole] = useState('')

  const handleAssign = async () => {
    if (!selectedEmployee) return
    await onAssignEmployee(selectedEmployee, assignedRole)
    setShowAssignModal(false)
    setSelectedEmployee('')
    setAssignedRole('')
  }

  const confirmRemove = () => {
    if (employeeToRemove) {
      onRemoveEmployee(employeeToRemove.id)
      setShowRemoveModal(false)
      setEmployeeToRemove(null)
    }
  }

  // Filter out already assigned employees
  const availableEmployees = allEmployees.filter(
    emp => !projectEmployees.some(pe => pe.id === emp.id)
  )

  switch (activeTab) {
    case 'general':
      const serviceTypeLabels = {
        'security_armed': 'Güvenlik (Silahlı)',
        'security_unarmed': 'Güvenlik (Silahsız)',
        'cleaning': 'Temizlik',
        'consulting': 'Danışmanlık',
        'reception': 'Resepsiyon',
        'technical': 'Teknik',
        'landscaping': 'Peyzaj',
        'other': 'Diğer'
      }

      const clothingLabels = {
        'shirt': 'Gömlek',
        'sweater': 'Kazak',
        'pants': 'Pantolon',
        'coat': 'Kaban',
        'shoes': 'Ayakkabı',
        'suit': 'Takım Elbise',
        'beret': 'Bere',
        'cap': 'Şapka',
        'uniform': 'Üniforma'
      }

      return (
        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Proje Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-dark-400">Proje Adı</label>
                <p className="text-dark-100 mt-1">{project.name}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Bağlı Firma</label>
                <p className="text-dark-100 mt-1">{project.company?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Durum</label>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-sm ${
                  project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-dark-500/20 text-dark-400'
                }`}>
                  {project.status === 'active' ? 'Aktif' :
                   project.status === 'pending' ? 'Bekliyor' :
                   project.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                </span>
              </div>
              <div>
                <label className="text-sm text-dark-400">Hizmet Türü</label>
                <p className="text-dark-100 mt-1">
                  {serviceTypeLabels[project.service_type] || project.service_type || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Segment</label>
                <p className="text-dark-100 mt-1">{project.segment || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Açıklama</label>
                <p className="text-dark-100 mt-1">{project.description || '-'}</p>
              </div>
            </div>
          </div>

          {/* Tarih ve Yönetim */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Tarih ve Yönetim</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-400">Birincil Yönetici</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} className="text-accent" />
                    <span className="text-dark-100">{project.primaryManager?.name || '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-400">İkincil Yönetici</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} className="text-dark-400" />
                    <span className="text-dark-100">{project.secondaryManager?.name || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Müşteri Yetkilisi ve Kıyafetler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Müşteri Yetkilisi */}
            <div className="bg-dark-700/50 rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-dark-100 mb-4">Müşteri Yetkilisi</h3>
              {project.customerReps && project.customerReps.length > 0 ? (
                project.customerReps.map(rep => (
                  <div key={rep.id} className="space-y-3">
                     <div className="flex items-center gap-3">
                      <UserCheck size={18} className="text-accent" />
                      <div>
                        <p className="font-medium text-dark-100">{rep.first_name} {rep.last_name}</p>
                        <p className="text-xs text-dark-400">{rep.title}</p>
                      </div>
                    </div>
                    {rep.phone && (
                      <div className="flex items-center gap-3 text-sm text-dark-300">
                        <span>Tel:</span>
                        <span className="text-dark-200">{rep.phone}</span>
                      </div>
                    )}
                    {rep.email && (
                      <div className="flex items-center gap-3 text-sm text-dark-300">
                        <span>E-posta:</span>
                        <span className="text-dark-200">{rep.email}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-dark-400 text-sm">Yetkili bilgisi bulunmuyor.</p>
              )}
            </div>

            {/* Kıyafet Türleri */}
            <div className="bg-dark-700/50 rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-dark-100 mb-4">Kıyafet Türleri</h3>
              {project.clothingTypes && project.clothingTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.clothingTypes.map(type => (
                    <span 
                      key={type.id} 
                      className="px-3 py-1 bg-dark-600 rounded-lg text-sm text-dark-200 border border-dark-500"
                    >
                      {clothingLabels[type.clothing_type] || type.clothing_type}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-dark-400 text-sm">Tanımlı kıyafet bulunmuyor.</p>
              )}
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
                  <p className="text-sm text-dark-400">{employee.assigned_role || employee.title || 'Belirsiz'}</p>
                </div>
                <button
                  onClick={() => { setEmployeeToRemove(employee); setShowRemoveModal(true); }}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Projeden Çıkar"
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
                        <option key={emp.id} value={emp.id}>{emp.name} - {emp.title || 'Belirsiz'}</option>
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

          {/* Remove Employee Confirmation Modal */}
          {showRemoveModal && employeeToRemove && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-dark-800 rounded-2xl w-full max-w-md border border-dark-700 animate-fadeIn">
                <div className="p-6 border-b border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-100">Projeden Çıkar</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-dark-300 mb-4">
                    <strong>{employeeToRemove.name}</strong> personelini
                    <strong className="text-accent"> {project.name}</strong> projesinden çıkarmak istediğinizden emin misiniz?
                  </p>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      ℹ️ Personel firmaya atanmaya devam edecektir, sadece bu projeden çıkarılacaktır.
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
                  <button 
                    onClick={() => { setShowRemoveModal(false); setEmployeeToRemove(null); }}
                    className="px-4 py-2 text-dark-300 hover:text-dark-100 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button 
                    onClick={confirmRemove}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white transition-colors"
                  >
                    Projeden Çıkar
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

    case 'shifts':
      return <ProjectShifts projectId={project.id} />

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
  const [companyEmployees, setCompanyEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

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

      // Load company employees for assignment
      if (data.company_id) {
        const compEmps = await api.getEmployees(data.company_id)
        setCompanyEmployees(compEmps)
      }
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
    try {
      await api.removeEmployeeFromProject(id, employeeId)
      setProjectEmployees(prev => prev.filter(e => e.id !== employeeId))
    } catch (error) {
      alert('Hata: ' + error.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return
    try {
      await api.deleteProject(id)
      navigate('/projects')
    } catch (error) {
      alert('Silme hatası: ' + error.message)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.updateProject(id, { status: newStatus })
      setProject(prev => ({ ...prev, status: newStatus }))
      setShowMenu(false)
    } catch (error) {
      alert('Durum güncelleme hatası: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20 text-dark-400">
        Proje bulunamadı.
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
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-dark-200 text-sm transition-colors"
          >
            <Edit size={16} />
            Düzenle
          </button>

          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2.5 rounded-lg transition-colors ${showMenu ? 'bg-dark-600' : 'bg-dark-700 hover:bg-dark-600'}`}
            >
              <MoreVertical size={18} className="text-dark-300" />
            </button>

            {/* Menu Dropdown */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-dark-700 rounded-xl shadow-lg border border-dark-600 py-1 z-20 overflow-hidden">
                  <div className="px-4 py-2 text-xs font-medium text-dark-400 uppercase tracking-wider bg-dark-700/50 border-b border-dark-600">
                    Durum Güncelle
                  </div>
                  
                  <button
                    onClick={() => handleStatusUpdate('active')}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-600 flex items-center gap-2"
                  >
                    <Play size={16} className="text-green-400" />
                    Aktif
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('pending')}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-600 flex items-center gap-2"
                  >
                    <Pause size={16} className="text-amber-400" />
                    Bekliyor
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-600 flex items-center gap-2"
                  >
                    <CheckCircle size={16} className="text-blue-400" />
                    Tamamlandı
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-600 flex items-center gap-2 border-b border-dark-600"
                  >
                    <StopCircle size={16} className="text-red-400" />
                    İptal
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors mt-1"
                  >
                    <Trash2 size={16} />
                    Projeyi Sil
                  </button>
                </div>
              </>
            )}
          </div>
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
            allEmployees={companyEmployees}
            onAssignEmployee={handleAssignEmployee}
            onRemoveEmployee={handleRemoveEmployee}
          />
        </div>
      </div>

      {/* Edit Wizard */}
      {project && (
        <AddProjectWizard
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            loadProject() // Reload after edit
          }}
          company={project.company}
          project={project}
        />
      )}
    </div>
  )
}

