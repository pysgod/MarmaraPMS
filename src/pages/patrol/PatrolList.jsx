import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Plus, 
  Search, 
  Filter,
  Shield,
  Building2,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react'

function PatrolCard({ patrol, onView }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const statusConfig = {
    active: { icon: Clock, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aktif', iconColor: 'text-green-400' },
    pending: { icon: AlertCircle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Bekliyor', iconColor: 'text-amber-400' },
    completed: { icon: CheckCircle, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Tamamlandı', iconColor: 'text-blue-400' },
  }
  
  const status = statusConfig[patrol.status]
  const StatusIcon = status.icon

  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          patrol.status === 'active' ? 'bg-green-500/10' : 
          patrol.status === 'completed' ? 'bg-blue-500/10' : 'bg-amber-500/10'
        }`}>
          <StatusIcon size={24} className={status.iconColor} />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={18} className="text-dark-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-dark-700 border border-dark-600 rounded-xl shadow-xl overflow-hidden z-10 animate-fadeIn">
              <button 
                onClick={() => { onView(patrol); setShowMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors"
              >
                <Eye size={16} />
                Görüntüle
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors">
                <Edit size={16} />
                Düzenle
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-600 transition-colors">
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-dark-50 mb-3">{patrol.name}</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <User size={14} />
          <span>{patrol.assignee}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <Building2 size={14} />
          <span>{patrol.company}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <MapPin size={14} />
          <span>{patrol.location}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <Clock size={14} />
          <span>{patrol.time}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
        <button 
          onClick={() => onView(patrol)}
          className="text-sm text-accent hover:text-accent-light transition-colors"
        >
          Detaylar →
        </button>
      </div>
    </div>
  )
}

export default function PatrolList() {
  const navigate = useNavigate()
  const { patrols, selectedCompany } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredPatrols = patrols.filter(patrol => {
    const matchesSearch = patrol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patrol.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || patrol.status === statusFilter
    const matchesCompany = !selectedCompany || patrol.company === selectedCompany.name
    return matchesSearch && matchesStatus && matchesCompany
  })

  const handleView = (patrol) => {
    navigate(`/patrol/${patrol.id}`)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Devriye</h1>
          <p className="text-dark-400 mt-1">
            {selectedCompany ? `${selectedCompany.name} devriyeleri` : 'Tüm devriyeleri yönetin'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <Plus size={18} />
          Yeni Devriye Oluştur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-dark-50">{patrols.length}</p>
          <p className="text-xs text-dark-400">Toplam Devriye</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-green-400">{patrols.filter(p => p.status === 'active').length}</p>
          <p className="text-xs text-dark-400">Aktif</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-amber-400">{patrols.filter(p => p.status === 'pending').length}</p>
          <p className="text-xs text-dark-400">Bekliyor</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-blue-400">{patrols.filter(p => p.status === 'completed').length}</p>
          <p className="text-xs text-dark-400">Tamamlandı</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-800 rounded-xl p-4 border border-dark-700">
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              placeholder="Devriye veya personel ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg
                text-dark-100 placeholder-dark-400 text-sm
                focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="pending">Bekliyor</option>
            <option value="completed">Tamamlandı</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-300 text-sm hover:bg-dark-600 transition-colors">
            <Calendar size={16} />
            Tarih Seç
          </button>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-dark-400">
        {filteredPatrols.length} devriye bulundu
      </p>

      {/* Patrol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatrols.map(patrol => (
          <PatrolCard 
            key={patrol.id} 
            patrol={patrol} 
            onView={handleView}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPatrols.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <Shield size={48} className="text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">Devriye bulunamadı</h3>
          <p className="text-dark-400 mb-6">Arama kriterlerinize uygun devriye bulunamadı.</p>
          <button className="px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium">
            Yeni Devriye Oluştur
          </button>
        </div>
      )}
    </div>
  )
}
