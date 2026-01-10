import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import api from '../../services/api'
import AddEmployeeWizard from './AddEmployeeWizard'
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
  Clock
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

  const clothingSizes = typeof employee.clothing_sizes === 'string' 
      ? JSON.parse(employee.clothing_sizes) 
      : (employee.clothing_sizes || {})

  const DetailRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-dark-700 last:border-0">
      <span className="text-dark-400 text-sm mb-1 sm:mb-0">{label}</span>
      <span className="text-dark-100 font-medium text-right">{value || '-'}</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn pb-10" onClick={() => showMenu && setShowMenu(false)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <button 
            onClick={() => navigate('/employees')}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-dark-300" />
          </button>
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {employee.first_name ? employee.first_name[0] : (employee.name ? employee.name[0] : '?')}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-50 truncate">{employee.first_name ? `${employee.first_name} ${employee.last_name}` : employee.name}</h1>
                {getStatusBadge(employee.status)}
              </div>
              <div className="flex items-center gap-2 text-dark-400 mt-1">
                <Briefcase size={14} />
                <span className="truncate">{employee.title || employee.role || 'Unvan Yok'}</span>
                <span className="mx-2 text-dark-600">•</span>
                <span className="bg-dark-700 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                   {employee.type === 'white_collar' ? 'Beyaz Yaka' : (employee.type === 'blue_collar' ? 'Mavi Yaka' : 'Belirsiz')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3 relative flex-shrink-0">
          <button 
            onClick={() => setShowEditWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-white text-sm transition-colors"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Düzenle</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <MoreVertical size={18} className="text-dark-300" />
          </button>

          {showMenu && (
             <div className="absolute top-12 right-0 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <button 
                  onClick={() => handleStatusChange('active')}
                  className="w-full text-left px-4 py-3 hover:bg-dark-700 text-sm text-green-400 flex items-center gap-2"
                >
                   <CheckCircle size={16} /> Aktif Yap
                </button>
                <button 
                  onClick={() => handleStatusChange('passive')}
                  className="w-full text-left px-4 py-3 hover:bg-dark-700 text-sm text-amber-400 flex items-center gap-2"
                >
                   <XCircle size={16} /> Pasif Yap
                </button>
                <button 
                   onClick={() => handleStatusChange('archived')}
                   className="w-full text-left px-4 py-3 hover:bg-dark-700 text-sm text-gray-400 flex items-center gap-2 border-b border-dark-700"
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
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                 <FolderKanban size={18} className="text-blue-400" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-dark-50">{employee.projectAssignments?.length || 0}</p>
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
                 <p className="text-2xl font-bold text-dark-50">{employee.patrolAssignments?.length || 0}</p>
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
                 <p className="text-sm font-bold text-dark-50 truncate">{employee.start_date ? new Date(employee.start_date).toLocaleDateString('tr-TR') : '-'}</p>
                 <p className="text-xs text-dark-400">Giriş Tarihi</p>
               </div>
             </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                 <Clock size={18} className="text-amber-400" />
               </div>
               <div>
                 <p className="text-sm font-bold text-dark-50 truncate">{employee.tc_no || '-'}</p>
                 <p className="text-xs text-dark-400">TC Kimlik</p>
               </div>
             </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-dark-700 no-scrollbar">
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
            {/* 1. GENEL BİLGİLER */}
            {activeTab === 'general' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-accent border-b border-dark-700 pb-2">Kişisel Bilgiler</h3>
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
                     <h3 className="text-lg font-medium text-accent border-b border-dark-700 pb-2">İş ve Fiziksel</h3>
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
                    <h3 className="text-lg font-medium text-accent border-b border-dark-700 pb-2">İletişim</h3>
                     <DetailRow label="Cep Telefonu" value={employee.phone} />
                     <DetailRow label="Ev Telefonu" value={employee.home_phone} />
                     <DetailRow label="E-Posta" value={employee.email} />
                     <div className="flex flex-col py-3 border-b border-dark-700">
                        <span className="text-dark-400 text-sm mb-1">Adres</span>
                        <span className="text-dark-100 font-medium">{employee.address || '-'}</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-accent border-b border-dark-700 pb-2">Acil Durum</h3>
                     <DetailRow label="İlgili Kişi" value={employee.emergency_contact_name} />
                     <DetailRow label="Acil Durum Tel" value={employee.emergency_contact_phone} />
                  </div>
               </div>
            )}

             {/* 3. SERTİFİKA */}
            {activeTab === 'certificate' && (
               <div className="max-w-2xl">
                 {employee.has_certificate ? (
                    <div className="bg-dark-700/30 border border-dark-600 rounded-xl p-6">
                       <div className="flex items-center gap-3 mb-6">
                          <Award className="text-accent" size={32} />
                          <div>
                             <h3 className="text-lg font-semibold text-dark-100">Özel Güvenlik Sertifikası</h3>
                             <p className="text-dark-400 text-sm">5188 Sayılı Kanun Kapsamında</p>
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
                    <div className="text-center py-12 bg-dark-700/30 rounded-xl border border-dark-700">
                      <p className="text-dark-400">Bu personel için sertifika bilgisi girilmemiştir.</p>
                    </div>
                 )}
               </div>
            )}

             {/* 4. KIYAFET */}
            {activeTab === 'clothing' && (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {Object.keys(clothingSizes).length > 0 ? (
                      Object.entries(clothingSizes).map(([key, value]) => (
                         <div key={key} className="bg-dark-700/50 p-4 rounded-xl flex items-center justify-between border border-dark-600">
                           <span className="text-dark-300 capitalize">{key.replace('_', ' ')}</span>
                           <span className="text-accent font-bold text-lg">{value}</span>
                         </div>
                      ))
                   ) : (
                     <div className="col-span-3 text-center py-8 text-dark-400">
                        Kıyafet beden bilgisi bulunamadı.
                     </div>
                   )}
               </div>
            )}

             {/* 5. HESAP & KART */}
             {activeTab === 'account' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-accent border-b border-dark-700 pb-2">Banka Bilgileri</h3>
                     <DetailRow label="Banka" value={employee.bank_name} />
                     <DetailRow label="Şube" value={employee.bank_branch_name} />
                     <DetailRow label="Şube Kodu" value={employee.bank_branch_code} />
                     <DetailRow label="Hesap No" value={employee.bank_account_no} />
                     <DetailRow label="IBAN" value={employee.iban} />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-lg font-medium text-accent border-b border-dark-700 pb-2">Yemek Kartı</h3>
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
                    <div key={pa.id} className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-4 border border-dark-600">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <FolderKanban size={18} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark-100">{pa.project?.name}</p>
                        <p className="text-sm text-dark-400">Rol: {pa.assigned_role || 'Belirsiz'} | Tarih: {new Date(pa.assigned_at).toLocaleDateString()}</p>
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
                <div className="text-center py-12 bg-dark-700/50 rounded-xl border border-dark-700">
                  <FolderKanban size={48} className="text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-300">Henüz projeye atanmamış.</p>
                </div>
              )}
            </div>
            )}

            {/* 7. DEVRİYELER */}
             {activeTab === 'patrols' && (
                <div className="text-center py-16 bg-dark-700/50 rounded-xl border border-dark-700">
                   <Shield size={48} className="text-dark-500 mx-auto mb-4" />
                   <div className="text-left max-w-md mx-auto">
                      <p className="text-dark-300 text-center mb-4">Aktif devriye görevleri</p>
                      {employee.patrolAssignments?.length > 0 ? (
                          employee.patrolAssignments.map(patrol => (
                            <div key={patrol.id} className="bg-dark-800 p-3 rounded mb-2 border border-dark-600 text-sm">
                               {patrol.patrol?.name || 'Devriye'}
                            </div>
                          ))
                      ) : <p className="text-center text-dark-500 text-sm">Aktif devriye bulunamadı</p>}
                   </div>
                </div>
             )}

            {/* 8. VARDİYALAR */}
            {activeTab === 'shifts' && (
               <div className="space-y-4">
                 {employee.shiftAssignments?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {employee.shiftAssignments.map(sa => (
                          <div key={sa.id} className="bg-dark-700/50 rounded-xl p-4 border border-dark-600 flex items-start gap-4">
                             <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                <Clock size={18} className="text-indigo-400" />
                             </div>
                             <div>
                                <h4 className="font-semibold text-dark-100">{sa.shiftDefinition?.name || 'Vardiya'}</h4>
                                <p className="text-sm text-dark-300 mt-1">
                                   {sa.shiftDefinition?.start_time?.slice(0,5)} - {sa.shiftDefinition?.end_time?.slice(0,5)}
                                </p>
                                <p className="text-xs text-dark-400 mt-2 flex items-center gap-1">
                                   <FolderKanban size={12} />
                                   {sa.project?.name || 'Proje'}
                                </p>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-12 bg-dark-700/50 rounded-xl border border-dark-700">
                      <Clock size={48} className="text-dark-500 mx-auto mb-4" />
                      <p className="text-dark-300">Herhangi bir vardiyaya atanmamış.</p>
                      <p className="text-sm text-dark-500 mt-2">Personeli bir projeye atayıp vardiya tanımlayabilirsiniz.</p>
                    </div>
                 )}
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
    </div>
  )
}
