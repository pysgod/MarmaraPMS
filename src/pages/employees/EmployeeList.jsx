import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Building2,
  AlertCircle
} from 'lucide-react'

export default function EmployeeList() {
  const navigate = useNavigate()
  const { employees, selectedCompany, hasCompanyContext, addEmployee } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEmployee, setNewEmployee] = useState({ name: '', phone: '', role: '', status: 'active' })
  const [saving, setSaving] = useState(false)

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
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddEmployee = async () => {
    if (!newEmployee.name) return
    setSaving(true)
    try {
      await addEmployee({
        ...newEmployee,
        company_id: selectedCompany.id
      })
      setShowAddModal(false)
      setNewEmployee({ name: '', phone: '', role: '', status: 'active' })
    } catch (error) {
      console.error('Add employee error:', error)
    }
    setSaving(false)
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
                  {employee.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-100 group-hover:text-accent transition-colors truncate">
                  {employee.name}
                </h3>
                <p className="text-sm text-dark-400 mt-0.5">{employee.role || 'Belirsiz'}</p>
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
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {employee.status === 'active' ? 'Aktif' : 'Pasif'}
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl w-full max-w-md border border-dark-700">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-semibold text-dark-100">Yeni Çalışan Ekle</h2>
              <p className="text-sm text-dark-400 mt-1">{selectedCompany.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">Ad Soyad *</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="Çalışan adı"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Telefon</label>
                <input
                  type="text"
                  value={newEmployee.phone}
                  onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="+90 5XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Görev</label>
                <input
                  type="text"
                  value={newEmployee.role}
                  onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="Güvenlik Görevlisi"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Durum</label>
                <select
                  value={newEmployee.status}
                  onChange={e => setNewEmployee({ ...newEmployee, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                >
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-dark-300 hover:text-dark-100 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={!newEmployee.name || saving}
                className="px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
