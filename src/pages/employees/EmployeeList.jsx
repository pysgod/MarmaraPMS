import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import AddEmployeeWizard from './AddEmployeeWizard'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  AlertCircle
} from 'lucide-react'

export default function EmployeeList() {
  const navigate = useNavigate()
  const { employees, selectedCompany, hasCompanyContext, getEmployees } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Require company context
  if (!hasCompanyContext) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={64} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-semibold text-dark-200 mb-2">Firma Seçimi Gerekli</h2>
        <p className="text-dark-400 mb-6 text-center">
          Çalışanları görüntülemek için önce bir firma seçmelisiniz.
        </p>
        <button 
          onClick={() => navigate('/companies')}
          className="px-5 py-2.5 bg-accent rounded-lg text-white"
        >
          Firma Seç
        </button>
      </div>
    )
  }

  const filteredEmployees = employees.filter(emp => {
    // Search in name, surname, or deprecated name field
    const nameMatch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const roleMatch = emp.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      emp.role?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSearch = nameMatch || roleMatch
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleWizardComplete = () => {
    // Refresh list logic
    if (getEmployees && selectedCompany) {
      getEmployees(selectedCompany.id)
    } else {
       window.location.reload()
    }
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Çalışanlar</h1>
          <p className="text-dark-400 mt-1">
            {selectedCompany.name} - {employees.length} çalışan
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors"
        >
          <Plus size={18} />
          Yeni Çalışan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Çalışan ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-dark-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-dark-200 focus:outline-none focus:border-accent"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="passive">Pasif</option>
            <option value="archived">Arşivlenmiş</option>
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(employee => (
          <div 
            key={employee.id}
            onClick={() => navigate(`/employees/${employee.id}`)}
            className="bg-dark-800 rounded-xl p-5 border border-dark-700 hover:border-accent/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {employee.first_name ? employee.first_name[0] : (employee.name ? employee.name[0] : '?')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-100 group-hover:text-accent transition-colors truncate">
                  {employee.first_name ? `${employee.first_name} ${employee.last_name}` : employee.name}
                </h3>
                <p className="text-sm text-dark-400 mt-0.5">{employee.title || employee.role || 'Unvan Belirtilmemiş'}</p>
                {employee.phone && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-dark-400">
                    <Phone size={12} />
                    <span>{employee.phone}</span>
                  </div>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                employee.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : employee.status === 'passive'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-gray-500/20 text-gray-400'
              }`}>
                {employee.status === 'active' ? 'Aktif' : (employee.status === 'passive' ? 'Pasif' : 'Arşiv')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <Users size={48} className="text-dark-500 mx-auto mb-4" />
          <p className="text-dark-300">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aramanızla eşleşen çalışan bulunamadı.' 
              : 'Henüz çalışan eklenmemiş.'}
          </p>
        </div>
      )}

      {/* Add Employee Wizard */}
      <AddEmployeeWizard 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        company={selectedCompany}
        onComplete={handleWizardComplete}
      />
    </div>
  )
}
