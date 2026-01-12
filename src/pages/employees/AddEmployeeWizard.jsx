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
  User,
  Phone,
  Award,
  Shirt,
  CreditCard,
  Briefcase,
  CheckCircle,
  Building2,
  AlertCircle
} from 'lucide-react'

// Sabit Veriler
const EDUCATION_LEVELS = [
  'İlkokul', 'Ortaokul', 'Lise', 'Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora', 'Diğer'
]

const BLOOD_TYPES = ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-']

const BANKS = [
  'Ziraat Bankası', 'Halkbank', 'Vakıfbank', 'İş Bankası', 'Garanti BBVA', 
  'Yapı Kredi', 'Akbank', 'QNB Finansbank', 'TEB', 'Denizbank', 'ING', 
  'Kuveyt Türk', 'Albaraka Türk', 'Türkiye Finans', 'Ziraat Katılım', 'Vakıf Katılım'
]

const CARD_TYPES = [
  'Metropol Kart', 'Sodexo', 'Multinet', 'Ticket Restaurant', 'Edenred', 'Setcard', 'Kart hakkı yoktur'
]

const CLOTHING_CONFIG = {
  ayakkabi: { label: 'Ayakkabı', type: 'range', min: 35, max: 50 },
  bere: { label: 'Bere', type: 'fixed', options: ['Standart'] },
  gomlek: { label: 'Gömlek', type: 'select', options: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'] },
  kaban: { label: 'Kaban', type: 'select', options: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'] },
  kazak: { label: 'Kazak', type: 'select', options: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'] },
  pantolon: { label: 'Pantolon', type: 'mixed', options: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'], range: { min: 36, max: 60 } },
  takim_elbise: { label: 'Takım Elbise', type: 'range', min: 36, max: 60 }
}

const TABS = [
  { id: 1, name: 'Genel Bilgiler', icon: User },
  { id: 2, name: 'İletişim', icon: Phone },
  { id: 3, name: 'Sertifika', icon: Award },
  { id: 4, name: 'Kıyafet', icon: Shirt },
  { id: 5, name: 'Hesap', icon: Building2 }, // Banka simgesi benzeri
  { id: 6, name: 'Kart', icon: CreditCard },
  { id: 7, name: 'Görevlendir', icon: Briefcase },
  { id: 8, name: 'Onay', icon: CheckCircle },
]

export default function AddEmployeeWizard({ isOpen, onClose, company, onComplete, employee }) {
  const navigate = useNavigate()
  const { user } = useApp()
  const [currentTab, setCurrentTab] = useState(1)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState([])
  const [titles, setTitles] = useState(['Güvenlik Görevlisi', 'Temizlik Personeli', 'Danışma', 'Proje Müdürü', 'Operasyon Müdürü']) 
  const [error, setError] = useState(null)
  const [showValidation, setShowValidation] = useState(false)
  
  // State
  const initialData = {
    // Tab 1: Genel
    tc_no: '',
    type: 'blue_collar', 
    first_name: '',
    last_name: '',
    father_name: '',
    mother_name: '',
    birth_place: '',
    birth_date: '',
    marital_status: '',
    gender: '',
    blood_type: '',
    military_status: '',
    education_level: '',
    start_date: '',
    status: 'active',
    height: '',
    weight: '',
    children_count: '',
    title: '',

    // Tab 2: İletişim
    phone: '',
    home_phone: '',
    email: '',
    address: '',
    emergency_contact_phone: '',
    emergency_contact_name: '',

    // Tab 3: Sertifika
    add_certificate: false,
    certificate_city: '',
    certificate_no: '',
    certificate_date: '',
    certificate_expiry: '',
    weapon_status: '',

    // Tab 4: Kıyafet (JSON)
    clothing_sizes: {},

    // Tab 5: Hesap
    bank_name: '',
    bank_branch_name: '',
    bank_branch_code: '',
    bank_account_no: '',
    iban: '',

    // Tab 6: Kart
    card_type: '',
    card_no: '',

    // Tab 7: Görevlendirme
    assign_task: false,
    assign_project_id: '',
    assign_start_date: ''
  }

  const [formData, setFormData] = useState(initialData)

  // Firma ve projeler için state
  const [allCompanies, setAllCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
       loadCompanies()
       if (company?.id) {
         setSelectedCompanyId(company.id)
         loadProjects(company.id)
       }
       
       if (employee) {
         // Populate form for editing
         const clothing = typeof employee.clothing_sizes === 'string' 
            ? JSON.parse(employee.clothing_sizes) 
            : (employee.clothing_sizes || {})

         setFormData({
           ...initialData,
           ...employee,
           tc_no: employee.tc_no || '',
           type: employee.type || 'blue_collar',
           first_name: employee.first_name || '',
           last_name: employee.last_name || '',
           // ... map other fields safely
           clothing_sizes: clothing,
           assign_task: false // Editing generally doesn't trigger new assignment via this flag unless requested
         })
       } else {
         setFormData(initialData)
       }
       setCurrentTab(1)
    }
  }, [isOpen, company, employee])

  const loadCompanies = async () => {
    try {
      const data = await api.getCompanies()
      setAllCompanies(data)
    } catch (error) {
      console.error('Firmalar yüklenemedi', error)
    }
  }

  const loadProjects = async (companyId) => {
    if (!companyId) {
      setProjects([])
      return
    }
    try {
      const data = await api.getProjects(companyId)
      setProjects(data)
    } catch (error) {
      console.error('Projeler yüklenemedi', error)
    }
  }

  const handleCompanySelect = (companyId) => {
    setSelectedCompanyId(companyId)
    loadProjects(companyId)
  }

  // TC Validasyonu
  const validateTC = (value) => {
    if (!value) return false
    value = String(value)
    if (!/^\d{11}$/.test(value)) return false
    
    if (value[0] === '0') return false

    let d = value.split('').map(Number)
    let oddSum = d[0] + d[2] + d[4] + d[6] + d[8]
    let evenSum = d[1] + d[3] + d[5] + d[7]
    let d10 = ((oddSum * 7) - evenSum) % 10
    if (d10 < 0) d10 += 10 
    
    if (d10 !== d[9]) return false
    
    let sumTop10 = 0
    for(let i=0; i<10; i++) sumTop10 += d[i]
    
    if (sumTop10 % 10 !== d[10]) return false

    return true
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error on change
  }

  const handleClothingChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      clothing_sizes: { ...prev.clothing_sizes, [type]: value }
    }))
  }

  const canProceed = () => {
    switch (currentTab) {
      case 1: // Genel
        if (!validateTC(formData.tc_no)) return false
        if (!formData.type || !formData.first_name || !formData.last_name || 
            !formData.birth_place || !formData.birth_date || !formData.marital_status ||
            !formData.gender || !formData.education_level || !formData.start_date ||
            !formData.status || !formData.title) return false
        return true
      case 2: // İletişim
        return !!formData.phone
      case 3: // Sertifika
        if (!formData.add_certificate && !employee?.has_certificate && !formData.has_certificate) return true
        // If has certificate is checked or was previously existing (logic can depend, stick to checkbox for editing)
        if (formData.add_certificate || formData.has_certificate) {
             return formData.certificate_city && formData.certificate_no && 
               formData.certificate_date && formData.certificate_expiry && formData.weapon_status
        }
        return true
      case 4: // Kıyafet
        return true 
      case 5: // Hesap
        return formData.bank_name && formData.iban
      case 6: // Kart
        if (!formData.card_type) return false
        if (formData.card_type !== 'Kart hakkı yoktur' && !formData.card_no) return false
        return true
      case 7: // Görevlendir - Her zaman opsiyonel
        if (!formData.assign_task) return true
        // Firma bağlamı yoksa görevlendirme yapılamaz
        if (!selectedCompanyId && !company?.id) return true
        return formData.assign_project_id && formData.assign_start_date
      default:
        return true
    }
  }

  const handleNext = () => {
    setError(null)
    
    // Check if current tab is valid before proceeding
    if (!canProceed()) {
      setShowValidation(true)
      setError('Lütfen işaretli zorunlu alanları doldurunuz.')
      
      // Specific error for TC if it's the issue on Tab 1
      if (currentTab === 1 && formData.tc_no && !validateTC(formData.tc_no)) {
        setError('Geçersiz TC Kimlik Numarası.')
      }
      return
    }
    
    // Reset validation and proceed
    setShowValidation(false)
    if (currentTab < 8) {
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
      // Seçilen firma ID'sini belirle (varsa)
      const targetCompanyId = selectedCompanyId || company?.id || null
      
      if (employee) {
        // Update
        await api.updateEmployee(employee.id, {
            ...formData,
            company_id: employee.company_id || targetCompanyId
        })
        alert('Personel bilgileri güncellendi!')
      } else {
        // Create - firma opsiyonel
        await api.createEmployee({
            company_id: targetCompanyId,
            ...formData
        })
        if (targetCompanyId) {
          alert('Personel başarıyla eklendi ve firmaya atandı!')
        } else {
          alert('Personel başarıyla eklendi! (Boşta olarak kaydedildi)')
        }
      }
      
      onClose()
      if (onComplete) onComplete()
    } catch (error) {
      console.error('Submit error:', error)
      setError(error.response?.data?.message || 'Bir hata oluştu: ' + error.message)
    }
    setSaving(false)
  }

  if (!isOpen) return null

  const renderRangeOptions = (min, max) => {
    let opts = []
    for(let i=min; i<=max; i++) opts.push(i)
    return opts.map(o => <option key={o} value={o}>{o}</option>)
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-dark-800 rounded-2xl w-full max-w-5xl border border-dark-700 h-[90vh] flex flex-col relative animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark-100">{employee ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</h2>
            <p className="text-sm text-dark-400 mt-1">
              {company?.name || employee?.company?.name || (selectedCompanyId ? allCompanies.find(c => c.id === selectedCompanyId)?.name : 'Firma seçilmedi - Boşta olarak kaydedilecek')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <X size={20} className="text-dark-400" />
          </button>
        </div>

        {/* Info Banner - Show when no company context */}
        {!company && !employee && currentTab === 1 && (
          <div className="mx-6 mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>💡 Bilgi:</strong> Bu personeli daha sonra istediğiniz firmaya ve projelere atayabilirsiniz. 
              Şimdilik firma seçmeden devam ederseniz, personel "Boşta" olarak kaydedilecektir.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
             <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
             <div>
               <h4 className="text-sm font-medium text-red-500">Hata</h4>
               <p className="text-sm text-red-400 mt-1">{error}</p>
             </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-dark-700 flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            const isCompleted = currentTab > tab.id
            return (
              <button
                key={tab.id}
                onClick={() => tab.id <= currentTab && setCurrentTab(tab.id)} 
                disabled={tab.id > currentTab}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-accent text-white' 
                    : isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-dark-700/50 text-dark-400'
                }`}
              >
                {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Content - SAME AS BEFORE, just reusing rendering logic */}
        <div className="p-8 flex-1 overflow-y-auto">
           {/* Copying previous content structure roughly but ensuring logic holds */}
           {/* TAB 1: GENEL BİLGİLER */}
           {currentTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1 lg:col-span-3 pb-2 border-b border-dark-700 mb-2">
                <h3 className="text-accent font-medium">Kimlik Bilgileri</h3>
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">TC Kimlik No *</label>
                <input type="text" maxLength={11} value={formData.tc_no} onChange={e => handleChange('tc_no', e.target.value)} 
                       className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${
                          (showValidation && (!formData.tc_no || !validateTC(formData.tc_no))) || (!validateTC(formData.tc_no) && formData.tc_no.length === 11)
                          ? 'border-red-500' 
                          : 'border-dark-600'
                       }`}/>
              </div>
              
              <div>
                <label className="block text-xs text-dark-300 mb-1">Tür *</label>
                <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100">
                  <option value="blue_collar">Mavi Yaka</option>
                  <option value="white_collar">Beyaz Yaka</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Unvan *</label>
                <select value={formData.title} onChange={e => handleChange('title', e.target.value)} 
                  className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.title ? 'border-red-500' : 'border-dark-600'}`}>
                  <option value="">Seçiniz...</option>
                  {titles.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Adı *</label>
                <input type="text" value={formData.first_name} onChange={e => handleChange('first_name', e.target.value)} 
                  className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.first_name ? 'border-red-500' : 'border-dark-600'}`} />
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Soyadı *</label>
                <input type="text" value={formData.last_name} onChange={e => handleChange('last_name', e.target.value)} 
                  className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.last_name ? 'border-red-500' : 'border-dark-600'}`} />
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Baba Adı</label>
                <input type="text" value={formData.father_name} onChange={e => handleChange('father_name', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Anne Adı</label>
                <input type="text" value={formData.mother_name} onChange={e => handleChange('mother_name', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Doğum Yeri *</label>
                <input type="text" value={formData.birth_place} onChange={e => handleChange('birth_place', e.target.value)} 
                  className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.birth_place ? 'border-red-500' : 'border-dark-600'}`} />
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Doğum Tarihi *</label>
                <input type="date" value={formData.birth_date} onChange={e => handleChange('birth_date', e.target.value)} 
                   className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.birth_date ? 'border-red-500' : 'border-dark-600'}`} />
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Medeni Durumu *</label>
                <select value={formData.marital_status} onChange={e => handleChange('marital_status', e.target.value)} 
                  className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.marital_status ? 'border-red-500' : 'border-dark-600'}`}>
                  <option value="">Seçiniz</option>
                  <option value="Bekar">Bekar</option>
                  <option value="Evli">Evli</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Cinsiyet *</label>
                <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)} 
                   className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.gender ? 'border-red-500' : 'border-dark-600'}`}>
                  <option value="">Seçiniz</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">Kan Grubu</label>
                <select value={formData.blood_type} onChange={e => handleChange('blood_type', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100">
                  <option value="">Seçiniz</option>
                  {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-dark-300 mb-1">Askerlik Durumu</label>
                <select value={formData.military_status} onChange={e => handleChange('military_status', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100">
                  <option value="">Seçiniz</option>
                  <option value="Yapıldı">Yapıldı</option>
                  <option value="Muaf">Muaf</option>
                  <option value="Tecilli">Tecilli</option>
                </select>
              </div>

              <div className="col-span-1 lg:col-span-3 pb-2 border-b border-dark-700 mt-4 mb-2">
                <h3 className="text-accent font-medium">İş ve Eğitim</h3>
              </div>

               <div>
                <label className="block text-xs text-dark-300 mb-1">Eğitim *</label>
                <select value={formData.education_level} onChange={e => handleChange('education_level', e.target.value)} 
                   className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.education_level ? 'border-red-500' : 'border-dark-600'}`}>
                  <option value="">Seçiniz...</option>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-dark-300 mb-1">İşe Giriş Tarihi *</label>
                <input type="date" value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} 
                  className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 focus:outline-none focus:border-accent ${showValidation && !formData.start_date ? 'border-red-500' : 'border-dark-600'}`} />
              </div>
              
               <div>
                <label className="block text-xs text-dark-300 mb-1">Çalışma Durumu *</label>
                <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100">
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                </select>
              </div>

               <div>
                <label className="block text-xs text-dark-300 mb-1">Boy</label>
                <input type="text" value={formData.height} onChange={e => handleChange('height', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" placeholder="cm" />
              </div>

               <div>
                <label className="block text-xs text-dark-300 mb-1">Kilo</label>
                <input type="text" value={formData.weight} onChange={e => handleChange('weight', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" placeholder="kg" />
              </div>

               <div>
                <label className="block text-xs text-dark-300 mb-1">Çocuk Sayısı</label>
                <input type="number" min="0" value={formData.children_count} onChange={e => handleChange('children_count', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
              </div>
            </div>
          )}

          {/* TAB 2: İLETİŞİM */}
          {currentTab === 2 && (
             <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-300 mb-1">Cep Telefonu *</label>
                    <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} 
                      className={`w-full px-3 py-2 bg-dark-700 border rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-accent ${showValidation && !formData.phone ? 'border-red-500' : 'border-dark-600'}`} placeholder="05XX XXX XX XX"/>
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 mb-1">Ev Telefonu</label>
                    <input type="tel" value={formData.home_phone} onChange={e => handleChange('home_phone', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                  </div>
                </div>
                 <div>
                    <label className="block text-xs text-dark-300 mb-1">E-Posta</label>
                    <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                </div>
                <div>
                    <label className="block text-xs text-dark-300 mb-1">Adres</label>
                    <textarea rows="3" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                </div>
                
                <div className="pt-4 border-t border-dark-700">
                  <h4 className="text-sm font-medium text-dark-200 mb-2">Acil Durum</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-xs text-dark-300 mb-1">Acil Durum Kişisi</label>
                      <input type="text" value={formData.emergency_contact_name} onChange={e => handleChange('emergency_contact_name', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                    </div>
                     <div>
                      <label className="block text-xs text-dark-300 mb-1">Acil Durum No</label>
                      <input type="tel" value={formData.emergency_contact_phone} onChange={e => handleChange('emergency_contact_phone', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                    </div>
                  </div>
                </div>
             </div>
          )}

           {/* TAB 3: SERTİFİKA */}
          {currentTab === 3 && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg flex items-start gap-3">
                 <div className="p-1 bg-blue-500 rounded text-white flex-shrink-0"><Award size={20} /></div>
                 <div>
                   <h4 className="text-sm font-medium text-blue-400">5188 Sayılı Kanun Sertifika Bilgileri</h4>
                   <p className="text-xs text-dark-400 mt-1">Özel güvenlik kimlik kartı bilgilerini buradan girebilirsiniz.</p>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="add_cert" checked={formData.add_certificate || (formData.has_certificate && employee != null)} onChange={e => handleChange('add_certificate', e.target.checked)} className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-accent focus:ring-accent" />
                <label htmlFor="add_cert" className="text-dark-200 select-none cursor-pointer">Sertifika bilgilerini eklemek istiyorum</label>
              </div>

              {(formData.add_certificate || (employee && employee.has_certificate)) && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-dark-700/30 rounded-xl border border-dark-700 animate-fadeIn">
                   <div>
                    <label className="block text-xs text-dark-300 mb-1">Şehir *</label>
                    <input type="text" value={formData.certificate_city} onChange={e => handleChange('certificate_city', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                  </div>
                   <div>
                    <label className="block text-xs text-dark-300 mb-1">Kimlik Kartı Seri No *</label>
                    <input type="text" value={formData.certificate_no} onChange={e => handleChange('certificate_no', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                  </div>
                   <div>
                    <label className="block text-xs text-dark-300 mb-1">Düzenlendiği Tarih *</label>
                    <input type="date" value={formData.certificate_date} onChange={e => handleChange('certificate_date', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                  </div>
                   <div>
                    <label className="block text-xs text-dark-300 mb-1">Geçerlilik Tarihi *</label>
                    <input type="date" value={formData.certificate_expiry} onChange={e => handleChange('certificate_expiry', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-dark-300 mb-1">Silah Durumu *</label>
                    <select value={formData.weapon_status} onChange={e => handleChange('weapon_status', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100">
                      <option value="">Seçiniz</option>
                      <option value="Silahlı">Silahlı</option>
                      <option value="Silahsız">Silahsız</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KIYAFET */}
          {currentTab === 4 && (
             <div className="space-y-4 max-w-2xl">
               <p className="text-sm text-dark-400 mb-2">Personelin kıyafet bedenlerini aşağıdan seçebilirsiniz (Zorunlu değildir).</p>
               {Object.entries(CLOTHING_CONFIG).map(([key, config]) => (
                 <div key={key} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg border border-dark-700">
                    <span className="text-sm font-medium text-dark-200 w-1/3">{config.label}</span>
                    <div className="w-2/3">
                       {/* Dropdown Logic */}
                       {(config.type === 'select' || config.type === 'range' || config.type === 'mixed') && (
                         <select 
                            value={formData.clothing_sizes[key] || ''} 
                            onChange={e => handleClothingChange(key, e.target.value)}
                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 text-sm"
                          >
                            <option value="">Seçiniz</option>
                            {config.type === 'select' && config.options.map(o => <option key={o} value={o}>{o}</option>)}
                            {config.type === 'range' && renderRangeOptions(config.min, config.max)}
                            {config.type === 'mixed' && (
                                <>
                                 <optgroup label="Bedenler">
                                    {config.options.map(o => <option key={o} value={o}>{o}</option>)}
                                 </optgroup>
                                 <optgroup label="Numaralar">
                                    {renderRangeOptions(config.range.min, config.range.max)}
                                 </optgroup>
                                </>
                            )}
                          </select>
                       )}
                       {config.type === 'fixed' && (
                          <div className="text-dark-400 text-sm px-3 py-2 bg-dark-800 rounded">{config.options[0]}</div>
                       )}
                    </div>
                 </div>
               ))}
             </div>
          )}

           {/* TAB 5: HESAP */}
           {currentTab === 5 && (
            <div className="space-y-4 max-w-2xl">
               <div>
                  <label className="block text-xs text-dark-300 mb-1">Banka *</label>
                  <select value={formData.bank_name} onChange={e => handleChange('bank_name', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100">
                    <option value="">Seçiniz...</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-300 mb-1">Şube Adı</label>
                    <input type="text" value={formData.bank_branch_name} onChange={e => handleChange('bank_branch_name', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                  </div>
                   <div>
                    <label className="block text-xs text-dark-300 mb-1">Şube Kodu</label>
                    <input type="text" value={formData.bank_branch_code} onChange={e => handleChange('bank_branch_code', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                  </div>
               </div>
                <div>
                  <label className="block text-xs text-dark-300 mb-1">Hesap No</label>
                  <input type="text" value={formData.bank_account_no} onChange={e => handleChange('bank_account_no', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
               </div>
                <div>
                  <label className="block text-xs text-dark-300 mb-1">IBAN *</label>
                  <input type="text" value={formData.iban} onChange={e => handleChange('iban', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" placeholder="TR..." />
               </div>
            </div>
           )}

           {/* TAB 6: KART */}
           {currentTab === 6 && (
              <div className="space-y-4 max-w-2xl">
                 <div>
                    <label className="block text-xs text-dark-300 mb-1">Yemek Kartı *</label>
                    <select value={formData.card_type} onChange={e => handleChange('card_type', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100">
                      <option value="">Seçiniz...</option>
                      {CARD_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 {formData.card_type && formData.card_type !== 'Kart hakkı yoktur' && (
                   <div className="animate-fadeIn">
                      <label className="block text-xs text-dark-300 mb-1">Kart Numarası *</label>
                      <input type="text" value={formData.card_no} onChange={e => handleChange('card_no', e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" />
                   </div>
                 )}
              </div>
           )}

           {/* TAB 7: GÖREVLENDİR - Firma seçimi → Proje seçimi (opsiyonel) */}
           {currentTab === 7 && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg flex items-start gap-3">
                <div className="p-1 bg-purple-500 rounded text-white flex-shrink-0"><Briefcase size={20} /></div>
                <div>
                  <h4 className="text-sm font-medium text-purple-400">Firma ve Proje Ataması</h4>
                  <p className="text-xs text-dark-400 mt-1">
                    {employee 
                      ? 'Mevcut personelin firma/proje atamasını değiştirmek için detay sayfasını kullanın.'
                      : 'Personeli bir firmaya ve opsiyonel olarak projeye atayabilirsiniz. Bu adım zorunlu değildir.'}
                  </p>
                </div>
              </div>

              {/* Firma daha önce belirlenmiş mi kontrolü */}
              {(company?.id || employee?.company_id) ? (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm flex items-center gap-2">
                    <Building2 size={16} />
                    Personel <strong className="mx-1">{company?.name || employee?.company?.name}</strong> firmasına atanacak.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="assign_task" 
                      checked={formData.assign_task} 
                      onChange={e => handleChange('assign_task', e.target.checked)} 
                      className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-accent focus:ring-accent" 
                    />
                    <label htmlFor="assign_task" className="text-dark-200 select-none cursor-pointer">
                      Bu personeli bir firmaya atamak istiyorum
                    </label>
                  </div>

                  {!formData.assign_task && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-amber-400 text-sm">
                        Firma seçmezseniz personel "Boşta" olarak kaydedilecek ve sonradan atama yapabilirsiniz.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Firma ve Proje Seçimi */}
              {(formData.assign_task || company?.id || employee?.company_id) && (
                <div className="space-y-4 p-4 bg-dark-700/30 rounded-xl border border-dark-700 animate-fadeIn">
                  {/* Firma Seçimi - sadece context yoksa göster */}
                  {!company?.id && !employee?.company_id && (
                    <div>
                      <label className="block text-xs text-dark-300 mb-1">Firma *</label>
                      <select 
                        value={selectedCompanyId || ''} 
                        onChange={e => handleCompanySelect(Number(e.target.value))} 
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100"
                      >
                        <option value="">Firma seçiniz...</option>
                        {allCompanies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company_code})</option>)}
                      </select>
                    </div>
                  )}

                  {/* Proje Seçimi - Opsiyonel */}
                  {(selectedCompanyId || company?.id || employee?.company_id) && (
                    <div>
                      <label className="block text-xs text-dark-300 mb-1">Proje (Opsiyonel)</label>
                      <select 
                        value={formData.assign_project_id} 
                        onChange={e => handleChange('assign_project_id', e.target.value)} 
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100"
                      >
                        <option value="">Proje seçmeden devam et...</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {projects.length === 0 && (
                        <p className="text-xs text-dark-500 mt-1">Bu firmaya ait proje bulunmuyor.</p>
                      )}
                    </div>
                  )}

                  {/* Başlangıç Tarihi - proje seçilmişse */}
                  {formData.assign_project_id && (
                    <div>
                      <label className="block text-xs text-dark-300 mb-1">Proje Başlangıç Tarihi</label>
                      <input 
                        type="date" 
                        value={formData.assign_start_date} 
                        onChange={e => handleChange('assign_start_date', e.target.value)} 
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100" 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
           )}

           {/* TAB 8: ONAY */}
           {currentTab === 8 && (
             <div className="space-y-6">
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dark-100">{employee ? 'Güncellemeyi Onaylayın' : 'Bilgileri Onaylayın'}</h3>
                  <p className="text-dark-400 text-sm mt-2">{employee ? 'Personel bilgilerini güncellemek üzeresiniz.' : 'Personel kaydı oluşturulmadan önce lütfen bilgileri kontrol edin.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div className="bg-dark-700/50 p-4 rounded-lg space-y-2">
                      <h4 className="text-accent font-medium mb-3">Genel Bilgiler</h4>
                      <div className="flex justify-between"><span className="text-dark-400">Ad Soyad:</span> <span className="text-dark-200">{formData.first_name} {formData.last_name}</span></div>
                      <div className="flex justify-between"><span className="text-dark-400">TC:</span> <span className="text-dark-200">{formData.tc_no}</span></div>
                      <div className="flex justify-between"><span className="text-dark-400">Unvan:</span> <span className="text-dark-200">{formData.title}</span></div>
                      <div className="flex justify-between"><span className="text-dark-400">GSM:</span> <span className="text-dark-200">{formData.phone}</span></div>
                   </div>
                   
                   <div className="bg-dark-700/50 p-4 rounded-lg space-y-2">
                       <h4 className="text-accent font-medium mb-3">Diğer Bilgiler</h4>
                       <div className="flex justify-between"><span className="text-dark-400">Sertifika:</span> <span className="text-dark-200">{formData.add_certificate || (employee?.has_certificate) ? 'Var' : 'Yok'}</span></div>
                        <div className="flex justify-between"><span className="text-dark-400">Banka:</span> <span className="text-dark-200">{formData.bank_name || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-dark-400">Kart:</span> <span className="text-dark-200">{formData.card_type || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-dark-400">Görev:</span> <span className="text-dark-200">{formData.assign_task ? projects.find(p=>p.id == formData.assign_project_id)?.name : (employee ? 'Mevcut Durum Korunacak' : '-')}</span></div>
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
          
          {currentTab < TABS.length ? (
            <button
              onClick={handleNext}
              disabled={false} // Validation checks handled in handleNext but we can visual disable too if needed
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors"
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
              {saving ? 'Kaydediliyor...' : (employee ? 'Güncelle' : 'Kaydı Tamamla')}
              <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  , document.body)
}
