import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import AddProjectWizard from './AddProjectWizard'
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Shield,
  Calendar,
  Building2,
  AlertCircle
} from 'lucide-react'

export default function ProjectList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { projects, selectedCompany, hasCompanyContext, fetchCompanyData } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Refresh data on mount to ensure counts are up to date
  useEffect(() => {
    if (selectedCompany?.id) {
      fetchCompanyData(selectedCompany.id)
    }
  }, [])

  // Auto-open modal if ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true' && hasCompanyContext) {
      setShowAddModal(true)
      searchParams.delete('new')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, hasCompanyContext])


  // Require company context
  if (!hasCompanyContext) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={64} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-semibold text-theme-text-secondary mb-2">Firma Seçimi Gerekli</h2>
        <p className="text-theme-text-muted mb-6 text-center">
          Projeleri görüntülemek için önce bir firma seçmelisiniz.
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })



  const statusConfig = {
    active: { label: 'Aktif', color: 'bg-green-500/20 text-green-400' },
    pending: { label: 'Bekliyor', color: 'bg-amber-500/20 text-amber-400' },
    completed: { label: 'Tamamlandı', color: 'bg-blue-500/20 text-blue-400' },
    cancelled: { label: 'İptal', color: 'bg-red-500/20 text-red-400' },
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Projeler</h1>
          <p className="text-theme-text-muted mt-1">
            {selectedCompany.name} - {projects.length} proje
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors"
        >
          <Plus size={18} />
          Yeni Proje
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Proje ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-theme-bg-secondary border border-theme-border-primary rounded-lg text-theme-text-primary placeholder-dark-500 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-theme-text-muted" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-theme-bg-secondary border border-theme-border-primary rounded-lg text-theme-text-secondary focus:outline-none focus:border-accent"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="pending">Bekliyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {filteredProjects.map(project => (
          <div 
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-theme-bg-secondary h-min rounded-xl p-5 border border-theme-border-primary hover:border-accent/50 transition-all cursor-pointer group "
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                  <FolderKanban size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-text-primary group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[project.status]?.color}`}>
                {statusConfig[project.status]?.label}
              </span>
            </div>
            
            <p className="text-sm text-theme-text-muted mb-4 line-clamp-2">
              {project.description || 'Açıklama yok'}
            </p>

            {(project.start_date || project.end_date) && (
              <div className="flex items-center gap-2 text-xs text-theme-text-placeholder mb-4">
                <Calendar size={12} />
                <span>
                  {project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : '?'} - {project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR') : '?'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-theme-border-primary">
              <div className="flex items-center gap-1.5 text-sm text-theme-text-muted">
                <Users size={14} />
                <span>{project.employeeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-theme-text-muted">
                <Shield size={14} />
                <span>{project.patrolCount || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-theme-bg-secondary rounded-xl border border-theme-border-primary">
          <FolderKanban size={48} className="text-theme-text-placeholder mx-auto mb-4" />
          <p className="text-theme-text-tertiary">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aramanızla eşleşen proje bulunamadı.' 
              : 'Henüz proje eklenmemiş.'}
          </p>
        </div>
      )}

      {/* Add Project Wizard */}
      <AddProjectWizard 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        company={selectedCompany}
      />
    </div>
  )
}

