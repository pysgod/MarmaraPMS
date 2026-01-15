import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Building2, Search } from 'lucide-react'
import CompanyShifts from './companies/CompanyShifts'

export default function Shifts() {
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await api.getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Firmalar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCompany = companies.find(c => c.id === Number(selectedCompanyId))

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
          <p className="text-theme-text-muted mt-1">Firma bazlı vardiya tanımlamaları</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Firma Seçimi Sidebar */}
        <div className="lg:col-span-1 bg-theme-bg-secondary rounded-xl border border-theme-border-primary overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-theme-border-primary bg-theme-bg-hover">
            <h3 className="font-semibold text-theme-text-secondary mb-2">Firmalar</h3>
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
              </button>
            ))}
            {filteredCompanies.length === 0 && (
              <p className="text-center text-sm text-theme-text-muted py-4">Firma bulunamadı</p>
            )}
          </div>
        </div>

        {/* Vardiya İçeriği */}
        <div className="lg:col-span-3">
          {selectedCompanyId ? (
            <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-theme-border-primary">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Building2 size={24} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-theme-text-primary">{selectedCompany.name}</h2>
                  <p className="text-theme-text-muted">Vardiya Tanımları</p>
                </div>
              </div>
              <CompanyShifts companyId={selectedCompanyId} />
            </div>
          ) : (
            <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary p-12 text-center h-full flex flex-col items-center justify-center text-theme-text-muted">
              <Building2 size={48} className="text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-theme-text-secondary mb-2">Firma Seçin</h3>
              <p>Vardiya işlemlerini yönetmek için soldaki listeden bir firma seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
