import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import AddEmployeeWizard from './AddEmployeeWizard'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Building2,
  UserX,
  Briefcase,
  ChevronRight
} from 'lucide-react'

// Durum badge bileşeni
function StatusBadge({ status }) {
  const config = {
    idle: { label: 'Boşta', bg: 'bg-gray-500/20', text: 'text-gray-400', icon: UserX },
    assigned_to_company: { label: 'Firmada', bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Building2 },
    assigned_to_project: { label: 'Projede', bg: 'bg-green-500/20', text: 'text-green-400', icon: Briefcase },
  }
  
  const cfg = config[status] || config.idle
  const Icon = cfg.icon
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${cfg.bg} ${cfg.text}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

// Personel kartı bileşeni
function EmployeeCard({ employee, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-theme-bg-secondary rounded-xl p-5 border border-theme-border-primary hover:border-accent/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">
            {employee.first_name ? employee.first_name[0] : (employee.name ? employee.name[0] : '?')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-theme-text-primary group-hover:text-accent transition-colors truncate">
            {employee.first_name ? `${employee.first_name} ${employee.last_name}` : employee.name}
          </h3>
          <p className="text-sm text-theme-text-muted mt-0.5">{employee.title || 'Unvan Belirtilmemiş'}</p>
          {employee.phone && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-theme-text-muted">
              <Phone size={12} />
              <span>{employee.phone}</span>
            </div>
          )}
          {employee.company && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-theme-text-muted">
              <Building2 size={12} />
              <span>{employee.company.name}</span>
            </div>
          )}
        </div>
        <StatusBadge status={employee.assignment_status} />
      </div>
    </div>
  )
}

export default function EmployeeList() {
  const navigate = useNavigate()
  
  // State
  const [companies, setCompanies] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all', 'idle', or company id
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [companiesSearchTerm, setCompaniesSearchTerm] = useState('')

  // Initial data load
  useEffect(() => {
    loadCompanies()
    loadEmployees()
  }, [])

  // Reload employees when category changes
  useEffect(() => {
    loadEmployees()
  }, [selectedCategory])

  const loadCompanies = async () => {
    try {
      const data = await api.getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Firmalar yüklenirken hata:', error)
    }
  }

  const loadEmployees = async () => {
    setLoading(true)
    try {
      let data
      if (selectedCategory === 'idle') {
        data = await api.getIdleEmployees()
      } else if (selectedCategory === 'all') {
        data = await api.getEmployees()
      } else {
        data = await api.getEmployees(selectedCategory)
      }
      setEmployees(data)
    } catch (error) {
      console.error('Personeller yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter companies for sidebar search
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companiesSearchTerm.toLowerCase()) ||
    c.company_code.toLowerCase().includes(companiesSearchTerm.toLowerCase())
  )

  // Filter employees by search and status
  const filteredEmployees = employees.filter(emp => {
    const nameMatch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const roleMatch = emp.title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSearch = nameMatch || roleMatch
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Count idle employees
  const idleCount = employees.filter(e => e.assignment_status === 'idle').length

  const handleWizardComplete = () => {
    loadEmployees()
    setShowAddModal(false)
  }

  const getCategoryTitle = () => {
    if (selectedCategory === 'all') return 'Tüm Personeller'
    if (selectedCategory === 'idle') return 'Boşta Personeller'
    const company = companies.find(c => c.id === Number(selectedCategory))
    return company ? company.name : 'Personeller'
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Personel Yönetimi</h1>
          <p className="text-theme-text-muted mt-1">Tüm personelleri görüntüle ve yönet</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors"
        >
          <Plus size={18} />
          Yeni Personel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Category Selection */}
        <div className="lg:col-span-1 bg-theme-bg-secondary rounded-xl border border-theme-border-primary overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-theme-border-primary bg-theme-bg-hover">
            <h3 className="font-semibold text-theme-text-secondary mb-2">Kategoriler</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Firma ara..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary placeholder-theme-text-placeholder focus:outline-none focus:border-accent"
                value={companiesSearchTerm}
                onChange={e => setCompaniesSearchTerm(e.target.value)}
              />
              <Search size={16} className="absolute left-3 top-2.5 text-theme-text-muted" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* All Employees */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-accent/20 text-accent-light font-medium'
                  : 'text-theme-text-tertiary hover:bg-theme-bg-hover'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                 selectedCategory === 'all' ? 'bg-accent' : 'bg-theme-bg-tertiary'
              }`}>
                <Users size={16} className={selectedCategory === 'all' ? 'text-white' : 'text-theme-text-muted'} />
              </div>
              <div className="flex-1">
                <p>Tüm Personeller</p>
              </div>
            </button>

            {/* Idle Employees */}
            <button
              onClick={() => setSelectedCategory('idle')}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                selectedCategory === 'idle'
                  ? 'bg-amber-500/20 text-amber-400 font-medium'
                  : 'text-theme-text-tertiary hover:bg-theme-bg-hover'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                 selectedCategory === 'idle' ? 'bg-amber-500' : 'bg-theme-bg-tertiary'
              }`}>
                <UserX size={16} className={selectedCategory === 'idle' ? 'text-white' : 'text-theme-text-muted'} />
              </div>
              <div className="flex-1">
                <p>Boşta Personeller</p>
                <p className="text-xs opacity-70">Firmaya atanmamış</p>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-theme-border-primary my-2"></div>
            <p className="px-3 py-1 text-xs text-theme-text-placeholder uppercase">Firmalar</p>

            {/* Company List */}
            {filteredCompanies.map(company => (
              <button
                key={company.id}
                onClick={() => setSelectedCategory(company.id)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                  selectedCategory === company.id
                    ? 'bg-accent/20 text-accent-light font-medium'
                    : 'text-theme-text-tertiary hover:bg-theme-bg-hover'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                   selectedCategory === company.id ? 'bg-accent' : 'bg-theme-bg-tertiary'
                }`}>
                  <Building2 size={16} className={selectedCategory === company.id ? 'text-white' : 'text-theme-text-muted'} />
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate">{company.name}</p>
                  <p className="text-xs opacity-70">{company.company_code}</p>
                </div>
                <ChevronRight size={16} className="text-theme-text-placeholder" />
              </button>
            ))}
            
            {filteredCompanies.length === 0 && (
              <p className="text-center text-sm text-theme-text-muted py-4">Firma bulunamadı</p>
            )}
          </div>
        </div>

        {/* Main Content - Employee List */}
        <div className="lg:col-span-3">
          <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary p-6">
            {/* Content Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Users size={24} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-theme-text-primary">{getCategoryTitle()}</h2>
                  <p className="text-theme-text-muted">{filteredEmployees.length} personel</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary placeholder-dark-500 focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-theme-text-muted" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-secondary focus:outline-none focus:border-accent"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                  <option value="archived">Arşivlenmiş</option>
                </select>
              </div>
            </div>

            {/* Info Banner for Idle view */}
            {selectedCategory === 'idle' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                <p className="text-amber-400 text-sm">
                  <strong>Boşta personeller:</strong> Bu personeller henüz bir firmaya atanmamış. 
                  Personel detay sayfasından veya firma detay sayfasından atama yapabilirsiniz.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : (
              <>
                {/* Employee Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEmployees.map(employee => (
                    <EmployeeCard 
                      key={employee.id} 
                      employee={employee} 
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-16">
                    <Users size={48} className="text-theme-text-placeholder mx-auto mb-4" />
                    <p className="text-theme-text-tertiary">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Aramanızla eşleşen personel bulunamadı.' 
                        : selectedCategory === 'idle'
                          ? 'Boşta personel bulunmuyor.'
                          : 'Henüz personel eklenmemiş.'}
                    </p>
                    {selectedCategory !== 'idle' && !searchTerm && (
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 px-4 py-2 bg-accent rounded-lg text-white"
                      >
                        Personel Ekle
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Employee Wizard - company is optional now */}
      <AddEmployeeWizard 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        company={null}
        onComplete={handleWizardComplete}
      />
    </div>
  )
}
