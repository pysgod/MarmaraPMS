import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Plus, 
  Search, 
  Filter,
  FolderKanban,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  Archive,
  Trash2,
  Grid,
  List,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

function ProjectCard({ project, onView }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const statusConfig = {
    active: { icon: Clock, color: 'bg-green-500/20 text-green-400', label: 'Aktif' },
    pending: { icon: AlertCircle, color: 'bg-amber-500/20 text-amber-400', label: 'Bekliyor' },
    completed: { icon: CheckCircle, color: 'bg-blue-500/20 text-blue-400', label: 'Tamamlandı' },
  }
  
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
          <FolderKanban size={24} className="text-green-400" />
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
                onClick={() => { onView(project); setShowMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors"
              >
                <Eye size={16} />
                Görüntüle
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors">
                <Edit size={16} />
                Düzenle
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-400 hover:bg-dark-600 transition-colors">
                <Archive size={16} />
                Arşive Taşı
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-600 transition-colors">
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-dark-50 mb-1">{project.name}</h3>
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-4">
        <Building2 size={14} />
        <span>{project.company}</span>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 bg-dark-700 rounded-md text-xs text-dark-300">
          {project.category}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-dark-400">İlerleme</span>
          <span className="text-dark-200 font-medium">{project.progress}%</span>
        </div>
        <div className="relative h-2 bg-dark-700 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
        <button 
          onClick={() => onView(project)}
          className="text-sm text-accent hover:text-accent-light transition-colors"
        >
          Detaylar →
        </button>
      </div>
    </div>
  )
}

export default function ProjectList() {
  const navigate = useNavigate()
  const { projects, selectedCompany } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    const matchesCompany = !selectedCompany || project.company === selectedCompany.name
    return matchesSearch && matchesStatus && matchesCategory && matchesCompany
  })

  const categories = [...new Set(projects.map(p => p.category))]

  const handleView = (project) => {
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Projeler</h1>
          <p className="text-dark-400 mt-1">
            {selectedCompany ? `${selectedCompany.name} projeleri` : 'Tüm projeleri yönetin'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <Plus size={18} />
          Yeni Proje Oluştur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-dark-50">{projects.length}</p>
          <p className="text-xs text-dark-400">Toplam Proje</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-green-400">{projects.filter(p => p.status === 'active').length}</p>
          <p className="text-xs text-dark-400">Aktif</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-amber-400">{projects.filter(p => p.status === 'pending').length}</p>
          <p className="text-xs text-dark-400">Bekliyor</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-blue-400">{projects.filter(p => p.status === 'completed').length}</p>
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
              placeholder="Proje ara..."
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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
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
        {filteredProjects.length} proje bulundu
      </p>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onView={handleView}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <FolderKanban size={48} className="text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">Proje bulunamadı</h3>
          <p className="text-dark-400 mb-6">Arama kriterlerinize uygun proje bulunamadı.</p>
          <button className="px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium">
            Yeni Proje Oluştur
          </button>
        </div>
      )}
    </div>
  )
}
