import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Building2, FolderKanban, Search, Calendar, ChevronRight, Users, Settings } from 'lucide-react'
import ShiftTypeManager from './projects/ShiftTypeManager'

export default function Shifts() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [editingProject, setEditingProject] = useState(null) // projectId for ShiftTypeManager

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompanyId) {
      loadProjects(selectedCompanyId)
    }
  }, [selectedCompanyId])

  const loadCompanies = async () => {
    try {
      const data = await api.getCompanies()
      setCompanies(data.filter(c => c.status === 'active'))
    } catch (error) {
      console.error('Firmalar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async (companyId) => {
    setLoadingProjects(true)
    try {
      const data = await api.getProjects(companyId)
      setProjects(data.filter(p => p.status === 'active'))
    } catch (error) {
      console.error('Projeler yüklenirken hata:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCompany = companies.find(c => c.id === Number(selectedCompanyId))

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}?tab=vardiya`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Vardiya Yönetimi</h1>
          <p className="text-theme-text-muted mt-1">Proje bazlı çalışma çizelgesi ve vardiya ayarları</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Firma Seçimi Sidebar */}
        <div className="lg:col-span-1 bg-theme-bg-secondary rounded-xl border border-theme-border-primary overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-theme-border-primary bg-theme-bg-hover">
            <h3 className="font-semibold text-theme-text-secondary mb-2">
              <Building2 size={16} className="inline mr-2" />
              Firmalar
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Firma ara..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg text-theme-text-primary placeholder-theme-text-placeholder focus:outline-none focus:border-accent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="absolute left-3 top-2.5 text-theme-text-muted" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredCompanies.map(company => (
              <button
                key={company.id}
                onClick={() => setSelectedCompanyId(company.id)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                  selectedCompanyId === company.id
                    ? 'bg-accent/20 text-accent-light font-medium'
                    : 'text-theme-text-tertiary hover:bg-theme-bg-hover'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                   selectedCompanyId === company.id ? 'bg-accent' : 'bg-theme-bg-tertiary'
                }`}>
                  <Building2 size={16} className={selectedCompanyId === company.id ? 'text-white' : 'text-theme-text-muted'} />
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate">{company.name}</p>
                  <p className="text-xs opacity-70">{company.company_code}</p>
                </div>
                <ChevronRight size={16} className="text-theme-text-muted" />
              </button>
            ))}
            {filteredCompanies.length === 0 && (
              <p className="text-center text-sm text-theme-text-muted py-4">Aktif firma bulunamadı</p>
            )}
          </div>
        </div>

        {/* Projeler */}
        <div className="lg:col-span-3">
          {selectedCompanyId ? (
            <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-theme-border-primary">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <FolderKanban size={24} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-theme-text-primary">{selectedCompany?.name}</h2>
                  <p className="text-theme-text-muted">Proje seçimi ve vardiya ayarları</p>
                </div>
              </div>

              {loadingProjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className="flex flex-col p-4 rounded-lg border border-theme-border-secondary bg-theme-bg-tertiary hover:border-accent/50 transition-all group relative"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Calendar size={20} className="text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-theme-text-primary">
                            {project.name}
                          </h3>
                          <p className="text-xs text-theme-text-muted mt-1 flex items-center gap-2">
                            <Users size={12} />
                            {project.employeeCount || 0} Personel
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={() => handleProjectClick(project.id)}
                          className="flex-1 bg-accent/10 hover:bg-accent hover:text-white text-accent rounded px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Calendar size={14} />
                          Çizelgeyi Aç
                        </button>
                        <button
                          onClick={() => setEditingProject(project.id)}
                          className="bg-theme-bg-elevated hover:bg-theme-bg-hover text-theme-text-secondary hover:text-theme-text-primary rounded px-3 py-2 text-sm font-medium transition-colors border border-theme-border-secondary flex items-center justify-center"
                          title="Vardiya Tiplerini Düzenle"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderKanban size={48} className="mx-auto text-theme-text-placeholder mb-3" />
                  <p className="text-theme-text-secondary font-medium">Aktif proje bulunamadı</p>
                  <p className="text-sm text-theme-text-muted mt-1">Bu firmada aktif proje yok.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary p-12 text-center h-full flex flex-col items-center justify-center text-theme-text-muted">
              <Building2 size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-theme-text-secondary mb-2">Firma Seçin</h3>
              <p>Projeleri görüntülemek için soldaki listeden bir firma seçin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Vardiya Tipi Düzenleme Modalı */}
      {editingProject && (
        <ShiftTypeManager
          projectId={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdate={() => {
             // Refresh functionality if needed (e.g. if we showed summary stats)
          }}
        />
      )}
    </div>
  )
}
