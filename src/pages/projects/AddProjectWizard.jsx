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
  CheckCircle,
  UserPlus,
  UserX
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
  { id: 5, name: 'Personel Ekle', icon: UserPlus },
  { id: 6, name: 'Onay', icon: CheckCircle },
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
  
  // Personel seçimi için
  const [idleEmployees, setIdleEmployees] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])

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
      
      // Boşta personelleri yükle
      loadIdleEmployees()
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
  
  const loadIdleEmployees = async () => {
    try {
      const employees = await api.getIdleEmployees()
      setIdleEmployees(employees)
    } catch (error) {
      console.error('Failed to load idle employees:', error)
    }
  }
  
  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
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
        return true // Employee selection is optional
      case 6:
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentTab < 6 && canProceed()) {
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
      
      // Handle Selected Employees - assign to company and project
      if (selectedEmployees.length > 0) {
        const companyId = company?.id || project?.company_id
        for (const employeeId of selectedEmployees) {
          try {
            // Önce firmaya ata
            await api.assignEmployeeToCompany(employeeId, companyId)
            // Sonra projeye ata
            await api.assignEmployeeToProject(resultProject.id, employeeId)
          } catch (err) {
            console.error(`Employee ${employeeId} assignment failed:`, err)
          }
        }
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
    setSelectedEmployees([])
  }

  if (!isOpen) return null
  
  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-theme-bg-secondary rounded-2xl w-full max-w-4xl border border-theme-border-primary h-[85vh] flex flex-col relative animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-theme-border-primary flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-theme-text-primary">{project ? 'Proje Düzenle' : 'Proje Ekle'}</h2>
            <p className="text-sm text-theme-text-muted mt-1">{company?.name || project?.company?.name}</p>
          </div>
          <button 
            onClick={() => { resetForm(); onClose(); }}
            className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
          >
            <X size={20} className="text-theme-text-muted" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-theme-border-primary flex gap-2 overflow-x-auto">
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
                      : 'bg-theme-bg-hover text-theme-text-muted'
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
                <label className="block text-sm text-theme-text-tertiary mb-2">Bağlı Firma</label>
                <input
                  type="text"
                  value={company?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-theme-bg-elevated border border-dark-500 rounded-lg text-theme-text-tertiary cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">Proje Adı *</label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={e => setProjectData({ ...projectData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                  placeholder="Proje adı"
                />
              </div>
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">Hizmet Türü *</label>
                <select
                  value={projectData.service_type}
                  onChange={e => setProjectData({ ...projectData, service_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">Seçiniz...</option>
                  {SERVICE_TYPES.map(st => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-theme-text-tertiary mb-2">Segment</label>
                  <input
                    type="text"
                    value={projectData.segment}
                    onChange={e => setProjectData({ ...projectData, segment: e.target.value })}
                    className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                    placeholder="Segment"
                  />
                </div>
                <div>
                  <label className="block text-sm text-theme-text-tertiary mb-2">Başlangıç Tarihi *</label>
                  <input
                    type="date"
                    value={projectData.start_date}
                    onChange={e => setProjectData({ ...projectData, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Kıyafet Türleri */}
          {currentTab === 2 && (
            <div className="flex gap-4 h-80">
              {/* Available */}
              <div className="flex-1 bg-theme-bg-hover rounded-xl p-4 border border-theme-border-secondary">
                <h4 className="text-sm font-medium text-theme-text-tertiary mb-3">Mevcut Kıyafetler</h4>
                <div className="space-y-2">
                  {availableClothing.map(item => (
                    <button
                      key={item.value}
                      onClick={() => handleClothingSelect(item)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-theme-bg-elevated hover:bg-dark-500 text-theme-text-secondary text-sm transition-colors"
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
                    <p className="text-theme-text-muted text-sm text-center py-4">
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
                  <label className="block text-sm text-theme-text-tertiary mb-2">Bağlı Firma</label>
                  <input
                    type="text"
                    value={company?.name || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-theme-bg-elevated border border-dark-500 rounded-lg text-theme-text-tertiary cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-theme-text-tertiary mb-2">Bağlı Proje</label>
                  <input
                    type="text"
                    value={projectData.name || '-'}
                    disabled
                    className="w-full px-4 py-2.5 bg-theme-bg-elevated border border-dark-500 rounded-lg text-theme-text-tertiary cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-theme-text-tertiary mb-2">Adı</label>
                  <input
                    type="text"
                    value={customerRep.first_name}
                    onChange={e => setCustomerRep({ ...customerRep, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                    placeholder="Yetkili adı"
                  />
                </div>
                <div>
                  <label className="block text-sm text-theme-text-tertiary mb-2">Soyadı</label>
                  <input
                    type="text"
                    value={customerRep.last_name}
                    onChange={e => setCustomerRep({ ...customerRep, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                    placeholder="Yetkili soyadı"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">Görevi</label>
                <input
                  type="text"
                  value={customerRep.title}
                  onChange={e => setCustomerRep({ ...customerRep, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                  placeholder="Örn: Proje Müdürü"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-theme-text-tertiary mb-2">Telefon Numarası</label>
                  <input
                    type="tel"
                    value={customerRep.phone}
                    onChange={e => setCustomerRep({ ...customerRep, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                    placeholder="0532 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-theme-text-tertiary mb-2">E-Posta</label>
                  <input
                    type="email"
                    value={customerRep.email}
                    onChange={e => setCustomerRep({ ...customerRep, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
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
                <label className="block text-sm text-theme-text-tertiary mb-2">Birincil Proje Yöneticisi *</label>
                <select
                  value={managers.primary_manager_id}
                  onChange={e => setManagers({ ...managers, primary_manager_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">Seçiniz...</option>
                  {adminUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">İkincil Proje Yöneticisi</label>
                <select
                  value={managers.secondary_manager_id}
                  onChange={e => setManagers({ ...managers, secondary_manager_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
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

          {/* Tab 5: Personel Ekle */}
          {currentTab === 5 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-1">Boşta Personel Ataması (Opsiyonel)</h4>
                <p className="text-xs text-theme-text-muted">
                  Aşağıdan boşta olan personelleri seçerek hem bu firmaya hem de projeye otomatik atayabilirsiniz.
                </p>
              </div>
              
              {idleEmployees.length === 0 ? (
                <div className="text-center py-12 bg-theme-bg-hover rounded-xl border border-theme-border-primary">
                  <UserX size={48} className="text-theme-text-placeholder mx-auto mb-4" />
                  <p className="text-theme-text-tertiary">Sistemde boşta personel bulunmuyor.</p>
                  <p className="text-xs text-theme-text-placeholder mt-2">Tüm personeller bir firmaya atanmış durumda.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {idleEmployees.map(emp => (
                    <div 
                      key={emp.id} 
                      onClick={() => toggleEmployeeSelection(emp.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedEmployees.includes(emp.id)
                          ? 'bg-accent/20 border-accent/50'
                          : 'bg-theme-bg-hover border-theme-border-secondary hover:border-dark-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => toggleEmployeeSelection(emp.id)}
                        className="w-5 h-5 rounded border-theme-border-secondary bg-theme-bg-tertiary text-accent focus:ring-accent"
                      />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {emp.first_name ? emp.first_name[0] : '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-theme-text-primary">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-sm text-theme-text-muted">{emp.title || 'Unvan belirtilmemiş'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedEmployees.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">
                    <strong>{selectedEmployees.length}</strong> personel seçildi. Bu personeller firmaya ve projeye atanacak.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Onay */}
          {currentTab === 6 && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-theme-text-primary">Proje Bilgilerini Onaylayın</h3>
                <p className="text-theme-text-muted text-sm mt-2">Aşağıdaki bilgilerin doğru olduğundan emin olun</p>
              </div>
              
              <div className="bg-theme-bg-hover rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Firma:</span>
                  <span className="text-theme-text-primary">{company?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Proje Adı:</span>
                  <span className="text-theme-text-primary">{projectData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Hizmet Türü:</span>
                  <span className="text-theme-text-primary">
                    {SERVICE_TYPES.find(s => s.value === projectData.service_type)?.label || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Segment:</span>
                  <span className="text-theme-text-primary">{projectData.segment || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Başlangıç Tarihi:</span>
                  <span className="text-theme-text-primary">
                    {projectData.start_date ? new Date(projectData.start_date).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Kıyafet Türleri:</span>
                  <span className="text-theme-text-primary">{selectedClothing.length} adet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Müşteri Yetkilisi:</span>
                  <span className="text-theme-text-primary">
                    {customerRep.first_name && customerRep.last_name 
                      ? `${customerRep.first_name} ${customerRep.last_name}` 
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Proje Yöneticisi:</span>
                  <span className="text-theme-text-primary">
                    {adminUsers.find(u => u.id === parseInt(managers.primary_manager_id))?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Atanacak Personel:</span>
                  <span className={`${selectedEmployees.length > 0 ? 'text-green-400' : 'text-theme-text-primary'}`}>
                    {selectedEmployees.length > 0 ? `${selectedEmployees.length} kişi` : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-theme-border-primary flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentTab === 1}
            className="flex items-center gap-2 px-4 py-2 text-theme-text-tertiary hover:text-theme-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Geri
          </button>
          
          {currentTab < 6 ? (
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
