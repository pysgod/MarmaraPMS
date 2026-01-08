import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
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
  const { projects, selectedCompany, hasCompanyContext, addProject, employees } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    status: 'pending',
    start_date: '',
    end_date: ''
  })
  const [saving, setSaving] = useState(false)

  // Require company context
  if (!hasCompanyContext) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={64} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-semibold text-dark-200 mb-2">Firma Seçimi Gerekli</h2>
        <p className="text-dark-400 mb-6 text-center">
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

  const handleAddProject = async () => {
    if (!newProject.name) return
    setSaving(true)
    try {
      await addProject({
        ...newProject,
        company_id: selectedCompany.id
      })
      setShowAddModal(false)
      setNewProject({ name: '', description: '', status: 'pending', start_date: '', end_date: '' })
    } catch (error) {
      alert('Hata: ' + error.message)
    }
    setSaving(false)
  }

  const statusConfig = {
    active: { label: 'Aktif', color: 'bg-green-500/20 text-green-400' },
    pending: { label: 'Bekliyor', color: 'bg-amber-500/20 text-amber-400' },
    completed: { label: 'Tamamlandı', color: 'bg-blue-500/20 text-blue-400' },
    cancelled: { label: 'İptal', color: 'bg-red-500/20 text-red-400' },
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Projeler</h1>
          <p className="text-dark-400 mt-1">
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
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Proje ara..."
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
            <option value="pending">Bekliyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => (
          <div 
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-dark-800 rounded-xl p-5 border border-dark-700 hover:border-accent/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                  <FolderKanban size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-100 group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[project.status]?.color}`}>
                {statusConfig[project.status]?.label}
              </span>
            </div>
            
            <p className="text-sm text-dark-400 mb-4 line-clamp-2">
              {project.description || 'Açıklama yok'}
            </p>

            {(project.start_date || project.end_date) && (
              <div className="flex items-center gap-2 text-xs text-dark-500 mb-4">
                <Calendar size={12} />
                <span>
                  {project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : '?'} - {project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR') : '?'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-dark-700">
              <div className="flex items-center gap-1.5 text-sm text-dark-400">
                <Users size={14} />
                <span>{project.employeeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-dark-400">
                <Shield size={14} />
                <span>{project.patrolCount || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <FolderKanban size={48} className="text-dark-500 mx-auto mb-4" />
          <p className="text-dark-300">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aramanızla eşleşen proje bulunamadı.' 
              : 'Henüz proje eklenmemiş.'}
          </p>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl w-full max-w-md border border-dark-700">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-semibold text-dark-100">Yeni Proje Ekle</h2>
              <p className="text-sm text-dark-400 mt-1">{selectedCompany.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">Proje Adı *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="Proje adı"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Açıklama</label>
                <textarea
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent resize-none"
                  rows={3}
                  placeholder="Proje açıklaması"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Başlangıç</label>
                  <input
                    type="date"
                    value={newProject.start_date}
                    onChange={e => setNewProject({ ...newProject, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Bitiş</label>
                  <input
                    type="date"
                    value={newProject.end_date}
                    onChange={e => setNewProject({ ...newProject, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Durum</label>
                <select
                  value={newProject.status}
                  onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
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
                onClick={handleAddProject}
                disabled={!newProject.name || saving}
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
