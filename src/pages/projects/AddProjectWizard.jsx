import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import api from '../../services/api'
import { createPortal } from 'react-dom'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Building2,
  FolderKanban,
  Shirt,
  UserCheck,
  Users,
  CheckCircle
} from 'lucide-react'

const SERVICE_TYPES = [
  { value: 'security_armed', label: 'Güvenlik (Silahlı)' },
  { value: 'security_unarmed', label: 'Güvenlik (Silahsız)' },
  { value: 'cleaning', label: 'Temizlik' },
  { value: 'consulting', label: 'Danışmanlık' },
  { value: 'reception', label: 'Resepsiyon' },
  { value: 'technical', label: 'Teknik' },
  { value: 'landscaping', label: 'Peyzaj' },
  { value: 'other', label: 'Diğer' },
]

const CLOTHING_TYPES = [
  { value: 'shirt', label: 'Gömlek' },
  { value: 'sweater', label: 'Kazak' },
  { value: 'pants', label: 'Pantolon' },
  { value: 'coat', label: 'Kaban' },
  { value: 'shoes', label: 'Ayakkabı' },
  { value: 'suit', label: 'Takım Elbise' },
  { value: 'beret', label: 'Bere' },
  { value: 'cap', label: 'Şapka' },
  { value: 'uniform', label: 'Üniforma' },
]

const TABS = [
  { id: 1, name: 'Genel Bilgiler', icon: FolderKanban },
  { id: 2, name: 'Kıyafet Türleri', icon: Shirt },
  { id: 3, name: 'Proje Müşteri Yetkilisi', icon: UserCheck },
  { id: 4, name: 'Proje Yöneticisi', icon: Users },
  { id: 5, name: 'Onay', icon: CheckCircle },
]

export default function AddProjectWizard({ isOpen, onClose, company, project }) {
  const navigate = useNavigate()
  const { addProject, updateProject } = useApp()
  const [currentTab, setCurrentTab] = useState(1)
  const [saving, setSaving] = useState(false)
  const [adminUsers, setAdminUsers] = useState([])
  
  // Form states
  const [projectData, setProjectData] = useState({
    name: '',
    service_type: '',
    segment: '',
    start_date: '',
  })
  
  const [selectedClothing, setSelectedClothing] = useState([])
  const [availableClothing, setAvailableClothing] = useState([...CLOTHING_TYPES])
  
  const [customerRep, setCustomerRep] = useState({
    first_name: '',
    last_name: '',
    title: '',
    phone: '',
    email: '',
  })
  
  const [managers, setManagers] = useState({
    primary_manager_id: '',
    secondary_manager_id: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadAdminUsers()
      if (project) {
        // Populate form for editing
        setProjectData({
          name: project.name,
          service_type: project.service_type || '',
          segment: project.segment || '',
          start_date: project.start_date ? project.start_date.split('T')[0] : '',
        })

        if (project.clothingTypes) {
          const projectClothing = project.clothingTypes.map(pc => {
            const type = CLOTHING_TYPES.find(ct => ct.value === pc.clothing_type)
            return type || { value: pc.clothing_type, label: pc.clothing_type }
          })
          setSelectedClothing(projectClothing)
          setAvailableClothing(prev => prev.filter(ac => !projectClothing.find(pc => pc.value === ac.value)))
        }

        if (project.customerReps && project.customerReps.length > 0) {
          const rep = project.customerReps[0]
          setCustomerRep({
            first_name: rep.first_name || '',
            last_name: rep.last_name || '',
            title: rep.title || '',
            phone: rep.phone || '',
            email: rep.email || '',
          })
        }

        setManagers({
          primary_manager_id: project.primary_manager_id || '',
          secondary_manager_id: project.secondary_manager_id || '',
        })
      }
    } else {
        // Reset form on close is handled by parent or manual reset, but we should reset internal state if opening fresh
    }
  }, [isOpen, project])

  const loadAdminUsers = async () => {
    try {
      const users = await api.getAdminUsers()
      setAdminUsers(users)
    } catch (error) {
      console.error('Failed to load admin users:', error)
    }
  }

  const handleClothingSelect = (item) => {
    setAvailableClothing(prev => prev.filter(c => c.value !== item.value))
    setSelectedClothing(prev => [...prev, item])
  }

  const handleClothingRemove = (item) => {
    setSelectedClothing(prev => prev.filter(c => c.value !== item.value))
    setAvailableClothing(prev => [...prev, item])
  }

  const canProceed = () => {
    switch (currentTab) {
      case 1:
        return projectData.name && projectData.service_type && projectData.start_date
      case 2:
        return true // Clothing is optional
      case 3:
        return true // Customer rep is optional
      case 4:
        return managers.primary_manager_id // Primary manager is required
      case 5:
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentTab < 5 && canProceed()) {
      setCurrentTab(currentTab + 1)
    }
  }

  const handleBack = () => {
    if (currentTab > 1) {
      setCurrentTab(currentTab - 1)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      let resultProject

      if (project) {
        // Update existing project
        resultProject = await updateProject(project.id, {
            name: projectData.name,
            service_type: projectData.service_type,
            segment: projectData.segment,
            start_date: projectData.start_date,
            primary_manager_id: managers.primary_manager_id || null,
            secondary_manager_id: managers.secondary_manager_id || null,
        })
      } else {
         // Create new project
         resultProject = await addProject({
          company_id: company.id,
          name: projectData.name,
          service_type: projectData.service_type,
          segment: projectData.segment,
          start_date: projectData.start_date,
          status: 'pending',
          primary_manager_id: managers.primary_manager_id || null,
          secondary_manager_id: managers.secondary_manager_id || null,
        })
      }

      // Handle Clothing Types (Update for both create and edit - simpler to just overwrite)
      // Note: Backend updateProjectClothingTypes likely replaces all, so logic is same
      if (selectedClothing.length > 0 || project) { // If editing, we might be removing all clothing, so we still need call
         await api.updateProjectClothingTypes(resultProject.id, selectedClothing.map(c => c.value))
      }

      // Handle Customer Rep
      if (customerRep.first_name && customerRep.last_name) {
        await api.updateProjectCustomerRep(resultProject.id, {
          ...customerRep,
          company_id: company?.id || project?.company_id, // Ensure company_id is available
        })
      }

      onClose()
      // If creating, navigate. If editing, we are already on detail page usually, but refresh might be needed or handled by context
      if (!project) {
          navigate(`/projects/${resultProject.id}`)
      }
    } catch (error) {
      alert('Hata: ' + error.message)
    }
    setSaving(false)
  }

  const resetForm = () => {
    setCurrentTab(1)
    setProjectData({ name: '', service_type: '', segment: '', start_date: '' })
    setSelectedClothing([])
    setAvailableClothing([...CLOTHING_TYPES])
    setCustomerRep({ first_name: '', last_name: '', title: '', phone: '', email: '' })
    setManagers({ primary_manager_id: '', secondary_manager_id: '' })
  }

  if (!isOpen) return null
  
  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-dark-800 rounded-2xl w-full max-w-4xl border border-dark-700 h-[85vh] flex flex-col relative animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark-100">{project ? 'Proje Düzenle' : 'Proje Ekle'}</h2>
            <p className="text-sm text-dark-400 mt-1">{company?.name || project?.company?.name}</p>
          </div>
          <button 
            onClick={() => { resetForm(); onClose(); }}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-dark-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-dark-700 flex gap-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            const isCompleted = currentTab > tab.id
            return (
              <button
                key={tab.id}
                onClick={() => tab.id <= currentTab && setCurrentTab(tab.id)}
                disabled={tab.id > currentTab}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-accent text-white' 
                    : isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-dark-700/50 text-dark-400'
                }`}
              >
                {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Tab 1: Genel Bilgiler */}
          {currentTab === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">Bağlı Firma</label>
                <input
                  type="text"
                  value={company?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-dark-600 border border-dark-500 rounded-lg text-dark-300 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Proje Adı *</label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={e => setProjectData({ ...projectData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="Proje adı"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Hizmet Türü *</label>
                <select
                  value={projectData.service_type}
                  onChange={e => setProjectData({ ...projectData, service_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                >
                  <option value="">Seçiniz...</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Segment</label>
                  <input
                    type="text"
                    value={projectData.segment}
                    onChange={e => setProjectData({ ...projectData, segment: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="Segment"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Başlangıç Tarihi *</label>
                  <input
                    type="date"
                    value={projectData.start_date}
                    onChange={e => setProjectData({ ...projectData, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Kıyafet Türleri */}
          {currentTab === 2 && (
            <div className="flex gap-4 h-80">
              {/* Available */}
              <div className="flex-1 bg-dark-700/50 rounded-xl p-4 border border-dark-600">
                <h4 className="text-sm font-medium text-dark-300 mb-3">Mevcut Kıyafetler</h4>
                <div className="space-y-2">
                  {availableClothing.map(item => (
                    <button
                      key={item.value}
                      onClick={() => handleClothingSelect(item)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-dark-600 hover:bg-dark-500 text-dark-200 text-sm transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Selected */}
              <div className="flex-1 bg-accent/10 rounded-xl p-4 border border-accent/30">
                <h4 className="text-sm font-medium text-accent mb-3">Seçilen Kıyafetler</h4>
                <div className="space-y-2">
                  {selectedClothing.map(item => (
                    <button
                      key={item.value}
                      onClick={() => handleClothingRemove(item)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent-light text-sm transition-colors flex items-center justify-between"
                    >
                      {item.label}
                      <X size={14} />
                    </button>
                  ))}
                  {selectedClothing.length === 0 && (
                    <p className="text-dark-400 text-sm text-center py-4">
                      Sol taraftan kıyafet seçin
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Proje Müşteri Yetkilisi */}
          {currentTab === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Bağlı Firma</label>
                  <input
                    type="text"
                    value={company?.name || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-dark-600 border border-dark-500 rounded-lg text-dark-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Bağlı Proje</label>
                  <input
                    type="text"
                    value={projectData.name || '-'}
                    disabled
                    className="w-full px-4 py-2.5 bg-dark-600 border border-dark-500 rounded-lg text-dark-300 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Adı</label>
                  <input
                    type="text"
                    value={customerRep.first_name}
                    onChange={e => setCustomerRep({ ...customerRep, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="Yetkili adı"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Soyadı</label>
                  <input
                    type="text"
                    value={customerRep.last_name}
                    onChange={e => setCustomerRep({ ...customerRep, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="Yetkili soyadı"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Görevi</label>
                <input
                  type="text"
                  value={customerRep.title}
                  onChange={e => setCustomerRep({ ...customerRep, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="Örn: Proje Müdürü"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Telefon Numarası</label>
                  <input
                    type="tel"
                    value={customerRep.phone}
                    onChange={e => setCustomerRep({ ...customerRep, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="0532 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">E-Posta</label>
                  <input
                    type="email"
                    value={customerRep.email}
                    onChange={e => setCustomerRep({ ...customerRep, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="yetkili@firma.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Proje Yöneticisi */}
          {currentTab === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">Birincil Proje Yöneticisi *</label>
                <select
                  value={managers.primary_manager_id}
                  onChange={e => setManagers({ ...managers, primary_manager_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                >
                  <option value="">Seçiniz...</option>
                  {adminUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">İkincil Proje Yöneticisi</label>
                <select
                  value={managers.secondary_manager_id}
                  onChange={e => setManagers({ ...managers, secondary_manager_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                >
                  <option value="">Seçiniz (Opsiyonel)...</option>
                  {adminUsers.filter(u => u.id !== parseInt(managers.primary_manager_id)).map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              {adminUsers.length === 0 && (
                <p className="text-amber-400 text-sm">
                  ⚠️ Sistemde admin yetkili kullanıcı bulunamadı.
                </p>
              )}
            </div>
          )}

          {/* Tab 5: Onay */}
          {currentTab === 5 && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-100">Proje Bilgilerini Onaylayın</h3>
                <p className="text-dark-400 text-sm mt-2">Aşağıdaki bilgilerin doğru olduğundan emin olun</p>
              </div>
              
              <div className="bg-dark-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">Firma:</span>
                  <span className="text-dark-100">{company?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Proje Adı:</span>
                  <span className="text-dark-100">{projectData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Hizmet Türü:</span>
                  <span className="text-dark-100">
                    {SERVICE_TYPES.find(s => s.value === projectData.service_type)?.label || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Segment:</span>
                  <span className="text-dark-100">{projectData.segment || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Başlangıç Tarihi:</span>
                  <span className="text-dark-100">
                    {projectData.start_date ? new Date(projectData.start_date).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Kıyafet Türleri:</span>
                  <span className="text-dark-100">{selectedClothing.length} adet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Müşteri Yetkilisi:</span>
                  <span className="text-dark-100">
                    {customerRep.first_name && customerRep.last_name 
                      ? `${customerRep.first_name} ${customerRep.last_name}` 
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Proje Yöneticisi:</span>
                  <span className="text-dark-100">
                    {adminUsers.find(u => u.id === parseInt(managers.primary_manager_id))?.name || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-700 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentTab === 1}
            className="flex items-center gap-2 px-4 py-2 text-dark-300 hover:text-dark-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Geri
          </button>
          
          {currentTab < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors disabled:opacity-50"
            >
              Devam
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : (project ? 'Değişiklikleri Kaydet' : 'Projeyi Oluştur')}
              <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  , document.body)
}
