import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import api from '../../services/api'
import AddEmployeeWizard from './AddEmployeeWizard'
import EmployeeScheduleTable from '../../components/EmployeeScheduleTable'
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
  Trash2,
  Award,
  Shirt,
  CreditCard,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  UserX,
  Plus,
  Link,
  Unlink,
  AlertTriangle,
  History
} from 'lucide-react'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, selectedCompany, updateEmployee, deleteEmployee } = useApp()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [showMenu, setShowMenu] = useState(false)
  const [showEditWizard, setShowEditWizard] = useState(false)
  
  // Yeni state'ler - firma atama için
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showUnassignModal, setShowUnassignModal] = useState(false)
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [companyProjects, setCompanyProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)

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

  const loadCompanies = async () => {
    try {
      const data = await api.getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Load companies error:', error)
    }
  }

  const loadCompanyProjects = async (companyId) => {
    if (!companyId) {
      setCompanyProjects([])
      return
    }
    try {
      const data = await api.getProjects(companyId)
      setCompanyProjects(data)
    } catch (error) {
      console.error('Load company projects error:', error)
    }
  }

  const handleCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId)
    setSelectedProjectId('')
    if (companyId) {
      loadCompanyProjects(companyId)
    } else {
      setCompanyProjects([])
    }
  }

  // Firmaya ata (ve opsiyonel olarak projeye)
  const handleAssignToCompany = async () => {
    if (!selectedCompanyId) return
    setAssignLoading(true)
    try {
      // Önce firmaya ata
      await api.assignEmployeeToCompany(employee.id, selectedCompanyId)
      
      // Proje seçilmişse projeye de ata
      if (selectedProjectId) {
        await api.assignEmployeeToProject(selectedProjectId, employee.id)
      }
      
      await loadEmployee()
      setShowAssignModal(false)
      setSelectedCompanyId('')
      setSelectedProjectId('')
      setCompanyProjects([])
    } catch (error) {
      alert('Atama hatası: ' + error.message)
    }
    setAssignLoading(false)
  }

  // Firmadan çıkar
  const handleUnassignFromCompany = async () => {
    setAssignLoading(true)
    try {
      await api.unassignEmployeeFromCompany(employee.id)
      await loadEmployee()
      setShowUnassignModal(false)
    } catch (error) {
      alert('Çıkarma hatası: ' + error.message)
    }
    setAssignLoading(false)
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await api.updateEmployee(employee.id, { ...employee, status: newStatus })
      setEmployee(updated)
      setShowMenu(false)
    } catch (error) {
      alert('Durum güncellenemedi: ' + error.message)
    }
  }

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

  const handleEditComplete = () => {
    loadEmployee() // Reload data
    setShowEditWizard(false)
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
        <User size={64} className="text-theme-text-placeholder mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-theme-text-secondary mb-2">Çalışan bulunamadı</h2>
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
    { id: 'contact', name: 'İletişim', icon: Phone },
    { id: 'certificate', name: 'Sertifika', icon: Award },
    { id: 'clothing', name: 'Kıyafet', icon: Shirt },
    { id: 'account', name: 'Hesap & Kart', icon: CreditCard },
    { id: 'projects', name: 'Projeler', icon: FolderKanban },
    { id: 'shifts', name: 'Vardiyalar', icon: Clock },
    { id: 'patrols', name: 'Devriyeler', icon: Shield },
  ]

  const getStatusBadge = (status) => {
     switch(status) {
       case 'active': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Aktif</span>
       case 'passive': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">Pasif</span>
       case 'archived': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">Arşiv</span>
       default: return null
     }
  }

  // Atama durumu badge
  const getAssignmentBadge = (assignmentStatus) => {
    switch(assignmentStatus) {
      case 'idle':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 flex items-center gap-1">
            <UserX size={12} /> Boşta
          </span>
        )
      case 'assigned_to_company':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 flex items-center gap-1">
            <Building2 size={12} /> Firmada
          </span>
        )
      case 'assigned_to_project':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
            <Briefcase size={12} /> Projede
          </span>
        )
      default:
        return null
    }
  }

  const clothingSizes = typeof employee.clothing_sizes === 'string' 
      ? JSON.parse(employee.clothing_sizes) 
      : (employee.clothing_sizes || {})

  const DetailRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-theme-border-primary last:border-0">
      <span className="text-theme-text-muted text-sm mb-1 sm:mb-0">{label}</span>
      <span className="text-theme-text-primary font-medium text-right">{value || '-'}</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn pb-10" onClick={() => showMenu && setShowMenu(false)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <button 
            onClick={() => navigate('/employees')}
            className="p-2 rounded-lg bg-theme-bg-tertiary hover:bg-theme-bg-elevated transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-theme-text-tertiary" />
          </button>
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {employee.first_name ? employee.first_name[0] : (employee.name ? employee.name[0] : '?')}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-theme-text-primary truncate">{employee.first_name ? `${employee.first_name} ${employee.last_name}` : employee.name}</h1>
                {getStatusBadge(employee.status)}
                {getAssignmentBadge(employee.assignment_status)}
              </div>
              <div className="flex items-center gap-2 text-theme-text-muted mt-1">
                <Briefcase size={14} />
                <span className="truncate">{employee.title || employee.role || 'Unvan Yok'}</span>
                <span className="mx-2 text-dark-600">•</span>
                <span className="bg-theme-bg-tertiary px-2 py-0.5 rounded text-xs whitespace-nowrap">
                   {employee.type === 'white_collar' ? 'Beyaz Yaka' : (employee.type === 'blue_collar' ? 'Mavi Yaka' : 'Belirsiz')}
                </span>
                {employee.company && (
                  <>
                    <span className="mx-2 text-dark-600">•</span>
                    <span className="flex items-center gap-1 text-blue-400 text-sm">
                      <Building2 size={12} />
                      {employee.company.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3 relative flex-shrink-0">
          <button 
            onClick={() => setShowEditWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-theme-bg-tertiary hover:bg-theme-bg-elevated rounded-lg text-white text-sm transition-colors"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Düzenle</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2.5 bg-theme-bg-tertiary hover:bg-theme-bg-elevated rounded-lg transition-colors"
          >
            <MoreVertical size={18} className="text-theme-text-tertiary" />
          </button>

          {showMenu && (
             <div className="absolute top-12 right-0 w-48 bg-theme-bg-secondary border border-theme-border-primary rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <button 
                  onClick={() => handleStatusChange('active')}
                  className="w-full text-left px-4 py-3 hover:bg-theme-bg-tertiary text-sm text-green-400 flex items-center gap-2"
                >
                   <CheckCircle size={16} /> Aktif Yap
                </button>
                <button 
                  onClick={() => handleStatusChange('passive')}
                  className="w-full text-left px-4 py-3 hover:bg-theme-bg-tertiary text-sm text-amber-400 flex items-center gap-2"
                >
                   <XCircle size={16} /> Pasif Yap
                </button>
                <button 
                   onClick={() => handleStatusChange('archived')}
                   className="w-full text-left px-4 py-3 hover:bg-theme-bg-tertiary text-sm text-gray-400 flex items-center gap-2 border-b border-theme-border-primary"
                >
                   <Archive size={16} /> Arşivle
                </button>
                <button 
                   onClick={handleDelete}
                   className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 flex items-center gap-2"
                >
                   <Trash2 size={16} /> Sil
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                 <FolderKanban size={18} className="text-blue-400" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-theme-text-primary">{employee.projectAssignments?.length || 0}</p>
                 <p className="text-xs text-theme-text-muted">Proje</p>
               </div>
             </div>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                 <Shield size={18} className="text-green-400" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-theme-text-primary">{employee.patrolAssignments?.length || 0}</p>
                 <p className="text-xs text-theme-text-muted">Devriye</p>
               </div>
             </div>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                 <Calendar size={18} className="text-purple-400" />
               </div>
               <div>
                 <p className="text-sm font-bold text-theme-text-primary truncate">{employee.start_date ? new Date(employee.start_date).toLocaleDateString('tr-TR') : '-'}</p>
                 <p className="text-xs text-theme-text-muted">Giriş Tarihi</p>
               </div>
             </div>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                 <Clock size={18} className="text-amber-400" />
               </div>
               <div>
                 <p className="text-sm font-bold text-theme-text-primary truncate">{employee.tc_no || '-'}</p>
                 <p className="text-xs text-theme-text-muted">TC Kimlik</p>
               </div>
             </div>
        </div>
      </div>

      {/* Assignment Info Card */}
      <div className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              employee.assignment_status === 'idle' 
                ? 'bg-gray-500/20' 
                : employee.assignment_status === 'assigned_to_company'
                  ? 'bg-blue-500/20'
                  : 'bg-green-500/20'
            }`}>
              {employee.assignment_status === 'idle' 
                ? <UserX size={24} className="text-gray-400" />
                : <Building2 size={24} className={employee.assignment_status === 'assigned_to_company' ? 'text-blue-400' : 'text-green-400'} />
              }
            </div>
            <div>
              <h3 className="font-semibold text-theme-text-primary">
                {employee.assignment_status === 'idle' 
                  ? 'Boşta Personel'
                  : employee.assignment_status === 'assigned_to_company'
                    ? 'Firmaya Atanmış'
                    : 'Projede Görevli'
                }
              </h3>
              <p className="text-sm text-theme-text-muted">
                {employee.company 
                  ? `${employee.company.name} firmasında çalışıyor`
                  : 'Henüz bir firmaya atanmamış'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {employee.assignment_status === 'idle' ? (
              <button 
                onClick={() => { loadCompanies(); setShowAssignModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-white text-sm transition-colors"
              >
                <Link size={16} />
                Firmaya Ata
              </button>
            ) : (
              <button 
                onClick={() => setShowUnassignModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-theme-bg-tertiary hover:bg-red-500/20 rounded-lg text-theme-text-tertiary hover:text-red-400 text-sm transition-colors"
              >
                <Unlink size={16} />
                Firmadan Çıkar
              </button>
            )}
          </div>
        </div>
        
        {/* Boşta personel için bilgilendirme */}
        {employee.assignment_status === 'idle' && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              Bu personel henüz bir firmaya atanmamış. Projelere atama yapabilmek için önce bir firmaya atamanız gerekmektedir.
            </p>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary overflow-hidden">
        <div className="flex overflow-x-auto border-b border-theme-border-primary no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id 
                    ? 'text-accent border-accent bg-theme-bg-hover' 
                    : 'text-theme-text-muted border-transparent hover:text-theme-text-secondary hover:bg-theme-bg-tertiary/30'
                }`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            )
          })}
        </div>
        
        <div className="p-6">
            {/* 1. GENEL BİLGİLER */}
            {activeTab === 'general' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-accent border-b border-theme-border-primary pb-2">Kişisel Bilgiler</h3>
                     <DetailRow label="TC Kimlik No" value={employee.tc_no} />
                     <DetailRow label="Adı" value={employee.first_name} />
                     <DetailRow label="Soyadı" value={employee.last_name} />
                     <DetailRow label="Baba Adı" value={employee.father_name} />
                     <DetailRow label="Anne Adı" value={employee.mother_name} />
                     <DetailRow label="Doğum Yeri" value={employee.birth_place} />
                     <DetailRow label="Doğum Tarihi" value={employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : '-'} />
                     <DetailRow label="Medeni Durumu" value={employee.marital_status} />
                     <DetailRow label="Cinsiyet" value={employee.gender === 'male' ? 'Erkek' : 'Kadın'} />
                     <DetailRow label="Kan Grubu" value={employee.blood_type} />
                  </div>
                   <div className="space-y-4">
                     <h3 className="text-lg font-medium text-accent border-b border-theme-border-primary pb-2">İş ve Fiziksel</h3>
                     <DetailRow label="Unvan" value={employee.title} />
                     <DetailRow label="Çalışma Türü" value={employee.type === 'white_collar' ? 'Beyaz Yaka' : 'Mavi Yaka'} />
                     <DetailRow label="Eğitim Durumu" value={employee.education_level} />
                     <DetailRow label="Askerlik Durumu" value={employee.military_status} />
                     <DetailRow label="İşe Giriş Tarihi" value={employee.start_date ? new Date(employee.start_date).toLocaleDateString() : '-'} />
                     <DetailRow label="Boy" value={employee.height ? `${employee.height} cm` : '-'} />
                     <DetailRow label="Kilo" value={employee.weight ? `${employee.weight} kg` : '-'} />
                     <DetailRow label="Çocuk Sayısı" value={employee.children_count} />
                   </div>
               </div>
            )}

            {/* 2. İLETİŞİM */}
            {activeTab === 'contact' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-accent border-b border-theme-border-primary pb-2">İletişim</h3>
                     <DetailRow label="Cep Telefonu" value={employee.phone} />
                     <DetailRow label="Ev Telefonu" value={employee.home_phone} />
                     <DetailRow label="E-Posta" value={employee.email} />
                     <div className="flex flex-col py-3 border-b border-theme-border-primary">
                        <span className="text-theme-text-muted text-sm mb-1">Adres</span>
                        <span className="text-theme-text-primary font-medium">{employee.address || '-'}</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-accent border-b border-theme-border-primary pb-2">Acil Durum</h3>
                     <DetailRow label="İlgili Kişi" value={employee.emergency_contact_name} />
                     <DetailRow label="Acil Durum Tel" value={employee.emergency_contact_phone} />
                  </div>
               </div>
            )}

             {/* 3. SERTİFİKA */}
            {activeTab === 'certificate' && (
               <div className="max-w-2xl">
                 {employee.has_certificate ? (
                    <div className="bg-theme-bg-tertiary/30 border border-theme-border-secondary rounded-xl p-6">
                       <div className="flex items-center gap-3 mb-6">
                          <Award className="text-accent" size={32} />
                          <div>
                             <h3 className="text-lg font-semibold text-theme-text-primary">Özel Güvenlik Sertifikası</h3>
                             <p className="text-theme-text-muted text-sm">5188 Sayılı Kanun Kapsamında</p>
                          </div>
                       </div>
                       <div className="space-y-2">
                        <DetailRow label="Sertifika No" value={employee.certificate_no} />
                        <DetailRow label="Şehir" value={employee.certificate_city} />
                        <DetailRow label="Silah Durumu" value={employee.weapon_status} />
                        <DetailRow label="Düzenlenme Tarihi" value={employee.certificate_date ? new Date(employee.certificate_date).toLocaleDateString() : '-'} />
                        <DetailRow label="Geçerlilik Tarihi" value={employee.certificate_expiry ? new Date(employee.certificate_expiry).toLocaleDateString() : '-'} />
                       </div>
                    </div>
                 ) : (
                    <div className="text-center py-12 bg-theme-bg-tertiary/30 rounded-xl border border-theme-border-primary">
                      <p className="text-theme-text-muted">Bu personel için sertifika bilgisi girilmemiştir.</p>
                    </div>
                 )}
               </div>
            )}

             {/* 4. KIYAFET */}
            {activeTab === 'clothing' && (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {Object.keys(clothingSizes).length > 0 ? (
                      Object.entries(clothingSizes).map(([key, value]) => (
                         <div key={key} className="bg-theme-bg-hover p-4 rounded-xl flex items-center justify-between border border-theme-border-secondary">
                           <span className="text-theme-text-tertiary capitalize">{key.replace('_', ' ')}</span>
                           <span className="text-accent font-bold text-lg">{value}</span>
                         </div>
                      ))
                   ) : (
                     <div className="col-span-3 text-center py-8 text-theme-text-muted">
                        Kıyafet beden bilgisi bulunamadı.
                     </div>
                   )}
               </div>
            )}

             {/* 5. HESAP & KART */}
             {activeTab === 'account' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-accent border-b border-theme-border-primary pb-2">Banka Bilgileri</h3>
                     <DetailRow label="Banka" value={employee.bank_name} />
                     <DetailRow label="Şube" value={employee.bank_branch_name} />
                     <DetailRow label="Şube Kodu" value={employee.bank_branch_code} />
                     <DetailRow label="Hesap No" value={employee.bank_account_no} />
                     <DetailRow label="IBAN" value={employee.iban} />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-accent border-b border-theme-border-primary pb-2">Yemek Kartı</h3>
                     <DetailRow label="Kart Türü" value={employee.card_type} />
                     <DetailRow label="Kart No" value={employee.card_no} />
                  </div>
               </div>
            )}

            {/* 6. PROJELER */}
            {activeTab === 'projects' && (
             <div className="space-y-4">
              {employee.projectAssignments?.length > 0 ? (
                <div className="space-y-3">
                  {employee.projectAssignments.map(pa => (
                    <div key={pa.id} className="bg-theme-bg-hover rounded-xl p-4 flex items-center gap-4 border border-theme-border-secondary">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <FolderKanban size={18} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-theme-text-primary">{pa.project?.name}</p>
                        <p className="text-sm text-theme-text-muted">Rol: {pa.assigned_role || 'Belirsiz'} | Tarih: {new Date(pa.assigned_at).toLocaleDateString()}</p>
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
                <div className="text-center py-12 bg-theme-bg-hover rounded-xl border border-theme-border-primary">
                  <FolderKanban size={48} className="text-theme-text-placeholder mx-auto mb-4" />
                  <p className="text-theme-text-tertiary">Henüz projeye atanmamış.</p>
                </div>
              )}
            </div>
            )}

            {/* 7. DEVRİYELER */}
             {activeTab === 'patrols' && (
                <div className="text-center py-16 bg-theme-bg-hover rounded-xl border border-theme-border-primary">
                   <Shield size={48} className="text-theme-text-placeholder mx-auto mb-4" />
                   <div className="text-left max-w-md mx-auto">
                      <p className="text-theme-text-tertiary text-center mb-4">Aktif devriye görevleri</p>
                      {employee.patrolAssignments?.length > 0 ? (
                          employee.patrolAssignments.map(patrol => (
                            <div key={patrol.id} className="bg-theme-bg-secondary p-3 rounded mb-2 border border-theme-border-secondary text-sm">
                               {patrol.patrol?.name || 'Devriye'}
                            </div>
                          ))
                      ) : <p className="text-center text-theme-text-placeholder text-sm">Aktif devriye bulunamadı</p>}
                   </div>
                </div>
             )}

            {/* 8. VARDİYALAR */}
            {activeTab === 'shifts' && (
               <div className="space-y-4">
                 <EmployeeScheduleTable employee={employee} />
               </div>
            )}
        </div>
      </div>

       {/* Edit Wizard */}
       <AddEmployeeWizard 
         isOpen={showEditWizard}
         onClose={() => setShowEditWizard(false)}
         company={employee.company}
         employee={employee}
         onComplete={handleEditComplete}
       />

       {/* Assign to Company Modal */}
       {showAssignModal && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-theme-bg-secondary rounded-2xl w-full max-w-md border border-theme-border-primary animate-fadeIn">
             <div className="p-6 border-b border-theme-border-primary">
               <h3 className="text-lg font-semibold text-theme-text-primary">Firmaya Ata</h3>
               <p className="text-sm text-theme-text-muted mt-1">{employee.first_name} {employee.last_name} personelini firmaya atayın</p>
             </div>
             <div className="p-6 space-y-4">
               {/* Firma Seçimi */}
               <div>
                 <label className="block text-sm text-theme-text-tertiary mb-2">Firma Seçin *</label>
                 <select
                   value={selectedCompanyId}
                   onChange={e => handleCompanyChange(e.target.value)}
                   className="w-full px-4 py-3 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                 >
                   <option value="">Firma seçiniz...</option>
                   {companies.map(c => (
                     <option key={c.id} value={c.id}>{c.name} ({c.company_code})</option>
                   ))}
                 </select>
               </div>
               
               {/* Proje Seçimi - Opsiyonel */}
               {selectedCompanyId && (
                 <div className="animate-fadeIn">
                   <label className="block text-sm text-theme-text-tertiary mb-2">Proje Seçin (Opsiyonel)</label>
                   <select
                     value={selectedProjectId}
                     onChange={e => setSelectedProjectId(e.target.value)}
                     className="w-full px-4 py-3 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                   >
                     <option value="">Proje seçmeden devam et...</option>
                     {companyProjects.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                   </select>
                   {companyProjects.length === 0 && (
                     <p className="text-xs text-theme-text-placeholder mt-1">Bu firmaya ait proje bulunmuyor.</p>
                   )}
                 </div>
               )}
             </div>
             <div className="p-6 border-t border-theme-border-primary flex justify-end gap-3">
               <button 
                 onClick={() => { setShowAssignModal(false); setSelectedCompanyId(''); setSelectedProjectId(''); setCompanyProjects([]); }}
                 className="px-4 py-2 text-theme-text-tertiary hover:text-theme-text-primary transition-colors"
               >
                 İptal
               </button>
               <button 
                 onClick={handleAssignToCompany}
                 disabled={!selectedCompanyId || assignLoading}
                 className="px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors disabled:opacity-50"
               >
                 {assignLoading ? 'Atanıyor...' : (selectedProjectId ? 'Firmaya ve Projeye Ata' : 'Firmaya Ata')}
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Unassign from Company Modal */}
       {showUnassignModal && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-theme-bg-secondary rounded-2xl w-full max-w-md border border-theme-border-primary animate-fadeIn">
             <div className="p-6 border-b border-theme-border-primary">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                   <AlertTriangle size={20} className="text-red-400" />
                 </div>
                 <h3 className="text-lg font-semibold text-theme-text-primary">Firmadan Çıkar</h3>
               </div>
             </div>
             <div className="p-6">
               <p className="text-theme-text-tertiary mb-4">
                 <strong>{employee.first_name} {employee.last_name}</strong> personelini
                 <strong className="text-blue-400"> {employee.company?.name}</strong> firmasından çıkarmak istediğinizden emin misiniz?
               </p>
               <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                 <p className="text-red-400 text-sm flex items-start gap-2">
                   <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                   Bu işlem personeli tüm projelerden de otomatik olarak çıkaracaktır. Personel "Boşta" durumuna düşecektir.
                 </p>
               </div>
             </div>
             <div className="p-6 border-t border-theme-border-primary flex justify-end gap-3">
               <button 
                 onClick={() => setShowUnassignModal(false)}
                 className="px-4 py-2 text-theme-text-tertiary hover:text-theme-text-primary transition-colors"
               >
                 Vazgeç
               </button>
               <button 
                 onClick={handleUnassignFromCompany}
                 disabled={assignLoading}
                 className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors disabled:opacity-50"
               >
                 {assignLoading ? 'Çıkarılıyor...' : 'Firmadan Çıkar'}
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  )
}
