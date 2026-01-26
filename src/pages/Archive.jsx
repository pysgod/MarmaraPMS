import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import api from '../services/api'
import { 
  Building2, 
  Calendar, 
  Search, 
  Filter,
  History,
  FileText,
  User,
  ArrowRight,
  Briefcase
} from 'lucide-react'

export default function Archive() {
  const { companies } = useApp()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    companyId: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchHistory()
  }, []) // Initial load

  const fetchHistory = async () => {
    setLoading(true)
    try {
      // Remove empty filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      )
      
      const data = await api.getHistory(activeFilters)
      setHistory(data)
    } catch (error) {
      console.error('History fetch error:', error)
    }
    setLoading(false)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchHistory()
  }

  const formatAction = (action) => {
    switch (action) {
      case 'assigned_to_company':
        return { label: 'Firmaya Atandı', color: 'text-blue-400 bg-blue-500/10' }
      case 'removed_from_company':
        return { label: 'Firmadan Çıkarıldı', color: 'text-red-400 bg-red-500/10' }
      case 'assigned_to_project':
        return { label: 'Projeye Atandı', color: 'text-green-400 bg-green-500/10' }
      case 'removed_from_project':
        return { label: 'Projeden Çıkarıldı', color: 'text-amber-400 bg-amber-500/10' }
      default:
        return { label: action, color: 'text-theme-text-muted bg-dark-500/10' }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Personel Arşivi</h1>
          <p className="text-theme-text-muted mt-1">Personel hareketleri ve geçmiş kayıtları</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-theme-bg-tertiary flex items-center justify-center">
          <History size={20} className="text-theme-text-tertiary" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-theme-bg-secondary rounded-xl p-4 border border-theme-border-primary">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-theme-text-tertiary mb-2">Firma</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
              <select
                value={filters.companyId}
                onChange={e => handleFilterChange('companyId', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent appearance-none"
              >
                <option value="">Tüm Firmalar</option>
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-theme-text-tertiary mb-2">Başlangıç Tarihi</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
              <input
                type="date"
                value={filters.startDate}
                onChange={e => handleFilterChange('startDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-theme-text-tertiary mb-2">Bitiş Tarihi</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
              <input
                type="date"
                value={filters.endDate}
                onChange={e => handleFilterChange('endDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="px-6 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Search size={18} />
            Filtrele
          </button>
        </form>
      </div>

      {/* History List */}
      <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-theme-text-muted">Yükleniyor...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center">
            <History size={48} className="text-dark-600 mx-auto mb-4" />
            <p className="text-theme-text-tertiary text-lg">Kayıt Bulunamadı</p>
            <p className="text-theme-text-placeholder text-sm mt-1">Seçilen kriterlere uygun geçmiş kaydı yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-theme-border-primary text-theme-text-muted text-sm">
                  <th className="p-4 font-medium">Tarih</th>
                  <th className="p-4 font-medium">Personel</th>
                  <th className="p-4 font-medium">İşlem</th>
                  <th className="p-4 font-medium">Firma / Proje</th>
                  <th className="p-4 font-medium">Notlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {history.map(item => {
                  const actionStyle = formatAction(item.action)
                  return (
                    <tr key={item.id} className="hover:bg-theme-bg-tertiary/30 transition-colors">
                      <td className="p-4 text-theme-text-tertiary whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(item.performed_at).toLocaleDateString('tr-TR')}
                          <span className="text-theme-text-placeholder ml-1">
                            {new Date(item.performed_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                           <User size={16} className="text-theme-text-muted" />
                           <span className="text-theme-text-primary font-medium">
                             {item.employee ? `${item.employee.first_name} ${item.employee.last_name}` : 'Silinmiş Personel'}
                           </span>
                         </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${actionStyle.color}`}>
                          {actionStyle.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {item.company && (
                            <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
                              <Building2 size={14} className="text-theme-text-muted" />
                              {item.company.name}
                            </div>
                          )}
                          {item.project && (
                            <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
                              <Briefcase size={14} className="text-theme-text-muted" />
                              {item.project.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-theme-text-muted max-w-md break-words whitespace-normal">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
