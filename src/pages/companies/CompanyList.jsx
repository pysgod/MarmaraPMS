import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Building2,
  Users,
  FolderKanban,
  Edit,
  Archive,
  Trash2,
  Eye,
  Grid,
  List
} from 'lucide-react'

function CompanyCard({ company, onView, onEdit }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    passive: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    archived: 'bg-dark-500/20 text-dark-400 border-dark-500/30',
  }

  const statusLabels = {
    active: 'Aktif',
    passive: 'Pasif',
    archived: 'Arşiv',
  }

  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
          <Building2 size={24} className="text-accent" />
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
                onClick={() => { onView(company); setShowMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors"
              >
                <Eye size={16} />
                Görüntüle
              </button>
              <button 
                onClick={() => { onEdit(company); setShowMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors"
              >
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
      
      <h3 className="text-lg font-semibold text-dark-50 mb-1">{company.name}</h3>
      <p className="text-sm text-dark-400 mb-4">{company.code}</p>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-dark-300">
          <Users size={14} />
          <span className="text-sm">{company.personnel}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-300">
          <FolderKanban size={14} />
          <span className="text-sm">{company.projects}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[company.status]}`}>
          {statusLabels[company.status]}
        </span>
        <button 
          onClick={() => onView(company)}
          className="text-sm text-accent hover:text-accent-light transition-colors"
        >
          Detaylar →
        </button>
      </div>
    </div>
  )
}

function CompanyRow({ company, onView, onEdit }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    passive: 'bg-amber-500/20 text-amber-400',
    archived: 'bg-dark-500/20 text-dark-400',
  }

  const statusLabels = {
    active: 'Aktif',
    passive: 'Pasif',
    archived: 'Arşiv',
  }

  return (
    <tr className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Building2 size={18} className="text-accent" />
          </div>
          <div>
            <p className="font-medium text-dark-100">{company.name}</p>
            <p className="text-xs text-dark-400">{company.code}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-dark-300">{company.personnel}</td>
      <td className="py-4 px-4 text-dark-300">{company.projects}</td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[company.status]}`}>
          {statusLabels[company.status]}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="relative inline-block">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <MoreVertical size={18} className="text-dark-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-dark-700 border border-dark-600 rounded-xl shadow-xl overflow-hidden z-10 animate-fadeIn">
              <button 
                onClick={() => { onView(company); setShowMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors"
              >
                <Eye size={16} />
                Görüntüle
              </button>
              <button 
                onClick={() => { onEdit(company); setShowMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors"
              >
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
      </td>
    </tr>
  )
}

export default function CompanyList() {
  const navigate = useNavigate()
  const { companies, setSelectedCompany } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleView = (company) => {
    setSelectedCompany(company)
    navigate(`/companies/${company.id}`)
  }

  const handleEdit = (company) => {
    navigate(`/companies/${company.id}/edit`)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Firmalar</h1>
          <p className="text-dark-400 mt-1">Tüm firmaları yönetin ve görüntüleyin</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <Plus size={18} />
          Yeni Firma Ekle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-800 rounded-xl p-4 border border-dark-700">
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              placeholder="Firma ara..."
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
            <option value="archived">Arşivlenmiş</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-300 text-sm hover:bg-dark-600 transition-colors">
            <Filter size={16} />
            İleri Filtre
          </button>
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

      {/* Results Count */}
      <p className="text-sm text-dark-400">
        {filteredCompanies.length} firma bulundu
      </p>

      {/* Company Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map(company => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              onView={handleView}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-700/50">
                <th className="text-left py-4 px-4 text-sm font-medium text-dark-300">Firma</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-dark-300">Personel</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-dark-300">Projeler</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-dark-300">Durum</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-dark-300">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => (
                <CompanyRow 
                  key={company.id} 
                  company={company} 
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <Building2 size={48} className="text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">Firma bulunamadı</h3>
          <p className="text-dark-400 mb-6">Arama kriterlerinize uygun firma bulunamadı.</p>
          <button className="px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium">
            Yeni Firma Ekle
          </button>
        </div>
      )}
    </div>
  )
}
