import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Users,
  FolderKanban,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2
} from 'lucide-react'

export default function PatrolList() {
  const navigate = useNavigate()
  const { patrols, projects, employees, selectedCompany, hasCompanyContext, addPatrol } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPatrol, setNewPatrol] = useState({ 
    name: '', 
    description: '', 
    project_id: '',
    status: 'active'
  })
  const [saving, setSaving] = useState(false)

  // Require company context
  if (!hasCompanyContext) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={64} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-semibold text-theme-text-secondary mb-2">Firma Seçimi Gerekli</h2>
        <p className="text-theme-text-muted mb-6 text-center">
          Devriyeleri görüntülemek için önce bir firma seçmelisiniz.
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

  const filteredPatrols = patrols.filter(patrol => {
    const matchesSearch = patrol.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patrol.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || patrol.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddPatrol = async () => {
    if (!newPatrol.name || !newPatrol.project_id) return
    setSaving(true)
    try {
      await addPatrol({
        ...newPatrol,
        company_id: selectedCompany.id
      })
      setShowAddModal(false)
      setNewPatrol({ name: '', description: '', project_id: '', status: 'active' })
    } catch (error) {
      alert('Hata: ' + error.message)
    }
    setSaving(false)
  }

  const statusConfig = {
    active: { icon: Clock, label: 'Aktif', color: 'bg-green-500/20 text-green-400' },
    inactive: { icon: AlertCircle, label: 'Pasif', color: 'bg-amber-500/20 text-amber-400' },
    completed: { icon: CheckCircle, label: 'Tamamlandı', color: 'bg-blue-500/20 text-blue-400' },
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Devriyeler</h1>
          <p className="text-theme-text-muted mt-1">
            {selectedCompany.name} - {patrols.length} devriye
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors"
        >
          <Plus size={18} />
          Yeni Devriye
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Devriye ara..."
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
            <option value="inactive">Pasif</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>
      </div>

      {/* Patrol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatrols.map(patrol => {
          const status = statusConfig[patrol.status] || statusConfig.active
          const StatusIcon = status.icon
          return (
            <div 
              key={patrol.id}
              onClick={() => navigate(`/patrol/${patrol.id}`)}
              className="bg-theme-bg-secondary rounded-xl p-5 border border-theme-border-primary hover:border-accent/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-theme-bg-tertiary flex items-center justify-center">
                    <StatusIcon size={20} className={status.color.split(' ')[1]} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-text-primary group-hover:text-accent transition-colors">
                      {patrol.name}
                    </h3>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              <p className="text-sm text-theme-text-muted mb-4 line-clamp-2">
                {patrol.description || 'Açıklama yok'}
              </p>

              <div className="flex items-center gap-2 text-xs text-theme-text-placeholder mb-4">
                <FolderKanban size={12} />
                <span>{patrol.project?.name || 'Proje atanmamış'}</span>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-theme-border-primary">
                <div className="flex items-center gap-1.5 text-sm text-theme-text-muted">
                  <Users size={14} />
                  <span>{patrol.assignments?.length || 0} atama</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredPatrols.length === 0 && (
        <div className="text-center py-16 bg-theme-bg-secondary rounded-xl border border-theme-border-primary">
          <Shield size={48} className="text-theme-text-placeholder mx-auto mb-4" />
          <p className="text-theme-text-tertiary">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aramanızla eşleşen devriye bulunamadı.' 
              : 'Henüz devriye eklenmemiş.'}
          </p>
        </div>
      )}

      {/* Add Patrol Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-bg-secondary rounded-2xl w-full max-w-md border border-theme-border-primary">
            <div className="p-6 border-b border-theme-border-primary">
              <h2 className="text-xl font-semibold text-theme-text-primary">Yeni Devriye Ekle</h2>
              <p className="text-sm text-theme-text-muted mt-1">{selectedCompany.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">Devriye Adı *</label>
                <input
                  type="text"
                  value={newPatrol.name}
                  onChange={e => setNewPatrol({ ...newPatrol, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                  placeholder="Devriye adı"
                />
              </div>
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">Proje *</label>
                <select
                  value={newPatrol.project_id}
                  onChange={e => setNewPatrol({ ...newPatrol, project_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">Seçiniz...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">Açıklama</label>
                <textarea
                  value={newPatrol.description}
                  onChange={e => setNewPatrol({ ...newPatrol, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent resize-none"
                  rows={3}
                  placeholder="Devriye açıklaması"
                />
              </div>
              <div>
                <label className="block text-sm text-theme-text-tertiary mb-2">Durum</label>
                <select
                  value={newPatrol.status}
                  onChange={e => setNewPatrol({ ...newPatrol, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-theme-border-primary flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-theme-text-tertiary hover:text-theme-text-primary transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddPatrol}
                disabled={!newPatrol.name || !newPatrol.project_id || saving}
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
