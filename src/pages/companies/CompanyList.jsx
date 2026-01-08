import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useApp } from '../../context/AppContext'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  FolderKanban,
  Shield,
  MapPin
} from 'lucide-react'

export default function CompanyList() {
  const navigate = useNavigate()
  const { companies, setCompanyContext, addCompany } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCompany, setNewCompany] = useState({ 
    name: '', 
    company_code: '', 
    country: 'Türkiye', 
    city: '', 
    district: '',
    phone: '',
    fax: '',
    tax_office: '',
    tax_number: '',
    sgk_number: '',
    registration_date: new Date().toISOString().split('T')[0],
    status: 'active' 
  })
  const [saving, setSaving] = useState(false)

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.company_code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCompanyClick = (company) => {
    setCompanyContext(company)
    navigate(`/companies/${company.id}`)
  }

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.company_code || !newCompany.phone || !newCompany.city) return
    setSaving(true)
    try {
      await addCompany(newCompany)
      setShowAddModal(false)
      setNewCompany({ 
        name: '', 
        company_code: '', 
        country: 'Türkiye', 
        city: '', 
        district: '',
        phone: '',
        fax: '',
        tax_office: '',
        tax_number: '',
        sgk_number: '',
        registration_date: new Date().toISOString().split('T')[0],
        status: 'active' 
      })
    } catch (error) {
      alert('Hata: ' + error.message)
    }
    setSaving(false)
  }

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    passive: 'bg-amber-500/20 text-amber-400',
    archived: 'bg-dark-500/20 text-dark-400',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Firmalar</h1>
          <p className="text-dark-400 mt-1">Sistemdeki {companies.length} firma</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors"
        >
          <Plus size={18} />
          Yeni Firma
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Firma ara..."
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
            <option value="passive">Pasif</option>
            <option value="archived">Arşiv</option>
          </select>
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map(company => (
          <div 
            key={company.id}
            onClick={() => handleCompanyClick(company)}
            className="bg-dark-800 rounded-xl p-5 border border-dark-700 hover:border-accent/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                  <Building2 size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-100 group-hover:text-accent transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-sm text-dark-400">{company.company_code}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusColors[company.status]}`}>
                {company.status === 'active' ? 'Aktif' : company.status === 'passive' ? 'Pasif' : 'Arşiv'}
              </span>
            </div>
            
            {company.city && (
              <div className="flex items-center gap-2 text-sm text-dark-400 mb-4">
                <MapPin size={14} />
                <span>{company.city}, {company.country}</span>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-dark-700">
              <div className="flex items-center gap-1.5 text-sm text-dark-400">
                <Users size={14} />
                <span>{company.employeeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-dark-400">
                <FolderKanban size={14} />
                <span>{company.projectCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-dark-400">
                <Shield size={14} />
                <span>{company.patrolCount || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <Building2 size={48} className="text-dark-500 mx-auto mb-4" />
          <p className="text-dark-300">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aramanızla eşleşen firma bulunamadı.' 
              : 'Henüz firma eklenmemiş.'}
          </p>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-dark-800 rounded-2xl w-full max-w-3xl border border-dark-700 h-[80vh] flex flex-col relative animate-fadeIn">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-semibold text-dark-100">Genel Bilgiler</h2>
              <p className="text-sm text-dark-400 mt-1">Yeni Firma Ekle</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Firma Adı / Ünvanı */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">Firma Adı / Ünvanı *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="Firma adı veya ünvanı"
                />
              </div>
              
              {/* Firma Kodu */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">Firma Kodu *</label>
                <input
                  type="text"
                  value={newCompany.company_code}
                  onChange={e => setNewCompany({ ...newCompany, company_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  placeholder="MRM001"
                />
              </div>

              {/* Ülke / İl / İlçe */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Ülke *</label>
                  <input
                    type="text"
                    value={newCompany.country}
                    onChange={e => setNewCompany({ ...newCompany, country: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">İl *</label>
                  <input
                    type="text"
                    value={newCompany.city}
                    onChange={e => setNewCompany({ ...newCompany, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="İstanbul"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">İlçe *</label>
                  <input
                    type="text"
                    value={newCompany.district}
                    onChange={e => setNewCompany({ ...newCompany, district: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="Kadıköy"
                  />
                </div>
              </div>

              {/* Telefon / Fax */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Telefon Numarası *</label>
                  <input
                    type="tel"
                    value={newCompany.phone}
                    onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="0212 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Fax Numarası</label>
                  <input
                    type="tel"
                    value={newCompany.fax}
                    onChange={e => setNewCompany({ ...newCompany, fax: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="0212 123 4568"
                  />
                </div>
              </div>

              {/* Vergi Dairesi / Vergi No */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Vergi Dairesi</label>
                  <input
                    type="text"
                    value={newCompany.tax_office}
                    onChange={e => setNewCompany({ ...newCompany, tax_office: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="Kadıköy V.D."
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Vergi No</label>
                  <input
                    type="text"
                    value={newCompany.tax_number}
                    onChange={e => setNewCompany({ ...newCompany, tax_number: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              {/* SGK Sicil No / Kayıt Tarihi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">SGK Sicil No</label>
                  <input
                    type="text"
                    value={newCompany.sgk_number}
                    onChange={e => setNewCompany({ ...newCompany, sgk_number: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                    placeholder="12345678901234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Kayıt Tarihi *</label>
                  <input
                    type="date"
                    value={newCompany.registration_date}
                    onChange={e => setNewCompany({ ...newCompany, registration_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-accent"
                  />
                </div>
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
                onClick={handleAddCompany}
                disabled={!newCompany.name || !newCompany.company_code || !newCompany.phone || !newCompany.city || saving}
                className="px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
