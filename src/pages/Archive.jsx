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
        return { label: action, color: 'text-dark-400 bg-dark-500/10' }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Personel Arşivi</h1>
          <p className="text-dark-400 mt-1">Personel hareketleri ve geçmiş kayıtları</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
          <History size={20} className="text-dark-300" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-dark-300 mb-2">Firma</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <select
                value={filters.companyId}
                onChange={e => handleFilterChange('companyId', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent appearance-none"
              >
                <option value="">Tüm Firmalar</option>
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-dark-300 mb-2">Başlangıç Tarihi</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="date"
                value={filters.startDate}
                onChange={e => handleFilterChange('startDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">Bitiş Tarihi</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="date"
                value={filters.endDate}
                onChange={e => handleFilterChange('endDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
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
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-dark-400">Yükleniyor...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center">
            <History size={48} className="text-dark-600 mx-auto mb-4" />
            <p className="text-dark-300 text-lg">Kayıt Bulunamadı</p>
            <p className="text-dark-500 text-sm mt-1">Seçilen kriterlere uygun geçmiş kaydı yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700 text-dark-400 text-sm">
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
                    <tr key={item.id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="p-4 text-dark-300 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(item.performed_at).toLocaleDateString('tr-TR')}
                          <span className="text-dark-500 ml-1">
                            {new Date(item.performed_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                           <User size={16} className="text-dark-400" />
                           <span className="text-dark-100 font-medium">
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
                            <div className="flex items-center gap-2 text-sm text-dark-200">
                              <Building2 size={14} className="text-dark-400" />
                              {item.company.name}
                            </div>
                          )}
                          {item.project && (
                            <div className="flex items-center gap-2 text-sm text-dark-200">
                              <Briefcase size={14} className="text-dark-400" />
                              {item.project.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-dark-400 max-w-xs truncate" title={item.notes}>
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
