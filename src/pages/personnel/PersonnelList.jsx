import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Grid,
  List,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react'

function PersonnelCard({ person, onView }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">{person.name.split(' ').map(n => n[0]).join('')}</span>
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
                onClick={() => { onView(person); setShowMenu(false) }}
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
      
      <h3 className="text-lg font-semibold text-dark-50 mb-1">{person.name}</h3>
      <p className="text-sm text-accent mb-3">{person.role}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <Building2 size={14} />
          <span>{person.company}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <Mail size={14} />
          <span>{person.email}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          person.status === 'active' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-amber-500/20 text-amber-400'
        }`}>
          {person.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
          {person.status === 'active' ? 'Aktif' : 'Pasif'}
        </span>
        <button 
          onClick={() => onView(person)}
          className="text-sm text-accent hover:text-accent-light transition-colors"
        >
          Detaylar →
        </button>
      </div>
    </div>
  )
}

export default function PersonnelList() {
  const navigate = useNavigate()
  const { personnel, selectedCompany } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter
    const matchesRole = roleFilter === 'all' || person.role === roleFilter
    const matchesCompany = !selectedCompany || person.company === selectedCompany.name
    return matchesSearch && matchesStatus && matchesRole && matchesCompany
  })

  const roles = [...new Set(personnel.map(p => p.role))]

  const handleView = (person) => {
    navigate(`/personnel/${person.id}`)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Personeller</h1>
          <p className="text-dark-400 mt-1">
            {selectedCompany ? `${selectedCompany.name} personelleri` : 'Tüm personelleri yönetin'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <Plus size={18} />
          Yeni Personel Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-dark-50">{personnel.length}</p>
          <p className="text-xs text-dark-400">Toplam Personel</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-green-400">{personnel.filter(p => p.status === 'active').length}</p>
          <p className="text-xs text-dark-400">Aktif</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-amber-400">{personnel.filter(p => p.status === 'passive').length}</p>
          <p className="text-xs text-dark-400">Pasif</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-purple-400">{roles.length}</p>
          <p className="text-xs text-dark-400">Farklı Rol</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-800 rounded-xl p-4 border border-dark-700">
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              placeholder="Personel ara..."
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
            <option value="passive">Pasif</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">Tüm Roller</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-dark-600 text-accent' : 'text-dark-400 hover:text-dark-200'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-dark-600 text-accent' : 'text-dark-400 hover:text-dark-200'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-dark-400">
        {filteredPersonnel.length} personel bulundu
      </p>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.map(person => (
          <PersonnelCard 
            key={person.id} 
            person={person} 
            onView={handleView}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPersonnel.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <Users size={48} className="text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">Personel bulunamadı</h3>
          <p className="text-dark-400 mb-6">Arama kriterlerinize uygun personel bulunamadı.</p>
          <button className="px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium">
            Yeni Personel Ekle
          </button>
        </div>
      )}
    </div>
  )
}
