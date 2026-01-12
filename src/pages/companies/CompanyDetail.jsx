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

  Plus,
  X,
  Check,
  Trash2,
  Power,
  Unlink,
  AlertTriangle
} from 'lucide-react'
import { createPortal } from 'react-dom'
import CompanyShifts from './CompanyShifts'

const tabs = [
  { id: 'general', name: 'Genel Bilgiler', icon: Building2 },
  { id: 'employees', name: 'Çalışanlar', icon: Users },
  { id: 'projects', name: 'Projeler', icon: FolderKanban },
  { id: 'patrols', name: 'Devriyeler', icon: Shield },
  { id: 'shifts', name: 'Vardiyalar', icon: Clock },
]

function TabContent({ activeTab, company, employees, projects, patrols, onRemoveEmployee, onOpenAssignModal }) {
  const navigate = useNavigate()
  const [employeeToRemove, setEmployeeToRemove] = useState(null)
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  const confirmRemove = () => {
    if (employeeToRemove) {
      onRemoveEmployee(employeeToRemove.id)
      setShowRemoveModal(false)
      setEmployeeToRemove(null)
    }
  }

  switch (activeTab) {
    case 'general':
      return (
        <div className="space-y-6">
          {/* Firma Bilgileri */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Firma Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-dark-400">Firma Adı / Ünvanı</label>
                <p className="text-dark-100 mt-1">{company.name}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Firma Kodu</label>
                <p className="text-dark-100 mt-1">{company.company_code}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Kayıt Tarihi</label>
                <p className="text-dark-100 mt-1">
                  {company.registration_date 
                    ? new Date(company.registration_date).toLocaleDateString('tr-TR') 
                    : company.created_at 
                      ? new Date(company.created_at).toLocaleDateString('tr-TR') 
                      : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Konum Bilgileri */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Konum Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-dark-400">Ülke</label>
                <p className="text-dark-100 mt-1">{company.country || 'Türkiye'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">İl</label>
                <p className="text-dark-100 mt-1">{company.city || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">İlçe</label>
                <p className="text-dark-100 mt-1">{company.district || '-'}</p>
              </div>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">İletişim Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-dark-400">Telefon Numarası</label>
                <p className="text-dark-100 mt-1">{company.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Fax Numarası</label>
                <p className="text-dark-100 mt-1">{company.fax || '-'}</p>
              </div>
            </div>
          </div>

          {/* Vergi ve SGK Bilgileri */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Vergi ve SGK Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-dark-400">Vergi Dairesi</label>
                <p className="text-dark-100 mt-1">{company.tax_office || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Vergi No</label>
                <p className="text-dark-100 mt-1">{company.tax_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">SGK Sicil No</label>
                <p className="text-dark-100 mt-1">{company.sgk_number || '-'}</p>
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
            <div className="flex gap-2">
              <button 
                onClick={onOpenAssignModal}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-dark-200 text-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Çalışan Ekle
              </button>
              <button 
                onClick={() => navigate('/employees')}
                className="px-4 py-2 bg-accent rounded-lg text-white text-sm"
              >
                Tümünü Gör
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.slice(0, 10).map(employee => (
              <div 
                key={employee.id} 
                className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4 hover:bg-dark-700 transition-colors"
              >
                <div 
                  onClick={() => navigate(`/employees/${employee.id}`)}
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                    <span className="text-white font-semibold">{employee.name?.[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark-100">{employee.name}</p>
                    <p className="text-sm text-dark-400">{employee.title || 'Belirsiz'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setEmployeeToRemove(employee); setShowRemoveModal(true); }}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Firmadan Çıkar"
                >
                  <Unlink size={16} />
                </button>
              </div>
            ))}
          </div>
          {employees.length === 0 && (
            <div className="text-center py-12 bg-dark-700/50 rounded-xl">
              <Users size={48} className="text-dark-500 mx-auto mb-4" />
              <p className="text-dark-300">Bu firmaya ait çalışan bulunmuyor.</p>
            </div>
          )}

          {/* Remove from Company Modal */}
          {showRemoveModal && employeeToRemove && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-dark-800 rounded-2xl w-full max-w-md border border-dark-700 animate-fadeIn">
                <div className="p-6 border-b border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-100">Firmadan Çıkar</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-dark-300 mb-4">
                    <strong>{employeeToRemove.name}</strong> personelini
                    <strong className="text-blue-400"> {company.name}</strong> firmasından çıkarmak istediğinizden emin misiniz?
                  </p>
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm flex items-start gap-2">
                      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                      Bu işlem personeli tüm projelerden de otomatik olarak çıkaracaktır. Personel "Boşta" durumuna düşecektir.
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                  >
                    Firmadan Çıkar
                  </button>
                </div>
              </div>
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

    case 'shifts':
      return <CompanyShifts companyId={company.id} />

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

  const { selectedCompany, setCompanyContext, companies, employees, projects, patrols, updateCompany } = useApp()
  const [activeTab, setActiveTab] = useState('general')
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [idleEmployees, setIdleEmployees] = useState([])
  const [showMenu, setShowMenu] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Edit form state
  const [editData, setEditData] = useState({
    name: '',
    company_code: '',
    country: '',
    city: '',
    district: '',
    phone: '',
    fax: '',
    tax_office: '',
    tax_number: '', 
    sgk_number: '',
    registration_date: ''
  })
  
  // Load initial data
  useEffect(() => {
    if (company) {
      setEditData({
        name: company.name || '',
        company_code: company.company_code || '',
        country: company.country || '',
        city: company.city || '',
        district: company.district || '',
        phone: company.phone || '',
        fax: company.fax || '',
        tax_office: company.tax_office || '',
        tax_number: company.tax_number || '',
        sgk_number: company.sgk_number || '',
        registration_date: company.registration_date ? company.registration_date.split('T')[0] : ''
      })
    }
  }, [company])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await updateCompany(company.id, editData)
      setShowEditModal(false)
    } catch (error) {
      alert('Güncelleme hatası: ' + error.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Bu firmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return
    
    try {
      await api.deleteCompany(id)
      navigate('/companies')
    } catch (error) {
      alert('Silme hatası: ' + error.message)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = company.status === 'active' ? 'passive' : 'active'
    try {
      await updateCompany(company.id, { status: newStatus })
      setCompany(prev => ({ ...prev, status: newStatus }))
      setShowMenu(false)
    } catch (error) {
      alert('Durum güncelleme hatası: ' + error.message)
    }
  }

  const handleRemoveEmployee = async (employeeId) => {
    try {
      await api.unassignEmployeeFromCompany(employeeId)
      loadCompany()
    } catch (error) {
      alert('Personeli çıkarma hatası: ' + error.message)
    }
  }

  const fetchIdleEmployees = async () => {
    try {
      const data = await api.getIdleEmployees()
      setIdleEmployees(data)
    } catch (error) {
      console.error('Boşta personel getirme hatası:', error)
    }
  }

  useEffect(() => {
    if (showAssignModal) {
      fetchIdleEmployees()
    }
  }, [showAssignModal])

  const handleAssignEmployee = async (employeeId) => {
    try {
      await api.assignEmployeeToCompany(employeeId, company.id)
      setShowAssignModal(false)
      loadCompany()
    } catch (error) {
      alert('Atama hatası: ' + error.message)
    }
  }


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
                <div className="absolute right-0 mt-2 w-48 bg-dark-700 rounded-xl shadow-lg border border-dark-600 py-1 z-20 overflow-hidden">
                  <button
                    onClick={handleToggleStatus}
                    className="w-full text-left px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 flex items-center gap-2 transition-colors"
                  >
                    <Power size={16} className={company.status === 'active' ? 'text-amber-400' : 'text-green-400'} />
                    {company.status === 'active' ? 'Pasife Al' : 'Aktif Yap'}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-dark-600"
                  >
                    <Trash2 size={16} />
                    Firmayı Sil
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
            onRemoveEmployee={handleRemoveEmployee}
            onOpenAssignModal={() => setShowAssignModal(true)}
          />
        </div>
      </div>
      {/* Edit Company Modal - Portal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-dark-800 rounded-2xl w-full max-w-3xl border border-dark-700 h-[80vh] flex flex-col relative animate-fadeIn">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-dark-100">Firma Düzenle</h2>
                <p className="text-sm text-dark-400 mt-1">{company.name}</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Firma Adı / Ünvanı */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">Firma Adı / Ünvanı *</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                />
              </div>
              
              {/* Firma Kodu */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">Firma Kodu *</label>
                <input
                  type="text"
                  value={editData.company_code}
                  onChange={e => setEditData({ ...editData, company_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Ülke / İl / İlçe */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Ülke *</label>
                  <input
                    type="text"
                    value={editData.country}
                    onChange={e => setEditData({ ...editData, country: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">İl *</label>
                  <input
                    type="text"
                    value={editData.city}
                    onChange={e => setEditData({ ...editData, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">İlçe *</label>
                  <input
                    type="text"
                    value={editData.district}
                    onChange={e => setEditData({ ...editData, district: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Telefon / Fax */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Telefon Numarası *</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Fax Numarası</label>
                  <input
                    type="tel"
                    value={editData.fax}
                    onChange={e => setEditData({ ...editData, fax: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Vergi Dairesi / Vergi No */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Vergi Dairesi</label>
                  <input
                    type="text"
                    value={editData.tax_office}
                    onChange={e => setEditData({ ...editData, tax_office: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Vergi No</label>
                  <input
                    type="text"
                    value={editData.tax_number}
                    onChange={e => setEditData({ ...editData, tax_number: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* SGK / Tarih */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">SGK Sicil No</label>
                  <input
                    type="text"
                    value={editData.sgk_number}
                    onChange={e => setEditData({ ...editData, sgk_number: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Kuruluş Tarihi</label>
                  <input
                    type="date"
                    value={editData.registration_date}
                    onChange={e => setEditData({ ...editData, registration_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-dark-300 hover:text-dark-100 transition-colors"
                disabled={saving}
              >
                İptal
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                <Check size={18} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Assign Employee Modal */}
      {showAssignModal && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-dark-800 rounded-2xl w-full max-w-md border border-dark-700 animate-fadeIn flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-dark-100">Firmaya Personel Ekle</h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {idleEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dark-400">Boşta personel bulunamadı.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {idleEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                          <span className="text-white font-medium">{emp.name?.[0]}</span>
                        </div>
                        <div>
                          <p className="text-dark-100 font-medium">{emp.name}</p>
                          <p className="text-xs text-dark-400">{emp.title || 'Belirsiz'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignEmployee(emp.id)}
                        className="p-2 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-lg transition-colors"
                        title="Ata"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-dark-700 bg-dark-800/50 rounded-b-2xl">
              <p className="text-xs text-dark-400 flex items-center gap-2">
                <AlertCircle size={14} />
                 Sadece herhangi bir firmaya atanmamış personeller listelenir.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
